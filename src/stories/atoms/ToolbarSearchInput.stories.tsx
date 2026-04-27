import type { Meta, StoryObj } from '@storybook/react-vite'
import { ToolbarSearchInput } from '../../components/atoms/ToolbarSearchInput'

/**
 * ## ToolbarSearchInput
 *
 * ### What it does
 * Collapsible search input for toolbars. Shows as an icon button, expands to a text
 * input on click, collapses when empty and blurred or Escape pressed.
 *
 * ### Key behaviors
 * - Click: expands with auto-focus
 * - Escape: clears value and collapses
 * - Blur (when empty): collapses
 * - Clear button (×): clears value, re-focuses input
 * - Stays expanded when value is non-empty
 *
 * ### Tokens used
 * `--radius-md`, `--color-neutral-3` (expanded bg), `--color-neutral-11` (placeholder),
 * `--color-neutral-4` (clear button hover), `--font-weight-medium`
 *
 */
const meta: Meta<typeof ToolbarSearchInput> = {
  title: 'Atoms/ToolbarSearchInput',
  component: ToolbarSearchInput,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text', description: 'Current search value' },
    onChange: { action: 'changed', description: 'Fires on every keystroke' },
    placeholder: { control: 'text', description: 'Input placeholder text' },
  },
}

export default meta
type Story = StoryObj<typeof ToolbarSearchInput>

export const Collapsed: Story = {
  args: {
    value: '',
    placeholder: 'Search items…',
  },
}

export const WithValue: Story = {
  args: {
    value: 'Thornton',
    placeholder: 'Search items…',
  },
}

