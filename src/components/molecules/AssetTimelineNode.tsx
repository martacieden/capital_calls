import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { motion, useInView } from 'motion/react'
import { IconDots } from '@tabler/icons-react'
import type { AssetTimelineEvent } from '@/data/types'
import { CardActionsMenu, type CardActionType } from '@/components/molecules/CardActionsMenu'
import { getAssetEventContactActions } from '@/lib/utils/contactActionUtils'
import { snapshotPromptAnchor, type PromptAnchorRect } from '@/lib/helpers/prompt-anchor'

function formatValue(value?: number): string {
    if (value == null) return ''
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
}

interface AssetTimelineNodeProps {
    event: AssetTimelineEvent
    position: 'above' | 'below'
    showYearLabel: boolean
    isCurrentYear: boolean
    onAction?: (event: AssetTimelineEvent, action: CardActionType, anchor?: PromptAnchorRect | null) => void
    pinActionsButtonVisible?: boolean
}

export function AssetTimelineNode({ event, position, showYearLabel, isCurrentYear, onAction, pinActionsButtonVisible }: AssetTimelineNodeProps) {
    const ref = useRef<HTMLDivElement>(null)
    const cardRef = useRef<HTMLDivElement>(null)
    const actionsBtnRef = useRef<HTMLButtonElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false)

    const openMenu = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setActionsMenuOpen(true)
    }, [])

    const showActionsPin = actionsMenuOpen || pinActionsButtonVisible

    return (
        <motion.div
            ref={ref}
            className={cn(
                'tl-node relative flex flex-col items-center min-w-[280px] max-w-[280px] shrink-0 snap-center z-[1]',
                position === 'above' && 'tl-node--above justify-start pt-4 pb-[260px]',
                position === 'below' && 'tl-node--below justify-end pt-[260px] pb-4',
            )}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            <motion.div
                style={{ position: 'relative', zIndex: 2 }}
                initial={{ opacity: 0, y: position === 'above' ? 12 : -12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Asset event card */}
                <div
                    ref={cardRef}
                    className="group min-w-[256px] max-w-[256px] shrink-0 rounded-[var(--radius-lg)] relative z-[2] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.03)] bg-[var(--color-white)] border border-[var(--color-gray-4)] overflow-hidden hover:-translate-y-px hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-gray-5)] [transition:box-shadow_0.2s,transform_0.15s,border-color_0.15s]"
                >
                    {/* Three-dots action button */}
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

                    <div className="flex flex-col gap-0.5 px-4 py-3.5">
                        <div className="flex items-start gap-2 mb-0.5">
                            <div className="text-[17px] font-[800] text-[var(--color-gray-12)] leading-[1.2] tracking-[-0.022em] flex-1">{event.label}</div>
                            {event.recurring && (
                                <span className="shrink-0 mt-0.5 inline-flex items-center h-[18px] px-1.5 rounded-[4px] bg-[var(--color-neutral-3)] text-[10px] font-[600] text-[var(--color-neutral-10)] leading-none whitespace-nowrap">
                                    Recurring
                                </span>
                            )}
                        </div>
                        {formatValue(event.value) && (
                            <div className="font-display text-[14px] font-semibold text-[var(--color-accent-9)] tracking-[-0.02em] leading-[1.3]">
                                {formatValue(event.value)}
                            </div>
                        )}
                        <div className="text-[12px] font-[var(--font-weight-medium)] text-[var(--color-neutral-11)] leading-[1.3] mt-0.5">{event.year}</div>
                        {event.description && (
                            <p className="text-[12px] text-[var(--color-neutral-11)] leading-[1.5] mt-1.5 line-clamp-3">{event.description}</p>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="tl-node__stem absolute left-1/2 -translate-x-1/2 w-[1.5px] bg-[var(--color-accent-9)] opacity-25 z-0" />

            <div className="tl-node__anchor absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center">
                <div className={cn(
                    'tl-node__dot size-3 rounded-full bg-[var(--color-accent-9)] border-[2.5px] border-[var(--color-white)] shadow-[0_0_0_2px_rgba(0,91,226,0.3)] z-[2] transition-[transform,box-shadow] duration-200 ease-out',
                    isCurrentYear && 'tl-node__dot--current size-[14px] shadow-[0_0_0_2px_rgba(0,91,226,0.4),0_0_10px_rgba(0,91,226,0.25)]'
                )} />
                {showYearLabel && (
                    <div className={cn(
                        'tl-node__year-label absolute left-1/2 -translate-x-1/2 font-display text-xs font-[800] text-[var(--color-neutral-11)] bg-[var(--color-white)] px-2 py-0.5 rounded-[var(--radius-full)] border border-[var(--color-gray-5)] whitespace-nowrap z-[3] tracking-[0.02em] shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
                        isCurrentYear && 'text-[var(--color-accent-9)] border-[rgba(0,91,226,0.3)] bg-[rgba(0,91,226,0.04)]',
                    )}>
                        {event.year}
                    </div>
                )}
            </div>

            {actionsMenuOpen && onAction && (
                <CardActionsMenu
                    itemContext="asset-timeline"
                    anchorRef={cardRef}
                    onClose={() => setActionsMenuOpen(false)}
                    visibleActions={[
                        'create-task',
                        ...getAssetEventContactActions(event),
                    ]}
                    onAction={(action) => {
                        const el = actionsBtnRef.current ?? cardRef.current
                        const anchor = el ? snapshotPromptAnchor(el.getBoundingClientRect()) : null
                        onAction(event, action, anchor)
                        setActionsMenuOpen(false)
                    }}
                />
            )}
        </motion.div>
    )
}
