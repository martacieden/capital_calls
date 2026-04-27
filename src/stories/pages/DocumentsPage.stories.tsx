import type { Meta, StoryObj } from '@storybook/react-vite'
import { DocumentsPage } from '../../components/pages/DocumentsPage'

/**
 * ## DocumentsPage
 *
 * ### What it does
 * Full document management page with three sub-views: home (collections strip +
 * all documents), all-collections, and collection-detail drill-in. The page
 * includes a ContentHeader, CatalogToolbar (with Type dropdown, search, quick
 * filters, and grid/list view toggle), CollectionCards in a horizontal strip,
 * DocumentCards or DocumentRows depending on active view, and a DocumentDetailPanel
 * for previewing individual documents. Supports creating smart collections via a
 * Fojo-powered prompt dropdown.
 *
 * ### Key behaviors
 * - Collections displayed as cards at the top with "Show all" link
 * - Grid view renders DocumentCard; list view renders DocumentRow in a table
 * - Toolbar quick filters: Expiring soon, Recently updated, Unattached, Shared
 * - Search filters both documents and collections
 * - Clicking a document opens DocumentDetailPanel slide-in
 * - "New collection" button opens a Fojo prompt dropdown to create smart collections
 * - Collection detail view shows only the docs belonging to that collection
 * - Pending collections (from asset detail) are consumed and navigated to
 *
 * ### Tokens used
 * `--color-white` (bg), `--color-gray-4` (borders), `--color-neutral-11` (labels),
 * `--color-accent-9` (actions), `--color-accent-contrast` (create button text),
 * `--color-purple` (prompt dropdown focus ring),
 * `--spacing-2` through `--spacing-6`,
 * `--radius-md`, `--radius-lg`, `--radius-2xl`, `--shadow-toolbar`
 *
 */
const meta: Meta<typeof DocumentsPage> = {
  title: 'Pages/DocumentsPage',
  component: DocumentsPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex', background: '#fff' }}>
        <div className="main-content" style={{ flex: 1, overflow: 'auto' }}>
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DocumentsPage>

export const Default: Story = {
  args: {},
}

export const WithTimelineNavigation: Story = {
  args: {
    onNavigateToTimeline: () => {},
  },
}
