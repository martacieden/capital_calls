import { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import type { BarTooltipProps } from '@nivo/bar'
import type { PartialTheme } from '@nivo/theming'

interface AllocationItem {
    categoryKey: string
    label: string
    value: number
    percentage: number
    color: string
}

interface BarChartProps {
    data: AllocationItem[]
    height?: number
    onBarClick?: (categoryKey: string) => void
}

/** Row shape passed to Nivo (`BarDatum` = values are string | number only). */
type BarRow = {
    id: string
    label: string
    value: number
    percentage: number
    color: string
}

function formatCompact(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `$${Math.round(value / 1_000_000)}M`
    if (value === 0) return '$0'
    return `$${value.toLocaleString()}`
}

function CustomBarTooltip({ data, value, color }: BarTooltipProps<BarRow>) {
    return (
        <div
            className="rounded-[var(--radius-lg)] px-3 py-2 shadow-lg border border-[var(--color-neutral-4)]"
            style={{ background: 'white', minWidth: 140 }}
        >
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[12px] font-semibold text-[var(--color-black)]">
                    {String(data.label)}
                </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
                <span className="text-[14px] font-semibold text-[var(--color-black)] tabular-nums">
                    {formatCompact(value as number)}
                </span>
                <span className="text-[11px] font-medium text-[var(--color-neutral-10)] tabular-nums">
                    {String(data.percentage)}%
                </span>
            </div>
        </div>
    )
}

const theme: PartialTheme = {
    background: 'transparent',
    text: {
        fontSize: 12,
        fill: '#1C2024',
        fontFamily: 'Inter, -apple-system, sans-serif',
    },
    axis: {
        domain: { line: { stroke: 'transparent', strokeWidth: 0 } },
        ticks: {
            line: { stroke: 'transparent', strokeWidth: 0 },
            text: {
                fontSize: 12,
                fill: '#1C2024',
                fontFamily: 'Inter, -apple-system, sans-serif',
                fontWeight: 500,
            },
        },
    },
    grid: {
        line: { stroke: 'transparent', strokeWidth: 0 },
    },
}

export function BarChart({ data, height = 240, onBarClick }: BarChartProps) {
    const barData = useMemo(
        () =>
            // Nivo renders bottom-to-top for horizontal, so reverse to keep highest first
            [...data].reverse().map((d) => ({
                id: d.categoryKey,
                label: d.label,
                value: d.value,
                percentage: d.percentage,
                color: d.color,
            })),
        [data],
    )

    const colorMap = useMemo(
        () => Object.fromEntries(data.map((d) => [d.categoryKey, d.color])),
        [data],
    )

    return (
        <div style={{ height }} className={onBarClick ? '[&_rect]:cursor-pointer' : ''}>
            <ResponsiveBar
                data={barData}
                keys={['value']}
                indexBy="id"
                layout="horizontal"
                margin={{ top: 0, right: 80, bottom: 0, left: 100 }}
                padding={0.35}
                borderRadius={3}
                colors={(bar) => colorMap[bar.indexValue as string] || '#94A3B8'}
                axisBottom={null}
                axisTop={null}
                axisRight={null}
                axisLeft={{
                    tickSize: 0,
                    tickPadding: 12,
                    format: (v) => {
                        const item = data.find((d) => d.categoryKey === v)
                        return item?.label || String(v)
                    },
                }}
                enableGridX={false}
                enableGridY={false}
                enableLabel={false}
                tooltip={CustomBarTooltip}
                theme={theme}
                animate={false}
                labelSkipWidth={999}
                onClick={(data) => onBarClick?.(String(data.indexValue))}
                // Value labels on the right
                layers={[
                    'grid',
                    'axes',
                    'bars',
                    // Custom layer for right-side value labels
                    ({ bars }) => (
                        <g>
                            {bars.map((bar) => {
                                const item = data.find(
                                    (d) => d.categoryKey === bar.data.indexValue,
                                )
                                return (
                                    <g key={bar.key}>
                                        <text
                                            x={bar.x + bar.width + 8}
                                            y={bar.y + bar.height / 2}
                                            dominantBaseline="central"
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                fill: '#1C2024',
                                                fontFamily: 'Inter, -apple-system, sans-serif',
                                                fontVariantNumeric: 'tabular-nums',
                                            }}
                                        >
                                            {formatCompact(bar.data.value as number)}
                                        </text>
                                        {item && (
                                            <text
                                                x={bar.x + bar.width + 8 + (formatCompact(bar.data.value as number).length * 7.5) + 6}
                                                y={bar.y + bar.height / 2}
                                                dominantBaseline="central"
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    fill: '#80838D',
                                                    fontFamily: 'Inter, -apple-system, sans-serif',
                                                    fontVariantNumeric: 'tabular-nums',
                                                }}
                                            >
                                                {item.percentage}%
                                            </text>
                                        )}
                                    </g>
                                )
                            })}
                        </g>
                    ),
                    'markers',
                    'annotations',
                ]}
            />
        </div>
    )
}
