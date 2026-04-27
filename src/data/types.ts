/*
 * types.ts — Estate Intelligence data model
 *
 * Source of truth for all entity, relationship, and catalog types.
 * Modeled from: domain-research.md, feature-context.md (sections 3–5),
 * and docs/plans/2026-03-02-estate-intelligence-prototype.md (Davis Family dataset).
 */

// ─────────────────────────────────────────────
// PRIORITY STATUS
// ─────────────────────────────────────────────

export type PriorityStatusType = 'updated' | 'missing-insurance' | 'stale-valuation' | 'missing-documents' | 'expiring-soon'

export interface PriorityStatus {
    type: PriorityStatusType
    /** Tooltip detail text, e.g. "Insurance expires in 30 days" */
    detail: string
}

// ─────────────────────────────────────────────
// SHARED BASE
// ─────────────────────────────────────────────

/** Every catalog item shares this base */
export interface CatalogItem {
    id: string
    /** Display name */
    name: string
    /** Which organization/family this belongs to */
    organizationId: string
    /** The category key — a known CatalogCategoryKey or a dynamic AI-created category string */
    categoryKey: CatalogCategoryKey | (string & {})
    /** Optional cover image URL */
    imageUrl?: string
    /** Additional gallery images */
    galleryImages?: string[]
    /** Short human-readable description */
    description?: string
    createdAt: string   // ISO date string
    createdBy: {
        id: string
        name: string
        avatarUrl?: string
    }
    /** All relationships this item participates in (computed at runtime) */
    relationships?: Relationship[]
    /** Review status — set during import flow */
    reviewStatus?: 'reviewed' | 'unreviewed'
    /** Explicit visual parent in the family tree layout */
    treeParentId?: string
    /** AI-determined per-asset fields (label → value). Each asset can have its own unique fields. */
    customFields?: Record<string, string | number>
    /** Priority badge — drives sorting and visual badge display */
    priorityStatus?: PriorityStatus
}

// ─────────────────────────────────────────────
// ENTITY TYPES
// ─────────────────────────────────────────────

/** A human being in the estate */
export interface Person extends CatalogItem {
    categoryKey: 'person'
    dob?: string             // ISO date
    age?: number
    /** e.g. "Grantor", "Child", "Spouse", "Father" */
    relationship?: string
    /**
     * Roles are NOT stored here — they are derived from Relationship edges.
     * e.g. if a person has a grantor_of edge, their role is "Grantor".
     * This array is a convenience cache for display.
     */
    roles?: PersonRole[]
}

export type PersonRole =
    | 'Grantor'
    | 'Trustee'
    | 'Co-Trustee'
    | 'Successor Trustee'
    | 'Income Beneficiary'
    | 'Remainder Beneficiary'
    | 'Trust Protector'
    | 'Advisor'
    | 'Attorney'

/** A trust instrument */
export interface Trust extends CatalogItem {
    categoryKey: 'trust'
    trustType: TrustType
    dateEstablished?: string   // ISO date; null if created-at-death trust
    state?: string             // governing law state
    status: TrustStatus
    /** If this trust is created from another trust at death */
    parentTrustId?: string
}

export type TrustType =
    | 'Revocable Living Trust'
    | 'Irrevocable Life Insurance Trust'
    | 'Spousal Lifetime Access Trust'
    | 'Grantor Retained Annuity Trust'
    | 'Qualified Personal Residence Trust'
    | 'Dynasty Trust'
    | 'Charitable Remainder Trust'
    | 'Charitable Lead Trust'
    | 'Special Needs Trust'
    | "Children's Trust"
    | 'Marital Trust'
    | 'Bypass Trust'
    | 'Other'

export type TrustStatus = 'Active' | 'Created at death' | 'Terminated' | 'Pending'

/** A legal business entity */
export interface BusinessEntity extends CatalogItem {
    categoryKey: 'entity'
    entityType: BusinessEntityType
    stateOfFormation?: string
    dateFormed?: string   // ISO date
    purpose?: string
}

export type BusinessEntityType = 'LLC' | 'LP' | 'Foundation' | 'DAF' | 'Corporation' | 'FLP' | 'Other'

/** A physical or financial asset */
export interface Asset extends CatalogItem {
    categoryKey: 'property' | 'investment' | 'maritime' | 'vehicle' | 'insurance' | 'art'
    assetType: AssetType
    value?: number           // in USD
    holderId?: string        // id of Trust or BusinessEntity holding this asset
    address?: string         // for real estate
}

