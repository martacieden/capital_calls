import { useState, useMemo } from 'react'
import {
    IconSearch,
    IconFilter,
    IconChevronDown,
    IconChevronUp,
    IconCheckbox,
    IconCheck,
    IconMinus,
    IconPlus,
} from '@tabler/icons-react'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { CreateTaskModal } from '@/components/molecules/CreateTaskModal'
import { showToast } from '@/components/atoms/Toast'
import { mockTasks, initialsFromName } from '@/data/thornton/tasks-data'
import type { Task, TaskStatus, TaskType } from '@/data/thornton/tasks-data'
import { cn } from '@/lib/utils'

/* ── Badge styles ── */

const TYPE_STYLES: Record<TaskType, string> = {
    Insurance: 'bg-[#EBF3FF] text-[#0560D0]',
    Maintenance: 'bg-[#FFF3E0] text-[#C05500]',
    Legal: 'bg-[#F3EEFF] text-[#6E3DD1]',
    'Tax & Accounting': 'bg-[#E8F5E9] text-[#2E7D32]',
}

const STATUS_STYLES: Record<TaskStatus, string> = {
    'To Do': 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)]',
    'In Progress': 'bg-[var(--color-blue-3)] text-[var(--color-accent-9)]',
    'Upcoming': 'bg-[#FFF3E0] text-[#C05500]',
    'Done': 'bg-[var(--color-green-3)] text-[var(--color-green-11)]',
}

/* ── Sorting ── */

type SortKey = 'title' | 'type' | 'relatedAsset' | 'assignee' | 'dueDate' | 'status' | 'priority' | 'recurring'
type SortDir = 'asc' | 'desc'

const STATUS_ORDER: Record<TaskStatus, number> = { 'In Progress': 0, 'To Do': 1, 'Upcoming': 2, 'Done': 3 }
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

function sortTasks(tasks: Task[], key: SortKey, dir: SortDir): Task[] {
    return [...tasks].sort((a, b) => {
        let cmp = 0
        switch (key) {
            case 'title': cmp = a.title.localeCompare(b.title); break
            case 'type': cmp = a.type.localeCompare(b.type); break
            case 'relatedAsset': cmp = (a.relatedAsset ?? '').localeCompare(b.relatedAsset ?? ''); break
            case 'assignee': cmp = a.assignee.localeCompare(b.assignee); break
            case 'dueDate': cmp = a.dueDate.localeCompare(b.dueDate); break
            case 'status': cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]; break
            case 'priority': cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]; break
            case 'recurring': cmp = Number(b.recurring) - Number(a.recurring); break
        }
        return dir === 'asc' ? cmp : -cmp
    })
}

function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Column header ── */

function ColHeader({ label, col, sortKey, sortDir, onSort }: {
    label: string
    col: SortKey
    sortKey: SortKey
    sortDir: SortDir
    onSort: (k: SortKey) => void
}) {
    const active = sortKey === col
    return (
        <button
            className="group flex items-center gap-0.5 text-[13px] font-[var(--font-weight-medium)] text-[var(--color-neutral-10)] leading-5 cursor-pointer select-none bg-transparent border-none p-0 transition-colors duration-150 hover:text-[var(--color-gray-12)]"
            onClick={() => onSort(col)}
        >
            {label}
            {active
                ? sortDir === 'asc'
                    ? <IconChevronUp size={13} stroke={2} className="text-[var(--color-accent-9)]" />
                    : <IconChevronDown size={13} stroke={2} className="text-[var(--color-accent-9)]" />
                : <IconChevronDown size={13} stroke={2} className="opacity-0 group-hover:opacity-30 transition-opacity" />
            }
        </button>
    )
}

/* ── Component ── */

interface TasksPageProps {
    onTaskClick?: (taskId: string) => void
    isChatOpen?: boolean
    externalTasks?: Task[]
}

