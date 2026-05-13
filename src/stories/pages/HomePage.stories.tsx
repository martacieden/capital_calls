import type { Meta, StoryObj } from '@storybook/react-vite'
import { HomePage } from '../../components/pages/HomePage'

/**
 * ## HomePage
 *
 * ### What it does
 * Dashboard landing page as an action center.
 * Shows greeting copy plus a list of quick actions that route to key app flows
 * (pipeline, pending review, portfolio) or send prompts to Fojo.
 *
 * ### Key behaviors
 * - Quick action rows navigate to existing pages via `onNavigate`
 * - Research/summarize actions can prefill Fojo via `onAskFojo`
 * - Layout follows existing spacing, tokens, and shell rhythm
 *
 * ### Tokens used
 * `--color-gray-12` (heading), `--color-neutral-10` (supporting text),
 * `--color-accent-9` (assistive accents), `--color-neutral-2/3/4` (containers/borders),
 * `--spacing-5`, `--spacing-6`, `--radius-md`,
 * `--font-weight-medium`, `--font-weight-semibold`
 *
 */
const meta: Meta<typeof HomePage> = {
  title: 'Pages/HomePage',
  component: HomePage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex', background: '#fff' }}>
        <div className="main-content" style={{ flex: 1, overflow: 'auto' }}>
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof HomePage>

export const Default: Story = {
  args: {
    onNavigate: () => {},
    onAskFojo: () => {},
  },
}

export const WithoutFojoCallback: Story = {
  args: {
    onNavigate: () => {},
  },
}

