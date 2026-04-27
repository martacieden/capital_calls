import type { Asset } from '../types'

const ORG = 'org-thornton'
const BY_AI = { id: 'ai-extractor', name: 'Fojo AI', avatarUrl: undefined }

/**
 * Thornton Family — Assets (23)
 *
 * Grouped by holding entity for clarity:
 *   RE Holdings  → 5 properties
 *   Aviation LLC → 1 aircraft
 *   Maritime LLC → 1 yacht
 *   Art Fund LLC → 2 collections
 *   PE Aggregator → 1 fund
 *   Agriculture LP → 1 farmland
 *   Capital Group → 2 investments + 1 vehicle
 *   Family Office → 1 investment
 *   RLT direct → 1 investment
 *   Dynasty I direct → 1 investment
 *   Dynasty II direct → 1 investment
 *   ILIT direct → 1 insurance
 *   SLAT direct → 1 investment
 *   CRT direct → 1 investment
 *   Insurance Holdings → 3 insurance policies (collector vehicle, personal auto, marine hull)
 */
export const thorntonAssets: Asset[] = [
    // ── RE Holdings LLC (thn-e3) → Properties ──
    {
        id: 'thn-a1',
        categoryKey: 'property',
        organizationId: ORG,
        name: 'Fifth Avenue Penthouse',
        imageUrl: '/images/fifth-ave-penthouse.jpg',
        galleryImages: ['/images/penthouse-1.jpg', '/images/penthouse-2.jpg', '/images/penthouse-3.jpg'],
        assetType: 'Real Estate',
        value: 45_000_000,
        holderId: 'thn-e3',
        address: '834 Fifth Avenue, Apt PH-A, New York, NY 10065',
        description:
            "10,000 sq ft penthouse. Primary residence of Edward III and Anastasia. $50M all-risk policy with AIG.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e3',
        priorityStatus: { type: 'expiring-soon', detail: 'Expiring soon — AIG all-risk policy renewal due April 15' },
    },
    {
        id: 'thn-a2',
        categoryKey: 'property',
        organizationId: ORG,
        name: 'Hamptons Estate',
        imageUrl: '/images/hamptons-estate.jpg',
        galleryImages: ['/images/hamptons-1.jpg', '/images/hamptons-2.jpg', '/images/hamptons-3.jpg'],
        assetType: 'Real Estate',
        value: 38_000_000,
        holderId: 'thn-e3',
        address: '142 Further Lane, East Hampton, NY 11937',
        description:
            '8.5-acre oceanfront compound. Main residence, pool house, guest cottage, and private beach.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e3',
        priorityStatus: { type: 'updated', detail: 'Edited 3 hours ago by Sandra Whitfield' },
    },
    {
        id: 'thn-a5',
        categoryKey: 'property',
        organizationId: ORG,
        name: 'London Mayfair Flat',
        imageUrl: '/images/london-mayfair-flat.jpg',
        galleryImages: ['/images/london-1.jpg', '/images/london-2.jpg', '/images/london-3.jpg'],
        assetType: 'Real Estate',
        value: 23_000_000,
        holderId: 'thn-e3',
        address: '42 Grosvenor Square, London W1K 2HT',
        description:
            'Grade II listed Georgian townhouse converted to luxury flat. Held by London Mayfair Properties Ltd, a subsidiary.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e3',
    },
    {
        id: 'thn-a7',
        categoryKey: 'property',
        organizationId: ORG,
        name: 'Montana Ranch',
        imageUrl: '/images/montana-ranch.jpg',
        galleryImages: ['/images/ranch-1.jpg', '/images/ranch-2.jpg', '/images/ranch-3.jpg'],
        assetType: 'Real Estate',
        value: 22_000_000,
        holderId: 'thn-e3',
        address: 'Big Sky, Park County, MT 59730',
        description:
            '2,400-acre working ranch. Main lodge, 3 guest cabins, equestrian facilities, private trout stream.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e3',
    },
    {
        id: 'thn-a8',
        categoryKey: 'property',
        organizationId: ORG,
        name: 'Fifth Avenue Commercial Building',
        imageUrl: '/images/office-tower.jpg',
        galleryImages: ['/images/office-1.jpg', '/images/office-2.jpg', '/images/office-3.jpg'],
        assetType: 'Real Estate',
        value: 280_000_000,
        holderId: 'thn-e3',
        address: '520 Fifth Avenue, New York, NY 10036',
        description:
            '42-story Class A office tower near Bryant Park. 94% occupancy. Generates ~$18M annual NOI.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e3',
    },

    // ── Aviation LLC (thn-e4) → Aircraft ──
    {
        id: 'thn-a25',
        categoryKey: 'vehicle',
        organizationId: ORG,
        name: 'Gulfstream G700',
        imageUrl: '/images/gulfstream-g700.jpg',
        galleryImages: ['/images/jet-1.jpg', '/images/jet-2.jpg', '/images/jet-3.jpg'],
        assetType: 'Aircraft',
        value: 75_000_000,
        holderId: 'thn-e4',
        description:
            '2023 Gulfstream G700. Registration N-THN7. 19-passenger ultra-long-range business jet. Based at Teterboro.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e4',
        priorityStatus: { type: 'missing-documents', detail: 'Missing documents — FAA registration renewal not uploaded' },
    },

    // ── Maritime LLC (thn-e5) → Yacht ──
    {
        id: 'thn-a26',
        categoryKey: 'maritime',
        organizationId: ORG,
        name: 'Motor Yacht Sovereign',
        imageUrl: '/images/motor-yacht-sovereign.jpg',
        galleryImages: ['/images/motoryacht-1.jpg', '/images/motoryacht-2.jpg', '/images/motoryacht-3.jpg'],
        assetType: 'Yacht / Watercraft',
        value: 120_000_000,
        holderId: 'thn-e5',
        description:
            '65-meter Lürssen 2021. Cayman Islands flag. 10 guest staterooms, crew of 22. Annual operating cost ~$12M.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e5',
    },

    // ── Art Fund LLC (thn-e6) → Art ──
    {
        id: 'thn-a27',
        categoryKey: 'art',
        organizationId: ORG,
        name: 'Warhol Portfolio',
        imageUrl: '/images/warhol-portfolio.jpg',
        galleryImages: ['/images/warhol-1.jpg', '/images/warhol-2.jpg', '/images/warhol-3.jpg'],
        assetType: 'Art & Collectibles',
        value: 28_000_000,
        holderId: 'thn-e6',
        description:
            '12 works including 3 "Marilyn" screen prints (1967), 4 "Campbell\'s Soup" variations. Christie\'s valuation Oct 2024.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e6',
        priorityStatus: { type: 'missing-insurance', detail: 'Data conflict — appraised value differs from insurance coverage by $4.2M' },
    },
    {
        id: 'thn-a28',
        categoryKey: 'art',
        organizationId: ORG,
        name: 'Basquiat Collection',
        imageUrl: '/images/basquiat-collection.jpg',
        galleryImages: ['/images/basquiat-1.jpg', '/images/basquiat-2.jpg', '/images/basquiat-3.jpg'],
        assetType: 'Art & Collectibles',
        value: 42_000_000,
        holderId: 'thn-e6',
        description:
            '4 works including "Untitled" (1982) and "Flexible" (1984). Sotheby\'s valuation Sep 2024.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e6',
        priorityStatus: { type: 'missing-insurance', detail: 'No fine art insurance policy covers the Basquiat collection' },
    },

    // ── PE Aggregator LLC (thn-e7) → PE Fund ──
    {
        id: 'thn-a15',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'KKR North America Fund XII',
        assetType: 'Business Interest',
        value: 18_200_000,
        holderId: 'thn-e7',
        description:
            'PE fund. $15M committed, current NAV $18.2M. Vintage 2020. Focus on mid-market leveraged buyouts.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e7',
    },

    // ── Agriculture LP (thn-e8) → Farmland ──
    {
        id: 'thn-a9',
        categoryKey: 'property',
        organizationId: ORG,
        name: 'Iowa Farmland',
        assetType: 'Real Estate',
        value: 180_000_000,
        holderId: 'thn-e8',
        address: 'Story & Boone Counties, Iowa',
        description:
            '12,000 acres of prime cropland at $15,000/acre. Leased to three operating farmers. Annual net income $4.8M.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e8',
    },

    // ── Capital Group LP (thn-e2) → Direct Investments + Vehicles ──
    {
        id: 'thn-a10',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'JPMorgan Private Bank',
        assetType: 'Investment Account',
        value: 85_000_000,
        holderId: 'thn-e2',
        description:
            'Multi-asset portfolio. 55% equities, 30% fixed income, 15% alternatives. Discretionary advisory since 2018.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
        priorityStatus: { type: 'updated', detail: 'Edited 6 hours ago by Michael Chen' },
    },
    {
        id: 'thn-a29',
        categoryKey: 'vehicle',
        organizationId: ORG,
        name: 'Ferrari Collection',
        imageUrl: '/images/ferrari-collection.jpg',
        galleryImages: ['/images/ferrari-1.jpg', '/images/ferrari-2.jpg', '/images/ferrari-3.jpg'],
        assetType: 'Vehicle',
        value: 62_000_000,
        holderId: 'thn-e2',
        description:
            '6 vehicles including 1962 250 GTO ($48M), 1967 275 GTB/4, 2022 SF90 Stradale, 2023 296 GTB, 1973 Dino 246 GTS, 1987 F40. Climate-controlled storage in Greenwich, CT.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },

    // ── Family Office LLC (thn-e1) → Direct Investment ──
    {
        id: 'thn-a11',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'Goldman Sachs Wealth Management',
        assetType: 'Investment Account',
        value: 62_000_000,
        holderId: 'thn-e1',
        description:
            'Growth equity strategy. Concentrated portfolio in technology, healthcare, and consumer sectors.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e1',
    },

    // ── RLT (thn-t1) → Direct Investment ──
    {
        id: 'thn-a13',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'Vanguard Index Portfolio',
        assetType: 'Investment Account',
        value: 38_000_000,
        holderId: 'thn-t1',
        description:
            'Passive core. 50% Total Stock Market, 30% Total International, 20% Total Bond. Expense ratio 0.04%.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t1',
    },

    // ── Dynasty Trust I (thn-t2) → Direct Investment ──
    {
        id: 'thn-a12',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'BlackRock Fixed Income Portfolio',
        assetType: 'Investment Account',
        value: 45_000_000,
        holderId: 'thn-t2',
        description:
            'Investment-grade corporate bonds (60%), Treasuries (25%), munis (15%). Duration 6.2yr, YTM 4.8%.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t2',
    },

    // ── Dynasty Trust II (thn-t3) → Digital Assets ──
    {
        id: 'thn-a30',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'Bitcoin & Digital Assets',
        assetType: 'Cryptocurrency',
        value: 15_000_000,
        holderId: 'thn-t3',
        description:
            '150 BTC in Fidelity Digital Assets cold storage. Also holds 500 ETH and select DeFi positions.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t3',
    },

    // ── ILIT (thn-t4) → Insurance ──
    {
        id: 'thn-a24',
        categoryKey: 'insurance',
        organizationId: ORG,
        name: 'Life Insurance — Northwestern Mutual $25M',
        assetType: 'Insurance Policy',
        value: 25_000_000,
        holderId: 'thn-t4',
        description:
            'Survivorship second-to-die whole life policy. Policy No. NM-2015-THN-001. Annual premium $285,000.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t4',
    },

    // ── SLAT I (thn-t12) → Investment ──
    {
        id: 'thn-a31',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'SLAT Investment Portfolio',
        assetType: 'Investment Account',
        value: 30_000_000,
        holderId: 'thn-t12',
        description:
            'Diversified portfolio funded at $30M. Managed by Goldman Sachs Private Wealth. Income distributed to Anastasia.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t12',
    },

    // ── CRT (thn-t13) → Investment ──
    {
        id: 'thn-a32',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'CRT Unitrust Fund',
        assetType: 'Investment Account',
        value: 15_000_000,
        holderId: 'thn-t13',
        description:
            'CRUT fund. 5% annual unitrust payout to Edward and Anastasia. Remainder to Thornton Foundation at death.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t13',
    },

    // ── Family Office LLC (thn-e1) → Additional ──
    {
        id: 'thn-a33',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'Morgan Stanley Wealth Management',
        assetType: 'Investment Account',
        value: 55_000_000,
        holderId: 'thn-e1',
        description:
            'Tax-managed equity strategy. Concentrated in large-cap growth. Overseen by Martha Okafor.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e1',
    },

    // ── Foundation (thn-e12) → Assets ──
    {
        id: 'thn-a34',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'Foundation Endowment',
        assetType: 'Investment Account',
        value: 45_000_000,
        holderId: 'thn-e12',
        description:
            '$45M endowment invested in 60/40 portfolio. 5% annual distribution for grants in arts, education, and healthcare.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e12',
    },
    {
        id: 'thn-a35',
        categoryKey: 'art',
        organizationId: ORG,
        name: 'Foundation Art Collection',
        assetType: 'Art & Collectibles',
        value: 12_000_000,
        holderId: 'thn-e12',
        description:
            'Permanent collection of 85 works on long-term loan to MoMA and Whitney Museum. Focus on contemporary American art.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e12',
    },

    // ── Art Fund LLC (thn-e6) → Additional ──
    {
        id: 'thn-a36',
        categoryKey: 'art',
        organizationId: ORG,
        name: 'Kusama Infinity Room Installation',
        assetType: 'Art & Collectibles',
        value: 18_000_000,
        holderId: 'thn-e6',
        description:
            'Yayoi Kusama "Infinity Mirrored Room — The Souls of Millions of Light Years Away" (2013). Acquired at Phillips 2023.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e6',
    },

    // ── Aviation LLC (thn-e4) → Additional ──
    {
        id: 'thn-a37',
        categoryKey: 'vehicle',
        organizationId: ORG,
        name: 'Bell 525 Relentless Helicopter',
        imageUrl: '/images/heli-1.jpg',
        galleryImages: ['/images/heli-2.jpg'],
        assetType: 'Aircraft',
        value: 18_000_000,
        holderId: 'thn-e4',
        description:
            '2024 Bell 525. Registration N-THN5. Used for Hamptons and Manhattan transfers. Based at East Hampton Airport.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e4',
    },
    {
        id: 'thn-a38',
        categoryKey: 'insurance',
        organizationId: ORG,
        name: 'Aviation Hull & Liability Policy',
        assetType: 'Insurance Policy',
        value: 95_000_000,
        holderId: 'thn-e4',
        description:
            'Combined hull and third-party liability coverage for G700 and Bell 525. AIG Aviation, annual premium $1.2M.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e4',
        customFields: { 'Expires': '2026-09-15' },
    },

    // ── Maritime LLC (thn-e5) → Additional ──
    {
        id: 'thn-a39',
        categoryKey: 'maritime',
        organizationId: ORG,
        name: 'Sailing Yacht Aurora',
        imageUrl: '/images/sailing-yacht-aurora.jpg',
        galleryImages: ['/images/sailyacht-1.jpg', '/images/sailyacht-2.jpg', '/images/sailyacht-3.jpg'],
        assetType: 'Yacht / Watercraft',
        value: 32_000_000,
        holderId: 'thn-e5',
        description:
            '42-meter Perini Navi 2019. Mediterranean charter vessel. 4 guest cabins, crew of 8. Annual revenue ~$1.8M.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e5',
    },
    {
        id: 'thn-a40',
        categoryKey: 'maritime',
        organizationId: ORG,
        name: 'Tender & Watercraft Fleet',
        assetType: 'Yacht / Watercraft',
        value: 4_500_000,
        holderId: 'thn-e5',
        description:
            '3 tenders, 2 jet skis, 1 Riva speedboat. Stored aboard M/Y Sovereign and at Fort Lauderdale marina.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e5',
    },

    // ── Ventures LLC (thn-e9) → Assets ──
    {
        id: 'thn-a41',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'Sequoia Capital Fund XV',
        assetType: 'Business Interest',
        value: 12_000_000,
        holderId: 'thn-e9',
        description:
            '$10M committed, current NAV $12M. Vintage 2022. Global growth-stage technology investments.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e9',
    },

    // ── PE Aggregator LLC (thn-e7) → Additional ──
    {
        id: 'thn-a42',
        categoryKey: 'investment',
        organizationId: ORG,
        name: 'Blackstone Real Estate Fund IX',
        assetType: 'Business Interest',
        value: 22_000_000,
        holderId: 'thn-e7',
        description:
            '$20M committed, current NAV $22M. Vintage 2021. Global opportunistic real estate.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e7',
    },

    // ── Agriculture LP (thn-e8) → Additional ──
    {
        id: 'thn-a43',
        categoryKey: 'property',
        organizationId: ORG,
        name: 'Oregon Vineyard Estate',
        imageUrl: '/images/oregon-vineyard.jpg',
        galleryImages: ['/images/vineyard-1.jpg', '/images/vineyard-2.jpg', '/images/vineyard-3.jpg'],
        assetType: 'Real Estate',
        value: 28_000_000,
        holderId: 'thn-e8',
        address: 'Dundee Hills, Yamhill County, OR',
        description:
            '450-acre estate with 180 planted acres of Pinot Noir and Chardonnay. Winery producing 15,000 cases annually.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e8',
    },
    {
        id: 'thn-a44',
        categoryKey: 'insurance',
        organizationId: ORG,
        name: 'Crop & Agricultural Insurance',
        assetType: 'Insurance Policy',
        value: 8_000_000,
        holderId: 'thn-e8',
        description:
            'Multi-peril crop insurance for Iowa farmland and Oregon vineyard. Federal crop insurance plus commercial hail coverage.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e8',
        customFields: { 'Expires': '2026-12-31' },
    },

    // ── Capital Group LP (thn-e2) → Personal Property (inventory list items) ──
    {
        id: 'thn-a47',
        categoryKey: 'art',
        organizationId: ORG,
        name: 'Jewelry Collection',
        assetType: 'Art & Collectibles',
        value: 8_500_000,
        holderId: 'thn-e2',
        description:
            'Estate jewelry including 12.5ct Burmese ruby ring, Harry Winston diamond necklace, Cartier Tutti Frutti bracelet. Vault at JPMorgan, NYC.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },
    {
        id: 'thn-a48',
        categoryKey: 'art',
        organizationId: ORG,
        name: 'Watch Collection',
        assetType: 'Art & Collectibles',
        value: 4_200_000,
        holderId: 'thn-e2',
        description:
            '18 timepieces including Patek Philippe Nautilus 5711, Rolex Daytona "Paul Newman", A. Lange & Söhne Grand Complication. Insured by Chubb.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },
    {
        id: 'thn-a49',
        categoryKey: 'art',
        organizationId: ORG,
        name: 'Wine Cellar Collection',
        assetType: 'Art & Collectibles',
        value: 3_800_000,
        holderId: 'thn-e2',
        description:
            '4,200 bottles. Verticals of DRC, Pétrus, Screaming Eagle, and Giacomo Conterno. Climate-controlled cellar at Fifth Avenue and Hamptons.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },

    // ── Family Office LLC (thn-e1) → Personal Property ──
    {
        id: 'thn-a50',
        categoryKey: 'art',
        organizationId: ORG,
        name: 'Rare Book Library',
        assetType: 'Art & Collectibles',
        value: 2_200_000,
        holderId: 'thn-e1',
        description:
            '340 volumes including first editions of Shakespeare folios, illuminated medieval manuscripts, and signed Hemingway collection.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e1',
    },
    {
        id: 'thn-a51',
        categoryKey: 'vehicle',
        organizationId: ORG,
        name: 'Personal Vehicle Fleet',
        assetType: 'Vehicle',
        value: 1_800_000,
        holderId: 'thn-e1',
        description:
            '6 daily-use vehicles: 2 Rolls-Royce Cullinans, Mercedes-Maybach S680, Range Rover LWB, Porsche Cayenne Turbo GT, Tesla Model X Plaid.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e1',
    },
    {
        id: 'thn-a52',
        categoryKey: 'art',
        organizationId: ORG,
        name: 'Furniture & Antiques',
        assetType: 'Art & Collectibles',
        value: 5_600_000,
        holderId: 'thn-e1',
        description:
            'Period furniture across 4 residences. Highlights: Louis XV bureau plat, George III mahogany bookcase, Art Deco Émile-Jacques Ruhlmann desk.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e1',
    },

    // ── Insurance Holdings LLC (thn-e10) → Assets ──
    {
        id: 'thn-a45',
        categoryKey: 'insurance',
        organizationId: ORG,
        name: 'Umbrella Liability Policy — $50M',
        assetType: 'Insurance Policy',
        value: 50_000_000,
        holderId: 'thn-e10',
        description:
            'Excess liability coverage above underlying auto, homeowners, and watercraft policies. Chubb Personal Risk Services.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e10',
    },
    {
        id: 'thn-a46',
        categoryKey: 'insurance',
        organizationId: ORG,
        name: 'Property & Casualty Portfolio',
        assetType: 'Insurance Policy',
        value: 120_000_000,
        holderId: 'thn-e10',
        description:
            'Blanket coverage across all real estate holdings. Includes all-risk property, flood, earthquake, and business interruption. Annual premium $2.8M.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e10',
        customFields: { 'Expires': '2026-06-01' },
    },
    {
        id: 'thn-a53',
        categoryKey: 'insurance',
        organizationId: ORG,
        name: 'Collector Vehicle Policy — Hagerty',
        assetType: 'Insurance Policy',
        value: 65_000_000,
        holderId: 'thn-e10',
        description:
            'Agreed-value collector car coverage for the Ferrari Collection. Hagerty Specialty. Policy No. HAG-2024-THN-001. Annual premium $185K.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e10',
        customFields: { 'Expires': '2027-01-15' },
    },
    {
        id: 'thn-a54',
        categoryKey: 'insurance',
        organizationId: ORG,
        name: 'Personal Auto Policy — Chubb',
        assetType: 'Insurance Policy',
        value: 2_000_000,
        holderId: 'thn-e10',
        description:
            'Comprehensive auto coverage for the Personal Vehicle Fleet. Chubb Personal Risk Services. $1M liability per occurrence. Annual premium $28K.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e10',
        customFields: { 'Expires': '2026-08-01' },
    },
    {
        id: 'thn-a55',
        categoryKey: 'insurance',
        organizationId: ORG,
        name: 'Marine Hull & P&I Policy — Pantaenius',
        assetType: 'Insurance Policy',
        value: 155_000_000,
        holderId: 'thn-e10',
        description:
            'Combined hull and protection & indemnity coverage for M/Y Sovereign, S/Y Aurora, and tender fleet. Pantaenius Marine. Annual premium $950K.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e10',
        customFields: { 'Expires': '2026-11-30' },
    },
]
