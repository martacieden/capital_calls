import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, useInView } from 'motion/react'
import type { DistributionEvent, AnyCatalogItem } from '@/data/types'
import { TimelineCard } from '@/components/molecules/TimelineCard'
import type { CardActionType } from '@/components/molecules/CardActionsMenu'
import type { PromptAnchorRect } from '@/lib/helpers/prompt-anchor'

export interface TimelineNodeProps {
    event: DistributionEvent
    beneficiary: AnyCatalogItem | null
    trust: AnyCatalogItem | null
    position: 'above' | 'below'
    showYearLabel: boolean
    isCurrentYear: boolean
    onSourceClick: () => void
    onAction?: (event: DistributionEvent, action: CardActionType, anchor?: PromptAnchorRect | null) => void
    pinActionsButtonVisible?: boolean
}

export function TimelineNode({ event, beneficiary, trust, position, showYearLabel, isCurrentYear, onSourceClick, onAction, pinActionsButtonVisible }: TimelineNodeProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })
    return (
        <motion.div
            ref={ref}
            className={cn(
                'tl-node relative flex flex-col items-center min-w-[324px] max-w-[324px] shrink-0 snap-center z-[1]',
                position === 'above' && 'tl-node--above justify-start pt-4 pb-[295px]',
                position === 'below' && 'tl-node--below justify-end pt-[295px] pb-4',
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
                <TimelineCard event={event} beneficiary={beneficiary} trust={trust} onClick={onSourceClick} onAction={onAction} pinActionsButtonVisible={pinActionsButtonVisible} />
            </motion.div>

            <div className="tl-node__stem absolute left-1/2 -translate-x-1/2 w-[1.5px] bg-[var(--color-accent-9)] opacity-25 z-0" />

            <div className="tl-node__anchor absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] flex items-center justify-center">
                <div className={cn(
                    'tl-node__dot size-3 rounded-full bg-[var(--color-accent-9)] border-[2.5px] border-[var(--color-white)] shadow-[0_0_0_2px_rgba(0,91,226,0.3)] z-[2] transition-[transform,box-shadow] duration-200 ease-out',
                    isCurrentYear && 'tl-node__dot--current size-[14px] shadow-[0_0_0_2px_rgba(0,91,226,0.4),0_0_10px_rgba(0,91,226,0.25)]'
                )} />
                {showYearLabel && event.triggerYear != null && (
                    <div className={cn(
                        'tl-node__year-label absolute left-1/2 -translate-x-1/2 font-display text-xs font-[800] text-[var(--color-neutral-11)] bg-[var(--color-white)] px-2 py-0.5 rounded-[var(--radius-full)] border border-[var(--color-gray-5)] whitespace-nowrap z-[3] tracking-[0.02em] shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
                        isCurrentYear && 'text-[var(--color-accent-9)] border-[rgba(0,91,226,0.3)] bg-[rgba(0,91,226,0.04)]',
                    )}>
                        {event.triggerYear}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
