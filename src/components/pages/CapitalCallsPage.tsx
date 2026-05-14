import React, { useCallback, useMemo, useState } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveLine } from '@nivo/line'
import type { BarTooltipProps } from '@nivo/bar'
import type { SliceTooltipProps, DefaultSeries } from '@nivo/line'
import type { PartialTheme } from '@nivo/theming'
import { IconPencil, IconTrash, IconPlus, IconChevronLeft, IconX, IconArrowRight, IconFileText, IconCloudUpload, IconSearch, IconLayoutGrid, IconTable } from '@tabler/icons-react'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { UploadModal } from '@/components/pages/DecisionsPage'
import { cn } from '@/lib/utils'
import {
    CAPITAL_CALL_COMMITMENTS,
    getTotalCalled,
    getTotalRemaining,
} from '@/data/thornton/capital-calls-data'
import {
    CAPITAL_CALL_DECISIONS,
    capitalCallHasPendingApprovalStep,
    getCapitalCallPostDealStatus,
    type CapitalCallPostDealStatus,
} from '@/data/thornton/capital-call-decisions-data'

// ─── constants ───────────────────────────────────────────────────────────────

const FORECAST_YEARS = ['2026', '2027', '2028', '2029', '2030', '2031']
const CURRENT_YEAR = String(new Date().getFullYear())

const FUND_COLORS: Record<string, string> = {
    'greentech-fund-iii': '#059669',
    'whitmore-capital-i': '#005BE2',
    'whitmore-ventures-ii': '#8B5CF6',
    'whitmore-real-assets-iii': '#93C5FD',
}

/** Links a portfolio commitment row to a capital-call detail record (mock data). */
const COMMITMENT_ID_TO_CAPCALL_DETAIL: Record<string, string> = {
    'greentech-fund-iii': 'CAPCAL-1',
    'whitmore-capital-i': 'CAPCAL-3',
    'whitmore-ventures-ii': 'CAPCAL-4',
    'whitmore-real-assets-iii': 'CAPCAL-2',
}

const CHART_THEME: PartialTheme = {
    background: 'transparent',
    text: { fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter, -apple-system, sans-serif' },
    axis: {
        domain: { line: { stroke: 'transparent' } },
        ticks: {
            line: { stroke: 'transparent' },
            text: { fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter, -apple-system, sans-serif' },
        },
    },
    grid: { line: { stroke: '#F0F0F3', strokeWidth: 1 } },
    crosshair: { line: { stroke: '#94A3B8', strokeWidth: 1, strokeOpacity: 0.45, strokeDasharray: '4 6' } },
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`
    return `$${v.toLocaleString()}`
}

function fmtAxis(v: number): string {
    if (v >= 1_000_000) return `$${v / 1_000_000}M`
    if (v >= 1_000) return `$${v / 1_000}K`
    return `$${v}`
}

function fmtShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace('#', '')
    const fullHex = clean.length === 3 ? clean.split('').map(ch => ch + ch).join('') : clean
    const int = Number.parseInt(fullHex, 16)
    return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`
}

function getForecastOpacity(year: string): number {
    if (year <= CURRENT_YEAR) return 1
    if (year === '2027') return 0.95
    if (year === '2028') return 0.9
    if (year === '2029') return 0.85
    if (year === '2030') return 0.82
    return 0.78
}

type BarRow = Record<string, string | number>
const CALLED_COLOR = '#93C5FD'
const UNCALLED_COLOR = '#1C2024'

const NOTICE_STATUS_META: Record<CapitalCallPostDealStatus, { label: string; dot: string; bg: string; text: string }> = {
    'awaiting-execution': { label: 'Awaiting e-sign', dot: '#9CA3AF', bg: '#F9FAFB', text: '#374151' },
    'uploaded': { label: 'Uploaded', dot: '#2563EB', bg: '#EFF6FF', text: '#1D4ED8' },
    'verified': { label: 'Verified', dot: '#7C3AED', bg: '#F5F3FF', text: '#5B21B6' },
    'ready-to-release': { label: 'Ready to release', dot: '#D97706', bg: '#FFF7ED', text: '#9A3412' },
    'paid': { label: 'Paid', dot: '#059669', bg: '#ECFDF5', text: '#065F46' },
}

const NOTICE_STATUS_OPTIONS: Array<'all' | CapitalCallPostDealStatus> = [
    'all',
    'awaiting-execution',
    'uploaded',
    'verified',
    'ready-to-release',
    'paid',
]

// ─── chart tooltips ──────────────────────────────────────────────────────────

function AnnualBarTooltip({ data }: BarTooltipProps<BarRow>) {
    const year = String(data['year'])
    return (
        <div className="w-[280px] rounded-[var(--radius-lg)] px-3.5 py-2.5 shadow-lg border border-[var(--color-neutral-4)] bg-white">
            <div className="text-[11px] font-medium text-[var(--color-neutral-10)] mb-2">Year {year}</div>
            {CAPITAL_CALL_COMMITMENTS.map(fund => {
                const amount = Number(data[fund.id] ?? 0)
                if (!amount) return null
                return (
                    <div key={fund.id} className="grid grid-cols-[8px_minmax(0,1fr)_64px] items-start gap-2 mb-1 last:mb-0">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: FUND_COLORS[fund.id] }} />
                        <span className="text-[12px] leading-[1.35] text-[var(--color-neutral-11)]">{fund.fundName.replace('Whitmore ', '')}</span>
                        <span className="text-right text-[12px] font-semibold text-[var(--color-black)] tabular-nums">{fmt(amount)}</span>
                    </div>
                )
            })}
        </div>
    )
}

