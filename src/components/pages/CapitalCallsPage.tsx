import { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveLine } from '@nivo/line'
import type { BarTooltipProps } from '@nivo/bar'
import type { SliceTooltipProps, DefaultSeries } from '@nivo/line'
import type { PartialTheme } from '@nivo/theming'
import { IconPencil, IconTrash, IconPlus } from '@tabler/icons-react'
import {
    CAPITAL_CALL_COMMITMENTS,
    getTotalCalled,
    getTotalRemaining,
} from '@/data/thornton/capital-calls-data'

const FORECAST_YEARS = ['2026', '2027', '2028', '2029', '2030', '2031']
const CURRENT_YEAR = String(new Date().getFullYear())

const FUND_COLORS: Record<string, string> = {
    'whitmore-capital-i': '#005BE2',
    'whitmore-ventures-ii': '#8B5CF6',
    'whitmore-real-assets-iii': '#60A5FA',
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
}

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

function hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace('#', '')
    const fullHex = clean.length === 3
        ? clean.split('').map(ch => ch + ch).join('')
        : clean
    const int = Number.parseInt(fullHex, 16)
    const r = (int >> 16) & 255
    const g = (int >> 8) & 255
    const b = int & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getForecastOpacity(year: string): number {
    if (year === CURRENT_YEAR) return 1
    if (year === '2027') return 0.9
    if (year === '2028') return 0.8
    if (year === '2029') return 0.72
    if (year === '2030') return 0.64
    return 0.56
}

type BarRow = Record<string, string | number>

function AnnualBarTooltip({ data }: BarTooltipProps<BarRow>) {
    const year = String(data['year'])
    return (
        <div className="rounded-lg px-3 py-2.5 shadow-lg border border-[var(--color-neutral-4)] bg-white min-w-[160px]">
            <div className="text-[11px] font-medium text-[var(--color-neutral-10)] mb-2">Year {year}</div>
            {CAPITAL_CALL_COMMITMENTS.map(fund => {
                const amount = Number(data[fund.id] ?? 0)
                if (!amount) return null
                return (
                    <div key={fund.id} className="flex items-center gap-2 mb-1 last:mb-0">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: FUND_COLORS[fund.id] }} />
                        <span className="text-[12px] text-[var(--color-neutral-11)] flex-1">{fund.fundName.replace('Whitmore ', '')}</span>
                        <span className="text-[12px] font-semibold text-[var(--color-black)] tabular-nums">{fmt(amount)}</span>
                    </div>
                )
            })}
        </div>
    )
}

const CALLED_COLOR = '#005BE2'
const UNCALLED_COLOR = '#93C5FD'

