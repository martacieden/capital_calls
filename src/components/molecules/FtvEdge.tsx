/**
 * FtvEdge — Custom ReactFlow edge for family tree view connections.
 */

import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    getStraightPath,
    type EdgeProps,
} from '@xyflow/react'

/* ── Edge data ───────────────────────────────────────────────────── */

export interface FtvEdgeData extends Record<string, unknown> {
    label: string
    isHighlighted: boolean
    labelOffsetX: number
    /** 'straight' for radial/web edges, default 'step' for tree edges */
    pathType?: 'step' | 'straight'
}

/* ── Edge component ──────────────────────────────────────────────── */

export function FtvEdge({
    id, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    data, style, markerEnd,
}: EdgeProps) {
    const { label, isHighlighted, labelOffsetX, pathType } = (data ?? {}) as FtvEdgeData

    const [edgePath, labelX, labelY] = pathType === 'straight'
        ? getStraightPath({ sourceX, sourceY, targetX, targetY })
        : getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })

    const lx = labelX + (labelOffsetX ?? 0)
    const ly = labelY

    const displayLabel = (label ?? '').split(' · ')[0]

    return (
        <>
            <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
            {isHighlighted && displayLabel && (
                <EdgeLabelRenderer>
                    <div
                        className="absolute bg-[var(--color-white)] border border-[var(--color-neutral-5)] rounded-[var(--radius-sm)] px-[7px] py-0.5 text-xs font-[var(--font-weight-semibold)] text-[var(--color-accent-9)] pointer-events-none whitespace-nowrap shadow-[0_1px_3px_rgba(0,0,0,0.08)] z-[9999]"
                        style={{ transform: `translate(-50%, -50%) translate(${lx}px,${ly}px)` }}
                    >
                        {displayLabel}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    )
}
