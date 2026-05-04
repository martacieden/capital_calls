import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { IconX, IconScale, IconCalculator, IconMail, IconPhone, IconMicrophone, IconPaperclip, IconCheckbox, IconBrandWhatsapp } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { mockContacts, type Contact } from '@/data/thornton/contacts-data'
import { showToast } from '@/components/atoms/Toast'

export interface ContactEventContext {
    id: string
    title: string
    suggestedTaskTitle?: string
    suggestedLawyerSpecialization?: string
    suggestedDescription?: string
    eventDescription?: string
}

export interface ContactModalProps {
    type: 'lawyer' | 'cpa'
    event: ContactEventContext
    onClose: () => void
    onDelegateToFojo: (contactId: string, text: string) => void
}

type Channel = 'email' | 'whatsapp' | 'task'

function sortedContacts(contacts: Contact[], specialization?: string): Contact[] {
    if (!specialization) return contacts
    return [...contacts].sort((a, b) => {
        const am = a.specialization.toLowerCase().includes(specialization.toLowerCase()) ? -1 : 1
        const bm = b.specialization.toLowerCase().includes(specialization.toLowerCase()) ? -1 : 1
        return am - bm
    })
}

function phoneToWhatsApp(phone: string, message: string): string {
    const digits = phone.replace(/\D/g, '')
    if (!digits) return '#'
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function ContactModal({ type, event, onClose, onDelegateToFojo }: ContactModalProps) {
    const isLawyer = type === 'lawyer'
    const contacts = isLawyer
        ? sortedContacts(mockContacts.lawyers, event.suggestedLawyerSpecialization)
        : mockContacts.accountants

    const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id ?? '')
    const [channel, setChannel] = useState<Channel>('task')
    const [userText, setUserText] = useState('')
    const [isRecording, setIsRecording] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    useEffect(() => { setTimeout(() => textareaRef.current?.focus(), 80) }, [])

    const selectedContact = contacts.find(c => c.id === selectedContactId) ?? contacts[0] ?? null
    useEffect(() => {
        if (channel === 'whatsapp' && !selectedContact?.phone) setChannel('email')
    }, [channel, selectedContact?.phone])

    const handleVoiceClick = useCallback(() => {
        if (isRecording) return
        setIsRecording(true)
        setTimeout(() => {
            const firstName = selectedContact?.name.split(' ')[0] ?? 'you'
            const mockTaskText = `Please create and assign a follow-up task for ${firstName} regarding ${event.title}.`
            setUserText(mockTaskText)
            setIsRecording(false)
            textareaRef.current?.focus()
        }, 2000)
    }, [isRecording, selectedContact, event.title])

    const handleAttachContext = useCallback(() => {
        showToast('Event context attached', 'success')
        textareaRef.current?.focus()
    }, [])

    const handleCreateTask = useCallback(() => {
        if (!selectedContact) return
        onDelegateToFojo(selectedContact.id, userText.trim())
        onClose()
    }, [selectedContact, userText, onDelegateToFojo, onClose])

    const handleSendEmail = useCallback(() => {
        if (!selectedContact) return
        const firstName = selectedContact.name.split(' ')[0]
        const bodyText = userText.trim() || `Hi ${firstName}, I'd like to discuss ${event.title}.`
        const subject = encodeURIComponent(`Re: ${event.title}`)
        const body = encodeURIComponent(bodyText)
        window.open(`mailto:${selectedContact.email}?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer')
        showToast('Email opened', 'success')
        onClose()
    }, [selectedContact, userText, event.title, onClose])

    const handleSendWhatsApp = useCallback(() => {
        if (!selectedContact?.phone) return
        const msg = userText.trim() || `Hi ${selectedContact.name.split(' ')[0]}, I'd like to discuss ${event.title}.`
        window.open(phoneToWhatsApp(selectedContact.phone, msg), '_blank', 'noopener,noreferrer')
        showToast('WhatsApp opened', 'success')
        onClose()
    }, [selectedContact, userText, event.title, onClose])

    const modal = (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

            <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[var(--radius-2xl)] shadow-[0_32px_100px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0',
                            isLawyer ? 'bg-[#F3EEFF]' : 'bg-[#E8F5E9]'
                        )}>
                            {isLawyer
                                ? <IconScale size={18} stroke={1.75} className="text-[#6E3DD1]" />
                                : <IconCalculator size={18} stroke={1.75} className="text-[#2E7D32]" />
                            }
                        </div>
                        <div>
                            <div className="text-[15px] font-semibold text-[var(--color-black)] leading-5">
                                {isLawyer ? 'Contact lawyer' : 'Contact CPA / Accountant'}
                            </div>
                            <div className="text-xs text-[var(--color-neutral-9)] mt-0.5">
                                Fojo will draft and route this follow-up
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors">
                        <IconX size={16} stroke={2} />
                    </button>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                            {isLawyer ? 'Choose attorney' : 'Choose CPA / accountant'} <span className="text-[var(--color-red-9)]">*</span>
                        </label>
                        <select
                            className="w-full h-9 px-3 pr-9 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-white text-sm text-[var(--color-black)] outline-none transition-[border-color,box-shadow] duration-150 hover:border-[var(--color-neutral-6)] focus:border-[var(--color-accent-9)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)] appearance-none bg-no-repeat font-[inherit] cursor-pointer"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2380838D' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                backgroundPosition: 'right 12px center',
                            }}
                            value={selectedContactId}
                            onChange={e => setSelectedContactId(e.target.value)}
                        >
                            {contacts.map(c => (
                                <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                            ))}
                        </select>

                        {selectedContact && (
                            <div className="rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[#FAF8F5] px-3 py-2 flex flex-col gap-1.5">
                                <a
                                    href={`mailto:${selectedContact.email}`}
                                    className="grid grid-cols-[16px_minmax(0,1fr)] items-center gap-x-2 text-[11px] text-[var(--color-accent-9)] hover:underline underline-offset-2"
                                >
                                    <IconMail size={12} stroke={1.9} className="text-[var(--color-neutral-8)]" />
                                    <span className="truncate">{selectedContact.email}</span>
                                </a>
                                {selectedContact.phone && (
                                    <a
                                        href={`tel:${selectedContact.phone}`}
                                        className="grid grid-cols-[16px_minmax(0,1fr)] items-center gap-x-2 text-[11px] text-[var(--color-neutral-11)]"
                                    >
                                        <IconPhone size={12} stroke={1.9} className="text-[var(--color-neutral-8)]" />
                                        <span className="truncate tabular-nums">{selectedContact.phone}</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-white overflow-hidden transition-[border-color,box-shadow] duration-150 focus-within:border-[var(--color-accent-9)] focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.12)]">
                        <div className="flex items-center gap-px px-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setChannel('email')}
                                className={cn(
                                    'flex items-center gap-1 px-2.5 h-7 rounded-[var(--radius-md)] text-[12px] font-semibold transition-all',
                                    channel === 'email'
                                        ? 'bg-[rgba(0,91,226,0.08)] text-[var(--color-accent-9)]'
                                        : 'text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)]'
                                )}
                            >
                                <IconMail size={13} stroke={2} />
                                Email
                            </button>
                            <button
                                type="button"
                                disabled={!selectedContact?.phone}
                                onClick={() => selectedContact?.phone && setChannel('whatsapp')}
                                className={cn(
                                    'flex items-center gap-1 px-2.5 h-7 rounded-[var(--radius-md)] text-[12px] font-semibold transition-all',
                                    channel === 'whatsapp'
                                        ? 'bg-[#f0fdf4] text-[#15803d]'
                                        : 'text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)]',
                                    !selectedContact?.phone && 'opacity-35 cursor-not-allowed pointer-events-none'
                                )}
                            >
                                <IconBrandWhatsapp size={13} stroke={1.9} />
                                WhatsApp
                            </button>
                            <button
                                type="button"
                                onClick={() => setChannel('task')}
                                className={cn(
                                    'flex items-center gap-1 px-2.5 h-7 rounded-[var(--radius-md)] text-[12px] font-semibold transition-all',
                                    channel === 'task'
                                        ? 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-12)]'
                                        : 'text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)]'
                                )}
                            >
                                <IconCheckbox size={13} stroke={2} />
                                Task
                            </button>
                        </div>

                        <div className="px-3 pt-2.5 pb-2.5">
                        <textarea
                            ref={textareaRef}
                            rows={4}
                            className="w-full border-none bg-transparent p-0 text-sm text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] outline-none resize-none font-[inherit] leading-[1.5] disabled:opacity-60"
                            placeholder={
                                channel === 'email'
                                    ? "Write a note for email..."
                                    : channel === 'whatsapp'
                                    ? 'Write a quick WhatsApp message...'
                                    : 'Describe the task — Fojo will help create and assign it.'
                            }
                            value={userText}
                            onChange={e => !isRecording && setUserText(e.target.value)}
                            disabled={isRecording}
                        />
                        <div className="mt-2 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleAttachContext}
                                className="p-[6px] rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-11)] transition-colors"
                                title="Attach event context"
                                aria-label="Attach event context"
                            >
                                <IconPaperclip size={17} stroke={2} />
                            </button>
                            <button
                                type="button"
                                onClick={handleVoiceClick}
                                className={cn(
                                    'p-[6px] rounded-[var(--radius-md)] transition-all',
                                    isRecording
                                        ? 'text-[#EF4444] animate-pulse bg-[rgba(239,68,68,0.1)]'
                                        : 'text-[var(--color-neutral-9)] hover:text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]'
                                )}
                                title={isRecording ? 'Recording…' : 'Voice input'}
                                aria-label={isRecording ? 'Recording' : 'Voice input'}
                            >
                                <IconMicrophone size={17} stroke={2} />
                            </button>
                        </div>
                    </div>
                    </div>

                    {isRecording ? (
                        <p className="text-[11px] font-medium text-[var(--color-accent-9)] -mt-1" role="status" aria-live="polite">
                            Listening…
                        </p>
                    ) : null}

                    <button
                        type="button"
                        onClick={
                            channel === 'email'
                                ? handleSendEmail
                                : channel === 'whatsapp'
                                ? handleSendWhatsApp
                                : handleCreateTask
                        }
                        disabled={!selectedContact}
                        className={cn(
                            'w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius-lg)] text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                            channel === 'whatsapp'
                                ? 'border border-[#25D366] bg-white text-[#25D366] hover:bg-[#f0fdf4]'
                                : 'bg-[var(--color-accent-9)] text-white hover:opacity-90'
                        )}
                    >
                        {channel === 'email' && <><IconMail size={15} stroke={2} /> Send via Email</>}
                        {channel === 'whatsapp' && <><IconBrandWhatsapp size={15} stroke={1.9} /> Open WhatsApp</>}
                        {channel === 'task' && <><IconCheckbox size={15} stroke={2} /> Create Task</>}
                    </button>
                </div>
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}
