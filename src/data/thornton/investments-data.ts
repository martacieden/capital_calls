export type InvestmentStatus = 'active' | 'fully-deployed' | 'realized' | 'monitoring'

export interface MonitoringEvent {
    date: string
    title: string
    description: string
    type: 'report' | 'capital-call' | 'payment'
}

export interface MonitoringData {
    irr: string
    tvpi: string
    nav: number
    reportDate: string
    gpUpdates: MonitoringEvent[]
    portfolioCompanies: Array<{ name: string; status: 'on-track' | 'watch-list' }>
    nextEvents: Array<{ label: string; date: string; urgent?: boolean }>
}
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
    monitoring?: MonitoringData
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
        monitoring: {
            irr: '+11.2%',
            tvpi: '1.17×',
            nav: 2_450_000,
            reportDate: 'Q1 2026',
            gpUpdates: [
                { date: 'Apr 10, 2026', title: 'Q1 2026 Investor Report', description: 'NAV $2.45M · IRR 11.2% · 3 new portfolio cos.', type: 'report' },
                { date: 'May 8, 2026',  title: 'Capital Call #7 received', description: '$500K · Due May 30, 2026', type: 'capital-call' },
                { date: 'Jan 15, 2026', title: 'Capital Call #6 paid', description: '$475K wired · confirmed by custodian', type: 'payment' },
                { date: 'Jan 10, 2026', title: 'Q4 2025 Investor Report', description: 'NAV $2.3M · IRR 10.8%', type: 'report' },
            ],
            portfolioCompanies: [
                { name: 'EcoGrid Systems', status: 'on-track' },
                { name: 'Meridian Solar', status: 'on-track' },
                { name: 'ClearWater Tech', status: 'watch-list' },
            ],
            nextEvents: [
                { label: 'Call #7 due', date: 'May 30, 2026', urgent: true },
                { label: 'Q2 2026 report', date: '~Jun 30, 2026' },
                { label: 'Call #8 forecast', date: 'Sep 2026' },
            ],
        },
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
        monitoring: {
            irr: '+8.7%',
            tvpi: '1.09×',
            nav: 2_100_000,
            reportDate: 'Q4 2025',
            gpUpdates: [
                { date: 'Jan 15, 2026', title: 'Q4 2025 Investor Report', description: 'NAV $2.1M · TVPI 1.09×', type: 'report' },
                { date: 'May 10, 2026', title: 'Capital Call #3 received', description: '$875K · Due Jun 15, 2026', type: 'capital-call' },
                { date: 'Apr 15, 2026', title: 'Capital Call #2 paid', description: '$875K wired · confirmed by custodian', type: 'payment' },
                { date: 'Nov 8, 2025',  title: 'Q3 2025 Investor Report', description: 'NAV $1.95M · TVPI 1.04×', type: 'report' },
            ],
            portfolioCompanies: [
                { name: 'Thornton Infrastructure', status: 'on-track' },
                { name: 'Global Energy Corridor', status: 'on-track' },
                { name: 'Southeast Logistics Hub', status: 'watch-list' },
            ],
            nextEvents: [
                { label: 'Call #3 due', date: 'Jun 15, 2026', urgent: true },
                { label: 'LP side letter renewal', date: 'Jun 1, 2026' },
                { label: 'Q1 2026 report', date: '~May 2026' },
            ],
        },
    },
]

export function getInvestmentById(id: string): InvestmentRecord | undefined {
    return INVESTMENT_RECORDS.find(inv => inv.id === id)
}

export function getInvestmentByCapCallId(capitalCallDecisionId: string): InvestmentRecord | undefined {
    return INVESTMENT_RECORDS.find(inv => inv.capitalCallIds.includes(capitalCallDecisionId))
}
