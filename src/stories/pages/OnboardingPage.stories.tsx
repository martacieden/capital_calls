import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
import { OnboardingPage } from '../../components/pages/OnboardingPage'

/**
 * ## OnboardingPage
 *
 * ### What it does
 * Full-screen onboarding page split into two halves. The left side shows a
 * headline ("Understand your estate"), descriptions of what Fojo will extract
 * (trust documents, inventory lists, insurance policies), a file upload drop zone,
 * file chips, and a "Get started" CTA button. The right side shows a parallax-tilt
 * preview of three animated cards (Entity Graph, Distribution Timeline, Asset
 * Allocation) illustrating what Fojo will build.
 *
 * ### Key behaviors
 * - First click on dropzone loads demo files; subsequent clicks open native file picker
 * - Drag-and-drop support for real files
 * - File chips with remove button
 * - "Get started" button disabled until files are attached
 * - Right panel cards tilt with mouse movement (parallax effect)
 * - Animated SVG graph, timeline rows, and bar fills on the preview cards
 *
 * ### Tokens used
 * `--color-neutral-11` (body text), `--color-neutral-12` (file chip text),
 * `--color-blue-1` (icon bg), `--color-accent-9` (CTA, icons),
 * `--color-neutral-4` (chip borders), `--color-neutral-5` (disabled CTA),
 * `--color-card-blue`, `--color-card-green`, `--color-card-pink` (preview cards),
 * `--font-weight-bold`, `--font-weight-semibold`,
 * `--radius-sm`, `--radius-lg`
 *
 */
const meta: Meta<typeof OnboardingPage> = {
  title: 'Pages/OnboardingPage',
  component: OnboardingPage,
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
type Story = StoryObj<typeof OnboardingPage>

export const Default: Story = {
  args: {
    onComplete: () => {},
  },
}

export const WithFiles: Story = {
  args: {
    onComplete: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const dropzone = canvas.getByText('Drop files here, or click to browse')
    await userEvent.click(dropzone)
  },
}
