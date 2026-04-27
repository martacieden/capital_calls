import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CatalogToolbar } from '../../components/organisms/CatalogToolbar'
import type { CatalogView, QuickFilterKey } from '../../data/types'

/**
 * ## CatalogToolbar
 *
 * ### What it does
 * Toolbar row used atop catalog-style pages (Assets, Documents, Timeline).
 * Contains a multi-select category dropdown, a "Filters" button, a search input,
 * view-mode toggle buttons (list / grid / map), and a row of quick-filter chips
 * below. Supports an optional "Add category" footer in the dropdown that opens
 * a modal icon-picker dialog.
 *
 * ### Key behaviors
 * - Category dropdown supports multi-select with clear-all
 * - Quick filter chips toggle on/off; alert-type chips sort to the front when counts > 0
 * - View mode buttons highlight the active view
 * - "Add category" opens a portal modal with name input and icon grid
 *
 * ### Tokens used
 * `--color-gray-4` (border), `--color-white` (bg), `--color-neutral-3` (hover),
 * `--color-neutral-11` (icon/text), `--color-accent-9` (active chip),
 * `--color-accent-contrast` (active chip text), `--color-orange-1` / `--color-orange-9` (alert chips),
 * `--spacing-2`, `--spacing-3`, `--spacing-5`, `--radius-lg`, `--radius-sm`,
 * `--shadow-toolbar`, `--font-weight-medium`
 *
 */
const meta: Meta<typeof CatalogToolbar> = {
  title: 'Organisms/CatalogToolbar',
  component: CatalogToolbar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 900, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CatalogToolbar>

function CatalogToolbarWithState(props: Partial<React.ComponentProps<typeof CatalogToolbar>>) {
  const [activeView, setActiveView] = useState<CatalogView>('grid')
  const [activeCategory, setActiveCategory] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilterKey>>(new Set())

  return (
    <CatalogToolbar
      activeView={activeView}
      onViewChange={setActiveView}
      activeOrgs={[]}
      onOrgsChange={() => {}}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      activeQuickFilters={activeQuickFilters}
      onQuickFilterChange={(key) => {
        setActiveQuickFilters((prev) => {
          const next = new Set(prev)
          if (next.has(key)) next.delete(key)
          else next.add(key)
          return next
        })
      }}
      {...props}
    />
  )
}

export const Default: Story = {
  render: () => <CatalogToolbarWithState />,
}

export const WithAlertCounts: Story = {
  render: () => (
    <CatalogToolbarWithState
      quickFilterItems={[
        { key: 'recently-updated', label: 'Recently updated', count: 3 },
        { key: 'expiring-soon', label: 'Expiring soon', count: 2, isAlert: true },
        { key: 'unlinked', label: 'Unlinked', count: 5 },
        { key: 'missing-insurance', label: 'Uninsured', count: 1, isAlert: true },
        { key: 'stale-valuation', label: 'Stale valuation', count: 4, isAlert: true },
        { key: 'missing-documents', label: 'Missing documents', count: 2, isAlert: true },
      ]}
    />
  ),
}
