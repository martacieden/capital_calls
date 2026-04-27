import type { Meta, StoryObj } from '@storybook/react-vite'
import { DocumentDetailPanel } from '../../components/organisms/DocumentDetailPanel'
import type { DocumentRecord } from '../../data/thornton/documents-data'

const mockDoc: DocumentRecord = {
  id: 'doc-family-trust',
  fileName: 'family-trust-agreement.pdf',
  name: 'Family Trust Agreement',
  description:
    'Thornton Family Revocable Living Trust agreement establishing trust structure, beneficiary designations, and distribution schedules.',
  fileType: 'PDF',
  pageCount: 42,
  uploadedBy: { name: 'Sandra Whitfield', initials: 'SW' },
  uploadedOn: '2026-03-15',
  organizationId: 'org-thornton',
  organizationName: 'Thornton Family',
  sharedWith: [
    { name: 'Edward Thornton IV', initials: 'ET' },
    { name: 'Michael Chen', initials: 'MC' },
  ],
  attachedItemIds: ['thn-t1'],
  status: 'Available',
  collections: [],
  thumbnailPdf: '/documents/family-trust-agreement-p1-thn-t1.pdf',
}

const mockDocNoPdf: DocumentRecord = {
  id: 'doc-inventory',
  fileName: 'inventory-list-2026.pdf',
  name: 'Inventory List 2026',
  description: 'Annual inventory of tangible and intangible assets held across Thornton family entities.',
  fileType: 'PDF',
  pageCount: 15,
  uploadedBy: { name: 'Sandra Whitfield', initials: 'SW' },
  uploadedOn: '2026-03-15',
  organizationId: 'org-thornton',
  organizationName: 'Thornton Family',
  sharedWith: [],
  attachedItemIds: [],
  status: 'Available',
  collections: [],
}

/**
 * ## DocumentDetailPanel
 *
 * ### What it does
 * Slide-in panel for previewing a document record. Shows the document name,
 * description, and an embedded PDF viewer with zoom controls. For trust documents,
 * an optional "View in timeline" footer button appears.
 *
 * ### Key behaviors
 * - PDF rendered via react-pdf with zoom in/out controls
 * - Falls back to file icon + filename when PDF is unavailable or fails to load
 * - Breadcrumb with "Documents" root and document name
 * - Optional "View in timeline" button for trust documents
 *
 * ### Tokens used
 * `--color-gray-12` (title), `--color-neutral-11` (description),
 * `--color-gray-4` (borders), `--color-neutral-2` (PDF bg), `--color-neutral-3` (hover),
 * `--color-accent-9` (PDF icon), `--radius-md`, `--shadow-subtle`,
 * `--font-weight-bold`, `--spacing-3`, `--spacing-6`
 *
 */
const meta: Meta<typeof DocumentDetailPanel> = {
  title: 'Organisms/DocumentDetailPanel',
  component: DocumentDetailPanel,
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
type Story = StoryObj<typeof DocumentDetailPanel>

export const Default: Story = {
  args: {
    doc: mockDoc,
    isOpen: true,
    onClose: () => {},
    isTrustDoc: false,
  },
}

export const TrustDocWithTimeline: Story = {
  args: {
    doc: mockDoc,
    isOpen: true,
    onClose: () => {},
    isTrustDoc: true,
    onViewTimeline: () => {},
  },
}

export const NoPdfAttached: Story = {
  args: {
    doc: mockDocNoPdf,
    isOpen: true,
    onClose: () => {},
    isTrustDoc: false,
  },
}

