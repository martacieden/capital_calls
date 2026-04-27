import type { Meta, StoryObj } from '@storybook/react-vite'
import { CollectionCard } from '../../components/molecules/CollectionCard'

/**
 * ## CollectionCard
 *
 * ### What it does
 * Card component for displaying a collection (group of items). Shows an icon
 * (Tabler icon, emoji, or DocuSign logo), label, optional description, item count,
 * and an optional priority badge. Includes a three-dot menu with edit, share,
 * duplicate, and delete actions.
 *
 * ### Key behaviors
 * - Three-dot menu with contextual actions (edit, share, duplicate, delete)
 * - Click-outside closes menu
 * - Supports Tabler icons, emoji icons, and special DocuSign logo
 * - Priority badge positioned at bottom-right
 * - Custom count label (e.g. "documents" instead of "items")
 *
 * ### Tokens used
 * `--color-gray-4`, `--color-gray-12`, `--color-neutral-3`, `--color-neutral-11`,
 * `--color-neutral-12`, `--color-red-9`, `--radius-md`, `--radius-sm`,
 * `--spacing-2`, `--spacing-3`, `--spacing-5`, `--shadow-dropdown`,
 * `--font-weight-semibold`
 *
 */
const meta: Meta<typeof CollectionCard> = {
  title: 'Molecules/CollectionCard',
  component: CollectionCard,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Collection display name' },
    icon: { control: 'text', description: 'Tabler icon name, emoji, or "DocuSign"' },
    count: { control: 'number', description: 'Number of items in collection' },
    countLabel: { control: 'text', description: 'Custom unit label (e.g. "documents")' },
    description: { control: 'text', description: 'Optional description text' },
    priorityStatus: { control: 'object', description: 'Optional priority badge status' },
    onClick: { action: 'clicked', description: 'Callback when card body is clicked' },
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
type Story = StoryObj<typeof CollectionCard>

export const Default: Story = {
  args: {
    label: 'Trust Documents',
    icon: 'IconFileText',
    count: 12,
    description: 'Trust agreements, amendments, and governing instruments.',
  },
}

export const WithEmoji: Story = {
  args: {
    label: 'Insurance Policies',
    icon: '\u{1F6E1}\uFE0F',
    count: 5,
    countLabel: 'documents',
    description: 'Life insurance, umbrella liability, and property insurance policies.',
  },
}

export const WithPriorityBadge: Story = {
  args: {
    label: 'Expiring Documents',
    icon: 'IconAlertTriangle',
    count: 3,
    priorityStatus: { type: 'expiring-soon', detail: 'Trust amendment deadline approaching May 1' },
    description: 'Documents requiring urgent attention.',
  },
}

export const DocuSignCollection: Story = {
  args: {
    label: 'Signatures',
    icon: 'DocuSign',
    count: 0,
    description: 'Documents requiring electronic signatures via DocuSign.',
  },
}
