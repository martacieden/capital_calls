import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
    IconAlertTriangle,
    IconFilter,
    IconLayoutKanban,
    IconLayoutList,
    IconPlus,
    IconX,
} from '@tabler/icons-react'
import type { PipelineDeal, PipelineStage } from '@/data/thornton/pipeline-data'
import { PIPELINE_DEALS } from '@/data/thornton/pipeline-data'
import { HUB_PIPELINE_COLUMNS } from '@/data/thornton/hub-pipeline-stages'
import { ToolbarButton } from '@/components/atoms/ToolbarButton'
import { ToolbarDropdown } from '@/components/atoms/ToolbarDropdown'
import { ToolbarSearchInput } from '@/components/atoms/ToolbarSearchInput'
import { CreateDealModal } from '@/components/molecules/CreateDealModal'

const STALLED_DAYS = 14
/** Rows loaded initially; more append as the user scrolls the page. */
const GRID_PAGE_SIZE = 25

/** Shared with `ContentHeader` primary action (e.g. Add asset on Assets). */
const HEADER_PRIMARY_ACTION_CLASS =
    'flex items-center justify-center gap-[var(--spacing-1)] rounded-[var(--radius-md)] border border-[var(--color-accent-9)] bg-[var(--color-accent-9)] min-h-[32px] px-4 py-0.5 text-[14px] font-[var(--font-weight-semibold)] leading-[1.43] text-[var(--color-accent-contrast)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear hover:opacity-90'

/** Shared with `CatalogToolbar` shell. */
const TOOLBAR_SHELL_CLASS =
    'flex items-center justify-between flex-wrap gap-[var(--spacing-2)] rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-white)] p-[var(--spacing-2)] shadow-[var(--shadow-toolbar)]'

/** Shared with `CatalogToolbar` list/grid/map view buttons. */
const TOOLBAR_VIEW_BTN_BASE =
    'flex min-h-[32px] w-[32px] items-center justify-center overflow-hidden rounded-[var(--radius-md)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear hover:bg-[var(--color-neutral-3)]'

type StageTabId =
    | 'all'
    | 'idea'
    | 'pre-approval'
    | 'approval'
    | 'monitoring'
    | 'rejected'
    | 'parked'

type PipelineViewMode = 'list' | 'board'

type InsightKey = 'needs_attention'

/** Quick-filter style chips — aligned with `CatalogToolbar` (middot, 13px medium, radius-sm). */
const PIPELINE_QUICK_CHIP_CLASS =
    'flex items-center justify-center rounded-[var(--radius-sm)] min-h-[28px] px-[var(--spacing-2)] py-[var(--spacing-1)] text-[13px] font-[var(--font-weight-medium)] leading-[1.54] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear'

const INSIGHT_CHIP_DEFS: { key: InsightKey; label: string; alert: boolean }[] = [
    { key: 'needs_attention', label: 'Needs attention', alert: true },
]

