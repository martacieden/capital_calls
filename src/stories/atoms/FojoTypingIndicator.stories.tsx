import type { Meta, StoryObj } from '@storybook/react-vite'
import { FojoTypingIndicator } from '../../components/atoms/FojoTypingIndicator'

/**
 * ## FojoTypingIndicator
 *
 * ### What it does
 * Animated typing indicator shown in the Fojo chat panel while the AI is generating
 * a response. Displays a small Fojo mascot icon, a rotating status word
 * ("Thinking", "Analyzing", "Responding", "Processing"), and three bouncing dots.
 *
 * ### Key behaviors
 * - Status word rotates every 2 seconds through TYPING_WORDS array
 * - Each new word animates in with `fojo-word-in` keyframe (0.35s ease-out)
 * - Three dots use `fojo-typing-dot` CSS class with staggered bounce animation
 * - Initial word index is randomized
 *
 * ### Tokens used
 * `--color-purple-text` (status word color)
 *
 */
const meta: Meta<typeof FojoTypingIndicator> = {
  title: 'Atoms/FojoTypingIndicator',
  component: FojoTypingIndicator,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360, padding: 16, background: 'var(--color-neutral-2)', borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FojoTypingIndicator>

export const Default: Story = {}
