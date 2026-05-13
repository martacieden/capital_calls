import type { CapitalCallDecision, WorkflowStage } from '@/data/thornton/capital-call-decisions-data'

/** Chips for granular workflow badge on Kanban tiles (capital ops); shared with deal highlight strip. */
export const WORKFLOW_STAGE_CHIPS: Array<{
    id: WorkflowStage
    shortLabel: string
    dot: string
    text: string
    bg: string
}> = [
    { id: 'ai-match', shortLabel: 'Upload / AI', dot: '#7C3AED', text: '#4C1D95', bg: '#F3E8FF' },
    { id: 'allocator-review', shortLabel: 'Allocator', dot: '#F59E0B', text: '#92400E', bg: '#FFFBEB' },
    { id: 'approval', shortLabel: 'Approval', dot: '#3B82F6', text: '#1D4ED8', bg: '#EFF6FF' },
    { id: 'liquidity-check', shortLabel: 'Liquidity', dot: '#0EA5E9', text: '#0C4A6E', bg: '#F0F9FF' },
    { id: 'validation', shortLabel: 'Validation', dot: '#8B5CF6', text: '#5B21B6', bg: '#EDE9FE' },
    { id: 'execution', shortLabel: 'Execution', dot: '#059669', text: '#065F46', bg: '#ECFDF5' },
]

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`
    return `$${v.toLocaleString()}`
}

function formatDue(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(iso: string): number {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function CapitalCallKanbanCard({
    decision,
    onOpen,
}: {
    decision: CapitalCallDecision
    onOpen: (id: string) => void
}) {
    const days = daysUntil(decision.dueDate)
    const paidPct = Math.round(decision.drawnBefore * 100)
    const totalPct = Math.round(decision.drawnAfter * 100)
    const isUrgent = days <= 7
    const isWarning = days > 7 && days <= 14

    const wfCfg = WORKFLOW_STAGE_CHIPS.find(s => s.id === decision.stage)

    return (
        <button
            type="button"
            onClick={() => onOpen(decision.id)}
            className="w-full text-left bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-4 flex flex-col gap-3 hover:border-[var(--color-neutral-6)] hover:shadow-[var(--shadow-card-hover)] transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="m-0 text-[13px] font-semibold text-[var(--color-black)] leading-snug line-clamp-2">
                        {decision.fund.replace(', L.P.', '').replace('Whitmore ', '')}
                    </p>
                    <p className="m-0 text-[11px] text-[var(--color-neutral-9)] mt-0.5">
                        Call #{decision.callNumber} of {decision.totalCalls} · {decision.gp.split(' ').slice(0, 2).join(' ')}
                    </p>
                </div>
                <span className="text-[12px] font-mono font-medium text-[var(--color-neutral-9)] shrink-0">{decision.id}</span>
            </div>

            {wfCfg ? (
                <span
                    className="self-start inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: wfCfg.bg, color: wfCfg.text }}
                >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: wfCfg.dot }} />
                    {wfCfg.shortLabel}
                </span>
            ) : null}

            <div>
                <p className="m-0 text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-[var(--color-black)] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                    {fmt(decision.amount)}
                </p>
                <p className="m-0 text-[11px] text-[var(--color-neutral-9)] mt-1">
                    {Math.round((decision.amount / decision.commitment) * 100)}% of {fmt(decision.commitment)} commitment
                </p>
            </div>

            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[var(--color-neutral-9)]">{paidPct}% drawn</span>
                    <span className="text-[10px] font-semibold text-[var(--color-accent-9)]">→ {totalPct}% after</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-neutral-3)] overflow-hidden flex">
                    <div className="h-full" style={{ width: `${paidPct}%`, background: '#005BE2' }} />
                    <div className="h-full" style={{ width: `${totalPct - paidPct}%`, background: '#93C5FD' }} />
                </div>
            </div>

            <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full bg-[var(--color-neutral-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-neutral-10)] truncate max-w-[140px]">
                    {decision.entity}
                </span>
                <span className={`text-[11px] font-semibold shrink-0 ${
                    isUrgent ? 'text-[#B91C1C]' : isWarning ? 'text-[#C05500]' : 'text-[var(--color-neutral-10)]'
                }`}>
                    {isUrgent && '⚠ '}
                    {formatDue(decision.dueDate)}
                    {days > 0 ? ` · ${days}d` : ' · Due today'}
                </span>
            </div>
        </button>
    )
}
