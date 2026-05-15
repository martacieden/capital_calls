import type { CapitalCallCommitment } from '@/data/thornton/capital-calls-data'

export type CumulativeYearPoint = { year: string; called: number; uncalled: number }

/**
 * Cumulative deployment from **paid** calls only (by due date),
 * so "remaining commitment" decreases as capital is drawn — avoids double-counting yearlyPacing vs paid calls.
 */
export function buildCumulativePaidByYear(
    commitments: CapitalCallCommitment[],
    forecastYears: readonly string[],
    totalCommittedOverride?: number,
): CumulativeYearPoint[] {
    const totalCommitted =
        totalCommittedOverride ??
        commitments.reduce((s, c) => s + c.totalCommitment, 0)

    return forecastYears.map(year => {
        const yearEnd = `${year}-12-31`
        let cumulativePaid = 0
        for (const fund of commitments) {
            for (const call of fund.calls) {
                if (call.status !== 'paid') continue
                if (call.dueDate <= yearEnd) cumulativePaid += call.amount
            }
        }
        return {
            year,
            called: cumulativePaid,
            uncalled: Math.max(0, totalCommitted - cumulativePaid),
        }
    })
}

/**
 * Portfolio **forecast** cumulative deployment on Capital Activities: paid-in through the year before the
 * forecast window, then plus each fund's `yearlyPacing` for 2026→… so "Called" rises and "Uncalled" falls
 * with a shared cap (matches cumulative area mock).
 */
export function buildCumulativeProjectionByYear(
    commitments: CapitalCallCommitment[],
    forecastYears: readonly string[],
    totalCommittedOverride?: number,
): CumulativeYearPoint[] {
    if (forecastYears.length === 0) return []

    const totalCap =
        totalCommittedOverride ??
        commitments.reduce((s, c) => s + c.totalCommitment, 0)

    const firstYear = Number(forecastYears[0])
    const baselineCutoff = `${firstYear - 1}-12-31`

    let baselinePaid = 0
    for (const fund of commitments) {
        for (const call of fund.calls) {
            if (call.status !== 'paid') continue
            if (call.dueDate <= baselineCutoff) baselinePaid += call.amount
        }
    }

    let runningCalled = baselinePaid
    return forecastYears.map(year => {
        let yearDraw = 0
        for (const fund of commitments) {
            yearDraw += fund.yearlyPacing[year] ?? 0
        }
        runningCalled = Math.min(totalCap, runningCalled + yearDraw)
        return {
            year,
            called: runningCalled,
            uncalled: Math.max(0, totalCap - runningCalled),
        }
    })
}

/**
 * Adds a modeled commitment's pacing on top of baseline totals for stacked bar preview.
 */
export function mergeScenarioAnnualTotals(
    baseAnnualByYear: Record<string, number>,
    scenarioPacingByYear: Record<string, number>,
    forecastYears: readonly string[],
): Record<string, number> {
    const next = { ...baseAnnualByYear }
    for (const y of forecastYears) {
        next[y] = (next[y] ?? 0) + (scenarioPacingByYear[y] ?? 0)
    }
    return next
}

export function addScenarioToCumulative(
    baselinePoints: CumulativeYearPoint[],
    scenarioCommitment: { totalCommitment: number; yearlyPacing: Record<string, number> },
    totalPortfolioCommitted: number,
): CumulativeYearPoint[] {
    let runningScenario = 0
    return baselinePoints.map((p) => {
        runningScenario += scenarioCommitment.yearlyPacing[p.year] ?? 0
        const called = p.called + runningScenario
        const cap = totalPortfolioCommitted + scenarioCommitment.totalCommitment
        return {
            year: p.year,
            called,
            uncalled: Math.max(0, cap - called),
        }
    })
}
