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

function CustomTooltip({
    slice,
    color,
    sourceData,
}: SliceTooltipProps<DefaultSeries> & { color: string; sourceData: LinePoint[] }) {
    const point = slice.points[0]
    if (!point) return null

    const value = point.data.y as number
    const index = point.indexInSeries
    const prevValue = index > 0 ? sourceData[index - 1]?.value : undefined

    return (
        <div
            className="rounded-lg px-3 py-2 shadow-lg border border-[var(--color-neutral-4)]"
            style={{ background: 'white', minWidth: 120 }}
        >
            <div className="text-[11px] font-medium text-[var(--color-neutral-10)] mb-0.5">
                {String(point.data.x)}
            </div>
            <div className="text-[15px] font-semibold text-[var(--color-black)] tabular-nums">
                {formatBillions(value)}
            </div>
            {prevValue != null && (
                <div
                    className="text-[11px] font-semibold mt-0.5 tabular-nums"
                    style={{ color: value >= prevValue ? '#10B981' : '#EF4444' }}
                >
                    {formatChange(value, prevValue)} from prev
                </div>
            )}
            <div
                className="w-full h-0.5 rounded-full mt-1.5"
                style={{ background: color, opacity: 0.3 }}
            />
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
}: LineChartProps) {
    const [activeRange, setActiveRange] = useState<TimeRange>('6M')

    const visibleData = enableTimeRange ? sliceData(data, activeRange) : data

    const nivoData = useMemo(
        () => [
            {
                id: 'portfolio',
                data: visibleData.map((d) => ({ x: d.label, y: d.value })),
            },
        ],
        [visibleData],
    )

    const dataMin = Math.min(...visibleData.map((d) => d.value))

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
                <div className="flex gap-1 mb-3">
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
                    colors={[color]}
                    lineWidth={2.5}
                    enablePoints={true}
                    pointSize={8}
                    pointColor="white"
                    pointBorderWidth={2}
                    pointBorderColor={color}
                    enableArea={showArea}
                    areaOpacity={1}
                    areaBaselineValue={dataMin}
                    enableSlices="x"
                    sliceTooltip={(props) => (
                        <CustomTooltip {...props} color={color} sourceData={visibleData} />
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
