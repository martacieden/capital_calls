/**
 * ActionPromptDropdown — The intermediate step between selecting a card action
 * and triggering the AI chat. Same visual pattern as ContentHeader's asset prompt
 * dropdown, parameterized by action type.
 */

import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { IconPaperclip, IconFileText, IconX } from '@tabler/icons-react'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { usePlaceholderRotation } from '@/lib/hooks/usePlaceholderRotation'
import type { CardActionType } from '@/components/molecules/CardActionsMenu'
import type { PromptAnchorRect } from '@/lib/helpers/prompt-anchor'

/* ── Copy per action ─────────────────────────────────────────────── */

interface ActionCopy {
    title: string
    description: string
    placeholders: string[]
    submitLabel: string
}

const DEMO_FILES = [
    { id: 'ap-1', name: 'vehicle-title-tesla-x.pdf' },
    { id: 'ap-2', name: 'property-deed-740-park.pdf' },
    { id: 'ap-3', name: 'trust-amendment-2024.pdf' },
]

function getCopy(action: CardActionType): ActionCopy {
    switch (action) {
        case 'create-task':
            return {
                title: 'Create a task',
                description: 'Describe the task – Fojo will help you create and assign it.',
                placeholders: [
                    'Schedule annual maintenance for the vehicle…',
                    'Follow up on insurance renewal…',
                    'Review trust amendment with counsel…',
                ],
                submitLabel: 'Create',
            }
        case 'add-new-asset':
            return {
                title: 'Add an asset',
                description: 'Describe the asset and how it relates to existing records – Fojo will add it to Assets.',
                placeholders: [
                    'A 2024 Tesla Model X…',
                    'Property at 740 Park Avenue…',
                    'AIG umbrella liability policy…',
                ],
                submitLabel: 'Add',
            }
        case 'change-relation':
            return {
                title: 'Update relationships',
                description: 'Describe the connection to other records – Fojo will update the graph.',
                placeholders: [
                    'Move this under the Dynasty Trust…',
                    'Connect this to the Marital Trust…',
                    'Add this as a beneficiary of the ILIT…',
                ],
                submitLabel: 'Update',
            }
        default:
            return {
                title: 'Continue in chat',
                description: "Describe what you'd like to do – Fojo will handle the rest.",
                placeholders: ['What would you like to change…'],
                submitLabel: 'Continue',
            }
    }
}

const DROPDOWN_WIDTH = 424
const ESTIMATED_HEIGHT = 360
const VIEWPORT_MARGIN = 8
const ANCHOR_GAP = 8

function getDropdownStyle(anchorRect: PromptAnchorRect | null): CSSProperties {
    if (!anchorRect) {
        return { position: 'fixed', top: 72, right: VIEWPORT_MARGIN, width: DROPDOWN_WIDTH, zIndex: 11000 }
    }
    /** Left-align dropdown with the anchor's left edge (e.g. three-dots button). */
    let left = anchorRect.left
    let top = anchorRect.top + anchorRect.height + ANCHOR_GAP
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - DROPDOWN_WIDTH - VIEWPORT_MARGIN))
    top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - ESTIMATED_HEIGHT - VIEWPORT_MARGIN))
    return { position: 'fixed', top, left, width: DROPDOWN_WIDTH, zIndex: 11000 }
}

