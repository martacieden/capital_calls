import { useState, useCallback, useEffect } from 'react'
import type { ChatAction, ChatMessage, QAOption } from '@/data/types/fojo'

interface UseFojoQAOptions {
    activeConversationId: string | null
    activeMessages: ChatMessage[]
    answeredActions: Set<string>
    setAnsweredActions: React.Dispatch<React.SetStateAction<Set<string>>>
    appendMessageToConversation: (convId: string, msg: ChatMessage) => void
    handleActionResponse: (action: ChatAction, convId: string) => void
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
    msgIdRef: React.MutableRefObject<number>
}

export function useFojoQA({
    activeConversationId,
    activeMessages,
    answeredActions,
    setAnsweredActions,
    appendMessageToConversation,
    handleActionResponse,
    setIsTyping,
    msgIdRef,
}: UseFojoQAOptions) {
    const [chatQAQuestion, setChatQAQuestion] = useState<string | null>(null)
    const [chatQAOptions, setChatQAOptions] = useState<QAOption[]>([])
    const [chatQAConvId, setChatQAConvId] = useState<string | null>(null)
    const [chatQAGroup, setChatQAGroup] = useState<string | null>(null)

    // Auto-activate Q&A panel for the active conversation's unanswered actions
    const activatePendingQA = useCallback((convId: string | null, msgs: ChatMessage[]) => {
        if (!convId) {
            setChatQAQuestion(null)
            setChatQAOptions([])
            setChatQAConvId(null)
            setChatQAGroup(null)
            return
        }
        for (let i = msgs.length - 1; i >= 0; i--) {
            const msg = msgs[i]
            if (msg.actions && msg.actions.length > 0) {
                const group = msg.actions[0]?.group
                if (group && group !== 'create-type' && !answeredActions.has(group)) {
                    setChatQAQuestion(msg.questionText ?? msg.text)
                    setChatQAOptions(msg.actions.map(a => ({
                        title: a.label,
                        description: a.description ?? '',
                        value: a.key,
                    })))
                    setChatQAConvId(convId)
                    setChatQAGroup(group)
                    return
                }
            }
        }
        setChatQAQuestion(null)
        setChatQAOptions([])
        setChatQAConvId(null)
        setChatQAGroup(null)
    }, [answeredActions])

    useEffect(() => {
        activatePendingQA(activeConversationId, activeMessages)
    }, [activeMessages, activeConversationId, activatePendingQA])

    const handleChatQASelect = useCallback((values: string[]) => {
        if (!chatQAConvId || !chatQAGroup) return
        const selectedValue = values[0]
        const selectedOption = chatQAOptions.find(o => o.value === selectedValue)

        setAnsweredActions(prev => new Set(prev).add(chatQAGroup!))
        setChatQAQuestion(null)
        setChatQAOptions([])

        // Show user's choice as a chat message
        appendMessageToConversation(chatQAConvId, {
            id: ++msgIdRef.current,
            role: 'user',
            text: selectedOption?.title ?? selectedValue,
        })

        // Delegate to scripted response + chaining
        const action: ChatAction = { label: selectedOption?.title ?? '', key: selectedValue, group: chatQAGroup! }
        handleActionResponse(action, chatQAConvId)
    }, [chatQAConvId, chatQAGroup, chatQAOptions, appendMessageToConversation, handleActionResponse, setAnsweredActions, msgIdRef])

    const handleChatQAOther = useCallback((text: string) => {
        if (!chatQAConvId || !chatQAGroup) return
        setAnsweredActions(prev => new Set(prev).add(chatQAGroup!))
        setChatQAQuestion(null)
        setChatQAOptions([])

        appendMessageToConversation(chatQAConvId, {
            id: ++msgIdRef.current,
            role: 'user',
            text,
        })

        setIsTyping(true)
        const convId = chatQAConvId
        setTimeout(() => {
            setIsTyping(false)
            appendMessageToConversation(convId, {
                id: ++msgIdRef.current,
                role: 'assistant',
                text: "Got it, noted.",
            })
        }, 800)
    }, [chatQAConvId, chatQAGroup, appendMessageToConversation, setIsTyping, setAnsweredActions, msgIdRef])

    return {
        chatQAQuestion,
        chatQAOptions,
        chatQAConvId,
        chatQAGroup,
        activatePendingQA,
        handleChatQASelect,
        handleChatQAOther,
    }
}
