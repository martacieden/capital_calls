import type { Asset } from '@/data/types'
import type { AssetAllocation } from '@/data/thornton/valuations-data'
import { thorntonAssets } from './assets'
import {
    getGeoExposure,
    getCountryExposure,
    getTopSectors,
    INVESTABLE_CATALOG_TOTAL,
    CATEGORY_LABELS,
} from './valuations-data'

export type PortfolioCategoryId =
    | 'lifestyle-assets'
    | 'private-investments'
    | 'real-estate'
    | 'cash-equivalents'

export interface PortfolioAllocationItem {
    id: PortfolioCategoryId
    label: string
    value: number
    percentage: number
    color: string
    subcategories: string[]
    hasDrillDown: boolean
}

export interface PortfolioHolding {
    id: string
    name: string
    type: string
    sector: string
    image: string
    value: number
    portfolioPercentage: number
    location?: string
    vintage?: string
    manager?: string
}

export interface PortfolioSector {
    label: string
    percentage: number
    value: number
    color: string
}

/** Same shape as valuations `GeoItem` for the drill-down choropleth legend. */
export type PortfolioGeoItem = ReturnType<typeof getGeoExposure>[number]

export interface PortfolioCategoryData {
    totalValue: number
    portfolioPercentage: number
    topHoldings: PortfolioHolding[]
    topSectors: PortfolioSector[]
    geographicExposure: PortfolioGeoItem[]
}

const LIFESTYLE_KEYS = ['maritime', 'vehicle', 'art'] as const
export const DRILLDOWN_SECTOR_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9', '#94A3B8']

/** Total portfolio value = sum of non-insurance catalog assets (single source of truth). */
export const PORTFOLIO_TOTAL = INVESTABLE_CATALOG_TOTAL

/** Ліквідність поза каталогом активів — окремий сегмент allocation (mock). */
const CASH_AND_EQUIVALENTS_SHARE = 0.075
export const CASH_AND_EQUIVALENTS_VALUE = Math.round(PORTFOLIO_TOTAL * CASH_AND_EQUIVALENTS_SHARE)

/** Знаменник для pie allocation та підписів «% of total portfolio» у drilldown (активи + cash). */
export const PORTFOLIO_ALLOCATION_DISPLAY_TOTAL = PORTFOLIO_TOTAL + CASH_AND_EQUIVALENTS_VALUE

const CATEGORY_META: Record<PortfolioCategoryId, { label: string; color: string; catalogKeys: string[] }> = {
    'lifestyle-assets': {
        label: 'Lifestyle Assets',
        color: '#8B5CF6',
        catalogKeys: [...LIFESTYLE_KEYS],
    },
    'private-investments': {
        label: 'Private Investments',
        color: '#059669',
        catalogKeys: ['investment'],
    },
    'real-estate': {
        label: 'Real Estate',
        color: '#005BE2',
        catalogKeys: ['property'],
    },
    'cash-equivalents': {
        label: 'Cash & Equivalents',
        color: '#64748B',
        catalogKeys: [],
    },
}

/** Maps catalog category keys to their portfolio allocation color. Single source of truth. */
export const CATALOG_KEY_PORTFOLIO_COLOR: Record<string, string> =
    (Object.keys(CATEGORY_META) as PortfolioCategoryId[]).reduce<Record<string, string>>((acc, id) => {
        const { color, catalogKeys } = CATEGORY_META[id]
        for (const key of catalogKeys) acc[key] = color
        return acc
    }, {})

function sumValueForKeys(keys: readonly string[]): number {
    return thorntonAssets
        .filter(a => keys.includes(a.categoryKey))
        .reduce((s, a) => s + (a.value ?? 0), 0)
}

/** Підрозділи cash для drilldown / тултипа (не окремі активи каталогу). */
const CASH_LIQUIDITY_BUCKETS = [
    { label: 'Operating accounts & demand deposits', detail: 'Same-day liquidity', weight: 42 },
    { label: 'Money market & ultra-short funds', detail: '< 90 days', weight: 33 },
    { label: 'U.S. Treasuries & government money funds', detail: 'Risk-free bucket', weight: 25 },
] as const

