import type { Asset } from '@/data/types'
import { thorntonAssets } from './assets'

export type ChartTheme = 'blue' | 'pink'

export const CHART_THEMES: Record<ChartTheme, {
    pie: [string, string, string, string]
    bar: Record<string, string>
    swatch: string
}> = {
    blue: {
        swatch: '#4B7BE5',
        pie: ['#1B3C6E', '#2E5FA8', '#4B7BE5', '#8BB5F5'],
        bar: { property: '#4B7BE5', investment: '#2E5FA8', maritime: '#8BB5F5', vehicle: '#8BB5F5', art: '#8BB5F5', insurance: '#3B6ED4' },
    },
    pink: {
        swatch: '#DB2777',
        pie: ['#7B1244', '#AD1457', '#DB2777', '#F472B6'],
        bar: { property: '#DB2777', investment: '#AD1457', maritime: '#F472B6', vehicle: '#F472B6', art: '#F472B6', insurance: '#BE185D' },
    },
}

/** Consistent color for asset allocation bars */
export const CATEGORY_COLORS: Record<string, string> = CHART_THEMES.blue.bar

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

function computeAllocation(theme: ChartTheme = 'blue'): AssetAllocation[] {
    const colors = CHART_THEMES[theme].bar
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
            color: colors[key] || '#94A3B8',
            count,
        }))
}

export const ASSET_ALLOCATION = computeAllocation('blue')
export const GRAND_TOTAL = ASSET_ALLOCATION.reduce((s, a) => s + a.value, 0)

/** Sum of catalog asset values excluding insurance (portfolio / allocation view). */
export const INVESTABLE_CATALOG_TOTAL = thorntonAssets
    .filter(a => a.categoryKey !== 'insurance')
    .reduce((s, a) => s + (a.value ?? 0), 0)
export function getAssetAllocation(theme: ChartTheme): AssetAllocation[] {
    return computeAllocation(theme)
}

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

/** 12-month series with natural volatility, ending exactly at endTotal (consistent with YTD %). */
export function buildPortfolioPerformanceSeries(endTotal: number, ytdPercent: number): PerformancePoint[] {
    const start = Math.round(endTotal / (1 + ytdPercent / 100))
    const labels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const progress = [0, 0.068, 0.041, 0.118, 0.145, 0.175, 0.143, 0.298, 0.390, 0.361, 0.574, 1.000]
    return labels.map((month, i) => ({
        month,
        value: Math.round(start + (endTotal - start) * progress[i]!),
    }))
}

/** Smoother 12-month benchmark series anchored to the same portfolio start value. */
export function buildBenchmarkSeries(portfolioEndTotal: number, portfolioYtd: number, benchmarkYtd: number): PerformancePoint[] {
    const start = Math.round(portfolioEndTotal / (1 + portfolioYtd / 100))
    const end = Math.round(start * (1 + benchmarkYtd / 100))
    const labels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const progress = [0, 0.055, 0.105, 0.19, 0.27, 0.35, 0.41, 0.52, 0.63, 0.73, 0.86, 1.000]
    return labels.map((month, i) => ({
        month,
        value: Math.round(start + (end - start) * progress[i]!),
    }))
}

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

/** Estate KPIs — portfolio view aligns with non-insurance investable total */
export const ESTATE_KPIS = {
    totalValue: INVESTABLE_CATALOG_TOTAL,
    totalAssets: thorntonAssets.filter(a => a.categoryKey !== 'insurance').length,
    activeEntities: new Set(thorntonAssets.map(a => a.holderId).filter(Boolean)).size,
    ytdPerformance: 8.2,
}

export const PORTFOLIO_PERFORMANCE: PerformancePoint[] = buildPortfolioPerformanceSeries(
    INVESTABLE_CATALOG_TOTAL,
    ESTATE_KPIS.ytdPerformance,
)

export const BENCHMARK_PERFORMANCE: PerformancePoint[] = buildBenchmarkSeries(
    INVESTABLE_CATALOG_TOTAL,
    ESTATE_KPIS.ytdPerformance,
    6.1,
)

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

