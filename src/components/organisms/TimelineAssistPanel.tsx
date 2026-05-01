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
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { mockContacts, type Contact } from '@/data/thornton/contacts-data'
import type { Task, TaskPriority } from '@/data/thornton/tasks-data'
import { analyzeTaskInput } from '@/lib/api/analyzeTask'
import { FojoQA } from '@/components/molecules/FojoQA'
import type { QAOption } from '@/data/types/fojo'
import { FojoPipeline } from '@/components/atoms/FojoPipeline'
import type { TimelineAssistSession } from '@/types/timeline-assist'
import { buildTimelineContactQuickOptions } from '@/lib/timelineAssistQuickOptions'

/* ── helpers (як у ContactModal) ── */

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

function phoneToTel(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '')
    return cleaned ? `tel:${cleaned}` : '#'
}

/** Час, протягом якого показуємо «Generating…», навіть якщо analyze миттєвий — інакче стан не встигає зчитуватися */
const CONTACT_TASK_GEN_MIN_MS = 750

function sleepMs(ms: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, ms))
}

const PRIORITY_OPTS: QAOption[] = [
    {
        value: 'high',
        title: 'High priority',
        description: 'Flag for immediate review',
    },
    {
        value: 'normal',
        title: 'Normal priority',
        description: 'Regular queue',
    },
    {
        value: 'low',
        title: 'Low priority',
        description: 'Next quarterly review cycle',
    },
]

function qaValueToPriority(v: string): TaskPriority {
    if (v === 'high') return 'High'
    if (v === 'low') return 'Low'
    return 'Medium'
}

function AssistBubble({ children }: { children: React.ReactNode }) {
    return (
        <div className="chat-message chat-message--assistant flex gap-[var(--spacing-2)] items-start">
            <div className="chat-message__col min-w-0 flex-1 max-w-[100%]">
                <div className="chat-message__bubble">{children}</div>
            </div>
        </div>
    )
}

function UserBubble({ text }: { text: string }) {
    return (
        <div className="chat-message chat-message--user flex gap-[var(--spacing-2)] items-start justify-end">
            <div className="chat-message__col">
                <div className="chat-message__bubble">{text}</div>
            </div>
        </div>
    )
}

/* ── Task card у стрічці чату ── */

function InlineTaskPreview({
    task,
    onDone,
    onOpenTask,
}: {
    task: Task
    onDone: () => void
    onOpenTask: () => void
}) {
    return (
        <div className="flex flex-col gap-2 animate-[chat-area-in_0.2s_ease-out_both]">
            <button
                type="button"
                className={cn(
                    'flex items-center gap-3 w-full min-w-0 py-2.5 px-3 rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-[var(--color-white)] cursor-pointer transition-colors duration-150 text-left',
                    'hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-9)] focus-visible:outline-offset-2',
                )}
                onClick={onOpenTask}
                aria-label={`Open task: ${task.title}`}
            >
                <div className="shrink-0 w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] flex items-center justify-center" aria-hidden>
                    <IconCheck size={18} stroke={2.75} color="var(--color-white)" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--color-gray-12)] leading-[1.3] truncate">{task.title}</div>
                    <div className="text-xs font-normal text-[var(--color-neutral-11)] leading-[1.3] mt-0.5">Task</div>
                </div>
                <IconChevronRight size={18} stroke={2} className="shrink-0 text-[var(--color-neutral-9)]" aria-hidden />
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

/* ── Composer (без модалки) ── */

function AssistComposer({
    placeholder,
    value,
    onChange,
    onSend,
}: {
    placeholder: string
    value: string
    onChange: (v: string) => void
    onSend: () => void
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
                    <button
                        type="button"
                        className="rounded-[var(--radius-md)] bg-[var(--color-purple)] flex min-h-[36px] w-9 h-9 items-center justify-center hover:opacity-85"
                        onClick={onSend}
                    >
                        <IconSend2 size={18} stroke={2} color="var(--color-white)" />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="rounded-[var(--radius-md)] bg-[var(--color-purple)] flex min-h-[36px] w-9 h-9 items-center justify-center hover:opacity-85"
                        aria-label="Voice"
                    >
                        <IconMicrophone size={18} stroke={2} color="var(--color-white)" />
                    </button>
                )}
            </div>
        </div>
    )
}

