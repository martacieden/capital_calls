import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { IconPencil, IconTrash, IconPlus, IconChevronLeft, IconChevronDown, IconX, IconArrowRight, IconCloudUpload, IconBolt } from '@tabler/icons-react'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { ToolbarSearchInput } from '@/components/atoms/ToolbarSearchInput'
import { ToolbarDropdown } from '@/components/atoms/ToolbarDropdown'
import { UploadModal } from '@/components/pages/DecisionsPage'
import type { CapitalChartDrill } from '@/components/organisms/CapitalActivitiesChartDetailPanel'
import { CapitalActivitiesForecastCharts } from '@/components/organisms/CapitalActivitiesForecastCharts'
import { cn } from '@/lib/utils'
import { showToast } from '@/components/atoms/Toast'
import {
    CAPITAL_CALL_COMMITMENTS,
    getTotalCalled,
    getTotalRemaining,
    type CapitalCallStatus,
} from '@/data/thornton/capital-calls-data'
import {
    CAPITAL_CALL_DECISIONS,
    capitalCallHasPendingApprovalStep,
    getCapitalCallPostDealStatus,
    type CapitalCallDecision,
    type CapitalCallPostDealStatus,
} from '@/data/thornton/capital-call-decisions-data'

// ─── constants ───────────────────────────────────────────────────────────────

const FORECAST_YEARS = ['2026', '2027', '2028', '2029', '2030', '2031']
const CURRENT_YEAR = String(new Date().getFullYear())

const FUND_COLORS: Record<string, string> = {
    'greentech-fund-iii': '#059669',
    'whitmore-capital-i': '#005BE2',
    'whitmore-ventures-ii': '#8B5CF6',
    'whitmore-real-assets-iii': '#93C5FD',
    __modeled__: '#64748B',
}

/** Links a portfolio commitment row to a capital-call detail record (mock data). */
const COMMITMENT_ID_TO_CAPCALL_DETAIL: Record<string, string> = {
    'greentech-fund-iii': 'CAPCAL-1',
    'whitmore-capital-i': 'CAPCAL-3',
    'whitmore-ventures-ii': 'CAPCAL-4',
    'whitmore-real-assets-iii': 'CAPCAL-2',
}

