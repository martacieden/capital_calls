import type { Meta, StoryObj } from '@storybook/react-vite'
import { PdfCitationPreview } from '../../components/molecules/PdfCitationPreview'
import type { Citation } from '../../data/citations'

const mockCitation: Citation = {
  itemId: 'thn-p1',
  documentName: 'family-trust-agreement.pdf',
  documentLabel: 'Family Trust Agreement',
  page: 3,
  excerpt: 'Edward Thornton III, hereinafter referred to as the "Grantor," being of sound mind and body, hereby establishes the Thornton Family Revocable Living Trust on this fifteenth day of March, Two Thousand and Twelve, for the benefit of his descendants and named beneficiaries as set forth herein.',
  highlightedText: 'Edward Thornton III, hereinafter referred to as the "Grantor,"',
}

/**
 * ## PdfCitationPreview
 *
 * ### What it does
 * Renders a PDF page preview for a specific citation. Attempts to load a single-page
 * PDF file from `/documents/`, and on failure falls back to an excerpt-based text
 * view with highlighted text spans. Includes zoom in/out controls and a page number
 * footer. Supports pinch-to-zoom and pan via usePdfZoomPan hook.
 *
 * ### Key behaviors
 * - PDF rendering via react-pdf with loading skeleton
 * - Fallback to text excerpt on PDF load error
 * - Highlighted text spans in fallback mode
 * - Zoom in/out buttons
 * - Zoom/pan via mouse drag
 * - Responsive width via ResizeObserver
 * - High DPI rendering (devicePixelRatio >= 2)
 *
 * ### Tokens used
 * `--color-white`, `--color-neutral-3`, `--color-neutral-11`,
 * Uses `.pdf-page`, `.pdf-page__canvas`, `.pdf-page__footer`, `.pdf-page__mark` CSS classes
 *
 */
const meta: Meta<typeof PdfCitationPreview> = {
  title: 'Molecules/PdfCitationPreview',
  component: PdfCitationPreview,
  tags: ['autodocs'],
  argTypes: {
    citation: { control: 'object', description: 'Citation object with document reference and excerpt' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PdfCitationPreview>

export const Default: Story = {
  args: { citation: mockCitation },
}

