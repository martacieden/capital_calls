import { useState, useMemo } from 'react'
import { ResponsiveLine } from '@nivo/line'
import type { DefaultSeries, SliceTooltipProps } from '@nivo/line'
import type { PartialTheme } from '@nivo/theming'
import { cn } from '@/lib/utils'

interface LinePoint {
    label: string
    value: number
}

interface LineChartProps {
    data: LinePoint[]
    color?: string
    showArea?: boolean
    height?: number
    enableTimeRange?: boolean
    benchmarkData?: LinePoint[]
    benchmarkLabel?: string
}

type TimeRange = '3M' | '6M' | 'YTD' | '1Y'

function formatBillions(value: number): string {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
}

function formatChange(current: number, previous: number): string {
    const pct = ((current - previous) / previous) * 100
    const sign = pct >= 0 ? '+' : ''
    return `${sign}${pct.toFixed(1)}%`
}

const BENCHMARK_COLOR = '#94A3B8'

function CustomTooltip({
    slice,
    color,
    sourceData,
    benchmarkData,
    benchmarkLabel,
}: SliceTooltipProps<DefaultSeries> & { color: string; sourceData: LinePoint[]; benchmarkData?: LinePoint[]; benchmarkLabel?: string }) {
    const portfolioPoint = slice.points.find(p => p.seriesId === 'portfolio') ?? slice.points[0]
    const benchmarkPoint = slice.points.find(p => p.seriesId === 'benchmark')
    if (!portfolioPoint) return null

    const value = portfolioPoint.data.y as number
    const index = portfolioPoint.indexInSeries
    const prevValue = index > 0 ? sourceData[index - 1]?.value : undefined

    return (
        <div
            className="rounded-[var(--radius-lg)] px-3 py-2 shadow-lg border border-[var(--color-neutral-4)]"
            style={{ background: 'white', minWidth: 140 }}
        >
            <div className="text-[11px] font-medium text-[var(--color-neutral-10)] mb-1">
                {String(portfolioPoint.data.x)}
            </div>
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[13px] font-semibold text-[var(--color-black)] tabular-nums">{formatBillions(value)}</span>
                {prevValue != null && (
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color: value >= prevValue ? '#10B981' : '#EF4444' }}>
                        {formatChange(value, prevValue)}
                    </span>
                )}
            </div>
            {benchmarkPoint && benchmarkData && (
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: BENCHMARK_COLOR }} />
                    <span className="text-[11px] text-[var(--color-neutral-10)] tabular-nums">
                        {benchmarkLabel ?? 'Benchmark'}: {formatBillions(benchmarkPoint.data.y as number)}
                    </span>
                </div>
            )}
        </div>
    )
}

const TIME_RANGES: TimeRange[] = ['3M', '6M', 'YTD', '1Y']

function sliceData(data: LinePoint[], range: TimeRange): LinePoint[] {
    switch (range) {
        case '3M':
            return data.slice(-3)
        case '6M':
            return data.slice(-6)
        case 'YTD':
            // YTD = Jan onwards (index 6 in a Jul–Jun 12-month array)
            return data.slice(6)
        case '1Y':
            return data
    }
}

export function LineChart({
    data,
    color = '#8B5CF6',
    showArea = true,
    height = 220,
    enableTimeRange = false,
    benchmarkData,
    benchmarkLabel,
}: LineChartProps) {
    const [activeRange, setActiveRange] = useState<TimeRange>('6M')

    const visibleData = enableTimeRange ? sliceData(data, activeRange) : data
    const visibleBenchmark = benchmarkData
        ? (enableTimeRange ? sliceData(benchmarkData, activeRange) : benchmarkData)
        : undefined

    const nivoData = useMemo(
        () => {
            const series = [
                {
                    id: 'portfolio',
                    data: visibleData.map((d) => ({ x: d.label, y: d.value })),
                },
            ]
            if (visibleBenchmark) {
                series.push({
                    id: 'benchmark',
                    data: visibleBenchmark.map((d) => ({ x: d.label, y: d.value })),
                })
            }
            return series
        },
        [visibleData, visibleBenchmark],
    )

    const dataMin = Math.min(
        ...visibleData.map((d) => d.value),
        ...(visibleBenchmark?.map(d => d.value) ?? []),
    )

    const theme: PartialTheme = {
        background: 'transparent',
        text: {
            fontSize: 11,
            fill: '#9CA3AF',
            fontFamily: 'Inter, -apple-system, sans-serif',
        },
        axis: {
            domain: { line: { stroke: 'transparent', strokeWidth: 0 } },
            ticks: {
                line: { stroke: 'transparent', strokeWidth: 0 },
                text: {
                    fontSize: 11,
                    fill: '#9CA3AF',
                    fontFamily: 'Inter, -apple-system, sans-serif',
                },
            },
        },
        grid: {
            line: { stroke: '#F0F0F3', strokeWidth: 1 },
        },
        crosshair: {
            line: {
                stroke: color,
                strokeWidth: 1,
                strokeOpacity: 0.35,
                strokeDasharray: '4 4',
            },
        },
    }

    return (
        <div>
            {enableTimeRange && (
                <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range}
                            onClick={() => setActiveRange(range)}
                            className={cn(
                                'px-2.5 py-1 rounded-md text-[12px] font-semibold transition-colors duration-150',
                                activeRange === range
                                    ? 'text-white'
                                    : 'text-[var(--color-neutral-10)] bg-transparent hover:bg-[var(--color-neutral-3)]',
                            )}
                            style={
                                activeRange === range
                                    ? { background: color }
                                    : undefined
                            }
                        >
                            {range}
                        </button>
                    ))}
                    </div>
                    {visibleBenchmark && (
                        <div className="flex items-center gap-3 text-[11px] text-[var(--color-neutral-10)]">
                            <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 rounded" style={{ background: color }} /> Portfolio</span>
                            <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 rounded" style={{ background: BENCHMARK_COLOR }} /> {benchmarkLabel ?? 'Benchmark'}</span>
                        </div>
                    )}
                </div>
            )}
            <div style={{ height }}>
                <ResponsiveLine
                    data={nivoData}
                    margin={{ top: 16, right: 16, bottom: 32, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                    }}
                    curve="monotoneX"
                    axisBottom={{
                        tickSize: 0,
                        tickPadding: 12,
                    }}
                    axisLeft={{
                        tickSize: 0,
                        tickPadding: 8,
                        tickValues: 4,
                        format: (v) => formatBillions(v as number),
                    }}
                    axisTop={null}
                    axisRight={null}
                    enableGridX={false}
                    enableGridY={true}
                    colors={visibleBenchmark ? [color, BENCHMARK_COLOR] : [color]}
                    lineWidth={2.5}
                    enablePoints={true}
                    pointSize={8}
                    pointColor="white"
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    enableArea={showArea}
                    areaOpacity={1}
                    areaBaselineValue={dataMin}
                    enableSlices="x"
                    sliceTooltip={(props) => (
                        <CustomTooltip {...props} color={color} sourceData={visibleData} benchmarkData={visibleBenchmark} benchmarkLabel={benchmarkLabel} />
                    )}
                    enableCrosshair={true}
                    crosshairType="x"
                    theme={theme}
                    animate={false}
                    defs={[
                        {
                            id: 'areaGradient',
                            type: 'linearGradient',
                            colors: [
                                { offset: 0, color, opacity: 0.18 },
                                { offset: 100, color, opacity: 0.03 },
                            ],
                        },
                    ]}
                    fill={[{ match: { id: 'portfolio' }, id: 'areaGradient' }]}
                />
            </div>
        </div>
    )
}
