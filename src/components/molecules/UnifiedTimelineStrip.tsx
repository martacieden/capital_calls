import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { IconArrowRight, IconCalendarEvent } from '@tabler/icons-react'
import type { DistributionEvent, AssetTimelineEvent, AnyCatalogItem } from '@/data/types'
import { formatAmount } from '@/lib/helpers/timeline'
import { useHorizontalDragScroll } from '@/lib/hooks/useHorizontalDragScroll'
import { ASSET_CATEGORIES } from '@/lib/constants'

const SUBTRUST_TO_PARENT: Record<string, string> = {
    'thn-t4': 'thn-t1', 'thn-t5': 'thn-t1', 'thn-t6': 'thn-t1',
    'thn-t7': 'thn-t1', 'thn-t8': 'thn-t1', 'thn-t9': 'thn-t1',
    'thn-t10': 'thn-t3', 'thn-t11': 'thn-t3',
    'thn-t12': 'thn-t1', 'thn-t13': 'thn-t1', 'thn-t14': 'thn-t1',
}

function formatValue(value?: number): string {
    if (value == null) return ''
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
}

interface UnifiedTimelineStripProps {
    selectedItem: AnyCatalogItem | null
    distributions: DistributionEvent[]
    assetEvents: AssetTimelineEvent[]
    getItemById: (id: string) => AnyCatalogItem | null
    onViewFullTimeline: (itemId: string) => void
    isChatOpen?: boolean
}

