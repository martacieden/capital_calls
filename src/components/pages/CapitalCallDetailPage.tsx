import { useState } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveLine } from '@nivo/line'
import type { BarTooltipProps } from '@nivo/bar'
import type { SliceTooltipProps, DefaultSeries } from '@nivo/line'
import type { PartialTheme } from '@nivo/theming'
import {
    IconExternalLink, IconShare, IconDotsVertical,
    IconCheck, IconAlertTriangle, IconFlag,
    IconArrowRight,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { getDecisionById, getCapitalCallPostDealStatus } from '@/data/thornton/capital-call-decisions-data'
import type { CapitalCallDecision, CapitalCallPostDealStatus } from '@/data/thornton/capital-call-decisions-data'
import { CAPITAL_CALL_COMMITMENTS, getTotalCalled } from '@/data/thornton/capital-calls-data'
import type { CapitalCallCommitment } from '@/data/thornton/capital-calls-data'

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
    return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDisplay(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
    return `$${v.toLocaleString('en-US')}`
}

function fmtAxis(v: number): string {
    if (v >= 1_000_000) return `$${v / 1_000_000}M`
    if (v >= 1_000) return `$${v / 1_000}K`
    return `$${v}`
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function daysUntil(iso: string): number {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const due = new Date(iso)
    due.setHours(0, 0, 0, 0)
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace('#', '')
    const fullHex = clean.length === 3 ? clean.split('').map(ch => ch + ch).join('') : clean
    const int = Number.parseInt(fullHex, 16)
    return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`
}

const DETAIL_FORECAST_YEARS = ['2026', '2027', '2028', '2029', '2030', '2031']
const DETAIL_CURRENT_YEAR = String(new Date().getFullYear())
const DETAIL_CALLED_COLOR = '#005BE2'
const DETAIL_UNCALLED_COLOR = '#93C5FD'

const DETAIL_FUND_COLORS: Record<string, string> = {
    'greentech-fund-iii': '#059669',
    'whitmore-capital-i': '#005BE2',
    'whitmore-ventures-ii': '#8B5CF6',
    'whitmore-real-assets-iii': '#93C5FD',
}

const DETAIL_FUND_TO_COMMITMENT_ID: Record<string, string> = {
    'Greentech Opportunities Fund III, L.P.': 'greentech-fund-iii',
    'Whitmore Capital Fund I, L.P.': 'whitmore-capital-i',
    'Whitmore Ventures Fund II, L.P.': 'whitmore-ventures-ii',
    'Whitmore Real Assets Fund III, L.P.': 'whitmore-real-assets-iii',
}

const DETAIL_CHART_THEME: PartialTheme = {
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
}

type DetailBarRow = Record<string, string | number>

function getDetailForecastOpacity(year: string): number {
    if (year <= DETAIL_CURRENT_YEAR) return 1
    if (year === '2027') return 0.95
    if (year === '2028') return 0.9
    if (year === '2029') return 0.85
    if (year === '2030') return 0.82
    return 0.78
}

function getCommitmentForDecision(decision: CapitalCallDecision): CapitalCallCommitment | null {
    const mappedId = DETAIL_FUND_TO_COMMITMENT_ID[decision.fund]
    if (mappedId) {
        return CAPITAL_CALL_COMMITMENTS.find(commitment => commitment.id === mappedId) ?? null
    }

    const matchedName = decision.matchedInvestmentName.toLowerCase()
    return CAPITAL_CALL_COMMITMENTS.find(commitment => matchedName.includes(commitment.fundName.toLowerCase().replace(' fund', ''))) ?? null
}

// ─── status model ────────────────────────────────────────────────────────────

const STATUS_META: Record<CapitalCallPostDealStatus, { label: string; dot: string; text: string; bg: string }> = {
    'awaiting-execution': { label: 'Awaiting e-sign',    dot: '#9CA3AF', text: '#374151', bg: '#F9FAFB' },
    'uploaded':           { label: 'Uploaded',            dot: '#2563EB', text: '#1D4ED8', bg: '#EFF6FF' },
    'verified':           { label: 'Verified',            dot: '#7C3AED', text: '#5B21B6', bg: '#F5F3FF' },
    'ready-to-release':   { label: 'Ready to release',    dot: '#D97706', text: '#9A3412', bg: '#FFF7ED' },
    'paid':               { label: 'Paid',                dot: '#059669', text: '#065F46', bg: '#ECFDF5' },
}

const STATUS_ORDER: CapitalCallPostDealStatus[] = [
    'awaiting-execution', 'uploaded', 'verified', 'ready-to-release', 'paid',
]

const ADVANCE_LABELS: Record<CapitalCallPostDealStatus, string> = {
    'awaiting-execution': 'Mark execution complete',
    'uploaded':           'Mark as verified',
    'verified':           'Mark ready to release',
    'ready-to-release':   'Mark as paid',
    'paid':               '',
}

function nextStatus(s: CapitalCallPostDealStatus): CapitalCallPostDealStatus | null {
    const idx = STATUS_ORDER.indexOf(s)
    return idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1]! : null
}

// ─── sub-components ──────────────────────────────────────────────────────────

function MatchBadge({ status }: { status: 'match' | 'mismatch' | 'changed' }) {
    if (status === 'match') return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-semibold text-[#065F46]">
            <IconCheck size={11} stroke={2.5} />
            MATCH
        </span>
    )
    if (status === 'changed') return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-[11px] font-semibold text-[#92400E]">
            <IconAlertTriangle size={11} stroke={2.5} />
            CHANGED
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-[11px] font-semibold text-[#991B1B]">
            <IconAlertTriangle size={11} stroke={2.5} />
            MISMATCH
        </span>
    )
}

function DetailAnnualTooltip({ data, commitment }: BarTooltipProps<DetailBarRow> & { commitment: CapitalCallCommitment }) {
    const year = String(data.year)
    const amount = Number(data[commitment.id] ?? 0)

    return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-white px-3 py-2.5 shadow-lg">
            <p className="m-0 text-[11px] font-medium text-[var(--color-neutral-10)]">Year {year}</p>
            <p className="m-0 mt-1 text-[13px] font-semibold tabular-nums text-[var(--color-black)]">{fmtDisplay(amount)}</p>
        </div>
    )
}

function DetailCumulativeTooltip({ slice }: SliceTooltipProps<DefaultSeries>) {
    const calledPoint = slice.points.find(point => point.seriesId === 'Called')
    const uncalledPoint = slice.points.find(point => point.seriesId === 'Uncalled')
    const year = String(slice.points[0]?.data.x ?? '')

    return (
        <div className="min-w-[150px] rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-white px-3 py-2.5 shadow-lg">
            <p className="m-0 mb-2 text-[11px] font-medium text-[var(--color-neutral-10)]">Year {year}</p>
            {calledPoint ? (
                <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: DETAIL_CALLED_COLOR }} />
                    <span className="flex-1 text-[12px] text-[var(--color-neutral-11)]">Called</span>
                    <span className="text-[12px] font-semibold tabular-nums text-[var(--color-black)]">{fmtDisplay(calledPoint.data.y as number)}</span>
                </div>
            ) : null}
            {uncalledPoint ? (
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: DETAIL_UNCALLED_COLOR }} />
                    <span className="flex-1 text-[12px] text-[var(--color-neutral-11)]">Uncalled</span>
                    <span className="text-[12px] font-semibold tabular-nums text-[var(--color-black)]">{fmtDisplay(uncalledPoint.data.y as number)}</span>
                </div>
            ) : null}
        </div>
    )
}

function DetailCallAnalytics({ commitment, decisionAmount }: { commitment: CapitalCallCommitment | null; decisionAmount: number }) {
    if (!commitment) {
        return (
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white p-5">
                <h3 className="m-0 text-[17px] font-semibold text-[var(--color-black)]">Call analytics</h3>
                <p className="m-0 mt-1 text-[12px] text-[var(--color-neutral-9)]">
                    No matching commitment found for this capital call.
                </p>
            </div>
        )
    }

    const fundColor = DETAIL_FUND_COLORS[commitment.id] ?? DETAIL_CALLED_COLOR
    const annualData: DetailBarRow[] = DETAIL_FORECAST_YEARS.map(year => ({
        year,
        [commitment.id]: commitment.yearlyPacing[year] ?? 0,
    }))
    const annualTotal = annualData.reduce((sum, row) => sum + Number(row[commitment.id] ?? 0), 0)
    const lineData = (() => {
        let runningCalled = getTotalCalled(commitment)
        const cumulativeRows = DETAIL_FORECAST_YEARS.map(year => {
            runningCalled += commitment.yearlyPacing[year] ?? 0
            return {
                year,
                called: runningCalled,
                uncalled: Math.max(0, commitment.totalCommitment - runningCalled),
            }
        })

        return [
            { id: 'Called', data: cumulativeRows.map(row => ({ x: row.year, y: row.called })) },
            { id: 'Uncalled', data: cumulativeRows.map(row => ({ x: row.year, y: row.uncalled })) },
        ]
    })()

    return (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="m-0 text-[17px] font-semibold text-[var(--color-black)]">Call analytics</h3>
                    <p className="m-0 mt-1 text-[12px] text-[var(--color-neutral-10)]">
                        Fund-level pacing filtered to {commitment.fundName}.
                    </p>
                </div>
                <div className="shrink-0 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-3 py-1.5 text-right">
                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">This call</p>
                    <p className="m-0 text-[13px] font-semibold tabular-nums text-[var(--color-black)]">{fmtDisplay(decisionAmount)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-3)] p-4">
                    <h4 className="m-0 text-[13px] font-semibold text-[var(--color-black)]">Annual Capital Calls</h4>
                    <p className="m-0 mt-0.5 text-[11px] text-[var(--color-neutral-9)]">{fmtDisplay(annualTotal)} projected across remaining years</p>
                    <div className="mt-3 h-[180px]">
                        <ResponsiveBar
                            data={annualData}
                            keys={[commitment.id]}
                            indexBy="year"
                            margin={{ top: 8, right: 8, bottom: 30, left: 48 }}
                            padding={0.38}
                            borderRadius={3}
                            colors={bar => hexToRgba(fundColor, getDetailForecastOpacity(String(bar.indexValue)))}
                            axisBottom={{ tickSize: 0, tickPadding: 8 }}
                            axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 4, format: value => fmtAxis(value as number) }}
                            axisTop={null}
                            axisRight={null}
                            enableGridX={false}
                            enableGridY
                            enableLabel={false}
                            tooltip={(props) => <DetailAnnualTooltip {...props} commitment={commitment} />}
                            theme={DETAIL_CHART_THEME}
                            animate={false}
                        />
                    </div>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-3)] p-4">
                    <h4 className="m-0 text-[13px] font-semibold text-[var(--color-black)]">Cumulative Deployment</h4>
                    <p className="m-0 mt-0.5 text-[11px] text-[var(--color-neutral-9)]">Called vs remaining commitment over time</p>
                    <div className="mt-3 h-[180px]">
                        <ResponsiveLine
                            data={lineData}
                            margin={{ top: 8, right: 12, bottom: 30, left: 52 }}
                            xScale={{ type: 'point' }}
                            yScale={{ type: 'linear', min: 0, max: commitment.totalCommitment * 1.05 }}
                            curve="monotoneX"
                            colors={[DETAIL_CALLED_COLOR, DETAIL_UNCALLED_COLOR]}
                            lineWidth={2.5}
                            enablePoints
                            pointSize={6}
                            pointColor={{ from: 'serieColor' }}
                            pointBorderWidth={2}
                            pointBorderColor="#ffffff"
                            enableArea
                            areaOpacity={1}
                            areaBaselineValue={0}
                            enableGridX={false}
                            enableGridY
                            axisBottom={{ tickSize: 0, tickPadding: 8 }}
                            axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 4, format: value => fmtAxis(value as number) }}
                            axisTop={null}
                            axisRight={null}
                            enableSlices="x"
                            sliceTooltip={DetailCumulativeTooltip}
                            enableCrosshair
                            crosshairType="x"
                            theme={DETAIL_CHART_THEME}
                            animate={false}
                            defs={[
                                {
                                    id: 'detailCalledGrad',
                                    type: 'linearGradient',
                                    colors: [
                                        { offset: 0, color: DETAIL_CALLED_COLOR, opacity: 0.18 },
                                        { offset: 100, color: DETAIL_CALLED_COLOR, opacity: 0.04 },
                                    ],
                                },
                                {
                                    id: 'detailUncalledGrad',
                                    type: 'linearGradient',
                                    colors: [
                                        { offset: 0, color: DETAIL_UNCALLED_COLOR, opacity: 0.18 },
                                        { offset: 100, color: DETAIL_UNCALLED_COLOR, opacity: 0.04 },
                                    ],
                                },
                            ]}
                            fill={[
                                { match: { id: 'Called' }, id: 'detailCalledGrad' },
                                { match: { id: 'Uncalled' }, id: 'detailUncalledGrad' },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── PDF mock ────────────────────────────────────────────────────────────────

function PdfMock({ pdfName, pdfPages, pdfSizeKb, fund, entity, gp, amount, commitment, createdDate, dueDate, callNumber, wireInstructions }: {
    pdfName: string
    pdfPages: number
    pdfSizeKb: number
    fund: string
    entity: string
    gp: string
    amount: number
    commitment: number
    createdDate: string
    dueDate: string
    callNumber: number
    wireInstructions: { beneficiary: string; bank: string; aba: string; account: string; swift: string; reference: string }
}) {
    const [page, setPage] = useState(1)
    const commitmentPct = Math.round((amount / commitment) * 100)
    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[#F8F8F9]">
            <div className="flex w-full min-w-0 shrink-0 items-center justify-between gap-3 border-b border-[var(--color-neutral-4)] bg-white px-4 py-3">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[#FEE2E2] flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect width="14" height="14" rx="3" fill="#EF4444" fillOpacity="0.1" />
                            <path d="M3 3.5h5.5L10 5v5.5H3V3.5z" stroke="#EF4444" strokeWidth="1.2" fill="none" />
                            <path d="M8.5 3.5V5H10" stroke="#EF4444" strokeWidth="1.2" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="m-0 text-[12px] font-semibold text-[var(--color-black)] truncate">{pdfName}</p>
                        <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">{pdfPages} pages · {pdfSizeKb} KB</p>
                    </div>
                </div>
                <a
                    href={`#pdf-${encodeURIComponent(pdfName)}`}
                    className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-[var(--color-accent-9)] hover:underline"
                    onClick={(e) => e.preventDefault()}
                >
                    Open
                    <IconExternalLink size={13} stroke={2} aria-hidden />
                </a>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="p-4">
                <div className="bg-white rounded-[var(--radius-lg)] p-6 text-[11px] leading-[1.6]" style={{ fontFamily: 'Georgia, serif' }}>
                    {page === 1 ? (
                        <>
                            <div className="border-b border-[#E5E7EB] pb-4 mb-4">
                                <p className="m-0 text-[10px] font-bold tracking-[0.12em] uppercase text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {gp.toUpperCase()}
                                </p>
                            </div>
                            <p className="m-0 text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                CAPITAL CALL NOTICE · CALL #{String(callNumber).padStart(2, '0')}
                            </p>
                            <h2 className="m-0 text-[18px] font-normal text-[#111827] leading-[1.3] mb-3">
                                {fund.replace(', L.P.', ',')}
                                <br />L.P.
                            </h2>
                            <p className="m-0 text-[11px] text-[#374151] mb-0.5">To: {entity}</p>
                            <p className="m-0 text-[11px] text-[#374151] mb-3">
                                Re: Notice of capital call dated {formatDate(createdDate)}
                            </p>
                            <p className="m-0 text-[10.5px] text-[#374151] mb-4 leading-[1.65]">
                                Pursuant to Section 4.2 of the Limited Partnership Agreement, the General Partner hereby calls for the contribution of capital from the Limited Partner in the amount set forth below.
                            </p>
                            <div className="border border-[#E5E7EB] rounded-[var(--radius-lg)] p-4 mb-4">
                                <p className="m-0 text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    CAPITAL CONTRIBUTION DUE
                                </p>
                                <p className="m-0 text-[22px] font-semibold text-[#111827] tracking-[-0.01em] leading-none mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {fmt(amount)} USD
                                </p>
                                <p className="m-0 text-[10px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Representing {commitmentPct}% of total commitment ({fmt(commitment)})
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <p className="m-0 text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>NOTICE DATE</p>
                                    <p className="m-0 text-[11px] text-[#111827]">{formatDate(createdDate)}</p>
                                </div>
                                <div>
                                    <p className="m-0 text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>FUNDING DEADLINE</p>
                                    <p className="m-0 text-[11px] text-[#111827]">
                                        {new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · 5:00 PM ET
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="m-0 text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    WIRE INSTRUCTIONS
                                </p>
                                <div className="space-y-1">
                                    {([
                                        ['Beneficiary', wireInstructions.beneficiary],
                                        ['Bank', wireInstructions.bank],
                                        ['ABA', wireInstructions.aba],
                                        ['Account', wireInstructions.account],
                                        ['SWIFT', wireInstructions.swift],
                                        ['Reference', wireInstructions.reference],
                                    ] as const).map(([label, value]) => (
                                        <div key={label} className="grid grid-cols-[72px_1fr] gap-1">
                                            <span className="text-[10px] text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span>
                                            <span className="text-[10px] text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-[#E5E7EB] mt-5 pt-3 flex items-center justify-between">
                                <p className="m-0 text-[9px] text-[#9CA3AF] italic" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Meridian Capital Partners · Confidential
                                </p>
                                <p className="m-0 text-[9px] text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Page 1 of {pdfPages}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
                            <p className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif' }}>Page {page} of {pdfPages}</p>
                            <p className="text-[11px] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Schedule of LP interests and representations</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-3 mt-3">
                    <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="text-[11px] text-[var(--color-neutral-9)] hover:text-[var(--color-black)] disabled:opacity-30">
                        ‹ Prev
                    </button>
                    <span className="text-[11px] text-[var(--color-neutral-10)]">Page {page} of {pdfPages}</span>
                    <button type="button" onClick={() => setPage(p => Math.min(pdfPages, p + 1))} disabled={page === pdfPages}
                        className="text-[11px] text-[var(--color-neutral-9)] hover:text-[var(--color-black)] disabled:opacity-30">
                        Next ›
                    </button>
                </div>
            </div>
            </div>
        </div>
    )
}

// ─── Verify fields ────────────────────────────────────────────────────────────

function buildVerifyFields(decision: CapitalCallDecision): Array<{
    label: string
    noticeSays: string
    onFile: string
    status: 'match' | 'mismatch' | 'changed'
    note?: string
    aiConfidence?: number
}> {
    const commitmentPct = Math.round((decision.amount / decision.commitment) * 100)
    return [
        {
            label: 'Fund / GP',
            noticeSays: `${decision.fund} / ${decision.gp}`,
            onFile: `${decision.fund} / ${decision.gp}`,
            status: 'match',
            aiConfidence: 99,
        },
        {
            label: 'Limited Partner',
            noticeSays: decision.entity,
            onFile: decision.entity,
            status: 'match',
            aiConfidence: 100,
        },
        {
            label: 'Amount called',
            noticeSays: `${fmt(decision.amount)} USD`,
            onFile: `${fmt(decision.amount)} USD (${commitmentPct}% of $${decision.commitment.toLocaleString('en-US')} commitment)`,
            status: 'match',
            aiConfidence: 98,
        },
        {
            label: 'Call number',
            noticeSays: `Call #${String(decision.callNumber).padStart(2, '0')}`,
            onFile: `#${decision.callNumber} of ${decision.totalCalls} · next in sequence`,
            status: 'match',
            note: `${decision.priorCallsDrawn} prior calls drawn, sequence verified`,
            aiConfidence: 97,
        },
        {
            label: 'Funding deadline',
            noticeSays: `${new Date(decision.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · 5:00 PM ET`,
            onFile: '— · T+22 days from notice',
            status: 'match',
            aiConfidence: 96,
        },
        {
            label: 'Wire instructions',
            noticeSays: `ABA ${decision.wireInstructions.aba} / Account ${decision.wireInstructions.account} / ${decision.wireInstructions.bank}`,
            onFile: `ABA ${decision.wireInstructions.aba} / Account ${decision.wireInstructions.account} / ${decision.wireInstructions.bank}`,
            status: 'match',
            note: 'Wire instructions unchanged from previous call',
            aiConfidence: 94,
        },
    ]
}

// ─── main component ──────────────────────────────────────────────────────────

interface Props {
    id: string
    onBack: () => void
    investmentId?: string
    investmentName?: string
}

export function CapitalCallDetailPage({ id, onBack, investmentName }: Props) {
    const decision = getDecisionById(id)
    const [localStatus, setLocalStatus] = useState<CapitalCallPostDealStatus>(
        decision ? getCapitalCallPostDealStatus(decision) : 'uploaded'
    )

    if (!decision) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center text-[var(--color-neutral-9)]">
                Decision not found.
            </div>
        )
    }

    const statusMeta = STATUS_META[localStatus]
    const currentStatusIndex = STATUS_ORDER.indexOf(localStatus)

    function advanceStatus() {
        const next = nextStatus(localStatus)
        if (next) setLocalStatus(next)
    }

    const commitmentPct = Math.round((decision.amount / decision.commitment) * 100)
    const unfundedAmount = Math.round(decision.commitment * (1 - decision.drawnBefore))
    const accountLast4 = decision.wireInstructions.account.slice(-4)
    const compactTitle = `Call #${decision.callNumber} · ${fmtDisplay(decision.amount)} capital call`
    const compactFund = decision.fund.replace(', L.P.', '')
    const matchedCommitment = getCommitmentForDecision(decision)

    const pdfProps = {
        pdfName: decision.pdfName,
        pdfPages: decision.pdfPages,
        pdfSizeKb: decision.pdfSizeKb,
        fund: decision.fund,
        entity: decision.entity,
        gp: decision.gp,
        amount: decision.amount,
        commitment: decision.commitment,
        createdDate: decision.createdDate,
        dueDate: decision.dueDate,
        callNumber: decision.callNumber,
        wireInstructions: decision.wireInstructions,
    }

    const dueDays = daysUntil(decision.dueDate)
    const firstPendingIdx = decision.approvals.findIndex(a => a.status === 'pending')
    const verifyFields = buildVerifyFields(decision)
    const validationChecks = [
        {
            label: 'Match check',
            note: `${commitmentPct}% of ${fmtDisplay(decision.commitment)} = ${fmtDisplay(decision.amount)}`,
            status: 'match' as const,
        },
        {
            label: 'Ledger check',
            note: `Unfunded commitment (${fmtDisplay(unfundedAmount)}) covers this call`,
            status: 'match' as const,
        },
        {
            label: 'Bank details',
            note: decision.wireMatchedCallNumber
                ? `Matches Call #${decision.wireMatchedCallNumber} on record`
                : 'Bank details captured from notice',
            status: 'match' as const,
        },
        {
            label: 'IC approval on record',
            note: `Investment Committee approved ${decision.matchedInvestmentName}`,
            status: 'match' as const,
        },
    ]

    return (
        <div className="relative flex flex-col flex-1 h-full overflow-hidden max-w-[1120px] w-full mx-auto">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="px-6 pt-9 pb-5 bg-white shrink-0">
                <nav
                    className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm leading-snug text-[var(--color-neutral-10)]"
                    aria-label="Breadcrumb"
                >
                    <button
                        type="button"
                        onClick={onBack}
                        className="bg-transparent border-none p-0 text-inherit font-medium cursor-pointer transition-colors hover:text-[var(--color-black)]"
                    >
                        Capital Activities
                    </button>
                    <span className="text-[var(--color-neutral-7)]">/</span>
                    {investmentName ? (
                        <>
                            <span className="max-w-[280px] truncate">{investmentName}</span>
                            <span className="text-[var(--color-neutral-7)]">/</span>
                        </>
                    ) : null}
                    <span className="font-mono text-[12px] text-[var(--color-neutral-9)]">{decision.id}</span>
                </nav>

                <div className="mt-4 flex w-full flex-wrap items-start justify-between gap-4 overflow-visible">
                    <div className="min-w-0">
                        <h1 className="m-0 min-w-0 truncate font-display text-[28px] font-black leading-[1.25] tracking-[-0.02em] text-[var(--color-gray-12)] [-webkit-text-stroke:0.3px_currentColor]">
                            {compactTitle}
                        </h1>
                        <p className="m-0 mt-1 text-[13px] text-[var(--color-neutral-10)]">
                            {compactFund} · {decision.entity} · {decision.gp}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <button type="button" className="flex min-h-[32px] items-center justify-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 py-0.5 text-[13px] font-medium text-[var(--color-neutral-11)] transition-colors hover:bg-[var(--color-neutral-2)]">
                            <IconShare size={14} stroke={2} />
                            Share
                        </button>
                        <button type="button" className="flex min-h-[32px] items-center justify-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 py-0.5 text-[13px] font-medium text-[var(--color-neutral-11)] transition-colors hover:bg-[var(--color-neutral-2)]">
                            Actions
                            <IconDotsVertical size={14} stroke={2} />
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="text-[12px] text-[var(--color-neutral-9)]">
                            Call #{decision.callNumber} of {decision.totalCalls}
                        </span>
                        <span className="text-[12px] text-[var(--color-neutral-9)]">
                            Due {new Date(decision.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>

                    <div
                        className="flex max-w-full flex-wrap items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-neutral-2)] px-2.5 py-1.5"
                        aria-label={`Status: ${statusMeta.label}. Step ${currentStatusIndex + 1} of ${STATUS_ORDER.length}.`}
                    >
                        <span className="flex min-w-0 shrink items-center gap-1.5 border-r border-[var(--color-neutral-4)] pr-2">
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ background: statusMeta.dot }}
                                aria-hidden
                            />
                            <span className="truncate text-[12px] font-semibold text-[var(--color-black)]">
                                {statusMeta.label}
                            </span>
                        </span>
                        <div className="flex items-center">
                            {STATUS_ORDER.map((step, idx) => {
                                const isCompleted = idx < currentStatusIndex
                                const isCurrent = idx === currentStatusIndex
                                return (
                                    <div key={step} className="group relative flex items-center shrink-0">
                                        <span
                                            className={`h-2 w-2 rounded-full transition-colors ${
                                                isCompleted
                                                    ? 'bg-[var(--color-neutral-10)]'
                                                    : isCurrent
                                                      ? 'bg-[var(--color-accent-9)]'
                                                      : 'bg-[var(--color-neutral-5)]'
                                            }`}
                                        />
                                        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-2 py-1 text-[11px] font-medium text-[var(--color-neutral-11)] shadow-[var(--shadow-dropdown)] group-hover:block">
                                            {STATUS_META[step].label}
                                        </span>
                                        {idx < STATUS_ORDER.length - 1 && (
                                            <span className={`mx-1 h-px w-4 shrink-0 ${isCompleted ? 'bg-[var(--color-neutral-8)]' : 'bg-[var(--color-neutral-5)]'}`} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <span className="text-[12px] font-semibold tabular-nums text-[var(--color-black)]">
                            {currentStatusIndex + 1}/{STATUS_ORDER.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Body ────────────────────────────────────────────────────────── */}
            <div className={cn('flex-1 min-h-0 overflow-y-auto px-6', localStatus !== 'paid' ? 'pb-28' : 'pb-6')}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="flex min-w-0 flex-col gap-5">
                        <section className="rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white p-5">
                            <h3 className="m-0 text-[17px] font-semibold text-[var(--color-black)]">Details</h3>
                            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:gap-x-16">
                                {([
                                    ['Call amount', fmtDisplay(decision.amount)],
                                    ['% of total commitment', `${commitmentPct}%`],
                                    ['Due date', new Date(decision.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })],
                                    ['Status', statusMeta.label],
                                    ['Bank account (last 4)', `••••${accountLast4}`],
                                    ['Routing number', decision.wireInstructions.aba],
                                ] as const).map(([label, value]) => (
                                    <div key={label} className="grid grid-cols-[minmax(0,1fr)] items-start gap-1.5 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center sm:gap-3">
                                        <p className="m-0 text-[13px] text-[var(--color-neutral-10)]">{label}</p>
                                        <span className="inline-flex min-w-0 w-fit max-w-full rounded-[var(--radius-sm)] bg-[var(--color-neutral-2)] px-2.5 py-1 text-[14px] font-semibold text-[var(--color-black)] tabular-nums">
                                            <span className="truncate">{value}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <DetailCallAnalytics commitment={matchedCommitment} decisionAmount={decision.amount} />

                        <section className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="m-0 text-[17px] font-semibold text-[var(--color-black)]">Validation checks</h3>
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[var(--color-neutral-11)]">
                                        <IconCheck size={12} stroke={2.5} className="text-[var(--color-green-9)]" />
                                        {verifyFields.filter(field => field.status === 'match').length}/{verifyFields.length}
                                    </span>
                                </div>
                                <div className="mt-4 hidden min-[480px]:grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-[var(--color-neutral-3)] pb-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-neutral-9)]">
                                    <span>Item</span>
                                    <span className="text-right">Outcome</span>
                                </div>
                                <div className="mt-3 flex flex-col divide-y divide-[var(--color-neutral-3)] min-[480px]:mt-2">
                                    {validationChecks.map((check) => (
                                        <div
                                            key={check.label}
                                            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                                        >
                                            <IconCheck
                                                size={15}
                                                stroke={2.3}
                                                className="mt-0.5 shrink-0 text-[var(--color-green-9)]"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="m-0 text-[13px] font-semibold text-[var(--color-black)]">{check.label}</p>
                                                <p className="m-0 mt-0.5 text-[12px] leading-snug text-[var(--color-neutral-10)]">
                                                    {check.note}
                                                </p>
                                            </div>
                                            <div className="shrink-0 pt-0.5 min-[480px]:pt-0">
                                                <MatchBadge status={check.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                        {decision.activityLog.length > 0 && (
                            <section className="rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white p-5">
                                <h3 className="m-0 text-[15px] font-semibold text-[var(--color-black)]">Activity</h3>
                                <div className="mt-4 flex flex-col">
                                    {[...decision.activityLog].reverse().map((entry, idx) => (
                                        <div key={idx} className="flex items-start gap-3 border-b border-[var(--color-neutral-3)] py-3 first:pt-0 last:border-b-0 last:pb-0">
                                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-neutral-7)]" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-semibold text-[var(--color-black)]">{entry.actor}</span>
                                                    {entry.isAI && (
                                                        <span className="rounded-full bg-[var(--color-accent-1)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-accent-9)]">AI</span>
                                                    )}
                                                </div>
                                                <p className="m-0 mt-0.5 text-[12px] leading-snug text-[var(--color-neutral-10)]">{entry.action}</p>
                                            </div>
                                            <span className="shrink-0 pt-0.5 text-[11px] text-[var(--color-neutral-9)]">{entry.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="flex min-w-0 flex-col gap-4">
                        <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white">
                            <div className="h-[420px] overflow-hidden bg-[#F8F8F9]">
                                <PdfMock {...pdfProps} />
                            </div>
                        </section>

                        <section className="rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white p-4">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="m-0 text-[14px] font-semibold text-[var(--color-black)]">Wire approval</h3>
                                <span className="rounded-full bg-[var(--color-blue-1)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-accent-9)]">In progress</span>
                            </div>
                            <div className="mt-4 flex flex-col gap-3">
                                {decision.approvals.map((approval, idx) => {
                                    const isApproved = approval.status === 'approved'
                                    const isBottleneck = !isApproved && idx === firstPendingIdx
                                    return (
                                        <div
                                            key={approval.id}
                                            className={cn(
                                                'flex items-start gap-3 rounded-[var(--radius-lg)] px-3 py-2.5',
                                                isApproved && 'bg-[var(--color-blue-1)]/60',
                                                isBottleneck && 'bg-[#FFFBEB] ring-1 ring-[#FCD34D]',
                                            )}
                                        >
                                            <div className={cn(
                                                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                                                isApproved ? 'bg-[#ECFDF5] text-[var(--color-green-9)]' : isBottleneck ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[var(--color-neutral-2)] text-[var(--color-neutral-9)]',
                                            )}>
                                                {isApproved ? <IconCheck size={13} stroke={2.4} /> : idx + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="m-0 text-[13px] font-semibold leading-snug text-[var(--color-black)]">{approval.role}</p>
                                                <p className="m-0 mt-0.5 text-[11px] text-[var(--color-neutral-9)]">{approval.name}</p>
                                            </div>
                                            <span className={cn(
                                                'mt-0.5 shrink-0 text-[11px] font-semibold',
                                                isApproved ? 'text-[var(--color-green-9)]' : isBottleneck ? 'text-[#D97706]' : 'text-[var(--color-neutral-9)]',
                                            )}>
                                                {isApproved ? 'approved' : isBottleneck ? 'awaiting' : 'pending'}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {localStatus !== 'paid' ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-6 pb-4 pt-2">
                    <div
                        className="pointer-events-auto mx-auto flex max-w-full flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white px-4 py-3 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.16)] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                        role="region"
                        aria-label="Next step"
                    >
                        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <span className="shrink-0 text-[13px] font-semibold text-[var(--color-black)]">Next step</span>
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-blue-1)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-accent-9)]">
                                    <span
                                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                                        style={{ background: statusMeta.dot }}
                                        aria-hidden
                                    />
                                    {statusMeta.label}
                                </span>
                                <span className="text-[12px] text-[var(--color-neutral-10)]">
                                    <span className="text-[var(--color-neutral-7)]" aria-hidden>→ </span>
                                    {ADVANCE_LABELS[localStatus]}
                                </span>
                                {dueDays <= 14 && dueDays >= 0 ? (
                                    <span className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-[#FFFBEB] px-2 py-1 text-[11px] font-medium text-[#92400E]">
                                        <IconAlertTriangle size={12} stroke={2} className="shrink-0 text-[#D97706]" aria-hidden />
                                        Due in {dueDays} day{dueDays !== 1 ? 's' : ''}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
                            <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--color-neutral-11)] transition-colors hover:bg-[var(--color-neutral-2)]"
                            >
                                <IconFlag size={13} stroke={2} aria-hidden />
                                Flag
                            </button>
                            <button
                                type="button"
                                onClick={advanceStatus}
                                className="flex min-w-[140px] items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                            >
                                {ADVANCE_LABELS[localStatus]}
                                <IconArrowRight size={13} stroke={2.5} aria-hidden />
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
