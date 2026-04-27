import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapToolbar } from '../../components/molecules/MapToolbar'

/**
 * ## MapToolbar
 *
 * ### What it does
 * Floating toolbar overlay for the estate map view. Contains a multi-select category
 * dropdown (populated from catalogCategories), a filters button, and a search input.
 * Positioned absolutely at top-left of the map container.
 *
 * ### Key behaviors
 * - Category dropdown with multi-select and clear button
 * - Search input for filtering map nodes
 * - Filters button (placeholder)
 * - Absolutely positioned overlay on map
 *
 * ### Tokens used
 * `--color-white`, `--color-gray-4`, `--color-neutral-11`, `--radius-md`,
 * `--shadow-subtle`, `--spacing-1`
 *
 */

function MapToolbarDemo() {
  const [activeCategory, setActiveCategory] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <div style={{ position: 'relative', height: 80, background: 'var(--color-neutral-2)', borderRadius: 8 }}>
      <MapToolbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  )
}

const meta: Meta<typeof MapToolbar> = {
  title: 'Molecules/MapToolbar',
  component: MapToolbar,
  tags: ['autodocs'],
  argTypes: {
    activeCategory: { control: 'object', description: 'Array of selected category keys' },
    onCategoryChange: { action: 'category-changed', description: 'Callback with new category keys' },
    searchQuery: { control: 'text', description: 'Current search query string' },
    onSearchChange: { action: 'search-changed', description: 'Callback with new search query' },
  },
}

export default meta
type Story = StoryObj<typeof MapToolbar>

export const Default: Story = {
  render: () => <MapToolbarDemo />,
}

