import { IconFlag } from '@tabler/icons-react'
import type { AnyCatalogItem, Asset, Trust, BusinessEntity } from '@/data/types'
import { getCategoryOrFallback } from '@/data/categories'
import { ALERT_TYPES } from '@/components/atoms/PriorityBadge'

/*
 * FojoSummaryCard — Contextual summary card shown in Fojo panel when on a detail page.
 * Ref: FEEDBACK-SUMMARY.md §13
 */

/** Pre-written rich summaries for known items — feels like AI actually analyzed them */
const MOCK_SUMMARIES: Record<string, string> = {
    'thn-p1': 'Edward Thornton III is the primary grantor and trustee across all family trusts, with direct control over approximately $2B in combined assets. He serves as sole trustee of the Family RLT and co-trustee of both Dynasty Trusts alongside Northern Trust.',
    'thn-p2': 'Anastasia Thornton is the primary income beneficiary of the Marital Trust and SLAT I. She has lifetime access to trust income and limited invasion rights over principal for health, education, and support.',
    'thn-t1': 'The Family Revocable Living Trust is the cornerstone of the Thornton estate plan, holding direct ownership of the Family Office LLC and Thornton Capital Group. At Edward\'s passing, it splits into the Marital Trust and Bypass Trust.',
    'thn-t2': 'Dynasty Trust I was established in 2015 for the benefit of Edward\'s children from his first marriage. It currently holds ~$180M in assets and is designed to last multiple generations with South Dakota\'s perpetual trust laws.',
    'thn-a1': 'The Fifth Avenue Penthouse is the family\'s primary residence, valued at $32M. It\'s held by Thornton Real Estate Holdings LLC and is covered by a Chubb homeowners policy expiring in 47 days.',
    'thn-a2': 'The Hamptons Estate is a $18M waterfront property used as a seasonal residence. Recent inspection noted cracked slate tiles near the library wing — a renovation contract ($1.2M) was approved through the trust.',
    'thn-e1': 'Thornton Family Office LLC is the master holding entity overseeing all family operations, investments, and property management. It employs 12 staff and coordinates with external advisors across legal, tax, and investment disciplines.',
}

/** Simple deterministic hash from string → number */
function hashCode(s: string): number {
    let h = 0
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
    return Math.abs(h)
}

function generateFallbackSummary(item: AnyCatalogItem): string {
    const cat = getCategoryOrFallback(item.categoryKey)
    const value = (item as Asset).value
    const valueStr = value ? `, currently valued at $${value.toLocaleString('en-US')}` : ''
    const type = (item as Trust).trustType || (item as BusinessEntity).entityType || (item as Asset).assetType || ''
    const typeStr = type ? ` (${type})` : ''
    const h = hashCode(item.id)
    const rels = (h % 8) + 3
    const docs = ((h >> 3) % 4) + 1
    return `${item.name} is a ${cat.label.toLowerCase().replace(/s$/, '')}${typeStr} in the Thornton family portfolio${valueStr}. It has ${rels} linked relationships and ${docs} attached documents in the system.`
}

interface FojoSummaryCardProps {
    item: AnyCatalogItem
}

export function FojoSummaryCard({ item }: FojoSummaryCardProps) {
    const summary = MOCK_SUMMARIES[item.id] || generateFallbackSummary(item)
    const hasAlert = item.priorityStatus && ALERT_TYPES.has(item.priorityStatus.type)

    return (
        <div className="flex flex-col gap-2 mx-3">
            <div className="border border-[#9cc1ff] rounded-[var(--radius-lg)] py-3 px-4 pb-4 bg-[var(--color-accent-3)] flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--color-gray-12)]">Summary</span>
                <p className="text-sm font-[400] text-[var(--color-gray-12)] leading-[22px] m-0 line-clamp-4">{summary}</p>
            </div>
            {hasAlert && (
                <div className="border border-[var(--color-card-orange)] border-opacity-30 rounded-[var(--radius-lg)] py-2.5 px-4 bg-[var(--color-card-orange-bg)] flex items-start gap-2.5">
                    <IconFlag size={16} stroke={2} className="text-[var(--color-card-orange)] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-[400] text-[var(--color-orange-9)]">{item.priorityStatus!.detail}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
