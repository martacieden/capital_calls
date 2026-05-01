import type { GeoItem } from '@/data/thornton/valuations-data'

export type PortfolioCategoryId =
    | 'lifestyle-assets'
    | 'private-investments'
    | 'real-estate'
    | 'cash-equivalents'

export interface PortfolioAllocationItem {
    id: PortfolioCategoryId
    label: string
    value: number
    percentage: number
    color: string
    subcategories: string[]
    hasDrillDown: boolean
}

export interface PortfolioHolding {
    id: string
    name: string
    type: string
    sector: string
    image: string
    value: number
    portfolioPercentage: number
    location?: string
    vintage?: string
    manager?: string
}

export interface PortfolioSector {
    label: string
    percentage: number
    value: number
    color: string
}

/** Same shape as valuations `GeoItem` for the drill-down choropleth legend. */
export type PortfolioGeoItem = GeoItem

export interface PortfolioCategoryData {
    totalValue: number
    portfolioPercentage: number
    topHoldings: PortfolioHolding[]
    topSectors: PortfolioSector[]
    geographicExposure: PortfolioGeoItem[]
}

export const PORTFOLIO_TOTAL = 606_000_000

export const portfolioAllocationItems: PortfolioAllocationItem[] = [
    {
        id: 'lifestyle-assets',
        label: 'Lifestyle Assets',
        value: 231_500_000,
        percentage: 38.2,
        color: '#6366F1',
        subcategories: ['Art & Collectibles', 'Maritime', 'Aviation', 'Vehicles'],
        hasDrillDown: true,
    },
    {
        id: 'private-investments',
        label: 'Private Investments',
        value: 192_000_000,
        percentage: 31.7,
        color: '#10B981',
        subcategories: ['Fund I', 'Fund II', 'Fund III'],
        hasDrillDown: true,
    },
    {
        id: 'real-estate',
        label: 'Real Estate',
        value: 134_000_000,
        percentage: 22.1,
        color: '#F59E0B',
        subcategories: ['Residential', 'Commercial', 'US & Canada'],
        hasDrillDown: true,
    },
    {
        id: 'cash-equivalents',
        label: 'Cash & Equivalents',
        value: 48_500_000,
        percentage: 8.0,
        color: '#94A3B8',
        subcategories: [],
        hasDrillDown: false,
    },
]

