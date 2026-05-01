import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
    IconFilter,
    IconList,
    IconLayoutGrid,
    IconSchema,
    IconX,
    IconPlus,
} from '@tabler/icons-react'
import { getIcon } from '@/lib/icons'
import { catalogCategories } from '@/data/categories'
import type { CatalogView, QuickFilterKey } from '@/data/types'
import { ToolbarButton } from '@/components/atoms/ToolbarButton'
import { ToolbarDropdown, type ToolbarDropdownItem } from '@/components/atoms/ToolbarDropdown'
import { ToolbarSearchInput } from '@/components/atoms/ToolbarSearchInput'

/** Icons available in the "new category" icon picker */
const ICON_PICKER_OPTIONS = [
    'IconBox', 'IconHome', 'IconBuilding', 'IconCar', 'IconShield',
    'IconTrendingUp', 'IconAnchor', 'IconPalette', 'IconHeartHandshake',
    'IconUser', 'IconBriefcase', 'IconCoin', 'IconDiamond', 'IconPlane',
    'IconDeviceLaptop', 'IconMusic', 'IconCamera', 'IconTree',
    'IconMedal', 'IconKey', 'IconWallet', 'IconCrown', 'IconGavel',
    'IconScale', 'IconBuildingBank', 'IconCertificate', 'IconFileText',
    'IconStar', 'IconHeart', 'IconFlame',
]

export interface DropdownItem {
    key: string
    label: string
    icon?: string
}

export interface QuickFilterItem {
    key: string
    label: string
    count?: number
    isAlert?: boolean
}

interface CatalogToolbarProps {
    activeView: CatalogView
    onViewChange: (view: CatalogView) => void
    activeOrgs: string[]
    onOrgsChange: (ids: string[]) => void
    activeCategory: string[]
    onCategoryChange: (keys: string[]) => void
    searchQuery?: string
    onSearchChange?: (query: string) => void
    activeQuickFilters?: Set<QuickFilterKey>
    onQuickFilterChange?: (key: QuickFilterKey) => void
    dropdownItems?: DropdownItem[]
    dropdownLabel?: string
    /** First row in the dropdown clears filters; empty button shows `label · value` (e.g. Type · All). */
    dropdownAllLabel?: string
    viewOptions?: CatalogView[] | null
    quickFilterItems?: QuickFilterItem[]
    primaryAction?: React.ReactNode
    searchPlaceholder?: string
    showDropdownClear?: boolean
    disableQuickFilters?: boolean
    onAddCategory?: (label: string, icon: string) => void
}

const DEFAULT_QUICK_FILTERS: QuickFilterItem[] = [
    { key: 'recently-updated', label: 'Recently updated' },
    { key: 'expiring-soon', label: 'Expiring soon', isAlert: true },
    { key: 'unlinked', label: 'Unlinked' },
    { key: 'missing-insurance', label: 'Uninsured', isAlert: true },
    { key: 'stale-valuation', label: 'Stale valuation', isAlert: true },
    { key: 'missing-documents', label: 'Missing documents', isAlert: true },
]

const VIEW_ICONS: Record<CatalogView, { icon: typeof IconList; title: string }> = {
    list: { icon: IconList, title: 'List view' },
    grid: { icon: IconLayoutGrid, title: 'Grid view' },
    map: { icon: IconSchema, title: 'Map view' },
}

