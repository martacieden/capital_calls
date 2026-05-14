import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
    IconChevronRight,
    IconChevronDown,
    IconShare,
    IconHistory,
    IconMessage,
    IconUpload,
    IconDots,
    IconFileText,
    IconX,
    IconPlus,
    IconSettings,
    IconExternalLink,
    IconShield,
    IconTool,
    IconScale,
    IconCalculator,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { mockTasks, taskFromCatalogItem, initialsFromName } from '@/data/thornton/tasks-data'
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/data/thornton/tasks-data'
import type { AnyCatalogItem } from '@/data/types'
import { DETAIL_REQUIRED_FIELD_LABELS, getItemFields } from '@/lib/helpers/item-detail-fields'

/* ── Badge/style maps ── */

const STATUS_STYLES: Record<TaskStatus, string> = {
    'To Do': 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)]',
    'In Progress': 'bg-[var(--color-blue-3)] text-[var(--color-accent-9)]',
    'Upcoming': 'bg-[#FFF3E0] text-[#C05500]',
    'Done': 'bg-[var(--color-green-3)] text-[var(--color-green-11)]',
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
    High: 'bg-[var(--color-red-3)] text-[var(--color-red-9)]',
    Medium: 'bg-[#FFF3E0] text-[#C05500]',
    Low: 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)]',
}

const TYPE_STYLES: Record<TaskType, string> = {
    Insurance: 'bg-[#EBF3FF] text-[#0560D0]',
    Maintenance: 'bg-[#FFF3E0] text-[#C05500]',
    Legal: 'bg-[#F3EEFF] text-[#6E3DD1]',
    'Tax & Accounting': 'bg-[#E8F5E9] text-[#2E7D32]',
}

const TYPE_ICONS: Record<TaskType, typeof IconShield> = {
    Insurance: IconShield,
    Maintenance: IconTool,
    Legal: IconScale,
    'Tax & Accounting': IconCalculator,
}

const AVATAR_COLORS = ['#bea887', '#6366f1', '#0891b2', '#059669', '#dc2626', '#9333ea', '#d97706']

function avatarColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}

function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Same KV visuals as Asset detail (read-only pills) ── */

const TASK_DETAIL_VALUE_PILL =
    'flex h-8 min-w-0 shrink items-center gap-2 px-3 rounded-[var(--radius-md)] bg-[var(--color-gray-2)] text-sm font-[var(--font-weight-regular)] text-[var(--color-gray-12)] whitespace-nowrap overflow-hidden text-ellipsis leading-8 transition-colors duration-150 hover:bg-[var(--color-accent-3)]'

function DetailKvRow({
    label,
    requiredStar,
    children,
}: {
    label: string
    requiredStar?: boolean
    children: React.ReactNode
}) {
    return (
        <div className="detail-page__kv-row flex items-center gap-1 h-8">
            <span className="shrink-0 w-32 text-sm font-[var(--font-weight-regular)] text-[var(--color-neutral-11)] whitespace-nowrap flex items-center gap-1 leading-5">
                {label}
                {requiredStar && <span className="text-[var(--color-red-9)] text-xs font-medium">*</span>}
            </span>
            <span className={TASK_DETAIL_VALUE_PILL}>{children}</span>
        </div>
    )
}

function CatalogFieldGrid({ fields }: { fields: { label: string; value: string | number }[] }) {
    const leftCol = fields.filter((_, i) => i % 2 === 0)
    const rightCol = fields.filter((_, i) => i % 2 === 1)
    return (
        <>
            {[leftCol, rightCol].map((col, ci) => (
                <div key={ci} className="flex-1 flex flex-col gap-1 min-w-0 overflow-hidden">
                    {col.map(f => (
                        <div key={f.label} className="detail-page__kv-row flex items-center gap-1 h-8">
                            <span className="shrink-0 w-32 text-sm font-[var(--font-weight-regular)] text-[var(--color-neutral-11)] whitespace-nowrap flex items-center gap-1 leading-5">
                                {f.label}
                                {DETAIL_REQUIRED_FIELD_LABELS.has(f.label) && (
                                    <span className="text-[var(--color-red-9)] text-xs font-medium">*</span>
                                )}
                            </span>
                            <span className="block h-8 px-3 rounded-[var(--radius-md)] bg-[var(--color-gray-2)] text-sm font-[var(--font-weight-regular)] text-[var(--color-gray-12)] whitespace-nowrap overflow-hidden text-ellipsis leading-8 min-w-0 transition-colors duration-150 hover:bg-[var(--color-accent-3)]">
                                {String(f.value)}
                            </span>
                        </div>
                    ))}
                </div>
            ))}
        </>
    )
}