const lifestyleAssets: PortfolioCategoryData = {
    totalValue: 231_500_000,
    portfolioPercentage: 38.2,
    topHoldings: [
        {
            id: 'asset-001',
            name: 'Basquiat – Untitled 1982',
            type: 'Art',
            sector: 'Art & Collectibles',
            image: 'https://placehold.co/80x80/6366F1/white?text=ART',
            value: 42_000_000,
            portfolioPercentage: 18.2,
            location: 'New York, USA',
        },
        {
            id: 'asset-002',
            name: 'Azimut 72 – Sea Breeze',
            type: 'Maritime',
            sector: 'Maritime',
            image: 'https://placehold.co/80x80/0EA5E9/white?text=BOAT',
            value: 38_500_000,
            portfolioPercentage: 16.6,
            location: 'Vancouver, BC, Canada',
        },
        {
            id: 'asset-003',
            name: 'Gulfstream G650ER – N841TF',
            type: 'Aviation',
            sector: 'Aviation',
            image: 'https://placehold.co/80x80/8B5CF6/white?text=JET',
            value: 35_000_000,
            portfolioPercentage: 15.1,
            location: 'Teterboro, NJ, USA',
        },
        {
            id: 'asset-004',
            name: 'Monet – Water Lilies Study',
            type: 'Art',
            sector: 'Art & Collectibles',
            image: 'https://placehold.co/80x80/6366F1/white?text=ART',
            value: 28_000_000,
            portfolioPercentage: 12.1,
            location: 'Napa Valley, CA, USA',
        },
        {
            id: 'asset-005',
            name: 'Patek Philippe Collection (14 pieces)',
            type: 'Collectibles',
            sector: 'Art & Collectibles',
            image: 'https://placehold.co/80x80/F59E0B/white?text=COL',
            value: 18_400_000,
            portfolioPercentage: 7.9,
            location: 'Toronto, ON, Canada',
        },
        {
            id: 'asset-006',
            name: 'Warhol – Campbell Soup Series',
            type: 'Art',
            sector: 'Art & Collectibles',
            image: 'https://placehold.co/80x80/6366F1/white?text=ART',
            value: 16_500_000,
            portfolioPercentage: 7.1,
            location: 'Los Angeles, CA, USA',
        },
        {
            id: 'asset-007',
            name: 'Rolls-Royce Spectre Collection (3 cars)',
            type: 'Vehicles',
            sector: 'Vehicles',
            image: 'https://placehold.co/80x80/10B981/white?text=CAR',
            value: 14_200_000,
            portfolioPercentage: 6.1,
            location: 'Palm Beach, FL, USA',
        },
        {
            id: 'asset-008',
            name: 'Burgess 112 – Solaris',
            type: 'Maritime',
            sector: 'Maritime',
            image: 'https://placehold.co/80x80/0EA5E9/white?text=YACHT',
            value: 12_800_000,
            portfolioPercentage: 5.5,
            location: 'Newport, RI, USA',
        },
        {
            id: 'asset-009',
            name: 'Burgundy Wine Collection (480 bottles)',
            type: 'Collectibles',
            sector: 'Art & Collectibles',
            image: 'https://placehold.co/80x80/F59E0B/white?text=WINE',
            value: 3_800_000,
            portfolioPercentage: 1.6,
            location: 'Portland, OR, USA',
        },
        {
            id: 'asset-010',
            name: 'Bell 429 Helicopter – N992WH',
            type: 'Aviation',
            sector: 'Aviation',
            image: 'https://placehold.co/80x80/8B5CF6/white?text=HELI',
            value: 2_300_000,
            portfolioPercentage: 1.0,
            location: 'Seattle, WA, USA',
        },
    ],
    topSectors: [
        { label: 'Art & Collectibles', percentage: 48, value: 111_120_000, color: '#6366F1' },
        { label: 'Maritime',           percentage: 28, value: 64_820_000,  color: '#0EA5E9' },
        { label: 'Aviation',           percentage: 18, value: 41_670_000,  color: '#8B5CF6' },
        { label: 'Vehicles',           percentage: 6,  value: 13_890_000,  color: '#10B981' },
    ],
    geographicExposure: [
        {
            geoKey: 'US|New York',
            label: 'New York',
            country: 'United States',
            region: 'New York',
            value: 52_000_000,
            percentage: 22,
            count: 0,
        },
        {
            geoKey: 'US|California',
            label: 'California',
            country: 'United States',
            region: 'California',
            value: 45_000_000,
            percentage: 19,
            count: 0,
        },
        {
            geoKey: 'US|Florida',
            label: 'Florida',
            country: 'United States',
            region: 'Florida',
            value: 38_500_000,
            percentage: 17,
            count: 0,
        },
        {
            geoKey: 'CA|Ontario',
            label: 'Ontario, Canada',
            country: 'Canada',
            region: 'Ontario',
            value: 32_300_000,
            percentage: 14,
            count: 0,
        },
        {
            geoKey: 'CA|British Columbia',
            label: 'British Columbia, Canada',
            country: 'Canada',
            region: 'British Columbia',
            value: 27_900_000,
            percentage: 12,
            count: 0,
        },
        {
            geoKey: 'US|Texas',
            label: 'Texas',
            country: 'United States',
            region: 'Texas',
            value: 22_900_000,
            percentage: 10,
            count: 0,
        },
        {
            geoKey: 'US|Washington',
            label: 'Washington',
            country: 'United States',
            region: 'Washington',
            value: 12_900_000,
            percentage: 6,
            count: 0,
        },
    ],
}

const privateInvestments: PortfolioCategoryData = {
    totalValue: 192_000_000,
    portfolioPercentage: 31.7,
    topHoldings: [
        {
            id: 'fund-001',
            name: 'Whitmore Capital Fund I',
            type: 'Private Equity',
            sector: 'Technology',
            image: 'https://placehold.co/80x80/10B981/white?text=F1',
            value: 85_000_000,
            portfolioPercentage: 34.0,
            vintage: '2018',
            manager: 'Whitmore Capital Partners · New York, NY',
        },
        {
            id: 'fund-002',
            name: 'Whitmore Ventures Fund II',
            type: 'Venture Capital',
            sector: 'Technology',
            image: 'https://placehold.co/80x80/6366F1/white?text=F2',
            value: 62_000_000,
            portfolioPercentage: 25.0,
            vintage: '2020',
            manager: 'Whitmore Ventures GP · Palo Alto, CA',
        },
        {
            id: 'fund-003',
            name: 'Whitmore Real Assets Fund III',
            type: 'Real Assets',
            sector: 'Real Estate',
            image: 'https://placehold.co/80x80/F59E0B/white?text=F3',
            value: 45_000_000,
            portfolioPercentage: 18.0,
            vintage: '2022',
            manager: 'Whitmore Asset Management · Houston, TX / Toronto, ON',
        },
    ],
    topSectors: [
        { label: 'Technology',     percentage: 35, value: 67_200_000, color: '#6366F1' },
        { label: 'Healthcare',     percentage: 24, value: 46_080_000, color: '#10B981' },
        { label: 'Real Estate',    percentage: 18, value: 34_560_000, color: '#F59E0B' },
        { label: 'Energy',         percentage: 14, value: 26_880_000, color: '#EF4444' },
        { label: 'Consumer Goods', percentage: 9,  value: 17_280_000, color: '#94A3B8' },
    ],
    geographicExposure: [
        {
            geoKey: 'US|New York',
            label: 'New York',
            country: 'United States',
            region: 'New York',
            value: 72_000_000,
            percentage: 38,
            count: 0,
        },
        {
            geoKey: 'US|California',
            label: 'California',
            country: 'United States',
            region: 'California',
            value: 48_000_000,
            percentage: 25,
            count: 0,
        },
        {
            geoKey: 'US|Texas',
            label: 'Texas',
            country: 'United States',
            region: 'Texas',
            value: 42_000_000,
            percentage: 22,
            count: 0,
        },
        {
            geoKey: 'CA|Ontario',
            label: 'Ontario, Canada',
            country: 'Canada',
            region: 'Ontario',
            value: 30_000_000,
            percentage: 15,
            count: 0,
        },
    ],
}

