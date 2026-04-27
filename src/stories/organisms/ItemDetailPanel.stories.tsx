import type { Meta, StoryObj } from '@storybook/react-vite'
import { ItemDetailPanel } from '../../components/organisms/ItemDetailPanel'
import { thorntonFamilyData } from '../../data/thornton'

const allItems = thorntonFamilyData.getAllItems()
const allRelationships = thorntonFamilyData.relationships
const getItemById = (id: string) => allItems.find((i) => i.id === id) ?? null

const propertyItem = allItems.find((i) => i.id === 'thn-a1')!
const trustItem = allItems.find((i) => i.id === 'thn-t1')!
const personItem = allItems.find((i) => i.id === 'thn-p1')!

/**
 * ## ItemDetailPanel
 *
 * ### What it does
 * Slide-in detail panel for any catalog item (person, trust, entity, or asset).
 * Shows breadcrumb navigation, item image, name (as a link to full record),
 * description, two tabs (Sources with citation cards; Overview with field grid,
 * relationships graph with connections/ownership toggle, and documents section).
 * Supports inline editing with a save/cancel footer, delete confirmation dialog,
 * and collection creation.
 *
 * ### Key behaviors
 * - Breadcrumb collapses when path exceeds 3 segments with ellipsis dropdown
 * - Edit mode replaces content with ItemEditForm and shows save/cancel footer
 * - Delete shows ConfirmDialog
 * - Sources tab renders CitationCardStack
 * - Overview tab shows field grid, ConnectionsGraph / OwnershipTree toggle, documents
 * - Focus trap: close button receives focus on open
 *
 * ### Tokens used
 * `--color-gray-12` (title), `--color-neutral-11` (labels/icons),
 * `--color-gray-4` (borders), `--color-neutral-3` (hover),
 * `--color-accent-9` (active tab, edit buttons), `--color-accent-contrast` (save btn),
 * `--color-red-1` / `--color-red-9` (delete hover),
 * `--radius-md`, `--radius-lg`, `--radius-sm`,
 * `--spacing-2` through `--spacing-8`,
 * `--font-weight-bold`, `--font-weight-semibold`, `--font-weight-medium`
 *
 */
const meta: Meta<typeof ItemDetailPanel> = {
  title: 'Organisms/ItemDetailPanel',
  component: ItemDetailPanel,
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
type Story = StoryObj<typeof ItemDetailPanel>

export const Property: Story = {
  args: {
    item: propertyItem,
    isOpen: true,
    onClose: () => {},
    getItemById,
    relationships: allRelationships,
    onNavigate: () => {},
    onDeleteItem: () => {},
    onUpdateItem: () => {},
    onOpenFullRecord: () => {},
  },
}

export const Trust: Story = {
  args: {
    item: trustItem,
    isOpen: true,
    onClose: () => {},
    getItemById,
    relationships: allRelationships,
    onNavigate: () => {},
    onDeleteItem: () => {},
    onUpdateItem: () => {},
    onOpenFullRecord: () => {},
  },
}

export const Person: Story = {
  args: {
    item: personItem,
    isOpen: true,
    onClose: () => {},
    getItemById,
    relationships: allRelationships,
    onNavigate: () => {},
    onDeleteItem: () => {},
    onUpdateItem: () => {},
    onOpenFullRecord: () => {},
  },
}

export const WithBreadcrumbPath: Story = {
  args: {
    item: propertyItem,
    path: ['thn-p1', 'thn-t1', 'thn-e3', 'thn-a1'],
    isOpen: true,
    onClose: () => {},
    onBreadcrumbClick: () => {},
    getItemById,
    relationships: allRelationships,
    onNavigate: () => {},
    onDeleteItem: () => {},
    onUpdateItem: () => {},
    onOpenFullRecord: () => {},
  },
}

export const EditMode: Story = {
  args: {
    item: propertyItem,
    isOpen: true,
    onClose: () => {},
    getItemById,
    relationships: allRelationships,
    onNavigate: () => {},
    onDeleteItem: () => {},
    onUpdateItem: () => {},
    onOpenFullRecord: () => {},
    openInEditMode: true,
    onEditModeActivated: () => {},
  },
}
