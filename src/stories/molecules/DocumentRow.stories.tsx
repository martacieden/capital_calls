import type { Meta, StoryObj } from '@storybook/react-vite'
import { DocumentRow } from '../../components/molecules/DocumentRow'
import type { DocumentRecord } from '../../data/thornton/documents-data'

const mockDoc: DocumentRecord = {
  id: 'doc-family-trust',
  fileName: 'family-trust-agreement.pdf',
  name: 'Family Trust Agreement',
  description: 'Thornton Family Revocable Living Trust agreement.',
  fileType: 'PDF',
  pageCount: 42,
  uploadedBy: { name: 'Sandra Whitfield', initials: 'SW' },
  uploadedOn: '2026-03-15',
  organizationId: 'org-thornton',
  organizationName: 'Thornton Family',
  sharedWith: [],
  attachedItemIds: ['thn-t1', 'thn-p1', 'thn-e1'],
  status: 'Available',
  collections: ['trust-documents'],
}

const mockDocWithAlert: DocumentRecord = {
  ...mockDoc,
  id: 'doc-insurance',
  name: 'Insurance Policies',
  description: 'Umbrella liability and property insurance policy schedules.',
  attachedItemIds: ['thn-a1'],
  priorityStatus: { type: 'expiring-soon', detail: 'Policy renewal due in 30 days' },
}

/**
 * ## DocumentRow
 *
 * ### What it does
 * Table row component for the document list view. Displays a PDF icon, document name,
 * description (truncated), file type badge, linked item count, uploader info with
 * initials avatar, and upload date. Supports optional priority badge.
 *
 * ### Key behaviors
 * - Clickable row with pointer cursor
 * - PDF icon with blue tint background
 * - File type badge (blue pill)
 * - Linked items count with chain icon
 * - Priority badge inline with name
 * - Optional `hideType` to hide file type column
 *
 * ### Tokens used
 * `--color-accent-9`, `--color-blue-1`, `--color-neutral-3`, `--color-neutral-11`,
 * `--color-gray-12`, `--radius-2xl`, `--font-weight-bold`, `--font-weight-medium`
 *
 */
const meta: Meta<typeof DocumentRow> = {
  title: 'Molecules/DocumentRow',
  component: DocumentRow,
  tags: ['autodocs'],
  argTypes: {
    doc: { control: 'object', description: 'DocumentRecord data object' },
    onClick: { action: 'clicked', description: 'Row click handler' },
    hideType: { control: 'boolean', description: 'Hide the file type column' },
  },
  decorators: [
    (Story) => (
      <table className="list-table" style={{ width: '100%' }}>
        <tbody>
          <Story />
        </tbody>
      </table>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DocumentRow>

export const Default: Story = {
  args: { doc: mockDoc },
}

export const WithPriorityAlert: Story = {
  args: { doc: mockDocWithAlert },
}

