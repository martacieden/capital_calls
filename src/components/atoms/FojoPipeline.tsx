import { useState } from 'react'
import {
    IconCheck,
    IconChevronDown,
    IconLoader2,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

/*
 * FojoPipeline — Visible AI processing activity stream in the Fojo panel.
 * Shows what Fojo is doing step by step: reading docs, searching web, enriching data.
 * Each step has a status (pending/running/complete), text, and optional expandable detail.
 * Ref: FEEDBACK-SUMMARY.md §8 (Visible AI Processing Pipeline)
 */

export interface PipelineStepStatus {
    text: string
    detail?: string
    status: 'pending' | 'running' | 'complete'
}

interface FojoPipelineProps {
    steps: PipelineStepStatus[]
}

export function FojoPipeline({ steps }: FojoPipelineProps) {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

    const toggleExpand = (idx: number) => {
        setExpandedIdx(prev => prev === idx ? null : idx)
    }

    return (
        <div className="flex flex-col gap-0.5 py-3 px-3.5 rounded-[var(--radius-lg)] bg-[var(--color-gray-2)] animate-[chat-area-in_0.2s_ease-out_both] w-full">
            {steps.map((step, idx) => {
                const isExpanded = expandedIdx === idx
                const hasDetail = !!step.detail

                return (
                    <div
                        key={idx}
                        className={`fojo-pipeline__step fojo-pipeline__step--${step.status} animate-[chat-area-in_0.25s_ease-out_both]`}
                        style={{ animationDelay: `${idx * 0.08}s` }}
                    >
                        <div
                            className="flex items-center gap-2 py-1 min-h-[28px]"
                            onClick={hasDetail ? () => toggleExpand(idx) : undefined}
                            style={hasDetail ? { cursor: 'pointer' } : undefined}
                        >
                            <div className="fojo-pipeline__step-icon flex items-center justify-center w-[18px] h-[18px] shrink-0">
                                {step.status === 'complete' && <IconCheck size={12} stroke={2.5} />}
                                {step.status === 'running' && <IconLoader2 size={12} stroke={2.5} className="animate-spin" />}
                                {step.status === 'pending' && <div className="w-[6px] h-[6px] rounded-full bg-[var(--color-neutral-7)]" />}
                            </div>
                            <span className="fojo-pipeline__step-text flex-1 text-[13px] leading-[18px] min-w-0">{step.text}</span>
                            {hasDetail && (
                                <IconChevronDown
                                    size={14}
                                    stroke={2}
                                    className={cn('text-[var(--color-neutral-9)] shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')}
                                />
                            )}
                        </div>
                        {hasDetail && isExpanded && (
                            <div className="ml-[26px] py-1 pb-2 text-xs font-normal text-[var(--color-neutral-11)] leading-[18px] whitespace-pre-wrap animate-[chat-area-in_0.15s_ease-out_both]">
                                {step.detail}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
