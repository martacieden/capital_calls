import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsiveLine } from '@nivo/line'
import type { PartialTheme } from '@nivo/theming'
import { cn } from '@/lib/utils'
import {
    IconChevronLeft, IconChevronRight, IconShare, IconDotsVertical, IconPlus,
    IconExternalLink, IconSparkles, IconAlertTriangle, IconCheck, IconX, IconArrowRight,
} from '@tabler/icons-react'
import { getInvestmentById } from '@/data/thornton/investments-data'
import type { InvestmentStatus, InvestmentPipelineStage, InvestmentApproval, InvestmentRecord } from '@/data/thornton/investments-data'
import { getPipelineDealById } from '@/data/thornton/pipeline-data'
import { CAPITAL_CALL_COMMITMENTS } from '@/data/thornton/capital-calls-data'
import { CAPITAL_CALL_DECISIONS } from '@/data/thornton/capital-call-decisions-data'
import { DecisionCard, UploadModal } from '@/components/pages/DecisionsPage'
import { HUB_PIPELINE_COLUMNS } from '@/data/thornton/hub-pipeline-stages'

// ─── helpers ───────────────────────────────────────────────────────────────

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`
    return `$${v.toLocaleString()}`
}

function fmtAxis(v: number): string {
    if (v >= 1_000_000) return `$${v / 1_000_000}M`
    if (v >= 1_000) return `$${v / 1_000}K`
    return `$${v}`
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// ─── status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InvestmentStatus, { label: string; dot: string; text: string; bg: string }> = {
    active:           { label: 'Active',          dot: '#10B981', text: '#065F46', bg: '#ECFDF5' },
    'fully-deployed': { label: 'Fully deployed',  dot: '#005BE2', text: '#1E40AF', bg: '#EFF6FF' },
    realized:         { label: 'Realized',         dot: '#6B7280', text: '#374151', bg: '#F9FAFB' },
    monitoring:       { label: 'Monitoring',       dot: '#F59E0B', text: '#92400E', bg: '#FFFBEB' },
}

// ─── pipeline stage config ─────────────────────────────────────────────────

const STAGE_ORDER: InvestmentPipelineStage[] = [
    'sourcing', 'initial-review', 'due-diligence', 'ic-review', 'approved',
]

const STAGE_SHORT: Record<InvestmentPipelineStage, string> = {
    sourcing: 'Source',
    'initial-review': 'Review',
    'due-diligence': 'DD',
    'ic-review': 'IC',
    approved: 'Approved',
    declined: 'Declined',
}

function getStageCfg(stage: InvestmentPipelineStage) {
    return HUB_PIPELINE_COLUMNS.find(c => c.id === stage) ?? HUB_PIPELINE_COLUMNS[0]
}

const AVATAR_COLORS = ['#DBEAFE', '#FCE7F3', '#FEF3C7', '#D1FAE5', '#EDE9FE', '#FEE2E2']

function investmentFromDeal(deal: ReturnType<typeof getPipelineDealById> & {}): InvestmentRecord {
    const firstPendingIdx = deal.approvals.findIndex(a => a.status !== 'approved')
    return {
        id: deal.id,
        fundName: deal.dealName,
        fundNameShort: deal.dealName.length > 32 ? deal.dealName.slice(0, 30) + '…' : deal.dealName,
        gp: deal.sponsor,
        entity: deal.company,
        status: 'active',
        vintage: new Date(deal.sourceDate).getFullYear(),
        strategy: deal.sector,
        geography: deal.tags[0] ?? '—',
        totalCommitment: deal.targetAmount,
        called: 0,
        nav: 0,
        irr: deal.projectedIrr,
        moic: deal.projectedMoic,
        investmentDate: deal.sourceDate,
        capitalCallIds: [],
        commitmentDataId: null,
        description: deal.notes ?? '',
        documents: [],
        pipelineStage: deal.stage,
        approvals: deal.approvals.map((a, i) => ({
            step: i + 1,
            role: a.role,
            name: a.name,
            initials: a.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
            avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
            status: (a.status === 'approved' ? 'approved' : i === firstPendingIdx ? 'waiting' : 'pending') as InvestmentApproval['status'],
            date: a.date,
        })),
    }
}

// ─── chart theme ───────────────────────────────────────────────────────────

const CHART_THEME: PartialTheme = {
    background: 'transparent',
    text: { fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter, -apple-system, sans-serif' },
    axis: {
        domain: { line: { stroke: 'transparent' } },
        ticks: {
            line: { stroke: 'transparent' },
            text: { fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter, -apple-system, sans-serif' },
        },
    },
    grid: { line: { stroke: '#F0F0F3', strokeWidth: 1 } },
}

// ─── tab types ─────────────────────────────────────────────────────────────

type TabId = 'overview' | 'capital-calls' | 'documents' | 'monitoring' | 'ai-brief'

const TABS: Array<{ id: TabId; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'capital-calls', label: 'Capital Calls' },
    { id: 'documents', label: 'Documents' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'ai-brief', label: 'AI Brief' },
]

// ─── AI brief data ─────────────────────────────────────────────────────────

interface AiBriefApproval {
    role: string
    name: string
    status: 'approved' | 'pending' | 'declined'
    date?: string
}

interface AiBriefData {
    score: number
    scoreLabel: string
    summary: string
    keyFactors: string[]
    approvals: AiBriefApproval[]
    documentGaps: Array<{ name: string; urgency: 'missing' | 'overdue' | 'expiring' | 'expected'; note: string }>
    portfolioFit: Array<{ label: string; pct: number }>
}

const AI_BRIEFS: Record<string, AiBriefData> = {
    'INV-2024-014': {
        score: 87,
        scoreLabel: 'Strong fit',
        summary: "Meridian Capital Partners' Greentech Fund III demonstrates strong alignment with the Thornton family's ESG mandate and private equity allocation targets. The fund's 11.2% net IRR through Call #7 tracks above the 2024 vintage PE median of 9.4%. Minor concentration risk in North American clean tech warrants ongoing monitoring.",
        keyFactors: ['ESG score: 94/100', 'NAV trending above cost basis (+16.7%)', 'Manager track record: 3 prior funds, all top-quartile'],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'approved', date: '2024-01-10' },
            { role: 'CFO / Treasury', name: 'James Chen', status: 'approved', date: '2024-01-11' },
            { role: 'Legal Counsel', name: 'Marcus Williams', status: 'approved', date: '2024-01-12' },
            { role: 'Investment Committee', name: 'Board Review', status: 'approved', date: '2024-01-14' },
        ],
        documentGaps: [
            { name: 'Q2 2026 Investor Report', urgency: 'expected', note: 'Due Jun 30, 2026' },
            { name: 'Annual Audit 2025', urgency: 'overdue', note: 'Was due Apr 1, 2026 — follow up with GP' },
        ],
        portfolioFit: [
            { label: 'PE Allocation Fit', pct: 78 },
            { label: 'ESG Alignment', pct: 94 },
            { label: 'Geography Fit', pct: 92 },
            { label: 'Risk Profile Match', pct: 81 },
        ],
    },
    'INV-2023-007': {
        score: 82,
        scoreLabel: 'Good fit',
        summary: "Whitmore Real Assets Fund III provides meaningful diversification through global infrastructure exposure, reducing the portfolio's North America concentration. At 22% deployment, significant uncalled commitment of $6.8M creates near-term liquidity planning considerations. The fund's 10-year life aligns with the family's multi-generational planning horizon.",
        keyFactors: ['Strong global diversification', '22% deployed — active deployment expected 2026–2028', 'Projected distribution yield: 3.2%'],
        approvals: [
            { role: 'CIO', name: 'Sarah Thornton', status: 'approved', date: '2023-05-20' },
            { role: 'CFO / Treasury', name: 'James Chen', status: 'approved', date: '2023-05-22' },
            { role: 'Legal Counsel', name: 'Marcus Williams', status: 'pending' },
            { role: 'Investment Committee', name: 'Board Review', status: 'pending' },
        ],
        documentGaps: [
            { name: 'Q1 2026 Investor Report', urgency: 'missing', note: 'Expected from GP — not yet received' },
            { name: 'LP Side Letter', urgency: 'expiring', note: 'Renewal due Jun 1, 2026' },
        ],
        portfolioFit: [
            { label: 'Real Assets Allocation Fit', pct: 65 },
            { label: 'ESG Alignment', pct: 78 },
            { label: 'Geography Fit', pct: 88 },
            { label: 'Liquidity Risk Buffer', pct: 60 },
        ],
    },
}

// ─── detail row ────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">{label}</span>
            <span className="text-[13px] text-[var(--color-black)]">{value}</span>
        </div>
    )
}

// ─── main component ────────────────────────────────────────────────────────

interface InvestmentRecordPageProps {
    investmentId: string
    onBack: () => void
    onNavigateToCapCall: (capCallId: string) => void
    backSource?: 'portfolio-private' | 'portfolio' | 'investment-pipeline'
}

export function InvestmentRecordPage({
    investmentId,
    onBack,
    onNavigateToCapCall,
    backSource = 'portfolio-private',
}: InvestmentRecordPageProps) {
    const _record = getInvestmentById(investmentId)
    const _deal = !_record ? getPipelineDealById(investmentId) : undefined
    const investment: InvestmentRecord | undefined = _record ?? (_deal ? investmentFromDeal(_deal) : undefined)
    const [activeTab, setActiveTab] = useState<TabId>('overview')
    const [showUpload, setShowUpload] = useState(false)
    const [pipelineStage, setPipelineStage] = useState<InvestmentPipelineStage>(
        investment?.pipelineStage ?? 'sourcing',
    )
    const [approvals, setApprovals] = useState<InvestmentApproval[]>(
        investment?.approvals ?? [],
    )
    const [showAdvanceModal, setShowAdvanceModal] = useState(false)
    const [approverComment, setApproverComment] = useState('')

    if (!investment) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center text-[var(--color-neutral-9)]">
                Investment not found.
            </div>
        )
    }

    const statusCfg = STATUS_CONFIG[investment.status]
    const backLabel = backSource === 'portfolio-private' ? 'Private Investments' : backSource === 'investment-pipeline' ? 'Pipeline' : 'Portfolio'
    const deployedPct = Math.round((investment.called / investment.totalCommitment) * 100)
    const remaining = investment.totalCommitment - investment.called
    const brief = AI_BRIEFS[investment.id] ?? null

    // ── Stage workflow ──────────────────────────────────────────────────────
    const stageIdx = STAGE_ORDER.indexOf(pipelineStage)
    const nextStage = stageIdx >= 0 && stageIdx < STAGE_ORDER.length - 1 ? STAGE_ORDER[stageIdx + 1] : null
    const currentStageCfg = getStageCfg(pipelineStage)
    const nextStageCfg = nextStage ? getStageCfg(nextStage) : null
    const isICReview = pipelineStage === 'ic-review'
    const isApproved = pipelineStage === 'approved'
    const isDeclined = pipelineStage === 'declined'
    const completedStageCount = isDeclined ? 0 : Math.max(0, stageIdx)
    const stageProgressPct = isDeclined
        ? 0
        : Math.round((completedStageCount / STAGE_ORDER.length) * 100)
    const approvedCount = approvals.filter(a => a.status === 'approved').length
    const waitingApproval = approvals.find(a => a.status === 'waiting')
    const hasICMemoWarning = isICReview && !investment.documents.some(d =>
        d.name.toLowerCase().includes('ic_memo') || d.name.toLowerCase().includes('ic memo') || d.type.toLowerCase().includes('ic memo'),
    )

    function handleAdvanceStage() {
        if (nextStage) {
            setPipelineStage(nextStage)
            setShowAdvanceModal(false)
        }
    }

    function handleApprove() {
        const waitingIdx = approvals.findIndex(a => a.status === 'waiting')
        if (waitingIdx === -1) return
        const today = new Date().toISOString().split('T')[0]
        const updated = approvals.map((a, i) => {
            if (i === waitingIdx) return { ...a, status: 'approved' as const, date: today }
            if (i === waitingIdx + 1) return { ...a, status: 'waiting' as const }
            return a
        })
        setApprovals(updated)
        setApproverComment('')
        if (waitingIdx === approvals.length - 1) setPipelineStage('approved')
    }

    function handleSendBack() {
        if (stageIdx > 0) setPipelineStage(STAGE_ORDER[stageIdx - 1])
    }

    // Capital calls linked to this investment
    const linkedDecisions = CAPITAL_CALL_DECISIONS.filter(d =>
        investment.capitalCallIds.includes(d.id),
    )
    const pendingDecisions = linkedDecisions.filter(d => d.status === 'pending')
    const pendingAmount = pendingDecisions.reduce((s, d) => s + d.amount, 0)
    const nextDue = linkedDecisions
        .filter(d => d.status !== 'completed')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
    const nextDueDays = nextDue
        ? Math.ceil((new Date(nextDue.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null

    // Chart data from linked CapitalCallCommitment (if available)
    const commitmentData = investment.commitmentDataId
        ? CAPITAL_CALL_COMMITMENTS.find(c => c.id === investment.commitmentDataId)
        : null

    const deploymentData = useMemo(() => {
        if (!commitmentData) return []
        let cumPaid = 0
        return commitmentData.calls.map((call, idx) => {
            const isPaid = call.status === 'paid'
            const isPending = call.status === 'pending'
            const paidAmt = isPaid ? call.amount : 0
            const pendingAmt = isPending ? call.amount : 0
            const uncalledAfter = commitmentData.totalCommitment - cumPaid - paidAmt - pendingAmt
            if (isPaid) cumPaid += call.amount
            return {
                call: `#${idx + 1}`,
                paid: paidAmt,
                pending: pendingAmt,
                uncalled: Math.max(0, uncalledAfter),
            }
        })
    }, [commitmentData])

    const cumulativeData = useMemo(() => {
        if (!commitmentData) return []
        let running = 0
        const rows: Array<{ step: string; called: number; uncalled: number }> = [
            { step: 'Start', called: 0, uncalled: commitmentData.totalCommitment },
        ]
        commitmentData.calls.forEach((call, idx) => {
            if (call.status === 'paid') running += call.amount
            else if (call.status === 'pending') running += call.amount
            rows.push({
                step: `#${idx + 1}`,
                called: running,
                uncalled: Math.max(0, commitmentData.totalCommitment - running),
            })
        })
        return rows
    }, [commitmentData])

    const nivoLineData = useMemo(() => [
        { id: 'Called',   data: cumulativeData.map(d => ({ x: d.step, y: d.called })) },
        { id: 'Uncalled', data: cumulativeData.map(d => ({ x: d.step, y: d.uncalled })) },
    ], [cumulativeData])

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden max-w-[1120px] w-full mx-auto">

            {/* ── Top nav bar ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-neutral-4)] bg-white shrink-0">
                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-[13px] text-[var(--color-neutral-10)] hover:text-[var(--color-black)] transition-colors shrink-0"
                    >
                        <IconChevronLeft size={16} stroke={2} />
                        {backLabel}
                    </button>
                    <span className="text-[var(--color-neutral-5)] shrink-0">·</span>
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0"
                        style={{ background: statusCfg.bg, color: statusCfg.text }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: statusCfg.dot }} />
                        {statusCfg.label}
                    </span>
                    <span className="text-[var(--color-neutral-5)] shrink-0">·</span>
                    <span className="text-[12px] font-mono text-[var(--color-neutral-9)] shrink-0">{investment.id}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                    {nextDue && nextDue.status !== 'completed' && (
                        <>
                            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-1.5 text-[11px] font-semibold text-[#92400E]">
                                <IconAlertTriangle size={12} stroke={2} />
                                Capital call pending
                            </span>
                            <button
                                type="button"
                                onClick={() => onNavigateToCapCall(nextDue.id)}
                                className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-black)] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
                            >
                                Review call
                                <IconArrowRight size={13} stroke={2.5} />
                            </button>
                        </>
                    )}
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

            {/* ── Stage stepper (compact, unified with capital-call detail) ── */}
            <div className="px-6 pt-2.5 pb-2 border-b border-[var(--color-neutral-3)] bg-white shrink-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="mb-1.5 h-1 w-full max-w-md rounded-full bg-[var(--color-neutral-3)] overflow-hidden" aria-hidden>
                            <div
                                className="h-full rounded-full bg-[#10B981] transition-[width] duration-300 ease-out"
                                style={{ width: `${Math.min(100, stageProgressPct)}%` }}
                            />
                        </div>
                        <p className="m-0 mb-1.5 text-[10px] text-[var(--color-neutral-9)] leading-snug">
                            <span className="font-medium text-[var(--color-neutral-11)] tabular-nums">
                                {isDeclined ? 'Declined' : `Step ${stageIdx + 1} of ${STAGE_ORDER.length}`}
                            </span>
                            {!isDeclined ? <span> · {stageProgressPct}% complete</span> : null}
                            <span> · Current: </span>
                            <span className="font-semibold text-[var(--color-accent-9)]">{currentStageCfg.label}</span>
                            {isICReview && waitingApproval ? (
                                <span className="text-[var(--color-neutral-10)]"> · Awaiting {waitingApproval.role}</span>
                            ) : null}
                        </p>
                        <nav className="overflow-x-auto overflow-y-visible pb-1 -mx-0.5 px-0.5 [scrollbar-width:thin]" aria-label="Investment workflow stages">
                            <ol className="flex flex-nowrap items-center gap-0 list-none m-0 p-0 min-w-0 w-max max-w-full">
                                {STAGE_ORDER.map((stage, idx) => {
                                    const done = !isDeclined && idx < stageIdx
                                    const active = !isDeclined && idx === stageIdx
                                    const stageCfg = getStageCfg(stage)
                                    return (
                                        <li key={stage} className="flex items-center shrink-0">
                                            {idx > 0 ? (
                                                <IconChevronRight
                                                    size={12}
                                                    stroke={1.75}
                                                    className="mx-0.5 shrink-0 text-[var(--color-neutral-6)]"
                                                    aria-hidden
                                                />
                                            ) : null}
                                            <span
                                                className={cn(
                                                    'inline-flex max-w-[8rem] items-center gap-1 rounded-[var(--radius-md)] border px-1.5 py-0.5 text-[10px] font-semibold leading-none transition-colors',
                                                    done && 'border-[#6EE7B7] bg-[#ECFDF5] text-[#047857]',
                                                    active && !done && 'border-[var(--color-accent-9)] bg-[var(--color-accent-3)] text-[var(--color-accent-9)] shadow-[inset_0_0_0_1px_rgba(0,91,226,0.08)]',
                                                    !done && !active && 'border-[var(--color-neutral-5)] bg-[var(--color-white)] text-[var(--color-neutral-10)]',
                                                )}
                                                aria-current={active ? 'step' : undefined}
                                                title={stageCfg.label}
                                            >
                                                {done ? (
                                                    <IconCheck size={11} stroke={2.5} className="shrink-0 text-[#059669]" aria-hidden />
                                                ) : (
                                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? stageCfg.dot : '#9CA3AF' }} />
                                                )}
                                                <span className="min-w-0 truncate">{STAGE_SHORT[stage]}</span>
                                            </span>
                                        </li>
                                    )
                                })}
                            </ol>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {!isICReview && !isApproved && !isDeclined && nextStageCfg && (
                            <button
                                type="button"
                                onClick={() => setShowAdvanceModal(true)}
                                className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-3 py-1 text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
                            >
                                {nextStageCfg.label}
                                <IconChevronRight size={13} stroke={2.5} />
                            </button>
                        )}
                        {!isApproved && !isDeclined && (
                            <button
                                type="button"
                                onClick={() => setPipelineStage('declined')}
                                className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-neutral-9)] hover:text-[#DC2626] transition-colors"
                            >
                                <IconX size={13} stroke={2} />
                                Decline
                            </button>
                        )}
                        {isApproved && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#059669]">
                                <IconCheck size={13} stroke={2.5} />
                                All approvals complete
                            </span>
                        )}
                        {isDeclined && (
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-[#FEF2F2] text-[#991B1B]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                                Declined
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="px-6 pt-5 pb-0 bg-white shrink-0">
                <h1 className="text-[28px] font-semibold text-[var(--color-black)] m-0 leading-[1.2] tracking-[-0.01em]">
                    {investment.fundName}
                </h1>
                <p className="m-0 mt-1 text-[14px] text-[var(--color-neutral-10)]">
                    {investment.gp} · {investment.entity} · Vintage {investment.vintage}
                </p>

                {/* 3-number summary */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-[var(--radius-xl)] bg-[var(--color-neutral-2)] border border-[var(--color-neutral-3)] p-2">
                    <div className="rounded-[var(--radius-lg)] px-3 py-3">
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] mb-1">Total commitment</p>
                        <p className="m-0 text-[26px] font-semibold tracking-[-0.02em] text-[var(--color-black)] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                            {fmt(investment.totalCommitment)}
                        </p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] px-3 py-3" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#3B82F6] mb-1">Called to date</p>
                        <p className="m-0 text-[26px] font-semibold tracking-[-0.02em] text-[var(--color-accent-9)] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                            {fmt(investment.called)}
                        </p>
                        <p className="m-0 text-[11px] text-[#3B82F6] mt-1 opacity-70">{deployedPct}% deployed</p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] px-3 py-3" style={{ background: '#FEFCE8', border: '1px solid #FEF08A' }}>
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A16207] mb-1">Remaining unfunded</p>
                        <p className="m-0 text-[26px] font-semibold tracking-[-0.02em] text-[var(--color-black)] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                            {fmt(remaining)}
                        </p>
                        <p className="m-0 text-[11px] text-[#A16207] mt-1 opacity-70">{100 - deployedPct}% uncalled</p>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-0 mt-5 border-b border-[var(--color-neutral-4)]">
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
                            {tab.id === 'capital-calls' && linkedDecisions.length > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-[var(--color-neutral-3)] px-1.5 text-[10px] font-semibold text-[var(--color-neutral-10)]">
                                    {linkedDecisions.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-[1120px] w-full">

                    {/* IC Memo warning (IC Review stage only) */}
                    {hasICMemoWarning && (
                        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
                            <IconAlertTriangle size={15} stroke={2} className="shrink-0 mt-0.5 text-amber-600" />
                            <div>
                                <p className="m-0 text-[13px] font-semibold text-amber-900">IC Memo not uploaded</p>
                                <p className="m-0 text-[12px] text-amber-700 mt-0.5">
                                    Upload a document with category "IC_Memo" to proceed to final approval.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Investment details card */}
                    <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5 mb-4">
                        <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-4">Investment details</h3>
                        <div className="grid grid-cols-4 gap-x-6 gap-y-4 mb-4">
                            <DetailRow label="Strategy" value={investment.strategy} />
                            <DetailRow label="Geography" value={investment.geography} />
                            <DetailRow label="Fund Manager" value={investment.gp} />
                            <DetailRow label="Investment date" value={formatDate(investment.investmentDate)} />
                            <DetailRow label="NAV" value={fmt(investment.nav)} />
                            <DetailRow label="Net IRR" value={investment.irr ?? '—'} />
                            <DetailRow label="MOIC" value={investment.moic ?? '—'} />
                        </div>
                        {investment.description && (
                            <p className="m-0 text-[13px] text-[var(--color-neutral-10)] leading-[1.6] border-t border-[var(--color-neutral-3)] pt-3">
                                {investment.description}
                            </p>
                        )}
                    </div>

                    {/* Charts */}
                    {commitmentData ? (
                        <div className="grid grid-cols-2 gap-4">
                            {/* Deployment progress bar */}
                            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-0.5">Deployment progress</h3>
                                <p className="text-[12px] text-[var(--color-neutral-10)] m-0 mb-3">Paid / pending / uncalled per call</p>
                                <div style={{ height: 210 }}>
                                    <ResponsiveBar
                                        data={deploymentData}
                                        keys={['paid', 'pending', 'uncalled']}
                                        indexBy="call"
                                        groupMode="stacked"
                                        margin={{ top: 8, right: 8, bottom: 32, left: 56 }}
                                        padding={0.3}
                                        borderRadius={3}
                                        colors={({ id }) => id === 'paid' ? '#005BE2' : id === 'pending' ? '#8B5CF6' : '#D9E7FF'}
                                        axisBottom={{ tickSize: 0, tickPadding: 10 }}
                                        axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 4, format: v => fmtAxis(v as number) }}
                                        axisTop={null}
                                        axisRight={null}
                                        enableGridX={false}
                                        enableLabel={false}
                                        theme={CHART_THEME}
                                        animate={false}
                                    />
                                </div>
                                <div className="flex items-center gap-4 mt-2 flex-wrap">
                                    {[
                                        { label: 'Paid', color: '#005BE2' },
                                        { label: 'Pending', color: '#8B5CF6' },
                                        { label: 'Uncalled', color: '#D9E7FF', border: true },
                                    ].map(l => (
                                        <div key={l.label} className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: l.color, border: l.border ? '1px solid #93C5FD' : undefined }} />
                                            <span className="text-[11px] text-[var(--color-neutral-10)]">{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cumulative deployment line */}
                            <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-0.5">Cumulative deployment</h3>
                                <p className="text-[12px] text-[var(--color-neutral-10)] m-0 mb-3">Called capital rises, uncalled falls</p>
                                <div style={{ height: 210 }}>
                                    <ResponsiveLine
                                        data={nivoLineData}
                                        margin={{ top: 8, right: 12, bottom: 32, left: 56 }}
                                        xScale={{ type: 'point' }}
                                        yScale={{ type: 'linear', min: 0, max: commitmentData.totalCommitment * 1.05 }}
                                        curve="monotoneX"
                                        colors={['#005BE2', '#93C5FD']}
                                        lineWidth={2.5}
                                        pointSize={6}
                                        pointColor={{ from: 'serieColor' }}
                                        pointBorderWidth={0}
                                        enableArea
                                        areaOpacity={0.08}
                                        axisBottom={{ tickSize: 0, tickPadding: 10 }}
                                        axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 4, format: v => fmtAxis(v as number) }}
                                        axisTop={null}
                                        axisRight={null}
                                        enableGridX={false}
                                        theme={CHART_THEME}
                                        animate={false}
                                    />
                                </div>
                                <div className="flex gap-4 mt-2">
                                    {[
                                        { label: 'Called', color: '#005BE2' },
                                        { label: 'Uncalled', color: '#93C5FD' },
                                    ].map(l => (
                                        <div key={l.label} className="flex items-center gap-1.5">
                                            <span className="inline-block w-5 h-0.5 rounded" style={{ background: l.color }} />
                                            <span className="text-[11px] text-[var(--color-neutral-10)]">{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5 flex items-center justify-center h-[140px] text-[13px] text-[var(--color-neutral-9)]">
                            Chart data not yet available for this investment.
                        </div>
                    )}
                </div>
            )}

            {/* ── CAPITAL CALLS TAB ────────────────────────────────────────── */}
            {activeTab === 'capital-calls' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-[1120px] w-full">

                    {/* Pending call alert banner */}
                    {nextDue && nextDue.status !== 'completed' && (
                        <div className="rounded-[var(--radius-xl)] border border-[#FDE68A] bg-[#FFFBEB] p-4 mb-5 flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0 mt-0.5">
                                <IconAlertTriangle size={16} stroke={2} color="#D97706" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="m-0 text-[13px] font-semibold text-[#92400E]">
                                        Call #{nextDue.callNumber} — {fmt(nextDue.amount)} due {new Date(nextDue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    {nextDueDays !== null && nextDueDays <= 14 && (
                                        <span className="inline-flex items-center rounded-full bg-[#FDE68A] text-[#92400E] px-2 py-0.5 text-[10px] font-semibold">
                                            {nextDueDays} days left
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-5 mt-2">
                                    <div>
                                        <p className="m-0 text-[10px] text-[#B45309] uppercase tracking-[0.06em] font-semibold">Total called</p>
                                        <p className="m-0 text-[14px] font-semibold text-[#92400E]">{fmt(investment.called)}</p>
                                    </div>
                                    <div className="w-px h-7 bg-[#FDE68A]" />
                                    <div>
                                        <p className="m-0 text-[10px] text-[#B45309] uppercase tracking-[0.06em] font-semibold">This call</p>
                                        <p className="m-0 text-[14px] font-semibold text-[#92400E]">{fmt(nextDue.amount)}</p>
                                    </div>
                                    <div className="w-px h-7 bg-[#FDE68A]" />
                                    <div>
                                        <p className="m-0 text-[10px] text-[#B45309] uppercase tracking-[0.06em] font-semibold">Uncalled</p>
                                        <p className="m-0 text-[14px] font-semibold text-[#92400E]">{fmt(remaining)}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => onNavigateToCapCall(nextDue.id)}
                                className="shrink-0 flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[#D97706] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#B45309] transition-colors"
                            >
                                Review & approve
                                <IconArrowRight size={13} stroke={2.5} />
                            </button>
                        </div>
                    )}

                    {/* KPI cards */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-4 py-3.5">
                            <p className="text-[11px] text-[var(--color-neutral-9)] m-0">Active calls</p>
                            <p className="text-[26px] font-semibold tracking-[-0.01em] text-[var(--color-black)] m-0 leading-[1.1] mt-1">
                                {linkedDecisions.filter(d => d.status !== 'completed').length}
                            </p>
                        </div>
                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-4 py-3.5">
                            <p className="text-[11px] text-[var(--color-neutral-9)] m-0">Pending approval</p>
                            <p className="text-[26px] font-semibold tracking-[-0.01em] m-0 leading-[1.1] mt-1" style={{ color: pendingAmount > 0 ? '#8B5CF6' : 'var(--color-black)' }}>
                                {pendingAmount > 0 ? fmt(pendingAmount) : '—'}
                            </p>
                            {nextDueDays !== null && pendingAmount > 0 && (
                                <p className="text-[11px] text-[var(--color-neutral-9)] m-0 mt-1">Due in {nextDueDays} days</p>
                            )}
                        </div>
                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-4 py-3.5">
                            <p className="text-[11px] text-[var(--color-neutral-9)] m-0">Remaining unfunded</p>
                            <p className="text-[26px] font-semibold tracking-[-0.01em] text-[var(--color-black)] m-0 leading-[1.1] mt-1">{fmt(remaining)}</p>
                            <p className="text-[11px] text-[var(--color-neutral-9)] m-0 mt-1">{100 - deployedPct}% uncalled</p>
                        </div>
                    </div>

                    {/* Section header */}
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0">Capital calls</h3>
                        <button
                            type="button"
                            onClick={() => setShowUpload(true)}
                            className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
                        >
                            <IconPlus size={14} stroke={2.5} />
                            New capital call
                        </button>
                    </div>

                    {/* Decision cards grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {linkedDecisions.map(d => (
                            <DecisionCard
                                key={d.id}
                                decision={d}
                                isNew={false}
                                onClick={() => onNavigateToCapCall(d.id)}
                            />
                        ))}
                        {/* Upload CTA placeholder */}
                        <button
                            type="button"
                            onClick={() => setShowUpload(true)}
                            className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-neutral-4)] bg-transparent py-10 text-[var(--color-neutral-9)] hover:border-[var(--color-accent-9)] hover:text-[var(--color-accent-9)] hover:bg-[var(--color-blue-1)] transition-all"
                        >
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                                <IconPlus size={18} stroke={2} />
                            </div>
                            <span className="text-[12px] font-semibold">Upload capital call</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ── DOCUMENTS TAB ────────────────────────────────────────────── */}
            {activeTab === 'documents' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-[1120px] w-full">
                    <div className="mb-4">
                        <h3 className="text-[15px] font-semibold text-[var(--color-black)] m-0 mb-1">Documents</h3>
                        <p className="m-0 text-[12px] text-[var(--color-neutral-9)]">Investment-related files and notices.</p>
                    </div>
                    <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] overflow-hidden">
                        {investment.documents.map((doc, idx) => (
                            <div
                                key={doc.name}
                                className={`flex items-center gap-3 px-5 py-4 ${idx < investment.documents.length - 1 ? 'border-b border-[var(--color-neutral-3)]' : ''} hover:bg-[var(--color-neutral-2)] transition-colors`}
                            >
                                <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[#FEE2E2] flex items-center justify-center shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 3.5h5.5L10 5v5.5H3V3.5z" stroke="#EF4444" strokeWidth="1.2" fill="none" />
                                        <path d="M8.5 3.5V5H10" stroke="#EF4444" strokeWidth="1.2" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="m-0 text-[13px] font-medium text-[var(--color-black)] truncate">{doc.name}</p>
                                    <p className="m-0 text-[11px] text-[var(--color-neutral-9)] mt-0.5">
                                        {doc.type} · {new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {doc.sizeKb} KB
                                    </p>
                                </div>
                                <button type="button" className="flex items-center gap-1 text-[12px] text-[var(--color-accent-9)] hover:underline shrink-0">
                                    <IconExternalLink size={13} stroke={2} />
                                    Open
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── MONITORING TAB ───────────────────────────────────────────── */}
            {activeTab === 'monitoring' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-[1120px] w-full">
                    {!investment.monitoring ? (
                        <div className="flex items-center justify-center h-32 text-[13px] text-[var(--color-neutral-9)]">
                            Monitoring data not yet available for this investment.
                        </div>
                    ) : (
                        (() => {
                            const monitoring = investment.monitoring
                            return (
                        <>
                            {/* KPI cards */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {([
                                    ['Net IRR', monitoring.irr, '#10B981'],
                                    ['TVPI', monitoring.tvpi, '#10B981'],
                                    ['NAV', fmt(monitoring.nav), 'var(--color-black)'],
                                ] as const).map(([label, value, color]) => (
                                    <div key={label} className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-4 py-3.5">
                                        <p className="text-[11px] text-[var(--color-neutral-9)] m-0">{label}</p>
                                        <p className="text-[26px] font-semibold tracking-[-0.01em] m-0 leading-[1.1] mt-1" style={{ color }}>
                                            {value}
                                        </p>
                                        <p className="text-[11px] text-[var(--color-neutral-9)] m-0 mt-0.5">{monitoring.reportDate}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* GP updates timeline */}
                                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                    <h3 className="text-[14px] font-semibold text-[var(--color-black)] m-0 mb-4">GP updates</h3>
                                    <div className="flex flex-col">
                                        {monitoring.gpUpdates.map((ev, idx) => {
                                            const dotColor = ev.type === 'report' ? '#2563EB' : ev.type === 'payment' ? '#10B981' : '#F59E0B'
                                            return (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <div className="flex flex-col items-center shrink-0">
                                                        <span className="mt-1 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dotColor }} />
                                                        {idx < monitoring.gpUpdates.length - 1 && (
                                                            <div className="w-px bg-[var(--color-neutral-4)] flex-1 my-1" style={{ minHeight: 16 }} />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-1 items-start justify-between gap-2 pb-3">
                                                        <div className="min-w-0">
                                                            <p className="m-0 text-[12px] font-semibold text-[var(--color-black)]">{ev.title}</p>
                                                            <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">{ev.description}</p>
                                                        </div>
                                                        <span className="text-[10px] text-[var(--color-neutral-8)] shrink-0 whitespace-nowrap">{ev.date}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {/* Portfolio companies */}
                                    <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                        <h3 className="text-[14px] font-semibold text-[var(--color-black)] m-0 mb-3">Portfolio companies</h3>
                                        <div className="flex flex-col divide-y divide-[var(--color-neutral-3)]">
                                            {monitoring.portfolioCompanies.map(co => (
                                                <div key={co.name} className="flex items-center justify-between py-2">
                                                    <span className="text-[12px] text-[var(--color-black)]">{co.name}</span>
                                                    {co.status === 'on-track' ? (
                                                        <span className="text-[11px] font-semibold text-[#065F46]">On track</span>
                                                    ) : (
                                                        <span className="text-[11px] font-semibold text-[#92400E]">Watch list</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Next events */}
                                    <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                        <h3 className="text-[14px] font-semibold text-[var(--color-black)] m-0 mb-3">Next events</h3>
                                        <div className="flex flex-col divide-y divide-[var(--color-neutral-3)]">
                                            {monitoring.nextEvents.map(ev => (
                                                <div key={ev.label} className="flex items-center justify-between py-2">
                                                    <span className="text-[12px] text-[var(--color-black)]">{ev.label}</span>
                                                    <span className={`text-[12px] font-medium ${ev.urgent ? 'text-[#C05500]' : 'text-[var(--color-neutral-10)]'}`}>
                                                        {ev.date}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                            )
                        })()
                    )}
                </div>
            )}

            {/* ── AI BRIEF TAB ─────────────────────────────────────────────── */}
            {activeTab === 'ai-brief' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-[1120px] w-full">
                    {!brief ? (
                        <div className="flex items-center justify-center h-32 text-[13px] text-[var(--color-neutral-9)]">
                            AI brief not yet generated for this investment.
                        </div>
                    ) : (
                        <>
                            {/* Score banner */}
                            <div
                                className="rounded-[var(--radius-xl)] p-5 mb-4 flex items-center justify-between text-white overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #005BE2 0%, #7C3AED 100%)' }}
                            >
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] opacity-70 m-0">AI Investment Score</p>
                                    <p className="text-[40px] font-bold m-0 mt-1 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                                        {brief.score}
                                        <span className="text-[18px] opacity-60">/100</span>
                                    </p>
                                    <p className="text-[13px] font-medium opacity-90 m-0 mt-1">{brief.scoreLabel}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] opacity-70 m-0">Generated</p>
                                    <p className="text-[13px] font-medium m-0 mt-0.5">May 13, 2026</p>
                                    <p className="text-[11px] opacity-60 m-0 mt-0.5">by Fojo AI</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* AI Summary */}
                                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                    <h3 className="text-[14px] font-semibold text-[var(--color-black)] m-0 mb-3 flex items-center gap-2">
                                        <IconSparkles size={15} stroke={2} color="#7C3AED" />
                                        AI Summary
                                    </h3>
                                    <p className="text-[13px] text-[var(--color-neutral-11)] leading-[1.6] m-0 mb-4">
                                        {brief.summary}
                                    </p>
                                    <div className="border-t border-[var(--color-neutral-3)] pt-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] m-0 mb-2">Key factors</p>
                                        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
                                            {brief.keyFactors.map((f, i) => (
                                                <li key={i} className="flex items-center gap-2 text-[12px] text-[var(--color-neutral-11)]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-9)] shrink-0" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Approval Pipeline */}
                                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                    <h3 className="text-[14px] font-semibold text-[var(--color-black)] m-0 mb-4">Approval Pipeline</h3>
                                    <div className="flex flex-col gap-3">
                                        {brief.approvals.map((approval, idx) => (
                                            <div key={idx} className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-[var(--color-blue-3)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent-9)] shrink-0">
                                                        {approval.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] font-semibold text-[var(--color-black)] m-0">{approval.name}</p>
                                                        <p className="text-[10px] text-[var(--color-neutral-9)] m-0">{approval.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    {approval.status === 'approved' && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] text-[#065F46] px-2 py-0.5 text-[10px] font-semibold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                                            Approved
                                                        </span>
                                                    )}
                                                    {approval.status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] text-[#92400E] px-2 py-0.5 text-[10px] font-semibold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                                                            Pending
                                                        </span>
                                                    )}
                                                    {approval.status === 'declined' && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] text-[#991B1B] px-2 py-0.5 text-[10px] font-semibold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                                                            Declined
                                                        </span>
                                                    )}
                                                    {approval.date && (
                                                        <p className="text-[10px] text-[var(--color-neutral-8)] m-0 mt-0.5">
                                                            {formatDate(approval.date)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Document Gaps */}
                                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                    <h3 className="text-[14px] font-semibold text-[var(--color-black)] m-0 mb-3 flex items-center gap-2">
                                        <IconAlertTriangle size={15} stroke={2} color="#F59E0B" />
                                        Document Gaps
                                    </h3>
                                    {brief.documentGaps.length === 0 ? (
                                        <p className="text-[13px] text-[#10B981] m-0 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                                            All documents are up to date.
                                        </p>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {brief.documentGaps.map((gap, idx) => {
                                                const URGENCY_CFG = {
                                                    missing:  { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444', label: 'Missing' },
                                                    overdue:  { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444', label: 'Overdue' },
                                                    expiring: { bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B', label: 'Expiring' },
                                                    expected: { bg: '#F9FAFB', text: '#374151', dot: '#9CA3AF', label: 'Expected' },
                                                } as const
                                                const ucfg = URGENCY_CFG[gap.urgency]
                                                return (
                                                    <div key={idx} className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-medium text-[var(--color-black)] m-0 truncate">{gap.name}</p>
                                                            <p className="text-[11px] text-[var(--color-neutral-9)] m-0 mt-0.5">{gap.note}</p>
                                                        </div>
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0"
                                                            style={{ background: ucfg.bg, color: ucfg.text }}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ucfg.dot }} />
                                                            {ucfg.label}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Portfolio Fit */}
                                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                    <h3 className="text-[14px] font-semibold text-[var(--color-black)] m-0 mb-4">Portfolio Fit</h3>
                                    <div className="flex flex-col gap-4">
                                        {brief.portfolioFit.map((fit, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[12px] font-medium text-[var(--color-neutral-11)]">{fit.label}</span>
                                                    <span
                                                        className="text-[12px] font-bold"
                                                        style={{ color: fit.pct >= 80 ? '#10B981' : fit.pct >= 60 ? '#F59E0B' : '#EF4444' }}
                                                    >
                                                        {fit.pct}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-[var(--color-neutral-3)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${fit.pct}%`,
                                                            background: fit.pct >= 80 ? '#10B981' : fit.pct >= 60 ? '#F59E0B' : '#EF4444',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Capital Call Watch Items */}
                                {linkedDecisions.length > 0 && (() => {
                                    const watchItems = linkedDecisions
                                        .filter(d => d.status !== 'completed')
                                        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                                        .map(d => {
                                            const days = Math.ceil((new Date(d.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                            const action =
                                                d.status === 'pending' ? 'confirm receipt, review terms, and obtain required authorization signature' :
                                                d.status === 'wire-ready' ? 'initiate wire transfer and retain a signed copy for the document record' :
                                                d.status === 'approved' ? 'verify administrative oversight and proceed to execution' :
                                                'monitor status and confirm fund has held a final close'
                                            const urgency: 'red' | 'amber' | 'neutral' = days <= 7 ? 'red' : days <= 21 ? 'amber' : 'neutral'
                                            return { d, days, action, urgency }
                                        })
                                    const URGENCY = {
                                        red:     { dot: '#EF4444', bg: '#FEF2F2', text: '#991B1B', label: 'Urgent' },
                                        amber:   { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E', label: 'Due soon' },
                                        neutral: { dot: '#9CA3AF', bg: '#F9FAFB', text: '#374151', label: 'Upcoming' },
                                    }
                                    return (
                                        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-5">
                                            <h3 className="text-[14px] font-semibold text-[var(--color-black)] m-0 mb-3 flex items-center gap-2">
                                                <IconAlertTriangle size={15} stroke={2} color="#D97706" />
                                                Capital Call Watch Items
                                            </h3>
                                            <div className="flex flex-col gap-3">
                                                {watchItems.map(({ d, days, action, urgency }) => {
                                                    const ucfg = URGENCY[urgency]
                                                    return (
                                                        <button
                                                            key={d.id}
                                                            type="button"
                                                            onClick={() => onNavigateToCapCall(d.id)}
                                                            className="flex items-start gap-3 text-left group hover:bg-[var(--color-neutral-2)] rounded-[var(--radius-md)] p-2 -mx-2 transition-colors"
                                                        >
                                                            <span
                                                                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 mt-0.5"
                                                                style={{ background: ucfg.bg, color: ucfg.text }}
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ucfg.dot }} />
                                                                {ucfg.label}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="m-0 text-[12px] font-semibold text-[var(--color-black)]">
                                                                    Call #{d.callNumber} — {fmt(d.amount)}
                                                                </p>
                                                                <p className="m-0 text-[11px] text-[var(--color-neutral-10)] mt-0.5 leading-[1.45]">
                                                                    {action} before {new Date(d.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
                                                                </p>
                                                            </div>
                                                            <span className="text-[11px] text-[var(--color-neutral-9)] shrink-0 mt-0.5">{days > 0 ? `${days}d` : 'today'}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── IC Approval Footer (IC Review stage only) ─────────────────── */}
            {isICReview && !isApproved && (
                <div className="shrink-0 border-t border-[var(--color-neutral-4)] bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-6 py-3 flex items-center gap-4">
                    {/* Left: step info */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center -space-x-1.5">
                            {approvals.map(a => (
                                <div
                                    key={a.step}
                                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold shrink-0"
                                    style={{
                                        background: a.status === 'approved' ? '#ECFDF5' : a.status === 'waiting' ? a.avatarBg : 'var(--color-neutral-3)',
                                        color: a.status === 'approved' ? '#059669' : a.status === 'waiting' ? '#374151' : 'var(--color-neutral-8)',
                                        zIndex: approvals.length - a.step + 1,
                                    }}
                                >
                                    {a.status === 'approved' ? '✓' : a.initials}
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="m-0 text-[11px] font-semibold text-[var(--color-black)] leading-[1.3]">
                                IC Approval Workflow
                                <span className="font-normal text-[var(--color-neutral-9)]">
                                    {` · Step ${approvedCount + 1} of ${approvals.length}`}
                                    {waitingApproval ? ` · ${waitingApproval.role}` : ''}
                                </span>
                            </p>
                            <p className="m-0 text-[11px] leading-[1.3] mt-0.5">
                                {waitingApproval?.staleDays ? (
                                    <span className="text-amber-600 font-medium">{waitingApproval.staleDays}d stalled</span>
                                ) : (
                                    <span className="text-[var(--color-neutral-9)]">
                                        Waiting for {waitingApproval?.name ?? '—'}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    {/* Center: comment input */}
                    <input
                        type="text"
                        value={approverComment}
                        onChange={e => setApproverComment(e.target.value)}
                        placeholder="Conditions or comment (optional)"
                        className="flex-1 min-w-0 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-3 py-2 text-[12px] text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] focus:outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-colors"
                    />
                    {/* Right: action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleSendBack}
                            className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors"
                        >
                            <IconChevronLeft size={13} stroke={2} />
                            Send Back
                        </button>
                        <button
                            type="button"
                            onClick={() => setPipelineStage('declined')}
                            className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-[12px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                        >
                            <IconX size={13} stroke={2} />
                            Decline
                        </button>
                        <button
                            type="button"
                            onClick={handleApprove}
                            className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
                        >
                            <IconCheck size={13} stroke={2.5} />
                            Approve
                        </button>
                    </div>
                </div>
            )}

            {/* Upload modal */}
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onCreated={(id) => {
                        setShowUpload(false)
                        onNavigateToCapCall(id)
                    }}
                />
            )}

            {/* Stage advance modal */}
            {showAdvanceModal && nextStage && nextStageCfg && createPortal(
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={() => setShowAdvanceModal(false)}
                    />
                    <div className="relative z-10 w-full max-w-[420px] bg-white rounded-[var(--radius-2xl)] shadow-[0_32px_100px_rgba(0,0,0,0.18)] p-6">
                        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--color-neutral-9)] mb-2">
                            {investment.fundNameShort}
                        </p>
                        <h2 className="text-[18px] font-semibold text-[var(--color-black)] m-0 mb-3">
                            Advance to {nextStageCfg.label}
                        </h2>
                        <p className="text-[13px] text-[var(--color-neutral-10)] leading-[1.6] m-0 mb-5">
                            {nextStage === 'ic-review'
                                ? 'This will trigger the IC approval workflow. The investment will be routed to reviewers based on the commitment amount.'
                                : `Move this investment from ${currentStageCfg.label} to ${nextStageCfg.label}.`}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAdvanceModal(false)}
                                className="px-4 py-2 rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--color-neutral-11)] bg-[var(--color-neutral-2)] hover:bg-[var(--color-neutral-3)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAdvanceStage}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] text-[13px] font-semibold text-white bg-[var(--color-accent-9)] hover:opacity-90 transition-opacity"
                            >
                                {nextStage === 'ic-review' ? 'Submit for IC Review' : `Advance to ${nextStageCfg.label}`}
                                <IconChevronRight size={14} stroke={2.5} />
                            </button>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    )
}
