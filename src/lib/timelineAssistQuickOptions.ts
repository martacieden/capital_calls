import type { QAOption } from '@/data/types/fojo'
import type { TimelineAssistSession } from '@/types/timeline-assist'

function clip(s: string, max: number): string {
    const t = s.trim()
    if (!t)
        return ''
    if (t.length <= max)
        return t
    return `${t.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

function buildHay(session: TimelineAssistSession): string {
    const d = `${session.eventDescription ?? ''} ${session.suggestedDescription ?? ''}`
    const t = `${session.suggestedTaskTitle ?? ''} ${session.contextName ?? ''}`
    return `${d} ${t}`.toLowerCase()
}

function lawyerPrimary(session: TimelineAssistSession): QAOption {
    const eventDesc = session.eventDescription ?? ''
    const suggestedDesc = session.suggestedDescription ?? ''
    const title =
        session.suggestedTaskTitle?.trim()
        ?? (session.contextName ? `Legal follow-up — ${session.contextName}` : 'Legal follow-up — timeline item')
    let description = clip(suggestedDesc || eventDesc, 220)
    if (!description)
        description = 'Counsel-led work aligned with the timeline item shown on your card.'
    return { value: 'tl-law-primary', title, description }
}

function lawSupplementPairs(session: TimelineAssistSession, hay: string): [QAOption, QAOption] {
    const eventDesc = session.eventDescription ?? ''
    const ev = clip(eventDesc, 100)

    if (/adopt|dependent|\bchild\b|guardian|custody|newborn|\bminor\b/.test(hay)) {
        return [
            {
                value: 'tl-law-ben',
                title: 'Update beneficiary designations & disclosures',
                description: ev
                    ? `Refresh forms and trust schedules once counsel signs off — tied to your note: ${ev}`
                    : 'Circulate disclosures and reconcile schedules with fiduciary records.',
            },
            {
                value: 'tl-law-dist',
                title: 'Re-map distribution tiers & discretionary standards',
                description: ev
                    ? `Validate payout waterfalls against your timeline note on splits and dependents (${ev}).`
                    : 'Stress-test discretionary language against revised family economics.',
            },
        ]
    }

    if (/marriage|spouse|prenup|divorce/.test(hay)) {
        return [
            {
                value: 'tl-law-amend',
                title: 'Draft trust amendments for spouse impact',
                description: ev
                    ? `Address ownership and consent rules implied by your summary: ${ev}`
                    : 'Capture consent and joinder pathways with estate counsel.',
            },
            {
                value: 'tl-law-fidu',
                title: 'Brief trustees on fiduciary checkpoints',
                description: ev ? `Operational memo referencing: ${ev}` : 'Prep trustees ahead of approving spouse-related changes.',
            },
        ]
    }

    if (/death|deceased|bereav|succession|\btrustee\s+change\b/.test(hay)) {
        return [
            {
                value: 'tl-law-admin',
                title: 'Successor trustee & probate checkpoint memo',
                description: ev
                    ? `Map duties and timelines from your timeline entry: ${ev}`
                    : 'Confirm successor trustee authority and creditor windows.',
            },
            {
                value: 'tl-law-ben-death',
                title: 'Reallocate beneficiary interests post-event',
                description: ev ? `Honor the distribution intent described (${ev}).` : 'Update remainder classes and disclaimers accordingly.',
            },
        ]
    }

    if (/tax|capital\s+gains|\bgains\b|irs|fiscal|filings?\b|\bcpa\b/.test(hay)) {
        return [
            {
                value: 'tl-law-tax-bridge',
                title: 'Cross-check trust language with taxable events',
                description: ev ? `Identify clauses that collide with exposures noted (${ev}).` : 'Prep counsel notes for accountants on trust-driven income.',
            },
            {
                value: 'tl-law-dist-tax',
                title: 'Income distribution approvals for fiduciary',
                description: ev ? `Authorize distributions consistent with liquidity events: ${clip(eventDesc, 90)}.` : 'Establish board-style approvals for discretionary payouts.',
            },
        ]
    }

    if (/insurance|maintenance|\bmarine\b|\bboat\b|yacht|engine|motor|premium|coverage/.test(hay)) {
        return [
            {
                value: 'tl-law-cover',
                title: 'Renew coverage binds & admiralty carve-outs',
                description: ev
                    ? `Make sure Hull & indemnity aligns with downtime described: ${ev}`
                    : 'Review coverage gaps before next service milestone.',
            },
            {
                value: 'tl-law-vendor',
                title: 'Vendor / yard agreement hygiene',
                description: ev ? `Tie MSAs back to trustees’ delegated authority (${ev}).` : 'Confirm vendor SLAs satisfy trustee duty of care.',
            },
        ]
    }

    return [
        {
            value: 'tl-law-doc',
            title: 'Formalize trustee resolutions',
            description: ev
                ? `Document decisions driven by timeline context (${ev}).`
                : 'Produce consent packages fiduciaries can sign electronically.',
        },
        {
            value: 'tl-law-follow',
            title: 'Conflict & compliance second read',
            description: ev ? `Sensitivity review on facts from your summary: ${ev}` : 'Stress-test fiduciary memos ahead of filings.',
        },
    ]
}

function cpaPrimary(session: TimelineAssistSession): QAOption {
    const eventDesc = session.eventDescription ?? ''
    const suggestedDesc = session.suggestedDescription ?? ''
    const title =
        session.suggestedTaskTitle?.trim()
        ?? (session.contextName ? `Tax & accounting — ${session.contextName}` : 'Accounting follow-up — timeline item')
    let description = clip(suggestedDesc || eventDesc, 220)
    if (!description)
        description = 'Model filings and carve-outs referencing this timeline milestone.'
    return { value: 'tl-cpa-primary', title, description }
}

function cpaSupplementPairs(session: TimelineAssistSession, hay: string): [QAOption, QAOption] {
    const eventDesc = session.eventDescription ?? ''
    const ev = clip(eventDesc, 100)

    if (/adopt|dependent|\bchild\b|guardian|custody|\bminor\b/.test(hay)) {
        return [
            {
                value: 'tl-cpa-dep',
                title: 'Gift & dependent-related filings',
                description: ev ? `Stress-test exclusions using your note (${ev}).` : 'Identify dependent-driven adjustments for current-year exclusions.',
            },
            {
                value: 'tl-cpa-kiddie',
                title: 'Kiddie tax / UTMA interplay',
                description: ev ? `Forecast passive income layering after the timeline change (${ev}).` : 'Model kiddie-tax exposure on trust disbursements.',
            },
        ]
    }

    if (/tax|capital\s+gains|\bgains\b|irs|year-end|\bfiscal\b|filings?/.test(hay)) {
        return [
            {
                value: 'tl-cpa-basis',
                title: 'Realized gains & installment matches',
                description: ev ? `Recalc basis tied to exposures described (${ev}).` : 'Match broker statements against trust allocations.',
            },
            {
                value: 'tl-cpa-estimate',
                title: 'Quarterly estimates & safe-harbor',
                description: ev ? `Rebuild vouchers after the taxable events noted (${ev}).` : 'Refresh estimated payments vs. trust cash timing.',
            },
        ]
    }

    if (/insurance|maintenance|\bmarine\b|\bboat\b|engine/.test(hay)) {
        return [
            {
                value: 'tl-cpa-maint',
                title: 'CAPEX capitalization vs. expense',
                description: ev ? `Classify marina spend per note (${ev}).` : 'Decide capitalization policy for hull refurbishments.',
            },
            {
                value: 'tl-cpa-cover',
                title: 'Insurance reimbursement timing',
                description: ev ? `Plan income recognition against claims backlog (${ev}).` : 'Model deferred reimbursements impacting trust NI.',
            },
        ]
    }

    return [
        {
            value: 'tl-cpa-gift',
            title: 'Annual gift tax attestation packet',
            description: ev ? `Document transfers implied by (${ev}).` : 'Prep Form 709 support before deadline.',
        },
        {
            value: 'tl-cpa-estate',
            title: 'Estate exemption burn chart',
            description: ev ? `Update projections anchored to (${ev}).` : 'Sensitivity table on exemptions vs. discretionary gifts.',
        },
    ]
}

/**
 * Builds the three timeline-aware quick prompts shown after a contact selection.
 */
export function buildTimelineContactQuickOptions(session: TimelineAssistSession): QAOption[] {
    if (session.flow === 'contact-lawyer') {
        const hay = buildHay(session)
        const [b, c] = lawSupplementPairs(session, hay)
        return [lawyerPrimary(session), b, c]
    }
    if (session.flow === 'contact-cpa') {
        const hay = buildHay(session)
        const [b, c] = cpaSupplementPairs(session, hay)
        return [cpaPrimary(session), b, c]
    }
    return []
}
