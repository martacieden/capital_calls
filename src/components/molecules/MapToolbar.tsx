import { IconFilter } from '@tabler/icons-react'
import { getIcon } from '@/lib/icons'
import { catalogCategories } from '@/data/categories'
import { ToolbarButton } from '@/components/atoms/ToolbarButton'
import { ToolbarDropdown, type ToolbarDropdownItem } from '@/components/atoms/ToolbarDropdown'
import { ToolbarSearchInput } from '@/components/atoms/ToolbarSearchInput'

interface MapToolbarProps {
    activeCategory: string[]
    onCategoryChange: (keys: string[]) => void
    searchQuery: string
    onSearchChange: (query: string) => void
}

export function MapToolbar({
    activeCategory, onCategoryChange,
    searchQuery, onSearchChange,
}: MapToolbarProps) {
    const dropdownItems: ToolbarDropdownItem[] = catalogCategories.map(cat => {
        const CatIcon = getIcon(cat.icon)
        return {
            key: cat.key,
            label: cat.label,
            icon: <CatIcon size={15} stroke={1.5} color="var(--color-neutral-11)" />,
        }
    })

    return (
        <div className="map-toolbar absolute top-3 left-3 z-10 flex items-center gap-[var(--spacing-1)] bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-md)] px-1.5 py-1 shadow-[var(--shadow-subtle)]">
            <ToolbarDropdown
                label="Category"
                items={dropdownItems}
                selectedKeys={activeCategory}
                onSelect={onCategoryChange}
                multiSelect
                showClear
            />
            <ToolbarButton label="Filters" icon={<IconFilter size={16} stroke={2} color="var(--color-neutral-11)" />} />
            <ToolbarSearchInput value={searchQuery} onChange={onSearchChange} />
        </div>
    )
}
