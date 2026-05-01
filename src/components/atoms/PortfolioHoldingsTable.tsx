import { IconPhoto } from '@tabler/icons-react'
import type { PortfolioHolding } from '@/data/thornton/portfolio-data'

interface PortfolioHoldingsTableProps {
    holdings: PortfolioHolding[]
    categoryId?: string
    onRowClick?: (id: string) => void
}

function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
    return `$${v.toLocaleString()}`
}

function holdingsDetailCell(h: PortfolioHolding, categoryId?: string): string {
    if (categoryId === 'private-investments') {
        const parts = [h.manager, h.vintage ? `Vintage ${h.vintage}` : null].filter(Boolean)
        return parts.join(' · ') || '—'
    }
    return (h.location ?? h.manager ?? h.vintage ?? '—').trim()
}

export function PortfolioHoldingsTable({
    holdings,
    categoryId,
    onRowClick,
}: PortfolioHoldingsTableProps) {
    const detailColLabel = categoryId === 'private-investments' ? 'Manager / Vintage' : 'Location / details'
    const rowClass = onRowClick ? 'cursor-pointer hover:bg-[var(--color-neutral-2)]' : ''

    return (
        <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full border-collapse text-sm min-w-[560px]">
                <colgroup>
                    <col className="w-8" />
                    <col className="w-12" />
                    <col />
                    <col className="min-w-[8rem]" />
                    <col className="w-[6.5rem] sm:w-32" />
                    <col className="w-[4.5rem] sm:w-20" />
                </colgroup>
                <thead>
                    <tr className="border-b border-[var(--color-neutral-3)]">
                        <th scope="col" className="py-2 pr-2 text-right text-xs font-medium text-[var(--color-neutral-9)]">#</th>
                        <th scope="col" className="py-2 px-1 text-left text-xs font-medium text-[var(--color-neutral-9)]">
                            <span className="sr-only">Preview</span>
                        </th>
                        <th scope="col" className="py-2 pl-1 text-left text-xs font-medium text-[var(--color-neutral-9)]">Name</th>
                        <th scope="col" className="py-2 pl-3 text-left text-xs font-medium text-[var(--color-neutral-9)]">{detailColLabel}</th>
                        <th scope="col" className="py-2 pl-2 text-right text-xs font-medium text-[var(--color-neutral-9)]">Value</th>
                        <th scope="col" className="py-2 pl-3 text-right text-xs font-medium text-[var(--color-neutral-9)] whitespace-nowrap">%</th>
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-b-0">
                    {holdings.map((h, i) => (
                        <tr
                            key={h.id}
                            onClick={() => onRowClick?.(h.id)}
                            className={`border-b border-[var(--color-neutral-3)] transition-colors ${rowClass}`}
                        >
                            <td className="py-2.5 pr-2 align-middle text-right text-xs font-mono text-[var(--color-neutral-8)]">{i + 1}</td>
                            <td className="py-2.5 px-1 align-middle">
                                <div
                                    className="w-10 h-10 rounded-lg bg-[var(--color-neutral-3)] shrink-0 flex items-center justify-center text-[var(--color-neutral-8)] border border-[var(--color-neutral-4)]"
                                    aria-hidden
                                >
                                    <IconPhoto size={18} stroke={1.25} />
                                </div>
                            </td>
                            <td className="py-2.5 pl-1 align-middle min-w-0 max-w-[320px]">
                                <div className="font-medium text-[var(--color-black)] truncate text-sm">{h.name}</div>
                                <div className="text-xs text-[var(--color-neutral-10)] mt-0.5 truncate">{h.type}</div>
                            </td>
                            <td className="py-2.5 pl-3 align-middle min-w-0 text-xs text-[var(--color-neutral-10)] truncate max-w-[280px]">
                                {holdingsDetailCell(h, categoryId)}
                            </td>
                            <td className="py-2.5 pl-2 align-middle text-right tabular-nums font-semibold text-[var(--color-black)] text-sm">
                                {formatValue(h.value)}
                            </td>
                            <td className="py-2.5 pl-3 align-middle text-right whitespace-nowrap">
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
