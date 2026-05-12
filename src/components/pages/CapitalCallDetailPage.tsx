import { useState } from 'react'
import {
    IconChevronLeft, IconExternalLink, IconShare, IconDotsVertical,
    IconCheck, IconAlertTriangle, IconRobot,
} from '@tabler/icons-react'
import { getDecisionById } from '@/data/thornton/capital-call-decisions-data'
import type { ApprovalStep } from '@/data/thornton/capital-call-decisions-data'

// ─── helpers ───────────────────────────────────────────────────────────────

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
    return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function daysUntil(iso: string): number {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    pending: { label: 'Pending', dot: '#F59E0B', text: '#92400E', bg: '#FFFBEB' },
    approved: { label: 'Approved', dot: '#10B981', text: '#065F46', bg: '#ECFDF5' },
    flagged: { label: 'Flagged', dot: '#EF4444', text: '#991B1B', bg: '#FEF2F2' },
    'wire-ready': { label: 'Wire ready', dot: '#6366F1', text: '#3730A3', bg: '#EEF2FF' },
    completed: { label: 'Completed', dot: '#6B7280', text: '#374151', bg: '#F9FAFB' },
}

// ─── sub-components ────────────────────────────────────────────────────────

function Avatar({ step, size = 36 }: { step: ApprovalStep; size?: number }) {
    return (
        <div
            className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
            style={{ width: size, height: size, background: step.color, fontSize: size * 0.33 }}
        >
            {step.initials}
        </div>
    )
}

