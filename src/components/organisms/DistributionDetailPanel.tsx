import { useState, useEffect } from 'react'
import { IconFileText, IconChevronRight, IconUser, IconBuildingBank } from '@tabler/icons-react'
import { getIcon } from '@/lib/icons'
import { getCategoryByKey } from '@/data/categories'
import { getCitationsForItem } from '@/data/citations'
import { CitationCardStack } from '@/components/molecules/CitationCardStack'
import { DetailPanelShell, DetailTabs } from '@/components/molecules/DetailPanelShell'
import type { DistributionEvent, AnyCatalogItem } from '@/data/types'
import { getTypeLabel, shouldShowAmount } from '@/lib/helpers/timeline'

interface DistributionDetailPanelProps {
    event: DistributionEvent | null
    beneficiary: AnyCatalogItem | null
    trust: AnyCatalogItem | null
    isOpen: boolean
    onClose: () => void
}

function formatAmount(amount: number | string): string {
    if (typeof amount !== 'number') return String(amount)
    if (amount === 0) return ''
    return '$' + amount.toLocaleString('en-US')
}

function getTriggerDetail(event: DistributionEvent): string {
    if (event.triggerType === 'Age' && event.triggerAge != null) {
        return `When beneficiary reaches age ${event.triggerAge}`
    }
    if (event.triggerEvent) return event.triggerEvent
    return ''
}

export function DistributionDetailPanel({ event, beneficiary, trust, isOpen, onClose }: DistributionDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<string>('sources')

    useEffect(() => {
        setActiveTab('sources')
    }, [event?.id])

    if (!event) return null

    const citationItemId = event.citationItemId ?? event.trustId
    const typeLabel = getTypeLabel(event)

    return (
        <DetailPanelShell
            isOpen={isOpen}
            onClose={onClose}
            breadcrumbs={
                <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
                    <span className="detail-breadcrumb-segment">
                        <span className="detail-breadcrumb-item detail-breadcrumb-item--root">Timeline</span>
                    </span>
                    <span className="detail-breadcrumb-segment detail-breadcrumb-segment--truncate">
                        <IconChevronRight size={14} stroke={2} className="detail-breadcrumb-separator" />
                        <span className="detail-breadcrumb-item detail-breadcrumb-item--current" title={typeLabel}>{typeLabel}</span>
                    </span>
                </nav>
            }
        >
            <div className="detail-title-section mb-[var(--spacing-6)]">
                <div className="flex-1 min-w-0">
                    <h2 className="detail-name font-display text-[24px] font-[var(--font-weight-bold)] text-[var(--color-gray-12)] leading-[1.2] [-webkit-text-stroke:0.3px_currentColor] whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{typeLabel} — {beneficiary?.name ?? 'Unknown'}</h2>
                    {shouldShowAmount(event.amount) && (
                        <div className="text-base font-[var(--font-weight-semibold)] text-[var(--color-accent-9)] mt-1">
                            {formatAmount(event.amount)}
                        </div>
                    )}
                    {event.description && (
                        <p className="detail-description text-sm leading-[1.6] text-[var(--color-neutral-11)] mt-[var(--spacing-3)] line-clamp-2">{event.description}</p>
                    )}
                </div>
            </div>

            <DetailTabs
                tabs={[{ key: 'sources', label: 'Sources' }, { key: 'overview', label: 'Overview' }]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === 'overview' && (
                <>
                    <div>
                        <h3 className="text-[13px] font-[var(--font-weight-bold)] uppercase tracking-[0.05em] text-[var(--color-neutral-11)] mb-[var(--spacing-4)] border-b border-[var(--color-gray-4)] pb-[var(--spacing-2)]">Details</h3>
                        <div className="grid grid-cols-2 gap-[var(--spacing-5)]">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-[var(--color-neutral-11)] font-[var(--font-weight-medium)]">Trigger</span>
                                <span className="text-sm text-[var(--color-gray-12)] font-[var(--font-weight-semibold)]">{getTriggerDetail(event)}</span>
                            </div>
                            {shouldShowAmount(event.amount) && (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-[var(--color-neutral-11)] font-[var(--font-weight-medium)]">Outcome</span>
                                    <span className="text-sm text-[var(--color-gray-12)] font-[var(--font-weight-semibold)]">{formatAmount(event.amount)}</span>
                                </div>
                            )}
                            {event.triggerYear != null && (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-[var(--color-neutral-11)] font-[var(--font-weight-medium)]">Year</span>
                                    <span className="text-sm text-[var(--color-gray-12)] font-[var(--font-weight-semibold)]">{event.triggerYear}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-[var(--spacing-8)]">
                        <h3 className="text-[13px] font-[var(--font-weight-bold)] uppercase tracking-[0.05em] text-[var(--color-neutral-11)] mb-[var(--spacing-4)] border-b border-[var(--color-gray-4)] pb-[var(--spacing-2)]">Relationships</h3>
                        <div className="flex flex-col gap-[var(--spacing-4)] mt-2">
                            {beneficiary && (() => {
                                const cat = getCategoryByKey(beneficiary.categoryKey)
                                const CatIcon = getIcon(cat?.icon, IconUser)
                                return (
                                    <div className="relationship-card">
                                        <div className="relationship-icon">
                                            <CatIcon size={24} stroke={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-[var(--color-neutral-11)]">Beneficiary</div>
                                            <div className="text-[13px] font-[var(--font-weight-semibold)] text-[var(--color-neutral-12)]">{beneficiary.name}</div>
                                        </div>
                                        <IconChevronRight size={16} color="var(--color-neutral-11)" />
                                    </div>
                                )
                            })()}
                            {trust && (() => {
                                const cat = getCategoryByKey(trust.categoryKey)
                                const CatIcon = getIcon(cat?.icon, IconBuildingBank)
                                return (
                                    <div className="relationship-card">
                                        <div className="relationship-icon">
                                            <CatIcon size={24} stroke={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-[var(--color-neutral-11)]">Source Trust</div>
                                            <div className="text-[13px] font-[var(--font-weight-semibold)] text-[var(--color-neutral-12)]">{trust.name}</div>
                                        </div>
                                        <IconChevronRight size={16} color="var(--color-neutral-11)" />
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'sources' && (
                <DistributionSourcesContent citationItemId={citationItemId} />
            )}
        </DetailPanelShell>
    )
}

function DistributionSourcesContent({ citationItemId }: { citationItemId: string }) {
    const citationGroups = getCitationsForItem(citationItemId)

    if (citationGroups.size === 0) {
        return (
            <div className="flex flex-col items-center gap-[var(--spacing-2)] px-[var(--spacing-4)] py-[var(--spacing-8)] text-center text-[var(--color-neutral-11)] text-[13px]">
                <IconFileText size={24} stroke={1.5} />
                <p>No source documents linked to this distribution.</p>
            </div>
        )
    }

    return (
        <div className="detail-sources flex flex-col gap-[var(--spacing-6)]">
            <CitationCardStack citationGroups={citationGroups} />
        </div>
    )
}
