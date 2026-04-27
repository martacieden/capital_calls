import type { Meta, StoryObj } from '@storybook/react-vite'
import { AssetDetailPage } from '../../components/pages/AssetDetailPage'
import { thorntonFamilyData } from '../../data/thornton'

const allItems = thorntonFamilyData.getAllItems()
const allRelationships = thorntonFamilyData.relationships
const getItemById = (id: string) => allItems.find((i) => i.id === id) ?? null

const propertyItem = allItems.find((i) => i.id === 'thn-a1')!
const trustItem = allItems.find((i) => i.id === 'thn-t1')!
const personItem = allItems.find((i) => i.id === 'thn-p1')!

/**
 * ## AssetDetailPage
 *
 * ### What it does
 * Full-page detail view for a single catalog item. Shows a back button, item image
 * with gallery, name, description (inline-editable), field grid with field-source
 * icons and inline editing, tab navigation (Details, Description, Gallery, Attachments),
 * a relationships section with connections graph and ownership tree toggle, and
 * expandable graph view. Supports adding custom fields, share/history/comment actions,
 * and inline field-level editing.
 *
 * ### Key behaviors
 * - Back button returns to catalog
 * - Inline field editing: click value to edit, blur or Enter to save
 * - Field source icons show provenance (AI-extracted, manual, etc.)
 * - "Show all fields" / "Show fewer" toggle
 * - Relationships section: Connections (non-hierarchy graph) and Ownership (tree)
 * - Graph can be expanded to fullscreen
 * - Tab navigation scrolls to section
 * - Gallery images displayed in a grid
 * - Attachments show linked documents with citation data
 *
 * ### Tokens used
 * `--color-gray-12` (heading), `--color-neutral-11` (labels/meta),
 * `--color-gray-4` (borders/dividers), `--color-neutral-3` (field bg, hover),
 * `--color-accent-9` (active tab, links), `--color-accent-3` (active tab bg),
 * `--color-neutral-12` (field values), `--color-neutral-9` (placeholder),
 * `--spacing-2` through `--spacing-8`,
 * `--radius-md`, `--radius-lg`, `--radius-xl`,
 * `--font-weight-regular`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold`,
 * `--shadow-card`, `--shadow-subtle`
 *
 */
const meta: Meta<typeof AssetDetailPage> = {
  title: 'Pages/AssetDetailPage',
  component: AssetDetailPage,
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
type Story = StoryObj<typeof AssetDetailPage>

export const Property: Story = {
  args: {
    item: propertyItem,
    relationships: allRelationships,
    getItemById,
    onBack: () => {},
    onNavigate: () => {},
  },
}

export const Trust: Story = {
  args: {
    item: trustItem,
    relationships: allRelationships,
    getItemById,
    onBack: () => {},
    onNavigate: () => {},
  },
}

export const Person: Story = {
  args: {
    item: personItem,
    relationships: allRelationships,
    getItemById,
    onBack: () => {},
    onNavigate: () => {},
  },
}

export const WithGraphExpanded: Story = {
  args: {
    item: propertyItem,
    relationships: allRelationships,
    getItemById,
    onBack: () => {},
    onNavigate: () => {},
    isGraphExpanded: true,
    onGraphExpandChange: () => {},
  },
}
