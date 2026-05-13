export type CapitalCallStatus = 'paid' | 'pending' | 'upcoming'

export interface CapitalCall {
    id: string
    callNumber: number
    dueDate: string
    amount: number
    status: CapitalCallStatus
}

export interface CapitalCallCommitment {
    id: string
    fundName: string
    fundType: string
    vintage: string
    totalCommitment: number
    calls: CapitalCall[]
    /** Projected capital calls by year (2026–2031 forecast schedule). */
    yearlyPacing: Record<string, number>
}

export const CAPITAL_CALL_COMMITMENTS: CapitalCallCommitment[] = [
    {
        id: 'greentech-fund-iii',
        fundName: 'Greentech Opp. Fund III',
        fundType: 'Private Equity',
        vintage: '2024',
        totalCommitment: 5_000_000,
        calls: [
            { id: 'gf3-1', callNumber: 1, dueDate: '2024-06-15', amount: 350_000, status: 'paid' },
            { id: 'gf3-2', callNumber: 2, dueDate: '2024-09-15', amount: 350_000, status: 'paid' },
            { id: 'gf3-3', callNumber: 3, dueDate: '2025-01-15', amount: 350_000, status: 'paid' },
            { id: 'gf3-4', callNumber: 4, dueDate: '2025-05-15', amount: 350_000, status: 'paid' },
            { id: 'gf3-5', callNumber: 5, dueDate: '2025-09-15', amount: 350_000, status: 'paid' },
            { id: 'gf3-6', callNumber: 6, dueDate: '2026-01-15', amount: 350_000, status: 'paid' },
            { id: 'gf3-7', callNumber: 7, dueDate: '2026-05-30', amount: 500_000, status: 'pending' },
            { id: 'gf3-8',  callNumber: 8,  dueDate: '2026-09-15', amount: 450_000, status: 'upcoming' },
            { id: 'gf3-9',  callNumber: 9,  dueDate: '2027-03-15', amount: 450_000, status: 'upcoming' },
            { id: 'gf3-10', callNumber: 10, dueDate: '2027-09-15', amount: 350_000, status: 'upcoming' },
            { id: 'gf3-11', callNumber: 11, dueDate: '2028-03-15', amount: 350_000, status: 'upcoming' },
            { id: 'gf3-12', callNumber: 12, dueDate: '2028-09-15', amount: 350_000, status: 'upcoming' },
        ],
        yearlyPacing: { '2026': 500_000, '2027': 900_000, '2028': 700_000 },
    },
    {
        id: 'whitmore-capital-i',
        fundName: 'Whitmore Capital Fund I',
        fundType: 'Private Equity',
        vintage: '2022',
        totalCommitment: 10_000_000,
        calls: [
            { id: 'wc1-1', callNumber: 1, dueDate: '2022-03-15', amount: 2_000_000, status: 'paid' },
            { id: 'wc1-2', callNumber: 2, dueDate: '2023-04-01', amount: 2_000_000, status: 'paid' },
            { id: 'wc1-3', callNumber: 3, dueDate: '2024-03-15', amount: 2_000_000, status: 'paid' },
            { id: 'wc1-4', callNumber: 4, dueDate: '2025-09-01', amount: 2_000_000, status: 'paid' },
            { id: 'wc1-5', callNumber: 5, dueDate: '2026-06-01', amount: 2_000_000, status: 'pending' },
        ],
        yearlyPacing: { '2026': 2_000_000 },
    },
    {
        id: 'whitmore-ventures-ii',
        fundName: 'Whitmore Ventures Fund II',
        fundType: 'Venture Capital',
        vintage: '2023',
        totalCommitment: 5_000_000,
        calls: [
            { id: 'wv2-1', callNumber: 1, dueDate: '2023-06-01', amount: 1_000_000, status: 'paid' },
            { id: 'wv2-2', callNumber: 2, dueDate: '2024-06-01', amount: 1_000_000, status: 'paid' },
            { id: 'wv2-3', callNumber: 3, dueDate: '2025-12-01', amount: 1_000_000, status: 'paid' },
            { id: 'wv2-4', callNumber: 4, dueDate: '2026-08-15', amount: 1_000_000, status: 'upcoming' },
            { id: 'wv2-5', callNumber: 5, dueDate: '2027-06-01', amount: 1_000_000, status: 'upcoming' },
        ],
        yearlyPacing: { '2026': 1_000_000, '2027': 1_000_000 },
    },
    {
        id: 'whitmore-real-assets-iii',
        fundName: 'Whitmore Real Assets Fund III',
        fundType: 'Real Assets',
        vintage: '2025',
        totalCommitment: 7_500_000,
        calls: [
            { id: 'wra3-1', callNumber: 1, dueDate: '2025-06-01', amount: 1_500_000, status: 'paid' },
            { id: 'wra3-2', callNumber: 2, dueDate: '2026-06-01', amount: 1_500_000, status: 'pending' },
            { id: 'wra3-3', callNumber: 3, dueDate: '2027-06-01', amount: 1_500_000, status: 'upcoming' },
            { id: 'wra3-4', callNumber: 4, dueDate: '2028-06-01', amount: 1_500_000, status: 'upcoming' },
            { id: 'wra3-5', callNumber: 5, dueDate: '2029-06-01', amount: 1_500_000, status: 'upcoming' },
        ],
        yearlyPacing: {
            '2026': 500_000,
            '2027': 1_500_000,
            '2028': 2_000_000,
            '2029': 1_000_000,
            '2030': 500_000,
            '2031': 500_000,
        },
    },
]

export function getTotalRemaining(commitments: CapitalCallCommitment[]): number {
    return commitments.reduce((sum, c) => {
        const remaining = c.calls
            .filter(call => call.status !== 'paid')
            .reduce((s, call) => s + call.amount, 0)
        return sum + remaining
    }, 0)
}

export function getTotalCalled(commitment: CapitalCallCommitment): number {
    return commitment.calls
        .filter(c => c.status === 'paid')
        .reduce((s, c) => s + c.amount, 0)
}

export function getNextCall(commitment: CapitalCallCommitment): CapitalCall | null {
    return commitment.calls.find(c => c.status !== 'paid') ?? null
}
