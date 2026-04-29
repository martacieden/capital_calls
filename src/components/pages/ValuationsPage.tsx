import { useState } from 'react'
import {
    IconCurrencyDollar,
    IconListDetails,
    IconTrendingUp,
    IconBuildingBank,
    IconEye,
    IconEyeOff,
} from '@tabler/icons-react'
import type { AnyCatalogItem } from '@/data/types'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { LineChart } from '@/components/atoms/LineChart'
import { BarChart } from '@/components/atoms/BarChart'
import { KpiStatCard } from '@/components/atoms/KpiStatCard'
import {
    PORTFOLIO_PERFORMANCE,
    ESTATE_KPIS,
    GRAND_TOTAL,
    PORTFOLIO_ALLOCATION_TOTAL,
    CHART_THEMES,
    getPortfolioAllocation,
    getAssetAllocation,
    type ChartTheme,
} from '@/data/thornton/valuations-data'
import { PortfolioAllocationChart } from '@/components/atoms/PortfolioAllocationChart'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'

interface ValuationsPageProps {
    items: AnyCatalogItem[]
    isV3Processing?: boolean
    isChatOpen?: boolean
    onNavigateToCatalogCategory: (categories: string[]) => void
}

function formatValue(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
    if (value >= 1_000_000) return `$${Math.round(value / 1_000_000)}M`
    return `$${value.toLocaleString()}`
}

export function ValuationsPage({ isV3Processing, onNavigateToCatalogCategory }: ValuationsPageProps) {
    const [allocationVisible, setAllocationVisible] = useState(true)
    const [colorTheme, setColorTheme] = useState<ChartTheme>('blue')
    const portfolioAllocation = getPortfolioAllocation(colorTheme)
    const assetAllocation = getAssetAllocation(colorTheme)
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
            <div className="flex w-full items-center justify-between p-0">
                <ContentHeader title="Portfolio" />
                <div className="flex items-center gap-1.5">
                    {(Object.keys(CHART_THEMES) as ChartTheme[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setColorTheme(t)}
                            title={t === 'blue' ? 'Blue palette' : 'Pink palette'}
                            style={{ background: CHART_THEMES[t].swatch }}
                            className={`w-3 h-3 rounded-full transition-all duration-150 ${colorTheme === t ? 'ring-2 ring-offset-1 ring-[var(--color-neutral-9)] scale-110' : 'opacity-50 hover:opacity-80'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Portfolio Allocation + KPIs — side by side */}
            <div className="flex gap-3 items-stretch">
                {/* Portfolio Allocation pie chart */}
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Portfolio Allocation</h2>
                        <span className="text-sm text-[var(--color-neutral-11)]">{formatValue(PORTFOLIO_ALLOCATION_TOTAL)}</span>
                    </div>
                    <PortfolioAllocationChart
                        data={portfolioAllocation}
                        totalValue={PORTFOLIO_ALLOCATION_TOTAL}
                        onSliceClick={(categoryFilter) => {
                            if (categoryFilter.length > 0) onNavigateToCatalogCategory(categoryFilter)
                        }}
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

            {/* Asset Allocation — Nivo horizontal bar chart */}
            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] overflow-visible">
                <button
                    className="flex items-center justify-between w-full px-6 py-5 hover:bg-[var(--color-neutral-2)] transition-colors duration-150 rounded-[var(--radius-xl)]"
                    onClick={() => setAllocationVisible(v => !v)}
                >
                    <h2 className="text-[16px] font-[var(--font-weight-semibold)] text-[var(--color-black)]">Asset Allocation</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] font-medium text-[var(--color-neutral-11)] tracking-[-0.01em]">{formatValue(GRAND_TOTAL)}</span>
                        {allocationVisible
                            ? <IconEye size={16} stroke={1.5} color="var(--color-neutral-11)" />
                            : <IconEyeOff size={16} stroke={1.5} color="var(--color-neutral-11)" />
                        }
                    </div>
                </button>
                {allocationVisible && (
                    <div className="px-6 pb-6">
                        <BarChart data={assetAllocation} />
                    </div>
                )}
            </div>

            {/* Portfolio Performance */}
            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 overflow-visible">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-[16px] font-[var(--font-weight-semibold)] text-[var(--color-black)]">Portfolio Performance</h2>
                        <p className="text-[13px] text-[var(--color-neutral-11)] mt-0.5">Performance trend · Jul 2025–Jun 2026</p>
                    </div>
                    <div className="flex items-baseline gap-1 bg-[rgba(139,92,246,0.08)] px-2.5 py-1 rounded-full">
                        <span className="text-sm font-bold text-[#8B5CF6]">+8.2%</span>
                        <span className="text-xs font-medium text-[#8B5CF6]">YTD</span>
                    </div>
                </div>
                <LineChart
                    data={PORTFOLIO_PERFORMANCE.map(p => ({
                        label: p.month,
                        value: p.value,
                    }))}
                    color="#8B5CF6"
                    showArea
                    height={220}
                    enableTimeRange
                />
            </div>

            <div className="text-xs text-[var(--color-neutral-11)] leading-[1.5] py-[var(--spacing-3)] border-t border-[var(--color-neutral-4)]">
                Values shown are estimates based on AI-extracted trust and estate documents.
                Market prices as of last trading day. Real estate values based on most recent appraisals.
            </div>
        </div>
    )
}
