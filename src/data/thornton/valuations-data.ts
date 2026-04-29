import { thorntonAssets } from './assets'

/** Consistent color for asset allocation bars */
export const CATEGORY_COLORS: Record<string, string> = {
    property:   '#4B7BE5',
    investment: '#2E5FA8',
    maritime:   '#6B9EF0',
    vehicle:    '#8BB5F5',
    art:        '#A8C8F8',
    insurance:  '#3B6ED4',
}

export const CATEGORY_LABELS: Record<string, string> = {
    property: 'Real Estate',
    investment: 'Investments',
    vehicle: 'Vehicles',
    maritime: 'Maritime',
    art: 'Art',
    insurance: 'Insurance',
}

export interface AssetAllocation {
    categoryKey: string
    label: string
    value: number
    percentage: number
    color: string
    count: number
}

function computeAllocation(): AssetAllocation[] {
    const totals: Record<string, { value: number; count: number }> = {}
    for (const asset of thorntonAssets) {
        const key = asset.categoryKey
        if (!totals[key]) totals[key] = { value: 0, count: 0 }
        totals[key].value += asset.value ?? 0
        totals[key].count += 1
    }
    const grandTotal = Object.values(totals).reduce((s, t) => s + t.value, 0)

    return Object.entries(totals)
        .sort(([, a], [, b]) => b.value - a.value)
        .map(([key, { value, count }]) => ({
            categoryKey: key,
            label: CATEGORY_LABELS[key] || key,
            value,
            percentage: Math.round((value / grandTotal) * 100),
            color: CATEGORY_COLORS[key] || '#94A3B8',
            count,
        }))
}

export const ASSET_ALLOCATION = computeAllocation()
export const GRAND_TOTAL = ASSET_ALLOCATION.reduce((s, a) => s + a.value, 0)

/**
 * Grouped allocation — merges maritime + vehicle + art into "Lifestyle Assets"
 * and aligns colors with the pie chart slices.
 */
const LIFESTYLE_KEYS = ['maritime', 'vehicle', 'art'] as const

const BAR_COLORS: Record<string, string> = {
    property:   '#4B7BE5',
    investment: '#2E5FA8',
    insurance:  '#6B9EF0',
    lifestyle:  '#8BB5F5',
}

function computeGroupedAllocation(): AssetAllocation[] {
    const raw = computeAllocation()
    const grandTotal = raw.reduce((s, a) => s + a.value, 0)

    const lifestyleItems = raw.filter(a => (LIFESTYLE_KEYS as readonly string[]).includes(a.categoryKey))
    const lifestyleValue = lifestyleItems.reduce((s, a) => s + a.value, 0)
    const lifestyleCount = lifestyleItems.reduce((s, a) => s + a.count, 0)

    const rest = raw.filter(a => !(LIFESTYLE_KEYS as readonly string[]).includes(a.categoryKey))

    const grouped: AssetAllocation[] = [
        ...rest.map(a => ({
            ...a,
            color: BAR_COLORS[a.categoryKey] ?? a.color,
            label: a.categoryKey === 'property' ? 'Real Estate' : a.label,
        })),
        ...(lifestyleValue > 0 ? [{
            categoryKey: 'lifestyle',
            label: 'Lifestyle Assets',
            value: lifestyleValue,
            percentage: Math.round((lifestyleValue / grandTotal) * 100),
            color: BAR_COLORS.lifestyle,
            count: lifestyleCount,
        }] : []),
    ]

    return grouped.sort((a, b) => b.value - a.value)
}

export const GROUPED_ASSET_ALLOCATION = computeGroupedAllocation()

/** Portfolio performance — 12-month mock time series (Jul 2025 – Jun 2026) */
export interface PerformancePoint {
    month: string
    value: number
}

export const PORTFOLIO_PERFORMANCE: PerformancePoint[] = [
    { month: 'Jul', value: 1_080_000_000 },
    { month: 'Aug', value: 1_095_000_000 },
    { month: 'Sep', value: 1_072_000_000 },
    { month: 'Oct', value: 1_110_000_000 },
    { month: 'Nov', value: 1_125_000_000 },
    { month: 'Dec', value: 1_138_000_000 },
    { month: 'Jan', value: 1_150_000_000 },
    { month: 'Feb', value: 1_165_000_000 },
    { month: 'Mar', value: 1_140_000_000 },
    { month: 'Apr', value: 1_195_000_000 },
    { month: 'May', value: 1_220_000_000 },
    { month: 'Jun', value: 1_248_000_000 },
]

/** Property locations — filtered from Thornton assets, sorted by value desc */
export interface PropertyLocation {
    id: string
    name: string
    address: string
    value: number
    holderId: string
}

export const PROPERTY_LOCATIONS: PropertyLocation[] = thorntonAssets
    .filter(a => a.categoryKey === 'property')
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .map(a => ({
        id: a.id,
        name: a.name,
        address: a.address || '',
        value: a.value ?? 0,
        holderId: a.holderId || '',
    }))

/** Document status — mock data based on trust/entity structure */
export interface DocumentEntity {
    entityName: string
    entityType: string
    documents: {
        name: string
        status: 'Complete' | 'Incomplete' | 'Pending Review'
    }[]
}

