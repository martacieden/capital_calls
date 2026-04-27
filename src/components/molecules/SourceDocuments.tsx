import { useState } from 'react'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { DocumentEntity } from '@/data/thornton/valuations-data'

interface SourceDocumentsProps {
    documents: DocumentEntity[]
}

function docStatusClass(status: string) {
    const s = status.toLowerCase().replace(' ', '-')
    if (s === 'complete') return 'text-[var(--color-green-9)] bg-[var(--color-green-1)]'
    if (s === 'incomplete') return 'text-[var(--color-neutral-text)] bg-[rgba(245,158,11,0.08)]'
    if (s === 'pending-review') return 'text-[var(--color-accent-9)] bg-[rgba(0,91,226,0.08)]'
    return 'text-[var(--color-neutral-11)] bg-[var(--color-neutral-3)]'
}

export function SourceDocuments({ documents }: SourceDocumentsProps) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set())

    const toggle = (name: string) => {
        setExpanded(prev => {
            const next = new Set(prev)
            if (next.has(name)) next.delete(name)
            else next.add(name)
            return next
        })
    }

    return (
        <div className="flex flex-col gap-0">
            {documents.map(entity => {
                const isOpen = expanded.has(entity.entityName)
                const completeCount = entity.documents.filter(d => d.status === 'Complete').length
                const allComplete = completeCount === entity.documents.length

                return (
                    <div key={entity.entityName} className="border-b border-[var(--color-neutral-4)] last:border-b-0">
                        <button
                            className="flex items-center gap-2 w-full px-1 py-3 bg-transparent cursor-pointer transition-colors duration-100 text-[13px] hover:bg-[var(--color-neutral-2)]"
                            onClick={() => toggle(entity.entityName)}
                        >
                            <span className="flex text-[var(--color-neutral-11)] shrink-0">
                                {isOpen
                                    ? <IconChevronDown size={14} stroke={2} />
                                    : <IconChevronRight size={14} stroke={2} />}
                            </span>
                            <span className="font-semibold text-[var(--color-black)] flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap">{entity.entityName}</span>
                            <span className="text-xs text-[var(--color-neutral-11)] bg-[var(--color-neutral-3)] px-1.5 py-px rounded-[4px] shrink-0">{entity.entityType}</span>
                            <span className="text-xs text-[var(--color-neutral-11)] shrink-0">{entity.documents.length} docs</span>
                            <span className={cn(
                                'text-xs font-semibold px-2 py-0.5 rounded-full shrink-0',
                                allComplete
                                    ? 'bg-[rgba(16,185,129,0.1)] text-[var(--color-green-9)]'
                                    : 'bg-[rgba(245,158,11,0.1)] text-[var(--color-neutral-text)]'
                            )}>
                                {allComplete ? 'Complete' : `${completeCount}/${entity.documents.length}`}
                            </span>
                        </button>
                        {isOpen && (
                            <div className="pb-2 pl-[30px] flex flex-col gap-0">
                                {entity.documents.map(doc => (
                                    <div key={doc.name} className="flex items-center justify-between px-2 py-1.5 text-xs rounded-[4px] hover:bg-[var(--color-neutral-2)]">
                                        <span className="text-[var(--color-neutral-11)]">{doc.name}</span>
                                        <span className={cn('text-xs font-medium px-1.5 py-px rounded-[4px]', docStatusClass(doc.status))}>
                                            {doc.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