export interface TimelineAssistPanelProps {
    session: TimelineAssistSession
    onDismiss: () => void
    onTaskCreated: (task: Task, session: TimelineAssistSession) => void
    onOpenTask?: (taskId: string) => void
}

/** Демо-flow з таймлайну: задача / юрист / CPA — лише в панелі Fojo */
export function TimelineAssistPanel({
    session,
    onDismiss,
    onTaskCreated,
    onOpenTask,
}: TimelineAssistPanelProps) {
    const isCpa = session.flow === 'contact-cpa'

    const contacts = useMemo(() => {
        if (session.flow === 'contact-cpa') return mockContacts.accountants
        if (session.flow === 'contact-lawyer')
            return sortedContacts(mockContacts.lawyers, session.suggestedLawyerSpecialization)
        return []
    }, [session])

    const analyzingHeadline =
        session.flow === 'contact-cpa'
            ? 'Tax implications detected'
            : session.flow === 'contact-lawyer'
                ? 'Trust & Estate event'
                : null

    const contactQuickOptions = useMemo(
        () =>
            session.flow === 'contact-lawyer' || session.flow === 'contact-cpa'
                ? buildTimelineContactQuickOptions(session)
                : [],
        [session],
    )
    // ── Create-task flow ──
    const [createPhase, setCreatePhase] = useState<
        'intro' | 'priority' | 'generating' | 'done'
    >('intro')
    const [analyzeComplete, setAnalyzeComplete] = useState(false)
    const [needsPriorityOther, setNeedsPriorityOther] = useState(false)
    const [customPriorityNote, setCustomPriorityNote] = useState('')
    const [pickedPriorityCaption, setPickedPriorityCaption] = useState<string | null>(null)
    const [createTaskResult, setCreateTaskResult] = useState<Task | null>(null)

    // ── Contact flow ──
    const [contactPhase, setContactPhase] = useState<'pick' | 'composer' | 'generating' | 'done'>('pick')
    const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0] ?? null)
    const [composerText, setComposerText] = useState('')
    const [userQuickLine, setUserQuickLine] = useState<string | null>(null)
    const [contactTaskResult, setContactTaskResult] = useState<Task | null>(null)
    const [otherContactsOpen, setOtherContactsOpen] = useState(false)
    useEffect(() => {
        if (session.flow !== 'create-task') return
        const t = window.setTimeout(() => {
            setAnalyzeComplete(true)
            setCreatePhase('priority')
        }, 720)
        return () => window.clearTimeout(t)
    }, [session.flow])

    const buildPromptForContactGen = useCallback(() => {
        const ctx = session.contextName
        const bits = [
            `Event: ${ctx}`,
            session.eventDescription && `Context: ${session.eventDescription}`,
            session.suggestedTaskTitle && `Suggested task: ${session.suggestedTaskTitle}`,
            composerText.trim() && `Additional instructions: ${composerText.trim()}`,
            userQuickLine && `User selected: ${userQuickLine}`,
        ].filter(Boolean)
        return bits.join('\n')
    }, [composerText, session, userQuickLine])

    const runContactGeneration = useCallback(async () => {
        if (!selectedContact) return
        setContactPhase('generating')
        const loadingStartedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()

        const isLawyerLocal = session.flow === 'contact-lawyer'
        const fullPrompt = buildPromptForContactGen()
        let taskTitle = session.suggestedTaskTitle ?? session.contextName
        let taskPriority: TaskPriority = isLawyerLocal ? 'High' : 'Medium'
        let recurring = false
        let recurrenceInterval: string | undefined

        try {
            const analyzed = await analyzeTaskInput(fullPrompt)
            if (analyzed.title) taskTitle = analyzed.title
            if (analyzed.priority) taskPriority = analyzed.priority
            recurring = analyzed.recurring ?? false
            recurrenceInterval = analyzed.recurrenceInterval
        }
        catch {
            /* mock fallbacks */
        }

        const elapsedMs =
            (typeof performance !== 'undefined' ? performance.now() : Date.now()) - loadingStartedAt
        const remainingMs = CONTACT_TASK_GEN_MIN_MS - elapsedMs
        if (remainingMs > 0)
            await sleepMs(remainingMs)

        const task: Task = {
            id: `task-${Date.now()}`,
            title: taskTitle,
            type: isLawyerLocal ? 'Legal' : 'Tax & Accounting',
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
            description: (session.suggestedDescription ?? composerText.trim() ?? userQuickLine) || taskTitle,
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
        setContactPhase('done')
    }, [buildPromptForContactGen, onTaskCreated, selectedContact, session])

    useEffect(() => {
        setSelectedContact(contacts[0] ?? null)
    }, [contacts])

    useEffect(() => {
        if (contactPhase !== 'pick')
            setOtherContactsOpen(false)
    }, [contactPhase])

    const selectContactAndAdvance = useCallback((c: Contact) => {
        setSelectedContact(c)
        setContactPhase('composer')
        setComposerText('')
        setUserQuickLine(null)
        setOtherContactsOpen(false)
    }, [])

    const finishCreatePriority = useCallback(
        async (prio: TaskPriority, descriptionExtra?: string) => {
            setCreatePhase('generating')
            await new Promise<void>(resolve => window.setTimeout(resolve, 700))
            const title = session.suggestedTaskTitle
                ?? `Revise Trust — ${session.contextName}`
            const richard = sortedContacts(mockContacts.lawyers, session.suggestedLawyerSpecialization)[0]!
            const descBits = [
                `Review and revise family trust tied to timeline event "${session.contextName}".`,
                customPriorityNote.trim() || descriptionExtra,
            ].filter(Boolean)
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
                description: descBits.join(' '),
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
        },
        [customPriorityNote, onTaskCreated, session],
    )

    const handlePrioritySelect = (values: string[]) => {
        const v = values[0]
        if (!v) return
        const cap =
            v === 'high'
                ? 'High priority selected.'
                : v === 'low'
                    ? 'Low priority selected.'
                    : 'Normal priority selected.'
        setPickedPriorityCaption(cap)
        void finishCreatePriority(qaValueToPriority(v), cap)
    }

    const handleCustomPrioritySubmit = () => {
        if (!customPriorityNote.trim()) return
        setPickedPriorityCaption('Custom priority note provided.')
        void finishCreatePriority('Medium', customPriorityNote.trim())
        setNeedsPriorityOther(false)
    }

    /* ──── RENDER ──── */

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
                    <FojoPipeline
                        steps={[{
                            text: 'Analyzing context',
                            detail:
                                `${session.contextName}\n${session.eventDescription ?? ''}`.trim() || undefined,
                            status: analyzeComplete ? 'complete' : 'running',
                        }]}
                    />
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
                        <AssistBubble>
                            <p className="m-0 text-sm">Tell us how you&apos;d like to prioritize this task.</p>
                        </AssistBubble>
                        <AssistComposer
                            placeholder="Describe priority or urgency…"
                            value={customPriorityNote}
                            onChange={setCustomPriorityNote}
                            onSend={handleCustomPrioritySubmit}
                        />
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
                            <span
                                className="inline-block h-7 w-7 shrink-0 rounded-full border-2 border-[var(--color-accent-9)] border-t-transparent animate-spin"
                                aria-hidden
                            />
                            <p className="m-0 leading-snug">Generating task…</p>
                        </div>
                    </AssistBubble>
                ) : null}

                {createPhase === 'done' && createTaskResult ? (
                    <AssistBubble>
                        <InlineTaskPreview
                            task={createTaskResult}
                            onDone={onDismiss}
                            onOpenTask={() => {
                                onOpenTask?.(createTaskResult.id)
                                onDismiss()
                            }}
                        />
                    </AssistBubble>
                ) : null}
            </div>
        )
    }

    /** Contact-lawyer | contact-cpa */
    return (
        <div className="flex flex-col gap-[var(--spacing-4)] flex-1 min-h-0 overflow-y-auto chat-timeline-assist-scroll px-[var(--spacing-2)] py-[var(--spacing-3)] animate-[chat-area-in_0.2s_ease-out_both]">
            <AssistBubble>
                <FojoPipeline
                    steps={[{
                        text: `Analyzing context — ${analyzingHeadline ?? 'Timeline event'}`,
                        detail: `${session.contextName}\n${session.eventDescription ?? ''}`.trim() || undefined,
                        status: 'complete',
                    }]}
                />
            </AssistBubble>

            {contactPhase === 'pick' ? (
                <AssistBubble>
                    <p className="mt-0 mb-3 text-sm font-medium">
                        Which {isCpa ? 'accountant' : 'lawyer'} would you like to contact?
                    </p>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] mb-1.5">
                        Recommended
                    </div>
                    <div className="flex flex-col gap-2">
                        {contacts[0] ? (
                            <button
                                key={contacts[0].id}
                                type="button"
                                onClick={() => selectContactAndAdvance(contacts[0]!)}
                                className="text-left rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] p-3 hover:bg-[rgba(0,91,226,0.04)] transition-colors bg-[var(--color-white)]"
                            >
                                <span className="text-[11px] text-[var(--color-accent-9)] mb-1 block font-medium">
                                    ★ Recommended
                                </span>
                                <div className="text-[13px] font-semibold text-[var(--color-gray-12)]">{contacts[0].name}</div>
                                <div className="text-xs text-[var(--color-neutral-10)]">{contacts[0].role}</div>
                                <div className="text-xs font-medium flex items-center gap-1 mt-0.5 text-[var(--color-neutral-11)]">
                                    {session.flow === 'contact-lawyer' ? (
                                        <IconScale size={12} stroke={1.75} />
                                    ) : (
                                        <IconCalculator size={12} stroke={1.75} />
                                    )}
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
                                    aria-controls="timeline-assist-other-contacts"
                                >
                                    <span>
                                        {isCpa
                                            ? `Other accountants (${contacts.length - 1})`
                                            : `Other lawyers (${contacts.length - 1})`}
                                    </span>
                                    <IconChevronDown
                                        size={16}
                                        stroke={2}
                                        className={cn(
                                            'shrink-0 text-[var(--color-neutral-9)] transition-transform duration-200',
                                            otherContactsOpen && 'rotate-180',
                                        )}
                                    />
                                </button>
                                {otherContactsOpen ? (
                                    <div
                                        id="timeline-assist-other-contacts"
                                        className="flex flex-col gap-0.5 rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-white)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)] max-h-[min(280px,45vh)] overflow-y-auto"
                                        role="listbox"
                                    >
                                        {contacts.slice(1).map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                role="option"
                                                className="text-left rounded-[var(--radius-md)] px-2.5 py-2.5 hover:bg-[var(--color-neutral-2)] transition-colors border-none bg-transparent cursor-pointer w-full"
                                                onClick={() => selectContactAndAdvance(c)}
                                            >
                                                <div className="text-[13px] font-semibold text-[var(--color-gray-12)]">{c.name}</div>
                                                <div className="text-xs text-[var(--color-neutral-10)]">{c.role}</div>
                                                <div className="text-xs font-medium flex items-center gap-1 mt-0.5 text-[var(--color-neutral-11)]">
                                                    {session.flow === 'contact-lawyer' ? (
                                                        <IconScale size={12} stroke={1.75} />
                                                    ) : (
                                                        <IconCalculator size={12} stroke={1.75} />
                                                    )}
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
            ) : null}

            {contactPhase === 'composer' && selectedContact ? (
                <>
                    <AssistBubble>
                        <p className="m-0 text-sm">
                            ✓ <strong>{selectedContact.name}</strong> selected.
                        </p>
                        <div
                            role="region"
                            aria-label="Office and contact channels"
                            className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-[var(--color-white)] shadow-[var(--shadow-subtle)]"
                        >
                            <div className="flex flex-col gap-1.5 px-3.5 py-3">
                                <div className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 -mx-2">
                                    <span
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-neutral-2)] border border-[var(--color-neutral-4)]"
                                        aria-hidden
                                    >
                                        <IconBuilding size={16} stroke={1.75} color="var(--color-accent-9)" />
                                    </span>
                                    <span className="min-w-0 flex-1 flex flex-col gap-0.5">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">
                                            {session.flow === 'contact-lawyer' ? 'Law firm' : 'Firm'}
                                        </span>
                                        <span className="text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] leading-snug">
                                            {selectedContact.firm}
                                        </span>
                                        <span className="text-xs font-normal text-[var(--color-neutral-11)] leading-snug">
                                            {selectedContact.role}
                                        </span>
                                    </span>
                                </div>
                                <a
                                    href={`mailto:${selectedContact.email}`}
                                    className="group flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 -mx-2 transition-colors hover:bg-[var(--color-gray-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-9)] focus-visible:outline-offset-2 no-underline"
                                >
                                    <span
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-neutral-2)] border border-[var(--color-neutral-4)] transition-colors group-hover:bg-[var(--color-accent-3)] group-hover:border-transparent"
                                        aria-hidden
                                    >
                                        <IconMail size={16} stroke={2} color="var(--color-accent-9)" />
                                    </span>
                                    <span className="min-w-0 flex-1 flex flex-col gap-0.5">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">
                                            Email
                                        </span>
                                        <span className="text-[13px] font-[var(--font-weight-medium)] text-[var(--color-accent-9)] leading-snug truncate group-hover:underline">
                                            {selectedContact.email}
                                        </span>
                                    </span>
                                </a>
                                <a
                                    href={phoneToTel(selectedContact.phone)}
                                    className="group flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 -mx-2 transition-colors hover:bg-[var(--color-gray-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-9)] focus-visible:outline-offset-2 no-underline text-inherit"
                                >
                                    <span
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-neutral-2)] border border-[var(--color-neutral-4)] transition-colors group-hover:bg-[var(--color-accent-3)] group-hover:border-transparent"
                                        aria-hidden
                                    >
                                        <IconPhone size={16} stroke={2} color="var(--color-accent-9)" />
                                    </span>
                                    <span className="min-w-0 flex-1 flex flex-col gap-0.5">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">
                                            Phone
                                        </span>
                                        <span className="text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] leading-snug truncate">
                                            {selectedContact.phone}
                                        </span>
                                    </span>
                                </a>
                            </div>
                        </div>
                        <p className="mt-3 mb-2 text-sm text-[var(--color-neutral-11)]">
                            What do you need from {selectedContact.name.split(' ')[0]}? Fojo will create and assign the task.
                        </p>
                        <div className="mt-2 flex flex-col gap-2.5 p-3.5 mb-[var(--spacing-2)] border border-[var(--color-gray-4)] rounded-[var(--radius-lg)] bg-[var(--color-white)] animate-[chat-area-in_0.2s_ease-out_both]">
                            <p className="text-sm font-medium text-[var(--color-gray-12)] leading-5 m-0">Or choose quickly:</p>
                            <div className="flex flex-col gap-1.5">
                                {contactQuickOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className="flex items-center gap-3 py-2 px-2.5 border-none rounded-lg bg-transparent cursor-pointer transition-[background] duration-150 text-left w-full hover:bg-[var(--color-gray-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-9)] focus-visible:outline-offset-2"
                                        onClick={() => {
                                            setUserQuickLine(opt.title)
                                            void runContactGeneration()
                                        }}
                                    >
                                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                            <span className="text-[13px] font-medium text-[var(--color-gray-12)] leading-[18px]">{opt.title}</span>
                                            <span className="text-xs font-normal text-[var(--color-neutral-11)] leading-4">{opt.description}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </AssistBubble>
                    {!userQuickLine && contactPhase === 'composer' ? (
                        <AssistComposer
                            placeholder={isCpa ? 'Describe tax or accounting question…' : 'Describe what you need…'}
                            value={composerText}
                            onChange={setComposerText}
                            onSend={() => void runContactGeneration()}
                        />
                    ) : null}
                </>
            ) : null}

            {userQuickLine ? <UserBubble text={userQuickLine} /> : null}

            {contactPhase === 'generating' ? (
                <AssistBubble>
                    <div className="flex items-center gap-3 text-sm text-[var(--color-neutral-10)] py-1" role="status" aria-live="polite">
                        <span
                            className="inline-block h-7 w-7 shrink-0 rounded-full border-2 border-[var(--color-accent-9)] border-t-transparent animate-spin"
                            aria-hidden
                        />
                        <p className="m-0 leading-snug">Generating task…</p>
                    </div>
                </AssistBubble>
            ) : null}

            {contactPhase === 'done' && contactTaskResult ? (
                <AssistBubble>
                    <InlineTaskPreview
                        task={contactTaskResult}
                        onDone={onDismiss}
                        onOpenTask={() => {
                            onOpenTask?.(contactTaskResult.id)
                            onDismiss()
                        }}
                    />
                </AssistBubble>
            ) : null}
        </div>
    )
}
