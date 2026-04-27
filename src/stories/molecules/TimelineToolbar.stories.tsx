import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimelineToolbar } from '../../components/molecules/TimelineToolbar'

const trustItems = [
  { key: 'thn-t1', label: 'Thornton Family RLT' },
  { key: 'thn-t2', label: 'Dynasty Trust I' },
  { key: 'thn-t3', label: 'ILIT' },
  { key: 'thn-t4', label: "Children's Trust" },
]

/**
 * ## TimelineToolbar
 *
 * ### What it does
 * Floating toolbar for the distribution timeline view. Contains a trust selection
 * dropdown and a search input. The dropdown label updates to show the selected trust
 * name or defaults to "Trust" when multiple/none are selected.
 *
 * ### Key behaviors
 * - Trust selection dropdown with single select
 * - Search input with custom placeholder "Search distributions..."
 * - Dynamic label shows selected trust name
 * - Absolutely positioned overlay on timeline
 *
 * ### Tokens used
 * `--color-white`, `--color-gray-4`, `--color-neutral-11`, `--radius-md`,
 * `--shadow-subtle`, `--spacing-1`
 *
 */

function TimelineToolbarDemo() {
  const [activeTrust, setActiveTrust] = useState<string[]>(['thn-t2'])
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <div style={{ position: 'relative', height: 80, background: 'var(--color-neutral-2)', borderRadius: 8 }}>
      <TimelineToolbar
        activeTrust={activeTrust}
        onTrustChange={setActiveTrust}
        trustItems={trustItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  )
}

const meta: Meta<typeof TimelineToolbar> = {
  title: 'Molecules/TimelineToolbar',
  component: TimelineToolbar,
  tags: ['autodocs'],
  argTypes: {
    activeTrust: { control: 'object', description: 'Array of selected trust IDs' },
    onTrustChange: { action: 'trust-changed' },
    trustItems: { control: 'object', description: 'Array of trust dropdown items' },
    searchQuery: { control: 'text', description: 'Current search query' },
    onSearchChange: { action: 'search-changed' },
  },
}

export default meta
type Story = StoryObj<typeof TimelineToolbar>

export const Default: Story = {
  render: () => <TimelineToolbarDemo />,
}

