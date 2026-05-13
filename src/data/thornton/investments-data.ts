export type InvestmentStatus = 'active' | 'fully-deployed' | 'realized' | 'monitoring'
export type InvestmentPipelineStage = 'sourcing' | 'initial-review' | 'due-diligence' | 'ic-review' | 'approved' | 'declined'

export interface InvestmentDocument {
    name: string
    type: string
    date: string
    sizeKb: number
}

export interface InvestmentApproval {
    step: number
    role: string
    name: string
    initials: string
    avatarBg: string
    status: 'approved' | 'waiting' | 'pending'
    date?: string
    staleDays?: number
}

export interface InvestmentRecord {
    id: string
    fundName: string
    fundNameShort: string
    gp: string
    entity: string
    status: InvestmentStatus
    vintage: number
    strategy: string
    geography: string
    totalCommitment: number
    called: number
    nav: number
    irr: string | null
    moic: string | null
    investmentDate: string
    capitalCallIds: string[]
    /** Matches the `id` field in capital-calls-data.ts for chart pacing data */
    commitmentDataId: string | null
    description: string
    documents: InvestmentDocument[]
    pipelineStage: InvestmentPipelineStage
    approvals: InvestmentApproval[]
}

export const INVESTMENT_RECORDS: InvestmentRecord[] = [
    {
        id: 'INV-2024-014',
        fundName: 'Greentech Opportunities Fund III, L.P.',
        fundNameShort: 'Greentech Opp. Fund III',
        gp: 'Meridian Capital Partners',
        entity: 'Real Estate Holding LLC',
        status: 'active',
        vintage: 2024,
        strategy: 'Private Equity',
        geography: 'North America',
        totalCommitment: 5_000_000,
        called: 2_100_000,
        nav: 2_450_000,
        irr: '+11.2%',
        moic: '1.2x',
        investmentDate: '2024-01-15',
        capitalCallIds: ['CAPCAL-1'],
        commitmentDataId: 'greentech-fund-iii',
        description: 'Growth equity fund targeting sustainable infrastructure and clean technology companies across North America. Focus on Series C+ investments with $50M–$500M enterprise value.',
        documents: [
            { name: 'Meridian_CapCall_07_RE-Holding.pdf', type: 'Capital Call Notice', date: '2026-05-08', sizeKb: 218 },
            { name: 'Greentech_Fund_III_LPA.pdf', type: 'Fund Agreement', date: '2024-01-15', sizeKb: 1240 },
            { name: 'Greentech_Q1_2026_Report.pdf', type: 'Investor Report', date: '2026-04-10', sizeKb: 890 },
        ],
        pipelineStage: 'ic-review',
        approvals: [
            { step: 1, role: 'Manager Review',    name: 'Sarah Thornton',    initials: 'ST', avatarBg: '#DBEAFE', status: 'waiting', staleDays: 5 },
            { step: 2, role: 'CFO Review',        name: 'James Chen',        initials: 'JC', avatarBg: '#FCE7F3', status: 'pending' },
            { step: 3, role: 'CEO Authorization', name: 'Margaret Whitmore', initials: 'MW', avatarBg: '#FEF3C7', status: 'pending' },
            { step: 4, role: 'Principal Sign-off',name: 'Robert Thornton',   initials: 'RT', avatarBg: '#D1FAE5', status: 'pending' },
        ],
    },
    {
        id: 'INV-2023-007',
        fundName: 'Whitmore Real Assets Fund III, L.P.',
        fundNameShort: 'Whitmore Real Assets III',
        gp: 'Whitmore Capital Group',
        entity: 'Thornton Family Trust',
        status: 'active',
        vintage: 2023,
        strategy: 'Real Assets',
        geography: 'Global',
        totalCommitment: 8_750_000,
        called: 1_925_000,
        nav: 2_100_000,
        irr: '+8.7%',
        moic: '1.1x',
        investmentDate: '2023-06-01',
        capitalCallIds: ['CAPCAL-2'],
        commitmentDataId: 'whitmore-real-assets-iii',
        description: 'Infrastructure and real assets fund targeting global energy transition assets, digital infrastructure, and real estate across developed markets. Multi-year deployment horizon with 10-year fund life.',
        documents: [
            { name: 'Whitmore_CapCall_03_ThorntonTrust.pdf', type: 'Capital Call Notice', date: '2026-05-10', sizeKb: 184 },
            { name: 'Whitmore_RA_III_Subscription.pdf', type: 'Subscription Document', date: '2023-06-01', sizeKb: 542 },
            { name: 'Whitmore_Q4_2025_Report.pdf', type: 'Investor Report', date: '2026-01-15', sizeKb: 720 },
        ],
        pipelineStage: 'due-diligence',
        approvals: [],
    },
]

export function getInvestmentById(id: string): InvestmentRecord | undefined {
    return INVESTMENT_RECORDS.find(inv => inv.id === id)
}

export function getInvestmentByCapCallId(capitalCallDecisionId: string): InvestmentRecord | undefined {
    return INVESTMENT_RECORDS.find(inv => inv.capitalCallIds.includes(capitalCallDecisionId))
}
