import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimelineNode } from '../../components/molecules/TimelineNode'
import type { DistributionEvent, AnyCatalogItem } from '../../data/types'

const mockBeneficiary: AnyCatalogItem = {
  id: 'thn-p3', name: 'Andrew Thornton', organizationId: 'org-1', categoryKey: 'person',
  description: 'Eldest son.', createdAt: '2025-11-01', createdBy: { id: 'u1', name: 'SW' },
  age: 23,
} as AnyCatalogItem

const mockTrust: AnyCatalogItem = {
  id: 'thn-t2', name: 'Dynasty Trust I', organizationId: 'org-1', categoryKey: 'trust',
  description: 'Long-term trust.', createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'SW' },
} as AnyCatalogItem

const mockEvent: DistributionEvent = {
  id: 'de-1', beneficiaryId: 'thn-p3', trustId: 'thn-t2',
  triggerAge: 25, triggerYear: 2027, triggerType: 'Age',
  amount: 500_000, description: 'Initial distribution at age 25.',
  status: 'Pending',
}

/**
 * ## TimelineNode
 *
 * ### What it does
 * Single node on the horizontal distribution timeline. Wraps a TimelineCard with
 * position context (above or below the timeline axis), a connecting stem line,
 * a dot anchor on the axis, and an optional year label. Uses Motion (framer-motion)
 * for scroll-triggered entrance animations.
 *
 * ### Key behaviors
 * - Above/below positioning relative to timeline axis
 * - Animated entrance (fade + slide) when scrolled into view
 * - Dot anchor with blue accent color
 * - Current year dot is larger with glow effect
 * - Year label pill (white bg, border) under/over dot
 * - Current year label has blue tint
 * - Snap-center for horizontal scroll snapping
 *
 * ### Tokens used
 * `--color-accent-9`, `--color-white`, `--color-gray-5`, `--color-neutral-11`,
 * `--radius-full`
 *
 */
const meta: Meta<typeof TimelineNode> = {
  title: 'Molecules/TimelineNode',
  component: TimelineNode,
  tags: ['autodocs'],
  argTypes: {
    event: { control: false, description: 'DistributionEvent object' },
    beneficiary: { control: false, description: 'Beneficiary catalog item' },
    trust: { control: false, description: 'Trust catalog item' },
    position: { control: 'select', options: ['above', 'below'], description: 'Position relative to axis' },
    showYearLabel: { control: 'boolean', description: 'Show year label pill' },
    isCurrentYear: { control: 'boolean', description: 'Current year styling for dot and label' },
    onSourceClick: { action: 'source-clicked' },
    onAction: { action: 'action-triggered' },
    pinActionsButtonVisible: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'center', height: 700, overflow: 'hidden', background: 'var(--color-neutral-2)' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TimelineNode>

export const AbovePosition: Story = {
  args: {
    event: mockEvent,
    beneficiary: mockBeneficiary,
    trust: mockTrust,
    position: 'above',
    showYearLabel: true,
    isCurrentYear: false,
  },
}

export const BelowPosition: Story = {
  args: {
    event: mockEvent,
    beneficiary: mockBeneficiary,
    trust: mockTrust,
    position: 'below',
    showYearLabel: true,
    isCurrentYear: false,
  },
}

