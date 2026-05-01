import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconX, IconSparkles, IconCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { analyzeTaskInput } from '@/lib/api/analyzeTask'
import type { Task, TaskType, TaskPriority } from '@/data/thornton/tasks-data'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'

interface CreateTaskModalProps {
    onClose: () => void
    onCreateTask: (task: Task) => void
}

type Step = 'input' | 'loading' | 'form'

const TYPE_STYLES: Record<TaskType, string> = {
    Insurance:   'bg-[#EBF3FF] text-[#0560D0]',
    Maintenance: 'bg-[#FFF3E0] text-[#C05500]',
    Legal:       'bg-[#F3EEFF] text-[#6E3DD1]',
    'Tax & Accounting': 'bg-[#E8F5E9] text-[#2E7D32]',
}

// Map AI-suggested role to a known team member
const ROLE_TO_NAME: Record<string, string> = {
    'Insurance Advisor':           'James Hartwell',
    'Marine Technician':           'Marco Delgado',
    'Aviation Manager':            'Sarah Kimura',
    'Estate Attorney':             'Richard Calloway',
    'Tax & Structuring Attorney':  'Isabelle Fontaine',
}

function defaultDueDate(): string {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
}

export function CreateTaskModal({ onClose, onCreateTask }: CreateTaskModalProps) {
    const [step, setStep] = useState<Step>('input')
    const [inputText, setInputText] = useState('')
    const [apiError, setApiError] = useState<string | null>(null)

    // Editable form fields
    const [type, setType] = useState<TaskType>('Legal')
    const [title, setTitle] = useState('')
    const [priority, setPriority] = useState<TaskPriority>('Medium')
    const [assignee, setAssignee] = useState('')
    const [assigneeRole, setAssigneeRole] = useState('')
    const [recurring, setRecurring] = useState(false)
    const [recurrenceInterval, setRecurrenceInterval] = useState('')
    const [dueDate, setDueDate] = useState(defaultDueDate)
    const [description, setDescription] = useState('')

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const titleRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (step === 'input') setTimeout(() => textareaRef.current?.focus(), 50)
        if (step === 'form')  setTimeout(() => titleRef.current?.select(), 50)
    }, [step])

    const handleAnalyze = async () => {
        if (!inputText.trim()) return
        setStep('loading')
        setApiError(null)
        try {
            const a = await analyzeTaskInput(inputText.trim())
            setType(a.type)
            setTitle(a.title)
            setPriority(a.priority ?? 'Medium')
            setAssigneeRole(a.assigneeRole ?? '')
            setAssignee(ROLE_TO_NAME[a.assigneeRole ?? ''] ?? a.assigneeRole ?? '')
            setRecurring(a.recurring ?? false)
            setRecurrenceInterval(a.recurrenceInterval ?? '')
            setDescription(inputText.trim())
        } catch {
            setApiError('Analysis failed — fields pre-filled from keywords. Edit as needed.')
            setTitle(inputText.trim().slice(0, 80))
        }
        setStep('form')
    }

    const handleSubmit = () => {
        const newTask: Task = {
            id: `task-${Date.now()}`,
            title: title.trim() || 'Untitled task',
            type,
            assignee: assignee.trim() || 'Unassigned',
            assigneeRole: assigneeRole || undefined,
            dueDate,
            status: 'To Do',
            priority,
            recurring,
            recurrenceInterval: recurring && recurrenceInterval ? recurrenceInterval : undefined,
            description: description || title,
            createdAt: new Date().toISOString().slice(0, 10),
        }
        onCreateTask(newTask)
        onClose()
    }

    const modal = (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

            <div className="relative z-10 w-full max-w-[500px] bg-white rounded-[var(--radius-2xl)] shadow-[0_32px_100px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--color-neutral-3)]">
                    <div className="flex items-center gap-3">
                        <img src={fojoMascotSmall} className="w-8 h-8 rounded-full shrink-0" alt="Fojo" />
                        <div>
                            <div className="text-[15px] font-semibold text-[var(--color-black)] leading-5">
                                {step === 'input'   ? 'Create a task'    :
                                 step === 'loading' ? 'Analyzing…'       : 'Review & create'}
                            </div>
                            {step === 'form' && (
                                <div className="text-xs text-[var(--color-neutral-9)] mt-0.5">
                                    Fojo pre-filled these fields — edit as needed
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                    >
                        <IconX size={16} stroke={2} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto max-h-[70vh]">

                    {/* ── Step 1: natural language input ── */}
                    {step === 'input' && (
                        <div className="p-6 flex flex-col gap-4">
                            <p className="text-sm text-[var(--color-neutral-11)] leading-relaxed">
                                Describe the task in plain language. Fojo will detect the type,
                                suggest an assignee, and pre-fill the form for you.
                            </p>
                            <div className="flex flex-col gap-1.5">
                                <textarea
                                    ref={textareaRef}
                                    rows={4}
                                    placeholder="e.g. Renew the yacht insurance before it expires in February…"
                                    className="w-full resize-none rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] px-3 py-2.5 text-sm text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150 font-[inherit]"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            e.preventDefault()
                                            handleAnalyze()
                                        }
                                    }}
                                />
                                <span className="text-xs text-[var(--color-neutral-8)]">⌘↵ to analyze</span>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: loading spinner ── */}
                    {step === 'loading' && (
                        <div className="py-16 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 rounded-full border-[3px] border-[var(--color-accent-9)] border-t-transparent animate-spin" />
                            <div className="text-sm text-[var(--color-neutral-10)]">Analyzing your request…</div>
                        </div>
                    )}

                    {/* ── Step 3: editable preview form ── */}
                    {step === 'form' && (
                        <div className="p-6 flex flex-col gap-4">
                            {apiError && (
                                <div className="text-xs text-[#C05500] bg-[#FFF3E0] px-3 py-2 rounded-[var(--radius-md)]">
                                    {apiError}
                                </div>
                            )}

                            {/* Detected type */}
                            <div className="flex items-center gap-2">
                                <span className={cn('inline-flex items-center h-6 px-2.5 rounded-[var(--radius-sm)] text-xs font-semibold', TYPE_STYLES[type])}>
                                    {type}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-9)]">
                                    <IconSparkles size={12} stroke={2} />
                                    Detected by Fojo
                                </span>
                                {/* Allow manual override */}
                                <div className="ml-auto flex gap-1">
                                    {(['Insurance', 'Maintenance', 'Legal', 'Tax & Accounting'] as TaskType[]).filter(t => t !== type).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setType(t)}
                                            className="text-[11px] text-[var(--color-neutral-9)] hover:text-[var(--color-black)] underline underline-offset-2 transition-colors"
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-[var(--color-neutral-10)]">Title</label>
                                <input
                                    ref={titleRef}
                                    type="text"
                                    className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] text-sm text-[var(--color-black)] outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150 font-[inherit]"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Priority + Due Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-[var(--color-neutral-10)]">Priority</label>
                                    <select
                                        className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] text-sm text-[var(--color-black)] outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150 font-[inherit] cursor-pointer"
                                        value={priority}
                                        onChange={e => setPriority(e.target.value as TaskPriority)}
                                    >
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-[var(--color-neutral-10)]">Due Date</label>
                                    <input
                                        type="date"
                                        className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] text-sm text-[var(--color-black)] outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150 font-[inherit]"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Assignee */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-[var(--color-neutral-10)]">Assignee</label>
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] text-sm text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150 font-[inherit]"
                                    value={assignee}
                                    onChange={e => setAssignee(e.target.value)}
                                />
                                {assigneeRole && (
                                    <span className="text-xs text-[var(--color-neutral-9)]">{assigneeRole}</span>
                                )}
                            </div>

                            {/* Recurring toggle */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-[var(--color-neutral-10)]">Recurring</label>
                                    <button
                                        type="button"
                                        className={cn(
                                            'relative w-9 h-5 rounded-full transition-colors duration-200',
                                            recurring ? 'bg-[var(--color-accent-9)]' : 'bg-[var(--color-neutral-5)]'
                                        )}
                                        onClick={() => setRecurring(v => !v)}
                                        aria-label="Toggle recurring"
                                    >
                                        <span className={cn(
                                            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                                            recurring ? 'translate-x-[18px]' : 'translate-x-0.5'
                                        )} />
                                    </button>
                                </div>
                                {recurring && (
                                    <input
                                        type="text"
                                        placeholder="e.g. Every 12 months"
                                        className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] text-sm text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150 font-[inherit]"
                                        value={recurrenceInterval}
                                        onChange={e => setRecurrenceInterval(e.target.value)}
                                    />
                                )}
                            </div>

                            {/* Description (original text) */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-[var(--color-neutral-10)]">Description</label>
                                <textarea
                                    rows={3}
                                    className="resize-none rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] px-3 py-2 text-sm text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150 font-[inherit]"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Optional notes or instructions…"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 pt-3 border-t border-[var(--color-neutral-3)] flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="h-9 px-4 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] text-sm font-medium text-[var(--color-neutral-11)] bg-white hover:bg-[var(--color-neutral-2)] transition-colors"
                    >
                        Cancel
                    </button>

                    {step === 'input' && (
                        <button
                            disabled={!inputText.trim()}
                            onClick={handleAnalyze}
                            className="h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            <IconSparkles size={14} stroke={2} />
                            Analyze with Fojo
                        </button>
                    )}

                    {step === 'form' && (
                        <button
                            disabled={!title.trim()}
                            onClick={handleSubmit}
                            className="h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            <IconCheck size={14} stroke={2.5} />
                            Create task
                        </button>
                    )}
                </div>
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}
