import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { IconCalendarEvent } from '@tabler/icons-react'
import type { AssetTimelineEvent } from '@/data/types'
import { useHorizontalDragScroll } from '@/lib/hooks/useHorizontalDragScroll'

interface AssetTimelineStripProps {
    events: AssetTimelineEvent[]
    assetName: string | null
}

function formatValue(value?: number): string {
    if (value == null) return ''
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
}

export function AssetTimelineStrip({ events, assetName }: AssetTimelineStripProps) {
    const { scrollRef, isDragging, scrollHandlers } = useHorizontalDragScroll()
    const currentYear = new Date().getFullYear()

    const sorted = useMemo(() =>
        [...events].sort((a, b) => a.year - b.year),
        [events]
    )

    if (sorted.length === 0) return null

    return (
        <div className="tl-strip absolute bottom-3 z-[5] bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-lg)] shadow-[var(--shadow-subtle)] px-[var(--spacing-5)] py-3 pb-3.5">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <IconCalendarEvent size={14} stroke={2} color="var(--color-accent-9)" />
                    <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] tracking-[-0.01em]">{assetName}</span>
                    <span className="text-xs font-[var(--font-weight-medium)] text-[var(--color-neutral-11)] pl-1">{sorted.length} events</span>
                </div>
            </div>

            <div
                className={cn(
                    'tl-strip__rail-container overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch] cursor-grab touch-pan-y [user-select:none] [-webkit-user-select:none]',
                    isDragging && 'cursor-grabbing',
                )}
                ref={scrollRef}
                {...scrollHandlers}
            >
                <div className="flex items-center gap-0 relative py-1.5 min-w-max">
                    <div className="absolute top-4 left-0 w-full h-px bg-[var(--color-gray-5)] pointer-events-none" />
                    {sorted.map((evt, i) => {
                        const prevYear = i > 0 ? sorted[i - 1].year : 0
                        const showNow = prevYear < currentYear && evt.year >= currentYear

                        return (
                            <>{showNow && (
                                <div key="now" className="flex flex-col items-center gap-0.5 px-1.5 shrink-0 relative z-[2]">
                                    <div className="w-px h-5 bg-[var(--color-accent-9)] opacity-40" />
                                    <span className="text-xs font-[var(--font-weight-bold)] uppercase tracking-[0.05em] text-[var(--color-accent-9)] px-1.5 py-px bg-[var(--color-blue-3)] rounded-[var(--radius-full)] whitespace-nowrap">Now</span>
                                </div>
                            )}
                            <div key={evt.id} className="tl-strip__item flex flex-col items-center gap-1 px-3.5 py-1.5 cursor-pointer rounded-[var(--radius-md)] transition-[background] duration-150 shrink-0 relative z-[1] hover:bg-[var(--color-neutral-3)]">
                                <div className="tl-strip__dot size-2 rounded-full border-2 border-[var(--color-white)] shadow-[0_0_0_1px_var(--color-gray-5)] shrink-0 transition-transform duration-150" style={{ background: 'var(--color-accent-9)' }} />
                                <div className="flex flex-col items-center gap-0 whitespace-nowrap">
                                    <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] leading-[1.3]">{evt.label}</span>
                                    <span className="text-xs text-[var(--color-neutral-11)] leading-[1.3]">{evt.year}{formatValue(evt.value) ? ` · ${formatValue(evt.value)}` : ''}</span>
                                </div>
                            </div></>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
