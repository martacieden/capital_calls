/**
 * graph-layout.ts — Pure graph-building functions for the family tree view.
 *
 * No React runtime dependency — only type imports from ReactFlow.
 */

import type { Node, Edge } from '@xyflow/react'
import { THORNTON_POSITIONS, THORNTON_VISUAL_EDGES } from '@/data/thornton/graph-positions'
import type { AnyCatalogItem, Relationship } from '@/data/types'
import type { FtvNodeData, FtvNode } from '@/components/molecules/FtvItemNode'
import type { FtvEdgeData } from '@/components/molecules/FtvEdge'

/* ── Layout constants ────────────────────────────────────────────── */

const NODE_W = 360        // enlarged card width
const NODE_H = 185        // enlarged card height

export { NODE_W, NODE_H }

/* ── Layout result ───────────────────────────────────────────────── */

interface LayoutResult {
    positions: Map<string, { x: number; y: number }>
}

/* ── Helpers ─────────────────────────────────────────────────────── */

/** Build a children map from visual edges (parent→child direction) */
export function buildChildrenMap(): Map<string, Set<string>> {
    const children = new Map<string, Set<string>>()
    for (const e of THORNTON_VISUAL_EDGES) {
        if (!children.has(e.from)) children.set(e.from, new Set())
        children.get(e.from)!.add(e.to)
    }
    return children
}

/** Get all downstream descendants of a node (BFS down the tree) */
export function getDescendants(nodeId: string, childrenMap: Map<string, Set<string>>): Set<string> {
    const result = new Set<string>()
    const queue = [nodeId]
    while (queue.length > 0) {
        const id = queue.shift()!
        const kids = childrenMap.get(id)
        if (!kids) continue
        for (const kid of kids) {
            if (!result.has(kid)) {
                result.add(kid)
                queue.push(kid)
            }
        }
    }
    return result
}

/* ── Grid fallback layout ────────────────────────────────────────── */

export function computeLayout(items: AnyCatalogItem[], _relationships: Relationship[]): LayoutResult {
    const positions = new Map<string, { x: number; y: number }>()

    const hasThornton = items.some(i => THORNTON_POSITIONS[i.id] != null)

    if (hasThornton) {
        for (const item of items) {
            const pos = THORNTON_POSITIONS[item.id]
            if (pos) positions.set(item.id, { x: pos.x, y: pos.y })
        }
    } else {
        const itemMap = new Map(items.map(i => [i.id, i]))
        const connected = new Set<string>()
        for (const rel of _relationships) {
            if (itemMap.has(rel.from)) connected.add(rel.from)
            if (itemMap.has(rel.to)) connected.add(rel.to)
        }
        const visible = items.filter(i => connected.has(i.id) || items.length <= 20)
        const cols = Math.max(1, Math.ceil(Math.sqrt(visible.length)))
        const gapX = NODE_W + 60
        const gapY = NODE_H + 60
        visible.forEach((item, i) => {
            positions.set(item.id, {
                x: (i % cols) * gapX,
                y: Math.floor(i / cols) * gapY,
            })
        })
    }

    return { positions }
}

/* ── Group node data ─────────────────────────────────────────────── */

export interface FtvGroupData extends Record<string, unknown> {
    label: string
    width: number
    height: number
    isHovered: boolean
}

export type FtvGroupNode = Node<FtvGroupData>

export type AnyFtvNode = FtvNode | FtvGroupNode

/* ── Build graph ─────────────────────────────────────────────────── */

export function buildGraph(
    items: AnyCatalogItem[],
    relationships: Relationship[],
): {
    nodes: AnyFtvNode[]
    edges: Edge[]
} {
    const { positions } = computeLayout(items, relationships)
    const posSet = new Set(positions.keys())

    // Use visual hierarchy edges for Thornton, relationship data for others
    const hasThornton = items.some(i => THORNTON_POSITIONS[i.id] != null)

    let edgeList: Array<{ from: string; to: string; label: string }>

    if (hasThornton) {
        // Clean tree edges — only parent→child in the visual layout
        edgeList = THORNTON_VISUAL_EDGES.filter(e => posSet.has(e.from) && posSet.has(e.to))
    } else {
        // Merge parallel relationship edges for non-Thornton data
        const seen = new Map<string, { from: string; to: string; labels: string[] }>()
        for (const rel of relationships) {
            if (!posSet.has(rel.from) || !posSet.has(rel.to)) continue
            const srcY = positions.get(rel.from)?.y ?? 0
            const tgtY = positions.get(rel.to)?.y ?? 0
            const [from, to] = srcY <= tgtY ? [rel.from, rel.to] : [rel.to, rel.from]
            const key = `${from}||${to}`
            if (!seen.has(key)) seen.set(key, { from, to, labels: [] })
            seen.get(key)!.labels.push(rel.label)
        }
        edgeList = Array.from(seen.values()).map(({ from, to, labels }) => ({
            from, to, label: labels.join(' · '),
        }))
    }

    const edges: Edge[] = edgeList.map(({ from, to, label }) => ({
        id: `${from}||${to}`,
        source: from,
        target: to,
        sourceHandle: 'bottom-0',
        targetHandle: 'top-0',
        type: 'ftv',
        data: { label, isHighlighted: false, labelOffsetX: 0 } as FtvEdgeData,
        style: { stroke: '#9CA3AF', strokeWidth: 1.5 },
    }))

    // Single center handles for every node
    const defaultTopHandles: FtvNodeData['topHandles'] = [{ id: 'top-0', leftPct: 50 }]
    const defaultBottomHandles: FtvNodeData['bottomHandles'] = [{ id: 'bottom-0', leftPct: 50, type: 'source' }]

    // Build item nodes (only items with positions — disconnected items are excluded)
    const itemNodes: FtvNode[] = items
        .filter(item => positions.has(item.id))
        .map(item => ({
            id: item.id,
            type: 'item' as const,
            position: positions.get(item.id)!,
            draggable: false,
            selectable: false,
            zIndex: 1,
            data: {
                item,
                isHighlighted: false,
                isDimmed: false,
                onClick: () => { },
                onAction: () => { },
                topHandles: defaultTopHandles,
                bottomHandles: defaultBottomHandles,
            },
        }))

    return { nodes: itemNodes, edges }
}
