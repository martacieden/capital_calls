import type { Meta, StoryObj } from '@storybook/react-vite'
import { SourcesTabContent } from '../../components/molecules/SourcesTabContent'

/**
 * ## SourcesTabContent
 *
 * ### What it does
 * Content for the "Sources" tab in item detail panels. Looks up citations for a given
 * item ID and renders a CitationCardStack if citations exist, or an empty state with
 * a document icon and message when no source documents are linked.
 *
 * ### Key behaviors
 * - Fetches citations via getCitationsForItem(itemId)
 * - Renders CitationCardStack when citations exist
 * - Empty state with icon and text when no citations
 *
 * ### Tokens used
 * `--color-neutral-11`, `--spacing-2`, `--spacing-4`, `--spacing-6`, `--spacing-8`
 *
 */
const meta: Meta<typeof SourcesTabContent> = {
  title: 'Molecules/SourcesTabContent',
  component: SourcesTabContent,
  tags: ['autodocs'],
  argTypes: {
    itemId: { control: 'text', description: 'Catalog item ID to look up citations for' },
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
type Story = StoryObj<typeof SourcesTabContent>

export const WithCitations: Story = {
  args: {
    itemId: 'thn-p1',
  },
}

export const NoCitations: Story = {
  args: {
    itemId: 'nonexistent-id',
  },
}
