import { useMemo, useRef, useState, useEffect, useCallback, type MutableRefObject } from 'react'
import { cn } from '@/lib/utils'
import { IconArrowsMaximize, IconX } from '@tabler/icons-react'
import type { DistributionEvent, AssetTimelineEvent, AnyCatalogItem } from '@/data/types'
import type { CardActionType } from '@/components/molecules/CardActionsMenu'
import type { PromptAnchorRect } from '@/lib/helpers/prompt-anchor'
import { snapshotPromptAnchor } from '@/lib/helpers/prompt-anchor'
import { TimelinePromptAnchorRegistryContext } from '@/lib/contexts/prompt-anchor-registry'
import { ActionPromptDropdown } from '@/components/molecules/ActionPromptDropdown'
import { groupByYear } from '@/lib/helpers/timeline'
import { ScrollProgress } from '@/components/atoms/ScrollProgress'
import { TimelineNode } from '@/components/molecules/TimelineNode'
import { AssetTimelineNode } from '@/components/molecules/AssetTimelineNode'
import { TimelineToolbar } from '@/components/molecules/TimelineToolbar'
import { CatalogToolbar } from '@/components/organisms/CatalogToolbar'
import type { DropdownItem, QuickFilterItem } from '@/components/organisms/CatalogToolbar'
import { DistributionDetailPanel } from '@/components/organisms/DistributionDetailPanel'
import { ASSET_CATEGORIES } from '@/lib/constants'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'

// ─── Types ────────────────────────────────────────────────────────────────────

const TIMELINE_QUICK_FILTERS: QuickFilterItem[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'age-based', label: 'Age-based' },
    { key: 'conditional', label: 'Conditional' },
]

// The 3 main trusts shown first in the dropdown
const MAIN_TRUST_IDS = ['thn-t1', 'thn-t2', 'thn-t3']

// Subtrust → parent trust mapping for filtering
const SUBTRUST_TO_PARENT: Record<string, string> = {
    'thn-t4': 'thn-t1',   // ILIT → RLT
    'thn-t5': 'thn-t1',   // Marital Trust → RLT
    'thn-t6': 'thn-t1',   // Bypass Trust → RLT
    'thn-t7': 'thn-t1',   // Edward IV Subtrust → RLT
    'thn-t8': 'thn-t1',   // Catherine Subtrust → RLT
    'thn-t9': 'thn-t1',   // Benjamin Subtrust → RLT
    'thn-t10': 'thn-t3',  // Natalie Subtrust → Dynasty II
    'thn-t11': 'thn-t3',  // Lucas Subtrust → Dynasty II
    'thn-t12': 'thn-t1',  // SLAT → RLT
    'thn-t13': 'thn-t1',  // CRT → RLT
    'thn-t14': 'thn-t1',  // Family Trust → RLT
}

export interface TimelineActionPromptPayload {
    action: CardActionType
    contextName: string
    anchorRect: PromptAnchorRect | null
    sourceTimelineEventId: string
    onSubmit: (text: string, hasFiles: boolean) => void
}

function TimelineTrackActionPrompt({
    prompt,
    anchorGettersRef,
    onClose,
}: {
    prompt: TimelineActionPromptPayload
    anchorGettersRef: MutableRefObject<Map<string, () => HTMLElement | null>>
    onClose: () => void
}) {
    const eventId = prompt.sourceTimelineEventId
    const anchorGetter = useCallback(() => {
        const fn = anchorGettersRef.current.get(eventId)
        const el = fn?.() ?? null
        if (el) return snapshotPromptAnchor(el.getBoundingClientRect())
        return prompt.anchorRect
    }, [eventId, prompt.anchorRect])

    return (
        <ActionPromptDropdown
            action={prompt.action}
            contextName={prompt.contextName}
            anchorRect={prompt.anchorRect}
            anchorGetter={anchorGetter}
            onSubmit={prompt.onSubmit}
            onClose={onClose}
        />
    )
}

