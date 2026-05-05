import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconX, IconShare, IconLink, IconCheck, IconSend, IconUsers } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { mockContacts } from '@/data/thornton/contacts-data'
import { showToast } from '@/components/atoms/Toast'

export interface ShareModalProps {
    reportTitle: string
    onClose: () => void
}

const ALREADY_SHARED_IDS = ['lawyer-001', 'cpa-001', 'cpa-002']

const alreadyShared = [
    ...mockContacts.lawyers,
    ...mockContacts.accountants,
].filter(c => ALREADY_SHARED_IDS.includes(c.id))

function initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
    'bg-[#EDE9FE] text-[#6D28D9]',
    'bg-[#DCFCE7] text-[#15803D]',
    'bg-[#DBEAFE] text-[#1D4ED8]',
    'bg-[#FEF9C3] text-[#A16207]',
    'bg-[#FCE7F3] text-[#BE185D]',
]

function avatarColor(id: string): string {
    const idx = ALREADY_SHARED_IDS.indexOf(id)
    return AVATAR_COLORS[idx % AVATAR_COLORS.length]
}

type AccessLevel = 'view' | 'edit'

export function ShareModal({ reportTitle, onClose }: ShareModalProps) {
    const [query, setQuery] = useState('')
    const [copied, setCopied] = useState(false)
    const [sharedWith, setSharedWith] = useState(() =>
        alreadyShared.map(c => ({ contact: c, access: 'view' as AccessLevel }))
    )
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const allContacts = [...mockContacts.lawyers, ...mockContacts.accountants]
    const sharedIds = new Set(sharedWith.map(s => s.contact.id))

    const suggestions = query.trim().length > 0
        ? allContacts.filter(c =>
            !sharedIds.has(c.id) &&
            (c.name.toLowerCase().includes(query.toLowerCase()) ||
             c.email.toLowerCase().includes(query.toLowerCase()))
          )
        : []

    function addRecipient(id: string) {
        const contact = allContacts.find(c => c.id === id)
        if (!contact) return
        setSharedWith(prev => [...prev, { contact, access: 'view' }])
        setQuery('')
    }

    function removeRecipient(id: string) {
        setSharedWith(prev => prev.filter(s => s.contact.id !== id))
    }

    function handleCopyLink() {
        navigator.clipboard.writeText(`https://fojo.app/reports/${reportTitle.toLowerCase().replace(/\s+/g, '-')}`)
            .catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        showToast('Link copied to clipboard', 'success')
    }

    function handleSend() {
        if (sharedWith.length === 0) return
        showToast(`Report shared with ${sharedWith.length} ${sharedWith.length === 1 ? 'person' : 'people'}`, 'success')
        onClose()
    }

    const modal = (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

            <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[var(--radius-2xl)] shadow-[0_32px_100px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 bg-[#EFF6FF]">
                            <IconShare size={18} stroke={1.75} className="text-[#2563EB]" />
                        </div>
                        <div>
                            <div className="text-[15px] font-semibold text-[var(--color-black)] leading-5">
                                Share report
                            </div>
                            <div className="text-xs text-[var(--color-neutral-9)] mt-0.5">
                                {reportTitle}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                        aria-label="Close"
                    >
                        <IconX size={18} stroke={2} />
                    </button>
                </div>

                <div className="px-6 pb-5 flex flex-col gap-4">
                    {/* Add people input */}
                    <div className="relative">
                        <label className="block text-[11px] font-semibold tracking-wide uppercase text-[var(--color-neutral-9)] mb-1.5">
                            Add people
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Name or email…"
                            className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-1)] text-sm text-[var(--color-gray-12)] placeholder:text-[var(--color-neutral-8)] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                        />
                        {suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-lg)] shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden">
                                {suggestions.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--color-neutral-2)] transition-colors"
                                        onClick={() => addRecipient(c.id)}
                                    >
                                        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0', AVATAR_COLORS[0])}>
                                            {initials(c.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-[var(--color-gray-12)] truncate">{c.name}</div>
                                            <div className="text-xs text-[var(--color-neutral-9)] truncate">{c.role} · {c.firm}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Shared with list */}
                    {sharedWith.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-[var(--color-neutral-9)] mb-2">
                                <IconUsers size={12} stroke={2} />
                                Shared with
                            </div>
                            <div className="flex flex-col gap-1">
                                {sharedWith.map(({ contact: c }, idx) => (
                                    <div key={c.id} className="flex items-center gap-3 py-1.5 px-2 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-2)] group">
                                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0', avatarColor(c.id) || AVATAR_COLORS[idx % AVATAR_COLORS.length])}>
                                            {initials(c.name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[13px] font-medium text-[var(--color-gray-12)] truncate">{c.name}</div>
                                            <div className="text-xs text-[var(--color-neutral-9)] truncate">{c.email}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeRecipient(c.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)] transition-all"
                                            aria-label={`Remove ${c.name}`}
                                        >
                                            <IconX size={14} stroke={2} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-[var(--color-neutral-3)]" />

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] border text-sm font-medium transition-all',
                                copied
                                    ? 'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]'
                                    : 'border-[var(--color-neutral-4)] bg-white text-[var(--color-gray-12)] hover:bg-[var(--color-neutral-2)]'
                            )}
                        >
                            {copied ? <IconCheck size={16} stroke={2} /> : <IconLink size={16} stroke={2} />}
                            {copied ? 'Copied!' : 'Copy link'}
                        </button>
                        <button
                            type="button"
                            disabled={sharedWith.length === 0}
                            onClick={handleSend}
                            className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] bg-[#2563EB] text-white text-sm font-semibold transition-colors hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <IconSend size={16} stroke={2} />
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}
