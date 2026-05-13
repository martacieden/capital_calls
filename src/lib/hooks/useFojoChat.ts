import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { ChatAction, ChatMessage, ChatCardItem, Conversation, CatalogUpdate } from '@/data/types/fojo'
import {
    V3_ESTATE_REVIEW_QA,
    V3_ESTATE_REVIEW_Q2,
    V3_COVERAGE_GAP_QA,
    V3_PROPERTY_TAX_QA,
    V3_VEHICLE_RENEWAL_QA,
    V3_APPRAISAL_QA,
    MOCK_RESPONSES,
    DEFAULT_RESPONSE,
    TIMELINE_KEYWORDS,
} from '@/data/fojo-responses'
import { catalogCategories, getCategoryOrFallback } from '@/data/categories'
import { thorntonFamilyData, thorntonRelationships } from '@/data/thornton'
import type { AnyCatalogItem } from '@/data/types'
import { useFojoNotifications } from './useFojoNotifications'
import { useFojoQA } from './useFojoQA'

interface UseFojoChatOptions {
    onUnreadCountChange?: (count: number) => void
    onCatalogUpdate?: (update: CatalogUpdate) => void
    onCreateItem?: (categoryKey?: string) => void
}

const FOJO_CHAT_SESSION_KEY = 'fojo-chat-state-v2-capital-calls'
const FOJO_CHAT_LOCAL_KEY = 'fojo-chat-state-persist-v2-capital-calls'

type PersistedFojoChatState = {
    conversations: Conversation[]
    activeConversationId: string | null
    answeredActionKeys: string[]
}

function readPersistedFojoChatState(): PersistedFojoChatState | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = window.localStorage.getItem(FOJO_CHAT_LOCAL_KEY)
            ?? window.sessionStorage.getItem(FOJO_CHAT_SESSION_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as Partial<PersistedFojoChatState>
        if (!Array.isArray(parsed.conversations)) return null
        return {
            conversations: parsed.conversations,
            activeConversationId: typeof parsed.activeConversationId === 'string' || parsed.activeConversationId === null
                ? parsed.activeConversationId
                : null,
            answeredActionKeys: Array.isArray(parsed.answeredActionKeys) ? parsed.answeredActionKeys : [],
        }
    } catch {
        return null
    }
}

