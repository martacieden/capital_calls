import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
    IconX, IconScale, IconCalculator,
    IconBuilding, IconMail, IconPhone,
    IconMicrophone, IconCopy, IconCheck, IconSparkles,
    IconArrowRight,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { mockContacts, type Contact } from '@/data/thornton/contacts-data'
import { showToast } from '@/components/atoms/Toast'
import { analyzeTaskInput } from '@/lib/api/analyzeTask'
import type { Task, TaskPriority } from '@/data/thornton/tasks-data'

/* ── Types ── */

interface ContactEventContext {
    id: string
    title: string
    suggestedTaskTitle?: string
    suggestedLawyerSpecialization?: string
    suggestedDescription?: string
    eventDescription?: string
}

interface ContactModalProps {
    type: 'lawyer' | 'cpa'
    event: ContactEventContext
    onClose: () => void
    onCreateTask: (task: Task) => void
    onNavigateToTask?: (taskId: string) => void
}

type Step = 'input' | 'loading' | 'preview'

/* ── Helpers ── */

function sortedContacts(contacts: Contact[], specialization?: string): Contact[] {
    if (!specialization) return contacts
    return [...contacts].sort((a, b) => {
        const aMatch = a.specialization.toLowerCase().includes(specialization.toLowerCase()) ? -1 : 1
        const bMatch = b.specialization.toLowerCase().includes(specialization.toLowerCase()) ? -1 : 1
        return aMatch - bMatch
    })
}

function dueDateForPriority(priority: TaskPriority): string {
    const d = new Date()
    const days = priority === 'High' ? 7 : priority === 'Medium' ? 14 : 30
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function phoneToTel(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '')
    return cleaned ? `tel:${cleaned}` : '#'
}

async function copyToClipboard(label: string, value: string) {
    try {
        await navigator.clipboard.writeText(value)
        showToast(`${label} copied`, 'success')
    } catch {
        showToast('Could not copy to clipboard', 'error')
    }
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
    High:   '#DC2626',
    Medium: '#D97706',
    Low:    '#9CA3AF',
}

const TYPE_BADGE: Record<string, string> = {
    'Legal':             'bg-[#F3EEFF] text-[#6E3DD1]',
    'Tax & Accounting':  'bg-[#E8F5E9] text-[#2E7D32]',
}

/* ── Component ── */