/** Stage chips (replaces tab bar). */
const STAGE_CHIPS: { id: StageTabId; label: string }[] = [
    { id: 'all',          label: 'All' },
    { id: 'idea',         label: 'Idea' },
    { id: 'pre-approval', label: 'Pre-approval' },
    { id: 'approval',     label: 'Approval' },
    { id: 'monitoring',    label: 'Monitoring' },
    { id: 'rejected',     label: 'Rejected' },
    { id: 'parked',       label: 'Parked' },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Map hub pipeline stage → filter tab (Parked: reserved, no demo data). */
function hubStageToTabId(stage: PipelineStage): StageTabId {
    switch (stage) {
        case 'sourcing':
            return 'idea'
        case 'initial-review':
        case 'due-diligence':
            return 'pre-approval'
        case 'ic-review':
            return 'approval'
        case 'approved':
            return 'monitoring'
        case 'declined':
            return 'rejected'
    }
}

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`
    return `$${v.toLocaleString()}`
}

function daysAgo(isoDate: string): number {
    return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24))
}

const ASSET_CLASS_SHORT: Record<string, string> = {
    Healthcare: 'HC',
    Technology: 'VC',
    Infrastructure: 'Infra',
    'Real Estate': 'RE',
    Debt: 'PD',
    Credit: 'CR',
}

function assetClassLabel(sector: string): string {
    return ASSET_CLASS_SHORT[sector] ?? sector.slice(0, 3).toUpperCase()
}

function closingLabel(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function firstNameFromAssignee(name: string): string {
    const part = name.trim().split(/\s+/)[0] ?? name
    return part.replace(/\.$/, '')
}

function initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    const a = parts[0][0] ?? ''
    const b = parts[1][0] ?? ''
    return (a + b).toUpperCase()
}

function avatarStyle(seed: string): { bg: string; color: string } {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 360
    const bg = `hsl(${h} 42% 88%)`
    const color = `hsl(${h} 45% 28%)`
    return { bg, color }
}

function hubColumnMeta(stage: PipelineStage) {
    return HUB_PIPELINE_COLUMNS.find(c => c.id === stage) ?? HUB_PIPELINE_COLUMNS[0]
}

function AssigneeCell({ name }: { name: string }) {
    const { bg, color } = avatarStyle(name)
    return (
        <div className="flex items-center gap-2 min-w-0">
            <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                style={{ background: bg, color }}
            >
                {initialsFromName(name)}
            </span>
            <span className="truncate text-[13px] text-[var(--color-black)]">{firstNameFromAssignee(name)}</span>
        </div>
    )
}

function StagePill({ stage }: { stage: PipelineStage }) {
    const meta = hubColumnMeta(stage)
    return (
        <span
            className="inline-flex max-w-full truncate rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: meta.bg, color: meta.text }}
        >
            {meta.label}
        </span>
    )
}

function dealNeedsAttention(deal: PipelineDeal): boolean {
    if (deal.stage === 'declined') return false
    return deal.missingDocs.length > 0 || deal.priority === 'high'
}

function countStageInBase(base: PipelineDeal[], tab: StageTabId): number {
    if (tab === 'all') return base.length
    if (tab === 'parked') return 0
    if (tab === 'rejected') return base.filter(d => d.stage === 'declined').length
    return base.filter(d => d.stage !== 'declined' && hubStageToTabId(d.stage) === tab).length
}

/** Kanban lane card */
function PipelineLaneCard({ deal, onOpenDeal, laneId }: {
    deal: PipelineDeal
    onOpenDeal?: (id: string) => void
    laneId: StageTabId
}) {
    const isStalled = daysAgo(deal.lastActivity) > STALLED_DAYS
    const isExecution = laneId === 'monitoring'
    const overdueDays = deal.closingDate
        ? Math.max(0, Math.floor((Date.now() - new Date(deal.closingDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0
    const approvedCount = deal.approvals.filter(a => a.status === 'approved').length
    const showApprovals = deal.approvals.length > 0 && laneId !== 'idea' && laneId !== 'rejected'

    return (
        <button
            type="button"
            onClick={() => onOpenDeal?.(deal.id)}
            className="w-full rounded-[var(--radius-md)] border-0 bg-white px-3 py-2.5 text-left outline-none shadow-none transition-[background,box-shadow] hover:bg-[var(--color-neutral-2)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)]"
        >
            {/* Deal name + New badge */}
            <div className="flex items-start gap-1.5">
                {deal.isNew && (
                    <span className="mt-0.5 shrink-0 rounded-full bg-[var(--color-accent-9)] px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-white leading-[1.6]">
                        New
                    </span>
                )}
                <p className="m-0 text-[12px] font-semibold leading-snug text-[var(--color-black)]">{deal.dealName}</p>
            </div>

            {/* Tag pills: asset class + geography */}
            <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="rounded-sm bg-[var(--color-neutral-3)] px-1.5 py-px text-[9px] font-semibold text-[var(--color-neutral-10)]">
                    {assetClassLabel(deal.sector)}
                </span>
                {deal.geography && (
                    <span className="rounded-sm bg-[#EFF6FF] px-1.5 py-px text-[9px] font-semibold text-[#1E40AF]">
                        {deal.geography}
                    </span>
                )}
            </div>

            {/* Amount + status badge */}
            <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold tabular-nums text-[var(--color-black)]" style={{ fontFamily: 'var(--font-display)' }}>
                    {deal.amountMax ? `${fmt(deal.targetAmount)}–${fmt(deal.amountMax)}` : fmt(deal.targetAmount)}
                </span>
                {overdueDays > 0 ? (
                    <span className="rounded-[var(--radius-sm)] bg-[#FEF2F2] px-1.5 py-0.5 text-[9px] font-semibold text-[#DC2626]">
                        Overdue {overdueDays}d
                    </span>
                ) : isStalled ? (
                    <span className="rounded-[var(--radius-sm)] bg-[#FFF7ED] px-1.5 py-0.5 text-[9px] font-semibold text-[#C05500]">
                        Stalled
                    </span>
                ) : (
                    <span className="rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--color-neutral-10)]">
                        AI {deal.aiScore}
                    </span>
                )}
            </div>

            {/* Approval indicator bubbles */}
            {showApprovals && (
                <div className="mt-2 flex items-center gap-1 flex-wrap">
                    {deal.approvals.map((approval, i) => {
                        const isApproved = approval.status === 'approved'
                        const isDenied = approval.status === 'declined'
                        const { bg, color } = avatarStyle(approval.name)
                        return (
                            <span
                                key={i}
                                title={`${approval.role}: ${approval.name} (${approval.status})`}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold"
                                style={{
                                    background: isApproved ? '#DCFCE7' : isDenied ? '#FEE2E2' : bg,
                                    color: isApproved ? '#15803D' : isDenied ? '#DC2626' : color,
                                    outline: isApproved ? '1.5px solid #86EFAC' : isDenied ? '1.5px solid #FCA5A5' : `1.5px solid ${bg}`,
                                }}
                            >
                                {isApproved ? '✓' : isDenied ? '✕' : initialsFromName(approval.name)}
                            </span>
                        )
                    })}
                    <span className="text-[9px] text-[var(--color-neutral-9)] ml-0.5">
                        {approvedCount}/{deal.approvals.length}
                    </span>
                </div>
            )}

            {/* Pending capital calls chip — execution lane only */}
            {isExecution && (deal.pendingCapitalCallsCount ?? 0) > 0 && (
                <div className="mt-2">
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[var(--color-accent-2)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--color-accent-10)]">
                        Pending capital calls · #{deal.pendingCapitalCallsCount}
                        {deal.pendingCapitalCallsAmount ? ` ${fmt(deal.pendingCapitalCallsAmount)}` : ''}
                    </span>
                </div>
            )}
        </button>
    )
}

const BOARD_LANES: { id: StageTabId; label: string }[] = [
    { id: 'idea',         label: 'Idea' },
    { id: 'pre-approval', label: 'Evaluating' },
    { id: 'approval',     label: 'Approval' },
    { id: 'monitoring',   label: 'Execution' },
    { id: 'rejected',     label: 'Rejected' },
]

const BOARD_GROUPS: {
    label: string
    accent: string
    surface: string
    laneIds: StageTabId[]
}[] = [
    { label: 'Pre-approval', accent: '#2563EB', surface: '#EFF6FF', laneIds: ['idea', 'pre-approval'] },
    { label: 'Approval', accent: '#7C3AED', surface: '#F5F3FF', laneIds: ['approval'] },
    { label: 'Post-approval', accent: '#059669', surface: '#ECFDF5', laneIds: ['monitoring'] },
    { label: 'Rejected', accent: '#6B7280', surface: '#F3F4F6', laneIds: ['rejected'] },
]

function BoardGroupPanel({
    group,
    groupLanes,
    groupTotal,
    groupValue,
    dealsByBoardLane,
    onOpenDeal,
}: {
    group: (typeof BOARD_GROUPS)[number]
    groupLanes: typeof BOARD_LANES
    groupTotal: number
    groupValue: number
    dealsByBoardLane: Map<StageTabId, PipelineDeal[]>
    onOpenDeal?: (id: string) => void
}) {
    const laneCount = groupLanes.length
    const panelMinWidth = laneCount * 220 + Math.max(0, laneCount - 1) * 12

    return (
        <div
            className="flex h-full min-h-0 shrink-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)]"
            style={{ minWidth: panelMinWidth, background: group.surface }}
        >
            <div
                className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2.5"
                style={{ borderColor: `${group.accent}22`, background: 'rgba(255,255,255,0.72)' }}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: group.accent, boxShadow: `0 0 0 3px ${group.accent}22` }}
                        aria-hidden
                    />
                    <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[var(--color-gray-12)]">
                        {group.label}
                    </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-[var(--radius-sm)] bg-white px-2 py-0.5 text-[11px] font-medium tabular-nums text-[var(--color-neutral-10)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
                        {groupTotal} {groupTotal === 1 ? 'deal' : 'deals'}
                    </span>
                    <span
                        className="text-[13px] font-semibold tabular-nums"
                        style={{ color: group.accent, fontFamily: 'var(--font-display)' }}
                    >
                        {fmt(groupValue)}
                    </span>
                </div>
            </div>

            <div className="flex min-h-0 flex-1 gap-3 p-2">
                {groupLanes.map(lane => {
                    const col = dealsByBoardLane.get(lane.id) ?? []
                    const colValue = col.reduce((s, d) => s + d.targetAmount, 0)
                    return (
                        <section key={lane.id} className="flex h-full min-h-0 w-[220px] shrink-0 flex-col">
                            <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2 px-0.5">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                                    {lane.label}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {col.length > 0 ? (
                                        <span className="tabular-nums text-[10px] font-medium text-[var(--color-neutral-9)]">
                                            {fmt(colValue)}
                                        </span>
                                    ) : null}
                                    <span
                                        className="flex h-5 min-w-[20px] items-center justify-center rounded-[var(--radius-sm)] px-1.5 text-[10px] font-semibold tabular-nums"
                                        style={{
                                            background: 'rgba(255,255,255,0.9)',
                                            color: group.accent,
                                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                                        }}
                                    >
                                        {col.length}
                                    </span>
                                </div>
                            </div>
                            <div className="pipeline-kanban-lane flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-0.5 py-0.5">
                                {col.map(deal => (
                                    <PipelineLaneCard key={deal.id} deal={deal} laneId={lane.id} onOpenDeal={onOpenDeal} />
                                ))}
                                {col.length === 0 && (
                                    <div className="flex flex-1 items-center justify-center rounded-[var(--radius-md)] bg-white/50 px-2 py-8 text-center text-[11px] text-[var(--color-neutral-8)]">
                                        No deals
                                    </div>
                                )}
                            </div>
                        </section>
                    )
                })}
            </div>
        </div>
    )
}

// ─── main component ───────────────────────────────────────────────────────────

interface InvestmentPipelinePageProps {
    embeddedInHub?: boolean
    onOpenDeal?: (id: string) => void
}

export function InvestmentPipelinePage({
    embeddedInHub = false,
    onOpenDeal,
}: InvestmentPipelinePageProps) {
    const [query, setQuery] = useState('')
    const [ownerFilter, setOwnerFilter] = useState('any')
    const [typeFilter, setTypeFilter] = useState('any')
    const [stageTab, setStageTab] = useState<StageTabId>('all')
    const [insightFilter, setInsightFilter] = useState<InsightKey | null>(null)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [pipelineView, setPipelineView] = useState<PipelineViewMode>('board')
    const [gridVisibleCount, setGridVisibleCount] = useState(GRID_PAGE_SIZE)
    const [createDealOpen, setCreateDealOpen] = useState(false)
    const gridLoadMoreSentinelRef = useRef<HTMLDivElement | null>(null)

    const owners = useMemo(() => ['any', ...new Set(PIPELINE_DEALS.map(d => d.assignee))], [])
    const sectors = useMemo(() => ['any', ...new Set(PIPELINE_DEALS.map(d => d.sector))], [])

    /** Deals matching toolbar only (search / owner / sector), including declined. */
    const dealsMatchingToolbar = useMemo(() => {
        let items = PIPELINE_DEALS
        const q = query.trim().toLowerCase()
        if (q) {
            items = items.filter(d =>
                d.dealName.toLowerCase().includes(q) ||
                d.company.toLowerCase().includes(q) ||
                d.sector.toLowerCase().includes(q) ||
                d.assignee.toLowerCase().includes(q),
            )
        }
        if (ownerFilter !== 'any') items = items.filter(d => d.assignee === ownerFilter)
        if (typeFilter !== 'any') items = items.filter(d => d.sector === typeFilter)
        return items
    }, [ownerFilter, query, typeFilter])

    const needsAttentionCount = useMemo(
        () =>
            dealsMatchingToolbar.filter(
                d => d.stage !== 'declined' && (d.missingDocs.length > 0 || d.priority === 'high'),
            ).length,
        [dealsMatchingToolbar],
    )

    const filteredDeals = useMemo(() => {
        let items = dealsMatchingToolbar
        if (stageTab === 'parked') items = []
        else if (stageTab === 'rejected') items = items.filter(d => d.stage === 'declined')
        else if (stageTab !== 'all') {
            items = items.filter(d => d.stage !== 'declined' && hubStageToTabId(d.stage) === stageTab)
        }
        if (insightFilter) {
            items = items.filter(d => dealNeedsAttention(d))
        }
        return items
    }, [dealsMatchingToolbar, insightFilter, stageTab])

    const pipelineTableRows = useMemo(
        () => [...filteredDeals].sort((a, b) => a.dealName.localeCompare(b.dealName)),
        [filteredDeals],
    )

    useEffect(() => {
        setGridVisibleCount(GRID_PAGE_SIZE)
    }, [stageTab, insightFilter, ownerFilter, typeFilter, query])

    const gridRows = useMemo(
        () => pipelineTableRows.slice(0, gridVisibleCount),
        [pipelineTableRows, gridVisibleCount],
    )
    const gridHasMore = gridVisibleCount < pipelineTableRows.length

    useEffect(() => {
        if (pipelineView !== 'list' || !gridHasMore) return
        const node = gridLoadMoreSentinelRef.current
        if (!node) return
        const obs = new IntersectionObserver(
            entries => {
                if (!entries[0]?.isIntersecting) return
                setGridVisibleCount(c => Math.min(c + GRID_PAGE_SIZE, pipelineTableRows.length))
            },
            { root: null, rootMargin: '240px', threshold: 0 },
        )
        obs.observe(node)
        return () => obs.disconnect()
    }, [gridHasMore, pipelineView, pipelineTableRows.length, gridVisibleCount])

    const dealsByBoardLane = useMemo(() => {
        const map = new Map<StageTabId, PipelineDeal[]>()
        for (const lane of BOARD_LANES) map.set(lane.id, [])
        for (const deal of pipelineTableRows) {
            const lane = deal.stage === 'declined' ? 'rejected' : hubStageToTabId(deal.stage)
            map.get(lane)?.push(deal)
        }
        return map
    }, [pipelineTableRows])

    const kpiDeals = useMemo(() => dealsMatchingToolbar.filter(d => d.stage !== 'declined'), [dealsMatchingToolbar])

    // Active filter summary chips (owner / sector) below pipeline toolbar
    const hasActiveFilters = ownerFilter !== 'any' || typeFilter !== 'any'

    return (
        <>
        <div
            className={cn(
                'flex w-full flex-col',
                embeddedInHub && 'min-h-0 flex-1',
                !embeddedInHub && 'bg-[var(--color-white)]',
            )}
        >

            {/* ── Header + toolbar + chips (Assets: filters directly under title) ─ */}
            <div className="px-[var(--spacing-6)] pt-[36px] pb-4 bg-white shrink-0 flex flex-col gap-[var(--spacing-3)]">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] m-0 mb-1">
                            Investments
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1
                                className="m-0 text-[28px] font-bold tracking-[-0.02em] text-[var(--color-black)] leading-none"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                Pipeline
                            </h1>
                            <span
                                className="flex min-w-[24px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] px-1.5 py-0.5 text-[13px] font-[var(--font-weight-medium)] leading-[1.54] tabular-nums text-[var(--color-gray-12)]"
                                aria-label={`${filteredDeals.length} deals in view`}
                            >
                                {filteredDeals.length}
                            </span>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-[var(--spacing-2)] mt-1">
                        <button
                            type="button"
                            className={HEADER_PRIMARY_ACTION_CLASS}
                            onClick={() => setCreateDealOpen(true)}
                        >
                            <IconPlus size={16} stroke={2} />
                            <span>New deal</span>
                        </button>
                    </div>
                </div>

                <div className={TOOLBAR_SHELL_CLASS}>
                    <div className="flex min-w-0 flex-1 items-center flex-wrap">
                        <ToolbarDropdown
                            label="Category"
                            items={sectors.filter(s => s !== 'any').map(s => ({ key: s, label: s }))}
                            selectedKeys={typeFilter !== 'any' ? [typeFilter] : []}
                            onSelect={keys => setTypeFilter(keys[0] ?? 'any')}
                            allOptionLabel="All"
                            showClear={false}
                        />
                        <ToolbarButton
                            label="Filters"
                            icon={<IconFilter size={16} stroke={2} color="var(--color-neutral-11)" />}
                            isActive={filtersOpen}
                            onClick={() => setFiltersOpen(v => !v)}
                        />
                        <ToolbarSearchInput
                            value={query}
                            onChange={setQuery}
                            placeholder="Search…"
                        />
                    </div>
                    <div className="flex shrink-0 items-center gap-[var(--spacing-1)]">
                        {([
                            { mode: 'list' as const, Icon: IconLayoutList, title: 'List view' },
                            { mode: 'board' as const, Icon: IconLayoutKanban, title: 'Kanban view' },
                        ] as const).map(({ mode, Icon, title }) => (
                            <button
                                key={mode}
                                type="button"
                                title={title}
                                aria-pressed={pipelineView === mode}
                                onClick={() => setPipelineView(mode)}
                                className={cn(
                                    TOOLBAR_VIEW_BTN_BASE,
                                    pipelineView === mode && 'bg-[var(--color-neutral-3)]',
                                )}
                            >
                                <Icon size={18} stroke={2} color="var(--color-neutral-11)" />
                            </button>
                        ))}
                    </div>
                </div>

                {filtersOpen ? (
                    <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-3 py-2">
                        <ToolbarDropdown
                            label="Owner"
                            items={owners.filter(o => o !== 'any').map(o => ({ key: o, label: o }))}
                            selectedKeys={ownerFilter !== 'any' ? [ownerFilter] : []}
                            onSelect={keys => setOwnerFilter(keys[0] ?? 'any')}
                            allOptionLabel="Any"
                            showClear={false}
                        />
                    </div>
                ) : null}

                {hasActiveFilters ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {ownerFilter !== 'any' && (
                            <button
                                type="button"
                                onClick={() => setOwnerFilter('any')}
                                className="flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-accent-9)] min-h-[28px] px-[var(--spacing-2)] py-[var(--spacing-1)] text-[13px] font-[var(--font-weight-medium)] text-white transition-[background] duration-150 hover:bg-[var(--color-accent-10)]"
                            >
                                Owner: {ownerFilter}
                                <IconX size={13} className="ml-0.5 opacity-70" />
                            </button>
                        )}
                        {typeFilter !== 'any' && (
                            <button
                                type="button"
                                onClick={() => setTypeFilter('any')}
                                className="flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-accent-9)] min-h-[28px] px-[var(--spacing-2)] py-[var(--spacing-1)] text-[13px] font-[var(--font-weight-medium)] text-white transition-[background] duration-150 hover:bg-[var(--color-accent-10)]"
                            >
                                Category: {typeFilter}
                                <IconX size={13} className="ml-0.5 opacity-70" />
                            </button>
                        )}
                    </div>
                ) : null}

                <div className="flex flex-wrap items-start gap-1.5">
                    {STAGE_CHIPS.map(chip => {
                        const n = countStageInBase(dealsMatchingToolbar, chip.id)
                        const active = stageTab === chip.id
                        const chipColors = active
                            ? 'bg-[var(--color-accent-9)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-10)]'
                            : 'bg-[var(--color-neutral-3)] text-[var(--color-gray-12)] hover:bg-[var(--color-blue-3)]'
                        return (
                            <button
                                key={chip.id}
                                type="button"
                                onClick={() =>
                                    setStageTab(prev => (prev === chip.id && chip.id !== 'all' ? 'all' : chip.id))
                                }
                                className={cn(PIPELINE_QUICK_CHIP_CLASS, chipColors)}
                            >
                                {chip.label}
                                <span className="ml-1 opacity-50">&middot;</span>
                                <span className="ml-1 tabular-nums">{n}</span>
                                {active && chip.id !== 'all' ? (
                                    <IconX size={14} className="ml-1 opacity-70" />
                                ) : null}
                            </button>
                        )
                    })}
                    {INSIGHT_CHIP_DEFS.map(({ key, label, alert }) => {
                        const n = needsAttentionCount
                        const active = insightFilter === key
                        const alertHot = alert && n > 0
                        const chipColors = active
                            ? 'bg-[var(--color-accent-9)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-10)]'
                            : alertHot
                                ? 'bg-[var(--color-orange-1)] text-[var(--color-orange-9)] hover:bg-[var(--color-orange-hover)]'
                                : 'bg-[var(--color-neutral-3)] text-[var(--color-gray-12)] hover:bg-[var(--color-blue-3)]'
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setInsightFilter(cur => (cur === key ? null : key))}
                                className={cn(PIPELINE_QUICK_CHIP_CLASS, chipColors)}
                            >
                                {label}
                                <span className="ml-1 opacity-50">&middot;</span>
                                <span className="ml-1 tabular-nums">{n}</span>
                                {active ? <IconX size={14} className="ml-1 opacity-70" /> : null}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── Deal attention brief ─────────────────────────────────────── */}
            {(() => {
                const needsAttention = [...kpiDeals]
                    .filter(d => d.missingDocs.length > 0 || d.priority === 'high')
                    .sort((a, b) => b.missingDocs.length - a.missingDocs.length || a.dealName.localeCompare(b.dealName))
                const top = needsAttention[0]
                if (!top) return null
                const gapLabel = top.missingDocs.length > 0
                    ? `${top.missingDocs.length} missing doc${top.missingDocs.length === 1 ? '' : 's'}`
                    : 'High priority'
                return (
                    <div className="shrink-0 mx-6 mb-4 flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706]">
                                <IconAlertTriangle size={14} stroke={2.5} />
                            </span>
                            <span className="text-[12px] font-semibold text-[var(--color-gray-12)] shrink-0">Needs attention</span>
                            <span className="text-[12px] text-[var(--color-neutral-10)] truncate">
                                {top.dealName} · {gapLabel}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenDeal?.(top.id)}
                            className="shrink-0 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-white)] px-3 py-1 text-[11px] font-semibold text-[var(--color-accent-9)] transition-colors hover:bg-[var(--color-accent-3)]"
                        >
                            Open deal
                        </button>
                    </div>
                )
            })()}

            {/* ── List / Kanban ─ */}
            <div
                className={cn(
                    'flex w-full flex-col bg-white px-[var(--spacing-6)] pb-5',
                    embeddedInHub && 'min-h-0 flex-1',
                )}
            >
                {pipelineView === 'board' ? (
                    <div className="flex min-h-0 flex-1 overflow-x-auto overflow-y-hidden rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] p-3">
                        <div className="flex h-full min-h-0 w-max min-w-full gap-3">
                            {BOARD_GROUPS.map(group => {
                                const groupLanes = BOARD_LANES.filter(l => group.laneIds.includes(l.id))
                                const groupTotal = groupLanes.reduce(
                                    (sum, l) => sum + (dealsByBoardLane.get(l.id)?.length ?? 0),
                                    0,
                                )
                                const groupValue = groupLanes.reduce(
                                    (sum, l) =>
                                        sum + (dealsByBoardLane.get(l.id) ?? []).reduce((s, d) => s + d.targetAmount, 0),
                                    0,
                                )
                                return (
                                    <BoardGroupPanel
                                        key={group.label}
                                        group={group}
                                        groupLanes={groupLanes}
                                        groupTotal={groupTotal}
                                        groupValue={groupValue}
                                        dealsByBoardLane={dealsByBoardLane}
                                        onOpenDeal={onOpenDeal}
                                    />
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div
                        className={cn(
                            'overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-white',
                            embeddedInHub && 'min-h-0 flex-1 overflow-y-auto',
                        )}
                    >
                        <table className="w-full border-collapse text-left min-w-[720px]">
                            <thead>
                                <tr className="border-b border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)]">
                                    <th className="sticky top-0 z-[1] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                                        Name
                                    </th>
                                    <th className="sticky top-0 z-[1] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                                        Fund / Company
                                    </th>
                                    <th className="sticky top-0 z-[1] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                                        Asset class
                                    </th>
                                    <th className="sticky top-0 z-[1] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-10)] text-right">
                                        Commitment
                                    </th>
                                    <th className="sticky top-0 z-[1] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                                        Stage
                                    </th>
                                    <th className="sticky top-0 z-[1] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-10)] whitespace-nowrap">
                                        Closing date
                                    </th>
                                    <th className="sticky top-0 z-[1] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                                        Created by
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pipelineTableRows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <p className="m-0 text-[13px] font-medium text-[var(--color-neutral-9)]">No rows</p>
                                            <p className="m-0 mt-1 text-[12px] text-[var(--color-neutral-8)]">
                                                Adjust filters or pick another chip
                                            </p>
                                        </td>
                                    </tr>
                                )}
                                {gridRows.map(deal => (
                                    <tr
                                        key={deal.id}
                                        className="border-b border-[var(--color-neutral-4)] last:border-b-0 hover:bg-[var(--color-neutral-2)] transition-colors"
                                    >
                                        <td className="px-4 py-3 align-middle">
                                            <button
                                                type="button"
                                                onClick={() => onOpenDeal?.(deal.id)}
                                                className="m-0 max-w-[200px] truncate text-left text-[13px] font-semibold text-[var(--color-black)] underline-offset-2 hover:underline bg-transparent border-none p-0 cursor-pointer font-inherit"
                                            >
                                                {deal.dealName}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 align-middle">
                                            <p className="m-0 max-w-[180px] truncate text-[13px] text-[var(--color-neutral-10)]">
                                                {deal.company}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 align-middle">
                                            <span className="inline-flex rounded-full bg-[var(--color-neutral-3)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-neutral-10)]">
                                                {assetClassLabel(deal.sector)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 align-middle text-right tabular-nums">
                                            <span
                                                className="text-[14px] font-semibold text-[var(--color-black)]"
                                                style={{ fontFamily: 'var(--font-display)' }}
                                            >
                                                {fmt(deal.targetAmount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 align-middle">
                                            <StagePill stage={deal.stage} />
                                        </td>
                                        <td className="px-4 py-3 align-middle whitespace-nowrap text-[13px] text-[var(--color-neutral-10)]">
                                            {closingLabel(deal.lastActivity)}
                                        </td>
                                        <td className="px-4 py-3 align-middle">
                                            <AssigneeCell name={deal.assignee} />
                                        </td>
                                    </tr>
                                ))}
                                {gridHasMore ? (
                                    <tr className="border-0">
                                        <td colSpan={7} className="h-0 p-0 border-0">
                                            <div ref={gridLoadMoreSentinelRef} className="h-2 w-full" aria-hidden />
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>

        {createDealOpen && (
            <CreateDealModal onClose={() => setCreateDealOpen(false)} />
        )}
        </>
    )
}