export function CatalogToolbar({
    activeView, onViewChange,
    activeCategory, onCategoryChange,
    searchQuery = '', onSearchChange,
    activeQuickFilters, onQuickFilterChange,
    dropdownItems,
    dropdownLabel = 'Category',
    dropdownAllLabel,
    viewOptions,
    quickFilterItems,
    primaryAction,
    searchPlaceholder = 'Search items…',
    showDropdownClear = true,
    disableQuickFilters = false,
    onAddCategory,
}: CatalogToolbarProps) {
    const [showCreateMenu, setShowCreateMenu] = useState(false)

    const rawItems = dropdownItems ?? catalogCategories.map(c => ({ key: c.key, label: c.label, icon: c.icon }))
    const resolvedViewOptions = viewOptions === undefined ? (['list', 'grid', 'map'] as CatalogView[]) : viewOptions
    const resolvedQuickFilters = quickFilterItems ?? DEFAULT_QUICK_FILTERS

    const ddItems: ToolbarDropdownItem[] = rawItems.map(item => {
        const ItemIcon = getIcon(item.icon)
        return {
            key: item.key,
            label: item.label,
            icon: <ItemIcon size={15} stroke={1.5} color="var(--color-neutral-11)" />,
        }
    })

    return (
        <div className="mt-[var(--spacing-5)]">
            <div className="flex items-center justify-between flex-wrap gap-[var(--spacing-2)] rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-white)] p-[var(--spacing-2)] shadow-[var(--shadow-toolbar)]">
                <div className="flex items-center">
                    <ToolbarDropdown
                        label={dropdownLabel}
                        items={ddItems}
                        selectedKeys={activeCategory}
                        onSelect={onCategoryChange}
                        multiSelect
                        showClear={showDropdownClear}
                        allOptionLabel={dropdownAllLabel}
                        footer={onAddCategory ? (
                            <div className="border-t border-[var(--color-gray-4)] mt-0.5 pt-0.5">
                                <button
                                    className="flex w-full items-center gap-[var(--spacing-2)] rounded-[var(--radius-sm)] px-[var(--spacing-3)] py-1.5 text-left text-[13px] font-[var(--font-weight-medium)] text-[var(--color-accent-9)] transition-[background] duration-[0.12s] hover:bg-[var(--color-neutral-3)]"
                                    onClick={() => setShowCreateMenu(true)}
                                >
                                    <IconPlus size={15} stroke={1.5} />
                                    <span className="flex-1">Add category</span>
                                </button>
                            </div>
                        ) : undefined}
                    />
                    <ToolbarButton label="Filters" icon={<IconFilter size={16} stroke={2} color="var(--color-neutral-11)" />} />
                    <ToolbarSearchInput
                        value={searchQuery}
                        onChange={(q) => onSearchChange?.(q)}
                        placeholder={searchPlaceholder}
                    />
                </div>

                <div className="flex items-center gap-[var(--spacing-1)]">
                    {resolvedViewOptions && resolvedViewOptions.map(view => {
                        const { icon: ViewIcon, title } = VIEW_ICONS[view]
                        return (
                            <button key={view} onClick={() => onViewChange(view)}
                                className={`flex min-h-[32px] w-[32px] items-center justify-center overflow-hidden rounded-[var(--radius-md)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear hover:bg-[var(--color-neutral-3)]${activeView === view ? ' bg-[var(--color-neutral-3)]' : ''}`} title={title}>
                                <ViewIcon size={18} stroke={2} color="var(--color-neutral-11)" />
                            </button>
                        )
                    })}
                    {primaryAction}
                </div>
            </div>

            {resolvedQuickFilters.length > 0 && (
                <div className="mt-[var(--spacing-3)] flex flex-wrap items-start gap-1.5">
                    {[...resolvedQuickFilters].sort((a, b) => {
                        const aAlert = a.isAlert && a.count != null && a.count > 0 ? 1 : 0
                        const bAlert = b.isAlert && b.count != null && b.count > 0 ? 1 : 0
                        return bAlert - aAlert
                    }).map(({ key, label, count, isAlert }) => {
                        const isActive = activeQuickFilters?.has(key as QuickFilterKey)
                        const isAlertActive = isAlert && count != null && count > 0
                        const chipColors = isActive
                            ? 'bg-[var(--color-accent-9)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-10)]'
                            : isAlertActive
                                ? 'bg-[var(--color-orange-1)] text-[var(--color-orange-9)] hover:bg-[var(--color-orange-hover)]'
                                : 'bg-[var(--color-neutral-3)] text-[var(--color-gray-12)] hover:bg-[var(--color-blue-3)]'

                        return disableQuickFilters ? (
                            <span
                                key={key}
                                className={`flex items-center justify-center rounded-[var(--radius-sm)] min-h-[28px] px-[var(--spacing-2)] py-[var(--spacing-1)] text-[13px] font-[var(--font-weight-medium)] leading-[1.54] ${chipColors}`}
                            >
                                {label}{count != null && <span className="ml-1 opacity-50">&middot;</span>}{count != null && <span className="ml-1">{count}</span>}
                            </span>
                        ) : (
                            <button
                                key={key}
                                className={`flex items-center justify-center rounded-[var(--radius-sm)] min-h-[28px] px-[var(--spacing-2)] py-[var(--spacing-1)] text-[13px] font-[var(--font-weight-medium)] leading-[1.54] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear ${chipColors}`}
                                onClick={() => onQuickFilterChange?.(key as QuickFilterKey)}
                            >
                                {label}{count != null && <span className="ml-1 opacity-50">&middot;</span>}{count != null && <span className="ml-1">{count}</span>}{isActive && <IconX size={14} className="ml-1 opacity-70" />}
                            </button>
                        )
                    })}
                </div>
            )}
            {showCreateMenu && onAddCategory && (
                <CreateCategoryMenu
                    onSubmit={(label, icon) => {
                        onAddCategory(label, icon)
                        setShowCreateMenu(false)
                    }}
                    onClose={() => setShowCreateMenu(false)}
                />
            )}
        </div>
    )
}

