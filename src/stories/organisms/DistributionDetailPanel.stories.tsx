import type { Meta, StoryObj } from '@storybook/react-vite'
import { DistributionDetailPanel } from '../../components/organisms/DistributionDetailPanel'
import type { DistributionEvent, AnyCatalogItem } from '../../data/types'

const mockBeneficiary: AnyCatalogItem = {
  id: 'thn-p4',
  name: 'Edward Thornton IV',
  organizationId: 'org-thornton',
  categoryKey: 'person',
  description: 'Eldest son. Managing partner of Thornton Capital Group.',
  createdAt: '2024-03-01',
  createdBy: { id: 'ai', name: 'Fojo AI' },
} as AnyCatalogItem

const mockTrust: AnyCatalogItem = {
  id: 'thn-t2',
  name: 'Thornton Dynasty Trust I',
  organizationId: 'org-thornton',
  categoryKey: 'trust',
  description: 'Perpetual trust under South Dakota law for Marriage 1 descendants.',
  createdAt: '2024-03-01',
  createdBy: { id: 'ai', name: 'Fojo AI' },
} as AnyCatalogItem

const mockEvent: DistributionEvent = {
  id: 'thn-d1',
  beneficiaryId: 'thn-p4',
  trustId: 'thn-t2',
  triggerType: 'Age',
  triggerAge: 35,
  triggerYear: 2028,
  amount: 2_000_000,
  description: 'Age-based distribution from Dynasty Trust I to Edward Thornton IV.',
  status: 'Pending',
  citationItemId: 'thn-t2',
}

const mockEventNoAmount: DistributionEvent = {
  id: 'thn-d2',
  beneficiaryId: 'thn-p4',
  trustId: 'thn-t2',
  triggerType: 'Event',
  triggerEvent: "Grantor's death",
  amount: 'Remainder',
  description: 'Remainder interest passes upon grantor\'s death.',
  status: 'Pending',
  citationItemId: 'thn-t2',
}

/**
 * ## DistributionDetailPanel
 *
 * ### What it does
 * Slide-in detail panel for a single distribution event from the Timeline page.
 * Shows event type, beneficiary name, dollar amount, description, and two tabs:
 * Sources (citation cards from the trust document) and Overview (trigger details,
 * year, and relationship cards for beneficiary + source trust).
 *
 * ### Key behaviors
 * - Tabs switch between Sources and Overview
 * - Relationship cards display beneficiary and source trust
 * - Empty sources state shows "No source documents linked"
 *
 * ### Tokens used
 * `--color-gray-12` (title), `--color-accent-9` (amount), `--color-neutral-11` (labels),
 * `--color-gray-4` (borders), `--font-weight-bold`, `--font-weight-semibold`,
 * `--spacing-2`, `--spacing-3`, `--spacing-4`, `--spacing-6`, `--spacing-8`
 *
 */
const meta: Meta<typeof DistributionDetailPanel> = {
  title: 'Organisms/DistributionDetailPanel',
  component: DistributionDetailPanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DistributionDetailPanel>

export const AgeBased: Story = {
  args: {
    event: mockEvent,
    beneficiary: mockBeneficiary,
    trust: mockTrust,
    isOpen: true,
    onClose: () => {},
  },
}

export const EventBased: Story = {
  args: {
    event: mockEventNoAmount,
    beneficiary: mockBeneficiary,
    trust: mockTrust,
    isOpen: true,
    onClose: () => {},
  },
}