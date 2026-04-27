import type { Person } from '../types'

const ORG = 'org-thornton'
const BY_AI = { id: 'ai-extractor', name: 'Fojo AI', avatarUrl: undefined }

/**
 * Thornton Family — People (15)
 * 12 family members + 3 professional advisors
 */
export const thorntonPeople: Person[] = [
    // ── Patriarch & Spouses ──
    {
        id: 'thn-p1',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Edward Thornton III',
        imageUrl: '/images/edward-thornton-iii.jpg',
        dob: '1954-02-18',
        age: 72,
        relationship: 'Self (Grantor)',
        roles: ['Grantor', 'Trustee'],
        description:
            'Third-generation patriarch. Built the $2B Thornton fortune through commercial real estate, private equity, and media investments. Chairs the family office board.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
    {
        id: 'thn-p2',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Victoria Thornton',
        imageUrl: '/images/victoria-thornton.jpg',
        dob: '1957-08-05',
        age: 67,
        relationship: 'First Spouse (Deceased)',
        roles: [],
        description:
            "Edward's first wife, mother of Edward IV, Catherine, and Benjamin. Died in 2019. Several trust provisions reference \"children of the first marriage.\"",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
    {
        id: 'thn-p3',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Anastasia Thornton-Reeves',
        imageUrl: '/images/anastasia-thornton.jpg',
        dob: '1968-06-22',
        age: 57,
        relationship: 'Spouse (Current)',
        roles: ['Co-Trustee', 'Income Beneficiary'],
        description:
            "Edward's second wife. Co-trustee of the RLT. Income beneficiary of SLAT I. Former corporate attorney, serves on the Foundation board.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },

    // ── Children — Marriage 1 ──
    {
        id: 'thn-p4',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Edward Thornton IV',
        imageUrl: '/images/edward-thornton-iv.jpg',
        dob: '1982-09-03',
        age: 43,
        relationship: 'Son (Marriage 1)',
        roles: ['Successor Trustee', 'Remainder Beneficiary'],
        description:
            '1st Successor Trustee of the RLT. Beneficiary of Dynasty Trust I. CEO of Thornton Real Estate Holdings LLC.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
    {
        id: 'thn-p5',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Catherine Thornton-Liu',
        imageUrl: '/images/catherine-thornton.jpg',
        dob: '1985-03-15',
        age: 41,
        relationship: 'Daughter (Marriage 1)',
        roles: ['Remainder Beneficiary'],
        description:
            'Beneficiary of Dynasty Trust I. Art curator and collector; serves on the Foundation art committee.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
    {
        id: 'thn-p6',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Benjamin Thornton',
        imageUrl: '/images/benjamin-thornton.jpg',
        dob: '1988-07-28',
        age: 37,
        relationship: 'Son (Marriage 1)',
        roles: ['Remainder Beneficiary'],
        description:
            'Beneficiary of Dynasty Trust I. Venture capitalist in New York. Manages Thornton Ventures.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },

    // ── Children — Marriage 2 ──
    {
        id: 'thn-p7',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Natalie Thornton',
        imageUrl: '/images/natalie-thornton.jpg',
        dob: '1998-11-02',
        age: 27,
        relationship: 'Daughter (Marriage 2)',
        roles: ['Remainder Beneficiary'],
        description:
            'Beneficiary of Dynasty Trust II. Completing a graduate degree at Georgetown University.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
    {
        id: 'thn-p8',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Lucas Thornton',
        imageUrl: '/images/lucas-thornton.jpg',
        dob: '2001-04-16',
        age: 25,
        relationship: 'Son (Marriage 2)',
        roles: ['Remainder Beneficiary'],
        description:
            'Beneficiary of Dynasty Trust II. Recent Stanford graduate, now analyst at the Family Office.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },

    // ── Grandchildren ──
    {
        id: 'thn-p9',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Oliver Thornton-Liu',
        dob: '2012-01-12',
        age: 14,
        relationship: "Grandson (Catherine's)",
        roles: ['Remainder Beneficiary'],
        description:
            "Catherine's eldest son. Beneficiary of Dynasty Trust I.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
    {
        id: 'thn-p10',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Sophia Thornton-Liu',
        dob: '2014-05-08',
        age: 12,
        relationship: "Granddaughter (Catherine's)",
        roles: ['Remainder Beneficiary'],
        description:
            "Catherine's daughter. Beneficiary of Dynasty Trust I. Studying fine arts at Parsons.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
    {
        id: 'thn-p11',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'James Thornton IV',
        dob: '2015-10-22',
        age: 10,
        relationship: "Grandson (Edward IV's)",
        roles: ['Remainder Beneficiary'],
        description:
            "Eddie's eldest son. Beneficiary of Dynasty Trust I.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
    {
        id: 'thn-p16',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Isabella Reeves-Thornton',
        dob: '2005-03-03',
        age: 21,
        relationship: 'Stepdaughter',
        roles: ['Remainder Beneficiary'],
        description:
            "Anastasia's daughter from prior relationship. Beneficiary of Dynasty Trust II.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },

    // ── Professional Advisors ──
    {
        id: 'thn-p17',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Richard Caldwell, Esq.',
        imageUrl: '/images/richard-caldwell.jpg',
        relationship: 'Estate Attorney',
        roles: ['Trustee', 'Trust Protector'],
        description:
            "Of Caldwell & Associates LLP. Trustee of the ILIT, Trust Protector of Dynasty Trusts, and 2nd Successor Trustee of the RLT. Family's primary estate planning attorney since 2008.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
    {
        id: 'thn-p18',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Martha Okafor, CPA',
        imageUrl: '/images/martha-okafor.jpg',
        relationship: 'Chief Financial Advisor',
        roles: ['Advisor'],
        description:
            'CPA, CFP. Chief Financial Advisor at the Thornton Family Office. Oversees all tax planning, investment strategy, and fiduciary compliance across the trust structure.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
    {
        id: 'thn-p19',
        categoryKey: 'person',
        organizationId: ORG,
        name: 'Daniel Schwartz',
        relationship: 'Investment Director',
        roles: ['Advisor'],
        description:
            'Investment Director of Thornton Capital Group LP. Manages alternative investment allocations across PE, hedge funds, and venture capital. Reports to Edward IV.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
    },
]
