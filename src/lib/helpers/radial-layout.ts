/**
 * radial-layout.ts — Builds a radial "spider web" graph for non-hierarchy
 * relationships. Current item sits at center, related items form a circle.
 */

import type { Edge } from '@xyflow/react'
import { NODE_W, NODE_H } from '@/lib/helpers/graph-layout'
import type { FtvNode } from '@/components/molecules/FtvItemNode'
import type { FtvEdgeData } from '@/components/molecules/FtvEdge'
import type { FtvNodeData } from '@/components/molecules/FtvItemNode'
import type { AnyCatalogItem, Relationship } from '@/data/types'
import { isHierarchyRelationship, getContextualLabel } from '@/lib/helpers/ownership-chain'

/* ── Build radial connections graph ─────────────────────────────── */

export function buildConnectionsGraph(
    currentItem: AnyCatalogItem,
    relationships: Relationship[],
    getItemById: (id: string) => AnyCatalogItem | null,
): {
    nodes: FtvNode[]
    edges: Edge[]
} {
    // Filter to non-hierarchy relationships involving the current item
    const itemRels = relationships.filter(
        r => (r.from === currentItem.id || r.to === currentItem.id) && !isHierarchyRelationship(r),
    )

    // Resolve unique "other" items
    const seen = new Set<string>()
    const others: { item: AnyCatalogItem; rel: Relationship }[] = []

    for (const rel of itemRels) {
        const otherId = rel.from === currentItem.id ? rel.to : rel.from
        if (seen.has(otherId)) continue
        seen.add(otherId)
        const other = getItemById(otherId)
        if (other) others.push({ item: other, rel })
    }

    if (others.length === 0) return { nodes: [], edges: [] }

    // Position: center item + radial ring
    const N = others.length
    const radius = Math.max(500, N * 120)
    const centerX = 0
    const centerY = 0

    const defaultTopHandles: FtvNodeData['topHandles'] = [{ id: 'top-0', leftPct: 50 }]
    const defaultBottomHandles: FtvNodeData['bottomHandles'] = [{ id: 'bottom-0', leftPct: 50, type: 'source' }]

    const noop = () => {}

    // Center node
    const centerNode: FtvNode = {
        id: currentItem.id,
        type: 'item' as const,
        position: { x: centerX - NODE_W / 2, y: centerY - NODE_H / 2 },
        draggable: false,
        selectable: false,
        zIndex: 1,
        data: {
            item: currentItem,
            isHighlighted: false,
            isDimmed: false,
            onClick: noop,
            onAction: noop,
            topHandles: defaultTopHandles,
            bottomHandles: defaultBottomHandles,
        },
    }

    // Ring nodes
    const ringNodes: FtvNode[] = others.map(({ item }, i) => {
        const angle = (i * (2 * Math.PI)) / N - Math.PI / 2
        return {
            id: item.id,
            type: 'item' as const,
            position: {
                x: centerX + radius * Math.cos(angle) - NODE_W / 2,
                y: centerY + radius * Math.sin(angle) - NODE_H / 2,
            },
            draggable: false,
            selectable: false,
            zIndex: 1,
            data: {
                item,
                isHighlighted: false,
                isDimmed: false,
                onClick: noop,
                onAction: noop,
                topHandles: defaultTopHandles,
                bottomHandles: defaultBottomHandles,
            },
        }
    })

    // Edges from center to each ring node
    const edges: Edge[] = others.map(({ item, rel }) => {
        const label = getContextualLabel(rel, currentItem.id)
        return {
            id: `${currentItem.id}||${item.id}`,
            source: currentItem.id,
            target: item.id,
            sourceHandle: 'bottom-0',
            targetHandle: 'top-0',
            type: 'ftv',
            data: { label, isHighlighted: false, labelOffsetX: 0, pathType: 'straight' } as FtvEdgeData,
            style: { stroke: '#9CA3AF', strokeWidth: 1.5 },
        }
    })

    return { nodes: [centerNode, ...ringNodes], edges }
}

/* ── Build compact vertical ownership chain graph ───────────── */

export function buildOwnershipChainGraph(
    chain: AnyCatalogItem[],
    relationships: Relationship[],
): {
    nodes: FtvNode[]
    edges: Edge[]
} {
    if (chain.length === 0) return { nodes: [], edges: [] }

    const GAP_Y = 40 // vertical gap between cards

    const defaultTopHandles: FtvNodeData['topHandles'] = [{ id: 'top-0', leftPct: 50 }]
    const defaultBottomHandles: FtvNodeData['bottomHandles'] = [{ id: 'bottom-0', leftPct: 50, type: 'source' }]
    const noop = () => {}

    // Position items in a centered vertical stack
    const nodes: FtvNode[] = chain.map((item, i) => ({
        id: item.id,
        type: 'item' as const,
        position: { x: 0, y: i * (NODE_H + GAP_Y) },
        draggable: false,
        selectable: false,
        zIndex: 1,
        data: {
            item,
            isHighlighted: false,
            isDimmed: false,
            onClick: noop,
            onAction: noop,
            topHandles: defaultTopHandles,
            bottomHandles: defaultBottomHandles,
        },
    }))

    // Build edges between consecutive chain items
    // Look up the relationship label from the actual data
    const edges: Edge[] = []
    for (let i = 0; i < chain.length - 1; i++) {
        const parent = chain[i]
        const child = chain[i + 1]
        // Find the hierarchy relationship between these two items
        const rel = relationships.find(
            r => (r.from === parent.id && r.to === child.id) || (r.from === child.id && r.to === parent.id),
        )
        edges.push({
            id: `${parent.id}||${child.id}`,
            source: parent.id,
            target: child.id,
            sourceHandle: 'bottom-0',
            targetHandle: 'top-0',
            type: 'ftv',
            data: { label: rel?.label ?? '', isHighlighted: false, labelOffsetX: 0 } as FtvEdgeData,
            style: { stroke: '#9CA3AF', strokeWidth: 1.5 },
        })
    }

    return { nodes, edges }
}
