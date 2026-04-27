import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconCurrencyDollar, IconTrendingUp } from '@tabler/icons-react'
import { KpiStatCard } from '../../components/atoms/KpiStatCard'

/**
 * ## KpiStatCard
 *
 * ### What it does
 * Displays a single key metric with label, formatted value, optional icon, and optional badge.
 * Used on the Home dashboard and Valuations page.
 *
 * ### Key behaviors
 * - Hover: subtle shadow + translate up
 * - Badge color: green for positive, neutral gray otherwise
 * - Icon renders in a colored square container
 *
 * ### Tokens used
 * `--color-neutral-4` (border), `--radius-lg` (corners), `--font-weight-regular` (label),
 * `--font-weight-bold` (value), `--color-green-9` (positive badge), `--color-neutral-11` (label text)
 *
 */
const meta: Meta<typeof KpiStatCard> = {
  title: 'Atoms/KpiStatCard',
  component: KpiStatCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 220, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: 'text', description: 'Metric label displayed below the value' },
    value: { control: 'text', description: 'Formatted metric value (e.g., "$2.02B")' },
    badge: { control: 'object', description: 'Optional badge with text and positive/neutral styling' },
    icon: { control: false, description: 'Optional Tabler icon component' },
  },
}

export default meta
type Story = StoryObj<typeof KpiStatCard>

export const Default: Story = {
  args: {
    label: 'Total Estate Value',
    value: '$2.02B',
  },
}

export const WithBadge: Story = {
  args: {
    label: 'Portfolio Performance',
    value: '$1.2B',
    badge: { text: '+8.2% YTD', positive: true },
  },
}

export const WithIcon: Story = {
  args: {
    label: 'Total Estate Value',
    value: '$2.02B',
    icon: IconCurrencyDollar,
  },
}

export const WithIconAndBadge: Story = {
  args: {
    label: 'YTD Performance',
    value: '+8.2%',
    icon: IconTrendingUp,
    badge: { text: 'On track', positive: true },
  },
}

