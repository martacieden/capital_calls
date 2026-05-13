export type WorkflowStage =
    | 'ai-match'
    | 'allocator-review'
    | 'approval'
    | 'liquidity-check'
    | 'validation'
    | 'execution'

export type CapitalCallPostDealStatus =
    | 'awaiting-execution'
    | 'uploaded'
    | 'verified'
    | 'ready-to-release'
    | 'paid'

export type StageStatus = 'active' | 'completed' | 'flagged'

// backwards-compatible alias — DecisionsPage still imports this
export type DecisionStatus = 'pending' | 'approved' | 'flagged' | 'wire-ready' | 'completed'

export interface AllocationRow {
    entity: string
    entityType: 'Trust' | 'LLC' | 'Individual'
    allocationPct: number
    allocationAmount: number
    accountLast4: string
}

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
    /** Optional pipeline deal id — when set, Investment hub can surface this call on the matching deal Kanban tile. */
    pipelineDealId?: string
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
    /** 6-stage workflow position */
    stage: WorkflowStage
    stageStatus: StageStatus
    /** kept for DecisionsPage backwards-compat */
    status: DecisionStatus
    allocations: AllocationRow[]
    allocatorNotes?: string
    liquidityCheckResult?: {
        status: 'ok' | 'low' | 'pending'
        availableCash: number
        note: string
    }
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
    postDealStatus?: CapitalCallPostDealStatus
    activityLog: Array<{
        time: string
        actor: string
        action: string
        isAI?: boolean
    }>
}

/** KPI / list filters: pending step in the approvals chain (aligns strip + list totals). */
export function capitalCallHasPendingApprovalStep(d: CapitalCallDecision): boolean {
    return d.approvals.some(a => a.status === 'pending')
}

