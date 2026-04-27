import type { Meta, StoryObj } from '@storybook/react-vite'
import { MiniLineChart } from '../../components/molecules/MiniLineChart'

/**
 * ## MiniLineChart
 *
 * ### What it does
 * Compact SVG line chart showing the last 6 months of portfolio performance data.
 * Renders a filled gradient area under the line, circular data points, and month
 * labels along the bottom. Uses responsive width via ResizeObserver.
 *
 * ### Key behaviors
 * - Responsive width via useContainerWidth hook
 * - Gradient fill under the line
 * - Circular data points at each month
 * - Month labels along bottom axis
 * - Auto-scales Y axis with 2% padding
 * - Uses PORTFOLIO_PERFORMANCE data (last 6 months)
 *
 * ### Tokens used
 * `--color-card-purple`, `--color-neutral-11`
 *
 */
const meta: Meta<typeof MiniLineChart> = {
  title: 'Molecules/MiniLineChart',
  component: MiniLineChart,
  tags: ['autodocs'],
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof MiniLineChart>

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 300, height: 120, border: '1px solid #eee', borderRadius: 8, padding: 8, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
}

