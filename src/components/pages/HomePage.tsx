import { useState } from 'react'
import type { FormEvent } from 'react'
import {
    IconArrowRight,
    IconBriefcase2,
    IconBuildingBank,
    IconChartBar,
    IconClockHour4,
    IconFileDescription,
    IconActivityHeartbeat,
    IconSparkles,
} from '@tabler/icons-react'
import { MagicCard } from '@/components/ui/magic-card'

/** Targets wired from the home dashboard into AppShell `activePage`. */
export type HomeNavigateTarget =
    | 'investment-pipeline'
    | 'capital-flows'
    | 'portfolio'
    | 'documents'

interface HomePageProps {
    onNavigate: (page: HomeNavigateTarget) => void
    onAskFojo?: (prompt: string) => void
    isFojoOpen?: boolean
}

type QuickAction = {
    id: string
    title: string
    description: string
    icon: typeof IconBriefcase2
    iconBgClass: string
    iconColorClass: string
    cardTintClass: string
    onClick: () => void
}

export function HomePage({ onNavigate, onAskFojo, isFojoOpen = false }: HomePageProps) {
    const [fojoQuestion, setFojoQuestion] = useState('')

    function handleFojoSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const prompt = fojoQuestion.trim()
        if (!prompt) return

        onAskFojo?.(prompt)
        setFojoQuestion('')
    }

    const quickActions: QuickAction[] = [
        {
            id: 'deal-pipeline',
            title: 'Deal Pipeline',
            description: 'Browse active deals, evaluate new opportunities, and track your full pipeline.',
            icon: IconBriefcase2,
            iconBgClass: 'bg-[var(--color-blue-3)]',
            iconColorClass: 'text-[var(--color-accent-9)]',
            cardTintClass: 'hover:bg-[var(--color-blue-2)] hover:border-[var(--color-blue-6)]',
            onClick: () => onNavigate('investment-pipeline'),
        },
        {
            id: 'pending-review',
            title: 'Pending Review',
            description: 'Surface investments waiting for approval or IC sign-off.',
            icon: IconClockHour4,
            iconBgClass: 'bg-[#FFF4E5]',
            iconColorClass: 'text-[#C2410C]',
            cardTintClass: 'hover:bg-[#FFFBF5] hover:border-[#FED7AA]',
            onClick: () => onNavigate('capital-flows'),
        },
        {
            id: 'portfolio-performance',
            title: 'Portfolio Performance',
            description: 'Summarize funding progress and capital deployment metrics.',
            icon: IconChartBar,
            iconBgClass: 'bg-[#EEF9F3]',
            iconColorClass: 'text-[#047857]',
            cardTintClass: 'hover:bg-[#F6FCF9] hover:border-[#A7F3D0]',
            onClick: () => onNavigate('portfolio'),
        },
        {
            id: 'capital-activity',
            title: 'Capital Activity',
            description: 'Track capital calls, approvals, and funding activity across active investments.',
            icon: IconActivityHeartbeat,
            iconBgClass: 'bg-[#F0F5FF]',
            iconColorClass: 'text-[#1D4ED8]',
            cardTintClass: 'hover:bg-[#F7FAFF] hover:border-[#BFDBFE]',
            onClick: () => onNavigate('capital-flows'),
        },
        {
            id: 'research-company',
            title: 'Research a Company',
            description: 'Pull market data, news, and SEC filings on any firm.',
            icon: IconBuildingBank,
            iconBgClass: 'bg-[#F2F2FF]',
            iconColorClass: 'text-[#4F46E5]',
            cardTintClass: 'hover:bg-[#F8F7FF] hover:border-[#C7D2FE]',
            onClick: () => onAskFojo?.('Research this company and prepare a concise risk and opportunity brief.'),
        },
        {
            id: 'summarize-deal',
            title: 'Summarize a Deal',
            description: 'Get an AI-generated briefing on any deal in your pipeline.',
            icon: IconFileDescription,
            iconBgClass: 'bg-[#F3F4F6]',
            iconColorClass: 'text-[#374151]',
            cardTintClass: 'hover:bg-[var(--color-neutral-2)] hover:border-[var(--color-neutral-5)]',
            onClick: () => onAskFojo?.('Summarize this deal with key risks, upside, and recommended next actions.'),
        },
    ]

    return (
        <div className="flex flex-col gap-[var(--spacing-6)] px-[var(--spacing-6)] pt-9 pb-[var(--spacing-5)] max-w-[1120px] w-full min-w-0 mx-auto">
            <div className="flex flex-col gap-2">
                <p className="m-0 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-neutral-9)]">
                    <IconSparkles size={14} stroke={2} />
                    Way2B1 Intelligence
                </p>
                <h1 className="m-0 font-display text-[40px] font-bold leading-[1.1] tracking-[-0.03em] text-[var(--color-gray-12)]">
                    Good evening, Sandra.
                </h1>
                <p className="m-0 max-w-[580px] text-[16px] leading-[1.5] text-[var(--color-neutral-10)]">
                    Ask me anything, navigate to a view, or pick a quick action below to get started.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)]">
                    Quick actions
                </p>
                <div className="flex flex-col gap-2">
                    {quickActions.map((action) => {
                        const Icon = action.icon
                        return (
                            <button
                                key={action.id}
                                type="button"
                                onClick={action.onClick}
                                className={`group flex w-full items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white px-4 py-3 text-left transition-colors ${action.cardTintClass}`}
                            >
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${action.iconBgClass} ${action.iconColorClass}`}>
                                    <Icon size={17} stroke={2} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="m-0 font-display text-[18px] font-semibold leading-[1.15] tracking-[-0.01em] text-[var(--color-black)]">
                                        {action.title}
                                    </p>
                                    <p className="m-0 mt-0.5 text-[13px] text-[var(--color-neutral-9)]">{action.description}</p>
                                </div>
                                <IconArrowRight
                                    size={16}
                                    stroke={2}
                                    className="shrink-0 text-[var(--color-neutral-9)] transition-transform group-hover:translate-x-0.5"
                                />
                            </button>
                        )
                    })}
                </div>
            </div>

            {!isFojoOpen ? (
                <MagicCard gradientColor="rgba(0, 91, 226, 0.22)">
                    <form
                        onSubmit={handleFojoSubmit}
                        className="flex items-center gap-2 p-1.5"
                    >
                        <input
                            type="text"
                            value={fojoQuestion}
                            onChange={(event) => setFojoQuestion(event.target.value)}
                            placeholder="Ask Fojo about pipeline, capital calls, or fund exposure..."
                            className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-[var(--color-black)] outline-none placeholder:text-[var(--color-neutral-8)]"
                        />
                        <button
                            type="submit"
                            disabled={!fojoQuestion.trim()}
                            className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-accent-9)] px-3.5 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Send
                            <IconArrowRight size={14} stroke={2.5} />
                        </button>
                    </form>
                </MagicCard>
            ) : null}
        </div>
    )
}
