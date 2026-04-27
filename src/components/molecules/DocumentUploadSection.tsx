import { useState, useLayoutEffect, useEffect, useRef, useCallback } from 'react'
import { IconCloudUpload } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'
import { MockFileBrowser } from './MockFileBrowser'

const ONBOARDING_STEPS = [
    'Reading documents…',
    'Mapping entities & people…',
    'Analyzing relationships…',
    'Fojo is building your profile…',
]

const UPLOAD_STEPS = [
    'Reading new documents…',
    'Cross-referencing entities…',
    'Updating your estate profile…',
]

// Realistic trust agreement PDF first-page preview
const TrustDocThumb = () => (
    <svg viewBox="0 0 126 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect width="126" height="100" fill="#FFFFFF"/>
        {/* Page header — title block */}
        <rect x="28" y="8" width="70" height="2.5" rx="1" fill="#777777"/>
        <rect x="34" y="12.5" width="58" height="2" rx="1" fill="#777777"/>
        <rect x="42" y="16.5" width="42" height="2" rx="1" fill="#999999"/>
        {/* Thin divider */}
        <line x1="8" y1="21" x2="118" y2="21" stroke="#cccccc" strokeWidth="0.5"/>
        {/* Body paragraph 1 */}
        <rect x="8" y="25" width="110" height="1.8" rx="0.8" fill="#aaaaaa"/>
        <rect x="8" y="29" width="104" height="1.8" rx="0.8" fill="#aaaaaa"/>
        <rect x="8" y="33" width="108" height="1.8" rx="0.8" fill="#aaaaaa"/>
        <rect x="8" y="37" width="96" height="1.8" rx="0.8" fill="#aaaaaa"/>
        <rect x="8" y="41" width="110" height="1.8" rx="0.8" fill="#aaaaaa"/>
        <rect x="8" y="45" width="88" height="1.8" rx="0.8" fill="#aaaaaa"/>
        {/* Paragraph 2 */}
        <rect x="8" y="51" width="110" height="1.8" rx="0.8" fill="#aaaaaa"/>
        <rect x="8" y="55" width="100" height="1.8" rx="0.8" fill="#aaaaaa"/>
        <rect x="8" y="59" width="106" height="1.8" rx="0.8" fill="#aaaaaa"/>
        <rect x="8" y="63" width="72" height="1.8" rx="0.8" fill="#aaaaaa"/>
        {/* Signature block */}
        <rect x="8" y="72" width="44" height="0.8" rx="0.4" fill="#888888"/>
        <rect x="8" y="76" width="30" height="1.5" rx="0.6" fill="#cccccc"/>
        <rect x="74" y="72" width="44" height="0.8" rx="0.4" fill="#888888"/>
        <rect x="74" y="76" width="36" height="1.5" rx="0.6" fill="#cccccc"/>
        {/* Page number */}
        <rect x="56" y="93" width="14" height="1.5" rx="0.6" fill="#cccccc"/>
    </svg>
)

// Real Tesla Model S photo from Unsplash
const TeslaThumb = () => (
    <img
        src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=200&fit=crop&q=85"
        alt="Tesla Model S"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '70% center', display: 'block' }}
        draggable={false}
    />
)

