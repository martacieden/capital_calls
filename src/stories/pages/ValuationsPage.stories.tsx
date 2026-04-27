import type { Meta, StoryObj } from '@storybook/react-vite'
import { ValuationsPage } from '../../components/pages/ValuationsPage'
import { thorntonFamilyData } from '../../data/thornton'

const allItems = thorntonFamilyData.getAllItems()

/**
 * ## ValuationsPage
 *
 * ### What it does
 * Portfolio analytics page showing estate financial data. Renders a ContentHeader
 * ("Portfolio"), a 2x2 KPI stat card grid (Total Estate Value, Total Assets,
 * Active Entities, YTD Performance with badge), a horizontal bar chart for Asset
 * Allocation, and a line chart for Portfolio Performance with time range selector.
 * Processing state shows a Fojo "building your profile" empty state.
 *
 * ### Key behaviors
 * - KPI cards display formatted values with icons
 * - Bar chart (Nivo) shows asset category allocation with formatted values
 * - Line chart (Nivo) shows monthly portfolio performance with area fill
 * - Time range toggle on line chart (3M, 6M, 1Y, All)
 * - Processing state replaces content with Fojo mascot loading message
 * - Disclaimer footer at bottom
 *
 * ### Tokens used
 * `--color-black` (heading), `--color-neutral-4` (card/chart borders),
 * `--color-neutral-11` (meta text, disclaimer), `--color-white` (card bg),
 * `--radius-xl`, `--spacing-5`, `--spacing-6`,
 * `--font-weight-semibold`, `--font-weight-bold`
 *
 */
const meta: Meta<typeof ValuationsPage> = {
  title: 'Pages/ValuationsPage',
  component: ValuationsPage,
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
type Story = StoryObj<typeof ValuationsPage>

export const Default: Story = {
  args: {
    items: allItems,
    isV3Processing: false,
    isChatOpen: false,
  },
}

export const Processing: Story = {
  args: {
    items: [],
    isV3Processing: true,
    isChatOpen: false,
  },
}

