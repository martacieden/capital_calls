import type { AnyCatalogItem } from '@/data/types'
import type { ChatMessage } from '@/data/types/fojo'

// Q&A keyword responses for the estate review conversation
export const V3_ESTATE_REVIEW_QA: Record<string, string> = {
    'v3-same': "Got it — merging under Thornton Capital Group LP. Alternate name from Schedule C noted.",
    'v3-separate': "Added both. Thornton Capital Partners is now a separate entity in your catalog.",
    'v3-skip1': "Flagged for your review in the catalog.",
    'v3-dt1': "Updated — Dynasty Trust I set as GRAT remainder beneficiary. Conflicting language flagged.",
    'v3-dt2': "Keeping Dynasty Trust II as remainder beneficiary. The funding memo may be a drafting error.",
    'v3-flag': "Flagged — added a note on both trust records for attorney review.",
}

export const V3_ESTATE_REVIEW_Q2: ChatMessage = {
    id: 51,
    role: 'assistant',
    text: "**GRAT 2021 Funding Memo, Section 4.2:** The remainder clause names Dynasty Trust II, but the original funding memo says Dynasty Trust I. Which trust should receive the remainder?",
    questionText: "Which trust should receive the GRAT remainder?",
    actions: [
        { label: "Dynasty Trust I (as in memo)", key: 'v3-dt1', group: 'v3-grat-remainder', description: "Use the original funding memo designation" },
        { label: "Dynasty Trust II (as in clause)", key: 'v3-dt2', group: 'v3-grat-remainder', description: "Use the remainder clause designation" },
        { label: "Flag for attorney review", key: 'v3-flag', group: 'v3-grat-remainder', description: "Add a note on both trust records for counsel to resolve" },
    ],
}

export const V3_COVERAGE_GAP_MESSAGES: ChatMessage[] = [
    {
        id: 1,
        role: 'assistant',
        text: "The Chubb policy covering the **Fifth Avenue Penthouse** ($32M) expires in 47 days. I've created a renewal task and assigned it to your insurance advisor.",
        cards: [
            {
                id: 'task-chubb-renewal-v3',
                categoryKey: 'insurance',
                organizationId: 'org-thornton',
                name: 'Renew Chubb Homeowners Policy',
                description: 'Fifth Avenue Penthouse · $32M coverage · Expires Apr 26, 2026',
                createdAt: new Date().toISOString(),
                createdBy: { id: 'fojo', name: 'Fojo AI' },
                _icon: 'IconCheckbox',
                _meta: 'Task · Assigned to insurance advisor · Due Apr 20, 2026',
            } as AnyCatalogItem,
        ],
    },
    {
        id: 2,
        role: 'assistant',
        text: "I'm not sure who should handle this renewal. Should I assign it to you or someone from your team?",
        questionText: "Who should handle this renewal?",
        actions: [
            { label: "Assign to me", key: 'v3-assign-me', group: 'v3-assign', description: "I'll take care of the Chubb policy renewal myself" },
            { label: "Assign to my insurance advisor", key: 'v3-assign-advisor', group: 'v3-assign', description: "Route it to the team member who handles insurance renewals" },
        ],
    },
]

export const V3_COVERAGE_GAP_QA: Record<string, string> = {
    'v3-assign-me': "Done — the renewal task is assigned to you. I'll remind you 2 weeks before the deadline.",
    'v3-assign-advisor': "Done — assigned to your insurance advisor with a due date of Apr 20, 2026.",
}