export function useFojoChat({ onUnreadCountChange, onCatalogUpdate: _onCatalogUpdate, onCreateItem }: UseFojoChatOptions) {
    const persisted = readPersistedFojoChatState()
    const [conversations, setConversations] = useState<Conversation[]>(() => persisted?.conversations ?? [])
    const [activeConversationId, setActiveConversationId] = useState<string | null>(() => persisted?.activeConversationId ?? null)
    const [toasts, setToasts] = useState<{ id: string; title: string; preview: string; conversationId: string }[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [answeredActions, setAnsweredActions] = useState<Set<string>>(
        () => new Set(persisted?.answeredActionKeys ?? []),
    )
    // Search mode state
    const [searchMode, setSearchMode] = useState(false)
    const [searchConvId, setSearchConvId] = useState<string | null>(null)

    // Relationship mode state
    const [relationshipMode, setRelationshipMode] = useState<'ask' | 'confirm' | null>(null)
    const [relationshipConvId, setRelationshipConvId] = useState<string | null>(null)
    const [relationshipItem, setRelationshipItem] = useState<AnyCatalogItem | null>(null)

    const chatBodyRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const msgIdRef = useRef(100)

    const activeConversation = conversations.find(c => c.id === activeConversationId) ?? null
    const activeMessages = useMemo(() => activeConversation?.messages ?? [], [activeConversation])

    // Keep chat history between page navigations in the same session.
    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            const payload: PersistedFojoChatState = {
                conversations,
                activeConversationId,
                answeredActionKeys: [...answeredActions],
            }
            const serialized = JSON.stringify(payload)
            // localStorage keeps history across browser tabs/sessions.
            window.localStorage.setItem(FOJO_CHAT_LOCAL_KEY, serialized)
            // Keep sessionStorage in sync as a lightweight same-tab fallback.
            window.sessionStorage.setItem(FOJO_CHAT_SESSION_KEY, serialized)
        } catch {
            // Ignore storage failures (private mode/quota) and keep runtime state only.
        }
    }, [conversations, activeConversationId, answeredActions])

    // ── Notifications ──
    const notifCallbacks = useRef({
        onConversationsUpdate: setConversations,
        onToastsUpdate: setToasts,
        onActiveConversationChange: setActiveConversationId,
    }).current

    const {
        notifications,
        isDropdownOpen,
        setIsDropdownOpen,
        bellRef,
        handleNotificationClick,
        unreadCount,
    } = useFojoNotifications(notifCallbacks)

    useEffect(() => {
        onUnreadCountChange?.(unreadCount)
    }, [unreadCount, onUnreadCountChange])

    // Toast creation moved to useFojoNotifications

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const scrollToBottom = useCallback(() => {
        const el = chatBodyRef.current
        if (!el) return
        // Only auto-scroll if user is already near the bottom (within 80px)
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
        if (isNearBottom) {
            el.scrollTop = el.scrollHeight
        }
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [activeMessages, isTyping, scrollToBottom])

    const appendMessageToConversation = useCallback((convId: string, msg: ChatMessage) => {
        setConversations(prev => prev.map(c =>
            c.id === convId ? { ...c, messages: [...c.messages, msg] } : c
        ))
    }, [])

    // Shared response logic: look up scripted reply + handle chaining
    const handleActionResponse = useCallback((action: ChatAction, convId: string) => {
        setIsTyping(true)

        // ── Relationship confirmation ──
        if (action.key === 'rel-confirm' && relationshipItem) {
            const item = relationshipItem
            const rels = thorntonRelationships.filter(r => r.from === item.id || r.to === item.id)
            const allItems = thorntonFamilyData.getAllItems()

            // Group related items by category, attaching relationship label
            const grouped = new Map<string, { label: string; items: AnyCatalogItem[] }>()
            for (const rel of rels) {
                const otherId = rel.from === item.id ? rel.to : rel.from
                const other = allItems.find(i => i.id === otherId)
                if (!other) continue
                const cat = getCategoryOrFallback(other.categoryKey)
                if (!grouped.has(cat.key)) grouped.set(cat.key, { label: cat.label, items: [] })
                // Clone item with relationship label so the card shows the relation above the name
                const relLabel = rel.label + (rel.percentage ? ` (${rel.percentage}%)` : '')
                const cardItem: ChatCardItem = { ...other, _relLabel: relLabel }
                grouped.get(cat.key)!.items.push(cardItem)
            }

            setRelationshipMode(null)
            setRelationshipConvId(null)
            setRelationshipItem(null)

            if (grouped.size === 0) {
                setTimeout(() => {
                    setIsTyping(false)
                    appendMessageToConversation(convId, {
                        id: ++msgIdRef.current,
                        role: 'assistant',
                        text: `**${item.name}** has no linked items in the catalog.`,
                    })
                }, 1000)
                return
            }

            // Send an intro message, then one message per group with staggered delay
            setTimeout(() => {
                setIsTyping(false)
                appendMessageToConversation(convId, {
                    id: ++msgIdRef.current,
                    role: 'assistant',
                    text: `Here are all items connected to **${item.name}**:`,
                })

                let delay = 0
                const groups = Array.from(grouped.entries())
                groups.forEach(([, group], idx) => {
                    delay += 500
                    setTimeout(() => {
                        appendMessageToConversation(convId, {
                            id: ++msgIdRef.current,
                            role: 'assistant',
                            text: `**${group.label}** (${group.items.length} item${group.items.length !== 1 ? 's' : ''})`,
                            cards: group.items,
                        })
                        // Scroll after last group
                        if (idx === groups.length - 1) setIsTyping(false)
                    }, delay)
                })
            }, 1000)
            return
        }

        // ── Relationship retry ──
        if (action.key === 'rel-retry') {
            setRelationshipMode('ask')
            setTimeout(() => {
                setIsTyping(false)
                appendMessageToConversation(convId, {
                    id: ++msgIdRef.current,
                    role: 'assistant',
                    text: "No problem — tell me another name and I'll look again.",
                })
            }, 800)
            return
        }

        // ── Existing V3 response logic ──
        const v3EstateResponse = V3_ESTATE_REVIEW_QA[action.key]
        const v3CoverageResponse = V3_COVERAGE_GAP_QA[action.key]
        const v3GenericResponse = V3_PROPERTY_TAX_QA[action.key] ?? V3_VEHICLE_RENEWAL_QA[action.key] ?? V3_APPRAISAL_QA[action.key]

        setTimeout(() => {
            setIsTyping(false)
            if (v3EstateResponse) {
                appendMessageToConversation(convId, { id: ++msgIdRef.current, role: 'assistant', text: v3EstateResponse })
            } else if (v3CoverageResponse) {
                appendMessageToConversation(convId, { id: ++msgIdRef.current, role: 'assistant', text: v3CoverageResponse })
            } else if (v3GenericResponse) {
                appendMessageToConversation(convId, { id: ++msgIdRef.current, role: 'assistant', text: v3GenericResponse })
            }

            if (action.group === 'v3-entity-match' && convId === 'fojo-v3-estate-review') {
                setTimeout(() => {
                    setIsTyping(true)
                    setTimeout(() => {
                        setIsTyping(false)
                        appendMessageToConversation(convId, { ...V3_ESTATE_REVIEW_Q2, id: ++msgIdRef.current })
                    }, 900)
                }, 400)
            }

            if (action.group === 'v3-grat-remainder' && convId === 'fojo-v3-estate-review') {
                setTimeout(() => {
                    setIsTyping(true)
                    setTimeout(() => {
                        setIsTyping(false)
                        appendMessageToConversation(convId, {
                            id: ++msgIdRef.current,
                            role: 'assistant',
                            text: "That's everything. Your catalog is fully up to date — you can explore all 76 records in **Assets**.",
                        })
                    }, 900)
                }, 400)
            }
        }, 1000 + Math.random() * 300)
    }, [appendMessageToConversation, relationshipItem])

    // ── Q&A Panel ──
    const {
        chatQAQuestion,
        chatQAOptions,
        chatQAGroup,
        handleChatQASelect,
        handleChatQAOther,
    } = useFojoQA({
        activeConversationId,
        activeMessages,
        answeredActions,
        setAnsweredActions,
        appendMessageToConversation,
        handleActionResponse,
        setIsTyping,
        msgIdRef,
    })

    const handleCreateAssetPrompt = useCallback(() => {
        const newConv: Conversation = {
            id: `user-conv-${Date.now()}`,
            title: 'Upload capital call',
            messages: [
                { id: ++msgIdRef.current, role: 'user', text: 'Upload capital call' },
                {
                    id: ++msgIdRef.current,
                    role: 'assistant',
                    text: 'What would you like me to create from this capital call or investment document?',
                    actions: catalogCategories.map(cat => ({
                        label: cat.label,
                        key: cat.key,
                        group: 'create-type',
                    })),
                },
            ],
            source: 'user',
            createdAt: Date.now(),
        }
        setConversations(prev => [...prev, newConv])
        setActiveConversationId(newConv.id)
    }, [])

    const handleAction = useCallback((action: ChatAction, convId: string) => {
        if (action.group === 'create-type') {
            if (answeredActions.has('create-type')) return
            setAnsweredActions(prev => new Set(prev).add('create-type'))
            setIsTyping(true)
            setTimeout(() => {
                setIsTyping(false)
                appendMessageToConversation(convId, {
                    id: ++msgIdRef.current,
                    role: 'assistant',
                    text: `Opening the form for **${action.label}**…`,
                })
                onCreateItem?.(action.key)
            }, 600)
            return
        }

        if (action.group && answeredActions.has(action.group)) return
        if (action.group) setAnsweredActions(prev => new Set(prev).add(action.group!))

        handleActionResponse(action, convId)
    }, [answeredActions, appendMessageToConversation, onCreateItem, handleActionResponse])

    const findResponse = useCallback((input: string): { text: string; artifact?: 'timeline' } => {
        const lower = input.toLowerCase()
        const isTimeline = TIMELINE_KEYWORDS.some(k => lower.includes(k))
        for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
            if (lower.includes(keyword)) {
                return { text: response, artifact: isTimeline ? 'timeline' : undefined }
            }
        }
        return { text: DEFAULT_RESPONSE }
    }, [])

    const sendMessage = useCallback((text: string) => {
        const userMsg: ChatMessage = { id: ++msgIdRef.current, role: 'user', text }
        setInputValue('')
        setIsTyping(true)

        let targetConvId = activeConversationId

        if (!targetConvId) {
            const newConv: Conversation = {
                id: `user-conv-${Date.now()}`,
                title: text.slice(0, 40),
                messages: [userMsg],
                source: 'user',
                createdAt: Date.now(),
            }
            setConversations(prev => [...prev, newConv])
            setActiveConversationId(newConv.id)
            targetConvId = newConv.id
        } else {
            appendMessageToConversation(targetConvId, userMsg)
        }

        const convIdForResponse = targetConvId

        // ── Search flow: initial prompt ──
        if (text === 'Find investment or call') {
            setSearchMode(true)
            setSearchConvId(convIdForResponse)
            setTimeout(() => {
                appendMessageToConversation(convIdForResponse, {
                    id: ++msgIdRef.current,
                    role: 'assistant',
                    text: "What are you looking for? Describe the fund, GP, deal, commitment, due date, or capital call you need help with.",
                })
                setIsTyping(false)
            }, 1800 + Math.random() * 400)
            return
        }

        // ── Search flow: user typed their query ──
        if (searchMode && convIdForResponse === searchConvId) {
            setSearchMode(false)
            setSearchConvId(null)
            setTimeout(() => {
                const allAssets = thorntonFamilyData.getAllItems().filter(i =>
                    ['property', 'investment', 'maritime', 'vehicle', 'art'].includes(i.categoryKey)
                )
                const shuffled = [...allAssets].sort(() => Math.random() - 0.5)
                const results = shuffled.slice(0, 4).map(item => ({ ...item, _accentIcon: true }) as ChatCardItem)
                appendMessageToConversation(convIdForResponse, {
                    id: ++msgIdRef.current,
                    role: 'assistant',
                    text: `Here's what I found matching **"${text}"**:`,
                    cards: results,
                })
                setIsTyping(false)
            }, 1800 + Math.random() * 400)
            return
        }

        // ── Relationship flow: initial prompt ──
        if (text === 'Explain fund exposure') {
            setRelationshipMode('ask')
            setRelationshipConvId(convIdForResponse)
            setTimeout(() => {
                appendMessageToConversation(convIdForResponse, {
                    id: ++msgIdRef.current,
                    role: 'assistant',
                    text: "What would you like to explore? Tell me a fund, GP, deal, entity, or capital call name.",
                })
                setIsTyping(false)
            }, 1800 + Math.random() * 400)
            return
        }

        // ── Relationship flow: user typed a name, find and confirm ──
        if (relationshipMode === 'ask' && convIdForResponse === relationshipConvId) {
            const allItems = thorntonFamilyData.getAllItems()
            const lower = text.toLowerCase()
            const match = allItems.find(i => i.name.toLowerCase().includes(lower))
                ?? allItems[Math.floor(Math.random() * allItems.length)]
            setRelationshipItem(match)
            setRelationshipMode('confirm')
            const groupId = `rel-confirm-${Date.now()}`
            setTimeout(() => {
                appendMessageToConversation(convIdForResponse, {
                    id: ++msgIdRef.current,
                    role: 'assistant',
                    text: `I found **${match.name}**. Is this what you're looking for?`,
                    cards: [{ ...match, _accentIcon: true } as ChatCardItem],
                    questionText: `Is ${match.name} the item you want to explore?`,
                    actions: [
                        { label: 'Yes, show relationships', key: 'rel-confirm', group: groupId, description: `Explore all connections for ${match.name}` },
                        { label: 'No, try again', key: 'rel-retry', group: groupId, description: 'Search for a different item' },
                    ],
                })
                setIsTyping(false)
            }, 1800 + Math.random() * 400)
            return
        }

        // ── Default: keyword matching ──
        setTimeout(() => {
            const found = findResponse(text)
            const assistantMsg: ChatMessage = {
                id: ++msgIdRef.current,
                role: 'assistant',
                text: found.text,
                artifact: found.artifact,
            }
            appendMessageToConversation(convIdForResponse, assistantMsg)
            setIsTyping(false)
        }, 1800 + Math.random() * 400)
    }, [activeConversationId, appendMessageToConversation, findResponse, searchMode, searchConvId, relationshipMode, relationshipConvId])

    const handleSubmit = useCallback(() => {
        if (!inputValue.trim() || isTyping) return
        sendMessage(inputValue.trim())
    }, [inputValue, isTyping, sendMessage])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }, [handleSubmit])

    const startNewConversation = useCallback(() => {
        setActiveConversationId(null)
        setInputValue('')
        setIsTyping(false)
    }, [])

    return {
        // State
        activeConversation,
        activeConversationId,
        activeMessages,
        notifications,
        isDropdownOpen,
        setIsDropdownOpen,
        toasts,
        inputValue,
        setInputValue,
        isTyping,
        answeredActions,
        unreadCount,
        // Chat Q&A state
        chatQAQuestion,
        chatQAOptions,
        chatQAGroup,
        // Refs
        chatBodyRef,
        inputRef,
        bellRef,
        // Handlers
        handleNotificationClick,
        handleAction,
        handleSubmit,
        handleKeyDown,
        handleCreateAssetPrompt,
        sendMessage,
        dismissToast,
        startNewConversation,
        handleChatQASelect,
        handleChatQAOther,
    }
}
