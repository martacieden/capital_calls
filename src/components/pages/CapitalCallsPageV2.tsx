import { useMemo, useState } from 'react'
import {
    IconArrowRight, IconCheck, IconCloudUpload, IconPlus,
    IconBolt, IconChevronDown, IconAlertTriangle,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { UploadModal } from '@/components/pages/DecisionsPage'
import { CAPITAL_CALL_COMMITMENTS, getTotalCalled, getTotalRemaining } from '@/data/thornton/capital-calls-data'
import {
    CAPITAL_CALL_DECISIONS,
    capitalCallHasPendingApprovalStep,
    getCapitalCallPostDealStatus,
    type CapitalCallDecision,
    type CapitalCallPostDealStatus,
} from '@/data/thornton/capital-call-decisions-data'
import type { CapitalChartDrill } from '@/components/organisms/CapitalActivitiesChartDetailPanel'
import { CapitalActivitiesForecastCharts } from '@/components/organisms/CapitalActivitiesForecastCharts'
import { AddCommitmentModal, QuarterlyProjection, type ModeledCommitmentPayload } from '@/components/pages/CapitalCallsPage'

// ─── constants ───────────────────────────────────────────────────────────────

const CURRENT_YEAR = String(new Date().getFullYear())

const FUND_COLORS: Record<string, string> = {
    'greentech-fund-iii': '#059669',
    'whitmore-capital-i': '#005BE2',
    'whitmore-ventures-ii': '#8B5CF6',
    'whitmore-real-assets-iii': '#93C5FD',
}

const STATUS_META: Record<CapitalCallPostDealStatus, { dot: string; bg: string; text: string; label: string }> = {
    'awaiting-execution': { dot: '#9CA3AF', bg: '#F9FAFB', text: '#374151', label: 'Awaiting e-sign' },
    'uploaded':           { dot: '#2563EB', bg: '#EFF6FF', text: '#1D4ED8', label: 'Uploaded' },
    'verified':           { dot: '#7C3AED', bg: '#F5F3FF', text: '#5B21B6', label: 'Verified' },
    'ready-to-release':   { dot: '#D97706', bg: '#FFF7ED', text: '#9A3412', label: 'Ready to release' },
    'paid':               { dot: '#059669', bg: '#ECFDF5', text: '#065F46', label: 'Paid' },
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`
    return `$${v.toLocaleString()}`
}

function daysUntil(iso: string): number {
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const due = new Date(iso); due.setHours(0, 0, 0, 0)
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function fmtShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── active call card ─────────────────────────────────────────────────────────

function ActiveCallCard({
    decision,
    onOpenDetail,
    getStatus,
}: {
    decision: CapitalCallDecision
    onOpenDetail?: (id: string) => void
    getStatus: (d: CapitalCallDecision) => CapitalCallPostDealStatus
}) {
    const status = getStatus(decision)
    const days = daysUntil(decision.dueDate)
    const isOverdue = days < 0
    const isUrgent = days >= 0 && days <= 5
    const fundShort = decision.fund.replace(', L.P.', '')

    const borderColor = isOverdue
        ? '#FCA5A5'
        : isUrgent
          ? '#FCD34D'
          : status === 'ready-to-release'
            ? '#FDE68A'
            : '#BFDBFE'

    const headerBg = isOverdue
        ? '#FEF2F2'
        : isUrgent
          ? '#FFFBEB'
          : status === 'ready-to-release'
            ? '#FFFBEB'
            : '#EFF6FF'

    const entityHint =
        decision.allocations.length === 0
            ? null
            : decision.allocations.length === 1
              ? decision.allocations[0].entity
              : `${decision.allocations[0].entity} +${decision.allocations.length - 1}`

    return (
        <button
            type="button"
            onClick={() => onOpenDetail?.(decision.id)}
            aria-label={`Open ${fundShort}, call ${decision.callNumber} of ${decision.totalCalls}`}
            className="group flex flex-col w-full text-left rounded-[var(--radius-xl)] border bg-white overflow-hidden transition-[border-color,box-shadow] hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)]"
            style={{ borderColor }}
        >
            <div className="px-3.5 pt-2.5 pb-2" style={{ background: headerBg }}>
                <div className="flex items-center justify-between gap-2">
                    {isOverdue ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#DC2626]">
                            <IconAlertTriangle size={13} stroke={2.5} />
                            {Math.abs(days)}d overdue
                        </span>
                    ) : isUrgent ? (
                        <span className="text-[11px] font-bold text-[#92400E]">Due in {days} day{days !== 1 ? 's' : ''}</span>
                    ) : (
                        <span className="text-[11px] font-semibold text-[var(--color-neutral-10)]">
                            Due {fmtShortDate(decision.dueDate)}
                        </span>
                    )}
                    <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0"
                        style={{ background: STATUS_META[status].bg, color: STATUS_META[status].text }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: STATUS_META[status].dot }} />
                        {STATUS_META[status].label}
                    </span>
                </div>
            </div>

            <div className="flex flex-col flex-1 px-3.5 pb-3.5 pt-2.5 gap-2">
                <div>
                    <p className="m-0 text-[13px] font-semibold text-[var(--color-black)] leading-snug line-clamp-2">{fundShort}</p>
                    <p className="m-0 mt-0.5 text-[11px] text-[var(--color-neutral-9)]">
                        {decision.gp} · Call {decision.callNumber}/{decision.totalCalls}
                    </p>
                </div>

                <div>
                    <p className="m-0 text-[26px] font-black tabular-nums tracking-[-0.03em] text-[var(--color-black)] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                        {fmt(decision.amount)}
                    </p>
                    <p className="m-0 mt-1 text-[11px] text-[var(--color-neutral-9)]">
                        {Math.round(decision.drawnBefore * 100)}% → {Math.round(decision.drawnAfter * 100)}% drawn
                    </p>
                </div>

                {entityHint ? (
                    <p className="m-0 text-[11px] text-[var(--color-neutral-9)] truncate" title={entityHint}>
                        {entityHint}
                    </p>
                ) : null}
            </div>
        </button>
    )
}

// ─── all-clear state ──────────────────────────────────────────────────────────

function AllClearState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-[#BBF7D0] bg-[#F0FDF4] py-8 px-6 text-center">
            <div className="h-10 w-10 rounded-full bg-[#059669] flex items-center justify-center mb-3">
                <IconCheck size={20} stroke={2.5} className="text-white" />
            </div>
            <p className="m-0 text-[15px] font-semibold text-[#065F46]">All clear</p>
            <p className="m-0 mt-1 text-[12px] text-[#047857]">No capital calls require action right now.</p>
        </div>
    )
}

// ─── kpi tile ─────────────────────────────────────────────────────────────────

function KpiTile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'default' | 'accent' | 'success' | 'warning' }) {
    const valueClass =
        tone === 'accent' ? 'text-[var(--color-accent-9)]'
        : tone === 'success' ? 'text-[#059669]'
        : tone === 'warning' ? 'text-[#D97706]'
        : 'text-[var(--color-black)]'
    return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-white px-4 py-3">
            <p className="m-0 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--color-neutral-8)] truncate">{label}</p>
            <p className={cn('m-0 mt-1 text-[22px] font-bold tabular-nums tracking-[-0.02em] leading-none', valueClass)} style={{ fontFamily: 'var(--font-display)' }}>
                {value}
            </p>
            {sub && <p className="m-0 mt-1 text-[11px] text-[var(--color-neutral-9)] leading-snug">{sub}</p>}
        </div>
    )
}

// ─── commitments table row ────────────────────────────────────────────────────

function CommitmentRow({
    fund,
    onOpenDetail,
}: {
    fund: typeof CAPITAL_CALL_COMMITMENTS[number]
    onOpenDetail?: (id: string) => void
}) {
    const [open, setOpen] = useState(false)
    const called = getTotalCalled(fund)
    const remaining = fund.totalCommitment - called
    const pct = fund.totalCommitment > 0 ? Math.round((called / fund.totalCommitment) * 100) : 0
    const hasPending = fund.calls.some(c => c.status === 'pending')

    return (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full grid grid-cols-[auto_minmax(0,2fr)_repeat(3,minmax(80px,0.6fr))_auto] items-center gap-4 px-4 py-3 text-left hover:bg-[var(--color-neutral-2)] transition-colors"
            >
                <IconChevronDown
                    size={16}
                    stroke={2}
                    className={cn('text-[var(--color-neutral-8)] transition-transform shrink-0', open && 'rotate-180')}
                />
                <div className="min-w-0 flex items-center gap-3">
                    <div className="h-8 w-1 rounded-full shrink-0" style={{ background: FUND_COLORS[fund.id] }} />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-semibold text-[var(--color-black)] truncate">{fund.fundName}</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-neutral-3)] text-[var(--color-neutral-10)]">
                                {fund.fundType}
                            </span>
                            {hasPending && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FFF7ED] text-[#C05500]">
                                    Active call
                                </span>
                            )}
                        </div>
                        <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">Vintage {fund.vintage}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="m-0 text-[10px] font-medium text-[var(--color-neutral-8)]">Committed</p>
                    <p className="m-0 text-[13px] font-semibold tabular-nums text-[var(--color-black)]">{fmt(fund.totalCommitment)}</p>
                </div>
                <div className="text-right">
                    <p className="m-0 text-[10px] font-medium text-[var(--color-neutral-8)]">Called</p>
                    <p className="m-0 text-[13px] font-semibold tabular-nums text-[var(--color-black)]">{fmt(called)}</p>
                </div>
                <div className="text-right">
                    <p className="m-0 text-[10px] font-medium text-[var(--color-neutral-8)]">Remaining</p>
                    <p className="m-0 text-[13px] font-semibold tabular-nums text-[var(--color-accent-9)]">{fmt(remaining)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[52px]">
                        <div className="h-1.5 w-full rounded-full bg-[var(--color-neutral-3)] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: FUND_COLORS[fund.id] }} />
                        </div>
                        <p className="m-0 mt-0.5 text-[10px] font-medium text-[var(--color-neutral-9)] text-right">{pct}%</p>
                    </div>
                    {onOpenDetail && (
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onOpenDetail(fund.id) }}
                            className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-8)] hover:bg-[var(--color-neutral-3)] transition-colors"
                        >
                            <IconArrowRight size={14} stroke={2} />
                        </button>
                    )}
                </div>
            </button>

            {open && (
                <div className="border-t border-[var(--color-neutral-3)] bg-[var(--color-neutral-2)] px-4 py-3">
                    {fund.payingEntities.length > 0 && (
                        <div className="mb-3 rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-white px-3 py-2.5">
                            <p className="m-0 mb-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">Paying entities</p>
                            <div className="flex flex-wrap gap-x-6 gap-y-1">
                                {fund.payingEntities.map(pe => (
                                    <div key={pe.legalName} className="flex items-center gap-2">
                                        <span className="text-[12px] font-semibold text-[var(--color-black)]">{pe.legalName}</span>
                                        {pe.role && <span className="text-[11px] text-[var(--color-neutral-9)]">{pe.role}</span>}
                                        {pe.allocationPct != null && (
                                            <span className="text-[11px] font-medium text-[var(--color-neutral-10)]">{pe.allocationPct}%</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        {fund.calls.filter(c => c.status !== 'paid').map(call => (
                            <div key={call.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 py-2">
                                <span className="text-[12px] text-[var(--color-neutral-11)]">Call #{call.callNumber}</span>
                                <span className="text-[12px] font-semibold tabular-nums text-[var(--color-black)]">{fmt(call.amount)}</span>
                                <span className="text-[11px] text-[var(--color-neutral-9)]">Due {fmtShortDate(call.dueDate)}</span>
                                <span className={cn(
                                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                    call.status === 'pending' ? 'bg-[#FFF7ED] text-[#C05500]' : 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-10)]',
                                )}>
                                    {call.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── main component ───────────────────────────────────────────────────────────

interface Props {
    onOpenDetail?: (id: string) => void
    onChartDrill?: (drill: CapitalChartDrill) => void
    resolvePostDealStatus?: (d: CapitalCallDecision) => CapitalCallPostDealStatus
    onSwitchToV1?: () => void
}

export function CapitalCallsPageV2({ onOpenDetail, onChartDrill, resolvePostDealStatus, onSwitchToV1 }: Props) {
    const [uploadOpen, setUploadOpen] = useState(false)
    const [modelOpen, setModelOpen] = useState(false)
    const [modeledCommitment, setModeledCommitment] = useState<ModeledCommitmentPayload | null>(null)

    const getStatus = useMemo(
        () => (d: CapitalCallDecision) => resolvePostDealStatus?.(d) ?? getCapitalCallPostDealStatus(d),
        [resolvePostDealStatus],
    )

    const activeCalls = useMemo(() =>
        [...CAPITAL_CALL_DECISIONS]
            .filter(d => getStatus(d) !== 'paid')
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
        [getStatus],
    )

    const totalCommitted = CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + c.totalCommitment, 0)
    const totalRemaining = getTotalRemaining(CAPITAL_CALL_COMMITMENTS)
    const thisYearTotal = CAPITAL_CALL_COMMITMENTS.reduce((s, f) => s + (f.yearlyPacing[CURRENT_YEAR] ?? 0), 0)
    const pendingApprovalCount = CAPITAL_CALL_DECISIONS.filter(capitalCallHasPendingApprovalStep).length

    const activeCols =
        activeCalls.length === 1 ? 'grid-cols-1 max-w-[400px]'
        : activeCalls.length === 2 ? 'grid-cols-2'
        : activeCalls.length === 3 ? 'grid-cols-3'
        : 'grid-cols-4'

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden bg-[var(--color-white)] pb-8">
            {uploadOpen && (
                <UploadModal
                    onClose={() => setUploadOpen(false)}
                    onCreated={id => { setUploadOpen(false); setTimeout(() => onOpenDetail?.(id), 300) }}
                />
            )}
            {modelOpen && (
                <AddCommitmentModal
                    onClose={() => setModelOpen(false)}
                    onModeled={p => { setModeledCommitment(p) }}
                />
            )}

            {/* ── sticky header ─────────────────────────────────────────── */}
            <div className="sticky top-0 z-10 bg-white border-b border-[var(--color-neutral-4)] px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-neutral-8)]">Capital Activities</p>
                        <h1 className="m-0 text-[20px] font-bold tracking-[-0.02em] text-[var(--color-black)] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            Capital calls & commitments
                        </h1>
                    </div>
                    {activeCalls.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7ED] border border-[#FDE68A] px-2.5 py-1 text-[12px] font-semibold text-[#92400E]">
                            <span className="relative flex h-2 w-2 shrink-0">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75 animate-ping" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F59E0B]" />
                            </span>
                            {activeCalls.length} active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {onSwitchToV1 && (
                        <button
                            type="button"
                            onClick={onSwitchToV1}
                            className="rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-neutral-10)] hover:bg-[var(--color-neutral-3)] transition-colors"
                        >
                            ← V1 view
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setUploadOpen(true)}
                        className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors"
                    >
                        <IconCloudUpload size={15} stroke={2} />
                        Upload notice
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-3.5 py-1.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        <IconPlus size={15} stroke={2.5} />
                        New call
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-5 max-w-[1120px] w-full mx-auto px-6 pt-5">

                {/* ── ZONE 1: Active calls ──────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="m-0 text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                            Action required
                        </h2>
                        {activeCalls.length > 0 && (
                            <span className="text-[13px] font-semibold text-[var(--color-neutral-8)]">
                                · {activeCalls.length} call{activeCalls.length > 1 ? 's' : ''} · {fmt(activeCalls.reduce((s, d) => s + d.amount, 0))} total
                            </span>
                        )}
                    </div>
                    {activeCalls.length === 0 ? (
                        <AllClearState />
                    ) : (
                        <div className={cn('grid gap-4', activeCols)}>
                            {activeCalls.map(d => (
                                <ActiveCallCard
                                    key={d.id}
                                    decision={d}
                                    onOpenDetail={onOpenDetail}
                                    getStatus={getStatus}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── ZONE 2: Quarterly liquidity outlook ───────────────── */}
                <section>
                    <h2 className="m-0 mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                        Liquidity — this quarter &amp; next
                    </h2>
                    <QuarterlyProjection />
                </section>

                {/* ── ZONE 3: Portfolio snapshot ────────────────────────── */}
                <section>
                    <h2 className="m-0 mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                        Portfolio snapshot
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <KpiTile label="Total committed" value={fmt(totalCommitted)} sub={`${CAPITAL_CALL_COMMITMENTS.length} funds`} />
                        <KpiTile label="Remaining unfunded" value={fmt(totalRemaining)} sub="Future liability" tone="accent" />
                        <KpiTile label={`Called ${CURRENT_YEAR}`} value={fmt(thisYearTotal)} sub="YTD drawdowns" />
                        <KpiTile
                            label="Pending approval"
                            value={String(pendingApprovalCount)}
                            sub={pendingApprovalCount > 0 ? 'Awaiting sign-off' : 'All approvals clear'}
                            tone={pendingApprovalCount > 0 ? 'warning' : 'success'}
                        />
                    </div>
                </section>

                {/* ── ZONE 4: Commitments ───────────────────────────────── */}
                <section>
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <h2 className="m-0 text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                            Commitments
                        </h2>
                    </div>
                    <div className="flex flex-col gap-2">
                        {CAPITAL_CALL_COMMITMENTS.map(fund => (
                            <CommitmentRow key={fund.id} fund={fund} />
                        ))}
                    </div>
                </section>

                {/* ── ZONE 5: Simulation (charts) — last, visually separate ─ */}
                <section className="rounded-[var(--radius-xl)] border-2 border-dashed border-[#818CF8] bg-[#F8FAFF] p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="shrink-0 rounded-full bg-[#4338CA] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                                Simulation
                            </span>
                            <p className="m-0 text-[12px] text-[var(--color-neutral-10)] max-w-[560px] leading-snug">
                                Modeled commitment curves — not live forecast. Hatched series stays distinct from booked commitments.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setModelOpen(true)}
                            className="shrink-0 flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[#4338CA] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4338CA] hover:bg-[#EEF2FF] transition-colors"
                        >
                            <IconBolt size={13} stroke={2} />
                            Model commitment…
                            {modeledCommitment && (
                                <span className="ml-1 text-[10px] font-semibold truncate max-w-[140px]">
                                    ({modeledCommitment.fundName})
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-white overflow-hidden">
                        <CapitalActivitiesForecastCharts modeledCommitment={modeledCommitment} onChartDrill={onChartDrill} />
                    </div>
                </section>

            </div>
        </div>
    )
}
