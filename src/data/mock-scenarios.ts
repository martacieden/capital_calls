/*
 * mock-scenarios.ts — Pre-built mock creation scenarios for the Fojo creation flow
 *
 * Each scenario represents what "Fojo AI" would extract from user input or documents.
 * Used by useFojoCreation hook. Randomized selection, no repeats.
 * Ref: FEEDBACK-SUMMARY.md §10 (Required Mock Scenarios)
 */

export interface MockScenarioQAOption {
    title: string
    description: string
    value: string
}

export interface MockScenarioQA {
    question: string
    options: MockScenarioQAOption[]
}

export interface MockScenario {
    id: string
    categoryKey: string
    name: string
    description: string
    imageUrl?: string
    customFields: Record<string, string | number>
    /** If true, the pipeline pauses and a Q&A question is shown before creating */
    triggersQA?: boolean
    /** The Q&A question shown when the pipeline pauses */
    qa?: MockScenarioQA
    /** Additional items created after Q&A is resolved (e.g., insurance creates the car too) */
    additionalItems?: {
        categoryKey: string
        name: string
        description: string
        customFields: Record<string, string | number>
    }[]
    /** Post-pipeline navigation destination (document upload scenarios only) */
    postNavigation?: 'timeline' | 'catalog-grid' | 'catalog-map' | 'documents' | 'detail'
    /** If true, no item cards are shown in the summary message (text-only) */
    hideSummaryCards?: boolean
    /** If true, summary cards are rendered but clicking them does nothing */
    noClickSummaryCards?: boolean
}

export const MOCK_SCENARIOS: MockScenario[] = [
    {
        id: 'scenario-car',
        categoryKey: 'vehicle',
        name: '2024 Tesla Model S Plaid',
        description: 'All-electric luxury sedan, Long Range Plaid trim, purchased through Thornton Family Trust operating account.',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80',
        customFields: {
            'VIN': '5YJ3E1EC8RF249817',
            'Color': 'Ultra Red',
            'Model Year': 2024,
            'Estimated Value': 98500,
            'Registration State': 'New York',
        },
        triggersQA: true,
        qa: {
            question: 'Which value should I use?',
            options: [
                {
                    title: 'Use market value ($98,500)',
                    description: 'Kelley Blue Book estimate based on current condition and mileage.',
                    value: 'market-value',
                },
                {
                    title: 'Use purchase price ($104,000)',
                    description: 'The actual amount paid, including dealer fees and options.',
                    value: 'purchase-price',
                },
                {
                    title: 'I\'ll enter it manually',
                    description: 'Let me provide the correct value myself.',
                    value: 'manual',
                },
            ],
        },
    },
    {
        id: 'scenario-insurance',
        categoryKey: 'insurance',
        name: 'AIG Auto Insurance Policy',
        description: 'Comprehensive auto insurance policy covering the 2024 Tesla Model S with $1M liability and collision coverage.',
        customFields: {
            'Policy Number': 'AIG-2024-07824691',
            'Coverage Amount': 1000000,
            'Premium (Annual)': 4200,
            'Renewal Date': '2027-06-15',
            'Insured Asset': '2024 Tesla Model S',
        },
        triggersQA: true,
        qa: {
            question: 'Should I add the vehicle to your catalog?',
            options: [
                {
                    title: 'Yes, add the vehicle',
                    description: 'I\'ll create a record for the 2024 Tesla Model S and link it to this insurance policy.',
                    value: 'add-vehicle',
                },
                {
                    title: 'Skip for now',
                    description: 'I\'ll create the insurance policy only. You can link the vehicle later.',
                    value: 'skip',
                },
                {
                    title: 'It\'s already in the system',
                    description: 'The vehicle exists under a different name. I\'ll search for it.',
                    value: 'search',
                },
            ],
        },
    },
    {
        id: 'scenario-property',
        categoryKey: 'property',
        name: 'Greenfield House',
        description: 'Colonial-style family residence on 2.4 acres with detached guest cottage, held by Thornton Real Estate Holdings LLC.',
        imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
        customFields: {
            'Address': '742 Evergreen Terrace, Lake Geneva, WI 53147',
            'Square Footage': 4200,
            'Bedrooms': 5,
            'Bathrooms': 4,
            'Lot Size': '2.4 acres',
            'Year Built': 1998,
            'Estimated Value': 3200000,
        },
        triggersQA: true,
        qa: {
            question: 'How should I track the guest cottage?',
            options: [
                {
                    title: 'Track as one property',
                    description: 'The guest cottage is part of the main estate — keep it as a single record.',
                    value: 'single',
                },
                {
                    title: 'Create separate records',
                    description: 'Track the main house and guest cottage as two distinct assets.',
                    value: 'separate',
                },
                {
                    title: 'I\'m not sure yet',
                    description: 'Flag this for review — I\'ll decide later.',
                    value: 'flag',
                },
            ],
        },
    },
    {
        id: 'scenario-boat',
        categoryKey: 'maritime',
        name: 'M/Y Horizon',
        description: '85ft Azimut motor yacht, twin MTU 2,600hp engines, custom interior by Poltrona Frau. Registered in Cayman Islands.',
        imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&q=80',
        customFields: {
            'Vessel Type': 'Motor Yacht',
            'Length': '85ft / 26m',
            'Builder': 'Azimut',
            'Year Built': 2022,
            'Registry': 'Cayman Islands',
            'Home Port': 'Fort Lauderdale, FL',
            'Estimated Value': 8500000,
        },
        triggersQA: true,
        qa: {
            question: 'What should I do about the missing insurance?',
            options: [
                {
                    title: 'Flag as coverage gap',
                    description: 'I\'ll create a task to review marine insurance for M/Y Horizon.',
                    value: 'flag-gap',
                },
                {
                    title: 'It\'s covered externally',
                    description: 'The insurance is managed outside this system — no action needed.',
                    value: 'external',
                },
                {
                    title: 'Skip for now',
                    description: 'I\'ll create the vessel record without flagging insurance.',
                    value: 'skip',
                },
            ],
        },
    },
]

