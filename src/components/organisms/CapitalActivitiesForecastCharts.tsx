import { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveLine } from '@nivo/line'
import type { BarTooltipProps } from '@nivo/bar'
import type { SliceTooltipProps, DefaultSeries } from '@nivo/line'
import type { PartialTheme } from '@nivo/theming'
import { showToast } from '@/components/atoms/Toast'
import type { CapitalChartDrill } from '@/components/organisms/CapitalActivitiesChartDetailPanel'
import { CAPITAL_CALL_COMMITMENTS } from '@/data/thornton/capital-calls-data'
import { buildCumulativeProjectionByYear, addScenarioToCumulative } from '@/lib/capital-charts'

const FORECAST_YEARS = ['2026', '2027', '2028', '2029', '2030', '2031'] as const
const CURRENT_YEAR = String(new Date().getFullYear())

const FUND_COLORS: Record<string, string> = {
    'greentech-fund-iii': '#059669',
    'whitmore-capital-i': '#005BE2',
    'whitmore-ventures-ii': '#8B5CF6',
    'whitmore-real-assets-iii': '#93C5FD',
    __modeled__: '#64748B',
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

const CUMULATIVE_LINE_THEME: PartialTheme = {
    ...CHART_THEME,
    grid: { line: { stroke: '#E8EAED', strokeWidth: 1, strokeDasharray: '4 4' } },
}

const CALLED_COLOR = '#D4AF37'
const UNCALLED_COLOR = '#1A2B4B'
const MODELED_LINE_COLOR = '#A78BFA'

type BarRow = Record<string, string | number>

export type ModeledCommitmentForCharts = {
    fundName: string
    totalCommitment: number
    yearlyPacing: Record<string, number>
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
            {Number(data.__modeled__ ?? 0) > 0 ? (
                <div className="grid grid-cols-[8px_minmax(0,1fr)_64px] items-start gap-2 mt-2 pt-2 border-t border-[var(--color-neutral-3)]">
                    <span className="w-2 h-2 rounded-sm shrink-0 border border-dashed border-[var(--color-neutral-6)] bg-[var(--color-neutral-3)]" />
                    <span className="text-[12px] leading-[1.35] text-[var(--color-neutral-11)]">Modeled commitment (preview)</span>
                    <span className="text-right text-[12px] font-semibold text-[var(--color-black)] tabular-nums">{fmt(Number(data.__modeled__ ?? 0))}</span>
                </div>
            ) : null}
        </div>
    )
}

function cumulativeLineLegendLabel(seriesId: string): string {
    if (seriesId === 'Called (paid)') return 'Called'
    if (seriesId === 'Remaining commitment') return 'Uncalled'
    if (seriesId === 'Called incl. modeled (proj.)') return 'Called (incl. modeled)'
    return seriesId
}

function CumulativeTooltip({ slice }: SliceTooltipProps<DefaultSeries>) {
    const year = String(slice.points[0]?.data.x ?? '')
    return (
        <div className="w-[240px] rounded-[var(--radius-lg)] px-3.5 py-2.5 shadow-lg border border-[var(--color-neutral-4)] bg-white">
            <div className="text-[11px] font-medium text-[var(--color-neutral-10)] mb-2">Year {year}</div>
            {slice.points.map(point => (
                <div key={point.seriesId} className="flex items-center gap-2 mb-1 last:mb-0">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: point.seriesColor }} />
                    <span className="min-w-0 flex-1 text-[12px] leading-snug text-[var(--color-neutral-11)]">
                        {cumulativeLineLegendLabel(point.seriesId)} : {fmt(point.data.y as number)}
                    </span>
                </div>
            ))}
        </div>
    )
}

export interface CapitalActivitiesForecastChartsProps {
    modeledCommitment: ModeledCommitmentForCharts | null
    onChartDrill?: (d: CapitalChartDrill) => void
}

