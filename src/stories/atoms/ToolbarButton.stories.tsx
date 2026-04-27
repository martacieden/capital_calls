import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconFilter } from '@tabler/icons-react'
import { ToolbarButton } from '../../components/atoms/ToolbarButton'

/**
 * ## ToolbarButton
 *
 * ### What it does
 * Base button used in all toolbar components. Renders icon + optional text label
 * with consistent hover and active styling.
 *
 * ### Key behaviors
 * - Hover: neutral-3 background
 * - Active state: persistent neutral-3 background via `isActive` prop
 * - Icon-only mode when no label provided
 *
 * ### Tokens used
 * `--radius-md`, `--spacing-2`, `--spacing-3`, `--font-weight-medium`, `--color-gray-12`, `--color-neutral-3`
 *
 */
const meta: Meta<typeof ToolbarButton> = {
  title: 'Atoms/ToolbarButton',
  component: ToolbarButton,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Button text label' },
    icon: { control: false, description: 'ReactNode icon element' },
    isActive: { control: 'boolean', description: 'Whether the button shows active/pressed state' },
    className: { control: 'text', description: 'Additional CSS classes' },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof ToolbarButton>

export const Default: Story = {
  args: {
    label: 'Filters',
    icon: <IconFilter size={16} stroke={2} color="var(--color-neutral-11)" />,
  },
}

export const Active: Story = {
  args: {
    label: 'Filters',
    icon: <IconFilter size={16} stroke={2} color="var(--color-neutral-11)" />,
    isActive: true,
  },
}

