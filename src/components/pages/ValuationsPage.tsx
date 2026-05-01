import { useState, useMemo } from 'react'
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
    getTopHoldings,
    getTopSectors,
    INVESTABLE_CATALOG_TOTAL,
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
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'

interface ValuationsPageProps {
    items: AnyCatalogItem[]
    isV3Processing?: boolean
    isChatOpen?: boolean
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

export function ValuationsPage({
    isV3Processing,
    onNavigateToCatalogCategory,
    onOpenPortfolioCategory,
    onNavigateToAsset,
    onNavigateToTasks,
    onNavigateToTimeline,
}: ValuationsPageProps) {
    const [activeSector, setActiveSector] = useState<string | null>(null)

    const drilldownSlices: PortfolioAllocationSlice[] = portfolioAllocationItems.map(item => {
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

        return {
            key: item.id,
            label: item.label,
            value: item.value,
            percentage: item.percentage,
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

    const allTopHoldings = useMemo(() => getTopHoldings([], 10), [])
    const topHoldings = useMemo(() => {
        if (!activeSector) return allTopHoldings
        return allTopHoldings.filter(h => h.sector === activeSector)
    }, [allTopHoldings, activeSector])

    const topSectors = getTopSectors([])
    const holdingsSubtitle = activeSector
        ? `Largest positions in ${activeSector}`
        : 'Largest positions by value across all categories'

    const handleSectorClick = (sector: string) => {
        setActiveSector(prev => prev === sector ? null : sector)
    }

    const handlePieSliceClick = (categoryFilter: string[]) => {
        const categoryId = categoryFilter[0]
        if (!categoryId) return
        onOpenPortfolioCategory(categoryId)
    }

    // Net worth calculation
    const totalAssets = INVESTABLE_CATALOG_TOTAL
    const totalLiabilities = Math.round(totalAssets * MOCK_LIABILITIES_RATIO)
    const netWorth = totalAssets - totalLiabilities
    const netWorthPct = Math.round((netWorth / totalAssets) * 100)

    // Concentration: top 5 holdings as % of portfolio
    const top5Holdings = useMemo(() => getTopHoldings([], 5), [])
    const top5Value = top5Holdings.reduce((s, h) => s + h.value, 0)
    const top5Pct = totalAssets > 0 ? Math.round((top5Value / totalAssets) * 100) : 0

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
                    <ContentHeader title="Portfolio" />
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
            <div className="flex w-full flex-col p-0">
                <ContentHeader title="Portfolio" />
            </div>

            {/* Net Worth summary bar */}
            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <span className="text-sm font-semibold text-[var(--color-black)]">Net Worth</span>
                        <span className="ml-2 text-xs text-[var(--color-neutral-10)]">Assets − estimated liabilities</span>
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
                    <span>Total assets: {formatValue(totalAssets)}</span>
                    <span>Liabilities (est.): {formatValue(totalLiabilities)}</span>
                </div>
            </div>

            {/* Portfolio Allocation + KPIs — side by side */}
            <div className="flex gap-3 items-stretch">
                {/* Portfolio Allocation pie chart */}
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 flex-1 min-w-0 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Portfolio Allocation</h2>
                        <span className="text-sm text-[var(--color-neutral-11)]">{formatValue(PORTFOLIO_ALLOCATION_DISPLAY_TOTAL)}</span>
                    </div>
                    <PortfolioAllocationChart
                        data={drilldownSlices}
                        totalValue={PORTFOLIO_ALLOCATION_DISPLAY_TOTAL}
                        onSliceClick={handlePieSliceClick}
                    />
                </div>

                {/* KPI 2x2 grid */}
                <div className="grid grid-cols-2 grid-rows-2 gap-3 w-[340px] shrink-0">
                    <KpiStatCard
                        label="Total Estate Value"
                        value={formatValue(ESTATE_KPIS.totalValue)}
                        icon={IconCurrencyDollar}
                    />
                    <KpiStatCard
                        label="Total Assets"
                        value={String(ESTATE_KPIS.totalAssets)}
                        icon={IconListDetails}
                        onClick={() => onNavigateToCatalogCategory([])}
                    />
                    <KpiStatCard
                        label="Active Entities"
                        value={String(ESTATE_KPIS.activeEntities)}
                        icon={IconBuildingBank}
                    />
                    <KpiStatCard
                        label="YTD Performance"
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
                <GeoExposureChart data={PORTFOLIO_OVERVIEW_GEO} legendColumns={1} />
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

        </div>
    )
}