/* ── Task scenarios ─────────────────────────────────────────────── */

export const TASK_SCENARIOS: MockScenario[] = [
    {
        id: 'scenario-task-review',
        categoryKey: 'task',
        name: 'Review insurance coverage',
        description: 'Verify all assets under the trust have current insurance policies and flag any coverage gaps.',
        customFields: {
            'Priority': 'High',
            'Assignee': 'Sandra Thornton',
            'Due Date': '2026-04-15',
            'Related Entity': 'Thornton Family Trust',
        },
        triggersQA: true,
        qa: {
            question: 'What priority should this task have?',
            options: [
                {
                    title: 'High priority',
                    description: 'Flag for immediate review — insurance gaps can create liability.',
                    value: 'high',
                },
                {
                    title: 'Normal priority',
                    description: 'Add to the regular review queue — no immediate risk.',
                    value: 'normal',
                },
                {
                    title: 'Low priority',
                    description: 'Track for the next quarterly review cycle.',
                    value: 'low',
                },
            ],
        },
    },
    {
        id: 'scenario-task-annual',
        categoryKey: 'task',
        name: 'Schedule annual trust review',
        description: 'Coordinate with counsel to review trust provisions, beneficiary designations, and distribution schedules.',
        customFields: {
            'Priority': 'Normal',
            'Assignee': 'Sandra Thornton',
            'Due Date': '2026-05-01',
            'Related Entity': 'Revocable Living Trust',
        },
        triggersQA: true,
        qa: {
            question: 'Who should be involved?',
            options: [
                {
                    title: 'Trustee and counsel only',
                    description: 'Standard annual review with the trust attorney.',
                    value: 'counsel',
                },
                {
                    title: 'Include beneficiaries',
                    description: 'Invite beneficiaries for a family meeting alongside the review.',
                    value: 'family',
                },
                {
                    title: 'Full advisory team',
                    description: 'Include CPA, financial advisor, and insurance broker.',
                    value: 'full-team',
                },
            ],
        },
    },
]

/* ── Relationship scenarios ─────────────────────────────────────── */

