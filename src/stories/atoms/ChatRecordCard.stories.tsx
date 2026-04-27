import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatRecordCard } from '../../components/atoms/ChatRecordCard'
import type { AnyCatalogItem } from '../../data/types'

const mockTrust: AnyCatalogItem = {
  id: 'thn-t1',
  name: 'Thornton Family Revocable Living Trust',
  organizationId: 'org-thornton',
  categoryKey: 'trust',
  createdAt: '2026-01-15T10:00:00Z',
  createdBy: { id: 'u1', name: 'Edward Thornton III' },
} as AnyCatalogItem

/**
 * ## ChatRecordCard
 *
 * ### What it does
 * Compact inline card shown inside Fojo chat messages when referencing a catalog item.
 * Displays the item's icon, name, organization, and category with optional metadata
 * and detail text (e.g. value, status).
 *
 * ### Key behaviors
 * - Hover: background changes to `--color-primary-2`
 * - Icon resolved from category definition or explicit `icon` prop
 * - Organization name resolved from `organizations` data
 * - `meta` overrides the default "Family + Category" subtitle
 * - `detail` renders after the subtitle with optional custom color
 *
 * ### Tokens used
 * `--color-neutral-4` (border), `--color-white` (bg), `--color-accent-hover` (hover bg),
 * `--radius-lg` (corners), `--radius-md` (icon bg), `--color-accent-3` (icon bg),
 * `--color-neutral-11` (subtitle/icon), `--color-neutral-12` (name)
 *
 */
const meta: Meta<typeof ChatRecordCard> = {
  title: 'Atoms/ChatRecordCard',
  component: ChatRecordCard,
  tags: ['autodocs'],
  argTypes: {
    item: { control: 'object', description: 'AnyCatalogItem to display' },
    icon: { control: 'text', description: 'Optional Tabler icon name override (e.g. "IconShield")' },
    meta: { control: 'text', description: 'Override for the subtitle text (replaces "Family + Category")' },
    detail: { control: 'text', description: 'Extra detail text appended after subtitle' },
    detailColor: { control: 'color', description: 'Color for the detail text' },
    onClick: { action: 'clicked', description: 'Callback when the card is clicked' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChatRecordCard>

export const Default: Story = {
  args: {
    item: mockTrust,
  },
}

export const Hovered: Story = {
  render: () => (
    <div className="max-w-[360px] p-4 [&>div>div]:bg-[var(--color-accent-hover)]">
      <ChatRecordCard item={mockTrust} />
    </div>
  ),
}

