import type { Meta, StoryObj } from '@storybook/react-vite'
import { AssetTimelineStrip } from '../../components/molecules/AssetTimelineStrip'
import type { AssetTimelineEvent } from '../../data/types'

const mockEvents: AssetTimelineEvent[] = [
  { id: 'ate-1', assetId: 'a1', year: 2018, label: 'Purchased', value: 28_000_000 },
  { id: 'ate-2', assetId: 'a1', year: 2020, label: 'Renovated', value: 30_500_000 },
  { id: 'ate-3', assetId: 'a1', year: 2023, label: 'Appraised', value: 32_000_000 },
  { id: 'ate-4', assetId: 'a1', year: 2026, label: 'Current Value', value: 34_000_000 },
  { id: 'ate-5', assetId: 'a1', year: 2028, label: 'Projected Sale' },
]

/**
 * ## AssetTimelineStrip
 *
 * ### What it does
 * Horizontal scrollable timeline strip showing key events for a specific asset.
 * Displays chronologically sorted events as dots on a line with year labels and
 * optional formatted dollar values. Inserts a "Now" marker at the current year position.
 *
 * ### Key behaviors
 * - Horizontal drag-to-scroll (grab cursor)
 * - "Now" marker inserted at current year boundary
 * - Dollar values formatted as $XM / $XK
 * - Returns null when events array is empty
 * - Absolutely positioned within parent container
 *
 * ### Tokens used
 * `--color-white`, `--color-gray-4`, `--color-gray-5`, `--color-gray-12`,
 * `--color-accent-9`, `--color-blue-3`, `--color-neutral-3`, `--color-neutral-11`,
 * `--shadow-subtle`, `--spacing-5`, `--radius-md`, `--radius-full`,
 * `--font-weight-semibold`, `--font-weight-medium`, `--font-weight-bold`
 *
 */
const meta: Meta<typeof AssetTimelineStrip> = {
  title: 'Molecules/AssetTimelineStrip',
  component: AssetTimelineStrip,
  tags: ['autodocs'],
  argTypes: {
    events: { control: 'object', description: 'Array of AssetTimelineEvent objects' },
    assetName: { control: 'text', description: 'Name displayed in the strip header' },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 200, width: '100%', background: 'var(--color-neutral-2)' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AssetTimelineStrip>

export const Default: Story = {
  args: {
    events: mockEvents,
    assetName: 'Fifth Avenue Penthouse',
  },
}

export const SingleEvent: Story = {
  args: {
    events: [{ id: 'ate-1', assetId: 'a1', year: 2024, label: 'Purchased', value: 5_000_000 }],
    assetName: 'Tesla Model X',
  },
}

