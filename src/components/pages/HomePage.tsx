import { useState, useLayoutEffect } from 'react'
import {
    IconSitemap,
    IconCalendarEvent,
    IconChartDonut,
    IconTrendingUp,
    IconMapPin,
    IconCurrencyDollar,
    IconArrowUpRight,
    IconCheckbox,
    IconArrowRampRight,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { DocumentUploadSection } from '@/components/molecules/DocumentUploadSection'
import { MiniHierarchyChart } from '@/components/molecules/MiniHierarchyChart'
import { MiniLineChart } from '@/components/molecules/MiniLineChart'
import {
    ASSET_ALLOCATION,
    PROPERTY_LOCATIONS,
    GRAND_TOTAL,
} from '@/data/thornton/valuations-data'

interface HomePageProps {
    isProcessing: boolean
    isOnboardingComplete: boolean
    onNavigate: (page: string) => void
    items: import('@/data/types').AnyCatalogItem[]
    distributions: import('@/data/types').DistributionEvent[]
    isChatOpen?: boolean
    onUploadComplete?: (scenarioId: string) => void
}

const CARD_TIMERS = [1500, 3500, 5500, 7500, 9500, 11500]

const TIMELINE_ROWS = [
    { year: '2028', name: 'Natalie — Dynasty II', amount: 'Remainder' },
    { year: '2037', name: 'Oliver — Dynasty I', amount: '$2M' },
    { year: '2040', name: 'James IV — Dynasty I', amount: '$2M' },
]

function formatCompact(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
    if (value >= 1_000_000) return `$${Math.round(value / 1_000_000)}M`
    return `$${value.toLocaleString()}`
}

export function HomePage({ isProcessing, isOnboardingComplete, onNavigate, isChatOpen, onUploadComplete }: HomePageProps) {
    const [visibleCards, setVisibleCards] = useState(0)
    const [allDone, setAllDone] = useState(false)
    useLayoutEffect(() => {
        if (!isProcessing) {
            setVisibleCards(6)
            setAllDone(true)
            return
        }
        setVisibleCards(0)
        setAllDone(false)
        const timers = CARD_TIMERS.map((ms, i) =>
            setTimeout(() => setVisibleCards(i + 1), ms)
        )
        return () => timers.forEach(clearTimeout)
    }, [isProcessing])

    const clickable = !isProcessing || allDone

    // Top 3 properties
    const topProperties = PROPERTY_LOCATIONS.slice(0, 3)

    return (
        <div className="flex flex-col gap-[var(--spacing-5)] px-[var(--spacing-6)] pt-9 pb-[var(--spacing-5)] max-w-[1120px] w-full min-w-0 mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="font-display text-[28px] font-black leading-[1.25] tracking-[-0.02em] text-[var(--color-gray-12)]" style={{ WebkitTextStroke: '0.3px currentColor' }}>Good morning, Sandra</h1>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 py-1.5 pl-2.5 pr-3.5 rounded-[var(--radius-md)] border-none bg-[var(--color-blue-1)] text-[13px] font-[var(--font-weight-medium)] text-[var(--color-accent-9)] cursor-pointer transition-all duration-150 ease-linear whitespace-nowrap hover:bg-[var(--color-blue-hover)]">
                        <IconCheckbox size={15} stroke={2} />
                        <span>New task</span>
                    </button>
                    <button className="flex items-center gap-1.5 py-1.5 pl-2.5 pr-3.5 rounded-[var(--radius-md)] border-none bg-[var(--color-blue-1)] text-[13px] font-[var(--font-weight-medium)] text-[var(--color-accent-9)] cursor-pointer transition-all duration-150 ease-linear whitespace-nowrap hover:bg-[var(--color-blue-hover)]">
                        <IconArrowRampRight size={15} stroke={2} />
                        <span>New decision</span>
                    </button>
                </div>
            </div>
            {isOnboardingComplete && <DocumentUploadSection initialProcessing={isProcessing} onUploadComplete={onUploadComplete} />}

            <div className={cn(
                'home-grid grid grid-cols-3 auto-rows-fr gap-3',
                isChatOpen && 'home-grid--narrow grid-cols-2'
            )}>

                {/* Card 1 — Entity & Asset Graph */}
                <div
                    className={cn(
                        'glass-card glass-card--blue',
                        visibleCards >= 1 && 'glass-card--visible',
                        clickable && 'glass-card--link'
                    )}
                    onClick={clickable ? () => onNavigate('catalog') : undefined}
                >
                    <div className="glass-card__inner bg-transparent rounded-[7px] px-4.5 py-4 flex flex-col gap-3.5 flex-1">
                        <div className="glass-card__header flex items-center gap-2">
                            <div className="w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-blue-bg)] text-[var(--color-card-blue)]">
                                <IconSitemap size={14} stroke={2} />
                            </div>
                            <span className="font-sans text-sm font-semibold text-[var(--color-neutral-12)] tracking-[-0.01em]">Entities & Assets</span>
                            <span className="text-xs text-[var(--color-neutral-11)] ml-auto">52 records</span>
                            {clickable && <IconArrowUpRight size={14} stroke={2} color="var(--color-neutral-11)" />}
                        </div>
                        <MiniHierarchyChart />
                    </div>
                </div>

                {/* Card 2 — Distribution Timeline */}
                <div
                    className={cn(
                        'glass-card glass-card--purple',
                        visibleCards >= 2 && 'glass-card--visible',
                        clickable && 'glass-card--link'
                    )}
                    onClick={clickable ? () => onNavigate('timeline') : undefined}
                >
                    <div className="glass-card__inner bg-transparent rounded-[7px] px-4.5 py-4 flex flex-col gap-3.5 flex-1">
                        <div className="glass-card__header flex items-center gap-2">
                            <div className="w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-green-bg)] text-[var(--color-card-green)]">
                                <IconCalendarEvent size={14} stroke={2} />
                            </div>
                            <span className="font-sans text-sm font-semibold text-[var(--color-neutral-12)] tracking-[-0.01em]">Distribution Timeline</span>
                            <span className="text-xs text-[var(--color-neutral-11)] ml-auto">5 events</span>
                            {clickable && <IconArrowUpRight size={14} stroke={2} color="var(--color-neutral-11)" />}
                        </div>
                        <div className="flex flex-col gap-0 flex-1 justify-center">
                            {TIMELINE_ROWS.map((row, i) => (
                                <div key={i} className="home-mini-timeline-row flex items-center gap-2.5 text-xs py-1.5 border-b border-[rgba(0,0,0,0.04)] last:border-b-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-card-green)] shrink-0 shadow-[0_0_0_3px_rgba(5,150,105,0.2)]" />
                                    <span className="font-semibold text-[var(--color-neutral-11)] min-w-[34px] text-xs">{row.year}</span>
                                    <span className="flex-1 text-[var(--color-neutral-11)] text-xs">{row.name}</span>
                                    <span className="font-semibold text-[var(--color-card-green)] text-xs">{row.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Card 3 — Asset Allocation (horizontal bars) */}
                <div
                    className={cn(
                        'glass-card glass-card--teal',
                        visibleCards >= 3 && 'glass-card--visible',
                        clickable && 'glass-card--link'
                    )}
                    onClick={clickable ? () => onNavigate('portfolio') : undefined}
                >
                    <div className="glass-card__inner bg-transparent rounded-[7px] px-4.5 py-4 flex flex-col gap-3.5 flex-1">
                        <div className="glass-card__header flex items-center gap-2">
                            <div className="w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-pink-bg)] text-[var(--color-card-pink)]">
                                <IconChartDonut size={14} stroke={2} />
                            </div>
                            <span className="font-sans text-sm font-semibold text-[var(--color-neutral-12)] tracking-[-0.01em]">Asset Allocation</span>
                            <span className="text-xs text-[var(--color-neutral-11)] ml-auto">{formatCompact(GRAND_TOTAL)}</span>
                            {clickable && <IconArrowUpRight size={14} stroke={2} color="var(--color-neutral-11)" />}
                        </div>
                        <div className="flex flex-col gap-2 flex-1 justify-center">
                            {ASSET_ALLOCATION.slice(0, 4).map((seg) => (
                                <div key={seg.categoryKey} className="flex items-center gap-2 text-xs">
                                    <span className="min-w-[80px] text-[var(--color-neutral-11)] text-xs">{seg.label}</span>
                                    <div className="flex-1 h-[5px] bg-[rgba(236,72,153,0.18)] rounded-[4px] overflow-hidden">
                                        <div
                                            className="h-full rounded-[4px] bg-[var(--color-card-pink-bold)]"
                                            style={{ width: `${seg.percentage}%` }}
                                        />
                                    </div>
                                    <span className="min-w-[38px] text-right font-semibold text-[var(--color-neutral-11)] text-xs">{formatCompact(seg.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Card 4 — Portfolio Performance (mini line) */}
                <div
                    className={cn(
                        'glass-card glass-card--amber',
                        visibleCards >= 4 && 'glass-card--visible',
                        clickable && 'glass-card--link'
                    )}
                    onClick={clickable ? () => onNavigate('portfolio') : undefined}
                >
                    <div className="glass-card__inner bg-transparent rounded-[7px] px-4.5 py-4 flex flex-col gap-3.5 flex-1">
                        <div className="glass-card__header flex items-center gap-2">
                            <div className="w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-purple-bg)] text-[var(--color-card-purple)]">
                                <IconTrendingUp size={14} stroke={2} />
                            </div>
                            <span className="font-sans text-sm font-semibold text-[var(--color-neutral-12)] tracking-[-0.01em]">Portfolio Performance</span>
                            <span className="text-xs text-[var(--color-neutral-11)] ml-auto">+8.2% YTD</span>
                            {clickable && <IconArrowUpRight size={14} stroke={2} color="var(--color-neutral-11)" />}
                        </div>
                        <MiniLineChart />
                    </div>
                </div>

                {/* Card 5 — Properties */}
                <div
                    className={cn(
                        'glass-card glass-card--rose',
                        visibleCards >= 5 && 'glass-card--visible',
                        clickable && 'glass-card--link'
                    )}
                    onClick={clickable ? () => onNavigate('portfolio') : undefined}
                >
                    <div className="glass-card__inner bg-transparent rounded-[7px] px-4.5 py-4 flex flex-col gap-3.5 flex-1">
                        <div className="glass-card__header flex items-center gap-2">
                            <div className="w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-red-bg)] text-[var(--color-card-red)]">
                                <IconMapPin size={14} stroke={2} />
                            </div>
                            <span className="font-sans text-sm font-semibold text-[var(--color-neutral-12)] tracking-[-0.01em]">Properties</span>
                            <span className="text-xs text-[var(--color-neutral-11)] ml-auto">6 holdings</span>
                            {clickable && <IconArrowUpRight size={14} stroke={2} color="var(--color-neutral-11)" />}
                        </div>
                        <div className="flex flex-col gap-0 flex-1 justify-center">
                            {topProperties.map(prop => (
                                <div key={prop.id} className="home-mini-property flex items-center justify-between gap-2 py-1.5 border-b border-[rgba(0,0,0,0.04)] last:border-b-0">
                                    <div className="flex flex-col gap-px min-w-0">
                                        <span className="text-xs font-semibold text-[var(--color-neutral-12)] overflow-hidden text-ellipsis whitespace-nowrap">{prop.name}</span>
                                        <span className="text-xs text-[var(--color-neutral-11)] overflow-hidden text-ellipsis whitespace-nowrap">{prop.address.split(',').slice(-2).join(',').trim()}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-[var(--color-neutral-11)] shrink-0">{formatCompact(prop.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Card 6 — Estate Summary */}
                <div
                    className={cn(
                        'glass-card glass-card--emerald',
                        visibleCards >= 6 && 'glass-card--visible',
                        clickable && 'glass-card--link'
                    )}
                    onClick={clickable ? () => onNavigate('portfolio') : undefined}
                >
                    <div className="glass-card__inner bg-transparent rounded-[7px] px-4.5 py-4 flex flex-col gap-3.5 flex-1">
                        <div className="glass-card__header flex items-center gap-2">
                            <div className="w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-orange-bg)] text-[var(--color-card-orange)]">
                                <IconCurrencyDollar size={14} stroke={2} />
                            </div>
                            <span className="font-sans text-sm font-semibold text-[var(--color-neutral-12)] tracking-[-0.01em]">Estate Summary</span>
                            {clickable && <IconArrowUpRight size={14} stroke={2} color="var(--color-neutral-11)" />}
                        </div>
                        <div className="flex flex-col gap-2 flex-1 justify-center">
                            <div className="font-display text-[28px] font-bold text-[var(--color-black)] tracking-[-0.03em] leading-none">{formatCompact(GRAND_TOTAL)}</div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgba(234,88,12,0.12)] text-[var(--color-card-orange)]">+8.2% YTD</span>
                                <span className="text-xs text-[var(--color-neutral-11)]">20 assets · 9 entities</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