function CumulativeTooltip({ slice }: SliceTooltipProps<DefaultSeries>) {
    const calledPoint = slice.points.find(p => p.seriesId === 'Called')
    const uncalledPoint = slice.points.find(p => p.seriesId === 'Uncalled')
    const year = String(slice.points[0]?.data.x ?? '')
    return (
        <div className="rounded-lg px-3 py-2.5 shadow-lg border border-[var(--color-neutral-4)] bg-white min-w-[160px]">
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

export function CapitalCallsPage() {
    const totalCommitted = useMemo(
        () => CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + c.totalCommitment, 0),
        [],
    )
    const totalRemaining = useMemo(
        () => getTotalRemaining(CAPITAL_CALL_COMMITMENTS),
        [],
    )

    const annualData = useMemo<BarRow[]>(() =>
        FORECAST_YEARS.map(year => {
            const row: BarRow = { year }
            CAPITAL_CALL_COMMITMENTS.forEach(fund => {
                row[fund.id] = fund.yearlyPacing[year] ?? 0
            })
            return row
        }),
        [],
    )

    const annualTotals = useMemo(() =>
        Object.fromEntries(
            FORECAST_YEARS.map(year => [
                year,
                CAPITAL_CALL_COMMITMENTS.reduce((s, f) => s + (f.yearlyPacing[year] ?? 0), 0),
            ]),
        ),
        [],
    )

    const yearlyCallStatus = useMemo(() => {
        return Object.fromEntries(
            FORECAST_YEARS.map(year => {
                let paid = 0
                let pending = 0
                let upcoming = 0
                CAPITAL_CALL_COMMITMENTS.forEach(fund => {
                    fund.calls.forEach(call => {
                        if (!call.dueDate.startsWith(year)) return
                        if (call.status === 'paid') paid += call.amount
                        if (call.status === 'pending') pending += call.amount
                        if (call.status === 'upcoming') upcoming += call.amount
                    })
                })
                return [year, { paid, pending, upcoming }]
            }),
        )
    }, [])

    const thisYearTotal = annualTotals['2026'] ?? 0
    const peakYear = useMemo(() => {
        let max = 0
        let peak = '2026'
        FORECAST_YEARS.forEach(y => { if (annualTotals[y] > max) { max = annualTotals[y]; peak = y } })
        return { year: peak, amount: max }
    }, [annualTotals])

    const cumulativeData = useMemo(() => {
        const alreadyCalled = CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + getTotalCalled(c), 0)
        let runningCalled = alreadyCalled
        return FORECAST_YEARS.map(year => {
            runningCalled += annualTotals[year] ?? 0
            return {
                year,
                called: runningCalled,
                uncalled: Math.max(0, totalCommitted - runningCalled),
            }
        })
    }, [annualTotals, totalCommitted])

    const nivoLineData = useMemo(() => [
        {
            id: 'Called',
            data: cumulativeData.map(d => ({ x: d.year, y: d.called })),
        },
        {
            id: 'Uncalled',
            data: cumulativeData.map(d => ({ x: d.year, y: d.uncalled })),
        },
    ], [cumulativeData])

    return (
        <div className="flex flex-col flex-1 gap-[var(--spacing-5)] pt-[36px] px-[var(--spacing-6)] pb-8 max-w-[1120px] w-full mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] mb-2">
                        Liability Forecast
                    </p>
                    <h1 className="font-display text-[32px] font-bold text-[var(--color-black)] tracking-[-0.02em] leading-[1.1] m-0">
                        Know your future<br />capital calls.
                    </h1>
                    <p className="text-[14px] text-[var(--color-neutral-10)] mt-2 max-w-[480px] leading-[1.5]">
                        Add each fund commitment with its pacing assumptions and instantly see what you'll owe — and when.
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-accent-9)] bg-[var(--color-accent-9)] px-4 py-2 text-[13px] font-semibold text-white shrink-0 mt-2 transition-opacity hover:opacity-90">
                    <IconPlus size={15} stroke={2.5} />
                    Add commitment
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
                <KpiCard
                    label="Total committed"
                    value={fmt(totalCommitted)}
                />
                <KpiCard
                    label="Remaining unfunded"
                    value={fmt(totalRemaining)}
                />
                <KpiCard
                    label={`This year (${peakYear.year === '2026' ? '2026' : '2026'})`}
                    value={fmt(thisYearTotal)}
                />
                <KpiCard
                    label={`Peak (${peakYear.year})`}
                    value={fmt(peakYear.amount)}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Annual Capital Calls */}
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
                                const year = String(bar.indexValue)
                                return hexToRgba(base, getForecastOpacity(year))
                            }}
                            axisBottom={{ tickSize: 0, tickPadding: 10 }}
                            axisLeft={{
                                tickSize: 0,
                                tickPadding: 8,
                                tickValues: 4,
                                format: v => fmtAxis(v as number),
                            }}
                            axisTop={null}
                            axisRight={null}
                            enableGridX={false}
                            enableGridY={true}
                            enableLabel={false}
                            tooltip={AnnualBarTooltip}
                            theme={CHART_THEME}
                            animate={false}
                        />
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                        {CAPITAL_CALL_COMMITMENTS.map(fund => (
                            <div key={fund.id} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: FUND_COLORS[fund.id] }} />
                                <span className="text-[11px] text-[var(--color-neutral-10)]">{fund.fundName.replace('Whitmore ', '')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cumulative Deployment */}
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
                            lineWidth={2.5}
                            enablePoints
                            pointSize={7}
                            pointColor={point => (
                                point.serieId === 'Called' ? '#60A5FA' : '#BFDBFE'
                            )}
                            pointBorderWidth={2}
                            pointBorderColor="white"
                            enableArea
                            areaOpacity={1}
                            areaBaselineValue={0}
                            enableGridX={false}
                            enableGridY
                            axisBottom={{ tickSize: 0, tickPadding: 10 }}
                            axisLeft={{
                                tickSize: 0,
                                tickPadding: 8,
                                tickValues: 4,
                                format: v => fmtAxis(v as number),
                            }}
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
                                        { offset: 0, color: CALLED_COLOR, opacity: 0.18 },
                                        { offset: 100, color: CALLED_COLOR, opacity: 0.04 },
                                    ],
                                },
                                {
                                    id: 'uncalledGrad',
                                    type: 'linearGradient',
                                    colors: [
                                        { offset: 0, color: UNCALLED_COLOR, opacity: 0.18 },
                                        { offset: 100, color: UNCALLED_COLOR, opacity: 0.04 },
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
                            <span className="inline-block w-5 h-0.5 rounded" style={{ background: CALLED_COLOR }} />
                            <span className="text-[11px] text-[var(--color-neutral-10)]">Called</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-block w-5 h-0.5 rounded" style={{ background: UNCALLED_COLOR }} />
                            <span className="text-[11px] text-[var(--color-neutral-10)]">Uncalled</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Commitments Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[17px] font-semibold text-[var(--color-black)] m-0">Commitments</h2>
                    <span className="text-[12px] text-[var(--color-neutral-10)]">{CAPITAL_CALL_COMMITMENTS.length} funds</span>
                </div>
                <div className="flex flex-col gap-2">
                    {CAPITAL_CALL_COMMITMENTS.map(fund => {
                        const called = getTotalCalled(fund)
                        const remaining = fund.totalCommitment - called
                        const pctCalled = fund.totalCommitment > 0 ? Math.round((called / fund.totalCommitment) * 100) : 0
                        const hasReceivedCall = fund.calls.some(call => call.status === 'pending')
                        return (
                            <div
                                key={fund.id}
                                className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-5 py-4 grid grid-cols-[minmax(240px,1.4fr)_repeat(4,minmax(96px,1fr))_auto] items-center gap-4"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className="w-2 self-stretch rounded-full shrink-0"
                                        style={{ background: FUND_COLORS[fund.id] }}
                                    />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-[14px] font-semibold text-[var(--color-black)] truncate">{fund.fundName.replace('Whitmore ', '')}</span>
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-neutral-3)] text-[var(--color-neutral-10)]">
                                                Vintage {fund.vintage}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-[12px] text-[var(--color-neutral-10)] truncate">{fund.fundType}</span>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap">
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                                    style={{ background: hasReceivedCall ? '#B45309' : 'var(--color-neutral-6)' }}
                                                />
                                                <span className={hasReceivedCall ? 'text-[#B45309]' : 'text-[var(--color-neutral-9)]'}>
                                                    {hasReceivedCall ? 'Call received' : 'No active call'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Stat label="Commitment" value={fmt(fund.totalCommitment)} />
                                <Stat label="Called" value={`$${Math.round(called / 1_000_000)}M`} />
                                <Stat label="Remaining" value={fmt(remaining)} accent={remaining > 0} />
                                <Stat label="% Called" value={`${pctCalled}%`} />
                                <div className="flex items-center justify-end gap-2 shrink-0">
                                    <button className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors">
                                        <IconPencil size={15} stroke={2} />
                                    </button>
                                    <button className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors">
                                        <IconTrash size={15} stroke={2} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Year-by-Year Schedule Table */}
            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--color-neutral-3)]">
                    <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-0.5">Year-by-Year Schedule</h3>
                    <p className="text-[12px] text-[var(--color-neutral-10)] m-0">Detailed projected calls per fund</p>
                </div>
                <table className="w-full text-[13px] border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--color-neutral-3)]">
                            <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] w-[80px]">Year</th>
                            <th className="text-left px-2 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] w-[120px]">Status</th>
                            {CAPITAL_CALL_COMMITMENTS.map(fund => (
                                <th key={fund.id} className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">
                                    {fund.fundName.replace('Whitmore ', '').split(' Fund')[0]}
                                </th>
                            ))}
                            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] bg-[var(--color-card-orange-bg)]">Total</th>
                            <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">Cumulative</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            let cumulative = 0
                            return FORECAST_YEARS.map(year => {
                                const rowTotal = CAPITAL_CALL_COMMITMENTS.reduce(
                                    (s, f) => s + (f.yearlyPacing[year] ?? 0),
                                    0,
                                )
                                const status = yearlyCallStatus[year]
                                const isPaid = (status?.paid ?? 0) > 0 && rowTotal > 0 && (status?.pending ?? 0) === 0 && (status?.upcoming ?? 0) === 0
                                const isConfirmed = (status?.pending ?? 0) > 0
                                const statusLabel = isPaid ? 'Paid' : isConfirmed ? 'Confirmed' : 'Forecast'
                                const trafficColor = rowTotal > 2_000_000 ? '#B91C1C' : rowTotal > 1_000_000 ? '#B45309' : '#059669'
                                cumulative += rowTotal
                                return (
                                    <tr key={year} className="border-b border-[var(--color-neutral-3)] last:border-0 hover:bg-[var(--color-neutral-2)] transition-colors">
                                        <td className="px-5 py-3 font-semibold text-[var(--color-black)]">
                                            <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                                <span>{year}</span>
                                                {year === CURRENT_YEAR && (
                                                    <span className="inline-flex items-center rounded-full bg-[var(--color-accent-3)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[var(--color-accent-11)]">
                                                        Now
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: trafficColor }} />
                                                <span className="text-[11px] font-medium text-[var(--color-neutral-11)]">{statusLabel}</span>
                                            </div>
                                        </td>
                                        {CAPITAL_CALL_COMMITMENTS.map(fund => (
                                            <td key={fund.id} className="text-right px-4 py-3 text-[var(--color-neutral-11)] tabular-nums">
                                                {fund.yearlyPacing[year] ? fmt(fund.yearlyPacing[year]) : '—'}
                                            </td>
                                        ))}
                                        <td className="text-right px-4 py-3 font-semibold text-[var(--color-black)] tabular-nums bg-[var(--color-card-orange-bg)]">
                                            {rowTotal ? fmt(rowTotal) : '—'}
                                        </td>
                                        <td className="text-right px-5 py-3 text-[var(--color-neutral-10)] tabular-nums">
                                            {cumulative ? fmt(cumulative) : '—'}
                                        </td>
                                    </tr>
                                )
                            })
                        })()}
                    </tbody>
                </table>
                <div className="px-5 py-3 border-t border-[var(--color-neutral-3)]">
                    <p className="text-[11px] text-[var(--color-neutral-9)] m-0 italic">
                        Pacing assumptions are estimates. Actual call timing may vary.
                    </p>
                </div>
            </div>
        </div>
    )
}

function KpiCard({ label, value, highlight, meta }: { label: string; value: string; highlight?: boolean; meta?: string }) {
    return (
        <div className={`rounded-[var(--radius-xl)] px-5 py-4 border flex flex-col gap-1 ${highlight ? 'bg-[var(--color-neutral-3)] border-[var(--color-neutral-5)]' : 'bg-white border-[var(--color-neutral-4)]'}`}>
            {meta && (
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] text-[var(--color-neutral-9)]">{meta}</span>
                </div>
            )}
            <div className={`font-display text-[26px] font-bold tracking-[-0.02em] leading-none ${highlight ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-black)]'}`}>
                {value}
            </div>
            <div className="text-[12px] text-[var(--color-neutral-10)]">{label}</div>
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
