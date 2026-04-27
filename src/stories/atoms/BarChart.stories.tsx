import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarChart } from '../../components/atoms/BarChart'

const allocationData = [
  { categoryKey: 'property', label: 'Properties', value: 95_000_000, percentage: 37, color: '#F87171' },
  { categoryKey: 'investment', label: 'Investments', value: 72_000_000, percentage: 28, color: '#10B981' },
  { categoryKey: 'trust', label: 'Trusts', value: 52_000_000, percentage: 20, color: '#14B8A6' },
  { categoryKey: 'maritime', label: 'Maritime', value: 22_000_000, percentage: 9, color: '#22D3EE' },
  { categoryKey: 'art', label: 'Art & Collectibles', value: 15_000_000, percentage: 6, color: '#FB923C' },
]

/**
 * ## BarChart
 *
 * ### What it does
 * Horizontal bar chart powered by `@nivo/bar` for visualizing asset allocation
 * by category. Each bar is colored per category, with value labels and percentages
 * rendered to the right of each bar via a custom Nivo layer.
 *
 * ### Key behaviors
 * - Horizontal layout with category labels on the left axis
 * - Custom right-side labels show formatted value ($XM/$XB) and percentage
 * - Tooltip on hover shows category name, color dot, value, and percentage
 * - Data is reversed before rendering so highest-value category appears at top
 * - Bar corners have 3px border radius
 *
 * ### Tokens used
 * `--color-neutral-4` (tooltip border), `--color-black` (tooltip value text),
 * `--color-neutral-10` (tooltip percentage text)
 *
 */
const meta: Meta<typeof BarChart> = {
  title: 'Atoms/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object', description: 'Array of allocation items with categoryKey, label, value, percentage, and color' },
    height: { control: { type: 'range', min: 100, max: 500, step: 20 }, description: 'Chart container height in pixels' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof BarChart>

export const Default: Story = {
  args: {
    data: allocationData,
    height: 240,
  },
}

