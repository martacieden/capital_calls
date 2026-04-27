import type { Meta, StoryObj } from '@storybook/react-vite'
import { LeftNav } from '../../components/molecules/LeftNav'

/**
 * ## LeftNav
 *
 * ### What it does
 * Vertical sidebar navigation with icon-only nav items (Search, Home, Assets, Documents,
 * Tasks, Decisions, Projects, Portfolio, Timeline, More), a Way2B1 logo, bug report button,
 * Fojo AI chat toggle with animated mascot and unread badge, and user avatar button.
 *
 * ### Key behaviors
 * - Active item highlighted with blue background
 * - Red notification badges on nav items
 * - Fojo mascot with animated idle state and unread count badge
 * - User initials avatar
 * - Tooltip labels on hover (via title attribute)
 *
 * ### Tokens used
 * `--color-accent-9`, `--color-neutral-3`, `--color-neutral-11`, `--color-blue-3`,
 * `--color-neutral-4`, `--color-red-9`, `--color-red-1`, `--radius-md`,
 * `--spacing-2`, `--spacing-3`, `--spacing-5`
 *
 */
const meta: Meta<typeof LeftNav> = {
  title: 'Molecules/LeftNav',
  component: LeftNav,
  tags: ['autodocs'],
  argTypes: {
    activeItem: {
      control: 'select',
      options: ['search', 'home', 'catalog', 'documents', 'tasks', 'decisions', 'projects', 'portfolio', 'timeline', 'more'],
      description: 'Currently active navigation item',
    },
    onNavItemClick: { action: 'nav-clicked', description: 'Callback when a nav item is clicked' },
    navBadges: { control: false, description: 'Set of nav item IDs with badges' },
    onFojoToggle: { action: 'fojo-toggled', description: 'Callback when Fojo button is clicked' },
    fojoUnreadCount: { control: 'number', description: 'Unread notification count for Fojo badge' },
    isFojoOpen: { control: 'boolean', description: 'Whether Fojo chat is currently open' },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof LeftNav>

export const Default: Story = {
  args: {
    activeItem: 'catalog',
    fojoUnreadCount: 0,
    isFojoOpen: false,
  },
}

export const WithBadges: Story = {
  args: {
    activeItem: 'catalog',
    navBadges: new Set(['tasks', 'documents']),
    fojoUnreadCount: 3,
    isFojoOpen: false,
  },
}

