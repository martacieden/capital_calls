import type { Meta, StoryObj } from '@storybook/react-vite'
import { DonutChart } from '../../components/atoms/DonutChart'

const estateData = [
  { label: 'Properties', value: 95_000_000, percentage: 37, color: '#F87171' },
  { label: 'Investments', value: 72_000_000, percentage: 28, color: '#10B981' },
  { label: 'Trusts', value: 52_000_000, percentage: 20, color: '#14B8A6' },
  { label: 'Maritime', value: 22_000_000, percentage: 9, color: '#22D3EE' },
  { label: 'Art & Collectibles', value: 15_000_000, percentage: 6, color: '#FB923C' },
]


/**
 * ## DonutChart
 *
 * ### What it does
 * SVG-based donut chart with animated segment transitions, hover highlighting
 * (both on segments and legend items), center label display, and an optional legend.
 * Used on the Home dashboard to visualize asset allocation by category.
 *
 * ### Key behaviors
 * - Entry animation: segments animate in with staggered delay (0.1s per segment)
 * - Hover on segment or legend: highlights that item, dims others to 35% opacity
 * - Hovered segment stroke widens by 4px
 * - Center shows hovered segment's value and label, or `centerLabel` when idle
 * - Legend items show color dot, label, formatted value, and percentage
 *
 * ### Tokens used
 * `--color-black` (center value text), `--color-neutral-11` (center label, legend label/percentage),
 * `--color-neutral-2` (hovered legend bg), `--radius-full` (not used directly but implied by rounded legend dots)
 *
 */
const meta: Meta<typeof DonutChart> = {
  title: 'Atoms/DonutChart',
  component: DonutChart,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object', description: 'Array of segments with label, value, percentage, and color' },
    size: { control: { type: 'range', min: 100, max: 400, step: 20 }, description: 'SVG canvas size in pixels' },
    strokeWidth: { control: { type: 'range', min: 10, max: 60, step: 2 }, description: 'Donut ring thickness' },
    centerLabel: { control: 'text', description: 'Static label shown in center when no segment is hovered' },
    showLegend: { control: 'boolean', description: 'Whether to display the legend beside the chart' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DonutChart>

export const Default: Story = {
  args: {
    data: estateData,
    centerLabel: '$256M',
  },
}