export const RELATION_SCENARIOS: MockScenario[] = [
    {
        id: 'scenario-relation-move',
        categoryKey: 'entity',
        name: 'Ownership transfer to Dynasty Trust I',
        description: 'Moved entity under Dynasty Trust I. Previous parent: Thornton Holdings LP.',
        customFields: {
            'Change Type': 'Ownership transfer',
            'From': 'Thornton Holdings LP',
            'To': 'Dynasty Trust I',
            'Effective Date': '2026-04-01',
        },
        triggersQA: true,
        qa: {
            question: 'How should this change be recorded?',
            options: [
                {
                    title: 'Move the entity',
                    description: 'Transfer from its current parent to the new trust.',
                    value: 'move',
                },
                {
                    title: 'Add a secondary link',
                    description: 'Keep the existing parent and add the new trust as an additional connection.',
                    value: 'add-link',
                },
                {
                    title: 'Let me specify',
                    description: "I'll describe the exact relationship in my own words.",
                    value: 'custom',
                },
            ],
        },
    },
    {
        id: 'scenario-relation-beneficiary',
        categoryKey: 'person',
        name: 'Added as beneficiary of Marital Trust',
        description: 'New beneficiary designation added. Distribution schedule updated to include quarterly payments.',
        customFields: {
            'Change Type': 'Beneficiary addition',
            'Trust': 'Marital Trust',
            'Distribution': 'Quarterly',
            'Effective Date': '2026-04-01',
        },
        triggersQA: true,
        qa: {
            question: 'What type of beneficiary designation?',
            options: [
                {
                    title: 'Primary beneficiary',
                    description: 'Full distribution rights according to trust terms.',
                    value: 'primary',
                },
                {
                    title: 'Contingent beneficiary',
                    description: 'Receives distributions only if primary beneficiaries are unavailable.',
                    value: 'contingent',
                },
                {
                    title: 'Remainder beneficiary',
                    description: 'Receives the remaining trust assets upon termination.',
                    value: 'remainder',
                },
            ],
        },
    },
]

/* ── Document upload scenarios (MockFileBrowser) ───────────────── */