function allocateCashSubvalues(total: number): number[] {
    const wsum = CASH_LIQUIDITY_BUCKETS.reduce((s, b) => s + b.weight, 0)
    const parts = CASH_LIQUIDITY_BUCKETS.map(b => Math.round((total * b.weight) / wsum))
    const drift = total - parts.reduce((a, b) => a + b, 0)
    parts[parts.length - 1] += drift
    return parts
}

function sliceValueForCategory(id: PortfolioCategoryId): number {
    if (id === 'cash-equivalents') return CASH_AND_EQUIVALENTS_VALUE
    return sumValueForKeys(CATEGORY_META[id].catalogKeys)
}

/** Прикладові фонди для тултипа Private Investments; суми масштабуються до фактичного total категорії. */
const WHITMORE_FUNDS_TOOLTIP_TEMPLATE = [
    { name: 'Whitmore Capital Fund I', fundType: 'Private Equity', weight: 85 },
    { name: 'Whitmore Ventures Fund II', fundType: 'Venture Capital', weight: 62 },
    { name: 'Whitmore Real Assets Fund III', fundType: 'Real Assets', weight: 45 },
] as const

export interface AllocationTooltipRow {
    label: string
    value: number
    /** Другий рядок у тултипі (наприклад, тип фонду) */
    detail?: string
}

/** Рядки для тултипа allocation: підкатегорії каталогу або (для private-investments) фонди Whitmore. */
export function getPortfolioAllocationTooltipBreakdown(
    portfolioCategoryId: PortfolioCategoryId,
): AllocationTooltipRow[] {
    if (portfolioCategoryId === 'private-investments') {
        const total = sumValueForKeys(['investment'])
        const wsum = WHITMORE_FUNDS_TOOLTIP_TEMPLATE.reduce((s, f) => s + f.weight, 0)
        if (total <= 0 || wsum <= 0) return []
        return WHITMORE_FUNDS_TOOLTIP_TEMPLATE.map(f => ({
            label: f.name,
            value: Math.round((total * f.weight) / wsum),
            detail: f.fundType,
        }))
    }

    if (portfolioCategoryId === 'cash-equivalents') {
        const total = CASH_AND_EQUIVALENTS_VALUE
        if (total <= 0) return []
        const amounts = allocateCashSubvalues(total)
        return CASH_LIQUIDITY_BUCKETS.map((b, i) => ({
            label: b.label,
            value: amounts[i]!,
            detail: b.detail,
        }))
    }

    const sub = getCatalogSubcategoryBreakdownForPortfolioSlice(portfolioCategoryId)
    if (sub.length < 1) return []
    return sub.map(s => ({
        label: s.label,
        value: s.value,
        detail:
            s.holdingCount === 1
                ? '1 holding in catalog'
                : `${s.holdingCount} holdings in catalog`,
    }))
}

/** Короткий контекст над таблицею рядків у тултипі allocation. */
export function getPortfolioAllocationTooltipIntro(
    portfolioCategoryId: PortfolioCategoryId,
): string | undefined {
    if (portfolioCategoryId === 'cash-equivalents') {
        return 'Modeled as liquidity buckets (not tied to individual catalog assets).'
    }
    if (portfolioCategoryId === 'private-investments') {
        const n = countForKeys(['investment'])
        return `${n} underlying holdings in catalog, summarized below as three representative funds.`
    }
    if (portfolioCategoryId === 'lifestyle-assets') {
        const keys = CATEGORY_META['lifestyle-assets'].catalogKeys
        const n = countForKeys(keys)
        const k = keys.length
        return `${k} catalog categories · ${n} total holdings · values by category below.`
    }
    if (portfolioCategoryId === 'real-estate') {
        const n = countForKeys(['property'])
        return `Single catalog category (real property) · ${n} holdings · value below.`
    }
    return undefined
}

/** Підкатегорії каталогу (vehicle, maritime, …), що входять у слайс портфельної групи, з сумами. */
export function getCatalogSubcategoryBreakdownForPortfolioSlice(
    portfolioCategoryId: PortfolioCategoryId,
): { label: string; value: number; holdingCount: number }[] {
    const meta = CATEGORY_META[portfolioCategoryId]
    return meta.catalogKeys
        .map((key: string) => ({
            label: CATEGORY_LABELS[key] ?? key,
            value: sumValueForKeys([key]),
            holdingCount: countForKeys([key]),
        }))
        .filter(row => row.value > 0)
        .sort((a, b) => b.value - a.value)
}

