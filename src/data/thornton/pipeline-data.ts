export type PipelineStage = 'sourcing' | 'initial-review' | 'due-diligence' | 'ic-review' | 'approved' | 'declined'

export interface PipelineApproval {
    role: string
    name: string
    status: 'approved' | 'pending' | 'declined'
    date?: string
}

export interface PipelineDeal {
    id: string
    dealName: string
    company: string
    sector: string
    stage: PipelineStage
    targetAmount: number
    projectedIrr: string | null
    projectedMoic: string | null
    sponsor: string
    assignee: string
    sourceDate: string
    lastActivity: string
    priority: 'high' | 'medium' | 'low'
    aiScore: number
    tags: string[]
    notes?: string
    missingDocs: string[]
    approvals: PipelineApproval[]
}

export const PIPELINE_DEALS: PipelineDeal[] = [
    {
        id: 'DEAL-001',
        dealName: 'BioNova Series C',
        company: 'BioNova Capital',
        sector: 'Healthcare',
        stage: 'sourcing',
        targetAmount: 3_000_000,
        projectedIrr: '+18–22%',
        projectedMoic: '2.5–3.0x',
        sponsor: 'BioNova Capital Partners',
        assignee: 'Sarah W.',
        sourceDate: '2026-04-28',
        lastActivity: '2026-05-10',
        priority: 'high',
        aiScore: 72,
        tags: ['Healthcare', 'Series C', 'ESG'],
        notes: 'Introduced via Meridian network. Targeting FDA-approved diagnostics companies.',
        missingDocs: ['Term Sheet', 'Financial Model', 'Cap Table'],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'pending' },
        ],
    },
    {
        id: 'DEAL-002',
        dealName: 'Atlantic Infrastructure Fund I',
        company: 'Atlantic Asset Management',
        sector: 'Infrastructure',
        stage: 'sourcing',
        targetAmount: 10_000_000,
        projectedIrr: '+9–12%',
        projectedMoic: '1.5–1.8x',
        sponsor: 'Atlantic Asset Management LLC',
        assignee: 'James C.',
        sourceDate: '2026-05-01',
        lastActivity: '2026-05-12',
        priority: 'medium',
        aiScore: 85,
        tags: ['Infrastructure', 'Real Assets', 'Global'],
        notes: 'Global infrastructure fund with strong secondary market position.',
        missingDocs: ['Fund Prospectus', 'Due Diligence Report'],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'pending' },
        ],
    },
    {
        id: 'DEAL-003',
        dealName: 'Horizon Tech Growth Fund II',
        company: 'Horizon Ventures',
        sector: 'Technology',
        stage: 'initial-review',
        targetAmount: 2_000_000,
        projectedIrr: '+22–28%',
        projectedMoic: '2.8–3.5x',
        sponsor: 'Horizon Ventures LP',
        assignee: 'Emily R.',
        sourceDate: '2026-04-10',
        lastActivity: '2026-05-08',
        priority: 'medium',
        aiScore: 68,
        tags: ['Technology', 'VC', 'Growth'],
        notes: 'Early-stage fund with strong track record but high geographic concentration in Bay Area.',
        missingDocs: ['LP Agreement Draft', 'Audited Financials 2024'],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'pending' },
            { role: 'CFO', name: 'James Chen', status: 'pending' },
        ],
    },
    {
        id: 'DEAL-004',
        dealName: 'SolarGrid Real Assets Fund',
        company: 'SolarGrid Capital',
        sector: 'Real Assets / ESG',
        stage: 'due-diligence',
        targetAmount: 5_000_000,
        projectedIrr: '+13–16%',
        projectedMoic: '1.7–2.0x',
        sponsor: 'SolarGrid Capital Group',
        assignee: 'Sarah W.',
        sourceDate: '2026-03-15',
        lastActivity: '2026-05-11',
        priority: 'high',
        aiScore: 91,
        tags: ['ESG', 'Real Assets', 'Solar', 'Global'],
        notes: 'Exceptional ESG profile. Active due diligence — legal team reviewing LPA.',
        missingDocs: [],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'approved', date: '2026-04-20' },
            { role: 'CFO', name: 'James Chen', status: 'approved', date: '2026-04-22' },
            { role: 'Legal Counsel', name: 'Marcus Williams', status: 'pending' },
        ],
    },
    {
        id: 'DEAL-005',
        dealName: 'Pacific Credit Opportunities II',
        company: 'Pacific Capital Partners',
        sector: 'Private Credit',
        stage: 'ic-review',
        targetAmount: 7_500_000,
        projectedIrr: '+10–14%',
        projectedMoic: '1.4–1.6x',
        sponsor: 'Pacific Capital Partners LLC',
        assignee: 'James C.',
        sourceDate: '2026-02-18',
        lastActivity: '2026-05-09',
        priority: 'high',
        aiScore: 79,
        tags: ['Private Credit', 'North America', 'Senior Secured'],
        notes: 'Senior secured credit strategy. IC presentation scheduled for May 20.',
        missingDocs: ['Audited Financials 2025'],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'approved', date: '2026-05-02' },
            { role: 'CFO', name: 'James Chen', status: 'approved', date: '2026-05-04' },
            { role: 'Legal Counsel', name: 'Marcus Williams', status: 'approved', date: '2026-05-06' },
            { role: 'IC Review', name: 'Investment Committee', status: 'pending' },
        ],
    },
    {
        id: 'DEAL-006',
        dealName: 'Meridian Growth Equity IV',
        company: 'Meridian Capital Partners',
        sector: 'Private Equity',
        stage: 'approved',
        targetAmount: 4_000_000,
        projectedIrr: '+16–20%',
        projectedMoic: '2.2–2.8x',
        sponsor: 'Meridian Capital Partners',
        assignee: 'Emily R.',
        sourceDate: '2025-11-10',
        lastActivity: '2026-04-30',
        priority: 'medium',
        aiScore: 94,
        tags: ['Private Equity', 'Growth', 'North America'],
        notes: 'Approved in Q1 2026. Subscription documents being processed.',
        missingDocs: [],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'approved', date: '2026-03-10' },
            { role: 'CFO', name: 'James Chen', status: 'approved', date: '2026-03-12' },
            { role: 'Legal Counsel', name: 'Marcus Williams', status: 'approved', date: '2026-03-15' },
            { role: 'IC Review', name: 'Investment Committee', status: 'approved', date: '2026-03-20' },
        ],
    },
    {
        id: 'DEAL-007',
        dealName: 'Whitmore Ventures Fund IV',
        company: 'Whitmore Capital Group',
        sector: 'Venture Capital',
        stage: 'approved',
        targetAmount: 1_500_000,
        projectedIrr: '+25–35%',
        projectedMoic: '3.0–5.0x',
        sponsor: 'Whitmore Capital Group',
        assignee: 'Sarah W.',
        sourceDate: '2025-12-05',
        lastActivity: '2026-04-28',
        priority: 'low',
        aiScore: 88,
        tags: ['Venture Capital', 'Technology', 'Global'],
        notes: 'Strategic relationship with Whitmore. Venture allocation from Thornton Holdings.',
        missingDocs: [],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'approved', date: '2026-02-15' },
            { role: 'CFO', name: 'James Chen', status: 'approved', date: '2026-02-16' },
            { role: 'Legal Counsel', name: 'Marcus Williams', status: 'approved', date: '2026-02-18' },
            { role: 'IC Review', name: 'Investment Committee', status: 'approved', date: '2026-02-22' },
        ],
    },
    {
        id: 'DEAL-009',
        dealName: 'Greentech Opportunities Fund III',
        company: 'Meridian Capital Partners',
        sector: 'Real Assets / ESG',
        stage: 'ic-review',
        targetAmount: 5_000_000,
        projectedIrr: '+13–17%',
        projectedMoic: '1.9–2.3x',
        sponsor: 'Meridian Capital Partners',
        assignee: 'Sarah M.',
        sourceDate: '2025-10-08',
        lastActivity: '2026-05-08',
        priority: 'high',
        aiScore: 96,
        tags: ['ESG', 'Real Assets', 'Fund III'],
        notes: 'Active allocator review; capital notice #7 in workflow on IC Review lane.',
        missingDocs: [],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'approved', date: '2026-04-28' },
            { role: 'CFO', name: 'James Chen', status: 'approved', date: '2026-05-02' },
            { role: 'IC Review', name: 'Investment Committee', status: 'pending' },
        ],
    },
    {
        id: 'DEAL-008',
        dealName: 'UrbanTech SPAC II',
        company: 'UrbanTech Capital',
        sector: 'Technology',
        stage: 'declined',
        targetAmount: 3_000_000,
        projectedIrr: null,
        projectedMoic: null,
        sponsor: 'UrbanTech Capital LLC',
        assignee: 'James C.',
        sourceDate: '2026-01-20',
        lastActivity: '2026-03-15',
        priority: 'low',
        aiScore: 44,
        tags: ['SPAC', 'Technology'],
        notes: 'Declined due to risk profile mismatch and unfavorable SPAC structure.',
        missingDocs: [],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'declined', date: '2026-03-15' },
        ],
    },
]

export function getPipelineDealById(id: string): PipelineDeal | undefined {
    return PIPELINE_DEALS.find(d => d.id === id)
}