export const CAPITAL_CALL_DECISIONS: CapitalCallDecision[] = [
    // ── CAPCAL-1 · stage: approval ──────────────────────────────────────────
    {
        id: 'CAPCAL-1',
        pipelineDealId: 'DEAL-009',
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
        stage: 'approval',
        stageStatus: 'active',
        status: 'approved',
        allocations: [
            { entity: 'Thornton Family Trust', entityType: 'Trust', allocationPct: 60, allocationAmount: 300_000, accountLast4: '7723' },
            { entity: 'Real Estate Holding LLC', entityType: 'LLC', allocationPct: 40, allocationAmount: 200_000, accountLast4: '4419' },
        ],
        allocatorNotes: 'Allocation aligned with Q1 rebalancing targets. RE Holding LLC has sufficient liquidity. Recommend approval.',
        approvals: [
            { id: 'ap-1', role: 'Investment lead', name: 'Anastasiya Mudryk', initials: 'AM', color: '#0D9488', status: 'approved', timestamp: '3:59 PM' },
            { id: 'ap-2', role: 'CIO', name: 'Marcus Klein', initials: 'MK', color: '#0F766E', status: 'pending' },
            { id: 'ap-3', role: 'Compliance', name: 'Maya Mehta', initials: 'MM', color: '#2563EB', status: 'pending' },
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
        liquidityCheckResult: {
            status: 'ok',
            // Cash across entities after this wire; UI derives "before" as after + amount.
            availableCash: 12_300_000,
            note: 'Operating accounts + treasury MMF · comfortably covers this call.',
        },
        activityLog: [
            { time: '3:59 PM', actor: 'Anastasiya Mudryk', action: 'Approved · Investment lead sign-off' },
            { time: '3:58 PM', actor: 'Fojo Assistant', action: 'Matched to investment INV-2024-014 · 98% confidence', isAI: true },
            { time: '3:57 PM', actor: 'Anastasiya Mudryk', action: 'Set due date to May 30, 2026' },
            { time: '3:55 PM', actor: 'Anastasiya Mudryk', action: 'Sent for approval · allocation reviewed' },
            { time: '3:51 PM', actor: 'Fojo Assistant', action: 'Extracted 6 fields from PDF · all matched', isAI: true },
            { time: '3:50 PM', actor: 'Anastasiya Mudryk', action: 'Created from Meridian_CapCall_07.pdf' },
        ],
    },

    // ── CAPCAL-2 · stage: approval (mapped to hub IC Review) ─────────────────
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
        stage: 'approval',
        stageStatus: 'active',
        status: 'pending',
        allocations: [
            { entity: 'Thornton Family Trust', entityType: 'Trust', allocationPct: 70, allocationAmount: 612_500, accountLast4: '7723' },
            { entity: 'Thornton Holdings Inc.', entityType: 'LLC', allocationPct: 30, allocationAmount: 262_500, accountLast4: '8841' },
        ],
        approvals: [
            { id: 'ap-4', role: 'Investment lead', name: 'Anastasiya Mudryk', initials: 'AM', color: '#0D9488', status: 'pending' },
            { id: 'ap-5', role: 'CIO', name: 'Marcus Klein', initials: 'MK', color: '#0F766E', status: 'pending' },
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

    // ── CAPCAL-3 · stage: approval (mapped to hub IC Review) ────────────────
    {
        id: 'CAPCAL-3',
        title: 'Q2 capital contribution — PE buyout tranche',
        fund: 'Whitmore Capital Fund I, L.P.',
        entity: 'Thornton Family Trust',
        gp: 'Whitmore Capital Group',
        amount: 2_000_000,
        commitment: 10_000_000,
        callNumber: 5,
        totalCalls: 5,
        drawnBefore: 0.80,
        drawnAfter: 1.00,
        dueDate: '2026-06-01',
        createdDate: '2026-05-05',
        stage: 'approval',
        stageStatus: 'active',
        status: 'approved',
        allocations: [
            { entity: 'Thornton Family Trust', entityType: 'Trust', allocationPct: 55, allocationAmount: 1_100_000, accountLast4: '7723' },
            { entity: 'Family Irrevocable Trust', entityType: 'Trust', allocationPct: 25, allocationAmount: 500_000, accountLast4: '3391' },
            { entity: 'Thornton Holdings Inc.', entityType: 'LLC', allocationPct: 20, allocationAmount: 400_000, accountLast4: '8841' },
        ],
        allocatorNotes: 'Final call on this commitment. All prior 4 calls completed. Allocation split per investment policy.',
        liquidityCheckResult: {
            status: 'pending',
            availableCash: 4_200_000,
            note: 'Cash available. Pending CFO sign-off on Q2 cash reserve threshold.',
        },
        approvals: [
            { id: 'ap-6', role: 'Investment lead', name: 'Anastasiya Mudryk', initials: 'AM', color: '#0D9488', status: 'approved', timestamp: '10:15 AM' },
            { id: 'ap-7', role: 'CIO', name: 'Marcus Klein', initials: 'MK', color: '#0F766E', status: 'approved', timestamp: '11:02 AM' },
        ],
        matchedInvestmentId: 'INV-2022-003',
        matchedInvestmentName: 'Whitmore Capital Fund I',
        matchConfidence: 99,
        priorCallsDrawn: 4,
        pdfName: 'Whitmore_CapCall_05_Final_Trust.pdf',
        pdfPages: 3,
        pdfSizeKb: 201,
        wireInstructions: {
            beneficiary: 'Whitmore Capital Fund I LP',
            bank: 'JPMorgan Chase, NY',
            aba: '021000021',
            account: '···· 2209',
            swift: 'CHASUS33',
            reference: 'CAPCAL-3 / Thornton Family Trust',
        },
        activityLog: [
            { time: '11:02 AM', actor: 'Marcus Klein', action: 'CIO approved · final call on commitment' },
            { time: '10:15 AM', actor: 'Anastasiya Mudryk', action: 'Approved · allocation confirmed' },
            { time: '10:08 AM', actor: 'Anastasiya Mudryk', action: 'Completed allocator review' },
            { time: '9:55 AM', actor: 'Fojo Assistant', action: 'Matched to investment INV-2022-003 · 99% confidence', isAI: true },
            { time: '9:50 AM', actor: 'Anastasiya Mudryk', action: 'Created from Whitmore_CapCall_05.pdf' },
        ],
    },

    // ── CAPCAL-4 · stage: approval (mapped to hub IC Review) ───────────────
    {
        id: 'CAPCAL-4',
        title: 'Capital call — Series B venture deployment',
        fund: 'Whitmore Ventures Fund II, L.P.',
        entity: 'Thornton Holdings Inc.',
        gp: 'Whitmore Capital Group',
        amount: 1_000_000,
        commitment: 5_000_000,
        callNumber: 4,
        totalCalls: 5,
        drawnBefore: 0.60,
        drawnAfter: 0.80,
        dueDate: '2026-08-15',
        createdDate: '2026-05-12',
        stage: 'approval',
        stageStatus: 'active',
        status: 'pending',
        allocations: [
            { entity: 'Thornton Holdings Inc.', entityType: 'LLC', allocationPct: 100, allocationAmount: 1_000_000, accountLast4: '8841' },
        ],
        approvals: [
            { id: 'ap-8', role: 'Investment lead', name: 'Anastasiya Mudryk', initials: 'AM', color: '#0D9488', status: 'pending' },
            { id: 'ap-9', role: 'CIO', name: 'Marcus Klein', initials: 'MK', color: '#0F766E', status: 'pending' },
        ],
        matchedInvestmentId: 'INV-2023-011',
        matchedInvestmentName: 'Whitmore Ventures Fund II',
        matchConfidence: 91,
        priorCallsDrawn: 3,
        pdfName: 'WV2_CapCall_04_ThorntonHoldings.pdf',
        pdfPages: 4,
        pdfSizeKb: 196,
        wireInstructions: {
            beneficiary: 'Whitmore Ventures Fund II LP',
            bank: 'Silicon Valley Bank, CA',
            aba: '121140399',
            account: '···· 5512',
            swift: 'SVBKUS6S',
            reference: 'CAPCAL-4 / Thornton Holdings Inc.',
        },
        activityLog: [
            { time: '2:34 PM', actor: 'Fojo Assistant', action: 'Matched to investment INV-2023-011 · 91% confidence · review recommended', isAI: true },
            { time: '2:30 PM', actor: 'Fojo Assistant', action: 'Extracted 6 fields · 1 field needs review (call number sequence)', isAI: true },
            { time: '2:28 PM', actor: 'Anastasiya Mudryk', action: 'Uploaded WV2_CapCall_04_ThorntonHoldings.pdf' },
        ],
    },

    // ── CAPCAL-5 · stage: execution (mapped to hub Approved) ────────────────
    {
        id: 'CAPCAL-5',
        title: 'Capital call #8 — cleantech growth portfolio',
        fund: 'Greentech Opportunities Fund III, L.P.',
        entity: 'Real Estate Holding LLC',
        gp: 'Meridian Capital Partners',
        amount: 450_000,
        commitment: 5_000_000,
        callNumber: 8,
        totalCalls: 12,
        drawnBefore: 0.52,
        drawnAfter: 0.61,
        dueDate: '2026-09-15',
        createdDate: '2026-05-01',
        stage: 'execution',
        stageStatus: 'active',
        status: 'wire-ready',
        allocations: [
            { entity: 'Thornton Family Trust', entityType: 'Trust', allocationPct: 60, allocationAmount: 270_000, accountLast4: '7723' },
            { entity: 'Real Estate Holding LLC', entityType: 'LLC', allocationPct: 40, allocationAmount: 180_000, accountLast4: '4419' },
        ],
        allocatorNotes: 'Consistent with prior allocation policy. Deployment on track per pacing schedule.',
        liquidityCheckResult: {
            status: 'ok',
            availableCash: 3_800_000,
            note: 'Cash position confirmed. $3.8M available across entities — sufficient for this call.',
        },
        approvals: [
            { id: 'ap-10', role: 'Investment lead', name: 'Anastasiya Mudryk', initials: 'AM', color: '#0D9488', status: 'approved', timestamp: '9:15 AM' },
            { id: 'ap-11', role: 'CIO', name: 'Marcus Klein', initials: 'MK', color: '#0F766E', status: 'approved', timestamp: '10:30 AM' },
        ],
        matchedInvestmentId: 'INV-2024-014',
        matchedInvestmentName: 'Greentech Opp. Fund III',
        matchConfidence: 97,
        priorCallsDrawn: 7,
        pdfName: 'Meridian_CapCall_08_RE-Holding.pdf',
        pdfPages: 4,
        pdfSizeKb: 224,
        wireInstructions: {
            beneficiary: 'Meridian Capital Partners III LP',
            bank: 'First Republic Bank, NY',
            aba: '021000128',
            account: '···· 4419',
            swift: 'FRBKUS00',
            reference: 'CAPCAL-5 / RE Holding LLC',
        },
        activityLog: [
            { time: '11:20 AM', actor: 'Anastasiya Mudryk', action: 'Liquidity confirmed · proceeding to validation' },
            { time: '10:30 AM', actor: 'Marcus Klein', action: 'CIO approved' },
            { time: '9:15 AM', actor: 'Anastasiya Mudryk', action: 'Investment lead approved' },
            { time: '9:05 AM', actor: 'Anastasiya Mudryk', action: 'Allocation review complete' },
            { time: '8:55 AM', actor: 'Fojo Assistant', action: 'Matched to INV-2024-014 · 97% confidence', isAI: true },
            { time: '8:50 AM', actor: 'Anastasiya Mudryk', action: 'Created from Meridian_CapCall_08.pdf' },
        ],
    },

    // ── CAPCAL-6 · stage: execution ──────────────────────────────────────────
    {
        id: 'CAPCAL-6',
        title: 'Capital call — real assets Q1 tranche',
        fund: 'Whitmore Real Assets Fund III, L.P.',
        entity: 'Family Irrevocable Trust',
        gp: 'Whitmore Capital Group',
        amount: 875_000,
        commitment: 8_750_000,
        callNumber: 4,
        totalCalls: 8,
        drawnBefore: 0.32,
        drawnAfter: 0.42,
        dueDate: '2026-05-20',
        createdDate: '2026-04-25',
        stage: 'execution',
        stageStatus: 'active',
        status: 'wire-ready',
        allocations: [
            { entity: 'Family Irrevocable Trust', entityType: 'Trust', allocationPct: 65, allocationAmount: 568_750, accountLast4: '3391' },
            { entity: 'Thornton Family Trust', entityType: 'Trust', allocationPct: 35, allocationAmount: 306_250, accountLast4: '7723' },
        ],
        allocatorNotes: 'Wire instructions verified against prior call. No changes from Whitmore Capital Group.',
        liquidityCheckResult: {
            status: 'ok',
            availableCash: 5_100_000,
            note: 'Strong liquidity position. Both trusts have confirmed cash availability.',
        },
        approvals: [
            { id: 'ap-12', role: 'Investment lead', name: 'Anastasiya Mudryk', initials: 'AM', color: '#0D9488', status: 'approved', timestamp: '2:10 PM' },
            { id: 'ap-13', role: 'CIO', name: 'Marcus Klein', initials: 'MK', color: '#0F766E', status: 'approved', timestamp: '3:45 PM' },
            { id: 'ap-14', role: 'CFO / Treasury', name: 'Diana Park', initials: 'DP', color: '#7C3AED', status: 'approved', timestamp: '4:20 PM' },
        ],
        matchedInvestmentId: 'INV-2023-007',
        matchedInvestmentName: 'Whitmore Real Assets III',
        matchConfidence: 96,
        priorCallsDrawn: 3,
        pdfName: 'Whitmore_CapCall_04_FamilyIrrev.pdf',
        pdfPages: 3,
        pdfSizeKb: 191,
        wireInstructions: {
            beneficiary: 'Whitmore Real Assets Fund III LP',
            bank: 'JPMorgan Chase, NY',
            aba: '021000021',
            account: '···· 7732',
            swift: 'CHASUS33',
            reference: 'CAPCAL-6 / Family Irrevocable Trust',
        },
        activityLog: [
            { time: '4:20 PM', actor: 'Diana Park', action: 'CFO / Treasury approved · ready for execution' },
            { time: '3:45 PM', actor: 'Marcus Klein', action: 'CIO approved' },
            { time: '3:12 PM', actor: 'Finance Ops', action: 'Document validated · wire instructions confirmed' },
            { time: '2:10 PM', actor: 'Anastasiya Mudryk', action: 'Investment lead approved' },
            { time: '1:55 PM', actor: 'Anastasiya Mudryk', action: 'Liquidity confirmed · $5.1M available' },
            { time: '1:30 PM', actor: 'Anastasiya Mudryk', action: 'Allocation reviewed and confirmed' },
            { time: '9:05 AM', actor: 'Fojo Assistant', action: 'Matched to INV-2023-007 · 96% confidence', isAI: true },
            { time: '9:00 AM', actor: 'Anastasiya Mudryk', action: 'Created from Whitmore_CapCall_04.pdf' },
        ],
    },
]

export function getDecisionById(id: string): CapitalCallDecision | undefined {
    return CAPITAL_CALL_DECISIONS.find(d => d.id === id)
}

export function getCapitalCallPostDealStatus(d: CapitalCallDecision): CapitalCallPostDealStatus {
    if (d.postDealStatus) return d.postDealStatus
    if (d.status === 'completed') return 'paid'
    if (d.status === 'wire-ready' || d.stage === 'execution') return 'ready-to-release'
    if (d.stage === 'validation' || d.stage === 'liquidity-check' || d.stage === 'approval') return 'verified'
    if (d.stage === 'allocator-review') return 'uploaded'
    return 'awaiting-execution'
}
