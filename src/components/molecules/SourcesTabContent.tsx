import { IconFileText } from '@tabler/icons-react'
import { getCitationsForItem } from '@/data/citations'
import { CitationCardStack } from '@/components/molecules/CitationCardStack'

interface SourcesTabContentProps {
    itemId: string
}

export function SourcesTabContent({ itemId }: SourcesTabContentProps) {
    const citationGroups = getCitationsForItem(itemId)

    if (citationGroups.size === 0) {
        return (
            <div className="flex flex-col items-center gap-[var(--spacing-2)] px-[var(--spacing-4)] py-[var(--spacing-8)] text-center text-[var(--color-neutral-11)] text-[13px]">
                <IconFileText size={24} stroke={1.5} />
                <p>No source documents linked to this item.</p>
            </div>
        )
    }

    return (
        <div className="detail-sources flex flex-col gap-[var(--spacing-6)]">
            <CitationCardStack citationGroups={citationGroups} />
        </div>
    )
}
