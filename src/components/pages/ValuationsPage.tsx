import { useEffect, useMemo, useState } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import {
    IconCurrencyDollar,
    IconListDetails,
    IconTrendingUp,
    IconBuildingBank,
    IconChevronRight,
    IconArrowUp,
    IconArrowDown,
    IconX,
    IconArrowUpRight,
} from '@tabler/icons-react'
import { showToast } from '@/components/atoms/Toast'
import type { AnyCatalogItem } from '@/data/types'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { KpiStatCard } from '@/components/atoms/KpiStatCard'
import { TopHoldingsChart } from '@/components/atoms/TopHoldingsChart'
import { TopSectorsChart } from '@/components/atoms/TopSectorsChart'
import { GeoExposureChart } from '@/components/atoms/GeoExposureChart'
import {
    ESTATE_KPIS,
    CATEGORY_LABELS,
    getTopHoldings,
    getTopSectors,
    getCountryExposure,
    getGeoExposure,
    INVESTABLE_CATALOG_TOTAL,
    assetMatchesGeoKey,
} from '@/data/thornton/valuations-data'
import { PortfolioAllocationChart, type PortfolioAllocationSlice } from '@/components/atoms/PortfolioAllocationChart'
import {
    portfolioAllocationItems,
    PORTFOLIO_ALLOCATION_DISPLAY_TOTAL,
    PORTFOLIO_OVERVIEW_GEO,
    getPortfolioAllocationTooltipBreakdown,
    getPortfolioAllocationTooltipIntro,
} from '@/data/thornton/portfolio-data'
import { CAPITAL_CALL_COMMITMENTS, getTotalCalled } from '@/data/thornton/capital-calls-data'
import { INVESTMENT_RECORDS } from '@/data/thornton/investments-data'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'
import { thorntonAssets } from '@/data/thornton/assets'

interface ValuationsPageProps {
    items: AnyCatalogItem[]
    isV3Processing?: boolean
    isChatOpen?: boolean
    lockedMode?: 'all' | 'private'
    onNavigateToCatalogCategory: (categories: string[]) => void
    onOpenPortfolioCategory: (portfolioCategoryId: string) => void
    onNavigateToAsset?: (id: string) => void
    onNavigateToTasks?: () => void
    onNavigateToTimeline?: () => void
    onNavigateToInvestment?: (investmentId: string) => void
}

function formatValue(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
    if (value >= 1_000_000) return `$${Math.round(value / 1_000_000)}M`
    return `$${value.toLocaleString()}`
}

const BREAKDOWN_ROW_SWATCHES = ['#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#475569']
const PORTFOLIO_PIE_COLORS: Record<string, string> = {
    'lifestyle-assets': 'var(--color-card-blue)',
    'private-investments': '#8B5CF6',
    'real-estate': '#005BE2',
    'cash-equivalents': '#93C5FD',
}
const HOLDINGS_COLOR_OVERRIDE: Record<string, string> = {
    maritime: PORTFOLIO_PIE_COLORS['lifestyle-assets'],
    vehicle: PORTFOLIO_PIE_COLORS['lifestyle-assets'],
    art: PORTFOLIO_PIE_COLORS['lifestyle-assets'],
    investment: PORTFOLIO_PIE_COLORS['private-investments'],
    property: PORTFOLIO_PIE_COLORS['real-estate'],
}
const SECTOR_COLOR_OVERRIDE: Record<string, string> = {
    'Art & Collectibles': PORTFOLIO_PIE_COLORS['lifestyle-assets'],
    Maritime: PORTFOLIO_PIE_COLORS['lifestyle-assets'],
    Aviation: PORTFOLIO_PIE_COLORS['lifestyle-assets'],
    Vehicles: PORTFOLIO_PIE_COLORS['lifestyle-assets'],
    'Real Estate': PORTFOLIO_PIE_COLORS['real-estate'],
    'Private Equity': PORTFOLIO_PIE_COLORS['private-investments'],
    'Financial Services': PORTFOLIO_PIE_COLORS['private-investments'],
    Technology: PORTFOLIO_PIE_COLORS['private-investments'],
    Healthcare: PORTFOLIO_PIE_COLORS['private-investments'],
}

const MOCK_LIABILITIES_RATIO = 0.15
const CASHFLOW_EVENTS = [
    { date: 'May 15', type: 'Insurance', asset: 'Estate Policy Renewal', amount: 18_400, outflow: true },
    { date: 'Jun 1',  type: 'Investment', asset: 'Whitmore Real Assets III Capital Call', amount: 2_500_000, outflow: true },
    { date: 'Jun 15', type: 'Investment', asset: 'Whitmore Ventures II Distribution', amount: 500_000, outflow: false },
]

const MONTH_INDEX: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

