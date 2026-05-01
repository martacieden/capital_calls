import { useState } from 'react'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import type { HoldingItem } from '@/data/thornton/valuations-data'
import { CATEGORY_LABELS } from '@/data/thornton/valuations-data'

interface TopHoldingsTableProps {
    items: HoldingItem[]
    topN?: number
    onRowClick?: (id: string) => void
}

function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`
    if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
    return `$${v.toLocaleString()}`
}

const CATEGORY_ICON: Record<string, string> = {
    property: '🏠', investment: '📈', maritime: '⛵', vehicle: '🚗', art: '🎨', insurance: '🛡',
}

const tableColgroup = (
    <colgroup>
        <col className="w-8" />
        <col className="w-10" />
        <col />
        <col className="w-[5.5rem] sm:w-24" />
        <col className="w-[6.5rem] sm:w-32" />
    </colgroup>
)

export function TopHoldingsTable({ items, topN = 10, onRowClick }: TopHoldingsTableProps) {
    const [showAll, setShowAll] = useState(false)
    const top = items.slice(0, topN)
    const rest = items.slice(topN)
    const colSpan = 5

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto -mx-1 px-1">
                <table className="w-full border-collapse text-sm">
                    {tableColgroup}
                    <thead>
                        <tr className="border-b border-[var(--color-neutral-3)]">
                            <th scope="col" className="py-2 pr-2 text-right text-xs font-medium text-[var(--color-neutral-9)]">
                                #
                            </th>
                            <th scope="col" className="py-2 px-1 text-left text-xs font-medium text-[var(--color-neutral-9)]">
                                <span className="sr-only">Preview</span>
                            </th>
                            <th scope="col" className="py-2 pl-1 text-left text-xs font-medium text-[var(--color-neutral-9)]">
                                Name
                            </th>
                            <th scope="col" className="py-2 pl-2 text-right text-xs font-medium text-[var(--color-neutral-9)]">
                                Value
                            </th>
                            <th scope="col" className="py-2 pl-3 text-right text-xs font-medium text-[var(--color-neutral-9)] whitespace-nowrap">
                                %
                            </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-b-0">
                        {top.map((item, i) => (
                            <HoldingRow key={item.id} item={item} rank={i + 1} onClick={onRowClick} />
                        ))}
                        {rest.length > 0 && (
                            <tr className="border-b border-[var(--color-neutral-3)] hover:bg-transparent">
                                <td colSpan={colSpan} className="py-2 px-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowAll(v => !v)}
                                        className="flex items-center gap-1.5 text-xs text-[var(--color-neutral-10)] hover:text-[var(--color-neutral-12)] transition-colors"
                                    >
                                        {showAll ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                                        {showAll ? 'Show less' : `Show ${rest.length} more`}
                                    </button>
                                </td>
                            </tr>
                        )}
                        {showAll &&
                            rest.map((item, i) => (
                                <HoldingRow key={item.id} item={item} rank={topN + i + 1} compact onClick={onRowClick} />
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

interface HoldingRowProps {
    item: HoldingItem
    rank: number
    compact?: boolean
    onClick?: (id: string) => void
}

function HoldingRow({ item, rank, compact, onClick }: HoldingRowProps) {
    const icon = CATEGORY_ICON[item.categoryKey] ?? '💼'
    const label = CATEGORY_LABELS[item.categoryKey] ?? item.categoryKey
    const rowClass = onClick ? 'cursor-pointer hover:bg-[var(--color-neutral-2)]' : ''

    return (
        <tr onClick={() => onClick?.(item.id)} className={`border-b border-[var(--color-neutral-3)] transition-colors ${rowClass}`}>
            <td className="py-2.5 pr-2 align-middle text-right text-xs font-mono text-[var(--color-neutral-8)]">{rank}</td>
            <td className="py-2.5 px-1 align-middle">
                {!compact ? (
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-neutral-3)] overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        ) : (
                            <span className="text-lg" aria-hidden>
                                {icon}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="sr-only">—</span>
                )}
            </td>
            <td className="py-2.5 pl-1 align-middle min-w-0 max-w-[280px]">
                <div className={`font-medium text-[var(--color-black)] truncate ${compact ? 'text-xs' : 'text-sm'}`}>{item.name}</div>
                {!compact && <div className="text-xs text-[var(--color-neutral-10)] mt-0.5 truncate">{label}</div>}
            </td>
            <td className={`py-2.5 pl-2 align-middle text-right tabular-nums font-semibold text-[var(--color-black)] ${compact ? 'text-xs' : 'text-sm'}`}>
                {formatValue(item.value)}
            </td>
            <td className="py-2.5 pl-3 align-middle text-right text-xs text-[var(--color-neutral-9)] tabular-nums whitespace-nowrap">
                {item.portfolioPercent}%
            </td>
        </tr>
    )
}
