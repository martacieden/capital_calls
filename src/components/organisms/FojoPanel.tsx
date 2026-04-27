import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
    IconHistory,
    IconEdit,
    IconChevronDown,
    IconChevronRight,
    IconSend2,
    IconPaperclip,
    IconAt,
    IconBell,
    IconX,
    IconMicrophone,
    IconCloudUpload,
    IconFileText,
    IconSearch,
    IconPlus,
    IconSitemap,
    IconLoader2,
    IconCheck,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { getIcon } from '@/lib/icons'
import { ChatMessageBubble } from '@/components/molecules/ChatMessageBubble'
import { FojoNotificationDropdown } from '@/components/molecules/FojoNotificationDropdown'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'
import { FojoMascot } from '@/components/atoms/FojoMascot'
import { useFojoChat } from '@/lib/hooks/useFojoChat'
import { useFojoCreation } from '@/lib/hooks/useFojoCreation'
import { FojoQA } from '@/components/molecules/FojoQA'
import { FojoPipeline } from '@/components/atoms/FojoPipeline'
import { FojoSummaryCard } from '@/components/atoms/FojoSummaryCard'
import { FojoTypingIndicator } from '@/components/atoms/FojoTypingIndicator'
import { QUICK_PROMPTS } from '@/data/fojo-responses'
import { getCategoryOrFallback } from '@/data/categories'
import type { CatalogUpdate } from '@/data/types/fojo'
import type { AnyCatalogItem } from '@/data/types'
import { MockFileBrowser } from '@/components/molecules/MockFileBrowser'

interface FojoPanelProps {
    visibility: 'open' | 'collapsed' | 'hidden'
    onClose?: () => void
    onUnreadCountChange?: (count: number) => void
    onOpenTimeline?: () => void
    distributionSummary?: { count: number; trustCount: number; yearRange?: string }
    onCatalogUpdate?: (update: CatalogUpdate) => void
    onCreateItem?: (categoryKey?: string) => void
    onItemsCreated?: (items: AnyCatalogItem[]) => void
    onItemClick?: (itemId: string) => void
    currentPage?: string
    currentItem?: AnyCatalogItem | null
    /** External trigger: true or 'with-files' to skip prompt and go straight to processing */
    triggerCreation?: boolean | 'with-files'
    triggerCreationText?: string
    triggerCreationHasFiles?: boolean
    triggerCreationActionType?: 'asset' | 'task' | 'relation'
    triggerCreationScenarioId?: string | null
    onTriggerCreationConsumed?: () => void
    isOverlay?: boolean
    /** Query from global search "Ask Fojo" */
    pendingFojoQuery?: string | null
    onPendingFojoQueryConsumed?: () => void
    onPostNavigation?: (nav: string, items: AnyCatalogItem[]) => void
}

/** Render bold **text** and paragraph breaks in creation messages */
function renderCreationText(text: string) {
    return text.split('\n\n').map((para, pi) => {
        const parts = para.split(/(\*\*.*?\*\*)/g)
        const rendered = parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>
            }
            return part
        })
        return <p key={pi} style={{ margin: pi === 0 ? 0 : '8px 0 0' }}>{rendered}</p>
    })
}

