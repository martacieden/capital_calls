import { useState, useRef, useCallback } from 'react'
import { IconChevronRight, IconCloudUpload, IconFileText, IconList, IconShieldLock, IconX, IconBriefcase, IconCheck, IconBolt } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface OnboardingPageProps {
    onComplete: () => void
}

const DOCS = [
    {
        icon: IconFileText,
        label: 'Capital call notices',
        description: "Funding deadlines, call amounts, wire details, and matching fund records",
    },
    {
        icon: IconList,
        label: 'Fund documents',
        description: "LP agreements, subscriptions, amendments, and commitment schedules",
    },
    {
        icon: IconShieldLock,
        label: 'Wire instructions',
        description: "Beneficiary, bank, routing, SWIFT, and reference fields to verify before release",
    },
    {
        icon: IconBriefcase,
        label: 'Pipeline materials',
        description: "Deal memos, diligence files, IC notes, and approved investment records",
    },
]

const DEMO_FILES = [
    { name: 'greentech-capital-call-notice.pdf', id: 'demo-1' },
    { name: 'whitmore-capital-lpa.pdf',          id: 'demo-2' },
    { name: 'fund-subscription-schedule.pdf',    id: 'demo-3' },
    { name: 'wire-instructions-confirmation.pdf', id: 'demo-4' },
    { name: 'investment-committee-memo.pdf',     id: 'demo-5' },
]

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [files, setFiles] = useState<{ name: string; id: string }[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const addRealFiles = (incoming: FileList | null) => {
        if (!incoming || incoming.length === 0) return
        const next = Array.from(incoming).map(f => ({
            name: f.name,
            id: Math.random().toString(36).slice(2),
        }))
        setFiles(prev => {
            const existing = new Set(prev.map(f => f.name))
            return [...prev, ...next.filter(f => !existing.has(f.name))]
        })
    }

    // Prototype: clicking the zone adds demo files on first click,
    // opens real picker on subsequent clicks (to allow adding more)
    const handleZoneClick = () => {
        if (files.length === 0) {
            setFiles(DEMO_FILES)
        } else {
            fileInputRef.current?.click()
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        if (e.dataTransfer.files.length > 0) {
            addRealFiles(e.dataTransfer.files)
        } else {
            // Drag from non-file source (e.g. inside the browser) — still show demo files
            setFiles(DEMO_FILES)
        }
    }

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    // Parallax tilt on the right panel
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const rightRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const panel = rightRef.current
        if (!panel) return
        const rect = panel.getBoundingClientRect()
        // Normalized -1 to 1 from center
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2

        cardRefs.current.forEach((card, i) => {
            if (!card) return
            // Each card gets slightly different intensity
            const intensity = 3 + i * 0.8
            const rotY = nx * intensity
            const rotX = -ny * intensity
            const tx = nx * (4 + i * 1.5)
            const ty = ny * (3 + i)
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate(${tx}px, ${ty}px)`
        })
    }, [])

    const handleMouseLeave = useCallback(() => {
        cardRefs.current.forEach((card) => {
            if (!card) return
            card.style.transform = ''
        })
    }, [])

    return (
        <div className="onboarding-page flex h-screen w-full relative font-sans bg-white">
            <div className="onboarding-left flex-[0_0_56%] flex items-center justify-center px-[120px] py-[100px] overflow-y-auto scrollbar-none">
                <div className="onboarding-content max-w-[480px] w-full flex flex-col gap-10">
                    <div className="onboarding-headline">
                        <h1>Understand every capital call</h1>
                        <p className="text-[16px] text-[var(--color-neutral-11)] leading-[1.6] tracking-[-0.006em]">
                            Drop in capital call notices, fund agreements, and investment files.
                            Fojo will extract the key terms, match each notice to the right fund,
                            verify payment details, and build your investment workflow automatically.
                        </p>
                    </div>

                    <div className="flex flex-col gap-5">
                        {DOCS.map((doc) => (
                            <div key={doc.label} className="flex gap-3.5 items-start">
                                <div className="w-9 h-9 rounded-[6px] bg-[var(--color-blue-1)] flex items-center justify-center shrink-0">
                                    <doc.icon size={18} stroke={1.5} color="var(--color-accent-9)" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-[var(--color-black)] tracking-[-0.01em]">{doc.label}</span>
                                    <span className="text-[13px] text-[var(--color-neutral-11)] leading-[1.5]">{doc.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={e => {
                            addRealFiles(e.target.files)
                            e.target.value = ''
                        }}
                    />

                    <div
                        className={cn(
                            'onboarding-upload-zone rounded-lg flex flex-col items-center gap-2',
                            isDragOver && 'onboarding-upload-zone--active'
                        )}
                        onClick={handleZoneClick}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false) }}
                        onDrop={handleDrop}
                    >
                        <div className="w-12 h-12 flex items-center justify-center rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] mb-1">
                            <IconCloudUpload size={22} stroke={1.5} color="var(--color-neutral-11)" />
                        </div>
                        <div className="text-[15px] font-semibold text-[var(--color-neutral-12)] tracking-[-0.01em]">Drop capital call files here, or click to browse</div>
                        <div className="text-[13px] text-[var(--color-neutral-11)] tracking-[-0.005em]">PDF, Word, or CSV files · notices, LPAs, memos, wire docs</div>
                    </div>

                    {files.length > 0 && (
                        <div className="onboarding-file-chips flex overflow-x-auto gap-1.5 scrollbar-none">
                            {files.map((file) => (
                                <div key={file.id} className="onboarding-file-chip inline-flex items-center gap-1.5 py-1.5 pl-2 pr-2.5 rounded-[4px] bg-white border border-[var(--color-neutral-4)] text-xs font-medium text-[var(--color-neutral-11)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-150 whitespace-nowrap shrink-0">
                                    <div className="w-5 h-5 rounded-[4px] bg-[var(--color-blue-1)] flex items-center justify-center shrink-0">
                                        <IconFileText size={12} stroke={1.5} color="var(--color-accent-9)" />
                                    </div>
                                    <span>{file.name}</span>
                                    <button
                                        className="onboarding-file-chip__remove flex items-center justify-center w-4 h-4 rounded-[4px] bg-transparent text-[var(--color-neutral-11)] cursor-pointer shrink-0 transition-[background,color] duration-150 ml-0.5"
                                        onClick={(e) => { e.stopPropagation(); removeFile(file.id) }}
                                        aria-label="Remove file"
                                    >
                                        <IconX size={10} stroke={2} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        className="onboarding-cta inline-flex items-center justify-center gap-1.5 px-8 py-4 rounded-[10px] bg-[var(--color-accent-9)] text-white text-[16px] font-semibold cursor-pointer transition-all duration-[0.25s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] self-start tracking-[-0.01em] shadow-none disabled:bg-[var(--color-neutral-5)] disabled:text-[var(--color-neutral-11)] disabled:cursor-not-allowed"
                        onClick={onComplete}
                        disabled={files.length === 0}
                    >
                        Get started <IconChevronRight size={16} stroke={2.5} />
                    </button>
                </div>
            </div>

            <div className="onboarding-right flex-[0_0_44%] flex items-center justify-center px-12 py-14 relative overflow-hidden bg-[#F9F9FB]" ref={rightRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <div className="w-full max-w-[340px] relative z-[1] overflow-visible">
                    <div className="text-xs font-semibold text-[var(--color-neutral-11)] uppercase tracking-[0.1em] mb-6" style={{ textAlign: 'center' }}>
                        What Fojo will build for you
                    </div>
                    <div className="onboarding-previews flex flex-col gap-[18px] relative">

                        {/* Card 1 — Extracted notice fields */}
                        <div className="onboarding-preview-card onboarding-preview-card--blue" ref={el => { cardRefs.current[0] = el }}>
                            <div className="onboarding-preview-card__inner">
                                <div className="onboarding-preview-card__header flex items-center gap-2.5">
                                    <div className="onboarding-preview-card__icon onboarding-preview-card__icon--blue w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-blue-bg)] text-[var(--color-card-blue)]">
                                        <IconFileText size={14} stroke={2} />
                                    </div>
                                    <span className="onboarding-preview-card__label font-sans text-sm font-[var(--font-weight-bold)] text-[var(--color-neutral-12)] tracking-[-0.01em]">Extracted Notice</span>
                                    <span className="onboarding-preview-card__meta text-xs text-[var(--color-neutral-11)] ml-auto">94% confidence</span>
                                </div>
                                <div className="flex flex-col gap-2 text-xs">
                                    {[
                                        ['Fund', 'Greentech Opp. Fund III'],
                                        ['Amount', '$500,000'],
                                        ['Due date', 'May 30, 2026'],
                                        ['Call #', '7 of 12'],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-center justify-between gap-3 rounded-[6px] border border-[var(--color-neutral-3)] bg-white px-2.5 py-2">
                                            <span className="font-semibold uppercase tracking-[0.06em] text-[10px] text-[var(--color-neutral-9)]">{label}</span>
                                            <span className="font-semibold text-[var(--color-neutral-12)] text-right">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Card 2 — Verification checklist */}
                        <div className="onboarding-preview-card onboarding-preview-card--purple" ref={el => { cardRefs.current[1] = el }}>
                            <div className="onboarding-preview-card__inner">
                                <div className="onboarding-preview-card__header flex items-center gap-2.5">
                                    <div className="onboarding-preview-card__icon onboarding-preview-card__icon--purple w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-green-bg)] text-[var(--color-card-green)]">
                                        <IconCheck size={14} stroke={2} />
                                    </div>
                                    <span className="onboarding-preview-card__label font-sans text-sm font-[var(--font-weight-bold)] text-[var(--color-neutral-12)] tracking-[-0.01em]">Verification</span>
                                    <span className="onboarding-preview-card__meta text-xs text-[var(--color-neutral-11)] ml-auto">5 of 5 matched</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {[
                                        'Fund name matches subscription',
                                        'Amount matches commitment schedule',
                                        'Wire beneficiary unchanged',
                                        'Routing and account verified',
                                    ].map(item => (
                                        <div key={item} className="flex items-center gap-2 text-xs text-[var(--color-neutral-11)]">
                                            <span className="w-4 h-4 rounded-[4px] bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                                                <IconCheck size={11} stroke={2.5} />
                                            </span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Card 3 — Release queue */}
                        <div className="onboarding-preview-card onboarding-preview-card--teal" ref={el => { cardRefs.current[2] = el }}>
                            <div className="onboarding-preview-card__inner">
                                <div className="onboarding-preview-card__header flex items-center gap-2.5">
                                    <div className="onboarding-preview-card__icon onboarding-preview-card__icon--teal w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-pink-bg)] text-[var(--color-card-pink)]">
                                        <IconBolt size={14} stroke={2} />
                                    </div>
                                    <span className="onboarding-preview-card__label font-sans text-sm font-[var(--font-weight-bold)] text-[var(--color-neutral-12)] tracking-[-0.01em]">Release Queue</span>
                                    <span className="onboarding-preview-card__meta text-xs text-[var(--color-neutral-11)] ml-auto">2 ready</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { fund: 'Whitmore Capital I', amount: '$2.0M', status: 'Ready' },
                                        { fund: 'Greentech Fund III', amount: '$500K', status: 'Review' },
                                        { fund: 'Real Assets III', amount: '$1.5M', status: 'Pending' },
                                    ].map(row => (
                                        <div key={row.fund} className="flex items-center justify-between gap-2 rounded-[6px] bg-white border border-[var(--color-neutral-3)] px-2.5 py-2">
                                            <div className="min-w-0">
                                                <p className="m-0 text-xs font-semibold text-[var(--color-neutral-12)] truncate">{row.fund}</p>
                                                <p className="m-0 text-[11px] text-[var(--color-neutral-9)]">{row.amount}</p>
                                            </div>
                                            <span className="rounded-[4px] bg-[var(--color-neutral-3)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-neutral-10)]">
                                                {row.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
