/*
 * citations.ts — Static citation data linking catalog items to source documents.
 *
 * Each citation identifies a specific passage in an uploaded document
 * that supports data in the catalog.
 */

export interface Citation {
    itemId: string
    documentName: string    // e.g. "family-trust-agreement.pdf"
    documentLabel: string   // e.g. "Family Trust Agreement"
    page: number
    excerpt: string         // full passage rendered as mock PDF page content
    highlightedText: string // specific span to highlight with accent underline
}

export const citations: Citation[] = [
    // ─────────────────────────────────────────────
    // EDWARD THORNTON III (thn-p1)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p1',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 3,
        excerpt: 'Edward Thornton III, hereinafter referred to as the "Grantor," being of sound mind and body, hereby establishes the Thornton Family Revocable Living Trust on this fifteenth day of March, Two Thousand and Twelve, for the benefit of his descendants and named beneficiaries as set forth herein.',
        highlightedText: 'Edward Thornton III, hereinafter referred to as the "Grantor,"',
    },
    {
        itemId: 'thn-p1',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 7,
        excerpt: 'The Grantor appoints himself as the initial Trustee of the Trust and shall serve without bond. In the event of his incapacity or death, the Successor Trustee provisions outlined in Article VII shall govern the appointment and duties of successor fiduciaries.',
        highlightedText: 'The Grantor appoints himself as the initial Trustee of the Trust',
    },
    {
        itemId: 'thn-p1',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 1,
        excerpt: 'Client: Edward Thornton III. Date of Birth: February 18, 1954. Marital Status: Married (second marriage). This summary provides an overview of Mr. Thornton\'s comprehensive estate plan as structured by his legal counsel and wealth advisors.',
        highlightedText: 'Edward Thornton III. Date of Birth: February 18, 1954.',
    },

    // ─────────────────────────────────────────────
    // VICTORIA THORNTON (thn-p2)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p2',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 4,
        excerpt: 'The Grantor\'s first spouse, Victoria Thornton (née Harrison), born August 5, 1957, is recognized as the mother of the Grantor\'s children Edward IV, Catherine, and Benjamin. Victoria Thornton is now deceased, and her interest in the trust terminated upon her death on November 12, 2019.',
        highlightedText: 'Victoria Thornton (née Harrison), born August 5, 1957',
    },
    {
        itemId: 'thn-p2',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 2,
        excerpt: 'First Marriage: Victoria Thornton (deceased, 2019). Three children from this union: Edward IV, Catherine, and Benjamin. The Thornton Marital Trust and Bypass Trust were established following Victoria\'s passing.',
        highlightedText: 'Victoria Thornton (deceased, 2019). Three children from this union',
    },

    // ─────────────────────────────────────────────
    // ANASTASIA THORNTON-REEVES (thn-p3)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p3',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 5,
        excerpt: 'The Grantor\'s current spouse, Anastasia Thornton-Reeves, born June 22, 1968, shall be entitled to distributions from the Spousal Lifetime Access Trust as described in Article IX. She shall also serve as Co-Trustee of the Thornton Family Revocable Living Trust alongside the Grantor.',
        highlightedText: 'Anastasia Thornton-Reeves, born June 22, 1968',
    },
    {
        itemId: 'thn-p3',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 14,
        excerpt: 'Contingent Beneficiary: Anastasia Thornton-Reeves (spouse). In the event the primary beneficiary predeceases the insured, policy proceeds of $25,000,000 shall be payable to the Thornton Irrevocable Life Insurance Trust for the benefit of Mrs. Thornton-Reeves.',
        highlightedText: 'Anastasia Thornton-Reeves (spouse)',
    },

    // ─────────────────────────────────────────────
    // EDWARD THORNTON IV (thn-p4)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p4',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 11,
        excerpt: 'Edward Thornton IV, born September 3, 1982, eldest son of the Grantor, shall serve as Successor Trustee upon the Grantor\'s incapacity or death. He is designated as an income beneficiary of the Dynasty Trust I and shall receive distributions in accordance with the schedule set forth in Exhibit C.',
        highlightedText: 'Edward Thornton IV, born September 3, 1982, eldest son of the Grantor',
    },
    {
        itemId: 'thn-p4',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 4,
        excerpt: 'Edward IV currently serves as CEO of Thornton Capital Group LP and manages the family\'s private equity portfolio. He is designated as the first successor trustee of the RLT and an income beneficiary of Dynasty Trust I.',
        highlightedText: 'designated as the first successor trustee of the RLT',
    },

    // ─────────────────────────────────────────────
    // CATHERINE THORNTON-LIU (thn-p5)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p5',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 12,
        excerpt: 'Catherine Thornton-Liu, born March 15, 1985, daughter of the Grantor, is named as income beneficiary of the Dynasty Trust I and shall receive educational and health distributions for her minor children as described in Article XII, Section 3.',
        highlightedText: 'Catherine Thornton-Liu, born March 15, 1985, daughter of the Grantor',
    },

    // ─────────────────────────────────────────────
    // BENJAMIN THORNTON (thn-p6)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p6',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 13,
        excerpt: 'Benjamin Thornton, born July 28, 1988, youngest child of the Grantor and Victoria Thornton, is designated as an income beneficiary of Dynasty Trust I with distributions commencing at age thirty-five (35). Benjamin also holds a limited power of appointment over his allocated share.',
        highlightedText: 'Benjamin Thornton, born July 28, 1988, youngest child of the Grantor',
    },
    {
        itemId: 'thn-p6',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 5,
        excerpt: 'Benjamin Thornton manages Thornton Ventures LLC and oversees early-stage investments. His trust distributions include a staged payout schedule beginning at age 35, with full principal access at age 45.',
        highlightedText: 'trust distributions include a staged payout schedule',
    },

    // ─────────────────────────────────────────────
    // NATALIE THORNTON (thn-p7)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p7',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 14,
        excerpt: 'Natalie Thornton, born November 2, 1998, daughter of the Grantor and Anastasia Thornton-Reeves, is named as a beneficiary of Dynasty Trust II. Distributions to Natalie shall be made in accordance with the discretionary standard of health, education, maintenance, and support.',
        highlightedText: 'Natalie Thornton, born November 2, 1998',
    },

    // ─────────────────────────────────────────────
    // LUCAS THORNTON (thn-p8)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p8',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 14,
        excerpt: 'Lucas Thornton, born April 16, 2001, son of the Grantor and Anastasia Thornton-Reeves, is named as a beneficiary of Dynasty Trust II. Lucas\'s distributions are subject to the same discretionary standards and staged distribution schedule applicable to his sister Natalie.',
        highlightedText: 'Lucas Thornton, born April 16, 2001',
    },

    // ─────────────────────────────────────────────
    // THORNTON FAMILY REVOCABLE LIVING TRUST (thn-t1)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t1',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 1,
        excerpt: 'THE THORNTON FAMILY REVOCABLE LIVING TRUST AGREEMENT. Executed on March 15, 2012, by and between Edward Thornton III, as Grantor and initial Trustee. This Trust is established under the laws of the State of New York and is revocable by the Grantor during his lifetime.',
        highlightedText: 'THE THORNTON FAMILY REVOCABLE LIVING TRUST AGREEMENT',
    },
    {
        itemId: 'thn-t1',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 22,
        excerpt: 'Upon the death of the Grantor, the Trustee shall divide the Trust Estate into separate sub-trusts as follows: (a) the Marital Trust, (b) the Bypass Trust, and (c) the Children\'s Trust, each as described in the succeeding Articles. The division shall be made in a manner that optimizes estate tax savings.',
        highlightedText: 'divide the Trust Estate into separate sub-trusts',
    },

    // ─────────────────────────────────────────────
    // THORNTON DYNASTY TRUST I (thn-t2)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t2',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 28,
        excerpt: 'Article XIV: Thornton Dynasty Trust I — Family Line. This irrevocable trust is established for the benefit of the Grantor\'s descendants through his first marriage to Victoria Thornton. The trust is designed to hold assets in perpetuity, or for the maximum period permitted by applicable law, for the benefit of current and future generations.',
        highlightedText: 'Thornton Dynasty Trust I — Family Line',
    },
    {
        itemId: 'thn-t2',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 8,
        excerpt: 'Dynasty Trust I holds approximately $380M in diversified assets including interests in Thornton Capital Group LP, select PE fund interests, and the Hamptons Estate. Beneficiaries: Edward IV, Catherine, Benjamin, and their descendants.',
        highlightedText: 'Dynasty Trust I holds approximately $380M in diversified assets',
    },

    // ─────────────────────────────────────────────
    // DYNASTY TRUST II (thn-t3)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t3',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 34,
        excerpt: 'Article XV: Thornton Dynasty Trust II — Philanthropy & Marriage 2. This irrevocable trust is established for the benefit of the Grantor\'s children from his second marriage, Natalie and Lucas Thornton, and shall also allocate 15% of income annually to the Thornton Foundation for charitable purposes.',
        highlightedText: 'Thornton Dynasty Trust II — Philanthropy & Marriage 2',
    },

    // ─────────────────────────────────────────────
    // ILIT (thn-t4)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t4',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 3,
        excerpt: 'The Thornton Irrevocable Life Insurance Trust ("ILIT") was established on June 1, 2015, to hold the Northwestern Mutual life insurance policy (Policy No. NM-2015-THN-001) with a death benefit of Twenty-Five Million Dollars ($25,000,000). The ILIT is irrevocable and designed to exclude insurance proceeds from the Grantor\'s taxable estate.',
        highlightedText: 'Thornton Irrevocable Life Insurance Trust',
    },
    {
        itemId: 'thn-t4',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 40,
        excerpt: 'Article XVI: Irrevocable Life Insurance Trust. Richard Caldwell, Esq. shall serve as Trustee of the ILIT. The Trust shall collect policy proceeds upon the death of the insured and distribute them according to the formula set forth in Section 16.4.',
        highlightedText: 'Richard Caldwell, Esq. shall serve as Trustee of the ILIT',
    },

    // ─────────────────────────────────────────────
    // MARITAL TRUST (thn-t5)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t5',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 23,
        excerpt: 'The Marital Trust shall be funded with assets qualifying for the federal estate tax marital deduction. The surviving spouse, Anastasia Thornton-Reeves, shall be entitled to all income generated by the Marital Trust, payable at least quarterly, and may request principal distributions for her health, education, maintenance, and support.',
        highlightedText: 'Anastasia Thornton-Reeves, shall be entitled to all income',
    },

    // ─────────────────────────────────────────────
    // BYPASS TRUST (thn-t6)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t6',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 25,
        excerpt: 'The Bypass Trust (also known as the Credit Shelter Trust) shall be funded with assets up to the applicable exclusion amount at the time of the Grantor\'s death. The purpose of this trust is to shelter assets from estate taxation at the surviving spouse\'s subsequent death while providing for the support of the surviving spouse and descendants.',
        highlightedText: 'Bypass Trust (also known as the Credit Shelter Trust)',
    },

    // ─────────────────────────────────────────────
    // THORNTON FAMILY OFFICE LLC (thn-e1)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-e1',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 45,
        excerpt: 'The Thornton Family Office LLC, a Delaware limited liability company formed on January 10, 2010, shall serve as the central management vehicle for the family\'s investment portfolio, accounting, tax planning, and advisory services. The Grantor serves as Managing Member.',
        highlightedText: 'Thornton Family Office LLC, a Delaware limited liability company',
    },
    {
        itemId: 'thn-e1',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 12,
        excerpt: 'The Thornton Family Office manages approximately $2B in total assets across all trusts, entities, and personal holdings. Staff includes 14 full-time professionals covering investment management, tax, legal, and concierge services.',
        highlightedText: 'manages approximately $2B in total assets',
    },

    // ─────────────────────────────────────────────
    // THORNTON CAPITAL GROUP LP (thn-e2)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-e2',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 47,
        excerpt: 'Thornton Capital Group LP, formed as a Delaware limited partnership in 2008, manages the family\'s private equity, venture capital, and hedge fund allocations. Edward Thornton IV serves as General Partner, with limited partnership interests held by the Dynasty Trusts and the Bypass Trust.',
        highlightedText: 'Thornton Capital Group LP, formed as a Delaware limited partnership',
    },

    // ─────────────────────────────────────────────
    // THORNTON RE HOLDINGS LLC (thn-e3)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-e3',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 2,
        excerpt: 'Thornton Real Estate Holdings LLC holds the family\'s domestic real estate portfolio including the Fifth Avenue Penthouse, Hamptons Estate, Montana Ranch, and Fifth Avenue Commercial Building. Total estimated value: $185,000,000 as of December 31, 2024.',
        highlightedText: 'Thornton Real Estate Holdings LLC holds the family\'s domestic real estate',
    },

    // ─────────────────────────────────────────────
    // FIFTH AVENUE PENTHOUSE (thn-a1)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a1',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 3,
        excerpt: 'Property: Fifth Avenue Penthouse, 834 Fifth Avenue, Apt PH-A, New York, NY 10065. Current estimated value: $45,000,000. Held by Thornton Real Estate Holdings LLC. Primary residence of Edward Thornton III and Anastasia Thornton-Reeves.',
        highlightedText: 'Fifth Avenue Penthouse, 834 Fifth Avenue',
    },
    {
        itemId: 'thn-a1',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 15,
        excerpt: 'The Fifth Avenue Penthouse is the Grantor\'s primary residence and is held within Thornton Real Estate Holdings LLC for liability protection. Insurance coverage: $50M all-risk policy with AIG Private Client Group.',
        highlightedText: 'Grantor\'s primary residence',
    },

    // ─────────────────────────────────────────────
    // HAMPTONS ESTATE (thn-a2)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a2',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 4,
        excerpt: 'Property: Hamptons Estate, 142 Further Lane, East Hampton, NY 11937. Current estimated value: $38,000,000. Held by Hamptons Properties LLC. 8.5-acre oceanfront compound with main residence, pool house, and guest cottage.',
        highlightedText: 'Hamptons Estate, 142 Further Lane, East Hampton',
    },

    // ─────────────────────────────────────────────
    // LONDON MAYFAIR FLAT (thn-a5)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a5',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 6,
        excerpt: 'Property: London Mayfair Flat, 42 Grosvenor Square, London W1K 2HT. Current estimated value: £18,500,000 (approximately $23,000,000 USD). Held by London Mayfair Properties Ltd. Grade II listed Georgian townhouse converted to luxury flat.',
        highlightedText: 'London Mayfair Flat, 42 Grosvenor Square',
    },

    // ─────────────────────────────────────────────
    // GULFSTREAM G700 (thn-a25)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a25',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 22,
        excerpt: 'Aircraft: 2023 Gulfstream G700, Registration N-THN7. Current estimated value: $75,000,000. Held by Thornton Aviation LLC. Based at Teterboro Airport (TEB). Annual operating cost approximately $4.2M including crew, maintenance, and hangar.',
        highlightedText: 'Gulfstream G700, Registration N-THN7',
    },

    // ─────────────────────────────────────────────
    // MOTOR YACHT SOVEREIGN (thn-a26)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a26',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 24,
        excerpt: 'Vessel: Motor Yacht Sovereign, 65-meter Lürssen 2021. Flag: Cayman Islands. Current estimated value: $120,000,000. Held by Thornton Maritime LLC. Home port: Fort Lauderdale, FL. Managed by Fraser Yachts. Annual operating cost approximately $12M.',
        highlightedText: 'Motor Yacht Sovereign, 65-meter Lürssen 2021',
    },

    // ─────────────────────────────────────────────
    // LIFE INSURANCE (thn-a24)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a24',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 1,
        excerpt: 'Policy Schedule: Northwestern Mutual Universal Life Insurance, Policy No. NM-2015-THN-001. Insured: Edward Thornton III. Death Benefit: $25,000,000. Policy Owner: Thornton Irrevocable Life Insurance Trust. Annual Premium: $285,000.',
        highlightedText: 'Northwestern Mutual Universal Life Insurance',
    },
    {
        itemId: 'thn-a24',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 8,
        excerpt: 'Primary Beneficiary: Thornton Irrevocable Life Insurance Trust. Contingent Beneficiary: Anastasia Thornton-Reeves. The policy is structured to provide estate liquidity for tax obligations and to fund the ILIT\'s distribution obligations to the Grantor\'s descendants.',
        highlightedText: 'provide estate liquidity for tax obligations',
    },

    // ─────────────────────────────────────────────
    // WARHOL PORTFOLIO (thn-a27)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a27',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 26,
        excerpt: 'Art Collection: Andy Warhol Portfolio — 12 Works. Includes 3 screen prints from the "Marilyn" series (1967), 4 "Campbell\'s Soup" variations, and 5 miscellaneous works. Appraised value: $28,000,000 (Christie\'s valuation, October 2024). Held by Thornton Art Fund LLC.',
        highlightedText: 'Andy Warhol Portfolio — 12 Works',
    },

    // ─────────────────────────────────────────────
    // THORNTON FOUNDATION (thn-e12)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-e12',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 52,
        excerpt: 'The Thornton Foundation, a 501(c)(3) private foundation established in 2005, supports educational initiatives, medical research, and arts programs. The Foundation receives 15% of annual income from Dynasty Trust II. Anastasia Thornton-Reeves serves as President of the Foundation board.',
        highlightedText: 'Thornton Foundation, a 501(c)(3) private foundation',
    },
    {
        itemId: 'thn-e12',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 18,
        excerpt: 'The Foundation holds $45M in endowment assets and makes approximately $2.5M in annual grants. Recent focus areas include STEM education scholarships and climate research at Yale and Stanford.',
        highlightedText: 'holds $45M in endowment assets',
    },

    // ─────────────────────────────────────────────
    // RICHARD CALDWELL (thn-p17)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p17',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 8,
        excerpt: 'Richard Caldwell, Esq., of Caldwell & Associates LLP, is appointed as Successor Trustee of the Thornton Family Revocable Living Trust, Trust Protector of the Dynasty Trusts, and Trustee of the Irrevocable Life Insurance Trust. Mr. Caldwell has served as the family\'s primary estate planning attorney since 2008.',
        highlightedText: 'Richard Caldwell, Esq., of Caldwell & Associates LLP',
    },

    // ─────────────────────────────────────────────
    // MARTHA OKAFOR (thn-p18)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p18',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 3,
        excerpt: 'Martha Okafor, CPA, CFP serves as the family\'s Chief Financial Advisor and manages the Thornton Family Office LLC alongside the Grantor. She oversees all tax planning, investment strategy, and fiduciary compliance across the trust structure.',
        highlightedText: 'Martha Okafor, CPA, CFP serves as the family\'s Chief Financial Advisor',
    },

    // ─────────────────────────────────────────────
    // DANIEL SCHWARTZ (thn-p19)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p19',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 3,
        excerpt: 'Daniel Schwartz serves as Investment Director of Thornton Capital Group LP, responsible for managing the family\'s alternative investment allocations across private equity, hedge funds, and venture capital. He reports to Edward Thornton IV as General Partner.',
        highlightedText: 'Daniel Schwartz serves as Investment Director',
    },

    // ─────────────────────────────────────────────
    // THORNTON SLAT (thn-t12)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t12',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 42,
        excerpt: 'Article XVII: Spousal Lifetime Access Trust (SLAT). The Grantor establishes an irrevocable trust for the primary benefit of Anastasia Thornton-Reeves, funded with $30,000,000 in assets transferred by gift. The SLAT removes these assets from the Grantor\'s taxable estate while providing Anastasia access to trust income and principal during her lifetime.',
        highlightedText: 'Spousal Lifetime Access Trust (SLAT)',
    },

    // ─────────────────────────────────────────────
    // THORNTON CRT (thn-t13)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t13',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 48,
        excerpt: 'Article XVIII: Charitable Remainder Trust. The Grantor establishes a Charitable Remainder Unitrust (CRUT) with an initial funding of $15,000,000. The trust shall pay 5% of the net fair market value annually to the Grantor for his lifetime, with the remainder passing to the Thornton Foundation upon the Grantor\'s death.',
        highlightedText: 'Charitable Remainder Unitrust (CRUT)',
    },

    // ─────────────────────────────────────────────
    // THORNTON GRAT 2021 (thn-t14)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t14',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 10,
        excerpt: 'Thornton GRAT 2021: A two-year Grantor Retained Annuity Trust funded with $50,000,000 in shares of Thornton Media Investments LLC. The GRAT successfully "zeroed out" with excess appreciation of approximately $12M passing to Dynasty Trust I tax-free.',
        highlightedText: 'Grantor Retained Annuity Trust funded with $50,000,000',
    },

    // ─────────────────────────────────────────────
    // MONTANA RANCH (thn-a7)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a7',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 8,
        excerpt: 'Property: Montana Ranch, Big Sky area. 2,400 acres with main lodge, 3 guest cabins, equestrian facilities, and private trout stream. Current estimated value: $22,000,000. Held by Thornton Real Estate Holdings LLC.',
        highlightedText: 'Montana Ranch, Big Sky area. 2,400 acres',
    },

    // ─────────────────────────────────────────────
    // FIFTH AVE COMMERCIAL (thn-a8)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a8',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 10,
        excerpt: 'Commercial Property: Fifth Avenue Commercial Building, 520 Fifth Avenue, New York, NY 10036. 42-story Class A office tower. Current estimated value: $280,000,000. Held by Fifth Avenue Commercial LLC, a subsidiary of Thornton Real Estate Holdings LLC. Occupancy rate: 94%.',
        highlightedText: 'Fifth Avenue Commercial Building, 520 Fifth Avenue',
    },

    // ─────────────────────────────────────────────
    // FERRARI COLLECTION (thn-a29)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a29',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 28,
        excerpt: 'Vehicle Collection: Ferrari Collection — 6 vehicles including a 1962 250 GTO (valued at $48,000,000), 1967 275 GTB/4, 2022 SF90 Stradale, 2023 296 GTB, 1973 Dino 246 GTS, and 1987 F40. Total collection value: $62,000,000. Stored at climate-controlled facility in Greenwich, CT.',
        highlightedText: 'Ferrari Collection — 6 vehicles',
    },

    // ─────────────────────────────────────────────
    // BASQUIAT COLLECTION (thn-a28)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a28',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 27,
        excerpt: 'Art Collection: Jean-Michel Basquiat Collection — 4 Works. Includes "Untitled" (1982), "Flexible" (1984), and two works from the 1983 "Anatomy" series. Appraised value: $42,000,000 (Sotheby\'s valuation, September 2024). Held by Thornton Art Fund LLC.',
        highlightedText: 'Jean-Michel Basquiat Collection — 4 Works',
    },

    // ─────────────────────────────────────────────
    // PE FUND KKR (thn-a15)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a15',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 16,
        excerpt: 'Private Equity Investment: KKR North America Fund XII. Capital committed: $15,000,000. Current NAV: $18,200,000. Vintage year: 2020. Held through Thornton PE Aggregator LLC. Fund focuses on leveraged buyouts in North American mid-market companies.',
        highlightedText: 'KKR North America Fund XII',
    },

    // ─────────────────────────────────────────────
    // BITCOIN & DIGITAL ASSETS (thn-a30)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a30',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 30,
        excerpt: 'Digital Assets: Bitcoin and cryptocurrency holdings. 150 BTC held in institutional cold storage (Fidelity Digital Assets). Current estimated value: $15,000,000 (as of December 31, 2024). Additionally holds positions in Ethereum (500 ETH) and select DeFi protocols.',
        highlightedText: 'Bitcoin and cryptocurrency holdings. 150 BTC',
    },

    // ─────────────────────────────────────────────
    // IOWA FARMLAND (thn-a9)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a9',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 11,
        excerpt: 'Agricultural Asset: Iowa Farmland — 12,000 acres of prime cropland in Story and Boone Counties. Current estimated value: $180,000,000 ($15,000/acre). Held by Thornton Agriculture LP. Leased to three operating farmers under long-term agreements. Annual net income: $4.8M.',
        highlightedText: 'Iowa Farmland — 12,000 acres of prime cropland',
    },

    // ─────────────────────────────────────────────
    // OLIVER THORNTON-LIU (thn-p9)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p9',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 15,
        excerpt: 'Oliver Thornton-Liu, born January 12, 2012, son of Catherine Thornton-Liu and David Liu, is named as a beneficiary of the Catherine Liu Subtrust. Distributions for Oliver\'s benefit shall be limited to health, education, and maintenance expenses until he reaches the age of twenty-five (25).',
        highlightedText: 'Oliver Thornton-Liu, born January 12, 2012',
    },

    // ─────────────────────────────────────────────
    // SOPHIA THORNTON-LIU (thn-p10)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p10',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 16,
        excerpt: 'Sophia Thornton-Liu, born May 8, 2014, daughter of Catherine Thornton-Liu and David Liu, is named as a co-beneficiary of the Catherine Liu Subtrust alongside her brother Oliver. Educational distributions for Sophia shall include tuition, room, board, and reasonable living expenses at any accredited institution.',
        highlightedText: 'Sophia Thornton-Liu, born May 8, 2014',
    },

    // ─────────────────────────────────────────────
    // JAMES THORNTON IV (thn-p11)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p11',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 17,
        excerpt: 'James Thornton IV, born October 22, 2015, son of Edward Thornton IV and Margaret Thornton, is the primary beneficiary of the Edward IV Subtrust. Upon reaching age thirty (30), James shall receive an outright distribution of one-third of the subtrust principal, with the remaining balance distributed in equal installments at ages thirty-five and forty.',
        highlightedText: 'James Thornton IV, born October 22, 2015',
    },

    // ─────────────────────────────────────────────
    // ISABELLA REEVES-THORNTON (thn-p16)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-p16',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 35,
        excerpt: 'Isabella Reeves-Thornton, born March 3, 2005, daughter of Anastasia Thornton-Reeves from her prior marriage, is recognized as a stepchild of the Grantor. The Grantor directs that Isabella shall receive distributions from Dynasty Trust II for educational purposes and a one-time distribution of $2,000,000 upon reaching the age of thirty (30).',
        highlightedText: 'Isabella Reeves-Thornton, born March 3, 2005',
    },

    // ─────────────────────────────────────────────
    // EDWARD IV SUBTRUST (thn-t7)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t7',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 18,
        excerpt: 'Article XII, Section 1: Edward IV Subtrust. A separate subtrust is established within Dynasty Trust I for the benefit of Edward Thornton IV and his descendants. The subtrust shall be funded with one-third of Dynasty Trust I\'s assets and managed by the Trustee according to the discretionary distribution standard.',
        highlightedText: 'Edward IV Subtrust',
    },

    // ─────────────────────────────────────────────
    // CATHERINE LIU SUBTRUST (thn-t8)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t8',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 19,
        excerpt: 'Article XII, Section 2: Catherine Liu Subtrust. A separate subtrust is established within Dynasty Trust I for the benefit of Catherine Thornton-Liu and her descendants. The subtrust shall be funded with one-third of Dynasty Trust I\'s assets, with special provisions for educational distributions to Catherine\'s minor children.',
        highlightedText: 'Catherine Liu Subtrust',
    },

    // ─────────────────────────────────────────────
    // BENJAMIN THORNTON SUBTRUST (thn-t9)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t9',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 20,
        excerpt: 'Article XII, Section 3: Benjamin Thornton Subtrust. A separate subtrust is established within Dynasty Trust I for the benefit of Benjamin Thornton and his descendants. The subtrust shall be funded with one-third of Dynasty Trust I\'s assets. Benjamin holds a limited power of appointment over his subtrust share exercisable by will.',
        highlightedText: 'Benjamin Thornton Subtrust',
    },

    // ─────────────────────────────────────────────
    // NATALIE THORNTON SUBTRUST (thn-t10)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t10',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 36,
        excerpt: 'Article XV, Section 2: Natalie Thornton Subtrust. A separate subtrust is established within Dynasty Trust II for the benefit of Natalie Thornton. The subtrust shall be funded with 42.5% of Dynasty Trust II\'s assets (after the 15% charitable allocation). Distributions are subject to the discretionary standard of health, education, maintenance, and support.',
        highlightedText: 'Natalie Thornton Subtrust',
    },

    // ─────────────────────────────────────────────
    // LUCAS THORNTON SUBTRUST (thn-t11)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-t11',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 37,
        excerpt: 'Article XV, Section 3: Lucas Thornton Subtrust. A separate subtrust is established within Dynasty Trust II for the benefit of Lucas Thornton. The subtrust shall be funded with 42.5% of Dynasty Trust II\'s assets (after the 15% charitable allocation). Lucas\'s subtrust mirrors the distribution provisions of Natalie\'s subtrust.',
        highlightedText: 'Lucas Thornton Subtrust',
    },

    // ─────────────────────────────────────────────
    // JPMORGAN PRIVATE BANK (thn-a10)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a10',
        documentName: 'investment-account-statements.pdf',
        documentLabel: 'Investment Account Statements',
        page: 2,
        excerpt: 'Account: JPMorgan Private Bank — Multi-Asset Portfolio, Account No. JPM-THN-2018-4401. Current market value: $85,000,000 as of December 31, 2024. Asset allocation: 55% equities, 30% fixed income, 15% alternatives. Managed under discretionary advisory agreement dated September 2018.',
        highlightedText: 'JPMorgan Private Bank — Multi-Asset Portfolio',
    },

    // ─────────────────────────────────────────────
    // GOLDMAN SACHS WEALTH MGMT (thn-a11)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a11',
        documentName: 'investment-account-statements.pdf',
        documentLabel: 'Investment Account Statements',
        page: 5,
        excerpt: 'Account: Goldman Sachs Wealth Management — Growth Equity Strategy, Account No. GS-THN-2016-7823. Current market value: $62,000,000 as of December 31, 2024. Concentrated equity portfolio with focus on technology, healthcare, and consumer sectors. Managed under non-discretionary advisory agreement.',
        highlightedText: 'Goldman Sachs Wealth Management — Growth Equity Strategy',
    },

    // ─────────────────────────────────────────────
    // BLACKROCK FIXED INCOME (thn-a12)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a12',
        documentName: 'investment-account-statements.pdf',
        documentLabel: 'Investment Account Statements',
        page: 8,
        excerpt: 'Account: BlackRock Fixed Income Portfolio, Account No. BLK-THN-2019-3356. Current market value: $45,000,000 as of December 31, 2024. Portfolio comprises investment-grade corporate bonds (60%), U.S. Treasuries (25%), and municipal bonds (15%). Average duration: 6.2 years. Yield to maturity: 4.8%.',
        highlightedText: 'BlackRock Fixed Income Portfolio',
    },

    // ─────────────────────────────────────────────
    // VANGUARD INDEX PORTFOLIO (thn-a13)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a13',
        documentName: 'investment-account-statements.pdf',
        documentLabel: 'Investment Account Statements',
        page: 11,
        excerpt: 'Account: Vanguard Index Portfolio — Passive Core, Account No. VGD-THN-2020-5512. Current market value: $38,000,000 as of December 31, 2024. Allocation: Vanguard Total Stock Market Index (50%), Vanguard Total International Stock Index (30%), Vanguard Total Bond Market Index (20%). Expense ratio: 0.04%.',
        highlightedText: 'Vanguard Index Portfolio — Passive Core',
    },

    // ─────────────────────────────────────────────
    // THORNTON VENTURES LLC (thn-e9)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-e9',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 50,
        excerpt: 'Thornton Ventures LLC, a Delaware limited liability company formed in 2019, serves as the family\'s direct venture investment vehicle and fund-of-funds platform. Benjamin Thornton serves as Managing Member. The entity holds 22 active positions across seed-to-Series C stages with a focus on fintech, climate tech, and healthcare AI.',
        highlightedText: 'Thornton Ventures LLC, a Delaware limited liability company',
    },

    // ─────────────────────────────────────────────
    // THORNTON INSURANCE HOLDINGS LLC (thn-e10)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-e10',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 18,
        excerpt: 'Thornton Insurance Holdings LLC consolidates all family insurance policies under a single management entity. The LLC manages premium payments, claims processing, and annual coverage reviews across life, property, liability, and specialty lines totaling over $500M in coverage.',
        highlightedText: 'Thornton Insurance Holdings LLC consolidates all family insurance policies',
    },

    // ─────────────────────────────────────────────
    // MORGAN STANLEY PORTFOLIO (thn-a33)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a33',
        documentName: 'investment-account-statements.pdf',
        documentLabel: 'Investment Account Statements',
        page: 14,
        excerpt: 'Account: Morgan Stanley Wealth Management — Balanced Growth Portfolio, Account No. MS-THN-2017-6290. Current market value: $55,000,000 as of December 31, 2024. Diversified multi-asset strategy with 45% equities, 35% fixed income, 10% alternatives, 10% cash equivalents.',
        highlightedText: 'Morgan Stanley Wealth Management — Balanced Growth Portfolio',
    },

    // ─────────────────────────────────────────────
    // FOUNDATION ENDOWMENT (thn-a34)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a34',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 19,
        excerpt: 'Foundation Endowment Fund: $45,000,000 invested in a diversified portfolio managed by Cambridge Associates. Annual distribution rate of 5% supports the Foundation\'s grant-making programs in education, healthcare, and the arts.',
        highlightedText: 'Foundation Endowment Fund: $45,000,000',
    },

    // ─────────────────────────────────────────────
    // FOUNDATION ART COLLECTION (thn-a35)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a35',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 32,
        excerpt: 'Foundation Art Collection: 48 works on long-term loan to partner museums including the Whitney, MoMA, and the Guggenheim. Collection includes contemporary American and European works. Insured value: $18,000,000. Managed under the Foundation\'s arts program.',
        highlightedText: 'Foundation Art Collection: 48 works on long-term loan',
    },

    // ─────────────────────────────────────────────
    // KUSAMA INSTALLATION (thn-a36)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a36',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 29,
        excerpt: 'Art: Yayoi Kusama Infinity Mirror Room — "Aftermath of Obliteration of Eternity" (2009). Site-specific installation currently housed at the Thornton Foundation gallery space. Appraised value: $8,500,000 (Phillips valuation, March 2024). Held by Thornton Art Fund LLC.',
        highlightedText: 'Kusama Infinity Mirror Room',
    },

    // ─────────────────────────────────────────────
    // BELL 525 HELICOPTER (thn-a37)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a37',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 23,
        excerpt: 'Aircraft: 2024 Bell 525 Relentless helicopter, Registration N-THN5. Current estimated value: $18,000,000. Held by Thornton Aviation LLC. Based at East Hampton Airport (HTO). Used primarily for commuting between NYC and Hamptons estate.',
        highlightedText: 'Bell 525 Relentless helicopter',
    },

    // ─────────────────────────────────────────────
    // AVIATION HULL INSURANCE (thn-a38)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a38',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 12,
        excerpt: 'Aviation Hull & Liability Insurance: Global Aerospace policy covering both the Gulfstream G700 and Bell 525. Hull coverage: $93,000,000 combined. Liability coverage: $100,000,000 per occurrence. Annual premium: $485,000. Policy renewed annually through Willis Towers Watson aviation practice.',
        highlightedText: 'Aviation Hull & Liability Insurance',
    },

    // ─────────────────────────────────────────────
    // SAILING YACHT AURORA (thn-a39)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a39',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 25,
        excerpt: 'Vessel: Sailing Yacht Aurora, 42-meter Perini Navi 2019. Flag: Cayman Islands. Current estimated value: $32,000,000. Held by Thornton Maritime LLC. Home port: Antibes, France. Primarily used for Mediterranean summer sailing. Crew of 8.',
        highlightedText: 'Sailing Yacht Aurora, 42-meter Perini Navi 2019',
    },

    // ─────────────────────────────────────────────
    // TENDER FLEET (thn-a40)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a40',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 25,
        excerpt: 'Maritime Support: Tender fleet comprising two custom Novurania chase boats and one Williams jet tender. Total value: $1,200,000. Maintained by Fraser Yachts alongside M/Y Sovereign. Annual maintenance: $180,000.',
        highlightedText: 'Tender fleet comprising two custom Novurania chase boats',
    },

    // ─────────────────────────────────────────────
    // SEQUOIA CAPITAL FUND (thn-a41)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a41',
        documentName: 'investment-account-statements.pdf',
        documentLabel: 'Investment Account Statements',
        page: 17,
        excerpt: 'Venture Capital: Sequoia Capital Global Growth Fund III. Capital committed: $10,000,000. Capital called: $7,500,000. Current NAV: $12,800,000. Vintage year: 2021. Held through Thornton Ventures LLC. Focus on late-stage technology and healthcare companies.',
        highlightedText: 'Sequoia Capital Global Growth Fund III',
    },

    // ─────────────────────────────────────────────
    // BLACKSTONE RE FUND (thn-a42)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a42',
        documentName: 'investment-account-statements.pdf',
        documentLabel: 'Investment Account Statements',
        page: 19,
        excerpt: 'Private Equity — Real Estate: Blackstone Real Estate Partners X. Capital committed: $20,000,000. Capital called: $16,000,000. Current NAV: $22,400,000. Vintage year: 2022. Held through Thornton PE Aggregator LLC. Fund targets value-add and opportunistic real estate globally.',
        highlightedText: 'Blackstone Real Estate Partners X',
    },

    // ─────────────────────────────────────────────
    // OREGON VINEYARD (thn-a43)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a43',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 12,
        excerpt: 'Agricultural Property: Willamette Valley Vineyard, Dundee Hills AVA, Oregon. 320 acres with 180 acres under vine. Pinot Noir and Chardonnay varietals. Current estimated value: $28,000,000. Held by Thornton Agriculture LP. Annual wine production: 15,000 cases.',
        highlightedText: 'Willamette Valley Vineyard, Dundee Hills AVA',
    },

    // ─────────────────────────────────────────────
    // CROP INSURANCE (thn-a44)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a44',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 16,
        excerpt: 'Multi-Peril Crop Insurance: Federal crop insurance covering 12,000 acres of Iowa farmland. Coverage level: 85% of expected revenue. Insured crops: corn and soybeans. Annual premium: $420,000 (after USDA subsidy). Policy managed through Rain and Hail Insurance Society.',
        highlightedText: 'Multi-Peril Crop Insurance',
    },

    // ─────────────────────────────────────────────
    // UMBRELLA LIABILITY (thn-a45)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a45',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 20,
        excerpt: 'Personal Umbrella Liability: AIG Private Client Group excess liability policy. Coverage: $50,000,000 per occurrence / $100,000,000 aggregate. Covers all family members, properties, vehicles, watercraft, and aircraft. Annual premium: $125,000.',
        highlightedText: 'Personal Umbrella Liability',
    },

    // ─────────────────────────────────────────────
    // PROPERTY & CASUALTY PORTFOLIO (thn-a46)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a46',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 22,
        excerpt: 'Property & Casualty Portfolio: Comprehensive property coverage across all Thornton real estate holdings through Chubb and AIG. Total insured value: $600,000,000. Includes scheduled personal property (art, jewelry, wine collections). Annual combined premium: $890,000.',
        highlightedText: 'Property & Casualty Portfolio',
    },

    // ─────────────────────────────────────────────
    // SLAT PORTFOLIO (thn-a31)
    // ─────────────────────────────────────────────
    {
        itemId: 'thn-a31',
        documentName: 'investment-account-statements.pdf',
        documentLabel: 'Investment Account Statements',
        page: 21,
        excerpt: 'SLAT Investment Portfolio: Diversified portfolio held within the Spousal Lifetime Access Trust. Current market value: $30,000,000. Allocation: 60% equities (primarily large-cap growth), 25% fixed income, 15% alternatives. Managed by Goldman Sachs under discretionary mandate.',
        highlightedText: 'SLAT Investment Portfolio',
    },

    // ═════════════════════════════════════════════
    // ADDITIONAL CITATIONS — COVERAGE EXPANSION
    // ═════════════════════════════════════════════

    // ─────────────────────────────────────────────
    // ZERO-CITATION ITEMS → 2 citations each
    // ─────────────────────────────────────────────

    // THORNTON AVIATION LLC (thn-e4)
    {
        itemId: 'thn-e4',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 14,
        excerpt: 'Thornton Aviation LLC was formed in Delaware on March 15, 2022, to hold the family\'s aircraft assets and manage flight operations. The LLC structure provides liability protection separating aviation risks from other family assets. Edward Thornton III serves as Managing Member.',
        highlightedText: 'Thornton Aviation LLC was formed in Delaware on March 15, 2022',
    },
    {
        itemId: 'thn-e4',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 21,
        excerpt: 'Entity: Thornton Aviation LLC. Holds: Gulfstream G700 (N-THN7), Bell 525 Relentless (N-THN5). Total asset value: $93,000,000. Annual operating costs: $6.1M including crew salaries, fuel, maintenance, hangar fees, and insurance premiums.',
        highlightedText: 'Thornton Aviation LLC. Holds: Gulfstream G700',
    },

    // THORNTON MARITIME LLC (thn-e5)
    {
        itemId: 'thn-e5',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 16,
        excerpt: 'Thornton Maritime LLC, registered in the Cayman Islands on November 1, 2020, holds the family\'s maritime assets including Motor Yacht Sovereign and Sailing Yacht Aurora. The Cayman registration provides favorable maritime law and tax treatment for international operations.',
        highlightedText: 'Thornton Maritime LLC, registered in the Cayman Islands',
    },
    {
        itemId: 'thn-e5',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 24,
        excerpt: 'Entity: Thornton Maritime LLC. Assets held: M/Y Sovereign ($120M), S/Y Aurora ($32M), Tender Fleet ($1.2M). Total maritime portfolio value: $153,200,000. Managed by Fraser Yachts. Annual operating budget: $18.5M.',
        highlightedText: 'Thornton Maritime LLC. Assets held: M/Y Sovereign',
    },

    // THORNTON ART FUND LLC (thn-e6)
    {
        itemId: 'thn-e6',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 17,
        excerpt: 'Thornton Art Fund LLC, a New York LLC formed in May 2014, holds the family\'s private art collection. Catherine Thornton-Liu serves as Director, overseeing acquisitions, conservation, and the museum loan program. Total insured value of the collection exceeds $70,000,000.',
        highlightedText: 'Thornton Art Fund LLC, a New York LLC formed in May 2014',
    },
    {
        itemId: 'thn-e6',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 26,
        excerpt: 'Entity: Thornton Art Fund LLC. Holdings include the Warhol Portfolio (12 works, $28M), Basquiat Collection (4 works, $42M), Kusama Installation ($8.5M), and additional contemporary works. Total collection value: $98,500,000. Storage and conservation managed by Cadogan Tate.',
        highlightedText: 'Thornton Art Fund LLC. Holdings include the Warhol Portfolio',
    },

    // THORNTON PE AGGREGATOR LLC (thn-e7)
    {
        itemId: 'thn-e7',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 11,
        excerpt: 'Thornton PE Aggregator LLC, a Delaware LLC formed in February 2016, serves as the family\'s consolidated vehicle for private equity and venture capital fund commitments. Currently holds interests in over 40 fund positions with total committed capital exceeding $180,000,000.',
        highlightedText: 'Thornton PE Aggregator LLC, a Delaware LLC formed in February 2016',
    },
    {
        itemId: 'thn-e7',
        documentName: 'investment-account-statements.pdf',
        documentLabel: 'Investment Account Statements',
        page: 15,
        excerpt: 'Thornton PE Aggregator LLC — Portfolio Summary: 42 active fund positions across PE, VC, and real assets strategies. Total committed capital: $182,500,000. Called capital: $141,200,000. Current NAV: $198,400,000. Net MOIC: 1.41x across all vintages.',
        highlightedText: 'Thornton PE Aggregator LLC — Portfolio Summary',
    },

    // THORNTON AGRICULTURE LP (thn-e8)
    {
        itemId: 'thn-e8',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 13,
        excerpt: 'Thornton Agriculture LP, an Iowa limited partnership formed in August 2017, holds the family\'s agricultural assets including 12,000 acres of prime Iowa cropland and the Willamette Valley Vineyard in Oregon. The LP structure facilitates income distribution to trust beneficiaries.',
        highlightedText: 'Thornton Agriculture LP, an Iowa limited partnership',
    },
    {
        itemId: 'thn-e8',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 11,
        excerpt: 'Entity: Thornton Agriculture LP. Assets: Iowa Farmland (12,000 acres, $180M), Willamette Valley Vineyard (320 acres, $28M). Total agricultural portfolio value: $208,000,000. Annual net income: $7.2M from farm leases and wine operations.',
        highlightedText: 'Thornton Agriculture LP. Assets: Iowa Farmland',
    },

    // CRT UNITRUST FUND (thn-a32)
    {
        itemId: 'thn-a32',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 49,
        excerpt: 'The Charitable Remainder Unitrust Fund shall be invested in a diversified portfolio with the objective of generating total returns sufficient to support the 5% annual unitrust payout while preserving the value of the remainder interest for the Thornton Foundation.',
        highlightedText: 'Charitable Remainder Unitrust Fund shall be invested',
    },
    {
        itemId: 'thn-a32',
        documentName: 'investment-account-statements.pdf',
        documentLabel: 'Investment Account Statements',
        page: 22,
        excerpt: 'CRT Unitrust Fund: Current market value $15,000,000. 5% annual payout to Edward Thornton III and Anastasia Thornton-Reeves. Allocation: 50% equities, 35% fixed income, 15% alternatives. Managed by Cambridge Associates under CRT-specific IPS.',
        highlightedText: 'CRT Unitrust Fund: Current market value $15,000,000',
    },

    // ─────────────────────────────────────────────
    // SECOND CITATIONS — single-citation items
    // ─────────────────────────────────────────────

    // Catherine Thornton-Liu (thn-p5)
    {
        itemId: 'thn-p5',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 5,
        excerpt: 'Catherine Thornton-Liu, daughter of the Grantor, serves as Director of Thornton Art Fund LLC and oversees the family\'s museum loan program. She is an income beneficiary of Dynasty Trust I and her subtrust provides educational distributions for her children Oliver and Sophia.',
        highlightedText: 'Catherine Thornton-Liu, daughter of the Grantor',
    },

    // Natalie Thornton (thn-p7)
    {
        itemId: 'thn-p7',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 6,
        excerpt: 'Natalie Thornton, eldest child of the Grantor\'s second marriage, is a beneficiary of Dynasty Trust II. Her subtrust is funded with 42.5% of Dynasty Trust II assets. Natalie is currently pursuing graduate studies and receives educational distributions under the HEMS standard.',
        highlightedText: 'Natalie Thornton, eldest child of the Grantor\'s second marriage',
    },

    // Lucas Thornton (thn-p8)
    {
        itemId: 'thn-p8',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 6,
        excerpt: 'Lucas Thornton, youngest child of the Grantor and Anastasia Thornton-Reeves, is a beneficiary of Dynasty Trust II with a subtrust allocation mirroring his sister Natalie\'s. Lucas\'s distributions commence with educational expenses and expand to maintenance and support at age twenty-five.',
        highlightedText: 'Lucas Thornton, youngest child of the Grantor',
    },

    // Oliver Thornton-Liu (thn-p9)
    {
        itemId: 'thn-p9',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 7,
        excerpt: 'Oliver Thornton-Liu, grandson of the Grantor through Catherine Thornton-Liu, is a beneficiary of the Catherine Liu Subtrust within Dynasty Trust I. Distributions for Oliver are limited to health, education, and maintenance until he reaches age twenty-five.',
        highlightedText: 'Oliver Thornton-Liu, grandson of the Grantor',
    },

    // Sophia Thornton-Liu (thn-p10)
    {
        itemId: 'thn-p10',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 7,
        excerpt: 'Sophia Thornton-Liu, granddaughter of the Grantor through Catherine Thornton-Liu, is a co-beneficiary of the Catherine Liu Subtrust alongside her brother Oliver. Educational distributions include tuition at any accredited institution, with broader access upon reaching majority.',
        highlightedText: 'Sophia Thornton-Liu, granddaughter of the Grantor',
    },

    // James Thornton IV (thn-p11)
    {
        itemId: 'thn-p11',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 4,
        excerpt: 'James Thornton IV, grandson of the Grantor through Edward IV, is the primary beneficiary of the Edward IV Subtrust. His distribution schedule provides one-third of subtrust principal at age 30, with remaining installments at ages 35 and 40.',
        highlightedText: 'James Thornton IV, grandson of the Grantor',
    },

    // Isabella Reeves-Thornton (thn-p16)
    {
        itemId: 'thn-p16',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 6,
        excerpt: 'Isabella Reeves-Thornton, stepdaughter of the Grantor and daughter of Anastasia from a prior marriage, receives educational distributions from Dynasty Trust II and a one-time $2,000,000 distribution at age 30. She is not a beneficiary of Dynasty Trust I.',
        highlightedText: 'Isabella Reeves-Thornton, stepdaughter of the Grantor',
    },

    // Richard Caldwell (thn-p17)
    {
        itemId: 'thn-p17',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 3,
        excerpt: 'Richard Caldwell, Esq. of Caldwell & Associates LLP has served as primary estate planning counsel since 2008. He holds fiduciary roles including Successor Trustee of the RLT, Trust Protector of both Dynasty Trusts, and Trustee of the Irrevocable Life Insurance Trust.',
        highlightedText: 'Richard Caldwell, Esq. of Caldwell & Associates LLP',
    },

    // Martha Okafor (thn-p18)
    {
        itemId: 'thn-p18',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 46,
        excerpt: 'Martha Okafor, CPA, CFP is authorized to act as Co-Manager of the Thornton Family Office LLC and shall have authority to execute investment transactions, manage tax filings, and coordinate with external advisors on behalf of the family\'s trust and entity structure.',
        highlightedText: 'Martha Okafor, CPA, CFP is authorized to act as Co-Manager',
    },

    // Daniel Schwartz (thn-p19)
    {
        itemId: 'thn-p19',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 47,
        excerpt: 'Daniel Schwartz is appointed as Investment Director of Thornton Capital Group LP and shall report to the General Partner, Edward Thornton IV, regarding all alternative investment allocations, fund commitments, and portfolio rebalancing activities.',
        highlightedText: 'Daniel Schwartz is appointed as Investment Director',
    },

    // Dynasty Trust II (thn-t3)
    {
        itemId: 'thn-t3',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 9,
        excerpt: 'Dynasty Trust II holds approximately $220M in assets allocated for the Grantor\'s children from his second marriage and charitable purposes. The trust allocates 15% of annual income to the Thornton Foundation, with the remainder split between Natalie and Lucas Thornton subtrusts.',
        highlightedText: 'Dynasty Trust II holds approximately $220M in assets',
    },

    // Marital Trust (thn-t5)
    {
        itemId: 'thn-t5',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 8,
        excerpt: 'The Marital Trust qualifies for the federal estate tax marital deduction and is designed to provide Anastasia Thornton-Reeves with lifetime income and access to principal under the HEMS standard. Upon Anastasia\'s death, remaining assets pass to the Bypass Trust.',
        highlightedText: 'Marital Trust qualifies for the federal estate tax marital deduction',
    },

    // Bypass Trust (thn-t6)
    {
        itemId: 'thn-t6',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 9,
        excerpt: 'The Bypass Trust (Credit Shelter Trust) is funded with assets up to the applicable exclusion amount. This structure shelters assets from estate tax at Anastasia\'s death while providing discretionary support for the surviving spouse and descendants during her lifetime.',
        highlightedText: 'Bypass Trust (Credit Shelter Trust) is funded',
    },

    // Edward IV Subtrust (thn-t7)
    {
        itemId: 'thn-t7',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 10,
        excerpt: 'The Edward IV Subtrust within Dynasty Trust I is funded with one-third of the trust\'s assets, approximately $127M. Edward IV receives income distributions and has limited authority to direct principal for business investment purposes, subject to Trustee approval.',
        highlightedText: 'Edward IV Subtrust within Dynasty Trust I',
    },

    // Catherine Liu Subtrust (thn-t8)
    {
        itemId: 'thn-t8',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 10,
        excerpt: 'The Catherine Liu Subtrust within Dynasty Trust I is funded with one-third of the trust\'s assets. Special provisions allow for accelerated educational distributions for Catherine\'s minor children Oliver and Sophia, covering tuition through graduate school.',
        highlightedText: 'Catherine Liu Subtrust within Dynasty Trust I',
    },

    // Benjamin Thornton Subtrust (thn-t9)
    {
        itemId: 'thn-t9',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 10,
        excerpt: 'The Benjamin Thornton Subtrust within Dynasty Trust I is funded with one-third of the trust\'s assets. Benjamin holds a limited power of appointment exercisable by will, allowing him to direct the disposition of his subtrust share among his descendants.',
        highlightedText: 'Benjamin Thornton Subtrust within Dynasty Trust I',
    },

    // Natalie Thornton Subtrust (thn-t10)
    {
        itemId: 'thn-t10',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 11,
        excerpt: 'The Natalie Thornton Subtrust within Dynasty Trust II is funded with 42.5% of trust assets after the 15% charitable allocation. Natalie\'s distributions follow a staged schedule commencing with educational and health distributions, expanding to full HEMS at age 30.',
        highlightedText: 'Natalie Thornton Subtrust within Dynasty Trust II',
    },

    // Lucas Thornton Subtrust (thn-t11)
    {
        itemId: 'thn-t11',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 11,
        excerpt: 'The Lucas Thornton Subtrust within Dynasty Trust II mirrors the distribution provisions of Natalie\'s subtrust. Lucas is funded with 42.5% of Dynasty Trust II assets after charitable allocation, with identical staged distribution provisions.',
        highlightedText: 'Lucas Thornton Subtrust within Dynasty Trust II',
    },

    // SLAT (thn-t12)
    {
        itemId: 'thn-t12',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 12,
        excerpt: 'The Spousal Lifetime Access Trust (SLAT) was funded with $30,000,000 transferred by gift from the Grantor. The SLAT removes these assets from the Grantor\'s taxable estate while providing Anastasia lifetime access to income and principal. Portfolio managed by Goldman Sachs.',
        highlightedText: 'Spousal Lifetime Access Trust (SLAT) was funded with $30,000,000',
    },

    // CRT (thn-t13)
    {
        itemId: 'thn-t13',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 12,
        excerpt: 'The Charitable Remainder Unitrust (CRUT) was established with $15,000,000 in initial funding. It pays 5% annually to the Grantor during his lifetime. Upon the Grantor\'s death, the remainder passes to the Thornton Foundation, generating a significant charitable deduction.',
        highlightedText: 'Charitable Remainder Unitrust (CRUT) was established',
    },

    // GRAT 2021 (thn-t14)
    {
        itemId: 'thn-t14',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 51,
        excerpt: 'The Thornton GRAT 2021, a two-year Grantor Retained Annuity Trust, was funded with $50,000,000 in shares of Thornton Media Investments LLC. The GRAT term expired in 2023, successfully transferring approximately $12M in excess appreciation to Dynasty Trust I on a gift-tax-free basis.',
        highlightedText: 'Thornton GRAT 2021, a two-year Grantor Retained Annuity Trust',
    },

    // Thornton Capital Group LP (thn-e2)
    {
        itemId: 'thn-e2',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 13,
        excerpt: 'Thornton Capital Group LP serves as the master holding entity for the family\'s operating subsidiaries. The GP interest is held by the Family Office LLC. LP interests are divided 60% Dynasty Trust I and 40% Dynasty Trust II, enabling income distributions to flow through to trust beneficiaries.',
        highlightedText: 'Thornton Capital Group LP serves as the master holding entity',
    },

    // Thornton RE Holdings LLC (thn-e3)
    {
        itemId: 'thn-e3',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 14,
        excerpt: 'Thornton Real Estate Holdings LLC manages the family\'s domestic real estate portfolio valued at approximately $408M. Edward Thornton IV serves as President, overseeing property management, tenant relations, and capital improvement projects across all properties.',
        highlightedText: 'Thornton Real Estate Holdings LLC manages the family\'s domestic real estate',
    },

    // Thornton Ventures LLC (thn-e9)
    {
        itemId: 'thn-e9',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 15,
        excerpt: 'Thornton Ventures LLC operates as the family\'s direct venture investment vehicle with 22 active positions. Benjamin Thornton manages the fund, focusing on fintech, climate tech, and healthcare AI. Total committed capital to date: $45M across seed-to-Series C stages.',
        highlightedText: 'Thornton Ventures LLC operates as the family\'s direct venture investment',
    },

    // Thornton Insurance Holdings LLC (thn-e10)
    {
        itemId: 'thn-e10',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 16,
        excerpt: 'Thornton Insurance Holdings LLC consolidates premium payments and coverage management across all family policies. Total coverage exceeds $500M across life, property, liability, aviation, maritime, and specialty lines. Annual insurance costs: approximately $2.2M.',
        highlightedText: 'Thornton Insurance Holdings LLC consolidates premium payments',
    },

    // Hamptons Estate (thn-a2)
    {
        itemId: 'thn-a2',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 15,
        excerpt: 'The Hamptons Estate at 142 Further Lane, East Hampton, is the family\'s primary vacation residence. The 8.5-acre oceanfront compound includes a main residence, pool house, and guest cottage. Insurance coverage: $45M all-risk policy through Chubb.',
        highlightedText: 'Hamptons Estate at 142 Further Lane, East Hampton',
    },

    // London Mayfair Flat (thn-a5)
    {
        itemId: 'thn-a5',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 16,
        excerpt: 'The London Mayfair Flat at 42 Grosvenor Square is held through London Mayfair Properties Ltd, a UK entity. The Grade II listed Georgian property is valued at approximately £18.5M ($23M USD). Property management is handled by Knight Frank.',
        highlightedText: 'London Mayfair Flat at 42 Grosvenor Square',
    },

    // Montana Ranch (thn-a7)
    {
        itemId: 'thn-a7',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 15,
        excerpt: 'The Montana Ranch in the Big Sky area comprises 2,400 acres with a main lodge, three guest cabins, equestrian facilities, and a private trout stream. The property serves as the family\'s recreational retreat and is held by Thornton Real Estate Holdings LLC.',
        highlightedText: 'Montana Ranch in the Big Sky area comprises 2,400 acres',
    },

    // Fifth Avenue Commercial (thn-a8)
    {
        itemId: 'thn-a8',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 14,
        excerpt: 'The Fifth Avenue Commercial Building at 520 Fifth Avenue is a 42-story Class A office tower valued at $280M with a 94% occupancy rate. Held through Fifth Avenue Commercial LLC, a subsidiary of Thornton Real Estate Holdings LLC. Annual net operating income: $18.2M.',
        highlightedText: 'Fifth Avenue Commercial Building at 520 Fifth Avenue',
    },

    // Iowa Farmland (thn-a9)
    {
        itemId: 'thn-a9',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 13,
        excerpt: 'The Iowa Farmland holding comprises 12,000 acres of prime cropland in Story and Boone Counties, valued at $15,000 per acre ($180M total). The land is leased to three operating farmers under long-term agreements generating $4.8M in annual net income.',
        highlightedText: 'Iowa Farmland holding comprises 12,000 acres',
    },

    // JPMorgan (thn-a10)
    {
        itemId: 'thn-a10',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 18,
        excerpt: 'The JPMorgan Private Bank multi-asset portfolio is the largest single investment account in the estate at $85M. The account is managed under a discretionary advisory agreement with a target allocation of 55% equities, 30% fixed income, and 15% alternatives.',
        highlightedText: 'JPMorgan Private Bank multi-asset portfolio',
    },

    // Goldman Sachs (thn-a11)
    {
        itemId: 'thn-a11',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 18,
        excerpt: 'The Goldman Sachs Wealth Management growth equity strategy focuses on concentrated positions in technology, healthcare, and consumer sectors. The $62M portfolio is managed under a non-discretionary advisory agreement allowing the family to approve major trades.',
        highlightedText: 'Goldman Sachs Wealth Management growth equity strategy',
    },

    // BlackRock Fixed Income (thn-a12)
    {
        itemId: 'thn-a12',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 18,
        excerpt: 'The BlackRock Fixed Income Portfolio of $45M provides stable income to support trust distributions. The portfolio comprises investment-grade corporate bonds, U.S. Treasuries, and municipal bonds with an average duration of 6.2 years and yield to maturity of 4.8%.',
        highlightedText: 'BlackRock Fixed Income Portfolio of $45M',
    },

    // Vanguard (thn-a13)
    {
        itemId: 'thn-a13',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 19,
        excerpt: 'The Vanguard Index Portfolio serves as the passive core of the investment strategy at $38M. The ultra-low-cost allocation across total stock market, international, and bond index funds provides broad market exposure at an expense ratio of just 0.04%.',
        highlightedText: 'Vanguard Index Portfolio serves as the passive core',
    },

    // KKR Fund (thn-a15)
    {
        itemId: 'thn-a15',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 19,
        excerpt: 'The KKR North America Fund XII position represents a $15M commitment to leveraged buyouts in North American mid-market companies. The fund\'s current NAV of $18.2M reflects a 1.21x multiple on invested capital. Held through Thornton PE Aggregator LLC.',
        highlightedText: 'KKR North America Fund XII position represents a $15M commitment',
    },

    // Gulfstream G700 (thn-a25)
    {
        itemId: 'thn-a25',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 12,
        excerpt: 'The 2023 Gulfstream G700 (Registration N-THN7) is covered under the Global Aerospace aviation hull and liability policy. Hull coverage: $75,000,000. Based at Teterboro Airport. Crew of four including two full-time pilots and two flight attendants.',
        highlightedText: 'Gulfstream G700 (Registration N-THN7) is covered',
    },

    // Motor Yacht Sovereign (thn-a26)
    {
        itemId: 'thn-a26',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 15,
        excerpt: 'Motor Yacht Sovereign, the 65-meter Lürssen 2021, carries comprehensive hull and machinery coverage of $120,000,000 through Pantaenius and P&I coverage through West of England. Annual insurance premium for the vessel: $680,000.',
        highlightedText: 'Motor Yacht Sovereign, the 65-meter Lürssen 2021, carries comprehensive hull',
    },

    // Warhol Portfolio (thn-a27)
    {
        itemId: 'thn-a27',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 21,
        excerpt: 'Scheduled Personal Property — Fine Art: Andy Warhol Portfolio (12 works) insured for $28,000,000 under the Chubb Masterpiece policy. Coverage includes worldwide transit, exhibition, and storage. Climate-controlled facility in Greenwich, CT.',
        highlightedText: 'Andy Warhol Portfolio (12 works) insured for $28,000,000',
    },

    // Basquiat Collection (thn-a28)
    {
        itemId: 'thn-a28',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 21,
        excerpt: 'Scheduled Personal Property — Fine Art: Jean-Michel Basquiat Collection (4 works) insured for $42,000,000 under the Chubb Masterpiece policy. Includes "Untitled" (1982), the most valuable single work in the collection at an appraised value of $22,000,000.',
        highlightedText: 'Basquiat Collection (4 works) insured for $42,000,000',
    },

    // Ferrari Collection (thn-a29)
    {
        itemId: 'thn-a29',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 22,
        excerpt: 'Scheduled Personal Property — Vehicles: Ferrari Collection (6 vehicles) insured for $62,000,000 through AIG Private Client Group. The 1962 250 GTO, valued at $48M, carries an individual scheduled endorsement with agreed value coverage.',
        highlightedText: 'Ferrari Collection (6 vehicles) insured for $62,000,000',
    },

    // Bitcoin (thn-a30)
    {
        itemId: 'thn-a30',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 20,
        excerpt: 'Digital asset holdings include 150 BTC in institutional cold storage at Fidelity Digital Assets and 500 ETH in staking positions. Current combined value approximately $17M. Custody procedures require multi-signature authorization for any withdrawals.',
        highlightedText: 'Digital asset holdings include 150 BTC',
    },

    // SLAT Portfolio (thn-a31)
    {
        itemId: 'thn-a31',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 12,
        excerpt: 'The SLAT Investment Portfolio of $30M is managed by Goldman Sachs under a discretionary mandate. The portfolio prioritizes income generation to support Anastasia\'s distributions while maintaining capital appreciation. Current allocation: 60% equities, 25% fixed income, 15% alternatives.',
        highlightedText: 'SLAT Investment Portfolio of $30M is managed by Goldman Sachs',
    },

    // Morgan Stanley (thn-a33)
    {
        itemId: 'thn-a33',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 18,
        excerpt: 'The Morgan Stanley Wealth Management balanced growth portfolio of $55M is one of the family\'s core investment accounts. Managed under a discretionary advisory agreement, the multi-asset strategy provides broad market exposure with a moderate risk profile.',
        highlightedText: 'Morgan Stanley Wealth Management balanced growth portfolio',
    },

    // Foundation Endowment (thn-a34)
    {
        itemId: 'thn-a34',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 53,
        excerpt: 'The Foundation Endowment Fund is managed by Cambridge Associates under an Investment Policy Statement targeting 7% annual returns. The 5% annual distribution rate supports the Foundation\'s grant-making programs while preserving the real value of the endowment over time.',
        highlightedText: 'Foundation Endowment Fund is managed by Cambridge Associates',
    },

    // Foundation Art Collection (thn-a35)
    {
        itemId: 'thn-a35',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 17,
        excerpt: 'The Foundation Art Collection comprises 48 works on long-term loan to partner museums including the Whitney, MoMA, and the Guggenheim. The collection supports the Foundation\'s arts education mission and is managed under the Foundation\'s public programming initiative.',
        highlightedText: 'Foundation Art Collection comprises 48 works on long-term loan',
    },

    // Kusama Installation (thn-a36)
    {
        itemId: 'thn-a36',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 21,
        excerpt: 'Scheduled Personal Property — Fine Art: Yayoi Kusama "Aftermath of Obliteration of Eternity" (2009), site-specific installation. Insured value: $8,500,000. Special endorsement covers installation and de-installation at the Foundation gallery space.',
        highlightedText: 'Kusama "Aftermath of Obliteration of Eternity"',
    },

    // Bell 525 (thn-a37)
    {
        itemId: 'thn-a37',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 14,
        excerpt: 'The 2024 Bell 525 Relentless helicopter is based at East Hampton Airport and used primarily for commuting between NYC and the Hamptons Estate. Held by Thornton Aviation LLC. Annual operating cost approximately $1.9M including crew and maintenance.',
        highlightedText: 'Bell 525 Relentless helicopter is based at East Hampton Airport',
    },

    // Aviation Hull Insurance (thn-a38)
    {
        itemId: 'thn-a38',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 14,
        excerpt: 'Aviation insurance covers both the Gulfstream G700 and Bell 525 under a single Global Aerospace policy with combined hull coverage of $93M and $100M per-occurrence liability. Policy renewed annually through Willis Towers Watson\'s aviation practice.',
        highlightedText: 'Aviation insurance covers both the Gulfstream G700 and Bell 525',
    },

    // Sailing Yacht Aurora (thn-a39)
    {
        itemId: 'thn-a39',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 15,
        excerpt: 'Sailing Yacht Aurora, the 42-meter Perini Navi 2019, carries hull coverage of $32,000,000 through Pantaenius. The vessel is flagged in the Cayman Islands with home port in Antibes, France. Crew of 8 under maritime employment contracts.',
        highlightedText: 'Sailing Yacht Aurora, the 42-meter Perini Navi 2019, carries hull coverage',
    },

    // Tender Fleet (thn-a40)
    {
        itemId: 'thn-a40',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 16,
        excerpt: 'The tender fleet supports M/Y Sovereign and comprises two custom Novurania chase boats and one Williams jet tender. Total value: $1.2M. Maintained alongside the principal yachts by Fraser Yachts at an annual cost of $180,000.',
        highlightedText: 'tender fleet supports M/Y Sovereign',
    },

    // Sequoia Fund (thn-a41)
    {
        itemId: 'thn-a41',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 19,
        excerpt: 'The Sequoia Capital Global Growth Fund III commitment of $10M represents the family\'s largest venture capital position. Current NAV: $12.8M. The fund focuses on late-stage technology and healthcare companies with strong growth trajectories.',
        highlightedText: 'Sequoia Capital Global Growth Fund III commitment',
    },

    // Blackstone RE Fund (thn-a42)
    {
        itemId: 'thn-a42',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 19,
        excerpt: 'The Blackstone Real Estate Partners X commitment of $20M targets value-add and opportunistic real estate globally. Current NAV: $22.4M, reflecting a 1.4x multiple on called capital. Held through Thornton PE Aggregator LLC.',
        highlightedText: 'Blackstone Real Estate Partners X commitment of $20M',
    },

    // Oregon Vineyard (thn-a43)
    {
        itemId: 'thn-a43',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 13,
        excerpt: 'The Willamette Valley Vineyard in Dundee Hills AVA, Oregon, spans 320 acres with 180 under vine. Annual wine production: 15,000 cases of Pinot Noir and Chardonnay. The vineyard operates as a lifestyle asset with modest profitability from direct-to-consumer sales.',
        highlightedText: 'Willamette Valley Vineyard in Dundee Hills AVA',
    },

    // Crop Insurance (thn-a44)
    {
        itemId: 'thn-a44',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 13,
        excerpt: 'Federal crop insurance covers 12,000 acres of Iowa farmland at 85% of expected revenue. Insured crops: corn and soybeans. The annual premium of $420,000 is partially subsidized by the USDA. Policy managed through Rain and Hail Insurance Society.',
        highlightedText: 'Federal crop insurance covers 12,000 acres',
    },

    // Umbrella Liability (thn-a45)
    {
        itemId: 'thn-a45',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 17,
        excerpt: 'The AIG Personal Umbrella Liability policy provides excess coverage of $50M per occurrence and $100M aggregate. Coverage extends to all family members, properties, vehicles, watercraft, and aircraft, providing the last line of defense against catastrophic liability claims.',
        highlightedText: 'AIG Personal Umbrella Liability policy',
    },

    // Property & Casualty (thn-a46)
    {
        itemId: 'thn-a46',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 17,
        excerpt: 'The comprehensive property and casualty portfolio through Chubb and AIG provides $600M in total insured value across all Thornton real estate holdings. Coverage includes scheduled personal property for art, jewelry, and wine collections. Annual combined premium: $890,000.',
        highlightedText: 'property and casualty portfolio through Chubb and AIG',
    },

    // ─────────────────────────────────────────────
    // THIRD CITATIONS — key items
    // ─────────────────────────────────────────────

    // Edward Thornton III — 3rd source (already has 3, but this makes it more robust — skip)
    // Victoria Thornton (thn-p2) — 3rd
    {
        itemId: 'thn-p2',
        documentName: 'insurance-policies.pdf',
        documentLabel: 'Insurance Policies',
        page: 8,
        excerpt: 'Note: Victoria Thornton (née Harrison), former spouse of Edward Thornton III, is listed as the original beneficiary of the family\'s life insurance policies. Following her death on November 12, 2019, all beneficiary designations were updated to reflect the current trust structure.',
        highlightedText: 'Victoria Thornton (née Harrison), former spouse',
    },

    // Anastasia Thornton-Reeves (thn-p3) — 3rd
    {
        itemId: 'thn-p3',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 2,
        excerpt: 'Second Marriage: Anastasia Thornton-Reeves. Two children from this union: Natalie and Lucas. Anastasia serves as Co-Trustee of the RLT, beneficiary of the Marital Trust and SLAT, and President of the Thornton Foundation board.',
        highlightedText: 'Anastasia Thornton-Reeves. Two children from this union',
    },

    // Edward IV (thn-p4) — 3rd
    {
        itemId: 'thn-p4',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 46,
        excerpt: 'Edward Thornton IV shall serve as President of Thornton Real Estate Holdings LLC and General Partner of Thornton Capital Group LP. In his capacity as Successor Trustee, Edward IV shall assume all fiduciary responsibilities upon the Grantor\'s death or incapacity.',
        highlightedText: 'Edward Thornton IV shall serve as President',
    },

    // Dynasty Trust I (thn-t2) — 3rd
    {
        itemId: 'thn-t2',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 29,
        excerpt: 'Dynasty Trust I shall be divided into three equal subtrusts upon establishment: the Edward IV Subtrust, the Catherine Liu Subtrust, and the Benjamin Thornton Subtrust. Each subtrust is governed by the general distribution standards set forth in this Article, with individual variations as specified.',
        highlightedText: 'Dynasty Trust I shall be divided into three equal subtrusts',
    },

    // RLT (thn-t1) — 3rd
    {
        itemId: 'thn-t1',
        documentName: 'estate-planning-summary.pdf',
        documentLabel: 'Estate Planning Summary',
        page: 8,
        excerpt: 'The Thornton Family Revocable Living Trust serves as the cornerstone of the estate plan. Upon the Grantor\'s death, the RLT divides into the Marital Trust, Bypass Trust, and Children\'s Trust. Current assets held directly by the RLT: approximately $120M.',
        highlightedText: 'Thornton Family Revocable Living Trust serves as the cornerstone',
    },

    // Family Office LLC (thn-e1) — 3rd
    {
        itemId: 'thn-e1',
        documentName: 'family-trust-agreement.pdf',
        documentLabel: 'Family Trust Agreement',
        page: 46,
        excerpt: 'The Thornton Family Office LLC shall employ no fewer than ten (10) full-time professionals to manage the family\'s financial affairs, including investment management, tax compliance, legal oversight, insurance administration, and personal concierge services for family members.',
        highlightedText: 'Thornton Family Office LLC shall employ no fewer than ten',
    },

    // Thornton Foundation (thn-e12) — 3rd
    {
        itemId: 'thn-e12',
        documentName: 'inventory-list-2024.pdf',
        documentLabel: 'Inventory List 2026',
        page: 33,
        excerpt: 'Thornton Foundation — Asset Summary: Endowment Fund ($45M), Foundation Art Collection (48 works, insured at $18M), and program-related investments ($3.5M). Total foundation assets: $66,500,000. Annual grant disbursements: $2.5M across education, healthcare, and arts.',
        highlightedText: 'Thornton Foundation — Asset Summary',
    },

]

/**
 * Get citations for a specific catalog item, grouped by document.
 */
export function getCitationsForItem(itemId: string): Map<string, Citation[]> {
    const grouped = new Map<string, Citation[]>()
    for (const c of citations) {
        if (c.itemId !== itemId) continue
        const key = c.documentName
        if (!grouped.has(key)) grouped.set(key, [])
        grouped.get(key)!.push(c)
    }
    return grouped
}

/**
 * Get all document names that reference a given item.
 */
export function getSourceDocsForItem(itemId: string): string[] {
    const docs = new Set<string>()
    for (const c of citations) {
        if (c.itemId === itemId) docs.add(c.documentName)
    }
    return Array.from(docs)
}
