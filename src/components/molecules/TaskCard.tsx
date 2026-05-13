import {
    IconShield,
    IconTools,
    IconGavel,
    IconReceipt,
    IconAnchor,
    IconPlane,
    IconPalette,
    IconBuildingSkyscraper,
    IconTrendingUp,
    IconBox,
    IconFlame,
    IconMinus,
    IconCheck,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { initialsFromName } from '@/data/thornton/tasks-data'
import type { Task, TaskPriority, TaskStatus, TaskType } from '@/data/thornton/tasks-data'

const TYPE_CHIP_NEUTRAL =
    'bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)] border border-[var(--color-gray-4)]'

/** Subtle type identity — used in Kanban; list view keeps neutral elsewhere */
const TYPE_CHIP_KANBAN: Record<TaskType, string> = {
    Insurance:
        'bg-[var(--color-green-1)] text-[var(--color-green-9)] border border-[var(--color-green-bright)]/35',
    Maintenance:
        'bg-[var(--color-orange-1)] text-[var(--color-orange-9)] border border-[var(--color-orange-hover)]',
    Legal: 'bg-[var(--color-blue-1)] text-[var(--color-accent-10)] border border-[var(--color-blue-3)]',
    'Tax & Accounting':
        'bg-[#F3E8FF] text-[#5B21B6] border border-[#DDD6FE]',
}

const PROGRESS_BAR: Record<TaskStatus, string> = {
    'To Do': 'bg-[#64748B]',
    'In Progress': 'bg-[var(--color-accent-9)]',
    Upcoming: 'bg-[#6366F1]',
    Done: 'bg-[var(--color-green-bright)]',
}

const STATUS_PILL: Record<
    TaskStatus,
    { wrap: string; label: string }
> = {
    'To Do': {
        wrap: 'bg-[var(--color-neutral-2)] text-[var(--color-neutral-11)] border border-[var(--color-gray-4)]',
        label: 'To do',
    },
    'In Progress': {
        wrap: 'bg-[var(--color-blue-1)] text-[var(--color-accent-10)] border border-[var(--color-blue-3)]',
        label: 'In progress',
    },
    Upcoming: {
        wrap: 'bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]',
        label: 'Upcoming',
    },
    Done: {
        wrap: 'bg-[var(--color-green-1)] text-[var(--color-green-9)] border border-[var(--color-green-bright)]/35',
        label: 'Done',
    },
}

const TYPE_ICONS: Record<TaskType, typeof IconShield> = {
    Insurance: IconShield,
    Maintenance: IconTools,
    Legal: IconGavel,
    'Tax & Accounting': IconReceipt,
}

const STATUS_PROGRESS: Record<TaskStatus, number> = {
    Upcoming: 15,
    'To Do': 38,
    'In Progress': 72,
    Done: 100,
}

function assetIcon(relatedAssetType?: string) {
    const t = (relatedAssetType ?? '').toLowerCase()
    if (t.includes('maritime') || t.includes('yacht')) return IconAnchor
    if (t.includes('aviation') || t.includes('air')) return IconPlane
    if (t.includes('art')) return IconPalette
    if (t.includes('real') || t.includes('estate') || t.includes('property')) return IconBuildingSkyscraper
    if (t.includes('invest')) return IconTrendingUp
    return IconBox
}

function assigneeNames(task: Task): string[] {
    if (task.assignees && task.assignees.length > 0) return task.assignees
    return [task.assignee]
}

export interface TaskCardProps {
    task: Task
    dueRelative: string
    urgencyClass: string
    onClick?: () => void
    /** Kanban: compact card; list variant keeps full detail */
    variant?: 'default' | 'kanban'
    /** Due date before today and not completed */
    isOverdue?: boolean
}

export function TaskCard({
    task,
    dueRelative,
    urgencyClass,
    onClick,
    variant = 'default',
    isOverdue = false,
}: TaskCardProps) {
    const TypeIcon = TYPE_ICONS[task.type]
    const AssetIcon = assetIcon(task.relatedAssetType)
    const names = assigneeNames(task)
    const kanban = variant === 'kanban'
    const desc = task.description?.trim()
    const subtitle =
        !desc ? undefined : kanban ? undefined : desc.length > 120 ? `${desc.slice(0, 117)}…` : desc
    const pct = STATUS_PROGRESS[task.status]
    const statusStyle = STATUS_PILL[task.status]
    const typeChipClass = kanban ? TYPE_CHIP_KANBAN[task.type] : TYPE_CHIP_NEUTRAL

    return (
        <article
            className={cn(
                'card flex flex-col text-left relative',
                kanban
                    ? 'gap-2 p-3 min-h-0 rounded-[var(--radius-md)] bg-[var(--color-white)] border border-[var(--color-gray-4)]'
                    : 'gap-3 p-[var(--spacing-4)] min-h-[180px]',
                urgencyClass,
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={
                onClick
                    ? e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onClick()
                        }
                    }
                    : undefined
            }
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h3
                        className={cn(
                            'font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] leading-snug m-0',
                            kanban ? 'text-[13px] line-clamp-2' : 'text-[15px] font-[var(--font-weight-bold)]',
                        )}
                    >
                        {task.title}
                    </h3>
                    {subtitle ? (
                        <p className="text-[12px] text-[var(--color-neutral-11)] leading-relaxed mt-1 m-0 line-clamp-3">
                            {subtitle}
                        </p>
                    ) : null}
                </div>
                {(kanban ? task.priority === 'High' : true) ? (
                    <PriorityBadge priority={task.priority} emphasis={kanban} />
                ) : null}
            </div>

            <div className={cn('flex flex-wrap items-center gap-1.5 min-w-0')}>
                <span
                    className={cn(
                        'inline-flex items-center rounded-[var(--radius-md)] font-[var(--font-weight-semibold)]',
                        kanban ? 'gap-0.5 px-1.5 py-0.5 text-[10px]' : 'gap-1 px-2 py-0.5 rounded-[var(--radius-2xl)] text-[11px] font-[var(--font-weight-bold)]',
                        typeChipClass,
                    )}
                >
                    <TypeIcon size={kanban ? 11 : 12} stroke={2} aria-hidden />
                    {task.type}
                </span>
                {task.relatedAsset ? (
                    <span className="inline-flex items-center gap-1 text-[var(--color-neutral-10)] min-w-0 flex-1">
                        <AssetIcon size={kanban ? 12 : 14} stroke={1.75} className="shrink-0 opacity-70" aria-hidden />
                        <span className={cn('truncate', kanban ? 'text-[11px]' : 'text-[12px] text-[var(--color-neutral-11)]')}>
                            {task.relatedAsset}
                        </span>
                    </span>
                ) : null}
            </div>

            {!kanban && task.relatedValue ? (
                <div className="text-[12px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)]">
                    {task.relatedValue}
                </div>
            ) : null}

            <div
                className={
                    kanban
                        ? 'flex items-center justify-between gap-2 pt-2 mt-0.5 border-t border-[var(--color-neutral-3)]'
                        : 'mt-auto flex flex-col gap-2 pt-1 border-t border-[var(--color-gray-4)]'
                }
            >
                {kanban ? (
                    <>
                        <span className="text-[11px] font-[var(--font-weight-medium)] tabular-nums shrink-0 text-[var(--color-neutral-11)]">
                            {dueRelative}
                        </span>
                        <div className="flex items-center gap-0.5 min-w-0 justify-end shrink-0">
                            {names.slice(0, 3).map((name, idx) => (
                                <span
                                    key={name}
                                    className={cn(
                                        'inline-flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-[var(--font-weight-semibold)] text-[var(--color-white)]',
                                        AVATAR_TINT[idx % AVATAR_TINT.length],
                                    )}
                                    title={name}
                                >
                                    {initialsFromName(name)}
                                </span>
                            ))}
                            {names.length > 3 ? (
                                <span className="text-[10px] text-[var(--color-neutral-10)] pl-0.5">+{names.length - 3}</span>
                            ) : null}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span
                                className={cn(
                                    'text-[13px] font-[var(--font-weight-semibold)] tabular-nums',
                                    isOverdue ? 'text-[var(--color-red-9)]' : 'text-[var(--color-gray-12)]',
                                )}
                            >
                                {dueRelative}
                            </span>
                            <span
                                className={cn(
                                    'inline-flex shrink-0 items-center gap-0.5 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-[var(--font-weight-bold)] uppercase tracking-[0.04em]',
                                    statusStyle.wrap,
                                )}
                            >
                                {task.status === 'Done' ? <IconCheck size={11} stroke={2.5} aria-hidden /> : null}
                                {statusStyle.label}
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[var(--color-neutral-4)] overflow-hidden">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-[width] duration-300',
                                    PROGRESS_BAR[task.status],
                                )}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                            {names.slice(0, 4).map((name, idx) => (
                                <span
                                    key={name}
                                    className={cn(
                                        'inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-[9px] font-[var(--font-weight-semibold)] text-[var(--color-white)] border border-[var(--color-white)]',
                                        AVATAR_TINT[idx % AVATAR_TINT.length],
                                    )}
                                    title={name}
                                >
                                    {initialsFromName(name)}
                                </span>
                            ))}
                            {names.length > 4 ? (
                                <span className="text-[11px] text-[var(--color-neutral-11)]">+{names.length - 4}</span>
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        </article>
    )
}

/** Rotating hues for stacked assignees (Kanban) */
const AVATAR_TINT = [
    'bg-[#475569]',
    'bg-[var(--color-accent-9)]',
    'bg-[#7C3AED]',
    'bg-[#0D9488]',
]

function PriorityBadge({ priority, emphasis }: { priority: TaskPriority; emphasis?: boolean }) {
    if (!emphasis) {
        return (
            <span className="inline-flex items-center gap-0.5 shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-3)] px-1.5 py-0.5 text-[11px] font-[var(--font-weight-semibold)] text-[var(--color-neutral-11)]">
                {priority === 'High' ? <IconFlame size={12} stroke={2} aria-hidden /> : null}
                {priority}
            </span>
        )
    }

    const cls =
        priority === 'High'
            ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
            : priority === 'Medium'
              ? 'border-[var(--color-orange-hover)] bg-[var(--color-orange-1)] text-[var(--color-orange-9)]'
              : 'border-[var(--color-gray-4)] bg-[var(--color-neutral-2)] text-[var(--color-neutral-11)]'

    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 shrink-0 rounded-[var(--radius-sm)] border px-1.5 py-0.5 text-[11px] font-[var(--font-weight-bold)]',
                cls,
            )}
        >
            {priority === 'High' ? <IconFlame size={12} stroke={2} aria-hidden /> : null}
            {priority}
        </span>
    )
}

export function TaskRecurringCell({ task }: { task: Task }) {
    if (task.recurring) {
        return (
            <span className="inline-flex items-center gap-1 min-w-0">
                <IconCheck size={14} stroke={2.5} className="shrink-0 text-[var(--color-neutral-10)]" aria-hidden />
                <span className="text-xs text-[var(--color-neutral-11)] truncate">
                    {task.recurrenceInterval?.replace('Every ', '') ?? ''}
                </span>
            </span>
        )
    }
    return <IconMinus size={14} stroke={2} className="text-[var(--color-neutral-8)]" aria-hidden />
}
