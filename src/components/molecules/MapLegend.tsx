import { useState, useMemo } from 'react'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { catalogCategories } from '@/data/categories'
import type { AnyCatalogItem } from '@/data/types'

interface MapLegendProps {
    items: AnyCatalogItem[]
}

export function MapLegend({ items }: MapLegendProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Derive node types from actual data
    const nodeTypes = useMemo(() => {
        const keysInGraph = new Set(items.map(i => i.categoryKey))
        return catalogCategories
            .filter(cat => keysInGraph.has(cat.key))
            .map(cat => ({
                label: cat.label,
                color: cat.color,
                shape: cat.key === 'person' ? 'circle' as const : 'rect' as const,
            }))
    }, [items])

    return (
        <div className="w-[220px] bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-lg shadow-[var(--shadow-subtle)] overflow-hidden">
            <button
                className="flex items-center justify-between w-full px-2.5 py-1.5 text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] bg-[var(--color-white)] border-none transition-colors duration-[120ms] hover:bg-[var(--color-neutral-3)]"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <span>Legend</span>
                {isOpen
                    ? <IconChevronDown size={14} stroke={1.5} />
                    : <IconChevronUp size={14} stroke={1.5} />}
            </button>

            {isOpen && (
                <div className="px-2.5 pt-1 pb-2">
                    <div className="flex flex-col gap-1">
                        {nodeTypes.map(nt => (
                            <div key={nt.label} className="flex items-center gap-2">
                                <span
                                    className={`shrink-0 w-3 h-3 ${nt.shape === 'circle' ? 'rounded-full' : 'rounded-[4px]'}`}
                                    style={{ background: nt.color }}
                                />
                                <span className="text-[13px] text-[var(--color-neutral-11)] whitespace-nowrap">{nt.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
