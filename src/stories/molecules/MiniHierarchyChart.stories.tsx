import type { Meta, StoryObj } from '@storybook/react-vite'
import { MiniHierarchyChart } from '../../components/molecules/MiniHierarchyChart'

/**
 * ## MiniHierarchyChart
 *
 * ### What it does
 * Compact SVG hierarchy visualization showing a three-level tree structure:
 * Grantor at top, three trust/entity nodes in the middle (Family Trust, Holding Entity,
 * Beneficiary), and six leaf nodes at the bottom. Uses responsive sizing via
 * ResizeObserver to adapt column widths and font sizes to container width.
 *
 * ### Key behaviors
 * - Responsive width via useContainerWidth hook
 * - Three-level hierarchy: Grantor -> 3 entities -> 6 sub-entities
 * - Connecting lines between all levels
 * - Font sizes scale with container width
 * - Decorative (aria-hidden)
 *
 * ### Tokens used
 * `--color-blue-9`, `--color-blue-1`, `--color-blue-dark`
 *
 */
const meta: Meta<typeof MiniHierarchyChart> = {
  title: 'Molecules/MiniHierarchyChart',
  component: MiniHierarchyChart,
  tags: ['autodocs'],
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof MiniHierarchyChart>

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 300, height: 140, border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
}