// Realistic vehicle insurance certificate PDF preview
const InsuranceDocThumb = () => (
    <svg viewBox="0 0 126 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect width="126" height="100" fill="#FFFFFF"/>
        {/* Header band */}
        <rect x="0" y="0" width="126" height="18" fill="#1a3a6b"/>
        {/* Company name in header (white lines) */}
        <rect x="8" y="5" width="52" height="2.5" rx="1" fill="#FFFFFF" opacity="0.9"/>
        <rect x="8" y="10" width="36" height="1.8" rx="0.8" fill="#FFFFFF" opacity="0.55"/>
        {/* Certificate badge area */}
        <rect x="94" y="3" width="24" height="12" rx="2" fill="#FFFFFF" opacity="0.15"/>
        <rect x="99" y="6" width="14" height="1.8" rx="0.8" fill="#FFFFFF" opacity="0.7"/>
        <rect x="99" y="9.5" width="10" height="1.5" rx="0.6" fill="#FFFFFF" opacity="0.5"/>
        {/* Section title */}
        <rect x="8" y="22" width="80" height="2.5" rx="1" fill="#777777"/>
        <line x1="8" y1="27" x2="118" y2="27" stroke="#dddddd" strokeWidth="0.5"/>
        {/* Two-column table-like layout */}
        {/* Left column labels */}
        <rect x="8" y="31" width="30" height="1.5" rx="0.6" fill="#bbbbbb"/>
        <rect x="8" y="36" width="24" height="1.5" rx="0.6" fill="#bbbbbb"/>
        <rect x="8" y="41" width="28" height="1.5" rx="0.6" fill="#bbbbbb"/>
        <rect x="8" y="46" width="22" height="1.5" rx="0.6" fill="#bbbbbb"/>
        {/* Left column values */}
        <rect x="42" y="31" width="40" height="1.5" rx="0.6" fill="#aaaaaa"/>
        <rect x="42" y="36" width="52" height="1.5" rx="0.6" fill="#aaaaaa"/>
        <rect x="42" y="41" width="36" height="1.5" rx="0.6" fill="#aaaaaa"/>
        <rect x="42" y="46" width="44" height="1.5" rx="0.6" fill="#aaaaaa"/>
        {/* Right column */}
        <rect x="70" y="31" width="22" height="1.5" rx="0.6" fill="#bbbbbb"/>
        <rect x="70" y="36" width="18" height="1.5" rx="0.6" fill="#bbbbbb"/>
        <rect x="70" y="41" width="24" height="1.5" rx="0.6" fill="#bbbbbb"/>
        <rect x="96" y="31" width="22" height="1.5" rx="0.6" fill="#aaaaaa"/>
        <rect x="96" y="36" width="26" height="1.5" rx="0.6" fill="#aaaaaa"/>
        <rect x="96" y="41" width="18" height="1.5" rx="0.6" fill="#aaaaaa"/>
        {/* Coverage section */}
        <line x1="8" y1="52" x2="118" y2="52" stroke="#dddddd" strokeWidth="0.5"/>
        <rect x="8" y="55" width="40" height="2" rx="0.8" fill="#777777"/>
        <rect x="8" y="60" width="110" height="1.5" rx="0.6" fill="#aaaaaa"/>
        <rect x="8" y="64" width="102" height="1.5" rx="0.6" fill="#aaaaaa"/>
        <rect x="8" y="68" width="94" height="1.5" rx="0.6" fill="#aaaaaa"/>
        <rect x="8" y="72" width="106" height="1.5" rx="0.6" fill="#aaaaaa"/>
        {/* Signature */}
        <rect x="8" y="82" width="44" height="0.8" rx="0.4" fill="#888888"/>
        <rect x="8" y="86" width="28" height="1.5" rx="0.6" fill="#cccccc"/>
        {/* Stamp circle */}
        <circle cx="106" cy="86" r="10" fill="none" stroke="#1a3a6b" strokeWidth="0.8" opacity="0.4" strokeDasharray="2 2"/>
        <circle cx="106" cy="86" r="6" fill="none" stroke="#1a3a6b" strokeWidth="0.5" opacity="0.3"/>
        <rect x="102" y="85" width="8" height="1.5" rx="0.6" fill="#1a3a6b" opacity="0.35"/>
        {/* Page number */}
        <rect x="56" y="95" width="14" height="1.5" rx="0.6" fill="#cccccc"/>
    </svg>
)

interface DocumentUploadSectionProps {
    initialProcessing: boolean
    onUploadComplete?: (scenarioId: string) => void
}

