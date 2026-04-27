import { IconDots } from '@tabler/icons-react'
import { cn, getInitials } from '@/lib/utils'
import { getIcon } from '@/lib/icons'
import type { AnyCatalogItem } from '@/data/types'
import { getCategoryByKey } from '@/data/categories'
import { PriorityBadge, ALERT_TYPES } from '@/components/atoms/PriorityBadge'
interface CatalogCardProps {
    item: AnyCatalogItem
    onClick?: () => void
    isHighlighted?: boolean
}

export function CatalogCard({ item, onClick, isHighlighted }: CatalogCardProps) {
    const category = getCategoryByKey(item.categoryKey)
    const categoryLabel = category?.label ?? ''

    // Dynamic icon component based on category definition
    const IconComponent = getIcon(category?.icon)

    return (
        <div
            className={cn('card', isHighlighted && 'card--highlighted')}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={item.name}
            onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick?.()
                }
            }}
        >
            {item.priorityStatus && ALERT_TYPES.has(item.priorityStatus.type) && (
                <div className="absolute top-2 right-2 z-[1]">
                    <PriorityBadge status={item.priorityStatus} compact />
                </div>
            )}
            {item.imageUrl ? (
                <div className="card__image w-full aspect-[1.67] overflow-hidden bg-[var(--color-neutral-3)] flex items-center justify-center">
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).parentElement?.classList.add('card__image--placeholder');
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            ) : (
                <div className="card__image card__image--placeholder w-full aspect-[1.67] overflow-hidden bg-[var(--color-neutral-3)] flex items-center justify-center">
                    <div className="flex items-center justify-center opacity-80">
                        <IconComponent size={40} stroke={1.5} color="var(--color-neutral-11)" />
                    </div>
                </div>
            )}

            <div className="flex flex-col overflow-hidden flex-1 justify-between border-t border-[var(--color-gray-4)] px-[var(--spacing-4)] pt-[var(--spacing-2)] pb-[var(--spacing-4)]">
                <div className="flex items-start gap-[var(--spacing-2)]">
                    <div className="flex flex-col flex-1 min-w-0 pt-[var(--spacing-1)]">
                        <div className="card__name flex items-center gap-1.5 text-[var(--color-neutral-12)] text-[15px] font-[var(--font-weight-semibold)] leading-[1.47] tracking-[-0.01px] overflow-hidden">
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">{item.name}</span>
                            {item.reviewStatus === 'unreviewed' && (
                                <span className="unreviewed-badge mt-0 ml-[var(--spacing-2)]">Unreviewed</span>
                            )}
                        </div>
                        <div className="text-[var(--color-neutral-11)] text-xs font-[var(--font-weight-medium)] leading-5">
                            {categoryLabel}
                        </div>
                    </div>
                    <button className="card__menu-btn flex justify-center items-center aspect-square rounded-[var(--radius-sm)] min-h-7 w-7 overflow-hidden shrink-0 transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]" onClick={(e) => e.stopPropagation()}>
                        <IconDots size={16} stroke={2} color="var(--color-neutral-11)" />
                    </button>
                </div>

                {item.description && (
                    <div className="card__description text-[var(--color-neutral-12)] text-[13px] font-[var(--font-weight-regular)] leading-[22px] mt-[var(--spacing-2)] line-clamp-2">{item.description}</div>
                )}

                <div className="flex items-center gap-[var(--spacing-2)] mt-[var(--spacing-2)] pt-[var(--spacing-1)]">
                    {item.createdBy.avatarUrl ? (
                        <div className="rounded-full w-6 h-6 overflow-hidden shrink-0 border-2 border-[var(--color-white)]">
                            <img src={item.createdBy.avatarUrl} alt={item.createdBy.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="rounded-full w-6 h-6 overflow-hidden shrink-0 border-2 border-[var(--color-white)] flex items-center justify-center bg-[var(--color-neutral-3)] text-xs font-[var(--font-weight-medium)] text-[var(--color-gray-11)] tracking-[0.04px] leading-[1.2]">
                            {getInitials(item.createdBy.name)}
                        </div>
                    )}
                    <span className="text-[var(--color-neutral-11)] text-xs font-[var(--font-weight-medium)] leading-5">
                        {item.createdAt
                            ? `Created on ${new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : ''}
                    </span>
                </div>
            </div>
        </div>
    )
}