interface TimelinePageProps {
    distributions: DistributionEvent[]
    assetTimeline: AssetTimelineEvent[]
    getItemById: (id: string) => AnyCatalogItem | null
    activeOrgs: string[]
    onOrgsChange: (ids: string[]) => void
    isV3Processing?: boolean
    /** Selected item id — can be a trust id or an asset id */
    selectedItemId?: string | null
    onClearSelectedItem?: () => void
    isExpanded?: boolean
    onToggleExpand?: () => void
    onActionRequest?: (event: DistributionEvent, action: CardActionType, anchor?: PromptAnchorRect | null) => void
    actionPromptEventId?: string | null
    timelineActionPrompt?: TimelineActionPromptPayload | null
    onCloseTimelineActionPrompt?: () => void
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function TimelinePage({
    distributions,
    assetTimeline,
    getItemById,
    activeOrgs,
    isV3Processing,
    selectedItemId,
    onClearSelectedItem,
    isExpanded,
    onToggleExpand,
    onActionRequest,
    actionPromptEventId = null,
    timelineActionPrompt = null,
    onCloseTimelineActionPrompt = () => {},
}: TimelinePageProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const timelineAnchorGettersRef = useRef(new Map<string, () => HTMLElement | null>())
    const timelineAnchorRegistry = useMemo(
        () => ({
            register: (id: string, getEl: () => HTMLElement | null) => {
                timelineAnchorGettersRef.current.set(id, getEl)
            },
            unregister: (id: string) => {
                timelineAnchorGettersRef.current.delete(id)
            },
        }),
        [],
    )
    const currentYear = new Date().getFullYear()
    const [selectedEvent, setSelectedEvent] = useState<DistributionEvent | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [activeItemId, setActiveItemId] = useState<string[]>(selectedItemId ? [selectedItemId] : [])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeQuickFilter] = useState<string | null>(null)

    // Build combined dropdown: 3 main trusts + all assets that have timeline entries
    const dropdownItems = useMemo<DropdownItem[]>(() => {
        const trustItems = MAIN_TRUST_IDS.flatMap(id => {
            const trust = getItemById(id)
            if (!trust) return []
            return [{ key: id, label: trust.name, icon: 'IconBuildingBank' } satisfies DropdownItem]
        })

        const assetIds = [...new Set(assetTimeline.map(e => e.assetId))]
        const assetItems = assetIds.flatMap(id => {
            const asset = getItemById(id)
            if (!asset) return []
            const iconMap: Record<string, string> = {
                property: 'IconHome',
                investment: 'IconTrendingUp',
                maritime: 'IconAnchor',
                vehicle: 'IconCar',
                insurance: 'IconShield',
                art: 'IconPalette',
            }
            const icon = iconMap[asset.categoryKey] ?? 'IconBox'
            return [{ key: id, label: asset.name, icon } satisfies DropdownItem]
        })

        return [...trustItems, ...assetItems]
    }, [getItemById, assetTimeline])

    // Sync from navigation (selectedItemId prop)
    useEffect(() => {
        if (selectedItemId) {
            setActiveItemId([selectedItemId])
            onClearSelectedItem?.()
        }
    }, [selectedItemId, onClearSelectedItem])

    // Default to first dropdown item when nothing is selected
    useEffect(() => {
        if (activeItemId.length === 0 && dropdownItems.length > 0) {
            setActiveItemId([dropdownItems[0].key])
        }
    }, [activeItemId.length, dropdownItems])

    const currentActiveId = activeItemId[0] ?? null

    // Determine if currently selected item is a trust or an asset
    const currentItem = currentActiveId ? getItemById(currentActiveId) : null
    const isTrustMode = currentItem?.categoryKey === 'trust'
    const isAssetMode = currentItem != null && ASSET_CATEGORIES.has(currentItem.categoryKey)

    // ── Trust mode: distribution events ──
    const filteredDistributions = useMemo(() => {
        if (!isTrustMode) return []
        let filtered = distributions
        if (activeOrgs.length > 0) {
            filtered = filtered.filter(d => {
                const person = getItemById(d.beneficiaryId)
                return person && activeOrgs.includes(person.organizationId)
            })
        }
        if (currentActiveId) {
            filtered = filtered.filter(d => {
                const parentTrust = SUBTRUST_TO_PARENT[d.trustId] ?? d.trustId
                return d.trustId === currentActiveId || parentTrust === currentActiveId
            })
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(d => {
                const beneficiary = getItemById(d.beneficiaryId)
                return beneficiary?.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
            })
        }
        if (activeQuickFilter === 'upcoming') filtered = filtered.filter(d => d.status === 'Pending')
        else if (activeQuickFilter === 'completed') filtered = filtered.filter(d => d.status === 'Completed')
        else if (activeQuickFilter === 'age-based') filtered = filtered.filter(d => d.triggerType === 'Age')
        else if (activeQuickFilter === 'conditional') filtered = filtered.filter(d => d.triggerType === 'Event' || d.triggerType === 'Condition')
        return filtered
    }, [distributions, activeOrgs, currentActiveId, isTrustMode, searchQuery, activeQuickFilter, getItemById])

