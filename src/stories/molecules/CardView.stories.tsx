import type { Meta, StoryObj } from '@storybook/react-vite'
import { CardView } from '../../components/molecules/CardView'
import type { AnyCatalogItem } from '../../data/types'

const mockItems: AnyCatalogItem[] = [
  {
    id: 'a1', name: 'Fifth Avenue Penthouse', organizationId: 'org-1', categoryKey: 'property',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=240&fit=crop',
    description: 'Primary residence at 834 Fifth Avenue, NYC.',
    createdAt: '2026-01-15T10:00:00Z', createdBy: { id: 'u1', name: 'Edward Thornton III' },
    assetType: 'Real Estate', value: 32_000_000,
  } as AnyCatalogItem,
  {
    id: 'a2', name: 'Hamptons Estate', organizationId: 'org-1', categoryKey: 'property',
    description: '$18M waterfront property used as a seasonal residence.',
    createdAt: '2026-02-10T14:00:00Z', createdBy: { id: 'u1', name: 'Edward Thornton III' },
    assetType: 'Real Estate', value: 18_000_000,
  } as AnyCatalogItem,
  {
    id: 't1', name: 'Thornton Family RLT', organizationId: 'org-1', categoryKey: 'trust',
    description: 'Cornerstone of the Thornton estate plan.',
    createdAt: '2025-11-02T08:30:00Z', createdBy: { id: 'u2', name: 'Sarah Mitchell' },
  } as AnyCatalogItem,
  {
    id: 'p1', name: 'Edward Thornton III', organizationId: 'org-1', categoryKey: 'person',
    description: 'Grantor and primary trustee.',
    createdAt: '2025-11-01T09:00:00Z', createdBy: { id: 'u2', name: 'Sarah Mitchell' },
  } as AnyCatalogItem,
]

/**
 * ## CardView
 *
 * ### What it does
 * Grid layout of CatalogCard components with lazy-loading via intersection observer
 * pagination. Shows a loading skeleton state and adjusts grid width when the chat
 * panel is open. Supports an optional collections header rendered above the grid.
 *
 * ### Key behaviors
 * - Paginated rendering (9 items per page, loads more on scroll)
 * - Loading skeleton state via `isLoading`
 * - Grid adapts width when `isChatOpen` is true
 * - Optional `highlightedIds` set for visual emphasis
 * - Optional `collectionsHeader` content above grid
 *
 * ### Tokens used
 * Uses `.cards-section`, `.cards-grid`, `.cards-grid--wide` CSS classes
 *
 */
const meta: Meta<typeof CardView> = {
  title: 'Molecules/CardView',
  component: CardView,
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object', description: 'Array of AnyCatalogItem objects' },
    onItemClick: { action: 'item-clicked', description: 'Callback when a card is clicked' },
    isLoading: { control: 'boolean', description: 'Show skeleton loading state' },
    isChatOpen: { control: 'boolean', description: 'Adjust grid width for chat panel' },
    highlightedIds: { control: false, description: 'Set of item IDs to visually highlight' },
    collectionsHeader: { control: false, description: 'Optional ReactNode above the grid' },
  },
}

export default meta
type Story = StoryObj<typeof CardView>

export const Default: Story = {
  args: {
    items: mockItems,
    isLoading: false,
    isChatOpen: false,
  },
}

export const Loading: Story = {
  args: {
    items: [],
    isLoading: true,
    isChatOpen: false,
  },
}

export const WithHighlights: Story = {
  args: {
    items: mockItems,
    isLoading: false,
    highlightedIds: new Set(['a1', 't1']),
  },
}
