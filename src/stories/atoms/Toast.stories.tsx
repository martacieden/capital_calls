import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ToastContainer, showToast } from '../../components/atoms/Toast'

function ToastTrigger({ text, type, actionLabel }: { text: string; type: 'success' | 'error' | 'loading'; actionLabel?: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      showToast(
        text,
        type,
        actionLabel ? { label: actionLabel, onClick: () => console.log('Toast action clicked') } : undefined,
      )
    }, 300)
    return () => clearTimeout(timer)
  }, [text, type, actionLabel])

  return <ToastContainer />
}

/**
 * ## Toast
 *
 * ### What it does
 * Global toast notification system with an imperative API. The `ToastContainer` renders
 * at the top-center of the viewport. `showToast()` creates notifications and `updateToast()`
 * can mutate existing ones (e.g. loading -> success). Toasts auto-dismiss after 6s (8s with action).
 *
 * ### Key behaviors
 * - `showToast(text, type, action?)` creates a new toast and returns its ID
 * - `updateToast(id, text, type, action?)` mutates an existing toast in place
 * - Success: shows a green checkmark icon
 * - Error: shows a red X icon
 * - Loading: shows a spinning CSS dot
 * - Loading toasts do not auto-dismiss (must be updated to success/error)
 * - Action button renders inline for contextual follow-ups
 *
 * ### Tokens used
 * `--spacing-2` (gap between toasts)
 *
 */
const meta: Meta<typeof ToastContainer> = {
  title: 'Atoms/Toast',
  component: ToastContainer,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ToastContainer>

export const Success: Story = {
  render: () => <ToastTrigger text="Asset saved successfully" type="success" />,
}

export const Error: Story = {
  render: () => <ToastTrigger text="Failed to upload document" type="error" />,
}

export const Loading: Story = {
  render: () => <ToastTrigger text="Processing trust agreement..." type="loading" />,
}

export const WithAction: Story = {
  render: () => <ToastTrigger text="3 new assets imported" type="success" actionLabel="View All" />,
}
