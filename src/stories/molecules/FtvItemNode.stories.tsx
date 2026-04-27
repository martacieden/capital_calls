import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ReactFlow,
  ReactFlowProvider,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { FtvItemNode } from '../../components/molecules/FtvItemNode'
import type { FtvNodeData } from '../../components/molecules/FtvItemNode'
import type { AnyCatalogItem } from '../../data/types'

const nodeTypes = { item: FtvItemNode }

const mockPerson: AnyCatalogItem = {
  id: 'thn-p1', name: 'Edward Thornton III', organizationId: 'org-1', categoryKey: 'person',
  description: 'Grantor and primary trustee of the Thornton Family Trust.',
  createdAt: '2025-11-01', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
  age: 68, roles: ['Grantor', 'Trustee'],
} as AnyCatalogItem

const mockTrust: AnyCatalogItem = {
  id: 'thn-t1', name: 'Thornton Family Revocable Living Trust', organizationId: 'org-1', categoryKey: 'trust',
  description: 'Cornerstone of the Thornton estate plan, holding direct ownership of the Family Office LLC.',
  createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
  trustType: 'Revocable Living Trust', status: 'Active',
} as AnyCatalogItem

const mockAsset: AnyCatalogItem = {
  id: 'thn-a1', name: 'Fifth Avenue Penthouse', organizationId: 'org-1', categoryKey: 'property',
  imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=240&fit=crop',
  description: 'Primary residence at 834 Fifth Avenue, NYC.',
  createdAt: '2026-01-15', createdBy: { id: 'u1', name: 'Edward Thornton III' },
  assetType: 'Real Estate', value: 32_000_000,
} as AnyCatalogItem

function makeNode(item: AnyCatalogItem, overrides: Partial<FtvNodeData> = {}): Node {
  return {
    id: item.id,
    type: 'item',
    position: { x: 50, y: 50 },
    data: {
      item,
      isHighlighted: false,
      isDimmed: false,
      isPlaceholder: false,
      onClick: () => {},
      onAction: () => {},
      topHandles: [],
      bottomHandles: [],
      ...overrides,
    } satisfies FtvNodeData,
  }
}

/**
 * ## FtvItemNode
 *
 * ### What it does
 * Custom ReactFlow node component for family tree view item cards. Renders a compact
 * card with category-colored avatar/icon/initials, name, subtitle (varies by category),
 * description, source document chip, and a three-dots action menu button. Also supports
 * a placeholder skeleton state for AI-created assets in progress.
 *
 * ### Key behaviors
 * - Category-aware avatars: persons get initials, others get category icons
 * - Image support for items with `imageUrl`
 * - Three-dots menu on hover (opens CardActionsMenu)
 * - Double-click opens menu
 * - Highlight/dim states for hover interactions
 * - Placeholder skeleton for pending AI items
 * - Source document chip with "+N" badge
 * - ReactFlow handle positioning via topHandles/bottomHandles
 *
 * ### Tokens used
 * `--color-white`, `--color-neutral-2`, `--color-neutral-3`, `--color-neutral-4`,
 * `--color-neutral-5`, `--color-neutral-6`, `--color-neutral-11`, `--color-neutral-12`,
 * `--radius-sm`, `--radius-md`, `--radius-lg`, `--font-weight-semibold`, `--font-weight-bold`,
 * `--shadow-card-hover`
 *
 */
const meta: Meta<typeof FtvItemNode> = {
  title: 'Molecules/FtvItemNode',
  component: FtvItemNode,
  tags: ['autodocs'],
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof FtvItemNode>

function FtvNodeDemo({ nodes }: { nodes: Node[] }) {
  return (
    <div style={{ width: '100%', height: 250 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={[]}
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

export const PersonNode: Story = {
  render: () => <FtvNodeDemo nodes={[makeNode(mockPerson)]} />,
}

export const TrustNode: Story = {
  render: () => <FtvNodeDemo nodes={[makeNode(mockTrust)]} />,
}

export const AssetWithImage: Story = {
  render: () => <FtvNodeDemo nodes={[makeNode(mockAsset)]} />,
}

export const PlaceholderSkeleton: Story = {
  render: () => (
    <FtvNodeDemo
      nodes={[makeNode(mockTrust, {
        isPlaceholder: true,
        topHandles: [{ id: 'top-1', leftPct: 50 }],
        bottomHandles: [],
      })]}
    />
  ),
}
