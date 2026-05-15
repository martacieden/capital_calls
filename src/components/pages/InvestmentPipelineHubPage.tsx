import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { InvestmentPipelinePage } from '@/components/pages/InvestmentPipelinePage'

/** Shared chrome for Pipeline hub routes */
export function PipelineHubFrame({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[1120px] flex-1 flex-col">
            <div className={cn('flex h-full min-h-0 w-full flex-1 flex-col rounded-[var(--radius-xl)]', 'bg-[var(--color-white)]')}>
                <div className="flex h-full min-h-0 w-full flex-1 flex-col bg-[var(--color-white)]">{children}</div>
            </div>
        </div>
    )
}

interface InvestmentPipelineHubPageProps {
    /** Capital calls live under Capital Activities / Investments holdings — not on Pipeline. */
    onOpenDeal?: (id: string) => void
}

/**
 * Pipeline hub — active deal work (pre-approval → approval). Capital calls: Capital Activities.
 */
export function InvestmentPipelineHubPage({ onOpenDeal }: InvestmentPipelineHubPageProps) {
    return (
        <PipelineHubFrame>
            <InvestmentPipelinePage embeddedInHub onOpenDeal={onOpenDeal} />
        </PipelineHubFrame>
    )
}