function CumulativeTooltip({ slice }: SliceTooltipProps<DefaultSeries>) {
    const calledPoint = slice.points.find(p => p.seriesId === 'Called')
    const uncalledPoint = slice.points.find(p => p.seriesId === 'Uncalled')
    const year = String(slice.points[0]?.data.x ?? '')
    return (
        <div className="w-[220px] rounded-[var(--radius-lg)] px-3.5 py-2.5 shadow-lg border border-[var(--color-neutral-4)] bg-white">
            <div className="text-[11px] font-medium text-[var(--color-neutral-10)] mb-2">Year {year}</div>
            {calledPoint && (
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: CALLED_COLOR }} />
                    <span className="text-[12px] text-[var(--color-neutral-11)] flex-1">Called</span>
                    <span className="text-[12px] font-semibold text-[var(--color-black)] tabular-nums">{fmt(calledPoint.data.y as number)}</span>
                </div>
            )}
            {uncalledPoint && (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: UNCALLED_COLOR }} />
                    <span className="text-[12px] text-[var(--color-neutral-11)] flex-1">Uncalled</span>
                    <span className="text-[12px] font-semibold text-[var(--color-black)] tabular-nums">{fmt(uncalledPoint.data.y as number)}</span>
                </div>
            )}
        </div>
    )
}

// ─── overview tiles ───────────────────────────────────────────────────────────

function OverviewKpiTile({
    label,
    value,
    sub,
    valueTone,
}: {
    label: string
    value: string
    sub?: string
    valueTone?: 'default' | 'accent' | 'success'
}) {
    const tone =
        valueTone === 'accent'
            ? 'text-[var(--color-accent-9)]'
            : valueTone === 'success'
              ? 'text-[#059669]'
              : 'text-[var(--color-black)]'
    return (
        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-lg)] px-3 py-2.5 min-w-0">
            <p className="m-0 text-[9px] font-semibold uppercase tracking-[0.07em] text-[var(--color-neutral-9)] truncate" title={label}>
                {label}
            </p>
            <p
                className={cn(
                    'm-0 text-[17px] sm:text-[18px] font-semibold tabular-nums tracking-[-0.015em] leading-none mt-1',
                    tone,
                )}
                style={{ fontFamily: 'var(--font-display)' }}
            >
                {value}
            </p>
            {sub ? <p className="m-0 text-[10px] text-[var(--color-neutral-9)] mt-1 leading-snug truncate">{sub}</p> : null}
        </div>
    )
}

// ─── log capital call modal ───────────────────────────────────────────────────

const EXISTING_PDFS = [
    'Meridian_CapCall_07_RE-Holding.pdf',
    'Whitmore_CapCall_03_ThorntonTrust.pdf',
    'WV2_CapCall_04_ThorntonHoldings.pdf',
    'Whitmore_CapCall_05_Final_Trust.pdf',
]

function LogCapitalCallModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
    const [amount, setAmount] = useState('')
    const [pct, setPct] = useState('')
    const [accountLast4, setAccountLast4] = useState('')
    const [routing, setRouting] = useState('')
    const [selectedPdf, setSelectedPdf] = useState(EXISTING_PDFS[0] ?? '')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        onCreated('CAPCAL-7')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div
                className="relative w-full max-w-[480px] rounded-[var(--radius-xl)] bg-white shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* header */}
                <div className="flex items-center justify-between border-b border-[var(--color-neutral-4)] px-6 py-4">
                    <h2 className="m-0 text-[16px] font-semibold text-[var(--color-black)]">Log Capital Call #5</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                    >
                        <IconX size={16} stroke={2} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-medium text-[var(--color-neutral-11)]">Call Amount ($)</label>
                            <input
                                type="text"
                                placeholder="e.g. 1,000,000"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] px-3 py-2 text-[13px] text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] focus:border-[var(--color-accent-9)] focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-medium text-[var(--color-neutral-11)]">Call % of Commitment</label>
                            <input
                                type="text"
                                placeholder="e.g. 20"
                                value={pct}
                                onChange={e => setPct(e.target.value)}
                                className="rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] px-3 py-2 text-[13px] text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] focus:border-[var(--color-accent-9)] focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-medium text-[var(--color-neutral-11)]">Bank Account (last 4)</label>
                            <input
                                type="text"
                                maxLength={4}
                                placeholder="e.g. 8841"
                                value={accountLast4}
                                onChange={e => setAccountLast4(e.target.value.replace(/\D/g, ''))}
                                className="rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] px-3 py-2 text-[13px] text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] focus:border-[var(--color-accent-9)] focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-medium text-[var(--color-neutral-11)]">Routing Number</label>
                            <input
                                type="text"
                                placeholder="e.g. 021000021"
                                value={routing}
                                onChange={e => setRouting(e.target.value)}
                                className="rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] px-3 py-2 text-[13px] text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] focus:border-[var(--color-accent-9)] focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* PDF selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-medium text-[var(--color-neutral-11)]">Capital Call Notice</label>
                        <div className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] overflow-hidden">
                            {EXISTING_PDFS.map(pdf => (
                                <label
                                    key={pdf}
                                    className="flex cursor-pointer items-center gap-3 border-b border-[var(--color-neutral-4)] px-4 py-2.5 last:border-b-0 hover:bg-[var(--color-neutral-2)] transition-colors"
                                >
                                    <input
                                        type="radio"
                                        name="pdf"
                                        value={pdf}
                                        checked={selectedPdf === pdf}
                                        onChange={() => setSelectedPdf(pdf)}
                                        className="accent-[var(--color-accent-9)]"
                                    />
                                    <IconFileText size={14} stroke={2} className="shrink-0 text-[var(--color-neutral-9)]" />
                                    <span className="text-[12px] text-[var(--color-neutral-11)] truncate">{pdf}</span>
                                </label>
                            ))}
                            <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-neutral-2)] transition-colors">
                                <input
                                    type="radio"
                                    name="pdf"
                                    value="upload"
                                    checked={selectedPdf === 'upload'}
                                    onChange={() => setSelectedPdf('upload')}
                                    className="accent-[var(--color-accent-9)]"
                                />
                                <IconPlus size={14} stroke={2} className="shrink-0 text-[var(--color-neutral-9)]" />
                                <span className="text-[12px] text-[var(--color-neutral-9)]">Upload a new file…</span>
                            </label>
                        </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                        >
                            Log Capital Call
                            <IconArrowRight size={14} stroke={2.5} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── main component ──────────────────────────────────────────────────────────

interface Props {
    onOpenDetail?: (id: string) => void
    /** Opened from Pipeline » Approved — tighter chrome + back navigation */
    hubLayout?: boolean
    onBackToPipeline?: () => void
}

