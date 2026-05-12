import { useState, useEffect, useRef, useCallback } from 'react'
import {
    IconPlus, IconChevronRight, IconX, IconUpload, IconSparkles, IconCheck,
    IconLayoutGrid, IconList, IconSearch, IconAdjustmentsHorizontal,
    IconChevronDown, IconArrowUp, IconArrowDown,
} from '@tabler/icons-react'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { CAPITAL_CALL_DECISIONS } from '@/data/thornton/capital-call-decisions-data'
import type { DecisionStatus } from '@/data/thornton/capital-call-decisions-data'

// ─── constants ─────────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<{ key: DecisionStatus | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending approval' },
    { key: 'approved', label: 'Approved' },
    { key: 'wire-ready', label: 'Wire ready' },
    { key: 'completed', label: 'Completed' },
]

const STATUS_BADGE: Record<DecisionStatus, { label: string; dot: string; text: string; bg: string }> = {
    pending: { label: 'Pending', dot: '#F59E0B', text: '#92400E', bg: '#FFFBEB' },
    approved: { label: 'Approved', dot: '#10B981', text: '#065F46', bg: '#ECFDF5' },
    flagged: { label: 'Flagged', dot: '#EF4444', text: '#991B1B', bg: '#FEF2F2' },
    'wire-ready': { label: 'Wire ready', dot: '#6366F1', text: '#3730A3', bg: '#EEF2FF' },
    completed: { label: 'Completed', dot: '#6B7280', text: '#374151', bg: '#F9FAFB' },
}

const EXTRACTION_FIELDS = [
    { label: 'Fund / GP', value: 'Greentech Opportunities Fund III, L.P. / Meridian Capital Partners', confidence: 99 },
    { label: 'Limited Partner', value: 'Real Estate Holding LLC', confidence: 97 },
    { label: 'Amount called', value: '$500,000.00 USD', confidence: 99 },
    { label: 'Call number', value: 'Call #07 of 12', confidence: 98 },
    { label: 'Due date', value: 'May 30, 2026 · 5:00 PM ET', confidence: 96 },
    { label: 'Wire instructions', value: 'ABA 021000128 / Account ···· 4419', confidence: 99 },
]

// ─── helpers ───────────────────────────────────────────────────────────────

function fmt(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
    return `$${v.toLocaleString()}`
}

