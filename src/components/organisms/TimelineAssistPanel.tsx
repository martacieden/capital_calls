import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    IconPaperclip,
    IconAt,
    IconMicrophone,
    IconSend2,
    IconMail,
    IconPhone,
    IconScale,
    IconCalculator,
    IconBuilding,
    IconCheck,
    IconChevronDown,
    IconChevronRight,
    IconBrandWhatsapp,
    IconArrowLeft,
    IconSparkles,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { mockContacts, type Contact } from '@/data/thornton/contacts-data'
import type { Task, TaskPriority } from '@/data/thornton/tasks-data'
import { analyzeTaskInput } from '@/lib/api/analyzeTask'
import { showToast } from '@/components/atoms/Toast'
import { FojoQA } from '@/components/molecules/FojoQA'
import type { QAOption } from '@/data/types/fojo'
import { FojoPipeline } from '@/components/atoms/FojoPipeline'
import type { TimelineAssistSession } from '@/types/timeline-assist'
import { buildTimelineContactQuickOptions } from '@/lib/timelineAssistQuickOptions'

/* ── Helpers ── */

function sortedContacts(contacts: Contact[], specialization?: string): Contact[] {
    if (!specialization) return [...contacts]
    return [...contacts].sort((a, b) => {
        const am = a.specialization.toLowerCase().includes(specialization.toLowerCase()) ? -1 : 1
        const bm = b.specialization.toLowerCase().includes(specialization.toLowerCase()) ? -1 : 1
        return am - bm
    })
}

function dueDateForPriority(priority: TaskPriority): string {
    const d = new Date()
    const days = priority === 'High' ? 7 : priority === 'Medium' ? 14 : 30
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
}

