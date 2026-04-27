import type { Meta, StoryObj } from '@storybook/react-vite'
import { ItemEditForm } from '../../components/molecules/ItemEditForm'
import type { AnyCatalogItem } from '../../data/types'

const mockPerson: AnyCatalogItem = {
  id: 'thn-p1', name: 'Edward Thornton III', organizationId: 'org-1', categoryKey: 'person',
  description: 'Grantor and primary trustee.',
  createdAt: '2025-11-01', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
  age: 68, dob: '1958-05-12', relationship: 'Grantor', roles: ['Grantor', 'Trustee'],
} as AnyCatalogItem

/**
 * ## ItemEditForm
 *
 * ### What it does
 * Dynamic form component that renders view or edit mode for any catalog item type.
 * Displays category-specific fields: Person (name, relationship, age, DOB, roles),
 * Trust (type, status, established date, state), Entity (type, purpose, formation),
 * Asset (type, value, address). Edit mode renders inputs/selects with appropriate types.
 *
 * ### Key behaviors
 * - View mode: read-only label/value pairs
 * - Edit mode: form inputs with category-specific fields
 * - Category selector in edit mode
 * - Select dropdowns for constrained fields (trust type, entity type, etc.)
 * - Currency formatting for asset values
 * - Date inputs for DOB, establishment dates
 *
 * ### Tokens used
 * `--color-gray-4`, `--color-gray-12`, `--color-neutral-11`, `--color-accent-9`,
 * `--radius-md`, `--font-weight-medium`, `--font-weight-semibold`
 *
 */
const meta: Meta<typeof ItemEditForm> = {
  title: 'Molecules/ItemEditForm',
  component: ItemEditForm,
  tags: ['autodocs'],
  argTypes: {
    item: { control: false, description: 'AnyCatalogItem to display/edit' },
    editForm: { control: 'object', description: 'Current form state (key-value pairs)' },
    updateField: { action: 'field-updated', description: 'Callback (key, value)' },
    mode: { control: 'select', options: ['view', 'edit'], description: 'View or edit mode' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ItemEditForm>

export const PersonView: Story = {
  args: {
    item: mockPerson,
    editForm: {},
    mode: 'view',
  },
}

export const PersonEdit: Story = {
  args: {
    item: mockPerson,
    editForm: { name: 'Edward Thornton III', relationship: 'Grantor', age: 68, dob: '1958-05-12', description: 'Grantor and primary trustee.' },
    mode: 'edit',
  },
}

