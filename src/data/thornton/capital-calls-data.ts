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
    totalCommitment: number
    calls: CapitalCall[]
}

export const CAPITAL_CALL_COMMITMENTS: CapitalCallCommitment[] = [
    {
        id: 'whitmore-capital-i',
        fundName: 'Whitmore Capital Fund I',
        fundType: 'Private Equity',
        totalCommitment: 10_000_000,
        calls: [
            { id: 'wc1-1', callNumber: 1, dueDate: '2022-03-15', amount: 2_000_000, status: 'paid' },
            { id: 'wc1-2', callNumber: 2, dueDate: '2023-04-01', amount: 2_000_000, status: 'paid' },
            { id: 'wc1-3', callNumber: 3, dueDate: '2024-03-15', amount: 2_000_000, status: 'paid' },
            { id: 'wc1-4', callNumber: 4, dueDate: '2025-09-01', amount: 2_000_000, status: 'paid' },
            { id: 'wc1-5', callNumber: 5, dueDate: '2026-06-01', amount: 2_000_000, status: 'pending' },
        ],
    },
    {
        id: 'whitmore-ventures-ii',
        fundName: 'Whitmore Ventures Fund II',
        fundType: 'Venture Capital',
        totalCommitment: 5_000_000,
        calls: [
            { id: 'wv2-1', callNumber: 1, dueDate: '2023-06-01', amount: 1_000_000, status: 'paid' },
            { id: 'wv2-2', callNumber: 2, dueDate: '2024-06-01', amount: 1_000_000, status: 'paid' },
            { id: 'wv2-3', callNumber: 3, dueDate: '2025-12-01', amount: 1_000_000, status: 'paid' },
            { id: 'wv2-4', callNumber: 4, dueDate: '2026-08-15', amount: 1_000_000, status: 'upcoming' },
            { id: 'wv2-5', callNumber: 5, dueDate: '2027-06-01', amount: 1_000_000, status: 'upcoming' },
        ],
    },
    {
        id: 'whitmore-real-assets-iii',
        fundName: 'Whitmore Real Assets Fund III',
        fundType: 'Real Assets',
        totalCommitment: 7_500_000,
        calls: [
            { id: 'wra3-1', callNumber: 1, dueDate: '2025-06-01', amount: 1_500_000, status: 'paid' },
            { id: 'wra3-2', callNumber: 2, dueDate: '2026-06-01', amount: 1_500_000, status: 'pending' },
            { id: 'wra3-3', callNumber: 3, dueDate: '2027-06-01', amount: 1_500_000, status: 'upcoming' },
            { id: 'wra3-4', callNumber: 4, dueDate: '2028-06-01', amount: 1_500_000, status: 'upcoming' },
            { id: 'wra3-5', callNumber: 5, dueDate: '2029-06-01', amount: 1_500_000, status: 'upcoming' },
        ],
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
