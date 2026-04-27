import type {
    Person,
    Trust,
    BusinessEntity,
    Asset,
    Relationship,
    DistributionEvent,
} from './types'

/*
 * davis-family.ts – Davis Family Trust example dataset
 *
 * Adapted from:
 *   - prototype/js/data.js (original hardcoded dataset)
 *   - docs/plans/2026-03-02-estate-intelligence-prototype.md (full dataset spec)
 *   - feature-context.md (section 11b – Davis Family Trust Gamma presentation)
 *
 * This is the reference dataset used in all demos and for all view development
 * (card, list, map, timeline, import review).
 * 
 * NOTE: Images have been removed to favor the professional icon-based 
 * placeholder system for a more consistent and premium look.
 */

const ORG_ID = 'org-davis'

const CREATED_BY_JAMES = {
    id: 'p1',
    name: 'James Davis',
    avatarUrl: undefined,
}

// ─────────────────────────────────────────────
// PEOPLE
// ─────────────────────────────────────────────

export const davisPeople: Person[] = [
    {
        id: 'p1',
        categoryKey: 'person',
        organizationId: ORG_ID,
        name: 'James Davis',
        dob: '1976-03-15',
        age: 50,
        relationship: 'Self (Grantor)',
        roles: ['Grantor', 'Trustee'],
        description: 'Trust grantor and primary trustee. Manages family holdings and estate plan.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 'p2',
        categoryKey: 'person',
        organizationId: ORG_ID,
        name: 'Margaret Davis',
        dob: '1978-07-22',
        age: 48,
        relationship: 'Spouse',
        roles: ['Co-Trustee', 'Income Beneficiary'],
        description: 'Co-trustee and income beneficiary of the Marital Trust. Receives trust income for life upon James\'s passing.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 'p3',
        categoryKey: 'person',
        organizationId: ORG_ID,
        name: 'Emily Davis',
        dob: '2010-01-10',
        age: 16,
        relationship: 'Child',
        roles: ['Remainder Beneficiary'],
        description: 'Remainder beneficiary. Receives $1M at age 18 (gap year funding), $5M at age 25 (business venture capital), remainder at age 30.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 'p4',
        categoryKey: 'person',
        organizationId: ORG_ID,
        name: 'Michael Davis',
        dob: '2012-05-18',
        age: 14,
        relationship: 'Child',
        roles: ['Remainder Beneficiary'],
        description: 'Remainder beneficiary. Receives $1M at age 18 (gap year funding), $5M at age 25 (business venture capital), remainder at age 30.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 'p5',
        categoryKey: 'person',
        organizationId: ORG_ID,
        name: 'Robert Davis',
        dob: '1951-11-03',
        age: 75,
        relationship: 'Father',
        roles: ['Successor Trustee'],
        description: '1st Successor Trustee. Steps in if James is unable to serve.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
]

// ─────────────────────────────────────────────
// TRUSTS
// ─────────────────────────────────────────────

export const davisTrusts: Trust[] = [
    {
        id: 't1',
        categoryKey: 'trust',
        organizationId: ORG_ID,
        name: 'Davis Family Revocable Living Trust',
        trustType: 'Revocable Living Trust',
        dateEstablished: '2010-01-15',
        state: 'California',
        status: 'Active',
        description: 'Main estate planning vehicle. Avoids probate, provides incapacity planning. Becomes irrevocable at death and splits into sub-trusts.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 't2',
        categoryKey: 'trust',
        organizationId: ORG_ID,
        name: "Davis Children's Trust",
        trustType: "Children's Trust",
        dateEstablished: undefined,
        state: 'California',
        status: 'Created at death',
        parentTrustId: 't1',
        description: 'Created at James\'s death from the Davis Family RLT. Holds assets for Emily and Michael with milestone-based distributions.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 't3',
        categoryKey: 'trust',
        organizationId: ORG_ID,
        name: 'Davis ILIT',
        trustType: 'Irrevocable Life Insurance Trust',
        dateEstablished: '2015-06-01',
        state: 'California',
        status: 'Active',
        description: 'Holds the $5M term life insurance policy outside the taxable estate. Proceeds distribute to beneficiaries upon James\'s death.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
]

// ─────────────────────────────────────────────
// BUSINESS ENTITIES
// ─────────────────────────────────────────────

export const davisEntities: BusinessEntity[] = [
    {
        id: 'e1',
        categoryKey: 'entity',
        organizationId: ORG_ID,
        name: 'Davis Family Holdings LLC',
        entityType: 'LLC',
        purpose: 'Holding',
        stateOfFormation: 'Delaware',
        dateFormed: '2011-03-20',
        description: 'Top-level holding company. Owns 100% of the subsidiary LLCs and the Schwab brokerage account. Held by the Davis Family RLT.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 'e2',
        categoryKey: 'entity',
        organizationId: ORG_ID,
        name: '742 Evergreen Terrace LLC',
        entityType: 'LLC',
        purpose: 'Real Estate',
        stateOfFormation: 'California',
        dateFormed: '2012-08-15',
        description: 'Holds the primary residence at 742 Evergreen Terrace, Springfield, CA. Single-asset LLC for liability protection.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 'e3',
        categoryKey: 'entity',
        organizationId: ORG_ID,
        name: 'Davis Ventures LLC',
        entityType: 'LLC',
        purpose: 'Investment',
        stateOfFormation: 'Delaware',
        dateFormed: '2018-01-10',
        description: 'Investment vehicle holding interests in 8 early-stage startups. Managed by James as managing member.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
]

// ─────────────────────────────────────────────
// ASSETS
// ─────────────────────────────────────────────

export const davisAssets: Asset[] = [
    {
        id: 'a1',
        categoryKey: 'property',
        organizationId: ORG_ID,
        name: 'Primary Residence',
        assetType: 'Real Estate',
        value: 2_500_000,
        holderId: 'e2',
        address: '742 Evergreen Terrace, Springfield, CA',
        description: 'Single-family home in Springfield, CA. Held inside 742 Evergreen Terrace LLC for liability protection.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 'a2',
        categoryKey: 'property',
        organizationId: ORG_ID,
        name: 'Lake Tahoe Vacation Home',
        assetType: 'Real Estate',
        value: 1_200_000,
        holderId: 't1',
        address: '15 Lakeside Dr, Tahoe City, CA',
        description: 'Vacation property held directly by the Davis Family RLT. Four-bedroom lakefront home.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 'a3',
        categoryKey: 'investment',
        organizationId: ORG_ID,
        name: 'Schwab Brokerage Account',
        assetType: 'Investment Account',
        value: 8_000_000,
        holderId: 'e1',
        description: 'Charles Schwab investment account – Account ending 4821. Diversified portfolio of equities, bonds, and mutual funds.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 'a4',
        categoryKey: 'investment',
        organizationId: ORG_ID,
        name: 'Venture Portfolio',
        assetType: 'Business Interest',
        value: 3_000_000,
        holderId: 'e3',
        description: 'Interests in 8 early-stage startups across fintech, climate tech, and enterprise SaaS. Held via Davis Ventures LLC.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
    {
        id: 'a5',
        categoryKey: 'insurance',
        organizationId: ORG_ID,
        name: 'Term Life Insurance',
        assetType: 'Insurance Policy',
        value: 5_000_000,
        holderId: 't3',
        description: '$5M 20-year term life insurance policy issued by Lincoln Benefit Life. Held inside the Davis ILIT to exclude proceeds from taxable estate.',
        createdAt: '2024-01-15',
        createdBy: CREATED_BY_JAMES,
    },
]

// ─────────────────────────────────────────────
// RELATIONSHIPS (GRAPH EDGES)
// ─────────────────────────────────────────────

export const davisRelationships: Relationship[] = [
    // James → Trusts
    { from: 'p1', to: 't1', type: 'grantor_of', label: 'Grantor of' },
    { from: 'p1', to: 't1', type: 'trustee_of', label: 'Trustee of' },
    { from: 'p1', to: 't3', type: 'grantor_of', label: 'Grantor of' },
    // Margaret → Trusts
    { from: 'p2', to: 't1', type: 'co_trustee_of', label: 'Co-Trustee of' },
    { from: 'p2', to: 't1', type: 'beneficiary_of', label: 'Income Beneficiary of', beneficiaryType: 'income' },
    // Emily → Children's Trust
    { from: 'p3', to: 't2', type: 'beneficiary_of', label: 'Remainder Beneficiary of', beneficiaryType: 'remainder' },
    // Michael → Children's Trust
    { from: 'p4', to: 't2', type: 'beneficiary_of', label: 'Remainder Beneficiary of', beneficiaryType: 'remainder' },
    // Robert → Trusts
    { from: 'p5', to: 't1', type: 'successor_trustee_of', label: '1st Successor Trustee of', ordinal: 1 },
    // Trust → Entity ownership
    { from: 't1', to: 'e1', type: 'owns', label: 'Owns 100%', percentage: 100 },
    // Entity → Entity ownership
    { from: 'e1', to: 'e2', type: 'owns', label: 'Owns 100%', percentage: 100 },
    { from: 'e1', to: 'e3', type: 'owns', label: 'Owns 100%', percentage: 100 },
    // Entity/Trust → Asset holdings
    { from: 'e2', to: 'a1', type: 'holds', label: 'Holds' },
    { from: 't1', to: 'a2', type: 'holds', label: 'Holds' },
    { from: 'e1', to: 'a3', type: 'holds', label: 'Holds' },
    { from: 'e3', to: 'a4', type: 'holds', label: 'Holds' },
    { from: 't3', to: 'a5', type: 'holds', label: 'Holds' },
    // Trust → Trust (at-death creation)
    { from: 't1', to: 't2', type: 'creates', label: 'Creates at death' },
    // Trust → Person distributions
    { from: 't2', to: 'p3', type: 'distributes_to', label: 'Distributes to' },
    { from: 't2', to: 'p4', type: 'distributes_to', label: 'Distributes to' },
]

// ─────────────────────────────────────────────
// DISTRIBUTION EVENTS (TIMELINE)
// ─────────────────────────────────────────────

export const davisDistributions: DistributionEvent[] = [
    // ── Past Events ──
    {
        id: 'd-past1',
        beneficiaryId: 'p1',
        trustId: 't1',
        triggerType: 'Age',
        triggerYear: 2010,
        amount: 0,
        description: 'Davis Family Revocable Living Trust established. James Davis named as grantor and primary trustee.',
        status: 'Completed',
        citationItemId: 't1',
    },
    {
        id: 'd-past2',
        beneficiaryId: 'p1',
        trustId: 't3',
        triggerType: 'Age',
        triggerYear: 2015,
        amount: 0,
        description: 'Irrevocable Life Insurance Trust (ILIT) established to hold $5M term life policy outside taxable estate.',
        status: 'Completed',
        citationItemId: 't3',
    },
    {
        id: 'd-past3',
        beneficiaryId: 'p1',
        trustId: 't1',
        triggerType: 'Age',
        triggerYear: 2020,
        amount: 0,
        description: 'Trust amendment: added spendthrift provisions and updated successor trustee designation to Robert Davis.',
        status: 'Completed',
        citationItemId: 't1',
    },
    {
        id: 'd-past4',
        beneficiaryId: 'p2',
        trustId: 't1',
        triggerType: 'Age',
        triggerYear: 2024,
        amount: 0,
        description: 'Margaret Davis added as co-trustee. Annual HEMS review process established.',
        status: 'Completed',
        citationItemId: 't1',
    },
    // ── Emily's Timeline ──
    {
        id: 'd1',
        beneficiaryId: 'p3',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 16,
        triggerYear: 2026,
        amount: 150_000,
        description: 'Education trust release – private school tuition and extracurricular enrichment fund',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd2',
        beneficiaryId: 'p3',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 18,
        triggerYear: 2028,
        amount: 1_000_000,
        description: 'Gap year funding – international travel and educational enrichment',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd2b',
        beneficiaryId: 'p3',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 21,
        triggerYear: 2031,
        amount: 500_000,
        description: 'College completion incentive – distributed upon verified degree completion from accredited institution',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd3',
        beneficiaryId: 'p3',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 25,
        triggerYear: 2035,
        amount: 5_000_000,
        description: 'Business venture capital – entrepreneurship or career advancement',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd3b',
        beneficiaryId: 'p3',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 28,
        triggerYear: 2038,
        amount: 750_000,
        description: 'First home purchase match – trust matches up to $750K toward primary residence down payment',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd4',
        beneficiaryId: 'p3',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 30,
        triggerYear: 2040,
        amount: 'Remainder',
        description: 'Full distribution of remaining trust share – Emily receives outright ownership',
        status: 'Pending',
        citationItemId: 't2',
    },
    // ── Michael's Timeline ──
    {
        id: 'd5',
        beneficiaryId: 'p4',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 16,
        triggerYear: 2028,
        amount: 150_000,
        description: 'Education trust release – private school tuition and extracurricular enrichment fund',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd6',
        beneficiaryId: 'p4',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 18,
        triggerYear: 2030,
        amount: 1_000_000,
        description: 'Gap year funding – international travel and educational enrichment',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd6b',
        beneficiaryId: 'p4',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 21,
        triggerYear: 2033,
        amount: 500_000,
        description: 'College completion incentive – distributed upon verified degree completion from accredited institution',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd7',
        beneficiaryId: 'p4',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 25,
        triggerYear: 2037,
        amount: 5_000_000,
        description: 'Business venture capital – entrepreneurship or career advancement',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd7b',
        beneficiaryId: 'p4',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 28,
        triggerYear: 2040,
        amount: 750_000,
        description: 'First home purchase match – trust matches up to $750K toward primary residence down payment',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd8',
        beneficiaryId: 'p4',
        trustId: 't2',
        triggerType: 'Age',
        triggerAge: 30,
        triggerYear: 2042,
        amount: 'Remainder',
        description: 'Full distribution of remaining trust share – Michael receives outright ownership',
        status: 'Pending',
        citationItemId: 't2',
    },
    // ── Margaret ──
    {
        id: 'd9',
        beneficiaryId: 'p2',
        trustId: 't3',
        triggerType: 'Age',
        triggerYear: 2027,
        amount: 75_000,
        description: 'Annual ILIT premium payment – Crummey withdrawal rights notification to beneficiaries',
        status: 'Pending',
        citationItemId: 't3',
    },
    // ── Event-Based ──
    {
        id: 'd-e1',
        beneficiaryId: 'p2',
        trustId: 't1',
        triggerType: 'Event',
        triggerEvent: "Upon grantor's death",
        amount: 'Income for life',
        description: 'Income from Marital Trust for life under HEMS standard. Principal distributions at trustee discretion.',
        status: 'Pending',
        citationItemId: 't1',
    },
    {
        id: 'd-e2',
        beneficiaryId: 'p3',
        trustId: 't2',
        triggerType: 'Event',
        triggerEvent: "Upon beneficiary's disability",
        amount: 'Remainder',
        description: 'Full trust share distributed early if Emily becomes permanently disabled, as certified by two licensed physicians.',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd-e3',
        beneficiaryId: 'p4',
        trustId: 't2',
        triggerType: 'Event',
        triggerEvent: "Upon beneficiary's disability",
        amount: 'Remainder',
        description: 'Full trust share distributed early if Michael becomes permanently disabled, as certified by two licensed physicians.',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd-e4',
        beneficiaryId: 'p3',
        trustId: 't2',
        triggerType: 'Condition',
        triggerEvent: 'Hardship – medical or educational need',
        amount: 'Up to $250K/year',
        description: 'Trustee may distribute up to $250K annually for qualifying health, education, maintenance, and support needs.',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd-e5',
        beneficiaryId: 'p4',
        trustId: 't2',
        triggerType: 'Condition',
        triggerEvent: 'Upon completion of undergraduate degree',
        amount: 500_000,
        description: 'Education incentive bonus upon verified completion of a four-year degree program.',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd-e6',
        beneficiaryId: 'p3',
        trustId: 't2',
        triggerType: 'Condition',
        triggerEvent: 'Upon marriage',
        amount: 250_000,
        description: 'One-time wedding gift distribution. Trustee discretion with no-contest clause on prenuptial requirement.',
        status: 'Pending',
        citationItemId: 't2',
    },
    {
        id: 'd-e7',
        beneficiaryId: 'p4',
        trustId: 't2',
        triggerType: 'Condition',
        triggerEvent: 'Upon marriage',
        amount: 250_000,
        description: 'One-time wedding gift distribution. Trustee discretion with no-contest clause on prenuptial requirement.',
        status: 'Pending',
        citationItemId: 't2',
    },
]

// ─────────────────────────────────────────────
// COMBINED EXPORT – all Davis Family items
// ─────────────────────────────────────────────

export const davisFamilyData = {
    organizationId: ORG_ID,
    people: davisPeople,
    trusts: davisTrusts,
    entities: davisEntities,
    assets: davisAssets,
    relationships: davisRelationships,
    distributions: davisDistributions,

    /** All catalog items (people + trusts + entities + assets) as a flat array */
    getAllItems() {
        return [
            ...this.people,
            ...this.trusts,
            ...this.entities,
            ...this.assets,
        ]
    },

    /** Find any item by id */
    getById(id: string) {
        return this.getAllItems().find((item) => item.id === id) ?? null
    },

    /** Get all relationships where this id appears as from or to */
    getRelationships(id: string) {
        return this.relationships.filter((r) => r.from === id || r.to === id)
    },

    /** Get all outgoing relationships from this id */
    getOutgoing(id: string) {
        return this.relationships.filter((r) => r.from === id)
    },

    /** Get all incoming relationships to this id */
    getIncoming(id: string) {
        return this.relationships.filter((r) => r.to === id)
    },

    /** Format a value as US dollar string */
    formatCurrency(value: number | string): string {
        if (typeof value !== 'number') return String(value)
        return '$' + value.toLocaleString('en-US')
    },
}
