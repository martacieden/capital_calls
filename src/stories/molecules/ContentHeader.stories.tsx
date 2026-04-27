import type { Meta, StoryObj } from '@storybook/react-vite'
import { ContentHeader } from '../../components/molecules/ContentHeader'

/**
 * ## ContentHeader
 *
 * ### What it does
 * Page-level header bar with a title, optional item count badge, optional breadcrumb
 * navigation, and action buttons. The primary action can either open a Fojo AI prompt
 * dropdown (with rotating placeholders, file attachment, and submit) or trigger a simple
 * click handler. Also supports a secondary action button.
 *
 * ### Key behaviors
 * - Primary "Add asset" button opens a portal dropdown with Fojo mascot
 * - Dropdown has text input with rotating placeholders
 * - File attachment toggle (demo files)
 * - Submit on Enter or button click
 * - Click-outside closes dropdown
 * - Breadcrumb with clickable parent label
 * - Secondary action button with custom icon
 *
 * ### Tokens used
 * `--color-gray-4`, `--color-gray-12`, `--color-neutral-3`, `--color-neutral-8`,
 * `--color-neutral-11`, `--color-accent-9`, `--color-accent-contrast`, `--color-purple`,
 * `--color-blue-1`, `--color-blue-hover`, `--color-white`, `--radius-2xl`, `--radius-md`,
 * `--radius-lg`, `--radius-sm`, `--spacing-1` .. `--spacing-5`,
 * `--font-weight-semibold`, `--font-weight-medium`
 *
 */
const meta: Meta<typeof ContentHeader> = {
  title: 'Molecules/ContentHeader',
  component: ContentHeader,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Page title' },
    itemCount: { control: 'number', description: 'Badge count next to title' },
    onNewItemClick: { action: 'new-item', description: 'Opens Fojo prompt dropdown' },
    onActionClick: { action: 'action-click', description: 'Simple button click (no dropdown)' },
    actionLabel: { control: 'text', description: 'Primary button label' },
    actionIcon: { control: false, description: 'Custom icon component for primary button' },
    breadcrumb: { control: 'object', description: 'Breadcrumb {label, onClick}' },
    secondaryAction: { control: false, description: 'Secondary action button config' },
  },
}

export default meta
type Story = StoryObj<typeof ContentHeader>

export const Default: Story = {
  args: {
    title: 'Assets',
    itemCount: 24,
    onNewItemClick: undefined,
    onActionClick: () => {},
  },
}

export const WithFojoPrompt: Story = {
  args: {
    title: 'Assets',
    itemCount: 24,
  },
}

export const WithDocumentsBreadcrumb: Story = {
  args: {
    title: 'Trust Documents',
    itemCount: 5,
    breadcrumb: { label: 'Documents', onClick: () => {} },
    onActionClick: () => {},
  },
}