export const DOCUMENT_STATUS: DocumentEntity[] = [
    {
        entityName: 'Thornton Family Revocable Living Trust',
        entityType: 'Trust',
        documents: [
            { name: 'Trust Agreement', status: 'Complete' },
            { name: 'Amendment No. 1', status: 'Complete' },
            { name: 'Schedule of Assets', status: 'Complete' },
            { name: 'Certificate of Trust', status: 'Complete' },
        ],
    },
    {
        entityName: 'Dynasty Trust I',
        entityType: 'Trust',
        documents: [
            { name: 'Trust Agreement', status: 'Complete' },
            { name: 'Investment Policy Statement', status: 'Complete' },
            { name: 'Schedule of Beneficiaries', status: 'Incomplete' },
        ],
    },
    {
        entityName: 'Dynasty Trust II',
        entityType: 'Trust',
        documents: [
            { name: 'Trust Agreement', status: 'Complete' },
            { name: 'Digital Asset Custody Agreement', status: 'Pending Review' },
        ],
    },
    {
        entityName: 'Thornton Family Office LLC',
        entityType: 'Entity',
        documents: [
            { name: 'Operating Agreement', status: 'Complete' },
            { name: 'Formation Certificate', status: 'Complete' },
            { name: 'Annual Report 2024', status: 'Incomplete' },
        ],
    },
    {
        entityName: 'RE Holdings LLC',
        entityType: 'Entity',
        documents: [
            { name: 'Operating Agreement', status: 'Complete' },
            { name: 'Property Schedules', status: 'Complete' },
            { name: 'Insurance Certificates', status: 'Pending Review' },
        ],
    },
    {
        entityName: 'ILIT',
        entityType: 'Trust',
        documents: [
            { name: 'Trust Agreement', status: 'Complete' },
            { name: 'Insurance Policy', status: 'Complete' },
            { name: 'Crummey Notices 2024', status: 'Incomplete' },
        ],
    },
]

/** Estate KPIs — computed totals */
export const ESTATE_KPIS = {
    totalValue: GRAND_TOTAL,
    totalAssets: thorntonAssets.length,
    activeEntities: 9,
    ytdPerformance: 8.2,
}

/** Category sections for Portfolio page — all non-insurance asset categories */
export interface CategorySection {
    categoryKey: string
    label: string
    items: { id: string; name: string; subtitle: string; value: number }[]
}

const SECTION_KEYS = ['property', 'investment', 'maritime', 'art', 'vehicle'] as const

export const CATEGORY_SECTIONS: CategorySection[] = SECTION_KEYS.map(key => ({
    categoryKey: key,
    label: CATEGORY_LABELS[key] || key,
    items: thorntonAssets
        .filter(a => a.categoryKey === key)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
        .map(a => ({
            id: a.id,
            name: a.name,
            subtitle: a.address || (a.description?.slice(0, 60) + (a.description && a.description.length > 60 ? '…' : '')) || '',
            value: a.value ?? 0,
        })),
}))

/** Insurance coverage data */
export const INSURANCE_COVERAGE = thorntonAssets
    .filter(a => a.categoryKey === 'insurance')
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .map(a => ({ id: a.id, name: a.name, coverage: a.value ?? 0, description: a.description?.slice(0, 80) || '' }))

export const COVERAGE_TOTAL = INSURANCE_COVERAGE.reduce((s, i) => s + i.coverage, 0)

export interface CoverageGap {
    asset: string
    value: number
    gap: string
}

export const COVERAGE_GAPS: CoverageGap[] = [
    { asset: 'Art Collection', value: 100_000_000, gap: 'No dedicated fine art policy' },
    { asset: 'Ferrari Collection', value: 62_000_000, gap: 'No collector vehicle policy' },
    { asset: 'Yacht Fleet', value: 156_500_000, gap: 'No P&I / hull coverage found' },
]

/** High-level portfolio allocation — 4 slices for the Portfolio overview pie chart */
export interface PortfolioAllocationSlice {
    key: string
    label: string
    value: number
    percentage: number
    color: string
    isClickable: boolean
    categoryFilter: string[]
    breakdown?: { label: string; value: number; color: string }[]
}

function sumByCategory(key: string): number {
    return thorntonAssets
        .filter(a => a.categoryKey === key)
        .reduce((sum, a) => sum + (a.value ?? 0), 0)
}

function computePortfolioAllocation(): PortfolioAllocationSlice[] {
    const realEstateValue = sumByCategory('property')
    const maritimeValue   = sumByCategory('maritime')
    const vehicleValue    = sumByCategory('vehicle')
    const artValue        = sumByCategory('art')
    const lifestyleValue  = maritimeValue + vehicleValue + artValue

    // Real estate is anchored at 20% — derive the total portfolio size from it
    const portfolioTotal = realEstateValue / 0.20
    return [
        { key: 'private',     label: 'Private Investments',       value: portfolioTotal * 0.50, percentage: 50, color: '#1B3C6E', isClickable: false, categoryFilter: [] },
        { key: 'public',      label: 'Public Market',             value: portfolioTotal * 0.20, percentage: 20, color: '#2E5FA8', isClickable: false, categoryFilter: [] },
        { key: 'real-estate', label: 'Real Estate (Investment)',  value: realEstateValue,        percentage: 20, color: '#4B7BE5', isClickable: true,  categoryFilter: ['property'] },
        {
            key: 'lifestyle', label: 'Lifestyle Assets', value: lifestyleValue, percentage: 10,
            color: '#8BB5F5', isClickable: true, categoryFilter: ['maritime', 'vehicle', 'art'],
            breakdown: [
                { label: 'Maritime',  value: maritimeValue, color: CATEGORY_COLORS.maritime },
                { label: 'Vehicles',  value: vehicleValue,  color: CATEGORY_COLORS.vehicle },
                { label: 'Art',       value: artValue,      color: CATEGORY_COLORS.art },
            ].filter(b => b.value > 0),
        },
    ]
}

export const PORTFOLIO_ALLOCATION = computePortfolioAllocation()
export const PORTFOLIO_ALLOCATION_TOTAL = PORTFOLIO_ALLOCATION.reduce((s, a) => s + a.value, 0)
