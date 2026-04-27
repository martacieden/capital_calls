/**
 * OwnershipTree — Mini ReactFlow graph showing the direct ownership
 * chain for a given item. Reuses the exact same graph building and
 * positioning logic as the full FamilyTreeView.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    useNodesState,
    useEdgesState,
    useReactFlow,
    type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { IconPlus, IconMinus, IconFocusCentered } from '@tabler/icons-react'
import { GraphPromptAnchorRegistryContext } from '@/lib/contexts/prompt-anchor-registry'
import { FtvItemNode } from '@/components/molecules/FtvItemNode'
import type { FtvNodeData } from '@/components/molecules/FtvItemNode'
import { FtvEdge } from '@/components/molecules/FtvEdge'
import type { FtvEdgeData } from '@/components/molecules/FtvEdge'
import { MapLegend } from '@/components/molecules/MapLegend'
import { buildOwnershipChainGraph } from '@/lib/helpers/radial-layout'
import type { CardActionType } from '@/components/molecules/CardActionsMenu'
import type { PromptAnchorRect } from '@/lib/helpers/prompt-anchor'
import type { AnyCatalogItem, Relationship } from '@/data/types'

/* ── Reuse same node/edge type registrations as FamilyTreeView ──── */

const nodeTypes = { item: FtvItemNode }
const edgeTypes = { ftv: FtvEdge }

/* ── Props ──────────────────────────────────────────────────────── */

interface OwnershipTreeProps {
    chain: AnyCatalogItem[]
    currentItemId: string
    relationships: Relationship[]
    onItemClick: (item: AnyCatalogItem) => void
    onAction?: (item: AnyCatalogItem, action: CardActionType, anchor?: PromptAnchorRect | null) => void
    /** When true, shift zoom controls left to avoid the detail sidebar */
    sidebarOpen?: boolean
}

/* ── Inner component (needs ReactFlowProvider above it) ─────────── */

function OwnershipTreeContent({ chain, currentItemId, relationships, onItemClick, onAction, sidebarOpen }: OwnershipTreeProps) {
    const { fitView, zoomIn, zoomOut } = useReactFlow()
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    // Stable refs to avoid infinite re-render loops
    const onItemClickRef = useRef(onItemClick)
    onItemClickRef.current = onItemClick
    const onActionRef = useRef(onAction)
    onActionRef.current = onAction

    const stableOnItemClick = useCallback((item: AnyCatalogItem) => {
        onItemClickRef.current(item)
    }, [])
    const stableOnAction = useCallback((item: AnyCatalogItem, action: CardActionType, anchor?: PromptAnchorRect | null) => {
        onActionRef.current?.(item, action, anchor)
    }, [])

    // Build a compact vertical chain graph
    const { nodes: baseNodes, edges: baseEdges } = useMemo(
        () => buildOwnershipChainGraph(chain, relationships),
        [chain, relationships],
    )

    const [rfNodes, setRfNodes, onNodesChange] = useNodesState(baseNodes)
    const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(baseEdges)

    // Sync when base data changes
    useEffect(() => { setRfNodes(baseNodes) }, [baseNodes, setRfNodes])
    useEffect(() => { setRfEdges(baseEdges) }, [baseEdges, setRfEdges])

    // Apply hover highlighting — same pattern as FamilyTreeView
    useEffect(() => {
        const anyHover = hoveredId != null

        setRfNodes(prev => prev.map(n => {
            const isCurrentItem = n.id === currentItemId
            const isHovered = n.id === hoveredId
            const isHighlighted = anyHover
                ? isHovered || isCurrentItem
                : isCurrentItem
            const isDimmed = anyHover ? !isHighlighted : false

            return {
                ...n,
                zIndex: isHighlighted ? 100 : isDimmed ? 0 : 1,
                data: {
                    ...n.data,
                    isHighlighted,
                    isDimmed,
                    onClick: stableOnItemClick,
                    onAction: stableOnAction,
                },
            } as typeof n
        }))

        setRfEdges(prev => prev.map(e => {
            const isAdjacentToHover = anyHover && (e.source === hoveredId || e.target === hoveredId)
            return {
                ...e,
                data: { ...e.data, isHighlighted: isAdjacentToHover } as FtvEdgeData,
            }
        }))
    }, [hoveredId, currentItemId, stableOnItemClick, setRfNodes, setRfEdges])

    const handleInit = useCallback(() => {
        setTimeout(() => fitView({ padding: 0.12, duration: 0 }), 50)
    }, [fitView])

    const handleNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
        if (node.type === 'item') setHoveredId(node.id)
    }, [])

    const handleNodeMouseLeave = useCallback(() => {
        setHoveredId(null)
    }, [])

    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (node.type !== 'item') return
        const target = event.target as HTMLElement | null
        if (target?.closest('button, a[href], input, textarea, select, [role="button"]')) return
        stableOnItemClick((node.data as FtvNodeData).item)
    }, [stableOnItemClick])

    return (
        <div
            className="relative"
            style={{ width: '100%', height: '100%' }}
        >
            <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onInit={handleInit}
                onNodeMouseEnter={handleNodeMouseEnter}
                onNodeMouseLeave={handleNodeMouseLeave}
                onNodeClick={handleNodeClick}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                minZoom={0.1}
                maxZoom={10}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#E0E1E6" gap={24} size={1} />
            </ReactFlow>
            <div className="absolute bottom-3 z-10 flex flex-col items-end gap-2 transition-[right] duration-[0.45s] ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ right: sidebarOpen ? 'calc(var(--detail-panel-width) + 24px)' : '12px' }}>
                <div className="flex flex-col border border-[var(--color-gray-4)] rounded-full shadow-[var(--shadow-subtle)] overflow-hidden">
                    <button className="flex items-center justify-center w-9 h-9 bg-[var(--color-white)] border-none border-b border-b-[var(--color-gray-4)] text-[var(--color-neutral-11)] transition-colors duration-150 hover:bg-[var(--color-neutral-3)]" onClick={() => zoomIn({ duration: 200 })} title="Zoom in">
                        <IconPlus size={16} stroke={2} />
                    </button>
                    <button className="flex items-center justify-center w-9 h-9 bg-[var(--color-white)] border-none border-b border-b-[var(--color-gray-4)] text-[var(--color-neutral-11)] transition-colors duration-150 hover:bg-[var(--color-neutral-3)]" onClick={() => zoomOut({ duration: 200 })} title="Zoom out">
                        <IconMinus size={16} stroke={2} />
                    </button>
                    <button className="flex items-center justify-center w-9 h-9 bg-[var(--color-white)] border-none text-[var(--color-neutral-11)] transition-colors duration-150 hover:bg-[var(--color-neutral-3)]" onClick={() => fitView({ duration: 400, padding: 0.12 })} title="Fit to view">
                        <IconFocusCentered size={16} stroke={2} />
                    </button>
                </div>
                <MapLegend items={chain} />
            </div>
        </div>
    )
}

/* ── Exported component ─────────────────────────────────────────── */

export function OwnershipTree(props: OwnershipTreeProps) {
    if (props.chain.length <= 1) return null

    return (
        <GraphPromptAnchorRegistryContext.Provider value={null}>
            <ReactFlowProvider>
                <OwnershipTreeContent {...props} />
            </ReactFlowProvider>
        </GraphPromptAnchorRegistryContext.Provider>
    )
}
