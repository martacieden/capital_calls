import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapLegend } from '../../components/molecules/MapLegend'
import type { AnyCatalogItem } from '../../data/types'

const mockItems: AnyCatalogItem[] = [
  { id: 'p1', name: 'Edward Thornton III', organizationId: 'org-1', categoryKey: 'person', createdAt: '2025-11-01', createdBy: { id: 'u1', name: 'SW' } },
  { id: 't1', name: 'Thornton Family RLT', organizationId: 'org-1', categoryKey: 'trust', createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'SW' } },
  { id: 'e1', name: 'Family Office LLC', organizationId: 'org-1', categoryKey: 'entity', createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'SW' } },
  { id: 'a1', name: 'Fifth Avenue Penthouse', organizationId: 'org-1', categoryKey: 'property', createdAt: '2026-01-15', createdBy: { id: 'u1', name: 'SW' } },
  { id: 'a2', name: 'Tesla Model S', organizationId: 'org-1', categoryKey: 'vehicle', createdAt: '2026-01-15', createdBy: { id: 'u1', name: 'SW' } },
]

/**
 * ## MapLegend
 *
 * ### What it does
 * Collapsible legend for the estate map / connections graph. Derives node types from
 * actual data items passed in, maps them to catalog categories for label and color,
 * and renders colored shape indicators (circles for persons, rounded rectangles for others).
 *
 * ### Key behaviors
 * - Toggle open/closed with chevron button
 * - Derives categories from actual items (no hardcoded list)
 * - Person category uses circle shape, all others use rounded rect
 * - Category colors from catalogCategories data
 *
 * ### Tokens used
 * `--color-white`, `--color-gray-4`, `--color-gray-12`, `--color-neutral-3`,
 * `--color-neutral-11`, `--shadow-subtle`, `--font-weight-medium`
 *
 */
const meta: Meta<typeof MapLegend> = {
  title: 'Molecules/MapLegend',
  component: MapLegend,
  tags: ['autodocs'],
  argTypes: {
    items: { control: false, description: 'Array of AnyCatalogItem objects to derive legend from' },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 16, maxWidth: 300 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MapLegend>

export const Default: Story = {
  args: { items: mockItems },
}

