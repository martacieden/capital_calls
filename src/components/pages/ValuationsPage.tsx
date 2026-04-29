import {
    IconCurrencyDollar,
    IconListDetails,
    IconTrendingUp,
    IconBuildingBank,
} from '@tabler/icons-react'
import type { AnyCatalogItem } from '@/data/types'
import { cn } from '@/lib/utils'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { LineChart } from '@/components/atoms/LineChart'
import { BarChart } from '@/components/atoms/BarChart'
import { KpiStatCard } from '@/components/atoms/KpiStatCard'
import {
    ASSET_ALLOCATION,
    PORTFOLIO_PERFORMANCE,
    ESTATE_KPIS,
    GRAND_TOTAL,
    PORTFOLIO_ALLOCATION,
    PORTFOLIO_ALLOCATION_TOTAL,
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

export function ValuationsPage({ isV3Processing, isChatOpen, onNavigateToCatalogCategory }: ValuationsPageProps) {
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

            {/* Portfolio Allocation Overview */}
            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-base font-semibold text-[var(--color-black)]">Portfolio Allocation</h2>
                    <span className="text-sm text-[var(--color-neutral-11)]">{formatValue(PORTFOLIO_ALLOCATION_TOTAL)}</span>
                </div>
                <PortfolioAllocationChart
                    data={PORTFOLIO_ALLOCATION}
                    totalValue={PORTFOLIO_ALLOCATION_TOTAL}
                    onSliceClick={(categoryFilter) => {
                        if (categoryFilter.length > 0) onNavigateToCatalogCategory(categoryFilter)
                    }}
                />
            </div>

            {/* KPI Stat Row — 2x2 grid */}
            <div className={cn(
                'grid grid-cols-2 gap-3',
                isChatOpen && 'grid-cols-2'
            )}>
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

            {/* Asset Allocation — Nivo horizontal bar chart */}
            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 overflow-visible">
                <div className="flex items-start justify-between mb-2">
                    <h2 className="text-[16px] font-[var(--font-weight-semibold)] text-[var(--color-black)]">Asset Allocation</h2>
                    <span className="text-[13px] font-medium text-[var(--color-neutral-11)] tracking-[-0.01em]">{formatValue(GRAND_TOTAL)}</span>
                </div>
                <BarChart data={ASSET_ALLOCATION} />
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
