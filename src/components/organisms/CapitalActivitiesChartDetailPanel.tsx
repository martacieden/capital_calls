import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { IconArrowRight } from '@tabler/icons-react'
import { DetailPanelShell } from '@/components/molecules/DetailPanelShell'
import { PortfolioSimpleBreadcrumb } from '@/components/organisms/PortfolioCategoryDetailPanel'
import {
    CAPITAL_CALL_COMMITMENTS,
    getTotalCalled,
    type CapitalCall,
    type CapitalCallCommitment,
    type CapitalCallStatus,
} from '@/data/thornton/capital-calls-data'

const FORECAST_YEARS = ['2026', '2027', '2028', '2029', '2030', '2031'] as const

const COMMITMENT_ID_TO_CAPCALL_DETAIL: Record<string, string> = {
    'greentech-fund-iii': 'CAPCAL-1',
    'whitmore-capital-i': 'CAPCAL-3',
    'whitmore-ventures-ii': 'CAPCAL-4',
    'whitmore-real-assets-iii': 'CAPCAL-2',
}

const FUND_COLORS: Record<string, string> = {
    'greentech-fund-iii': '#059669',
    'whitmore-capital-i': '#005BE2',
    'whitmore-ventures-ii': '#8B5CF6',
    'whitmore-real-assets-iii': '#93C5FD',
}

