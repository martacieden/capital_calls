import type { Meta, StoryObj } from '@storybook/react-vite'
import { PriorityBadge } from '../../components/atoms/PriorityBadge'

/**
 * ## PriorityBadge
 *
 * ### What it does
 * Renders a priority status badge in two modes:
 * - **Full**: pill-shaped badge with text label (for list rows, detail headers)
 * - **Compact**: small circular icon-only badge with hover tooltip (for grid cards)
 *
 * Alert-type statuses (missing-insurance, stale-valuation, missing-documents, expiring-soon)
 * render in orange. The "updated" status renders in blue.
 *
 * ### Key behaviors
 * - Hover: shows a portal tooltip below the badge with `status.detail` text
 * - Tooltip positioned dynamically relative to the badge element
 * - Compact mode only renders for alert-type statuses (returns null for "updated" + compact)
 * - Full mode shows text label for all status types
 *
 * ### Tokens used
 * `--color-card-orange-bg` (alert badge bg), `--color-card-orange` (alert badge text/icon),
 * `--color-blue-3` (updated badge bg), `--color-accent-9` (updated badge text),
 * `--color-gray-12` (tooltip text), `--color-gray-4` (tooltip border),
 * `--radius-md` (tooltip corners), `--font-weight-medium` (badge text)
 *
 */
const meta: Meta<typeof PriorityBadge> = {
  title: 'Atoms/PriorityBadge',
  component: PriorityBadge,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'object', description: 'PriorityStatus object with type and detail text' },
    compact: { control: 'boolean', description: 'Render as compact icon-only badge (for card overlays)' },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PriorityBadge>

export const ExpiringSoon: Story = {
  args: {
    status: { type: 'expiring-soon', detail: 'Insurance policy expires in 47 days' },
    compact: false,
  },
}

export const CompactAlert: Story = {
  args: {
    status: { type: 'expiring-soon', detail: 'Chubb homeowners policy expires in 47 days' },
    compact: true,
  },
}