function useLiveDropdownStyle(
    anchorRect: PromptAnchorRect | null,
    anchorGetter: (() => PromptAnchorRect | null) | undefined,
): CSSProperties {
    const [style, setStyle] = useState<CSSProperties>(() => getDropdownStyle(anchorGetter?.() ?? anchorRect))
    useLayoutEffect(() => {
        if (!anchorGetter) {
            setStyle(getDropdownStyle(anchorRect))
            return
        }
        let raf = 0
        const tick = () => {
            const live = anchorGetter() ?? anchorRect
            setStyle(prev => {
                const next = getDropdownStyle(live)
                if (prev.top === next.top && prev.left === next.left) return prev
                return next
            })
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [anchorRect, anchorGetter])
    return style
}

/* ── Props ───────────────────────────────────────────────────────── */

export interface ActionPromptDropdownProps {
    action: CardActionType
    contextName: string
    /** Initial / fallback rect when anchorGetter is absent or returns null. */
    anchorRect?: PromptAnchorRect | null
    /** When set, position is recomputed each frame so the panel stays under the card during pan, zoom, or scroll. */
    anchorGetter?: () => PromptAnchorRect | null
    onSubmit: (text: string, hasFiles: boolean) => void
    onClose: () => void
}

/* ── Component ───────────────────────────────────────────────────── */

export function ActionPromptDropdown({ action, contextName: _contextName, anchorRect = null, anchorGetter, onSubmit, onClose }: ActionPromptDropdownProps) {
    const [inputValue, setInputValue] = useState('')
    const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string }[]>([])
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const copy = getCopy(action)
    const placeholder = usePlaceholderRotation(copy.placeholders, !inputValue)
    const canSubmit = inputValue.trim() || attachedFiles.length > 0
    const dropdownStyle = useLiveDropdownStyle(anchorRect, anchorGetter)

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 80)
    }, [])

    useClickOutside(dropdownRef, onClose, true)

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    const handleSubmit = () => {
        if (!canSubmit) return
        onSubmit(inputValue.trim(), attachedFiles.length > 0)
    }

    const handleAttach = () => {
        if (attachedFiles.length === 0) setAttachedFiles(DEMO_FILES)
    }

    const removeFile = (id: string) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== id))
    }

    return createPortal(
        <div
            ref={dropdownRef}
            className="fixed z-[var(--z-modal)] w-[424px] bg-white border border-[var(--color-gray-4)] rounded-[var(--radius-2xl)] shadow-[0_24px_80px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] animate-[notif-dropdown-in_0.22s_cubic-bezier(0.16,1,0.3,1)] origin-top-left p-[var(--spacing-5)] flex flex-col gap-[var(--spacing-5)]"
            style={dropdownStyle}
        >
            <style>{`.ap-dropdown .chat-input::placeholder { color: transparent; }`}</style>
            <div className="ap-dropdown flex flex-col gap-[var(--spacing-5)]">
                <div className="flex items-start gap-4">
                    <img className="w-[52px] h-[52px] rounded-full shrink-0" src={fojoMascotSmall} alt="Fojo" />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-[15px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] leading-[1.4]">{copy.title}</span>
                        <span className="text-sm text-[var(--color-neutral-11)] leading-[1.5]">{copy.description}</span>
                    </div>
                    <button
                        type="button"
                        className="shrink-0 p-[5px] rounded-[var(--radius-md)] text-[var(--color-neutral-9)] transition-colors duration-100 hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-12)]"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <IconX size={16} stroke={2} />
                    </button>
                </div>

                {attachedFiles.length > 0 && (
                    <div className="onboarding-file-chips" style={{ padding: 0 }}>
                        {attachedFiles.map(f => (
                            <div key={f.id} className="onboarding-file-chip">
                                <div className="onboarding-file-chip__icon">
                                    <IconFileText size={12} stroke={1.5} color="var(--color-accent-9)" />
                                </div>
                                <span>{f.name}</span>
                                <button className="onboarding-file-chip__remove" onClick={() => removeFile(f.id)} aria-label="Remove file">
                                    <IconX size={10} stroke={2} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="chat-footer rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] flex w-full pt-[var(--spacing-4)] px-[var(--spacing-3)] pb-[var(--spacing-3)] flex-col bg-[var(--color-white)] focus-within:border-[var(--color-purple)] focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.15)]">
                    <div className="w-full cursor-text" style={{ position: 'relative' }}>
                        {!inputValue && (
                            <span className={`absolute top-0 left-0 right-0 px-[var(--spacing-2)] text-sm text-[var(--color-neutral-8)] leading-[1.47] pointer-events-none transition-opacity duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis${placeholder.isVisible ? '' : ' opacity-0'}`}>
                                {placeholder.text}
                            </span>
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            className="chat-input w-full border-none outline-none font-sans text-sm text-[var(--color-gray-12)] bg-transparent px-[var(--spacing-2)] py-0 leading-[1.47] block"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit() } }}
                        />
                    </div>
                    <div className="flex mt-[var(--spacing-4)] w-full items-center justify-between">
                        <button className="p-[6px] rounded-[var(--radius-md)] flex items-center transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]" onClick={handleAttach} title="Attach documents">
                            <IconPaperclip size={18} stroke={2} color="var(--color-neutral-11)" />
                        </button>
                        <button
                            className="flex items-center justify-center gap-[var(--spacing-1)] rounded-[var(--radius-md)] border border-[var(--color-accent-9)] bg-[var(--color-accent-9)] min-h-[32px] px-3.5 py-[4px] text-[13px] font-[var(--font-weight-semibold)] leading-[1.43] text-[var(--color-accent-contrast)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={!canSubmit}
                            onClick={handleSubmit}
                        >
                            {copy.submitLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
