import type { SectorItem } from '@/data/thornton/valuations-data'

interface TopSectorsChartProps {
    data: SectorItem[]
    activeSector?: string | null
    onSectorClick?: (sector: string) => void
}

function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
    return `$${v.toLocaleString()}`
}

const SECTOR_COLORS: Record<string, string> = {
    'Real Estate':        '#4B7BE5',
    'Financial Services': '#2E5FA8',
    'Technology':         '#8B5CF6',
    'Consumer':           '#0EA5E9',
    'Healthcare':         '#10B981',
    'Energy':             '#F59E0B',
    'Private Equity':     '#6366F1',
    'Industrials':        '#64748B',
    'Materials':          '#84CC16',
    'Utilities':          '#06B6D4',
    'Communication':      '#F472B6',
    'Other':              '#94A3B8',
}

export function TopSectorsChart({ data, activeSector, onSectorClick }: TopSectorsChartProps) {
    if (!data.length) return null
    const maxValue = data[0].value

    return (
        <div className="flex flex-col gap-2.5">
            {data.map(item => {
                const color = SECTOR_COLORS[item.sector] ?? SECTOR_COLORS['Other']
                const widthPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                const isActive = item.sector === activeSector
                const dimmed = activeSector !== null && activeSector !== undefined && !isActive

                return (
                    <div
                        key={item.sector}
                        onClick={() => onSectorClick?.(item.sector)}
                        className={`flex items-center gap-3 rounded-lg px-2 py-1.5 transition-all ${onSectorClick ? 'cursor-pointer hover:bg-[var(--color-neutral-2)]' : ''} ${dimmed ? 'opacity-40' : ''}`}
                    >
                        <span className={`text-sm w-40 shrink-0 truncate ${isActive ? 'font-semibold text-[var(--color-black)]' : 'text-[var(--color-neutral-11)]'}`}>
                            {item.sector}
                        </span>

                        <div className="flex-1 h-6 bg-[var(--color-neutral-3)] rounded overflow-hidden">
                            <div
                                className="h-full rounded transition-all duration-300"
                                style={{ width: `${widthPct}%`, background: color, opacity: isActive || !activeSector ? 1 : 0.75 }}
                            />
                        </div>

                        <div className="text-right shrink-0 w-28">
                            <span className="text-sm font-semibold text-[var(--color-black)]">{formatValue(item.value)}</span>
                            <span className="text-xs text-[var(--color-neutral-9)] ml-1.5">{item.percentage}%</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
