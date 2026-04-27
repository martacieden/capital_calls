/**
 * Shared constants — single source of truth for magic numbers and repeated values.
 */

/** Responsive breakpoints in pixels */
export const BREAKPOINTS = {
  small: 1100,
} as const

/** Animation and timer durations in milliseconds */
export const TIMING = {
  /** Default exit animation for deferred unmount */
  exitAnimation: 350,
  /** Placeholder text rotation interval */
  placeholderRotation: 4000,
  /** Placeholder text fade-out duration */
  placeholderFade: 300,
  /** How long highlighted items stay highlighted */
  highlightFade: 10000,
  /** Delay before showing collection-created toast */
  toastDelay: 3000,
  /** Initial loading spinner duration */
  initialLoading: 1200,
  /** Deferred unmount for v3 empty state */
  v3EmptyUnmount: 400,
} as const

/** Pagination / scroll thresholds */
export const PAGINATION = {
  catalogCards: 9,
  scrollThreshold: 400,
} as const

/** Asset category keys that show asset-specific UI (timeline strip, etc.) */
export const ASSET_CATEGORIES = new Set([
  'property', 'investment', 'maritime', 'vehicle', 'insurance', 'art',
])

/** Typing indicator word options for Fojo */
export const TYPING_WORDS = ['Thinking', 'Analyzing', 'Responding', 'Processing'] as const
