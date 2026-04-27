import { IconChevronRight, IconPlus, IconLink } from '@tabler/icons-react'
import { getIcon } from '@/lib/icons'
import { getCategoryByKey, getCategoryOrFallback } from '@/data/categories'
import type { AnyCatalogItem, Relationship } from '@/data/types'

interface RelationshipListProps {
    relationships: Relationship[]
    item: AnyCatalogItem
    getItemById: (id: string) => AnyCatalogItem | null
    onNavigate?: (id: string) => void
    onAddRelationship?: () => void
}

export function RelationshipList({ relationships, item, getItemById, onNavigate, onAddRelationship }: RelationshipListProps) {
    if (relationships.length === 0) {
        return (
            <div className="flex flex-col items-center gap-[var(--spacing-2)] px-[var(--spacing-4)] py-[var(--spacing-6)] text-center">
                <IconLink size={20} stroke={1.5} className="text-[var(--color-neutral-11)]" />
                <p className="text-[13px] text-[var(--color-neutral-11)] m-0">No relationships yet</p>
                <button className="relationships-add-btn" onClick={onAddRelationship}>
                    <IconPlus size={13} stroke={2.5} />
                    Add relationship
                </button>
            </div>
        )
    }

    const grouped = new Map<string, { label: string; items: { rel: Relationship; other: AnyCatalogItem }[] }>()
    for (const rel of relationships) {
        const otherId = rel.from === item.id ? rel.to : rel.from
        const other = getItemById(otherId)
        if (!other) continue
        const cat = getCategoryOrFallback(other.categoryKey)
        if (!grouped.has(cat.key)) grouped.set(cat.key, { label: cat.label, items: [] })
        grouped.get(cat.key)!.items.push({ rel, other })
    }

    return (
        <>
            <div className="flex flex-col gap-[var(--spacing-4)] mt-2">
                {Array.from(grouped.entries()).map(([catKey, group]) => (
                    <div key={catKey}>
                        <div className="text-xs font-[var(--font-weight-medium)] text-[var(--color-neutral-11)] mb-[var(--spacing-1)]">{group.label}</div>
                        <div className="flex flex-col gap-[var(--spacing-2)]">
                            {group.items.map(({ rel, other }, idx) => {
                                const otherCategory = getCategoryByKey(other.categoryKey)
                                const OtherIcon = getIcon(otherCategory?.icon)
                                const displayLabel = rel.type === 'insures' && rel.to === item.id ? 'Insured by' : rel.label
                                const insuranceExpiry = rel.type === 'insures' && rel.to === item.id && other.customFields?.['Expires']
                                    ? String(other.customFields['Expires']) : null
                                return (
                                    <div
                                        key={`${rel.from}-${rel.to}-${idx}`}
                                        className="relationship-card"
                                        onClick={() => onNavigate?.(other.id)}
                                    >
                                        <div className="relationship-icon">
                                            {other.imageUrl ? (
                                                <img src={other.imageUrl} alt={other.name} />
                                            ) : (
                                                <OtherIcon size={20} stroke={1.5} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-[var(--color-neutral-11)]">{displayLabel}</div>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="text-[13px] font-medium text-[var(--color-neutral-12)]">{other.name}</div>
                                                {insuranceExpiry && (
                                                    <span className="shrink-0 text-xs font-medium text-[var(--color-neutral-12)] bg-[var(--color-neutral-4)] px-2 py-0.5 rounded-full whitespace-nowrap">Expires {new Date(insuranceExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                )}
                                            </div>
                                        </div>
                                        <IconChevronRight size={16} color="var(--color-neutral-11)" />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <button className="relationships-add-btn mt-[var(--spacing-3)]" onClick={onAddRelationship}>
                <IconPlus size={13} stroke={2.5} />
                Add relationship
            </button>
        </>
    )
}