export function ContactModal({ type, event, onClose, onCreateTask, onNavigateToTask }: ContactModalProps) {
    const isLawyer = type === 'lawyer'
    const contacts = isLawyer
        ? sortedContacts(mockContacts.lawyers, event.suggestedLawyerSpecialization)
        : mockContacts.accountants

    const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id ?? '')
    const [userText, setUserText] = useState('')
    const [step, setStep] = useState<Step>('input')
    const [createdTask, setCreatedTask] = useState<Task | null>(null)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    useEffect(() => { setTimeout(() => textareaRef.current?.focus(), 80) }, [])

    const selectedContact = contacts.find(c => c.id === selectedContactId) ?? contacts[0] ?? null

    const handleCreate = async () => {
        if (!selectedContact) return
        setStep('loading')

        const contextLines = [
            `Event: ${event.title}`,
            event.eventDescription && `Context: ${event.eventDescription}`,
            event.suggestedTaskTitle && `Suggested task: ${event.suggestedTaskTitle}`,
            userText.trim() && `Additional instructions: ${userText.trim()}`,
        ].filter(Boolean)
        const fullPrompt = contextLines.join('\n')

        let taskTitle = event.suggestedTaskTitle ?? event.title
        let taskPriority: TaskPriority = isLawyer ? 'High' : 'Medium'
        let taskRecurring = false
        let taskInterval: string | undefined

        try {
            const analyzed = await analyzeTaskInput(fullPrompt)
            if (analyzed.title) taskTitle = analyzed.title
            if (analyzed.priority) taskPriority = analyzed.priority
            taskRecurring = analyzed.recurring ?? false
            taskInterval = analyzed.recurrenceInterval
        } catch {
            // keep fallbacks
        }

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
            recurring: taskRecurring,
            recurrenceInterval: taskRecurring ? taskInterval : undefined,
            description: (event.suggestedDescription ?? userText.trim()) || taskTitle,
            notes: userText.trim() || undefined,
            relatedEvent: event.title,
            relatedEventId: event.id,
            createdFrom: 'timeline',
            createdAt: new Date().toISOString().slice(0, 10),
            lawFirm: selectedContact.firm,
            contactEmail: selectedContact.email,
            contactPhone: selectedContact.phone,
        }

        // Register the task in app state — modal stays open for the preview
        onCreateTask(task)
        setCreatedTask(task)
        setStep('preview')
    }

    const handleOpenTask = () => {
        if (createdTask) onNavigateToTask?.(createdTask.id)
        onClose()
    }

    /* ── Render ── */

    const isPreview = step === 'preview' && createdTask

    const modal = (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={step === 'input' ? onClose : undefined} />

            <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[var(--radius-2xl)] shadow-[0_32px_100px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden">

                {/* ── Header ── */}
                <div className={cn(
                    'flex items-center justify-between px-6 pt-5 pb-4',
                    isPreview && 'border-b border-[var(--color-neutral-3)]',
                )}>
                    <div className="flex items-center gap-3">
                        {isPreview ? (
                            /* Green check when task is created */
                            <div className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 bg-[#ECFDF5]">
                                <IconCheck size={18} stroke={2.5} className="text-[#16A34A]" />
                            </div>
                        ) : (
                            <div className={cn(
                                'w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0',
                                isLawyer ? 'bg-[#F3EEFF]' : 'bg-[#E8F5E9]'
                            )}>
                                {isLawyer
                                    ? <IconScale size={18} stroke={1.75} className="text-[#6E3DD1]" />
                                    : <IconCalculator size={18} stroke={1.75} className="text-[#2E7D32]" />
                                }
                            </div>
                        )}
                        <div>
                            <div className="text-[15px] font-semibold text-[var(--color-black)] leading-5">
                                {isPreview
                                    ? 'Task created'
                                    : isLawyer ? 'Create task for lawyer' : 'Create task for CPA / Accountant'
                                }
                            </div>
                            <div className="text-xs text-[var(--color-neutral-9)] mt-0.5">
                                {isPreview
                                    ? 'Fojo generated the details below'
                                    : 'Fojo will create and assign the task'
                                }
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                    >
                        <IconX size={16} stroke={2} />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="px-6 pb-6 flex flex-col gap-4">

                    {/* ── Loading ── */}
                    {step === 'loading' && (
                        <div className="py-10 flex flex-col items-center gap-4">
                            <div className="w-9 h-9 rounded-full border-[3px] border-[var(--color-accent-9)] border-t-transparent animate-spin" />
                            <div className="text-sm text-[var(--color-neutral-10)]">Fojo is creating your task…</div>
                        </div>
                    )}

                    {/* ── Preview ── */}
                    {isPreview && (
                        <div className="flex flex-col gap-4 pt-1">
                            {/* Type badge */}
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    'inline-flex items-center h-6 px-2.5 rounded-[var(--radius-sm)] text-xs font-semibold',
                                    TYPE_BADGE[createdTask.type] ?? 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)]'
                                )}>
                                    {createdTask.type}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-9)]">
                                    <IconSparkles size={11} stroke={2} />
                                    Created by Fojo
                                </span>
                            </div>

                            {/* Task title */}
                            <div className="text-[17px] font-[800] text-[var(--color-gray-12)] leading-[1.25] tracking-[-0.02em]">
                                {createdTask.title}
                            </div>

                            {/* Detail grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Assigned to */}
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">Assigned to</span>
                                    <span className="text-[13px] font-medium text-[var(--color-gray-12)] leading-[1.35]">{createdTask.assignee}</span>
                                    <span className="text-[11px] text-[var(--color-neutral-10)] leading-[1.3]">{createdTask.assigneeFirm}</span>
                                </div>

                                {/* Priority */}
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">Priority</span>
                                    <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-gray-12)]">
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ background: PRIORITY_DOT[createdTask.priority] }}
                                        />
                                        {createdTask.priority}
                                    </span>
                                </div>

                                {/* Due date */}
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">Due date</span>
                                    <span className="text-[13px] font-medium text-[var(--color-gray-12)]">{formatDate(createdTask.dueDate)}</span>
                                </div>

                                {/* Related event */}
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">Related event</span>
                                    <span className="text-[13px] font-medium text-[var(--color-gray-12)] leading-[1.35] line-clamp-2">{createdTask.relatedEvent}</span>
                                </div>
                            </div>

                            {/* Description */}
                            {createdTask.description && (
                                <p className="text-[13px] text-[var(--color-neutral-11)] leading-[1.5] line-clamp-3 border-t border-[var(--color-neutral-3)] pt-3">
                                    {createdTask.description}
                                </p>
                            )}

                            {/* Footer buttons */}
                            <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                    onClick={onClose}
                                    className="h-9 px-4 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] text-sm font-medium text-[var(--color-neutral-11)] bg-white hover:bg-[var(--color-neutral-2)] transition-colors"
                                >
                                    Done
                                </button>
                                <button
                                    onClick={handleOpenTask}
                                    className="h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
                                >
                                    Open task
                                    <IconArrowRight size={14} stroke={2.5} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Input ── */}
                    {step === 'input' && (
                        <>
                            {/* Lawyer / CPA selector */}
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
                                        <option key={c.id} value={c.id}>
                                            {c.name} — {c.role}
                                        </option>
                                    ))}
                                </select>

                                {selectedContact && (
                                    <div
                                        role="region"
                                        aria-label="Office and contact channels"
                                        className="rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-2.5 py-2 flex flex-col gap-1.5"
                                    >
                                        <div className="flex items-center gap-1.5 min-w-0 text-[11px] text-[var(--color-neutral-11)] leading-snug">
                                            <IconBuilding size={13} stroke={1.75} className="shrink-0 text-[var(--color-neutral-9)]" aria-hidden />
                                            <span className="truncate">{selectedContact.firm}</span>
                                        </div>
                                        <div className="flex items-center gap-1 min-w-0 rounded-sm py-px -mx-0.5 px-0.5 hover:bg-white/70 transition-colors">
                                            <IconMail size={13} stroke={1.75} className="shrink-0 text-[var(--color-neutral-9)] ml-px" aria-hidden />
                                            <a
                                                href={`mailto:${selectedContact.email}`}
                                                className="flex-1 min-w-0 text-[11px] font-medium text-[var(--color-accent-9)] hover:underline underline-offset-2 truncate"
                                            >
                                                {selectedContact.email}
                                            </a>
                                            <button
                                                type="button"
                                                className="shrink-0 p-1 rounded text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-black)]"
                                                aria-label="Copy email"
                                                onClick={() => copyToClipboard('Email', selectedContact.email)}
                                            >
                                                <IconCopy size={12} stroke={1.75} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1 min-w-0 rounded-sm py-px -mx-0.5 px-0.5 hover:bg-white/70 transition-colors">
                                            <IconPhone size={13} stroke={1.75} className="shrink-0 text-[var(--color-neutral-9)] ml-px" aria-hidden />
                                            <a
                                                href={phoneToTel(selectedContact.phone)}
                                                className="flex-1 min-w-0 text-[11px] font-medium text-[var(--color-accent-9)] tabular-nums hover:underline underline-offset-2 truncate"
                                            >
                                                {selectedContact.phone}
                                            </a>
                                            <button
                                                type="button"
                                                className="shrink-0 p-1 rounded text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-black)]"
                                                aria-label="Copy phone"
                                                onClick={() => copyToClipboard('Phone', selectedContact.phone)}
                                            >
                                                <IconCopy size={12} stroke={1.75} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat-style input */}
                            <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] flex flex-col pt-3 px-3 pb-2.5 gap-3 focus-within:border-[var(--color-accent-9)] focus-within:bg-white transition-[border-color,background] duration-150">
                                <textarea
                                    ref={textareaRef}
                                    rows={3}
                                    className="w-full resize-none bg-transparent text-sm text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] outline-none font-[inherit] leading-[1.5]"
                                    placeholder="Describe what you need, or leave empty — Fojo will use the event context"
                                    value={userText}
                                    onChange={e => setUserText(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            e.preventDefault()
                                            handleCreate()
                                        }
                                    }}
                                />
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        className="p-[5px] rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors opacity-40 cursor-not-allowed"
                                        aria-label="Voice input"
                                        disabled
                                    >
                                        <IconMicrophone size={16} stroke={1.75} />
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={!selectedContact}
                                        className="flex items-center justify-center gap-[var(--spacing-1)] rounded-[var(--radius-md)] border border-[var(--color-accent-9)] bg-[var(--color-accent-9)] h-8 px-[14px] text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}
