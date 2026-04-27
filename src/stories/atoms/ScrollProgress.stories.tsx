import { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScrollProgress } from '../../components/atoms/ScrollProgress'

/**
 * ## ScrollProgress
 *
 * ### What it does
 * A thin horizontal progress bar that tracks the horizontal scroll position of a
 * container. Used at the bottom of the Timeline view to indicate scroll progress.
 * Built with Framer Motion's `useScroll` and `useTransform`.
 *
 * ### Key behaviors
 * - Width animates from 2% to 100% based on the container's `scrollXProgress`
 * - Minimum visible width is 2% (even at scroll position 0)
 * - Progress bar is absolutely positioned at the bottom of its parent
 *
 * ### Tokens used
 * `--color-neutral-3` (track background), `--color-accent-9` (progress fill),
 * `--radius-full` (pill shape for both track and fill)
 *
 */
const meta: Meta<typeof ScrollProgress> = {
  title: 'Atoms/ScrollProgress',
  component: ScrollProgress,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ScrollProgress>

/**
 * Scroll the inner container horizontally to see the progress bar update.
 */
export const Default: Story = {
  render: () => {
    const ScrollDemo = () => {
      const ref = useRef<HTMLDivElement>(null)
      return (
        <div style={{ position: 'relative', maxWidth: 500, paddingBottom: 6 }}>
          <div
            ref={ref}
            style={{
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              padding: '16px 0',
              border: '1px solid var(--color-gray-5)',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'inline-flex', gap: 16, padding: '0 16px' }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 120,
                    height: 80,
                    borderRadius: 8,
                    background: `hsl(${i * 18}, 60%, 85%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#555',
                    flexShrink: 0,
                  }}
                >
                  Item {i + 1}
                </div>
              ))}
            </div>
          </div>
          <ScrollProgress trackRef={ref} />
        </div>
      )
    }
    return <ScrollDemo />
  },
}
