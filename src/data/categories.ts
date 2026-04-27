import type { CatalogCategory } from './types'

/*
 * categories.ts — Catalog category definitions
 *
 * Default categories matching Way2B1 Catalog + estate-specific types.
 * Source: feature-context.md (section 8 — current Catalog state),
 *         domain-research.md (entity types section).
 */

export const catalogCategories: CatalogCategory[] = [
    {
        key: 'property',
        label: 'Properties',
        icon: 'IconHome',
        color: '#F87171',     // coral
        appearsInMap: true,
    },
    {
        key: 'trust',
        label: 'Trusts',
        icon: 'IconShield',
        color: '#14B8A6',     // teal
        appearsInMap: true,
    },
    {
        key: 'entity',
        label: 'Legal Entities',
        icon: 'IconBuilding',
        color: '#0891B2',     // cyan — entity nodes in map
        appearsInMap: true,
    },
    {
        key: 'investment',
        label: 'Investments',
        icon: 'IconTrendingUp',
        color: '#10B981',     // emerald
        appearsInMap: true,
    },
    {
        key: 'maritime',
        label: 'Maritime',
        icon: 'IconAnchor',
        color: '#22D3EE',     // sky cyan
        appearsInMap: true,
    },
    {
        key: 'vehicle',
        label: 'Vehicles',
        icon: 'IconCar',
        color: '#94A3B8',     // light slate
        appearsInMap: true,
    },
    {
        key: 'insurance',
        label: 'Insurance',
        icon: 'IconHeartHandshake',
        color: '#84CC16',     // lime
        appearsInMap: true,
    },
    {
        key: 'art',
        label: 'Art & Collectibles',
        icon: 'IconPalette',
        color: '#FB923C',     // peach
        appearsInMap: true,
    },
    {
        key: 'person',
        label: 'People',
        icon: 'IconUser',
        color: '#F97316',     // orange
        appearsInMap: true,
    },
    {
        key: 'organization',
        label: 'Organizations',
        icon: 'IconBriefcase',
        color: '#A1A1AA',     // zinc
        appearsInMap: false,
    },
]

export const getCategoryByKey = (key: string) =>
    catalogCategories.find((c) => c.key === key)

/** Non-catalog display-only categories (used in Fojo summary cards, not in catalog filters) */
const DISPLAY_CATEGORIES: Record<string, CatalogCategory> = {
    task: { key: 'task', label: 'Task', icon: 'IconCheckbox', color: '#6366F1', appearsInMap: false },
    document: { key: 'document', label: 'Document', icon: 'IconFileTypePdf', color: '#EF4444', appearsInMap: false },
}

/** Fallback for dynamic/unknown categories — returns a neutral default so UI never crashes */
export const getCategoryOrFallback = (key: string): CatalogCategory =>
    catalogCategories.find((c) => c.key === key) ?? DISPLAY_CATEGORIES[key] ?? {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/[-_]/g, ' '),
        icon: 'IconBox',
        color: '#A1A1AA',
        appearsInMap: true,
    }
