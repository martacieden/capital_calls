/**
 * CardActionsMenu — Portal-rendered contextual actions dropdown for graph tree
 * and timeline cards. Triggered by three-dots button hover or double-click.
 */

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import {
    IconCheckbox,
    IconPlus,
    IconLink,
    IconPencil,
    IconExternalLink,
    IconFileText,
} from '@tabler/icons-react'
import fojoMascot from '@/assets/fojo-mascot-small.svg'

/* ── Action types ────────────────────────────────────────────────── */

export type CardActionType =
    | 'create-task'
    | 'add-new-asset'
    | 'change-relation'
    | 'edit-fields'
    | 'open-detail'
    | 'edit-distribution'
    | 'view-source'

interface ActionDef {
    type: CardActionType
    label: string
    icon: React.ComponentType<{ size: number; stroke: number; className?: string }>
    isAi: boolean
}

const GRAPH_ACTIONS: ActionDef[] = [
    { type: 'create-task',     label: 'Create new task',        icon: IconCheckbox,     isAi: true },
    { type: 'add-new-asset',   label: 'Create new asset', icon: IconPlus,         isAi: true },
    { type: 'change-relation', label: 'Update relationships',   icon: IconLink,         isAi: true },
    { type: 'edit-fields',     label: 'Edit details',           icon: IconPencil,       isAi: false },
    { type: 'open-detail',     label: 'Open details',           icon: IconExternalLink, isAi: false },
    { type: 'view-source',     label: 'View sources',           icon: IconFileText,     isAi: false },
]

const TIMELINE_ACTIONS: ActionDef[] = [
    { type: 'create-task',       label: 'Create new task', icon: IconCheckbox, isAi: true },
    { type: 'edit-distribution', label: 'Edit details',    icon: IconPencil,   isAi: false },
    { type: 'view-source',       label: 'View sources',    icon: IconFileText, isAi: false },
]

/* ── Props ───────────────────────────────────────────────────────── */

export interface CardActionsMenuProps {
    itemContext: 'graph' | 'timeline'
    /** Card (or other element) to follow in screen space while the menu is open — required for map pan/zoom and timeline scroll. */
    anchorRef: RefObject<HTMLElement | null>
    onClose: () => void
    onAction: (action: CardActionType) => void
}

/* ── Positioning helper ──────────────────────────────────────────── */

function getMenuStyle(anchorRect: DOMRect): React.CSSProperties {
    const MENU_WIDTH = 264
    const MENU_ESTIMATED_HEIGHT = 240
    const GAP = 8

    let left = anchorRect.right + GAP
    let top = anchorRect.top

    // Flip left if overflowing viewport width
    if (left + MENU_WIDTH > window.innerWidth - 8) {
        left = anchorRect.left - MENU_WIDTH - GAP
    }

    // Flip upward if overflowing viewport height
    if (top + MENU_ESTIMATED_HEIGHT > window.innerHeight - 8) {
        top = anchorRect.bottom - MENU_ESTIMATED_HEIGHT
    }

    // Clamp to viewport
    top = Math.max(8, top)
    left = Math.max(8, left)

    return { position: 'fixed', top, left, width: MENU_WIDTH, zIndex: 10000 }
}

/** Keep fixed menu aligned with a live DOM anchor (React Flow viewport, scroll, etc.). */
function useMenuFollowAnchor(anchorRef: RefObject<HTMLElement | null>) {
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>(() => {
        const el = anchorRef.current
        return getMenuStyle(el?.getBoundingClientRect() ?? new DOMRect(0, 0, 1, 1))
    })
    useLayoutEffect(() => {
        let raf = 0
        const tick = () => {
            const el = anchorRef.current
            if (el) {
                const r = el.getBoundingClientRect()
                setMenuStyle(prev => {
                    const next = getMenuStyle(r)
                    if (prev.top === next.top && prev.left === next.left) return prev
                    return next
                })
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [anchorRef])
    return menuStyle
}

/* ── Component ───────────────────────────────────────────────────── */

export function CardActionsMenu({ itemContext, anchorRef, onClose, onAction }: CardActionsMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const actions = itemContext === 'timeline' ? TIMELINE_ACTIONS : GRAPH_ACTIONS
    const menuStyle = useMenuFollowAnchor(anchorRef)

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    return createPortal(
        <>
            {/* Transparent backdrop — catches any click outside the menu, including inside React Flow's canvas which stops event propagation */}
            <div className="fixed inset-0 z-[9999]" onMouseDown={onClose} />
            <div
                ref={menuRef}
                style={menuStyle}
                className="bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-2xl)] shadow-[0_4px_24px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] p-1.5 flex flex-col gap-0 animate-fade-in"
            >
                {actions.map((action) => (
                    <button
                        key={action.type}
                        type="button"
                        className="w-full flex items-center gap-2.5 px-3 py-[8px] text-left text-[13px] text-[var(--color-neutral-12)] bg-transparent border-none cursor-pointer rounded-[var(--radius-sm)] transition-colors duration-100 hover:bg-[var(--color-neutral-3)] active:bg-[var(--color-neutral-4)]"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { onAction(action.type); onClose() }}
                    >
                        <action.icon size={15} stroke={1.8} className="shrink-0 text-[var(--color-neutral-11)]" />
                        <span className="flex-1">{action.label}</span>
                        {action.isAi && (
                            <img src={fojoMascot} alt="" aria-hidden="true" className="shrink-0 w-[16px] h-[16px] rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        </>,
        document.body
    )
}