export function FojoPanel({ visibility, onClose, onUnreadCountChange, onOpenTimeline, distributionSummary, onCatalogUpdate, onCreateItem, onItemsCreated, onItemClick, currentPage, currentItem, triggerCreation, triggerCreationText, triggerCreationHasFiles, triggerCreationActionType, triggerCreationScenarioId, onTriggerCreationConsumed, isOverlay, pendingFojoQuery, onPendingFojoQueryConsumed, onPostNavigation }: FojoPanelProps) {
    const chat = useFojoChat({ onUnreadCountChange, onCatalogUpdate, onCreateItem })
    const creation = useFojoCreation({ onItemsCreated, onPostNavigation })
    const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false)
    const { startCreation, startCreationWithFiles } = creation
    const creationStartedRef = useRef(false)
    const [waitingForOther, setWaitingForOther] = useState(false)

    // External query from global search "Ask Fojo"
    useEffect(() => {
        if (pendingFojoQuery && visibility === 'open') {
            chat.startNewConversation()
            setTimeout(() => chat.sendMessage(pendingFojoQuery), 50)
            onPendingFojoQueryConsumed?.()
        }
    }, [pendingFojoQuery, visibility])

    // External trigger (e.g., home page upload complete, or "New asset" button)
    useEffect(() => {
        if (triggerCreation && !creationStartedRef.current) {
            creationStartedRef.current = true
            if (triggerCreation === 'with-files') {
                startCreationWithFiles(triggerCreationText, triggerCreationHasFiles ?? true, triggerCreationActionType, triggerCreationScenarioId ?? undefined)
            } else {
                startCreation()
            }
            onTriggerCreationConsumed?.()
        }
        if (!triggerCreation) creationStartedRef.current = false
    }, [triggerCreation, startCreation, startCreationWithFiles, onTriggerCreationConsumed, triggerCreationScenarioId])

    const handleFileBrowserSelect = useCallback((scenarioId: string, file: { id: string; name: string }) => {
        setIsFileBrowserOpen(false)
        creation.handleFileUpload(scenarioId, { id: file.id, name: file.name })
    }, [creation])

    const hasMessages = chat.activeMessages.length > 0

    if (visibility !== 'open') return null

    const getDropdownStyle = (): React.CSSProperties => {
        const rect = chat.bellRef.current?.getBoundingClientRect()
        if (!rect) return { position: 'fixed', top: 0, right: 0, zIndex: 200 }
        return {
            position: 'fixed',
            top: rect.bottom + 8,
            left: rect.left,
            zIndex: 200,
        }
    }

    return (
        <>
        {isFileBrowserOpen && (
            <MockFileBrowser
                onFileSelect={handleFileBrowserSelect}
                onClose={() => setIsFileBrowserOpen(false)}
            />
        )}
        <aside className={`chat-container chat-container--open${isOverlay ? ' chat-container--overlay' : ''}`}>
            <div className="chat-panel rounded-[var(--radius-2xl)] border border-[var(--color-gray-4)] shadow-[var(--shadow-panel)] bg-[var(--color-white)] flex w-full p-[var(--spacing-3)] flex-col overflow-hidden flex-1 min-h-0">
                {/* Header */}
                <div className="flex w-full py-[var(--spacing-2)] pr-[var(--spacing-2)] pl-[var(--spacing-3)] items-center justify-between rounded-[var(--radius-lg)] overflow-hidden">
                    <div className="flex items-center gap-[var(--spacing-1)]">
                        <div className="flex items-center px-[var(--spacing-2)] min-h-[32px] gap-[var(--spacing-2)]">
                            <span className="font-display text-[20px] font-black tracking-[-0.02px] leading-[1.56] text-[var(--color-black)]">Fojo</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-[var(--spacing-2)]">
                        <div className="relative">
                            <button
                                ref={chat.bellRef}
                                className="flex justify-center items-center aspect-square rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] min-h-[36px] w-9 h-9 overflow-hidden bg-[var(--color-white)] transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]"
                                onClick={() => chat.setIsDropdownOpen(prev => !prev)}
                            >
                                <IconBell size={18} stroke={2} color='var(--color-neutral-11)' />
                                {chat.unreadCount > 0 && <span className='absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-[5px] bg-[var(--color-red-9)] px-1 text-center text-xs font-bold leading-[18px] text-white shadow-[0_0_0_2px_var(--color-red-1)] pointer-events-none animate-[badge-pulse_1.8s_ease-out_infinite]'>{chat.unreadCount > 9 ? '9+' : chat.unreadCount}</span>}
                            </button>
                            {chat.isDropdownOpen && (
                                <FojoNotificationDropdown
                                    notifications={chat.notifications}
                                    onItemClick={chat.handleNotificationClick}
                                    getDropdownStyle={getDropdownStyle}
                                />
                            )}
                        </div>
                        <button className="flex justify-center items-center aspect-square rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] min-h-[36px] w-9 h-9 overflow-hidden bg-[var(--color-white)] transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]">
                            <IconHistory size={18} stroke={2} color="var(--color-neutral-11)" />
                        </button>
                        <button className="flex justify-center items-center aspect-square rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] min-h-[36px] w-9 h-9 overflow-hidden bg-[var(--color-white)] transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]" onClick={() => { chat.startNewConversation(); creation.reset(); setWaitingForOther(false) }}>
                            <IconEdit size={18} stroke={2} color="var(--color-neutral-11)" />
                        </button>
                        {onClose && (
                            <button className="flex justify-center items-center aspect-square rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] min-h-[36px] w-9 h-9 overflow-hidden bg-[var(--color-white)] transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]" onClick={onClose} aria-label="Close panel">
                                <IconX size={18} stroke={2} color="var(--color-neutral-11)" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Contextual summary card — shown when on detail page with no active conversation */}
                {currentPage === 'detail' && currentItem && creation.phase === 'idle' && !chat.activeConversationId && (
                    <FojoSummaryCard item={currentItem} />
                )}

                {/* Chat body */}
                {!hasMessages && !chat.activeConversation && creation.phase === 'idle' ? (
                    <div className="chat-welcome flex mt-[var(--spacing-3)] w-full pb-[var(--spacing-7)] flex-col overflow-y-auto items-center justify-center flex-1 min-h-0">
                        <div className="flex flex-col items-center">
                            <div className="welcome-avatar w-[72px] h-[72px]">
                                <FojoMascot size="100%" animated />
                            </div>
                            <div className="welcome-text flex mt-[var(--spacing-4)] flex-col items-center">
                                <h3>Hey, Sandra</h3>
                                <p>How can I help you?</p>
                            </div>
                        </div>

                        <div className="flex flex-col mt-[var(--spacing-6)] w-full items-center gap-1.5">
                            {(currentPage === 'detail' && currentItem
                                ? ['Show linked objects', 'Find insurance', 'Summarize this page']
                                : QUICK_PROMPTS
                            ).map((prompt) => {
                                const PROMPT_ICONS: Record<string, React.ReactNode> = {
                                    'Help me find assets': <IconSearch size={16} stroke={2} />,
                                    'Create new asset': <IconPlus size={16} stroke={2} />,
                                    'Explain relationships': <IconSitemap size={16} stroke={2} />,
                                }
                                const icon = PROMPT_ICONS[prompt]
                                return (
                                <button
                                    key={prompt}
                                    className="rounded-full flex min-h-[32px] px-[var(--spacing-3)] items-center text-[13px] text-[var(--color-purple-text)] font-medium leading-[1.43] bg-[var(--color-purple-hover)] transition-[background] duration-150 hover:bg-[rgba(0,91,226,0.12)]"
                                    onClick={() => {
                                        if (prompt === 'Create new asset') {
                                            creation.startCreation()
                                        } else {
                                            chat.sendMessage(prompt)
                                        }
                                    }}
                                >
                                    {icon && <span className="flex items-center mr-[6px] text-[var(--color-purple-text)]">{icon}</span>}
                                    {prompt}
                                </button>
                                )
                            })}
                        </div>
                    </div>
                ) : creation.phase !== 'idle' ? (
                    /* ── Creation flow messages ── */
                    <div className="chat-messages flex flex-col gap-[var(--spacing-4)] flex-1 overflow-y-auto px-[var(--spacing-2)] py-[var(--spacing-3)] min-h-0 animate-[chat-area-in_0.2s_ease-out_both]" ref={chat.chatBodyRef}>
                        {creation.messages.map(msg => {
                            if (msg.type === 'user-input') {
                                return (
                                    <div key={msg.id} className="chat-message chat-message--user flex gap-[var(--spacing-2)] items-start justify-end">
                                        <div className="chat-message__col">
                                            {msg.files && msg.files.length > 0 && (
                                                <div className="flex flex-col items-end gap-1 mb-[6px]">
                                                    {msg.files.map(f => (
                                                        <div key={f.id} className="flex items-center gap-3 py-[10px] px-3 w-full border border-[var(--color-neutral-4)] rounded-[var(--radius-lg)] bg-[var(--color-white)] cursor-pointer transition-[border-color] duration-150 hover:bg-[rgba(0,91,226,0.04)]">
                                                            <div className="shrink-0 w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent-3)] flex items-center justify-center">
                                                                <IconFileText size={20} stroke={1.5} color="var(--color-accent-9)" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-[13px] font-medium text-[var(--color-neutral-12)] leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">{f.name}</div>
                                                                <div className="text-xs text-[var(--color-neutral-11)] leading-[1.3] mt-0.5">Document</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.text && <div className="chat-message__bubble">{msg.text}</div>}
                                        </div>
                                    </div>
                                )
                            }
                            if (msg.type === 'fojo-text') {
                                return (
                                    <div key={msg.id} className="chat-message chat-message--assistant flex gap-[var(--spacing-2)] items-start">
                                        <div className="chat-message__col">
                                            <div className="chat-message__bubble">{renderCreationText(msg.text)}</div>
                                        </div>
                                    </div>
                                )
                            }
                            if (msg.type === 'fojo-dropzone') {
                                const hasFiles = creation.attachedFiles.length > 0
                                const isUploading = creation.isUploading
                                const openBrowser = () => { if (!hasFiles && !isUploading) setIsFileBrowserOpen(true) }
                                return (
                                    <div
                                        key={msg.id}
                                        className={cn('onboarding-upload-zone flex-1 m-0 min-h-[120px] flex flex-col items-center justify-center text-center', hasFiles && 'border-[var(--color-accent-9)] border-solid bg-[rgba(0,91,226,0.03)]')}
                                        onClick={openBrowser}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => { e.preventDefault(); openBrowser() }}
                                    >
                                        <div className="onboarding-upload-icon">
                                            {isUploading
                                                ? <IconLoader2 size={22} stroke={1.5} color="var(--color-accent-9)" className="animate-spin" />
                                                : creation.uploadJustFinished
                                                    ? <IconCheck size={22} stroke={2} color="#30a46c" />
                                                    : <IconCloudUpload size={22} stroke={1.5} color="var(--color-neutral-11)" />
                                            }
                                        </div>
                                        <div className="onboarding-upload-text">
                                            {isUploading ? 'Processing files...' : hasFiles ? `${creation.attachedFiles.length} file attached` : 'Drop files here, or click to browse'}
                                        </div>
                                        <div className="onboarding-upload-hint">
                                            {isUploading ? '' : hasFiles ? 'Click Send to continue' : 'PDF, Word, or CSV files · up to 50MB each'}
                                        </div>
                                        {hasFiles && !isUploading && (
                                            <button
                                                className="mt-2 inline-flex items-center gap-1.5 py-1.5 px-4 border-none rounded-[var(--radius-lg)] bg-[var(--color-accent-9)] text-[var(--color-white)] text-[13px] font-medium cursor-pointer transition-opacity duration-150 whitespace-nowrap hover:opacity-90"
                                                onClick={(e) => { e.stopPropagation(); creation.submitInput('') }}
                                            >
                                                <span>Send</span>
                                                <IconSend2 size={14} stroke={2} />
                                            </button>
                                        )}
                                    </div>
                                )
                            }
                            if (msg.type === 'fojo-tool') {
                                return (
                                    <div key={msg.id} className="chat-message chat-message--assistant flex gap-[var(--spacing-2)] items-start">
                                        <div className="chat-message__col">
                                            <FojoPipeline steps={[{
                                                text: msg.text,
                                                detail: msg.detail,
                                                status: msg.toolStatus === 'running' ? 'running' : 'complete',
                                            }]} />
                                        </div>
                                    </div>
                                )
                            }
                            if (msg.type === 'fojo-summary' && msg.items) {
                                return (
                                    <div key={msg.id} className="chat-message chat-message--assistant flex gap-[var(--spacing-2)] items-start">
                                        <div className="chat-message__col">
                                            <div className="chat-message__bubble">{renderCreationText(msg.text)}</div>
                                            {msg.items.length > 0 && (
                                                <div className="flex flex-col gap-1.5 mt-2">
                                                    {msg.items.map(item => {
                                                        const cat = getCategoryOrFallback(item.categoryKey)
                                                        const CatIcon = getIcon(cat.icon)
                                                        const noClick = msg.noClickItems
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={`flex items-center gap-3 py-[10px] px-3 border border-[var(--color-gray-4)] rounded-[var(--radius-lg)] bg-[var(--color-white)] transition-[background,border-color] duration-150 hover:bg-[rgba(0,91,226,0.04)] ${noClick ? 'cursor-default' : 'cursor-pointer'}`}
                                                                onClick={noClick ? undefined : () => onItemClick?.(item.id)}
                                                            >
                                                                {item.imageUrl ? (
                                                                    <div className="creation-item-card__image w-11 h-11 rounded-[var(--radius-md)] overflow-hidden shrink-0">
                                                                        <img src={item.imageUrl} alt={item.name} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="creation-item-card__icon w-11 h-11 rounded-[var(--radius-md)] bg-[var(--color-accent-3)] flex items-center justify-center shrink-0">
                                                                        <CatIcon size={20} stroke={1.5} color="var(--color-accent-9)" />
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                                    <span className="text-[13px] font-medium text-[var(--color-gray-12)] leading-5 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                                                                    <span className="text-xs font-normal text-[var(--color-neutral-11)] leading-4">{cat.label}</span>
                                                                </div>
                                                                {!noClick && <IconChevronRight size={16} color="var(--color-neutral-11)" />}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            }
                            return null
                        })}
                        {creation.isTyping && (
                            <div className="chat-message chat-message--assistant flex gap-[var(--spacing-2)] items-start">
                                <FojoTypingIndicator />
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Regular chat messages ── */
                    <div className="chat-messages flex flex-col gap-[var(--spacing-4)] flex-1 overflow-y-auto px-[var(--spacing-2)] py-[var(--spacing-3)] min-h-0 animate-[chat-area-in_0.2s_ease-out_both]" key={chat.activeConversationId} ref={chat.chatBodyRef}>
                        {chat.activeMessages.map(msg => (
                            <ChatMessageBubble
                                key={msg.id}
                                msg={msg}
                                onOpenTimeline={onOpenTimeline}
                                distributionSummary={distributionSummary}
                                onItemClick={onItemClick}
                            />
                        ))}
                        {chat.isTyping && (
                            <div className="chat-message chat-message--assistant flex gap-[var(--spacing-2)] items-start">
                                <FojoTypingIndicator />
                            </div>
                        )}
                    </div>
                )}

                {/* Q&A component — above the chat footer */}
                {creation.phase === 'qa' && creation.qaQuestion && !waitingForOther && (
                    <FojoQA
                        question={creation.qaQuestion}
                        options={creation.qaOptions}
                        onSelect={creation.answerQA}
                        onOther={() => {
                            setWaitingForOther(true)
                            creation.addTextMessage("Sure — go ahead and type your answer below.")
                        }}
                    />
                )}
                {creation.phase !== 'qa' && chat.chatQAQuestion && !waitingForOther && (
                    <FojoQA
                        question={chat.chatQAQuestion}
                        options={chat.chatQAOptions}
                        onSelect={chat.handleChatQASelect}
                        onOther={() => {
                            setWaitingForOther(true)
                        }}
                    />
                )}

                {/* Attached files — above footer, horizontal scroll */}
                {creation.attachedFiles.length > 0 && (
                    <div className="onboarding-file-chips" style={{ padding: '0 4px', marginBottom: -4 }}>
                        {creation.attachedFiles.map(f => (
                            <div key={f.id} className="onboarding-file-chip">
                                <div className="onboarding-file-chip__icon">
                                    <IconFileText size={12} stroke={1.5} color="var(--color-accent-9)" />
                                </div>
                                <span>{f.name}</span>
                                <button
                                    className="onboarding-file-chip__remove"
                                    onClick={(e) => { e.stopPropagation(); creation.removeFile(f.id) }}
                                    aria-label="Remove file"
                                >
                                    <IconX size={10} stroke={2} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Chat footer */}
                <div className="chat-footer rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] flex mt-[var(--spacing-3)] w-full pt-[var(--spacing-4)] px-[var(--spacing-3)] pb-[var(--spacing-3)] flex-col bg-[var(--color-white)] focus-within:border-[var(--color-purple)] focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" onClick={() => chat.inputRef.current?.focus()}>
                    <div className="w-full cursor-text">
                        <input
                            ref={chat.inputRef}
                            type="text"
                            className="chat-input w-full border-none outline-none font-sans text-sm text-[var(--color-gray-12)] bg-transparent px-[var(--spacing-2)] py-0 leading-[1.47] block"
                            placeholder={waitingForOther ? 'Type your answer...' : creation.phase === 'prompt' ? 'Describe your asset...' : 'Ask me anything, use @ to add context'}
                            value={chat.inputValue}
                            onChange={e => chat.setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && waitingForOther && chat.inputValue.trim()) {
                                    e.preventDefault()
                                    const text = chat.inputValue.trim()
                                    chat.setInputValue('')
                                    setWaitingForOther(false)
                                    if (creation.phase === 'qa') {
                                        creation.answerQA([text])
                                    } else if (chat.chatQAGroup) {
                                        chat.handleChatQAOther(text)
                                    }
                                } else if (e.key === 'Enter' && !e.shiftKey && creation.phase === 'prompt' && chat.inputValue.trim()) {
                                    e.preventDefault()
                                    const text = chat.inputValue.trim()
                                    chat.setInputValue('')
                                    creation.submitInput(text)
                                } else {
                                    chat.handleKeyDown(e)
                                }
                            }}
                        />
                    </div>
                    <div className="flex mt-[var(--spacing-4)] w-full items-center justify-between">
                        <div className="flex items-center gap-[var(--spacing-1)]">
                            <button className="p-[6px] rounded-[var(--radius-md)] flex items-center transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]">
                                <IconPaperclip size={18} stroke={2} color="var(--color-neutral-11)" />
                            </button>
                            <button className="p-[6px] rounded-[var(--radius-md)] flex items-center transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]">
                                <IconAt size={18} stroke={2} color="var(--color-neutral-11)" />
                            </button>
                            <div className="w-px h-4 bg-[var(--color-gray-4)] shrink-0" style={{ display: 'none' }} />
                            <button className="flex justify-center items-center rounded-[var(--radius-md)] py-0.5 px-[var(--spacing-3)] pl-[var(--spacing-2)] gap-[var(--spacing-1)] text-[13px] font-[var(--font-weight-medium)] transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]" style={{ display: 'none', paddingRight: '4px' }}>
                                <span>Organization</span>
                                <IconChevronDown size={16} stroke={2} color="var(--color-neutral-11)" />
                            </button>
                        </div>
                        {chat.inputValue.trim() ? (
                            <button
                                className="rounded-[var(--radius-md)] bg-[var(--color-purple)] flex min-h-[36px] w-9 h-9 items-center justify-center overflow-hidden transition-opacity duration-150 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                    if (waitingForOther && chat.inputValue.trim()) {
                                        const text = chat.inputValue.trim()
                                        chat.setInputValue('')
                                        setWaitingForOther(false)
                                        if (creation.phase === 'qa') {
                                            creation.answerQA([text])
                                        } else if (chat.chatQAGroup) {
                                            chat.handleChatQAOther(text)
                                        }
                                    } else if (creation.phase === 'prompt') {
                                        const text = chat.inputValue.trim()
                                        chat.setInputValue('')
                                        creation.submitInput(text)
                                    } else {
                                        chat.handleSubmit()
                                    }
                                }}
                                disabled={chat.isTyping}
                            >
                                <IconSend2 size={18} stroke={2} color="var(--color-white)" />
                            </button>
                        ) : (
                            <button className="rounded-[var(--radius-md)] bg-[var(--color-purple)] flex min-h-[36px] w-9 h-9 items-center justify-center overflow-hidden transition-opacity duration-150 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed">
                                <IconMicrophone size={18} stroke={2} color="var(--color-white)" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <p className="ai-disclaimer text-[var(--color-neutral-11)] text-center text-xs font-normal leading-[1.33] mt-[var(--spacing-2)] w-full">AI-generated answers may be inaccurate</p>
            <div className="chat-resize-handle rounded-full absolute w-[5px] h-9 right-[-2px] top-1/2 -translate-y-1/2 bg-[var(--color-gray-5)] cursor-col-resize" />

            {chat.toasts.length > 0 && createPortal(
                <div className="fixed top-5 right-6 z-500 flex flex-col gap-[var(--spacing-2)] pointer-events-none">
                    {chat.toasts.map(t => (
                        <div key={t.id} className="w-72 bg-[#1C2024] rounded-[var(--radius-lg)] shadow-[0_12px_36px_rgba(0,0,0,0.28)] py-3.5 px-[var(--spacing-4)] pointer-events-auto animate-[fojo-toast-in_0.2s_ease-out_both]">
                            <div className="flex items-start gap-[var(--spacing-2)] mb-2.5">
                                <img
                                    className="w-5 h-5 rounded-full object-cover shrink-0"
                                    src={fojoMascotSmall}
                                    alt="Fojo"
                                />
                                <span className="flex-1 text-[13px] font-[var(--font-weight-semibold)] text-white leading-[1.4]">{t.title}</span>
                                <button
                                    className="w-5 h-5 flex items-center justify-center rounded-[var(--radius-sm)] text-base leading-none text-[rgba(255,255,255,0.4)] shrink-0 transition-[color,background] duration-[120ms] hover:text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.08)]"
                                    onClick={() => chat.dismissToast(t.id)}
                                    aria-label="Dismiss"
                                >×</button>
                            </div>
                            <button
                                className="inline-flex items-center ml-4 py-1.5 px-3 bg-[var(--color-purple)] rounded-[var(--radius-md)] text-xs font-medium text-white transition-opacity duration-150 hover:opacity-[0.88]"
                                onClick={() => {
                                    const notif = chat.notifications.find(n => n.conversationId === t.conversationId)
                                    if (notif) chat.handleNotificationClick(notif)
                                    chat.dismissToast(t.id)
                                }}
                            >
                                Open chat
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </aside>
        </>
    )
}
