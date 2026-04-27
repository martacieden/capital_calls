import type { ReactNode } from 'react'
import type { AnyCatalogItem } from '@/data/types'
import { getIcon } from '@/lib/icons'
import { getCategoryByKey } from '@/data/categories'
import { ListSkeleton } from '@/components/atoms/CatalogSkeleton'
import { PriorityBadge, ALERT_TYPES } from '@/components/atoms/PriorityBadge'
import { usePaginatedList } from '@/lib/hooks/usePaginatedList'

interface ListViewProps {
    items: AnyCatalogItem[]
    onItemClick?: (item: AnyCatalogItem) => void
    isLoading?: boolean
    /** Optional content rendered inside the scroll container, above the table */
    collectionsHeader?: ReactNode
}

export function ListView({ items, onItemClick, isLoading, collectionsHeader }: ListViewProps) {
    const { visibleItems, hasMore, sentinelRef } = usePaginatedList(items, 9, '200px')

    if (isLoading) return <ListSkeleton />

    return (
        <div className="list-view">
            {collectionsHeader}
            <table className="list-table">
                <thead>
                    <tr className="list-header-row">
                        <th className="list-header-cell list-header-cell--name" style={{ width: '40%' }}>Name</th>
                        <th className="list-header-cell">Category</th>
                        <th className="list-header-cell">Created By</th>
                        <th className="list-header-cell">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {visibleItems.map((item) => {
                        const category = getCategoryByKey(item.categoryKey)
                        const IconComponent = getIcon(category?.icon)

                        return (
                            <tr
                                key={item.id}
                                className="list-row"
                                onClick={() => onItemClick?.(item)}
                                tabIndex={0}
                                aria-label={item.name}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        onItemClick?.(item)
                                    }
                                }}
                            >
                                <td className="list-cell list-cell--name">
                                    <div className="list-avatar-mini">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt="" />
                                        ) : (
                                            <IconComponent size={14} stroke={1.5} color="var(--color-neutral-11)" />
                                        )}
                                    </div>
                                    <span>{item.name}</span>
                                    {item.priorityStatus && ALERT_TYPES.has(item.priorityStatus.type) && (
                                        <PriorityBadge status={item.priorityStatus} />
                                    )}
                                    {item.reviewStatus === 'unreviewed' && (
                                        <span className="unreviewed-badge mt-0 ml-[var(--spacing-2)]">Unreviewed</span>
                                    )}
                                </td>
                                <td className="list-cell">
                                    <span
                                        className="inline-flex px-2 py-0.5 rounded-[var(--radius-2xl)] text-xs font-[var(--font-weight-bold)]"
                                        style={{
                                            background: 'var(--color-neutral-3)',
                                            color: 'var(--color-neutral-11)'
                                        }}
                                    >
                                        {category?.label}
                                    </span>
                                </td>
                                <td className="list-cell">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {item.createdBy.name}
                                    </div>
                                </td>
                                <td className="list-cell">
                                    <span className="text-[var(--color-gray-12)] text-sm">
                                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div ref={sentinelRef} className="flex justify-center items-center py-4">
                {hasMore && <div className="load-more-spinner" />}
            </div>
        </div>
    )
}
