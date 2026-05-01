import { useState, useEffect } from 'react'
import { IconChevronLeft, IconX } from '@tabler/icons-react'
import { PortfolioHoldingsTable } from '@/components/atoms/PortfolioHoldingsTable'
import { GeoExposureChart } from '@/components/atoms/GeoExposureChart'
import {
    getDrilldownData,
    getCategoryLabel,
    PORTFOLIO_TOTAL,
    type PortfolioSector,
} from '@/data/thornton/portfolio-data'

interface PortfolioDrilldownPageProps {
    categoryId: string
    onBack: () => void
    onNavigateToAsset?: (id: string) => void
}

function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
    return `$${v.toLocaleString()}`
}

function SectorsBar({
    data,
    activeSector,
    onSectorClick,
}: {
    data: PortfolioSector[]
    activeSector?: string | null
    onSectorClick?: (sector: string) => void
}) {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
        <div className="flex flex-col gap-3">
            {data.map(sector => {
                const isActive = sector.label === activeSector
                const dimmed = !!activeSector && !isActive
                return (
                    <div
                        key={sector.label}
                        role={onSectorClick ? 'button' : undefined}
                        tabIndex={onSectorClick ? 0 : undefined}
                        onClick={() => onSectorClick?.(sector.label)}
                        onKeyDown={e => {
                            if (!onSectorClick) return
                            if (e.key === 'Enter' || e.key === ' ') onSectorClick(sector.label)
                        }}
                        className={`flex items-center gap-3 px-1 py-1 rounded transition-all ${onSectorClick ? 'cursor-pointer hover:bg-[var(--color-neutral-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-neutral-6)] focus:ring-offset-1' : ''} ${dimmed ? 'opacity-40' : ''}`}
                    >
                        <span className={`text-sm w-40 shrink-0 truncate ${isActive ? 'font-semibold text-[var(--color-black)]' : 'text-[var(--color-neutral-11)]'}`}>
                            {sector.label}
                        </span>
                        <div className="flex-1 h-5 bg-[var(--color-neutral-3)] rounded overflow-hidden">
                            <div
                                className="h-full rounded transition-all duration-300"
                                style={{ width: `${(sector.value / max) * 100}%`, background: sector.color }}
                            />
                        </div>
                        <div className="shrink-0 text-right w-28">
                            <span className="text-xs font-semibold text-[var(--color-black)]">{formatValue(sector.value)}</span>
                            <span className="text-xs text-[var(--color-neutral-9)] ml-1.5">{sector.percentage}%</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
    return (
        <span className="flex items-center gap-1.5 text-xs font-medium bg-[var(--color-neutral-3)] text-[var(--color-black)] rounded-full px-3 py-1">
            {label}
            <button
                onClick={onClear}
                className="flex items-center text-[var(--color-neutral-9)] hover:text-[var(--color-black)] transition-colors"
                aria-label="Clear sector filter"
            >
                <IconX size={12} />
            </button>
        </span>
    )
}

export function PortfolioDrilldownPage({ categoryId, onBack, onNavigateToAsset }: PortfolioDrilldownPageProps) {
    const [activeSector, setActiveSector] = useState<string | null>(null)

    const portfolioData = getDrilldownData(categoryId)
    const label = getCategoryLabel(categoryId)

    // Redirect to portfolio if categoryId has no drilldown data
    useEffect(() => {
        if (!portfolioData) onBack()
    }, [portfolioData, onBack])

    if (!portfolioData) return null

    const handleSectorClick = (sector: string) => {
        setActiveSector(prev => prev === sector ? null : sector)
    }

    const portfolioPercent = PORTFOLIO_TOTAL > 0
        ? ((portfolioData.totalValue / PORTFOLIO_TOTAL) * 100).toFixed(1)
        : '0'

    const allHoldings = portfolioData.topHoldings
    const matchingHoldings = activeSector
        ? allHoldings.filter(h => h.sector === activeSector)
        : allHoldings
    const visibleHoldings = matchingHoldings.length > 0 ? matchingHoldings : allHoldings

    return (
        <div className="flex flex-col gap-5 px-6 pt-9 pb-8 max-w-[1120px] w-full mx-auto flex-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-sm text-[var(--color-neutral-10)] hover:text-[var(--color-black)] transition-colors"
                >
                    <IconChevronLeft size={16} />
                    Portfolio
                </button>
                <span className="text-sm text-[var(--color-neutral-7)]">/</span>
                <span className="text-sm font-medium text-[var(--color-black)]">{label}</span>
            </div>

            {/* KPI row */}
            <div className="flex gap-3">
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-5 py-4 flex-1">
                    <div className="text-xs text-[var(--color-neutral-10)] mb-1">Total Value</div>
                    <div className="text-xl font-bold text-[var(--color-black)]">{formatValue(portfolioData.totalValue)}</div>
                </div>
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-5 py-4 flex-1">
                    <div className="text-xs text-[var(--color-neutral-10)] mb-1">% of Portfolio</div>
                    <div className="text-xl font-bold text-[var(--color-black)]">{portfolioPercent}%</div>
                </div>
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-5 py-4 flex-1">
                    <div className="text-xs text-[var(--color-neutral-10)] mb-1">Holdings</div>
                    <div className="text-xl font-bold text-[var(--color-black)]">{allHoldings.length}</div>
                </div>
            </div>

            {/* Holdings — table */}
            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-[var(--color-black)]">Holdings</h2>
                    {activeSector && (
                        <FilterChip label={activeSector} onClear={() => setActiveSector(null)} />
                    )}
                </div>
                <PortfolioHoldingsTable
                    holdings={visibleHoldings}
                    categoryId={categoryId}
                    onRowClick={onNavigateToAsset}
                />
            </div>

            {/* Sectors + Geo side by side */}
            <div className="flex gap-3">
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-[var(--color-black)] mb-1">Top Sectors</h2>
                    <p className="text-xs text-[var(--color-neutral-10)] mb-4">Click to filter holdings</p>
                    <SectorsBar
                        data={portfolioData.topSectors}
                        activeSector={activeSector}
                        onSectorClick={handleSectorClick}
                    />
                </div>
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-[var(--color-black)] mb-4">Geographic Exposure</h2>
                    <GeoExposureChart data={portfolioData.geographicExposure} />
                </div>
            </div>
        </div>
    )
}
