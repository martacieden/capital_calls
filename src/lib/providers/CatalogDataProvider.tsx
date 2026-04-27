import { createContext, useContext, useState, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useCatalog } from '@/lib/hooks/useCatalog'
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters'
import { catalogCategories } from '@/data/categories'
import type { AnyCatalogItem, CatalogCategory, Relationship, DistributionEvent, QuickFilterKey } from '@/data/types'

interface CatalogDataContextValue {
  /** All items (catalog + locally created), sorted by category order */
  allItems: AnyCatalogItem[]
  /** All relationships (catalog + local) */
  allRelationships: Relationship[]
  /** All distribution events (catalog + local) */
  allDistributions: DistributionEvent[]
  /** Lookup a single item by ID */
  getItemById: (id: string) => AnyCatalogItem | null

  /** Active organization filter */
  activeOrgs: string[]
  setActiveOrgs: (orgs: string[]) => void
  /** Active category filter */
  activeCategory: string[]
  setActiveCategory: (cats: string[]) => void

  /** Search + quick filter state (from useCatalogFilters) */
  filters: {
    searchQuery: string
    setSearchQuery: (q: string) => void
    activeQuickFilters: Set<QuickFilterKey>
    toggleQuickFilter: (key: QuickFilterKey) => void
    filteredItems: AnyCatalogItem[]
    filterCounts: Record<QuickFilterKey, number>
  }

  /** All categories (built-in + custom) */
  allCategories: CatalogCategory[]
  /** Keys of user-created categories (deletable) */
  customCategoryKeys: Set<string>
  /** Add a custom category — returns false if key already exists */
  addCustomCategory: (cat: CatalogCategory) => boolean
  /** Remove a custom category by key (built-in categories cannot be removed) */
  removeCustomCategory: (key: string) => void

  /** Add items created via Fojo */
  addLocalItems: (items: AnyCatalogItem[]) => void
  /** Add relationships created via Fojo (e.g. connecting new assets to source nodes) */
  addLocalRelationships: (rels: Relationship[]) => void
}

const CatalogDataContext = createContext<CatalogDataContextValue | null>(null)

export function CatalogDataProvider({ children }: { children: ReactNode }) {
  const [activeOrgs, setActiveOrgs] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string[]>([])
  const [localItems, setLocalItems] = useState<AnyCatalogItem[]>([])
  const [localRelationships, setLocalRelationships] = useState<Relationship[]>([])
  const [localDistributions] = useState<DistributionEvent[]>([])
  const [customCategories, setCustomCategories] = useState<CatalogCategory[]>([])

  const { items, relationships: catalogRelationships, distributions: catalogDistributions, getById } = useCatalog({
    orgIds: activeOrgs,
    categoryKeys: activeCategory,
  })

  const allCategories = useMemo<CatalogCategory[]>(
    () => [...catalogCategories, ...customCategories],
    [customCategories]
  )

  const customCategoryKeys = useMemo(
    () => new Set(customCategories.map(c => c.key)),
    [customCategories]
  )

  // Pre-built category order map for O(1) sort lookups (js-index-maps)
  const categoryOrder = useMemo(() => {
    const map = new Map<string, number>()
    allCategories.forEach((c, i) => map.set(c.key, i))
    return map
  }, [allCategories])

  const addCustomCategory = useCallback((cat: CatalogCategory): boolean => {
    if (catalogCategories.some(c => c.key === cat.key)) return false
    if (customCategories.some(c => c.key === cat.key)) return false
    setCustomCategories(prev => [...prev, cat])
    return true
  }, [customCategories])

  const removeCustomCategory = useCallback((key: string) => {
    setCustomCategories(prev => prev.filter(c => c.key !== key))
    setActiveCategory(prev => prev.filter(k => k !== key))
  }, [])

  const allItems = useMemo<AnyCatalogItem[]>(() => {
    let extra = localItems
    if (activeOrgs.length > 0) extra = extra.filter(i => activeOrgs.includes(i.organizationId))
    if (activeCategory.length > 0) extra = extra.filter(i => activeCategory.includes(i.categoryKey as string))
    const combined = [...items, ...extra]
    combined.sort((a, b) =>
      (categoryOrder.get(a.categoryKey) ?? 999) - (categoryOrder.get(b.categoryKey) ?? 999)
    )
    return combined
  }, [items, localItems, activeOrgs, activeCategory, categoryOrder])

  const allRelationships = useMemo<Relationship[]>(
    () => [...catalogRelationships, ...localRelationships],
    [catalogRelationships, localRelationships]
  )

  const allDistributions = useMemo<DistributionEvent[]>(
    () => [...catalogDistributions, ...localDistributions],
    [catalogDistributions, localDistributions]
  )

  const getItemById = useCallback((id: string): AnyCatalogItem | null => {
    return getById(id) ?? localItems.find(i => i.id === id) ?? null
  }, [getById, localItems])

  const filters = useCatalogFilters(allItems, allRelationships)

  const addLocalItems = useCallback((newItems: AnyCatalogItem[]) => {
    setLocalItems(prev => [...newItems, ...prev])
  }, [])

  const addLocalRelationships = useCallback((newRels: Relationship[]) => {
    setLocalRelationships(prev => [...prev, ...newRels])
  }, [])

  const value = useMemo<CatalogDataContextValue>(() => ({
    allItems,
    allRelationships,
    allDistributions,
    getItemById,
    activeOrgs,
    setActiveOrgs,
    activeCategory,
    setActiveCategory,
    allCategories,
    customCategoryKeys,
    addCustomCategory,
    removeCustomCategory,
    filters,
    addLocalItems,
    addLocalRelationships,
  }), [allItems, allRelationships, allDistributions, getItemById, activeOrgs, activeCategory, allCategories, customCategoryKeys, addCustomCategory, removeCustomCategory, filters, addLocalItems, addLocalRelationships])

  return (
    <CatalogDataContext.Provider value={value}>
      {children}
    </CatalogDataContext.Provider>
  )
}

export function useCatalogData() {
  const ctx = useContext(CatalogDataContext)
  if (!ctx) throw new Error('useCatalogData must be used inside CatalogDataProvider')
  return ctx
}