/* ── Create Category Menu (portal) ──────────────────────────────── */

function CreateCategoryMenu({
    onSubmit,
    onClose,
}: {
    onSubmit: (label: string, icon: string) => void
    onClose: () => void
}) {
    const [name, setName] = useState('')
    const [selectedIcon, setSelectedIcon] = useState('IconBox')
    const nameInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setTimeout(() => nameInputRef.current?.focus(), 80)
    }, [])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    const handleSubmit = () => {
        const trimmed = name.trim()
        if (!trimmed) return
        onSubmit(trimmed, selectedIcon)
    }

    return createPortal(
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-[4px] z-[3000]" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-[var(--color-white)] rounded-[10px] shadow-[0_24px_64px_rgba(0,0,0,0.15)] z-[3001] p-[var(--spacing-6)]">
                <h3 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-gray-12)] mb-[var(--spacing-2)]">New category</h3>
                <p className="text-sm text-[var(--color-neutral-11)] leading-[1.5] mb-[var(--spacing-6)]">Add a custom category to organize your assets.</p>

                <div className="flex flex-col gap-[var(--spacing-4)] mb-[var(--spacing-6)]">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-xs text-[var(--color-neutral-11)] font-[var(--font-weight-medium)]">Name</label>
                        <input
                            ref={nameInputRef}
                            className="w-full px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-md)] font-sans text-sm text-[var(--color-gray-12)] bg-white outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-accent-9)] focus:shadow-[0_0_0_3px_rgba(0,91,226,0.15)] placeholder:text-[var(--color-neutral-11)]"
                            type="text"
                            placeholder="e.g. Digital Assets, Jewelry…"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                        />
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <label className="text-xs text-[var(--color-neutral-11)] font-[var(--font-weight-medium)]">Icon</label>
                        <div className="grid grid-cols-6 gap-1">
                            {ICON_PICKER_OPTIONS.map(iconName => {
                                const Icon = getIcon(iconName)
                                const isActive = selectedIcon === iconName
                                return (
                                    <button
                                        key={iconName}
                                        className={`flex h-9 w-full items-center justify-center rounded-[var(--radius-md)] transition-[background] duration-100${isActive ? ' bg-[var(--color-accent-9)] text-white' : ' hover:bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)]'}`}
                                        onClick={() => setSelectedIcon(iconName)}
                                        title={iconName.replace('Icon', '')}
                                    >
                                        <Icon size={18} stroke={1.5} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex gap-[var(--spacing-3)] justify-end">
                    <button
                        className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] border border-[var(--color-gray-4)] transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-[var(--font-weight-semibold)] text-white bg-[var(--color-accent-9)] transition-[opacity] duration-150 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!name.trim()}
                        onClick={handleSubmit}
                    >
                        Create
                    </button>
                </div>
            </div>
        </>,
        document.body
    )
}
