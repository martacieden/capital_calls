import type {
    Person,
    Trust,
    BusinessEntity,
    Asset,
    Relationship,
    DistributionEvent,
    AnyCatalogItem,
    RelationshipType,
} from './types'
import {
    thorntonPeople,
    thorntonTrusts,
    thorntonEntities,
    thorntonAssets,
    thorntonRelationships,
    thorntonDistributions,
} from './thornton/index'

export interface Citation {
    page: number
    excerpt: string
    reasoning: string
}

export interface GeneratedEstate {
    organizationId: string
    organizationName: string
    items: AnyCatalogItem[]
    people: Person[]
    trusts: Trust[]
    entities: BusinessEntity[]
    assets: Asset[]
    relationships: Relationship[]
    distributions: DistributionEvent[]
    citations: Record<string, Citation[]>
}

const CREATED_BY = { id: 'ai-extractor', name: 'Fojo AI', avatarUrl: undefined }

function buildCitations(
    people: Person[],
    trusts: Trust[],
    entities: BusinessEntity[],
    assets: Asset[],
): Record<string, Citation[]> {
    const citations: Record<string, Citation[]> = {}

    const personExcerpts = [
        'Named as primary grantor in Article I, Section 1.1 of the trust agreement.',
        'Listed as co-trustee and co-grantor per Schedule A of the trust instrument.',
        'Identified as successor trustee under Article VII, Section 7.2.',
        'Named as remainder beneficiary in Article IV, Section 4.3(a).',
        'Referenced in the family tree exhibit attached as Appendix B.',
        'Mentioned as spouse of the grantor in the preamble of the trust document.',
        'Listed in the distribution schedule under Section 5.1(b).',
        'Identified in the trust certification dated January 2024.',
    ]
    const personExcerpts2 = [
        'Also referenced in the trust amendment, Section 2.3(a).',
        'Mentioned in the power of attorney, paragraph 4.',
        'Listed as contingent beneficiary in Schedule D.',
        'Named in the healthcare directive, Section 1.',
        'Referenced in the family limited partnership agreement, Article II.',
        'Identified in the trustee succession plan, Exhibit G.',
    ]
    const trustExcerpts = [
        'Trust instrument executed on the date shown in Section 1.1.',
        'Established pursuant to Article III of the master trust agreement.',
        'Referenced in the asset schedule, Exhibit C.',
        'Created under the provisions of the family trust, Article VIII.',
    ]
    const trustExcerpts2 = [
        'Amendment filed on record with the county clerk\'s office.',
        'Cross-referenced in the estate plan summary, Section 4.',
        'Trust provisions outlined in the restatement, Article VI.',
        'Referenced in the pour-over will, paragraph 3.',
        'Mentioned in the tax planning memorandum, page 12.',
        'Cited in the trustee\'s annual report, Exhibit A.',
        'Listed in the trust certification letter dated March 2025.',
        'Referenced in the beneficiary designation form, Schedule B.',
    ]
    const entityExcerpts = [
        'Operating agreement filed with the Secretary of State, referenced in Exhibit D.',
        'Listed as a managed entity in the family office organizational chart.',
        'Partnership agreement cross-referenced in the trust\'s asset schedule.',
        'Formation documents attached as Appendix E to the trust agreement.',
    ]
    const entityExcerpts2 = [
        'Annual report filed with the state, referenced in corporate records.',
        'Tax return Schedule K-1 attached as Exhibit H.',
        'Board resolution authorizing trust transfer, page 3.',
        'Entity valuation report prepared by independent appraiser.',
    ]
    const assetExcerpts = [
        'Property deed recorded and referenced in Schedule B of the trust.',
        'Account statement attached as Exhibit F, showing current valuation.',
        'Appraisal report dated 2025, attached to the trust amendment.',
        'Insurance policy declarations page, referenced in Section 6.2.',
        'Brokerage statement listing holdings as of the most recent quarter.',
        'Title document referenced in the asset transfer schedule.',
    ]
    const assetExcerpts2 = [
        'Valuation summary included in the annual trust report.',
        'Referenced in the gift tax return, Form 709, Schedule A.',
        'Mentioned in the asset protection memorandum, Section 3.',
        'Included in the net worth statement prepared for the family office.',
    ]

    people.forEach((p, i) => {
        const arr: Citation[] = [{
            page: 2 + Math.floor(i / 4),
            excerpt: `"…${p.name}${p.relationship ? `, ${p.relationship.toLowerCase()} of the Grantor,` : ''} shall…"`,
            reasoning: personExcerpts[i % personExcerpts.length],
        }]
        if (p.roles?.length) {
            arr.push({
                page: 8 + Math.floor(i / 3),
                excerpt: `"…${p.name} is hereby appointed as ${p.roles[0]}…"`,
                reasoning: personExcerpts2[i % personExcerpts2.length],
            })
        }
        citations[p.id] = arr
    })

    trusts.forEach((t, i) => {
        const count = 3 + (i % 6)
        const arr: Citation[] = [{
            page: 1 + Math.floor(i / 2),
            excerpt: `"…the ${t.name} (the '${t.trustType}') is hereby established…"`,
            reasoning: trustExcerpts[i % trustExcerpts.length],
        }]
        for (let j = 1; j < count; j++) {
            arr.push({
                page: 1 + Math.floor(i / 2) + j * 3 + Math.floor(i / 2),
                excerpt: `"…provisions of the ${t.name} as set forth in Article ${j + 1}…"`,
                reasoning: trustExcerpts2[(i + j) % trustExcerpts2.length],
            })
        }
        citations[t.id] = arr
    })

    entities.forEach((e, i) => {
        const count = 2 + (i % 3)
        const arr: Citation[] = [{
            page: 12 + Math.floor(i / 3),
            excerpt: `"…${e.name}, a ${e.entityType} organized under the laws of ${e.stateOfFormation || 'the state'}…"`,
            reasoning: entityExcerpts[i % entityExcerpts.length],
        }]
        for (let j = 1; j < count; j++) {
            arr.push({
                page: 12 + Math.floor(i / 3) + j * 2,
                excerpt: `"…${e.name} shall be governed by the terms of its ${e.entityType === 'LP' ? 'partnership' : 'operating'} agreement…"`,
                reasoning: entityExcerpts2[(i + j) % entityExcerpts2.length],
            })
        }
        citations[e.id] = arr
    })

    assets.forEach((a, i) => {
        const count = 1 + (i % 3)
        const arr: Citation[] = [{
            page: 18 + Math.floor(i / 5),
            excerpt: `"…${a.name}${a.value ? `, valued at approximately $${a.value.toLocaleString('en-US')}` : ''}…"`,
            reasoning: assetExcerpts[i % assetExcerpts.length],
        }]
        for (let j = 1; j < count; j++) {
            arr.push({
                page: 18 + Math.floor(i / 5) + j * 4,
                excerpt: `"…the ${a.assetType} known as ${a.name} is hereby transferred…"`,
                reasoning: assetExcerpts2[(i + j) % assetExcerpts2.length],
            })
        }
        citations[a.id] = arr
    })

    return citations
}

let _cached: GeneratedEstate | null = null
let _cachedOrgId: string | null = null

