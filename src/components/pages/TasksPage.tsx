import { Fragment, useCallback, useMemo, useState } from 'react'
import {
    IconChevronDown,
    IconChevronUp,
    IconCheckbox,
    IconPlus,
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
    IconCircleCheck,
    IconMessage,
    IconUserShare,
    IconPaperclip,
} from '@tabler/icons-react'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { CreateTaskModal } from '@/components/molecules/CreateTaskModal'
import { TaskCard, TaskRecurringCell } from '@/components/molecules/TaskCard'
import { CatalogToolbar } from '@/components/organisms/CatalogToolbar'
import type { DropdownItem, QuickFilterItem } from '@/components/organisms/CatalogToolbar'
import { showToast } from '@/components/atoms/Toast'
import { mockTasks, initialsFromName } from '@/data/thornton/tasks-data'
import type { Task, TaskStatus, TaskType } from '@/data/thornton/tasks-data'
import type { CatalogView, QuickFilterKey } from '@/data/types'
import { cn } from '@/lib/utils'

/* ── Toolbar / badges ── */

const TASK_TYPE_DROPDOWN: DropdownItem[] = [
    { key: 'Insurance', label: 'Insurance', icon: 'IconShield' },
    { key: 'Maintenance', label: 'Maintenance', icon: 'IconTools' },
    { key: 'Legal', label: 'Legal', icon: 'IconGavel' },
    { key: 'Tax & Accounting', label: 'Tax & Accounting', icon: 'IconReceipt' },
]

const TYPE_CHIP_CLASS =
    'bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)] border border-[var(--color-gray-4)]'

const STATUS_CHIP_CLASS = 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)] border border-[var(--color-gray-4)]'

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

type SortKey =
    | 'title'
    | 'type'
    | 'relatedAsset'
    | 'relatedValue'
    | 'assignee'
    | 'dueDate'
    | 'status'
    | 'priority'
    | 'recurring'
type SortDir = 'asc' | 'desc'

type GroupBy = 'none' | 'asset' | 'type' | 'assignee'

const STATUS_ORDER: Record<TaskStatus, number> = {
    'In Progress': 0,
    'To Do': 1,
    Upcoming: 2,
    Done: 3,
}
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

/** Kanban columns left → right */
const KANBAN_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Upcoming', 'Done']

const KANBAN_COLUMN_THEME: Record<
    TaskStatus,
    {
        dotClass: string
        caption: string
    }
> = {
    'To Do': {
        dotClass: 'bg-[var(--color-neutral-8)]',
        caption: 'Not started',
    },
    'In Progress': {
        dotClass: 'bg-[var(--color-accent-9)]',
        caption: 'Active work',
    },
    Upcoming: {
        dotClass: 'bg-[#6366F1]',
        caption: 'Scheduled',
    },
    Done: {
        dotClass: 'bg-[var(--color-green-bright)]',
        caption: 'Completed',
    },
}

function mergeTasks(external: Task[] | undefined, local: Task[]): Task[] {
    const map = new Map<string, Task>()
    for (const t of external ?? []) map.set(t.id, t)
    for (const t of local) map.set(t.id, t)
    return [...map.values()]
}

function startOfDay(d: Date): Date {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
}

/** Whole days until due (negative = overdue). */
function dueDaysFromToday(isoDate: string): number {
    const due = startOfDay(new Date(`${isoDate}T12:00:00`))
    const today = startOfDay(new Date())
    return Math.round((due.getTime() - today.getTime()) / 86400000)
}

function dueRelativeLabel(iso: string, status: TaskStatus): string {
    if (status === 'Done') return 'Done'
    const days = dueDaysFromToday(iso)
    if (days < 0) return `${Math.abs(days)}d overdue`
    if (days === 0) return 'Today'
    if (days === 1) return 'in 1 day'
    return `in ${days} days`
}

