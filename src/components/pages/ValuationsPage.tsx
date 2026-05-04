import { useEffect, useMemo, useState } from 'react'
import {
    IconCurrencyDollar,
    IconListDetails,
    IconTrendingUp,
    IconBuildingBank,
    IconShield,
    IconTool,
    IconScale,
    IconReceipt,
    IconChevronRight,
    IconArrowUp,
    IconArrowDown,
} from '@tabler/icons-react'
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
import { thorntonTasks } from '@/data/thornton/tasks-data'
import type { TaskType } from '@/data/thornton/tasks-data'
import {
    CAPITAL_CALL_COMMITMENTS,
    getTotalRemaining,
    getTotalCalled,
    getNextCall,
} from '@/data/thornton/capital-calls-data'
import { showToast } from '@/components/atoms/Toast'
import { IconCircleCheckFilled, IconClock, IconPlayerPlay } from '@tabler/icons-react'
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

const TASK_TYPE_ICONS: Record<TaskType, typeof IconShield> = {
    Insurance: IconShield,
    Maintenance: IconTool,
    Legal: IconScale,
    'Tax & Accounting': IconReceipt,
}
const TASK_TYPE_COLORS: Record<TaskType, string> = {
    Insurance: '#2563EB',
    Maintenance: '#EA580C',
    Legal: '#7C3AED',
    'Tax & Accounting': '#059669',
}

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

function daysUntilIsoDate(isoDate: string): number | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
    if (!m) return null
    const year = Number(m[1])
    const month = Number(m[2]) - 1
    const day = Number(m[3])
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null

    const now = new Date()
    const target = new Date(year, month, day)
    while (target.getTime() < now.getTime()) {
        target.setFullYear(target.getFullYear() + 1)
    }
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.ceil((target.getTime() - now.getTime()) / msPerDay)
}