export function TasksPage({ onTaskClick, externalTasks }: TasksPageProps) {
    const [localTasks, setLocalTasks] = useState<Task[]>(mockTasks)
    const tasks = [...(externalTasks ?? []), ...localTasks]
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All')
    const [sortKey, setSortKey] = useState<SortKey>('dueDate')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    const handleCreateTask = (task: Task) => {
        setLocalTasks(prev => [task, ...prev])
        showToast(`Task "${task.title}" created`, 'success')
    }

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDir('asc') }
    }

    const filteredTasks = useMemo(() => {
        let result = [...(externalTasks ?? []), ...localTasks]
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            result = result.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.type.toLowerCase().includes(q) ||
                t.assignee.toLowerCase().includes(q) ||
                (t.relatedAsset && t.relatedAsset.toLowerCase().includes(q))
            )
        }
        if (statusFilter !== 'All') result = result.filter(t => t.status === statusFilter)
        return sortTasks(result, sortKey, sortDir)
    }, [externalTasks, localTasks, searchQuery, statusFilter, sortKey, sortDir])

    const colProps = { sortKey, sortDir, onSort: handleSort }

    return (
        <div className="flex flex-col flex-1 gap-[var(--spacing-5)] min-h-0 pt-[36px] px-[var(--spacing-6)] pb-0 max-w-[1120px] w-full mx-auto">
            {/* Header */}
            <ContentHeader
                title="Tasks"
                itemCount={tasks.length}
                actionLabel="Add task"
                actionIcon={IconPlus}
                onActionClick={() => setIsCreateModalOpen(true)}
            />

            {isCreateModalOpen && (
                <CreateTaskModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreateTask={handleCreateTask}
                />
            )}

            {/* Toolbar */}
            <div className="sticky top-[calc(-1*var(--spacing-4))] z-10 bg-[var(--color-white)] pt-[var(--spacing-4)] -mt-[var(--spacing-5)] pb-[var(--spacing-4)]">
                <div className="flex items-center gap-[var(--spacing-2)] flex-wrap px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-xl)] bg-[var(--color-white)] shadow-[var(--shadow-toolbar)]">
                    {/* Search */}
                    <div className="relative">
                        <IconSearch size={15} stroke={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-neutral-9)] pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search tasks…"
                            className="h-8 pl-[30px] pr-3 w-[220px] rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] text-sm text-[var(--color-gray-12)] outline-none transition-[border-color,background] duration-150 placeholder:text-[var(--color-neutral-9)] focus:border-[var(--color-accent-9)] focus:bg-[var(--color-white)] font-[inherit]"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="w-px h-5 bg-[var(--color-gray-4)] shrink-0" />

                    {/* Status pills */}
                    <div className="flex items-center gap-1">
                        {(['All', 'To Do', 'In Progress', 'Upcoming', 'Done'] as const).map(s => (
                            <button
                                key={s}
                                className={cn(
                                    'h-7 px-2.5 py-0.5 rounded-[var(--radius-md)] text-[13px] font-[var(--font-weight-medium)] leading-5 border-none cursor-pointer transition-colors duration-150 whitespace-nowrap',
                                    statusFilter === s
                                        ? 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)]'
                                        : 'bg-transparent text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]'
                                )}
                                onClick={() => setStatusFilter(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-1">
                        <button className="flex items-center gap-1 h-7 px-2.5 rounded-[var(--radius-md)] border-none bg-transparent text-[13px] font-[var(--font-weight-medium)] text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-neutral-3)]">
                            <IconFilter size={14} stroke={2} />
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Task list — same list-table shell as Documents / catalog list */}
            <div className="flex flex-col gap-[var(--spacing-3)] flex-1 min-h-0 pb-8 [&>.list-view]:mt-0 [&>.list-view]:pt-0 [&>.list-view]:pb-[var(--spacing-5)] overflow-x-auto">
                <div className="list-view min-w-[960px]">
                    {filteredTasks.length === 0 ? (
                        <div className="flex items-center justify-center py-16 text-sm text-[var(--color-neutral-9)]">
                            No tasks match your filters
                        </div>
                    ) : (
                        <table className="list-table">
                            <thead>
                                <tr className="list-header-row">
                                    <th className="list-header-cell" style={{ minWidth: 320 }}>
                                        <ColHeader label="Task" col="title" {...colProps} />
                                    </th>
                                    <th className="list-header-cell" style={{ minWidth: 100 }}>
                                        <ColHeader label="Type" col="type" {...colProps} />
                                    </th>
                                    <th className="list-header-cell" style={{ minWidth: 140 }}>
                                        <ColHeader label="Asset" col="relatedAsset" {...colProps} />
                                    </th>
                                    <th className="list-header-cell" style={{ minWidth: 160 }}>
                                        <ColHeader label="Assignee" col="assignee" {...colProps} />
                                    </th>
                                    <th className="list-header-cell" style={{ minWidth: 108 }}>
                                        <ColHeader label="Due Date" col="dueDate" {...colProps} />
                                    </th>
                                    <th className="list-header-cell" style={{ minWidth: 112 }}>
                                        <ColHeader label="Status" col="status" {...colProps} />
                                    </th>
                                    <th className="list-header-cell" style={{ minWidth: 88 }}>
                                        <ColHeader label="Priority" col="priority" {...colProps} />
                                    </th>
                                    <th className="list-header-cell" style={{ minWidth: 92 }}>
                                        <ColHeader label="Recurring" col="recurring" {...colProps} />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map(task => (
                                    <tr
                                        key={task.id}
                                        className="list-row"
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
                                        <td className="list-cell list-cell--name">
                                            <div className="list-avatar-mini" style={{ background: 'var(--color-accent-3)' }}>
                                                <IconCheckbox size={14} stroke={1.75} color="var(--color-accent-9)" aria-hidden />
                                            </div>
                                            <span
                                                className="truncate max-w-[420px]"
                                                title={task.title.length > 60 ? task.title : undefined}
                                            >
                                                {task.title}
                                            </span>
                                        </td>
                                        <td className="list-cell">
                                            <span
                                                className={cn(
                                                    'inline-flex px-2 py-0.5 rounded-[var(--radius-2xl)] text-xs font-[var(--font-weight-bold)]',
                                                    TYPE_STYLES[task.type]
                                                )}
                                            >
                                                {task.type}
                                            </span>
                                        </td>
                                        <td className="list-cell text-[var(--color-neutral-11)] text-[13px]">
                                            {task.relatedAsset ?? '—'}
                                        </td>
                                        <td className="list-cell">
                                            <span className="inline-flex items-center gap-2 min-w-0">
                                                <span
                                                    className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full shrink-0 text-[10px] font-[var(--font-weight-semibold)] text-white"
                                                    style={{ background: assigneeColor(task.assignee) }}
                                                >
                                                    {initialsFromName(task.assignee)}
                                                </span>
                                                <span className="min-w-0 truncate text-[13px]">{task.assignee}</span>
                                            </span>
                                        </td>
                                        <td className="list-cell text-[var(--color-gray-12)] text-sm">
                                            {formatDate(task.dueDate)}
                                        </td>
                                        <td className="list-cell">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center h-[22px] px-2 rounded-[var(--radius-sm)] text-xs font-[var(--font-weight-medium)]',
                                                    STATUS_STYLES[task.status]
                                                )}
                                            >
                                                {task.status}
                                            </span>
                                        </td>
                                        <td
                                            className={cn(
                                                'list-cell text-sm font-[var(--font-weight-medium)]',
                                                task.priority === 'High' && 'text-[var(--color-red-9)]',
                                                task.priority === 'Medium' && 'text-[#C05500]',
                                                task.priority === 'Low' && 'text-[var(--color-neutral-11)]'
                                            )}
                                        >
                                            {task.priority}
                                        </td>
                                        <td className="list-cell">
                                            {task.recurring ? (
                                                <span className="inline-flex items-center gap-1 min-w-0">
                                                    <IconCheck size={14} stroke={2.5} className="shrink-0 text-[var(--color-green-9)]" />
                                                    <span className="text-xs text-[var(--color-neutral-11)] truncate">
                                                        {task.recurrenceInterval?.replace('Every ', '') ?? ''}
                                                    </span>
                                                </span>
                                            ) : (
                                                <IconMinus size={14} stroke={2} className="text-[var(--color-neutral-8)]" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ── Stable color per assignee name ── */

const AVATAR_COLORS = ['#bea887', '#6366f1', '#0891b2', '#059669', '#dc2626', '#9333ea', '#d97706']

function assigneeColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}
