/**
 * Consolidated formatting utilities.
 * Replaces 9+ duplicate formatters across components.
 */

/** Format currency with M/K abbreviations: $1M, $500K, $1,234 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

/** Format currency for charts with B/M tiers: $1.2B, $14M */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
  return `$${value.toLocaleString()}`
}

/** Format amount with string passthrough (for timeline events) */
export function formatAmount(amount: number | string): string {
  if (typeof amount !== 'number') return String(amount)
  if (amount === 0) return ''
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toLocaleString()}`
}

/** Format full dollar amount: $3,000,000 */
export function formatFullCurrency(value: number): string {
  return '$' + value.toLocaleString('en-US')
}

/** Format date string: "Mar 15, 2026" */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
