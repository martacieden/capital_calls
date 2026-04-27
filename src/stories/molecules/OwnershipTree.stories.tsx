import type { Meta, StoryObj } from '@storybook/react-vite'
import { OwnershipTree } from '../../components/molecules/OwnershipTree'
import type { AnyCatalogItem, Relationship } from '../../data/types'

const chainItems: AnyCatalogItem[] = [
  {
    id: 'thn-p1', name: 'Edward Thornton III', organizationId: 'org-1', categoryKey: 'person',
    description: 'Grantor and primary trustee.',
    createdAt: '2025-11-01', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
    age: 68, roles: ['Grantor'],
  } as AnyCatalogItem,
  {
    id: 'thn-t1', name: 'Thornton Family RLT', organizationId: 'org-1', categoryKey: 'trust',
    description: 'Cornerstone of the Thornton estate plan.',
    createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
    trustType: 'Revocable Living Trust', status: 'Active',
  } as AnyCatalogItem,
  {
    id: 'thn-e1', name: 'Family Office LLC', organizationId: 'org-1', categoryKey: 'entity',
    description: 'Central management entity.',
    createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
    entityType: 'LLC',
  } as AnyCatalogItem,
  {
    id: 'thn-a1', name: 'Fifth Avenue Penthouse', organizationId: 'org-1', categoryKey: 'property',
    description: 'Primary residence at 834 Fifth Avenue.',
    createdAt: '2026-01-15', createdBy: { id: 'u1', name: 'Edward Thornton III' },
    assetType: 'Real Estate', value: 32_000_000,
  } as AnyCatalogItem,
]

const relationships: Relationship[] = [
  { from: 'thn-p1', to: 'thn-t1', type: 'grantor_of', label: 'Grantor of' },
  { from: 'thn-t1', to: 'thn-e1', type: 'owns', label: 'Owns', percentage: 100 },
  { from: 'thn-e1', to: 'thn-a1', type: 'holds', label: 'Holds' },
]

/**
 * ## OwnershipTree
 *
 * ### What it does
 * Mini ReactFlow graph showing the direct ownership chain for a given item. Renders
 * a vertical chain from the top-level owner down to the selected item. Uses the same
 * FtvItemNode and FtvEdge components as the full FamilyTreeView. Includes zoom controls
 * and MapLegend. Returns null when chain has only 1 item.
 *
 * ### Key behaviors
 * - Vertical chain layout from owner to asset
 * - Hover highlighting: hovered node + current item highlighted
 * - Zoom in/out/fit-to-view controls
 * - MapLegend showing categories in the chain
 * - Sidebar-aware zoom control positioning
 * - Returns null for chains of length <= 1
 * - Wraps in ReactFlowProvider internally
 *
 * ### Tokens used
 * `--color-white`, `--color-gray-4`, `--color-neutral-3`, `--color-neutral-11`,
 * `--shadow-subtle`, `--detail-panel-width`
 *
 */
const meta: Meta<typeof OwnershipTree> = {
  title: 'Molecules/OwnershipTree',
  component: OwnershipTree,
  tags: ['autodocs'],
  argTypes: {
    chain: { control: false, description: 'Array of AnyCatalogItem forming the ownership chain' },
    currentItemId: { control: 'text', description: 'ID of the currently selected item' },
    relationships: { control: false, description: 'Array of Relationship edges' },
    onItemClick: { action: 'item-clicked' },
    onAction: { action: 'action-triggered' },
    sidebarOpen: { control: 'boolean', description: 'Shift zoom controls for sidebar' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof OwnershipTree>

export const Default: Story = {
  args: {
    chain: chainItems,
    currentItemId: 'thn-a1',
    relationships,
    sidebarOpen: false,
  },
}

export const TwoItemChain: Story = {
  args: {
    chain: chainItems.slice(0, 2),
    currentItemId: 'thn-t1',
    relationships: [relationships[0]],
    sidebarOpen: false,
  },
}
