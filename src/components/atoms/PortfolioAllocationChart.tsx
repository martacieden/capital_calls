import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface BreakdownItem {
    label: string
    value: number
    color: string
}

export interface PortfolioAllocationSlice {
    key: string
    label: string
    value: number
    percentage: number
    color: string
    isClickable: boolean
    categoryFilter: string[]
    breakdown?: BreakdownItem[]
}

interface PortfolioAllocationChartProps {
    data: PortfolioAllocationSlice[]
    totalValue: number
    onSliceClick: (categoryFilter: string[]) => void
    size?: number
}

function formatValue(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
    if (value >= 1_000_000) return `$${Math.round(value / 1_000_000)}M`
    return `$${value.toLocaleString()}`
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
    }
}

function wedgePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
    const large = endAngle - startAngle > Math.PI ? 1 : 0
    const p1 = polarToCartesian(cx, cy, r, startAngle)
    const p2 = polarToCartesian(cx, cy, r, endAngle)
    return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y} Z`
}

export function PortfolioAllocationChart({ data, onSliceClick, size = 220 }: PortfolioAllocationChartProps) {
    const [hovered, setHovered] = useState<number | null>(null)
    const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const cx = size / 2
    const cy = size / 2
    const r = size / 2 - 4

    // Build angles — start at top (-π/2)
    const startOffset = -Math.PI / 2
    let accumulated = startOffset
    const wedges = data.map((slice, i) => {
        const angle = (slice.percentage / 100) * 2 * Math.PI
        const start = accumulated
        accumulated += angle
        // clamp last slice to avoid float gap
        const end = i === data.length - 1 ? startOffset + 2 * Math.PI : accumulated
        return { slice, start, end, index: i }
    })

    const hoveredSlice = hovered !== null ? data[hovered] : null

    return (
        <div ref={containerRef} className="flex items-center gap-8 py-2">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="overflow-visible"
                    onMouseLeave={() => { setHovered(null); setTooltip(null) }}
                >
                    {/* Wedge fills */}
                    {wedges.map(({ slice, start, end, index }) => (
                        <path
                            key={slice.key}
                            d={wedgePath(cx, cy, r, start, end)}
                            fill={slice.color}
                            style={{
                                transition: 'opacity 0.15s ease',
                                opacity: hovered !== null && hovered !== index ? 0.35 : 1,
                                cursor: slice.isClickable ? 'pointer' : 'not-allowed',
                            }}
                            onMouseEnter={(e) => {
                                setHovered(index)
                                const rect = containerRef.current?.getBoundingClientRect()
                                if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                            }}
                            onMouseMove={(e) => {
                                const rect = containerRef.current?.getBoundingClientRect()
                                if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                            }}
                            onClick={() => slice.isClickable && onSliceClick(slice.categoryFilter)}
                        />
                    ))}

                    {/* Straight white separator lines drawn on top */}
                    {wedges.map(({ start, slice }) => {
                        const p = polarToCartesian(cx, cy, r, start)
                        return (
                            <line
                                key={`sep-${slice.key}`}
                                x1={cx} y1={cy}
                                x2={p.x} y2={p.y}
                                stroke="white"
                                strokeWidth={2}
                                style={{ pointerEvents: 'none' }}
                            />
                        )
                    })}
                </svg>

                {tooltip && hoveredSlice && (
                    <div
                        className="pointer-events-none absolute z-10 bg-[var(--color-black)] text-white rounded-lg px-3 py-2 text-xs shadow-lg"
                        style={{
                            left: tooltip.x + 12,
                            top: tooltip.y - 36,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <div className="font-semibold">{hoveredSlice.label}</div>
                        <div className="text-white/70">{hoveredSlice.percentage}% · {formatValue(hoveredSlice.value)}</div>
                        {hoveredSlice.breakdown && hoveredSlice.breakdown.length > 0 && (
                            <div className="mt-2 flex flex-col gap-1 border-t border-white/20 pt-2">
                                {hoveredSlice.breakdown.map(item => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                                        <span className="text-white/60 flex-1">{item.label}</span>
                                        <span className="text-white/90 font-medium tabular-nums">{formatValue(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {hoveredSlice.isClickable ? (
                            <div className="text-white/50 mt-1.5">Click to explore holdings →</div>
                        ) : (
                            <div className="text-white/40 mt-1.5">Breakdown not available for this category</div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-0">
                {data.map((seg, i) => (
                    <div
                        key={seg.key}
                        className={cn(
                            'flex items-center gap-2 text-[13px] transition-opacity duration-150 rounded-[4px] px-1 py-0.5 -mx-1 -my-0.5',
                            seg.isClickable && 'cursor-pointer hover:bg-[var(--color-neutral-2)]',
                            hovered === i && 'bg-[var(--color-neutral-2)]'
                        )}
                        style={{ opacity: hovered !== null && hovered !== i ? 0.4 : 1 }}
                        onMouseEnter={(e) => {
                            setHovered(i)
                            const rect = containerRef.current?.getBoundingClientRect()
                            if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                        }}
                        onMouseMove={(e) => {
                            const rect = containerRef.current?.getBoundingClientRect()
                            if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                        }}
                        onMouseLeave={() => { setHovered(null); setTooltip(null) }}
                        onClick={() => seg.isClickable && onSliceClick(seg.categoryFilter)}
                    >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                        <span className="flex-1 text-[var(--color-neutral-11)] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{seg.label}</span>
                        <span className="font-semibold text-[var(--color-black)] min-w-[60px] text-right">{formatValue(seg.value)}</span>
                        <span className="font-medium text-[var(--color-neutral-11)] min-w-[32px] text-right">{seg.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
