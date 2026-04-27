import { IconCalendarEvent } from '@tabler/icons-react'
import { ToolbarDropdown, type ToolbarDropdownItem } from '@/components/atoms/ToolbarDropdown'
import { ToolbarSearchInput } from '@/components/atoms/ToolbarSearchInput'
import type { DropdownItem } from '@/components/organisms/CatalogToolbar'

export function TimelineToolbar({ activeTrust, onTrustChange, trustItems, searchQuery, onSearchChange }: {
    activeTrust: string[]
    onTrustChange: (keys: string[]) => void
    trustItems: DropdownItem[]
    searchQuery: string
    onSearchChange: (q: string) => void
}) {
    const activeLabel = activeTrust.length === 1
        ? trustItems.find(t => t.key === activeTrust[0])?.label ?? 'Trust'
        : 'Trust'

    const dropdownItems: ToolbarDropdownItem[] = trustItems.map(t => ({
        key: t.key,
        label: t.label,
        icon: <IconCalendarEvent size={15} stroke={1.5} color="var(--color-neutral-11)" />,
    }))

    return (
        <div className="map-toolbar absolute top-3 left-3 z-10 flex items-center gap-[var(--spacing-1)] bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-md)] px-1.5 py-1 shadow-[var(--shadow-subtle)]">
            <ToolbarDropdown
                label={activeLabel}
                items={dropdownItems}
                selectedKeys={activeTrust}
                onSelect={onTrustChange}
            />
            <ToolbarSearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search distributions…"
            />
        </div>
    )
}
