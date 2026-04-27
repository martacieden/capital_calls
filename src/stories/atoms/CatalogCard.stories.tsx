import type { Meta, StoryObj } from '@storybook/react-vite'
import { CatalogCard } from '../../components/atoms/CatalogCard'
import type { AnyCatalogItem } from '../../data/types'

const mockItem: AnyCatalogItem = {
  id: 'thn-a1',
  name: 'Fifth Avenue Penthouse',
  organizationId: 'org-thornton',
  categoryKey: 'property',
  imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=240&fit=crop',
  description: 'Primary residence at 834 Fifth Avenue, NYC. 6,200 sq ft penthouse with Central Park views.',
  createdAt: '2026-01-15T10:00:00Z',
  createdBy: { id: 'u1', name: 'Edward Thornton III' },
  reviewStatus: 'reviewed',
  assetType: 'Real Estate',
  value: 32_000_000,
} as AnyCatalogItem

const mockItemNoImage: AnyCatalogItem = {
  id: 'thn-t1',
  name: 'Thornton Family Revocable Living Trust',
  organizationId: 'org-thornton',
  categoryKey: 'trust',
  description: 'Cornerstone of the Thornton estate plan, holding direct ownership of the Family Office LLC.',
  createdAt: '2025-11-02T08:30:00Z',
  createdBy: { id: 'u2', name: 'Sarah Mitchell', avatarUrl: undefined },
} as AnyCatalogItem

const mockItemWithAlert: AnyCatalogItem = {
  id: 'thn-a2',
  name: 'Hamptons Estate',
  organizationId: 'org-thornton',
  categoryKey: 'property',
  description: '$18M waterfront property used as a seasonal residence.',
  createdAt: '2026-02-10T14:00:00Z',
  createdBy: { id: 'u1', name: 'Edward Thornton III' },
  priorityStatus: { type: 'expiring-soon', detail: 'Insurance expires in 47 days' },
  assetType: 'Real Estate',
  value: 18_000_000,
} as AnyCatalogItem

/**
 * ## CatalogCard
 *
 * ### What it does
 * Renders a single catalog item as a grid card with cover image (or icon placeholder),
 * name, category label, optional "Unreviewed" badge, description excerpt, creator avatar,
 * and creation date. Supports priority alert badges in the top-right corner.
 *
 * ### Key behaviors
 * - Click / Enter / Space activates `onClick`
 * - Image error fallback: hides broken img, shows icon placeholder
 * - Priority badge appears top-right for alert-type statuses
 * - "Unreviewed" badge appears next to the name
 * - Three-dot menu button stops event propagation
 *
 * ### Tokens used
 * `--color-neutral-3` (placeholder bg), `--color-neutral-11` (icon/text), `--color-neutral-12` (name),
 * `--color-gray-4` (border), `--color-white` (avatar border), `--color-gray-11` (initials),
 * `--spacing-4`, `--spacing-2`, `--spacing-1`, `--radius-sm`,
 * `--font-weight-semibold` (name), `--font-weight-medium` (category/date), `--font-weight-regular` (description)
 *
 */
const meta: Meta<typeof CatalogCard> = {
  title: 'Atoms/CatalogCard',
  component: CatalogCard,
  tags: ['autodocs'],
  argTypes: {
    item: { control: 'object', description: 'AnyCatalogItem data object to display' },
    onClick: { action: 'clicked', description: 'Callback when the card is activated' },
    isHighlighted: { control: 'boolean', description: 'Whether the card has a highlighted visual state' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CatalogCard>

export const Default: Story = {
  args: {
    item: mockItem,
  },
}

export const WithoutImage: Story = {
  args: {
    item: mockItemNoImage,
  },
}

export const WithPriorityAlert: Story = {
  args: {
    item: mockItemWithAlert,
  },
}

export const Highlighted: Story = {
  args: {
    item: mockItem,
    isHighlighted: true,
  },
}