/* ── Component ── */

interface TaskDetailPageProps {
    taskId: string
    /** Catalog row when the task was just created in Fojo (not in static mockTasks). */
    catalogFallback?: AnyCatalogItem | null
    /** Tasks created in-session (e.g. timeline assist) — same id as taskId. */
    externalTask?: Task | null
    /** Resolve catalog items for Related record snapshot — same fields as Asset detail. */
    getItemById?: (id: string) => AnyCatalogItem | null
    onBack: () => void
    onNavigateToAsset?: (assetId: string) => void
}

export function TaskDetailPage({
    taskId,
    catalogFallback,
    externalTask,
    getItemById,
    onBack,
    onNavigateToAsset,
}: TaskDetailPageProps) {
    const task = (() => {
        if (externalTask && externalTask.id === taskId) return externalTask
        const staticTask = mockTasks.find(t => t.id === taskId)
        if (staticTask) return staticTask
        if (catalogFallback?.id === taskId) return taskFromCatalogItem(catalogFallback) ?? undefined
        return undefined
    })()

    if (!task) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center gap-3 text-center px-6">
                <p className="text-sm text-[var(--color-neutral-9)]">Task not found.</p>
                <button className="text-sm font-[var(--font-weight-medium)] text-[var(--color-accent-9)] bg-transparent border-none cursor-pointer" onClick={onBack}>
                    Back to Tasks
                </button>
            </div>
        )
    }

    return <TaskDetailContent task={task} onBack={onBack} onNavigateToAsset={onNavigateToAsset} getItemById={getItemById} />
}

