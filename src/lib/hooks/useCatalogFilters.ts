import { useState, useMemo, useCallback } from 'react'
import type { AnyCatalogItem, Relationship, QuickFilterKey } from '@/data/types'
import { sortByPriority } from '@/lib/helpers/priority-sort'

export function useCatalogFilters(allItems: AnyCatalogItem[], allRelationships: Relationship[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilterKey>>(new Set())

  const toggleQuickFilter = useCallback((key: QuickFilterKey) => {
    setActiveQuickFilters(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const linkedItemIds = useMemo(() => {
    const ids = new Set<string>()
    allRelationships.forEach(r => { ids.add(r.from); ids.add(r.to) })
    return ids
  }, [allRelationships])

  const predicates = useMemo<Record<QuickFilterKey, (item: AnyCatalogItem) => boolean>>(() => ({
    'recently-updated': (item) => item.priorityStatus?.type === 'updated',
    'expiring-soon': (item) => item.priorityStatus?.type === 'expiring-soon',
    'unlinked': (item) => !linkedItemIds.has(item.id),
    'missing-insurance': (item) => item.priorityStatus?.type === 'missing-insurance',
    'stale-valuation': (item) => item.priorityStatus?.type === 'stale-valuation',
    'missing-documents': (item) => item.priorityStatus?.type === 'missing-documents',
    /** Tasks page keys — never match catalog rows */
    'task-overdue': () => false,
    'task-due-soon': () => false,
    'task-high-priority': () => false,
    /** Decisions page keys — never match catalog rows */
    'decision-due-soon': () => false,
    'decision-pending-approval': () => false,
    'decision-high-value': () => false,
    'decision-wire-ready': () => false,
  }), [linkedItemIds])

  const filterCounts = useMemo(() => {
    const counts = {
      'recently-updated': 0,
      'expiring-soon': 0,
      'unlinked': 0,
      'missing-insurance': 0,
      'stale-valuation': 0,
      'missing-documents': 0,
      'task-overdue': 0,
      'task-due-soon': 0,
      'task-high-priority': 0,
      'decision-due-soon': 0,
      'decision-pending-approval': 0,
      'decision-high-value': 0,
      'decision-wire-ready': 0,
    } satisfies Record<QuickFilterKey, number>
    for (const item of allItems) {
      for (const key of Object.keys(counts) as QuickFilterKey[]) {
        if (predicates[key](item)) counts[key]++
      }
    }
    return counts
  }, [allItems, predicates])

  const filteredItems = useMemo(() => {
    let result = allItems
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.categoryKey && String(i.categoryKey).toLowerCase().includes(q))
      )
    }
    if (activeQuickFilters.size > 0) {
      const activeKeys = [...activeQuickFilters]
      result = result.filter(item => activeKeys.some(key => predicates[key](item)))
    }
    return sortByPriority(result)
  }, [allItems, searchQuery, activeQuickFilters, predicates])

  return useMemo(() => ({
    searchQuery,
    setSearchQuery,
    activeQuickFilters,
    toggleQuickFilter,
    filteredItems,
    filterCounts,
  }), [searchQuery, activeQuickFilters, toggleQuickFilter, filteredItems, filterCounts])
}
