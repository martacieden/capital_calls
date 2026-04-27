import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DonutSegment {
    label: string
    value: number
    percentage: number
    color: string
}

interface DonutChartProps {
    data: DonutSegment[]
    size?: number
    strokeWidth?: number
    centerLabel?: string
    showLegend?: boolean
}

function formatValue(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
    if (value >= 1_000_000) return `$${Math.round(value / 1_000_000)}M`
    return `$${value.toLocaleString()}`
}

export function DonutChart({ data, size = 200, strokeWidth = 32, centerLabel, showLegend = true }: DonutChartProps) {
    const [animated, setAnimated] = useState(false)
    const [hovered, setHovered] = useState<number | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const center = size / 2

    let accumulated = 0
    const segments = data.map(segment => {
        const length = (segment.percentage / 100) * circumference
        const offset = circumference - accumulated
        accumulated += length
        return { ...segment, length, offset }
    })

    const hoveredSeg = hovered !== null ? data[hovered] : null

    return (
        <div className="flex items-center gap-8 py-2">
            <div className="relative shrink-0 overflow-visible">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                    <circle
                        cx={center} cy={center} r={radius}
                        fill="none" stroke="#F0F0F3" strokeWidth={strokeWidth}
                    />
                    {segments.map((seg, i) => (
                        <circle
                            key={seg.label}
                            cx={center} cy={center} r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={hovered === i ? strokeWidth + 4 : strokeWidth}
                            strokeDasharray={animated ? `${seg.length} ${circumference - seg.length}` : `0 ${circumference}`}
                            strokeDashoffset={seg.offset}
                            strokeLinecap="butt"
                            style={{
                                transform: 'rotate(-90deg)',
                                transformOrigin: 'center',
                                transition: `stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s, stroke-width 0.15s ease, opacity 0.15s ease`,
                                opacity: hovered !== null && hovered !== i ? 0.35 : 1,
                                cursor: 'pointer',
                            }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {hoveredSeg ? (
                        <>
                            <span className="font-display text-lg font-bold text-[var(--color-black)] tracking-[-0.02em]">{formatValue(hoveredSeg.value)}</span>
                            <span className="text-xs text-[var(--color-neutral-11)] mt-0.5">{hoveredSeg.label}</span>
                        </>
                    ) : centerLabel ? (
                        <span className="font-display text-lg font-bold text-[var(--color-black)] tracking-[-0.02em]">{centerLabel}</span>
                    ) : null}
                </div>
            </div>
            {showLegend && (
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {data.map((seg, i) => (
                        <div
                            key={seg.label}
                            className={cn(
                                'donut-chart__legend-item flex items-center gap-2 text-[13px] transition-opacity duration-150 cursor-pointer rounded-[4px] px-1 py-0.5 -mx-1 -my-0.5',
                                hovered === i && 'bg-[var(--color-neutral-2)]'
                            )}
                            style={{ opacity: hovered !== null && hovered !== i ? 0.4 : 1 }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
                            <span className="flex-1 text-[var(--color-neutral-11)] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{seg.label}</span>
                            <span className="font-semibold text-[var(--color-black)] min-w-[50px] text-right">{formatValue(seg.value)}</span>
                            <span className="font-medium text-[var(--color-neutral-11)] min-w-[30px] text-right">{seg.percentage}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