    const timelineEvents = useMemo(() =>
        filteredDistributions
            .filter(d => d.triggerYear != null)
            .sort((a, b) => (a.triggerYear ?? 0) - (b.triggerYear ?? 0) || (a.triggerAge ?? 0) - (b.triggerAge ?? 0)),
        [filteredDistributions]
    )

    const activationEvents = useMemo(() =>
        filteredDistributions.filter(d => d.triggerYear == null && d.triggerEvent?.toLowerCase().includes("grantor's death")),
        [filteredDistributions]
    )

    const conditionalEvents = useMemo(() =>
        filteredDistributions.filter(d => d.triggerYear == null && !d.triggerEvent?.toLowerCase().includes("grantor's death")),
        [filteredDistributions]
    )

    const totalTrustCount = filteredDistributions.length

    const yearFirstIds = useMemo(() => {
        const groups = groupByYear(timelineEvents)
        const ids = new Set<string>()
        for (const events of groups.values()) {
            if (events.length > 0) ids.add(events[0].id)
        }
        return ids
    }, [timelineEvents])

    // ── Asset mode: asset timeline events ──
    const assetEvents = useMemo(() => {
        if (!isAssetMode || !currentActiveId) return []
        return [...assetTimeline]
            .filter(e => e.assetId === currentActiveId)
            .sort((a, b) => a.year - b.year)
    }, [isAssetMode, currentActiveId, assetTimeline])

    // Determine year-first set for asset events (for year labels)
    const assetYearFirstIds = useMemo(() => {
        const seen = new Set<number>()
        const ids = new Set<string>()
        for (const evt of assetEvents) {
            if (!seen.has(evt.year)) {
                seen.add(evt.year)
                ids.add(evt.id)
            }
        }
        return ids
    }, [assetEvents])

    const totalAssetCount = assetEvents.length
    const totalCount = isTrustMode ? totalTrustCount : totalAssetCount

    const handleCardClick = useCallback((event: DistributionEvent) => {
        setSelectedEvent(event)
        setIsDetailOpen(true)
    }, [])

    const handleDetailClose = useCallback(() => {
        setIsDetailOpen(false)
    }, [])

    const handleAction = useCallback((event: DistributionEvent, action: CardActionType, anchor?: PromptAnchorRect | null) => {
        if (action === 'view-source' || action === 'edit-distribution') {
            handleCardClick(event)
        } else {
            onActionRequest?.(event, action, anchor)
        }
    }, [handleCardClick, onActionRequest])

    const hasEvents = isTrustMode ? filteredDistributions.length > 0 : assetEvents.length > 0

