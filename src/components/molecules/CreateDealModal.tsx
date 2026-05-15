import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconCheck, IconPaperclip, IconX } from '@tabler/icons-react'

const ASSET_CLASSES = [
    'Venture Capital',
    'Private Equity',
    'Private Credit',
    'Infrastructure',
    'Real Assets / ESG',
    'Healthcare',
    'Technology',
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF']

const INPUT_CLASS =
    'h-9 w-full px-3 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] text-sm text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150 font-[inherit]'

const SELECT_CLASS = INPUT_CLASS + ' cursor-pointer'

const LABEL_CLASS = 'text-xs font-medium text-[var(--color-neutral-10)]'

interface Field {
    label: string
    required?: boolean
    children: React.ReactNode
}

function FormField({ label, required, children }: Field) {
    return (
        <div className="flex flex-col gap-1">
            <label className={LABEL_CLASS}>
                {label}
                {required && <span className="ml-0.5 text-[var(--color-red-9)]">*</span>}
            </label>
            {children}
        </div>
    )
}

export interface NewDealPayload {
    investmentName: string
    company: string
    assetClass: string
    geography: string
    sourceReferral: string
    targetIrr: string
    commitmentMin: string
    commitmentMax: string
    currency: string
    thesisFitNotes: string
}

interface CreateDealModalProps {
    onClose: () => void
    onCreateDeal?: (payload: NewDealPayload) => void
}

export function CreateDealModal({ onClose, onCreateDeal }: CreateDealModalProps) {
    const [investmentName, setInvestmentName] = useState('')
    const [company, setCompany] = useState('')
    const [assetClass, setAssetClass] = useState('')
    const [geography, setGeography] = useState('')
    const [sourceReferral, setSourceReferral] = useState('')
    const [targetIrr, setTargetIrr] = useState('')
    const [commitmentMin, setCommitmentMin] = useState('')
    const [commitmentMax, setCommitmentMax] = useState('')
    const [currency, setCurrency] = useState('USD')
    const [thesisFitNotes, setThesisFitNotes] = useState('')

    const firstInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setTimeout(() => firstInputRef.current?.focus(), 50)
    }, [])

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const canSubmit = investmentName.trim() !== '' && company.trim() !== '' && assetClass !== ''

    function handleSubmit() {
        if (!canSubmit) return
        onCreateDeal?.({
            investmentName: investmentName.trim(),
            company: company.trim(),
            assetClass,
            geography: geography.trim(),
            sourceReferral: sourceReferral.trim(),
            targetIrr: targetIrr.trim(),
            commitmentMin: commitmentMin.trim(),
            commitmentMax: commitmentMax.trim(),
            currency,
            thesisFitNotes: thesisFitNotes.trim(),
        })
        onClose()
    }

    const modal = (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

            <div className="relative z-10 w-full max-w-[560px] bg-white rounded-[var(--radius-2xl)] shadow-[0_32px_100px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[var(--color-neutral-3)]">
                    <div>
                        <div className="text-[15px] font-semibold text-[var(--color-black)] leading-5">
                            New Investment Opportunity
                        </div>
                        <div className="text-xs text-[var(--color-neutral-9)] mt-1 leading-relaxed">
                            Log a new opportunity manually or attach a PDF for AI-assisted field extraction.
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-3 shrink-0 p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] transition-colors"
                    >
                        <IconX size={16} stroke={2} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto max-h-[70vh] px-6 py-5 flex flex-col gap-4">

                    {/* PDF attach button */}
                    <button
                        type="button"
                        className="flex items-center gap-2.5 w-full rounded-[var(--radius-lg)] border border-dashed border-[var(--color-accent-6)] bg-[var(--color-accent-1)] px-4 py-3 text-sm font-medium text-[var(--color-accent-10)] hover:bg-[var(--color-accent-2)] transition-colors text-left"
                    >
                        <IconPaperclip size={16} stroke={2} className="shrink-0" />
                        Attach PDF for AI field extraction (teaser / pitch deck)
                    </button>

                    {/* Row 1: Investment Name + Fund/Company */}
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Investment Name" required>
                            <input
                                ref={firstInputRef}
                                type="text"
                                className={INPUT_CLASS}
                                placeholder="e.g. Harborview Capital Fund IV"
                                value={investmentName}
                                onChange={e => setInvestmentName(e.target.value)}
                            />
                        </FormField>
                        <FormField label="Fund / Company" required>
                            <input
                                type="text"
                                className={INPUT_CLASS}
                                placeholder="e.g. Harborview Capital"
                                value={company}
                                onChange={e => setCompany(e.target.value)}
                            />
                        </FormField>
                    </div>

                    {/* Row 2: Asset Class + Geography */}
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Asset Class" required>
                            <select
                                className={SELECT_CLASS}
                                value={assetClass}
                                onChange={e => setAssetClass(e.target.value)}
                            >
                                <option value="" disabled>Select…</option>
                                {ASSET_CLASSES.map(ac => (
                                    <option key={ac} value={ac}>{ac}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Geography">
                            <input
                                type="text"
                                className={INPUT_CLASS}
                                placeholder="e.g. North America"
                                value={geography}
                                onChange={e => setGeography(e.target.value)}
                            />
                        </FormField>
                    </div>

                    {/* Row 3: Source/Referral + Target IRR */}
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Source / Referral">
                            <input
                                type="text"
                                className={INPUT_CLASS}
                                placeholder="Who introduced this deal?"
                                value={sourceReferral}
                                onChange={e => setSourceReferral(e.target.value)}
                            />
                        </FormField>
                        <FormField label="Target IRR (%)">
                            <input
                                type="text"
                                inputMode="decimal"
                                className={INPUT_CLASS}
                                placeholder="e.g. 18"
                                value={targetIrr}
                                onChange={e => setTargetIrr(e.target.value)}
                            />
                        </FormField>
                    </div>

                    {/* Row 4: Commitment Min + Max + Currency */}
                    <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr 100px' }}>
                        <FormField label="Commitment Min ($)">
                            <input
                                type="text"
                                inputMode="numeric"
                                className={INPUT_CLASS}
                                placeholder="e.g. 3,000,000"
                                value={commitmentMin}
                                onChange={e => setCommitmentMin(e.target.value)}
                            />
                        </FormField>
                        <FormField label="Commitment Max ($)">
                            <input
                                type="text"
                                inputMode="numeric"
                                className={INPUT_CLASS}
                                placeholder="optional"
                                value={commitmentMax}
                                onChange={e => setCommitmentMax(e.target.value)}
                            />
                        </FormField>
                        <FormField label="Currency">
                            <select
                                className={SELECT_CLASS}
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>

                    {/* Thesis Fit Notes */}
                    <FormField label="Thesis Fit Notes">
                        <textarea
                            rows={3}
                            className="resize-none w-full rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-gray-2)] px-3 py-2 text-sm text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] outline-none focus:border-[var(--color-accent-9)] focus:bg-white transition-[border-color,background] duration-150 font-[inherit]"
                            placeholder="How does this fit our investment thesis?"
                            value={thesisFitNotes}
                            onChange={e => setThesisFitNotes(e.target.value)}
                        />
                    </FormField>
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 pt-3 border-t border-[var(--color-neutral-3)] flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="h-9 px-4 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] text-sm font-medium text-[var(--color-neutral-11)] bg-white hover:bg-[var(--color-neutral-2)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                        className="h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <IconCheck size={14} stroke={2.5} />
                        Create Investment
                    </button>
                </div>
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}