function taskIsOverdue(task: Task): boolean {
    if (task.status === 'Done') return false
    return dueDaysFromToday(task.dueDate) < 0
}

function taskSubtitle(task: Task): string | undefined {
    const d = task.description?.trim()
    if (!d) return undefined
    if (d.length <= 96) return d
    return `${d.slice(0, 93)}…`
}

function assigneeNames(task: Task): string[] {
    if (task.assignees && task.assignees.length > 0) return task.assignees
    return [task.assignee]
}

function assetIconComponent(relatedAssetType?: string) {
    const t = (relatedAssetType ?? '').toLowerCase()
    if (t.includes('maritime') || t.includes('yacht')) return IconAnchor
    if (t.includes('aviation') || t.includes('air')) return IconPlane
    if (t.includes('art')) return IconPalette
    if (t.includes('real') || t.includes('estate') || t.includes('property')) return IconBuildingSkyscraper
    if (t.includes('invest')) return IconTrendingUp
    return IconBox
}

function sortTasks(tasks: Task[], key: SortKey, dir: SortDir): Task[] {
    return [...tasks].sort((a, b) => {
        let cmp = 0
        switch (key) {
            case 'title':
                cmp = a.title.localeCompare(b.title)
                break
            case 'type':
                cmp = a.type.localeCompare(b.type)
                break
            case 'relatedAsset':
                cmp = (a.relatedAsset ?? '').localeCompare(b.relatedAsset ?? '')
                break
            case 'relatedValue':
                cmp = (a.relatedValue ?? '').localeCompare(b.relatedValue ?? '')
                break
            case 'assignee':
                cmp = assigneeNames(a)[0]!.localeCompare(assigneeNames(b)[0]!)
                break
            case 'dueDate':
                cmp = a.dueDate.localeCompare(b.dueDate)
                break
            case 'status':
                cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
                break
            case 'priority':
                cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
                break
            case 'recurring':
                cmp = Number(b.recurring) - Number(a.recurring)
                break
        }
        return dir === 'asc' ? cmp : -cmp
    })
}

function matchesQuickFilter(task: Task, key: QuickFilterKey): boolean {
    if (task.status === 'Done') {
        if (key === 'task-high-priority') return task.priority === 'High'
        return false
    }
    const days = dueDaysFromToday(task.dueDate)
    if (key === 'task-overdue') return days < 0
    if (key === 'task-due-soon') return days >= 0 && days < 7
    if (key === 'task-high-priority') return task.priority === 'High'
    return false
}

function groupKey(task: Task, groupBy: GroupBy): string {
    if (groupBy === 'asset') return task.relatedAsset ?? 'No asset'
    if (groupBy === 'type') return task.type
    return assigneeNames(task)[0] ?? 'Unassigned'
}

function bucketPreserveOrder(tasks: Task[], groupBy: GroupBy): { label: string; tasks: Task[] }[] {
    if (groupBy === 'none') return [{ label: '', tasks }]
    const order: string[] = []
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
        const k = groupKey(t, groupBy)
        if (!map.has(k)) {
            order.push(k)
            map.set(k, [])
        }
        map.get(k)!.push(t)
    }
    return order.map(label => ({ label, tasks: map.get(label)! }))
}

function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Column header ── */

function ColHeader({
    label,
    col,
    sortKey,
    sortDir,
    onSort,
}: {
    label: string
    col: SortKey
    sortKey: SortKey
    sortDir: SortDir
    onSort: (k: SortKey) => void
}) {
    const active = sortKey === col
    return (
        <button
            type="button"
            className="group flex items-center gap-0.5 text-[13px] font-[var(--font-weight-medium)] text-[var(--color-neutral-10)] leading-5 cursor-pointer select-none bg-transparent border-none p-0 transition-colors duration-150 hover:text-[var(--color-gray-12)]"
            onClick={() => onSort(col)}
        >
            {label}
            {active ? (
                sortDir === 'asc' ? (
                    <IconChevronUp size={13} stroke={2} className="text-[var(--color-accent-9)]" />
                ) : (
                    <IconChevronDown size={13} stroke={2} className="text-[var(--color-accent-9)]" />
                )
            ) : (
                <IconChevronDown size={13} stroke={2} className="opacity-0 group-hover:opacity-30 transition-opacity" />
            )}
        </button>
    )
}

