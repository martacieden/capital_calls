import { useMemo } from 'react'
import { sampleCatalogItems, smithRelationships, smithDistributions } from '@/data/sample-catalog'
import { davisFamilyData } from '@/data/davis-family'
import { thorntonFamilyData } from '@/data/thornton/index'
import type { AnyCatalogItem, CatalogCategoryKey, Relationship, DistributionEvent } from '@/data/types'

/*
 * useCatalog.ts — Catalog data access hook
 *
 * Returns ALL catalog items across all orgs by default.
 * The caller is responsible for filtering by org/category.
 * Also returns relationships and distributions filtered to the active orgs.
 */

// All items across all organizations
const allCatalogItems: AnyCatalogItem[] = [
    ...(sampleCatalogItems as unknown as AnyCatalogItem[]),
    ...(davisFamilyData.getAllItems() as AnyCatalogItem[]),
    ...(thorntonFamilyData.getAllItems() as AnyCatalogItem[]),
]

// All relationships indexed by orgId
const allRelationshipsByOrg: Record<string, Relationship[]> = {
    'org-smith':    smithRelationships,
    'org-davis':    davisFamilyData.relationships,
    'org-thornton': thorntonFamilyData.relationships,
}

// All distributions indexed by orgId
const allDistributionsByOrg: Record<string, DistributionEvent[]> = {
    'org-smith':    smithDistributions,
    'org-davis':    davisFamilyData.distributions,
    'org-thornton': thorntonFamilyData.distributions,
}

export function useCatalog(filters?: { orgIds?: string[]; categoryKeys?: string[] }) {
    const items = useMemo<AnyCatalogItem[]>(() => {
        let result = allCatalogItems

        if (filters?.orgIds && filters.orgIds.length > 0) {
            result = result.filter(i => filters.orgIds!.includes(i.organizationId))
        }

        if (filters?.categoryKeys && filters.categoryKeys.length > 0) {
            result = result.filter(i => filters.categoryKeys!.includes(i.categoryKey as string))
        }

        return result
    }, [filters?.orgIds?.join(','), filters?.categoryKeys?.join(',')])

    const relationships = useMemo<Relationship[]>(() => {
        const activeOrgIds =
            filters?.orgIds && filters.orgIds.length > 0
                ? filters.orgIds
                : Object.keys(allRelationshipsByOrg)
        return activeOrgIds.flatMap(id => allRelationshipsByOrg[id] ?? [])
    }, [filters?.orgIds?.join(',')])

    const distributions = useMemo<DistributionEvent[]>(() => {
        const activeOrgIds =
            filters?.orgIds && filters.orgIds.length > 0
                ? filters.orgIds
                : Object.keys(allDistributionsByOrg)
        return activeOrgIds.flatMap(id => allDistributionsByOrg[id] ?? [])
    }, [filters?.orgIds?.join(',')])

    function getByCategory(key: CatalogCategoryKey) {
        return items.filter((item) => item.categoryKey === key)
    }

    function getById(id: string) {
        return allCatalogItems.find((item) => item.id === id) ?? null
    }

    return { items, relationships, distributions, getByCategory, getById }
}
