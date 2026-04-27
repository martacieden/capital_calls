import type { Meta, StoryObj } from '@storybook/react-vite'
import { CitationCardStack } from '../../components/molecules/CitationCardStack'
import type { Citation } from '../../data/citations'

const singleCitation: Citation = {
  itemId: 'thn-p1',
  documentName: 'family-trust-agreement.pdf',
  documentLabel: 'Family Trust Agreement',
  page: 3,
  excerpt: 'Edward Thornton III, hereinafter referred to as the "Grantor," being of sound mind and body, hereby establishes the Thornton Family Revocable Living Trust for the benefit of his descendants.',
  highlightedText: 'Edward Thornton III, hereinafter referred to as the "Grantor,"',
}

const multipleCitations: Citation[] = [
  singleCitation,
  {
    itemId: 'thn-p1',
    documentName: 'estate-planning-summary.pdf',
    documentLabel: 'Estate Planning Summary',
    page: 7,
    excerpt: 'The Grantor appoints himself as the initial Trustee of the Trust and shall serve without bond.',
    highlightedText: 'The Grantor appoints himself as the initial Trustee',
  },
  {
    itemId: 'thn-p1',
    documentName: 'family-trust-agreement.pdf',
    documentLabel: 'Family Trust Agreement',
    page: 12,
    excerpt: 'Upon the death of the Grantor, the trust shall be divided into separate sub-trusts for each beneficiary.',
    highlightedText: 'divided into separate sub-trusts',
  },
]

function makeCitationGroups(citations: Citation[]): Map<string, Citation[]> {
  const groups = new Map<string, Citation[]>()
  for (const c of citations) {
    const key = c.documentName
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(c)
  }
  return groups
}

/**
 * ## CitationCardStack
 *
 * ### What it does
 * Stacked card carousel for browsing source document citations. Shows a PDF preview
 * of each citation with document name, navigation dots, and prev/next buttons.
 * Behind-card shadows create a depth effect. Preloads all PDFs on mount for instant switching.
 *
 * ### Key behaviors
 * - Card stack with up to 2 "behind" cards visible
 * - Animated slide transitions (left/right exit + enter)
 * - Navigation with prev/next buttons and dot indicators
 * - Counter display (1 / N)
 * - "Open" button for full document view
 * - Preloads PDF paths on mount
 *
 * ### Tokens used
 * Uses `.doc-stack`, `.doc-stack__card`, `.doc-stack__nav`, `.doc-stack__dot` CSS classes
 *
 */
const meta: Meta<typeof CitationCardStack> = {
  title: 'Molecules/CitationCardStack',
  component: CitationCardStack,
  tags: ['autodocs'],
  argTypes: {
    citationGroups: { control: false, description: 'Map<string, Citation[]> grouped by document' },
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
type Story = StoryObj<typeof CitationCardStack>

export const SingleCitation: Story = {
  render: () => <CitationCardStack citationGroups={makeCitationGroups([singleCitation])} />,
}

export const MultipleCitations: Story = {
  render: () => <CitationCardStack citationGroups={makeCitationGroups(multipleCitations)} />,
}
