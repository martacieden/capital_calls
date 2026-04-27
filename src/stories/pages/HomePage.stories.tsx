import type { Meta, StoryObj } from '@storybook/react-vite'
import { HomePage } from '../../components/pages/HomePage'
import { thorntonFamilyData } from '../../data/thornton'

const allItems = thorntonFamilyData.getAllItems()
const distributions = thorntonFamilyData.distributions

/**
 * ## HomePage
 *
 * ### What it does
 * Dashboard landing page. Shows a greeting, action buttons (New task / New decision),
 * an optional document upload section, and a 3x2 grid of glass-morphism summary cards:
 * Entities & Assets (mini hierarchy chart), Distribution Timeline (mini rows),
 * Asset Allocation (horizontal bars), Portfolio Performance (mini line chart),
 * Properties (top 3 holdings), and Estate Summary (total value + badge).
 * Cards animate in sequentially during processing state.
 *
 * ### Key behaviors
 * - Processing state: cards fade in with staggered timers (1.5s intervals)
 * - Non-processing state: all cards visible immediately
 * - Cards are clickable when processing is complete, navigating to respective pages
 * - Grid collapses to 2 columns when chat is open
 * - Document upload section shown only after onboarding is complete
 *
 * ### Tokens used
 * `--color-gray-12` (heading), `--color-neutral-12` (card labels),
 * `--color-neutral-11` (meta text), `--color-blue-1` / `--color-accent-9` (action buttons),
 * `--color-blue-hover` (button hover), `--color-card-*` palette (card accents),
 * `--color-black` (estate summary value),
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
    isProcessing: false,
    isOnboardingComplete: true,
    onNavigate: () => {},
    items: allItems,
    distributions,
    isChatOpen: false,
  },
}

export const Processing: Story = {
  args: {
    isProcessing: true,
    isOnboardingComplete: true,
    onNavigate: () => {},
    items: allItems,
    distributions,
    isChatOpen: false,
  },
}

