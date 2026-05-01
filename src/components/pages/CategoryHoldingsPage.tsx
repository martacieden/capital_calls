import { useState, useMemo } from 'react'
import { IconChevronLeft, IconX } from '@tabler/icons-react'
import {
    getAllHoldings,
    getTopSectors,
    getGeoExposure,
    assetMatchesGeoKey,
    PORTFOLIO_ALLOCATION_TOTAL,
    type HoldingItem,
} from '@/data/thornton/valuations-data'
import { thorntonAssets } from '@/data/thornton/assets'
import { TopHoldingsTable } from '@/components/atoms/TopHoldingsTable'
import { TopSectorsChart } from '@/components/atoms/TopSectorsChart'
import { GeoExposureChart } from '@/components/atoms/GeoExposureChart'

interface CategoryHoldingsPageProps {
    categoryKeys: string[]
    categoryLabel: string
    onBack: () => void
    onNavigateToAsset: (id: string) => void
}

function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`
    if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
    return `$${v.toLocaleString()}`
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6">
            <h2 className="text-base font-semibold text-[var(--color-black)] mb-4">{title}</h2>
            {children}
        </div>
    )
}

export function CategoryHoldingsPage({ categoryKeys, categoryLabel, onBack, onNavigateToAsset }: CategoryHoldingsPageProps) {
    const [activeSector, setActiveSector] = useState<string | null>(null)
    const [activeGeoKey, setActiveGeoKey] = useState<string | null>(null)

    const allHoldings = useMemo(() => getAllHoldings(categoryKeys), [categoryKeys])
    const sectors = useMemo(() => getTopSectors(categoryKeys), [categoryKeys])
    const geo = useMemo(() => getGeoExposure(categoryKeys), [categoryKeys])

    const activeGeoLabel = useMemo(() => {
        if (!activeGeoKey) return null
        return geo.find(g => g.geoKey === activeGeoKey)?.label ?? activeGeoKey
    }, [geo, activeGeoKey])

    const filteredHoldings = useMemo((): HoldingItem[] => {
        if (!activeSector && !activeGeoKey) return allHoldings
        const allowedIds = new Set(
            thorntonAssets
                .filter(a => {
                    if (activeSector && a.sector !== activeSector) return false
                    if (!assetMatchesGeoKey(a, activeGeoKey)) return false
                    return true
                })
                .map(a => a.id)
        )
        return allHoldings.filter(h => allowedIds.has(h.id))
    }, [allHoldings, activeSector, activeGeoKey])

    const totalValue = allHoldings.reduce((s, h) => s + h.value, 0)
    const portfolioPercent = PORTFOLIO_ALLOCATION_TOTAL > 0
        ? Math.round((totalValue / PORTFOLIO_ALLOCATION_TOTAL) * 100)
        : 0
    const assetCount = allHoldings.length

    const isPublicMarket = categoryKeys.includes('public-market')

    const handleSectorClick = (sector: string) => {
        setActiveSector(prev => prev === sector ? null : sector)
        setActiveGeoKey(null)
    }

    const handleGeoClick = (geoKey: string) => {
        setActiveGeoKey(prev => prev === geoKey ? null : geoKey)
        setActiveSector(null)
    }

    const clearFilters = () => {
        setActiveSector(null)
        setActiveGeoKey(null)
    }

    const hasFilter = activeSector !== null || activeGeoKey !== null

    return (
        <div className="flex flex-col gap-5 px-6 pt-9 pb-5 max-w-[1120px] w-full mx-auto flex-1">
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
                <span className="text-sm font-medium text-[var(--color-black)]">{categoryLabel}</span>
            </div>

            {/* KPI summary row */}
            <div className="flex gap-3">
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-5 py-4 flex-1">
                    <div className="text-xs text-[var(--color-neutral-10)] mb-1">Total Value</div>
                    <div className="text-xl font-bold text-[var(--color-black)]">{formatValue(totalValue)}</div>
                </div>
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-5 py-4 flex-1">
                    <div className="text-xs text-[var(--color-neutral-10)] mb-1">% of Portfolio</div>
                    <div className="text-xl font-bold text-[var(--color-black)]">{portfolioPercent}%</div>
                </div>
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-5 py-4 flex-1">
                    <div className="text-xs text-[var(--color-neutral-10)] mb-1">Assets</div>
                    <div className="text-xl font-bold text-[var(--color-black)]">{assetCount}</div>
                </div>
            </div>

            {isPublicMarket ? (
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-12 flex flex-col items-center justify-center gap-3 text-center">
                    <span className="text-4xl">📊</span>
                    <h2 className="text-base font-semibold text-[var(--color-black)]">Public Market Holdings</h2>
                    <p className="text-sm text-[var(--color-neutral-10)] max-w-sm">
                        Public market positions are managed through institutional custodians and will be integrated in a future release.
                    </p>
                </div>
            ) : (
                <>
                    {/* Active filter chips */}
                    {hasFilter && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {activeSector && (
                                <span className="flex items-center gap-1.5 text-xs font-medium bg-[var(--color-neutral-3)] text-[var(--color-black)] rounded-full px-3 py-1">
                                    Sector: {activeSector}
                                    <button onClick={clearFilters} className="hover:text-[var(--color-neutral-10)]">
                                        <IconX size={12} />
                                    </button>
                                </span>
                            )}
                            {activeGeoLabel && (
                                <span className="flex items-center gap-1.5 text-xs font-medium bg-[var(--color-neutral-3)] text-[var(--color-black)] rounded-full px-3 py-1">
                                    Region: {activeGeoLabel}
                                    <button onClick={clearFilters} className="hover:text-[var(--color-neutral-10)]">
                                        <IconX size={12} />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Top Holdings */}
                    <SectionCard title="Top Holdings">
                        <TopHoldingsTable
                            items={filteredHoldings}
                            topN={10}
                            onRowClick={onNavigateToAsset}
                        />
                    </SectionCard>

                    {/* Top Sectors + Geo — side by side */}
                    <div className="flex gap-3">
                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 flex-1 min-w-0">
                            <h2 className="text-base font-semibold text-[var(--color-black)] mb-1">Top Sectors</h2>
                            <p className="text-xs text-[var(--color-neutral-10)] mb-4">Click a bar to filter holdings</p>
                            <TopSectorsChart
                                data={sectors}
                                activeSector={activeSector}
                                onSectorClick={handleSectorClick}
                            />
                        </div>
                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 flex-1 min-w-0">
                            <h2 className="text-base font-semibold text-[var(--color-black)] mb-4">Geographic Exposure</h2>
                            <GeoExposureChart
                                data={geo}
                                activeGeoKey={activeGeoKey}
                                onGeoClick={handleGeoClick}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