export const DOCUMENT_SCENARIOS: MockScenario[] = [
    {
        id: 'scenario-doc-trust',
        categoryKey: 'trust',
        name: 'Dynasty Trust I — 2025 Distribution Schedule',
        description: 'Annual distribution schedule for Dynasty Trust I beneficiaries, including quarterly income and discretionary principal distributions extracted from the uploaded document.',
        customFields: {
            'Trust': 'Dynasty Trust I',
            'Period': '2025',
            'Beneficiaries': 4,
            'Total Distributions': '$2.4M',
            'Frequency': 'Quarterly',
        },
        postNavigation: 'timeline',
    },
    {
        id: 'scenario-doc-inventory',
        categoryKey: 'entity',
        name: 'Thornton Asset Inventory — 2026',
        description: 'Comprehensive inventory of tangible and intangible assets held across all Thornton family entities as of January 2026.',
        customFields: {
            'Report Date': 'Jan 5, 2026',
            'Asset Count': 47,
            'Total Value': '$94.3M',
            'Categories': 'Vehicles, Real Estate, Art, Aviation, Maritime',
        },
        triggersQA: true,
        qa: {
            question: 'Which entity should this inventory be linked to?',
            options: [
                {
                    title: 'Thornton Family Trust',
                    description: 'Primary revocable living trust holding all family assets.',
                    value: 'thn-t1',
                },
                {
                    title: 'Dynasty Trust I',
                    description: 'Irrevocable trust established for the benefit of the children.',
                    value: 'thn-t2',
                },
                {
                    title: 'Thornton Real Estate Holdings LLC',
                    description: 'Holds all real estate and property assets for the family.',
                    value: 'thn-e3',
                },
            ],
        },
        postNavigation: 'catalog-grid',
        hideSummaryCards: true,
    },
    {
        id: 'scenario-doc-documents',
        categoryKey: 'document',
        name: 'Charitable Donation Receipts 2025',
        description: 'Compiled acknowledgment letters and receipts for all charitable contributions made through Thornton Foundation in 2025, ready for tax filing.',
        customFields: {
            'Document Count': 9,
            'Total Donations': '$1.84M',
            'Recipients': 12,
            'Tax Year': 2025,
        },
        triggersQA: true,
        qa: {
            question: 'Which collection should these documents be filed under?',
            options: [
                {
                    title: 'Trust Documents',
                    description: 'Trust agreements, amendments, and governing instruments.',
                    value: 'trust-documents',
                },
                {
                    title: 'Insurance Policies',
                    description: 'Life insurance, umbrella liability, and property insurance.',
                    value: 'insurance-policies',
                },
                {
                    title: 'Inventory Lists',
                    description: 'Annual inventory reports of tangible and intangible assets.',
                    value: 'inventory-lists',
                },
                {
                    title: 'Signatures',
                    description: 'Documents requiring or containing electronic signatures.',
                    value: 'signatures',
                },
            ],
        },
        postNavigation: 'documents',
        noClickSummaryCards: true,
    },
    {
        id: 'scenario-doc-car-insurance',
        categoryKey: 'vehicle',
        name: '2024 Tesla Model X',
        description: 'All-electric luxury SUV extracted from the auto insurance policy. Chubb Private Auto umbrella policy with $2M liability, comprehensive and collision. Registered to Thornton Family Trust.',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80',
        customFields: {
            'VIN': '5YJXCDE27LF249001',
            'Color': 'Pearl White',
            'Model Year': 2024,
            'Estimated Value': 104500,
            'Policy Number': 'CHB-2025-09142024',
            'Coverage': '$2M Liability + Comprehensive',
        },
        postNavigation: 'detail',
    },
    {
        id: 'scenario-doc-deed',
        categoryKey: 'property',
        name: 'Hamptons Estate — 14 Meadow Lane',
        description: 'Warranty deed for 14 Meadow Lane, Southampton, NY. 8,400 sq ft oceanfront estate held by Thornton Real Estate Holdings LLC. Dwelling coverage $18.5M.',
        imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
        customFields: {
            'Address': '14 Meadow Lane, Southampton, NY 11968',
            'Square Footage': 8400,
            'Bedrooms': 7,
            'Bathrooms': 8,
            'Lot Size': '3.2 acres',
            'Year Built': 2001,
            'Estimated Value': 18500000,
        },
        postNavigation: 'detail',
    },
    {
        id: 'scenario-doc-home-insurance',
        categoryKey: 'insurance',
        name: 'AIG Homeowners Policy — Hamptons Estate',
        description: 'AIG Private Client Group homeowners policy for 14 Meadow Lane, Southampton. Dwelling coverage $18.5M, scheduled personal property rider included. Linked to Thornton Real Estate Holdings LLC.',
        customFields: {
            'Policy Number': 'AIG-PCG-2025-014882',
            'Insurer': 'AIG Private Client Group',
            'Dwelling Coverage': '$18.5M',
            'Personal Property Rider': 'Included',
            'Annual Premium': '$89,400',
            'Renewal Date': '2026-01-10',
        },
        postNavigation: 'catalog-map',
    },
]

/* ── Scenario selection ─────────────────────────────────────────── */

/** Track used indices to avoid repeats */
let usedIndices = new Set<number>()

/** Pick a random scenario, avoiding repeats until all are used */
export function getRandomScenario(): MockScenario {
    if (usedIndices.size >= MOCK_SCENARIOS.length) {
        usedIndices = new Set()
    }
    const available = MOCK_SCENARIOS.map((_, i) => i).filter(i => !usedIndices.has(i))
    const idx = available[Math.floor(Math.random() * available.length)]
    usedIndices.add(idx)
    return MOCK_SCENARIOS[idx]
}

/** Pick a random scenario from a specific action-type pool */
export function getScenarioByActionType(actionType: 'asset' | 'task' | 'relation'): MockScenario {
    const pool = actionType === 'task' ? TASK_SCENARIOS
        : actionType === 'relation' ? RELATION_SCENARIOS
        : MOCK_SCENARIOS
    return pool[Math.floor(Math.random() * pool.length)]
}

/** Reset the used tracker (e.g., on session reset) */
export function resetScenarioTracker() {
    usedIndices = new Set()
}

/** Find a scenario by its id across all pools */
export function getScenarioById(id: string): MockScenario | undefined {
    return (
        MOCK_SCENARIOS.find(s => s.id === id) ??
        TASK_SCENARIOS.find(s => s.id === id) ??
        RELATION_SCENARIOS.find(s => s.id === id) ??
        DOCUMENT_SCENARIOS.find(s => s.id === id)
    )
}
