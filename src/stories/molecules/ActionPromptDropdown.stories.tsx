import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionPromptDropdown } from '../../components/molecules/ActionPromptDropdown'

/**
 * ## ActionPromptDropdown
 *
 * ### What it does
 * Portal-rendered dropdown that acts as the intermediate step between selecting a card
 * action (create task, add asset, update relationships) and triggering the Fojo AI chat.
 * Shows a Fojo mascot, contextual copy based on the action type, a text input with
 * rotating placeholders, file attachment support, and a submit button.
 *
 * ### Key behaviors
 * - Renders as a portal fixed-positioned dropdown
 * - Different copy/placeholders per action type (create-task, add-new-asset, change-relation)
 * - Rotating placeholder animation when input is empty
 * - File attachment toggle (demo files)
 * - Submit on Enter or button click
 * - Close on Escape or click outside
 *
 * ### Tokens used
 * `--color-gray-4`, `--color-gray-12`, `--color-neutral-8`, `--color-neutral-9`,
 * `--color-neutral-11`, `--color-neutral-12`, `--color-accent-9`, `--color-accent-contrast`,
 * `--color-purple`, `--color-white`, `--radius-2xl`, `--radius-md`, `--radius-lg`,
 * `--spacing-1`, `--spacing-2`, `--spacing-3`, `--spacing-4`, `--spacing-5`,
 * `--font-weight-semibold`, `--z-modal`
 *
 */
const meta: Meta<typeof ActionPromptDropdown> = {
  title: 'Molecules/ActionPromptDropdown',
  component: ActionPromptDropdown,
  tags: ['autodocs'],
  parameters: {
    docs: { story: { inline: false } },
  },
  argTypes: {
    action: {
      control: 'select',
      options: ['create-task', 'add-new-asset', 'change-relation', 'edit-fields'],
      description: 'The card action type that determines copy and placeholders',
    },
    contextName: { control: 'text', description: 'Name of the context item' },
    anchorRect: { control: 'object', description: 'Initial anchor rect for positioning' },
    onSubmit: { action: 'submitted', description: 'Callback with (text, hasFiles)' },
    onClose: { action: 'closed', description: 'Called on Escape or click-outside' },
  },
}

export default meta
type Story = StoryObj<typeof ActionPromptDropdown>

export const CreateTask: Story = {
  args: {
    action: 'create-task',
    contextName: 'Fifth Avenue Penthouse',
    anchorRect: { top: 100, left: 100, width: 40, height: 40 },
  },
}

export const AddNewAsset: Story = {
  args: {
    action: 'add-new-asset',
    contextName: 'Thornton Family Trust',
    anchorRect: { top: 100, left: 100, width: 40, height: 40 },
  },
}

export const ChangeRelation: Story = {
  args: {
    action: 'change-relation',
    contextName: 'Dynasty Trust I',
    anchorRect: { top: 100, left: 100, width: 40, height: 40 },
  },
}