function MatchBadge({ status }: { status: 'match' | 'mismatch' | 'changed' }) {
    if (status === 'match') return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-semibold text-[#065F46]">
            <IconCheck size={11} stroke={2.5} />
            MATCH
        </span>
    )
    if (status === 'changed') return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-[11px] font-semibold text-[#92400E]">
            <IconAlertTriangle size={11} stroke={2.5} />
            CHANGED
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-[11px] font-semibold text-[#991B1B]">
            <IconAlertTriangle size={11} stroke={2.5} />
            MISMATCH
        </span>
    )
}

// ─── PDF mock (shared between tabs, slightly different sizing) ──────────────

function PdfMock({ pdfName, pdfPages, pdfSizeKb, fund, entity, amount, commitment, createdDate, dueDate, callNumber, wireInstructions }: {
    pdfName: string
    pdfPages: number
    pdfSizeKb: number
    fund: string
    entity: string
    amount: number
    commitment: number
    createdDate: string
    dueDate: string
    callNumber: number
    wireInstructions: { beneficiary: string; bank: string; aba: string; account: string; swift: string; reference: string }
}) {
    const [page, setPage] = useState(1)
    const commitmentPct = Math.round((amount / commitment) * 100)
    return (
        <div className="flex flex-col h-full overflow-y-auto bg-[#F8F8F9]">
            {/* PDF header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--color-neutral-4)] shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-[6px] bg-[#FEE2E2] flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect width="14" height="14" rx="3" fill="#EF4444" fillOpacity="0.1" />
                            <path d="M3 3.5h5.5L10 5v5.5H3V3.5z" stroke="#EF4444" strokeWidth="1.2" fill="none" />
                            <path d="M8.5 3.5V5H10" stroke="#EF4444" strokeWidth="1.2" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="m-0 text-[12px] font-semibold text-[var(--color-black)] truncate">{pdfName}</p>
                        <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">{pdfPages} pages · {pdfSizeKb} KB</p>
                    </div>
                </div>
                <button type="button" className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-accent-9)] hover:underline shrink-0 ml-2">
                    <IconExternalLink size={13} stroke={2} />
                    Open
                </button>
            </div>

            {/* PDF page */}
            <div className="p-4 flex-1">
                <div className="bg-white rounded-[var(--radius-lg)] shadow-sm border border-[var(--color-neutral-3)] p-6 text-[11px] leading-[1.6]" style={{ fontFamily: 'Georgia, serif' }}>
                    {page === 1 ? (
                        <>
                            <div className="border-b border-[#E5E7EB] pb-4 mb-4">
                                <p className="m-0 text-[10px] font-bold tracking-[0.12em] uppercase text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    MERIDIAN CAPITAL PARTNERS
                                </p>
                                <p className="m-0 text-[10px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    545 Madison Avenue · New York, NY 10022
                                </p>
                            </div>
                            <p className="m-0 text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                CAPITAL CALL NOTICE · CALL #{String(callNumber).padStart(2, '0')}
                            </p>
                            <h2 className="m-0 text-[18px] font-normal text-[#111827] leading-[1.3] mb-3">
                                {fund.replace(', L.P.', ',')}
                                <br />L.P.
                            </h2>
                            <p className="m-0 text-[11px] text-[#374151] mb-0.5">To: {entity}</p>
                            <p className="m-0 text-[11px] text-[#374151] mb-3">
                                Re: Notice of capital call dated {formatDate(createdDate)}
                            </p>
                            <p className="m-0 text-[10.5px] text-[#374151] mb-4 leading-[1.65]">
                                Pursuant to Section 4.2 of the Limited Partnership Agreement, the General Partner hereby calls for the contribution of capital from the Limited Partner in the amount set forth below.
                            </p>
                            <div className="border border-[#E5E7EB] rounded-[6px] p-4 mb-4">
                                <p className="m-0 text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    CAPITAL CONTRIBUTION DUE
                                </p>
                                <p className="m-0 text-[22px] font-semibold text-[#111827] tracking-[-0.01em] leading-none mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {fmt(amount)} USD
                                </p>
                                <p className="m-0 text-[10px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Representing {commitmentPct}% of total commitment ({fmt(commitment)})
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <p className="m-0 text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>NOTICE DATE</p>
                                    <p className="m-0 text-[11px] text-[#111827]">{formatDate(createdDate)}</p>
                                </div>
                                <div>
                                    <p className="m-0 text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>FUNDING DEADLINE</p>
                                    <p className="m-0 text-[11px] text-[#111827]">
                                        {new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · 5:00 PM ET
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="m-0 text-[9px] tracking-[0.1em] uppercase text-[#9CA3AF] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    WIRE INSTRUCTIONS
                                </p>
                                <div className="space-y-1">
                                    {([
                                        ['Beneficiary', wireInstructions.beneficiary],
                                        ['Bank', wireInstructions.bank],
                                        ['ABA', wireInstructions.aba],
                                        ['Account', wireInstructions.account],
                                        ['SWIFT', wireInstructions.swift],
                                        ['Reference', wireInstructions.reference],
                                    ] as const).map(([label, value]) => (
                                        <div key={label} className="grid grid-cols-[72px_1fr] gap-1">
                                            <span className="text-[10px] text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span>
                                            <span className="text-[10px] text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-[#E5E7EB] mt-5 pt-3 flex items-center justify-between">
                                <p className="m-0 text-[9px] text-[#9CA3AF] italic" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Meridian Capital Partners · Confidential
                                </p>
                                <p className="m-0 text-[9px] text-[#9CA3AF]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Page 1 of {pdfPages}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
                            <p className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif' }}>Page {page} of {pdfPages}</p>
                            <p className="text-[11px] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Schedule of LP interests and representations</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-3 mt-3">
                    <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="text-[11px] text-[var(--color-neutral-9)] hover:text-[var(--color-black)] disabled:opacity-30">
                        ‹ Prev
                    </button>
                    <span className="text-[11px] text-[var(--color-neutral-10)]">Page {page} of {pdfPages}</span>
                    <button type="button" onClick={() => setPage(p => Math.min(pdfPages, p + 1))} disabled={page === pdfPages}
                        className="text-[11px] text-[var(--color-neutral-9)] hover:text-[var(--color-black)] disabled:opacity-30">
                        Next ›
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Verify fields (demo data for CAPCAL-1) ────────────────────────────────

const VERIFY_FIELDS: Array<{
    label: string
    noticeSays: string
    onFile: string
    status: 'match' | 'mismatch' | 'changed'
    note?: string
}> = [
    {
        label: 'Fund / GP',
        noticeSays: 'Greentech Opportunities Fund III, L.P. / Meridian Capital Partners',
        onFile: 'Greentech Opportunities Fund III, L.P. / Meridian Capital Partners',
        status: 'match',
    },
    {
        label: 'Limited Partner',
        noticeSays: 'Real Estate Holding LLC',
        onFile: 'Real Estate Holding LLC',
        status: 'match',
    },
    {
        label: 'Amount called',
        noticeSays: '$500,000.00 USD',
        onFile: '$500,000.00 USD (10% of $5,000,000 commitment)',
        status: 'match',
    },
    {
        label: 'Call number',
        noticeSays: 'Call #07',
        onFile: '#7 of 12 · next in sequence',
        status: 'match',
        note: '6 prior calls drawn, sequence verified',
    },
    {
        label: 'Funding deadline',
        noticeSays: 'May 30, 2026 · 5:00 PM ET',
        onFile: '— · T+22 days from notice',
        status: 'match',
    },
    {
        label: 'Wire instructions',
        noticeSays: 'ABA 021000128 / Account ···· 4419 / First Republic Bank',
        onFile: 'ABA 021000128 / Account ···· 4419 / First Republic Bank',
        status: 'match',
        note: 'Wire instructions unchanged from previous call',
    },
]

// ─── tab types ─────────────────────────────────────────────────────────────

type TabId = 'overview' | 'verify' | 'activity'

const TABS: Array<{ id: TabId; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'verify', label: 'Verify' },
    { id: 'activity', label: 'Activity' },
]

// ─── main component ────────────────────────────────────────────────────────

interface Props {
    id: string
    onBack: () => void
}

export function CapitalCallDetailPage({ id, onBack }: Props) {
    const decision = getDecisionById(id)
    const [approvals, setApprovals] = useState(decision?.approvals ?? [])
    const [activeTab, setActiveTab] = useState<TabId>('overview')
    const [hoveredField, setHoveredField] = useState<number | null>(null)
    const [localStatus, setLocalStatus] = useState(decision?.status ?? 'pending')
    const [localActivityLog, setLocalActivityLog] = useState(decision?.activityLog ?? [])

    if (!decision) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center text-[var(--color-neutral-9)]">
                Decision not found.
            </div>
        )
    }

    const approvedCount = approvals.filter(a => a.status === 'approved').length
    const pendingApprovals = approvals.filter(a => a.status === 'pending').map(a => a.role)

    function handleApprove(stepId: string) {
        setApprovals(prev => prev.map(a =>
            a.id === stepId
                ? { ...a, status: 'approved' as const, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
                : a,
        ))
    }

    function addActivity(actor: string, action: string, isAI = false) {
        const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        setLocalActivityLog(prev => [{ time, actor, action, isAI }, ...prev])
    }

    function handleConfirmWire() {
        setLocalStatus('wire-ready')
        addActivity('Anastasiya Mudryk', 'Wire scheduled · verification complete, wire queued')
    }

    function handleExecuteWire() {
        setLocalStatus('completed')
        addActivity('Finance Ops', `Wire executed · ${fmt(decision.amount)} → ${decision.wireInstructions.beneficiary}`)
    }

    const days = daysUntil(decision.dueDate)
    const paidPct = Math.round(decision.drawnBefore * 100)
    const totalPct = Math.round(decision.drawnAfter * 100)
    const callPct = totalPct - paidPct
    const commitmentPct = Math.round((decision.amount / decision.commitment) * 100)

    const pdfProps = {
        pdfName: decision.pdfName,
        pdfPages: decision.pdfPages,
        pdfSizeKb: decision.pdfSizeKb,
        fund: decision.fund,
        entity: decision.entity,
        amount: decision.amount,
        commitment: decision.commitment,
        createdDate: decision.createdDate,
        dueDate: decision.dueDate,
        callNumber: decision.callNumber,
        wireInstructions: decision.wireInstructions,
    }

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">

            {/* ── Top nav bar ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-neutral-4)] bg-white shrink-0">
                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-[13px] text-[var(--color-neutral-10)] hover:text-[var(--color-black)] transition-colors shrink-0"
                    >
                        <IconChevronLeft size={16} stroke={2} />
                        Decisions
                    </button>
                    <span className="text-[var(--color-neutral-5)] shrink-0">·</span>
                    {(() => {
                        const cfg = STATUS_CONFIG[localStatus] ?? STATUS_CONFIG.pending
                        return (
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0 transition-all duration-300"
                                style={{ background: cfg.bg, color: cfg.text }}>
                                <span className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300" style={{ background: cfg.dot }} />
                                {cfg.label}
                            </span>
                        )
                    })()}
                    <span className="text-[var(--color-neutral-5)] shrink-0">·</span>
                    <span className="text-[12px] font-mono text-[var(--color-neutral-9)] shrink-0">{decision.id}</span>
                    <span className="text-[var(--color-neutral-5)] shrink-0">·</span>
                    <span className="text-[12px] text-[var(--color-neutral-9)] shrink-0">
                        Capital call · Call #{decision.callNumber} of {decision.totalCalls}
                    </span>
                    <span className="text-[var(--color-neutral-5)] shrink-0">·</span>
                    <span className="text-[12px] text-[var(--color-neutral-9)] shrink-0">
                        Created {formatDate(decision.createdDate)}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                    <div className="flex items-center -space-x-1.5 mr-1">
                        {approvals.slice(0, 3).map(a => (
                            <div key={a.id} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: a.color }} title={a.name}>
                                {a.initials}
                            </div>
                        ))}
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-[var(--color-neutral-4)] flex items-center justify-center text-[10px] font-semibold text-[var(--color-neutral-10)]">
                            +7
                        </div>
                    </div>
                    <button type="button" className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors">
                        <IconShare size={14} stroke={2} />
                        Share
                    </button>
                    <button type="button" className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors">
                        Actions
                        <IconDotsVertical size={14} stroke={2} />
                    </button>
                </div>
            </div>

            {/* ── Title + tabs ─────────────────────────────────────────────── */}
            <div className="px-6 pt-5 pb-0 bg-white shrink-0">
                <h1 className="text-[28px] font-semibold text-[var(--color-black)] m-0 leading-[1.2] tracking-[-0.01em]">
                    {decision.title}
                </h1>
                <p className="m-0 mt-1.5 text-[14px] text-[var(--color-neutral-10)]">
                    {decision.fund} · {decision.entity} · {decision.gp}
                </p>

                {/* Tab bar */}
                <div className="flex items-center gap-0 mt-4 border-b border-[var(--color-neutral-4)]">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                                activeTab === tab.id
                                    ? 'border-[var(--color-accent-9)] text-[var(--color-accent-9)]'
                                    : 'border-transparent text-[var(--color-neutral-10)] hover:text-[var(--color-neutral-12)]'
                            }`}
                        >
                            {tab.label}
                            {tab.id === 'verify' && (
                                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-[#ECFDF5] px-1.5 text-[10px] font-semibold text-[#065F46]">
                                    {VERIFY_FIELDS.filter(f => f.status === 'match').length}/{VERIFY_FIELDS.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab bodies ───────────────────────────────────────────────── */}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: content cards */}
                    <div className="flex flex-col gap-4 flex-[1.4] overflow-y-auto p-6">

                        {/* The numbers */}
                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                            <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-4">The numbers</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] mb-1.5">Amount called</p>
                                    <p className="m-0 text-[26px] font-semibold tabular-nums tracking-[-0.02em] text-[var(--color-black)] leading-none">
                                        {fmt(decision.amount)}
                                    </p>
                                    <p className="m-0 text-[12px] text-[var(--color-neutral-9)] mt-1.5">
                                        {commitmentPct}% of {fmt(decision.commitment)} commitment
                                    </p>
                                </div>
                                <div>
                                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] mb-1.5">Funding deadline</p>
                                    <p className="m-0 text-[26px] font-semibold tracking-[-0.02em] text-[var(--color-black)] leading-none">
                                        {new Date(decision.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="m-0 text-[12px] text-[var(--color-neutral-9)] mt-1.5">
                                        {days} days from today · 5:00 PM ET
                                    </p>
                                </div>
                                <div>
                                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] mb-1.5">Drawn after this call</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="m-0 text-[26px] font-semibold tracking-[-0.02em] text-[var(--color-black)] leading-none">{totalPct}%</p>
                                        <p className="m-0 text-[13px] text-[var(--color-neutral-9)]">from {paidPct}%</p>
                                    </div>
                                    <div className="mt-2 h-1.5 rounded-full bg-[var(--color-neutral-3)] overflow-hidden flex">
                                        <div className="h-full" style={{ width: `${paidPct}%`, background: '#005BE2' }} />
                                        <div className="h-full" style={{ width: `${callPct}%`, background: '#93C5FD' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Approval workflow */}
                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0">Approval workflow</h3>
                                <span className="text-[12px] text-[var(--color-neutral-9)]">
                                    {approvedCount} of {approvals.length} approvals
                                    {pendingApprovals.length > 0 && ` · awaiting ${pendingApprovals.join(' and ')}`}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                {approvals.map(step => (
                                    <div
                                        key={step.id}
                                        className={`flex-1 rounded-[var(--radius-lg)] border p-3 transition-colors ${
                                            step.status === 'approved'
                                                ? 'border-[#D1FAE5] bg-[#F0FDF4]'
                                                : 'border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <div className="relative">
                                                <Avatar step={step} size={32} />
                                                {step.status === 'approved' && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10B981] border border-white flex items-center justify-center">
                                                        <IconCheck size={8} stroke={3} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="m-0 text-[12px] font-semibold text-[var(--color-black)] truncate">{step.name}</p>
                                                <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">{step.role}</p>
                                            </div>
                                        </div>
                                        {step.status === 'approved' ? (
                                            <p className="m-0 text-[11px] font-medium text-[#047857]">
                                                Approved · {step.timestamp}
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(step.id)}
                                                className="w-full rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-white px-2 py-1 text-[11px] font-semibold text-[var(--color-neutral-11)] hover:bg-[var(--color-accent-9)] hover:text-white hover:border-[var(--color-accent-9)] transition-colors"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Match to investment */}
                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0">Match to investment</h3>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#065F46]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                    {decision.matchConfidence}% confidence
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[#1A1A2E] flex items-center justify-center text-white text-[15px] font-bold shrink-0">
                                    G
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="m-0 text-[14px] font-semibold text-[var(--color-black)]">{decision.matchedInvestmentName}</p>
                                    <p className="m-0 text-[12px] text-[var(--color-neutral-9)]">
                                        {decision.matchedInvestmentId} · {decision.totalCalls}-call commitment series · {decision.priorCallsDrawn} of {decision.totalCalls} prior calls drawn
                                    </p>
                                </div>
                                <button type="button" className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors shrink-0">
                                    <IconExternalLink size={13} stroke={2} />
                                    Open record
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: PDF */}
                    <div className="w-[380px] shrink-0 border-l border-[var(--color-neutral-4)] overflow-hidden">
                        <PdfMock {...pdfProps} />
                    </div>
                </div>
            )}

            {/* VERIFY TAB */}
            {activeTab === 'verify' && (
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: PDF */}
                    <div className="flex-[1.5] border-r border-[var(--color-neutral-4)] overflow-hidden">
                        <PdfMock {...pdfProps} />
                    </div>

                    {/* Right: verify table */}
                    <div className="w-[420px] shrink-0 overflow-y-auto bg-white">
                        <div className="p-5">
                            {/* Verify header */}
                            <div className="mb-4">
                                <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-1">
                                    Verify against the document
                                </h3>
                                <p className="m-0 text-[12px] text-[var(--color-neutral-9)]">
                                    Hover a row to highlight in the notice. All fields match on-file data.
                                </p>
                            </div>

                            {/* Summary pill */}
                            <div className="flex items-center gap-2 mb-5 p-3 rounded-[var(--radius-lg)] bg-[#F0FDF4] border border-[#D1FAE5]">
                                <IconCheck size={16} stroke={2.5} className="text-[#10B981] shrink-0" />
                                <span className="text-[12px] font-semibold text-[#047857]">
                                    {VERIFY_FIELDS.filter(f => f.status === 'match').length} of {VERIFY_FIELDS.length} fields verified · Wire instructions unchanged
                                </span>
                            </div>

                            {/* Field rows */}
                            <div className="flex flex-col divide-y divide-[var(--color-neutral-3)]">
                                {VERIFY_FIELDS.map((field, idx) => (
                                    <div
                                        key={field.label}
                                        className={`py-3.5 px-3 -mx-3 rounded-[var(--radius-md)] transition-colors cursor-default ${
                                            hoveredField === idx ? 'bg-[#EFF6FF]' : ''
                                        }`}
                                        onMouseEnter={() => setHoveredField(idx)}
                                        onMouseLeave={() => setHoveredField(null)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] mt-0.5 shrink-0 w-[110px]">
                                                {field.label}
                                            </p>
                                            <MatchBadge status={field.status} />
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="m-0 text-[10px] text-[var(--color-neutral-9)] mb-0.5">Notice says</p>
                                                <p className="m-0 text-[12px] text-[var(--color-black)] leading-[1.4]">{field.noticeSays}</p>
                                            </div>
                                            <div>
                                                <p className="m-0 text-[10px] text-[var(--color-neutral-9)] mb-0.5">On file</p>
                                                <p className="m-0 text-[12px] text-[var(--color-black)] leading-[1.4]">{field.onFile}</p>
                                            </div>
                                        </div>
                                        {field.note && (
                                            <p className="m-0 mt-1.5 text-[11px] text-[var(--color-neutral-9)] italic">{field.note}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Verify footer — status-aware */}
                            <div className="mt-6 pt-5 border-t border-[var(--color-neutral-4)]">
                                {localStatus === 'completed' ? (
                                    <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-3">
                                        <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                                            <IconCheck size={14} stroke={2.5} color="white" />
                                        </div>
                                        <div>
                                            <p className="m-0 text-[12px] font-semibold text-[#065F46]">Wire executed</p>
                                            <p className="m-0 text-[11px] text-[#047857]">{fmt(decision.amount)} sent to {decision.wireInstructions.beneficiary}</p>
                                        </div>
                                    </div>
                                ) : localStatus === 'wire-ready' ? (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 rounded-[var(--radius-md)] bg-[#EEF2FF] border border-[#C7D2FE] px-3 py-2">
                                            <span className="w-2 h-2 rounded-full bg-[#6366F1] shrink-0 animate-pulse" />
                                            <p className="m-0 text-[11px] font-medium text-[#3730A3]">Wire queued · {fmt(decision.amount)} ready to send to {decision.wireInstructions.beneficiary}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleExecuteWire}
                                            className="w-full rounded-[var(--radius-md)] bg-[#4F46E5] px-3 py-2.5 text-[12px] font-semibold text-white hover:bg-[#4338CA] transition-colors"
                                        >
                                            Execute wire →
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="m-0 text-[12px] font-semibold text-[var(--color-neutral-11)] mb-3">Verification complete</p>
                                        <div className="flex gap-2">
                                            <button type="button" className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-white px-3 py-2 text-[12px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors">
                                                Flag for review
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleConfirmWire}
                                                className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-3 py-2 text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
                                            >
                                                Confirm &amp; schedule wire
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-[720px]">
                    <div className="mb-6">
                        <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-1">Activity log</h3>
                        <p className="m-0 text-[12px] text-[var(--color-neutral-9)]">Full audit trail for this capital call decision.</p>
                    </div>

                    <div className="flex flex-col">
                        {localActivityLog.map((entry, idx) => (
                            <div key={idx} className="flex gap-3 pb-5 relative">
                                {/* Connector line */}
                                {idx < localActivityLog.length - 1 && (
                                    <div className="absolute left-[15px] top-[30px] w-px h-full bg-[var(--color-neutral-3)]" />
                                )}

                                {/* Avatar / icon */}
                                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white z-10"
                                    style={{ background: entry.isAI ? '#7C3AED' : '#0D9488' }}>
                                    {entry.isAI
                                        ? <IconRobot size={15} stroke={2} />
                                        : entry.actor.split(' ').map(n => n[0]).join('').slice(0, 2)
                                    }
                                </div>

                                <div className="flex-1 pt-0.5">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[13px] font-semibold text-[var(--color-black)]">{entry.actor}</span>
                                        {entry.isAI && (
                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#F3E8FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                                                AI
                                            </span>
                                        )}
                                        <span className="text-[12px] text-[var(--color-neutral-9)]">{entry.time}</span>
                                    </div>
                                    <p className="m-0 text-[13px] text-[var(--color-neutral-11)]">{entry.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Call history in fund context */}
                    <div className="mt-6 pt-6 border-t border-[var(--color-neutral-4)]">
                        <h3 className="text-[14px] font-semibold text-[var(--color-black)] m-0 mb-4">
                            Call history — {decision.matchedInvestmentName}
                        </h3>
                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] overflow-hidden">
                            {[...Array(decision.priorCallsDrawn)].map((_, i) => {
                                const callNum = i + 1
                                const isCurrent = callNum === decision.callNumber
                                const year = 2022 + Math.floor(i / 2)
                                const month = i % 2 === 0 ? 'Mar' : 'Sep'
                                const amount = isCurrent ? decision.amount : Math.round((decision.commitment / decision.totalCalls) * (0.85 + Math.random() * 0.3))
                                return (
                                    <div key={callNum} className={`flex items-center justify-between px-4 py-3 border-b border-[var(--color-neutral-3)] last:border-b-0 ${isCurrent ? 'bg-[#F0FDF4]' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? 'bg-[#10B981]' : 'bg-[#005BE2]'}`} />
                                            <div>
                                                <p className="m-0 text-[13px] font-medium text-[var(--color-black)]">
                                                    Call #{callNum}
                                                    {isCurrent && <span className="ml-2 text-[11px] font-semibold text-[#047857]">← this call</span>}
                                                </p>
                                                <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">
                                                    {isCurrent ? formatDate(decision.dueDate) : `${month} ${year}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="m-0 text-[13px] font-semibold tabular-nums text-[var(--color-black)]">
                                                {fmt(isCurrent ? decision.amount : amount)}
                                            </p>
                                            <span className={`text-[10px] font-semibold ${isCurrent ? 'text-[#047857]' : 'text-[var(--color-accent-9)]'}`}>
                                                {isCurrent ? 'Approved' : 'Paid'}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
