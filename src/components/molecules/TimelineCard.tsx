import { useState, useRef, useCallback, useLayoutEffect, useContext } from 'react'
import { TimelinePromptAnchorRegistryContext } from '@/lib/contexts/prompt-anchor-registry'
import { cn, getInitials } from '@/lib/utils'
import { IconFileText, IconDots } from '@tabler/icons-react'
import type { DistributionEvent, AnyCatalogItem } from '@/data/types'
import { getSourceDocsForItem } from '@/data/citations'
import { formatAmount, getTypeLabel, shouldShowAmount } from '@/lib/helpers/timeline'
import { CardActionsMenu, type CardActionType } from '@/components/molecules/CardActionsMenu'
import { snapshotPromptAnchor, type PromptAnchorRect } from '@/lib/helpers/prompt-anchor'

export interface TimelineCardProps {
    event: DistributionEvent
    beneficiary: AnyCatalogItem | null
    trust: AnyCatalogItem | null
    onClick: () => void
    onDoubleClick?: () => void
    onAction?: (event: DistributionEvent, action: CardActionType, anchor?: PromptAnchorRect | null) => void
    pinActionsButtonVisible?: boolean
}


export function TimelineCard({ event, beneficiary, trust: _trust, onClick, onDoubleClick, onAction, pinActionsButtonVisible }: TimelineCardProps) {
    const citationId = event.citationItemId ?? event.trustId
    const sourceDocs = getSourceDocsForItem(citationId)
    const primaryDoc = sourceDocs[0]
    const extraCount = sourceDocs.length - 1

    const [actionsMenuOpen, setActionsMenuOpen] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const actionsBtnRef = useRef<HTMLButtonElement>(null)
    const timelineAnchorRegistry = useContext(TimelinePromptAnchorRegistryContext)

    const getPromptAnchorEl = useCallback(() => actionsBtnRef.current ?? cardRef.current, [])

    useLayoutEffect(() => {
        if (!onAction || !timelineAnchorRegistry) return
        timelineAnchorRegistry.register(event.id, getPromptAnchorEl)
        return () => timelineAnchorRegistry.unregister(event.id)
    }, [onAction, timelineAnchorRegistry, event.id, getPromptAnchorEl])

    const openMenu = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setActionsMenuOpen(true)
    }, [])

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onDoubleClick?.()
        setActionsMenuOpen(true)
    }, [onDoubleClick])

    const showActionsPin = actionsMenuOpen || pinActionsButtonVisible

    return (
        <>
            <div
                ref={cardRef}
                className="group tl-slide min-w-[296px] max-w-[296px] shrink-0 rounded-[var(--radius-lg)] cursor-pointer relative z-[2] [transform:translateZ(0)] [transition:box-shadow_0.2s,transform_0.15s,border-color_0.15s] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.03)] bg-[var(--color-white)] border border-[var(--color-gray-4)] overflow-visible hover:-translate-y-px hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-gray-5)]"
                onClick={(e) => { if (e.detail < 2) onClick() }}
                onDoubleClick={handleDoubleClick}
            >
                {/* Three-dots action button — visible only on hover */}
                {onAction && (
                    <button
                        ref={actionsBtnRef}
                        className={cn(
                            'absolute top-[8px] right-[8px] z-10 flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border-none bg-transparent p-0 transition-opacity duration-100 hover:bg-[var(--color-neutral-3)] cursor-pointer',
                            showActionsPin ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                        )}
                        onClick={openMenu}
                        title="Actions"
                        aria-label="Card actions"
                    >
                        <IconDots size={16} stroke={2} color="var(--color-neutral-11)" />
                    </button>
                )}

                <div className="flex flex-col gap-0.5 h-full overflow-hidden px-4.5 py-4">
                    <div className="flex items-center gap-2.5 mb-2.5">
                        {beneficiary?.imageUrl ? (
                            <img className="size-7 rounded-[8px] shrink-0 object-cover" src={beneficiary.imageUrl} alt={beneficiary.name} />
                        ) : (
                            <div className="size-7 rounded-[8px] shrink-0 flex items-center justify-center text-[11px] font-semibold bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)] tracking-[0.02em]">
                                {beneficiary ? getInitials(beneficiary.name) : '?'}
                            </div>
                        )}
                        <div className="text-[13px] font-medium text-[var(--color-neutral-11)] leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">{beneficiary?.name ?? 'Unknown'}</div>
                    </div>

                    <div className="text-[20px] font-[800] text-[var(--color-gray-12)] leading-[1.15] tracking-[-0.025em] mb-0.5">{getTypeLabel(event)}</div>

                    {shouldShowAmount(event.amount) && (
                        <div className={cn(
                            'font-display text-[16px] font-semibold text-[var(--color-accent-9)] tracking-[-0.02em] leading-[1.3] mt-px',
                            typeof event.amount !== 'number' && 'font-sans text-sm'
                        )}>
                            {formatAmount(event.amount)}
                        </div>
                    )}

                    <p className="text-[13px] text-[var(--color-neutral-11)] leading-[1.5] line-clamp-2 mt-1 flex-1">{event.description}</p>

                    {primaryDoc && (
                        <div className="mt-auto pt-3.5 flex items-center gap-2.5">
                            <div className="tl-slide__chip inline-flex items-center gap-1.5 py-1.5 pl-2 pr-2.5 rounded-[4px] bg-white border border-[var(--color-neutral-4)] text-xs font-medium text-[var(--color-neutral-11)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] max-w-full transition-[border-color,box-shadow] duration-150">
                                <div className="size-5 rounded-[4px] bg-[var(--color-blue-1)] flex items-center justify-center shrink-0">
                                    <IconFileText size={12} stroke={1.5} color="var(--color-accent-9)" />
                                </div>
                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{primaryDoc.replace('.pdf', '')}</span>
                            </div>
                            {extraCount > 0 && (
                                <span className="text-xs font-medium text-[var(--color-neutral-11)] shrink-0">+{extraCount}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {actionsMenuOpen && onAction && (
                <CardActionsMenu
                    itemContext="timeline"
                    anchorRef={cardRef}
                    onClose={() => setActionsMenuOpen(false)}
                    onAction={(action) => {
                        const el = actionsBtnRef.current ?? cardRef.current
                        const anchor = el ? snapshotPromptAnchor(el.getBoundingClientRect()) : null
                        onAction(event, action, anchor)
                        setActionsMenuOpen(false)
                    }}
                />
            )}
        </>
    )
}
