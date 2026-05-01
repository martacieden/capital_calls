/**
 * contactActionUtils — single source of truth for when "Contact Lawyer"
 * and "Contact CPA / Accountant" actions are shown across the app.
 *
 * Priority:
 *   1. event.suggestedActions explicitly set (even empty []) → use that
 *   2. suggestedActions absent (undefined) → apply category / label rules below
 */

import type { DistributionEvent, AssetTimelineEvent, AnyCatalogItem } from '@/data/types'
import type { CardActionType } from '@/components/molecules/CardActionsMenu'

// ─── Distribution event rules (by triggerCategory) ─────────────────

const DISTRIBUTION_LAWYER_CATEGORIES = new Set([
    'Marriage',
    'New Dependent',
    "Beneficiary's Death",
    "Grantor's Death",
    'Domestic Partnership',
    'Home Purchase',
    'Liquidity Event',
    'Relocation',
    'Health Condition',
    'Creditor Protection',
    'Trust Review',
])

const DISTRIBUTION_CPA_CATEGORIES = new Set([
    'Tax Event',
    "Beneficiary's Death",
    "Grantor's Death",
    'Liquidity Event',
    'Trust Review',
])

// ─── Asset timeline event rules (substring match on label) ─────────

/** Label substrings that suggest a lawyer contact */
const ASSET_LAWYER_LABEL_KEYWORDS = ['Insurance', 'Legal', 'Title', 'Lien', 'Trust', 'Deed']

/** Label substrings that suggest a CPA contact */
const ASSET_CPA_LABEL_KEYWORDS = ['Tax', 'Assessment', 'Appraisal', 'Valuation', 'Annual Review']

// ─── Asset (catalog item) rules (by categoryKey) ───────────────────

/** Asset categories that surface a "Contact Lawyer" option */
const ASSET_LAWYER_CATEGORIES = new Set([
    'property',   // real estate transfers, deeds
    'insurance',  // policy review / legal terms
    'trust',      // any trust-related detail page
    'entity',     // corporate structuring
])

/** Asset categories that surface a "Contact CPA" option */
const ASSET_CPA_CATEGORIES = new Set([
    'property',    // property tax / reassessment
    'investment',  // capital gains, K-1s
    'entity',      // entity tax filing
])

// ─── Public helpers ─────────────────────────────────────────────────

/**
 * Returns which contact actions to show for a distribution (trust timeline) event.
 * Always returns an explicit array — never undefined.
 */
export function getDistributionContactActions(event: DistributionEvent): CardActionType[] {
    // Explicit suggestedActions wins (empty [] means intentionally none)
    if (event.suggestedActions !== undefined) {
        return (event.suggestedActions as CardActionType[]).filter(
            a => a === 'contact-lawyer' || a === 'contact-cpa',
        )
    }

    const cat = event.triggerCategory ?? ''
    const actions: CardActionType[] = []
    if (DISTRIBUTION_LAWYER_CATEGORIES.has(cat)) actions.push('contact-lawyer')
    if (DISTRIBUTION_CPA_CATEGORIES.has(cat))    actions.push('contact-cpa')
    return actions
}

/**
 * Returns which contact actions to show for an asset timeline event.
 * Always returns an explicit array — never undefined.
 */
export function getAssetEventContactActions(event: AssetTimelineEvent): CardActionType[] {
    // Explicit suggestedActions wins (empty [] means intentionally none)
    if (event.suggestedActions !== undefined) {
        return (event.suggestedActions as CardActionType[]).filter(
            a => a === 'contact-lawyer' || a === 'contact-cpa',
        )
    }

    const label = event.label
    const actions: CardActionType[] = []
    if (ASSET_LAWYER_LABEL_KEYWORDS.some(k => label.includes(k))) actions.push('contact-lawyer')
    if (ASSET_CPA_LABEL_KEYWORDS.some(k => label.includes(k)))    actions.push('contact-cpa')
    return actions
}

/**
 * Returns which contact actions are relevant for a catalog asset
 * (used in Asset Detail Page and any other asset-level menus).
 */
export function getAssetContactActions(asset: AnyCatalogItem): CardActionType[] {
    const actions: CardActionType[] = []
    if (ASSET_LAWYER_CATEGORIES.has(asset.categoryKey)) actions.push('contact-lawyer')
    if (ASSET_CPA_CATEGORIES.has(asset.categoryKey))    actions.push('contact-cpa')
    return actions
}