/** Maps a notice `fund` label (mock legal names) to a portfolio commitment id. */
function commitmentIdForNoticeFund(fundLabel: string): string | undefined {
    const n = fundLabel.toLowerCase()
    if (n.includes('greentech')) return 'greentech-fund-iii'
    if (n.includes('whitmore capital fund i')) return 'whitmore-capital-i'
    if (n.includes('whitmore ventures fund ii')) return 'whitmore-ventures-ii'
    if (n.includes('whitmore real assets fund iii')) return 'whitmore-real-assets-iii'
    return undefined
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`
    return `$${v.toLocaleString()}`
}

function fmtShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function labelForCallStatus(status: CapitalCallStatus): string {
    if (status === 'paid') return 'Paid'
    if (status === 'pending') return 'In flight'
    return 'Scheduled'
}

const NOTICE_STATUS_META: Record<CapitalCallPostDealStatus, { label: string; dot: string; bg: string; text: string }> = {
    'awaiting-execution': { label: 'Awaiting e-sign', dot: '#9CA3AF', bg: '#F9FAFB', text: '#374151' },
    'uploaded': { label: 'Uploaded', dot: '#2563EB', bg: '#EFF6FF', text: '#1D4ED8' },
    'verified': { label: 'Verified', dot: '#7C3AED', bg: '#F5F3FF', text: '#5B21B6' },
    'ready-to-release': { label: 'Ready to release', dot: '#D97706', bg: '#FFF7ED', text: '#9A3412' },
    'paid': { label: 'Paid', dot: '#059669', bg: '#ECFDF5', text: '#065F46' },
}

const NOTICE_STATUS_OPTIONS: Array<'all' | CapitalCallPostDealStatus> = [
    'all',
    'awaiting-execution',
    'uploaded',
    'verified',
    'ready-to-release',
    'paid',
]

// ─── overview tiles ───────────────────────────────────────────────────────────

function OverviewKpiTile({
    label,
    value,
    sub,
    valueTone,
    surfaceTone,
    onClick,
}: {
    label: string
    value: string
    sub?: string
    valueTone?: 'default' | 'accent' | 'success'
    /** Classic dashboard: tinted card (pending / open notices / ready). */
    surfaceTone?: 'default' | 'info' | 'success'
    onClick?: () => void
}) {
    const tone =
        valueTone === 'accent'
            ? 'text-[var(--color-accent-9)]'
            : valueTone === 'success'
              ? 'text-[#059669]'
              : 'text-[var(--color-black)]'
    const surface =
        surfaceTone === 'info'
            ? '!border-[#D8E8FF] bg-[var(--color-blue-1)]'
            : surfaceTone === 'success'
                ? '!border-[#BBF7D0] bg-[#F0FDF4]'
                : ''
    const className = cn(
        'group relative bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-lg)] px-3 py-2.5 min-w-0 transition-colors',
        surface,
        onClick && 'cursor-pointer !border-[#D8E8FF] bg-[var(--color-blue-1)] text-left outline-none hover:!border-[#BFD8FF] hover:bg-[#F7FAFF] focus:outline-none focus:!border-[#BFD8FF] focus-visible:outline-none focus-visible:!border-[#BFD8FF] focus-visible:bg-[#F7FAFF] focus-visible:ring-0',
    )

    const content = (
        <>
            <p className="m-0 text-[9px] font-semibold uppercase tracking-[0.07em] text-[var(--color-neutral-9)] truncate" title={label}>
                {label}
            </p>
            <p
                className={cn(
                    'm-0 text-[17px] sm:text-[18px] font-semibold tabular-nums tracking-[-0.015em] leading-none mt-1',
                    tone,
                )}
                style={{ fontFamily: 'var(--font-display)' }}
            >
                {value}
            </p>
            {sub ? <p className="m-0 text-[10px] text-[var(--color-neutral-9)] mt-1 leading-snug truncate">{sub}</p> : null}
        </>
    )

    if (onClick) {
        return (
            <button type="button" className={className} onClick={onClick}>
                {content}
            </button>
        )
    }

    return (
        <div className={className}>
            {content}
        </div>
    )
}

const DEFAULT_PACING_PCTS = [25, 25, 20, 15, 10, 5] as const

export type ModeledCommitmentPayload = {
    fundName: string
    totalCommitment: number
    yearlyPacing: Record<string, number>
}

export function AddCommitmentModal({
    onClose,
    onModeled,
}: {
    onClose: () => void
    onModeled?: (payload: ModeledCommitmentPayload) => void
}) {
    const [fundName, setFundName] = useState('')
    const [commitment, setCommitment] = useState('10000000')
    const [currency, setCurrency] = useState('USD')
    const [vintageYear, setVintageYear] = useState('2026')
    const [firstCallYear, setFirstCallYear] = useState('2026')
    const [alreadyCalled, setAlreadyCalled] = useState('0')
    const [customPacing, setCustomPacing] = useState(false)
    const [pacingPcts, setPacingPcts] = useState<number[]>([...DEFAULT_PACING_PCTS])
    const [notes, setNotes] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const total = Number.parseInt(commitment.replace(/\D/g, ''), 10) || 0
        const yearlyPacing: Record<string, number> = {}
        let sumPct = pacingPcts.reduce((a, b) => a + b, 0)
        if (sumPct <= 0) sumPct = 100
        FORECAST_YEARS.forEach((y, i) => {
            const pct = (pacingPcts[i] ?? 0) / sumPct
            yearlyPacing[y] = Math.round(total * pct)
        })
        onModeled?.({
            fundName: fundName.trim() || 'Modeled commitment',
            totalCommitment: total,
            yearlyPacing,
        })
        showToast('Scenario saved — charts updated (demo)', 'success')
        onClose()
    }

    function setPacingAt(index: number, raw: string) {
        const n = raw.replace(/\D/g, '')
        if (n === '') {
            setPacingPcts(prev => {
                const next = [...prev]
                next[index] = 0
                return next
            })
            return
        }
        const v = Math.min(100, Number.parseInt(n, 10) || 0)
        setPacingPcts(prev => {
            const next = [...prev]
            next[index] = v
            return next
        })
    }

    const inputClass =
        'w-full rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-3 py-2.5 text-[14px] text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] transition-[background,border-color,box-shadow] focus:border-[var(--color-accent-9)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-9)]'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8" onClick={onClose}>
            <div
                className="relative w-full max-w-[560px] max-h-[min(92vh,880px)] overflow-y-auto rounded-[var(--radius-xl)] bg-white shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 z-[1] flex items-start justify-between gap-4 border-b border-[var(--color-neutral-4)] bg-white px-6 py-5">
                    <h2 className="m-0 font-display text-[24px] font-black leading-tight tracking-[-0.02em] text-[var(--color-gray-12)]">
                        Model new commitment
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-neutral-9)] transition-colors hover:bg-[var(--color-neutral-3)]"
                        aria-label="Close"
                    >
                        <IconX size={20} stroke={2} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">
                    <p className="m-0 text-[13px] leading-snug text-[var(--color-neutral-10)]">
                        Model a <strong>future</strong> commitment before you invest. Adjust pacing to preview annual
                        calls, remaining commitment, and liquidity impact on the charts — nothing is booked until you confirm a real subscription.
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="commitment-fund-name" className="text-[12px] font-medium text-[var(--color-neutral-11)]">
                            Fund name
                        </label>
                        <input
                            id="commitment-fund-name"
                            type="text"
                            autoComplete="off"
                            placeholder="e.g. Sequoia Capital XVIII"
                            value={fundName}
                            onChange={e => setFundName(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="commitment-amount" className="text-[12px] font-medium text-[var(--color-neutral-11)]">
                                Commitment
                            </label>
                            <input
                                id="commitment-amount"
                                type="text"
                                inputMode="numeric"
                                placeholder="e.g. 10000000"
                                value={commitment}
                                onChange={e => setCommitment(e.target.value.replace(/[^\d]/g, ''))}
                                className={inputClass}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="commitment-currency" className="text-[12px] font-medium text-[var(--color-neutral-11)]">
                                Currency
                            </label>
                            <div className="relative">
                                <select
                                    id="commitment-currency"
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value)}
                                    className={cn(inputClass, 'cursor-pointer appearance-none pr-10')}
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                                <IconChevronDown
                                    size={18}
                                    stroke={2}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-9)]"
                                    aria-hidden
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="vintage-year" className="text-[12px] font-medium text-[var(--color-neutral-11)]">
                                Vintage year
                            </label>
                            <input
                                id="vintage-year"
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                value={vintageYear}
                                onChange={e => setVintageYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className={inputClass}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="first-call-year" className="text-[12px] font-medium text-[var(--color-neutral-11)]">
                                First call year
                            </label>
                            <input
                                id="first-call-year"
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                value={firstCallYear}
                                onChange={e => setFirstCallYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="already-called" className="text-[12px] font-medium text-[var(--color-neutral-11)]">
                            Already called to date
                        </label>
                        <input
                            id="already-called"
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={alreadyCalled}
                            onChange={e => setAlreadyCalled(e.target.value.replace(/[^\d]/g, ''))}
                            className={inputClass}
                        />
                    </div>

                    <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-3)] bg-[var(--color-neutral-2)]/50 px-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="m-0 text-[12px] font-medium text-[var(--color-neutral-11)]">Custom call pacing</p>
                                <p className="m-0 mt-1 text-[11px] leading-snug text-[var(--color-neutral-9)]">
                                    Default: 25 / 25 / 20 / 15 / 10 / 5 % over 6 years
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={customPacing}
                                onClick={() => {
                                    setCustomPacing(prev => {
                                        const next = !prev
                                        if (next) setPacingPcts([...DEFAULT_PACING_PCTS])
                                        return next
                                    })
                                }}
                                className={cn(
                                    'relative mt-0.5 h-7 w-[44px] shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)] focus-visible:ring-offset-2',
                                    customPacing ? 'bg-[var(--color-accent-9)]' : 'bg-[var(--color-neutral-5)]',
                                )}
                            >
                                <span
                                    className={cn(
                                        'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
                                        customPacing ? 'left-[22px]' : 'left-1',
                                    )}
                                />
                            </button>
                        </div>
                        {customPacing ? (
                            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                                {pacingPcts.map((pct, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-9)]">
                                            Y{i + 1}
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={pct === 0 ? '' : String(pct)}
                                            onChange={e => setPacingAt(i, e.target.value)}
                                            className={cn(inputClass, 'py-2 text-[13px] tabular-nums')}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="commitment-notes" className="text-[12px] font-medium text-[var(--color-neutral-11)]">
                            Notes
                        </label>
                        <textarea
                            id="commitment-notes"
                            rows={4}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Optional context for treasury or IC…"
                            className={cn(inputClass, 'min-h-[100px] resize-y')}
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-neutral-3)] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-white px-4 py-2.5 text-[13px] font-medium text-[var(--color-neutral-11)] transition-colors hover:bg-[var(--color-neutral-2)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                        >
                            Apply to charts (demo)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── active calls section ────────────────────────────────────────────────────

function daysUntil(iso: string): number {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const due = new Date(iso)
    due.setHours(0, 0, 0, 0)
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function ActiveCallCard({
    decision,
    onOpenDetail,
    getStatus,
}: {
    decision: CapitalCallDecision
    onOpenDetail?: (id: string) => void
    getStatus: (d: CapitalCallDecision) => CapitalCallPostDealStatus
}) {
    const status = getStatus(decision)
    const meta = NOTICE_STATUS_META[status]
    const days = daysUntil(decision.dueDate)
    const isOverdue = days < 0
    const isUrgent = days >= 0 && days <= 5
    const fundShort = decision.fund.replace(', L.P.', '')

    return (
        <button
            type="button"
            onClick={() => onOpenDetail?.(decision.id)}
            className="group relative w-full text-left rounded-[var(--radius-xl)] border bg-white p-4 transition-[border-color,box-shadow] hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)]"
            style={{ borderColor: isOverdue ? '#FCA5A5' : isUrgent ? '#FCD34D' : 'var(--color-neutral-4)' }}
        >
            <div className="flex items-center justify-between gap-2 mb-3">
                <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: meta.bg, color: meta.text }}
                >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
                    {meta.label}
                </span>
                {isOverdue ? (
                    <span className="text-[10px] font-semibold text-[#DC2626] bg-[#FEF2F2] rounded-full px-2 py-0.5">
                        {Math.abs(days)}d overdue
                    </span>
                ) : isUrgent ? (
                    <span className="text-[10px] font-semibold text-[#92400E] bg-[#FEF3C7] rounded-full px-2 py-0.5">
                        Due in {days}d
                    </span>
                ) : (
                    <span className="text-[10px] font-medium text-[var(--color-neutral-9)]">
                        Due {fmtShortDate(decision.dueDate)}
                    </span>
                )}
            </div>
            <p className="m-0 text-[13px] font-semibold text-[var(--color-black)] leading-snug truncate">{fundShort}</p>
            <p className="m-0 mt-0.5 text-[11px] text-[var(--color-neutral-9)] truncate">{decision.entity}</p>
            <p
                className="m-0 mt-3 text-[26px] font-bold tabular-nums tracking-[-0.02em] text-[var(--color-black)] leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
            >
                {fmt(decision.amount)}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
                <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">
                    Call {decision.callNumber} of {decision.totalCalls}
                </p>
                <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-accent-9)] group-hover:gap-1.5 transition-[gap]">
                    Review
                    <IconArrowRight size={13} stroke={2.5} />
                </span>
            </div>
        </button>
    )
}

function ActiveCallsSection({
    decisions,
    onOpenDetail,
    getStatus,
}: {
    decisions: CapitalCallDecision[]
    onOpenDetail?: (id: string) => void
    getStatus: (d: CapitalCallDecision) => CapitalCallPostDealStatus
}) {
    const active = [...decisions]
        .filter(d => getStatus(d) !== 'paid')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

    if (active.length === 0) return null

    const totalAmount = active.reduce((s, d) => s + d.amount, 0)
    const cols = active.length === 1 ? 'grid-cols-1' : active.length === 2 ? 'grid-cols-2' : 'grid-cols-3'

    return (
        <div className="rounded-[var(--radius-xl)] border-2 border-[var(--color-accent-9)] bg-gradient-to-b from-[#EFF6FF] to-[#F0F9FF] p-4 shadow-[0_12px_40px_rgba(0,91,226,0.14)]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-9)] opacity-70 animate-ping" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-accent-9)]" />
                    </span>
                    <h2 className="m-0 text-[15px] font-semibold text-[var(--color-gray-12)]">
                        Active capital calls — action needed
                    </h2>
                </div>
                <span className="text-[13px] font-semibold tabular-nums text-[var(--color-gray-11)]">{fmt(totalAmount)} total</span>
            </div>
            <div className={cn('grid gap-3', cols)}>
                {active.map(d => (
                    <ActiveCallCard key={d.id} decision={d} onOpenDetail={onOpenDetail} getStatus={getStatus} />
                ))}
            </div>
            <p className="m-0 mt-4 text-[11px] leading-snug text-[var(--color-neutral-10)] max-w-[720px]">
                One capital call per investment at a time; a family may hold several across different commitments.
                Several legal entities can fund the same call — that affects how the wire is split, not how many calls exist.
            </p>
        </div>
    )
}

// ─── quarterly projection ─────────────────────────────────────────────────────

type ProjectionPeriod = {
    label: string
    sublabel?: string
    calls: Array<{ fund: typeof CAPITAL_CALL_COMMITMENTS[number]; callAmount: number; callId: string; status: string }>
    total: number
    isCurrentPeriod: boolean
}

export function QuarterlyProjection() {
    const [period, setPeriod] = useState<'quarter' | 'month'>('quarter')

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const currentQuarter = Math.floor(currentMonth / 3)

    const periods: ProjectionPeriod[] = useMemo(() => {
        const result: ProjectionPeriod[] = []
        const count = period === 'quarter' ? 4 : 6

        for (let i = 0; i < count; i++) {
            let start: Date
            let end: Date
            let label: string

            if (period === 'quarter') {
                const qOffset = currentQuarter + i
                const yr = currentYear + Math.floor(qOffset / 4)
                const q = qOffset % 4
                start = new Date(yr, q * 3, 1)
                end = new Date(yr, q * 3 + 3, 0)
                label = `Q${q + 1} ${yr}`
            } else {
                const mOffset = currentMonth + i
                const yr = currentYear + Math.floor(mOffset / 12)
                const m = mOffset % 12
                start = new Date(yr, m, 1)
                end = new Date(yr, m + 1, 0)
                label = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            }

            const calls: ProjectionPeriod['calls'] = []
            CAPITAL_CALL_COMMITMENTS.forEach(fund => {
                fund.calls.forEach(call => {
                    if (call.status === 'paid') return
                    const due = new Date(call.dueDate)
                    if (due >= start && due <= end) {
                        calls.push({ fund, callAmount: call.amount, callId: call.id, status: call.status })
                    }
                })
            })

            result.push({
                label,
                calls,
                total: calls.reduce((s, c) => s + c.callAmount, 0),
                isCurrentPeriod: i === 0,
            })
        }
        return result
    }, [period, currentQuarter, currentYear, currentMonth])

    const hasAnyCalls = periods.some(p => p.total > 0)

    return (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                    <h3 className="m-0 text-[15px] font-semibold text-[var(--color-black)]">Liquidity outlook — by quarter</h3>
                    <p className="m-0 mt-0.5 text-[12px] text-[var(--color-neutral-10)]">
                        Approximate drawdowns this quarter and next per commitment — for treasury planning (not approval workflow).
                    </p>
                </div>
                <div className="flex items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-neutral-4)]">
                    {(['quarter', 'month'] as const).map(p => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPeriod(p)}
                            className={cn(
                                'px-3 py-1.5 text-[12px] font-medium transition-colors capitalize',
                                period === p
                                    ? 'bg-[var(--color-accent-9)] text-white'
                                    : 'text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)]',
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {!hasAnyCalls ? (
                <p className="py-4 text-center text-[13px] text-[var(--color-neutral-9)]">
                    No upcoming calls scheduled in this range.
                </p>
            ) : (
                <div className={cn('grid gap-3', period === 'quarter' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3 md:grid-cols-6')}>
                    {periods.map(p => (
                        <div
                            key={p.label}
                            className={cn(
                                'rounded-[var(--radius-lg)] p-3',
                                p.isCurrentPeriod
                                    ? 'border border-[#BFDBFE] bg-[#EFF6FF]'
                                    : 'border border-[var(--color-neutral-3)] bg-[var(--color-neutral-2)]',
                            )}
                        >
                            <div className="mb-2 flex items-center justify-between gap-1">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-10)]">
                                    {p.label}
                                </span>
                                {p.isCurrentPeriod && (
                                    <span className="rounded-full bg-[var(--color-accent-3)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--color-accent-10)]">
                                        Now
                                    </span>
                                )}
                            </div>
                            {p.total > 0 ? (
                                <>
                                    <p
                                        className="m-0 text-[20px] font-bold tabular-nums tracking-[-0.02em] text-[var(--color-black)] leading-none"
                                        style={{ fontFamily: 'var(--font-display)' }}
                                    >
                                        {fmt(p.total)}
                                    </p>
                                    <div className="mt-2 flex flex-col gap-1">
                                        {p.calls.map(({ fund, callAmount, callId }) => (
                                            <div key={callId} className="flex items-center gap-1.5">
                                                <span
                                                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                                                    style={{ background: FUND_COLORS[fund.id] ?? '#94A3B8' }}
                                                />
                                                <span className="truncate text-[10px] text-[var(--color-neutral-9)]">
                                                    {fund.fundName.split(' Fund')[0]}
                                                </span>
                                                <span className="ml-auto shrink-0 tabular-nums text-[10px] font-medium text-[var(--color-neutral-11)]">
                                                    {fmt(callAmount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="m-0 text-[18px] font-bold text-[var(--color-neutral-8)]" style={{ fontFamily: 'var(--font-display)' }}>
                                    —
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── main component ──────────────────────────────────────────────────────────

interface Props {
    onOpenDetail?: (id: string) => void
    /** Same pattern as portfolio: open side panel with chart drill-down preview */
    onChartDrill?: (drill: CapitalChartDrill) => void
    /** Opened from Pipeline » Approved — tighter chrome + back navigation */
    hubLayout?: boolean
    onBackToPipeline?: () => void
    /** Sync with detail page when user advances post-deal workflow */
    resolvePostDealStatus?: (d: CapitalCallDecision) => CapitalCallPostDealStatus
    /**
     * `default` — action-first (active calls → quarterly → KPIs).
     * `classic` — earlier dashboard: KPIs (6) → charts → quarterly → commitments → schedule.
     */
    layout?: 'default' | 'classic'
    onSwitchToV2?: () => void
    onSwitchToClassicLayout?: () => void
    onSwitchToPriorityLayout?: () => void
}

export function CapitalCallsPage({
    onOpenDetail,
    onChartDrill,
    hubLayout,
    onBackToPipeline,
    resolvePostDealStatus,
    layout = 'default',
    onSwitchToV2,
    onSwitchToClassicLayout,
    onSwitchToPriorityLayout,
}: Props) {
    /** Shared PDF/email intake modal — wired from shell header while List view can stay mounted separately */
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [addCommitmentModalOpen, setAddCommitmentModalOpen] = useState(false)
    const [modeledCommitment, setModeledCommitment] = useState<ModeledCommitmentPayload | null>(null)
    const [noticeSearch, setNoticeSearch] = useState('')
    const [noticeStatusFilter, setNoticeStatusFilter] = useState<'all' | CapitalCallPostDealStatus>('all')
    const [showAllNotices, setShowAllNotices] = useState(false)
    /** Only one commitment row expanded at a time — nested capital call notices. */
    const [expandedCommitmentId, setExpandedCommitmentId] = useState<string | null>(null)

    useEffect(() => {
        setShowAllNotices(false)
    }, [noticeSearch, noticeStatusFilter, expandedCommitmentId])

    const effectivePostDealStatus = useCallback(
        (d: CapitalCallDecision) => resolvePostDealStatus?.(d) ?? getCapitalCallPostDealStatus(d),
        [resolvePostDealStatus],
    )

    const openCommitmentDetail = useCallback(
        (commitmentId: string) => {
            const capId = COMMITMENT_ID_TO_CAPCALL_DETAIL[commitmentId]
            if (capId) onOpenDetail?.(capId)
        },
        [onOpenDetail],
    )

    const totalCommitted = useMemo(() => CAPITAL_CALL_COMMITMENTS.reduce((s, c) => s + c.totalCommitment, 0), [])
    const totalRemaining = useMemo(() => getTotalRemaining(CAPITAL_CALL_COMMITMENTS), [])

    const annualTotals = useMemo(() =>
        Object.fromEntries(FORECAST_YEARS.map(year => [
            year,
            CAPITAL_CALL_COMMITMENTS.reduce((s, f) => s + (f.yearlyPacing[year] ?? 0), 0),
        ])), [],
    )

    const yearlyCallStatus = useMemo(() =>
        Object.fromEntries(FORECAST_YEARS.map(year => {
            let paid = 0
            let pending = 0
            let upcoming = 0

            CAPITAL_CALL_COMMITMENTS.forEach(fund => {
                fund.calls.forEach(call => {
                    if (!call.dueDate.startsWith(year)) return
                    if (call.status === 'paid') paid += call.amount
                    if (call.status === 'pending') pending += call.amount
                    if (call.status === 'upcoming') upcoming += call.amount
                })
            })

            return [year, { paid, pending, upcoming }]
        })), [],
    )

    const thisYearTotal = annualTotals[CURRENT_YEAR] ?? 0

    const pendingApprovalDecisions = CAPITAL_CALL_DECISIONS.filter(capitalCallHasPendingApprovalStep)
    const pendingApprovalAmount = pendingApprovalDecisions.reduce((s, d) => s + d.amount, 0)
    const pendingApprovalCount = pendingApprovalDecisions.length
    const filteredNotices = useMemo(() => {
        const query = noticeSearch.trim().toLowerCase()
        return CAPITAL_CALL_DECISIONS.filter((notice) => {
            const status = effectivePostDealStatus(notice)
            if (noticeStatusFilter !== 'all' && status !== noticeStatusFilter) return false
            if (!query) return true

            const searchable = [
                notice.id,
                notice.title,
                notice.fund,
                notice.entity,
                notice.matchedInvestmentName,
                NOTICE_STATUS_META[status].label,
            ].join(' ').toLowerCase()

            return searchable.includes(query)
        })
    }, [noticeSearch, noticeStatusFilter, effectivePostDealStatus])

    const noticeCountByCommitment = useMemo(() => {
        const counts: Record<string, number> = {}
        for (const notice of filteredNotices) {
            const cid = commitmentIdForNoticeFund(notice.fund)
            if (!cid) continue
            counts[cid] = (counts[cid] ?? 0) + 1
        }
        return counts
    }, [filteredNotices])

    const noticesForExpandedCommitment = useMemo(() => {
        if (!expandedCommitmentId) return []
        return filteredNotices.filter((n) => commitmentIdForNoticeFund(n.fund) === expandedCommitmentId)
    }, [filteredNotices, expandedCommitmentId])

    const visibleExpandedNotices = showAllNotices ? noticesForExpandedCommitment : noticesForExpandedCommitment.slice(0, 8)
    const hiddenExpandedNoticesCount = Math.max(0, noticesForExpandedCommitment.length - visibleExpandedNotices.length)

    const toggleExpandCommitment = useCallback((commitmentId: string) => {
        setExpandedCommitmentId((cur) => (cur === commitmentId ? null : commitmentId))
    }, [])

    const isClassicLayout = layout === 'classic'

    const openPipelineNotices = useMemo(
        () => CAPITAL_CALL_DECISIONS.filter(d => effectivePostDealStatus(d) !== 'paid'),
        [effectivePostDealStatus],
    )
    const openNoticesAmount = useMemo(
        () => openPipelineNotices.reduce((s, d) => s + d.amount, 0),
        [openPipelineNotices],
    )
    const nextOpenDue = useMemo(() => {
        if (openPipelineNotices.length === 0) return null
        return [...openPipelineNotices].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
    }, [openPipelineNotices])
    const readyToExecuteNotices = useMemo(
        () => CAPITAL_CALL_DECISIONS.filter(d => effectivePostDealStatus(d) === 'ready-to-release'),
        [effectivePostDealStatus],
    )

    return (
        <div className={cn(
            'capital-activities-scroll flex flex-col flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden bg-[var(--color-white)] gap-[var(--spacing-7)] max-w-[1120px] w-full mx-auto px-[var(--spacing-6)] pb-[var(--spacing-6)]',
            hubLayout ? 'pt-4' : 'pt-9',
        )}>
            {uploadModalOpen ? (
                <UploadModal
                    onClose={() => setUploadModalOpen(false)}
                    onCreated={id => {
                        setUploadModalOpen(false)
                        setTimeout(() => onOpenDetail?.(id), 300)
                    }}
                />
            ) : null}
            {addCommitmentModalOpen ? (
                <AddCommitmentModal onClose={() => setAddCommitmentModalOpen(false)} onModeled={setModeledCommitment} />
            ) : null}

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="order-1 bg-white shrink-0">
                {hubLayout && onBackToPipeline ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <button
                            type="button"
                            onClick={onBackToPipeline}
                            className="flex items-center gap-1 text-[13px] font-medium text-[var(--color-neutral-10)] hover:text-[var(--color-neutral-11)] transition-colors shrink-0"
                        >
                            <IconChevronLeft size={16} stroke={2} aria-hidden />
                            Pipeline
                        </button>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] m-0">
                            Capital Activities
                        </p>
                    </div>
                ) : null}
                <div className="flex flex-col gap-2">
                    {!hubLayout ? (
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] m-0">
                            Capital Activities
                        </p>
                    ) : null}
                    <div className="flex items-center justify-between gap-3">
                        <ContentHeader
                            title="Capital Activities"
                            actionLabel="New capital call"
                            actionIcon={IconPlus}
                            actionDropdownItems={[
                                {
                                    label: 'Upload notice',
                                    icon: IconCloudUpload,
                                    onClick: () => setUploadModalOpen(true),
                                },
                                {
                                    label: 'Model new commitment',
                                    icon: IconPencil,
                                    onClick: () => setAddCommitmentModalOpen(true),
                                },
                            ]}
                        />
                        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                            {isClassicLayout && onSwitchToPriorityLayout ? (
                                <button
                                    type="button"
                                    onClick={onSwitchToPriorityLayout}
                                    className="shrink-0 flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-3)] transition-colors"
                                >
                                    Priority view
                                </button>
                            ) : null}
                            {!isClassicLayout && onSwitchToClassicLayout ? (
                                <button
                                    type="button"
                                    onClick={onSwitchToClassicLayout}
                                    className="shrink-0 flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors"
                                >
                                    Classic layout
                                </button>
                            ) : null}
                            {onSwitchToV2 ? (
                                <button
                                    type="button"
                                    onClick={onSwitchToV2}
                                    className="shrink-0 flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-4)] bg-[var(--color-accent-1)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-accent-10)] hover:bg-[var(--color-accent-2)] transition-colors"
                                >
                                    Try V2 →
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

                    {!isClassicLayout ? (
                    <div className="order-2">
                        <ActiveCallsSection
                            decisions={CAPITAL_CALL_DECISIONS}
                            onOpenDetail={onOpenDetail}
                            getStatus={effectivePostDealStatus}
                        />
                    </div>
                    ) : null}

                    <div className={cn(isClassicLayout ? 'order-4' : 'order-3')}>
                        <QuarterlyProjection />
                    </div>

                    {isClassicLayout ? (
                    <div className="order-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
                        <OverviewKpiTile label="Total committed" value={fmt(totalCommitted)} />
                        <OverviewKpiTile label="Remaining unfunded" value={fmt(totalRemaining)} valueTone="accent" />
                        <OverviewKpiTile label={`Called YTD (${CURRENT_YEAR})`} value={fmt(thisYearTotal)} />
                        <OverviewKpiTile
                            label="Pending approval"
                            value={fmt(pendingApprovalAmount)}
                            sub={
                                pendingApprovalCount > 0
                                    ? `${pendingApprovalCount} awaiting approval`
                                    : 'All approvals clear'
                            }
                            valueTone={pendingApprovalCount > 0 ? 'accent' : 'default'}
                            surfaceTone={pendingApprovalCount > 0 ? 'info' : 'default'}
                        />
                        <OverviewKpiTile
                            label="Open notices"
                            value={String(openPipelineNotices.length)}
                            sub={
                                nextOpenDue
                                    ? `${fmt(openNoticesAmount)} · Due ${fmtShortDate(nextOpenDue.dueDate)}`
                                    : 'None outstanding'
                            }
                            valueTone={openPipelineNotices.length > 0 ? 'accent' : 'default'}
                            surfaceTone={openPipelineNotices.length > 0 ? 'info' : 'default'}
                        />
                        <OverviewKpiTile
                            label="Ready to execute"
                            value={String(readyToExecuteNotices.length)}
                            sub={
                                readyToExecuteNotices.length > 0
                                    ? 'Treasury-ready wire batch'
                                    : 'None queued'
                            }
                            valueTone={readyToExecuteNotices.length > 0 ? 'success' : 'default'}
                            surfaceTone={readyToExecuteNotices.length > 0 ? 'success' : 'default'}
                        />
                    </div>
                    ) : (
                    <div className="order-4 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                        <OverviewKpiTile label="Total committed" value={fmt(totalCommitted)} />
                        <OverviewKpiTile label="Remaining unfunded" value={fmt(totalRemaining)} />
                        <OverviewKpiTile label={`Called YTD (${CURRENT_YEAR})`} value={fmt(thisYearTotal)} />
                        <OverviewKpiTile
                            label="Pending approval"
                            value={fmt(pendingApprovalAmount)}
                            sub={
                                pendingApprovalCount > 0
                                    ? `${pendingApprovalCount} awaiting approval`
                                    : 'All approvals clear'
                            }
                            valueTone={pendingApprovalCount > 0 ? 'accent' : 'default'}
                        />
                    </div>
                    )}

                    {/* Commitments & notices */}
                    <div className="order-5">
                        <div className="mb-3 flex flex-col gap-3">
                            <div className="min-w-0">
                                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0">
                                        <h2 className="m-0 text-[17px] font-semibold text-[var(--color-black)]">
                                            Commitments &amp; capital call notices
                                        </h2>
                                        <span
                                            className="text-[14px] font-semibold tabular-nums text-[var(--color-neutral-9)]"
                                            aria-label={`${CAPITAL_CALL_COMMITMENTS.length} commitments`}
                                        >
                                            {CAPITAL_CALL_COMMITMENTS.length}
                                        </span>
                                    </div>
                                <p className="m-0 mt-1 text-[12px] leading-snug text-[var(--color-neutral-10)]">
                                    Each row is <strong>one LP commitment</strong> (many drawdowns over time). Expand to see{' '}
                                    <strong>who pays</strong> (tax / book structure) and <strong>post-deal capital call notices</strong>.{' '}
                                    To preview liquidity, annual calls, and deployment curves, use <strong>Model new commitment</strong> next to the charts above.
                                </p>
                            </div>
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <ToolbarDropdown
                                        label="Status"
                                        items={NOTICE_STATUS_OPTIONS.filter((status): status is CapitalCallPostDealStatus => status !== 'all').map((status) => ({
                                            key: status,
                                            label: NOTICE_STATUS_META[status].label,
                                        }))}
                                        selectedKeys={noticeStatusFilter === 'all' ? [] : [noticeStatusFilter]}
                                        onSelect={(keys) => {
                                            const [nextStatus] = keys
                                            setNoticeStatusFilter((nextStatus as CapitalCallPostDealStatus | undefined) ?? 'all')
                                        }}
                                        allOptionLabel="All statuses"
                                    />
                                    <ToolbarSearchInput
                                        value={noticeSearch}
                                        onChange={setNoticeSearch}
                                        placeholder="Search calls, commitments..."
                                    />
                            </div>
                        </div>

                        {filteredNotices.length === 0 ? (
                            <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-neutral-4)] bg-white px-5 py-4 text-center text-[13px] text-[var(--color-neutral-9)] mb-3">
                                No capital call notices match the current filters. Try another search or status.
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-2">
                                {CAPITAL_CALL_COMMITMENTS.map((fund) => {
                                    const called = getTotalCalled(fund)
                                    const remaining = fund.totalCommitment - called
                                    const pctCalled = fund.totalCommitment > 0 ? Math.round((called / fund.totalCommitment) * 100) : 0
                                    const hasReceivedCall = fund.calls.some((call) => call.status === 'pending')
                                    const isOpen = expandedCommitmentId === fund.id
                                    const nMatching = noticeCountByCommitment[fund.id] ?? 0
                                    const nDrawdowns = fund.calls.length
                                    const payorNamesAll = fund.payingEntities.map(pe => pe.legalName).join(' · ')
                                    const payorCollapsed =
                                        fund.payingEntities.length === 0
                                            ? null
                                            : fund.payingEntities.length <= 2
                                                ? payorNamesAll
                                                : `${fund.payingEntities[0].legalName} · +${fund.payingEntities.length - 1} more`
                                    return (
                                        <div
                                            key={fund.id}
                                            className="rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white overflow-hidden"
                                        >
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                aria-expanded={isOpen}
                                                onClick={() => toggleExpandCommitment(fund.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        toggleExpandCommitment(fund.id)
                                                    }
                                                }}
                                                className="px-4 py-4 grid grid-cols-[auto_minmax(400px,2.4fr)_repeat(4,minmax(72px,0.7fr))_auto] items-center gap-3 cursor-pointer transition-colors hover:bg-[var(--color-neutral-2)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)] focus-visible:ring-inset"
                                            >
                                                <div className="flex items-center justify-center w-9 shrink-0" aria-hidden>
                                                    <IconChevronDown
                                                        size={18}
                                                        stroke={2}
                                                        className={cn('text-[var(--color-neutral-9)] transition-transform', isOpen && 'rotate-180')}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-2 self-stretch rounded-full shrink-0" style={{ background: FUND_COLORS[fund.id] }} />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                                            <span className="text-[14px] font-semibold text-[var(--color-black)] truncate">{fund.fundName.replace('Whitmore ', '')}</span>
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-neutral-3)] text-[var(--color-neutral-10)]">Vintage {fund.vintage}</span>
                                                            <span
                                                                className={cn(
                                                                    'px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums',
                                                                    nMatching > 0
                                                                        ? 'bg-[var(--color-accent-3)] text-[var(--color-accent-10)]'
                                                                        : 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-9)]',
                                                                )}
                                                            >
                                                                {nMatching} notice{nMatching === 1 ? '' : 's'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                                            <span className="text-[12px] text-[var(--color-neutral-10)] truncate">{fund.fundType}</span>
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap">
                                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: hasReceivedCall ? 'var(--color-neutral-8)' : 'var(--color-neutral-6)' }} />
                                                                <span className={hasReceivedCall ? 'text-[var(--color-neutral-11)]' : 'text-[var(--color-neutral-9)]'}>
                                                                    {hasReceivedCall ? 'Call in flight' : 'No active drawdown'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <p className="m-0 mt-1 text-[11px] leading-snug text-[var(--color-neutral-9)]">
                                                            <span className="font-semibold text-[var(--color-neutral-11)] tabular-nums">{nDrawdowns}</span>
                                                            {' '}drawdown{nDrawdowns === 1 ? '' : 's'} on this commitment
                                                            {nMatching > 0 ? (
                                                                <>
                                                                    {' · '}
                                                                    <span className="font-semibold text-[var(--color-neutral-11)] tabular-nums">{nMatching}</span>
                                                                    {' '}notice{nMatching === 1 ? '' : 's'}
                                                                </>
                                                            ) : null}
                                                        </p>
                                                        {payorCollapsed ? (
                                                            <p
                                                                className="m-0 mt-0.5 text-[11px] text-[var(--color-neutral-9)] truncate"
                                                                title={payorNamesAll || undefined}
                                                            >
                                                                <span className="font-semibold text-[var(--color-neutral-10)]">Paying entities: </span>
                                                                {payorCollapsed}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <Stat label="Commitment" value={fmt(fund.totalCommitment)} hint="Total LP commitment for this fund (single obligation)" />
                                                <Stat label="Paid in" value={fmt(called)} hint="Funded to date from paid drawdowns — same commitment, not a separate obligation" />
                                                <Stat label="Unfunded" value={fmt(remaining)} accent={remaining > 0} hint="Remaining on this commitment after paid calls" />
                                                <Stat label="% Funded" value={`${pctCalled}%`} />
                                                <div className="flex items-center justify-end gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                                                        aria-label="Open summary capital call"
                                                        title="Summary capital call"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            openCommitmentDetail(fund.id)
                                                        }}
                                                    >
                                                        <IconArrowRight size={15} stroke={2} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                                                        aria-label="Edit commitment"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <IconPencil size={15} stroke={2} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                                                        aria-label="Remove commitment"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <IconTrash size={15} stroke={2} />
                                                    </button>
                                                </div>
                                            </div>
                                            {isOpen ? (
                                                <div className="border-t border-[var(--color-neutral-4)] bg-[var(--color-gray-2)] px-4 py-4 flex flex-col gap-2">
                                                    {fund.payingEntities.length > 0 ? (
                                                        <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-white px-4 py-3">
                                                            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">
                                                                Paying entities (this commitment)
                                                            </p>
                                                            <p className="m-0 mt-1 text-[12px] leading-snug text-[var(--color-neutral-11)]">
                                                                {fund.payingEntities.map((pe) => {
                                                                    const role = pe.role ? ` (${pe.role})` : ''
                                                                    const pct = pe.allocationPct != null ? ` · ${pe.allocationPct}%` : ''
                                                                    return `${pe.legalName}${role}${pct}`
                                                                }).join(' · ')}
                                                            </p>
                                                        </div>
                                                    ) : null}
                                                    <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-white px-4 py-3">
                                                        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">
                                                            Drawdown schedule (fund calls)
                                                        </p>
                                                        <p className="m-0 mt-1 text-[11px] leading-snug text-[var(--color-neutral-10)]">
                                                            Each row is a capital call against <strong>this same</strong> commitment. Notices below are post-deal workflow records.
                                                        </p>
                                                        <ul className="m-0 mt-2 max-h-[168px] list-none space-y-1 overflow-y-auto overscroll-y-contain p-0 pr-1">
                                                            {[...fund.calls].sort((a, b) => a.callNumber - b.callNumber).map(call => (
                                                                <li
                                                                    key={call.id}
                                                                    className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 rounded-[var(--radius-md)] bg-[var(--color-neutral-2)] px-2.5 py-1.5 text-[11px]"
                                                                >
                                                                    <span className="min-w-0 font-medium text-[var(--color-black)]">
                                                                        #{call.callNumber} · {fmtShortDate(call.dueDate)}
                                                                    </span>
                                                                    <span className="shrink-0 font-semibold tabular-nums text-[var(--color-neutral-11)]">
                                                                        {fmt(call.amount)} · {labelForCallStatus(call.status)}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    {visibleExpandedNotices.map((notice) => (
                                                        <CapitalCallNoticeRow
                                                            key={notice.id}
                                                            notice={notice}
                                                            onOpenDetail={onOpenDetail}
                                                            getStatus={effectivePostDealStatus}
                                                        />
                                                    ))}
                                                    {hiddenExpandedNoticesCount > 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAllNotices(true)}
                                                            className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-neutral-4)] bg-white px-5 py-3 text-center text-[13px] font-semibold text-[var(--color-neutral-10)] transition-colors hover:border-[var(--color-neutral-5)] hover:bg-[var(--color-neutral-2)]"
                                                        >
                                                            Show more +{hiddenExpandedNoticesCount}
                                                        </button>
                                                    ) : null}
                                                    {noticesForExpandedCommitment.length === 0 ? (
                                                        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-neutral-4)] bg-white px-5 py-6 text-center text-[13px] text-[var(--color-neutral-9)]">
                                                            No notices for this commitment match the current filters.
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>
                                    )
                                })}
                            </div>
                    </div>

                    <div
                        className="order-6 flex flex-col bg-white rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] shrink-0"
                        style={{ flex: 'none' }}
                    >
                        <div className="px-5 py-4 border-b border-[var(--color-neutral-3)] shrink-0">
                            <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-0.5">Year-by-year pacing (commitment model)</h3>
                            <p className="text-[12px] text-[var(--color-neutral-10)] m-0">
                                Annual pacing from subscription terms — use the quarterly block above for near-term liquidity.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="list-table min-w-[880px] w-full">
                                <thead className="sticky top-0 z-[1] bg-[var(--color-gray-2)] shadow-[inset_0_-1px_0_var(--color-neutral-4)]">
                                    <tr className="list-header-row border-b-0">
                                        <th scope="col" className="list-header-cell list-header-cell--name !h-[44px] !py-3 !pl-5 w-[108px] bg-[var(--color-gray-2)]">
                                            Year
                                        </th>
                                        <th scope="col" className="list-header-cell !h-[44px] !py-3 w-[124px] bg-[var(--color-gray-2)]">
                                            Status
                                        </th>
                                        {CAPITAL_CALL_COMMITMENTS.map((fund) => (
                                            <th
                                                key={fund.id}
                                                scope="col"
                                                title={fund.fundName.replace('Whitmore ', '')}
                                                className="list-header-cell !h-[44px] !py-3 text-right bg-[var(--color-gray-2)]"
                                            >
                                                <span className="inline-flex items-center justify-end gap-1.5 w-full min-w-0">
                                                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: FUND_COLORS[fund.id] }} />
                                                    <span className="truncate">{fund.fundName.replace('Whitmore ', '').split(' Fund')[0]}</span>
                                                </span>
                                            </th>
                                        ))}
                                        <th
                                            scope="col"
                                            className="list-header-cell !h-[44px] !py-3 text-right border-l border-[var(--color-neutral-4)] bg-[var(--color-card-orange-bg)] text-[var(--color-card-orange)]"
                                        >
                                            Year total
                                        </th>
                                        <th scope="col" className="list-header-cell !h-[44px] !py-3 !pr-5 text-right bg-[var(--color-gray-2)]">
                                            Cumulative
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        let cumulative = 0
                                        return FORECAST_YEARS.map((year) => {
                                            const rowTotal = CAPITAL_CALL_COMMITMENTS.reduce((s, f) => s + (f.yearlyPacing[year] ?? 0), 0)
                                            const status = yearlyCallStatus[year]
                                            const paidAmt = status?.paid ?? 0
                                            const pendingAmt = status?.pending ?? 0
                                            const upcomingAmt = status?.upcoming ?? 0
                                            const isPaidYear = paidAmt > 0 && rowTotal > 0 && pendingAmt === 0 && upcomingAmt === 0
                                            const isActiveYear = pendingAmt > 0
                                            const statusLabel = isPaidYear ? 'Paid' : isActiveYear ? 'In flight' : 'Forecast'
                                            const statusStyle = isPaidYear
                                                ? { dot: 'var(--color-green-9)', pill: 'bg-[var(--color-green-1)]' }
                                                : isActiveYear
                                                    ? { dot: 'var(--color-orange-9)', pill: 'bg-[var(--color-orange-1)]' }
                                                    : { dot: 'var(--color-neutral-8)', pill: 'bg-[var(--color-neutral-2)]' }
                                            cumulative += rowTotal
                                            return (
                                                <tr
                                                    key={year}
                                                    className={cn(
                                                        'list-row !cursor-default hover:bg-[var(--color-gray-2)] border-b border-[var(--color-neutral-3)]',
                                                        year === CURRENT_YEAR && 'bg-[var(--color-blue-1)]/50 hover:bg-[var(--color-blue-1)]/65',
                                                    )}
                                                >
                                                    <td className="list-cell !h-[52px] !pl-5 font-semibold text-[var(--color-black)]">
                                                        <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                                            <span>{year}</span>
                                                            {year === CURRENT_YEAR ? (
                                                                <span className="inline-flex items-center rounded-full bg-[var(--color-accent-3)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[var(--color-accent-11)]">
                                                                    Now
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td className="list-cell !h-[52px] w-[124px] align-middle !whitespace-normal">
                                                        <div
                                                            className={cn(
                                                                'inline-flex w-fit max-w-full items-center gap-1.5 rounded-full px-2.5 py-1.5',
                                                                statusStyle.pill,
                                                            )}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: statusStyle.dot }} />
                                                            <span className="text-[11px] font-semibold text-[var(--color-neutral-11)]">{statusLabel}</span>
                                                        </div>
                                                    </td>
                                                    {CAPITAL_CALL_COMMITMENTS.map((fund) => (
                                                        <td
                                                            key={fund.id}
                                                            className="list-cell !h-[52px] text-right text-[var(--color-neutral-11)] tabular-nums font-medium"
                                                        >
                                                            {fund.yearlyPacing[year] ? fmt(fund.yearlyPacing[year]) : '—'}
                                                        </td>
                                                    ))}
                                                    <td className="list-cell !h-[52px] text-right font-semibold text-[var(--color-card-orange)] tabular-nums bg-[var(--color-card-orange-bg)]/80 border-l border-[var(--color-neutral-4)]">
                                                        {rowTotal ? fmt(rowTotal) : '—'}
                                                    </td>
                                                    <td className="list-cell !h-[52px] !pr-5 text-right text-[var(--color-neutral-10)] tabular-nums font-medium">
                                                        {cumulative ? fmt(cumulative) : '—'}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 5 — Modeling (visually distinct from live forecast) */}
                    <div className={cn(
                        isClassicLayout ? 'order-3' : 'order-7',
                        'flex flex-col gap-4 rounded-[var(--radius-xl)] border-2 border-dashed border-[#818CF8] bg-[#F8FAFF] p-4 sm:p-5',
                    )}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                                <span className="shrink-0 rounded-full bg-[#4338CA] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                                    Simulation
                                </span>
                                <p className="m-0 text-[12px] text-[var(--color-neutral-10)] leading-snug max-w-[640px]">
                                    What-if: add a modeled commitment and see the impact on call curves. Not booked until you subscribe — separate from the quarterly liquidity outlook.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="m-0 text-[15px] font-semibold text-[var(--color-black)]">Charts — portfolio &amp; modeled scenario</h3>
                                    <p className="m-0 mt-0.5 text-[12px] text-[var(--color-neutral-9)]">
                                        Modeled series uses a hatched pattern so it cannot be confused with live commitments.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {modeledCommitment ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModeledCommitment(null)
                                                showToast('Scenario cleared from charts', 'success')
                                            }}
                                            className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-neutral-5)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-neutral-10)] transition-colors hover:bg-[var(--color-neutral-2)]"
                                        >
                                            Clear scenario
                                        </button>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => setAddCommitmentModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[#4338CA] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#4338CA] transition-colors hover:bg-[#EEF2FF]"
                                    >
                                        <IconBolt size={13} stroke={2} className="text-[#4338CA]" aria-hidden />
                                        Model new commitment
                                    </button>
                                </div>
                            </div>
                            <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-white overflow-hidden">
                                <CapitalActivitiesForecastCharts modeledCommitment={modeledCommitment} onChartDrill={onChartDrill} />
                            </div>
                        </div>
                    </div>

        </div>
    )
}

/** Single capital call notice row — reused inside fund accordion panels. */
function CapitalCallNoticeRow({
    notice,
    onOpenDetail,
    getStatus,
}: {
    notice: CapitalCallDecision
    onOpenDetail?: (id: string) => void
    getStatus?: (n: CapitalCallDecision) => CapitalCallPostDealStatus
}) {
    const status = getStatus?.(notice) ?? getCapitalCallPostDealStatus(notice)
    const meta = NOTICE_STATUS_META[status]
    return (
        <button
            type="button"
            onClick={() => onOpenDetail?.(notice.id)}
            className="group grid w-full grid-cols-[minmax(360px,2fr)_minmax(140px,0.9fr)_minmax(84px,0.75fr)_minmax(84px,0.75fr)_auto] items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white px-5 py-3 text-left outline-none transition-colors hover:border-[var(--color-neutral-5)] hover:bg-[var(--color-neutral-2)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)] focus-visible:ring-offset-2"
        >
            <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <h3 className="m-0 truncate text-[14px] font-semibold text-[var(--color-black)]">{notice.title}</h3>
                    <span className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-neutral-11)] tabular-nums">
                        {notice.id}
                    </span>
                </div>
                <p className="m-0 mt-0.5 truncate text-[12px] text-[var(--color-neutral-10)]">
                    {notice.fund} · {notice.entity}
                </p>
            </div>
            <div>
                <p className="m-0 text-[11px] text-[var(--color-neutral-9)] uppercase tracking-[0.05em] font-medium">Status</p>
                <span
                    className="mt-0.5 inline-flex w-fit max-w-full rounded-md border border-[var(--color-neutral-4)] px-2 py-1 text-[11px] font-semibold text-[var(--color-neutral-11)]"
                    style={{ background: meta.bg }}
                >
                    {meta.label}
                </span>
            </div>
            <Stat label="Amount" value={fmt(notice.amount)} />
            <div>
                <p className="m-0 text-[11px] text-[var(--color-neutral-9)] uppercase tracking-[0.05em] font-medium">Due</p>
                <p className="m-0 mt-0.5 text-[14px] font-semibold tabular-nums text-[var(--color-black)]">{fmtShortDate(notice.dueDate)}</p>
            </div>
            <IconArrowRight size={15} stroke={2} className="justify-self-end text-[var(--color-neutral-8)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-neutral-11)]" />
        </button>
    )
}

function Stat({ label, value, accent, hint }: { label: string; value: string; accent?: boolean; hint?: string }) {
    return (
        <div className="flex min-w-0 flex-col gap-0.5" title={hint}>
            <span className="text-[11px] text-[var(--color-neutral-9)] uppercase tracking-[0.05em] font-medium">{label}</span>
            <span className={`text-[14px] font-semibold tabular-nums ${accent ? 'text-[var(--color-accent-9)]' : 'text-[var(--color-black)]'}`}>
                {value}
            </span>
        </div>
    )
}
