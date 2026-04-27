import type { AnyCatalogItem } from '@/data/types'
import { getIcon } from '@/lib/icons'
import { getCategoryByKey } from '@/data/categories'
import { organizations } from '@/data/organizations'

interface ChatRecordCardProps {
    item: AnyCatalogItem
    icon?: string
    meta?: string
    detail?: string
    detailColor?: string
    onClick?: () => void
}

export function ChatRecordCard({ item, icon, meta, detail, detailColor, onClick }: ChatRecordCardProps) {
    const category = getCategoryByKey(item.categoryKey)
    const categoryLabel = category?.label ?? ''
    const resolvedIcon = icon || (category?.icon)
    const IconComponent = getIcon(resolvedIcon)
    const familyLabel = organizations.find(o => o.id === item.organizationId)?.name ?? ''

    return (
        <div className="flex items-center gap-3 py-[10px] px-3 w-full border border-[var(--color-neutral-4)] rounded-[var(--radius-lg)] bg-[var(--color-white)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-accent-hover)]" onClick={onClick}>
            <div className="shrink-0 w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent-3)] flex items-center justify-center">
                <IconComponent size={20} stroke={1.5} color="var(--color-accent-9)" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[var(--color-neutral-12)] leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
                <div className="text-xs text-[var(--color-neutral-11)] leading-[1.3] mt-0.5">
                    {meta ?? (`${familyLabel && `${familyLabel} · `}${categoryLabel}`)}
                    {detail && <span style={{ color: detailColor, marginLeft: 4 }}>· {detail}</span>}
                </div>
            </div>
        </div>
    )
}
