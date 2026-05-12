export type DecisionStatus = 'pending' | 'approved' | 'flagged' | 'wire-ready' | 'completed'

export interface ApprovalStep {
    id: string
    role: string
    name: string
    initials: string
    color: string
    status: 'approved' | 'pending' | 'auto'
    timestamp?: string
}

export interface CapitalCallDecision {
    id: string
    title: string
    fund: string
    entity: string
    gp: string
    amount: number
    commitment: number
    callNumber: number
    totalCalls: number
    drawnBefore: number
    drawnAfter: number
    dueDate: string
    createdDate: string
    status: DecisionStatus
    approvals: ApprovalStep[]
    matchedInvestmentId: string
    matchedInvestmentName: string
    matchConfidence: number
    priorCallsDrawn: number
    pdfName: string
    pdfPages: number
    pdfSizeKb: number
    wireInstructions: {
        beneficiary: string
        bank: string
        aba: string
        account: string
        swift: string
        reference: string
    }
    activityLog: Array<{
        time: string
        actor: string
        action: string
        isAI?: boolean
    }>
}

export const CAPITAL_CALL_DECISIONS: CapitalCallDecision[] = [
    {
        id: 'CAPCAL-1',
        title: 'Capital call for $500k for eco companies',
        fund: 'Greentech Opportunities Fund III, L.P.',
        entity: 'Real Estate Holding LLC',
        gp: 'Meridian Capital Partners',
        amount: 500_000,
        commitment: 5_000_000,
        callNumber: 7,
        totalCalls: 12,
        drawnBefore: 0.42,
        drawnAfter: 0.52,
        dueDate: '2026-05-30',
        createdDate: '2026-05-08',
        status: 'approved',
        approvals: [
            {
                id: 'ap-1',
                role: 'Investment lead',
                name: 'Anastasiya Mudryk',
                initials: 'AM',
                color: '#0D9488',
                status: 'approved',
                timestamp: '3:59 PM',
            },
            {
                id: 'ap-2',
                role: 'CFO',
                name: 'Marcus Klein',
                initials: 'MK',
                color: '#0F766E',
                status: 'pending',
            },
            {
                id: 'ap-3',
                role: 'Compliance',
                name: 'Maya Mehta',
                initials: 'MM',
                color: '#2563EB',
                status: 'pending',
            },
        ],
        matchedInvestmentId: 'INV-2024-014',
        matchedInvestmentName: 'Greentech Opp. Fund III',
        matchConfidence: 98,
        priorCallsDrawn: 6,
        pdfName: 'Meridian_CapCall_07_RE-Holding.pdf',
        pdfPages: 4,
        pdfSizeKb: 218,
        wireInstructions: {
            beneficiary: 'Meridian Capital Partners III LP',
            bank: 'First Republic Bank, NY',
            aba: '021000128',
            account: '···· 4419',
            swift: 'FRBKUS00',
            reference: 'CAPCAL-1 / RE Holding LLC',
        },
        activityLog: [
            { time: '3:59 PM', actor: 'Anastasiya Mudryk', action: 'Approved · Default Approval' },
            { time: '3:58 PM', actor: 'Fojo Assistant', action: 'Matched to investment INV-2024-014 · 98% confidence', isAI: true },
            { time: '3:57 PM', actor: 'Anastasiya Mudryk', action: 'Set due date to May 30, 2026' },
            { time: '3:55 PM', actor: 'Anastasiya Mudryk', action: 'Created from Meridian_CapCall_07.pdf' },
        ],
    },
    {
        id: 'CAPCAL-2',
        title: 'Capital call — Q2 drawdown for infrastructure',
        fund: 'Whitmore Real Assets Fund III, L.P.',
        entity: 'Thornton Family Trust',
        gp: 'Whitmore Capital Group',
        amount: 875_000,
        commitment: 8_750_000,
        callNumber: 3,
        totalCalls: 8,
        drawnBefore: 0.22,
        drawnAfter: 0.32,
        dueDate: '2026-06-15',
        createdDate: '2026-05-10',
        status: 'pending',
        approvals: [
            {
                id: 'ap-4',
                role: 'Investment lead',
                name: 'Anastasiya Mudryk',
                initials: 'AM',
                color: '#0D9488',
                status: 'pending',
            },
            {
                id: 'ap-5',
                role: 'CFO',
                name: 'Marcus Klein',
                initials: 'MK',
                color: '#0F766E',
                status: 'pending',
            },
        ],
        matchedInvestmentId: 'INV-2023-007',
        matchedInvestmentName: 'Whitmore Real Assets III',
        matchConfidence: 94,
        priorCallsDrawn: 2,
        pdfName: 'Whitmore_CapCall_03_ThorntonTrust.pdf',
        pdfPages: 3,
        pdfSizeKb: 184,
        wireInstructions: {
            beneficiary: 'Whitmore Real Assets Fund III LP',
            bank: 'JPMorgan Chase, NY',
            aba: '021000021',
            account: '···· 7732',
            swift: 'CHASUS33',
            reference: 'CAPCAL-2 / Thornton Family Trust',
        },
        activityLog: [
            { time: '9:12 AM', actor: 'Fojo Assistant', action: 'Matched to investment INV-2023-007 · 94% confidence', isAI: true },
            { time: '9:10 AM', actor: 'Anastasiya Mudryk', action: 'Created from Whitmore_CapCall_03.pdf' },
        ],
    },
]

export function getDecisionById(id: string): CapitalCallDecision | undefined {
    return CAPITAL_CALL_DECISIONS.find(d => d.id === id)
}
