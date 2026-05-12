import { useState, useRef, useCallback } from 'react'
import { IconChevronRight, IconCloudUpload, IconFileText, IconList, IconShieldLock, IconX, IconSitemap, IconCalendarEvent, IconChartDonut, IconBriefcase } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface OnboardingPageProps {
    onComplete: () => void
}

const DOCS = [
    {
        icon: IconFileText,
        label: 'Trust documents',
        description: "People, trusts, entities, and how they connect to each other",
    },
    {
        icon: IconList,
        label: 'Inventory lists',
        description: "Vehicles, jewelry, art, collectibles, and other personal property",
    },
    {
        icon: IconShieldLock,
        label: 'Insurance policies',
        description: "Coverage gaps and renewals we can catch early",
    },
    {
        icon: IconBriefcase,
        label: 'Investment documents',
        description: "Capital call notices, LP agreements, and fund subscriptions",
    },
]

const DEMO_FILES = [
    { name: 'family-trust-agreement.pdf',     id: 'demo-1' },
    { name: 'dynasty-trust-i-agreement.pdf',  id: 'demo-4' },
    { name: 'dynasty-trust-ii-agreement.pdf', id: 'demo-5' },
    { name: 'inventory-list-2026.pdf',        id: 'demo-2' },
    { name: 'insurance-policies.pdf',         id: 'demo-3' },
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
                        <h1>Understand your estate</h1>
                        <p className="text-[16px] text-[var(--color-neutral-11)] leading-[1.6] tracking-[-0.006em]">
                            Instead of setting up every person, entity, and asset by hand,
                            drop in your trust and estate documents. Fojo will read them
                            and map out your entire estate automatically.
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
                        <div className="text-[15px] font-semibold text-[var(--color-neutral-12)] tracking-[-0.01em]">Drop files here, or click to browse</div>
                        <div className="text-[13px] text-[var(--color-neutral-11)] tracking-[-0.005em]">PDF, Word, or CSV files · up to 50MB each</div>
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

                        {/* Card 1 — Entity Graph */}
                        <div className="onboarding-preview-card onboarding-preview-card--blue" ref={el => { cardRefs.current[0] = el }}>
                            <div className="onboarding-preview-card__inner">
                                <div className="onboarding-preview-card__header flex items-center gap-2.5">
                                    <div className="onboarding-preview-card__icon onboarding-preview-card__icon--blue w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-blue-bg)] text-[var(--color-card-blue)]">
                                        <IconSitemap size={14} stroke={2} />
                                    </div>
                                    <span className="onboarding-preview-card__label font-sans text-sm font-[var(--font-weight-bold)] text-[var(--color-neutral-12)] tracking-[-0.01em]">Entities & Assets</span>
                                    <span className="onboarding-preview-card__meta text-xs text-[var(--color-neutral-11)] ml-auto">76 records</span>
                                </div>
                                <svg
                                    viewBox="0 0 300 78"
                                    className="onboarding-mini-graph-svg"
                                    aria-hidden="true"
                                >
                                    {/* Root node */}
                                    <rect className="onb-svg-node onb-svg-node--1" x="110" y="0" width="80" height="24" rx="8" fill="var(--color-card-blue)" />
                                    <text className="onb-svg-node onb-svg-node--1" x="150" y="15.5" textAnchor="middle" fill="white" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="600">Grantor</text>

                                    {/* Branches */}
                                    <path className="onb-svg-line" d="M150 24 L150 36 M51 36 L249 36 M51 36 L51 46 M150 36 L150 46 M249 36 L249 46" fill="none" stroke="var(--color-card-blue)" strokeWidth="1.2" />

                                    {/* Child nodes — all same style: light blue bg, blue text */}
                                    <rect className="onb-svg-node onb-svg-node--2" x="9" y="46" width="84" height="22" rx="7" fill="var(--color-card-blue-bg)" stroke="var(--color-card-blue)" strokeWidth="1" />
                                    <text className="onb-svg-node onb-svg-node--2" x="51" y="61" textAnchor="middle" fill="var(--color-blue-dark)" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="500">Family Trust</text>

                                    <rect className="onb-svg-node onb-svg-node--3" x="105" y="46" width="90" height="22" rx="7" fill="var(--color-card-blue-bg)" stroke="var(--color-card-blue)" strokeWidth="1" />
                                    <text className="onb-svg-node onb-svg-node--3" x="150" y="61" textAnchor="middle" fill="var(--color-blue-dark)" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="500">Holding Entity</text>

                                    <rect className="onb-svg-node onb-svg-node--4" x="207" y="46" width="84" height="22" rx="7" fill="var(--color-card-blue-bg)" stroke="var(--color-card-blue)" strokeWidth="1" />
                                    <text className="onb-svg-node onb-svg-node--4" x="249" y="61" textAnchor="middle" fill="var(--color-blue-dark)" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="500">Beneficiary</text>

                                    {/* Traveling dots along branches */}
                                    <circle className="onb-svg-dot" r="2.5" fill="var(--color-card-blue)" />
                                    <circle className="onb-svg-dot onb-svg-dot--2" r="2.5" fill="var(--color-card-blue)" />
                                </svg>
                                <div className="text-xs text-[var(--color-neutral-11)] tracking-[-0.005em]">People, trusts, entities — all mapped automatically</div>
                            </div>
                        </div>

                        {/* Card 2 — Distribution Timeline */}
                        <div className="onboarding-preview-card onboarding-preview-card--purple" ref={el => { cardRefs.current[1] = el }}>
                            <div className="onboarding-preview-card__inner">
                                <div className="onboarding-preview-card__header flex items-center gap-2.5">
                                    <div className="onboarding-preview-card__icon onboarding-preview-card__icon--purple w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-green-bg)] text-[var(--color-card-green)]">
                                        <IconCalendarEvent size={14} stroke={2} />
                                    </div>
                                    <span className="onboarding-preview-card__label font-sans text-sm font-[var(--font-weight-bold)] text-[var(--color-neutral-12)] tracking-[-0.01em]">Distribution Timeline</span>
                                    <span className="onboarding-preview-card__meta text-xs text-[var(--color-neutral-11)] ml-auto">24 events</span>
                                </div>
                                <div className="onboarding-mini-timeline flex flex-col gap-0">
                                    {[
                                        { year: 'Year 1', name: 'Trust income begins', amount: '$X/yr' },
                                        { year: 'Year 3', name: 'Beneficiary distribution', amount: '$XM' },
                                        { year: 'Year 8', name: 'Age-based milestone', amount: '$XM' },
                                    ].map((row, i) => (
                                        <div key={i} className="onboarding-mini-timeline-row" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                                            <div className="onboarding-mini-timeline__dot" />
                                            <span className="onboarding-mini-timeline__year font-[var(--font-weight-bold)] text-[var(--color-neutral-11)] min-w-[38px] text-xs">{row.year}</span>
                                            <span className="onboarding-mini-timeline__name flex-1 min-w-0 text-[var(--color-neutral-11)]">{row.name}</span>
                                            <span className="onboarding-mini-timeline__amount font-[var(--font-weight-bold)] text-[var(--color-card-green)] min-w-[42px] text-right text-xs">{row.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Card 3 — Valuations */}
                        <div className="onboarding-preview-card onboarding-preview-card--teal" ref={el => { cardRefs.current[2] = el }}>
                            <div className="onboarding-preview-card__inner">
                                <div className="onboarding-preview-card__header flex items-center gap-2.5">
                                    <div className="onboarding-preview-card__icon onboarding-preview-card__icon--teal w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 bg-[var(--color-card-pink-bg)] text-[var(--color-card-pink)]">
                                        <IconChartDonut size={14} stroke={2} />
                                    </div>
                                    <span className="onboarding-preview-card__label font-sans text-sm font-[var(--font-weight-bold)] text-[var(--color-neutral-12)] tracking-[-0.01em]">Asset Allocation</span>
                                    <span className="onboarding-preview-card__meta text-xs text-[var(--color-neutral-11)] ml-auto">$985M – $1.2B</span>
                                </div>
                                <div className="onboarding-mini-valuations flex flex-col gap-2.5">
                                    {[
                                        { label: 'Liquid', pct: 85, value: '$340M', delay: 0.6 },
                                        { label: 'Real Estate', pct: 62, value: '$217M', delay: 0.7 },
                                        { label: 'Private Equity', pct: 62, value: '$217M', delay: 0.8 },
                                        { label: 'Discretionary', pct: 55, value: '$211M', delay: 0.9 },
                                    ].map((row, i) => (
                                        <div key={i} className="onboarding-mini-bar-row flex items-center gap-2.5 text-xs leading-normal">
                                            <span className="onboarding-mini-bar-row__label min-w-[80px] text-[var(--color-neutral-11)] text-xs">{row.label}</span>
                                            <div className="onboarding-mini-bar-row__track flex-1 h-1.5 bg-[rgba(219,39,119,0.18)] rounded-[4px] overflow-hidden">
                                                <div
                                                    className="onboarding-mini-bar"
                                                    style={{ '--bar-width': `${row.pct}%`, animationDelay: `${row.delay}s` } as React.CSSProperties}
                                                />
                                            </div>
                                            <span className="onboarding-mini-bar-row__value min-w-[38px] text-right font-[var(--font-weight-bold)] text-[var(--color-neutral-11)] text-xs">{row.value}</span>
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
