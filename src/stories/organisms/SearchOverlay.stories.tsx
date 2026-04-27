import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
import { SearchOverlay } from '../../components/organisms/SearchOverlay'
import { thorntonFamilyData } from '../../data/thornton'

const allItems = thorntonFamilyData.getAllItems()

/**
 * ## SearchOverlay
 *
 * ### What it does
 * Global search overlay (Cmd+K style). Renders a centered search field with
 * backdrop blur. As the user types, results are filtered from all catalog items.
 * The first result is always "Ask Fojo" which pipes the query to the AI chat.
 * Arrow keys navigate results; Enter selects. Escape closes.
 *
 * ### Key behaviors
 * - Auto-focuses input on open
 * - Filters items by name match (case-insensitive)
 * - Shows max 5 catalog results + "Ask Fojo" at the top
 * - Keyboard navigation with arrow keys and Enter
 * - Highlighted item gets accent background
 * - Empty state message when no results match
 * - Esc key or backdrop click closes the overlay
 *
 * ### Tokens used
 * `--color-neutral-9` (placeholder/icon), `--color-gray-12` (text),
 * `--color-neutral-3` (Esc badge bg), `--color-accent-3` (hover/active bg),
 * `--color-accent-9` (Fojo label), `--color-neutral-11` (category label),
 * `--radius-md`, `--radius-sm`, `--radius-xl`,
 * `--spacing-2`, `--spacing-3`, `--spacing-4`,
 * `--font-weight-medium`
 *
 */
const meta: Meta<typeof SearchOverlay> = {
  title: 'Organisms/SearchOverlay',
  component: SearchOverlay,
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
type Story = StoryObj<typeof SearchOverlay>

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onAskFojo: () => {},
    onItemClick: () => {},
    items: allItems,
  },
}

export const WithQuery: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onAskFojo: () => {},
    onItemClick: () => {},
    items: allItems,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Search assets, documents, people...')
    await userEvent.type(input, 'Thornton')
  },
}