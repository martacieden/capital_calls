import type { Meta, StoryObj } from '@storybook/react-vite'
import { FojoMascot } from '../../components/atoms/FojoMascot'

/**
 * ## FojoMascot
 *
 * ### What it does
 * Renders the Fojo AI mascot as an inline SVG. It is a rounded blue shape with
 * a star-like body and two asymmetric eyes. Supports configurable size, custom CSS
 * class, and an optional breathing animation.
 *
 * ### Key behaviors
 * - `animated` adds the `fojo-breathe` CSS class for a subtle scale animation
 * - SVG uses a linear gradient (`#0048BF` to `#145CD3`) for the background circle
 * - Eyes are filled with `#0048BF`; right eye has a flat bottom (clipRule path)
 * - `size` can be a number (px) or string (e.g. "100%")
 *
 * ### Tokens used
 * None (self-contained SVG with hardcoded brand colors `#0048BF`, `#145CD3`, `#D8EAFF`)
 *
 */
const meta: Meta<typeof FojoMascot> = {
  title: 'Atoms/FojoMascot',
  component: FojoMascot,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'range', min: 32, max: 400, step: 8 }, description: 'Width and height in pixels (or a string like "100%")' },
    className: { control: 'text', description: 'Additional CSS class names' },
    animated: { control: 'boolean', description: 'Enable the breathing animation (fojo-breathe class)' },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FojoMascot>

export const Default: Story = {
  args: {
    size: 200,
    animated: false,
  },
}

export const Animated: Story = {
  args: {
    size: 120,
    animated: true,
  },
}

