import type { Meta, StoryObj } from '@storybook/react-vite'
import { ListView } from '../../components/molecules/ListView'
import type { AnyCatalogItem } from '../../data/types'

const mockItems: AnyCatalogItem[] = [
  {
    id: 'a1', name: 'Fifth Avenue Penthouse', organizationId: 'org-1', categoryKey: 'property',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=240&fit=crop',
    description: 'Primary residence at 834 Fifth Avenue.',
    createdAt: '2026-01-15T10:00:00Z', createdBy: { id: 'u1', name: 'Edward Thornton III' },
    reviewStatus: 'reviewed',
  } as AnyCatalogItem,
  {
    id: 'a2', name: 'Hamptons Estate', organizationId: 'org-1', categoryKey: 'property',
    description: '$18M waterfront property.',
    createdAt: '2026-02-10T14:00:00Z', createdBy: { id: 'u1', name: 'Edward Thornton III' },
    priorityStatus: { type: 'expiring-soon', detail: 'Insurance expires in 47 days' },
  } as AnyCatalogItem,
  {
    id: 't1', name: 'Thornton Family RLT', organizationId: 'org-1', categoryKey: 'trust',
    description: 'Cornerstone of the Thornton estate plan.',
    createdAt: '2025-11-02T08:30:00Z', createdBy: { id: 'u2', name: 'Sarah Mitchell' },
    reviewStatus: 'unreviewed',
  } as AnyCatalogItem,
  {
    id: 'p1', name: 'Edward Thornton III', organizationId: 'org-1', categoryKey: 'person',
    description: 'Grantor and primary trustee.',
    createdAt: '2025-11-01T09:00:00Z', createdBy: { id: 'u2', name: 'Sarah Mitchell' },
  } as AnyCatalogItem,
  {
    id: 'e1', name: 'Thornton Family Office LLC', organizationId: 'org-1', categoryKey: 'entity',
    description: 'Central management entity.',
    createdAt: '2025-12-01T10:00:00Z', createdBy: { id: 'u2', name: 'Sarah Mitchell' },
  } as AnyCatalogItem,
]

/**
 * ## ListView
 *
 * ### What it does
 * Table layout for catalog items with columns: Name (with avatar/icon, priority badge,
 * and unreviewed badge), Category (pill badge), Created By, and Date. Supports lazy-loading
 * pagination via intersection observer. Shows loading skeleton state.
 *
 * ### Key behaviors
 * - Paginated rendering (9 per page, loads on scroll)
 * - Loading skeleton via `isLoading`
 * - Category icon avatars or item images
 * - Priority badge and "Unreviewed" badge inline
 * - Keyboard accessible rows (Enter/Space to activate)
 * - Optional `collectionsHeader` above table
 *
 * ### Tokens used
 * Uses `.list-view`, `.list-table`, `.list-row`, `.list-cell`, `.list-header-row`,
 * `.list-header-cell`, `.list-avatar-mini`, `.unreviewed-badge` CSS classes
 *
 */
const meta: Meta<typeof ListView> = {
  title: 'Molecules/ListView',
  component: ListView,
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object', description: 'Array of AnyCatalogItem objects' },
    onItemClick: { action: 'item-clicked', description: 'Callback when a row is clicked' },
    isLoading: { control: 'boolean', description: 'Show skeleton loading state' },
    collectionsHeader: { control: false, description: 'Optional ReactNode above the table' },
  },
}

export default meta
type Story = StoryObj<typeof ListView>

export const Default: Story = {
  args: {
    items: mockItems,
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    items: [],
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    items: [],
    isLoading: false,
  },
}
