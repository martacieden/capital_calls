import type { Meta, StoryObj } from '@storybook/react-vite'
import { FojoPanel } from '../../components/organisms/FojoPanel'
import type { AnyCatalogItem } from '../../data/types'

const mockCurrentItem: AnyCatalogItem = {
  id: 'thn-a1',
  name: 'Fifth Avenue Penthouse',
  organizationId: 'org-thornton',
  categoryKey: 'property',
  imageUrl: '/images/fifth-ave-penthouse.jpg',
  description: '10,000 sq ft penthouse. Primary residence of Edward III and Anastasia.',
  createdAt: '2026-01-15T10:00:00Z',
  createdBy: { id: 'u1', name: 'Edward Thornton III' },
  assetType: 'Real Estate',
  value: 45_000_000,
} as AnyCatalogItem

/**
 * ## FojoPanel
 *
 * ### What it does
 * The Fojo AI chat sidebar. Renders a full chat interface with: a header row
 * (Fojo title, notification bell, history, new-conversation, and close buttons),
 * a welcome screen with mascot and quick-prompt chips, message bubbles for
 * user + assistant, a typing indicator, a Q&A picker, file attachment chips,
 * and a chat footer with input, attachment/mention buttons, and send/mic button.
 * Also handles creation flow states (dropzone, pipeline steps, summary cards)
 * and toast notifications via portal.
 *
 * ### Key behaviors
 * - Welcome screen with mascot animation and quick prompts when no conversation
 * - Contextual summary card shown on asset detail page with no active conversation
 * - Chat messages alternate user (right) and assistant (left)
 * - Creation flow: prompt → file upload → pipeline → summary with created items
 * - Q&A picker appears above footer during creation or chat Q&A
 * - Notification dropdown from bell icon
 * - Toast notifications for background updates
 *
 * ### Tokens used
 * `--color-white` (bg), `--color-gray-4` (borders), `--color-neutral-5` (button borders),
 * `--color-neutral-11` (icons), `--color-purple` (send button, accents),
 * `--color-purple-text` (quick prompts), `--color-purple-hover` (prompt bg),
 * `--color-black` (title), `--color-red-9` (badge),
 * `--radius-md`, `--radius-lg`, `--radius-2xl`,
 * `--shadow-panel`, `--spacing-1` through `--spacing-7`,
 * `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold`
 *
 */
const meta: Meta<typeof FojoPanel> = {
  title: 'Organisms/FojoPanel',
  component: FojoPanel,
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex justify-center">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FojoPanel>

export const WelcomeScreen: Story = {
  args: {
    visibility: 'open',
    onClose: () => {},
  },
}

export const WithDetailContext: Story = {
  args: {
    visibility: 'open',
    onClose: () => {},
    currentPage: 'detail',
    currentItem: mockCurrentItem,
  },
}

export const AsOverlay: Story = {
  args: {
    visibility: 'open',
    onClose: () => {},
    isOverlay: true,
  },
}
