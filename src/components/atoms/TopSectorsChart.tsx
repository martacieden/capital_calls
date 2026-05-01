import type { SectorItem } from '@/data/thornton/valuations-data'

interface TopSectorsChartProps {
    data: SectorItem[]
    activeSector?: string | null
    onSectorClick?: (sector: string) => void
    colorOverride?: Record<string, string>
}

function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
    return `$${v.toLocaleString()}`
}

const SECTOR_COLORS: Record<string, string> = {
    'Real Estate':        '#005BE2',
    'Financial Services': '#059669',
    'Technology':         '#059669',
    'Consumer':           '#64748B',
    'Healthcare':         '#059669',
    'Energy':             '#64748B',
    'Private Equity':     '#059669',
    'Industrials':        '#64748B',
    'Materials':          '#64748B',
    'Utilities':          '#64748B',
    'Communication':      '#64748B',
    'Art & Collectibles': '#8B5CF6',
    'Maritime':           '#8B5CF6',
    'Aviation':           '#8B5CF6',
    'Vehicles':           '#8B5CF6',
    'Other':              '#94A3B8',
}

export function TopSectorsChart({ data, activeSector, onSectorClick, colorOverride }: TopSectorsChartProps) {
    if (!data.length) return null
    const maxValue = data[0].value
    const isInteractive = Boolean(onSectorClick)

    return (
        <div className="flex flex-col gap-2">
            {data.map(item => {
                const color = colorOverride?.[item.sector] ?? SECTOR_COLORS[item.sector] ?? SECTOR_COLORS['Other']
                const widthPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                const isActive = item.sector === activeSector
                const dimmed = activeSector !== null && activeSector !== undefined && !isActive

                return (
                    <div
                        key={item.sector}
                        role={isInteractive ? 'button' : undefined}
                        tabIndex={isInteractive ? 0 : undefined}
                        onClick={() => onSectorClick?.(item.sector)}
                        onKeyDown={e => {
                            if (!isInteractive) return
                            if (e.key === 'Enter' || e.key === ' ') onSectorClick?.(item.sector)
                        }}
                        className={`flex items-center gap-3 rounded-lg px-1 -mx-1 transition-colors ${isInteractive ? 'cursor-pointer hover:bg-[var(--color-neutral-2)]' : ''} ${dimmed ? 'opacity-40' : ''}`}
                    >
                        <div className="flex items-center gap-1.5 w-36 sm:w-44 shrink-0 min-w-0">
                            <span className={`text-[11px] sm:text-[13px] truncate ${isActive ? 'font-semibold text-[var(--color-black)]' : 'text-[var(--color-neutral-11)]'}`}>
                                {item.sector}
                            </span>
                        </div>

                        <div className="flex-1 h-5 sm:h-6 bg-[var(--color-neutral-3)] rounded overflow-hidden min-w-0">
                            <div
                                className="h-full rounded transition-all duration-300"
                                style={{ width: `${widthPct}%`, background: color, opacity: isActive || !activeSector ? 1 : 0.75 }}
                            />
                        </div>

                        <div className="text-right shrink-0 w-[5.25rem] sm:w-28">
                            <span className="text-xs sm:text-sm font-semibold tabular-nums text-[var(--color-black)]">{formatValue(item.value)}</span>
                            <span className="text-[10px] sm:text-xs text-[var(--color-neutral-9)] ml-1 tabular-nums">{item.percentage}%</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
