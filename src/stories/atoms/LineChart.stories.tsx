import type { Meta, StoryObj } from '@storybook/react-vite'
import { LineChart } from '../../components/atoms/LineChart'

const portfolioData = [
  { label: 'Jul', value: 1_820_000_000 },
  { label: 'Aug', value: 1_845_000_000 },
  { label: 'Sep', value: 1_790_000_000 },
  { label: 'Oct', value: 1_860_000_000 },
  { label: 'Nov', value: 1_910_000_000 },
  { label: 'Dec', value: 1_880_000_000 },
  { label: 'Jan', value: 1_920_000_000 },
  { label: 'Feb', value: 1_950_000_000 },
  { label: 'Mar', value: 1_990_000_000 },
  { label: 'Apr', value: 2_010_000_000 },
  { label: 'May', value: 1_980_000_000 },
  { label: 'Jun', value: 2_020_000_000 },
]


/**
 * ## LineChart
 *
 * ### What it does
 * Responsive line chart powered by `@nivo/line` for displaying time-series data such
 * as portfolio value over time. Supports area fill, custom tooltip with period-over-period
 * change, and an optional time-range filter (3M / 6M / YTD / 1Y).
 *
 * ### Key behaviors
 * - Slice tooltip shows formatted value (billions), previous-period percentage change
 * - Time range buttons filter visible data points and re-render the chart
 * - Active range button uses the chart's `color` as background
 * - Area gradient fills from 18% opacity at top to 3% at bottom
 * - Crosshair dashed line appears on hover
 * - Y-axis labels formatted as `$X.XXB`
 *
 * ### Tokens used
 * `--color-neutral-10` (inactive range button text), `--color-neutral-3` (range button hover bg),
 * `--color-neutral-4` (tooltip border), `--color-black` (tooltip value text)
 *
 */
const meta: Meta<typeof LineChart> = {
  title: 'Atoms/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object', description: 'Array of { label, value } points for the line' },
    color: { control: 'color', description: 'Line and area fill color (default: #8B5CF6)' },
    showArea: { control: 'boolean', description: 'Whether to show the gradient area fill' },
    height: { control: { type: 'range', min: 100, max: 500, step: 20 }, description: 'Chart container height in pixels' },
    enableTimeRange: { control: 'boolean', description: 'Show 3M/6M/YTD/1Y filter buttons above the chart' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof LineChart>

export const Default: Story = {
  args: {
    data: portfolioData,
    color: '#8B5CF6',
    showArea: true,
    height: 220,
    enableTimeRange: true,
  },
}

