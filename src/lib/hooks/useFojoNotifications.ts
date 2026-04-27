import { useState, useRef, useEffect, useCallback } from 'react'
import type { FojoNotification, Conversation } from '@/data/types/fojo'
import {
    V3_COVERAGE_GAP_MESSAGES,
    V3_PROPERTY_TAX_MESSAGES,
    V3_VEHICLE_RENEWAL_MESSAGES,
    V3_APPRAISAL_MESSAGES,
} from '@/data/fojo-responses'

interface UseFojoNotificationsOptions {
    onConversationsUpdate: (updater: (prev: Conversation[]) => Conversation[]) => void
    onToastsUpdate: (updater: (prev: { id: string; title: string; preview: string; conversationId: string }[]) => { id: string; title: string; preview: string; conversationId: string }[]) => void
    onActiveConversationChange: (id: string) => void
}

export function useFojoNotifications({
    onConversationsUpdate,
    onToastsUpdate,
    onActiveConversationChange,
}: UseFojoNotificationsOptions) {
    const [notifications, setNotifications] = useState<FojoNotification[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const bellRef = useRef<HTMLButtonElement>(null)

    const unreadCount = notifications.filter(n => !n.read).length

    // Click-outside handler for dropdown
    useEffect(() => {
        if (!isDropdownOpen) return
        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as Node
            const notifEl = document.querySelector('.chat-notification')
            const dropdownEl = document.querySelector('.chat-notification__dropdown')
            if (notifEl?.contains(target) || dropdownEl?.contains(target)) return
            setIsDropdownOpen(false)
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [isDropdownOpen])

    // Timed notification delivery
    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = []

        timers.push(setTimeout(() => {
            const convId = 'fojo-v3-coverage-gap'
            const title = "Renewal task created for Chubb policy"
            const preview = "The Fifth Avenue Penthouse policy expires in 47 days. Task assigned to your insurance advisor."
            onConversationsUpdate(prev => prev.some(c => c.id === convId) ? prev : [...prev, {
                id: convId,
                title,
                source: 'fojo' as const,
                createdAt: Date.now(),
                messages: [...V3_COVERAGE_GAP_MESSAGES],
            }])
            setNotifications(prev => prev.some(n => n.id === 'notif-v3-coverage-gap') ? prev : [...prev, {
                id: 'notif-v3-coverage-gap',
                conversationId: convId,
                type: 'coverage-gap',
                title,
                preview,
                timestamp: Date.now(),
                read: false,
            }])
        }, 40000))

        // Property tax assessment — 80s
        timers.push(setTimeout(() => {
            const convId = 'fojo-v3-property-tax'
            const title = "Hamptons Estate tax assessment due"
            const preview = "2026 assessment shows 4.2% increase. Due May 1."
            onConversationsUpdate(prev => prev.some(c => c.id === convId) ? prev : [...prev, {
                id: convId, title, source: 'fojo' as const, createdAt: Date.now(),
                messages: [...V3_PROPERTY_TAX_MESSAGES],
            }])
            setNotifications(prev => prev.some(n => n.id === 'notif-v3-property-tax') ? prev : [...prev, {
                id: 'notif-v3-property-tax', conversationId: convId, type: 'coverage-gap',
                title, preview, timestamp: Date.now(), read: false,
            }])
        }, 80000))

        // Aviation policy renewal — 120s
        timers.push(setTimeout(() => {
            const convId = 'fojo-v3-vehicle-renewal'
            const title = "Gulfstream G700 policy renewal"
            const preview = "Aviation hull & liability policy renews in 60 days. Last premium: $340K."
            onConversationsUpdate(prev => prev.some(c => c.id === convId) ? prev : [...prev, {
                id: convId, title, source: 'fojo' as const, createdAt: Date.now(),
                messages: [...V3_VEHICLE_RENEWAL_MESSAGES],
            }])
            setNotifications(prev => prev.some(n => n.id === 'notif-v3-vehicle-renewal') ? prev : [...prev, {
                id: 'notif-v3-vehicle-renewal', conversationId: convId, type: 'coverage-gap',
                title, preview, timestamp: Date.now(), read: false,
            }])
        }, 120000))

        // Art appraisal — 180s
        timers.push(setTimeout(() => {
            const convId = 'fojo-v3-appraisal'
            const title = "Art collection reappraisal recommended"
            const preview = "Warhol + Basquiat collection ($14.2M) — last appraised 6 months ago."
            onConversationsUpdate(prev => prev.some(c => c.id === convId) ? prev : [...prev, {
                id: convId, title, source: 'fojo' as const, createdAt: Date.now(),
                messages: [...V3_APPRAISAL_MESSAGES],
            }])
            setNotifications(prev => prev.some(n => n.id === 'notif-v3-appraisal') ? prev : [...prev, {
                id: 'notif-v3-appraisal', conversationId: convId, type: 'coverage-gap',
                title, preview, timestamp: Date.now(), read: false,
            }])
        }, 180000))

        return () => timers.forEach(clearTimeout)
    }, [onConversationsUpdate])

    const handleNotificationClick = useCallback((notif: FojoNotification) => {
        onActiveConversationChange(notif.conversationId)
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
        setIsDropdownOpen(false)
        onToastsUpdate(prev => prev.filter(t => t.conversationId !== notif.conversationId))
    }, [onActiveConversationChange, onToastsUpdate])

    return {
        notifications,
        isDropdownOpen,
        setIsDropdownOpen,
        bellRef,
        handleNotificationClick,
        unreadCount,
    }
}