function monthDayFromIso(isoDate: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
    if (!m) return isoDate
    const month = Number(m[2]) - 1
    const day = Number(m[3])
    const d = new Date(2026, month, day)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const PRIVATE_ONLY_KEYS = ['investment'] as const

export function ValuationsPage({
    isV3Processing,
    lockedMode,
    onNavigateToCatalogCategory,
    onOpenPortfolioCategory,
    onNavigateToAsset,
    onNavigateToTasks,
    onNavigateToTimeline,
}: ValuationsPageProps) {
    const [activeSector, setActiveSector] = useState<string | null>(null)
    const [activeGeoKey, setActiveGeoKey] = useState<string | null>(null)
    const [geoDrillRoot, setGeoDrillRoot] = useState<string | null>(null)
    const [activeGeoCategory, setActiveGeoCategory] = useState<string | null>(null)
    const [portfolioMode, setPortfolioMode] = useState<'all' | 'private'>(lockedMode ?? 'all')

    const isPrivate = portfolioMode === 'private'

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

    const geoCategoryRows = useMemo(() => {
        const totals: Record<string, { value: number; count: number }> = {}
        for (const asset of geoFilteredAssets) {
            const key = asset.categoryKey
            if (!totals[key]) {
                totals[key] = { value: 0, count: 0 }
            }
            totals[key].value += asset.value ?? 0
            totals[key].count += 1
        }
        return Object.entries(totals)
            .map(([categoryKey, stats]) => ({
                categoryKey,
                label: CATEGORY_LABELS[categoryKey] ?? categoryKey,
                value: stats.value,
                count: stats.count,
            }))
            .sort((a, b) => b.value - a.value)
    }, [geoFilteredAssets])

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
    const top5Holdings = useMemo(
        () => getTopHoldings(isPrivate ? [...PRIVATE_ONLY_KEYS] : [], 5),
        [isPrivate],
    )
    const top5Value = top5Holdings.reduce((s, h) => s + h.value, 0)
    const top5Pct = currentDisplayTotal > 0 ? Math.round((top5Value / currentDisplayTotal) * 100) : 0

    // Task lifecycle summary
    const taskCounts = useMemo(() => {
        const counts: Partial<Record<TaskType, number>> = {}
        for (const task of thorntonTasks) {
            counts[task.type] = (counts[task.type] ?? 0) + 1
        }
        return counts
    }, [])
    const taskRows = useMemo(() => {
        const insuranceCashflowDue = [...CASHFLOW_EVENTS]
            .filter(ev => ev.type === 'Insurance')
            .map(ev => ({ dateLabel: ev.date, days: daysUntilDateLabel(ev.date) }))
            .filter((x): x is { dateLabel: string; days: number } => x.days != null)
            .sort((a, b) => a.days - b.days)[0]

        return (Object.keys(TASK_TYPE_ICONS) as TaskType[])
            .map(type => {
                const tasksOfType = thorntonTasks.filter(t => t.type === type)
                const dueCandidates = tasksOfType
                    .map(t => t.nextOccurrence ?? t.dueDate)
                    .map(date => ({ date, days: daysUntilIsoDate(date) }))
                    .filter((x): x is { date: string; days: number } => x.days != null)
                    .sort((a, b) => a.days - b.days)
                const nearest = dueCandidates[0]
                const nearestDaysFromTasks = nearest?.days ?? 10_000
                const nearestDays =
                    type === 'Insurance' && insuranceCashflowDue
                        ? Math.min(nearestDaysFromTasks, insuranceCashflowDue.days)
                        : nearestDaysFromTasks
                const nearestDueLabel =
                    type === 'Insurance' && insuranceCashflowDue && insuranceCashflowDue.days <= nearestDaysFromTasks
                        ? insuranceCashflowDue.dateLabel
                        : nearest
                            ? monthDayFromIso(nearest.date)
                            : '—'
                const urgencyColor =
                    nearestDays <= 14 ? '#EF4444' : nearestDays <= 30 ? '#D97706' : '#9CA3AF'

                return {
                    type,
                    count: taskCounts[type] ?? 0,
                    Icon: TASK_TYPE_ICONS[type],
                    nearestDueLabel,
                    nearestDays,
                    urgencyColor,
                }
            })
            .sort((a, b) => a.nearestDays - b.nearestDays || a.type.localeCompare(b.type))
    }, [taskCounts])
    const totalLifecycleTasks = useMemo(
        () => taskRows.reduce((sum, row) => sum + row.count, 0),
        [taskRows],
    )
    const cashflowSummary = useMemo(() => {
        const outflow = CASHFLOW_EVENTS
            .filter(ev => ev.outflow)
            .reduce((sum, ev) => sum + ev.amount, 0)
        const inflow = CASHFLOW_EVENTS
            .filter(ev => !ev.outflow)
            .reduce((sum, ev) => sum + ev.amount, 0)
        return {
            count: CASHFLOW_EVENTS.length,
            inflow,
            outflow,
            net: inflow - outflow,
        }
    }, [])
    const sortedCashflowEvents = useMemo(() => {
        return [...CASHFLOW_EVENTS].sort((a, b) => {
            const da = daysUntilDateLabel(a.date) ?? 10_000
            const db = daysUntilDateLabel(b.date) ?? 10_000
            return da - db
        })
    }, [])
    const cashflowWindowDays = useMemo(() => {
        return sortedCashflowEvents
            .map(ev => daysUntilDateLabel(ev.date))
            .filter((d): d is number => d != null)
            .reduce((mx, d) => Math.max(mx, d), 0)
    }, [sortedCashflowEvents])
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
            <div className="flex w-full items-center justify-between gap-3 p-0 min-w-0">
                <div className="min-w-0 flex-1">
                    <ContentHeader title={lockedMode === 'private' ? 'Private Investments' : 'Portfolio'} />
                </div>
                {!lockedMode && (
                    <div className="flex shrink-0 items-center gap-0.5 p-0.5 bg-[var(--color-neutral-3)] rounded-[var(--radius-md)]">
                        <button
                            type="button"
                            onClick={() => { setPortfolioMode('all'); setActiveSector(null) }}
                            className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-[12px] font-medium leading-4 whitespace-nowrap transition-all ${
                                portfolioMode === 'all'
                                    ? 'bg-white text-[var(--color-black)] shadow-sm'
                                    : 'text-[var(--color-neutral-10)] hover:text-[var(--color-neutral-11)]'
                            }`}
                        >
                            All Assets
                        </button>
                        <button
                            type="button"
                            onClick={() => { setPortfolioMode('private'); setActiveSector(null) }}
                            className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-[12px] font-medium leading-4 whitespace-nowrap transition-all ${
                                portfolioMode === 'private'
                                    ? 'bg-white text-[var(--color-black)] shadow-sm'
                                    : 'text-[var(--color-neutral-10)] hover:text-[var(--color-neutral-11)]'
                            }`}
                        >
                            Private Investments
                        </button>
                    </div>
                )}
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
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 flex-1 min-w-0 shadow-sm">
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
                        label={isPrivate ? 'YTD (full portfolio)' : 'YTD Performance'}
                        value={`+${ESTATE_KPIS.ytdPerformance}%`}
                        icon={IconTrendingUp}
                        badge={{ text: 'On track', positive: true }}
                    />
                </div>
            </div>

            {/* Top Holdings + Top Sectors — side by side on wide screens */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 min-w-0">
                    <div className="mb-4">
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Top Holdings</h2>
                            <p className="text-xs text-[var(--color-neutral-10)] text-right">By market value (top {topHoldings.length})</p>
                        </div>
                        <p className="text-sm text-[var(--color-neutral-10)] mt-0.5">{holdingsSubtitle}</p>
                        <p className="text-[11px] text-[var(--color-neutral-9)] mt-1.5">
                            Top 5 positions represent <span className="font-semibold text-[var(--color-neutral-11)]">{top5Pct}%</span> of portfolio
                        </p>
                    </div>
                    <TopHoldingsChart items={topHoldings} onItemClick={onNavigateToAsset} colorOverride={HOLDINGS_COLOR_OVERRIDE} />
                </div>

                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 min-w-0">
                    <div className="mb-4">
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Top Sectors</h2>
                            <p className="text-xs text-[var(--color-neutral-10)] text-right">By portfolio share (top {topSectors.length})</p>
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
                <div className="mt-4 border-t border-[var(--color-neutral-4)] pt-4">
                    {!effectiveGeoKey ? (
                        <p className="m-0 text-[12px] text-[var(--color-neutral-9)]">
                            Click a country or region to drill down into categories and specific assets.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-neutral-9)]">
                                    Drilldown
                                </span>
                                <span className="text-[12px] text-[var(--color-neutral-9)]">Geo:</span>
                                <span className="inline-flex items-center rounded-full bg-[var(--color-neutral-3)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-neutral-11)]">
                                    {activeGeoLabel ?? activeGeoKey}
                                </span>
                                {activeGeoCategory ? (
                                    <>
                                        <span className="text-[12px] text-[var(--color-neutral-9)]">Category:</span>
                                        <span className="inline-flex items-center rounded-full bg-[var(--color-neutral-3)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-neutral-11)]">
                                            {CATEGORY_LABELS[activeGeoCategory] ?? activeGeoCategory}
                                        </span>
                                    </>
                                ) : null}
                                {geoDrillRoot ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGeoDrillRoot(null)
                                            setActiveGeoKey(null)
                                        }}
                                        className="ml-auto text-[11px] font-medium text-[var(--color-neutral-10)] hover:text-[var(--color-neutral-11)] hover:underline underline-offset-2"
                                    >
                                        Back to countries
                                    </button>
                                ) : null}
                            </div>
                            <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">
                                {activeGeoItemCount} item{activeGeoItemCount === 1 ? '' : 's'} in selected geography. Click category to go deeper.
                            </p>
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                <div className="rounded-lg border border-[var(--color-neutral-4)] p-2.5">
                                    <p className="m-0 mb-1.5 text-[12px] font-semibold text-[var(--color-neutral-11)]">
                                        Step 2: Categories in this geography
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        {geoCategoryRows.map(row => (
                                            <button
                                                key={row.categoryKey}
                                                type="button"
                                                onClick={() => {
                                                    if (activeGeoCategory === row.categoryKey) {
                                                        setActiveGeoCategory(null)
                                                        return
                                                    }
                                                    setActiveGeoCategory(row.categoryKey)
                                                }}
                                                className={`flex items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors ${
                                                    activeGeoCategory === row.categoryKey
                                                        ? 'bg-[var(--color-neutral-3)]'
                                                        : 'hover:bg-[var(--color-neutral-2)]'
                                                }`}
                                            >
                                                <span className="text-[12px] text-[var(--color-black)]">{row.label}</span>
                                                <span className="text-[11px] text-[var(--color-neutral-10)] tabular-nums">
                                                    {formatValue(row.value)} · {row.count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-[var(--color-neutral-4)] p-2.5">
                                    <p className="m-0 mb-1.5 text-[12px] font-semibold text-[var(--color-neutral-11)]">
                                        Step 3: Specific assets
                                    </p>
                                    <div className="flex flex-col gap-1 max-h-[248px] overflow-auto pr-0.5">
                                        {geoAssetRows.slice(0, 12).map(asset => (
                                            <button
                                                key={asset.id}
                                                type="button"
                                                onClick={() => onNavigateToAsset?.(asset.id)}
                                                className="flex items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-neutral-2)]"
                                            >
                                                <span className="truncate text-[12px] text-[var(--color-black)]">{asset.name}</span>
                                                <span className="shrink-0 text-[11px] text-[var(--color-neutral-10)] tabular-nums">
                                                    {formatValue(asset.value ?? 0)}
                                                </span>
                                            </button>
                                        ))}
                                        {geoAssetRows.length === 0 ? (
                                            <p className="m-0 px-2 py-1 text-[11px] text-[var(--color-neutral-9)]">
                                                No assets in this filter.
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Cashflows + Asset Lifecycle — side by side */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:auto-rows-fr items-stretch">
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
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                            style={{
                                color: cashflowSummary.net >= 0 ? '#059669' : '#B91C1C',
                                background: cashflowSummary.net >= 0 ? 'rgba(5,150,105,0.12)' : 'rgba(239,68,68,0.14)',
                            }}
                        >
                            Net {cashflowSummary.net >= 0 ? '+' : '-'}{formatValue(Math.abs(cashflowSummary.net))}
                        </span>
                    </div>
                    <div className="mb-2 flex items-center gap-3 text-[12px] font-semibold tabular-nums">
                        <span className="inline-flex items-center gap-1 text-[#059669]">
                            <IconArrowUp size={14} />
                            +{formatValue(cashflowSummary.inflow)} inflow
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#EF4444]">
                            <IconArrowDown size={14} />
                            -{formatValue(cashflowSummary.outflow)} outflow
                        </span>
                    </div>
                    <div className="mb-1.5 h-px bg-[var(--color-neutral-3)]" />
                    <div className="flex flex-col gap-1.5 flex-1">
                        {sortedCashflowEvents.map((ev, i) => {
                            const daysLeft = daysUntilDateLabel(ev.date)
                            const isDueSoon = daysLeft != null && daysLeft <= 14
                            const isDueSoonAmber = daysLeft != null && daysLeft > 14 && daysLeft <= 45
                            return (
                                <div key={i} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-[var(--color-neutral-2)]">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {(isDueSoon || isDueSoonAmber) && (
                                                <span
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{ background: isDueSoon ? '#EF4444' : '#D97706' }}
                                                />
                                            )}
                                            <p className="text-[12px] font-medium text-[var(--color-black)] truncate">{ev.asset}</p>
                                            {isDueSoon && (
                                                <span className="shrink-0 inline-flex items-center rounded bg-[rgba(245,158,11,0.16)] px-1.5 py-px text-[10px] font-semibold text-[#B45309]">
                                                    Due soon
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[var(--color-neutral-9)]">
                                            {ev.date} · {ev.type}
                                            {daysLeft != null ? ` · in ${daysLeft} day${daysLeft === 1 ? '' : 's'}` : ''}
                                        </p>
                                    </div>
                                    <span
                                        className="shrink-0 text-sm font-semibold tabular-nums"
                                        style={{
                                            color: ev.outflow ? '#EF4444' : '#059669',
                                        }}
                                    >
                                        {ev.outflow ? '−' : '+'}{formatValue(ev.amount)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="mt-2 pt-2 border-t border-[var(--color-neutral-3)] text-[11px] text-[var(--color-neutral-9)] tabular-nums">
                        Net {cashflowSummary.net >= 0 ? '+' : '-'}{formatValue(Math.abs(cashflowSummary.net))} over the next {cashflowWindowDays} days
                    </div>
                    {onNavigateToTimeline && (
                        <button
                            type="button"
                            onClick={onNavigateToTimeline}
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-neutral-9)] hover:text-[var(--color-neutral-11)] transition-colors"
                        >
                            View full timeline <IconChevronRight size={13} />
                        </button>
                    )}
                </div>

                {/* Asset Lifecycle */}
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Asset Lifecycle Tasks</h2>
                            <span className="inline-flex items-center rounded-full bg-[var(--color-neutral-3)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-neutral-11)]">
                                {totalLifecycleTasks}
                            </span>
                        </div>
                        {onNavigateToTasks && (
                            <button
                                onClick={onNavigateToTasks}
                                className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-neutral-11)] hover:text-[var(--color-accent-9)] hover:bg-[var(--color-neutral-2)] hover:underline underline-offset-2 transition-colors"
                            >
                                View all <IconChevronRight size={13} />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        {taskRows.map(({ type, count, Icon, nearestDueLabel, urgencyColor }) => {
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={onNavigateToTasks}
                                    className={`flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 text-left transition-colors group ${onNavigateToTasks ? 'hover:bg-[var(--color-neutral-2)] cursor-pointer' : 'cursor-default'}`}
                                >
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: urgencyColor }} />
                                    <span
                                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                            color: TASK_TYPE_COLORS[type],
                                            background: `${TASK_TYPE_COLORS[type]}1A`,
                                        }}
                                    >
                                        <Icon size={14} />
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-[12px] font-medium text-[var(--color-neutral-11)] truncate">{type}</span>
                                        <span className="block text-[11px] text-[var(--color-neutral-9)] truncate">next due {nearestDueLabel}</span>
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-[var(--color-neutral-3)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-neutral-10)] group-hover:text-[var(--color-black)] transition-colors">
                                        {count} task{count !== 1 ? 's' : ''}
                                    </span>
                                    <IconChevronRight size={13} className="text-[var(--color-neutral-7)] opacity-40 group-hover:opacity-100 transition-opacity" />
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Capital Call Commitments */}
            <CapitalCallsSection onNavigateToTimeline={onNavigateToTimeline} />

        </div>
    )
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; Icon: typeof IconClock }> = {
    paid:     { label: 'Paid',     color: '#059669', bg: 'rgba(5,150,105,0.12)',  Icon: IconCircleCheckFilled },
    pending:  { label: 'Pending',  color: '#D97706', bg: 'rgba(217,119,6,0.12)', Icon: IconClock },
    upcoming: { label: 'Upcoming', color: '#6366F1', bg: 'rgba(99,102,241,0.12)', Icon: IconPlayerPlay },
}

function fmtIsoDate(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
    if (!m) return iso
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const FUND_CALL_COLORS: Record<string, string> = {
    'whitmore-capital-i': '#059669',
    'whitmore-ventures-ii': '#8B5CF6',
    'whitmore-real-assets-iii': '#005BE2',
}

function CapitalCallsSection({ onNavigateToTimeline }: { onNavigateToTimeline?: () => void }) {
    const totalRemaining = getTotalRemaining(CAPITAL_CALL_COMMITMENTS)
    const totalCommitted = CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + c.totalCommitment, 0)

    const paidCallCount = CAPITAL_CALL_COMMITMENTS.reduce(
        (n, c) => n + c.calls.filter(call => call.status === 'paid').length, 0
    )

    const activeCalls = CAPITAL_CALL_COMMITMENTS
        .flatMap(commitment =>
            commitment.calls
                .filter(c => c.status !== 'paid')
                .map(call => ({ call, commitment }))
        )
        .sort((a, b) => a.call.dueDate.localeCompare(b.call.dueDate))

    return (
        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 w-full">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Capital Call Commitments</h2>
                    <span className="inline-flex items-center rounded-full bg-[var(--color-neutral-3)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-neutral-11)]">
                        {CAPITAL_CALL_COMMITMENTS.length}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-[12px] tabular-nums">
                    <span className="text-[var(--color-neutral-9)]">
                        Total committed: <span className="font-semibold text-[var(--color-neutral-11)]">{formatValue(totalCommitted)}</span>
                    </span>
                    <span className="text-[var(--color-neutral-9)]">
                        Remaining: <span className="font-semibold text-[#EF4444]">{formatValue(totalRemaining)}</span>
                    </span>
                </div>
            </div>
            <p className="text-[12px] text-[var(--color-neutral-9)] mb-4">
                Uncalled capital obligations across active fund commitments
            </p>

            {/* Horizontal scrollable call timeline */}
            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] mb-4 -mx-1 px-1">
                <div className="flex items-stretch gap-2.5" style={{ minWidth: 'max-content' }}>

                    {/* Paid summary pill */}
                    {paidCallCount > 0 && (
                        <div className="flex flex-col justify-center items-center w-[60px] shrink-0 rounded-[var(--radius-lg)] border border-[var(--color-neutral-3)] bg-[var(--color-neutral-2)] px-2 py-3 gap-0.5">
                            <span className="text-[20px] font-bold text-[var(--color-neutral-7)] leading-none tabular-nums">{paidCallCount}</span>
                            <span className="text-[10px] text-[var(--color-neutral-7)] font-medium leading-tight text-center">paid</span>
                        </div>
                    )}

                    {/* Now divider */}
                    <div className="flex flex-col items-center w-5 shrink-0 self-stretch py-1 gap-0.5">
                        <div className="flex-1 w-px bg-[var(--color-accent-9)] opacity-40" />
                        <span className="font-display text-[8px] font-[800] uppercase tracking-[0.06em] text-white bg-[var(--color-accent-9)] px-1.5 py-[2px] rounded-full whitespace-nowrap select-none leading-tight">
                            Now
                        </span>
                        <div className="flex-1 w-px bg-[var(--color-accent-9)] opacity-40" />
                    </div>

                    {/* Active call cards */}
                    {activeCalls.map(({ call, commitment }) => {
                        const color = FUND_CALL_COLORS[commitment.id] ?? '#6366F1'
                        const meta = STATUS_META[call.status]
                        const daysLeft = daysUntilIsoDate(call.dueDate)
                        const isDueSoon = daysLeft != null && daysLeft <= 60

                        return (
                            <div
                                key={call.id}
                                className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] w-[176px] shrink-0 overflow-hidden shadow-sm hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all cursor-default"
                            >
                                <div className="h-[3px] w-full shrink-0" style={{ background: color }} />
                                <div className="flex flex-col px-3 py-2.5 gap-1 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="text-[11px] font-semibold text-[var(--color-neutral-10)] truncate leading-tight">
                                            {commitment.fundName.replace('Whitmore ', '')}
                                        </span>
                                        <span className="text-[10px] text-[var(--color-neutral-7)] shrink-0 tabular-nums">#{call.callNumber}</span>
                                    </div>
                                    <div className="font-display text-[17px] font-bold text-[var(--color-black)] tabular-nums leading-none mt-0.5">
                                        {formatValue(call.amount)}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[11px] text-[var(--color-neutral-9)]">{fmtIsoDate(call.dueDate)}</span>
                                        {isDueSoon && daysLeft != null && (
                                            <span className="inline-flex items-center rounded bg-[rgba(245,158,11,0.14)] px-1 py-px text-[9px] font-semibold text-[#B45309] whitespace-nowrap">
                                                {daysLeft}d
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-1.5">
                                        <span
                                            className="inline-flex items-center rounded px-1.5 py-px text-[10px] font-semibold"
                                            style={{ color: meta?.color, background: meta?.bg }}
                                        >
                                            {meta?.label}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => showToast(`Task created — ${commitment.fundName} Call #${call.callNumber}`, 'success')}
                                            className="text-[10px] font-medium text-[var(--color-neutral-8)] hover:text-[var(--color-accent-9)] transition-colors"
                                        >
                                            + Task
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--color-neutral-3)] mb-4" />

            {/* Compact fund progress rows */}
            <div className="flex flex-col gap-2.5">
                {CAPITAL_CALL_COMMITMENTS.map(commitment => {
                    const called = getTotalCalled(commitment)
                    const remaining = commitment.totalCommitment - called
                    const calledPct = commitment.totalCommitment > 0 ? (called / commitment.totalCommitment) * 100 : 0
                    const color = FUND_CALL_COLORS[commitment.id] ?? '#6366F1'
                    const nextCall = getNextCall(commitment)

                    return (
                        <div key={commitment.id} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 w-[200px] shrink-0 min-w-0">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                                <span className="text-[12px] font-semibold text-[var(--color-neutral-11)] truncate">
                                    {commitment.fundName.replace('Whitmore ', '')}
                                </span>
                                <span
                                    className="inline-flex items-center rounded px-1 py-px text-[10px] font-semibold shrink-0"
                                    style={{ color: '#6366F1', background: 'rgba(99,102,241,0.1)' }}
                                >
                                    {commitment.fundType}
                                </span>
                            </div>
                            <div className="flex-1 relative h-1.5 rounded-full bg-[var(--color-neutral-3)] overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-full rounded-full transition-all"
                                    style={{ width: `${calledPct}%`, background: color }}
                                />
                            </div>
                            <span className="text-[11px] tabular-nums text-[var(--color-neutral-9)] shrink-0">
                                {formatValue(called)} / {formatValue(commitment.totalCommitment)}
                            </span>
                            <span className="text-[11px] font-semibold text-[#EF4444] tabular-nums shrink-0">
                                {formatValue(remaining)} left
                            </span>
                            {nextCall && (
                                <button
                                    type="button"
                                    onClick={() => showToast(`Task created for ${commitment.fundName} — Call #${nextCall.callNumber}`, 'success')}
                                    className="shrink-0 inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-2 py-0.5 text-[11px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors"
                                >
                                    + Create Task
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {onNavigateToTimeline && (
                <button
                    type="button"
                    onClick={onNavigateToTimeline}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-neutral-9)] hover:text-[var(--color-neutral-11)] transition-colors"
                >
                    View full timeline <IconChevronRight size={13} />
                </button>
            )}
        </div>
    )
}
