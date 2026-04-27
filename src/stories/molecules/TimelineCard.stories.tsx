import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimelineCard } from '../../components/molecules/TimelineCard'
import type { DistributionEvent, AnyCatalogItem } from '../../data/types'

const mockBeneficiary: AnyCatalogItem = {
  id: 'thn-p3', name: 'Andrew Thornton', organizationId: 'org-1', categoryKey: 'person',
  description: 'Eldest son of Edward Thornton IV.',
  createdAt: '2025-11-01', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
  age: 23,
} as AnyCatalogItem

const mockTrust: AnyCatalogItem = {
  id: 'thn-t2', name: 'Dynasty Trust I', organizationId: 'org-1', categoryKey: 'trust',
  description: 'Long-term wealth preservation trust.',
  createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
} as AnyCatalogItem

const ageEvent: DistributionEvent = {
  id: 'de-1', beneficiaryId: 'thn-p3', trustId: 'thn-t2',
  triggerAge: 25, triggerYear: 2027, triggerType: 'Age',
  amount: 500_000, description: 'Initial distribution at age 25 for education and living expenses.',
  status: 'Pending',
}

const eventBasedEvent: DistributionEvent = {
  id: 'de-2', beneficiaryId: 'thn-p3', trustId: 'thn-t2',
  triggerEvent: 'Marriage', triggerCategory: 'Marriage', triggerType: 'Event',
  amount: 1_000_000, description: 'Distribution upon marriage for home purchase.',
  status: 'Pending',
}

const remainderEvent: DistributionEvent = {
  id: 'de-3', beneficiaryId: 'thn-p3', trustId: 'thn-t2',
  triggerAge: 40, triggerYear: 2042, triggerType: 'Age',
  amount: 'Remainder', description: 'Full remainder of trust corpus distributed at age 40.',
  status: 'Pending',
}

/**
 * ## TimelineCard
 *
 * ### What it does
 * Card component for individual distribution events on the timeline view. Shows
 * beneficiary avatar/initials, distribution type label, amount (formatted as currency,
 * "Remainder", or custom string), description, and a source document chip. Includes
 * a three-dots action menu with hover reveal and double-click activation.
 *
 * ### Key behaviors
 * - Beneficiary avatar with initials fallback
 * - Distribution type label (age-based, event-based)
 * - Amount formatting: $500K, $1M, "Remainder", "Income for life"
 * - Source document chip with "+N" badge
 * - Three-dots menu on hover (opens CardActionsMenu for timeline context)
 * - Double-click opens menu
 * - Single click triggers onClick
 * - Card hover lift effect
 *
 * ### Tokens used
 * `--color-white`, `--color-gray-4`, `--color-gray-5`, `--color-gray-12`,
 * `--color-neutral-3`, `--color-neutral-4`, `--color-neutral-11`, `--color-accent-9`,
 * `--color-blue-1`, `--radius-lg`, `--radius-md`, `--radius-sm`,
 * `--shadow-card-hover`
 *
 */
const meta: Meta<typeof TimelineCard> = {
  title: 'Molecules/TimelineCard',
  component: TimelineCard,
  tags: ['autodocs'],
  argTypes: {
    event: { control: false, description: 'DistributionEvent object' },
    beneficiary: { control: false, description: 'AnyCatalogItem for the beneficiary' },
    trust: { control: false, description: 'AnyCatalogItem for the trust' },
    onClick: { action: 'clicked', description: 'Card click handler' },
    onDoubleClick: { action: 'double-clicked', description: 'Card double-click handler' },
    onAction: { action: 'action-triggered', description: 'Card action menu handler' },
    pinActionsButtonVisible: { control: 'boolean', description: 'Force show three-dots button' },
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
type Story = StoryObj<typeof TimelineCard>

export const AgeBasedDistribution: Story = {
  args: {
    event: ageEvent,
    beneficiary: mockBeneficiary,
    trust: mockTrust,
  },
}

export const EventBasedDistribution: Story = {
  args: {
    event: eventBasedEvent,
    beneficiary: mockBeneficiary,
    trust: mockTrust,
  },
}

export const RemainderDistribution: Story = {
  args: {
    event: remainderEvent,
    beneficiary: mockBeneficiary,
    trust: mockTrust,
  },
}

export const WithActionsVisible: Story = {
  args: {
    event: ageEvent,
    beneficiary: mockBeneficiary,
    trust: mockTrust,
    pinActionsButtonVisible: true,
  },
}