function TaskDetailContent({
    task,
    onBack,
    onNavigateToAsset,
    getItemById,
}: {
    task: Task
    onBack: () => void
    onNavigateToAsset?: (id: string) => void
    getItemById?: (id: string) => AnyCatalogItem | null
}) {
    const [editedDescription, setEditedDescription] = useState<string | null>(null)
    const [editingDescription, setEditingDescription] = useState(false)
    const [editedNotes, setEditedNotes] = useState<string | null>(null)
    const [editingNotes, setEditingNotes] = useState(false)
    const [addedFields, setAddedFields] = useState<{ label: string; value: string }[]>([])
    const [isAddingField, setIsAddingField] = useState(false)
    const [activeTab, setActiveTab] = useState('details')

    const addFieldBtnRef = useRef<HTMLButtonElement>(null)
    const detailsRef = useRef<HTMLDivElement>(null)
    const descriptionRef = useRef<HTMLDivElement>(null)
    const notesRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setEditedDescription(null)
        setEditedNotes(null)
        setAddedFields([])
        setIsAddingField(false)
        setActiveTab('details')
    }, [task.id])

    const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, tab: string) => {
        setActiveTab(tab)
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const TypeIcon = TYPE_ICONS[task.type]
    const initials = initialsFromName(task.assignee)
    const bgColor = avatarColor(task.assignee)

    const relatedCatalogItem = useMemo(() => {
        if (!task.relatedAssetId || !getItemById) return null
        return getItemById(task.relatedAssetId)
    }, [task.relatedAssetId, getItemById])

    const catalogSnapshotFields = useMemo(() => {
        if (!relatedCatalogItem) return []
        return getItemFields(relatedCatalogItem)
    }, [relatedCatalogItem])

    const showCatalogSnapshot = catalogSnapshotFields.length > 0

    /* ── Type-specific fields ── */
    const typeFields: { label: string; value: string }[] = []
    if (task.type === 'Insurance') {
        if (task.insurer) typeFields.push({ label: 'Insurer', value: task.insurer })
        if (task.policyNumber) typeFields.push({ label: 'Policy Number', value: task.policyNumber })
        if (task.currentPremium) typeFields.push({ label: 'Current Premium', value: task.currentPremium })
        if (task.coverageAmount) typeFields.push({ label: 'Coverage Amount', value: task.coverageAmount })
    } else if (task.type === 'Maintenance') {
        if (task.serviceProvider) typeFields.push({ label: 'Service Provider', value: task.serviceProvider })
        if (task.estimatedCost) typeFields.push({ label: 'Estimated Cost', value: task.estimatedCost })
        if (task.location) typeFields.push({ label: 'Location', value: task.location })
        if (task.lastCompleted) typeFields.push({ label: 'Last Completed', value: formatDate(task.lastCompleted) })
    } else if (task.type === 'Legal') {
        if (task.lawFirm) typeFields.push({ label: 'Law Firm', value: task.lawFirm })
        if (task.contactEmail) typeFields.push({ label: 'Contact Email', value: task.contactEmail })
        if (task.contactPhone) typeFields.push({ label: 'Contact Phone', value: task.contactPhone })
        if (task.relatedTrust) typeFields.push({ label: 'Related Trust', value: task.relatedTrust })
        if (task.estimatedLegalFee) typeFields.push({ label: 'Estimated Fee', value: task.estimatedLegalFee })
    }

    const leftTypeFields = typeFields.filter((_, i) => i % 2 === 0)
    const rightTypeFields = typeFields.filter((_, i) => i % 2 === 1)

    return (
        <div className="flex flex-col flex-1 w-full max-w-[1120px] px-[var(--spacing-6)] pt-[24px] pb-[var(--spacing-5)] mx-auto animate-[chat-area-in_0.25s_ease-out_both]">

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4 pt-3 pb-5 overflow-hidden">
                <div className="flex items-center gap-2 font-display text-[28px] font-black leading-[1.25] tracking-[-0.02em] [-webkit-text-stroke:0.3px_currentColor] min-w-0">
                    <button
                        className="text-[var(--color-neutral-9)] bg-none border-none font-[inherit] font-black cursor-pointer transition-colors duration-150 p-0 hover:text-[var(--color-gray-12)]"
                        onClick={onBack}
                    >
                        Tasks
                    </button>
                    <IconChevronRight size={18} stroke={2} className="text-[var(--color-neutral-9)] shrink-0" />
                    <span className="text-[var(--color-gray-12)] overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{task.title}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center pr-1">
                        <div
                            className="w-8 h-8 rounded-full border-2 border-[var(--color-white)] flex items-center justify-center text-[11px] font-[var(--font-weight-semibold)] text-white shrink-0"
                            style={{ background: bgColor }}
                        >
                            {initials}
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-white)] flex items-center justify-center -ml-2 text-xs font-[var(--font-weight-medium)] shrink-0 bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)]">
                            +2
                        </div>
                    </div>
                    <div className="w-0.5 h-3 bg-[var(--color-gray-4)] shrink-0" />
                    <div className="flex items-center gap-1.5">
                        <button className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-[var(--color-white)] text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-neutral-3)]">
                            <IconShare size={18} stroke={1.75} />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-[var(--color-white)] text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-neutral-3)]">
                            <IconHistory size={18} stroke={1.75} />
                        </button>
                        <button className="detail-page__icon-btn--notif flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-[var(--color-white)] text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-neutral-3)]">
                            <IconMessage size={18} stroke={1.75} />
                            <span className="detail-page__notif-dot" />
                        </button>
                    </div>
                    <button className="flex items-center gap-1 h-8 pl-4 pr-3 py-0.5 bg-[var(--color-accent-9)] text-white border border-[var(--color-accent-9)] rounded-[var(--radius-md)] text-sm font-medium leading-5 cursor-pointer transition-opacity duration-150 hover:opacity-90">
                        Actions
                        <IconChevronDown size={16} stroke={2} />
                    </button>
                </div>
            </div>

            {/* ── Sticky tab bar (shrink-0 + padding reserves space for shadow so nothing clips at scroll edges) ── */}
            <div className="sticky top-0 z-10 shrink-0 overflow-visible bg-[var(--color-white)] pb-4 -mt-[var(--spacing-2)] pt-[var(--spacing-2)]">
                <div className="flex min-h-[44px] items-center justify-between px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-xl)] bg-[var(--color-white)] shadow-[var(--shadow-toolbar)]">
                    <div className="flex items-center gap-0.5">
                        {[
                            { key: 'details', label: 'Details', ref: detailsRef },
                            { key: 'description', label: 'Description', ref: descriptionRef },
                            { key: 'notes', label: 'Notes', ref: notesRef },
                            { key: 'attachments', label: 'Attachments', ref: attachmentsRef },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={cn(
                                    'h-7 px-2 py-0.5 border-none rounded-[var(--radius-md)] bg-transparent text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] cursor-pointer transition-colors duration-150 whitespace-nowrap leading-5 hover:bg-[var(--color-neutral-3)]',
                                    activeTab === tab.key && 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)] hover:bg-[var(--color-accent-3)]'
                                )}
                                onClick={() => scrollTo(tab.ref, tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center justify-center w-7 h-7 border-none rounded-[var(--radius-md)] bg-transparent text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-neutral-3)]">
                        <IconSettings size={16} stroke={1.75} />
                    </button>
                </div>
            </div>

            {/* ── Sections ── */}
            <div className="flex flex-col gap-10">

                {/* Details */}
                <div className="flex flex-col gap-3 mt-8" ref={detailsRef}>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-base font-medium text-[var(--color-gray-12)] tracking-[-0.016px] leading-6 m-0">
                            Details
                        </h3>
                        <div className="flex gap-4 rounded-[var(--radius-xl)]">
                            <div className="flex-1 flex flex-col gap-1 min-w-0 overflow-hidden">
                                <DetailKvRow label="Category">
                                    <span className={cn('inline-flex shrink-0 items-center gap-1 h-5 px-2 rounded-[var(--radius-sm)] text-xs font-[var(--font-weight-medium)]', TYPE_STYLES[task.type])}>
                                        <TypeIcon size={12} stroke={2} />
                                        {task.type}
                                    </span>
                                </DetailKvRow>
                                {task.relatedAsset && !showCatalogSnapshot && (
                                    <DetailKvRow label="Related asset">
                                        {task.relatedAssetId ? (
                                            <button
                                                type="button"
                                                className="flex min-w-0 max-w-full items-center gap-1.5 truncate border-none bg-transparent p-0 text-left text-sm font-[var(--font-weight-regular)] text-[var(--color-accent-9)] cursor-pointer hover:underline"
                                                onClick={() => onNavigateToAsset?.(task.relatedAssetId!)}
                                            >
                                                <span className="truncate">{task.relatedAsset}</span>
                                                <IconExternalLink size={13} stroke={1.75} className="shrink-0" />
                                            </button>
                                        ) : (
                                            task.relatedAsset
                                        )}
                                    </DetailKvRow>
                                )}
                                <DetailKvRow label="Assignee">
                                    <span className="flex min-w-0 max-w-full items-center gap-2 overflow-hidden">
                                        <span className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-[var(--font-weight-semibold)] text-white" style={{ background: bgColor }}>
                                            {initials}
                                        </span>
                                        <span className="truncate">{task.assignee}</span>
                                    </span>
                                </DetailKvRow>
                                <DetailKvRow label="Due Date">{formatDate(task.dueDate)}</DetailKvRow>
                                <DetailKvRow label="Status">
                                    <span className={cn('inline-flex items-center h-5 px-2 rounded-[var(--radius-sm)] text-xs font-[var(--font-weight-medium)]', STATUS_STYLES[task.status])}>
                                        {task.status}
                                    </span>
                                </DetailKvRow>
                                {task.recurring && task.recurrenceInterval && (
                                    <DetailKvRow label="Recurrence">{task.recurrenceInterval}</DetailKvRow>
                                )}
                                {addedFields.filter((_, i) => i % 2 === 0).map(f => (
                                    <DetailKvRow key={f.label} label={f.label}>{f.value}</DetailKvRow>
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-1 min-w-0 overflow-hidden">
                                {task.relatedAssetType && !showCatalogSnapshot && (
                                    <DetailKvRow label="Asset Type">{task.relatedAssetType}</DetailKvRow>
                                )}
                                {task.assigneeRole && (
                                    <DetailKvRow label="Role">{task.assigneeRole}</DetailKvRow>
                                )}
                                <DetailKvRow label="Priority">
                                    <span className={cn('inline-flex items-center h-5 px-2 rounded-[var(--radius-sm)] text-xs font-[var(--font-weight-medium)]', PRIORITY_STYLES[task.priority])}>
                                        {task.priority}
                                    </span>
                                </DetailKvRow>
                                <DetailKvRow label="Recurring">{task.recurring ? 'Yes' : 'No'}</DetailKvRow>
                                {task.recurring && task.nextOccurrence && (
                                    <DetailKvRow label="Next Occurrence">{formatDate(task.nextOccurrence)}</DetailKvRow>
                                )}
                                <DetailKvRow label="Created">{formatDate(task.createdAt)}</DetailKvRow>
                                {addedFields.filter((_, i) => i % 2 === 1).map(f => (
                                    <DetailKvRow key={f.label} label={f.label}>{f.value}</DetailKvRow>
                                ))}
                            </div>
                        </div>

                        {showCatalogSnapshot && relatedCatalogItem && task.relatedAssetId && (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <h4 className="text-sm font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] tracking-[-0.01em] leading-6 m-0">
                                        Related record
                                    </h4>
                                    <button
                                        type="button"
                                        className="border-none bg-transparent p-0 text-sm font-[var(--font-weight-medium)] text-[var(--color-accent-9)] cursor-pointer underline-offset-2 hover:underline"
                                        onClick={() => onNavigateToAsset?.(task.relatedAssetId!)}
                                    >
                                        Open full record
                                    </button>
                                </div>
                                <div className="flex gap-4 rounded-[var(--radius-xl)]">
                                    <CatalogFieldGrid fields={catalogSnapshotFields} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            ref={addFieldBtnRef}
                            className="flex items-center gap-1 h-8 px-3 py-1.5 border-none rounded-[var(--radius-md)] bg-[var(--color-accent-3)] text-sm font-medium text-[var(--color-accent-9)] cursor-pointer transition-colors duration-150 leading-5 hover:bg-[var(--color-blue-hover)]"
                            onClick={() => setIsAddingField(true)}
                        >
                            <IconPlus size={16} stroke={2} />
                            Add detail
                        </button>
                    </div>

                    {isAddingField && (
                        <AddFieldPopover
                            anchorRef={addFieldBtnRef}
                            onAdd={(label, value) => {
                                setAddedFields(prev => [...prev, { label, value }])
                                setIsAddingField(false)
                            }}
                            onClose={() => setIsAddingField(false)}
                        />
                    )}
                </div>

                {/* Type-specific Details */}
                {typeFields.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-base font-medium text-[var(--color-gray-12)] tracking-[-0.016px] leading-6 m-0">
                            {task.type} Details
                        </h3>
                        <div className="flex gap-4 p-4 rounded-[var(--radius-xl)] bg-[var(--color-gray-2)] border border-[var(--color-gray-4)]">
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                {leftTypeFields.map(f => (
                                    <div key={f.label} className="flex items-center gap-1 h-8">
                                        <span className="shrink-0 w-36 text-sm text-[var(--color-neutral-11)] leading-5">{f.label}</span>
                                        <span className="h-8 px-3 rounded-[var(--radius-md)] bg-[var(--color-white)] border border-[var(--color-gray-4)] text-sm text-[var(--color-gray-12)] whitespace-nowrap overflow-hidden text-ellipsis leading-8 min-w-0">
                                            {f.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                {rightTypeFields.map(f => (
                                    <div key={f.label} className="flex items-center gap-1 h-8">
                                        <span className="shrink-0 w-36 text-sm text-[var(--color-neutral-11)] leading-5">{f.label}</span>
                                        <span className="h-8 px-3 rounded-[var(--radius-md)] bg-[var(--color-white)] border border-[var(--color-gray-4)] text-sm text-[var(--color-gray-12)] whitespace-nowrap overflow-hidden text-ellipsis leading-8 min-w-0">
                                            {f.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="flex flex-col gap-3" ref={descriptionRef}>
                    <h3 className="text-base font-medium text-[var(--color-gray-12)] tracking-[-0.016px] leading-6 m-0">Description</h3>
                    {editingDescription ? (
                        <textarea
                            className="block w-full py-4 pl-4 pr-6 rounded-[var(--radius-xl)] border border-[var(--color-accent-9)] bg-[var(--color-white)] text-sm font-normal text-[var(--color-gray-12)] leading-[22px] outline-none font-[inherit] resize-none min-h-[100px] max-h-[300px] overflow-y-auto"
                            defaultValue={editedDescription ?? task.description ?? ''}
                            autoFocus
                            onInput={e => {
                                const t = e.target as HTMLTextAreaElement
                                t.style.height = 'auto'
                                t.style.height = t.scrollHeight + 'px'
                            }}
                            onBlur={e => {
                                setEditingDescription(false)
                                setEditedDescription(e.target.value || null)
                            }}
                        />
                    ) : (editedDescription ?? task.description) ? (
                        <div className="detail-page__description" onClick={() => setEditingDescription(true)}>
                            {(editedDescription ?? task.description ?? '').split('\n').map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                    ) : (
                        <div className="detail-page__description detail-page__description--empty" onClick={() => setEditingDescription(true)}>
                            No description yet.
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-3" ref={notesRef}>
                    <h3 className="text-base font-medium text-[var(--color-gray-12)] tracking-[-0.016px] leading-6 m-0">Notes</h3>
                    {editingNotes ? (
                        <textarea
                            className="block w-full py-4 pl-4 pr-6 rounded-[var(--radius-xl)] border border-[var(--color-accent-9)] bg-[var(--color-white)] text-sm font-normal text-[var(--color-gray-12)] leading-[22px] outline-none font-[inherit] resize-none min-h-[80px] max-h-[200px] overflow-y-auto"
                            defaultValue={editedNotes ?? task.notes ?? ''}
                            autoFocus
                            onInput={e => {
                                const t = e.target as HTMLTextAreaElement
                                t.style.height = 'auto'
                                t.style.height = t.scrollHeight + 'px'
                            }}
                            onBlur={e => {
                                setEditingNotes(false)
                                setEditedNotes(e.target.value || null)
                            }}
                        />
                    ) : (editedNotes ?? task.notes) ? (
                        <div className="detail-page__description" onClick={() => setEditingNotes(true)}>
                            {(editedNotes ?? task.notes ?? '').split('\n').map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                    ) : (
                        <div className="detail-page__description detail-page__description--empty" onClick={() => setEditingNotes(true)}>
                            No notes yet.
                        </div>
                    )}
                </div>

                {/* Attachments */}
                <div className="flex flex-col gap-3" ref={attachmentsRef}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-medium text-[var(--color-gray-12)] tracking-[-0.016px] leading-6 m-0">Attachments</h3>
                            <span className="flex items-center justify-center min-w-6 h-6 px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] text-xs font-[var(--font-weight-medium)] text-[var(--color-gray-12)] leading-5">0</span>
                            <button className="flex items-center justify-center w-7 h-7 border-none rounded-[var(--radius-md)] bg-transparent text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-neutral-3)]">
                                <IconDots size={16} stroke={1.75} />
                            </button>
                        </div>
                        <button className="flex items-center gap-1 h-8 px-3 py-1.5 border-none rounded-[var(--radius-md)] bg-[var(--color-accent-3)] text-sm font-medium text-[var(--color-accent-9)] cursor-pointer transition-colors duration-150 leading-5 hover:bg-[var(--color-blue-hover)]">
                            <IconUpload size={16} stroke={1.75} />
                            Upload
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-[var(--spacing-2)] min-h-[140px] px-6 py-8 rounded-[var(--radius-xl)] bg-[var(--color-gray-2)] text-sm text-[var(--color-neutral-9)] leading-5 text-center">
                        <IconFileText size={24} stroke={1.5} className="text-[var(--color-neutral-9)]" />
                        No documents attached yet. Upload files to link them to this task.
                    </div>
                </div>

            </div>
        </div>
    )
}

/* ── Add Detail Popover ── */

function AddFieldPopover({
    anchorRef,
    onAdd,
    onClose,
}: {
    anchorRef: React.RefObject<HTMLButtonElement | null>
    onAdd: (label: string, value: string) => void
    onClose: () => void
}) {
    const [label, setLabel] = useState('')
    const [value, setValue] = useState('')
    const popoverRef = useRef<HTMLDivElement>(null)
    const labelRef = useRef<HTMLInputElement>(null)
    const valueRef = useRef<HTMLInputElement>(null)

    useClickOutside([popoverRef, anchorRef], onClose, true)

    useEffect(() => { setTimeout(() => labelRef.current?.focus(), 80) }, [])
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', h)
        return () => document.removeEventListener('keydown', h)
    }, [onClose])

    const handleSubmit = () => {
        if (!label.trim()) return
        onAdd(label.trim(), value.trim())
    }

    const rect = anchorRef.current?.getBoundingClientRect()
    const style: React.CSSProperties = rect
        ? { position: 'fixed', top: rect.bottom + 8, left: rect.left, zIndex: 11000 }
        : { position: 'fixed', top: 200, left: 200, zIndex: 11000 }

    return createPortal(
        <div
            ref={popoverRef}
            className="fixed w-[340px] bg-white border border-[var(--color-gray-4)] rounded-[var(--radius-2xl)] shadow-[0_24px_80px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] animate-[notif-dropdown-in_0.22s_cubic-bezier(0.16,1,0.3,1)] origin-top-left p-[var(--spacing-5)] flex flex-col gap-[var(--spacing-5)]"
            style={style}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] leading-[1.4]">Add new detail</span>
                    <span className="text-sm text-[var(--color-neutral-11)] leading-[1.5]">Create a custom detail for this task.</span>
                </div>
                <button type="button" className="shrink-0 p-[5px] rounded-[var(--radius-md)] text-[var(--color-neutral-9)] transition-colors duration-100 hover:bg-[var(--color-neutral-3)]" onClick={onClose}>
                    <IconX size={16} stroke={2} />
                </button>
            </div>
            <div className="flex flex-col gap-[var(--spacing-3)]">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-[var(--font-weight-medium)] text-[var(--color-neutral-11)]">Name</label>
                    <input
                        ref={labelRef}
                        type="text"
                        className="w-full px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-md)] font-sans text-sm text-[var(--color-gray-12)] bg-white outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-accent-9)] focus:shadow-[0_0_0_3px_rgba(0,91,226,0.15)] placeholder:text-[var(--color-neutral-11)]"
                        placeholder="e.g. Case number"
                        value={label}
                        onChange={e => setLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && label.trim()) valueRef.current?.focus() }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-[var(--font-weight-medium)] text-[var(--color-neutral-11)]">Value</label>
                    <input
                        ref={valueRef}
                        type="text"
                        className="w-full px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-md)] font-sans text-sm text-[var(--color-gray-12)] bg-white outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-accent-9)] focus:shadow-[0_0_0_3px_rgba(0,91,226,0.15)] placeholder:text-[var(--color-neutral-11)]"
                        placeholder="Optional"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    className="flex items-center justify-center gap-[var(--spacing-1)] rounded-[var(--radius-md)] border border-[var(--color-accent-9)] bg-[var(--color-accent-9)] min-h-[32px] px-3.5 py-[4px] text-[13px] font-[var(--font-weight-semibold)] leading-[1.43] text-[var(--color-accent-contrast)] transition-opacity duration-150 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={!label.trim()}
                    onClick={handleSubmit}
                >
                    Add
                </button>
            </div>
        </div>,
        document.body
    )
}
