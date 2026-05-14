import { useMemo, useState } from 'react'
import type { PortfolioHolding } from '@/data/thornton/portfolio-data'

type SortKey = 'value' | 'name' | 'pct'

interface PortfolioHoldingsTableProps {
    holdings: PortfolioHolding[]
    categoryId?: string
    onRowClick?: (id: string) => void
    /** Увімкнути сортування по колонках (наприклад на повній сторінці портфеля). */
    enableColumnSort?: boolean
}

function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
    return `$${v.toLocaleString()}`
}

const HOLDING_TYPE_ICON: Record<string, string> = {
    Art: '🎨',
    Maritime: '⛵',
    Aviation: '✈️',
    Vehicles: '🚗',
    Collectibles: '💎',
    Residential: '🏠',
    'Private Equity': '📈',
    'Venture Capital': '📈',
    'Real Assets': '🏗',
    'Private Debt': '📊',
    Cash: '💵',
}

function holdingIcon(type: string, sector: string): string {
    return HOLDING_TYPE_ICON[type] ?? HOLDING_TYPE_ICON[sector] ?? '💼'
}

function HoldingThumb({ holding }: { holding: PortfolioHolding }) {
    const [imgFailed, setImgFailed] = useState(false)
    const showImg = Boolean(holding.image?.trim()) && !imgFailed

    return (
        <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-neutral-3)] overflow-hidden flex items-center justify-center shrink-0 border border-[var(--color-neutral-4)]">
            {showImg ? (
                <img
                    src={holding.image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={() => setImgFailed(true)}
                />
            ) : (
                <span className="text-lg" aria-hidden>{holdingIcon(holding.type, holding.sector)}</span>
            )}
        </div>
    )
}

function holdingsDetailCell(h: PortfolioHolding, categoryId?: string): string {
    const trimmedLocation = h.location?.trim()
    const trimmedManager = h.manager?.trim()
    const trimmedVintage = h.vintage?.trim()

    const mockPrivateManagerByType: Record<string, string> = {
        'Private Equity': 'Whitmore Capital Partners',
        'Venture Capital': 'Whitmore Ventures',
        'Real Assets': 'Whitmore Real Assets',
        'Private Debt': 'Whitmore Credit Partners',
    }

    if (categoryId === 'private-investments') {
        const parts = [trimmedManager, trimmedVintage ? `Vintage ${trimmedVintage}` : null].filter(Boolean)
        if (parts.length > 0) return parts.join(' · ')

        // Mock fallback so private holdings table never shows an empty dash in this column.
        const mockManager = mockPrivateManagerByType[h.type] ?? 'Whitmore Advisory'
        const mockVintage = h.id === 'thn-a15' ? '2019' : h.id === 'thn-a42' ? '2020' : '2021'
        return `${mockManager} · Vintage ${mockVintage}`
    }

    if (trimmedLocation) return trimmedLocation
    if (trimmedManager) return trimmedManager
    if (trimmedVintage) return `Vintage ${trimmedVintage}`

    // Generic fallback for categories where source data does not include detail fields.
    const mockDetailsByType: Record<string, string> = {
        Maritime: 'Monaco · Dock A-12',
        Aviation: 'London · Hangar 3',
        Vehicles: 'Zurich · Secured storage',
        Art: 'Geneva Freeport',
        Collectibles: 'Singapore vault',
        Residential: 'Primary market',
        Cash: 'Tier-1 custody account',
    }
    return mockDetailsByType[h.type] ?? `${h.sector} portfolio`
}

