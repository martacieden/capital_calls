import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimelinePage } from '../../components/pages/TimelinePage'
import { thorntonFamilyData } from '../../data/thornton'
import { thorntonAssetTimeline } from '../../data/thornton/asset-timeline'

const allItems = thorntonFamilyData.getAllItems()
const distributions = thorntonFamilyData.distributions
const getItemById = (id: string) => allItems.find((i) => i.id === id) ?? null

/**
 * ## TimelinePage
 *
 * ### What it does
 * Distribution timeline page showing all scheduled and triggered transfers across
 * family trusts. Renders a heading with count badge, CatalogToolbar configured for
 * trust filtering, and a horizontal scrolling timeline track. Timeline nodes alternate
 * above/below a rail, with "Now" and "Life Events" separator markers. Each node
 * shows event details (beneficiary, amount, year). Includes a DistributionDetailPanel
 * slide-in on card click, expand/collapse to fullscreen, and scroll progress indicator.
 *
 * ### Key behaviors
 * - Trust dropdown filters distributions (includes sub-trust mapping)
 * - Search filters by beneficiary name or description
 * - Quick filters: Upcoming, Completed, Age-based, Conditional
 * - Timeline nodes alternate above/below the horizontal rail
 * - "Now" marker separates past and future events
 * - "Life Events" marker separates dated and conditional events
 * - Click a node to open DistributionDetailPanel
 * - Expand button toggles fullscreen mode with embedded TimelineToolbar
 * - ScrollProgress bar at bottom of track
 * - Processing state shows Fojo "building your profile" empty state
 *
 * ### Tokens used
 * `--color-gray-12` (heading), `--color-neutral-3` (count badge bg),
 * `--color-gray-4` (borders), `--color-accent-9` (Now marker, highlight),
 * `--color-white` (expand button bg),
 * `--spacing-3` through `--spacing-7`,
 * `--radius-md`, `--radius-lg`, `--radius-full`, `--radius-sm`,
 * `--shadow-subtle`, `--font-weight-medium`, `--font-weight-bold`
 *
 */
const meta: Meta<typeof TimelinePage> = {
  title: 'Pages/TimelinePage',
  component: TimelinePage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex', background: '#fff' }}>
        <div className="main-content" style={{ flex: 1, overflow: 'auto' }}>
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TimelinePage>

export const Default: Story = {
  args: {
    distributions,
    assetTimeline: thorntonAssetTimeline,
    getItemById,
    activeOrgs: ['org-thornton'],
    onOrgsChange: () => {},
    onToggleExpand: () => {},
    isExpanded: false,
  },
}

export const Expanded: Story = {
  args: {
    distributions,
    assetTimeline: thorntonAssetTimeline,
    getItemById,
    activeOrgs: ['org-thornton'],
    onOrgsChange: () => {},
    onToggleExpand: () => {},
    isExpanded: true,
  },
}

export const Processing: Story = {
  args: {
    distributions: [],
    assetTimeline: [],
    getItemById,
    activeOrgs: [],
    onOrgsChange: () => {},
    isV3Processing: true,
  },
}

export const WithSelectedAsset: Story = {
  args: {
    distributions,
    assetTimeline: thorntonAssetTimeline,
    getItemById,
    activeOrgs: ['org-thornton'],
    onOrgsChange: () => {},
    selectedItemId: 'thn-a1',
    onClearSelectedItem: () => {},
    onToggleExpand: () => {},
    isExpanded: false,
  },
}
