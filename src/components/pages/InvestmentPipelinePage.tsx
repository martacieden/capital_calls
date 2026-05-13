import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { IconAlertTriangle, IconBolt, IconPlus, IconX } from '@tabler/icons-react'
import type { PipelineDeal, PipelineStage } from '@/data/thornton/pipeline-data'
import { PIPELINE_DEALS } from '@/data/thornton/pipeline-data'
import { CAPITAL_CALL_DECISIONS, type CapitalCallDecision } from '@/data/thornton/capital-call-decisions-data'
import { capitalWorkflowToHubStage } from '@/data/thornton/hub-pipeline-stages'
import { ToolbarButton } from '@/components/atoms/ToolbarButton'
import { ToolbarDropdown } from '@/components/atoms/ToolbarDropdown'
import { ToolbarSearchInput } from '@/components/atoms/ToolbarSearchInput'

// ─── board config ─────────────────────────────────────────────────────────────

type BoardStage = 'sourcing' | 'screening' | 'diligence' | 'decision'

type BoardColumn = {
    id: BoardStage
    label: string
    dot: string
}

const BOARD_COLUMNS: BoardColumn[] = [
    { id: 'sourcing',  label: 'Sourcing',   dot: '#9CA3AF' },
    { id: 'screening', label: 'Screening',  dot: '#F59E0B' },
    { id: 'diligence', label: 'Diligence',  dot: '#1F2937' },
    { id: 'decision',  label: 'Decision',   dot: '#4F46E5' },
]

const STALLED_DAYS = 14

// ─── helpers ──────────────────────────────────────────────────────────────────

function toBoardStage(stage: PipelineStage): BoardStage | null {
    if (stage === 'declined') return null
    if (stage === 'sourcing') return 'sourcing'
    if (stage === 'initial-review') return 'screening'
    if (stage === 'due-diligence') return 'diligence'
    return 'decision'
}

