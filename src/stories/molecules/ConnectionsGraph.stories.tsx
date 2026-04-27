import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConnectionsGraph } from '../../components/molecules/ConnectionsGraph'
import type { AnyCatalogItem, Relationship } from '../../data/types'

const centerItem: AnyCatalogItem = {
  id: 'thn-t1', name: 'Thornton Family RLT', organizationId: 'org-1', categoryKey: 'trust',
  description: 'Cornerstone of the Thornton estate plan.',
  createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
  trustType: 'Revocable Living Trust', status: 'Active',
} as AnyCatalogItem

const relatedItems: AnyCatalogItem[] = [
  {
    id: 'thn-p1', name: 'Edward Thornton III', organizationId: 'org-1', categoryKey: 'person',
    description: 'Grantor and primary trustee.',
    createdAt: '2025-11-01', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
    age: 68, roles: ['Grantor', 'Trustee'],
  } as AnyCatalogItem,
  {
    id: 'thn-e1', name: 'Family Office LLC', organizationId: 'org-1', categoryKey: 'entity',
    description: 'Central management entity.',
    createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
    entityType: 'LLC',
  } as AnyCatalogItem,
  {
    id: 'thn-a1', name: 'Fifth Avenue Penthouse', organizationId: 'org-1', categoryKey: 'property',
    description: 'Primary residence.',
    createdAt: '2026-01-15', createdBy: { id: 'u1', name: 'Edward Thornton III' },
    assetType: 'Real Estate', value: 32_000_000,
  } as AnyCatalogItem,
]

const allItems = [centerItem, ...relatedItems]

const relationships: Relationship[] = [
  { from: 'thn-p1', to: 'thn-t1', type: 'grantor_of', label: 'Grantor of' },
  { from: 'thn-t1', to: 'thn-e1', type: 'owns', label: 'Owns', percentage: 100 },
  { from: 'thn-e1', to: 'thn-a1', type: 'holds', label: 'Holds' },
]

function getItemById(id: string): AnyCatalogItem | null {
  return allItems.find(i => i.id === id) ?? null
}

/**
 * ## ConnectionsGraph
 *
 * ### What it does
 * Radial "spider web" ReactFlow graph showing non-hierarchy relationships with the
 * current item at center. Uses FtvItemNode and FtvEdge components. Includes zoom
 * controls and a MapLegend derived from actual data.
 *
 * ### Key behaviors
 * - Radial layout with center item
 * - Hover highlighting: hovered node + center item highlighted, others dimmed
 * - Edge labels appear on hover
 * - Zoom in/out/fit-to-view controls
 * - MapLegend shows categories present in the graph
 * - Sidebar-aware zoom control positioning
 * - Wraps in ReactFlowProvider internally
 *
 * ### Tokens used
 * `--color-white`, `--color-gray-4`, `--color-neutral-3`, `--color-neutral-11`,
 * `--shadow-subtle`, `--detail-panel-width`
 *
 */
const meta: Meta<typeof ConnectionsGraph> = {
  title: 'Molecules/ConnectionsGraph',
  component: ConnectionsGraph,
  tags: ['autodocs'],
  argTypes: {
    currentItem: { control: false, description: 'The center item of the graph' },
    relationships: { control: false, description: 'Array of Relationship edges' },
    getItemById: { control: false, description: 'Lookup function for items' },
    onItemClick: { action: 'item-clicked' },
    onAction: { action: 'action-triggered' },
    sidebarOpen: { control: 'boolean', description: 'Shift zoom controls when sidebar is open' },
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
type Story = StoryObj<typeof ConnectionsGraph>

export const Default: Story = {
  args: {
    currentItem: centerItem,
    relationships,
    getItemById,
    sidebarOpen: false,
  },
}

