import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
    IconX, IconScale, IconCalculator,
    IconBuilding, IconMail, IconPhone,
    IconCopy, IconArrowLeft,
    IconBrandWhatsapp, IconSparkles,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { mockContacts, type Contact } from '@/data/thornton/contacts-data'
import { showToast } from '@/components/atoms/Toast'

/* ── Types ── */

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
    /** Called when user chooses "Create Task" — delegates to Fojo panel */
    onDelegateToFojo: (contactId: string, text: string) => void
}

type Step = 'input' | 'email-preview' | 'whatsapp-preview'

/* ── Helpers ── */

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

async function copyToClipboard(label: string, value: string) {
    try {
        await navigator.clipboard.writeText(value)
        showToast(`${label} copied`, 'success')
    } catch {
        showToast('Could not copy to clipboard', 'error')
    }
}

/* ── Component ── */

export function ContactModal({ type, event, onClose, onDelegateToFojo }: ContactModalProps) {
    const isLawyer = type === 'lawyer'
    const contacts = isLawyer
        ? sortedContacts(mockContacts.lawyers, event.suggestedLawyerSpecialization)
        : mockContacts.accountants

    const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id ?? '')
    const [userText, setUserText]   = useState('')
    const [step, setStep]           = useState<Step>('input')
    const [emailSubject, setEmailSubject] = useState('')
    const [emailBody, setEmailBody]       = useState('')
    const [whatsappMsg, setWhatsappMsg]   = useState('')
    const [aiHint, setAiHint]             = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    useEffect(() => { setTimeout(() => textareaRef.current?.focus(), 80) }, [])

    const selectedContact = contacts.find(c => c.id === selectedContactId) ?? contacts[0] ?? null

    /* AI task-hint */
    useEffect(() => {
        if (!userText.trim()) { setAiHint(false); return }
        const t = window.setTimeout(() => {
            const lower = userText.toLowerCase()
            const kws = ['review', 'draft', 'prepare', 'update', 'file', 'create', 'check', 'submit', 'arrange', 'schedule', 'organize', 'send', 'complete']
            setAiHint(kws.some(kw => lower.includes(kw)))
        }, 600)
        return () => window.clearTimeout(t)
    }, [userText])

    const handleEmailClick = useCallback(() => {
        if (!selectedContact) return
        const firstName = selectedContact.name.split(' ')[0]
        const text = userText.trim()
        setEmailSubject(`Re: ${event.title}`)
        setEmailBody(
            `Dear ${selectedContact.name},\n\nI hope this message finds you well.\n\nI'm reaching out regarding: ${event.title}.\n\n${text || `[Please describe what you need from ${firstName}]`}\n\nI would appreciate your guidance. Please let me know your availability.\n\nBest regards`
        )
        setStep('email-preview')
    }, [selectedContact, userText, event.title])

    const handleWhatsAppClick = useCallback(() => {
        if (!selectedContact) return
        setWhatsappMsg(
            userText.trim() || `Hi ${selectedContact.name.split(' ')[0]}, I'd like to discuss: ${event.title}.`
        )
        setStep('whatsapp-preview')
    }, [selectedContact, userText, event.title])

    const handleConfirmEmail = useCallback(() => {
        if (!selectedContact) return
        const subject = encodeURIComponent(emailSubject)
        const body    = encodeURIComponent(emailBody)
        window.open(`mailto:${selectedContact.email}?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer')
        showToast('Email opened in your mail app', 'success')
        onClose()
    }, [selectedContact, emailSubject, emailBody, onClose])

    const handleConfirmWhatsApp = useCallback(() => {
        if (!selectedContact?.phone) return
        window.open(phoneToWhatsApp(selectedContact.phone, whatsappMsg), '_blank', 'noopener,noreferrer')
        showToast('WhatsApp opened', 'success')
        onClose()
    }, [selectedContact, whatsappMsg, onClose])

    const handleCreateTask = useCallback(() => {
        if (!selectedContact) return
        onDelegateToFojo(selectedContact.id, userText.trim())
        onClose()
    }, [selectedContact, userText, onDelegateToFojo, onClose])

    /* ── Render ── */

    const modal = (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={step === 'input' ? onClose : undefined} />

            <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[var(--radius-2xl)] shadow-[0_32px_100px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                    <div className="flex items-center gap-3">
                        {step !== 'input' ? (
                            <button
                                onClick={() => setStep('input')}
                                className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                            >
                                <IconArrowLeft size={16} stroke={2} />
                            </button>
                        ) : (
                            <div className={cn(
                                'w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0',
                                isLawyer ? 'bg-[#F3EEFF]' : 'bg-[#E8F5E9]'
                            )}>
                                {isLawyer
                                    ? <IconScale      size={18} stroke={1.75} className="text-[#6E3DD1]" />
                                    : <IconCalculator size={18} stroke={1.75} className="text-[#2E7D32]" />
                                }
                            </div>
                        )}
                        <div>
                            <div className="text-[15px] font-semibold text-[var(--color-black)] leading-5">
                                {step === 'email-preview'     ? 'Email preview'       :
                                 step === 'whatsapp-preview'  ? 'WhatsApp preview'    :
                                 isLawyer ? 'Contact lawyer' : 'Contact CPA / Accountant'}
                            </div>
                            <div className="text-xs text-[var(--color-neutral-9)] mt-0.5">
                                {step === 'email-preview'     ? `To: ${selectedContact?.email ?? ''}` :
                                 step === 'whatsapp-preview'  ? 'Message will open in WhatsApp'       :
                                 'Send a message or create a task'}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors">
                        <IconX size={16} stroke={2} />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="px-6 pb-6 flex flex-col gap-4">

                    {/* ── Input step ── */}
                    {step === 'input' && (
                        <>
                            {/* Contact selector */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-[var(--color-neutral-10)]">
                                    {isLawyer ? 'Select Lawyer' : 'Select CPA / Accountant'} <span className="text-[var(--color-red-9)]">*</span>
                                </label>
                                <select
                                    className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] text-sm text-[var(--color-black)] outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150 font-[inherit] cursor-pointer"
                                    value={selectedContactId}
                                    onChange={e => setSelectedContactId(e.target.value)}
                                >
                                    {contacts.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                                    ))}
                                </select>

                                {selectedContact && (
                                    <div className="rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-2.5 py-2 flex flex-col gap-1.5">
                                        <div className="flex items-center gap-1.5 min-w-0 text-[11px] text-[var(--color-neutral-11)]">
                                            <IconBuilding size={13} stroke={1.75} className="shrink-0 text-[var(--color-neutral-9)]" />
                                            <span className="truncate">{selectedContact.firm}</span>
                                        </div>
                                        <div className="flex items-center gap-1 min-w-0 rounded-sm py-px -mx-0.5 px-0.5 hover:bg-white/70 transition-colors">
                                            <IconMail size={13} stroke={1.75} className="shrink-0 text-[var(--color-neutral-9)] ml-px" />
                                            <a href={`mailto:${selectedContact.email}`} className="flex-1 min-w-0 text-[11px] font-medium text-[var(--color-accent-9)] hover:underline underline-offset-2 truncate">
                                                {selectedContact.email}
                                            </a>
                                            <button type="button" className="shrink-0 p-1 rounded text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)]" onClick={() => copyToClipboard('Email', selectedContact.email)}>
                                                <IconCopy size={12} stroke={1.75} />
                                            </button>
                                        </div>
                                        {selectedContact.phone && (
                                            <div className="flex items-center gap-1 min-w-0 rounded-sm py-px -mx-0.5 px-0.5 hover:bg-white/70 transition-colors">
                                                <IconPhone size={13} stroke={1.75} className="shrink-0 text-[var(--color-neutral-9)] ml-px" />
                                                <span className="flex-1 min-w-0 text-[11px] font-medium text-[var(--color-neutral-11)] tabular-nums truncate">
                                                    {selectedContact.phone}
                                                </span>
                                                <button type="button" className="shrink-0 p-1 rounded text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)]" onClick={() => copyToClipboard('Phone', selectedContact.phone)}>
                                                    <IconCopy size={12} stroke={1.75} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Textarea */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-[var(--color-neutral-10)]">
                                    What do you need from {selectedContact?.name.split(' ')[0] ?? 'them'}?
                                </label>
                                <textarea
                                    ref={textareaRef}
                                    rows={3}
                                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] px-3 py-2.5 text-sm text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] outline-none resize-none font-[inherit] leading-[1.5] focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150"
                                    placeholder="Describe your request, or leave empty to let Fojo use the event context"
                                    value={userText}
                                    onChange={e => setUserText(e.target.value)}
                                />

                                {/* AI task hint */}
                                {aiHint && userText.trim() && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] bg-[rgba(0,91,226,0.06)] border border-[rgba(0,91,226,0.15)]">
                                        <IconSparkles size={12} stroke={2} className="shrink-0 text-[var(--color-accent-9)]" />
                                        <span className="text-[11px] text-[var(--color-accent-9)] font-medium">This looks like it could be a task</span>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={handleEmailClick}
                                    disabled={!selectedContact}
                                    className="w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius-lg)] bg-[var(--color-accent-9)] text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <IconMail size={15} stroke={2} />
                                    Send via Email
                                </button>
                                {selectedContact?.phone ? (
                                    <button
                                        type="button"
                                        onClick={handleWhatsAppClick}
                                        className="w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius-lg)] border border-[#25D366] text-[13px] font-semibold text-[#25D366] bg-white hover:bg-[#f0fdf4] transition-colors"
                                    >
                                        <IconBrandWhatsapp size={15} stroke={1.75} />
                                        Send via WhatsApp
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={handleCreateTask}
                                    disabled={!selectedContact}
                                    className="w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-1)] text-[13px] font-medium text-[var(--color-gray-12)] hover:bg-[var(--color-neutral-2)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Create Task
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Email preview ── */}
                    {step === 'email-preview' && selectedContact && (
                        <div className="flex flex-col gap-2.5">
                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] mb-1 block">Subject</label>
                                <input
                                    type="text"
                                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-1)] px-3 h-9 text-sm text-[var(--color-gray-12)] outline-none font-[inherit] focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150"
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] mb-1 block">Body</label>
                                <textarea
                                    rows={8}
                                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-1)] px-3 py-2.5 text-sm text-[var(--color-gray-12)] outline-none resize-none font-[inherit] leading-[1.5] focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150"
                                    value={emailBody}
                                    onChange={e => setEmailBody(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleConfirmEmail}
                                disabled={!emailSubject.trim()}
                                className="w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius-lg)] bg-[var(--color-accent-9)] text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <IconMail size={15} stroke={2} />
                                Open in Mail App
                            </button>
                        </div>
                    )}

                    {/* ── WhatsApp preview ── */}
                    {step === 'whatsapp-preview' && selectedContact && (
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-2)]">
                                <IconPhone size={13} stroke={1.75} className="text-[var(--color-neutral-9)] shrink-0" />
                                <span className="text-sm text-[var(--color-neutral-11)] truncate">{selectedContact.phone}</span>
                            </div>
                            <textarea
                                rows={4}
                                className="w-full rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-1)] px-3 py-2.5 text-sm text-[var(--color-gray-12)] outline-none resize-none font-[inherit] leading-[1.5] focus:border-[#25D366] focus:bg-white transition-[border-color,background] duration-150"
                                value={whatsappMsg}
                                onChange={e => setWhatsappMsg(e.target.value)}
                            />
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-neutral-9)]">
                                <IconBrandWhatsapp size={13} stroke={1.75} className="text-[#25D366] shrink-0" />
                                Message will open in WhatsApp
                            </div>
                            <button
                                type="button"
                                onClick={handleConfirmWhatsApp}
                                disabled={!whatsappMsg.trim()}
                                className="w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius-lg)] border border-[#25D366] bg-white text-[13px] font-semibold text-[#25D366] hover:bg-[#f0fdf4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <IconBrandWhatsapp size={15} stroke={1.75} />
                                Confirm & Open WhatsApp
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}
