import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { FtvEdge } from '../../components/molecules/FtvEdge'
import type { FtvEdgeData } from '../../components/molecules/FtvEdge'
import { FtvItemNode } from '../../components/molecules/FtvItemNode'
import type { FtvNodeData } from '../../components/molecules/FtvItemNode'
import type { AnyCatalogItem } from '../../data/types'

const edgeTypes = { ftv: FtvEdge }
const nodeTypes = { item: FtvItemNode }

const mockTrust: AnyCatalogItem = {
  id: 'thn-t1', name: 'Thornton Family RLT', organizationId: 'org-1', categoryKey: 'trust',
  createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'SW' },
} as AnyCatalogItem

const mockPerson: AnyCatalogItem = {
  id: 'thn-p1', name: 'Edward Thornton III', organizationId: 'org-1', categoryKey: 'person',
  createdAt: '2025-11-01', createdBy: { id: 'u1', name: 'SW' },
} as AnyCatalogItem

function makeItemNode(item: AnyCatalogItem, pos: { x: number; y: number }): Node {
  return {
    id: item.id,
    type: 'item',
    position: pos,
    data: {
      item,
      isHighlighted: false,
      isDimmed: false,
      isPlaceholder: false,
      onClick: () => {},
      onAction: () => {},
      topHandles: [{ id: 'default', leftPct: 50 }],
      bottomHandles: [{ id: 'default', leftPct: 50, type: 'target' }],
    } satisfies FtvNodeData,
  }
}

const demoNodes: Node[] = [
  makeItemNode(mockTrust, { x: 80, y: 20 }),
  makeItemNode(mockPerson, { x: 80, y: 200 }),
]

const makeEdge = (overrides: Partial<FtvEdgeData> = {}): Edge => ({
  id: 'e-a-b',
  source: mockTrust.id,
  target: mockPerson.id,
  type: 'ftv',
  data: {
    label: 'Grantor of',
    isHighlighted: false,
    labelOffsetX: 0,
    pathType: 'step',
    ...overrides,
  } satisfies FtvEdgeData,
})

/**
 * ## FtvEdge
 *
 * ### What it does
 * Custom ReactFlow edge component for family tree view connections. Supports two path
 * types: 'step' (smooth step for tree hierarchy) and 'straight' (for radial/web edges).
 * Shows an edge label when highlighted, positioned at the midpoint with optional offset.
 *
 * ### Key behaviors
 * - Smooth step path (default) or straight path
 * - Label appears only when `isHighlighted` is true
 * - Label shows first segment before " . " separator
 * - Label offset via `labelOffsetX`
 * - Pointer-events none on label (non-interactive)
 *
 * ### Tokens used
 * `--color-white`, `--color-neutral-5`, `--color-accent-9`, `--radius-sm`,
 * `--font-weight-semibold`
 *
 */
const meta: Meta<typeof FtvEdge> = {
  title: 'Molecules/FtvEdge',
  component: FtvEdge,
  tags: ['autodocs'],
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof FtvEdge>

function FtvEdgeDemo({ edges }: { edges: Edge[] }) {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={demoNodes}
          edges={edges}
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          fitView
          proOptions={{ hideAttribution: true }}
        />
      </ReactFlowProvider>
    </div>
  )
}

export const StepPath: Story = {
  render: () => <FtvEdgeDemo edges={[makeEdge({ pathType: 'step' })]} />,
}

export const StraightPath: Story = {
  render: () => <FtvEdgeDemo edges={[makeEdge({ pathType: 'straight' })]} />,
}

export const Highlighted: Story = {
  render: () => <FtvEdgeDemo edges={[makeEdge({ isHighlighted: true, label: 'Grantor of' })]} />,
}