function formatDue(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(iso: string): number {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

// ─── Thornton Documents library ────────────────────────────────────────────

const THORNTON_DOCS = [
    {
        name: 'Meridian_CapCall_07_RE-Holding.pdf',
        label: 'Meridian CapCall 07 — RE Holding',
        size: '218 KB',
        isCapitalCall: true,
        recordId: 'CAPCAL-1',
    },
    {
        name: 'Whitmore_CapCall_03_ThorntonTrust.pdf',
        label: 'Whitmore CapCall 03 — Thornton Trust',
        size: '184 KB',
        isCapitalCall: true,
        recordId: 'CAPCAL-2',
    },
    {
        name: 'Dynasty Trust I — 2025 Distribution Schedule.pdf',
        label: 'Dynasty Trust I — 2025 Distribution Schedule',
        size: '342 KB',
        isCapitalCall: false,
        recordId: null,
    },
    {
        name: 'Thornton Asset Inventory — 2026.pdf',
        label: 'Thornton Asset Inventory — 2026',
        size: '1.2 MB',
        isCapitalCall: false,
        recordId: null,
    },
    {
        name: 'Charitable Donation Receipts 2025.pdf',
        label: 'Charitable Donation Receipts 2025',
        size: '89 KB',
        isCapitalCall: false,
        recordId: null,
    },
    {
        name: 'Tesla Model X — Auto Insurance Policy.pdf',
        label: 'Tesla Model X — Auto Insurance Policy',
        size: '156 KB',
        isCapitalCall: false,
        recordId: null,
    },
]

function PdfDocIcon({ isCapitalCall, isSelected }: { isCapitalCall: boolean; isSelected: boolean }) {
    return (
        <div className={`relative w-[72px] h-[88px] rounded-[6px] border-2 flex flex-col items-center justify-end pb-2 transition-all ${
            isSelected
                ? 'border-[var(--color-accent-9)] bg-[var(--color-blue-1)] shadow-md'
                : 'border-[var(--color-neutral-4)] bg-white'
        }`}>
            {/* Document lines */}
            <div className="absolute top-3 left-0 right-0 flex flex-col items-center gap-1 px-2">
                <div className="w-full h-[3px] rounded-full bg-[var(--color-neutral-3)]" />
                <div className="w-full h-[3px] rounded-full bg-[var(--color-neutral-3)]" />
                <div className="w-3/4 h-[3px] rounded-full bg-[var(--color-neutral-3)]" />
                <div className="w-full h-[3px] rounded-full bg-[var(--color-neutral-3)]" />
                <div className="w-2/3 h-[3px] rounded-full bg-[var(--color-neutral-3)]" />
            </div>
            {/* PDF badge */}
            <div className={`rounded-[3px] px-1.5 py-0.5 text-[9px] font-bold text-white ${isCapitalCall ? 'bg-[#EF4444]' : 'bg-[#6B7280]'}`}>
                PDF
            </div>
            {/* Capital call indicator */}
            {isCapitalCall && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#7C3AED] border-2 border-white flex items-center justify-center">
                    <span className="text-[7px] font-bold text-white">$</span>
                </div>
            )}
        </div>
    )
}

// ─── Upload modal ───────────────────────────────────────────────────────────

type UploadPhase = 'drop' | 'extracting' | 'done'

interface UploadModalProps {
    onClose: () => void
    onCreated: (id: string) => void
}

function UploadModal({ onClose, onCreated }: UploadModalProps) {
    const [phase, setPhase] = useState<UploadPhase>('drop')
    const [fileName, setFileName] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const [visibleFields, setVisibleFields] = useState(0)
    const [showMatch, setShowMatch] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

    function clearTimers() {
        timersRef.current.forEach(clearTimeout)
        timersRef.current = []
    }

    function startExtraction(name: string) {
        setFileName(name)
        setPhase('extracting')
        setVisibleFields(0)
        setShowMatch(false)

        EXTRACTION_FIELDS.forEach((_, idx) => {
            const t = setTimeout(() => setVisibleFields(idx + 1), 500 + idx * 420)
            timersRef.current.push(t)
        })
        const matchT = setTimeout(() => setShowMatch(true), 500 + EXTRACTION_FIELDS.length * 420 + 200)
        timersRef.current.push(matchT)
        const doneT = setTimeout(() => setPhase('done'), 500 + EXTRACTION_FIELDS.length * 420 + 900)
        timersRef.current.push(doneT)
    }

    useEffect(() => () => clearTimers(), [])

    function handleFile(file: File) {
        clearTimers()
        startExtraction(file.name)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback(() => setIsDragging(false), [])

    function handleDocSelect(docName: string) {
        setSelectedDoc(prev => prev === docName ? null : docName)
    }

    function handleUseSelected() {
        if (selectedDoc) {
            clearTimers()
            startExtraction(selectedDoc)
        }
    }

    const selectedDocObj = THORNTON_DOCS.find(d => d.name === selectedDoc)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
            <div
                className="relative bg-white rounded-[var(--radius-xl)] shadow-2xl w-full max-w-[680px] mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-neutral-4)]">
                    <div>
                        <h2 className="text-[16px] font-semibold text-[var(--color-black)] m-0">New capital call</h2>
                        <p className="m-0 text-[12px] text-[var(--color-neutral-9)] mt-0.5">Upload a capital call notice PDF or select from Thornton Documents</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-neutral-3)] text-[var(--color-neutral-9)] transition-colors">
                        <IconX size={18} stroke={2} />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-5">
                    {/* DROP PHASE */}
                    {phase === 'drop' && (
                        <>
                            {/* Drag-and-drop zone — compact */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex items-center gap-4 rounded-[var(--radius-xl)] border-2 border-dashed px-5 py-4 cursor-pointer transition-colors ${
                                    isDragging
                                        ? 'border-[var(--color-accent-9)] bg-[var(--color-blue-1)]'
                                        : 'border-[var(--color-neutral-5)] bg-[var(--color-neutral-2)] hover:border-[var(--color-accent-9)] hover:bg-[var(--color-blue-1)]'
                                }`}
                            >
                                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleInputChange} />
                                <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 transition-colors ${isDragging ? 'bg-[var(--color-accent-9)]' : 'bg-[var(--color-neutral-4)]'}`}>
                                    <IconUpload size={18} stroke={1.75} className={isDragging ? 'text-white' : 'text-[var(--color-neutral-9)]'} />
                                </div>
                                <div>
                                    <p className="m-0 text-[13px] font-semibold text-[var(--color-black)]">
                                        {isDragging ? 'Drop to upload' : 'Drop a capital call PDF here'}
                                    </p>
                                    <p className="m-0 text-[12px] text-[var(--color-neutral-9)] mt-0.5">
                                        or <span className="text-[var(--color-accent-9)] font-medium">browse your computer</span> · PDF only
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-[var(--color-neutral-4)]" />
                                <span className="text-[11px] font-medium text-[var(--color-neutral-9)]">or select from</span>
                                <div className="flex-1 h-px bg-[var(--color-neutral-4)]" />
                            </div>

                            {/* Thornton Documents section */}
                            <div>
                                {/* Section header — mimics macOS Finder toolbar */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-sm bg-[#4B83CD] flex items-center justify-center">
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M0 1.5C0 0.672 0.672 0 1.5 0H3.5L5 2H8.5C9.328 2 10 2.672 10 3.5V6.5C10 7.328 9.328 8 8.5 8H1.5C0.672 8 0 7.328 0 6.5V1.5Z" fill="white" fillOpacity="0.9"/>
                                            </svg>
                                        </div>
                                        <span className="text-[13px] font-semibold text-[var(--color-black)]">Thornton Documents</span>
                                        <span className="text-[11px] text-[var(--color-neutral-9)]">{THORNTON_DOCS.length} items</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                                        <span className="text-[10px] font-semibold text-[#7C3AED]">Capital call PDFs highlighted</span>
                                    </div>
                                </div>

                                {/* Document grid */}
                                <div className="grid grid-cols-6 gap-3">
                                    {THORNTON_DOCS.map(doc => (
                                        <button
                                            key={doc.name}
                                            type="button"
                                            onClick={() => handleDocSelect(doc.name)}
                                            className="flex flex-col items-center gap-1.5 group"
                                        >
                                            <PdfDocIcon
                                                isCapitalCall={doc.isCapitalCall}
                                                isSelected={selectedDoc === doc.name}
                                            />
                                            <span className={`text-[10px] leading-[1.3] text-center line-clamp-2 transition-colors ${
                                                selectedDoc === doc.name
                                                    ? 'text-[var(--color-accent-9)] font-semibold'
                                                    : 'text-[var(--color-neutral-11)] group-hover:text-[var(--color-black)]'
                                            }`}>
                                                {doc.label}
                                            </span>
                                            <span className="text-[9px] text-[var(--color-neutral-9)]">{doc.size}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Selected doc action */}
                                {selectedDoc && (
                                    <div className="mt-4 flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-accent-9)] bg-[var(--color-blue-1)] px-4 py-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-6 h-6 rounded-[4px] bg-[#FEE2E2] flex items-center justify-center shrink-0">
                                                <span className="text-[8px] font-bold text-[#EF4444]">PDF</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="m-0 text-[12px] font-semibold text-[var(--color-black)] truncate">{selectedDoc}</p>
                                                {selectedDocObj?.isCapitalCall && (
                                                    <p className="m-0 text-[11px] text-[#7C3AED]">
                                                        <IconSparkles size={10} className="inline mr-0.5" />
                                                        Fojo will extract capital call fields
                                                    </p>
                                                )}
                                                {!selectedDocObj?.isCapitalCall && (
                                                    <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">Not a capital call document — Fojo will attempt extraction</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleUseSelected}
                                            className="shrink-0 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-4 py-2 text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
                                        >
                                            Use this document
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* EXTRACTING PHASE */}
                    {(phase === 'extracting' || phase === 'done') && (
                        <div className="flex flex-col gap-4">
                            {/* File row */}
                            <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-[var(--color-neutral-2)] px-4 py-3">
                                <div className="w-8 h-8 rounded-[6px] bg-[#FEE2E2] flex items-center justify-center shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 3.5h5.5L10 5v5.5H3V3.5z" stroke="#EF4444" strokeWidth="1.2" fill="none" />
                                        <path d="M8.5 3.5V5H10" stroke="#EF4444" strokeWidth="1.2" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="m-0 text-[12px] font-semibold text-[var(--color-black)] truncate">{fileName}</p>
                                    <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">
                                        {phase === 'done' ? 'Extraction complete' : 'Uploading…'}
                                    </p>
                                </div>
                                {phase === 'done' && (
                                    <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                                        <IconCheck size={12} stroke={2.5} className="text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Fojo label */}
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center shrink-0">
                                    <IconSparkles size={11} className="text-white" />
                                </div>
                                <span className="text-[12px] font-semibold text-[#7C3AED]">
                                    {phase === 'done' ? 'Fojo extracted all fields' : 'Fojo is extracting…'}
                                </span>
                                {phase === 'extracting' && (
                                    <span className="flex gap-0.5 ml-1">
                                        {[0, 1, 2].map(i => (
                                            <span
                                                key={i}
                                                className="w-1 h-1 rounded-full bg-[#7C3AED] opacity-70"
                                                style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
                                            />
                                        ))}
                                    </span>
                                )}
                            </div>

                            {/* Extracted fields */}
                            <div className="flex flex-col gap-1.5">
                                {EXTRACTION_FIELDS.map((field, idx) => {
                                    const visible = idx < visibleFields
                                    return (
                                        <div
                                            key={field.label}
                                            className={`flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2 transition-all duration-300 ${
                                                visible
                                                    ? 'opacity-100 translate-y-0 bg-[#FAFAFA] border border-[var(--color-neutral-3)]'
                                                    : 'opacity-0 translate-y-1'
                                            }`}
                                            style={{ transitionProperty: 'opacity, transform' }}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="text-[11px] text-[var(--color-neutral-9)] w-[110px] shrink-0">{field.label}</span>
                                                <span className="text-[12px] font-medium text-[var(--color-black)] truncate"
                                                    style={{ color: '#7C3AED' }}>
                                                    {field.value}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-[var(--color-neutral-9)] shrink-0 ml-2">
                                                {field.confidence}%
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Match found */}
                            {showMatch && (
                                <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-[#D1FAE5] bg-[#F0FDF4] px-4 py-3 transition-all duration-300">
                                    <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[#1A1A2E] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                                        G
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="m-0 text-[12px] font-semibold text-[#065F46]">
                                            Matched to investment · 98% confidence
                                        </p>
                                        <p className="m-0 text-[11px] text-[#047857]">
                                            Greentech Opp. Fund III · INV-2024-014 · 6 of 12 prior calls drawn
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#065F46] shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                        98%
                                    </span>
                                </div>
                            )}

                            {/* Footer actions */}
                            {phase === 'done' && (
                                <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={onClose} className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] px-4 py-2.5 text-[13px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onCreated('CAPCAL-1')}
                                        className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                                    >
                                        Create record →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                    40% { transform: translateY(-4px); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

// ─── Decision Card (grid view) ─────────────────────────────────────────────

function DecisionCard({ decision, isNew, onClick }: {
    decision: typeof CAPITAL_CALL_DECISIONS[0]
    isNew: boolean
    onClick: () => void
}) {
    const badge = STATUS_BADGE[decision.status]
    const days = daysUntil(decision.dueDate)
    const isUrgent = days <= 14 && decision.status === 'pending'
    const approvedCount = decision.approvals.filter(a => a.status === 'approved').length
    const paidPct = Math.round(decision.drawnBefore * 100)
    const totalPct = Math.round(decision.drawnAfter * 100)

    return (
        <button
            type="button"
            onClick={onClick}
            className={`group flex flex-col text-left rounded-[var(--radius-xl)] border bg-white transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${
                isNew ? 'border-[#10B981] ring-2 ring-[#D1FAE5]' : 'border-[var(--color-neutral-4)] hover:border-[var(--color-neutral-6)]'
            }`}
        >
            {/* Card top strip — colored by status */}
            <div className="h-1 w-full" style={{ background: badge.dot }} />

            <div className="flex flex-col gap-3 p-4 flex-1">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: badge.bg, color: badge.text }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: badge.dot }} />
                        {badge.label}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--color-neutral-8)] shrink-0">{decision.id}</span>
                </div>

                {/* Title */}
                <div>
                    <p className="m-0 text-[14px] font-semibold text-[var(--color-black)] leading-[1.35] line-clamp-2">
                        {decision.title}
                    </p>
                    <p className="m-0 text-[11px] text-[var(--color-neutral-9)] mt-1 truncate">
                        {decision.fund.replace(', L.P.', '')}
                    </p>
                    <p className="m-0 text-[11px] text-[var(--color-neutral-8)] truncate">{decision.entity}</p>
                </div>

                {/* Amount + deadline */}
                <div className="flex items-end justify-between gap-2 pt-1 border-t border-[var(--color-neutral-3)]">
                    <div>
                        <p className="m-0 text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-[var(--color-black)] leading-none">
                            {fmt(decision.amount)}
                        </p>
                        <p className="m-0 text-[10px] text-[var(--color-neutral-9)] mt-0.5">
                            {Math.round((decision.amount / decision.commitment) * 100)}% of commitment
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className={`m-0 text-[12px] font-semibold ${isUrgent ? 'text-[#B45309]' : 'text-[var(--color-black)]'}`}>
                            {new Date(decision.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className={`m-0 text-[10px] ${isUrgent ? 'text-[#D97706]' : 'text-[var(--color-neutral-9)]'}`}>
                            {days > 0 ? `${days} days` : 'Today'}
                        </p>
                    </div>
                </div>

                {/* Progress bar + meta */}
                <div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-neutral-9)] mb-1">
                        <span>Drawn {paidPct}% → {totalPct}%</span>
                        <span>#{decision.callNumber} of {decision.totalCalls}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[var(--color-neutral-3)] overflow-hidden flex">
                        <div className="h-full" style={{ width: `${paidPct}%`, background: '#005BE2' }} />
                        <div className="h-full" style={{ width: `${totalPct - paidPct}%`, background: '#93C5FD' }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-[var(--color-neutral-9)]">
                            {approvedCount}/{decision.approvals.length} approvals
                        </span>
                        <div className="flex -space-x-1">
                            {decision.approvals.slice(0, 3).map(a => (
                                <div key={a.id} className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[7px] font-bold text-white" style={{ background: a.color }}>
                                    {a.initials[0]}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </button>
    )
}

// ─── main page ─────────────────────────────────────────────────────────────

type ViewMode = 'grid' | 'list'
type SortKey = 'dueDate' | 'amount' | 'status'

const QUICK_FILTERS = [
    { label: 'Due soon', color: '#F59E0B', check: (d: typeof CAPITAL_CALL_DECISIONS[0]) => daysUntil(d.dueDate) <= 21 },
    { label: 'Pending approval', color: '#F59E0B', check: (d: typeof CAPITAL_CALL_DECISIONS[0]) => d.status === 'pending' },
    { label: 'High value', color: null, check: (d: typeof CAPITAL_CALL_DECISIONS[0]) => d.amount >= 500_000 },
    { label: 'Wire ready', color: '#6366F1', check: (d: typeof CAPITAL_CALL_DECISIONS[0]) => d.status === 'wire-ready' },
]

interface Props {
    onOpenDetail: (id: string) => void
}

export function DecisionsPage({ onOpenDetail }: Props) {
    const [activeFilter, setActiveFilter] = useState<DecisionStatus | 'all'>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>('dueDate')
    const [sortAsc, setSortAsc] = useState(true)
    const [activeQuick, setActiveQuick] = useState<string | null>(null)
    const [showUpload, setShowUpload] = useState(false)
    const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null)

    const pendingDecisions = CAPITAL_CALL_DECISIONS.filter(d => d.status === 'pending')
    const pendingCount = pendingDecisions.length
    const totalPending = pendingDecisions.reduce((s, d) => s + d.amount, 0)
    const kpiTotalAmt = CAPITAL_CALL_DECISIONS.reduce((s, d) => s + d.amount, 0)
    const kpiNextDue = CAPITAL_CALL_DECISIONS.slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
    const kpiNextDueDays = kpiNextDue ? daysUntil(kpiNextDue.dueDate) : 999
    const kpiNextDueLabel = kpiNextDue ? new Date(kpiNextDue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
    const kpis = [
        { label: 'Total pipeline', value: fmt(kpiTotalAmt), sub: `${CAPITAL_CALL_DECISIONS.length} decisions`, color: null },
        { label: 'Awaiting approval', value: pendingCount > 0 ? fmt(totalPending) : '—', sub: pendingCount > 0 ? `${pendingCount} decision${pendingCount > 1 ? 's' : ''}` : 'All reviewed', color: pendingCount > 0 ? '#D97706' : null },
        { label: 'Next deadline', value: kpiNextDueLabel, sub: kpiNextDueDays <= 14 ? `${kpiNextDueDays} days — urgent` : `${kpiNextDueDays} days`, color: kpiNextDueDays <= 14 ? '#D97706' : null },
    ]

    const quickCounts = QUICK_FILTERS.map(qf => CAPITAL_CALL_DECISIONS.filter(qf.check).length)

    const filtered = CAPITAL_CALL_DECISIONS
        .filter(d => activeFilter === 'all' || d.status === activeFilter)
        .filter(d => !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.fund.toLowerCase().includes(search.toLowerCase()) || d.entity.toLowerCase().includes(search.toLowerCase()))
        .filter(d => !activeQuick || QUICK_FILTERS.find(qf => qf.label === activeQuick)?.check(d))
        .sort((a, b) => {
            let cmp = 0
            if (sortKey === 'dueDate') cmp = a.dueDate.localeCompare(b.dueDate)
            if (sortKey === 'amount') cmp = a.amount - b.amount
            if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
            return sortAsc ? cmp : -cmp
        })

    function toggleSort(key: SortKey) {
        if (sortKey === key) setSortAsc(v => !v)
        else { setSortKey(key); setSortAsc(true) }
    }

    function handleCreated(id: string) {
        setShowUpload(false)
        setNewlyCreatedId(id)
        setTimeout(() => onOpenDetail(id), 300)
    }

    function SortIcon({ k }: { k: SortKey }) {
        if (sortKey !== k) return null
        return sortAsc
            ? <IconArrowUp size={11} stroke={2.5} className="inline ml-0.5" />
            : <IconArrowDown size={11} stroke={2.5} className="inline ml-0.5" />
    }

    return (
        <div className="flex flex-col flex-1 gap-0 pt-[36px] pb-8 max-w-[1120px] w-full mx-auto px-[var(--spacing-6)]">

            {/* ── Page header ──────────────────────────────────────────── */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] m-0 mb-1">
                        Investment Workflow
                    </p>
                    <div className="flex items-center gap-2">
                        <h1 className="text-[28px] font-semibold text-[var(--color-black)] m-0 tracking-[-0.01em]">Decisions</h1>
                        <span className="rounded-full bg-[var(--color-neutral-3)] px-2 py-0.5 text-[12px] font-semibold text-[var(--color-neutral-10)]">
                            {CAPITAL_CALL_DECISIONS.length}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <button
                        type="button"
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-white px-3 py-2 text-[13px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors"
                    >
                        Import email +
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-3 py-2 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        <IconPlus size={15} stroke={2.5} />
                        New capital call
                    </button>
                </div>
            </div>

            {/* ── KPI summary bar ─────────────────────────────────────── */}
            <div className="flex items-stretch gap-3 mb-6">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="flex-1 rounded-[var(--radius-lg)] border border-[var(--color-neutral-4)] bg-white px-4 py-3">
                        <p className="m-0 text-[11px] font-medium text-[var(--color-neutral-9)] uppercase tracking-[0.06em] mb-1">{kpi.label}</p>
                        <p className="m-0 text-[22px] font-semibold tracking-[-0.02em]" style={{ color: kpi.color ?? 'var(--color-black)' }}>{kpi.value}</p>
                        <p className="m-0 text-[11px]" style={{ color: kpi.color ? '#B45309' : 'var(--color-neutral-9)' }}>{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 mb-2">
                {/* Fund dropdown */}
                <button type="button" className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors">
                    Fund
                    <IconChevronDown size={14} stroke={2} className="text-[var(--color-neutral-9)]" />
                </button>

                {/* Status dropdown */}
                <button type="button" className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors">
                    Status
                    <IconChevronDown size={14} stroke={2} className="text-[var(--color-neutral-9)]" />
                </button>

                {/* Filters */}
                <button type="button" className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)] transition-colors">
                    <IconAdjustmentsHorizontal size={15} stroke={1.75} className="text-[var(--color-neutral-9)]" />
                    Filters
                </button>

                {/* Search */}
                <div className="relative flex-1 max-w-[240px]">
                    <IconSearch size={14} stroke={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-neutral-8)]" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white pl-8 pr-3 py-1.5 text-[13px] text-[var(--color-neutral-11)] placeholder:text-[var(--color-neutral-8)] outline-none focus:border-[var(--color-accent-9)] transition-colors"
                    />
                </div>

                <div className="flex-1" />

                {/* View toggles */}
                <div className="flex items-center rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white p-0.5">
                    <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        title="List view"
                        className={`flex items-center justify-center w-7 h-7 rounded-[5px] transition-colors ${viewMode === 'list' ? 'bg-[var(--color-neutral-3)] text-[var(--color-black)]' : 'text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-2)]'}`}
                    >
                        <IconList size={15} stroke={1.75} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                        className={`flex items-center justify-center w-7 h-7 rounded-[5px] transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-neutral-3)] text-[var(--color-black)]' : 'text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-2)]'}`}
                    >
                        <IconLayoutGrid size={15} stroke={1.75} />
                    </button>
                </div>
            </div>

            {/* ── Quick filter chips ───────────────────────────────────── */}
            <div className="flex items-center gap-2 mb-5">
                {QUICK_FILTERS.map((qf, idx) => {
                    const count = quickCounts[idx]
                    const isActive = activeQuick === qf.label
                    const isAlert = !!qf.color && count > 0
                    return (
                        <button
                            key={qf.label}
                            type="button"
                            onClick={() => setActiveQuick(isActive ? null : qf.label)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium border transition-colors ${
                                isActive
                                    ? 'border-[var(--color-accent-9)] bg-[var(--color-blue-1)] text-[var(--color-accent-9)]'
                                    : isAlert
                                        ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF3C7]'
                                        : 'border-[var(--color-neutral-4)] bg-white text-[var(--color-neutral-10)] hover:bg-[var(--color-neutral-2)]'
                            }`}
                        >
                            {isAlert && !isActive && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: qf.color! }} />}
                            {qf.label}
                            <span className={`font-semibold ${isAlert && !isActive ? 'text-[#B45309]' : ''}`}>· {count}</span>
                        </button>
                    )
                })}
            </div>

            {/* ── Action banner ────────────────────────────────────────── */}
            {pendingCount > 0 && !activeQuick && !search && activeFilter === 'all' && (
                <div className="rounded-[var(--radius-xl)] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                        <span className="text-[13px] font-semibold text-[#92400E]">
                            {pendingCount} capital call{pendingCount > 1 ? 's' : ''} pending your approval
                        </span>
                        <span className="text-[13px] text-[#B45309]">— {fmt(totalPending)} total</span>
                    </div>
                    <button type="button" onClick={() => setActiveFilter('pending')} className="text-[12px] font-semibold text-[#B45309] hover:underline">
                        Review →
                    </button>
                </div>
            )}

            {/* ── Status tabs ──────────────────────────────────────────── */}
            <div className="flex items-center gap-1 border-b border-[var(--color-neutral-4)] mb-5">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setActiveFilter(f.key)}
                        className={`px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                            activeFilter === f.key
                                ? 'border-[var(--color-accent-9)] text-[var(--color-accent-9)]'
                                : 'border-transparent text-[var(--color-neutral-10)] hover:text-[var(--color-neutral-12)]'
                        }`}
                    >
                        {f.label}
                        {f.key !== 'all' && (
                            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-[var(--color-neutral-3)] px-1.5 text-[10px] font-semibold text-[var(--color-neutral-10)]">
                                {CAPITAL_CALL_DECISIONS.filter(d => d.status === f.key).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Content ──────────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <p className="text-[14px] text-[var(--color-neutral-9)] m-0">No decisions match your filters.</p>
                    <button type="button" onClick={() => { setSearch(''); setActiveFilter('all'); setActiveQuick(null) }} className="text-[12px] font-semibold text-[var(--color-accent-9)] hover:underline">
                        Clear filters
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── GRID VIEW ── */
                <div className="grid grid-cols-3 gap-4">
                    {filtered.map(decision => (
                        <DecisionCard
                            key={decision.id}
                            decision={decision}
                            isNew={decision.id === newlyCreatedId}
                            onClick={() => onOpenDetail(decision.id)}
                        />
                    ))}
                    {/* Upload CTA card */}
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
            ) : (
                /* ── LIST VIEW ── */
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] overflow-hidden">
                    <div className="grid grid-cols-[minmax(0,2.4fr)_1fr_1fr_120px_100px_48px] px-5 py-3 border-b border-[var(--color-neutral-3)] bg-[var(--color-neutral-2)]">
                        <button type="button" onClick={() => toggleSort('dueDate')} className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] hover:text-[var(--color-black)]">
                            Decision
                        </button>
                        <button type="button" onClick={() => toggleSort('amount')} className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] hover:text-[var(--color-black)]">
                            Amount <SortIcon k="amount" />
                        </button>
                        <button type="button" onClick={() => toggleSort('dueDate')} className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] hover:text-[var(--color-black)]">
                            Due date <SortIcon k="dueDate" />
                        </button>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)]">Call</span>
                        <button type="button" onClick={() => toggleSort('status')} className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-neutral-9)] hover:text-[var(--color-black)]">
                            Status <SortIcon k="status" />
                        </button>
                        <span />
                    </div>

                    {filtered.map(decision => {
                        const badge = STATUS_BADGE[decision.status]
                        const days = daysUntil(decision.dueDate)
                        const isUrgent = days <= 14 && decision.status === 'pending'
                        const isNew = decision.id === newlyCreatedId
                        return (
                            <button
                                key={decision.id}
                                type="button"
                                onClick={() => onOpenDetail(decision.id)}
                                className={`w-full grid grid-cols-[minmax(0,2.4fr)_1fr_1fr_120px_100px_48px] items-center px-5 py-4 border-b border-[var(--color-neutral-3)] last:border-b-0 transition-colors text-left group ${
                                    isNew ? 'bg-[#F0FDF4]' : 'hover:bg-[var(--color-neutral-2)]'
                                }`}
                            >
                                <div className="min-w-0 pr-4">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[13px] font-semibold text-[var(--color-black)] truncate">
                                            {decision.title}
                                        </span>
                                        <span className="text-[11px] font-mono text-[var(--color-neutral-9)] shrink-0">
                                            {decision.id}
                                        </span>
                                        {isNew && (
                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#DCFCE7] px-1.5 py-0.5 text-[10px] font-semibold text-[#065F46] shrink-0">
                                                <IconSparkles size={9} />
                                                Just created
                                            </span>
                                        )}
                                    </div>
                                    <p className="m-0 text-[12px] text-[var(--color-neutral-10)] truncate mt-0.5">
                                        {decision.fund} · {decision.entity}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-[14px] font-semibold tabular-nums text-[var(--color-black)]">
                                        {fmt(decision.amount)}
                                    </span>
                                    <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">
                                        {Math.round((decision.amount / decision.commitment) * 100)}% of commitment
                                    </p>
                                </div>

                                <div>
                                    <span className={`text-[13px] font-medium ${isUrgent ? 'text-[#B45309]' : 'text-[var(--color-black)]'}`}>
                                        {formatDue(decision.dueDate)}
                                    </span>
                                    <p className={`m-0 text-[11px] ${isUrgent ? 'text-[#D97706]' : 'text-[var(--color-neutral-9)]'}`}>
                                        {days > 0 ? `${days} days` : 'Today'}{isUrgent ? ' — urgent' : ''}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-[13px] text-[var(--color-neutral-11)]">
                                        #{decision.callNumber} of {decision.totalCalls}
                                    </span>
                                    <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">
                                        {decision.priorCallsDrawn} drawn
                                    </p>
                                </div>

                                <div>
                                    <span
                                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                        style={{ background: badge.bg, color: badge.text }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: badge.dot }} />
                                        {badge.label}
                                    </span>
                                </div>

                                <div className="flex items-center justify-center">
                                    <IconChevronRight size={16} className="text-[var(--color-neutral-7)] group-hover:text-[var(--color-neutral-11)] transition-colors" />
                                </div>
                            </button>
                        )
                    })
                }
            </div>
            )}

            <p className="text-[11px] text-[var(--color-neutral-9)] text-center m-0">
                {CAPITAL_CALL_DECISIONS.length} decisions · Fojo automatically matches PDFs to investment records
            </p>

            {/* Upload modal */}
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onCreated={handleCreated}
                />
            )}
        </div>
    )
}
