import { useState } from 'react'
import { IconCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { QAOption } from '@/data/types/fojo'

/*
 * FojoQA — Interactive Q&A component rendered above the Fojo chat input.
 * Same UX pattern as Claude Code's AskUserQuestion tool:
 * 3-4 option cards with title + description, single/multi-select, "Other" free text.
 * Ref: FEEDBACK-SUMMARY.md §3b (Resolved: Q&A Component Interaction Types)
 */

export type { QAOption }

interface FojoQAProps {
    question: string
    options: QAOption[]
    multiSelect?: boolean
    showOther?: boolean
    onSelect: (values: string[]) => void
    onOther?: () => void
}

export function FojoQA({ question, options, multiSelect = false, showOther = true, onSelect, onOther }: FojoQAProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const toggleOption = (value: string) => {
        if (multiSelect) {
            setSelected(prev => {
                const next = new Set(prev)
                if (next.has(value)) next.delete(value)
                else next.add(value)
                return next
            })
        } else {
            // Single select — submit immediately
            onSelect([value])
        }
    }

    const handleSubmitMulti = () => {
        if (selected.size > 0) {
            onSelect([...selected])
        }
    }

    return (
        <div className="flex flex-col gap-2.5 p-3.5 mb-[var(--spacing-2)] border border-[var(--color-gray-4)] rounded-[var(--radius-lg)] bg-[var(--color-white)] animate-[chat-area-in_0.2s_ease-out_both]">
            <p className="text-sm font-medium text-[var(--color-gray-12)] leading-5 m-0">{question}</p>

            <div className="flex flex-col gap-1.5">
                {options.map(opt => {
                    const isSelected = selected.has(opt.value)
                    return (
                        <button
                            key={opt.value}
                            className={cn(
                                'flex items-center gap-3 py-2 px-2.5 border-none rounded-lg bg-transparent cursor-pointer transition-[background] duration-150 text-left w-full hover:bg-[var(--color-gray-2)]',
                                isSelected && 'bg-[var(--color-accent-3)] hover:bg-[var(--color-accent-3)]'
                            )}
                            onClick={() => toggleOption(opt.value)}
                        >
                            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                <span className="text-[13px] font-medium text-[var(--color-gray-12)] leading-[18px]">{opt.title}</span>
                                <span className="text-xs font-normal text-[var(--color-neutral-11)] leading-4">{opt.description}</span>
                            </div>
                            {isSelected && (
                                <div className="flex items-center justify-center shrink-0 text-[var(--color-accent-9)]">
                                    <IconCheck size={14} stroke={2.5} />
                                </div>
                            )}
                        </button>
                    )
                })}

                {showOther && onOther && (
                    <button
                        className="flex items-center gap-3 py-2 px-2.5 border-none rounded-lg bg-transparent cursor-pointer transition-[background] duration-150 text-left w-full hover:bg-[var(--color-gray-2)]"
                        onClick={onOther}
                    >
                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                            <span className="text-[13px] font-medium text-[var(--color-gray-12)] leading-[18px]">Other</span>
                            <span className="text-xs font-normal text-[var(--color-neutral-11)] leading-4">Type your own answer</span>
                        </div>
                    </button>
                )}
            </div>

            {multiSelect && selected.size > 0 && (
                <button className="self-end h-8 px-4 border-none rounded-lg bg-[var(--color-accent-9)] text-[var(--color-white)] text-[13px] font-medium cursor-pointer transition-opacity duration-150 mt-1 hover:opacity-90" onClick={handleSubmitMulti}>
                    Confirm ({selected.size} selected)
                </button>
            )}
        </div>
    )
}
