import type { Meta, StoryObj } from '@storybook/react-vite'
import { FojoNotificationDropdown } from '../../components/molecules/FojoNotificationDropdown'
import type { FojoNotification } from '../../data/types/fojo'

const mockNotifications: FojoNotification[] = [
  {
    id: 'n1', conversationId: 'c1', type: 'estate-review',
    title: 'Estate structure review complete',
    preview: 'I analyzed the Thornton Family Trust structure and found 3 potential optimization opportunities.',
    timestamp: Date.now() - 5 * 60_000, read: false,
  },
  {
    id: 'n2', conversationId: 'c2', type: 'coverage-gap',
    title: 'Coverage gap detected',
    preview: 'The Hamptons Estate property appears to lack umbrella liability coverage.',
    timestamp: Date.now() - 2 * 3600_000, read: false,
  },
  {
    id: 'n3', conversationId: 'c3', type: 'distribution',
    title: 'Upcoming distribution reminder',
    preview: 'Andrew Thornton turns 25 in 2027. Dynasty Trust I specifies a $500K distribution.',
    timestamp: Date.now() - 24 * 3600_000, read: true,
  },
]

/**
 * ## FojoNotificationDropdown
 *
 * ### What it does
 * Portal-rendered dropdown panel showing Fojo AI update notifications. Displays a
 * "Fojo Updates" header, a list of notifications with title, preview text, relative
 * timestamps, and read/unread states. Unread items have a blue tinted background.
 *
 * ### Key behaviors
 * - Portal renders to document.body
 * - Glassmorphism backdrop blur
 * - Unread items have blue tinted background
 * - Relative timestamps (Xm ago, Xh ago, Xd ago)
 * - Empty state message when no notifications
 * - Click handler per notification
 * - Slide-in animation
 *
 * ### Tokens used
 * `--color-neutral-11`, `--color-neutral-12`, `--color-white`
 *
 */
const meta: Meta<typeof FojoNotificationDropdown> = {
  title: 'Molecules/FojoNotificationDropdown',
  component: FojoNotificationDropdown,
  tags: ['autodocs'],
  parameters: {
    docs: { story: { inline: false } },
  },
  argTypes: {
    notifications: { control: 'object', description: 'Array of FojoNotification objects' },
    onItemClick: { action: 'notification-clicked', description: 'Callback when a notification is clicked' },
    getDropdownStyle: { control: false, description: 'Function returning CSSProperties for positioning' },
  },
}

export default meta
type Story = StoryObj<typeof FojoNotificationDropdown>

export const Default: Story = {
  args: {
    notifications: mockNotifications,
    getDropdownStyle: () => ({ position: 'fixed' as const, top: 60, left: 80, zIndex: 200 }),
  },
}

export const Empty: Story = {
  args: {
    notifications: [],
    getDropdownStyle: () => ({ position: 'fixed' as const, top: 60, left: 80, zIndex: 200 }),
  },
}