export const MOCK_RESPONSES: Record<string, string> = {
    'trust': "The active estates contain several trust types:\n\n- **Revocable Living Trusts** – primary estate planning vehicles (Davis, Henderson, Thornton families)\n- **Irrevocable Life Insurance Trusts (ILITs)** – holding life insurance policies outside the taxable estate\n- **Dynasty Trusts** – multi-generational wealth preservation (Thornton)\n- **Children's Trusts** – milestone-based distributions to minors\n- **SLATs & GRATs** – asset protection and gift tax strategies\n\nTotal trusts across all families: 15+",
    'beneficiary': "Key beneficiaries across active estates:\n\n**Davis Family:** Emily (16) and Michael (14) – remainder beneficiaries of the Children's Trust with milestone distributions at ages 18, 25, and 30. Margaret receives income for life from the Marital Trust.\n\n**Henderson Family:** Three adult children and six grandchildren across Dynasty Trust and education trusts.\n\n**Thornton Family:** Five children from two marriages, 12 grandchildren with Dynasty Trust I and II structures.",
    'who gets': "Key beneficiaries across active estates:\n\n**Davis Family:** Emily (16) and Michael (14) – remainder beneficiaries of the Children's Trust with milestone distributions at ages 18, 25, and 30. Margaret receives income for life from the Marital Trust.\n\n**Henderson Family:** Three adult children and six grandchildren across Dynasty Trust and education trusts.\n\n**Thornton Family:** Five children from two marriages, 12 grandchildren with Dynasty Trust I and II structures.",
    'value': "Estimated total estate values:\n\n- **Davis Family:** ~$19.7M (real estate, investments, venture portfolio, life insurance)\n- **Henderson Family:** ~$500M (commercial real estate, PE, multi-strategy investments)\n- **Thornton Family:** ~$2B (development, PE funds, international holdings)\n\n**Combined total:** ~$2.52B across all managed families.",
    'worth': "Estimated total estate values:\n\n- **Davis Family:** ~$19.7M\n- **Henderson Family:** ~$500M\n- **Thornton Family:** ~$2B\n\n**Combined total:** ~$2.52B across all managed families.",
    'total': "Estimated total estate values:\n\n- **Davis Family:** ~$19.7M\n- **Henderson Family:** ~$500M\n- **Thornton Family:** ~$2B\n\n**Combined total:** ~$2.52B across all managed families.",
    'distribution timeline': "Here's the distribution timeline for the active estates. I've mapped all scheduled and event-triggered distributions across the trusts.",
    'generate distribution': "Here's the distribution timeline for the active estates. I've mapped all scheduled and event-triggered distributions across the trusts.",
    'timeline': "Here's the distribution timeline for the active estates. I've mapped all scheduled and event-triggered distributions across the trusts.",
    'risk': "Common estate planning risks identified:\n\n1. **Concentration risk** – Davis family has significant exposure through single venture portfolio\n2. **Key person dependency** – James Davis serves as both grantor and trustee\n3. **Successor trustee planning** – Robert Davis (age 75) is 1st successor trustee; age-appropriate alternatives should be considered\n4. **Tax law changes** – current estate tax exemption ($13.6M) could be reduced, impacting larger estates\n5. **State law changes** – California community property rules may affect trust structures",
    'concern': "Common estate planning risks identified:\n\n1. **Concentration risk** – significant exposure through single venture portfolio\n2. **Key person dependency** – grantor serving as sole trustee\n3. **Successor trustee planning** – consider age-appropriate alternatives\n4. **Tax law changes** – current exemption could be reduced\n5. **Cross-state compliance** – multi-state holdings require ongoing review",
    'summarize': "Estate overview:\n\nYou're managing 4 client families with combined assets of ~$2.52B. The Davis Family ($19.7M) has a straightforward RLT structure with a Children's Trust for milestone distributions. Henderson ($500M) uses nested LLC structures with GRAT series. Thornton ($2B) has the most complex structure with Dynasty Trusts across two marriages.\n\nAll estate plans are current and active.",
    'structure': "Trust structure summary:\n\n**Davis Family:**\nDavis Family RLT → Davis Holdings LLC → (Evergreen Terrace LLC, Davis Ventures LLC)\nDavis Family RLT → Children's Trust (created at death)\nDavis ILIT → Term Life Insurance ($5M)\n\n**Henderson & Thornton** families have more complex nested structures with multiple GRATs, SLATs, and Dynasty Trusts.",
    'find': "What are you looking for? You can describe the fund, GP, deal memo, commitment, due date, or capital call amount.",
    'relationship': "Investment exposure summary:\n\n**Capital calls:** 6 open notices across Greentech, Whitmore Capital, Ventures, and Real Assets.\n\n**Pipeline:** Sourcing → Screening → Diligence → Decision, with stalled deals flagged when last activity is older than 14 days.\n\n**Payment readiness:** Notices are matched to fund records, wire instructions are verified, and release status is tracked before funds move.",
}

export const DEFAULT_RESPONSE = "I can help you with investment and capital-call workflows. Try asking about:\n\n- Pipeline status and blockers\n- Capital call approvals and due dates\n- Fund/entity exposure\n- Required next actions\n- Risk factors and stalled items"