function countForKeys(keys: readonly string[]): number {
    return thorntonAssets.filter(a => keys.includes(a.categoryKey)).length
}

function uniqueSortedSectors(keys: readonly string[]): string[] {
    const set = new Set<string>()
    for (const a of thorntonAssets) {
        if (keys.includes(a.categoryKey) && a.sector) set.add(a.sector)
    }
    return [...set].sort((x, y) => x.localeCompare(y))
}

function pctOfAllocationTotal(value: number): number {
    return PORTFOLIO_ALLOCATION_DISPLAY_TOTAL > 0
        ? Math.round((value / PORTFOLIO_ALLOCATION_DISPLAY_TOTAL) * 1000) / 10
        : 0
}

function assetToPortfolioHolding(a: Asset): PortfolioHolding {
    return {
        id: a.id,
        name: a.name,
        type: a.assetType,
        sector: a.sector ?? 'Other',
        image: a.imageUrl ?? '',
        value: a.value ?? 0,
        portfolioPercentage:
            PORTFOLIO_ALLOCATION_DISPLAY_TOTAL > 0
                ? Math.round(((a.value ?? 0) / PORTFOLIO_ALLOCATION_DISPLAY_TOTAL) * 1000) / 10
                : 0,
        location: a.address,
    }
}

function buildTopSectorsForKeys(keys: readonly string[]): PortfolioSector[] {
    const rows = getTopSectors([...keys])
    return rows.map((row, i) => ({
        label: row.sector,
        value: row.value,
        percentage: row.percentage,
        color: DRILLDOWN_SECTOR_COLORS[i % DRILLDOWN_SECTOR_COLORS.length],
    }))
}

export function buildSectorsFromHoldings(holdings: PortfolioHolding[]): PortfolioSector[] {
    const totals = new Map<string, number>()
    for (const h of holdings) {
        totals.set(h.sector, (totals.get(h.sector) ?? 0) + h.value)
    }
    const grand = holdings.reduce((s, h) => s + h.value, 0)
    return [...totals.entries()]
        .sort(([, a], [, b]) => b - a)
        .map(([label, value], i) => ({
            label,
            value,
            percentage: grand > 0 ? Math.round((value / grand) * 1000) / 10 : 0,
            color: DRILLDOWN_SECTOR_COLORS[i % DRILLDOWN_SECTOR_COLORS.length],
        }))
}

function syntheticCashHolding(
    id: string,
    name: string,
    type: string,
    sector: string,
    value: number,
): PortfolioHolding {
    return {
        id,
        name,
        type,
        sector,
        image: '',
        value,
        portfolioPercentage:
            PORTFOLIO_ALLOCATION_DISPLAY_TOTAL > 0
                ? Math.round((value / PORTFOLIO_ALLOCATION_DISPLAY_TOTAL) * 1000) / 10
                : 0,
    }
}

function buildCashEquivalentsCategoryData(): PortfolioCategoryData {
    const totalValue = CASH_AND_EQUIVALENTS_VALUE
    const amounts = allocateCashSubvalues(totalValue)
    const topHoldings = CASH_LIQUIDITY_BUCKETS.map((b, i) =>
        syntheticCashHolding(
            `cash-synth-${i}`,
            b.label,
            'Cash & Equivalents',
            'Liquidity',
            amounts[i]!,
        ),
    )
    return {
        totalValue,
        portfolioPercentage: pctOfAllocationTotal(totalValue),
        topHoldings,
        topSectors: [],
        geographicExposure: [],
    }
}

function buildCategoryData(categoryId: PortfolioCategoryId): PortfolioCategoryData {
    if (categoryId === 'cash-equivalents') return buildCashEquivalentsCategoryData()

    const { catalogKeys } = CATEGORY_META[categoryId]
    const assets = thorntonAssets.filter(a => catalogKeys.includes(a.categoryKey))
    const totalValue = assets.reduce((s, a) => s + (a.value ?? 0), 0)

    const topHoldings = [...assets]
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
        .map(assetToPortfolioHolding)

    return {
        totalValue,
        portfolioPercentage: pctOfAllocationTotal(totalValue),
        topHoldings,
        topSectors: buildTopSectorsForKeys(catalogKeys),
        geographicExposure: getGeoExposure([...catalogKeys]),
    }
}