const realEstate: PortfolioCategoryData = {
    totalValue: 134_000_000,
    portfolioPercentage: 22.1,
    topHoldings: [
        {
            id: 're-001',
            name: 'Miami Oceanfront Compound',
            type: 'Residential',
            sector: 'Residential',
            image: 'https://placehold.co/80x80/F59E0B/white?text=VILLA',
            value: 48_000_000,
            portfolioPercentage: 35.8,
            location: 'Key Biscayne, FL, USA',
        },
        {
            id: 're-002',
            name: 'Park Avenue Penthouse',
            type: 'Residential',
            sector: 'Residential',
            image: 'https://placehold.co/80x80/F59E0B/white?text=APT',
            value: 32_000_000,
            portfolioPercentage: 23.9,
            location: 'New York, NY, USA',
        },
        {
            id: 're-003',
            name: 'West Vancouver Waterfront',
            type: 'Residential',
            sector: 'Residential',
            image: 'https://placehold.co/80x80/F59E0B/white?text=TOWN',
            value: 24_500_000,
            portfolioPercentage: 18.3,
            location: 'West Vancouver, BC, Canada',
        },
        {
            id: 're-004',
            name: 'Tahoe Lakefront Estate',
            type: 'Residential',
            sector: 'Residential',
            image: 'https://placehold.co/80x80/F59E0B/white?text=EST',
            value: 18_000_000,
            portfolioPercentage: 13.4,
            location: 'Incline Village, NV, USA',
        },
        {
            id: 're-005',
            name: 'Jackson Hole Ranch',
            type: 'Residential',
            sector: 'Residential',
            image: 'https://placehold.co/80x80/F59E0B/white?text=LAKE',
            value: 11_500_000,
            portfolioPercentage: 8.6,
            location: 'Jackson Hole, WY, USA',
        },
    ],
    topSectors: [
        { label: 'Residential',        percentage: 62, value: 83_080_000, color: '#F59E0B' },
        { label: 'Commercial',         percentage: 24, value: 32_160_000, color: '#6366F1' },
        { label: 'Land & Development', percentage: 14, value: 18_760_000, color: '#10B981' },
    ],
    geographicExposure: [
        {
            geoKey: 'US|Florida',
            label: 'Florida',
            country: 'United States',
            region: 'Florida',
            value: 40_000_000,
            percentage: 30,
            count: 0,
        },
        {
            geoKey: 'US|New York',
            label: 'New York',
            country: 'United States',
            region: 'New York',
            value: 38_000_000,
            percentage: 28,
            count: 0,
        },
        {
            geoKey: 'CA|British Columbia',
            label: 'British Columbia, Canada',
            country: 'Canada',
            region: 'British Columbia',
            value: 26_000_000,
            percentage: 19,
            count: 0,
        },
        {
            geoKey: 'US|Nevada',
            label: 'Nevada',
            country: 'United States',
            region: 'Nevada',
            value: 21_000_000,
            percentage: 16,
            count: 0,
        },
        {
            geoKey: 'US|Wyoming',
            label: 'Wyoming',
            country: 'United States',
            region: 'Wyoming',
            value: 9_000_000,
            percentage: 7,
            count: 0,
        },
    ],
}

const CATEGORY_DATA: Record<string, PortfolioCategoryData> = {
    'lifestyle-assets': lifestyleAssets,
    'private-investments': privateInvestments,
    'real-estate': realEstate,
}

export function getDrilldownData(categoryId: string): PortfolioCategoryData | null {
    return CATEGORY_DATA[categoryId] ?? null
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
    'lifestyle-assets':    { label: 'Lifestyle Assets',    color: '#6366F1' },
    'private-investments': { label: 'Private Investments', color: '#10B981' },
    'real-estate':         { label: 'Real Estate',         color: '#F59E0B' },
    'cash-equivalents':    { label: 'Cash & Equivalents',  color: '#94A3B8' },
}

export function getCategoryLabel(categoryId: string): string {
    return CATEGORY_META[categoryId]?.label ?? categoryId
}

export function getCategoryColor(categoryId: string): string {
    return CATEGORY_META[categoryId]?.color ?? '#94A3B8'
}