export const TIMELINE_KEYWORDS = ['timeline', 'distribution timeline', 'generate distribution']

export const QUICK_PROMPTS = ['Find investment or call', 'Upload capital call', 'Explain fund exposure']

// ─── Additional proactive notifications (Ref: FEEDBACK-SUMMARY.md §12d) ───

export const V3_PROPERTY_TAX_MESSAGES: ChatMessage[] = [
    {
        id: 1,
        role: 'assistant',
        text: "**Hamptons Estate property tax assessment** is due in 30 days. The Town of Southampton sent the 2026 assessment — it shows a 4.2% increase from last year ($186K → $194K).",
        cards: [
            {
                id: 'task-property-tax',
                categoryKey: 'property',
                organizationId: 'org-thornton',
                name: 'Review Hamptons Tax Assessment',
                description: 'Town of Southampton · 2026 assessment · $194K · Due May 1, 2026',
                createdAt: new Date().toISOString(),
                createdBy: { id: 'fojo', name: 'Fojo AI' },
                _icon: 'IconCheckbox',
                _meta: 'Task · Property tax · Due May 1, 2026',
            } as AnyCatalogItem,
        ],
    },
    {
        id: 2,
        role: 'assistant',
        text: "The 4.2% increase is above the typical range. I'm not sure whether you'd want your accountant to review before paying or just approve it. What would you prefer?",
        questionText: "How should we handle the increased assessment?",
        actions: [
            { label: "Send to accountant first", key: 'v3-flag-tax', group: 'v3-tax-review', description: "Have the accountant verify the assessment before the May 1 deadline" },
            { label: "Approve payment directly", key: 'v3-approve-tax', group: 'v3-tax-review', description: "The increase is expected — go ahead and process it" },
        ],
    },
]

export const V3_PROPERTY_TAX_QA: Record<string, string> = {
    'v3-flag-tax': "Done — routed the assessment to your accountant for review before the May 1 deadline.",
    'v3-approve-tax': "Payment approved. I'll track it against the Hamptons Estate record.",
}

export const V3_VEHICLE_RENEWAL_MESSAGES: ChatMessage[] = [
    {
        id: 1,
        role: 'assistant',
        text: "The **Gulfstream G700** aviation hull & liability policy from Global Aerospace renews in 60 days. Last year's premium was $340K. I can start gathering quotes, but I'm not sure if you'd prefer to stay with Global Aerospace or explore other carriers.",
        questionText: "How should we approach the renewal?",
        actions: [
            { label: "Get competitive quotes", key: 'v3-request-quotes', group: 'v3-aviation-renew', description: "Reach out to Global Aerospace and two alternative carriers" },
            { label: "Renew with current carrier", key: 'v3-remind-aviation', group: 'v3-aviation-renew', description: "Stay with Global Aerospace — just renew at the current terms" },
        ],
    },
]

export const V3_VEHICLE_RENEWAL_QA: Record<string, string> = {
    'v3-request-quotes': "Got it — I'll gather quotes from Global Aerospace and two alternative carriers for comparison.",
    'v3-remind-aviation': "Renewing with Global Aerospace at current terms. I'll track the renewal deadline.",
}

export const V3_APPRAISAL_MESSAGES: ChatMessage[] = [
    {
        id: 1,
        role: 'assistant',
        text: "The last **art collection appraisal** by Christie's Advisory was 6 months ago. The Warhol portfolio and Basquiat collection ($14.2M combined) should be reappraised annually for insurance coverage accuracy. I can schedule the reappraisal, but I'm not sure whether you'd like to use Christie's again or get a second opinion from another firm.",
        questionText: "Which appraiser should handle this?",
        actions: [
            { label: "Use Christie's again", key: 'v3-schedule-appraisal', group: 'v3-art-appraisal', description: "They appraised last time — turnaround is 2-3 weeks" },
            { label: "Get a second opinion", key: 'v3-skip-appraisal', group: 'v3-art-appraisal', description: "Request proposals from Sotheby's or an independent appraiser" },
        ],
    },
]

export const V3_APPRAISAL_QA: Record<string, string> = {
    'v3-schedule-appraisal': "Scheduling the reappraisal with Christie's Advisory. Estimated turnaround: 2-3 weeks.",
    'v3-skip-appraisal': "Got it — I'll request proposals from Sotheby's and one independent appraiser for comparison.",
}
