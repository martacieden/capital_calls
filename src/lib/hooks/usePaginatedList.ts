import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { PAGINATION } from '@/lib/constants'

export function usePaginatedList<T>(items: T[], pageSize = PAGINATION.catalogCards, rootMargin = `${PAGINATION.scrollThreshold}px`) {
    const [visibleCount, setVisibleCount] = useState<number>(pageSize)
    const sentinelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setVisibleCount(pageSize)
    }, [items, pageSize])

    const loadMore = useCallback(() => {
        setVisibleCount(prev => Math.min(prev + pageSize, items.length))
    }, [items.length, pageSize])

    useEffect(() => {
        if (visibleCount >= items.length) return
        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) loadMore()
            },
            { root: null, rootMargin, threshold: 0 }
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [visibleCount, items.length, loadMore, rootMargin])

    const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount])

    return {
        visibleItems,
        hasMore: visibleCount < items.length,
        sentinelRef,
    }
}
