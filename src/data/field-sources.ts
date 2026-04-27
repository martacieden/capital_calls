/**
 * Per-field source attribution — maps individual detail fields to their data sources.
 * Two source types: PDF document, web search.
 */

export type FieldSourceType = 'pdf' | 'web'

export interface FieldSource {
    sourceType: FieldSourceType
    // PDF
    documentLabel?: string
    page?: number
    excerpt?: string
    // Web
    siteName?: string
    url?: string
    webExcerpt?: string
}

const fieldSourceMap = new Map<string, FieldSource>([
    // ── thn-a1 · Fifth Avenue Penthouse ──
    ['thn-a1::Value', {
        sourceType: 'web',
        siteName: 'Zillow',
        url: 'https://www.zillow.com/homedetails/834-fifth-ave',
        webExcerpt: 'Estimated market value for 834 Fifth Avenue, PH-A: $44,500,000–$46,200,000 based on comparable sales in the 10065 zip code.',
    }],
    ['thn-a1::Address', {
        sourceType: 'pdf',
        documentLabel: 'Inventory List 2026',
        page: 3,
        excerpt: 'Property: 834 Fifth Avenue, Apt PH-A, New York, NY 10065. Titled to Thornton RE Holdings LLC.',
    }],
    ['thn-a1::Asset Type', {
        sourceType: 'pdf',
        documentLabel: 'Inventory List 2026',
        page: 2,
        excerpt: 'Asset Class: Real Estate — Residential. Holding entity: Thornton RE Holdings LLC.',
    }],

    // ── thn-a29 · Ferrari Collection ──
    ['thn-a29::Value', {
        sourceType: 'web',
        siteName: 'Hagerty Price Guide',
        url: 'https://www.hagerty.com/valuations',
        webExcerpt: '1962 Ferrari 250 GTO: $48M (condition 1). Aggregate collection value including 275 GTB/4, SF90, 296 GTB, Dino 246 GTS, F40: ~$62M.',
    }],
    ['thn-a29::Asset Type', {
        sourceType: 'pdf',
        documentLabel: 'Inventory List 2026',
        page: 28,
        excerpt: 'Category: Collector Vehicles. 6 units stored at climate-controlled facility, Greenwich, CT.',
    }],

    // ── thn-t1 · Thornton Family Revocable Living Trust ──
    ['thn-t1::Established', {
        sourceType: 'pdf',
        documentLabel: 'Family Trust Agreement',
        page: 1,
        excerpt: 'THIS REVOCABLE LIVING TRUST AGREEMENT is entered into on March 15, 2012, by Edward Thornton III as Grantor and Trustee.',
    }],
    ['thn-t1::Governing State', {
        sourceType: 'pdf',
        documentLabel: 'Family Trust Agreement',
        page: 1,
        excerpt: 'This Trust shall be governed by and construed in accordance with the laws of the State of New York.',
    }],
    ['thn-t1::Trust Type', {
        sourceType: 'pdf',
        documentLabel: 'Family Trust Agreement',
        page: 1,
        excerpt: 'Grantor reserves the right to amend or revoke this Trust during his lifetime.',
    }],

    // ── thn-p1 · Edward Thornton III ──
    ['thn-p1::Date of Birth', {
        sourceType: 'pdf',
        documentLabel: 'Estate Planning Summary',
        page: 1,
        excerpt: 'Edward Thornton III, born February 18, 1954. SSN on file. U.S. citizen, domiciled in New York.',
    }],
    ['thn-p1::Relationship', {
        sourceType: 'pdf',
        documentLabel: 'Family Trust Agreement',
        page: 3,
        excerpt: 'Edward Thornton III (hereinafter "Grantor") establishes this trust for the benefit of his descendants.',
    }],
    ['thn-p1::Roles', {
        sourceType: 'pdf',
        documentLabel: 'Family Trust Agreement',
        page: 1,
        excerpt: 'Edward Thornton III shall serve as both Grantor and initial Trustee of this Trust.',
    }],

    // ── thn-a26 · Motor Yacht Sovereign ──
    ['thn-a26::Value', {
        sourceType: 'web',
        siteName: 'YachtWorld',
        url: 'https://www.yachtworld.com/yacht/lurssen-65m',
        webExcerpt: 'Comparable 65m Lürssen yachts (2020–2022 builds): asking prices $110M–$135M. Adjusted for 2021 build year and condition.',
    }],
    ['thn-a26::Asset Type', {
        sourceType: 'pdf',
        documentLabel: 'Inventory List 2026',
        page: 24,
        excerpt: 'Vessel: M/Y Sovereign. Type: Yacht / Watercraft. LOA 65m, Lürssen 2021. Flag: Cayman Islands.',
    }],
])

export function getFieldSource(itemId: string, fieldLabel: string): FieldSource | null {
    return fieldSourceMap.get(`${itemId}::${fieldLabel}`) ?? null
}

/* ── Relationship-level sources ── */

const relationshipSourceMap = new Map<string, FieldSource>([
    // thn-a1 · Fifth Avenue Penthouse
    ['thn-e3::thn-a1', {
        sourceType: 'pdf',
        documentLabel: 'Inventory List 2026',
        page: 3,
        excerpt: 'Property: 834 Fifth Avenue, PH-A. Titled to Thornton Real Estate Holdings LLC (EIN 82-4419376).',
    }],
    ['thn-a46::thn-a1', {
        sourceType: 'pdf',
        documentLabel: 'Property & Casualty Policy',
        page: 1,
        excerpt: 'Named insured: Thornton RE Holdings LLC. Covered property: 834 Fifth Avenue, PH-A. $50M all-risk policy, AIG.',
    }],

    // thn-a29 · Ferrari Collection
    ['thn-e2::thn-a29', {
        sourceType: 'pdf',
        documentLabel: 'Inventory List 2026',
        page: 28,
        excerpt: 'Collector Vehicles held by Thornton Capital Group LLC. 6 units, aggregate insured value $62M.',
    }],

    // thn-a26 · Motor Yacht Sovereign
    ['thn-e5::thn-a26', {
        sourceType: 'pdf',
        documentLabel: 'Inventory List 2026',
        page: 24,
        excerpt: 'M/Y Sovereign. Titled to Thornton Maritime LLC. Cayman Islands flag registry, IMO 9876543.',
    }],

    // thn-t1 · Thornton Family RLT
    ['thn-p1::thn-t1', {
        sourceType: 'pdf',
        documentLabel: 'Family Trust Agreement',
        page: 1,
        excerpt: 'Edward Thornton III as Grantor hereby establishes the Thornton Family Revocable Living Trust.',
    }],
    ['thn-t1::thn-a13', {
        sourceType: 'pdf',
        documentLabel: 'Family Trust Agreement',
        page: 8,
        excerpt: 'Schedule A — Trust Assets: Vanguard Total Market Index Fund, account ending 4821.',
    }],
])

export function getRelationshipSource(fromId: string, toId: string): FieldSource | null {
    return relationshipSourceMap.get(`${fromId}::${toId}`) ?? null
}