export function UnifiedTimelineStrip({
    selectedItem,
    distributions,
    assetEvents,
    getItemById,
    onViewFullTimeline,
    isChatOpen,
}: UnifiedTimelineStripProps) {
    const { scrollRef, isDragging, scrollHandlers } = useHorizontalDragScroll()
    const currentYear = new Date().getFullYear()

    const isTrust = selectedItem?.categoryKey === 'trust'
    const isAsset = selectedItem != null && ASSET_CATEGORIES.has(selectedItem.categoryKey)
    const hasContent = isTrust || isAsset

    // Trust mode: distribution events
    const { datedEvents, lifeEvents } = useMemo(() => {
        if (!isTrust || !selectedItem) return { datedEvents: [], lifeEvents: [] }
        const filtered = distributions.filter(d => {
            const parentTrust = SUBTRUST_TO_PARENT[d.trustId] ?? d.trustId
            return d.trustId === selectedItem.id || parentTrust === selectedItem.id
        })
        return {
            datedEvents: filtered.filter(d => d.triggerYear != null).sort((a, b) => (a.triggerYear ?? 0) - (b.triggerYear ?? 0)),
            lifeEvents: filtered.filter(d => d.triggerYear == null),
        }
    }, [isTrust, selectedItem, distributions])

    const pendingCount = datedEvents.filter(e => e.status === 'Pending').length

    // Asset mode: asset timeline events
    const sortedAssetEvents = useMemo(() => {
        if (!isAsset || !selectedItem) return []
        return [...assetEvents].filter(e => e.assetId === selectedItem.id).sort((a, b) => a.year - b.year)
    }, [isAsset, selectedItem, assetEvents])

    const subLabel = isTrust
        ? `${pendingCount} upcoming`
        : `${sortedAssetEvents.length} events`

    return (
        <div className={cn(
            'tl-strip absolute bottom-3 z-[5] bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-lg)] shadow-[var(--shadow-subtle)] px-[var(--spacing-5)] py-3 pb-3.5',
            !hasContent && 'tl-strip--empty flex items-center justify-center gap-[var(--spacing-2)] !py-1.5 text-[13px] font-[var(--font-weight-regular)] text-[var(--color-neutral-9)]',
            !hasContent && !isChatOpen && '!left-[96px]',
        )}>
            {hasContent ? (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <IconCalendarEvent size={14} stroke={2} color="var(--color-accent-9)" />
                            <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] tracking-[-0.01em]">{selectedItem.name}</span>
                            <span className="text-xs font-[var(--font-weight-medium)] text-[var(--color-neutral-11)] pl-1">{subLabel}</span>
                        </div>
                        <button
                            className="tl-strip__view-full inline-flex items-center gap-1 text-xs font-[var(--font-weight-medium)] text-[var(--color-accent-9)] py-[5px] px-3 rounded-[var(--radius-md)] border-none bg-[var(--color-blue-1)] transition-[background] duration-150 hover:bg-[var(--color-blue-hover)]"
                            onClick={() => onViewFullTimeline(selectedItem.id)}
                        >
                            View full timeline
                            <IconArrowRight size={12} stroke={2.5} />
                        </button>
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
                            <div className="tl-strip__line absolute top-4 left-0 w-full h-px bg-[var(--color-gray-5)] pointer-events-none" />

                            {/* ── Trust mode: distribution events ── */}
                            {isTrust && (
                                <>
                                    {datedEvents.map((evt, i) => {
                                        const beneficiary = getItemById(evt.beneficiaryId)
                                        const year = evt.triggerYear ?? currentYear
                                        const prevYear = i > 0 ? (datedEvents[i - 1].triggerYear ?? 0) : 0
                                        const showNow = prevYear < currentYear && year >= currentYear
                                        return (
                                            <>{showNow && (
                                                <div key="now" className="tl-strip__now-marker flex flex-col items-center gap-0.5 px-1.5 shrink-0 relative z-[2]">
                                                    <div className="w-px h-5 bg-[var(--color-accent-9)] opacity-40" />
                                                    <span className="text-xs font-[var(--font-weight-bold)] uppercase tracking-[0.05em] text-[var(--color-accent-9)] px-1.5 py-px bg-[var(--color-blue-3)] rounded-[var(--radius-full)] whitespace-nowrap">Now</span>
                                                </div>
                                            )}
                                            <div
                                                key={evt.id}
                                                className="tl-strip__item flex flex-col items-center gap-1 px-3.5 py-1.5 cursor-pointer rounded-[var(--radius-md)] transition-[background] duration-150 shrink-0 relative z-[1] hover:bg-[var(--color-neutral-3)]"
                                                onClick={() => onViewFullTimeline(selectedItem.id)}
                                            >
                                                <div className="tl-strip__dot size-2 rounded-full border-2 border-[var(--color-white)] shadow-[0_0_0_1px_var(--color-gray-5)] shrink-0 transition-transform duration-150" style={{ background: 'var(--color-accent-9)' }} />
                                                <div className="flex flex-col items-center gap-0 whitespace-nowrap">
                                                    <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] leading-[1.3]">{beneficiary?.name?.split(' ').slice(0, 2).join(' ') ?? '?'}</span>
                                                    <span className="text-xs text-[var(--color-neutral-11)] leading-[1.3]">{year}{formatAmount(evt.amount) ? ` · ${formatAmount(evt.amount)}` : ''}</span>
                                                </div>
                                            </div></>
                                        )
                                    })}
                                    {lifeEvents.length > 0 && (
                                        <div className="tl-strip__now-marker flex flex-col items-center gap-0.5 px-1.5 shrink-0 relative z-[2]">
                                            <div className="w-px h-5 bg-[var(--color-accent-9)] opacity-40" />
                                            <span className="text-xs font-[var(--font-weight-bold)] uppercase tracking-[0.05em] text-[var(--color-accent-9)] px-1.5 py-px bg-[var(--color-blue-3)] rounded-[var(--radius-full)] whitespace-nowrap">Life Events</span>
                                        </div>
                                    )}
                                    {lifeEvents.map(evt => {
                                        const beneficiary = getItemById(evt.beneficiaryId)
                                        const label = evt.triggerCategory ?? 'Conditional'
                                        return (
                                            <div
                                                key={evt.id}
                                                className="tl-strip__item flex flex-col items-center gap-1 px-3.5 py-1.5 cursor-pointer rounded-[var(--radius-md)] transition-[background] duration-150 shrink-0 relative z-[1] hover:bg-[var(--color-neutral-3)]"
                                                onClick={() => onViewFullTimeline(selectedItem.id)}
                                            >
                                                <div className="tl-strip__dot size-2 rounded-full border-2 border-[var(--color-white)] shadow-[0_0_0_1px_var(--color-gray-5)] shrink-0 transition-transform duration-150" style={{ background: 'var(--color-accent-9)' }} />
                                                <div className="flex flex-col items-center gap-0 whitespace-nowrap">
                                                    <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] leading-[1.3]">{beneficiary?.name?.split(' ').slice(0, 2).join(' ') ?? '?'}</span>
                                                    <span className="text-xs text-[var(--color-neutral-11)] leading-[1.3]">{label}{formatAmount(evt.amount) ? ` · ${formatAmount(evt.amount)}` : ''}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            )}

                            {/* ── Asset mode: asset timeline events ── */}
                            {isAsset && sortedAssetEvents.map((evt, i) => {
                                const prevYear = i > 0 ? sortedAssetEvents[i - 1].year : 0
                                const showNow = prevYear < currentYear && evt.year >= currentYear
                                return (
                                    <>{showNow && (
                                        <div key="now" className="flex flex-col items-center gap-0.5 px-1.5 shrink-0 relative z-[2]">
                                            <div className="w-px h-5 bg-[var(--color-accent-9)] opacity-40" />
                                            <span className="text-xs font-[var(--font-weight-bold)] uppercase tracking-[0.05em] text-[var(--color-accent-9)] px-1.5 py-px bg-[var(--color-blue-3)] rounded-[var(--radius-full)] whitespace-nowrap">Now</span>
                                        </div>
                                    )}
                                    <div
                                        key={evt.id}
                                        className="tl-strip__item flex flex-col items-center gap-1 px-3.5 py-1.5 cursor-pointer rounded-[var(--radius-md)] transition-[background] duration-150 shrink-0 relative z-[1] hover:bg-[var(--color-neutral-3)]"
                                        onClick={() => onViewFullTimeline(selectedItem.id)}
                                    >
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
                </>
            ) : (
                <>
                    <IconCalendarEvent size={18} stroke={1.5} color="var(--color-neutral-9)" />
                    <span>Select a trust or asset to see its timeline</span>
                </>
            )}
        </div>
    )
}
