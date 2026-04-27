import type { Meta, StoryObj } from '@storybook/react-vite'
import { FamilyTreeView } from '../../components/organisms/FamilyTreeView'
import { thorntonFamilyData } from '../../data/thornton'

const allItems = thorntonFamilyData.getAllItems()
const allRelationships = thorntonFamilyData.relationships

/**
 * ## FamilyTreeView
 *
 * ### What it does
 * Full-canvas interactive entity/asset graph (map view) built on React Flow.
 * Thornton family items are placed at hardcoded Figma-reference coordinates;
 * non-Thornton orgs fall back to a grid layout. Renders item nodes with category
 * icons, relationship edges with labels, trust-group highlight on hover, zoom
 * controls, a legend, and an expand/collapse button. Supports an inline
 * action-prompt dropdown anchored to graph nodes.
 *
 * ### Key behaviors
 * - Hover over a node highlights its full descendant subtree with a dynamic group rect
 * - Click a node to select it; camera zooms in
 * - Deselecting zooms back out
 * - Search dims non-matching nodes
 * - Expand button toggles fullscreen mode
 * - Zoom in / out / fit-to-view buttons in bottom-right
 * - MapLegend shows category color swatches
 *
 * ### Tokens used
 * `--color-gray-4` (borders), `--color-neutral-3` (hover), `--color-neutral-11` (icon/text),
 * `--color-accent-9` (highlight edges), `--color-white` (buttons),
 * `--radius-md`, `--radius-full`, `--shadow-subtle`, `--spacing-2`, `--spacing-3`
 *
 */
const meta: Meta<typeof FamilyTreeView> = {
  title: 'Organisms/FamilyTreeView',
  component: FamilyTreeView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FamilyTreeView>

export const Default: Story = {
  render: () => (
    <FamilyTreeView
      items={allItems}
      relationships={allRelationships}
      onItemClick={() => {}}
      isExpanded={false}
      onToggleExpand={() => {}}
      activeOrgs={['org-thornton']}
      onOrgsChange={() => {}}
      activeCategory={[]}
      onCategoryChange={() => {}}
    />
  ),
}

export const Expanded: Story = {
  render: () => (
    <FamilyTreeView
      items={allItems}
      relationships={allRelationships}
      onItemClick={() => {}}
      isExpanded={true}
      onToggleExpand={() => {}}
      activeOrgs={['org-thornton']}
      onOrgsChange={() => {}}
      activeCategory={[]}
      onCategoryChange={() => {}}
      searchQuery=""
      onSearchChange={() => {}}
    />
  ),
}

export const WithSearch: Story = {
  render: () => (
    <FamilyTreeView
      items={allItems}
      relationships={allRelationships}
      onItemClick={() => {}}
      isExpanded={false}
      onToggleExpand={() => {}}
      activeOrgs={['org-thornton']}
      onOrgsChange={() => {}}
      activeCategory={[]}
      onCategoryChange={() => {}}
      searchQuery="Edward"
      onSearchChange={() => {}}
    />
  ),
}

