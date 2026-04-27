import type { DistributionEvent } from '@/data/types'

// Re-export from consolidated formatters
export { formatAmount } from './format'

export function getTypeLabel(event: DistributionEvent): string {
    if (event.triggerCategory) return event.triggerCategory
    if (event.triggerType === 'Age' && event.triggerAge != null) return `Age ${event.triggerAge}`
    return 'Distribution'
}

// getAmountVariant removed — amount styling now handled inline via cn()

export function shouldShowAmount(amount: number | string): boolean {
    if (typeof amount === 'number') return amount > 0
    return amount !== ''
}

// Group events by year for year markers on the rail
export function groupByYear(events: DistributionEvent[]): Map<number, DistributionEvent[]> {
    const map = new Map<number, DistributionEvent[]>()
    for (const e of events) {
        const y = e.triggerYear ?? 0
        if (!map.has(y)) map.set(y, [])
        map.get(y)!.push(e)
    }
    return map
}