export type AssetType =
    | 'Real Estate'
    | 'Investment Account'
    | 'Business Interest'
    | 'Insurance Policy'
    | 'Vehicle'
    | 'Yacht / Watercraft'
    | 'Aircraft'
    | 'Art & Collectibles'
    | 'Cryptocurrency'
    | 'Other'

// ─────────────────────────────────────────────
// RELATIONSHIPS (EDGES)
// ─────────────────────────────────────────────

/**
 * A typed directional edge between any two catalog items.
 * Direction: from → to, with a typed label.
 */
export interface Relationship {
    from: string      // catalog item id
    to: string        // catalog item id
    type: RelationshipType
    /** Human-readable label shown on diagram edges and in "Linked to" section */
    label: string
    /** Ownership percentage, if applicable (e.g. owns 100%) */
    percentage?: number
    /** Beneficiary category — income or remainder */
    beneficiaryType?: 'income' | 'remainder'
    /** Ordinal for successor trustees (1st, 2nd, 3rd) */
    ordinal?: number
}

export type RelationshipType =
    | 'grantor_of'
    | 'trustee_of'
    | 'co_trustee_of'
    | 'successor_trustee_of'
    | 'beneficiary_of'
    | 'trust_protector_of'
    | 'owns'
    | 'holds'
    | 'member_of'
    | 'managed_by'
    | 'distributes_to'
    | 'creates'        // e.g. RLT creates Children's Trust at death
    | 'insures'        // policy covers an asset

// ─────────────────────────────────────────────
// DISTRIBUTION EVENTS
// ─────────────────────────────────────────────

/**
 * A scheduled or triggered transfer of assets from a trust to a beneficiary.
 * These are the entries shown on the Timeline view.
 */
export interface DistributionEvent {
    id: string
    beneficiaryId: string    // Person id
    trustId: string          // Trust id
    /** Age-based: triggers when beneficiary reaches this age */
    triggerAge?: number
    /** Calendar year this is expected to occur (computed from DOB + triggerAge) */
    triggerYear?: number
    /** Event-based: plain-language description of the triggering event */
    triggerEvent?: string
    /** Short category label for card display (1-2 words, e.g. "Marriage", "Health Condition") */
    triggerCategory?: string
    /** Dot color on timeline: blue = age-based, green = event-based */
    triggerType: 'Age' | 'Event' | 'Condition'
    /** Amount — either a dollar value or "Remainder" or "Income for life" */
    amount: number | 'Remainder' | string
    /** Plain-language purpose (e.g. "Education and living expenses") */
    description?: string
    status: 'Pending' | 'Completed' | 'Waived'
    /** ID of the catalog item whose citations apply (usually the trust) */
    citationItemId?: string
}

// ─────────────────────────────────────────────
// ASSET TIMELINE
// ─────────────────────────────────────────────

export interface AssetTimelineEvent {
    id: string
    assetId: string
    year: number
    label: string
    value?: number
    description?: string
}

// ─────────────────────────────────────────────
// CATALOG INFRASTRUCTURE
// ─────────────────────────────────────────────

export type CatalogCategoryKey =
    | 'person'
    | 'trust'
    | 'entity'
    | 'property'
    | 'investment'
    | 'maritime'
    | 'vehicle'
    | 'insurance'
    | 'art'
    | 'organization'

/** A catalog category — used for the toolbar Category dropdown and sidebar grouping */
export interface CatalogCategory {
    key: CatalogCategoryKey | (string & {})
    label: string
    /** Tabler icon name, e.g. "IconHome", "IconBuilding" */
    icon: string
    /** Color used for map nodes of this type */
    color: string
    /** Whether items of this type appear in the estate map diagram */
    appearsInMap: boolean
}

/** An organization (family office / client family) */
export interface Organization {
    id: string
    name: string
    /** Short display name, e.g. "Smith Family" → "SF" */
    initials: string
    /** URL to org logo */
    logoUrl?: string
}

// ─────────────────────────────────────────────
// UNION TYPE — any catalog item
// ─────────────────────────────────────────────

export type AnyCatalogItem = Person | Trust | BusinessEntity | Asset | CatalogItem

// ─────────────────────────────────────────────
// VIEW STATE
// ─────────────────────────────────────────────

export type CatalogView = 'grid' | 'list' | 'map'

export type QuickFilterKey =
    | 'recently-updated'
    | 'expiring-soon'
    | 'unlinked'
    | 'missing-insurance'
    | 'stale-valuation'
    | 'missing-documents'
