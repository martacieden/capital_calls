import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconHome, IconCar, IconShield, IconTrendingUp, IconAnchor, IconPalette } from '@tabler/icons-react'
import { ToolbarDropdown } from '../../components/atoms/ToolbarDropdown'

/**
 * ## ToolbarDropdown
 *
 * ### What it does
 * Reusable dropdown menu for toolbars. Supports single-select (closes on pick) and
 * multi-select (toggles, stays open). Optional "Clear selection" row and footer slot.
 *
 * ### Key behaviors
 * - Single-select: closes dropdown on item click
 * - Multi-select: toggles item, stays open
 * - Selected items show blue background + checkmark
 * - Clear selection button appears when items are selected (if `showClear`)
 * - Click outside closes dropdown (via useClickOutside with `open` guard)
 * - Chevron icon rotates 180° when open
 *
 * ### Tokens used
 * `--radius-md`, `--radius-sm`, `--color-gray-4` (border), `--color-neutral-3` (hover),
 * `--color-blue-3` (selected bg), `--color-blue` (selected text), `--shadow-dropdown`
 *
 */
const meta: Meta<typeof ToolbarDropdown> = {
  title: 'Atoms/ToolbarDropdown',
  component: ToolbarDropdown,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Button label when nothing selected' },
    selectedKeys: { control: 'object', description: 'Array of selected item keys' },
    multiSelect: { control: 'boolean', description: 'Allow multiple selections' },
    showClear: { control: 'boolean', description: 'Show "Clear selection" when items selected' },
  },
  decorators: [(Story) => <div style={{ minHeight: 300 }}><Story /></div>],
}

export default meta
type Story = StoryObj<typeof ToolbarDropdown>

const categoryItems = [
  { key: 'property', label: 'Properties', icon: <IconHome size={15} stroke={1.5} color="var(--color-neutral-11)" /> },
  { key: 'vehicle', label: 'Vehicles', icon: <IconCar size={15} stroke={1.5} color="var(--color-neutral-11)" /> },
  { key: 'insurance', label: 'Insurance', icon: <IconShield size={15} stroke={1.5} color="var(--color-neutral-11)" /> },
  { key: 'investment', label: 'Investments', icon: <IconTrendingUp size={15} stroke={1.5} color="var(--color-neutral-11)" /> },
  { key: 'maritime', label: 'Maritime', icon: <IconAnchor size={15} stroke={1.5} color="var(--color-neutral-11)" /> },
  { key: 'art', label: 'Art & Collectibles', icon: <IconPalette size={15} stroke={1.5} color="var(--color-neutral-11)" /> },
]

export const SingleSelect: Story = {
  args: {
    label: 'Category',
    items: categoryItems,
    selectedKeys: [],
    onSelect: () => {},
  },
}

export const MultiSelect: Story = {
  args: {
    label: 'Category',
    items: categoryItems,
    selectedKeys: ['property', 'vehicle'],
    multiSelect: true,
    showClear: true,
    onSelect: () => {},
  },
}

export const WithFooter: Story = {
  args: {
    label: 'Category',
    items: categoryItems.slice(0, 3),
    selectedKeys: [],
    multiSelect: true,
    onSelect: () => {},
    footer: (
      <div className="border-t border-[var(--color-gray-4)] mt-0.5 pt-0.5">
        <button className="flex w-full items-center gap-[var(--spacing-2)] rounded-[var(--radius-sm)] px-[var(--spacing-3)] py-1.5 text-left text-[13px] font-[var(--font-weight-medium)] text-[var(--color-accent-9)] hover:bg-[var(--color-neutral-3)]">
          + Add category
        </button>
      </div>
    ),
  },
}