export function generateEstate(_documentName: string, orgId?: string, orgName?: string): GeneratedEstate {
    const resolvedOrgId = orgId ?? 'org-gen-whitfield'
    const resolvedOrgName = orgName ?? 'Whitfield Family'

    // Thornton: extraction populates with full dataset including citations
    if (resolvedOrgId === 'org-thornton') {
        const items = [
            ...thorntonPeople,
            ...thorntonTrusts,
            ...thorntonEntities,
            ...thorntonAssets,
        ]
        return {
            organizationId: 'org-thornton',
            organizationName: resolvedOrgName,
            items,
            people: thorntonPeople,
            trusts: thorntonTrusts,
            entities: thorntonEntities,
            assets: thorntonAssets,
            relationships: thorntonRelationships,
            distributions: thorntonDistributions,
            citations: buildCitations(thorntonPeople, thorntonTrusts, thorntonEntities, thorntonAssets),
        }
    }

    if (_cached && _cachedOrgId === resolvedOrgId) return _cached
    _cachedOrgId = resolvedOrgId
    const ts = '2026-03-04T10:00:00Z'

    function pid(n: number) { return `gen-p${n}` }
    function tid(n: number) { return `gen-t${n}` }
    function eid(n: number) { return `gen-e${n}` }
    function aid(n: number) { return `gen-a${n}` }

    // ── People (28) ──

    const people: Person[] = [
        { id: pid(1), name: 'Richard Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Grantor', roles: ['Grantor', 'Trustee'], age: 72, dob: '1954-03-18', description: 'Richard is the family patriarch and primary grantor of the Whitfield Family Revocable Living Trust. He founded Whitfield Capital Partners in 1988 and serves as trustee of the family trust.' },
        { id: pid(2), name: 'Catherine Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Spouse', roles: ['Grantor', 'Co-Trustee'], age: 69, dob: '1957-07-22', description: 'Catherine is the co-grantor and co-trustee of the family trust. She oversees the Whitfield Foundation and manages the family\'s philanthropic strategy.' },
        { id: pid(3), name: 'Andrew Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Son', roles: ['Successor Trustee', 'Remainder Beneficiary'], age: 45, dob: '1981-01-10', description: 'Andrew is the eldest child and designated successor trustee. He manages Whitfield Holdings LLC and oversees the family\'s real estate portfolio.' },
        { id: pid(4), name: 'Sarah Whitfield-Park', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Daughter', roles: ['Remainder Beneficiary'], age: 42, dob: '1984-05-03', description: 'Sarah is the middle child and a remainder beneficiary of the family trust. She runs the family\'s art advisory practice and manages the Whitfield Art Collection LLC.' },
        { id: pid(5), name: 'Thomas Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Son', roles: ['Remainder Beneficiary'], age: 38, dob: '1988-09-14', description: 'Thomas is the youngest child and a beneficiary of the Dynasty Trust. He serves as managing partner of Whitfield Ventures, the family\'s venture capital arm.' },
        { id: pid(6), name: 'Lauren Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Daughter-in-law', roles: [], age: 43, dob: '1983-04-20', description: 'Lauren is Andrew\'s wife and a beneficiary under the SLAT established for Andrew\'s branch of the family.' },
        { id: pid(7), name: 'Daniel Park', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Son-in-law', roles: [], age: 44, dob: '1982-11-08', description: 'Daniel is Sarah\'s husband. He is not a direct beneficiary but their children are beneficiaries of the Children\'s Trust.' },
        { id: pid(8), name: 'Emma Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Granddaughter', roles: ['Remainder Beneficiary'], age: 19, dob: '2007-02-14', description: 'Emma is Andrew and Lauren\'s eldest daughter. She receives educational distributions at age 18 and a principal distribution at age 25 from the Children\'s Trust.' },
        { id: pid(9), name: 'Jack Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Grandson', roles: ['Remainder Beneficiary'], age: 16, dob: '2010-06-30', description: 'Jack is Andrew and Lauren\'s son. He is a beneficiary of the Children\'s Trust with distributions beginning at age 18.' },
        { id: pid(10), name: 'Olivia Park', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Granddaughter', roles: ['Remainder Beneficiary'], age: 14, dob: '2012-03-25', description: 'Olivia is Sarah and Daniel\'s daughter. She is a beneficiary of the Children\'s Trust with age-based distributions.' },
        { id: pid(11), name: 'Noah Park', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Grandson', roles: ['Remainder Beneficiary'], age: 11, dob: '2015-08-19', description: 'Noah is Sarah and Daniel\'s son. He is a future beneficiary of the Children\'s Trust and the Dynasty Trust.' },
        { id: pid(12), name: 'Sophia Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Granddaughter', roles: ['Remainder Beneficiary'], age: 8, dob: '2018-01-05', description: 'Sophia is Thomas\'s daughter. She is a beneficiary of both the Children\'s Trust and the Special Needs Trust established for her care.' },
        { id: pid(13), name: 'William Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Grandson', roles: ['Remainder Beneficiary'], age: 5, dob: '2021-04-12', description: 'William is Thomas\'s youngest child and a future beneficiary of the Children\'s Trust.' },
        { id: pid(14), name: 'Margaret Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Mother', roles: ['Income Beneficiary'], age: 94, dob: '1932-12-01', description: 'Margaret is Richard\'s mother and income beneficiary of the Marital Trust established after her husband George\'s passing in 2015.' },
        { id: pid(15), name: 'Robert Chen, Esq.', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Attorney', roles: ['Trust Protector'], age: 58, dob: '1968-07-15', description: 'Robert is the family\'s estate planning attorney at Morrison & Chen LLP. He serves as trust protector for the Dynasty Trust and the ILIT.' },
        { id: pid(16), name: 'Patricia Nakamura, CPA', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Advisor', roles: ['Advisor'], age: 52, dob: '1974-03-22', description: 'Patricia is the family\'s tax advisor and CPA. She advises on all tax-related trust matters and GRAT valuations.' },
        { id: pid(17), name: 'James Harrington', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Advisor', roles: ['Advisor'], age: 61, dob: '1965-10-05', description: 'James is the family\'s wealth manager at Harrington Private Wealth. He manages the family\'s investment accounts and coordinates with trust administration.' },
        { id: pid(18), name: 'Elena Vasquez', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Employee', roles: [], age: 35, dob: '1991-06-18', description: 'Elena is the chief of staff at the Whitfield Family Office. She coordinates between family members, advisors, and service providers.' },
        { id: pid(19), name: 'Henry Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Brother', roles: ['Co-Trustee'], age: 68, dob: '1958-05-27', description: 'Henry is Richard\'s brother and serves as co-trustee of the ILIT. He is a retired physician and independent trustee.' },
        { id: pid(20), name: 'Victoria Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Niece', roles: ['Remainder Beneficiary'], age: 36, dob: '1990-09-10', description: 'Victoria is Henry\'s daughter and a contingent beneficiary of the Dynasty Trust.' },
        { id: pid(21), name: 'Grace Chen', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Granddaughter-in-law', roles: [], age: 20, dob: '2006-11-30', description: 'Grace is Emma\'s partner. She has no direct beneficiary status but appears in the family\'s succession planning documents.' },
        { id: pid(22), name: 'Marcus Thompson', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Employee', roles: [], age: 48, dob: '1978-02-14', description: 'Marcus is the CFO of Whitfield Capital Partners. He manages the operating company\'s finances and investor relations.' },
        { id: pid(23), name: 'Diana Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Sister-in-law', roles: [], age: 66, dob: '1960-08-03', description: 'Diana is Henry\'s wife. She appears as a contingent beneficiary in certain trust instruments.' },
        { id: pid(24), name: 'Alexander Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Nephew', roles: [], age: 33, dob: '1993-01-22', description: 'Alexander is Henry and Diana\'s son. He serves as a junior associate at the Whitfield Family Office.' },
        { id: pid(25), name: 'Charlotte Whitfield', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Granddaughter', roles: ['Remainder Beneficiary'], age: 2, dob: '2024-07-10', description: 'Charlotte is Andrew and Lauren\'s youngest child and a future beneficiary of the Children\'s Trust.' },
        { id: pid(26), name: 'Dr. Michael Torres', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Advisor', roles: ['Advisor'], age: 55, dob: '1971-04-09', description: 'Dr. Torres is the family\'s insurance advisor specializing in high-net-worth life insurance strategies and ILIT structuring.' },
        { id: pid(27), name: 'Susan Miller', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Employee', roles: [], age: 41, dob: '1985-12-15', description: 'Susan manages the day-to-day operations of Whitfield Real Estate Holdings and coordinates property management across all entities.' },
        { id: pid(28), name: 'Thomas\'s Partner', organizationId: resolvedOrgId, categoryKey: 'person', createdAt: ts, createdBy: CREATED_BY, relationship: 'Partner', roles: [], age: 36, dob: '1990-03-28', description: 'Thomas\'s domestic partner, referenced in the trust amendment as a permissible appointee under the limited power of appointment.' },
    ]

    // ── Trusts (16) ──

    const trusts: Trust[] = [
        { id: tid(1), name: 'Whitfield Family Revocable Living Trust', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Revocable Living Trust', dateEstablished: '1998-04-15', state: 'California', status: 'Active', description: 'The primary family trust holding the majority of the Whitfield estate. Established in 1998 by Richard and Catherine as co-grantors. Upon the death of the surviving grantor, it splits into a Bypass Trust, Marital Trust, and the Children\'s Trust.' },
        { id: tid(2), name: 'Whitfield Bypass Trust', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Bypass Trust', status: 'Created at death', parentTrustId: tid(1), state: 'California', description: 'Created at the first grantor\'s death to utilize the federal estate tax exemption. Holds up to the exemption amount and distributes income to the surviving spouse for life.' },
        { id: tid(3), name: 'Whitfield Marital Trust (QTIP)', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Marital Trust', status: 'Created at death', parentTrustId: tid(1), state: 'California', description: 'A Qualified Terminable Interest Property trust created at the first grantor\'s death. Provides all income to the surviving spouse with remainder passing to the children.' },
        { id: tid(4), name: 'Whitfield ILIT', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Irrevocable Life Insurance Trust', dateEstablished: '2005-09-01', state: 'California', status: 'Active', description: 'Irrevocable trust holding $15M in life insurance policies on Richard and Catherine. Henry Whitfield serves as independent trustee. Annual Crummey notices are sent to all beneficiaries.' },
        { id: tid(5), name: 'Whitfield Dynasty Trust', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Dynasty Trust', dateEstablished: '2010-01-15', state: 'Nevada', status: 'Active', description: 'A perpetual trust established in Nevada to take advantage of the state\'s abolition of the rule against perpetuities. Designed to benefit multiple generations of Whitfield descendants.' },
        { id: tid(6), name: 'Whitfield Children\'s Trust', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: "Children's Trust", dateEstablished: '2010-01-15', state: 'California', status: 'Active', description: 'Holds assets designated for the grandchildren. Distributions are age-based: education at 18, partial principal at 25, and the remainder at 30. Subject to HEMS standard.' },
        { id: tid(7), name: 'Whitfield GRAT I', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Grantor Retained Annuity Trust', dateEstablished: '2018-03-01', state: 'California', status: 'Active', description: 'Two-year GRAT funded with Whitfield Capital Partners LP interests. Richard retained an annuity for the term with the remainder passing to the children\'s trusts estate-tax-free.' },
        { id: tid(8), name: 'Whitfield GRAT II', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Grantor Retained Annuity Trust', dateEstablished: '2020-06-15', state: 'California', status: 'Active', description: 'Second GRAT funded with appreciated real estate interests. Designed as a rolling GRAT strategy to transfer value with minimal gift tax exposure.' },
        { id: tid(9), name: 'Whitfield QPRT – Aspen Residence', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Qualified Personal Residence Trust', dateEstablished: '2012-07-01', state: 'California', status: 'Active', description: 'Holds the family\'s Aspen vacation property. Richard and Catherine retained the right to use the residence for 15 years, after which it passes to the children at a discounted gift tax value.' },
        { id: tid(10), name: 'Whitfield CRT', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Charitable Remainder Trust', dateEstablished: '2015-11-20', state: 'California', status: 'Active', description: 'Charitable remainder unitrust paying 5% annually to Richard and Catherine. Upon their passing, the remainder goes to the Whitfield Foundation.' },
        { id: tid(11), name: 'Whitfield CLT', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Charitable Lead Trust', dateEstablished: '2019-01-10', state: 'California', status: 'Active', description: 'Charitable lead annuity trust making annual distributions to the Whitfield Foundation for 20 years. The remainder passes to the grandchildren estate-tax-free.' },
        { id: tid(12), name: 'Whitfield SLAT – Andrew\'s Branch', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Spousal Lifetime Access Trust', dateEstablished: '2021-12-15', state: 'California', status: 'Active', description: 'Catherine created this SLAT for Andrew\'s benefit and his descendants. It removes assets from Catherine\'s estate while allowing Andrew\'s family to access trust income.' },
        { id: tid(13), name: 'Sophia Special Needs Trust', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Special Needs Trust', dateEstablished: '2022-04-01', state: 'California', status: 'Active', description: 'Supplemental needs trust established for Sophia\'s long-term care and enrichment without affecting eligibility for public benefits.' },
        { id: tid(14), name: 'Whitfield SLAT – Sarah\'s Branch', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Spousal Lifetime Access Trust', dateEstablished: '2021-12-15', state: 'California', status: 'Active', description: 'Richard created this SLAT for Sarah\'s benefit and her descendants. Provides asset protection and estate tax reduction for the Park family branch.' },
        { id: tid(15), name: 'Whitfield GRAT III', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Grantor Retained Annuity Trust', dateEstablished: '2023-01-15', state: 'California', status: 'Active', description: 'Third rolling GRAT funded with publicly traded securities. Part of the family\'s ongoing wealth transfer strategy.' },
        { id: tid(16), name: 'Margaret Whitfield Marital Trust', organizationId: resolvedOrgId, categoryKey: 'trust', createdAt: ts, createdBy: CREATED_BY, trustType: 'Marital Trust', dateEstablished: '2015-06-20', state: 'California', status: 'Active', description: 'Established after George Whitfield\'s death in 2015. Provides all income to Margaret for her lifetime, with remainder passing to Richard and Henry equally.' },
    ]

    // ── Business Entities (18) ──

    const entities: BusinessEntity[] = [
        { id: eid(1), name: 'Whitfield Family Office LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'Delaware', dateFormed: '2002-03-01', purpose: 'Family office operations', description: 'Central management entity for all Whitfield family financial, legal, and administrative affairs. Employs five staff members.' },
        { id: eid(2), name: 'Whitfield Holdings LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'Delaware', dateFormed: '2000-06-15', purpose: 'Asset holding company', description: 'Primary holding company for the family\'s operating business interests and investment assets. Wholly owned by the RLT.' },
        { id: eid(3), name: 'Whitfield Capital Partners LP', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LP', stateOfFormation: 'Delaware', dateFormed: '1988-01-20', purpose: 'Private equity investments', description: 'The family\'s flagship private equity firm managing approximately $450M in committed capital across three active funds.' },
        { id: eid(4), name: 'WCP Management LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'Delaware', dateFormed: '1988-01-20', purpose: 'GP of Whitfield Capital Partners', description: 'General partner entity of Whitfield Capital Partners LP. Richard serves as managing member.' },
        { id: eid(5), name: 'Whitfield Real Estate Holdings LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'California', dateFormed: '2005-09-10', purpose: 'Real estate investment', description: 'Holds the family\'s commercial and residential investment properties valued at approximately $85M.' },
        { id: eid(6), name: 'Pacific Heights Property LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'California', dateFormed: '2008-04-20', purpose: 'Residential property holding', description: 'Single-purpose entity holding the family\'s primary residence at 2850 Pacific Heights, San Francisco.' },
        { id: eid(7), name: 'Aspen Mountain Properties LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'Colorado', dateFormed: '2010-11-01', purpose: 'Vacation property holding', description: 'Holds the Aspen ski residence. Currently held by the QPRT with a retained interest expiring in 2027.' },
        { id: eid(8), name: 'Napa Valley Vineyards LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'California', dateFormed: '2015-02-28', purpose: 'Vineyard operations', description: 'Operating entity for the family\'s 45-acre Napa Valley vineyard. Produces approximately 2,000 cases annually under the Whitfield Reserve label.' },
        { id: eid(9), name: 'Whitfield Ventures LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'Delaware', dateFormed: '2019-07-01', purpose: 'Venture capital', description: 'Thomas\'s venture capital vehicle investing in early-stage technology companies. Has deployed $35M across 22 portfolio companies.' },
        { id: eid(10), name: 'Whitfield Art Collection LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'New York', dateFormed: '2012-06-01', purpose: 'Art collection management', description: 'Manages the family\'s collection of contemporary art valued at approximately $28M. Sarah serves as managing member.' },
        { id: eid(11), name: 'The Whitfield Foundation', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'Foundation', stateOfFormation: 'California', dateFormed: '2003-01-15', purpose: 'Philanthropic giving', description: 'Private foundation with $25M in assets. Focus areas: education, environmental conservation, and medical research. Catherine serves as president.' },
        { id: eid(12), name: 'Whitfield DAF – Fidelity Charitable', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'DAF', stateOfFormation: 'Massachusetts', dateFormed: '2018-12-01', purpose: 'Donor-advised giving', description: 'Donor-advised fund at Fidelity Charitable with $8M balance. Used for annual charitable giving and matching contributions.' },
        { id: eid(13), name: 'Whitfield Investment LP', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'FLP', stateOfFormation: 'Delaware', dateFormed: '2003-09-01', purpose: 'Family investment partnership', description: 'Family limited partnership holding diversified investment portfolio. LP interests have been gifted to the Dynasty Trust at discounted values.' },
        { id: eid(14), name: 'Marina Del Rey Properties LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'California', dateFormed: '2016-03-15', purpose: 'Commercial real estate', description: 'Holds a portfolio of three commercial properties in Marina Del Rey generating approximately $1.8M in annual rental income.' },
        { id: eid(15), name: 'Whitfield Aviation LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'Nevada', dateFormed: '2017-05-01', purpose: 'Aircraft ownership and charter', description: 'Owns the family\'s Gulfstream G650 and manages charter operations to offset operating costs.' },
        { id: eid(16), name: 'Bay Area Tech Fund I LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'Delaware', dateFormed: '2020-01-15', purpose: 'Technology investments', description: 'A co-investment vehicle with institutional partners focusing on Bay Area technology companies. Thomas serves as managing member.' },
        { id: eid(17), name: 'Whitfield Insurance Holdings LLC', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'LLC', stateOfFormation: 'Delaware', dateFormed: '2005-09-01', purpose: 'Insurance policy ownership', description: 'Subsidiary that administers the family\'s portfolio of insurance policies including key-person coverage and umbrella policies.' },
        { id: eid(18), name: 'Whitfield Legacy Corp', organizationId: resolvedOrgId, categoryKey: 'entity', createdAt: ts, createdBy: CREATED_BY, entityType: 'Corporation', stateOfFormation: 'Delaware', dateFormed: '2022-08-01', purpose: 'Impact investing', description: 'C-Corporation established for the family\'s impact investing initiatives. Focuses on climate technology and sustainable agriculture.' },
    ]

    // ── Assets (55) ──

    const assets: Asset[] = [
        { id: aid(1), name: 'Primary Residence – 2850 Pacific Heights', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 18500000, holderId: eid(6), address: '2850 Pacific Heights Blvd, San Francisco, CA 94115', description: 'The family\'s primary residence. A 7,200 sq ft Victorian-era mansion with panoramic bay views, extensively renovated in 2018.' },
        { id: aid(2), name: 'Aspen Ski Residence', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 12000000, holderId: eid(7), address: '1450 Mountain View Lane, Aspen, CO 81611', description: 'A 5,800 sq ft ski-in/ski-out chalet. Currently held in the QPRT with retained use through 2027.' },
        { id: aid(3), name: 'Napa Valley Vineyard Estate', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 22000000, holderId: eid(8), address: '3200 Silverado Trail, Napa, CA 94558', description: '45-acre vineyard estate with a main house, guest house, and production facility. Produces Cabernet Sauvignon and Chardonnay.' },
        { id: aid(4), name: 'Marina Del Rey Office Complex', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 15000000, holderId: eid(14), address: '4500 Admiralty Way, Marina Del Rey, CA 90292', description: 'Class A office building, 62,000 sq ft. Fully leased with a weighted average lease term of 4.3 years.' },
        { id: aid(5), name: 'Marina Del Rey Retail Center', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 8500000, holderId: eid(14), address: '4600 Admiralty Way, Marina Del Rey, CA 90292', description: 'Mixed-use retail and restaurant space. Eight tenants with an average occupancy rate of 94%.' },
        { id: aid(6), name: 'Marina Del Rey Apartment Building', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 11200000, holderId: eid(14), address: '4700 Via Marina, Marina Del Rey, CA 90292', description: '24-unit luxury apartment building. Recently renovated with high-end finishes and amenities.' },
        { id: aid(7), name: 'Manhattan Pied-à-Terre', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 6800000, holderId: tid(1), address: '740 Park Avenue, Apt 14B, New York, NY 10021', description: 'Two-bedroom apartment on Park Avenue used by family members visiting New York. Held directly in the RLT.' },
        { id: aid(8), name: 'Lake Tahoe Cabin', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 4200000, holderId: tid(1), address: '850 Lakeshore Blvd, Incline Village, NV 89451', description: 'Rustic-modern lakefront cabin. 3,400 sq ft with private dock. Used primarily during summer months.' },
        { id: aid(9), name: 'Kauai Beach House', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 5500000, holderId: eid(5), address: '210 Anini Beach Road, Kilauea, HI 96754', description: 'Oceanfront property on the North Shore. 2,800 sq ft with pool and outdoor living area. Generates rental income when not in use.' },
        { id: aid(10), name: 'San Francisco Commercial Building', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 9800000, holderId: eid(5), address: '555 Mission Street, Suite 200, San Francisco, CA 94105', description: 'Office space currently leased to Whitfield Capital Partners and three external tenants.' },
        { id: aid(11), name: 'Goldman Sachs Private Wealth Account', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 42000000, holderId: tid(1), description: 'Primary investment account managed by Goldman Sachs Private Wealth Management. Diversified portfolio of equities, fixed income, and alternatives.' },
        { id: aid(12), name: 'Morgan Stanley Brokerage Account', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 28000000, holderId: tid(5), description: 'Dynasty Trust investment account. Growth-oriented allocation with 70% equities, 20% alternatives, 10% fixed income.' },
        { id: aid(13), name: 'JP Morgan Advisory Account', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 15000000, holderId: eid(13), description: 'Whitfield Investment LP account. Managed by JP Morgan Private Bank with a balanced growth strategy.' },
        { id: aid(14), name: 'Schwab Trust Account – ILIT', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 3200000, holderId: tid(4), description: 'Investment account within the ILIT holding cash and short-term securities for premium payments.' },
        { id: aid(15), name: 'Fidelity 529 Plans (6 accounts)', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 4800000, holderId: tid(6), description: 'Six 529 education savings accounts, one for each grandchild. Aggregate balance across all accounts.' },
        { id: aid(16), name: 'Vanguard Index Fund Portfolio', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 8500000, holderId: tid(1), description: 'Passively managed index fund portfolio held directly in the RLT. Total US Market, International, and Bond Index funds.' },
        { id: aid(17), name: 'CRT Unitrust Account', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 6200000, holderId: tid(10), description: 'Investment account funding the 5% annual unitrust distribution to Richard and Catherine.' },
        { id: aid(18), name: 'Second-to-Die Policy – $10M', organizationId: resolvedOrgId, categoryKey: 'insurance', createdAt: ts, createdBy: CREATED_BY, assetType: 'Insurance Policy', value: 10000000, holderId: tid(4), description: 'Survivorship life insurance policy on Richard and Catherine. Death benefit payable to the ILIT upon second death.' },
        { id: aid(19), name: 'Term Life Policy – Richard ($5M)', organizationId: resolvedOrgId, categoryKey: 'insurance', createdAt: ts, createdBy: CREATED_BY, assetType: 'Insurance Policy', value: 5000000, holderId: tid(4), description: '20-year term life policy on Richard. Expires 2025, currently under review for conversion to permanent coverage.' },
        { id: aid(20), name: 'Whole Life Policy – Catherine ($5M)', organizationId: resolvedOrgId, categoryKey: 'insurance', createdAt: ts, createdBy: CREATED_BY, assetType: 'Insurance Policy', value: 5000000, holderId: tid(4), description: 'Permanent whole life policy on Catherine with $1.8M in accumulated cash value.' },
        { id: aid(21), name: 'Umbrella Liability Policy ($20M)', organizationId: resolvedOrgId, categoryKey: 'insurance', createdAt: ts, createdBy: CREATED_BY, assetType: 'Insurance Policy', value: 0, holderId: eid(17), description: 'Excess liability coverage across all family entities and personal exposure. Renewed annually.' },
        { id: aid(22), name: 'Key-Person Policy – Richard ($10M)', organizationId: resolvedOrgId, categoryKey: 'insurance', createdAt: ts, createdBy: CREATED_BY, assetType: 'Insurance Policy', value: 10000000, holderId: eid(3), description: 'Key-person insurance on Richard as founder of Whitfield Capital Partners. Payable to the LP on death.' },
        { id: aid(23), name: 'WCP Fund III LP Interest (25%)', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Business Interest', value: 45000000, holderId: eid(2), description: '25% limited partnership interest in Whitfield Capital Partners Fund III. Current fund size $180M with vintage year 2021.' },
        { id: aid(24), name: 'WCP Fund II LP Interest (30%)', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Business Interest', value: 38000000, holderId: eid(2), description: '30% limited partnership interest in Fund II, currently in harvest mode. Expected to fully distribute by 2028.' },
        { id: aid(25), name: 'WCP Fund I LP Interest (35%)', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Business Interest', value: 12000000, holderId: eid(2), description: 'Remaining 35% interest in Fund I, nearly fully realized. Two portfolio companies remain.' },
        { id: aid(26), name: 'Napa Valley Vineyards Operating Interest', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Business Interest', value: 8500000, holderId: eid(8), description: '100% ownership of the vineyard operations including brand, inventory, and distribution agreements.' },
        { id: aid(27), name: 'Bay Area Tech Fund I – Co-Investment', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Business Interest', value: 12000000, holderId: eid(16), description: 'Thomas\'s co-investment in the tech fund. Portfolio includes 22 early-stage companies with 3 unicorn candidates.' },
        { id: aid(28), name: 'Gulfstream G650 Aircraft', organizationId: resolvedOrgId, categoryKey: 'vehicle', createdAt: ts, createdBy: CREATED_BY, assetType: 'Aircraft', value: 48000000, holderId: eid(15), description: 'Long-range business jet acquired in 2019. Managed through a charter program to offset operating costs of approximately $3M per year.' },
        { id: aid(29), name: 'Benetti 50m Motor Yacht "Serenity"', organizationId: resolvedOrgId, categoryKey: 'maritime', createdAt: ts, createdBy: CREATED_BY, assetType: 'Yacht / Watercraft', value: 32000000, holderId: eid(2), description: 'Custom-built motor yacht based in Monaco during summer and the Caribbean during winter. Full-time crew of 12.' },
        { id: aid(30), name: 'Contemporary Art Collection', organizationId: resolvedOrgId, categoryKey: 'art', createdAt: ts, createdBy: CREATED_BY, assetType: 'Art & Collectibles', value: 28000000, holderId: eid(10), description: 'Collection of 180+ works including pieces by Basquiat, Koons, Hockney, and Kusama. Appraised annually. Partially on loan to SFMOMA.' },
        { id: aid(31), name: 'Wine Collection (2,400 bottles)', organizationId: resolvedOrgId, categoryKey: 'art', createdAt: ts, createdBy: CREATED_BY, assetType: 'Art & Collectibles', value: 1800000, holderId: tid(1), description: 'Fine wine collection stored in temperature-controlled cellar. Includes verticals of First Growth Bordeaux, DRC, and Screaming Eagle.' },
        { id: aid(32), name: 'Ferrari 250 GTO (1962)', organizationId: resolvedOrgId, categoryKey: 'vehicle', createdAt: ts, createdBy: CREATED_BY, assetType: 'Vehicle', value: 52000000, holderId: eid(2), description: 'One of 36 Ferrari 250 GTOs ever made. Acquired at auction in 2018. Stored in a climate-controlled facility and shown at select concours events.' },
        { id: aid(33), name: 'Porsche 911 GT3 RS (2024)', organizationId: resolvedOrgId, categoryKey: 'vehicle', createdAt: ts, createdBy: CREATED_BY, assetType: 'Vehicle', value: 285000, holderId: pid(3), description: 'Andrew\'s personal vehicle. Shark Blue with Weissach Package.' },
        { id: aid(34), name: 'Mercedes-Maybach S680 (2025)', organizationId: resolvedOrgId, categoryKey: 'vehicle', createdAt: ts, createdBy: CREATED_BY, assetType: 'Vehicle', value: 235000, holderId: pid(1), description: 'Richard\'s primary vehicle. Chauffeur-driven, two-tone Obsidian Black and Mojave Silver.' },
        { id: aid(35), name: 'Range Rover Autobiography (2025)', organizationId: resolvedOrgId, categoryKey: 'vehicle', createdAt: ts, createdBy: CREATED_BY, assetType: 'Vehicle', value: 198000, holderId: pid(2), description: 'Catherine\'s primary vehicle. Santorini Black with Vintage Tan interior.' },
        { id: aid(36), name: 'Tesla Model X Plaid (2024)', organizationId: resolvedOrgId, categoryKey: 'vehicle', createdAt: ts, createdBy: CREATED_BY, assetType: 'Vehicle', value: 120000, holderId: pid(5), description: 'Thomas\'s vehicle. White exterior, used primarily for Bay Area commuting.' },
        { id: aid(37), name: 'Bitcoin Holdings (85 BTC)', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Cryptocurrency', value: 7200000, holderId: eid(9), description: 'Bitcoin position acquired between 2017-2020. Held in cold storage through Whitfield Ventures LLC.' },
        { id: aid(38), name: 'Ethereum Holdings (1,200 ETH)', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Cryptocurrency', value: 3800000, holderId: eid(9), description: 'Ethereum position accumulated as part of Thomas\'s crypto investment thesis. Mix of staked and liquid holdings.' },
        { id: aid(39), name: 'First Republic Checking (Operating)', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Other', value: 2500000, holderId: eid(1), description: 'Primary operating account for the Family Office. Handles payroll, vendor payments, and day-to-day expenses.' },
        { id: aid(40), name: 'Chase Private Client Account', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Other', value: 1800000, holderId: tid(1), description: 'Personal checking and savings for Richard and Catherine. Auto-sweep to money market.' },
        { id: aid(41), name: 'Foundation Endowment – Vanguard', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 25000000, holderId: eid(11), description: 'The Whitfield Foundation\'s endowment invested in a 60/40 portfolio. Annual 5% distribution for grants.' },
        { id: aid(42), name: 'DAF Account – Fidelity Charitable', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 8000000, holderId: eid(12), description: 'Donor-advised fund balance. Invested in the Fidelity Charitable Growth Pool.' },
        { id: aid(43), name: 'Los Altos Hills Development Parcel', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 7500000, holderId: eid(5), address: 'APN 182-30-044, Los Altos Hills, CA 94024', description: '3.2-acre parcel approved for residential development. Currently held for long-term appreciation.' },
        { id: aid(44), name: 'Palo Alto Office Building', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 14500000, holderId: eid(5), address: '400 University Avenue, Palo Alto, CA 94301', description: 'Three-story office building in downtown Palo Alto. Leased to technology companies. Cap rate 4.8%.' },
        { id: aid(45), name: 'Andrew\'s Personal Investment Account', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 5200000, holderId: pid(3), description: 'Andrew\'s personal taxable investment account at Schwab. Mix of individual equities and index ETFs.' },
        { id: aid(46), name: 'Sarah\'s Art Consulting Revenue Account', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Other', value: 850000, holderId: pid(4), description: 'Sarah\'s business operating account for her art advisory practice, which generates approximately $400K annually.' },
        { id: aid(47), name: 'Whitfield Reserve Wine Brand', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Other', value: 3200000, holderId: eid(8), description: 'Trademark and brand value of the Whitfield Reserve wine label. Includes distribution rights and customer relationships.' },
        { id: aid(48), name: 'Margaret\'s Marital Trust Portfolio', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 9500000, holderId: tid(16), description: 'Conservative income-generating portfolio. 80% investment-grade bonds, 15% dividend stocks, 5% money market.' },
        { id: aid(49), name: 'SLAT – Andrew Branch Portfolio', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 7800000, holderId: tid(12), description: 'Growth-oriented portfolio within Andrew\'s SLAT. Diversified equities and alternative investments.' },
        { id: aid(50), name: 'SLAT – Sarah Branch Portfolio', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 6500000, holderId: tid(14), description: 'Balanced portfolio within Sarah\'s SLAT. Mix of growth equities and income-generating alternatives.' },
        { id: aid(51), name: 'Special Needs Trust Portfolio', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 2800000, holderId: tid(13), description: 'Conservative portfolio designed for long-term supplemental support. Invested in balanced funds.' },
        { id: aid(52), name: 'Richard\'s IRA Rollover', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 4200000, holderId: pid(1), description: 'Traditional IRA rollover from Richard\'s early corporate career. Subject to RMDs beginning 2026.' },
        { id: aid(53), name: 'Catherine\'s Roth IRA', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 1200000, holderId: pid(2), description: 'Roth IRA accumulated through backdoor conversions. Invested in growth-oriented index funds.' },
        { id: aid(54), name: 'Rare Book Collection', organizationId: resolvedOrgId, categoryKey: 'art', createdAt: ts, createdBy: CREATED_BY, assetType: 'Art & Collectibles', value: 2100000, holderId: tid(1), description: 'Collection of first-edition literary works including signed Hemingway, Fitzgerald, and Faulkner. Appraised biennially.' },
        { id: aid(55), name: 'Impact Investment Portfolio', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 5000000, holderId: eid(18), description: 'Deployed across 8 climate-tech and sustainable agriculture companies. Target IRR of 12%.' },

        // ── Diverse category assets (10) ──
        { id: aid(56), name: "Sunseeker 76 Yacht 'Azure Dream'", organizationId: resolvedOrgId, categoryKey: 'maritime', createdAt: ts, createdBy: CREATED_BY, assetType: 'Yacht / Watercraft', value: 4200000, holderId: eid(2), description: 'Custom 76-foot Sunseeker motor yacht with flybridge. Moored at Palm Beach Marina. Full-time captain and crew of 3.' },
        { id: aid(57), name: 'Vintage Car Collection (8 vehicles)', organizationId: resolvedOrgId, categoryKey: 'vehicle', createdAt: ts, createdBy: CREATED_BY, assetType: 'Vehicle', value: 8500000, holderId: eid(2), description: 'Includes 1967 Ferrari 275 GTB/4, 1955 Mercedes-Benz 300SL Gullwing, 1961 Jaguar E-Type, and 5 others. Climate-controlled storage in Greenwich.' },
        { id: aid(58), name: "Basquiat 'Untitled' (1982)", organizationId: resolvedOrgId, categoryKey: 'art', createdAt: ts, createdBy: CREATED_BY, assetType: 'Art & Collectibles', value: 15000000, holderId: eid(10), description: 'Jean-Michel Basquiat acrylic and oil stick on canvas. Acquired at Christie\'s 2019. Stored at fine art storage facility in Manhattan.' },
        { id: aid(59), name: 'Hamptons Beach Estate', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 24000000, holderId: eid(5), address: '85 Further Lane, East Hampton, NY 11937', description: '12,000 sq ft oceanfront estate on 3.5 acres with pool, tennis court, and private beach access.' },
        { id: aid(60), name: 'BlackRock Alternative Investments', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Investment Account', value: 18000000, holderId: tid(5), description: 'Diversified alternatives fund including private equity, hedge funds, and infrastructure. 5-year lockup period ending 2028.' },
        { id: aid(61), name: 'Variable Universal Life – Richard ($8M)', organizationId: resolvedOrgId, categoryKey: 'insurance', createdAt: ts, createdBy: CREATED_BY, assetType: 'Insurance Policy', value: 8000000, holderId: tid(4), description: 'VUL policy on Richard Whitfield. $8M death benefit with $2.1M cash value. Premium funded by ILIT.' },
        { id: aid(62), name: 'IP Patent Portfolio (12 patents)', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Other', value: 6200000, holderId: eid(9), description: 'Portfolio of 12 utility patents in clean energy and battery technology. Licensed to 4 manufacturers generating $800K annual royalties.' },
        { id: aid(63), name: "Kusama 'Infinity Nets' (1965)", organizationId: resolvedOrgId, categoryKey: 'art', createdAt: ts, createdBy: CREATED_BY, assetType: 'Art & Collectibles', value: 8500000, holderId: eid(10), description: 'Yayoi Kusama oil on canvas. Museum-quality piece acquired from Sotheby\'s 2021. Currently on loan to the Whitney Museum.' },
        { id: aid(64), name: 'London Mayfair Apartment', organizationId: resolvedOrgId, categoryKey: 'property', createdAt: ts, createdBy: CREATED_BY, assetType: 'Real Estate', value: 11500000, holderId: tid(1), address: '12 Grosvenor Square, Mayfair, London W1K 6JP', description: '3-bedroom luxury apartment in historic Grosvenor Square. 2,800 sq ft with private terrace and 24-hour concierge.' },
        { id: aid(65), name: 'Crypto DeFi Portfolio', organizationId: resolvedOrgId, categoryKey: 'investment', createdAt: ts, createdBy: CREATED_BY, assetType: 'Cryptocurrency', value: 4800000, holderId: eid(9), description: 'Diversified DeFi positions across Ethereum, Solana, and Avalanche ecosystems. Managed via institutional-grade multi-sig wallets.' },
    ]

    // ── Relationships (~160) ──

    const r = (from: string, to: string, type: RelationshipType, label: string, extra?: Partial<Relationship>): Relationship =>
        ({ from, to, type, label, ...extra })

    const relationships: Relationship[] = [
        // Grantors → trusts
        r(pid(1), tid(1), 'grantor_of', 'Grantor'),
        r(pid(2), tid(1), 'grantor_of', 'Co-Grantor'),
        r(pid(1), tid(7), 'grantor_of', 'Grantor'),
        r(pid(1), tid(8), 'grantor_of', 'Grantor'),
        r(pid(1), tid(9), 'grantor_of', 'Grantor'),
        r(pid(2), tid(9), 'grantor_of', 'Co-Grantor'),
        r(pid(1), tid(10), 'grantor_of', 'Grantor'),
        r(pid(2), tid(10), 'grantor_of', 'Co-Grantor'),
        r(pid(2), tid(11), 'grantor_of', 'Grantor'),
        r(pid(2), tid(12), 'grantor_of', 'Grantor'),
        r(pid(1), tid(14), 'grantor_of', 'Grantor'),
        r(pid(1), tid(15), 'grantor_of', 'Grantor'),
        r(pid(1), tid(5), 'grantor_of', 'Grantor'),
        r(pid(1), tid(6), 'grantor_of', 'Grantor'),

        // Trustees
        r(pid(1), tid(1), 'trustee_of', 'Trustee'),
        r(pid(2), tid(1), 'co_trustee_of', 'Co-Trustee'),
        r(pid(3), tid(1), 'successor_trustee_of', 'Successor Trustee', { ordinal: 1 }),
        r(pid(19), tid(4), 'trustee_of', 'Independent Trustee'),
        r(pid(15), tid(5), 'trust_protector_of', 'Trust Protector'),
        r(pid(3), tid(5), 'trustee_of', 'Trustee'),
        r(pid(1), tid(6), 'trustee_of', 'Trustee'),
        r(pid(3), tid(6), 'successor_trustee_of', 'Successor Trustee', { ordinal: 1 }),
        r(pid(1), tid(7), 'trustee_of', 'Trustee'),
        r(pid(1), tid(8), 'trustee_of', 'Trustee'),
        r(pid(2), tid(10), 'trustee_of', 'Trustee'),
        r(pid(2), tid(11), 'trustee_of', 'Trustee'),
        r(pid(15), tid(4), 'trust_protector_of', 'Trust Protector'),
        r(pid(3), tid(12), 'trustee_of', 'Trustee'),
        r(pid(4), tid(14), 'trustee_of', 'Trustee'),
        r(pid(3), tid(13), 'trustee_of', 'Trustee'),
        r(pid(1), tid(16), 'trustee_of', 'Co-Trustee'),
        r(pid(19), tid(16), 'co_trustee_of', 'Co-Trustee'),

        // Beneficiaries of trusts
        r(pid(3), tid(1), 'beneficiary_of', 'Remainder Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(4), tid(1), 'beneficiary_of', 'Remainder Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(5), tid(1), 'beneficiary_of', 'Remainder Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(2), tid(2), 'beneficiary_of', 'Income Beneficiary', { beneficiaryType: 'income' }),
        r(pid(2), tid(3), 'beneficiary_of', 'Income Beneficiary', { beneficiaryType: 'income' }),
        r(pid(14), tid(16), 'beneficiary_of', 'Income Beneficiary', { beneficiaryType: 'income' }),
        r(pid(3), tid(5), 'beneficiary_of', 'Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(4), tid(5), 'beneficiary_of', 'Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(5), tid(5), 'beneficiary_of', 'Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(8), tid(5), 'beneficiary_of', 'Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(9), tid(5), 'beneficiary_of', 'Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(10), tid(5), 'beneficiary_of', 'Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(11), tid(5), 'beneficiary_of', 'Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(12), tid(5), 'beneficiary_of', 'Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(13), tid(5), 'beneficiary_of', 'Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(20), tid(5), 'beneficiary_of', 'Contingent Beneficiary', { beneficiaryType: 'remainder' }),
        r(pid(8), tid(6), 'beneficiary_of', 'Beneficiary'),
        r(pid(9), tid(6), 'beneficiary_of', 'Beneficiary'),
        r(pid(10), tid(6), 'beneficiary_of', 'Beneficiary'),
        r(pid(11), tid(6), 'beneficiary_of', 'Beneficiary'),
        r(pid(12), tid(6), 'beneficiary_of', 'Beneficiary'),
        r(pid(13), tid(6), 'beneficiary_of', 'Beneficiary'),
        r(pid(25), tid(6), 'beneficiary_of', 'Beneficiary'),
        r(pid(3), tid(12), 'beneficiary_of', 'Primary Beneficiary', { beneficiaryType: 'income' }),
        r(pid(6), tid(12), 'beneficiary_of', 'Permissible Beneficiary', { beneficiaryType: 'income' }),
        r(pid(4), tid(14), 'beneficiary_of', 'Primary Beneficiary', { beneficiaryType: 'income' }),
        r(pid(7), tid(14), 'beneficiary_of', 'Permissible Beneficiary'),
        r(pid(12), tid(13), 'beneficiary_of', 'Primary Beneficiary'),
        r(pid(1), tid(10), 'beneficiary_of', 'Unitrust Recipient', { beneficiaryType: 'income' }),
        r(pid(2), tid(10), 'beneficiary_of', 'Unitrust Recipient', { beneficiaryType: 'income' }),

        // Trust creates trust
        r(tid(1), tid(2), 'creates', 'Creates at first death'),
        r(tid(1), tid(3), 'creates', 'Creates at first death'),

        // Trust holds assets (via entities)
        r(tid(1), eid(2), 'owns', 'Owns 100%', { percentage: 100 }),
        r(tid(1), eid(1), 'owns', 'Owns 100%', { percentage: 100 }),
        r(tid(4), eid(17), 'owns', 'Owns policies'),
        r(tid(5), eid(9), 'owns', 'Owns 60%', { percentage: 60 }),
        r(tid(1), eid(5), 'owns', 'Owns 100%', { percentage: 100 }),
        r(tid(9), eid(7), 'holds', 'Holds in QPRT'),
        r(tid(10), aid(17), 'holds', 'Holds CRT assets'),
        r(tid(11), aid(41), 'distributes_to', 'Leads to Foundation'),

        // Entity owns entity
        r(eid(2), eid(3), 'owns', 'Owns 100% GP', { percentage: 100 }),
        r(eid(2), eid(4), 'owns', 'Owns 100%', { percentage: 100 }),
        r(eid(2), eid(8), 'owns', 'Owns 100%', { percentage: 100 }),
        r(eid(2), eid(15), 'owns', 'Owns 100%', { percentage: 100 }),
        r(eid(2), eid(10), 'owns', 'Owns 100%', { percentage: 100 }),
        r(eid(5), eid(6), 'owns', 'Owns 100%', { percentage: 100 }),
        r(eid(5), eid(14), 'owns', 'Owns 100%', { percentage: 100 }),
        r(eid(4), eid(3), 'managed_by', 'General Partner'),

        // Entity owns assets
        r(eid(6), aid(1), 'holds', 'Holds residence'),
        r(eid(7), aid(2), 'holds', 'Holds property'),
        r(eid(8), aid(3), 'holds', 'Holds vineyard'),
        r(eid(8), aid(26), 'holds', 'Holds operating interest'),
        r(eid(8), aid(47), 'holds', 'Holds brand'),
        r(eid(14), aid(4), 'holds', 'Holds office complex'),
        r(eid(14), aid(5), 'holds', 'Holds retail center'),
        r(eid(14), aid(6), 'holds', 'Holds apartments'),
        r(eid(10), aid(30), 'holds', 'Holds art collection'),
        r(eid(15), aid(28), 'holds', 'Holds aircraft'),
        r(eid(2), aid(29), 'holds', 'Holds yacht'),
        r(eid(2), aid(32), 'holds', 'Holds Ferrari 250 GTO'),
        r(eid(2), aid(23), 'holds', 'Holds Fund III interest'),
        r(eid(2), aid(24), 'holds', 'Holds Fund II interest'),
        r(eid(2), aid(25), 'holds', 'Holds Fund I interest'),
        r(eid(9), aid(37), 'holds', 'Holds Bitcoin'),
        r(eid(9), aid(38), 'holds', 'Holds Ethereum'),
        r(eid(16), aid(27), 'holds', 'Holds tech investments'),
        r(eid(5), aid(9), 'holds', 'Holds Kauai property'),
        r(eid(5), aid(10), 'holds', 'Holds SF office'),
        r(eid(5), aid(43), 'holds', 'Holds development parcel'),
        r(eid(5), aid(44), 'holds', 'Holds Palo Alto office'),
        r(eid(11), aid(41), 'holds', 'Holds endowment'),
        r(eid(12), aid(42), 'holds', 'Holds DAF balance'),
        r(eid(13), aid(13), 'holds', 'Holds investment account'),
        r(eid(1), aid(39), 'holds', 'Operating account'),
        r(eid(17), aid(21), 'holds', 'Holds umbrella policy'),
        r(eid(3), aid(22), 'holds', 'Holds key-person policy'),
        r(eid(18), aid(55), 'holds', 'Holds impact portfolio'),

        // Trust holds investment accounts
        r(tid(1), aid(11), 'holds', 'Holds GS account'),
        r(tid(1), aid(16), 'holds', 'Holds Vanguard portfolio'),
        r(tid(1), aid(7), 'holds', 'Holds Manhattan apt'),
        r(tid(1), aid(8), 'holds', 'Holds Tahoe cabin'),
        r(tid(1), aid(31), 'holds', 'Holds wine collection'),
        r(tid(1), aid(40), 'holds', 'Holds Chase account'),
        r(tid(1), aid(54), 'holds', 'Holds rare books'),
        r(tid(5), aid(12), 'holds', 'Holds MS account'),
        r(tid(4), aid(14), 'holds', 'Holds Schwab account'),
        r(tid(4), aid(18), 'holds', 'Holds 2nd-to-die policy'),
        r(tid(4), aid(19), 'holds', 'Holds Richard term policy'),
        r(tid(4), aid(20), 'holds', 'Holds Catherine whole life'),
        r(tid(6), aid(15), 'holds', 'Holds 529 plans'),
        r(tid(16), aid(48), 'holds', 'Holds Margaret\'s portfolio'),
        r(tid(12), aid(49), 'holds', 'Holds SLAT Andrew portfolio'),
        r(tid(14), aid(50), 'holds', 'Holds SLAT Sarah portfolio'),
        r(tid(13), aid(51), 'holds', 'Holds SNT portfolio'),

        // People manage entities
        r(pid(1), eid(4), 'member_of', 'Managing Member'),
        r(pid(3), eid(2), 'member_of', 'Managing Member'),
        r(pid(4), eid(10), 'member_of', 'Managing Member'),
        r(pid(5), eid(9), 'member_of', 'Managing Member'),
        r(pid(5), eid(16), 'member_of', 'Managing Member'),
        r(pid(2), eid(11), 'member_of', 'President'),
        r(pid(18), eid(1), 'member_of', 'Chief of Staff'),
        r(pid(22), eid(3), 'member_of', 'CFO'),
        r(pid(27), eid(5), 'member_of', 'Operations Manager'),
        r(pid(24), eid(1), 'member_of', 'Junior Associate'),
        r(pid(1), eid(3), 'member_of', 'Founder & Managing Partner'),

        // People own personal assets
        r(pid(3), aid(33), 'owns', 'Owns vehicle'),
        r(pid(1), aid(34), 'owns', 'Owns vehicle'),
        r(pid(2), aid(35), 'owns', 'Owns vehicle'),
        r(pid(5), aid(36), 'owns', 'Owns vehicle'),
        r(pid(3), aid(45), 'owns', 'Owns investment account'),
        r(pid(4), aid(46), 'owns', 'Owns business account'),
        r(pid(1), aid(52), 'owns', 'Owns IRA'),
        r(pid(2), aid(53), 'owns', 'Owns Roth IRA'),

        // Advisor relationships
        r(pid(15), tid(1), 'trust_protector_of', 'Estate Attorney'),
        r(pid(16), eid(1), 'managed_by', 'Tax Advisor'),
        r(pid(17), tid(1), 'managed_by', 'Wealth Manager'),
        r(pid(26), tid(4), 'managed_by', 'Insurance Advisor'),

        // Connect remaining entities to the main structure
        r(tid(1), eid(12), 'distributes_to', 'Funds DAF'),
        r(tid(5), eid(13), 'owns', 'Owns LP'),
        r(tid(1), eid(18), 'owns', 'Owns Corp'),

        // Connect remaining people
        r(pid(23), tid(1), 'beneficiary_of', 'Contingent Beneficiary'),
        r(pid(21), tid(6), 'beneficiary_of', 'Contingent Beneficiary'),

        // Diverse category asset relationships
        r(eid(2), aid(56), 'holds', 'Holds yacht'),
        r(eid(2), aid(57), 'holds', 'Holds car collection'),
        r(eid(10), aid(58), 'holds', 'Holds Basquiat'),
        r(eid(5), aid(59), 'holds', 'Holds Hamptons estate'),
        r(tid(5), aid(60), 'holds', 'Holds BlackRock fund'),
        r(tid(4), aid(61), 'holds', 'Holds VUL policy'),
        r(eid(9), aid(62), 'holds', 'Holds IP portfolio'),
        r(eid(10), aid(63), 'holds', 'Holds Kusama'),
        r(tid(1), aid(64), 'holds', 'Holds London apartment'),
        r(eid(9), aid(65), 'holds', 'Holds DeFi portfolio'),
    ]

    // ── Distributions (18) ──

    const distributions: DistributionEvent[] = [
        { id: 'gen-d1', beneficiaryId: pid(8), trustId: tid(6), triggerAge: 18, triggerYear: 2025, triggerType: 'Age', amount: 500000, description: 'Education and gap year funding', status: 'Completed' },
        { id: 'gen-d2', beneficiaryId: pid(8), trustId: tid(6), triggerAge: 25, triggerYear: 2032, triggerType: 'Age', amount: 2000000, description: 'First principal distribution for career establishment', status: 'Pending' },
        { id: 'gen-d3', beneficiaryId: pid(8), trustId: tid(6), triggerAge: 30, triggerYear: 2037, triggerType: 'Age', amount: 'Remainder', description: 'Final distribution of remaining trust share', status: 'Pending' },
        { id: 'gen-d4', beneficiaryId: pid(9), trustId: tid(6), triggerAge: 18, triggerYear: 2028, triggerType: 'Age', amount: 500000, description: 'Education funding', status: 'Pending' },
        { id: 'gen-d5', beneficiaryId: pid(9), trustId: tid(6), triggerAge: 25, triggerYear: 2035, triggerType: 'Age', amount: 2000000, description: 'Principal distribution', status: 'Pending' },
        { id: 'gen-d6', beneficiaryId: pid(9), trustId: tid(6), triggerAge: 30, triggerYear: 2040, triggerType: 'Age', amount: 'Remainder', description: 'Final distribution', status: 'Pending' },
        { id: 'gen-d7', beneficiaryId: pid(10), trustId: tid(6), triggerAge: 18, triggerYear: 2030, triggerType: 'Age', amount: 500000, description: 'Education funding', status: 'Pending' },
        { id: 'gen-d8', beneficiaryId: pid(10), trustId: tid(6), triggerAge: 25, triggerYear: 2037, triggerType: 'Age', amount: 2000000, description: 'Principal distribution', status: 'Pending' },
        { id: 'gen-d9', beneficiaryId: pid(11), trustId: tid(6), triggerAge: 18, triggerYear: 2033, triggerType: 'Age', amount: 500000, description: 'Education funding', status: 'Pending' },
        { id: 'gen-d10', beneficiaryId: pid(11), trustId: tid(6), triggerAge: 25, triggerYear: 2040, triggerType: 'Age', amount: 2000000, description: 'Principal distribution', status: 'Pending' },
        { id: 'gen-d11', beneficiaryId: pid(12), trustId: tid(13), triggerAge: 18, triggerYear: 2036, triggerType: 'Age', amount: 'HEMS distributions', description: 'Supplemental needs trust distributions for health, education, maintenance, and support', status: 'Pending' },
        { id: 'gen-d12', beneficiaryId: pid(13), trustId: tid(6), triggerAge: 18, triggerYear: 2039, triggerType: 'Age', amount: 500000, description: 'Education funding', status: 'Pending' },
        { id: 'gen-d13', beneficiaryId: pid(25), trustId: tid(6), triggerAge: 18, triggerYear: 2042, triggerType: 'Age', amount: 500000, description: 'Education funding', status: 'Pending' },
        { id: 'gen-d14', beneficiaryId: pid(2), trustId: tid(2), triggerType: 'Event', triggerEvent: "Upon Richard's passing", amount: 'Income for life', description: 'Catherine receives all income from the Bypass Trust for her lifetime', status: 'Pending' },
        { id: 'gen-d15', beneficiaryId: pid(2), trustId: tid(3), triggerType: 'Event', triggerEvent: "Upon Richard's passing", amount: 'Income for life', description: 'Catherine receives all QTIP income for her lifetime', status: 'Pending' },
        { id: 'gen-d16', beneficiaryId: pid(14), trustId: tid(16), triggerType: 'Condition', triggerEvent: 'Ongoing', amount: 'Income for life', description: 'Margaret receives all income from George\'s marital trust for her lifetime', status: 'Pending' },
        { id: 'gen-d17', beneficiaryId: pid(3), trustId: tid(5), triggerType: 'Event', triggerEvent: 'Upon surviving both grantors', amount: 15000000, description: 'Andrew\'s share of the Dynasty Trust principal', status: 'Pending' },
        { id: 'gen-d18', beneficiaryId: pid(4), trustId: tid(5), triggerType: 'Event', triggerEvent: 'Upon surviving both grantors', amount: 15000000, description: 'Sarah\'s share of the Dynasty Trust principal', status: 'Pending' },
    ]

    const allItems: AnyCatalogItem[] = [
        ...people,
        ...trusts,
        ...entities,
        ...assets,
    ]

    _cached = {
        organizationId: resolvedOrgId,
        organizationName: resolvedOrgName,
        items: allItems,
        people,
        trusts,
        entities,
        assets,
        relationships,
        distributions,
        citations: buildCitations(people, trusts, entities, assets),
    }

    return _cached
}