function buildPortfolioAllocationItems(): PortfolioAllocationItem[] {
    return (Object.keys(CATEGORY_META) as PortfolioCategoryId[]).map(id => {
        const meta = CATEGORY_META[id]
        const value = sliceValueForCategory(id)
        return {
            id,
            label: meta.label,
            value,
            percentage: pctOfAllocationTotal(value),
            color: meta.color,
            subcategories: uniqueSortedSectors(meta.catalogKeys),
            hasDrillDown: true,
        }
    })
}

function buildPortfolioAssetAllocation(): AssetAllocation[] {
    return (Object.keys(CATEGORY_META) as PortfolioCategoryId[]).map(id => {
        const meta = CATEGORY_META[id]
        const value = sliceValueForCategory(id)
        return {
            categoryKey: id,
            label: meta.label,
            value,
            percentage: PORTFOLIO_ALLOCATION_DISPLAY_TOTAL > 0
                ? Math.round((value / PORTFOLIO_ALLOCATION_DISPLAY_TOTAL) * 100)
                : 0,
            color: meta.color,
            count: id === 'cash-equivalents'
                ? CASH_LIQUIDITY_BUCKETS.length
                : countForKeys(meta.catalogKeys),
        }
    })
}

export const portfolioAllocationItems: PortfolioAllocationItem[] = buildPortfolioAllocationItems()

export const PORTFOLIO_ASSET_ALLOCATION: AssetAllocation[] = buildPortfolioAssetAllocation()

/** Country-level geographic exposure for the main portfolio page. */
export const PORTFOLIO_OVERVIEW_GEO: PortfolioGeoItem[] = getCountryExposure([])

const CATEGORY_DATA: Record<PortfolioCategoryId, PortfolioCategoryData> = {
    'lifestyle-assets': buildCategoryData('lifestyle-assets'),
    'private-investments': buildCategoryData('private-investments'),
    'real-estate': buildCategoryData('real-estate'),
    'cash-equivalents': buildCategoryData('cash-equivalents'),
}

export function getDrilldownData(categoryId: string): PortfolioCategoryData | null {
    if (!isPortfolioCategoryId(categoryId)) return null
    return CATEGORY_DATA[categoryId]
}

function isPortfolioCategoryId(id: string): id is PortfolioCategoryId {
    return id in CATEGORY_DATA
}

export function getCategoryLabel(categoryId: string): string {
    return (CATEGORY_META as Record<string, { label: string }>)[categoryId]?.label ?? categoryId
}

export function getCategoryColor(categoryId: string): string {
    return (CATEGORY_META as Record<string, { color: string }>)[categoryId]?.color ?? '#94A3B8'
}

/**
 * Maps high-level portfolio allocation buckets to `Asset.categoryKey` values for the Assets catalog filter.
 */
export function getCatalogCategoryKeysForPortfolioCategory(
    portfolioCategoryId: string,
): string[] | null {
    const meta = CATEGORY_META[portfolioCategoryId as PortfolioCategoryId]
    if (!meta || meta.catalogKeys.length === 0) return null
    return [...meta.catalogKeys]
}

/** Підкатегорії (фактичні сектори з каталогу). */
export function getPortfolioSubcategories(portfolioCategoryId: string): string[] {
    const item = portfolioAllocationItems.find(i => i.id === portfolioCategoryId)
    return item?.subcategories ?? []
}

export function holdingMatchesPortfolioSubcategory(
    holding: PortfolioHolding,
    portfolioCategoryId: string,
    subLabel: string,
): boolean {
    if (portfolioCategoryId === 'real-estate' && subLabel === 'US & Canada') {
        const loc = (holding.location ?? '').toLowerCase()
        return (
            loc.includes('usa')
            || loc.includes('u.s.')
            || loc.includes('canada')
            || loc.includes(', bc')
            || loc.includes(', on')
        )
    }
    return holding.sector === subLabel || holding.type === subLabel
}
