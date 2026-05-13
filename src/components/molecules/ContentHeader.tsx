import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconPlus, IconChevronRight, IconPaperclip, IconFileText, IconX } from '@tabler/icons-react'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { usePlaceholderRotation } from '@/lib/hooks/usePlaceholderRotation'
import type { ComponentType, RefObject } from 'react'

const DEMO_FILES = [
    { id: 'dd-1', name: 'vehicle-title-tesla-x.pdf' },
    { id: 'dd-2', name: 'property-deed-740-park.pdf' },
    { id: 'dd-3', name: 'trust-amendment-2024.pdf' },
]

interface ContentHeaderProps {
    title: string
    itemCount?: number
    onNewItemClick?: (text: string, hasFiles: boolean) => void
    /** Simple action button click — no dropdown. Use instead of onNewItemClick for non-Fojo actions like Upload. */
    onActionClick?: () => void
    actionLabel?: string
    actionIcon?: ComponentType<{ size?: number; stroke?: number }>
    breadcrumb?: { label: string; onClick: () => void }
    secondaryAction?: { label: string; onClick: () => void; buttonRef?: RefObject<HTMLButtonElement | null>; icon?: ComponentType<{ size?: number; stroke?: number }> }
}

export function ContentHeader({ title, itemCount, onNewItemClick, onActionClick, actionLabel, actionIcon: ActionIcon, breadcrumb, secondaryAction }: ContentHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string }[]>([])
    const btnRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const placeholders = [
        'A 2024 Tesla Model X…',
        'Property at 740 Park Avenue…',
        'AIG umbrella liability policy…',
    ]
    const placeholder = usePlaceholderRotation(placeholders, isDropdownOpen && !inputValue)

    useEffect(() => {
        if (isDropdownOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        } else {
            setInputValue('')
            setAttachedFiles([])
        }
    }, [isDropdownOpen])

    useClickOutside([dropdownRef, btnRef], () => setIsDropdownOpen(false), isDropdownOpen)

    const getDropdownStyle = (): React.CSSProperties => {
        const rect = btnRef.current?.getBoundingClientRect()
        if (!rect) return { position: 'fixed', top: 0, right: 0, zIndex: 200 }
        return {
            position: 'fixed',
            top: rect.bottom + 8,
            right: window.innerWidth - rect.right,
            zIndex: 200,
        }
    }

    const canSubmit = inputValue.trim() || attachedFiles.length > 0

    const handleSubmit = () => {
        if (!canSubmit) return
        onNewItemClick?.(inputValue.trim(), attachedFiles.length > 0)
        setInputValue('')
        setAttachedFiles([])
        setIsDropdownOpen(false)
    }

    const handleAttach = () => {
        if (attachedFiles.length === 0) {
            setAttachedFiles(DEMO_FILES)
        }
    }

    const removeFile = (id: string) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== id))
    }

    return (
        <div className="flex w-full items-center justify-between gap-4 overflow-hidden">
            <div className="flex min-w-0 flex-1 items-center gap-2 font-display text-[28px] font-black leading-[1.25] tracking-[-0.02em] [-webkit-text-stroke:0.3px_currentColor]">
                {breadcrumb && (
                    <>
                        <button
                            type="button"
                            className="shrink-0 text-[var(--color-neutral-9)] bg-none border-none font-[inherit] font-black cursor-pointer transition-colors duration-150 p-0 hover:text-[var(--color-gray-12)]"
                            onClick={breadcrumb.onClick}
                        >
                            {breadcrumb.label}
                        </button>
                        <IconChevronRight size={18} stroke={2} className="shrink-0 text-[var(--color-neutral-9)]" aria-hidden />
                    </>
                )}
                <h1 className="min-w-0 truncate font-[inherit] text-[inherit] text-[var(--color-gray-12)] font-black m-0 p-0 border-none">
                    {title}
                </h1>
                {itemCount != null && (
                    <span className="flex min-w-[24px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] px-1.5 py-0.5 text-[13px] font-[var(--font-weight-medium)] leading-[1.54] text-[var(--color-gray-12)]">
                        {itemCount}
                    </span>
                )}
            </div>
            {(onNewItemClick || secondaryAction || onActionClick) && (
                <div className="flex shrink-0 items-center gap-[var(--spacing-2)]">
                    {secondaryAction && (() => {
                        const SecIcon = secondaryAction.icon ?? IconPlus
                        return (
                            <button ref={secondaryAction.buttonRef} className="flex items-center justify-center gap-[var(--spacing-1)] rounded-[var(--radius-md)] border-none bg-[var(--color-blue-1)] px-4 py-0.5 text-[14px] font-[var(--font-weight-semibold)] leading-[1.43] text-[var(--color-accent-9)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear min-h-[32px] hover:bg-[var(--color-blue-hover)]" onClick={secondaryAction.onClick}>
                                <span>{secondaryAction.label}</span>
                                <SecIcon size={16} stroke={2} />
                            </button>
                        )
                    })()}
                    {(onNewItemClick || onActionClick) && (
                        <button ref={btnRef} className="flex items-center justify-center gap-[var(--spacing-1)] rounded-[var(--radius-md)] border border-[var(--color-accent-9)] bg-[var(--color-accent-9)] px-4 py-0.5 pl-[12px] text-[14px] font-[var(--font-weight-semibold)] leading-[1.43] text-[var(--color-accent-contrast)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear min-h-[32px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed" onClick={onActionClick ?? (() => setIsDropdownOpen(v => !v))}>
                            {ActionIcon ? <ActionIcon size={16} stroke={2} /> : <IconPlus size={16} stroke={2} />}
                            <span>{actionLabel ?? 'Add asset'}</span>
                        </button>
                    )}
                </div>
            )}

            {isDropdownOpen && onNewItemClick && createPortal(
                <div ref={dropdownRef} className="header-dropdown w-[424px] bg-white border border-[var(--color-gray-4)] rounded-[var(--radius-2xl)] shadow-[0_24px_80px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] animate-[notif-dropdown-in_0.22s_cubic-bezier(0.16,1,0.3,1)] origin-top-right p-[var(--spacing-5)] flex flex-col gap-[var(--spacing-5)]" style={getDropdownStyle()}>
                    <style>{`.header-dropdown .chat-input::placeholder { color: transparent; }`}</style>
                    <div className="flex items-center gap-4">
                        <img className="w-[52px] h-[52px] rounded-full shrink-0" src={fojoMascotSmall} alt="Fojo" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[15px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] leading-[1.4]">Add an asset</span>
                            <span className="text-sm text-[var(--color-neutral-11)] leading-[1.5]">Describe the asset or attach documents – Fojo will add it to Assets.</span>
                        </div>
                    </div>

                    {/* Attached files — above the input */}
                    {attachedFiles.length > 0 && (
                        <div className="onboarding-file-chips" style={{ padding: 0 }}>
                            {attachedFiles.map(f => (
                                <div key={f.id} className="onboarding-file-chip">
                                    <div className="onboarding-file-chip__icon">
                                        <IconFileText size={12} stroke={1.5} color="var(--color-accent-9)" />
                                    </div>
                                    <span>{f.name}</span>
                                    <button
                                        className="onboarding-file-chip__remove"
                                        onClick={() => removeFile(f.id)}
                                        aria-label="Remove file"
                                    >
                                        <IconX size={10} stroke={2} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="chat-footer rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] flex w-full pt-[var(--spacing-4)] px-[var(--spacing-3)] pb-[var(--spacing-3)] flex-col bg-[var(--color-white)] focus-within:border-[var(--color-purple)] focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ marginTop: 0 }}>
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
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
