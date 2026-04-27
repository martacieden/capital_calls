import type { ReactNode } from 'react'
import { CatalogCard } from '@/components/atoms/CatalogCard'
import { CardSkeleton } from '@/components/atoms/CatalogSkeleton'
import type { AnyCatalogItem } from '@/data/types'
import { cn } from '@/lib/utils'
import { usePaginatedList } from '@/lib/hooks/usePaginatedList'

interface CardViewProps {
    items: AnyCatalogItem[]
    onItemClick?: (item: AnyCatalogItem) => void
    isLoading?: boolean
    isChatOpen?: boolean
    highlightedIds?: Set<string>
    /** Optional content rendered inside the scroll container, above the cards grid */
    collectionsHeader?: ReactNode
}

export function CardView({ items, onItemClick, isLoading, isChatOpen, highlightedIds, collectionsHeader }: CardViewProps) {
    const { visibleItems, hasMore, sentinelRef } = usePaginatedList(items, 9, '400px')

    if (isLoading) return <CardSkeleton isChatOpen={isChatOpen} />

    return (
        <div className="cards-section" style={collectionsHeader ? { marginTop: 0, paddingTop: 0 } : undefined}>
            {collectionsHeader}
            <div className={cn('cards-grid', !isChatOpen && 'cards-grid--wide')}>
                {visibleItems.map((item) => (
                    <CatalogCard
                        key={item.id}
                        item={item}
                        onClick={() => onItemClick?.(item)}
                        isHighlighted={highlightedIds?.has(item.id)}
                    />
                ))}
            </div>
            <div ref={sentinelRef} className="flex justify-center items-center py-4">
                {hasMore && <div className="load-more-spinner" />}
            </div>
        </div>
    )
}
