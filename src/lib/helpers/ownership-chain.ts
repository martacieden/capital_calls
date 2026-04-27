/**
 * ownership-chain.ts — Helpers for building ownership path trees
 * and classifying relationship types (hierarchy vs. non-hierarchy).
 */

import type { AnyCatalogItem, Relationship, RelationshipType } from '@/data/types'

/* ── Hierarchy classification ───────────────────────────────────── */

/** Relationship types that form the ownership/hierarchy tree */
export const HIERARCHY_TYPES = new Set<RelationshipType>([
    'grantor_of',
    'owns',
    'holds',
    'creates',
])

export function isHierarchyRelationship(rel: Relationship): boolean {
    return HIERARCHY_TYPES.has(rel.type)
}

/* ── Ownership path ─────────────────────────────────────────────── */

/**
 * Traces treeParentId upward from an item to the root.
 * Returns the chain ordered top-down: [Person, Trust, Entity, Asset].
 */
export function getOwnershipPath(
    itemId: string,
    getItemById: (id: string) => AnyCatalogItem | null,
): AnyCatalogItem[] {
    const chain: AnyCatalogItem[] = []
    let current = getItemById(itemId)
    const visited = new Set<string>()

    while (current) {
        if (visited.has(current.id)) break // guard against cycles
        visited.add(current.id)
        chain.unshift(current)
        if (!current.treeParentId) break
        current = getItemById(current.treeParentId)
    }

    return chain
}

/* ── Contextual label inversion ─────────────────────────────────── */

const FORWARD_LABELS: Record<RelationshipType, string> = {
    grantor_of: 'Grantor of',
    trustee_of: 'Trustee of',
    co_trustee_of: 'Co-Trustee of',
    successor_trustee_of: 'Successor Trustee of',
    beneficiary_of: 'Beneficiary of',
    trust_protector_of: 'Trust Protector of',
    owns: 'Owns',
    holds: 'Holds',
    member_of: 'Member of',
    managed_by: 'Managed by',
    distributes_to: 'Distributes to',
    creates: 'Creates',
    insures: 'Covers',
}

const REVERSE_LABELS: Record<RelationshipType, string> = {
    grantor_of: 'Grantor',
    trustee_of: 'Trustee',
    co_trustee_of: 'Co-Trustee',
    successor_trustee_of: 'Successor Trustee',
    beneficiary_of: 'Beneficiary',
    trust_protector_of: 'Trust Protector',
    owns: 'Owned by',
    holds: 'Held by',
    member_of: 'Has member',
    managed_by: 'Manages',
    distributes_to: 'Receives from',
    creates: 'Created by',
    insures: 'Insured by',
}

/**
 * Returns the relationship label from the current item's perspective.
 * When currentItemId === rel.from, use forward label.
 * When currentItemId === rel.to, use reverse label.
 */
export function getContextualLabel(rel: Relationship, currentItemId: string): string {
    const base = currentItemId === rel.from
        ? FORWARD_LABELS[rel.type] ?? rel.label
        : REVERSE_LABELS[rel.type] ?? rel.label

    if (rel.percentage != null) return `${base} ${rel.percentage}%`
    if (rel.beneficiaryType) {
        const prefix = rel.beneficiaryType === 'income' ? 'Income' : 'Remainder'
        return `${prefix} ${base}`
    }
    if (rel.ordinal != null) {
        const ordStr = rel.ordinal === 1 ? '1st' : rel.ordinal === 2 ? '2nd' : `${rel.ordinal}th`
        return `${ordStr} ${base}`
    }
    return base
}
