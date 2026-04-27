import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatMessageBubble } from '../../components/molecules/ChatMessageBubble'
import type { ChatMessage } from '../../data/types/fojo'

const userMessage: ChatMessage = {
  id: 1,
  role: 'user',
  text: 'What trusts hold the Fifth Avenue Penthouse?',
}

const assistantMessage: ChatMessage = {
  id: 2,
  role: 'assistant',
  text: "The **Fifth Avenue Penthouse** is held by the Thornton Family Revocable Living Trust. Here's what I found:\n\n- Direct ownership via Family Office LLC\n- Transfer completed in 2012\n- Current assessed value: **$32M**",
}

const messageWithCards: ChatMessage = {
  id: 3,
  role: 'assistant',
  text: "I've identified the following related entities:",
  cards: [
    {
      id: 'thn-t1', name: 'Thornton Family RLT', organizationId: 'org-1', categoryKey: 'trust',
      description: 'Cornerstone trust', createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
    },
    {
      id: 'thn-e1', name: 'Thornton Family Office LLC', organizationId: 'org-1', categoryKey: 'entity',
      description: 'Holding entity', createdAt: '2025-11-02', createdBy: { id: 'u1', name: 'Sandra Whitfield' },
      _relLabel: 'Managed by',
    },
  ],
}

const messageWithTimeline: ChatMessage = {
  id: 4,
  role: 'assistant',
  text: "I've compiled the distribution timeline for the Dynasty Trust.",
  artifact: 'timeline',
}

/**
 * ## ChatMessageBubble
 *
 * ### What it does
 * Renders a single chat message bubble for the Fojo AI conversation panel.
 * Supports user and assistant roles with different alignment. Assistant messages
 * can contain inline cards (catalog items with icons and navigation arrows),
 * a timeline artifact link, and formatted text with bold and list markdown.
 *
 * ### Key behaviors
 * - User messages right-aligned, assistant left-aligned
 * - Markdown-like formatting: **bold**, bullet lists, numbered lists
 * - Inline catalog item cards with category icons
 * - Relationship cards with `_relLabel` display
 * - Timeline artifact card with "Open" button
 * - Distribution summary display for timeline cards
 *
 * ### Tokens used
 * `--color-gray-4`, `--color-gray-12`, `--color-neutral-11`, `--color-neutral-12`,
 * `--color-neutral-3`, `--color-accent-9`, `--color-white`, `--color-blue-1`,
 * `--radius-lg`, `--radius-md`, `--spacing-2`
 *
 */
const meta: Meta<typeof ChatMessageBubble> = {
  title: 'Molecules/ChatMessageBubble',
  component: ChatMessageBubble,
  tags: ['autodocs'],
  argTypes: {
    msg: { control: 'object', description: 'ChatMessage object' },
    onOpenTimeline: { action: 'open-timeline', description: 'Callback when timeline artifact is clicked' },
    distributionSummary: { control: 'object', description: 'Summary stats for timeline artifact' },
    onItemClick: { action: 'item-clicked', description: 'Callback when an inline card is clicked' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, padding: 16, background: 'var(--color-neutral-2)' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChatMessageBubble>

export const UserMessage: Story = {
  args: { msg: userMessage },
}

export const AssistantMessage: Story = {
  args: { msg: assistantMessage },
}

export const WithCards: Story = {
  args: { msg: messageWithCards },
}

export const WithTimelineArtifact: Story = {
  args: { msg: messageWithTimeline },
}

