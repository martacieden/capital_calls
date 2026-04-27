/**
 * Thornton Family Estate — Barrel export
 *
 * 52 items: 15 people + 8 trusts + 9 entities + 20 assets
 * ~55 relationships, 5 distribution events
 */
import type { AnyCatalogItem } from '../types'
import { thorntonPeople } from './people'
import { thorntonTrusts } from './trusts'
import { thorntonEntities } from './entities'
import { thorntonAssets } from './assets'
import { thorntonRelationships } from './relationships'
import { thorntonDistributions } from './distributions'

// Re-export individual arrays for consumers that need them
export {
    thorntonPeople,
    thorntonTrusts,
    thorntonEntities,
    thorntonAssets,
    thorntonRelationships,
    thorntonDistributions,
}

// Re-export valuations data
export * from './valuations-data'

// Re-export graph positions
export { THORNTON_POSITIONS, THORNTON_VISUAL_EDGES } from './graph-positions'

/** Combined Thornton family data with helper methods */
export const thorntonFamilyData = {
    organizationId: 'org-thornton',
    people: thorntonPeople,
    trusts: thorntonTrusts,
    entities: thorntonEntities,
    assets: thorntonAssets,
    relationships: thorntonRelationships,
    distributions: thorntonDistributions,

    getAllItems(): AnyCatalogItem[] {
        return [
            ...this.people,
            ...this.trusts,
            ...this.entities,
            ...this.assets,
        ]
    },

    getById(id: string) {
        return this.getAllItems().find((item) => item.id === id) ?? null
    },

    getRelationships(id: string) {
        return this.relationships.filter((r) => r.from === id || r.to === id)
    },

    getOutgoing(id: string) {
        return this.relationships.filter((r) => r.from === id)
    },

    getIncoming(id: string) {
        return this.relationships.filter((r) => r.to === id)
    },

    formatCurrency(value: number | string): string {
        if (typeof value !== 'number') return String(value)
        return '$' + value.toLocaleString('en-US')
    },
}