export function CapitalActivitiesForecastCharts({ modeledCommitment, onChartDrill }: CapitalActivitiesForecastChartsProps) {
    const totalCommitted = useMemo(() => CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + c.totalCommitment, 0), [])

    const annualData = useMemo<BarRow[]>(() =>
        FORECAST_YEARS.map(year => {
            const row: BarRow = { year }
            CAPITAL_CALL_COMMITMENTS.forEach(fund => {
                row[fund.id] = fund.yearlyPacing[year] ?? 0
            })
            if (modeledCommitment) {
                row.__modeled__ = modeledCommitment.yearlyPacing[year] ?? 0
            }
            return row
        }), [modeledCommitment])

    const cumulativeData = useMemo(
        () => buildCumulativeProjectionByYear(CAPITAL_CALL_COMMITMENTS, FORECAST_YEARS),
        [],
    )

    const nivoLineData = useMemo(() => {
        const baseCalled = { id: 'Called (paid)', data: cumulativeData.map(d => ({ x: d.year, y: d.called })) }
        const baseRemaining = { id: 'Remaining commitment', data: cumulativeData.map(d => ({ x: d.year, y: d.uncalled })) }
        if (!modeledCommitment) {
            return [baseCalled, baseRemaining]
        }
        const withModeled = addScenarioToCumulative(
            cumulativeData,
            { totalCommitment: modeledCommitment.totalCommitment, yearlyPacing: modeledCommitment.yearlyPacing },
            totalCommitted,
        )
        return [
            baseCalled,
            baseRemaining,
            {
                id: 'Called incl. modeled (proj.)',
                data: withModeled.map(d => ({ x: d.year, y: d.called })),
            },
        ]
    }, [cumulativeData, modeledCommitment, totalCommitted])

    const barKeys = useMemo(
        () => [...CAPITAL_CALL_COMMITMENTS.map(f => f.id), ...(modeledCommitment ? ['__modeled__' as const] : [])],
        [modeledCommitment],
    )

    const { lineYMax, cumulativeYTicks } = useMemo(() => {
        const cap = totalCommitted + (modeledCommitment?.totalCommitment ?? 0)
        const raw = cap * 1.05
        if (raw <= 0) {
            return { lineYMax: 1_000_000, cumulativeYTicks: [0, 500_000, 1_000_000] }
        }
        const stepsMil = [1, 2, 2.5, 5, 10, 15, 20, 25, 50, 100, 150, 200, 250, 500] as const
        let step = stepsMil[stepsMil.length - 1] * 1_000_000
        for (const m of stepsMil) {
            const s = m * 1_000_000
            if (Math.ceil(raw / s) <= 7) {
                step = s
                break
            }
        }
        const max = Math.max(step, Math.ceil(raw / step) * step)
        const ticks: number[] = []
        for (let v = 0; v <= max; v += step) ticks.push(v)
        return { lineYMax: max, cumulativeYTicks: ticks }
    }, [totalCommitted, modeledCommitment])

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                <h3 className="font-display text-[17px] font-semibold text-[var(--color-black)] m-0 mb-0.5 tracking-[-0.01em]">Annual Capital Calls</h3>
                <p className="text-[12px] text-[var(--color-neutral-10)] m-0 mb-4">Projected liabilities by year, broken down by fund</p>
                <div style={{ height: 220 }}>
                    <ResponsiveBar
                        data={annualData}
                        keys={barKeys}
                        indexBy="year"
                        groupMode="stacked"
                        layout="vertical"
                        margin={{ top: 8, right: 8, bottom: 32, left: 52 }}
                        padding={0.35}
                        borderRadius={3}
                        colors={bar => {
                            const id = String(bar.id)
                            const base = FUND_COLORS[id] ?? '#94A3B8'
                            const op = getForecastOpacity(String(bar.indexValue))
                            if (id === '__modeled__') return hexToRgba(base, Math.min(0.92, op))
                            return hexToRgba(base, op)
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
                        defs={[
                            {
                                id: 'modeledHatch',
                                type: 'patternLines',
                                background: 'transparent',
                                color: '#475569',
                                rotation: -45,
                                lineWidth: 1,
                                spacing: 5,
                            },
                        ]}
                        fill={[{ match: { id: '__modeled__' }, id: 'modeledHatch' }]}
                        onClick={bar => {
                            if (String(bar.id) === '__modeled__') {
                                showToast('Preview segment only — not linked to a live commitment record.', 'info')
                                return
                            }
                            onChartDrill?.({
                                kind: 'annual-bar',
                                year: String(bar.indexValue),
                                fundId: String(bar.id),
                            })
                        }}
                    />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                    {CAPITAL_CALL_COMMITMENTS.map(fund => (
                        <div key={fund.id} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: FUND_COLORS[fund.id] }} />
                            <span className="text-[11px] text-[var(--color-neutral-10)]">{fund.fundName.replace('Whitmore ', '')}</span>
                        </div>
                    ))}
                    {modeledCommitment ? (
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm shrink-0 border border-dashed border-[var(--color-neutral-6)] bg-[var(--color-neutral-3)]" />
                            <span className="text-[11px] text-[var(--color-neutral-10)]">Modeled (preview)</span>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                <h3 className="font-display text-[17px] font-semibold text-[var(--color-black)] m-0 mb-0.5 tracking-[-0.01em]">Cumulative Deployment</h3>
                <p className="text-[12px] text-[var(--color-neutral-10)] m-0 mb-4">Capital deployed vs. remaining commitment over time</p>
                <div style={{ height: 280 }}>
                    <ResponsiveLine
                        data={nivoLineData}
                        margin={{ top: 10, right: 14, bottom: 36, left: 56 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 0, max: lineYMax }}
                        curve="monotoneX"
                        colors={({ id }) => {
                            if (id === 'Called incl. modeled (proj.)') return MODELED_LINE_COLOR
                            if (id === 'Remaining commitment') return UNCALLED_COLOR
                            return CALLED_COLOR
                        }}
                        lineWidth={2.75}
                        enablePointLabel={false}
                        enablePoints
                        pointSize={7}
                        pointColor={{ from: 'serieColor' }}
                        pointBorderWidth={2}
                        pointBorderColor="#ffffff"
                        onClick={raw => {
                            if (!onChartDrill) return
                            if (!raw || typeof raw !== 'object') return
                            if (!('data' in raw) || !('serieId' in raw)) return
                            const { x, y } = raw.data as { x: string; y: number }
                            const sid = raw.serieId as string
                            if (sid === 'Remaining commitment') {
                                onChartDrill({
                                    kind: 'cumulative-line',
                                    year: String(x),
                                    seriesId: 'Uncalled',
                                })
                                return
                            }
                            if (sid === 'Called incl. modeled (proj.)') {
                                onChartDrill({
                                    kind: 'cumulative-line',
                                    year: String(x),
                                    seriesId: 'Modeled',
                                    focusValue: y,
                                })
                                return
                            }
                            if (sid === 'Called (paid)') {
                                onChartDrill({
                                    kind: 'cumulative-line',
                                    year: String(x),
                                    seriesId: 'Called',
                                })
                            }
                        }}
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
                        axisLeft={{
                            tickSize: 0,
                            tickPadding: 8,
                            tickValues: cumulativeYTicks,
                            format: v => fmtAxis(v as number),
                        }}
                        axisTop={null}
                        axisRight={null}
                        enableSlices="x"
                        sliceTooltip={CumulativeTooltip}
                        enableCrosshair
                        crosshairType="x"
                        theme={CUMULATIVE_LINE_THEME}
                        animate={false}
                        defs={[
                            {
                                id: 'calledGrad',
                                type: 'linearGradient',
                                colors: [
                                    { offset: 0, color: CALLED_COLOR, opacity: 0.22 },
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
                            {
                                id: 'modeledLineGrad',
                                type: 'linearGradient',
                                colors: [
                                    { offset: 0, color: MODELED_LINE_COLOR, opacity: 0.16 },
                                    { offset: 100, color: MODELED_LINE_COLOR, opacity: 0.03 },
                                ],
                            },
                        ]}
                        fill={[
                            { match: { id: 'Called (paid)' }, id: 'calledGrad' },
                            { match: { id: 'Remaining commitment' }, id: 'uncalledGrad' },
                            { match: { id: 'Called incl. modeled (proj.)' }, id: 'modeledLineGrad' },
                        ]}
                    />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-3">
                    <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-0.5">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CALLED_COLOR }} />
                            <span className="h-px w-4 shrink-0" style={{ background: CALLED_COLOR }} />
                        </span>
                        <span className="text-[11px] text-[var(--color-neutral-10)]">Called</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-0.5">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: UNCALLED_COLOR }} />
                            <span className="h-px w-4 shrink-0" style={{ background: UNCALLED_COLOR }} />
                        </span>
                        <span className="text-[11px] text-[var(--color-neutral-10)]">Uncalled</span>
                    </div>
                    {modeledCommitment ? (
                        <div className="flex items-center gap-1.5">
                            <span className="inline-block w-6 h-1 rounded-[var(--radius-full)]" style={{ background: MODELED_LINE_COLOR }} />
                            <span className="text-[11px] text-[var(--color-neutral-10)]">Incl. modeled (proj.)</span>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