export function CapitalCallsPage({ onOpenDetail, hubLayout, onBackToPipeline }: Props) {
    /** Shared PDF/email intake modal — wired from shell header while List view can stay mounted separately */
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [logModalOpen, setLogModalOpen] = useState(false)
    const [commitmentsLayout, setCommitmentsLayout] = useState<'cards' | 'table'>('cards')
    const [noticeSearch, setNoticeSearch] = useState('')
    const [noticeStatusFilter, setNoticeStatusFilter] = useState<'all' | CapitalCallPostDealStatus>('all')

    const openCommitmentDetail = useCallback(
        (commitmentId: string) => {
            const capId = COMMITMENT_ID_TO_CAPCALL_DETAIL[commitmentId]
            if (capId) onOpenDetail?.(capId)
        },
        [onOpenDetail],
    )

    const totalCommitted = useMemo(() => CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + c.totalCommitment, 0), [])
    const totalRemaining = useMemo(() => getTotalRemaining(CAPITAL_CALL_COMMITMENTS), [])

    const annualData = useMemo<BarRow[]>(() =>
        FORECAST_YEARS.map(year => {
            const row: BarRow = { year }
            CAPITAL_CALL_COMMITMENTS.forEach(fund => { row[fund.id] = fund.yearlyPacing[year] ?? 0 })
            return row
        }), [],
    )

    const annualTotals = useMemo(() =>
        Object.fromEntries(FORECAST_YEARS.map(year => [
            year,
            CAPITAL_CALL_COMMITMENTS.reduce((s, f) => s + (f.yearlyPacing[year] ?? 0), 0),
        ])), [],
    )

    const yearlyCallStatus = useMemo(() =>
        Object.fromEntries(FORECAST_YEARS.map(year => {
            let paid = 0; let pending = 0; let upcoming = 0
            CAPITAL_CALL_COMMITMENTS.forEach(fund => {
                fund.calls.forEach(call => {
                    if (!call.dueDate.startsWith(year)) return
                    if (call.status === 'paid') paid += call.amount
                    if (call.status === 'pending') pending += call.amount
                    if (call.status === 'upcoming') upcoming += call.amount
                })
            })
            return [year, { paid, pending, upcoming }]
        })), [],
    )

    const thisYearTotal = annualTotals[CURRENT_YEAR] ?? 0

    const cumulativeData = useMemo(() => {
        const alreadyCalled = CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + getTotalCalled(c), 0)
        let runningCalled = alreadyCalled
        return FORECAST_YEARS.map(year => {
            runningCalled += annualTotals[year] ?? 0
            return { year, called: runningCalled, uncalled: Math.max(0, totalCommitted - runningCalled) }
        })
    }, [annualTotals, totalCommitted])

    const nivoLineData = useMemo(() => [
        { id: 'Called', data: cumulativeData.map(d => ({ x: d.year, y: d.called })) },
        { id: 'Uncalled', data: cumulativeData.map(d => ({ x: d.year, y: d.uncalled })) },
    ], [cumulativeData])

    const totalActiveAmount = CAPITAL_CALL_DECISIONS.reduce((s, d) => s + d.amount, 0)
    const pendingApprovalDecisions = CAPITAL_CALL_DECISIONS.filter(capitalCallHasPendingApprovalStep)
    const pendingApprovalAmount = pendingApprovalDecisions.reduce((s, d) => s + d.amount, 0)
    const pendingApprovalCount = pendingApprovalDecisions.length
    const readyToExecuteCount = CAPITAL_CALL_DECISIONS.filter(d => d.stage === 'execution').length
    const filteredNotices = useMemo(() => {
        const query = noticeSearch.trim().toLowerCase()
        return CAPITAL_CALL_DECISIONS.filter((notice) => {
            const status = getCapitalCallPostDealStatus(notice)
            if (noticeStatusFilter !== 'all' && status !== noticeStatusFilter) return false
            if (!query) return true

            const searchable = [
                notice.id,
                notice.title,
                notice.fund,
                notice.entity,
                notice.matchedInvestmentName,
                NOTICE_STATUS_META[status].label,
            ].join(' ').toLowerCase()

            return searchable.includes(query)
        })
    }, [noticeSearch, noticeStatusFilter])

    return (
        <div className={cn(
            'capital-activities-scroll flex flex-col flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden bg-[var(--color-white)] gap-[var(--spacing-5)] max-w-[1120px] w-full mx-auto px-[var(--spacing-6)] pb-[var(--spacing-5)]',
            hubLayout ? 'pt-4' : 'pt-9',
        )}>
            {uploadModalOpen ? (
                <UploadModal
                    onClose={() => setUploadModalOpen(false)}
                    onCreated={id => {
                        setUploadModalOpen(false)
                        setTimeout(() => onOpenDetail?.(id), 300)
                    }}
                />
            ) : null}
            {logModalOpen ? (
                <LogCapitalCallModal
                    onClose={() => setLogModalOpen(false)}
                    onCreated={id => {
                        setLogModalOpen(false)
                        setTimeout(() => onOpenDetail?.(id), 300)
                    }}
                />
            ) : null}

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="bg-white shrink-0">
                {hubLayout && onBackToPipeline ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <button
                            type="button"
                            onClick={onBackToPipeline}
                            className="flex items-center gap-1 text-[13px] font-medium text-[var(--color-neutral-10)] hover:text-[var(--color-black)] transition-colors shrink-0"
                        >
                            <IconChevronLeft size={16} stroke={2} aria-hidden />
                            Pipeline
                        </button>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] m-0">
                            Capital Activities
                        </p>
                    </div>
                ) : null}
                <div className="flex flex-col gap-2">
                    {!hubLayout ? (
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] m-0">
                            Capital Activities
                        </p>
                    ) : null}
                    <ContentHeader
                        title="Capital Activities"
                        actionLabel="Add"
                        actionIcon={IconPlus}
                        actionDropdownItems={[
                            {
                                label: 'Upload notice',
                                icon: IconCloudUpload,
                                onClick: () => setUploadModalOpen(true),
                            },
                            {
                                label: 'Enter manually',
                                icon: IconPencil,
                                onClick: () => setLogModalOpen(true),
                            },
                        ]}
                    />
                </div>
            </div>

                    {/* KPI overview: portfolio + in-flight calls (charts cover multi-year peak detail) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
                        <OverviewKpiTile label="Total committed" value={fmt(totalCommitted)} />
                        <OverviewKpiTile label="Remaining unfunded" value={fmt(totalRemaining)} />
                        <OverviewKpiTile label={`This year (${CURRENT_YEAR})`} value={fmt(thisYearTotal)} />
                        <OverviewKpiTile
                            label="Open call notices"
                            value={String(CAPITAL_CALL_DECISIONS.length)}
                            sub={`${fmt(totalActiveAmount)} · ${CAPITAL_CALL_COMMITMENTS.length} funds`}
                        />
                        <OverviewKpiTile
                            label="Pending approval"
                            value={fmt(pendingApprovalAmount)}
                            sub={
                                pendingApprovalCount > 0
                                    ? `${pendingApprovalCount} awaiting approval`
                                    : 'All approvals clear'
                            }
                            valueTone="accent"
                        />
                        <OverviewKpiTile
                            label="Ready to execute"
                            value={String(readyToExecuteCount)}
                            sub="Treasury-ready wire batch"
                            valueTone={readyToExecuteCount > 0 ? 'success' : 'default'}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-0.5">Annual Capital Calls</h3>
                                <p className="text-[12px] text-[var(--color-neutral-10)] m-0 mb-4">Projected liabilities by year, broken down by fund</p>
                                <div style={{ height: 220 }}>
                                    <ResponsiveBar
                                        data={annualData}
                                        keys={CAPITAL_CALL_COMMITMENTS.map(f => f.id)}
                                        indexBy="year"
                                        groupMode="stacked"
                                        layout="vertical"
                                        margin={{ top: 8, right: 8, bottom: 32, left: 52 }}
                                        padding={0.35}
                                        borderRadius={3}
                                        colors={bar => {
                                            const base = FUND_COLORS[String(bar.id)] ?? '#94A3B8'
                                            return hexToRgba(base, getForecastOpacity(String(bar.indexValue)))
                                        }}
                                        axisBottom={{ tickSize: 0, tickPadding: 10 }}
                                        axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 4, format: v => fmtAxis(v as number) }}
                                        axisTop={null}
                                        axisRight={null}
                                        enableGridX={false}
                                        enableGridY
                                        enableLabel={false}
                                        tooltip={AnnualBarTooltip}
                                        theme={CHART_THEME}
                                        animate={false}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                                    {CAPITAL_CALL_COMMITMENTS.map(fund => (
                                        <div key={fund.id} className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: FUND_COLORS[fund.id] }} />
                                            <span className="text-[11px] text-[var(--color-neutral-10)]">{fund.fundName.replace('Whitmore ', '')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-0.5">Cumulative Deployment</h3>
                                <p className="text-[12px] text-[var(--color-neutral-10)] m-0 mb-4">Capital deployed vs. remaining commitment over time</p>
                                <div style={{ height: 220 }}>
                                    <ResponsiveLine
                                        data={nivoLineData}
                                        margin={{ top: 8, right: 16, bottom: 32, left: 60 }}
                                        xScale={{ type: 'point' }}
                                        yScale={{ type: 'linear', min: 0, max: totalCommitted * 1.05 }}
                                        curve="monotoneX"
                                        colors={[CALLED_COLOR, UNCALLED_COLOR]}
                                        lineWidth={3.5}
                                        enablePointLabel={false}
                                        enablePoints
                                        pointSize={6}
                                        pointColor={{ from: 'serieColor' }}
                                        pointBorderWidth={2}
                                        pointBorderColor="#ffffff"
                                        layers={[
                                            'grid',
                                            'markers',
                                            'axes',
                                            'areas',
                                            'crosshair',
                                            'lines',
                                            'slices',
                                            'points',
                                            'mesh',
                                            'legends',
                                        ]}
                                        enableArea
                                        areaOpacity={1}
                                        areaBaselineValue={0}
                                        enableGridX={false}
                                        enableGridY
                                        axisBottom={{ tickSize: 0, tickPadding: 10 }}
                                        axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 4, format: v => fmtAxis(v as number) }}
                                        axisTop={null}
                                        axisRight={null}
                                        enableSlices="x"
                                        sliceTooltip={CumulativeTooltip}
                                        enableCrosshair
                                        crosshairType="x"
                                        theme={CHART_THEME}
                                        animate={false}
                                        defs={[
                                            {
                                                id: 'calledGrad',
                                                type: 'linearGradient',
                                                colors: [
                                                    { offset: 0, color: CALLED_COLOR, opacity: 0.14 },
                                                    { offset: 100, color: CALLED_COLOR, opacity: 0.02 },
                                                ],
                                            },
                                            {
                                                id: 'uncalledGrad',
                                                type: 'linearGradient',
                                                colors: [
                                                    { offset: 0, color: UNCALLED_COLOR, opacity: 0.12 },
                                                    { offset: 100, color: UNCALLED_COLOR, opacity: 0.02 },
                                                ],
                                            },
                                        ]}
                                        fill={[
                                            { match: { id: 'Called' }, id: 'calledGrad' },
                                            { match: { id: 'Uncalled' }, id: 'uncalledGrad' },
                                        ]}
                                    />
                                </div>
                                <div className="flex gap-4 mt-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-block w-6 h-1 rounded-[var(--radius-full)]" style={{ background: CALLED_COLOR }} />
                                        <span className="text-[11px] text-[var(--color-neutral-10)]">Called</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-block w-6 h-1 rounded-[var(--radius-full)]" style={{ background: UNCALLED_COLOR }} />
                                        <span className="text-[11px] text-[var(--color-neutral-10)]">Uncalled</span>
                                    </div>
                                </div>
                            </div>
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div>
                                <h2 className="m-0 text-[17px] font-semibold text-[var(--color-black)]">Capital call notices</h2>
                                <p className="m-0 mt-1 text-[12px] text-[var(--color-neutral-10)]">
                                    Individual post-deal calls received, verified, and released for payment.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex min-w-[220px] items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 py-2">
                                    <IconSearch size={14} stroke={2} className="shrink-0 text-[var(--color-neutral-9)]" />
                                    <input
                                        type="search"
                                        value={noticeSearch}
                                        onChange={(e) => setNoticeSearch(e.target.value)}
                                        placeholder="Search calls, funds, entities"
                                        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[12px] text-[var(--color-black)] outline-none placeholder:text-[var(--color-neutral-8)]"
                                    />
                                </div>
                                <select
                                    value={noticeStatusFilter}
                                    onChange={(e) => setNoticeStatusFilter(e.target.value as 'all' | CapitalCallPostDealStatus)}
                                    className="h-[34px] rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 text-[12px] font-medium text-[var(--color-neutral-11)] outline-none"
                                >
                                    {NOTICE_STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status === 'all' ? 'All statuses' : NOTICE_STATUS_META[status].label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {filteredNotices.map((notice) => {
                                const status = getCapitalCallPostDealStatus(notice)
                                const meta = NOTICE_STATUS_META[status]
                                return (
                                    <button
                                        key={notice.id}
                                        type="button"
                                        onClick={() => onOpenDetail?.(notice.id)}
                                        className="group grid w-full grid-cols-[minmax(360px,2fr)_minmax(140px,0.9fr)_minmax(84px,0.75fr)_minmax(84px,0.75fr)_auto] items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white px-5 py-4 text-left outline-none transition-colors hover:border-[var(--color-neutral-5)] hover:bg-[var(--color-neutral-2)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)] focus-visible:ring-offset-2"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-2 self-stretch rounded-full shrink-0" style={{ background: meta.dot }} />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <h3 className="m-0 truncate text-[14px] font-semibold text-[var(--color-black)]">{notice.title}</h3>
                                                    <span className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-neutral-10)]">
                                                        {notice.id}
                                                    </span>
                                                </div>
                                                <p className="m-0 mt-1 truncate text-[12px] text-[var(--color-neutral-10)]">
                                                    {notice.fund} · {notice.entity}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="m-0 text-[11px] text-[var(--color-neutral-9)] uppercase tracking-[0.05em] font-medium">Status</p>
                                            <span
                                                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold"
                                                style={{ background: meta.bg, color: meta.text }}
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.dot }} />
                                                {meta.label}
                                            </span>
                                        </div>
                                        <Stat label="Amount" value={fmt(notice.amount)} />
                                        <div>
                                            <p className="m-0 text-[11px] text-[var(--color-neutral-9)] uppercase tracking-[0.05em] font-medium">Due</p>
                                            <p className="m-0 mt-0.5 text-[14px] font-semibold tabular-nums text-[var(--color-black)]">{fmtShortDate(notice.dueDate)}</p>
                                        </div>
                                        <IconArrowRight size={15} stroke={2} className="justify-self-end text-[var(--color-neutral-8)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-accent-9)]" />
                                    </button>
                                )
                            })}

                            {filteredNotices.length === 0 ? (
                                <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-neutral-4)] bg-white px-5 py-8 text-center text-[13px] text-[var(--color-neutral-9)]">
                                    No capital call notices match the current filters.
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <h2 className="text-[17px] font-semibold text-[var(--color-black)] m-0">Capital Calls (Commitments)</h2>
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-0.5 rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-white)] p-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                                    {([
                                        { id: 'cards' as const, label: 'Cards', icon: IconLayoutGrid },
                                        { id: 'table' as const, label: 'Table', icon: IconTable },
                                    ]).map((mode) => {
                                        const ModeIcon = mode.icon
                                        return (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => setCommitmentsLayout(mode.id)}
                                            aria-label={`Show ${mode.label.toLowerCase()} view`}
                                            title={mode.label}
                                            className={cn(
                                                'flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border-none text-[var(--color-gray-12)] transition-colors',
                                                commitmentsLayout === mode.id
                                                    ? 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)] font-medium hover:bg-[var(--color-accent-3)]'
                                                    : 'bg-transparent text-[var(--color-gray-12)] hover:bg-[var(--color-neutral-3)]',
                                            )}
                                        >
                                            <ModeIcon size={16} stroke={2} />
                                        </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {commitmentsLayout === 'cards' ? (
                            <div className="flex flex-col gap-2">
                                {CAPITAL_CALL_COMMITMENTS.map((fund) => {
                                    const called = getTotalCalled(fund)
                                    const remaining = fund.totalCommitment - called
                                    const pctCalled = fund.totalCommitment > 0 ? Math.round((called / fund.totalCommitment) * 100) : 0
                                    const hasReceivedCall = fund.calls.some((call) => call.status === 'pending')
                                    return (
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            key={fund.id}
                                            onClick={() => openCommitmentDetail(fund.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    openCommitmentDetail(fund.id)
                                                }
                                            }}
                                            className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-5 py-4 grid grid-cols-[minmax(460px,2.6fr)_repeat(4,minmax(72px,0.7fr))_auto] items-center gap-3 cursor-pointer transition-colors hover:bg-[var(--color-neutral-2)] hover:border-[var(--color-neutral-5)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)] focus-visible:ring-offset-2"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-2 self-stretch rounded-full shrink-0" style={{ background: FUND_COLORS[fund.id] }} />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-[14px] font-semibold text-[var(--color-black)] truncate">{fund.fundName.replace('Whitmore ', '')}</span>
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-neutral-3)] text-[var(--color-neutral-10)]">Vintage {fund.vintage}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-[12px] text-[var(--color-neutral-10)] truncate">{fund.fundType}</span>
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap">
                                                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: hasReceivedCall ? 'var(--color-neutral-8)' : 'var(--color-neutral-6)' }} />
                                                            <span className={hasReceivedCall ? 'text-[var(--color-neutral-11)]' : 'text-[var(--color-neutral-9)]'}>
                                                                {hasReceivedCall ? 'Call received' : 'No active call'}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Stat label="Commitment" value={fmt(fund.totalCommitment)} />
                                            <Stat label="Called" value={fmt(called)} />
                                            <Stat label="Remaining" value={fmt(remaining)} accent={remaining > 0} />
                                            <Stat label="% Called" value={`${pctCalled}%`} />
                                            <div className="flex items-center justify-end gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                                                    aria-label="Edit fund"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <IconPencil size={15} stroke={2} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                                                    aria-label="Remove fund"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <IconTrash size={15} stroke={2} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="list-view">
                                <div className="max-h-[min(70vh,560px)] overflow-auto">
                                    <table className="list-table min-w-[920px]">
                                        <thead className="sticky top-0 z-[1] bg-[var(--color-white)]">
                                            <tr className="list-header-row">
                                                <th className="list-header-cell list-header-cell--name">Fund</th>
                                                <th className="list-header-cell w-[88px]">Vintage</th>
                                                <th className="list-header-cell min-w-[120px]">Type</th>
                                                <th className="list-header-cell min-w-[128px]">Call status</th>
                                                <th className="list-header-cell text-right">Commitment</th>
                                                <th className="list-header-cell text-right">Called</th>
                                                <th className="list-header-cell text-right">Remaining</th>
                                                <th className="list-header-cell text-right w-[88px]">% Called</th>
                                                <th className="list-header-cell text-right w-[88px]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {CAPITAL_CALL_COMMITMENTS.map((fund) => {
                                                const called = getTotalCalled(fund)
                                                const remaining = fund.totalCommitment - called
                                                const pctCalled = fund.totalCommitment > 0 ? Math.round((called / fund.totalCommitment) * 100) : 0
                                                const hasReceivedCall = fund.calls.some((call) => call.status === 'pending')
                                                return (
                                                    <tr
                                                        key={fund.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => openCommitmentDetail(fund.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault()
                                                                openCommitmentDetail(fund.id)
                                                            }
                                                        }}
                                                        className="list-row cursor-pointer"
                                                    >
                                                        <td className="list-cell list-cell--name">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <span className="w-1.5 self-stretch min-h-[36px] rounded-full shrink-0" style={{ background: FUND_COLORS[fund.id] }} />
                                                                <span className="font-semibold text-[var(--color-black)] truncate">{fund.fundName.replace('Whitmore ', '')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="list-cell text-[var(--color-neutral-11)] tabular-nums">{fund.vintage}</td>
                                                        <td className="list-cell text-[var(--color-neutral-11)]">{fund.fundType}</td>
                                                        <td className="list-cell">
                                                            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-neutral-11)]">
                                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: hasReceivedCall ? 'var(--color-neutral-8)' : 'var(--color-neutral-6)' }} />
                                                                {hasReceivedCall ? 'Call received' : 'No active call'}
                                                            </span>
                                                        </td>
                                                        <td className="list-cell text-right font-semibold tabular-nums text-[var(--color-black)]">{fmt(fund.totalCommitment)}</td>
                                                        <td className="list-cell text-right tabular-nums text-[var(--color-neutral-11)]">{fmt(called)}</td>
                                                        <td className={cn('list-cell text-right tabular-nums font-medium', remaining > 0 ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-neutral-11)]')}>
                                                            {fmt(remaining)}
                                                        </td>
                                                        <td className="list-cell text-right tabular-nums text-[var(--color-black)]">{pctCalled}%</td>
                                                        <td className="list-cell text-right">
                                                            <div className="inline-flex items-center justify-end gap-1">
                                                                <button
                                                                    type="button"
                                                                    className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                                                                    aria-label="Edit fund"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <IconPencil size={15} stroke={2} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                                                                    aria-label="Remove fund"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <IconTrash size={15} stroke={2} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="list-view rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] overflow-hidden !mt-0 !p-0">
                            <div className="px-5 py-4 border-b border-[var(--color-neutral-3)] bg-white">
                                <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-0.5">Year-by-Year Schedule</h3>
                                <p className="text-[12px] text-[var(--color-neutral-10)] m-0">Detailed projected calls per fund</p>
                            </div>
                            <table className="list-table">
                                <thead>
                                    <tr className="list-header-row">
                                        <th className="list-header-cell list-header-cell--name w-[80px]">Year</th>
                                        <th className="list-header-cell w-[120px]">Status</th>
                                        {CAPITAL_CALL_COMMITMENTS.map(fund => (
                                            <th key={fund.id} className="list-header-cell text-right">
                                                {fund.fundName.replace('Whitmore ', '').split(' Fund')[0]}
                                            </th>
                                        ))}
                                        <th className="list-header-cell text-right bg-[var(--color-card-orange-bg)] text-[var(--color-card-orange)]">Total</th>
                                        <th className="list-header-cell text-right">Cumulative</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        let cumulative = 0
                                        return FORECAST_YEARS.map(year => {
                                            const rowTotal = CAPITAL_CALL_COMMITMENTS.reduce((s, f) => s + (f.yearlyPacing[year] ?? 0), 0)
                                            const status = yearlyCallStatus[year]
                                            const isPaid = (status?.paid ?? 0) > 0 && rowTotal > 0 && (status?.pending ?? 0) === 0 && (status?.upcoming ?? 0) === 0
                                            const isConfirmed = (status?.pending ?? 0) > 0
                                            const statusLabel = isPaid ? 'Paid' : isConfirmed ? 'Confirmed' : 'Forecast'
                                            const trafficColor = rowTotal > 2_000_000 ? '#B91C1C' : rowTotal > 1_000_000 ? '#B45309' : '#059669'
                                            cumulative += rowTotal
                                            return (
                                                <tr
                                                    key={year}
                                                    className={cn(
                                                        'list-row',
                                                        year === CURRENT_YEAR && 'bg-[var(--color-blue-1)]/40',
                                                    )}
                                                >
                                                    <td className="list-cell list-cell--name font-semibold text-[var(--color-black)]">
                                                        <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                                            <span>{year}</span>
                                                            {year === CURRENT_YEAR && (
                                                                <span className="inline-flex items-center rounded-full bg-[var(--color-accent-3)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[var(--color-accent-11)]">
                                                                    Now
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="list-cell">
                                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-neutral-2)] px-2 py-1">
                                                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: trafficColor }} />
                                                            <span className="text-[11px] font-semibold text-[var(--color-neutral-11)]">{statusLabel}</span>
                                                        </div>
                                                    </td>
                                                    {CAPITAL_CALL_COMMITMENTS.map(fund => (
                                                        <td key={fund.id} className="list-cell text-right text-[var(--color-neutral-11)] tabular-nums">
                                                            {fund.yearlyPacing[year] ? fmt(fund.yearlyPacing[year]) : '—'}
                                                        </td>
                                                    ))}
                                                    <td className="list-cell text-right font-semibold text-[var(--color-card-orange)] tabular-nums bg-[var(--color-card-orange-bg)]">
                                                        {rowTotal ? fmt(rowTotal) : '—'}
                                                    </td>
                                                    <td className="list-cell text-right text-[var(--color-neutral-10)] tabular-nums">
                                                        {cumulative ? fmt(cumulative) : '—'}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    })()}
                                </tbody>
                            </table>
                    </div>
        </div>
    )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-[var(--color-neutral-9)] uppercase tracking-[0.05em] font-medium">{label}</span>
            <span className={`text-[14px] font-semibold tabular-nums ${accent ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-black)]'}`}>
                {value}
            </span>
        </div>
    )
}