function daysUntilDateLabel(dateLabel: string): number | null {
    const [mon, dayRaw] = dateLabel.split(' ')
    const day = Number(dayRaw)
    if (!mon || Number.isNaN(day) || MONTH_INDEX[mon] == null) return null

    const now = new Date()
    const y = now.getFullYear()
    const target = new Date(y, MONTH_INDEX[mon], day)
    if (target.getTime() < now.getTime()) {
        target.setFullYear(y + 1)
    }
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.ceil((target.getTime() - now.getTime()) / msPerDay)
}

const PRIVATE_ONLY_KEYS = ['investment'] as const

export function ValuationsPage({
    isV3Processing,
    lockedMode,
    onNavigateToCatalogCategory,
    onOpenPortfolioCategory,
    onNavigateToAsset,
    onNavigateToTimeline,
    onNavigateToInvestment,
}: ValuationsPageProps) {
    const [activeSector, setActiveSector] = useState<string | null>(null)
    const [activeGeoKey, setActiveGeoKey] = useState<string | null>(null)
    const [geoDrillRoot, setGeoDrillRoot] = useState<string | null>(null)
    const [activeGeoCategory, setActiveGeoCategory] = useState<string | null>(null)
    const isPrivate = lockedMode === 'private'

    const visibleAllocationItems = useMemo(
        () => isPrivate
            ? portfolioAllocationItems.filter(i => i.id !== 'lifestyle-assets' && i.id !== 'real-estate')
            : portfolioAllocationItems,
        [isPrivate],
    )

    const lifestyleValue = portfolioAllocationItems.find(i => i.id === 'lifestyle-assets')?.value ?? 0
    const realEstateValue = portfolioAllocationItems.find(i => i.id === 'real-estate')?.value ?? 0
    const currentDisplayTotal = isPrivate
        ? PORTFOLIO_ALLOCATION_DISPLAY_TOTAL - lifestyleValue - realEstateValue
        : PORTFOLIO_ALLOCATION_DISPLAY_TOTAL

    const drilldownSlices: PortfolioAllocationSlice[] = visibleAllocationItems.map(item => {
        const tooltipRows = getPortfolioAllocationTooltipBreakdown(item.id)
        const breakdownIntro = getPortfolioAllocationTooltipIntro(item.id)
        const breakdown = tooltipRows.map((row, i) => ({
            label: row.label,
            value: row.value,
            color: BREAKDOWN_ROW_SWATCHES[i % BREAKDOWN_ROW_SWATCHES.length],
            ...(row.detail ? { detail: row.detail } : {}),
        }))
        const breakdownHeading =
            item.id === 'private-investments'
                ? 'Funds'
                : item.id === 'lifestyle-assets'
                    ? 'Included categories'
                    : item.id === 'real-estate'
                        ? 'Included categories'
                        : item.id === 'cash-equivalents'
                            ? 'Liquidity buckets'
                            : undefined

        const percentage = isPrivate && currentDisplayTotal > 0
            ? Math.round((item.value / currentDisplayTotal) * 1000) / 10
            : item.percentage

        return {
            key: item.id,
            label: item.label,
            value: item.value,
            percentage,
            color: PORTFOLIO_PIE_COLORS[item.id] ?? item.color,
            isClickable: item.id !== 'cash-equivalents',
            categoryFilter: [item.id],
            ...(breakdownIntro ? { breakdownIntro } : {}),
            ...(breakdown.length > 0
                ? {
                    breakdown,
                    ...(breakdownHeading ? { breakdownHeading } : {}),
                }
                : {}),
        }
    })

    const allTopHoldings = useMemo(
        () => getTopHoldings(isPrivate ? [...PRIVATE_ONLY_KEYS] : [], 10),
        [isPrivate],
    )
    const topHoldings = useMemo(() => {
        if (!activeSector) return allTopHoldings
        return allTopHoldings.filter(h => h.sector === activeSector)
    }, [allTopHoldings, activeSector])

    const topSectors = useMemo(
        () => getTopSectors(isPrivate ? [...PRIVATE_ONLY_KEYS] : []),
        [isPrivate],
    )

    const baseGeoData = useMemo(
        () => isPrivate ? getCountryExposure([...PRIVATE_ONLY_KEYS]) : PORTFOLIO_OVERVIEW_GEO,
        [isPrivate],
    )
    const subGeoData = useMemo(() => {
        if (!geoDrillRoot) return []
        const full = isPrivate ? getGeoExposure([...PRIVATE_ONLY_KEYS]) : getGeoExposure([])
        if (geoDrillRoot === 'ROW|United States') {
            return full
                .filter(row => row.geoKey.startsWith('US|') && row.geoKey !== 'US|__')
                .sort((a, b) => b.value - a.value)
        }
        if (geoDrillRoot === 'CA|__') {
            return full
                .filter(row => row.geoKey.startsWith('CA|') && row.geoKey !== 'CA|__')
                .sort((a, b) => b.value - a.value)
        }
        return []
    }, [geoDrillRoot, isPrivate])
    const geoData = geoDrillRoot && subGeoData.length > 0 ? subGeoData : baseGeoData
    const effectiveGeoKey = activeGeoKey ?? geoDrillRoot
    const activeGeoLabel = useMemo(
        () =>
            geoData.find(g => g.geoKey === effectiveGeoKey)?.label
            ?? baseGeoData.find(g => g.geoKey === effectiveGeoKey)?.label
            ?? null,
        [baseGeoData, effectiveGeoKey, geoData],
    )
    const activeGeoItemCount = useMemo(
        () =>
            geoData.find(g => g.geoKey === effectiveGeoKey)?.count
            ?? baseGeoData.find(g => g.geoKey === effectiveGeoKey)?.count
            ?? 0,
        [baseGeoData, effectiveGeoKey, geoData],
    )

    const geoFilteredAssets = useMemo(() => {
        return thorntonAssets
            .filter(asset => asset.categoryKey !== 'insurance')
            .filter(asset => !isPrivate || asset.categoryKey === 'investment')
            .filter(asset => assetMatchesGeoKey(asset, effectiveGeoKey))
    }, [effectiveGeoKey, isPrivate])


    const geoAssetRows = useMemo(() => {
        return geoFilteredAssets
            .filter(asset => !activeGeoCategory || asset.categoryKey === activeGeoCategory)
            .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    }, [activeGeoCategory, geoFilteredAssets])

    useEffect(() => {
        if (!effectiveGeoKey) {
            if (activeGeoCategory) setActiveGeoCategory(null)
            return
        }
        const isActiveGeoVisible =
            geoData.some(row => row.geoKey === effectiveGeoKey)
            || baseGeoData.some(row => row.geoKey === effectiveGeoKey)
        if (!isActiveGeoVisible) {
            setActiveGeoKey(null)
            setGeoDrillRoot(null)
            setActiveGeoCategory(null)
        }
    }, [activeGeoCategory, baseGeoData, effectiveGeoKey, geoData])

    useEffect(() => {
        setActiveGeoCategory(null)
    }, [effectiveGeoKey])

    useEffect(() => {
        if (!geoDrillRoot) return
        if (activeGeoKey) return
        if (subGeoData.length === 0) return
        // Auto-focus the largest split area to continue drilldown without extra click.
        setActiveGeoKey(subGeoData[0]!.geoKey)
    }, [activeGeoKey, geoDrillRoot, subGeoData])

    const holdingsSubtitle = activeSector
        ? `Largest positions in ${activeSector}`
        : isPrivate
            ? 'Largest private investment positions by value'
            : 'Largest positions by value across all categories'

    const handleSectorClick = (sector: string) => {
        setActiveSector(prev => prev === sector ? null : sector)
    }

    const handlePieSliceClick = (categoryFilter: string[]) => {
        const categoryId = categoryFilter[0]
        if (!categoryId) return
        onOpenPortfolioCategory(categoryId)
    }
    const handleGeoClick = (geoKey: string) => {
        const canDrillToSubregions = geoKey === 'ROW|United States' || geoKey === 'CA|__'
        if (!geoDrillRoot && canDrillToSubregions) {
            setGeoDrillRoot(geoKey)
            setActiveGeoKey(null)
            return
        }
        if (activeGeoKey === geoKey) {
            setActiveGeoKey(null)
            return
        }
        setActiveGeoKey(geoKey)
    }

    const privateInvestmentAssets = useMemo(
        () => thorntonAssets.filter(a => a.categoryKey === 'investment'),
        [],
    )

    const portfolioNetWorth = useMemo(() => {
        const totalAssets = isPrivate
            ? privateInvestmentAssets.reduce((s, a) => s + (a.value ?? 0), 0)
            : INVESTABLE_CATALOG_TOTAL
        const totalLiabilities = Math.round(totalAssets * MOCK_LIABILITIES_RATIO)
        const netWorth = totalAssets - totalLiabilities
        const netWorthPct = totalAssets > 0 ? Math.round((netWorth / totalAssets) * 100) : 0
        return { totalAssets, totalLiabilities, netWorth, netWorthPct }
    }, [isPrivate, privateInvestmentAssets])

    const { totalAssets, totalLiabilities, netWorth, netWorthPct } = portfolioNetWorth

    const kpiPrivateHoldingsCount = privateInvestmentAssets.length
    const kpiPrivateActiveEntities = useMemo(() => {
        return new Set(privateInvestmentAssets.map(a => a.holderId).filter(Boolean)).size
    }, [privateInvestmentAssets])

    // Concentration: top 5 holdings as % of portfolio
    const visibleCashflowEvents = useMemo(
        () => isPrivate ? CASHFLOW_EVENTS.filter(ev => ev.type === 'Investment') : CASHFLOW_EVENTS,
        [isPrivate],
    )
    const cashflowSummary = useMemo(() => {
        const outflow = visibleCashflowEvents
            .filter(ev => ev.outflow)
            .reduce((sum, ev) => sum + ev.amount, 0)
        const inflow = visibleCashflowEvents
            .filter(ev => !ev.outflow)
            .reduce((sum, ev) => sum + ev.amount, 0)
        return {
            count: visibleCashflowEvents.length,
            inflow,
            outflow,
            net: inflow - outflow,
        }
    }, [visibleCashflowEvents])
    const sortedCashflowEvents = useMemo(() => {
        return [...visibleCashflowEvents].sort((a, b) => {
            const da = daysUntilDateLabel(a.date) ?? 10_000
            const db = daysUntilDateLabel(b.date) ?? 10_000
            return da - db
        })
    }, [visibleCashflowEvents])
    if (isV3Processing) {
        return (
            <div className="flex flex-col gap-[var(--spacing-5)] px-[var(--spacing-6)] pt-9 pb-[var(--spacing-5)] max-w-[1120px] w-full mx-auto flex-1">
                <div className="flex w-full flex-col p-0">
                    <ContentHeader title={lockedMode === 'private' ? 'Private Investments' : 'Portfolio'} />
                </div>
                <div className="v3-empty-state">
                    <img className="v3-empty-state__icon" src={fojoMascotSmall} alt="Fojo" />
                    <div className="v3-empty-state__title">Fojo is building your profile…</div>
                    <div className="v3-empty-state__sub">This page will appear in a moment</div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-[var(--spacing-5)] px-[var(--spacing-6)] pt-9 pb-[var(--spacing-5)] max-w-[1120px] w-full mx-auto flex-1">
            <div className="flex w-full flex-col p-0 min-w-0">
                <ContentHeader title={lockedMode === 'private' ? 'Private Investments' : 'Portfolio'} />
            </div>

            {/* Net Worth summary bar */}
            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <span className="text-sm font-semibold text-[var(--color-black)]">Net Worth</span>
                        <span className="ml-2 text-xs text-[var(--color-neutral-10)]">
                            {isPrivate
                                ? 'Private investments − estimated liabilities (proportional)'
                                : 'Assets − estimated liabilities'}
                        </span>
                    </div>
                    <span className="text-base font-bold text-[var(--color-black)] tabular-nums">{formatValue(netWorth)}</span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-[var(--color-neutral-3)] overflow-hidden">
                    <div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{ width: `${netWorthPct}%`, background: '#005BE2' }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-[11px] text-[var(--color-neutral-10)] tabular-nums">
                    <span>
                        {isPrivate ? 'Private investments (NAV):' : 'Total assets:'}
                        {' '}
                        {formatValue(totalAssets)}
                    </span>
                    <span>Liabilities (est.): {formatValue(totalLiabilities)}</span>
                </div>
            </div>

            {/* Portfolio Allocation + KPIs — side by side */}
            <div className="flex gap-3 items-stretch">
                {/* Portfolio Allocation pie chart */}
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Portfolio Allocation</h2>
                        <span className="text-sm text-[var(--color-neutral-11)]">{formatValue(currentDisplayTotal)}</span>
                    </div>
                    <PortfolioAllocationChart
                        data={drilldownSlices}
                        totalValue={currentDisplayTotal}
                        onSliceClick={handlePieSliceClick}
                    />
                </div>

                {/* KPI 2x2 grid */}
                <div className="grid grid-cols-2 grid-rows-2 gap-3 w-[340px] shrink-0">
                    <KpiStatCard
                        label={isPrivate ? 'Private investments (NAV)' : 'Total Estate Value'}
                        value={formatValue(isPrivate ? totalAssets : ESTATE_KPIS.totalValue)}
                        icon={IconCurrencyDollar}
                    />
                    <KpiStatCard
                        label={isPrivate ? 'Holdings' : 'Total Assets'}
                        value={String(isPrivate ? kpiPrivateHoldingsCount : ESTATE_KPIS.totalAssets)}
                        icon={IconListDetails}
                        onClick={() => onNavigateToCatalogCategory(isPrivate ? ['investment'] : [])}
                    />
                    <KpiStatCard
                        label={isPrivate ? 'Related entities' : 'Active Entities'}
                        value={String(isPrivate ? kpiPrivateActiveEntities : ESTATE_KPIS.activeEntities)}
                        icon={IconBuildingBank}
                    />
                    <KpiStatCard
                        label={isPrivate ? 'Net IRR (est.)' : 'YTD Performance'}
                        value={isPrivate ? '+14.3%' : `+${ESTATE_KPIS.ytdPerformance}%`}
                        icon={IconTrendingUp}
                        badge={{ text: isPrivate ? 'Net of fees' : 'On track', positive: true }}
                    />
                </div>
            </div>

            {/* Top Holdings + Top Sectors — side by side on wide screens */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 min-w-0">
                    <div className="mb-4">
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Top Holdings</h2>
                        </div>
                        <p className="text-sm text-[var(--color-neutral-10)] mt-0.5">{holdingsSubtitle}</p>
                    </div>
                    <TopHoldingsChart items={topHoldings} onItemClick={onNavigateToAsset} colorOverride={HOLDINGS_COLOR_OVERRIDE} />
                </div>

                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 min-w-0">
                    <div className="mb-4">
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Top Sectors</h2>
                        </div>
                        <p className="text-sm text-[var(--color-neutral-10)] mt-0.5">Portfolio exposure by sector</p>
                    </div>
                    <TopSectorsChart data={topSectors} activeSector={activeSector} onSectorClick={handleSectorClick} colorOverride={SECTOR_COLOR_OVERRIDE} />
                </div>
            </div>

            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 w-full overflow-visible">
                <div className="mb-4">
                    <h2 className="text-[16px] font-[var(--font-weight-semibold)] text-[var(--color-black)]">Geographic Exposure</h2>
                </div>
                <GeoExposureChart
                    data={geoData}
                    legendColumns={1}
                    activeGeoKey={activeGeoKey}
                    onGeoClick={handleGeoClick}
                />
                {effectiveGeoKey ? (
                    <div className="mt-4 border-t border-[var(--color-neutral-4)] pt-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => { setActiveGeoKey(null); setGeoDrillRoot(null); setActiveGeoCategory(null) }}
                                    className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-3)] pl-2.5 pr-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-accent-11)] hover:bg-[var(--color-accent-4)] transition-colors"
                                >
                                    {activeGeoLabel ?? activeGeoKey}
                                    <IconX size={10} stroke={2.5} className="opacity-70" />
                                </button>
                                {activeGeoCategory && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveGeoCategory(null)}
                                        className="inline-flex items-center gap-1 rounded-full bg-[var(--color-neutral-3)] pl-2.5 pr-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-4)] transition-colors"
                                    >
                                        {CATEGORY_LABELS[activeGeoCategory] ?? activeGeoCategory}
                                        <IconX size={10} stroke={2.5} className="opacity-60" />
                                    </button>
                                )}
                                {geoDrillRoot && (
                                    <button
                                        type="button"
                                        onClick={() => { setGeoDrillRoot(null); setActiveGeoKey(null) }}
                                        className="ml-auto text-[11px] font-medium text-[var(--color-neutral-10)] hover:text-[var(--color-neutral-11)] transition-colors"
                                    >
                                        ← All countries
                                    </button>
                                )}
                            </div>
                            <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">
                                {activeGeoItemCount} asset{activeGeoItemCount === 1 ? '' : 's'} in this region
                            </p>
                            <div className="rounded-lg border border-[var(--color-neutral-4)] overflow-hidden">
                                <table className="w-full border-collapse text-[12px]">
                                    <thead>
                                        <tr className="border-b border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)]">
                                            <th className="px-3 py-2 text-left font-semibold text-[var(--color-neutral-11)]">Category</th>
                                            <th className="px-3 py-2 text-left font-semibold text-[var(--color-neutral-11)]">Asset</th>
                                            <th className="px-3 py-2 text-right font-semibold text-[var(--color-neutral-11)]">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {geoAssetRows.slice(0, 12).map(asset => {
                                            const categoryLabel = CATEGORY_LABELS[asset.categoryKey] ?? asset.categoryKey
                                            const isCategoryActive = activeGeoCategory === asset.categoryKey
                                            return (
                                                <tr
                                                    key={asset.id}
                                                    className="border-b border-[var(--color-neutral-3)] last:border-b-0 hover:bg-[var(--color-neutral-2)]"
                                                >
                                                    <td className="px-3 py-2 align-middle">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (isCategoryActive) {
                                                                    setActiveGeoCategory(null)
                                                                    return
                                                                }
                                                                setActiveGeoCategory(asset.categoryKey)
                                                            }}
                                                            className={`rounded px-1.5 py-0.5 text-left transition-colors ${
                                                                isCategoryActive
                                                                    ? 'bg-[var(--color-neutral-3)] text-[var(--color-black)]'
                                                                    : 'text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)]'
                                                            }`}
                                                        >
                                                            {categoryLabel}
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-2 align-middle">
                                                        <button
                                                            type="button"
                                                            onClick={() => onNavigateToAsset?.(asset.id)}
                                                            className="max-w-full truncate text-left text-[var(--color-black)] hover:text-[var(--color-accent-10)]"
                                                            title={asset.name}
                                                        >
                                                            {asset.name}
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-2 align-middle text-right tabular-nums text-[var(--color-neutral-10)]">
                                                        {formatValue(asset.value ?? 0)}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {geoAssetRows.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-3 py-2 text-[11px] text-[var(--color-neutral-9)]">
                                                    No assets in this filter.
                                                </td>
                                            </tr>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Upcoming Cashflows */}
            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Upcoming Cashflows</h2>
                        <span className="inline-flex items-center rounded-full bg-[var(--color-neutral-3)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-neutral-11)]">
                            {cashflowSummary.count}
                        </span>
                    </div>
                    <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums"
                        style={{
                            color: cashflowSummary.net >= 0 ? '#059669' : '#B91C1C',
                            background: cashflowSummary.net >= 0 ? 'rgba(5,150,105,0.10)' : 'rgba(185,28,28,0.08)',
                        }}
                    >
                        Net {cashflowSummary.net >= 0 ? '+' : '−'}{formatValue(Math.abs(cashflowSummary.net))}
                    </span>
                </div>

                {/* Summary stat chips */}
                <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[rgba(5,150,105,0.07)] px-3 py-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(5,150,105,0.15)]">
                            <IconArrowUp size={12} stroke={2.5} className="text-[#059669]" />
                        </div>
                        <div>
                            <p className="text-[11px] text-[#059669] font-medium leading-none mb-0.5">Inflow</p>
                            <p className="text-[13px] font-bold tabular-nums text-[#059669] leading-none">+{formatValue(cashflowSummary.inflow)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[rgba(185,28,28,0.06)] px-3 py-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(185,28,28,0.12)]">
                            <IconArrowDown size={12} stroke={2.5} className="text-[#B91C1C]" />
                        </div>
                        <div>
                            <p className="text-[11px] text-[#B91C1C] font-medium leading-none mb-0.5">Outflow</p>
                            <p className="text-[13px] font-bold tabular-nums text-[#B91C1C] leading-none">−{formatValue(cashflowSummary.outflow)}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-2 h-px bg-[var(--color-neutral-3)]" />

                <div className="flex flex-col gap-0.5 flex-1">
                    {sortedCashflowEvents.map((ev, i) => {
                        const daysLeft = daysUntilDateLabel(ev.date)
                        const urgency: 'critical' | 'soon' | 'normal' =
                            daysLeft != null && daysLeft <= 7 ? 'critical' :
                            daysLeft != null && daysLeft <= 30 ? 'soon' : 'normal'
                        const daysBadgeStyle = urgency === 'critical'
                            ? { color: '#B91C1C', background: 'rgba(185,28,28,0.10)' }
                            : urgency === 'soon'
                            ? { color: '#B45309', background: 'rgba(217,119,6,0.10)' }
                            : { color: 'var(--color-neutral-9)', background: 'var(--color-neutral-3)' }
                        return (
                            <div
                                key={i}
                                className="group flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-2 -mx-2 transition-colors hover:bg-[var(--color-neutral-2)]"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <p className="text-[12px] font-medium text-[var(--color-black)] truncate">{ev.asset}</p>
                                    </div>
                                    <p className="text-[11px] text-[var(--color-neutral-9)] mt-0.5">
                                        {ev.date} · {ev.type}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {ev.outflow && (
                                        <button
                                            type="button"
                                            onClick={() => showToast(`Opening review for ${ev.asset}…`, 'success')}
                                            className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-neutral-4)] bg-white px-2 py-0.5 text-[11px] font-medium text-[var(--color-neutral-11)] transition-[opacity,border-color,color] duration-150 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:border-[var(--color-neutral-6)] hover:text-[var(--color-black)]"
                                        >
                                            Review
                                            <IconArrowUpRight size={11} stroke={2} />
                                        </button>
                                    )}
                                    {daysLeft != null && (
                                        <span
                                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                                            style={daysBadgeStyle}
                                        >
                                            {daysLeft}d
                                        </span>
                                    )}
                                    <span
                                        className="text-sm font-semibold tabular-nums"
                                        style={{ color: ev.outflow ? '#B91C1C' : '#059669' }}
                                    >
                                        {ev.outflow ? '−' : '+'}{formatValue(ev.amount)}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Capital Call Commitments — private investments only */}
            {isPrivate && (
                <CapitalCallsSection
                    onNavigateToTimeline={onNavigateToTimeline}
                    onNavigateToInvestment={onNavigateToInvestment}
                />
            )}

        </div>
    )
}

