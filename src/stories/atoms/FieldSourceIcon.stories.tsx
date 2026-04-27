import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldSourceIcon } from '../../components/atoms/FieldSourceIcon'
import type { FieldSource } from '../../data/field-sources'

const pdfSource: FieldSource = {
  sourceType: 'pdf',
  documentLabel: 'Family Trust Agreement',
  page: 1,
  excerpt: 'THIS REVOCABLE LIVING TRUST AGREEMENT is entered into on March 15, 2012, by Edward Thornton III as Grantor and Trustee.',
}

const webSource: FieldSource = {
  sourceType: 'web',
  siteName: 'Zillow',
  url: 'https://www.zillow.com/homedetails/834-fifth-ave',
  webExcerpt: 'Estimated market value for 834 Fifth Avenue, PH-A: $44,500,000-$46,200,000 based on comparable sales in the 10065 zip code.',
}

const pdfNoPage: FieldSource = {
  sourceType: 'pdf',
  documentLabel: 'Inventory List 2026',
  excerpt: 'Asset Class: Real Estate - Residential. Holding entity: Thornton RE Holdings LLC.',
}

/**
 * ## FieldSourceIcon
 *
 * ### What it does
 * A small inline icon (PDF or web) that shows a hover tooltip popover with source attribution
 * details. Used next to individual fields on the asset detail page to indicate where data
 * was sourced from (uploaded document page or web search result).
 *
 * ### Key behaviors
 * - Hover (150ms delay): shows a portal tooltip with source label and excerpt
 * - Tooltip flips direction when near top of viewport (< 160px from top)
 * - Tooltip stays open when hovering over the tooltip itself
 * - Leave (100ms delay): hides tooltip
 * - PDF sources show `IconFileText` with accent-3 bg, web sources show `IconWorld` with green bg
 *
 * ### Tokens used
 * `--color-white` (tooltip bg), `--color-gray-4` (tooltip border), `--radius-lg` (tooltip corners),
 * `--radius-md` (icon badge corners), `--color-accent-3` (PDF icon bg), `--color-accent-9` (PDF icon color),
 * `--color-green-1` (web icon bg), `--color-gray-12` (label text), `--color-neutral-11` (excerpt text)
 *
 */
const meta: Meta<typeof FieldSourceIcon> = {
  title: 'Atoms/FieldSourceIcon',
  component: FieldSourceIcon,
  tags: ['autodocs'],
  argTypes: {
    source: { control: 'object', description: 'FieldSource object (pdf or web type) with attribution data' },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '80px 40px' }}>
        <div className="detail-page__kv-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--color-neutral-11)' }}>Hover the icon to see tooltip:</span>
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FieldSourceIcon>

export const PdfSource: Story = {
  args: {
    source: pdfSource,
  },
}

export const WebSource: Story = {
  args: {
    source: webSource,
  },
}

export const PdfWithoutPage: Story = {
  args: {
    source: pdfNoPage,
  },
}