function computePortfolioAllocation(theme: ChartTheme = 'blue'): PortfolioAllocationSlice[] {
    const [c0, c1, c2, c3] = CHART_THEMES[theme].pie
    const barColors = CHART_THEMES[theme].bar
    const realEstateValue = sumByCategory('property')
    const maritimeValue   = sumByCategory('maritime')
    const vehicleValue    = sumByCategory('vehicle')
    const artValue        = sumByCategory('art')
    const lifestyleValue  = maritimeValue + vehicleValue + artValue
    const portfolioTotal  = realEstateValue / 0.20
    return [
        { key: 'private',     label: 'Private Investments',      value: portfolioTotal * 0.50, percentage: 50, color: c0, isClickable: true, categoryFilter: ['investment'] },
        { key: 'public',      label: 'Public Market',            value: portfolioTotal * 0.20, percentage: 20, color: c1, isClickable: true, categoryFilter: ['public-market'] },
        { key: 'real-estate', label: 'Real Estate (Investment)', value: realEstateValue,        percentage: 20, color: c2, isClickable: true,  categoryFilter: ['property'] },
        {
            key: 'lifestyle', label: 'Lifestyle Assets', value: lifestyleValue, percentage: 10,
            color: c3, isClickable: true, categoryFilter: ['maritime', 'vehicle', 'art'],
            breakdown: [
                { label: 'Maritime', value: maritimeValue, color: barColors.maritime },
                { label: 'Vehicles', value: vehicleValue,  color: barColors.vehicle },
                { label: 'Art',      value: artValue,      color: barColors.art },
            ].filter(b => b.value > 0),
        },
    ]
}

// ─────────────────────────────────────────────
// HOLDINGS / SECTORS / GEO HELPERS
// ─────────────────────────────────────────────

export interface HoldingItem {
    id: string
    name: string
    imageUrl?: string
    categoryKey: string
    assetType: string
    sector?: string
    value: number
    portfolioPercent: number
}

export interface SectorItem {
    sector: string
    value: number
    percentage: number
    count: number
}

/** Stable id for tooltips, filters, and map rows (US|State, CA|Province, …) */
export interface GeoItem {
    geoKey: string
    /** Legend / chip label, e.g. "New York" or "Ontario, Canada" */
    label: string
    country: string
    /** US state or Canadian province when applicable */
    region?: string
    value: number
    percentage: number
    count: number
    /** Tooltip helper: single item name (or top item name when count > 1). */
    itemName?: string
    /** Top holdings inside this geographic bucket (max 5) with local share %. */
    topItems?: { name: string; percentage: number }[]
}

/** Returns true when the asset belongs to the selected geographic bucket. */
export function assetMatchesGeoKey(asset: Asset, geoKey: string | null): boolean {
    if (!geoKey) return true

    const country = asset.country ?? 'Unknown'

    if (geoKey.startsWith('US|')) {
        const st = geoKey.slice(3)
        if (!st || st === '__')
            return country === 'United States'
        return country === 'United States' && asset.usState === st
    }

    if (geoKey.startsWith('CA|')) {
        const p = geoKey.slice(3)
        if (!p || p === '__')
            return country === 'Canada'
        return country === 'Canada' && asset.caProvince === p
    }

    if (geoKey.startsWith('ROW|'))
        return country === geoKey.slice(4)

    if (geoKey === 'UNKNOWN')
        return country === 'Unknown'

    return false
}

