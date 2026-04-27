/**
 * FtvItemNode — Custom ReactFlow node for family tree view item cards.
 * Also exports FtvGroupNodeComponent for trust group overlays.
 */

import { createElement, useState, useRef, useCallback, useLayoutEffect, useContext } from 'react'
import { GraphPromptAnchorRegistryContext } from '@/lib/contexts/prompt-anchor-registry'
import { cn } from '@/lib/utils'
import {
    Handle,
    Position,
    type Node,
    type NodeProps,
} from '@xyflow/react'
import { IconFileText, IconDots } from '@tabler/icons-react'
import * as TablerIcons from '@tabler/icons-react'
import { catalogCategories } from '@/data/categories'
import { getSourceDocsForItem } from '@/data/citations'
import type { AnyCatalogItem, Person, Trust, BusinessEntity, Asset } from '@/data/types'
import { CardActionsMenu, type CardActionType } from '@/components/molecules/CardActionsMenu'
import { snapshotPromptAnchor, type PromptAnchorRect } from '@/lib/helpers/prompt-anchor'

/* ── Category color map ──────────────────────────────────────────── */

export const colorMap: Record<string, string> = {}
catalogCategories.forEach(cat => { colorMap[cat.key] = cat.color })

/* ── Category icon map ───────────────────────────────────────────── */

export const categoryIconMap: Record<string, string> = {}
catalogCategories.forEach(cat => { categoryIconMap[cat.key] = cat.icon })

export function getCategoryIcon(categoryKey: string) {
    const iconName = categoryIconMap[categoryKey]
    if (!iconName) return null
    const Icon = (TablerIcons as Record<string, unknown>)[iconName] as React.ComponentType<{ size: number; stroke: number }> | undefined
    if (!Icon) return null
    return createElement(Icon, { size: 16, stroke: 1.5 })
}

/* ── Custom node data ────────────────────────────────────────────── */

export interface FtvNodeData extends Record<string, unknown> {
    item: AnyCatalogItem
    isHighlighted: boolean
    isDimmed: boolean
    isPlaceholder?: boolean
    /** Keep the three-dots control visible (e.g. while ActionPromptDropdown is open for this node). */
    pinActionsButtonVisible?: boolean
    onClick: (item: AnyCatalogItem) => void
    onAction: (item: AnyCatalogItem, action: CardActionType, anchor?: PromptAnchorRect | null) => void
    topHandles: Array<{ id: string; leftPct: number }>
    bottomHandles: Array<{ id: string; leftPct: number; type: 'source' | 'target' }>
}

export type FtvNode = Node<FtvNodeData>

/* ── Helpers for enriched node cards ─────────────────────────────── */