    return (
        <TimelinePromptAnchorRegistryContext.Provider value={timelineAnchorRegistry}>
        <div className={cn(
            'timeline-page flex flex-col gap-[var(--spacing-5)] px-[var(--spacing-6)] pt-[36px] max-w-[1120px] w-full mx-auto relative flex-1 min-h-0 overflow-hidden',
            isExpanded && 'timeline-page--expanded !max-w-none !p-0 h-full',
        )}>
            {!isExpanded && (
                <div className="flex w-full flex-col p-0">
                    <div className="flex w-full items-center justify-between flex-wrap gap-[var(--spacing-4)]">
                        <div className="flex items-center gap-[var(--spacing-2)]">
                            <h1 className="font-display text-[28px] font-black leading-[1.25] tracking-[-0.02em] text-[var(--color-gray-12)] [-webkit-text-stroke:0.3px_currentColor]">Distribution Timeline</h1>
                            <span className="flex min-w-[24px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] px-1.5 py-0.5 text-[13px] font-[var(--font-weight-medium)] leading-[1.54] text-[var(--color-gray-12)]">{totalCount}</span>
                        </div>
                    </div>
                    <CatalogToolbar
                        activeView={'list'}
                        onViewChange={() => {}}
                        activeOrgs={activeOrgs}
                        onOrgsChange={() => {}}
                        activeCategory={activeItemId}
                        onCategoryChange={(keys) => { if (keys.length > 0) setActiveItemId([keys[keys.length - 1]]) }}
                        dropdownItems={dropdownItems}
                        dropdownLabel="Select"
                        viewOptions={null}
                        quickFilterItems={isTrustMode ? TIMELINE_QUICK_FILTERS : undefined}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder={isTrustMode ? 'Search distributions…' : 'Search events…'}
                        showDropdownClear={false}
                    />
                </div>
            )}

            <div className="timeline-page__body flex flex-col gap-[var(--spacing-7)] flex-1 min-h-0">
                {isV3Processing && (
                    <div className="v3-empty-state">
                        <img className="v3-empty-state__icon" src={fojoMascotSmall} alt="Fojo" />
                        <div className="v3-empty-state__title">Fojo is building your estate profile...</div>
                        <div className="v3-empty-state__sub">This page will appear in a moment</div>
                    </div>
                )}

                {/* ── Unified timeline track ── */}
                {!isV3Processing && hasEvents && (
                    <div className={cn(
                        'tl-track-wrap relative overflow-hidden flex-1 min-h-0 flex flex-col justify-center',
                        isExpanded ? 'border-none rounded-none bg-transparent mt-0' : 'rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-neutral-1)] mt-[var(--spacing-3)]'
                    )}>
                        {isExpanded && (
                            <TimelineToolbar
                                activeTrust={activeItemId}
                                onTrustChange={(keys) => { if (keys.length > 0) setActiveItemId([keys[keys.length - 1]]) }}
                                trustItems={dropdownItems}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                        )}

                        {onToggleExpand && (
                            <button
                                className={cn(
                                    'map-expand-btn absolute top-3 right-3 z-10 flex items-center justify-center gap-[var(--spacing-2)] h-8 px-[var(--spacing-3)] py-0.5 bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-md)] shadow-[var(--shadow-subtle)] text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] leading-[1.54] whitespace-nowrap transition-colors duration-150 hover:bg-[var(--color-neutral-3)]',
                                    isExpanded && 'map-expand-btn--primary !bg-[#ef4444] !text-white !border-[#ef4444] hover:!bg-[#dc2626]',
                                )}
                                onClick={onToggleExpand}
                            >
                                {isExpanded ? (
                                    <><IconX size={16} stroke={2} /><span>Close</span></>
                                ) : (
                                    <><IconArrowsMaximize size={16} stroke={1.5} /><span>Expand</span></>
                                )}
                            </button>
                        )}

                        <div
                            className="tl-track flex items-stretch gap-2 overflow-x-auto overflow-y-visible snap-x snap-proximity scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] relative px-8 min-h-[580px]"
                            ref={trackRef}
                        >
                            <div className="hidden" />

                            {/* ── Trust mode: distribution events ── */}
                            {isTrustMode && (
                                <>
                                    {timelineEvents.map((evt, i) => {
                                        const prevYear = i > 0 ? timelineEvents[i - 1].triggerYear ?? 0 : 0
                                        const showNow = prevYear < currentYear && (evt.triggerYear ?? 0) >= currentYear

                                        return (
                                            <>{showNow && (
                                                <div key="now" className="flex flex-col items-center shrink-0 z-[4] min-w-[24px] relative">
                                                    <div className="absolute top-[calc(50%-48px)] bottom-[calc(50%-48px)] w-[2px] bg-[var(--color-accent-9)] rounded-[4px] opacity-65" />
                                                    <div className="absolute top-1/2 -translate-y-1/2 font-display text-xs font-[800] uppercase tracking-[0.06em] text-[var(--color-white)] bg-[var(--color-accent-9)] px-2.5 py-[3px] rounded-[var(--radius-full)] whitespace-nowrap z-[5]">Now · {currentYear}</div>
                                                </div>
                                            )}
                                            <TimelineNode
                                                key={evt.id}
                                                event={evt}
                                                beneficiary={getItemById(evt.beneficiaryId)}
                                                trust={getItemById(evt.trustId)}
                                                position={i % 2 === 0 ? 'above' : 'below'}
                                                showYearLabel={yearFirstIds.has(evt.id)}
                                                isCurrentYear={evt.triggerYear === currentYear}
                                                onSourceClick={() => handleCardClick(evt)}
                                                onAction={handleAction}
                                                pinActionsButtonVisible={actionPromptEventId === evt.id}
                                            /></>
                                        )
                                    })}

                                    {(activationEvents.length > 0 || conditionalEvents.length > 0) && (
                                        <div className="flex flex-col items-center shrink-0 z-[4] min-w-[24px] relative">
                                            <div className="absolute top-[calc(50%-48px)] bottom-[calc(50%-48px)] w-[2px] bg-[var(--color-accent-9)] rounded-[4px] opacity-65" />
                                            <div className="absolute top-1/2 -translate-y-1/2 font-display text-xs font-[800] uppercase tracking-[0.06em] text-[var(--color-white)] bg-[var(--color-accent-9)] px-2.5 py-[3px] rounded-[var(--radius-full)] whitespace-nowrap z-[5]">Life Events</div>
                                        </div>
                                    )}

                                    {[...activationEvents, ...conditionalEvents].map((evt, i) => (
                                        <TimelineNode
                                            key={evt.id}
                                            event={evt}
                                            beneficiary={getItemById(evt.beneficiaryId)}
                                            trust={getItemById(evt.trustId)}
                                            position={i % 2 === 0 ? 'above' : 'below'}
                                            showYearLabel={false}
                                            isCurrentYear={false}
                                            onSourceClick={() => handleCardClick(evt)}
                                            onAction={handleAction}
                                            pinActionsButtonVisible={actionPromptEventId === evt.id}
                                        />
                                    ))}
                                </>
                            )}

                            {/* ── Asset mode: asset timeline events ── */}
                            {isAssetMode && (
                                <>
                                    {assetEvents.map((evt, i) => {
                                        const prevYear = i > 0 ? assetEvents[i - 1].year : 0
                                        const showNow = prevYear < currentYear && evt.year >= currentYear

                                        return (
                                            <>{showNow && (
                                                <div key="now" className="flex flex-col items-center shrink-0 z-[4] min-w-[24px] relative">
                                                    <div className="absolute top-[calc(50%-48px)] bottom-[calc(50%-48px)] w-[2px] bg-[var(--color-accent-9)] rounded-[4px] opacity-65" />
                                                    <div className="absolute top-1/2 -translate-y-1/2 font-display text-xs font-[800] uppercase tracking-[0.06em] text-[var(--color-white)] bg-[var(--color-accent-9)] px-2.5 py-[3px] rounded-[var(--radius-full)] whitespace-nowrap z-[5]">Now · {currentYear}</div>
                                                </div>
                                            )}
                                            <AssetTimelineNode
                                                key={evt.id}
                                                event={evt}
                                                position={i % 2 === 0 ? 'above' : 'below'}
                                                showYearLabel={assetYearFirstIds.has(evt.id)}
                                                isCurrentYear={evt.year === currentYear}
                                            /></>
                                        )
                                    })}
                                </>
                            )}
                        </div>

                        <ScrollProgress trackRef={trackRef} />
                    </div>
                )}

                {!isV3Processing && !hasEvents && (
                    <div className="flex flex-col items-center justify-center gap-[var(--spacing-3)] px-10 py-20 text-center text-[var(--color-neutral-11)] text-sm">
                        <p>{isTrustMode ? 'No distributions found for the selected organization.' : 'No timeline events found for this asset.'}</p>
                    </div>
                )}
            </div>

            <DistributionDetailPanel
                event={selectedEvent}
                beneficiary={selectedEvent ? getItemById(selectedEvent.beneficiaryId) : null}
                trust={selectedEvent ? getItemById(selectedEvent.trustId) : null}
                isOpen={isDetailOpen}
                onClose={handleDetailClose}
            />

            {timelineActionPrompt && (
                <TimelineTrackActionPrompt
                    prompt={timelineActionPrompt}
                    anchorGettersRef={timelineAnchorGettersRef}
                    onClose={onCloseTimelineActionPrompt}
                />
            )}
        </div>
        </TimelinePromptAnchorRegistryContext.Provider>
    )
}
