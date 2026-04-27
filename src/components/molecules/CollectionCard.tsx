import { useState, useRef } from 'react'
import * as Icons from '@tabler/icons-react'
import { IconDots, IconPencil, IconShare, IconCopy, IconTrash } from '@tabler/icons-react'
import { getIcon } from '@/lib/icons'
import { PriorityBadge, ALERT_TYPES } from '@/components/atoms/PriorityBadge'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import type { PriorityStatus } from '@/data/types'

function DocuSignLogo({ size = 22 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 1547 1549" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4c00ff" d="m1113.4 1114.9v395.6c0 20.8-16.7 37.6-37.5 37.6h-1038.4c-20.7 0-37.5-16.8-37.5-37.6v-1039c0-20.7 16.8-37.5 37.5-37.5h394.3v643.4c0 20.7 16.8 37.5 37.5 37.5z"/>
            <path fill="#ff5252" d="m1546 557.1c0 332.4-193.9 557-432.6 557.8v-418.8c0-12-4.8-24-13.5-31.9l-217.1-217.4c-8.8-8.8-20-13.6-32-13.6h-418.2v-394.8c0-20.8 16.8-37.6 37.5-37.6h585.1c277.7-0.8 490.8 223 490.8 556.3z"/>
            <path fill="#000000" d="m1099.9 663.4c8.7 8.7 13.5 19.9 13.5 31.9v418.8h-643.3c-20.7 0-37.5-16.8-37.5-37.5v-643.4h418.2c12 0 24 4.8 32 13.6z"/>
        </svg>
    )
}

interface CollectionCardProps {
    label: string
    icon: string
    count: number
    countLabel?: string
    description?: string
    priorityStatus?: PriorityStatus
    onClick: () => void
}

const COLLECTION_MENU_ITEMS = [
    { label: 'Edit collection', icon: IconPencil },
    { label: 'Share collection', icon: IconShare },
    { label: 'Duplicate', icon: IconCopy },
    { label: 'Delete', icon: IconTrash, danger: true },
]

export function CollectionCard({ label, icon, count, countLabel, description, priorityStatus, onClick }: CollectionCardProps) {
    const isDocuSign = icon === 'DocuSign'
    const isTablerIcon = icon.startsWith('Icon')
    const CatIcon = isTablerIcon ? getIcon(icon, Icons.IconFolder) : null
    const unit = countLabel ?? (count === 1 ? 'item' : 'items')
    const [menuOpen, setMenuOpen] = useState(false)
    const menuBtnRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    useClickOutside([menuRef, menuBtnRef], () => setMenuOpen(false), menuOpen)

    return (
        <div className={`card group flex flex-col gap-[var(--spacing-3)] p-[var(--spacing-5)] ${menuOpen ? 'card--menu-open' : ''}`} onClick={onClick}>
            <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-neutral-3)] flex items-center justify-center text-[var(--color-neutral-11)]">
                    {isDocuSign ? (
                        <DocuSignLogo size={22} />
                    ) : CatIcon ? (
                        <CatIcon size={22} stroke={1.5} />
                    ) : (
                        <span className="text-[22px] leading-none">{icon}</span>
                    )}
                </div>
                <div className="relative">
                    <button
                        ref={menuBtnRef}
                        className="card__menu-btn flex justify-center items-center aspect-square rounded-[var(--radius-sm)] min-h-7 w-7 overflow-hidden shrink-0 transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]"
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
                    >
                        <IconDots size={16} stroke={2} color="var(--color-neutral-11)" />
                    </button>
                    {menuOpen && (
                        <div
                            ref={menuRef}
                            className="absolute right-0 top-[calc(100%+4px)] z-50 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-white p-1 shadow-[var(--shadow-dropdown)] animate-fade-in"
                        >
                            {COLLECTION_MENU_ITEMS.map(item => (
                                <button
                                    key={item.label}
                                    className={`w-full flex items-center gap-2.5 px-3 py-[7px] text-left text-[13px] bg-transparent border-none cursor-pointer rounded-[var(--radius-sm)] transition-colors duration-100 hover:bg-[var(--color-neutral-3)] ${item.danger ? 'text-[var(--color-red-9)]' : 'text-[var(--color-neutral-12)]'}`}
                                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}
                                >
                                    <item.icon size={15} stroke={1.5} className="shrink-0" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-[var(--spacing-2)]">
                <span className="text-[15px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)]">{label}</span>
            </div>
            {description && (
                <p className="text-[13px] text-[var(--color-neutral-11)] leading-[1.5] m-0 line-clamp-2">{description}</p>
            )}
            <span className="text-[13px] text-[var(--color-neutral-11)]">{count} {unit}</span>
            {priorityStatus && ALERT_TYPES.has(priorityStatus.type) && (
                <div className="absolute bottom-[22px] right-5">
                    <PriorityBadge status={priorityStatus} compact />
                </div>
            )}
        </div>
    )
}