export function getSubtitle(item: AnyCatalogItem): string {
    switch (item.categoryKey) {
        case 'person': {
            const p = item as Person
            const parts: string[] = []
            if (p.age) parts.push(`Age ${p.age}`)
            if (p.roles && p.roles.length > 0) parts.push(p.roles.join(', '))
            return parts.join(' · ')
        }
        case 'trust': {
            const t = item as Trust
            return [t.trustType, t.status].filter(Boolean).join(' · ')
        }
        case 'entity': {
            const e = item as BusinessEntity
            return [e.entityType, e.stateOfFormation].filter(Boolean).join(' · ')
        }
        case 'property':
        case 'investment':
        case 'maritime':
        case 'vehicle':
        case 'insurance':
        case 'art': {
            const a = item as Asset
            const parts: string[] = []
            if (a.assetType) parts.push(a.assetType)
            if (a.value != null) {
                const fmt = a.value >= 1_000_000
                    ? `$${(a.value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
                    : a.value >= 1_000
                        ? `$${(a.value / 1_000).toFixed(0)}K`
                        : `$${a.value.toLocaleString()}`
                parts.push(fmt)
            }
            return parts.join(' · ')
        }
        default:
            return ''
    }
}

export function getSourceDocs(item: AnyCatalogItem): string[] {
    const fromCitations = getSourceDocsForItem(item.id)
    if (fromCitations.length > 0) return fromCitations

    switch (item.categoryKey) {
        case 'person':
        case 'trust':
        case 'entity':
            return ['family-trust-agreement.pdf']
        case 'insurance':
            return ['insurance-policies.pdf']
        case 'property':
        case 'investment':
        case 'maritime':
        case 'vehicle':
        case 'art':
            return ['inventory-list-2026.pdf']
        default:
            return ['family-trust-agreement.pdf']
    }
}

/* ── Custom node component ───────────────────────────────────────── */

export function FtvItemNode({ data }: NodeProps<FtvNode>) {
    const { item, isHighlighted, isDimmed, isPlaceholder, pinActionsButtonVisible, onClick, onAction, topHandles, bottomHandles } = data
    const accent = colorMap[item.categoryKey as string] ?? '#6B7280'
    const isPerson = item.categoryKey === 'person'
    const initials = item.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    const subtitle = getSubtitle(item)
    const sourceDocs = getSourceDocs(item)
    const primaryDoc = sourceDocs[0] ?? 'family-trust-agreement.pdf'
    const extraCount = sourceDocs.length - 1

    const [actionsMenuOpen, setActionsMenuOpen] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const actionsBtnRef = useRef<HTMLButtonElement>(null)
    const graphAnchorRegistry = useContext(GraphPromptAnchorRegistryContext)

    const getPromptAnchorEl = useCallback(() => actionsBtnRef.current ?? cardRef.current, [])

    useLayoutEffect(() => {
        if (isPlaceholder || !graphAnchorRegistry) return
        graphAnchorRegistry.register(item.id, getPromptAnchorEl)
        return () => graphAnchorRegistry.unregister(item.id)
    }, [isPlaceholder, graphAnchorRegistry, item.id, getPromptAnchorEl])

    const openMenu = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setActionsMenuOpen(true)
    }, [])

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setActionsMenuOpen(true)
    }, [])

    const showActionsPin = actionsMenuOpen || pinActionsButtonVisible

    // Placeholder skeleton card rendered while AI is creating a new asset
    if (isPlaceholder) {
        return (
            <>
                {topHandles.map(h => (
                    <Handle key={h.id} type="target" position={Position.Top} id={h.id} className="ftv-handle" style={{ left: `${h.leftPct}%` }} />
                ))}
                <div className="bg-[var(--color-neutral-2)] border-[1.5px] border-dashed border-[var(--color-neutral-6)] rounded-[var(--radius-md)] px-3 py-[10px] w-[360px] flex flex-col gap-1.5 select-none animate-pulse">
                    <div className="flex items-start gap-2">
                        <div className="w-9 h-9 rounded-[var(--radius-sm)] shrink-0 bg-[var(--color-neutral-4)]" />
                        <div className="flex-1 min-w-0 flex flex-col gap-1 pt-1">
                            <div className="h-3 w-3/4 rounded bg-[var(--color-neutral-4)]" />
                            <div className="h-2.5 w-1/2 rounded bg-[var(--color-neutral-3)]" />
                        </div>
                    </div>
                    <div className="h-2 w-full rounded bg-[var(--color-neutral-3)]" />
                    <div className="h-2 w-4/5 rounded bg-[var(--color-neutral-3)]" />
                    <div className="h-px bg-[var(--color-neutral-4)] my-[2px]" />
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded bg-[var(--color-neutral-4)]" />
                        <div className="h-2.5 w-2/3 rounded bg-[var(--color-neutral-3)]" />
                    </div>
                </div>
                {bottomHandles.map(h => (
                    <Handle key={h.id} type={h.type} position={Position.Bottom} id={h.id} className="ftv-handle" style={{ left: `${h.leftPct}%` }} />
                ))}
            </>
        )
    }

    return (
        <>
            {topHandles.map(h => (
                <Handle
                    key={h.id}
                    type="target"
                    position={Position.Top}
                    id={h.id}
                    className="ftv-handle"
                    style={{ left: `${h.leftPct}%` }}
                />
            ))}
            <div
                ref={cardRef}
                className={cn(
                    'group bg-[var(--color-white)] border-[1.5px] border-[var(--color-neutral-5)] rounded-[var(--radius-lg)] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] px-3 py-[10px] w-[360px] cursor-pointer flex flex-col gap-1.5 [transition:box-shadow_0.2s,transform_0.15s,border-color_0.15s,opacity_0.15s] select-none relative hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-px',
                    isHighlighted && 'shadow-[0_4px_14px_rgba(0,0,0,0.11)]',
                    isDimmed && 'opacity-25',
                )}
                style={isHighlighted ? { borderColor: accent } : undefined}
                onClick={(e) => { if (e.detail < 2) onClick(item) }}
                onDoubleClick={handleDoubleClick}
            >
                {/* Three-dots action button — visible only on hover */}
                <button
                    ref={actionsBtnRef}
                    className={cn(
                        'absolute top-[7px] right-[7px] z-10 flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border-none bg-transparent p-0 transition-opacity duration-100 hover:bg-[var(--color-neutral-3)] cursor-pointer',
                        showActionsPin ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}
                    onClick={openMenu}
                    title="Actions"
                    aria-label="Card actions"
                >
                    <IconDots size={16} stroke={2} color="var(--color-neutral-11)" />
                </button>

                {/* Header: thumbnail + name + subtitle */}
                <div className="flex items-start gap-2">
                    {item.imageUrl ? (
                        <img className="w-9 h-9 rounded-[var(--radius-sm)] shrink-0 object-cover" src={item.imageUrl} alt={item.name} />
                    ) : (
                        <div
                            className="w-9 h-9 rounded-[var(--radius-sm)] shrink-0 flex items-center justify-center text-xs font-[var(--font-weight-bold)]"
                            style={{ background: `${accent}22`, color: accent }}
                        >
                            {isPerson ? initials : getCategoryIcon(item.categoryKey as string)}
                        </div>
                    )}
                    <div className="flex-1 min-w-0 pr-5">
                        <div className="text-xs font-[var(--font-weight-semibold)] text-[var(--color-neutral-12)] leading-[1.3] line-clamp-1">{item.name}</div>
                        {subtitle && <div className="text-xs text-[var(--color-neutral-11)] leading-[1.3] mt-px line-clamp-1">{subtitle}</div>}
                    </div>
                </div>
                {/* Description */}
                {item.description && (
                    <div className="text-xs text-[var(--color-neutral-11)] leading-[1.4] line-clamp-2">{item.description}</div>
                )}
                {/* Divider + source doc */}
                <div className="h-px bg-[var(--color-neutral-4)] my-[2px]" />
                <div className="flex items-center gap-1 text-xs text-[var(--color-neutral-11)] leading-[1.3]">
                    <IconFileText size={12} stroke={1.5} />
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">{primaryDoc}</span>
                    {extraCount > 0 && (
                        <span className="shrink-0 text-xs font-[var(--font-weight-bold)] text-[var(--color-neutral-11)] bg-[var(--color-neutral-3)] rounded-[var(--radius-sm)] px-1 leading-[1.5] !overflow-visible">+{extraCount}</span>
                    )}
                </div>
            </div>

            {actionsMenuOpen && (
                <CardActionsMenu
                    itemContext="graph"
                    anchorRef={cardRef}
                    onClose={() => setActionsMenuOpen(false)}
                    onAction={(action) => {
                        const el = actionsBtnRef.current ?? cardRef.current
                        const anchor = el ? snapshotPromptAnchor(el.getBoundingClientRect()) : null
                        onAction(item, action, anchor)
                        setActionsMenuOpen(false)
                    }}
                />
            )}

            {bottomHandles.map(h => (
                <Handle
                    key={h.id}
                    type={h.type}
                    position={Position.Bottom}
                    id={h.id}
                    className="ftv-handle"
                    style={{ left: `${h.leftPct}%` }}
                />
            ))}
        </>
    )
}

/* ── Group node component ────────────────────────────────────────── */

interface FtvGroupData extends Record<string, unknown> {
    label: string
    width: number
    height: number
    isHovered: boolean
}

type FtvGroupNode = Node<FtvGroupData>

export function FtvGroupNodeComponent({ data }: NodeProps<FtvGroupNode>) {
    const { width, height, isHovered } = data
    return (
        <div
            className={cn(
                'rounded-[var(--radius-lg)] border-[1.5px] border-transparent bg-transparent transition-[background,border-color] duration-200 pointer-events-none',
                isHovered && 'bg-[rgba(59,130,246,0.04)] border-[rgba(59,130,246,0.18)] border-dashed',
            )}
            style={{ width, height }}
        />
    )
}
