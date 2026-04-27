import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimelineStrip } from '../../components/molecules/TimelineStrip'
import type { DistributionEvent, AnyCatalogItem } from '../../data/types'

const mockDistributions: DistributionEvent[] = [
  {
    id: 'de-1', beneficiaryId: 'thn-p3', trustId: 'thn-t2',
    triggerAge: 25, triggerYear: 2027, triggerType: 'Age',
    amount: 500_000, description: 'Initial distribution.', status: 'Pending',
  },
  {
    id: 'de-2', beneficiaryId: 'thn-p4', trustId: 'thn-t2',
    triggerAge: 25, triggerYear: 2029, triggerType: 'Age',
    amount: 500_000, description: 'Initial distribution.', status: 'Pending',
  },
  {
    id: 'de-3', beneficiaryId: 'thn-p3', trustId: 'thn-t2',
    triggerAge: 30, triggerYear: 2032, triggerType: 'Age',
    amount: 1_000_000, description: 'Second distribution.', status: 'Pending',
  },
  {
    id: 'de-4', beneficiaryId: 'thn-p3', trustId: 'thn-t2',
    triggerType: 'Event', triggerCategory: 'Marriage',
    amount: 1_000_000, description: 'Marriage distribution.', status: 'Pending',
  },
]

const itemMap: Record<string, AnyCatalogItem> = {
  'thn-p3': {
    id: 'thn-p3', name: 'Andrew Thornton', organizationId: 'org-1', categoryKey: 'person',
    createdAt: '2025-11-01', createdBy: { id: 'u1', name: 'SW' },
  } as AnyCatalogItem,
  'thn-p4': {
    id: 'thn-p4', name: 'Sarah Thornton', organizationId: 'org-1', categoryKey: 'person',
    createdAt: '2025-11-01', createdBy: { id: 'u1', name: 'SW' },
  } as AnyCatalogItem,
}

/**
 * ## TimelineStrip
 *
 * ### What it does
 * Compact horizontal timeline strip showing distribution events for a specific trust.
 * Displays chronologically sorted dots with beneficiary names and amounts. Includes
 * a "Now" marker, a "Life Events" section for conditional distributions, and a
 * "View full timeline" button. Empty state prompts user to select a trust.
 *
 * ### Key behaviors
 * - Horizontal drag-to-scroll
 * - "Now" marker at current year boundary
 * - "Life Events" separator for event-based distributions
 * - "View full timeline" button
 * - Trust name and pending count in header
 * - Amount formatting: $500K, $1M
 * - Beneficiary names truncated to first 2 words
 * - Empty state when no trust selected
 * - Sub-trust to parent trust mapping
 *
 * ### Tokens used
 * `--color-white`, `--color-gray-4`, `--color-gray-5`, `--color-gray-12`,
 * `--color-accent-9`, `--color-blue-1`, `--color-blue-3`, `--color-blue-hover`,
 * `--color-neutral-3`, `--color-neutral-9`, `--color-neutral-11`,
 * `--shadow-subtle`, `--radius-md`, `--radius-full`, `--spacing-5`,
 * `--font-weight-semibold`, `--font-weight-medium`, `--font-weight-bold`
 *
 */
const meta: Meta<typeof TimelineStrip> = {
  title: 'Molecules/TimelineStrip',
  component: TimelineStrip,
  tags: ['autodocs'],
  argTypes: {
    distributions: { control: false, description: 'Array of DistributionEvent objects' },
    getItemById: { control: false, description: 'Lookup function for items' },
    trustId: { control: 'text', description: 'ID of the selected trust' },
    trustName: { control: 'text', description: 'Display name of the selected trust' },
    onViewFullTimeline: { action: 'view-full-timeline' },
    isChatOpen: { control: 'boolean', description: 'Adjust position when chat is open' },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 120, background: 'var(--color-neutral-2)' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TimelineStrip>

export const Default: Story = {
  args: {
    distributions: mockDistributions,
    getItemById: (id: string) => itemMap[id] ?? null,
    trustId: 'thn-t2',
    trustName: 'Dynasty Trust I',
    isChatOpen: false,
  },
}

export const Empty: Story = {
  args: {
    distributions: [],
    getItemById: () => null,
    trustId: null,
    trustName: null,
    isChatOpen: false,
  },
}