export function DocumentUploadSection({ initialProcessing, onUploadComplete }: DocumentUploadSectionProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [isProcessing, setIsProcessing] = useState(initialProcessing)
    const [isBrowserOpen, setIsBrowserOpen] = useState(false)
    const pendingScenarioIdRef = useRef<string | null>(null)
    const [stepIndex, setStepIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [steps, setSteps] = useState(ONBOARDING_STEPS)
    const rafRef = useRef<number>(0)
    const startRef = useRef(0)
    const barRef = useRef<HTMLDivElement>(null)
    const dropRef = useRef<HTMLDivElement>(null)
    const borderRectRef = useRef<SVGRectElement>(null)

    useEffect(() => {
        const el = dropRef.current
        const rect = borderRectRef.current
        if (!el || !rect) return
        const ro = new ResizeObserver(() => {
            rect.setAttribute('width', String(el.clientWidth - 1.5))
            rect.setAttribute('height', String(el.clientHeight - 1.5))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const startProcessing = useCallback((stepList: string[], durationMs: number) => {
        setSteps(stepList)
        setStepIndex(0)
        setProgress(0)
        setIsProcessing(true)
        startRef.current = Date.now()

        const stepDuration = durationMs / stepList.length

        const tick = () => {
            const elapsed = Date.now() - startRef.current
            const pct = Math.min(elapsed / durationMs, 1)
            setProgress(pct)
            if (barRef.current) barRef.current.style.width = `${pct * 100}%`
            setStepIndex(Math.min(Math.floor(elapsed / stepDuration), stepList.length - 1))

            if (pct < 1) {
                rafRef.current = requestAnimationFrame(tick)
            } else {
                setIsProcessing(false)
            }
        }
        rafRef.current = requestAnimationFrame(tick)
    }, [])

    useLayoutEffect(() => {
        if (initialProcessing) {
            startProcessing(ONBOARDING_STEPS, 12000)
        } else {
            cancelAnimationFrame(rafRef.current)
            setIsProcessing(false)
        }
        return () => cancelAnimationFrame(rafRef.current)
    }, [initialProcessing, startProcessing])

    const triggerUpload = useCallback((scenarioId: string) => {
        if (isProcessing) return
        pendingScenarioIdRef.current = scenarioId
        startProcessing(UPLOAD_STEPS, 5000)
        setTimeout(() => {
            onUploadComplete?.(pendingScenarioIdRef.current ?? scenarioId)
            pendingScenarioIdRef.current = null
        }, 5200)
    }, [isProcessing, startProcessing, onUploadComplete])

    const openBrowser = useCallback(() => {
        if (isProcessing) return
        setIsBrowserOpen(true)
    }, [isProcessing])

    const handleFileSelect = useCallback((scenarioId: string, _file: { id: string; name: string }) => {
        setIsBrowserOpen(false)
        triggerUpload(scenarioId)
    }, [triggerUpload])

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        if (!isProcessing) setIsBrowserOpen(true)
    }

    return (
        <>
        {isBrowserOpen && (
            <MockFileBrowser
                onFileSelect={handleFileSelect}
                onClose={() => setIsBrowserOpen(false)}
            />
        )}
        <div
            ref={dropRef}
            className={cn(
                'doc-drop relative rounded-[6px] cursor-pointer overflow-hidden transition-all duration-[0.25s] ease-[cubic-bezier(0.16,1,0.3,1)]',
                isProcessing ? 'doc-drop--processing' : 'border-none px-[29.5px] py-[45.5px]',
                isDragOver && 'doc-drop--dragover'
            )}
            onClick={openBrowser}
            onDragOver={(e) => { e.preventDefault(); if (!isProcessing) setIsDragOver(true) }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false) }}
            onDrop={handleDrop}
        >
            {/* SVG dashed border — exact pixel control via stroke-dasharray, consistent across browsers */}
            <svg className="doc-drop__border absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                <rect ref={borderRectRef} x="0.75" y="0.75" rx="5.25" ry="5.25" />
            </svg>

            {/* Drop zone content */}
            <div className="doc-drop__zone flex items-center gap-3.5 justify-between transition-[opacity,transform] duration-150 ease-linear">
                <div className="flex items-center gap-3.5 shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] text-[var(--color-neutral-11)] shrink-0">
                        <IconCloudUpload size={20} stroke={1.5} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-[var(--color-neutral-12)] tracking-[-0.01em]">Drop files here, or click to browse</span>
                        <span className="text-[13px] text-[var(--color-neutral-11)]">PDF, Word, or CSV files · up to 50MB each</span>
                    </div>
                </div>

                {/* Decorative illustration — stacked mini file preview cards */}
                <div className="doc-drop__illustration relative w-[300px] h-[122px] shrink-0 pointer-events-none">
                    <div className="doc-drop__mini-card doc-drop__mini-card--1">
                        <div className="doc-drop__mini-thumb"><TrustDocThumb /></div>
                        <div className="doc-drop__mini-body px-2.5 pt-[7px] pb-2 flex flex-col gap-0.5">
                            <span className="doc-drop__mini-name text-[10px] font-[var(--font-weight-semibold)] text-[var(--color-neutral-12)] tracking-[-0.01em] whitespace-nowrap overflow-hidden text-ellipsis">Trust_Agreement.pdf</span>
                            <span className="text-[10px] text-[var(--color-neutral-9)] leading-none">PDF · 1.8 MB</span>
                        </div>
                    </div>
                    <div className="doc-drop__mini-card doc-drop__mini-card--2">
                        <div className="doc-drop__mini-thumb"><TeslaThumb /></div>
                        <div className="doc-drop__mini-body px-2.5 pt-[7px] pb-2 flex flex-col gap-0.5">
                            <span className="doc-drop__mini-name text-[10px] font-[var(--font-weight-semibold)] text-[var(--color-neutral-12)] tracking-[-0.01em] whitespace-nowrap overflow-hidden text-ellipsis">Tesla_Model_S.jpg</span>
                            <span className="text-[10px] text-[var(--color-neutral-9)] leading-none">JPG · 3.2 MB</span>
                        </div>
                    </div>
                    <div className="doc-drop__mini-card doc-drop__mini-card--3">
                        <div className="doc-drop__mini-thumb"><InsuranceDocThumb /></div>
                        <div className="doc-drop__mini-body px-2.5 pt-[7px] pb-2 flex flex-col gap-0.5">
                            <span className="doc-drop__mini-name text-[10px] font-[var(--font-weight-semibold)] text-[var(--color-neutral-12)] tracking-[-0.01em] whitespace-nowrap overflow-hidden text-ellipsis">Vehicle_Insurance.pdf</span>
                            <span className="text-[10px] text-[var(--color-neutral-9)] leading-none">PDF · 892 KB</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Processing strip content */}
            <div className="doc-drop__strip flex items-center gap-2.5">
                <img className="doc-drop__avatar w-6 h-6 rounded-full object-cover shrink-0" src={fojoMascotSmall} alt="Fojo" />
                <div className="doc-drop__step text-[13px] font-[var(--font-weight-semibold)] text-[var(--color-purple-text)] shrink-0" key={stepIndex}>
                    {steps[stepIndex]}
                </div>
                <div className="flex items-center gap-2.5 ml-auto">
                    <div className="doc-drop__bar w-[120px] h-[5px] bg-[rgba(0,91,226,0.1)] rounded-[4px] overflow-hidden shrink-0">
                        <div className="doc-drop__bar-fill w-0 h-full rounded bg-[var(--color-purple)] relative overflow-hidden" ref={barRef} />
                    </div>
                    <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--color-purple-text)] min-w-8 text-right tabular-nums">{Math.round(progress * 100)}%</span>
                </div>
            </div>
        </div>
        </>
    )
}
