import type { Meta, StoryObj } from '@storybook/react-vite'
import { FojoQA } from '../../components/molecules/FojoQA'

const mockOptions = [
  { title: 'Family Office', description: 'Multi-entity family office with trusts and holding companies', value: 'family-office' },
  { title: 'Individual Estate', description: 'Single individual with personal trusts and assets', value: 'individual' },
  { title: 'Foundation', description: 'Charitable foundation with donor-advised funds', value: 'foundation' },
]

/**
 * ## FojoQA
 *
 * ### What it does
 * Interactive Q&A component rendered above the Fojo chat input. Displays 3-4 option
 * cards with title and description, supporting single-select (immediate submit) or
 * multi-select (with confirm button). Includes an optional "Other" free-text option.
 *
 * ### Key behaviors
 * - Single select: submits immediately on click
 * - Multi-select: shows "Confirm (N selected)" button
 * - Selected state with blue background and checkmark
 * - Optional "Other" button for free text
 * - Animated entrance (chat-area-in)
 *
 * ### Tokens used
 * `--color-gray-2`, `--color-gray-4`, `--color-gray-12`, `--color-accent-3`,
 * `--color-accent-9`, `--color-neutral-11`, `--color-white`, `--radius-lg`,
 * `--spacing-2`
 *
 */
const meta: Meta<typeof FojoQA> = {
  title: 'Molecules/FojoQA',
  component: FojoQA,
  tags: ['autodocs'],
  argTypes: {
    question: { control: 'text', description: 'The question prompt text' },
    options: { control: 'object', description: 'Array of QAOption objects' },
    multiSelect: { control: 'boolean', description: 'Enable multi-select mode' },
    showOther: { control: 'boolean', description: 'Show "Other" option' },
    onSelect: { action: 'selected', description: 'Callback with selected values array' },
    onOther: { action: 'other-clicked', description: 'Callback when "Other" is clicked' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FojoQA>

export const SingleSelect: Story = {
  args: {
    question: 'What type of estate structure are you working with?',
    options: mockOptions,
    multiSelect: false,
    showOther: true,
  },
}

export const MultiSelect: Story = {
  args: {
    question: 'Select all applicable entity types:',
    options: mockOptions,
    multiSelect: true,
    showOther: true,
  },
}

