import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { InvestmentPipelinePage } from '@/components/pages/InvestmentPipelinePage'

/** Shared chrome for Pipeline hub routes */
export function PipelineHubFrame({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col flex-1 min-h-0 w-full max-w-[1120px] mx-auto">
            <div
                className={cn(
                    'flex flex-col flex-1 min-h-0 overflow-hidden rounded-[var(--radius-xl)]',
                    'bg-[var(--color-white)]',
                )}
            >
                <div className="flex flex-1 flex-col min-h-0 overflow-hidden bg-[var(--color-white)]">{children}</div>
            </div>
        </div>
    )
}

interface InvestmentPipelineHubPageProps {
    onOpenCapitalCallDetail: (id: string) => void
    onOpenDeal?: (id: string) => void
}

/**
 * Single Pipeline hub — deal cards in all lanes; capital-call Kanban tiles in IC Review / Approved only.
 */
export function InvestmentPipelineHubPage({ onOpenCapitalCallDetail, onOpenDeal }: InvestmentPipelineHubPageProps) {
    return (
        <PipelineHubFrame>
            <InvestmentPipelinePage
                embeddedInHub
                onOpenCapitalCall={onOpenCapitalCallDetail}
                onOpenDeal={onOpenDeal}
            />
        </PipelineHubFrame>
    )
}
