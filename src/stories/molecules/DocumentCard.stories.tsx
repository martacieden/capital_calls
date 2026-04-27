import type { Meta, StoryObj } from '@storybook/react-vite'
import { DocumentCard } from '../../components/molecules/DocumentCard'
import type { DocumentRecord } from '../../data/thornton/documents-data'

const mockDoc: DocumentRecord = {
  id: 'doc-family-trust',
  fileName: 'family-trust-agreement.pdf',
  name: 'Family Trust Agreement',
  description: 'Thornton Family Revocable Living Trust agreement establishing trust structure, beneficiary designations, and distribution schedules.',
  fileType: 'PDF',
  pageCount: 42,
  uploadedBy: { name: 'Sandra Whitfield', initials: 'SW' },
  uploadedOn: '2026-03-15',
  organizationId: 'org-thornton',
  organizationName: 'Thornton Family',
  sharedWith: [{ name: 'Edward Thornton IV', initials: 'ET' }],
  attachedItemIds: ['thn-t1', 'thn-p1'],
  status: 'Available',
  collections: ['trust-documents'],
}

const mockDocWithAlert: DocumentRecord = {
  ...mockDoc,
  id: 'doc-insurance',
  name: 'Insurance Policies',
  description: 'Umbrella liability and property insurance policy schedules.',
  priorityStatus: { type: 'expiring-soon', detail: 'Policy renewal due in 30 days' },
}

/**
 * ## DocumentCard
 *
 * ### What it does
 * Card component for displaying a document with a PDF thumbnail preview (rendered
 * via react-pdf), name, description, uploader avatar with initials, and upload date.
 * Caches rendered PDF thumbnails as data URLs at the module level for performance.
 *
 * ### Key behaviors
 * - PDF first page rendered as thumbnail via react-pdf
 * - Module-level thumbnail caching (canvas to dataURL)
 * - Fallback placeholder on PDF error
 * - Priority badge in top-right corner
 * - Three-dot menu button (stops propagation)
 * - Uploader initials avatar
 *
 * ### Tokens used
 * `--color-neutral-3`, `--color-neutral-11`, `--color-neutral-12`, `--color-gray-4`,
 * `--color-gray-11`, `--color-white`, `--radius-sm`, `--spacing-1`, `--spacing-2`,
 * `--spacing-4`, `--font-weight-semibold`, `--font-weight-medium`, `--font-weight-regular`
 *
 */
const meta: Meta<typeof DocumentCard> = {
  title: 'Molecules/DocumentCard',
  component: DocumentCard,
  tags: ['autodocs'],
  argTypes: {
    doc: { control: 'object', description: 'DocumentRecord data object' },
    onClick: { action: 'clicked', description: 'Callback when card is clicked' },
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
type Story = StoryObj<typeof DocumentCard>

export const Default: Story = {
  args: { doc: mockDoc },
}

export const WithPriorityAlert: Story = {
  args: { doc: mockDocWithAlert },
}