function toCapitalBoardStage(decision: CapitalCallDecision): BoardStage | null {
    const mapped = capitalWorkflowToHubStage(decision.stage)
    return toBoardStage(mapped)
}

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`
    return `$${v.toLocaleString()}`
}

function daysAgo(isoDate: string): number {
    return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24))
}

// ─── kpi tile ─────────────────────────────────────────────────────────────────

function KpiTile({
    label,
    value,
    note,
    valueTone = 'default',
}: {
    label: string
    value: string
    note: string
    valueTone?: 'default' | 'accent' | 'warning'
}) {
    const toneClass =
        valueTone === 'accent'  ? 'text-[var(--color-accent-9)]' :
        valueTone === 'warning' ? 'text-[#D97706]' :
        'text-[var(--color-black)]'

    return (
        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-4 py-3 min-w-0">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] truncate">{label}</p>
            <p
                className={cn('m-0 text-[22px] font-semibold tabular-nums tracking-[-0.02em] leading-none mt-1', toneClass)}
                style={{ fontFamily: 'var(--font-display)' }}
            >
                {value}
            </p>
            <p className="m-0 text-[11px] text-[var(--color-neutral-9)] mt-1 leading-snug">{note}</p>
        </div>
    )
}

// ─── deal card ────────────────────────────────────────────────────────────────

function DealCard({ deal, onOpenDeal }: { deal: PipelineDeal; onOpenDeal?: (id: string) => void }) {
    const hasFlag = deal.priority === 'high' || deal.missingDocs.length > 0
    const isStalled = daysAgo(deal.lastActivity) > STALLED_DAYS

    return (
        <button
            type="button"
            onClick={() => onOpenDeal?.(deal.id)}
            className="w-full rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white px-3.5 py-3 text-left transition-colors hover:border-[var(--color-accent-6)] hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <p className="m-0 text-[13px] font-semibold leading-[1.35] text-[var(--color-black)]">{deal.dealName}</p>
                {hasFlag && <IconAlertTriangle size={14} stroke={2} className="shrink-0 text-[#D97706] mt-0.5" />}
            </div>
            <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">
                {deal.sector} · {deal.assignee}
            </p>
            <div className="mt-2.5 flex items-center justify-between gap-2">
                <p
                    className="m-0 text-[15px] font-semibold text-[var(--color-black)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    {fmt(deal.targetAmount)}
                </p>
                <div className="flex items-center gap-1.5">
                    {isStalled && (
                        <span className="rounded-[var(--radius-sm)] bg-[#FFF7ED] px-1.5 py-0.5 text-[10px] font-semibold text-[#C05500]">
                            Stalled
                        </span>
                    )}
                    <span className="rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-neutral-10)]">
                        AI {deal.aiScore}
                    </span>
                </div>
            </div>
        </button>
    )
}

// ─── capital call card ────────────────────────────────────────────────────────

function CapitalNoticeCard({
    decision,
    onOpenCapitalCall,
}: {
    decision: CapitalCallDecision
    onOpenCapitalCall?: (id: string) => void
}) {
    return (
        <button
            type="button"
            onClick={() => onOpenCapitalCall?.(decision.id)}
            className="w-full rounded-[var(--radius-xl)] border border-[#BFDBFE] bg-[#EFF6FF] px-3.5 py-3 text-left transition-colors hover:bg-[#DBEAFE] hover:border-[#93C5FD]"
        >
            <div className="flex items-center gap-1.5 mb-1.5">
                <IconBolt size={12} stroke={2.5} className="text-[var(--color-accent-9)] shrink-0" />
                <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent-10)]">
                    Capital call
                </p>
            </div>
            <p className="m-0 text-[13px] font-semibold text-[var(--color-black)] leading-[1.35]">{decision.title}</p>
            <p className="m-0 mt-1 text-[11px] text-[var(--color-neutral-9)] truncate">{decision.fund.replace(', L.P.', '')}</p>
            <p
                className="m-0 mt-2 text-[15px] font-semibold text-[var(--color-black)]"
                style={{ fontFamily: 'var(--font-display)' }}
            >
                {fmt(decision.amount)}
            </p>
        </button>
    )
}

// ─── main component ───────────────────────────────────────────────────────────

interface InvestmentPipelinePageProps {
    embeddedInHub?: boolean
    onOpenCapitalCall?: (id: string) => void
    onOpenDeal?: (id: string) => void
}

export function InvestmentPipelinePage({
    embeddedInHub = false,
    onOpenCapitalCall,
    onOpenDeal,
}: InvestmentPipelinePageProps) {
    const [query, setQuery] = useState('')
    const [ownerFilter, setOwnerFilter] = useState('any')
    const [typeFilter, setTypeFilter] = useState('any')
    const [needsAttentionOnly, setNeedsAttentionOnly] = useState(false)

    const owners = useMemo(() => ['any', ...new Set(PIPELINE_DEALS.map(d => d.assignee))], [])
    const sectors = useMemo(() => ['any', ...new Set(PIPELINE_DEALS.map(d => d.sector))], [])

    const filteredDeals = useMemo(() => {
        let items = PIPELINE_DEALS.filter(d => d.stage !== 'declined')
        const q = query.trim().toLowerCase()
        if (q) items = items.filter(d =>
            d.dealName.toLowerCase().includes(q) ||
            d.company.toLowerCase().includes(q) ||
            d.sector.toLowerCase().includes(q),
        )
        if (ownerFilter !== 'any') items = items.filter(d => d.assignee === ownerFilter)
        if (typeFilter !== 'any') items = items.filter(d => d.sector === typeFilter)
        if (needsAttentionOnly) items = items.filter(d => d.priority === 'high' || d.missingDocs.length > 0)
        return items
    }, [needsAttentionOnly, ownerFilter, query, typeFilter])

    const filteredCapitalCalls = useMemo(() => CAPITAL_CALL_DECISIONS.filter(d => {
        if (toCapitalBoardStage(d) !== 'decision') return false
        const q = query.trim().toLowerCase()
        if (!q) return true
        return d.title.toLowerCase().includes(q) || d.fund.toLowerCase().includes(q)
    }), [query])

    const dealsByColumn = useMemo(() => {
        const map = new Map<BoardStage, PipelineDeal[]>([
            ['sourcing', []], ['screening', []], ['diligence', []], ['decision', []],
        ])
        filteredDeals.forEach(d => { const s = toBoardStage(d.stage); if (s) map.get(s)?.push(d) })
        return map
    }, [filteredDeals])

    const totalInFlight = filteredDeals.filter(d => d.stage !== 'approved').length
    const avgDays = filteredDeals.length > 0
        ? Math.round(filteredDeals.reduce((s, d) => s + daysAgo(d.sourceDate), 0) / filteredDeals.length)
        : 0
    const currentYear = new Date().getFullYear()
    const decisionsYtd = filteredDeals.filter(d =>
        (d.stage === 'ic-review' || d.stage === 'approved') &&
        new Date(d.lastActivity).getFullYear() === currentYear,
    ).length
    const activeCapital = CAPITAL_CALL_DECISIONS.reduce((s, d) => s + d.amount, 0)
    const stalled = filteredDeals.filter(d => daysAgo(d.lastActivity) > STALLED_DAYS).length

    // active chips shown below toolbar
    const hasActiveFilters = ownerFilter !== 'any' || typeFilter !== 'any'

    return (
        <div className={cn(
            'flex flex-col flex-1 h-full overflow-hidden',
            !embeddedInHub && 'bg-[var(--color-white)]',
        )}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="px-[var(--spacing-6)] pt-[36px] pb-0 bg-white shrink-0 border-b border-[var(--color-neutral-4)]">
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] m-0 mb-1">
                            Investments
                        </p>
                        <h1
                            className="m-0 text-[28px] font-bold tracking-[-0.02em] text-[var(--color-black)] leading-none"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            Deals Pipeline
                        </h1>
                        <p className="m-0 mt-1.5 text-[13px] text-[var(--color-neutral-10)]">
                            Sourcing to decision — full investment lifecycle
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                        <button
                            type="button"
                            className="rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-neutral-10)] hover:bg-[var(--color-neutral-2)] transition-colors"
                        >
                            All deals
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-[var(--color-accent-10)] transition-colors"
                        >
                            <IconPlus size={14} stroke={2.5} />
                            New deal
                        </button>
                    </div>
                </div>

                {/* KPI tiles */}
                <div className="grid grid-cols-5 gap-3 mb-5">
                    <KpiTile label="Total in flight"  value={String(totalInFlight)} note="evaluating" />
                    <KpiTile label="Avg days / stage" value={avgDays > 0 ? `${avgDays}d` : '—'} note="median" />
                    <KpiTile label="Decisions YTD"    value={String(decisionsYtd)} note="approved" />
                    <KpiTile label="Active capital"   value={fmt(activeCapital)} note="deployed" valueTone="accent" />
                    <KpiTile label="Stalled"          value={String(stalled)} note={`>${STALLED_DAYS} days`} valueTone={stalled > 0 ? 'warning' : 'default'} />
                </div>

                {/* Toolbar — matches CatalogToolbar pattern exactly */}
                <div className="mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-[var(--spacing-2)] rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-white)] p-[var(--spacing-2)] shadow-[var(--shadow-toolbar)]">
                        <div className="flex items-center">
                            <ToolbarDropdown
                                label="Owner"
                                items={owners.filter(o => o !== 'any').map(o => ({ key: o, label: o }))}
                                selectedKeys={ownerFilter !== 'any' ? [ownerFilter] : []}
                                onSelect={keys => setOwnerFilter(keys[0] ?? 'any')}
                                allOptionLabel="Any"
                                showClear={false}
                            />
                            <ToolbarDropdown
                                label="Sector"
                                items={sectors.filter(s => s !== 'any').map(s => ({ key: s, label: s }))}
                                selectedKeys={typeFilter !== 'any' ? [typeFilter] : []}
                                onSelect={keys => setTypeFilter(keys[0] ?? 'any')}
                                allOptionLabel="Any"
                                showClear={false}
                            />
                            <ToolbarSearchInput
                                value={query}
                                onChange={setQuery}
                                placeholder="Search by deal, sector, assignee…"
                            />
                        </div>
                        <ToolbarButton
                            label="Needs attention"
                            icon={<IconAlertTriangle size={16} stroke={2} color={needsAttentionOnly ? 'white' : 'var(--color-neutral-11)'} />}
                            isActive={needsAttentionOnly}
                            variant={needsAttentionOnly ? 'accent' : 'default'}
                            onClick={() => setNeedsAttentionOnly(v => !v)}
                        />
                    </div>

                    {/* Active filter chips + stalled indicator */}
                    <div className="mt-[var(--spacing-3)] flex flex-wrap items-start gap-1.5">
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
                                Sector: {typeFilter}
                                <IconX size={13} className="ml-0.5 opacity-70" />
                            </button>
                        )}
                        {!hasActiveFilters && (
                            owners.filter(o => o !== 'any').map(o => (
                                <button
                                    key={o}
                                    type="button"
                                    onClick={() => setOwnerFilter(o)}
                                    className="flex items-center rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] min-h-[28px] px-[var(--spacing-2)] py-[var(--spacing-1)] text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] transition-[background] duration-150 hover:bg-[var(--color-blue-3)]"
                                >
                                    {o}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Board ───────────────────────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden bg-white">
                <div className="flex min-h-full gap-3 px-[var(--spacing-6)] py-5 w-max min-w-full">
                    {BOARD_COLUMNS.map(col => {
                        const deals = dealsByColumn.get(col.id) ?? []
                        const capitalCalls = col.id === 'decision' ? filteredCapitalCalls : []
                        const count = deals.length + capitalCalls.length

                        return (
                            <section key={col.id} className="flex w-[268px] shrink-0 flex-col">
                                {/* Column header */}
                                <div className="mb-2.5 flex items-center justify-between px-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: col.dot }} />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-10)]">
                                            {col.label}
                                        </span>
                                    </div>
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-neutral-4)] px-1.5 text-[10px] font-semibold text-[var(--color-neutral-10)]">
                                        {count}
                                    </span>
                                </div>

                                {/* Cards container */}
                                <div className="flex min-h-[240px] flex-1 flex-col gap-2 rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white p-2">
                                    {deals.map(deal => (
                                        <DealCard key={deal.id} deal={deal} onOpenDeal={onOpenDeal} />
                                    ))}
                                    {capitalCalls.map(decision => (
                                        <CapitalNoticeCard key={decision.id} decision={decision} onOpenCapitalCall={onOpenCapitalCall} />
                                    ))}
                                    {count === 0 && (
                                        <div className="flex flex-1 flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-neutral-4)] px-3 py-8 text-center">
                                            <p className="m-0 text-[12px] font-medium text-[var(--color-neutral-9)]">Empty</p>
                                            <p className="m-0 mt-0.5 text-[11px] text-[var(--color-neutral-8)]">No deals here</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
