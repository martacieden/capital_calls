import { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CardActionsMenu } from '../../components/molecules/CardActionsMenu'

/**
 * ## CardActionsMenu
 *
 * ### What it does
 * Portal-rendered contextual actions dropdown for graph tree and timeline cards.
 * Shows different action sets depending on context: graph cards get 6 actions
 * (create task, add asset, update relationships, edit details, open details, view sources)
 * while timeline cards get 3 (create task, edit details, view sources).
 * AI-powered actions show a Fojo mascot icon.
 *
 * ### Key behaviors
 * - Follows anchor element via rAF loop (stays attached during pan/zoom)
 * - Transparent backdrop catches clicks outside
 * - Close on Escape key
 * - AI actions show Fojo mascot badge
 * - Flips horizontally/vertically to stay within viewport
 *
 * ### Tokens used
 * `--color-white`, `--color-gray-4`, `--color-neutral-3`, `--color-neutral-4`,
 * `--color-neutral-11`, `--color-neutral-12`, `--radius-2xl`, `--radius-sm`
 *
 */

function CardActionsMenuDemo({ itemContext }: { itemContext: 'graph' | 'timeline' }) {
  const anchorRef = useRef<HTMLDivElement>(null)
  return (
    <div style={{ padding: 100 }}>
      <div
        ref={anchorRef}
        style={{
          width: 360,
          height: 120,
          background: 'var(--color-neutral-3)',
          borderRadius: 12,
          border: '1px solid var(--color-gray-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          color: 'var(--color-neutral-11)',
        }}
      >
        Anchor card ({itemContext} context)
      </div>
      <CardActionsMenu
        itemContext={itemContext}
        anchorRef={anchorRef as React.RefObject<HTMLElement>}
        onClose={() => {}}
        onAction={() => {}}
      />
    </div>
  )
}

const meta: Meta<typeof CardActionsMenu> = {
  title: 'Molecules/CardActionsMenu',
  component: CardActionsMenu,
  tags: ['autodocs'],
  argTypes: {
    itemContext: {
      control: 'select',
      options: ['graph', 'timeline'],
      description: 'Determines which set of actions to show',
    },
    onClose: { action: 'closed' },
    onAction: { action: 'action-selected' },
  },
}

export default meta
type Story = StoryObj<typeof CardActionsMenu>

export const GraphContext: Story = {
  render: () => <CardActionsMenuDemo itemContext="graph" />,
}

export const TimelineContext: Story = {
  render: () => <CardActionsMenuDemo itemContext="timeline" />,
}
