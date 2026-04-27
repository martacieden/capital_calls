import type { Meta, StoryObj } from '@storybook/react-vite'
import { DocumentUploadSection } from '../../components/molecules/DocumentUploadSection'

/**
 * ## DocumentUploadSection
 *
 * ### What it does
 * Drop zone for uploading documents with an animated processing state. Shows decorative
 * mini file preview cards (trust doc SVG, Tesla photo, insurance doc SVG), a dashed
 * border, and drag-and-drop support. When processing, transitions to a compact strip
 * showing Fojo mascot, step labels, progress bar, and percentage.
 *
 * ### Key behaviors
 * - Drag-and-drop with visual hover state
 * - Click to trigger upload
 * - Animated processing strip with step-by-step labels
 * - Progress bar with percentage
 * - Two step sets: onboarding (4 steps, 12s) and upload (3 steps, 5s)
 * - SVG dashed border with ResizeObserver
 * - Decorative stacked mini document preview cards
 *
 * ### Tokens used
 * `--color-neutral-3`, `--color-neutral-9`, `--color-neutral-11`, `--color-neutral-12`,
 * `--color-purple`, `--color-purple-text`, `--font-weight-semibold`
 *
 */
const meta: Meta<typeof DocumentUploadSection> = {
  title: 'Molecules/DocumentUploadSection',
  component: DocumentUploadSection,
  tags: ['autodocs'],
  argTypes: {
    initialProcessing: { control: 'boolean', description: 'Start in processing/onboarding state' },
    onUploadComplete: { action: 'upload-complete', description: 'Callback when processing finishes' },
  },
}

export default meta
type Story = StoryObj<typeof DocumentUploadSection>

export const Idle: Story = {
  args: {
    initialProcessing: false,
  },
}

export const Processing: Story = {
  args: {
    initialProcessing: true,
  },
}
