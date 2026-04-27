import type { PriorityStatus } from '@/data/types'

const TIER_ORDER: Record<string, number> = {
    'missing-insurance': 0,
    'expiring-soon': 0,
    'stale-valuation': 0,
    'missing-documents': 1,
    'updated': 3,
}

/** Sort items by priority status: AI-flagged first, then recently edited, then recently viewed, then everything else. */
export function sortByPriority<T extends { priorityStatus?: PriorityStatus }>(items: T[]): T[] {
    return [...items].sort((a, b) => {
        const aTier = a.priorityStatus ? (TIER_ORDER[a.priorityStatus.type] ?? 99) : 99
        const bTier = b.priorityStatus ? (TIER_ORDER[b.priorityStatus.type] ?? 99) : 99
        return aTier - bTier
    })
}
