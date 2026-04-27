import type { Meta, StoryObj } from '@storybook/react-vite'
import { CardSkeleton, ListSkeleton } from '../../components/atoms/CatalogSkeleton'

/**
 * ## CatalogSkeleton
 *
 * ### What it does
 * Provides two skeleton loading placeholder components for the catalog:
 * - `CardSkeleton`: renders a grid of shimmer card placeholders (9 when chat is open, 12 otherwise)
 * - `ListSkeleton`: renders a table with 10 shimmer rows matching the list view layout
 *
 * ### Key behaviors
 * - `CardSkeleton` adjusts column count via `isChatOpen` prop (9 vs 12 cards)
 * - `ListSkeleton` always renders 10 rows with Name, Category, Created By, Date columns
 * - All elements use `skeleton-shimmer` CSS animation class
 *
 * ### Tokens used
 * `--color-neutral-3` (card image bg), `--color-gray-4` (border)
 * `--spacing-4`, `--spacing-2`, `--spacing-1` (card content padding)
 *
 */
const cardMeta: Meta<typeof CardSkeleton> = {
  title: 'Atoms/CatalogSkeleton',
  component: CardSkeleton,
  tags: ['autodocs'],
  argTypes: {
    isChatOpen: { control: 'boolean', description: 'When true, renders 9 cards instead of 12 (narrower grid)' },
  },
}

export default cardMeta
type CardStory = StoryObj<typeof CardSkeleton>

export const Default: CardStory = {
  args: {
    isChatOpen: false,
  },
}

/**
 * ### ListSkeleton
 *
 * Table-based skeleton for the catalog list view. Renders 10 shimmer rows.
 */
export const ListSkeletonStory: StoryObj<typeof ListSkeleton> = {
  render: () => <ListSkeleton />,
  name: 'List Skeleton',
}