/** Assets sorted by value desc, with portfolio % computed against GRAND_TOTAL. */
export function getTopHoldings(categoryKeys: string[], limit = 10): HoldingItem[] {
    const filtered = categoryKeys.length === 0
        ? thorntonAssets.filter(a => a.categoryKey !== 'insurance')
        : thorntonAssets.filter(a => categoryKeys.includes(a.categoryKey))

    return filtered
        .filter(a => (a.value ?? 0) > 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
        .slice(0, limit)
        .map(a => ({
            id: a.id,
            name: a.name,
            imageUrl: a.imageUrl,
            categoryKey: a.categoryKey,
            assetType: a.assetType,
            sector: a.sector,
            value: a.value ?? 0,
            portfolioPercent: Math.round(((a.value ?? 0) / INVESTABLE_CATALOG_TOTAL) * 1000) / 10,
        }))
}

/** All holdings (no limit), for use in the full list below the top-N section. */
export function getAllHoldings(categoryKeys: string[]): HoldingItem[] {
    const filtered = categoryKeys.length === 0
        ? thorntonAssets.filter(a => a.categoryKey !== 'insurance')
        : thorntonAssets.filter(a => categoryKeys.includes(a.categoryKey))

    return filtered
        .filter(a => (a.value ?? 0) > 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
        .map(a => ({
            id: a.id,
            name: a.name,
            imageUrl: a.imageUrl,
            categoryKey: a.categoryKey,
            assetType: a.assetType,
            sector: a.sector,
            value: a.value ?? 0,
            portfolioPercent: Math.round(((a.value ?? 0) / INVESTABLE_CATALOG_TOTAL) * 1000) / 10,
        }))
}

/** Sector breakdown for a set of category keys (empty = all non-insurance). */
export function getTopSectors(categoryKeys: string[]): SectorItem[] {
    const filtered = categoryKeys.length === 0
        ? thorntonAssets.filter(a => a.categoryKey !== 'insurance')
        : thorntonAssets.filter(a => categoryKeys.includes(a.categoryKey))

    const totals: Record<string, { value: number; count: number }> = {}
    for (const a of filtered) {
        const s = a.sector ?? 'Other'
        if (!totals[s]) totals[s] = { value: 0, count: 0 }
        totals[s].value += a.value ?? 0
        totals[s].count += 1
    }
    const grand = Object.values(totals).reduce((s, t) => s + t.value, 0)
    return Object.entries(totals)
        .sort(([, a], [, b]) => b.value - a.value)
        .map(([sector, { value, count }]) => ({
            sector,
            value,
            percentage: grand > 0 ? Math.round((value / grand) * 100) : 0,
            count,
        }))
}

function geoBucket(asset: Asset): { geoKey: string; label: string; country: string; region?: string } {
    const country = asset.country ?? 'Unknown'

    if (country === 'United States') {
        if (asset.usState)
            return { geoKey: `US|${asset.usState}`, label: asset.usState, country, region: asset.usState }
        return {
            geoKey: 'US|__',
            label: 'United States (unspecified)',
            country,
        }
    }

    if (country === 'Canada') {
        if (asset.caProvince)
            return {
                geoKey: `CA|${asset.caProvince}`,
                label: `${asset.caProvince}, Canada`,
                country,
                region: asset.caProvince,
            }
        return { geoKey: 'CA|__', label: 'Canada (unspecified)', country }
    }

    if (country === 'Unknown')
        return { geoKey: 'UNKNOWN', label: 'Unknown', country: 'Unknown' }

    return { geoKey: `ROW|${country}`, label: country, country }
}

/** Geographic exposure for a set of category keys (empty = all non-insurance). Aggregates by US state or Canadian province. */
export function getGeoExposure(categoryKeys: string[]): GeoItem[] {
    const filtered = categoryKeys.length === 0
        ? thorntonAssets.filter(a => a.categoryKey !== 'insurance')
        : thorntonAssets.filter(a => categoryKeys.includes(a.categoryKey))

    const totals: Record<string, {
        label: string
        country: string
        region?: string
        value: number
        count: number
        topItemName?: string
        topItemValue: number
        assets: { name: string; value: number }[]
    }> = {}

    for (const a of filtered) {
        const { geoKey, label, country, region } = geoBucket(a)
        if (!totals[geoKey])
            totals[geoKey] = { label, country, region, value: 0, count: 0, topItemValue: -1, assets: [] }
        totals[geoKey].value += a.value ?? 0
        totals[geoKey].count += 1
        const assetValue = a.value ?? 0
        totals[geoKey].assets.push({ name: a.name, value: assetValue })
        if (assetValue >= totals[geoKey].topItemValue) {
            totals[geoKey].topItemValue = assetValue
            totals[geoKey].topItemName = a.name
        }
    }

    const grand = Object.values(totals).reduce((s, t) => s + t.value, 0)
    return Object.entries(totals)
        .sort(([, a], [, b]) => b.value - a.value)
        .map(([geoKey, meta]) => {
            const topItems = [...meta.assets]
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map(item => ({
                    name: item.name,
                    percentage: meta.value > 0 ? Math.round((item.value / meta.value) * 1000) / 10 : 0,
                }))
            return {
                geoKey,
                label: meta.label,
                country: meta.country,
                region: meta.region,
                value: meta.value,
                percentage: grand > 0 ? Math.round((meta.value / grand) * 100) : 0,
                count: meta.count,
                itemName: meta.topItemName,
                topItems,
            }
        })
}

/** Country-level geographic exposure — collapses US states → single entry, CA provinces → single entry. */
export function getCountryExposure(categoryKeys: string[]): GeoItem[] {
    const filtered = categoryKeys.length === 0
        ? thorntonAssets.filter(a => a.categoryKey !== 'insurance')
        : thorntonAssets.filter(a => categoryKeys.includes(a.categoryKey))

    const totals: Record<string, {
        label: string
        country: string
        value: number
        count: number
        topItemName?: string
        topItemValue: number
        assets: { name: string; value: number }[]
    }> = {}

    for (const a of filtered) {
        const country = a.country ?? 'Unknown'
        let geoKey: string
        let label: string
        if (country === 'Unknown') { geoKey = 'UNKNOWN'; label = 'Unknown' }
        else if (country === 'United States') { geoKey = 'ROW|United States'; label = 'United States' }
        else if (country === 'Canada') { geoKey = 'CA|__'; label = 'Canada' }
        else { geoKey = `ROW|${country}`; label = country }

        if (!totals[geoKey]) totals[geoKey] = { label, country, value: 0, count: 0, topItemValue: -1, assets: [] }
        totals[geoKey].value += a.value ?? 0
        totals[geoKey].count += 1
        const assetValue = a.value ?? 0
        totals[geoKey].assets.push({ name: a.name, value: assetValue })
        if (assetValue >= totals[geoKey].topItemValue) {
            totals[geoKey].topItemValue = assetValue
            totals[geoKey].topItemName = a.name
        }
    }

    const grand = Object.values(totals).reduce((s, t) => s + t.value, 0)
    return Object.entries(totals)
        .filter(([, t]) => t.value > 0)
        .sort(([, a], [, b]) => b.value - a.value)
        .map(([geoKey, meta]) => {
            const topItems = [...meta.assets]
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map(item => ({
                    name: item.name,
                    percentage: meta.value > 0 ? Math.round((item.value / meta.value) * 1000) / 10 : 0,
                }))
            return {
                geoKey,
                label: meta.label,
                country: meta.country,
                value: meta.value,
                percentage: grand > 0 ? Math.round((meta.value / grand) * 100) : 0,
                count: meta.count,
                itemName: meta.topItemName,
                topItems,
            }
        })
}

export interface USStateItem {
    state: string
    value: number
    percentage: number
    count: number
}

/** US state-level exposure for a set of category keys (empty = all non-insurance US assets). */
export function getUSStateExposure(categoryKeys: string[]): USStateItem[] {
    const filtered = categoryKeys.length === 0
        ? thorntonAssets.filter(a => a.categoryKey !== 'insurance' && a.usState)
        : thorntonAssets.filter(a => categoryKeys.includes(a.categoryKey) && a.usState)

    const totals: Record<string, { value: number; count: number }> = {}
    for (const a of filtered) {
        const s = a.usState!
        if (!totals[s]) totals[s] = { value: 0, count: 0 }
        totals[s].value += a.value ?? 0
        totals[s].count += 1
    }
    const grand = Object.values(totals).reduce((s, t) => s + t.value, 0)
    return Object.entries(totals)
        .sort(([, a], [, b]) => b.value - a.value)
        .map(([state, { value, count }]) => ({
            state,
            value,
            percentage: grand > 0 ? Math.round((value / grand) * 100) : 0,
            count,
        }))
}

export const PORTFOLIO_ALLOCATION = computePortfolioAllocation('blue')
export const PORTFOLIO_ALLOCATION_TOTAL = PORTFOLIO_ALLOCATION.reduce((s, a) => s + a.value, 0)
export function getPortfolioAllocation(theme: ChartTheme): PortfolioAllocationSlice[] {
    return computePortfolioAllocation(theme)
}
