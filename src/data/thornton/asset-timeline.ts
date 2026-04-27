import type { AssetTimelineEvent } from '../types'

/**
 * Thornton Family — Asset Timeline Events
 *
 * Mix of past milestones and upcoming scheduled events.
 * Past = acquisitions, transfers, renovations, appraisals.
 * Future = renewals, reassessments, rebalancings, scheduled maintenance.
 */
export const thorntonAssetTimeline: AssetTimelineEvent[] = [
    // ── thn-a1 · Fifth Avenue Penthouse ($45M) — Real Estate ──
    {
        id: 'at-thn-a1-1',
        assetId: 'thn-a1',
        year: 2007,
        label: 'Acquired',
        value: 28_000_000,
        description:
            'Acquired at $28M. Titled to Thornton RE Holdings LLC.',
    },
    {
        id: 'at-thn-a1-2',
        assetId: 'thn-a1',
        year: 2018,
        label: 'Renovation Completed',
        value: 6_200_000,
        description:
            'Full interior renovation by Peter Marino Architect. $6.2M cost capitalized.',
    },
    {
        id: 'at-thn-a1-3',
        assetId: 'thn-a1',
        year: 2024,
        label: 'Appraised',
        value: 45_000_000,
        description:
            'Independent appraisal by Savills at $45M for estate planning purposes.',
    },
    {
        id: 'at-thn-a1-4',
        assetId: 'thn-a1',
        year: 2026,
        label: 'Tax Reassessment',
        description:
            'NYC Department of Finance triennial reassessment scheduled.',
    },
    {
        id: 'at-thn-a1-5',
        assetId: 'thn-a1',
        year: 2027,
        label: 'Insurance Renewal',
        description:
            'All-risk policy renewal. Current coverage: $50M replacement value. AIG underwriter.',
    },

    // ── thn-a2 · Hamptons Estate ($38M) — Real Estate ──
    {
        id: 'at-thn-a2-1',
        assetId: 'thn-a2',
        year: 2009,
        label: 'Acquired',
        value: 21_500_000,
        description:
            'Acquired at $21.5M. 8.5-acre oceanfront compound. Titled to RE Holdings LLC.',
    },
    {
        id: 'at-thn-a2-2',
        assetId: 'thn-a2',
        year: 2020,
        label: 'Pool House Addition',
        value: 2_800_000,
        description:
            'New pool house and guest cottage constructed. $2.8M cost capitalized.',
    },
    {
        id: 'at-thn-a2-3',
        assetId: 'thn-a2',
        year: 2024,
        label: 'Appraised',
        value: 38_000_000,
        description:
            'Appraisal at $38M per comparable sales in East Hampton.',
    },
    {
        id: 'at-thn-a2-4',
        assetId: 'thn-a2',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Annual insurance renewal. Coverage: $42M replacement value. Chubb Personal Risk Services.',
    },

    // ── thn-a5 · London Mayfair Flat ($23M) — Real Estate ──
    {
        id: 'at-thn-a5-1',
        assetId: 'thn-a5',
        year: 2012,
        label: 'Acquired',
        value: 14_500_000,
        description:
            'Acquired at GBP 9.2M. Titled to London Mayfair Properties Ltd, a subsidiary of RE Holdings.',
    },
    {
        id: 'at-thn-a5-2',
        assetId: 'thn-a5',
        year: 2019,
        label: 'Appraised',
        value: 19_800_000,
        description:
            'Valuation by Knight Frank at $19.8M for refinancing purposes.',
    },
    {
        id: 'at-thn-a5-3',
        assetId: 'thn-a5',
        year: 2025,
        label: 'Appraised',
        value: 23_000_000,
        description:
            'Updated valuation per Savills Prime Central London index.',
    },
    {
        id: 'at-thn-a5-4',
        assetId: 'thn-a5',
        year: 2027,
        label: 'Tax Reassessment',
        description:
            'UK Council Tax revaluation scheduled for Westminster borough.',
    },

    // ── thn-a7 · Montana Ranch ($22M) — Real Estate ──
    {
        id: 'at-thn-a7-1',
        assetId: 'thn-a7',
        year: 2014,
        label: 'Acquired',
        value: 12_000_000,
        description:
            'Acquired at $12M. 2,400 acres in Park County, MT. Titled to RE Holdings LLC.',
    },
    {
        id: 'at-thn-a7-2',
        assetId: 'thn-a7',
        year: 2022,
        label: 'Equestrian Facility Built',
        value: 3_500_000,
        description:
            'Equestrian center and barn complex completed. $3.5M cost capitalized.',
    },
    {
        id: 'at-thn-a7-3',
        assetId: 'thn-a7',
        year: 2025,
        label: 'Appraised',
        value: 22_000_000,
        description:
            'Market value per recent ranch sales in Big Sky area.',
    },
    {
        id: 'at-thn-a7-4',
        assetId: 'thn-a7',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Annual property and ranch liability renewal. Current coverage: $25M replacement value.',
    },

    // ── thn-a8 · Fifth Avenue Commercial Building ($280M) — Real Estate ──
    {
        id: 'at-thn-a8-1',
        assetId: 'thn-a8',
        year: 2005,
        label: 'Acquired',
        value: 165_000_000,
        description:
            'Acquired at $165M. 42-story Class A office tower near Bryant Park. Titled to RE Holdings LLC.',
    },
    {
        id: 'at-thn-a8-2',
        assetId: 'thn-a8',
        year: 2017,
        label: 'Lobby Renovation',
        value: 12_000_000,
        description:
            'Full lobby and common area renovation. $12M cost capitalized. LEED Gold certification achieved.',
    },
    {
        id: 'at-thn-a8-3',
        assetId: 'thn-a8',
        year: 2024,
        label: 'Appraised',
        value: 280_000_000,
        description:
            'CBRE income capitalization analysis at $280M. 94% occupancy, ~$18M NOI.',
    },
    {
        id: 'at-thn-a8-4',
        assetId: 'thn-a8',
        year: 2026,
        label: 'Tax Reassessment',
        description:
            'NYC Department of Finance annual assessment scheduled.',
    },
    {
        id: 'at-thn-a8-5',
        assetId: 'thn-a8',
        year: 2028,
        label: 'Lease Expiration',
        description:
            'Anchor tenant lease (floors 18-28) expires. Renewal negotiations to begin Q1 2027.',
    },

    // ── thn-a25 · Gulfstream G700 ($75M) — Aircraft ──
    {
        id: 'at-thn-a25-1',
        assetId: 'thn-a25',
        year: 2023,
        label: 'Acquired',
        value: 75_000_000,
        description:
            'Acquired at $75M. Registration N-THN7. Titled to Thornton Aviation LLC.',
    },
    {
        id: 'at-thn-a25-2',
        assetId: 'thn-a25',
        year: 2023,
        label: 'FAA Registration',
        description:
            'FAA registration completed. Based at Teterboro Airport (TEB).',
    },
    {
        id: 'at-thn-a25-3',
        assetId: 'thn-a25',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Hull and liability renewal due. Current coverage: $78M. AIG Aviation underwriter.',
    },
    {
        id: 'at-thn-a25-4',
        assetId: 'thn-a25',
        year: 2027,
        label: 'Scheduled Maintenance',
        description:
            '48-month major inspection per Gulfstream maintenance program. Estimated 3-week downtime.',
    },

    // ── thn-a26 · Motor Yacht Sovereign ($120M) — Maritime ──
    {
        id: 'at-thn-a26-1',
        assetId: 'thn-a26',
        year: 2021,
        label: 'Acquired',
        value: 110_000_000,
        description:
            'Acquired at $110M. 65-meter Lurssen. Titled to Thornton Maritime LLC.',
    },
    {
        id: 'at-thn-a26-2',
        assetId: 'thn-a26',
        year: 2021,
        label: 'Flag Registration',
        description:
            'Cayman Islands flag registration completed. IMO compliance certified.',
    },
    {
        id: 'at-thn-a26-3',
        assetId: 'thn-a26',
        year: 2025,
        label: 'Appraised',
        value: 120_000_000,
        description:
            'Broker market opinion by Fraser Yachts at $120M.',
    },
    {
        id: 'at-thn-a26-4',
        assetId: 'thn-a26',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Hull and machinery renewal due. Current coverage: $125M. Pantaenius Marine.',
    },
    {
        id: 'at-thn-a26-5',
        assetId: 'thn-a26',
        year: 2027,
        label: 'Scheduled Drydock',
        description:
            '5-year classification survey and drydock per Lloyds Register. Estimated 6-week yard period.',
    },

    // ── thn-a27 · Warhol Portfolio ($28M) — Art ──
    {
        id: 'at-thn-a27-1',
        assetId: 'thn-a27',
        year: 2010,
        label: 'Acquired',
        value: 16_000_000,
        description:
            'Acquired at auction and private sale for $16M. 12 works. Titled to Thornton Art Fund LLC.',
    },
    {
        id: 'at-thn-a27-2',
        assetId: 'thn-a27',
        year: 2024,
        label: 'Appraised',
        value: 28_000_000,
        description:
            'Updated valuation at $28M per Christie\'s advisory report.',
    },
    {
        id: 'at-thn-a27-3',
        assetId: 'thn-a27',
        year: 2027,
        label: 'Reappraisal Due',
        description:
            'Triennial reappraisal scheduled per insurance policy terms. Christie\'s advisory.',
    },
    {
        id: 'at-thn-a27-4',
        assetId: 'thn-a27',
        year: 2027,
        label: 'Insurance Renewal',
        description:
            'Fine art policy renewal. Current schedule: $28M aggregate. AXA XL underwriter.',
    },

    // ── thn-a28 · Basquiat Collection ($42M) — Art ──
    {
        id: 'at-thn-a28-1',
        assetId: 'thn-a28',
        year: 2013,
        label: 'Acquired',
        value: 22_000_000,
        description:
            'Acquired at auction for $22M. 4 works including "Untitled" (1982). Titled to Art Fund LLC.',
    },
    {
        id: 'at-thn-a28-2',
        assetId: 'thn-a28',
        year: 2019,
        label: 'Transferred to Art Fund',
        description:
            'Transferred from personal ownership to Thornton Art Fund LLC for liability protection.',
    },
    {
        id: 'at-thn-a28-3',
        assetId: 'thn-a28',
        year: 2024,
        label: 'Appraised',
        value: 42_000_000,
        description:
            'Valuation at $42M by Sotheby\'s advisory services.',
    },
    {
        id: 'at-thn-a28-4',
        assetId: 'thn-a28',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Fine art policy renewal. Current schedule: $42M aggregate. AXA XL underwriter.',
    },

    // ── thn-a15 · KKR North America Fund XII ($18.2M) — PE Fund ──
    {
        id: 'at-thn-a15-1',
        assetId: 'thn-a15',
        year: 2020,
        label: 'Committed',
        value: 15_000_000,
        description:
            '$15M capital commitment. Vintage 2020. Mid-market leveraged buyout strategy.',
    },
    {
        id: 'at-thn-a15-2',
        assetId: 'thn-a15',
        year: 2023,
        label: 'Capital Called',
        value: 12_500_000,
        description:
            'Cumulative capital called: $12.5M of $15M commitment. $2.5M remaining uncalled.',
    },
    {
        id: 'at-thn-a15-3',
        assetId: 'thn-a15',
        year: 2025,
        label: 'NAV Statement',
        value: 18_200_000,
        description:
            'Q4 2024 NAV: $18.2M. MOIC 1.46x. Distributions to date: $3.1M.',
    },
    {
        id: 'at-thn-a15-4',
        assetId: 'thn-a15',
        year: 2027,
        label: 'Distribution Scheduled',
        description:
            'Fund entering harvest period. Material distributions expected as portfolio companies exit.',
    },

    // ── thn-a9 · Iowa Farmland ($180M) — Real Estate ──
    {
        id: 'at-thn-a9-1',
        assetId: 'thn-a9',
        year: 2008,
        label: 'Acquired',
        value: 96_000_000,
        description:
            'Acquired at $8,000/acre. 12,000 acres in Story & Boone Counties, IA. Titled to Agriculture LP.',
    },
    {
        id: 'at-thn-a9-2',
        assetId: 'thn-a9',
        year: 2018,
        label: 'Appraised',
        value: 144_000_000,
        description:
            'Appraised at $12,000/acre by Peoples Company for lending purposes.',
    },
    {
        id: 'at-thn-a9-3',
        assetId: 'thn-a9',
        year: 2025,
        label: 'Appraised',
        value: 180_000_000,
        description:
            'Estimated at $15,000/acre per Iowa Land Value Survey.',
    },
    {
        id: 'at-thn-a9-4',
        assetId: 'thn-a9',
        year: 2026,
        label: 'Tax Reassessment',
        description:
            'Biennial Iowa county assessor reassessment for Story and Boone Counties.',
    },

    // ── thn-a10 · JPMorgan Private Bank ($85M) — Investment ──
    {
        id: 'at-thn-a10-1',
        assetId: 'thn-a10',
        year: 2018,
        label: 'Account Opened',
        value: 60_000_000,
        description:
            'Discretionary advisory account funded at $60M. Multi-asset strategy.',
    },
    {
        id: 'at-thn-a10-2',
        assetId: 'thn-a10',
        year: 2022,
        label: 'Rebalanced',
        value: 72_000_000,
        description:
            'Rebalanced to 55/30/15 equity/fixed income/alternatives. Portfolio at $72M.',
    },
    {
        id: 'at-thn-a10-3',
        assetId: 'thn-a10',
        year: 2025,
        label: 'Statement',
        value: 85_000_000,
        description:
            'Q4 2024 account balance: $85M.',
    },
    {
        id: 'at-thn-a10-4',
        assetId: 'thn-a10',
        year: 2026,
        label: 'Rebalancing Due',
        description:
            'Scheduled rebalancing per investment policy statement. Annual review with JPM advisory team.',
    },

    // ── thn-a29 · Ferrari Collection ($62M) — Vehicle ──
    {
        id: 'at-thn-a29-1',
        assetId: 'thn-a29',
        year: 2011,
        label: 'Collection Assembled',
        value: 38_000_000,
        description:
            '6 vehicles acquired over multiple transactions for $38M aggregate. Titled to Capital Group LP.',
    },
    {
        id: 'at-thn-a29-2',
        assetId: 'thn-a29',
        year: 2020,
        label: 'Appraised',
        value: 52_000_000,
        description:
            'Hagerty valuation services appraisal at $52M for insurance scheduling.',
    },
    {
        id: 'at-thn-a29-3',
        assetId: 'thn-a29',
        year: 2024,
        label: 'Appraised',
        value: 62_000_000,
        description:
            'Updated Hagerty valuation at $62M. 250 GTO now $48M standalone.',
    },
    {
        id: 'at-thn-a29-4',
        assetId: 'thn-a29',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Agreed-value coverage renewal. Current schedule: $65M. Chubb Collector Car policy.',
    },
    {
        id: 'at-thn-a29-5',
        assetId: 'thn-a29',
        year: 2027,
        label: 'Scheduled Maintenance',
        description:
            '250 GTO biennial service at Ferrari Classiche. Certification inspection required.',
    },

    // ── thn-a11 · Goldman Sachs Wealth Management ($62M) — Investment ──
    {
        id: 'at-thn-a11-1',
        assetId: 'thn-a11',
        year: 2016,
        label: 'Account Opened',
        value: 40_000_000,
        description:
            'Growth equity strategy funded at $40M. Concentrated sector focus.',
    },
    {
        id: 'at-thn-a11-2',
        assetId: 'thn-a11',
        year: 2021,
        label: 'Rebalanced',
        value: 55_000_000,
        description:
            'Rebalanced to concentrated large-cap growth. Technology and healthcare overweight.',
    },
    {
        id: 'at-thn-a11-3',
        assetId: 'thn-a11',
        year: 2025,
        label: 'Statement',
        value: 62_000_000,
        description:
            'Q4 2024 account balance: $62M.',
    },
    {
        id: 'at-thn-a11-4',
        assetId: 'thn-a11',
        year: 2026,
        label: 'Rebalancing Due',
        description:
            'Scheduled rebalancing per investment policy statement. Annual review with GS advisory team.',
    },

    // ── thn-a13 · Vanguard Index Portfolio ($38M) — Investment ──
    {
        id: 'at-thn-a13-1',
        assetId: 'thn-a13',
        year: 2015,
        label: 'Account Opened',
        value: 25_000_000,
        description:
            'Passive index portfolio funded at $25M. 50/30/20 allocation. Held in RLT.',
    },
    {
        id: 'at-thn-a13-2',
        assetId: 'thn-a13',
        year: 2022,
        label: 'Transferred to RLT',
        description:
            'Transferred from personal ownership to Revocable Living Trust per estate plan update.',
    },
    {
        id: 'at-thn-a13-3',
        assetId: 'thn-a13',
        year: 2025,
        label: 'Statement',
        value: 38_000_000,
        description:
            'Q4 2024 account balance: $38M. Expense ratio 0.04%.',
    },
    {
        id: 'at-thn-a13-4',
        assetId: 'thn-a13',
        year: 2026,
        label: 'Rebalancing Due',
        description:
            'Annual rebalance to target 50/30/20 allocation. No additional contributions planned.',
    },

    // ── thn-a12 · BlackRock Fixed Income Portfolio ($45M) — Investment ──
    {
        id: 'at-thn-a12-1',
        assetId: 'thn-a12',
        year: 2017,
        label: 'Account Opened',
        value: 35_000_000,
        description:
            'Fixed income portfolio funded at $35M in Dynasty Trust I. Investment-grade focus.',
    },
    {
        id: 'at-thn-a12-2',
        assetId: 'thn-a12',
        year: 2023,
        label: 'Additional Contribution',
        value: 42_000_000,
        description:
            'Additional $7M contribution during rate environment shift. Portfolio at $42M.',
    },
    {
        id: 'at-thn-a12-3',
        assetId: 'thn-a12',
        year: 2025,
        label: 'Statement',
        value: 45_000_000,
        description:
            'Q4 2024 balance: $45M. Duration 6.2yr, YTM 4.8%.',
    },
    {
        id: 'at-thn-a12-4',
        assetId: 'thn-a12',
        year: 2027,
        label: 'Distribution Scheduled',
        description:
            'Scheduled income distribution to Dynasty Trust I beneficiaries per trust instrument.',
    },

    // ── thn-a30 · Bitcoin & Digital Assets ($15M) — Cryptocurrency ──
    {
        id: 'at-thn-a30-1',
        assetId: 'thn-a30',
        year: 2020,
        label: 'Custody Opened',
        value: 5_000_000,
        description:
            'Custody account opened at Fidelity Digital Assets. Initial $5M allocation in Dynasty Trust II.',
    },
    {
        id: 'at-thn-a30-2',
        assetId: 'thn-a30',
        year: 2022,
        label: 'Additional Purchase',
        value: 8_500_000,
        description:
            'Additional BTC and ETH purchased. Total cost basis $8.5M. 150 BTC, 500 ETH.',
    },
    {
        id: 'at-thn-a30-3',
        assetId: 'thn-a30',
        year: 2025,
        label: 'Statement',
        value: 15_000_000,
        description:
            'Current holdings: 150 BTC, 500 ETH. Market value $15M.',
    },
    {
        id: 'at-thn-a30-4',
        assetId: 'thn-a30',
        year: 2026,
        label: 'Rebalancing Due',
        description:
            'Scheduled portfolio review per digital asset allocation policy. Custody security audit.',
    },

    // ── thn-a24 · Life Insurance — Northwestern Mutual $25M — Insurance ──
    {
        id: 'at-thn-a24-1',
        assetId: 'thn-a24',
        year: 2015,
        label: 'Policy Issued',
        value: 25_000_000,
        description:
            'Survivorship whole life policy issued. Policy No. NM-2015-THN-001. Face value $25M. ILIT is owner.',
    },
    {
        id: 'at-thn-a24-2',
        assetId: 'thn-a24',
        year: 2019,
        label: 'Beneficiary Updated',
        description:
            'Beneficiary designation updated per trust amendment. ILIT remains owner and beneficiary.',
    },
    {
        id: 'at-thn-a24-3',
        assetId: 'thn-a24',
        year: 2025,
        label: 'Premium Adjusted',
        description:
            'Annual premium adjusted to $285,000. Cash surrender value reviewed.',
    },
    {
        id: 'at-thn-a24-4',
        assetId: 'thn-a24',
        year: 2026,
        label: 'Premium Due',
        description:
            'Annual premium of $285,000 due. Crummey notice to be issued to ILIT beneficiaries.',
    },
    {
        id: 'at-thn-a24-5',
        assetId: 'thn-a24',
        year: 2027,
        label: 'Coverage Review',
        description:
            'Policy performance review scheduled with Northwestern Mutual. Cash value vs. projections.',
    },

    // ── thn-a31 · SLAT Investment Portfolio ($30M) — Investment ──
    {
        id: 'at-thn-a31-1',
        assetId: 'thn-a31',
        year: 2021,
        label: 'Funded',
        value: 30_000_000,
        description:
            'SLAT funded at $30M upon establishment. Goldman Sachs Private Wealth Management.',
    },
    {
        id: 'at-thn-a31-2',
        assetId: 'thn-a31',
        year: 2023,
        label: 'Rebalanced',
        value: 28_500_000,
        description:
            'Rebalanced to diversified allocation. Income distributed to Anastasia as beneficiary.',
    },
    {
        id: 'at-thn-a31-3',
        assetId: 'thn-a31',
        year: 2025,
        label: 'Statement',
        value: 30_000_000,
        description:
            'Q4 2024 balance: $30M. Annual income distributions ongoing.',
    },
    {
        id: 'at-thn-a31-4',
        assetId: 'thn-a31',
        year: 2026,
        label: 'Distribution Scheduled',
        description:
            'Annual income distribution to Anastasia per SLAT terms. Amount based on portfolio yield.',
    },

    // ── thn-a32 · CRT Unitrust Fund ($15M) — Investment ──
    {
        id: 'at-thn-a32-1',
        assetId: 'thn-a32',
        year: 2018,
        label: 'Funded',
        value: 18_000_000,
        description:
            'CRUT funded at $18M. 5% annual unitrust payout to Edward and Anastasia.',
    },
    {
        id: 'at-thn-a32-2',
        assetId: 'thn-a32',
        year: 2023,
        label: 'Rebalanced',
        value: 16_200_000,
        description:
            'Portfolio rebalanced after cumulative unitrust distributions. Balance at $16.2M.',
    },
    {
        id: 'at-thn-a32-3',
        assetId: 'thn-a32',
        year: 2025,
        label: 'Statement',
        value: 15_000_000,
        description:
            'Q4 2024 balance: $15M. Net of cumulative 5% annual distributions.',
    },
    {
        id: 'at-thn-a32-4',
        assetId: 'thn-a32',
        year: 2026,
        label: 'Distribution Scheduled',
        description:
            'Annual 5% unitrust distribution due. Estimated $750K based on Jan 1 valuation.',
    },

    // ── thn-a33 · Morgan Stanley Wealth Management ($55M) — Investment ──
    {
        id: 'at-thn-a33-1',
        assetId: 'thn-a33',
        year: 2019,
        label: 'Account Opened',
        value: 40_000_000,
        description:
            'Tax-managed equity strategy funded at $40M. Overseen by Martha Okafor.',
    },
    {
        id: 'at-thn-a33-2',
        assetId: 'thn-a33',
        year: 2023,
        label: 'Rebalanced',
        value: 50_000_000,
        description:
            'Rebalanced to concentrated large-cap growth. Tax-loss harvesting executed.',
    },
    {
        id: 'at-thn-a33-3',
        assetId: 'thn-a33',
        year: 2025,
        label: 'Statement',
        value: 55_000_000,
        description:
            'Q4 2024 account balance: $55M.',
    },
    {
        id: 'at-thn-a33-4',
        assetId: 'thn-a33',
        year: 2026,
        label: 'Rebalancing Due',
        description:
            'Scheduled rebalancing per investment policy statement. Tax-loss harvesting review.',
    },

    // ── thn-a34 · Foundation Endowment ($45M) — Investment ──
    {
        id: 'at-thn-a34-1',
        assetId: 'thn-a34',
        year: 2010,
        label: 'Established',
        value: 30_000_000,
        description:
            'Endowment established with initial funding of $30M. 60/40 portfolio allocation.',
    },
    {
        id: 'at-thn-a34-2',
        assetId: 'thn-a34',
        year: 2016,
        label: 'Additional Contribution',
        value: 38_000_000,
        description:
            'Additional $5M contribution. Endowment at $38M after market appreciation.',
    },
    {
        id: 'at-thn-a34-3',
        assetId: 'thn-a34',
        year: 2025,
        label: 'Statement',
        value: 45_000_000,
        description:
            'Q4 2024 balance: $45M. 5% annual distribution for grants.',
    },
    {
        id: 'at-thn-a34-4',
        assetId: 'thn-a34',
        year: 2026,
        label: 'Distribution Scheduled',
        description:
            'Annual 5% grant distribution due. Estimated $2.25M for arts, education, and healthcare grants.',
    },

    // ── thn-a35 · Foundation Art Collection ($12M) — Art ──
    {
        id: 'at-thn-a35-1',
        assetId: 'thn-a35',
        year: 2010,
        label: 'Collection Established',
        value: 7_500_000,
        description:
            'Permanent collection assembled from donations and purchases. 85 works. Held by Thornton Foundation.',
    },
    {
        id: 'at-thn-a35-2',
        assetId: 'thn-a35',
        year: 2021,
        label: 'Appraised',
        value: 11_000_000,
        description:
            'Independent appraisal at $11M for IRS Form 990 reporting.',
    },
    {
        id: 'at-thn-a35-3',
        assetId: 'thn-a35',
        year: 2025,
        label: 'Appraised',
        value: 12_000_000,
        description:
            'Updated valuation at $12M for financial statement purposes.',
    },
    {
        id: 'at-thn-a35-4',
        assetId: 'thn-a35',
        year: 2026,
        label: 'Exhibition Loan',
        description:
            'Long-term loan to Whitney Museum up for renewal. Loan agreement review scheduled.',
    },
    {
        id: 'at-thn-a35-5',
        assetId: 'thn-a35',
        year: 2028,
        label: 'Reappraisal Due',
        description:
            'Triennial reappraisal required for IRS Form 990 and insurance scheduling.',
    },

    // ── thn-a36 · Kusama Infinity Room Installation ($18M) — Art ──
    {
        id: 'at-thn-a36-1',
        assetId: 'thn-a36',
        year: 2023,
        label: 'Acquired',
        value: 16_500_000,
        description:
            'Acquired at Phillips auction for $16.5M. Titled to Thornton Art Fund LLC.',
    },
    {
        id: 'at-thn-a36-2',
        assetId: 'thn-a36',
        year: 2024,
        label: 'Appraised',
        value: 18_000_000,
        description:
            'Post-acquisition appraisal at $18M. Scheduled on fine art policy.',
    },
    {
        id: 'at-thn-a36-3',
        assetId: 'thn-a36',
        year: 2026,
        label: 'Reappraisal Due',
        description:
            'Biennial reappraisal per insurance policy terms. Dealer advisory from Gagosian.',
    },
    {
        id: 'at-thn-a36-4',
        assetId: 'thn-a36',
        year: 2027,
        label: 'Insurance Renewal',
        description:
            'Fine art policy renewal. Current schedule: $18M. AXA XL underwriter.',
    },

    // ── thn-a37 · Bell 525 Relentless Helicopter ($18M) — Aircraft ──
    {
        id: 'at-thn-a37-1',
        assetId: 'thn-a37',
        year: 2024,
        label: 'Acquired',
        value: 18_000_000,
        description:
            'Acquired at $18M. Registration N-THN5. Titled to Thornton Aviation LLC.',
    },
    {
        id: 'at-thn-a37-2',
        assetId: 'thn-a37',
        year: 2024,
        label: 'FAA Registration',
        description:
            'FAA registration completed. Based at East Hampton Airport (HTO).',
    },
    {
        id: 'at-thn-a37-3',
        assetId: 'thn-a37',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Hull and liability renewal due. Current coverage: $19M. AIG Aviation underwriter.',
    },
    {
        id: 'at-thn-a37-4',
        assetId: 'thn-a37',
        year: 2027,
        label: 'Registration Renewal',
        description:
            'FAA registration renewal due. Triennial re-registration per 14 CFR 47.40.',
    },

    // ── thn-a38 · Aviation Hull & Liability Policy ($95M) — Insurance ──
    {
        id: 'at-thn-a38-1',
        assetId: 'thn-a38',
        year: 2023,
        label: 'Policy Issued',
        value: 78_000_000,
        description:
            'Combined hull and liability policy issued at $78M. AIG Aviation. Coverage for G700.',
    },
    {
        id: 'at-thn-a38-2',
        assetId: 'thn-a38',
        year: 2024,
        label: 'Coverage Expanded',
        value: 95_000_000,
        description:
            'Coverage expanded to $95M to include Bell 525. Annual premium $1.2M.',
    },
    {
        id: 'at-thn-a38-3',
        assetId: 'thn-a38',
        year: 2026,
        label: 'Premium Due',
        description:
            'Annual premium of $1.2M due. Renewal terms from AIG Aviation expected Q3.',
    },
    {
        id: 'at-thn-a38-4',
        assetId: 'thn-a38',
        year: 2026,
        label: 'Coverage Review',
        description:
            'Annual review of hull values and liability limits. Adjust for depreciation and market conditions.',
    },

    // ── thn-a39 · Sailing Yacht Aurora ($32M) — Maritime ──
    {
        id: 'at-thn-a39-1',
        assetId: 'thn-a39',
        year: 2019,
        label: 'Acquired',
        value: 28_000_000,
        description:
            'Acquired at $28M. 42-meter Perini Navi. Titled to Thornton Maritime LLC.',
    },
    {
        id: 'at-thn-a39-2',
        assetId: 'thn-a39',
        year: 2022,
        label: 'Refit Completed',
        value: 3_200_000,
        description:
            'Interior refit and systems upgrade. $3.2M cost capitalized. Mediterranean charter-ready.',
    },
    {
        id: 'at-thn-a39-3',
        assetId: 'thn-a39',
        year: 2025,
        label: 'Appraised',
        value: 32_000_000,
        description:
            'Broker market opinion by Burgess Yachts at $32M.',
    },
    {
        id: 'at-thn-a39-4',
        assetId: 'thn-a39',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Hull and machinery renewal due. Current coverage: $30M. Pantaenius Marine.',
    },
    {
        id: 'at-thn-a39-5',
        assetId: 'thn-a39',
        year: 2027,
        label: 'Registration Renewal',
        description:
            'Flag state registration renewal due. Annual safety inspection required.',
    },

    // ── thn-a40 · Tender & Watercraft Fleet ($4.5M) — Maritime ──
    {
        id: 'at-thn-a40-1',
        assetId: 'thn-a40',
        year: 2021,
        label: 'Acquired',
        value: 3_800_000,
        description:
            'Fleet acquired for $3.8M: 3 tenders, 2 jet skis, 1 Riva speedboat. Titled to Maritime LLC.',
    },
    {
        id: 'at-thn-a40-2',
        assetId: 'thn-a40',
        year: 2024,
        label: 'Appraised',
        value: 4_500_000,
        description:
            'Aggregate fleet value at $4.5M per marine surveyor report.',
    },
    {
        id: 'at-thn-a40-3',
        assetId: 'thn-a40',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Blanket watercraft coverage renewal. Current schedule: $4.5M. Chubb Marine.',
    },

    // ── thn-a41 · Sequoia Capital Fund XV ($12M) — PE Fund ──
    {
        id: 'at-thn-a41-1',
        assetId: 'thn-a41',
        year: 2022,
        label: 'Committed',
        value: 10_000_000,
        description:
            '$10M capital commitment. Vintage 2022. Global growth-stage technology focus.',
    },
    {
        id: 'at-thn-a41-2',
        assetId: 'thn-a41',
        year: 2024,
        label: 'Capital Called',
        value: 8_000_000,
        description:
            'Cumulative capital called: $8M of $10M commitment. $2M remaining uncalled.',
    },
    {
        id: 'at-thn-a41-3',
        assetId: 'thn-a41',
        year: 2025,
        label: 'NAV Statement',
        value: 12_000_000,
        description:
            'Q4 2024 NAV: $12M. MOIC 1.50x.',
    },
    {
        id: 'at-thn-a41-4',
        assetId: 'thn-a41',
        year: 2026,
        label: 'Capital Call Expected',
        description:
            'Remaining $2M of commitment expected to be called. Fund nearing fully invested status.',
    },

    // ── thn-a42 · Blackstone Real Estate Fund IX ($22M) — PE Fund ──
    {
        id: 'at-thn-a42-1',
        assetId: 'thn-a42',
        year: 2021,
        label: 'Committed',
        value: 20_000_000,
        description:
            '$20M capital commitment. Vintage 2021. Global opportunistic real estate.',
    },
    {
        id: 'at-thn-a42-2',
        assetId: 'thn-a42',
        year: 2023,
        label: 'Capital Called',
        value: 17_000_000,
        description:
            'Cumulative capital called: $17M of $20M commitment. $3M remaining uncalled.',
    },
    {
        id: 'at-thn-a42-3',
        assetId: 'thn-a42',
        year: 2025,
        label: 'NAV Statement',
        value: 22_000_000,
        description:
            'Q4 2024 NAV: $22M. MOIC 1.29x.',
    },
    {
        id: 'at-thn-a42-4',
        assetId: 'thn-a42',
        year: 2027,
        label: 'Distribution Scheduled',
        description:
            'Fund entering disposition phase. First material distributions expected from asset sales.',
    },

    // ── thn-a43 · Oregon Vineyard Estate ($28M) — Real Estate ──
    {
        id: 'at-thn-a43-1',
        assetId: 'thn-a43',
        year: 2016,
        label: 'Acquired',
        value: 18_000_000,
        description:
            'Acquired at $18M. 450 acres in Dundee Hills, Yamhill County, OR. Titled to Agriculture LP.',
    },
    {
        id: 'at-thn-a43-2',
        assetId: 'thn-a43',
        year: 2021,
        label: 'Winery Expansion',
        value: 4_500_000,
        description:
            'Production facility expanded. $4.5M cost capitalized. Capacity increased to 15,000 cases.',
    },
    {
        id: 'at-thn-a43-3',
        assetId: 'thn-a43',
        year: 2025,
        label: 'Appraised',
        value: 28_000_000,
        description:
            'Market value per Yamhill County comparable sales at $28M.',
    },
    {
        id: 'at-thn-a43-4',
        assetId: 'thn-a43',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Winery and vineyard property coverage renewal. Includes crop, equipment, and structure coverage.',
    },

    // ── thn-a44 · Crop & Agricultural Insurance ($8M) — Insurance ──
    {
        id: 'at-thn-a44-1',
        assetId: 'thn-a44',
        year: 2008,
        label: 'Policy Issued',
        value: 4_000_000,
        description:
            'Multi-peril crop insurance issued upon Iowa farmland acquisition. Federal crop insurance program.',
    },
    {
        id: 'at-thn-a44-2',
        assetId: 'thn-a44',
        year: 2016,
        label: 'Coverage Expanded',
        value: 6_500_000,
        description:
            'Coverage expanded to $6.5M to include Oregon vineyard. Federal and commercial hail added.',
    },
    {
        id: 'at-thn-a44-3',
        assetId: 'thn-a44',
        year: 2024,
        label: 'Premium Adjusted',
        description:
            'Annual premium adjusted for current acreage and commodity prices.',
    },
    {
        id: 'at-thn-a44-4',
        assetId: 'thn-a44',
        year: 2026,
        label: 'Premium Due',
        description:
            'Annual crop insurance premium due. Coverage election deadline for planting season.',
    },
    {
        id: 'at-thn-a44-5',
        assetId: 'thn-a44',
        year: 2027,
        label: 'Coverage Review',
        description:
            'Comprehensive review of insured acreage and coverage levels vs. commodity prices.',
    },

    // ── thn-a47 · Jewelry Collection ($8.5M) — Art & Collectibles ──
    {
        id: 'at-thn-a47-1',
        assetId: 'thn-a47',
        year: 2008,
        label: 'Collection Assembled',
        value: 5_200_000,
        description:
            'Assembled from estate sales and private purchases for $5.2M. Titled to Capital Group LP.',
    },
    {
        id: 'at-thn-a47-2',
        assetId: 'thn-a47',
        year: 2022,
        label: 'Appraised',
        value: 8_000_000,
        description:
            'GIA appraisal at $8M for insurance scheduling. 12.5ct Burmese ruby at $2.8M.',
    },
    {
        id: 'at-thn-a47-3',
        assetId: 'thn-a47',
        year: 2025,
        label: 'Appraised',
        value: 8_500_000,
        description:
            'Updated valuation at $8.5M per scheduled personal property rider.',
    },
    {
        id: 'at-thn-a47-4',
        assetId: 'thn-a47',
        year: 2027,
        label: 'Insurance Renewal',
        description:
            'Scheduled personal property rider renewal. Reappraisal required by Chubb underwriting.',
    },

    // ── thn-a48 · Watch Collection ($4.2M) — Art & Collectibles ──
    {
        id: 'at-thn-a48-1',
        assetId: 'thn-a48',
        year: 2012,
        label: 'Collection Assembled',
        value: 2_400_000,
        description:
            'Assembled from dealers and auction houses for $2.4M. 18 timepieces.',
    },
    {
        id: 'at-thn-a48-2',
        assetId: 'thn-a48',
        year: 2023,
        label: 'Appraised',
        value: 4_000_000,
        description:
            'Independent appraisal at $4M by Hodinkee for insurance purposes.',
    },
    {
        id: 'at-thn-a48-3',
        assetId: 'thn-a48',
        year: 2025,
        label: 'Appraised',
        value: 4_200_000,
        description:
            'Updated valuation at $4.2M per Chubb scheduled items rider.',
    },
    {
        id: 'at-thn-a48-4',
        assetId: 'thn-a48',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Chubb valuable articles policy renewal. Reappraisal of Patek and Rolex pieces required.',
    },

    // ── thn-a49 · Wine Cellar Collection ($3.8M) — Art & Collectibles ──
    {
        id: 'at-thn-a49-1',
        assetId: 'thn-a49',
        year: 2010,
        label: 'Cellar Established',
        value: 1_800_000,
        description:
            'Initial cellar established at $1.8M. 4,200 bottles across Fifth Avenue and Hamptons.',
    },
    {
        id: 'at-thn-a49-2',
        assetId: 'thn-a49',
        year: 2023,
        label: 'Appraised',
        value: 3_600_000,
        description:
            'Wine cellar inventory appraised at $3.6M by Acker Merrall & Condit.',
    },
    {
        id: 'at-thn-a49-3',
        assetId: 'thn-a49',
        year: 2025,
        label: 'Appraised',
        value: 3_800_000,
        description:
            'Current aggregate value at $3.8M per cellar management platform.',
    },
    {
        id: 'at-thn-a49-4',
        assetId: 'thn-a49',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Wine collection coverage renewal. Climate monitoring system certification required.',
    },

    // ── thn-a50 · Rare Book Library ($2.2M) — Art & Collectibles ──
    {
        id: 'at-thn-a50-1',
        assetId: 'thn-a50',
        year: 2006,
        label: 'Collection Assembled',
        value: 1_200_000,
        description:
            'Assembled from estate sales and rare book dealers for $1.2M. 340 volumes.',
    },
    {
        id: 'at-thn-a50-2',
        assetId: 'thn-a50',
        year: 2020,
        label: 'Appraised',
        value: 2_000_000,
        description:
            'Antiquarian appraisal at $2M by Bauman Rare Books for insurance scheduling.',
    },
    {
        id: 'at-thn-a50-3',
        assetId: 'thn-a50',
        year: 2025,
        label: 'Appraised',
        value: 2_200_000,
        description:
            'Updated valuation at $2.2M per scheduled personal property rider.',
    },
    {
        id: 'at-thn-a50-4',
        assetId: 'thn-a50',
        year: 2027,
        label: 'Reappraisal Due',
        description:
            'Triennial reappraisal required per Chubb underwriting guidelines.',
    },

    // ── thn-a51 · Personal Vehicle Fleet ($1.8M) — Vehicle ──
    {
        id: 'at-thn-a51-1',
        assetId: 'thn-a51',
        year: 2022,
        label: 'Fleet Acquired',
        value: 2_100_000,
        description:
            '6 daily-use vehicles acquired for $2.1M aggregate. Titled to Family Office LLC.',
    },
    {
        id: 'at-thn-a51-2',
        assetId: 'thn-a51',
        year: 2024,
        label: 'Insured',
        description:
            'Fleet auto coverage renewed. Chubb Personal Auto policy.',
    },
    {
        id: 'at-thn-a51-3',
        assetId: 'thn-a51',
        year: 2026,
        label: 'Insurance Renewal',
        description:
            'Annual fleet auto policy renewal. Chubb Personal Auto.',
    },
    {
        id: 'at-thn-a51-4',
        assetId: 'thn-a51',
        year: 2027,
        label: 'Registration Renewal',
        description:
            'CT and NY vehicle registrations due. 6 vehicles across two states.',
    },

    // ── thn-a52 · Furniture & Antiques ($5.6M) — Art & Collectibles ──
    {
        id: 'at-thn-a52-1',
        assetId: 'thn-a52',
        year: 2007,
        label: 'Collection Assembled',
        value: 3_200_000,
        description:
            'Period furniture acquired for four residences at $3.2M. Multiple auction houses.',
    },
    {
        id: 'at-thn-a52-2',
        assetId: 'thn-a52',
        year: 2021,
        label: 'Appraised',
        value: 5_200_000,
        description:
            'Independent appraisal at $5.2M by Sotheby\'s for estate planning purposes.',
    },
    {
        id: 'at-thn-a52-3',
        assetId: 'thn-a52',
        year: 2025,
        label: 'Appraised',
        value: 5_600_000,
        description:
            'Aggregate market value at $5.6M per scheduled personal property rider.',
    },
    {
        id: 'at-thn-a52-4',
        assetId: 'thn-a52',
        year: 2027,
        label: 'Insurance Renewal',
        description:
            'Scheduled personal property rider renewal across four residences.',
    },

    // ── thn-a45 · Umbrella Liability Policy — $50M — Insurance ──
    {
        id: 'at-thn-a45-1',
        assetId: 'thn-a45',
        year: 2012,
        label: 'Policy Issued',
        value: 50_000_000,
        description:
            'Excess liability coverage issued. $50M limit. Chubb Personal Risk Services.',
    },
    {
        id: 'at-thn-a45-2',
        assetId: 'thn-a45',
        year: 2020,
        label: 'Coverage Reviewed',
        description:
            'Annual review confirmed $50M limit adequate for current asset base.',
    },
    {
        id: 'at-thn-a45-3',
        assetId: 'thn-a45',
        year: 2024,
        label: 'Premium Adjusted',
        description:
            'Premium adjusted based on underlying policy changes and claims history.',
    },
    {
        id: 'at-thn-a45-4',
        assetId: 'thn-a45',
        year: 2026,
        label: 'Coverage Review',
        description:
            'Annual review of $50M limit vs. current total asset base. Adequacy analysis by broker.',
    },
    {
        id: 'at-thn-a45-5',
        assetId: 'thn-a45',
        year: 2026,
        label: 'Premium Due',
        description:
            'Annual excess liability premium due. Renewal terms from Chubb expected Q2.',
    },

    // ── thn-a46 · Property & Casualty Portfolio ($120M) — Insurance ──
    {
        id: 'at-thn-a46-1',
        assetId: 'thn-a46',
        year: 2009,
        label: 'Policy Issued',
        value: 80_000_000,
        description:
            'Blanket property coverage issued at $80M across real estate holdings.',
    },
    {
        id: 'at-thn-a46-2',
        assetId: 'thn-a46',
        year: 2018,
        label: 'Coverage Expanded',
        value: 100_000_000,
        description:
            'Coverage expanded to $100M. Flood and earthquake endorsements added.',
    },
    {
        id: 'at-thn-a46-3',
        assetId: 'thn-a46',
        year: 2024,
        label: 'Coverage Expanded',
        value: 120_000_000,
        description:
            'Coverage increased to $120M. Annual premium $2.8M.',
    },
    {
        id: 'at-thn-a46-4',
        assetId: 'thn-a46',
        year: 2026,
        label: 'Premium Due',
        description:
            'Annual premium of $2.8M due. Renewal terms expected from underwriting syndicate.',
    },
    {
        id: 'at-thn-a46-5',
        assetId: 'thn-a46',
        year: 2026,
        label: 'Coverage Review',
        description:
            'Annual review of blanket limits vs. current real estate portfolio replacement values.',
    },
]
