/**
 * FamilyTreeView — Hardcoded Figma-reference layout.
 *
 * Thornton family items are placed at exact coordinates matching the
 * Figma design. Non-Thornton orgs use a simple grid fallback.
 * Trust-based group highlights on hover.
 */

import { useState, useCallback, useMemo, useEffect, useRef, type MutableRefObject } from 'react'
import { GraphPromptAnchorRegistryContext } from '@/lib/contexts/prompt-anchor-registry'
import { ActionPromptDropdown } from '@/components/molecules/ActionPromptDropdown'
import { snapshotPromptAnchor } from '@/lib/helpers/prompt-anchor'
import { cn } from '@/lib/utils'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    useReactFlow,
    useNodesState,
    useEdgesState,
    MarkerType,
    type Node,
    type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
    IconArrowsMaximize,
    IconX,
    IconPlus,
    IconMinus,
    IconFocusCentered,
} from '@tabler/icons-react'
import { MapLegend } from '@/components/molecules/MapLegend'
import { MapToolbar } from '@/components/molecules/MapToolbar'
import { FtvItemNode } from '@/components/molecules/FtvItemNode'
import type { FtvNodeData } from '@/components/molecules/FtvItemNode'
import { FtvGroupNodeComponent } from '@/components/molecules/FtvItemNode'
import { FtvEdge } from '@/components/molecules/FtvEdge'
import { THORNTON_POSITIONS } from '@/data/thornton/graph-positions'
import { buildChildrenMap, getDescendants, buildGraph, NODE_W, NODE_H } from '@/lib/helpers/graph-layout'
import type { AnyFtvNode, FtvGroupNode } from '@/lib/helpers/graph-layout'
import type { AnyCatalogItem, Relationship } from '@/data/types'
import type { CardActionType } from '@/components/molecules/CardActionsMenu'
import type { PromptAnchorRect } from '@/lib/helpers/prompt-anchor'

const nodeTypes = { item: FtvItemNode, trustGroup: FtvGroupNodeComponent }
const edgeTypes = { ftv: FtvEdge }

/** AI action prompt shown over the map; rendered here so anchor can track React Flow pan/zoom. */
export interface GraphActionPromptPayload {
    action: CardActionType
    contextName: string
    anchorRect: PromptAnchorRect | null
    sourceGraphItemId: string
    onSubmit: (text: string, hasFiles: boolean) => void
}

/* ── Props ────────────────────────────────────────────────────────── */

interface MapViewProps {
    items: AnyCatalogItem[]
    relationships: Relationship[]
    onItemClick: (item: AnyCatalogItem) => void
    onActionRequest?: (item: AnyCatalogItem, action: CardActionType, anchor?: PromptAnchorRect | null) => void
    /** When the action prompt is open from a graph card, keep that card's actions control visible. */
    actionPromptItemId?: string | null
    pendingCreationForItemId?: string | null
    isExpanded: boolean
    onToggleExpand: () => void
    activeOrgs: string[]
    onOrgsChange: (ids: string[]) => void
    activeCategory: string[]
    onCategoryChange: (keys: string[]) => void
    selectedItemId?: string | null
    /** When set, zooms the graph to that node's position without opening the detail panel. */
    zoomToItemId?: string | null
    searchQuery?: string
    onSearchChange?: (query: string) => void
    graphActionPrompt?: GraphActionPromptPayload | null
    onCloseGraphActionPrompt?: () => void
}

function GraphMapActionPrompt({
    prompt,
    anchorGettersRef,
    onClose,
}: {
    prompt: GraphActionPromptPayload
    anchorGettersRef: MutableRefObject<Map<string, () => HTMLElement | null>>
    onClose: () => void
}) {
    const itemId = prompt.sourceGraphItemId
    const anchorGetter = useCallback(() => {
        const fn = anchorGettersRef.current.get(itemId)
        const el = fn?.() ?? null
        if (el) return snapshotPromptAnchor(el.getBoundingClientRect())
        return prompt.anchorRect
    }, [itemId, prompt.anchorRect])

    return (
        <ActionPromptDropdown
            action={prompt.action}
            contextName={prompt.contextName}
            anchorRect={prompt.anchorRect}
            anchorGetter={anchorGetter}
            onSubmit={prompt.onSubmit}
            onClose={onClose}
        />
    )
}

/* ── Inner component ─────────────────────────────────────────────── */

const PLACEHOLDER_NODE_ID = 'placeholder-new-asset'
const PLACEHOLDER_EDGE_ID = 'placeholder-edge'