/* ── Page ── */

interface TasksPageProps {
    onTaskClick?: (taskId: string) => void
    externalTasks?: Task[]
}

export function TasksPage({ onTaskClick, externalTasks }: TasksPageProps) {
    const [localTasks, setLocalTasks] = useState<Task[]>(mockTasks)
    const mergedTasks = useMemo(() => mergeTasks(externalTasks, localTasks), [externalTasks, localTasks])

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTaskTypes, setActiveTaskTypes] = useState<string[]>([])
    const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilterKey>>(new Set())
    const [activeView, setActiveView] = useState<CatalogView>('kanban')
    const [groupBy, setGroupBy] = useState<GroupBy>('none')
    const [sortKey, setSortKey] = useState<SortKey>('dueDate')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    const toggleQuickFilter = useCallback((key: QuickFilterKey) => {
        setActiveQuickFilters(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }, [])

    const handleCreateTask = (task: Task) => {
        setLocalTasks(prev => [task, ...prev])
        showToast(`Task "${task.title}" created`, 'success')
    }

    const patchTask = useCallback(
        (id: string, patch: Partial<Task>) => {
            setLocalTasks(prev => {
                const idx = prev.findIndex(t => t.id === id)
                if (idx >= 0) {
                    const copy = [...prev]
                    copy[idx] = { ...copy[idx], ...patch }
                    return copy
                }
                const ext = externalTasks?.find(t => t.id === id)
                if (ext) return [{ ...ext, ...patch }, ...prev]
                return prev
            })
        },
        [externalTasks]
    )

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
        else {
            setSortKey(key)
            setSortDir('asc')
        }
    }

    const baseFiltered = useMemo(() => {
        let result = [...mergedTasks]
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            result = result.filter(
                t =>
                    t.title.toLowerCase().includes(q) ||
                    t.type.toLowerCase().includes(q) ||
                    t.assignee.toLowerCase().includes(q) ||
                    assigneeNames(t).some(n => n.toLowerCase().includes(q)) ||
                    (t.relatedAsset && t.relatedAsset.toLowerCase().includes(q)) ||
                    (t.relatedValue && t.relatedValue.toLowerCase().includes(q))
            )
        }
        if (activeTaskTypes.length > 0) result = result.filter(t => activeTaskTypes.includes(t.type))
        return result
    }, [mergedTasks, searchQuery, activeTaskTypes])

    const quickCounts = useMemo(() => {
        let overdue = 0
        let dueSoon = 0
        let high = 0
        for (const t of baseFiltered) {
            if (t.priority === 'High') high++
            if (t.status === 'Done') continue
            const days = dueDaysFromToday(t.dueDate)
            if (days < 0) overdue++
            else if (days < 7) dueSoon++
        }
        return { overdue, dueSoon, high }
    }, [baseFiltered])

    const taskQuickFilters: QuickFilterItem[] = useMemo(
        () => [
            { key: 'task-overdue', label: 'Overdue', count: quickCounts.overdue, isAlert: true },
            { key: 'task-due-soon', label: 'Due < 7 days', count: quickCounts.dueSoon, isAlert: true },
            { key: 'task-high-priority', label: 'High priority', count: quickCounts.high },
        ],
        [quickCounts]
    )

    const filteredTasks = useMemo(() => {
        let result = [...baseFiltered]
        for (const key of activeQuickFilters) {
            result = result.filter(t => matchesQuickFilter(t, key))
        }
        return sortTasks(result, sortKey, sortDir)
    }, [baseFiltered, activeQuickFilters, sortKey, sortDir])

    const grouped = useMemo(() => bucketPreserveOrder(filteredTasks, groupBy), [filteredTasks, groupBy])

    const kanbanByStatus = useMemo(() => {
        const buckets: Record<TaskStatus, Task[]> = {
            'To Do': [],
            'In Progress': [],
            Upcoming: [],
            Done: [],
        }
        for (const t of filteredTasks) {
            buckets[t.status].push(t)
        }
        return buckets
    }, [filteredTasks])

    const colSpan = 10

    const colProps = { sortKey, sortDir, onSort: handleSort }

    return (
        <div className="flex flex-col flex-1 gap-[var(--spacing-5)] min-h-0 pt-9 px-[var(--spacing-6)] pb-[var(--spacing-5)] max-w-[1120px] w-full mx-auto">
            <ContentHeader
                title="Tasks"
                itemCount={mergedTasks.length}
                actionLabel="Add task"
                actionIcon={IconPlus}
                onActionClick={() => setIsCreateModalOpen(true)}
            />

            {isCreateModalOpen && (
                <CreateTaskModal onClose={() => setIsCreateModalOpen(false)} onCreateTask={handleCreateTask} />
            )}

            <div className="sticky top-[calc(-1*var(--spacing-4))] z-10 bg-[var(--color-white)] pt-[var(--spacing-4)] -mt-[var(--spacing-5)] pb-[var(--spacing-4)] [&>*]:mt-0">
                <CatalogToolbar
                    activeView={activeView}
                    onViewChange={setActiveView}
                    activeOrgs={[]}
                    onOrgsChange={() => {}}
                    activeCategory={activeTaskTypes}
                    onCategoryChange={setActiveTaskTypes}
                    dropdownItems={TASK_TYPE_DROPDOWN}
                    dropdownLabel="Task type"
                    dropdownAllLabel="All types"
                    viewOptions={['kanban', 'list']}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search tasks…"
                    quickFilterItems={taskQuickFilters}
                    activeQuickFilters={activeQuickFilters}
                    onQuickFilterChange={toggleQuickFilter}
                    primaryAction={
                        activeView === 'kanban' ? undefined : (
                            <label className="flex items-center gap-2 shrink-0 text-[13px] text-[var(--color-neutral-11)] mr-1">
                                <span className="hidden sm:inline whitespace-nowrap">Group</span>
                                <select
                                    className="h-8 max-w-[140px] rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-white)] px-2 text-[13px] text-[var(--color-gray-12)] outline-none cursor-pointer focus:border-[var(--color-accent-9)] font-[inherit]"
                                    value={groupBy}
                                    onChange={e => setGroupBy(e.target.value as GroupBy)}
                                    aria-label="Group tasks by"
                                >
                                    <option value="none">No grouping</option>
                                    <option value="asset">By asset</option>
                                    <option value="type">By type</option>
                                    <option value="assignee">By assignee</option>
                                </select>
                            </label>
                        )
                    }
                />
            </div>

            {activeView === 'kanban' ? (
                <div className="flex flex-1 min-h-0 min-w-0 gap-4 overflow-x-auto pb-[var(--spacing-4)] [scrollbar-width:thin]">
                    {filteredTasks.length === 0 ? (
                        <div className="flex flex-1 min-w-full items-center justify-center py-16 text-[13px] text-[var(--color-neutral-9)]">
                            No tasks match your filters
                        </div>
                    ) : (
                        KANBAN_STATUSES.map(colStatus => {
                            const columnTasks = kanbanByStatus[colStatus]
                            const theme = KANBAN_COLUMN_THEME[colStatus]
                            return (
                                <section
                                    key={colStatus}
                                    aria-label={`${colStatus} column`}
                                    className="flex flex-col w-[260px] min-w-[248px] max-w-[280px] shrink-0 rounded-[var(--radius-md)] bg-[var(--color-neutral-2)] border border-[var(--color-gray-4)] min-h-[260px] max-h-[min(680px,calc(100vh-220px))]"
                                >
                                    <header className="shrink-0 px-3 py-2.5 border-b border-[var(--color-gray-4)] bg-[var(--color-white)]/80 backdrop-blur-[6px]">
                                        <div className="flex items-center justify-between gap-2 min-w-0">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className={cn('h-1.5 w-1.5 shrink-0 rounded-full', theme.dotClass)}
                                                    aria-hidden
                                                    title={theme.caption}
                                                />
                                                <span className="text-[13px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] truncate">
                                                    {colStatus}
                                                </span>
                                            </div>
                                            <span className="tabular-nums text-[12px] font-[var(--font-weight-semibold)] text-[var(--color-neutral-10)]">
                                                {columnTasks.length}
                                            </span>
                                        </div>
                                    </header>
                                    <div className="flex flex-col gap-2 px-2 py-2 overflow-y-auto flex-1 min-h-0">
                                        {columnTasks.map(task => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                dueRelative={dueRelativeLabel(task.dueDate, task.status)}
                                                variant="kanban"
                                                isOverdue={taskIsOverdue(task)}
                                                urgencyClass=""
                                                onClick={onTaskClick ? () => onTaskClick(task.id) : undefined}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )
                        })
                    )}
                </div>
            ) : (
                <div className="flex flex-col flex-1 min-h-0 min-w-0 pb-8 gap-[var(--spacing-3)]">
                    <div className="flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-white)]">
                        <div className="list-view tasks-list-view">
                            {filteredTasks.length === 0 ? (
                                <div className="flex items-center justify-center py-16 text-sm text-[var(--color-neutral-9)] px-4">
                                    No tasks match your filters
                                </div>
                            ) : (
                                <table className="list-table tasks-list-table min-w-[1640px] w-max max-w-none">
                                    <thead>
                                    <tr className="list-header-row">
                                        <th className="list-header-cell" style={{ minWidth: 340 }}>
                                            <ColHeader label="Task" col="title" {...colProps} />
                                        </th>
                                        <th className="list-header-cell" style={{ minWidth: 152 }}>
                                            <ColHeader label="Type" col="type" {...colProps} />
                                        </th>
                                        <th className="list-header-cell" style={{ minWidth: 228 }}>
                                            <ColHeader label="Asset" col="relatedAsset" {...colProps} />
                                        </th>
                                        <th className="list-header-cell" style={{ minWidth: 248 }}>
                                            <ColHeader label="Related value" col="relatedValue" {...colProps} />
                                        </th>
                                        <th className="list-header-cell" style={{ minWidth: 248 }}>
                                            <ColHeader label="Assignee" col="assignee" {...colProps} />
                                        </th>
                                        <th className="list-header-cell" style={{ minWidth: 172 }}>
                                            <ColHeader label="Due date" col="dueDate" {...colProps} />
                                        </th>
                                        <th className="list-header-cell" style={{ minWidth: 156 }}>
                                            <ColHeader label="Status" col="status" {...colProps} />
                                        </th>
                                        <th className="list-header-cell" style={{ minWidth: 112 }}>
                                            <ColHeader label="Priority" col="priority" {...colProps} />
                                        </th>
                                        <th className="list-header-cell" style={{ minWidth: 136 }}>
                                            <ColHeader label="Recurring" col="recurring" {...colProps} />
                                        </th>
                                        <th
                                            className="list-header-cell text-[var(--color-neutral-10)] text-[13px] font-[var(--font-weight-medium)]"
                                            style={{ minWidth: 176 }}
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grouped.map(section =>
                                        section.tasks.length === 0 ? null : (
                                            <Fragment key={section.label || '__all'}>
                                                {groupBy !== 'none' ? (
                                                    <tr className="tasks-list-group-row bg-[var(--color-neutral-2)]">
                                                        <td
                                                            colSpan={colSpan}
                                                            className="list-cell py-2.5 px-4 text-[11px] font-[var(--font-weight-bold)] uppercase tracking-[0.04em] text-[var(--color-neutral-10)]"
                                                        >
                                                            {section.label}
                                                        </td>
                                                    </tr>
                                                ) : null}
                                                {section.tasks.map(task => {
                                                    const TypeIcon = TYPE_ICONS[task.type]
                                                    const AssetIcon = assetIconComponent(task.relatedAssetType)
                                                    const names = assigneeNames(task)
                                                    const sub = taskSubtitle(task)
                                                    const dueRel = dueRelativeLabel(task.dueDate, task.status)
                                                    const pct = STATUS_PROGRESS[task.status]

                                                    return (
                                                        <tr
                                                            key={task.id}
                                                            className="list-row group"
                                                            onClick={() => onTaskClick?.(task.id)}
                                                            tabIndex={onTaskClick ? 0 : undefined}
                                                            aria-label={task.title}
                                                            onKeyDown={e => {
                                                                if (!onTaskClick) return
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault()
                                                                    onTaskClick(task.id)
                                                                }
                                                            }}
                                                        >
                                                            <td className="list-cell list-cell--name min-w-[300px]">
                                                                <div className="list-avatar-mini bg-[var(--color-neutral-3)] shrink-0">
                                                                    <IconCheckbox
                                                                        size={14}
                                                                        stroke={1.75}
                                                                        color="var(--color-neutral-11)"
                                                                        aria-hidden
                                                                    />
                                                                </div>
                                                                <div className="flex min-w-[260px] flex-col gap-0.5">
                                                                    <span
                                                                        className="truncate text-[13px] font-[var(--font-weight-bold)] text-[var(--color-gray-12)]"
                                                                        title={task.title.length > 48 ? task.title : undefined}
                                                                    >
                                                                        {task.title}
                                                                    </span>
                                                                    {sub ? (
                                                                        <span className="truncate text-[11px] text-[var(--color-neutral-11)] leading-snug">
                                                                            {sub}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </td>
                                                            <td className="list-cell whitespace-nowrap">
                                                                <span
                                                                    className={cn(
                                                                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-2xl)] text-xs font-[var(--font-weight-semibold)]',
                                                                        TYPE_CHIP_CLASS
                                                                    )}
                                                                >
                                                                    <TypeIcon size={13} stroke={2} aria-hidden />
                                                                    {task.type}
                                                                </span>
                                                            </td>
                                                            <td className="list-cell text-[var(--color-neutral-11)] text-[13px] min-w-[200px]">
                                                                <span className="inline-flex items-center gap-1.5 min-w-0">
                                                                    {task.relatedAsset ? (
                                                                        <>
                                                                            <AssetIcon
                                                                                size={15}
                                                                                stroke={1.75}
                                                                                className="shrink-0 text-[var(--color-neutral-10)]"
                                                                                aria-hidden
                                                                            />
                                                                            <span className="whitespace-normal break-words">{task.relatedAsset}</span>
                                                                        </>
                                                                    ) : (
                                                                        '—'
                                                                    )}
                                                                </span>
                                                            </td>
                                                            <td className="list-cell text-[12px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] min-w-[220px]">
                                                                <span className="line-clamp-2 whitespace-normal">{task.relatedValue ?? '—'}</span>
                                                            </td>
                                                            <td className="list-cell min-w-[220px]">
                                                                <span className="inline-flex items-center gap-1.5 min-w-0 flex-wrap">
                                                                    {names.slice(0, 3).map(name => (
                                                                        <span
                                                                            key={`${task.id}-${name}`}
                                                                            className="inline-flex items-center gap-1 min-w-0"
                                                                        >
                                                                            <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full shrink-0 text-[10px] font-[var(--font-weight-semibold)] text-[var(--color-white)] bg-[var(--color-neutral-9)]">
                                                                                {initialsFromName(name)}
                                                                            </span>
                                                                            <span className="min-w-0 truncate text-[13px] max-w-[160px]">
                                                                                {name.split(' ')[0]}
                                                                            </span>
                                                                        </span>
                                                                    ))}
                                                                    {names.length > 3 ? (
                                                                        <span className="text-[11px] text-[var(--color-neutral-11)]">
                                                                            +{names.length - 3}
                                                                        </span>
                                                                    ) : null}
                                                                </span>
                                                            </td>
                                                            <td className="list-cell whitespace-nowrap">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-[13px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] tabular-nums">
                                                                        {formatDate(task.dueDate)}
                                                                    </span>
                                                                    <span className="text-[11px] font-[var(--font-weight-medium)] tabular-nums text-[var(--color-neutral-11)]">
                                                                        {dueRel}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="list-cell">
                                                                <div className="flex flex-col gap-1 min-w-[132px]">
                                                                    <span
                                                                        className={cn(
                                                                            'inline-flex items-center self-start min-h-[22px] px-2 py-0.5 rounded-[var(--radius-sm)] text-xs font-[var(--font-weight-medium)]',
                                                                            STATUS_CHIP_CLASS
                                                                        )}
                                                                    >
                                                                        {task.status}
                                                                    </span>
                                                                    <div className="h-1.5 w-full max-w-[132px] rounded-full bg-[var(--color-neutral-4)] overflow-hidden">
                                                                        <div
                                                                            className="h-full rounded-full bg-[var(--color-neutral-9)]"
                                                                            style={{ width: `${pct}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="list-cell whitespace-nowrap">
                                                                <span className="inline-flex items-center gap-1 text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)]">
                                                                    {task.priority === 'High' ? (
                                                                        <IconFlame size={14} stroke={1.75} className="text-[var(--color-neutral-10)] shrink-0" aria-hidden />
                                                                    ) : null}
                                                                    {task.priority}
                                                                </span>
                                                            </td>
                                                            <td className="list-cell">
                                                                <TaskRecurringCell task={task} />
                                                            </td>
                                                            <td className="list-cell align-middle tasks-list-actions-cell" onClick={e => e.stopPropagation()}>
                                                                <div className="tasks-list-actions flex items-center justify-end gap-0.5">
                                                                    <button
                                                                        type="button"
                                                                        title="Mark as done"
                                                                        className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-neutral-11)] cursor-pointer hover:bg-[var(--color-neutral-3)]"
                                                                        onClick={() => {
                                                                            patchTask(task.id, { status: 'Done' })
                                                                            showToast(`Marked done — ${task.title}`, 'success')
                                                                        }}
                                                                    >
                                                                        <IconCircleCheck size={18} stroke={1.75} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        title="Add comment"
                                                                        className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-neutral-11)] cursor-pointer hover:bg-[var(--color-neutral-3)]"
                                                                        onClick={() =>
                                                                            showToast('Comment saved on task (demo)', 'success')
                                                                        }
                                                                    >
                                                                        <IconMessage size={18} stroke={1.75} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        title="Reassign"
                                                                        className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-neutral-11)] cursor-pointer hover:bg-[var(--color-neutral-3)]"
                                                                        onClick={() =>
                                                                            showToast('Reassign flow — connect directory', 'info')
                                                                        }
                                                                    >
                                                                        <IconUserShare size={18} stroke={1.75} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        title="Attach document"
                                                                        className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-neutral-11)] cursor-pointer hover:bg-[var(--color-neutral-3)]"
                                                                        onClick={() =>
                                                                            showToast('Document picker — wire to vault', 'info')
                                                                        }
                                                                    >
                                                                        <IconPaperclip size={18} stroke={1.75} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </Fragment>
                                        )
                                    )}
                                </tbody>
                            </table>
                        )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
