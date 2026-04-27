import type { Meta, StoryObj } from '@storybook/react-vite'
import { FojoSummaryCard } from '../../components/atoms/FojoSummaryCard'
import type { AnyCatalogItem } from '../../data/types'

const mockPerson: AnyCatalogItem = {
  id: 'thn-p1',
  name: 'Edward Thornton III',
  organizationId: 'org-thornton',
  categoryKey: 'person',
  createdAt: '2025-11-02T08:30:00Z',
  createdBy: { id: 'u1', name: 'System Import' },
} as AnyCatalogItem

const mockPropertyWithAlert: AnyCatalogItem = {
  id: 'thn-a1',
  name: 'Fifth Avenue Penthouse',
  organizationId: 'org-thornton',
  categoryKey: 'property',
  createdAt: '2026-01-15T10:00:00Z',
  createdBy: { id: 'u1', name: 'System Import' },
  priorityStatus: { type: 'expiring-soon', detail: 'Chubb homeowners policy expires in 47 days' },
  assetType: 'Real Estate',
  value: 32_000_000,
} as AnyCatalogItem

/**
 * ## FojoSummaryCard
 *
 * ### What it does
 * Contextual summary card displayed in the Fojo side panel when viewing an asset detail page.
 * Shows an AI-generated summary paragraph for the item, plus an optional alert banner
 * when the item has an alert-type priority status (e.g. expiring insurance).
 *
 * ### Key behaviors
 * - Uses pre-written summaries for known item IDs (thn-p1, thn-t1, etc.)
 * - Falls back to a deterministic generated summary for unknown items
 * - Alert banner appears below the summary when `priorityStatus` is an alert type
 * - Summary text is clamped to 4 lines
 *
 * ### Tokens used
 * `--radius-lg` (card corners), `--color-accent-3` (summary bg), `--color-gray-12` (text),
 * `--color-card-orange` (alert icon/border), `--color-card-orange-bg` (alert bg),
 * `--color-orange-9` (alert text)
 *
 */
const meta: Meta<typeof FojoSummaryCard> = {
  title: 'Atoms/FojoSummaryCard',
  component: FojoSummaryCard,
  tags: ['autodocs'],
  argTypes: {
    item: { control: 'object', description: 'AnyCatalogItem whose summary and alert status to display' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380, padding: 16, background: 'var(--color-neutral-2)' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FojoSummaryCard>

export const Default: Story = {
  args: {
    item: mockPerson,
  },
}

export const WithAlert: Story = {
  args: {
    item: mockPropertyWithAlert,
  },
}