function FamilyTreeContent({
    items, relationships, onItemClick, onActionRequest,
    actionPromptItemId = null,
    pendingCreationForItemId = null,
    isExpanded, onToggleExpand,
    activeOrgs: _activeOrgs, onOrgsChange: _onOrgsChange,
    activeCategory, onCategoryChange,
    selectedItemId = null,
    zoomToItemId = null,
    searchQuery = '',
    onSearchChange,
    graphActionPrompt = null,
    onCloseGraphActionPrompt = () => {},
}: MapViewProps) {
    const { zoomIn, zoomOut, fitView, setCenter, zoomTo } = useReactFlow()
    const [graphReady, setGraphReady] = useState(false)
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    const graphAnchorGettersRef = useRef(new Map<string, () => HTMLElement | null>())
    const graphAnchorRegistry = useMemo(
        () => ({
            register: (id: string, getEl: () => HTMLElement | null) => {
                graphAnchorGettersRef.current.set(id, getEl)
            },
            unregister: (id: string) => {
                graphAnchorGettersRef.current.delete(id)
            },
        }),
        [],
    )

    // Neighbor map for highlight
    const neighborMap = useMemo(() => {
        const map = new Map<string, Set<string>>()
        items.forEach(i => map.set(i.id, new Set()))
        relationships.forEach(rel => {
            map.get(rel.from)?.add(rel.to)
            map.get(rel.to)?.add(rel.from)
        })
        return map
    }, [items, relationships])

    // Tree children map for dynamic group highlighting
    const childrenMap = useMemo(() => buildChildrenMap(), [])

    // Base nodes and edges
    const { nodes: baseNodes, edges: baseEdges } = useMemo(
        () => buildGraph(items, relationships),
        [items, relationships],
    )

    // ReactFlow controlled state
    const [rfNodes, setRfNodes, onNodesChange] = useNodesState<AnyFtvNode>(baseNodes)
    const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>(baseEdges)

    // Sync when data changes
    useEffect(() => { setRfNodes(baseNodes) }, [baseNodes, setRfNodes])
    useEffect(() => { setRfEdges(baseEdges) }, [baseEdges, setRfEdges])

    // Search match set
    const searchMatchIds = useMemo(() => {
        if (!searchQuery.trim()) return null
        const q = searchQuery.toLowerCase()
        const ids = new Set<string>()
        items.forEach(i => {
            if (
                i.name.toLowerCase().includes(q) ||
                (i.description && i.description.toLowerCase().includes(q)) ||
                (i.categoryKey && String(i.categoryKey).toLowerCase().includes(q))
            ) ids.add(i.id)
        })
        return ids
    }, [searchQuery, items])

    // Apply highlight state (items + dynamic group)
    useEffect(() => {
        const hovNeighbors = hoveredId ? neighborMap.get(hoveredId) ?? new Set<string>() : new Set<string>()
        const selNeighbors = selectedItemId ? neighborMap.get(selectedItemId) ?? new Set<string>() : new Set<string>()
        const anyHover = hoveredId != null

        // Compute dynamic group: hovered node + all its downstream descendants
        let dynamicGroupIds: Set<string> | null = null
        let dynamicGroupRect: { x: number; y: number; w: number; h: number } | null = null

        if (hoveredId && THORNTON_POSITIONS[hoveredId]) {
            const descendants = getDescendants(hoveredId, childrenMap)
            if (descendants.size > 0) {
                dynamicGroupIds = new Set([hoveredId, ...descendants])
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
                for (const id of dynamicGroupIds) {
                    const pos = THORNTON_POSITIONS[id]
                    if (!pos) continue
                    minX = Math.min(minX, pos.x)
                    minY = Math.min(minY, pos.y)
                    maxX = Math.max(maxX, pos.x + NODE_W)
                    maxY = Math.max(maxY, pos.y + NODE_H)
                }
                if (minX !== Infinity) {
                    const pad = 24
                    dynamicGroupRect = { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 }
                }
            }
        }

        setRfNodes(prev => {
            // Remove any existing dynamic group nodes
            const withoutGroups = prev.filter(n => n.type !== 'trustGroup')

            // Add dynamic group node if we have one
            const groupNodes: FtvGroupNode[] = []
            if (dynamicGroupRect) {
                groupNodes.push({
                    id: 'dynamic-group',
                    type: 'trustGroup' as const,
                    position: { x: dynamicGroupRect.x, y: dynamicGroupRect.y },
                    zIndex: -1,
                    data: {
                        label: '',
                        width: dynamicGroupRect.w,
                        height: dynamicGroupRect.h,
                        isHovered: true,
                    },
                })
            }

            const updatedItems = withoutGroups.map((n): typeof n => {
                let isHighlighted = false
                let isDimmed = false
                if (anyHover) {
                    // Use dynamic group (full descendant tree) for highlight, not just direct neighbors
                    isHighlighted = dynamicGroupIds
                        ? dynamicGroupIds.has(n.id) || n.id === selectedItemId
                        : n.id === hoveredId || hovNeighbors.has(n.id) || n.id === selectedItemId
                    isDimmed = !isHighlighted
                } else if (selectedItemId) {
                    isHighlighted = n.id === selectedItemId || selNeighbors.has(n.id)
                    isDimmed = !isHighlighted
                } else if (searchMatchIds) {
                    isHighlighted = searchMatchIds.has(n.id)
                    isDimmed = !isHighlighted
                }
                const pinActions = actionPromptItemId != null && n.id === actionPromptItemId
                return { ...n, zIndex: isHighlighted ? 100 : isDimmed ? 0 : 1, data: { ...n.data, isHighlighted, isDimmed, pinActionsButtonVisible: pinActions, onClick: onItemClick, onAction: onActionRequest ?? (() => {}) } } as typeof n
            })

            return [...groupNodes, ...updatedItems]
        })
    }, [hoveredId, selectedItemId, searchMatchIds, neighborMap, childrenMap, onItemClick, onActionRequest, actionPromptItemId, setRfNodes])

    // Placeholder node for "add new asset" optimistic creation
    useEffect(() => {
        if (!pendingCreationForItemId) {
            setRfNodes(prev => prev.filter(n => n.id !== PLACEHOLDER_NODE_ID))
            setRfEdges(prev => prev.filter(e => e.id !== PLACEHOLDER_EDGE_ID))
            return
        }

        const sourcePos = THORNTON_POSITIONS[pendingCreationForItemId]
        const placeholderPos = sourcePos
            ? { x: sourcePos.x + NODE_W + 40, y: sourcePos.y + 60 }
            : { x: 8000, y: 1000 }

        const placeholderItem: AnyCatalogItem = {
            id: PLACEHOLDER_NODE_ID,
            name: 'New Asset',
            organizationId: '',
            categoryKey: 'property',
            createdAt: new Date().toISOString(),
            createdBy: { id: '', name: '' },
        }

        const placeholderNode: AnyFtvNode = {
            id: PLACEHOLDER_NODE_ID,
            type: 'item',
            position: placeholderPos,
            data: {
                item: placeholderItem,
                isHighlighted: false,
                isDimmed: false,
                isPlaceholder: true,
                onClick: () => {},
                onAction: () => {},
                topHandles: [{ id: 'ph-top', leftPct: 50 }],
                bottomHandles: [],
            },
        }

        const placeholderEdge: Edge = {
            id: PLACEHOLDER_EDGE_ID,
            source: pendingCreationForItemId,
            target: PLACEHOLDER_NODE_ID,
            type: 'ftv',
            style: { stroke: '#9CA3AF', strokeWidth: 1.5, strokeDasharray: '5,4' },
            data: { label: 'new connection', isHighlighted: false },
        }

        setRfNodes(prev => {
            const withoutPrev = prev.filter(n => n.id !== PLACEHOLDER_NODE_ID)
            return [...withoutPrev, placeholderNode]
        })
        setRfEdges(prev => {
            const withoutPrev = prev.filter(e => e.id !== PLACEHOLDER_EDGE_ID)
            return [...withoutPrev, placeholderEdge]
        })
    }, [pendingCreationForItemId, setRfNodes, setRfEdges])

    // Apply edge highlight — highlight all edges within the hovered subtree
    useEffect(() => {
        const targetId = hoveredId ?? selectedItemId
        const anyHighlight = targetId != null

        // Build subtree set for hovered node to highlight all internal edges
        let subtreeIds: Set<string> | null = null
        if (hoveredId) {
            const descendants = getDescendants(hoveredId, childrenMap)
            if (descendants.size > 0) {
                subtreeIds = new Set([hoveredId, ...descendants])
            }
        }

        setRfEdges(prev => {
            return prev.map(e => {
                // Edge is highlighted if both endpoints are in the subtree, or if directly connected to target
                const isHighlighted = targetId != null && (
                    (subtreeIds ? subtreeIds.has(e.source) && subtreeIds.has(e.target) : false) ||
                    e.source === targetId || e.target === targetId
                )
                return {
                    ...e,
                    zIndex: isHighlighted ? 50 : anyHighlight ? 0 : 1,
                    data: { ...e.data, isHighlighted },
                    style: {
                        stroke: isHighlighted ? 'var(--color-accent-9)' : anyHighlight ? '#D1D5DB' : '#9CA3AF',
                        strokeWidth: isHighlighted ? 2.5 : 1.5,
                    },
                    markerEnd: isHighlighted ? {
                        type: MarkerType.ArrowClosed,
                        width: 10,
                        height: 10,
                        color: 'var(--color-accent-9)',
                    } : undefined,
                }
            })
        })
    }, [hoveredId, selectedItemId, childrenMap, setRfEdges])

    const handleInit = useCallback(() => {
        requestAnimationFrame(() => {
            // Start zoomed in on the people/trusts area instead of fitting everything
            const hasThornton = items.some(i => THORNTON_POSITIONS[i.id] != null)
            if (hasThornton) {
                setCenter(9200, 700, { zoom: 0.35, duration: 0 })
            } else {
                fitView({ duration: 0, padding: 0.12 })
            }
            setGraphReady(true)
        })
    }, [fitView, setCenter, items])

    // Zoom to selected card, zoom back out when deselected
    const prevSelectedRef = useRef(selectedItemId)
    useEffect(() => {
        if (!graphReady) return
        const prev = prevSelectedRef.current
        prevSelectedRef.current = selectedItemId

        if (selectedItemId) {
            const pos = THORNTON_POSITIONS[selectedItemId]
            if (pos) {
                setCenter(pos.x + NODE_W / 2, pos.y + NODE_H / 2, { zoom: 0.5, duration: 400 })
            }
        } else if (prev && !selectedItemId) {
            // Deselected — zoom out from current position, not a fixed point
            zoomTo(0.35, { duration: 400 })
        }
    }, [selectedItemId, graphReady, setCenter, zoomTo, prevSelectedRef])

    // One-shot zoom to a specific node without opening the detail panel
    useEffect(() => {
        if (!graphReady || !zoomToItemId) return
        const pos = THORNTON_POSITIONS[zoomToItemId]
        if (pos) {
            setCenter(pos.x + NODE_W / 2, pos.y + NODE_H / 2, { zoom: 0.7, duration: 600 })
        }
    }, [zoomToItemId, graphReady, setCenter])

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
        onItemClick((node.data as FtvNodeData).item)
    }, [onItemClick])

    return (
        <GraphPromptAnchorRegistryContext.Provider value={graphAnchorRegistry}>
        <div className={`map-view${isExpanded ? ' map-view--expanded' : ''}`}>
            <div className={`map-canvas${graphReady ? '' : ' map-canvas--loading'}`}>
                {items.length > 0 ? (
                    <div style={{ width: '100%', height: '100%' }}>
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
                    </div>
                ) : (
                    <div className="v3-empty-state">
                        <img
                            className="v3-empty-state__icon"
                            src={fojoMascotSmall}
                            alt="Fojo"
                        />
                        <div className="v3-empty-state__title">Fojo is building your profile…</div>
                        <div className="v3-empty-state__sub">This page will appear in a moment</div>
                    </div>
                )}

                {isExpanded && (
                    <MapToolbar
                        activeCategory={activeCategory}
                        onCategoryChange={onCategoryChange}
                        searchQuery={searchQuery}
                        onSearchChange={onSearchChange ?? (() => {})}
                    />
                )}

                {/* Zoom controls + legend (bottom-right) */}
                <div className="map-bottom-left absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
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
                    <MapLegend items={items} />
                </div>

                <button
                    className={cn(
                        'map-expand-btn absolute top-3 right-3 z-10 flex items-center justify-center gap-[var(--spacing-2)] h-8 px-[var(--spacing-3)] py-0.5 bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-md)] shadow-[var(--shadow-subtle)] text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] leading-[1.54] whitespace-nowrap transition-colors duration-150 hover:bg-[var(--color-neutral-3)]',
                        isExpanded && 'map-expand-btn--primary !bg-[#ef4444] !text-white !border-[#ef4444] hover:!bg-[#dc2626]',
                    )}
                    onClick={onToggleExpand}
                >
                    {isExpanded ? (
                        <><IconX size={16} stroke={2} /><span>Close</span></>
                    ) : (
                        <><IconArrowsMaximize size={16} stroke={1.5} /><span>Expand</span></>
                    )}
                </button>
            </div>
        </div>
        {graphActionPrompt && (
            <GraphMapActionPrompt
                prompt={graphActionPrompt}
                anchorGettersRef={graphAnchorGettersRef}
                onClose={onCloseGraphActionPrompt}
            />
        )}
        </GraphPromptAnchorRegistryContext.Provider>
    )
}

/* ── Exported component ──────────────────────────────────────────── */

export function FamilyTreeView(props: MapViewProps) {
    return (
        <ReactFlowProvider>
            <FamilyTreeContent {...props} />
        </ReactFlowProvider>
    )
}
