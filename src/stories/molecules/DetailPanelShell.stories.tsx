import type { Meta, StoryObj } from '@storybook/react-vite'
import { DetailPanelShell, DetailTabs } from '../../components/molecules/DetailPanelShell'
import { useState } from 'react'

/**
 * ## DetailPanelShell
 *
 * ### What it does
 * Slide-in sidebar panel shell for viewing and editing item details. Provides a header
 * with breadcrumbs and action buttons, a scrollable content area, an optional pinned
 * footer, and a backdrop overlay. Also exports a `DetailTabs` component for tabbed content.
 *
 * ### Key behaviors
 * - Slide-in animation with overlay backdrop
 * - Close button in header
 * - Breadcrumbs navigation area
 * - Optional header actions (edit, delete buttons)
 * - Scrollable content area (hidden scrollbar)
 * - Optional pinned footer (save/cancel)
 * - `hideOverlay` option for embedded usage
 *
 * ### Tokens used
 * `--color-gray-4`, `--color-neutral-3`, `--color-neutral-11`, `--color-gray-12`,
 * `--radius-md`, `--radius-sm`, `--spacing-1`, `--spacing-3`, `--spacing-5`,
 * `--spacing-6`, `--spacing-8`
 *
 */
const meta: Meta<typeof DetailPanelShell> = {
  title: 'Molecules/DetailPanelShell',
  component: DetailPanelShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--color-neutral-2)' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isOpen: { control: 'boolean', description: 'Whether the panel is visible' },
    onClose: { action: 'closed', description: 'Callback when close button or overlay is clicked' },
    breadcrumbs: { control: false, description: 'ReactNode for breadcrumb navigation' },
    headerActions: { control: false, description: 'ReactNode for header action buttons' },
    footer: { control: false, description: 'ReactNode for pinned footer' },
    hideOverlay: { control: 'boolean', description: 'Hide the backdrop overlay' },
    ariaLabel: { control: 'text', description: 'Accessible label for the panel' },
    children: { control: false, description: 'Panel body content' },
  },
}

export default meta
type Story = StoryObj<typeof DetailPanelShell>

export const Open: Story = {
  args: {
    isOpen: true,
    ariaLabel: 'Item details',
    breadcrumbs: (
      <div className="detail-breadcrumbs">
        <span className="detail-breadcrumb-segment" style={{ fontSize: 13, color: 'var(--color-neutral-11)' }}>Assets</span>
        <span style={{ margin: '0 4px', color: 'var(--color-neutral-9)', fontSize: 13 }}>/</span>
        <span className="detail-breadcrumb-segment" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-gray-12)' }}>Fifth Avenue Penthouse</span>
      </div>
    ),
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Fifth Avenue Penthouse</h2>
        <p style={{ margin: 0, color: 'var(--color-neutral-11)', fontSize: 14, lineHeight: 1.6 }}>
          Primary residence at 834 Fifth Avenue, NYC. 6,200 sq ft penthouse with Central Park views.
        </p>
      </div>
    ),
  },
}

export const WithFooter: Story = {
  args: {
    isOpen: true,
    ariaLabel: 'Edit item',
    breadcrumbs: (
      <div className="detail-breadcrumbs">
        <span className="detail-breadcrumb-segment" style={{ fontSize: 13, color: 'var(--color-neutral-11)' }}>Assets</span>
        <span style={{ margin: '0 4px', color: 'var(--color-neutral-9)', fontSize: 13 }}>/</span>
        <span className="detail-breadcrumb-segment" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-gray-12)' }}>Fifth Avenue Penthouse</span>
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid var(--color-gray-4)' }}>
        <button style={{ padding: '6px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-4)', background: 'white', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
        <button style={{ padding: '6px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-accent-9)', color: 'white', cursor: 'pointer', fontSize: 13 }}>Save changes</button>
      </div>
    ),
    children: <div style={{ color: 'var(--color-neutral-11)', fontSize: 14 }}>Edit form fields would go here</div>,
  },
}

function DetailTabsDemo() {
  const [activeTab, setActiveTab] = useState('details')
  return (
    <DetailTabs
      tabs={[
        { key: 'details', label: 'Details' },
        { key: 'relationships', label: 'Relationships' },
        { key: 'sources', label: 'Sources' },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )
}

export const TabsComponent: Story = {
  render: () => (
    <DetailPanelShell
      isOpen={true}
      onClose={() => {}}
      breadcrumbs={
        <div className="detail-breadcrumbs">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-gray-12)' }}>Tab demo</span>
        </div>
      }
      ariaLabel="Tab demo"
    >
      <DetailTabsDemo />
      <div style={{ color: 'var(--color-neutral-11)', fontSize: 14 }}>Tab content area</div>
    </DetailPanelShell>
  ),
}