export function PortfolioHoldingsTable({
    holdings,
    categoryId,
    onRowClick,
    enableColumnSort = false,
}: PortfolioHoldingsTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('value')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

    const sortedHoldings = useMemo(() => {
        if (!enableColumnSort) return holdings
        const mult = sortDir === 'asc' ? 1 : -1
        return [...holdings].sort((a, b) => {
            if (sortKey === 'value') return mult * (a.value - b.value)
            if (sortKey === 'pct') return mult * (a.portfolioPercentage - b.portfolioPercentage)
            return mult * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        })
    }, [holdings, enableColumnSort, sortKey, sortDir])

    const handleSortClick = (key: SortKey) => {
        if (!enableColumnSort) return
        if (sortKey === key) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(key)
            setSortDir(key === 'name' ? 'asc' : 'desc')
        }
    }

    const sortableTh = (key: SortKey, label: string, align: 'left' | 'right') => {
        const active = enableColumnSort && sortKey === key
        const clsBase =
            `list-header-cell${active ? ' text-[var(--color-gray-12)]' : ''} ${align === 'right' ? 'text-right' : 'text-left'}`
        if (!enableColumnSort) {
            return (
                <th scope="col" className={clsBase}>
                    {label}
                </th>
            )
        }
        const hint = !active ? '' : sortDir === 'asc' ? ' · A→Z' : ' · Z→A'
        const hintVal = !active ? '' : sortDir === 'asc' ? ' · low→high' : ' · high→low'
        const aria = key === 'name' ? `Sort by name${hint}` : key === 'value' ? `Sort by value${hintVal}` : `Sort by percent${hintVal}`
        return (
            <th scope="col" className={clsBase}>
                <button
                    type="button"
                    className={`inline-flex items-center gap-0.5 border-none bg-transparent p-0 font-inherit ${align === 'right' ? 'ml-auto' : ''} cursor-pointer rounded hover:text-[var(--color-gray-12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)] focus-visible:ring-offset-1`}
                    onClick={() => handleSortClick(key)}
                    aria-label={aria}
                >
                    {label}
                    {active && <span className="tabular-nums opacity-70">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </button>
            </th>
        )
    }

    const detailColLabel = categoryId === 'private-investments' ? 'Manager / Vintage' : 'Location / details'
    const rowClass = onRowClick ? 'cursor-pointer hover:bg-[var(--color-neutral-2)]' : ''

    return (
        <div className="list-view overflow-x-auto">
            <table className="list-table min-w-0">
                <colgroup>
                    <col className="w-8" />
                    <col className="w-12" />
                    <col />
                    <col className="min-w-[5rem]" />
                    <col className="w-[4.5rem] sm:w-24" />
                    <col className="w-14 sm:w-16" />
                </colgroup>
                <thead>
                    <tr className="list-header-row">
                        <th scope="col" className="list-header-cell text-right">#</th>
                        <th scope="col" className="list-header-cell">
                            <span className="sr-only">Preview</span>
                        </th>
                        {sortableTh('name', 'Name', 'left')}
                        <th scope="col" className="list-header-cell">{detailColLabel}</th>
                        {sortableTh('value', 'Value', 'right')}
                        <th
                            scope="col"
                            className={`list-header-cell text-right whitespace-nowrap ${
                                enableColumnSort && sortKey === 'pct'
                                    ? 'text-[var(--color-gray-12)]'
                                    : 'text-[var(--color-neutral-9)]'
                            }`}
                        >
                            {enableColumnSort ? (
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-0.5 border-none bg-transparent p-0 font-inherit ml-auto cursor-pointer rounded hover:text-[var(--color-gray-12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)] focus-visible:ring-offset-1"
                                    onClick={() => handleSortClick('pct')}
                                    aria-label={sortKey === 'pct' ? `Sort by percent · ${sortDir === 'asc' ? 'low to high' : 'high to low'}` : 'Sort by percent'}
                                >
                                    %
                                    {sortKey === 'pct' && <span className="tabular-nums opacity-70">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                </button>
                            ) : (
                                '%'
                            )}
                        </th>
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-b-0">
                    {sortedHoldings.map((h, i) => (
                        <tr
                            key={h.id}
                            onClick={() => onRowClick?.(h.id)}
                            className={`list-row ${rowClass}`}
                        >
                            <td className="list-cell text-right text-xs font-mono text-[var(--color-neutral-8)]">{i + 1}</td>
                            <td className="list-cell">
                                <HoldingThumb holding={h} />
                            </td>
                            <td className="list-cell list-cell--name min-w-0">
                                <div className="font-medium text-[var(--color-black)] truncate text-sm">{h.name}</div>
                                <div className="text-xs text-[var(--color-neutral-10)] mt-0.5 truncate">{h.type} · {h.sector}</div>
                            </td>
                            <td className="list-cell min-w-0 text-xs text-[var(--color-neutral-10)] truncate">
                                {holdingsDetailCell(h, categoryId)}
                            </td>
                            <td className="list-cell text-right tabular-nums font-semibold text-[var(--color-black)] text-sm whitespace-nowrap">
                                {formatValue(h.value)}
                            </td>
                            <td className="list-cell text-right whitespace-nowrap">
                                <span className="text-xs font-medium px-1.5 py-0.5 rounded inline-block tabular-nums bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)]">
                                    {h.portfolioPercentage}%
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
