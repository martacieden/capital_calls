import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { IconFlag } from '@tabler/icons-react'
import type { PriorityStatus } from '@/data/types'

const BADGE_LABELS: Record<string, string> = {
    'updated': 'Recently updated',
    'missing-insurance': 'Uninsured',
    'stale-valuation': 'Stale valuation',
    'missing-documents': 'Missing documents',
    'expiring-soon': 'Expiring soon',
}

export const ALERT_TYPES = new Set(['missing-insurance', 'stale-valuation', 'missing-documents', 'expiring-soon'])

interface PriorityBadgeProps {
    status: PriorityStatus
    /** Render as a compact icon-only badge (for cards) */
    compact?: boolean
}

export function PriorityBadge({ status, compact }: PriorityBadgeProps) {
    const label = BADGE_LABELS[status.type]
    const ref = useRef<HTMLSpanElement>(null)
    const [tooltip, setTooltip] = useState<{ top: number; left: number } | null>(null)

    const showTooltip = useCallback(() => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        setTooltip({ top: r.bottom + 6, left: r.left + r.width / 2 })
    }, [])

    const hideTooltip = useCallback(() => setTooltip(null), [])

    if (!label) return null

    const isAlert = ALERT_TYPES.has(status.type)

    if (compact && isAlert) {
        return (
            <>
                <span
                    ref={ref}
                    className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-full cursor-default bg-[var(--color-card-orange-bg)] text-[var(--color-card-orange)] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                    onMouseEnter={showTooltip}
                    onMouseLeave={hideTooltip}
                >
                    <IconFlag size={14} stroke={2} />
                </span>
                {tooltip && createPortal(
                    <div
                        className="fixed z-[9999] px-3 py-1.5 bg-white text-[var(--color-gray-12)] text-[13px] leading-[1.4] rounded-[var(--radius-md)] whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] border border-[var(--color-gray-4)] pointer-events-none animate-fade-in"
                        style={{ top: tooltip.top, left: tooltip.left, transform: 'translateX(-50%)' }}
                    >
                        {status.detail}
                    </div>,
                    document.body
                )}
            </>
        )
    }

    return (
        <>
            <span
                ref={ref}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-[var(--font-weight-medium)] leading-[1.3] whitespace-nowrap cursor-default shadow-[0_1px_1px_rgba(0,0,0,0.08)] ${isAlert ? 'bg-[var(--color-card-orange-bg)] text-[var(--color-card-orange)]' : 'bg-[var(--color-blue-3)] text-[var(--color-accent-9)]'}`}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
            >
                {label}
            </span>
            {tooltip && createPortal(
                <div
                    className="fixed z-[9999] px-3 py-1.5 bg-white text-[var(--color-gray-12)] text-[13px] leading-[1.4] rounded-[var(--radius-md)] whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] border border-[var(--color-gray-4)] pointer-events-none animate-fade-in"
                    style={{ top: tooltip.top, left: tooltip.left, transform: 'translateX(-50%)' }}
                >
                    {status.detail}
                </div>,
                document.body
            )}
        </>
    )
}
