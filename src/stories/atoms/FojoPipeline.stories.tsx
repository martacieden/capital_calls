import type { Meta, StoryObj } from '@storybook/react-vite'
import { FojoPipeline } from '../../components/atoms/FojoPipeline'
import type { PipelineStepStatus } from '../../components/atoms/FojoPipeline'

const activeStep: PipelineStepStatus[] = [
  { text: 'Searching web for valuations', detail: 'Querying Zillow, YachtWorld, Hagerty...', status: 'running' },
]

/**
 * ## FojoPipeline
 *
 * ### What it does
 * Displays a vertical list of AI processing steps in the Fojo chat panel. Each step
 * shows its status (pending dot, spinning loader, or checkmark), descriptive text,
 * and an optional expandable detail section.
 *
 * ### Key behaviors
 * - Steps animate in with staggered delay (0.08s per step)
 * - Complete: green checkmark icon
 * - Running: spinning loader icon
 * - Pending: small neutral dot
 * - Chevron appears on steps with `detail`; clicking toggles expanded detail text
 * - Only one step can be expanded at a time
 *
 * ### Tokens used
 * `--radius-lg` (container corners), `--color-gray-2` (container bg),
 * `--color-neutral-7` (pending dot), `--color-neutral-9` (chevron),
 * `--color-neutral-11` (expanded detail text)
 *
 */
const meta: Meta<typeof FojoPipeline> = {
  title: 'Atoms/FojoPipeline',
  component: FojoPipeline,
  tags: ['autodocs'],
  argTypes: {
    steps: { control: 'object', description: 'Array of pipeline steps with text, optional detail, and status' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FojoPipeline>

export const Default: Story = {
  args: {
    steps: activeStep,
  },
}
