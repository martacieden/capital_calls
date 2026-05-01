import { useState, useRef, type ReactNode } from 'react'
import { IconChevronDown, IconCheck, IconTrash } from '@tabler/icons-react'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { ToolbarButton } from './ToolbarButton'

export interface ToolbarDropdownItem {
    key: string
    label: string
    icon?: ReactNode
}

interface ToolbarDropdownProps {
    label: string
    items: ToolbarDropdownItem[]
    selectedKeys: string[]
    onSelect: (keys: string[]) => void
    /** Single-select closes dropdown on pick. Multi-select toggles. */
    multiSelect?: boolean
    /** Show "Clear selection" when items are selected */
    showClear?: boolean
    /** First row: clears selection (e.g. "All" types). Button shows `label · allOptionLabel` when nothing is selected. */
    allOptionLabel?: string
    /** Extra content at the bottom of the dropdown (e.g., "Add category" button) */
    footer?: ReactNode
}

export function ToolbarDropdown({ label, items, selectedKeys, onSelect, multiSelect = false, showClear = false, allOptionLabel, footer }: ToolbarDropdownProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    useClickOutside(ref, () => setOpen(false), open)

    const buttonLabel = () => {
        if (selectedKeys.length === 0) {
            return allOptionLabel ? `${label} · ${allOptionLabel}` : label
        }
        if (selectedKeys.length === 1) return items.find(i => i.key === selectedKeys[0])?.label ?? label
        return `${selectedKeys.length} selected`
    }

    const handleItemClick = (key: string) => {
        if (multiSelect) {
            onSelect(selectedKeys.includes(key) ? selectedKeys.filter(k => k !== key) : [...selectedKeys, key])
        } else {
            onSelect([key])
            setOpen(false)
        }
    }

    return (
        <div className="relative" ref={ref}>
            <ToolbarButton
                label={buttonLabel()}
                isActive={open}
                onClick={() => setOpen(v => !v)}
                icon={
                    <IconChevronDown size={16} stroke={2} color="var(--color-neutral-11)"
                        style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                }
                className="flex-row-reverse"
            />
            {open && (
                <div className="absolute top-[calc(100%+4px)] left-0 z-[100] flex min-w-[180px] flex-col gap-0.5 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-white)] p-1 shadow-[var(--shadow-dropdown)]">
                    {allOptionLabel && (
                        <button
                            type="button"
                            className={`flex w-full items-center gap-[var(--spacing-2)] rounded-[var(--radius-sm)] px-[var(--spacing-3)] py-1.5 text-left text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] transition-[background] duration-[0.12s] hover:bg-[var(--color-neutral-3)]${selectedKeys.length === 0 ? ' bg-[var(--color-blue-3,#eff6ff)]' : ''} border-b border-[var(--color-gray-4)] mb-0.5`}
                            onClick={() => {
                                onSelect([])
                                if (!multiSelect) setOpen(false)
                            }}
                        >
                            <span className={`flex-1${selectedKeys.length === 0 ? ' text-[var(--color-blue)]' : ''}`}>{allOptionLabel}</span>
                            {selectedKeys.length === 0 && <IconCheck size={14} stroke={2.5} color="var(--color-blue)" />}
                        </button>
                    )}
                    {showClear && selectedKeys.length > 0 && !allOptionLabel && (
                        <button
                            className="flex w-full items-center justify-between gap-[var(--spacing-2)] rounded-[var(--radius-sm)] px-[var(--spacing-3)] py-1.5 text-left text-[13px] font-[var(--font-weight-medium)] text-[var(--color-red-9)] transition-[background] duration-[0.12s] border-b border-[var(--color-gray-4)] mb-0.5 hover:bg-[var(--color-red-1)] hover:text-[var(--color-red-dark)]"
                            onClick={() => onSelect([])}
                        >
                            <IconTrash size={14} stroke={2} />
                            <span className="flex-1">Clear selection</span>
                        </button>
                    )}
                    {items.map(item => {
                        const isSelected = selectedKeys.includes(item.key)
                        return (
                            <button
                                key={item.key}
                                className={`flex w-full items-center gap-[var(--spacing-2)] rounded-[var(--radius-sm)] px-[var(--spacing-3)] py-1.5 text-left text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] transition-[background] duration-[0.12s] hover:bg-[var(--color-neutral-3)]${isSelected ? ' bg-[var(--color-blue-3,#eff6ff)]' : ''}`}
                                onClick={() => handleItemClick(item.key)}
                            >
                                {item.icon}
                                <span className={`flex-1${isSelected ? ' text-[var(--color-blue)]' : ''}`}>{item.label}</span>
                                {isSelected && <IconCheck size={14} stroke={2.5} color="var(--color-blue)" />}
                            </button>
                        )
                    })}
                    {footer}
                </div>
            )}
        </div>
    )
}