export type CapitalChartDrill =
    | { kind: 'annual-bar'; year: string; fundId: string }
    | { kind: 'cumulative-line'; year: string; seriesId: 'Called' | 'Uncalled' }

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`
    return `$${v.toLocaleString()}`
}

function fundShortLabel(fundId: string): string {
    const c = CAPITAL_CALL_COMMITMENTS.find(f => f.id === fundId)
    return c ? c.fundName.replace('Whitmore ', '') : fundId
}

function callsScheduledInYear(commitment: CapitalCallCommitment, year: string): CapitalCall[] {
    return commitment.calls.filter(call => call.dueDate.startsWith(year))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

function callStatusLabel(status: CapitalCallStatus): string {
    if (status === 'paid') return 'Paid'
    if (status === 'pending') return 'In flight'
    return 'Scheduled'
}

function formatDueShort(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export interface CapitalActivitiesChartDetailPanelProps {
    drill: CapitalChartDrill | null
    isOpen: boolean
    onClose: () => void
    onOpenCapCall?: (capCallId: string) => void
}

export function CapitalActivitiesChartDetailPanel({
    drill,
    isOpen,
    onClose,
    onOpenCapCall,
}: CapitalActivitiesChartDetailPanelProps) {
    const totalCommitted = useMemo(
        () => CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + c.totalCommitment, 0),
        [],
    )

    const annualTotals = useMemo(
        () =>
            Object.fromEntries(
                FORECAST_YEARS.map(year => [
                    year,
                    CAPITAL_CALL_COMMITMENTS.reduce((s, f) => s + (f.yearlyPacing[year] ?? 0), 0),
                ]),
            ),
        [],
    )

    const cumulativeByYear = useMemo(() => {
        const alreadyCalled = CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + getTotalCalled(c), 0)
        let runningCalled = alreadyCalled
        const out: Record<string, { called: number; uncalled: number }> = {}
        for (const year of FORECAST_YEARS) {
            runningCalled += annualTotals[year] ?? 0
            out[year] = {
                called: runningCalled,
                uncalled: Math.max(0, totalCommitted - runningCalled),
            }
        }
        return out
    }, [annualTotals, totalCommitted])

    const topPacingInYear = useMemo(() => {
        return (year: string) =>
            [...CAPITAL_CALL_COMMITMENTS]
                .map(c => ({ commitment: c, amt: c.yearlyPacing[year] ?? 0 }))
                .filter(x => x.amt > 0)
                .sort((a, b) => b.amt - a.amt)
    }, [])

    if (!drill || !isOpen) return null

    const capIdForCommitment =
        drill.kind === 'annual-bar' ? COMMITMENT_ID_TO_CAPCALL_DETAIL[drill.fundId] : undefined

    let breadcrumbCurrent = ''
    let eyebrow = ''
    let leadAmount = ''
    let leadCaption = ''
    let previewBarPct = 0
    let previewColor = 'var(--color-accent-9)'
    let previewBarCaption = ''

    const summaryRows: Array<[string, string]> = []
    let annualContextRow: [string, string] | null = null

    if (drill.kind === 'annual-bar') {
        const fund = CAPITAL_CALL_COMMITMENTS.find(f => f.id === drill.fundId)
        const segment = fund ? fund.yearlyPacing[drill.year] ?? 0 : 0
        const yearTotal = annualTotals[drill.year] ?? 0
        const pct = yearTotal > 0 ? Math.round((segment / yearTotal) * 100) : 0
        previewBarPct = pct
        previewColor = FUND_COLORS[drill.fundId] ?? 'var(--color-accent-9)'

        breadcrumbCurrent = `Commitment · ${fundShortLabel(drill.fundId)} · ${drill.year}`
        eyebrow = 'Commitment · forecast pacing'
        leadAmount = fmt(segment)
        leadCaption =
            `Model draw for this LP commitment in ${drill.year}. Actual capital calls follow notices and wire workflow — see below when a linked record exists.`
        previewBarCaption = 'Share of all commitments\' projected calls this year'

        if (yearTotal > 0) {
            annualContextRow = ['All commitments, this year (model)', `${fmt(yearTotal)} · this fund ${pct}%`]
        } else {
            annualContextRow = ['All commitments, this year (model)', '—']
        }
    } else {
        const row = cumulativeByYear[drill.year]
        const called = row?.called ?? 0
        const uncalled = row?.uncalled ?? 0
        const focus = drill.seriesId === 'Called' ? called : uncalled

        breadcrumbCurrent = `All commitments · ${drill.year} · ${drill.seriesId === 'Called' ? 'Funded' : 'Unfunded'}`
        eyebrow = 'Portfolio roll-up'
        leadAmount = fmt(focus)
        leadCaption =
            drill.seriesId === 'Called'
                ? 'Cumulative paid-in across every LP commitment through this year (from schedule + history).'
                : 'Unfunded remainder after projected pacing through this year — not a single fund, entire book.'

        previewBarPct =
            totalCommitted > 0 ? Math.min(100, Math.round((called / totalCommitted) * 100)) : 0
        previewColor = drill.seriesId === 'Called' ? '#93C5FD' : '#1C2024'
        previewBarCaption = 'Funded vs total commitment base'

        summaryRows.push(['Called (cumulative)', fmt(called)])
        summaryRows.push(['Uncalled (cumulative)', fmt(uncalled)])
        summaryRows.push(['Total commitment base', fmt(totalCommitted)])
    }

    const fund = drill.kind === 'annual-bar'
        ? CAPITAL_CALL_COMMITMENTS.find(f => f.id === drill.fundId)
        : null
    const paidIn = fund ? getTotalCalled(fund) : 0
    const unfunded = fund ? Math.max(0, fund.totalCommitment - paidIn) : 0
    const pctFunded = fund && fund.totalCommitment > 0
        ? Math.round((paidIn / fund.totalCommitment) * 100)
        : 0
    const yearCalls = fund ? callsScheduledInYear(fund, drill.year) : []
    const pacingTop = drill.kind === 'cumulative-line' ? topPacingInYear(drill.year) : []

    return createPortal(
        <DetailPanelShell
            isOpen={isOpen}
            onClose={onClose}
            ariaLabel="Commitment and chart detail"
            breadcrumbs={(
                <PortfolioSimpleBreadcrumb
                    parentLabel="Capital Activities"
                    currentLabel={breadcrumbCurrent}
                    onParentClick={onClose}
                />
            )}
        >
            <div className="flex flex-col gap-[var(--spacing-5)]">
                <div>
                    <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)]">
                        {eyebrow}
                    </p>
                    <p className="m-0 mt-2 font-display text-[32px] font-black leading-tight tracking-[-0.02em] text-[var(--color-gray-12)] tabular-nums">
                        {leadAmount}
                    </p>
                    <p className="m-0 mt-2 text-[13px] leading-snug text-[var(--color-neutral-10)]">
                        {leadCaption}
                    </p>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-3)] bg-[var(--color-neutral-2)] p-4">
                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)]">
                        {previewBarCaption}
                    </p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-neutral-4)]">
                        <div
                            className="h-full rounded-full transition-[width] duration-300"
                            style={{
                                width: `${previewBarPct}%`,
                                background: previewColor,
                            }}
                        />
                    </div>
                </div>

                {annualContextRow ? (
                    <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-3)] bg-white px-4 py-3">
                        <div className="grid grid-cols-[1fr_auto] items-baseline gap-4">
                            <span className="text-[12px] text-[var(--color-neutral-10)]">{annualContextRow[0]}</span>
                            <span className="text-[12px] font-semibold tabular-nums text-[var(--color-black)]">
                                {annualContextRow[1]}
                            </span>
                        </div>
                    </div>
                ) : null}

                {drill.kind === 'annual-bar' && fund ? (
                    <>
                        <div>
                            <h3 className="m-0 text-[13px] font-semibold text-[var(--color-black)]">
                                This commitment
                            </h3>
                            <p className="m-0 mt-1 text-[12px] text-[var(--color-neutral-10)]">
                                {fund.fundName} · {fund.fundType} · vintage {fund.vintage}
                            </p>
                            <div className="mt-3 flex flex-col divide-y divide-[var(--color-neutral-3)] border-t border-b border-[var(--color-neutral-3)]">
                                {(
                                    [
                                        ['Total commitment', fmt(fund.totalCommitment)],
                                        ['Paid-in to date', fmt(paidIn)],
                                        ['Remaining unfunded', fmt(unfunded)],
                                        ['Funded (%)', `${pctFunded}%`],
                                    ] as const
                                ).map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-2.5"
                                    >
                                        <span className="text-[13px] text-[var(--color-neutral-10)]">{label}</span>
                                        <span className="text-[13px] font-semibold tabular-nums text-[var(--color-black)]">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="m-0 text-[13px] font-semibold text-[var(--color-black)]">
                                Capital calls in {drill.year}
                            </h3>
                            <p className="m-0 mt-1 text-[12px] leading-snug text-[var(--color-neutral-10)]">
                                Individual draws with due dates. A separate{' '}
                                <span className="font-semibold text-[var(--color-neutral-11)]">capital call</span>
                                {' '}record covers the notice, wire approvals, and funding workflow.
                            </p>
                            {yearCalls.length === 0 ? (
                                <p className="m-0 mt-2 rounded-[var(--radius-md)] bg-[var(--color-neutral-2)] px-3 py-2 text-[12px] text-[var(--color-neutral-10)]">
                                    No calls in this year with a scheduled due date — the bar reflects model pacing only for this period.
                                </p>
                            ) : (
                                <ul className="m-0 mt-2 list-none space-y-2 p-0">
                                    {yearCalls.map(call => (
                                        <li
                                            key={call.id}
                                            className="rounded-[var(--radius-md)] border border-[var(--color-neutral-3)] bg-white px-3 py-2"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-[12px] font-semibold text-[var(--color-black)]">
                                                    Call #{call.callNumber}
                                                </span>
                                                <span className="text-[11px] font-medium text-[var(--color-neutral-9)]">
                                                    {callStatusLabel(call.status)}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--color-neutral-10)]">
                                                <span>{formatDueShort(call.dueDate)}</span>
                                                <span className="font-semibold tabular-nums text-[var(--color-black)]">
                                                    {fmt(call.amount)}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {capIdForCommitment && onOpenCapCall ? (
                            <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)]/60 p-4">
                                <h3 className="m-0 text-[13px] font-semibold text-[var(--color-black)]">
                                    Capital call record (workflow)
                                </h3>
                                <p className="m-0 mt-1 text-[12px] leading-snug text-[var(--color-neutral-10)]">
                                    Demo link to the post-deal record for this commitment: notice PDF, validation, approvals, and wire release —{' '}
                                    <span className="font-mono text-[var(--color-neutral-11)]">{capIdForCommitment}</span>.
                                </p>
                                <button
                                    type="button"
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-neutral-11)] transition-colors hover:bg-[var(--color-neutral-2)]"
                                    onClick={() => onOpenCapCall(capIdForCommitment)}
                                >
                                    Open capital call record
                                    <IconArrowRight size={16} stroke={2} aria-hidden />
                                </button>
                            </div>
                        ) : null}
                    </>
                ) : null}

                {drill.kind === 'cumulative-line' ? (
                    <div>
                        <h3 className="m-0 text-[13px] font-semibold text-[var(--color-black)]">
                            Projected draws in {drill.year} (by commitment)
                        </h3>
                        <p className="m-0 mt-1 text-[12px] text-[var(--color-neutral-10)]">
                            Where this year’s model pacing sits across funds — open a bar on the chart for a full commitment view.
                        </p>
                        {pacingTop.length === 0 ? (
                            <p className="m-0 mt-2 text-[12px] text-[var(--color-neutral-9)]">No pacing in this year.</p>
                        ) : (
                            <ul className="m-0 mt-2 list-none space-y-1.5 p-0">
                                {pacingTop.map(({ commitment, amt }) => (
                                    <li
                                        key={commitment.id}
                                        className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-neutral-3)] bg-white px-3 py-2"
                                    >
                                        <span className="min-w-0 truncate text-[12px] text-[var(--color-neutral-11)]">
                                            {commitment.fundName.replace('Whitmore ', '')}
                                        </span>
                                        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[var(--color-black)]">
                                            {fmt(amt)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : null}

                {drill.kind === 'cumulative-line' && summaryRows.length > 0 ? (
                    <div className="flex flex-col divide-y divide-[var(--color-neutral-3)] border-t border-b border-[var(--color-neutral-3)]">
                        {summaryRows.map(([label, value]) => (
                            <div
                                key={label}
                                className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3"
                            >
                                <span className="text-[13px] text-[var(--color-neutral-10)]">{label}</span>
                                <span className="text-[13px] font-semibold tabular-nums text-[var(--color-black)]">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </DetailPanelShell>,
        document.body,
    )
}