const FUND_CALL_COLORS: Record<string, string> = {
    'greentech-fund-iii': '#059669',
    'whitmore-capital-i': '#005BE2',
    'whitmore-ventures-ii': '#8B5CF6',
    'whitmore-real-assets-iii': '#93C5FD',
}

const CAPITAL_CALLS_CHART_THEME = {
    background: 'transparent',
    text: { fontFamily: 'Inter, -apple-system, sans-serif' },
    axis: {
        domain: { line: { stroke: 'transparent' } },
        ticks: {
            line: { stroke: 'transparent' },
            text: { fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter, -apple-system, sans-serif' },
        },
    },
    grid: { line: { stroke: '#F0F0F3', strokeWidth: 1 } },
}

function CapitalCallsSection({
    onNavigateToTimeline,
    onNavigateToInvestment,
}: {
    onNavigateToTimeline?: () => void
    onNavigateToInvestment?: (investmentId: string) => void
}) {
    const commitmentToInvId = useMemo(() => {
        const map: Record<string, string> = {}
        INVESTMENT_RECORDS.forEach(inv => {
            if (inv.commitmentDataId) map[inv.commitmentDataId] = inv.id
        })
        return map
    }, [])

    const yearTotals = CAPITAL_CALL_COMMITMENTS.reduce<Record<number, number>>((acc, commitment) => {
        for (const call of commitment.calls) {
            if (call.status === 'paid') continue
            const y = Number(call.dueDate.slice(0, 4))
            acc[y] = (acc[y] ?? 0) + call.amount
        }
        return acc
    }, {})
    const years = Object.keys(yearTotals).map(Number).sort((a, b) => a - b)

    const scheduleRows = years.map((year, idx) => {
        const totalsByFund = CAPITAL_CALL_COMMITMENTS.reduce<Record<string, number>>((acc, commitment) => {
            const amount = commitment.calls
                .filter(call => call.status !== 'paid' && Number(call.dueDate.slice(0, 4)) === year)
                .reduce((sum, call) => sum + call.amount, 0)
            acc[commitment.id] = amount
            return acc
        }, {})
        const total = yearTotals[year] ?? 0
        const cumulative = years.slice(0, idx + 1).reduce((sum, y) => sum + (yearTotals[y] ?? 0), 0)
        return { year, totalsByFund, total, cumulative }
    })

    const fundCountLabel = `${CAPITAL_CALL_COMMITMENTS.length} fund${CAPITAL_CALL_COMMITMENTS.length > 1 ? 's' : ''}`

    const totalCommitment = CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + c.totalCommitment, 0)
    const totalCalled = CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + getTotalCalled(c), 0)
    const totalRemaining = totalCommitment - totalCalled
    const totalCalledPct = totalCommitment > 0 ? (totalCalled / totalCommitment) * 100 : 0
    const currentYear = new Date().getFullYear()
    const currentYearTotal = yearTotals[currentYear] ?? 0
    const confirmedCalls = CAPITAL_CALL_COMMITMENTS.flatMap(c => c.calls).filter(c => c.status === 'pending').length
    const nextDueCall = CAPITAL_CALL_COMMITMENTS
        .flatMap(c => c.calls)
        .filter(c => c.status !== 'paid')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
    const nextDueLabel = nextDueCall
        ? new Date(nextDueCall.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '—'

    return (
        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-5 w-full">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Commitments</h2>
                    <p className="text-[11px] text-[var(--color-neutral-9)] m-0">Forecast snapshot for private investments</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-[var(--color-neutral-3)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-neutral-11)] tabular-nums shrink-0">
                    {fundCountLabel}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[var(--radius-md)] bg-[var(--color-neutral-2)] px-3 py-2.5">
                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--color-neutral-9)]">Current year</p>
                    <p className="m-0 mt-1 text-[14px] font-semibold tabular-nums text-[var(--color-black)]">{formatValue(currentYearTotal)}</p>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--color-neutral-2)] px-3 py-2.5">
                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--color-neutral-9)]">Call received</p>
                    <p className="m-0 mt-1 text-[14px] font-semibold tabular-nums text-[var(--color-black)]">{confirmedCalls}</p>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--color-neutral-2)] px-3 py-2.5">
                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--color-neutral-9)]">Next due</p>
                    <p className="m-0 mt-1 text-[14px] font-semibold tabular-nums text-[var(--color-black)]">{nextDueLabel}</p>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <div className="text-[11px] font-medium text-[var(--color-neutral-9)] mb-0.5">Total committed</div>
                    <div className="text-[15px] font-semibold tabular-nums text-[var(--color-black)]">{formatValue(totalCommitment)}</div>
                </div>
                <div>
                    <div className="text-[11px] font-medium text-[var(--color-neutral-9)] mb-0.5">Called</div>
                    <div className="text-[15px] font-semibold tabular-nums text-[var(--color-black)]">{formatValue(totalCalled)}</div>
                </div>
                <div>
                    <div className="text-[11px] font-medium text-[var(--color-neutral-9)] mb-0.5">Remaining</div>
                    <div className="text-[15px] font-semibold tabular-nums text-[var(--color-black)]">{formatValue(totalRemaining)}</div>
                </div>
            </div>

            {/* Segmented progress bar */}
            <div>
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-[var(--color-neutral-3)]">
                    {CAPITAL_CALL_COMMITMENTS.map(c => {
                        const called = getTotalCalled(c)
                        const pct = totalCommitment > 0 ? (called / totalCommitment) * 100 : 0
                        return (
                            <div
                                key={c.id}
                                style={{ width: `${pct}%`, background: FUND_CALL_COLORS[c.id] ?? '#94A3B8' }}
                            />
                        )
                    })}
                </div>
                <p className="text-[11px] text-[var(--color-neutral-9)] mt-1.5">
                    {Math.round(totalCalledPct)}% drawn · {formatValue(totalRemaining)} remaining
                </p>
            </div>

            <div className="h-px bg-[var(--color-neutral-3)]" />

            {/* Call Schedule */}
            <div>
                <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[12px] font-semibold text-[var(--color-black)] m-0">Call Schedule</p>
                    <span className="inline-flex items-center rounded-full bg-[var(--color-accent-3)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[var(--color-accent-11)]">
                        {currentYear}
                    </span>
                </div>
                <p className="text-[11px] text-[var(--color-neutral-9)] mb-3">Projected capital calls by year (lighter confidence after current year)</p>
                <div style={{ height: 200 }}>
                    <ResponsiveBar
                        data={scheduleRows.map(row => ({ year: String(row.year), ...row.totalsByFund }))}
                        keys={CAPITAL_CALL_COMMITMENTS.map(c => c.id)}
                        indexBy="year"
                        margin={{ top: 8, right: 8, bottom: 32, left: 52 }}
                        padding={0.35}
                        borderRadius={3}
                        colors={({ id }) => FUND_CALL_COLORS[String(id)] ?? '#94A3B8'}
                        enableLabel={false}
                        axisLeft={{
                            tickValues: 4,
                            format: (v: number) => v >= 1_000_000 ? `$${Math.round(v / 1_000_000)}M` : '',
                            tickSize: 0,
                            tickPadding: 8,
                        }}
                        axisBottom={{ tickSize: 0, tickPadding: 10 }}
                        axisTop={null}
                        axisRight={null}
                        enableGridX={false}
                        enableGridY
                        gridYValues={4}
                        theme={CAPITAL_CALLS_CHART_THEME}
                        tooltip={({ id, value, indexValue }) => (
                            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 12, minWidth: 168, maxWidth: 220, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                                <div style={{ fontWeight: 600, marginBottom: 2, color: '#111' }}>{String(indexValue)}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: 2, background: FUND_CALL_COLORS[String(id)] ?? '#94A3B8', flexShrink: 0 }} />
                                    <span style={{ color: '#6B7280' }}>{CAPITAL_CALL_COMMITMENTS.find(c => c.id === id)?.fundName.replace('Whitmore ', '')}</span>
                                </div>
                                <div style={{ fontWeight: 700, color: '#111', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{formatValue(Number(value))}</div>
                            </div>
                        )}
                    />
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {CAPITAL_CALL_COMMITMENTS.map(c => (
                        <div key={c.id} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: FUND_CALL_COLORS[c.id] ?? '#94A3B8' }} />
                            <span className="text-[11px] text-[var(--color-neutral-10)]">{c.fundName.replace('Whitmore ', '')}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-[var(--color-neutral-3)]" />

            {/* Per-fund compact rows */}
            <div className="flex flex-col divide-y divide-[var(--color-neutral-3)]">
                {CAPITAL_CALL_COMMITMENTS.map(c => {
                    const called = getTotalCalled(c)
                    const calledPct = c.totalCommitment > 0 ? (called / c.totalCommitment) * 100 : 0
                    const color = FUND_CALL_COLORS[c.id] ?? '#94A3B8'
                    const hasReceivedCall = c.calls.some(call => call.status === 'pending')
                    const investmentId = commitmentToInvId[c.id]
                    const isClickable = !!investmentId && !!onNavigateToInvestment
                    return (
                        <div
                            key={c.id}
                            role={isClickable ? 'button' : undefined}
                            onClick={() => { if (isClickable) onNavigateToInvestment!(investmentId) }}
                            className={`flex items-center gap-3 py-2.5 rounded-[var(--radius-md)] -mx-1 px-1 transition-colors ${isClickable ? 'cursor-pointer hover:bg-[var(--color-neutral-2)]' : ''}`}
                        >
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                <span className="text-[13px] font-medium text-[var(--color-black)] truncate">
                                    {c.fundName.replace('Whitmore ', '')}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-[var(--color-neutral-4)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-neutral-9)] shrink-0">
                                    {c.fundType}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap shrink-0">
                                    <span
                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{ background: hasReceivedCall ? 'var(--color-neutral-8)' : 'var(--color-neutral-6)' }}
                                    />
                                    <span className={hasReceivedCall ? 'text-[var(--color-neutral-11)]' : 'text-[var(--color-neutral-9)]'}>
                                        {hasReceivedCall ? 'Call received' : 'No active call'}
                                    </span>
                                </span>
                            </div>
                            <div className="w-28 h-1.5 rounded-full bg-[var(--color-neutral-3)] overflow-hidden shrink-0">
                                <div className="h-full rounded-full" style={{ width: `${calledPct}%`, background: color }} />
                            </div>
                            <span className="text-[12px] tabular-nums text-[var(--color-neutral-10)] w-8 text-right shrink-0">{Math.round(calledPct)}%</span>
                            <span className="text-[12px] tabular-nums text-[var(--color-neutral-9)] w-14 text-right shrink-0">{formatValue(c.totalCommitment)}</span>
                            {isClickable && (
                                <IconChevronRight size={14} className="text-[var(--color-neutral-7)] shrink-0" />
                            )}
                        </div>
                    )
                })}
            </div>

            {onNavigateToTimeline && (
                <button
                    type="button"
                    onClick={onNavigateToTimeline}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-neutral-9)] hover:text-[var(--color-neutral-11)] transition-colors self-start"
                >
                    View full timeline <IconChevronRight size={13} />
                </button>
            )}
        </div>
    )
}
