import type { HoldingItem } from '@/data/thornton/valuations-data'
import { CATALOG_KEY_PORTFOLIO_COLOR } from '@/data/thornton/portfolio-data'

interface TopHoldingsChartProps {
    items: HoldingItem[]
    onItemClick?: (id: string) => void
    colorOverride?: Record<string, string>
}

function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
    return `$${v.toLocaleString()}`
}


export function TopHoldingsChart({ items, onItemClick, colorOverride }: TopHoldingsChartProps) {
    if (!items.length) return null

    const sorted = [...items].sort((a, b) => b.value - a.value)
    const maxValue = sorted[0]?.value ?? 1

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
                {sorted.map(item => {
                    const color = colorOverride?.[item.categoryKey] ?? CATALOG_KEY_PORTFOLIO_COLOR[item.categoryKey] ?? '#94A3B8'
                    const widthPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0

                    return (
                        <div
                            key={item.id}
                            role={onItemClick ? 'button' : undefined}
                            tabIndex={onItemClick ? 0 : undefined}
                            onClick={() => onItemClick?.(item.id)}
                            onKeyDown={e => { if (onItemClick && (e.key === 'Enter' || e.key === ' ')) onItemClick(item.id) }}
                            className={`flex items-center gap-3 rounded-[var(--radius-lg)] px-1 -mx-1 transition-colors ${onItemClick ? 'cursor-pointer hover:bg-[var(--color-neutral-2)]' : ''}`}
                        >
                            <span
                                className="text-[11px] sm:text-[13px] w-36 sm:w-44 shrink-0 truncate text-[var(--color-neutral-11)]"
                                title={item.name}
                            >
                                {item.name}
                            </span>
                            <div className="flex-1 h-5 sm:h-6 bg-[var(--color-neutral-3)] rounded overflow-hidden min-w-0">
                                <div
                                    className="h-full rounded transition-all duration-300"
                                    style={{ width: `${widthPct}%`, background: color, opacity: 0.92 }}
                                />
                            </div>
                            <div className="text-right shrink-0 w-[5.25rem] sm:w-28">
                                <span className="text-[13px] font-semibold tabular-nums text-[var(--color-black)]">
                                    {formatValue(item.value)}
                                </span>
                                <span className="text-[10px] sm:text-xs text-[var(--color-neutral-9)] ml-1 tabular-nums">
                                    {item.portfolioPercent}%
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
