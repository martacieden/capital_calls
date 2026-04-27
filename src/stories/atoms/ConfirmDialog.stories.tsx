import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConfirmDialog } from '../../components/atoms/ConfirmDialog'

/**
 * ## ConfirmDialog
 *
 * ### What it does
 * A centered modal confirmation dialog with a warning icon, title, message,
 * and Cancel / Confirm action buttons. Used for destructive actions like
 * deleting catalog items.
 *
 * ### Key behaviors
 * - Backdrop click triggers `onCancel`
 * - `confirmLabel` defaults to "Delete"
 * - When `isOpen` is false, nothing renders (returns null)
 * - Fixed positioned with backdrop blur
 *
 * ### Tokens used
 * `--color-white` (dialog bg), `--color-red-1` (icon bg), `--color-gray-12` (title),
 * `--color-neutral-11` (message), `--spacing-6` (padding), `--spacing-2` (title margin),
 * `--spacing-3` (button gap), `--font-weight-bold` (title)
 *
 */
const meta: Meta<typeof ConfirmDialog> = {
  title: 'Atoms/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean', description: 'Whether the dialog is visible' },
    title: { control: 'text', description: 'Dialog heading text' },
    message: { control: 'text', description: 'Descriptive body text explaining the action' },
    confirmLabel: { control: 'text', description: 'Label for the confirm button (defaults to "Delete")' },
    onConfirm: { action: 'confirmed', description: 'Callback when the confirm button is clicked' },
    onCancel: { action: 'cancelled', description: 'Callback when Cancel or backdrop is clicked' },
  },
}

export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Delete Asset',
    message: 'Are you sure you want to delete "Fifth Avenue Penthouse"? This action cannot be undone.',
    confirmLabel: 'Delete',
  },
}