function phoneToWhatsApp(phone: string, message: string): string {
    const digits = phone.replace(/\D/g, '')
    if (!digits) return '#'
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

function shortLine(text: string, max = 48): string {
    const t = text.trim()
    return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`
}

const CONTACT_TASK_GEN_MIN_MS = 750

function sleepMs(ms: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, ms))
}

const PRIORITY_OPTS: QAOption[] = [
    { value: 'high',   title: 'High priority',   description: 'Flag for immediate review' },
    { value: 'normal', title: 'Normal priority',  description: 'Regular queue' },
    { value: 'low',    title: 'Low priority',     description: 'Next quarterly review cycle' },
]

function qaValueToPriority(v: string): TaskPriority {
    if (v === 'high') return 'High'
    if (v === 'low')  return 'Low'
    return 'Medium'
}

/* ── Shared UI primitives ── */

function AssistBubble({ children }: { children: React.ReactNode }) {
    return (
        <div className="chat-message chat-message--assistant flex gap-[var(--spacing-2)] items-start">
            <div className="chat-message__col min-w-0 flex-1 max-w-[100%]">
                <div className="chat-message__bubble">{children}</div>
            </div>
        </div>
    )
}

function InlineTaskPreview({ task, onDone, onOpenTask }: { task: Task; onDone: () => void; onOpenTask: () => void }) {
    return (
        <div className="flex flex-col gap-2 animate-[chat-area-in_0.2s_ease-out_both]">
            <button
                type="button"
                className={cn(
                    'flex items-center gap-3 w-full min-w-0 py-2.5 px-3 rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-[var(--color-white)] cursor-pointer transition-colors duration-150 text-left',
                    'hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-9)] focus-visible:outline-offset-2',
                )}
                onClick={onOpenTask}
            >
                <div className="shrink-0 w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] flex items-center justify-center">
                    <IconCheck size={18} stroke={2.75} color="var(--color-white)" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--color-gray-12)] leading-[1.3] truncate">{task.title}</div>
                    <div className="text-xs font-normal text-[var(--color-neutral-11)] leading-[1.3] mt-0.5">Task · {task.assignee}</div>
                </div>
                <IconChevronRight size={18} stroke={2} className="shrink-0 text-[var(--color-neutral-9)]" />
            </button>
            <div className="flex justify-end">
                <button
                    type="button"
                    className="text-xs font-medium text-[var(--color-neutral-10)] hover:text-[var(--color-gray-12)] underline-offset-2 hover:underline py-1 px-0.5 border-none bg-transparent cursor-pointer"
                    onClick={onDone}
                >
                    Done
                </button>
            </div>
        </div>
    )
}

function AssistComposer({ placeholder, value, onChange, onSend }: {
    placeholder: string; value: string; onChange: (v: string) => void; onSend: () => void
}) {
    return (
        <div className="chat-footer rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] flex w-full mt-2 pt-[var(--spacing-4)] px-[var(--spacing-3)] pb-[var(--spacing-3)] flex-col bg-[var(--color-white)] focus-within:border-[var(--color-purple)] focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.15)]">
            <textarea
                rows={3}
                className="w-full border-none outline-none resize-none font-sans text-sm text-[var(--color-gray-12)] bg-transparent px-[var(--spacing-2)] leading-[1.47]"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
                        e.preventDefault()
                        onSend()
                    }
                }}
            />
            <div className="flex mt-[var(--spacing-4)] w-full items-center justify-between">
                <div className="flex items-center gap-[var(--spacing-1)]">
                    <button type="button" className="p-[6px] rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)]" aria-label="Attach">
                        <IconPaperclip size={18} stroke={2} color="var(--color-neutral-11)" />
                    </button>
                    <button type="button" className="p-[6px] rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)]" aria-label="Mention">
                        <IconAt size={18} stroke={2} color="var(--color-neutral-11)" />
                    </button>
                </div>
                {value.trim() ? (
                    <button type="button" className="rounded-[var(--radius-md)] bg-[var(--color-purple)] flex min-h-[36px] w-9 h-9 items-center justify-center hover:opacity-85" onClick={onSend}>
                        <IconSend2 size={18} stroke={2} color="var(--color-white)" />
                    </button>
                ) : (
                    <button type="button" className="rounded-[var(--radius-md)] bg-[var(--color-purple)] flex min-h-[36px] w-9 h-9 items-center justify-center hover:opacity-85" aria-label="Voice">
                        <IconMicrophone size={18} stroke={2} color="var(--color-white)" />
                    </button>
                )}
            </div>
        </div>
    )
}

/* ── Types ── */

export interface TimelineAssistPanelProps {
    session: TimelineAssistSession
    onDismiss: () => void
    onTaskCreated: (task: Task, session: TimelineAssistSession) => void
    onOpenTask?: (taskId: string) => void
}

type ContactPhase = 'pick' | 'compose' | 'email-preview' | 'whatsapp-preview' | 'task-generating' | 'task-done'

/* ── Component ── */

export function TimelineAssistPanel({ session, onDismiss, onTaskCreated, onOpenTask }: TimelineAssistPanelProps) {
    const isCpa = session.flow === 'contact-cpa'

    const contacts = useMemo(() => {
        if (session.flow === 'contact-cpa')    return mockContacts.accountants
        if (session.flow === 'contact-lawyer') return sortedContacts(mockContacts.lawyers, session.suggestedLawyerSpecialization)
        return []
    }, [session])

    const analyzingHeadline =
        session.flow === 'contact-cpa'    ? 'Tax implications detected' :
        session.flow === 'contact-lawyer' ? 'Trust & Estate event' : null

    const contactQuickOptions = useMemo(
        () => (session.flow === 'contact-lawyer' || session.flow === 'contact-cpa')
            ? buildTimelineContactQuickOptions(session) : [],
        [session],
    )

    /* ── Create-task state ── */
    const [createPhase, setCreatePhase]                 = useState<'intro' | 'priority' | 'generating' | 'done'>('intro')
    const [analyzeComplete, setAnalyzeComplete]         = useState(false)
    const [needsPriorityOther, setNeedsPriorityOther]   = useState(false)
    const [customPriorityNote, setCustomPriorityNote]   = useState('')
    const [pickedPriorityCaption, setPickedPriorityCaption] = useState<string | null>(null)
    const [createTaskResult, setCreateTaskResult]       = useState<Task | null>(null)

    /* ── Contact flow state ── */
    const preselected = session.preselectedContactId
        ? (contacts.find(c => c.id === session.preselectedContactId) ?? null)
        : null
    const [contactPhase, setContactPhase]       = useState<ContactPhase>(preselected ? 'compose' : 'pick')
    const [selectedContact, setSelectedContact] = useState<Contact | null>(preselected ?? contacts[0] ?? null)
    const [composerText, setComposerText]       = useState(session.prefilledText ?? '')
    const [aiTaskHint, setAiTaskHint]           = useState(false)
    const [emailSubject, setEmailSubject]       = useState('')
    const [emailBody, setEmailBody]             = useState('')
    const [whatsappMessage, setWhatsappMessage] = useState('')
    const [contactTaskResult, setContactTaskResult] = useState<Task | null>(null)
    const [otherContactsOpen, setOtherContactsOpen] = useState(false)

    /* AI task-hint: fires 600 ms after user stops typing */
    useEffect(() => {
        if (!composerText.trim()) { setAiTaskHint(false); return }
        const t = window.setTimeout(() => {
            const lower = composerText.toLowerCase()
            const keywords = ['review', 'draft', 'prepare', 'update', 'file', 'create', 'check', 'submit', 'arrange', 'schedule', 'organize', 'send', 'complete']
            setAiTaskHint(keywords.some(kw => lower.includes(kw)))
        }, 600)
        return () => window.clearTimeout(t)
    }, [composerText])

    /* Kick off analyze timer for create-task flow */
    useEffect(() => {
        if (session.flow !== 'create-task') return
        const t = window.setTimeout(() => { setAnalyzeComplete(true); setCreatePhase('priority') }, 720)
        return () => window.clearTimeout(t)
    }, [session.flow])

    useEffect(() => { setSelectedContact(contacts[0] ?? null) }, [contacts])
    useEffect(() => { if (contactPhase !== 'pick') setOtherContactsOpen(false) }, [contactPhase])

    /* ── Handlers ── */

    const selectContactAndAdvance = useCallback((c: Contact) => {
        setSelectedContact(c)
        setContactPhase('compose')
        setComposerText('')
        setAiTaskHint(false)
        setOtherContactsOpen(false)
    }, [])

    const buildContactPrompt = useCallback(() => {
        return [
            `Event: ${session.contextName}`,
            session.eventDescription      && `Context: ${session.eventDescription}`,
            session.suggestedTaskTitle    && `Suggested task: ${session.suggestedTaskTitle}`,
            composerText.trim()           && `Additional instructions: ${composerText.trim()}`,
        ].filter(Boolean).join('\n')
    }, [composerText, session])

    const runContactGeneration = useCallback(async () => {
        if (!selectedContact) return
        setContactPhase('task-generating')
        const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now()
        const isLawyer = session.flow === 'contact-lawyer'
        let taskTitle = session.suggestedTaskTitle ?? session.contextName
        let taskPriority: TaskPriority = isLawyer ? 'High' : 'Medium'
        let recurring = false
        let recurrenceInterval: string | undefined

        try {
            const analyzed = await analyzeTaskInput(buildContactPrompt())
            if (analyzed.title)    taskTitle    = analyzed.title
            if (analyzed.priority) taskPriority = analyzed.priority
            recurring          = analyzed.recurring ?? false
            recurrenceInterval = analyzed.recurrenceInterval
        } catch { /* use fallbacks */ }

        const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0
        if (CONTACT_TASK_GEN_MIN_MS - elapsed > 0) await sleepMs(CONTACT_TASK_GEN_MIN_MS - elapsed)

        const task: Task = {
            id: `task-${Date.now()}`,
            title: taskTitle,
            type: isLawyer ? 'Legal' : 'Tax & Accounting',
            assignee: selectedContact.name,
            assigneeRole: selectedContact.role,
            assigneeFirm: selectedContact.firm,
            assigneeEmail: selectedContact.email,
            assigneePhone: selectedContact.phone,
            dueDate: dueDateForPriority(taskPriority),
            status: 'To Do',
            priority: taskPriority,
            recurring,
            recurrenceInterval: recurring ? recurrenceInterval : undefined,
            description: (session.suggestedDescription ?? composerText.trim()) || taskTitle,
            notes: composerText.trim() || undefined,
            relatedEvent: session.contextName,
            relatedEventId: session.contextEventId,
            createdFrom: 'timeline',
            createdAt: new Date().toISOString().slice(0, 10),
            lawFirm: selectedContact.firm,
            contactEmail: selectedContact.email,
            contactPhone: selectedContact.phone,
        }
        onTaskCreated(task, session)
        setContactTaskResult(task)
        setContactPhase('task-done')
    }, [buildContactPrompt, onTaskCreated, selectedContact, session, composerText])

    const handleEmailClick = useCallback(() => {
        if (!selectedContact) return
        const firstName = selectedContact.name.split(' ')[0]
        const text = composerText.trim()
        setEmailSubject(`Re: ${session.contextName}`)
        setEmailBody(
            `Dear ${selectedContact.name},\n\nI hope this message finds you well.\n\nI'm reaching out regarding: ${session.contextName}.\n\n${text || `[Please describe what you need from ${firstName}]`}\n\nI would appreciate your guidance on this. Please let me know your availability.\n\nBest regards`
        )
        setContactPhase('email-preview')
    }, [selectedContact, composerText, session.contextName])

    const handleWhatsAppClick = useCallback(() => {
        if (!selectedContact) return
        setWhatsappMessage(
            composerText.trim() || `Hi ${selectedContact.name.split(' ')[0]}, I'd like to discuss: ${session.contextName}.`
        )
        setContactPhase('whatsapp-preview')
    }, [selectedContact, composerText, session.contextName])

    const handleConfirmEmail = useCallback(() => {
        if (!selectedContact) return
        const subject = encodeURIComponent(emailSubject)
        const body    = encodeURIComponent(emailBody)
        window.open(`mailto:${selectedContact.email}?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer')
        showToast('Email opened in your mail app', 'success')
        onDismiss()
    }, [selectedContact, emailSubject, emailBody, onDismiss])

    const handleConfirmWhatsApp = useCallback(() => {
        if (!selectedContact?.phone) return
        window.open(phoneToWhatsApp(selectedContact.phone, whatsappMessage), '_blank', 'noopener,noreferrer')
        showToast('WhatsApp opened', 'success')
        onDismiss()
    }, [selectedContact, whatsappMessage, onDismiss])

    /* create-task priority handlers */
    const finishCreatePriority = useCallback(async (prio: TaskPriority, descriptionExtra?: string) => {
        setCreatePhase('generating')
        await new Promise<void>(resolve => window.setTimeout(resolve, 700))
        const title   = session.suggestedTaskTitle ?? `Revise Trust — ${session.contextName}`
        const richard = sortedContacts(mockContacts.lawyers, session.suggestedLawyerSpecialization)[0]!
        const desc    = [
            `Review and revise family trust tied to timeline event "${session.contextName}".`,
            customPriorityNote.trim() || descriptionExtra,
        ].filter(Boolean).join(' ')
        const task: Task = {
            id: `task-${Date.now()}`,
            title,
            type: 'Legal',
            assignee: richard.name,
            assigneeRole: richard.role,
            assigneeFirm: richard.firm,
            assigneeEmail: richard.email,
            assigneePhone: richard.phone,
            dueDate: dueDateForPriority(prio),
            status: 'To Do',
            priority: prio,
            recurring: false,
            description: desc,
            relatedEvent: session.contextName,
            relatedEventId: session.contextEventId,
            createdFrom: 'timeline',
            createdAt: new Date().toISOString().slice(0, 10),
            lawFirm: richard.firm,
            contactEmail: richard.email,
            contactPhone: richard.phone,
        }
        onTaskCreated(task, session)
        setCreateTaskResult(task)
        setCreatePhase('done')
    }, [customPriorityNote, onTaskCreated, session])

    const handlePrioritySelect = (values: string[]) => {
        const v = values[0]; if (!v) return
        const cap = v === 'high' ? 'High priority selected.' : v === 'low' ? 'Low priority selected.' : 'Normal priority selected.'
        setPickedPriorityCaption(cap)
        void finishCreatePriority(qaValueToPriority(v), cap)
    }

    const handleCustomPrioritySubmit = () => {
        if (!customPriorityNote.trim()) return
        setPickedPriorityCaption('Custom priority note provided.')
        void finishCreatePriority('Medium', customPriorityNote.trim())
        setNeedsPriorityOther(false)
    }

    /* ── RENDER: create-task flow (unchanged) ── */
    if (session.flow === 'create-task') {
        return (
            <div className="flex flex-col gap-[var(--spacing-4)] flex-1 min-h-0 overflow-y-auto chat-timeline-assist-scroll px-[var(--spacing-2)] py-[var(--spacing-3)] animate-[chat-area-in_0.2s_ease-out_both]">
                <AssistBubble>
                    <p className="m-0 text-sm leading-relaxed">
                        I&apos;d like help creating a task related to:&nbsp;
                        <strong>&quot;{session.contextName}&quot;</strong>.
                    </p>
                    <p className="m-0 mt-2 text-sm text-[var(--color-neutral-10)] leading-relaxed">
                        Let me look into this and set up a task...
                    </p>
                </AssistBubble>

                <AssistBubble>
                    <FojoPipeline steps={[{
                        text: 'Analyzing context',
                        detail: `${session.contextName}\n${session.eventDescription ?? ''}`.trim() || undefined,
                        status: analyzeComplete ? 'complete' : 'running',
                    }]} />
                </AssistBubble>

                {createPhase === 'priority' && analyzeComplete && !pickedPriorityCaption && !needsPriorityOther ? (
                    <FojoQA
                        question="What priority should this task have?"
                        options={PRIORITY_OPTS}
                        showOther
                        onSelect={handlePrioritySelect}
                        onOther={() => setNeedsPriorityOther(true)}
                    />
                ) : null}

                {createPhase === 'priority' && analyzeComplete && needsPriorityOther && !pickedPriorityCaption ? (
                    <>
                        <AssistBubble><p className="m-0 text-sm">Tell us how you&apos;d like to prioritize this task.</p></AssistBubble>
                        <AssistComposer placeholder="Describe priority or urgency…" value={customPriorityNote} onChange={setCustomPriorityNote} onSend={handleCustomPrioritySubmit} />
                    </>
                ) : null}

                {pickedPriorityCaption ? (
                    <AssistBubble>
                        <p className="m-0 text-sm flex items-center gap-1.5">
                            <IconCheck size={14} stroke={2.5} className="text-green-600 shrink-0" />
                            {pickedPriorityCaption}
                        </p>
                    </AssistBubble>
                ) : null}

                {createPhase === 'generating' ? (
                    <AssistBubble>
                        <div className="flex items-center gap-3 text-sm text-[var(--color-neutral-10)] py-1" role="status" aria-live="polite">
                            <span className="inline-block h-7 w-7 shrink-0 rounded-full border-2 border-[var(--color-accent-9)] border-t-transparent animate-spin" />
                            <p className="m-0 leading-snug">Generating task…</p>
                        </div>
                    </AssistBubble>
                ) : null}

                {createPhase === 'done' && createTaskResult ? (
                    <AssistBubble>
                        <InlineTaskPreview task={createTaskResult} onDone={onDismiss} onOpenTask={() => { onOpenTask?.(createTaskResult.id); onDismiss() }} />
                    </AssistBubble>
                ) : null}
            </div>
        )
    }

    /* ── RENDER: contact-lawyer / contact-cpa flow ── */
    return (
        <div className="flex flex-col gap-[var(--spacing-3)] flex-1 min-h-0 overflow-y-auto chat-timeline-assist-scroll px-[var(--spacing-2)] py-[var(--spacing-3)] animate-[chat-area-in_0.2s_ease-out_both]">

            {/* ── Step 1: Pick contact ── */}
            {contactPhase === 'pick' && (
                <AssistBubble>
                    <FojoPipeline steps={[{
                        text: `Analyzing context — ${analyzingHeadline ?? 'Timeline event'}`,
                        detail: `${session.contextName}\n${session.eventDescription ?? ''}`.trim() || undefined,
                        status: 'complete',
                    }]} />

                    <p className="mt-3 mb-3 text-sm font-medium m-0">
                        Which {isCpa ? 'accountant' : 'lawyer'} would you like to contact?
                    </p>

                    <div className="flex flex-col gap-2">
                        {contacts[0] ? (
                            <button
                                type="button"
                                onClick={() => selectContactAndAdvance(contacts[0]!)}
                                className="text-left rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] p-3 hover:bg-[rgba(0,91,226,0.04)] transition-colors bg-[var(--color-white)]"
                            >
                                <span className="text-[11px] text-[var(--color-accent-9)] mb-1 block font-medium">★ Recommended</span>
                                <div className="text-[13px] font-semibold text-[var(--color-gray-12)]">{contacts[0].name}</div>
                                <div className="text-xs text-[var(--color-neutral-10)]">{contacts[0].role}</div>
                                <div className="text-xs font-medium flex items-center gap-1 mt-0.5 text-[var(--color-neutral-11)]">
                                    {isCpa ? <IconCalculator size={12} stroke={1.75} /> : <IconScale size={12} stroke={1.75} />}
                                    {contacts[0].firm}
                                </div>
                            </button>
                        ) : null}

                        {contacts.length > 1 ? (
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    className={cn(
                                        'w-full flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-1)] px-3 py-2.5 text-left text-[13px] font-medium text-[var(--color-gray-12)] transition-colors hover:bg-[var(--color-neutral-2)]',
                                        otherContactsOpen && 'border-[var(--color-accent-9)] bg-[rgba(0,91,226,0.04)]',
                                    )}
                                    onClick={() => setOtherContactsOpen(v => !v)}
                                    aria-expanded={otherContactsOpen}
                                >
                                    {isCpa ? `Other accountants (${contacts.length - 1})` : `Other lawyers (${contacts.length - 1})`}
                                    <IconChevronDown size={16} stroke={2} className={cn('shrink-0 text-[var(--color-neutral-9)] transition-transform duration-200', otherContactsOpen && 'rotate-180')} />
                                </button>
                                {otherContactsOpen ? (
                                    <div className="flex flex-col gap-0.5 rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-white)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)] max-h-[min(280px,45vh)] overflow-y-auto">
                                        {contacts.slice(1).map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className="text-left rounded-[var(--radius-md)] px-2.5 py-2.5 hover:bg-[var(--color-neutral-2)] transition-colors border-none bg-transparent cursor-pointer w-full"
                                                onClick={() => selectContactAndAdvance(c)}
                                            >
                                                <div className="text-[13px] font-semibold text-[var(--color-gray-12)]">{c.name}</div>
                                                <div className="text-xs text-[var(--color-neutral-10)]">{c.role}</div>
                                                <div className="text-xs font-medium flex items-center gap-1 mt-0.5 text-[var(--color-neutral-11)]">
                                                    {isCpa ? <IconCalculator size={12} stroke={1.75} /> : <IconScale size={12} stroke={1.75} />}
                                                    {c.firm}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </AssistBubble>
            )}

            {/* ── Step 2: Compose ── */}
            {contactPhase === 'compose' && selectedContact && (
                <AssistBubble>
                    {/* Selected contact header */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--color-neutral-3)]">
                        <div className="flex items-center gap-2.5">
                            <span className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
                                isCpa ? 'bg-[#E8F5E9]' : 'bg-[#F3EEFF]'
                            )}>
                                {isCpa
                                    ? <IconCalculator size={14} stroke={1.75} className="text-[#2E7D32]" />
                                    : <IconScale      size={14} stroke={1.75} className="text-[#6E3DD1]" />
                                }
                            </span>
                            <div>
                                <div className="text-[13px] font-semibold text-[var(--color-gray-12)] leading-tight">{selectedContact.name}</div>
                                <div className="text-[11px] text-[var(--color-neutral-10)]">{selectedContact.firm}</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-accent-9)] hover:underline underline-offset-2"
                            onClick={() => setContactPhase('pick')}
                        >
                            <IconArrowLeft size={12} stroke={2} />
                            Change
                        </button>
                    </div>

                    {/* Textarea */}
                    <p className="text-sm font-medium text-[var(--color-gray-12)] mb-2 m-0">
                        What do you need from {selectedContact.name.split(' ')[0]}?
                    </p>
                    <textarea
                        autoFocus
                        rows={3}
                        className="w-full rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-1)] px-3 py-2.5 text-sm text-[var(--color-gray-12)] placeholder:text-[var(--color-neutral-8)] outline-none resize-none font-[inherit] leading-[1.5] focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150"
                        placeholder="Describe your request…"
                        value={composerText}
                        onChange={e => setComposerText(e.target.value)}
                    />

                    {/* Quick chips */}
                    {contactQuickOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {contactQuickOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={cn(
                                        'inline-flex items-center h-7 px-3 rounded-full border text-[12px] font-medium transition-colors',
                                        composerText === opt.title
                                            ? 'border-[var(--color-accent-9)] bg-[rgba(0,91,226,0.08)] text-[var(--color-accent-9)]'
                                            : 'border-[var(--color-gray-4)] bg-[var(--color-white)] text-[var(--color-gray-12)] hover:border-[var(--color-accent-9)] hover:bg-[rgba(0,91,226,0.04)]'
                                    )}
                                    onClick={() => setComposerText(opt.title)}
                                >
                                    {shortLine(opt.title, 40)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* AI task hint */}
                    {aiTaskHint && composerText.trim() && (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-[rgba(0,91,226,0.06)] border border-[rgba(0,91,226,0.15)]">
                            <IconSparkles size={13} stroke={2} className="shrink-0 text-[var(--color-accent-9)]" />
                            <span className="text-[12px] text-[var(--color-accent-9)] font-medium">This looks like it could be a task — use "Create Task" below</span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-3 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={handleEmailClick}
                            className="w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius-lg)] bg-[var(--color-accent-9)] text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                        >
                            <IconMail size={15} stroke={2} />
                            Send via Email
                        </button>
                        {selectedContact.phone ? (
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
                            onClick={() => void runContactGeneration()}
                            className="w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-1)] text-[13px] font-medium text-[var(--color-gray-12)] hover:bg-[var(--color-neutral-2)] transition-colors"
                        >
                            Create Task
                        </button>
                    </div>
                </AssistBubble>
            )}

            {/* ── Email preview ── */}
            {contactPhase === 'email-preview' && selectedContact && (
                <AssistBubble>
                    <div className="flex items-center gap-2 mb-3">
                        <button
                            type="button"
                            className="p-1 rounded-[var(--radius-sm)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                            onClick={() => setContactPhase('compose')}
                        >
                            <IconArrowLeft size={14} stroke={2} />
                        </button>
                        <div className="flex items-center gap-2">
                            <IconMail size={14} stroke={1.75} className="text-[var(--color-neutral-9)]" />
                            <span className="text-[13px] font-semibold text-[var(--color-gray-12)]">Email to {selectedContact.name.split(' ')[0]}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <div>
                            <label className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] mb-1 block">To</label>
                            <div className="flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-2)]">
                                <IconBuilding size={13} stroke={1.75} className="text-[var(--color-neutral-9)] shrink-0" />
                                <span className="text-sm text-[var(--color-neutral-11)] truncate">{selectedContact.email}</span>
                            </div>
                        </div>
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
                                rows={7}
                                className="w-full rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-1)] px-3 py-2.5 text-sm text-[var(--color-gray-12)] outline-none resize-none font-[inherit] leading-[1.5] focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150"
                                value={emailBody}
                                onChange={e => setEmailBody(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleConfirmEmail}
                        disabled={!emailSubject.trim()}
                        className="mt-3 w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius-lg)] bg-[var(--color-accent-9)] text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <IconMail size={15} stroke={2} />
                        Open in Mail App
                    </button>
                </AssistBubble>
            )}

            {/* ── WhatsApp preview ── */}
            {contactPhase === 'whatsapp-preview' && selectedContact && (
                <AssistBubble>
                    <div className="flex items-center gap-2 mb-3">
                        <button
                            type="button"
                            className="p-1 rounded-[var(--radius-sm)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                            onClick={() => setContactPhase('compose')}
                        >
                            <IconArrowLeft size={14} stroke={2} />
                        </button>
                        <div className="flex items-center gap-2">
                            <IconBrandWhatsapp size={14} stroke={1.75} className="text-[#25D366]" />
                            <span className="text-[13px] font-semibold text-[var(--color-gray-12)]">WhatsApp message</span>
                        </div>
                    </div>
                    <div className="mb-2">
                        <div className="flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-2)]">
                            <IconPhone size={13} stroke={1.75} className="text-[var(--color-neutral-9)] shrink-0" />
                            <span className="text-sm text-[var(--color-neutral-11)] truncate">{selectedContact.phone}</span>
                        </div>
                    </div>
                    <textarea
                        rows={4}
                        className="w-full rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-1)] px-3 py-2.5 text-sm text-[var(--color-gray-12)] outline-none resize-none font-[inherit] leading-[1.5] focus:border-[#25D366] focus:bg-white transition-[border-color,background] duration-150"
                        value={whatsappMessage}
                        onChange={e => setWhatsappMessage(e.target.value)}
                    />
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--color-neutral-9)]">
                        <IconBrandWhatsapp size={13} stroke={1.75} className="text-[#25D366] shrink-0" />
                        Message will open in WhatsApp
                    </div>
                    <button
                        type="button"
                        onClick={handleConfirmWhatsApp}
                        disabled={!whatsappMessage.trim()}
                        className="mt-3 w-full flex items-center justify-center gap-2 h-9 rounded-[var(--radius-lg)] border border-[#25D366] bg-white text-[13px] font-semibold text-[#25D366] hover:bg-[#f0fdf4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <IconBrandWhatsapp size={15} stroke={1.75} />
                        Confirm & Open WhatsApp
                    </button>
                </AssistBubble>
            )}

            {/* ── Task generating ── */}
            {contactPhase === 'task-generating' && (
                <AssistBubble>
                    <div className="flex items-center gap-3 text-sm text-[var(--color-neutral-10)] py-1" role="status" aria-live="polite">
                        <span className="inline-block h-7 w-7 shrink-0 rounded-full border-2 border-[var(--color-accent-9)] border-t-transparent animate-spin" />
                        <p className="m-0 leading-snug">Creating task…</p>
                    </div>
                </AssistBubble>
            )}

            {/* ── Task done ── */}
            {contactPhase === 'task-done' && contactTaskResult && (
                <AssistBubble>
                    <InlineTaskPreview
                        task={contactTaskResult}
                        onDone={onDismiss}
                        onOpenTask={() => { onOpenTask?.(contactTaskResult.id); onDismiss() }}
                    />
                </AssistBubble>
            )}
        </div>
    )
}
