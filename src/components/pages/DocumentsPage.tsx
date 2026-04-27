import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { sortByPriority } from '@/lib/helpers/priority-sort'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { usePlaceholderRotation } from '@/lib/hooks/usePlaceholderRotation'
import { useRandomTemplate } from '@/lib/hooks/useRandomTemplate'
import { createPortal } from 'react-dom'
import * as Icons from '@tabler/icons-react'
import {
    IconUpload,
    IconChevronRight,
    IconChevronDown,
} from '@tabler/icons-react'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { CollectionCard } from '@/components/molecules/CollectionCard'
import { DocumentCard } from '@/components/molecules/DocumentCard'
import { DocumentRow } from '@/components/molecules/DocumentRow'
import { CatalogToolbar } from '@/components/organisms/CatalogToolbar'
import type { DropdownItem } from '@/components/organisms/CatalogToolbar'
import { DocumentDetailPanel } from '@/components/organisms/DocumentDetailPanel'
import { thorntonDocuments, documentCollections, mockCollectionDocuments, MOCK_COLLECTION_TEMPLATES } from '@/data/thornton/documents-data'
import type { DocumentRecord, DocCollection } from '@/data/thornton/documents-data'
import type { CatalogView, QuickFilterKey } from '@/data/types'
import type { QuickFilterItem } from '@/components/organisms/CatalogToolbar'
import { showToast, updateToast } from '@/components/atoms/Toast'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'

const DOC_TYPE_ITEMS: DropdownItem[] = [
    { key: 'PDF', label: 'PDF', icon: 'IconFileTypePdf' },
]

const MAX_VISIBLE_COLLECTIONS = 4

interface DocumentsPageProps {
    onNavigateToTimeline?: () => void
    pendingCollection?: DocCollection | null
    onCollectionConsumed?: () => void
    isChatOpen?: boolean
}

export function DocumentsPage({ onNavigateToTimeline, pendingCollection, onCollectionConsumed, isChatOpen }: DocumentsPageProps) {
    const [activeView, setActiveView] = useState<CatalogView>('grid')
    const [activeType, setActiveType] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null)
    const [isDocPanelOpen, setIsDocPanelOpen] = useState(false)
    const [collections, setCollections] = useState<DocCollection[]>(documentCollections)

    // Sub-view state (same pattern as Assets page)
    const [docsSubView, setDocsSubView] = useState<'home' | 'all-collections' | 'collection-detail'>('home')
    const [activeCollection, setActiveCollection] = useState<string | null>(null)
    const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilterKey>>(new Set())
    const toggleQuickFilter = useCallback((key: QuickFilterKey) => {
        setActiveQuickFilters(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }, [])

    // New collection dropdown state
    const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false)
    const [collectionPrompt, setCollectionPrompt] = useState('')
    const newCollBtnRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Rotating placeholder examples
    const placeholderExamples = useMemo(() => [
        'All documents mentioning Edward Thornton IV',
        'Real estate deeds and insurance policies',
        'Dynasty Trust I beneficiary designations',
        'Distribution schedules across all trusts',
    ], [])
    const placeholder = usePlaceholderRotation(placeholderExamples, isNewCollectionOpen && !collectionPrompt)

    const handleDocClick = (doc: DocumentRecord) => {
        setSelectedDoc(doc)
        setIsDocPanelOpen(true)
    }

    const handleDocPanelClose = () => {
        setIsDocPanelOpen(false)
        setSelectedDoc(null)
    }

    // Consume pending collection from asset detail panel
    useEffect(() => {
        if (!pendingCollection) return
        setCollections(prev => [...prev, pendingCollection])
        setActiveCollection(pendingCollection.key)
        setDocsSubView('collection-detail')
        onCollectionConsumed?.()
    }, [pendingCollection, onCollectionConsumed])

    useClickOutside([dropdownRef, newCollBtnRef], () => setIsNewCollectionOpen(false), isNewCollectionOpen)

    const getDropdownStyle = (): React.CSSProperties => {
        const rect = newCollBtnRef.current?.getBoundingClientRect()
        if (!rect) return {}
        return {
            position: 'fixed',
            top: rect.bottom + 6,
            right: window.innerWidth - rect.right,
            zIndex: 200,
        }
    }

    const pickTemplate = useRandomTemplate(MOCK_COLLECTION_TEMPLATES)

    const handleCreateCollection = () => {
        if (!collectionPrompt.trim()) return
        setIsNewCollectionOpen(false)
        setCollectionPrompt('')
        const template = pickTemplate()
        const newCollection: DocCollection = {
            key: `custom-${Date.now()}`,
            label: template.label,
            icon: template.icon,
            pinned: false,
            docIds: template.docIds,
            description: template.description,
        }
        const toastId = showToast(`Creating "${template.label}" collection...`, 'loading')
        setTimeout(() => {
            setCollections(prev => [...prev, newCollection])
            updateToast(
                toastId,
                `Collection "${template.label}" created — ${template.docIds.length} document${template.docIds.length === 1 ? '' : 's'} added`,
                'success',
                { label: 'Open', onClick: () => { setActiveCollection(newCollection.key); setDocsSubView('collection-detail') } }
            )
        }, 3000)
    }

    const handleOpenCollection = (key: string) => {
        setActiveCollection(key)
        setDocsSubView('collection-detail')
    }

    const handleBackToHome = () => {
        setDocsSubView('home')
        setActiveCollection(null)
    }

    const currentCollection = activeCollection
        ? collections.find(c => c.key === activeCollection) ?? null
        : null

    // Docs for collection drill-in
    const collectionDocs = useMemo(() => {
        if (!currentCollection) return []
        const allDocs = [...thorntonDocuments, ...mockCollectionDocuments]
        let docs = allDocs.filter(d => currentCollection.docIds.includes(d.id))
        if (activeType.length > 0) {
            docs = docs.filter(d => activeType.includes(d.fileType))
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            docs = docs.filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.description.toLowerCase().includes(q)
            )
        }
        return sortByPriority(docs)
    }, [currentCollection, activeType, searchQuery])

    // All documents (for the "All Documents" section on home)
    const allFilteredDocs = useMemo(() => {
        let docs = [...thorntonDocuments]
        if (activeType.length > 0) {
            docs = docs.filter(d => activeType.includes(d.fileType))
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            docs = docs.filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.description.toLowerCase().includes(q)
            )
        }
        if (activeQuickFilters.size > 0) {
            docs = docs.filter(d => {
                for (const key of activeQuickFilters) {
                    if (key === 'unlinked' && d.attachedItemIds.length === 0) return true
                    if (key === 'shared' as any && d.sharedWith.length > 0) return true
                    if (d.priorityStatus?.type === key) return true
                }
                return false
            })
        }
        return sortByPriority(docs)
    }, [activeType, searchQuery, activeQuickFilters])

    // Collections filtered by search + quick filter
    const filteredCollections = useMemo(() => {
        let result = collections
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            result = collections.filter(c =>
                c.label.toLowerCase().includes(q) ||
                (c.description && c.description.toLowerCase().includes(q))
            )
        }
        if (activeQuickFilters.size > 0) {
            result = result.filter(c => c.priorityStatus && activeQuickFilters.has(c.priorityStatus.type as QuickFilterKey))
        }
        return sortByPriority(result)
    }, [collections, searchQuery, activeQuickFilters])

    // Quick filter counts for documents
    const docFilterCounts = useMemo(() => {
        const allDocs = thorntonDocuments
        const counts: Record<string, number> = {
            'recently-updated': 0,
            'expiring-soon': 0,
            'unlinked': 0,
            'shared': 0,
        }
        for (const doc of allDocs) {
            if (doc.priorityStatus?.type && doc.priorityStatus.type in counts) {
                counts[doc.priorityStatus.type]++
            }
            if (doc.sharedWith.length > 0) counts['shared']++
        }
        counts['unlinked'] = allDocs.filter(d => d.attachedItemIds.length === 0).length
        return counts
    }, [])

    const docQuickFilterItems: QuickFilterItem[] = useMemo(() => [
        { key: 'expiring-soon', label: 'Expiring soon', count: docFilterCounts['expiring-soon'], isAlert: true },
        { key: 'recently-updated', label: 'Recently updated', count: docFilterCounts['recently-updated'] },
        { key: 'unlinked', label: 'Unattached', count: docFilterCounts['unlinked'] },
        { key: 'shared' as any, label: 'Shared', count: docFilterCounts['shared'] },
    ], [docFilterCounts])

    return (
        <div className="flex flex-col flex-1 gap-[var(--spacing-5)] pt-9 px-[var(--spacing-6)] pb-[var(--spacing-5)] max-w-[1120px] w-full mx-auto">
            {/* Contextual overrides */}
            <style>{`
                .docs-cards-grid.cards-grid { margin-top: 0; }
                .docs-cards-grid .card__image:has(.react-pdf__Document) { align-items: flex-start; }
                .docs-dropdown .chat-input::placeholder { color: transparent; }
            `}</style>

            {/* ── Header ── */}
            <>
                {docsSubView === 'collection-detail' && currentCollection ? (
                    <ContentHeader
                        title={currentCollection.label}
                        itemCount={collectionDocs.length}
                        onActionClick={() => {}}
                        actionLabel="Upload"
                        actionIcon={IconUpload}
                        breadcrumb={{ label: 'Documents', onClick: handleBackToHome }}
                        secondaryAction={{ label: 'Actions', onClick: () => {}, icon: IconChevronDown }}
                    />
                ) : docsSubView === 'all-collections' ? (
                    <ContentHeader
                        title="All Collections"
                        itemCount={collections.length}
                        breadcrumb={{ label: 'Documents', onClick: handleBackToHome }}
                        secondaryAction={{ label: 'New collection', onClick: () => setIsNewCollectionOpen(prev => !prev), buttonRef: newCollBtnRef }}
                    />
                ) : (
                    <ContentHeader
                        title="Documents"
                        itemCount={thorntonDocuments.length}
                        onActionClick={() => {}}
                        actionLabel="Upload"
                        actionIcon={IconUpload}
                        secondaryAction={{ label: 'New collection', onClick: () => setIsNewCollectionOpen(prev => !prev), buttonRef: newCollBtnRef }}
                    />
                )}
                <div className="sticky top-[calc(-1*var(--spacing-4))] z-10 bg-[var(--color-white)] pt-[var(--spacing-4)] -mt-[var(--spacing-5)] pb-[var(--spacing-4)] [&>*]:mt-0">
                    <CatalogToolbar
                        activeView={activeView}
                        onViewChange={setActiveView}
                        activeOrgs={[]}
                        onOrgsChange={() => {}}
                        activeCategory={activeType}
                        onCategoryChange={setActiveType}
                        dropdownItems={DOC_TYPE_ITEMS}
                        dropdownLabel="Type"
                        viewOptions={docsSubView === 'all-collections' ? null : ['list', 'grid']}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder="Search documents…"
                        quickFilterItems={docQuickFilterItems}
                        activeQuickFilters={activeQuickFilters}
                        onQuickFilterChange={toggleQuickFilter}
                    />
                </div>
            </>

            {/* ── All Collections dedicated view ── */}
            {docsSubView === 'all-collections' && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[var(--spacing-4)]">
                    {filteredCollections.map(col => (
                        <CollectionCard
                            key={col.key}
                            label={col.label}
                            icon={col.icon}
                            count={col.docIds.length}
                            countLabel={col.docIds.length === 1 ? 'document' : 'documents'}
                            description={col.description}
                            priorityStatus={col.priorityStatus}
                            onClick={() => handleOpenCollection(col.key)}
                        />
                    ))}
                </div>
            )}

            {/* ── Collection drill-in ── */}
            {docsSubView === 'collection-detail' && collectionDocs.length > 0 && activeView === 'grid' && (
                <div className={`cards-grid docs-cards-grid${!isChatOpen ? ' cards-grid--wide' : ''}`}>
                    {collectionDocs.map(doc => (
                        <DocumentCard key={doc.id} doc={doc} onClick={() => handleDocClick(doc)} />
                    ))}
                </div>
            )}
            {docsSubView === 'collection-detail' && collectionDocs.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-[var(--spacing-3)] flex-1 text-center min-h-[400px]">
                    <Icons.IconFolderOpen size={32} stroke={1.2} color="var(--color-neutral-11)" />
                    <h3 className="text-[16px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] m-0">No documents yet</h3>
                    <p className="text-sm text-[var(--color-neutral-11)] max-w-[340px] m-0 leading-[1.5]">
                        Upload documents to this collection to keep related files organized and easy to find.
                    </p>
                </div>
            )}
            {docsSubView === 'collection-detail' && activeView === 'list' && (
                <div className="list-view">
                    <table className="list-table">
                        <thead>
                            <tr className="list-header-row">
                                <th className="list-header-cell" style={{ minWidth: 180 }}>Name</th>
                                <th className="list-header-cell" style={{ minWidth: 200 }}>Description</th>
                                <th className="list-header-cell">Attached To</th>
                                <th className="list-header-cell">Uploaded By</th>
                                <th className="list-header-cell">Uploaded On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collectionDocs.map((doc, i) => (
                                <DocumentRow key={doc.id} doc={doc} index={i} onClick={() => handleDocClick(doc)} hideType />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Home: Collections + All Documents ── */}
            {docsSubView === 'home' && (
                <div className="flex flex-col gap-[var(--spacing-5)] flex-1 min-h-0">
                    {/* Collections */}
                    {filteredCollections.length > 0 && (
                        <div className="flex flex-col gap-[var(--spacing-2)]">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-[var(--font-weight-medium)] text-[var(--color-neutral-9)]">Collections</span>
                                <button
                                    className="flex items-center gap-0.5 text-[13px] font-[var(--font-weight-semibold)] text-[var(--color-accent-9)] bg-transparent border-none rounded-[var(--radius-md)] cursor-pointer px-2.5 py-[4px] transition-[background,color] duration-150 hover:bg-[var(--color-blue-1)]"
                                    onClick={() => setDocsSubView('all-collections')}
                                >
                                    <span>Show all</span>
                                    <IconChevronRight size={14} stroke={2} />
                                </button>
                            </div>
                            <div className={`grid ${isChatOpen ? 'grid-cols-3' : 'grid-cols-4'} gap-[var(--spacing-4)]`}>
                                {filteredCollections.slice(0, isChatOpen ? 3 : MAX_VISIBLE_COLLECTIONS).map(col => (
                                    <CollectionCard
                                        key={col.key}
                                        label={col.label}
                                        icon={col.icon}
                                        count={col.docIds.length}
                                        countLabel={col.docIds.length === 1 ? 'document' : 'documents'}
                                        description={col.description}
                                        priorityStatus={col.priorityStatus}
                                        onClick={() => handleOpenCollection(col.key)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Documents */}
                    <div className="flex flex-col gap-[var(--spacing-3)] flex-1 min-h-0 [&>.cards-grid]:mt-0 [&>.list-view]:mt-0 [&>.list-view]:pt-0">
                        {filteredCollections.length > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-[var(--font-weight-medium)] text-[var(--color-neutral-9)]">All Documents</span>
                            </div>
                        )}
                        {activeView === 'grid' && (
                            <div className={`cards-grid docs-cards-grid${!isChatOpen ? ' cards-grid--wide' : ''}`}>
                                {allFilteredDocs.map(doc => (
                                    <DocumentCard key={doc.id} doc={doc} onClick={() => handleDocClick(doc)} />
                                ))}
                            </div>
                        )}
                        {activeView === 'list' && (
                            <div className="list-view">
                                <table className="list-table">
                                    <thead>
                                        <tr className="list-header-row">
                                            <th className="list-header-cell" style={{ minWidth: 180 }}>Name</th>
                                            <th className="list-header-cell" style={{ minWidth: 200 }}>Description</th>
                                            <th className="list-header-cell">Attached To</th>
                                            <th className="list-header-cell">Uploaded By</th>
                                            <th className="list-header-cell">Uploaded On</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allFilteredDocs.map((doc, i) => (
                                            <DocumentRow key={doc.id} doc={doc} index={i} onClick={() => handleDocClick(doc)} hideType />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <DocumentDetailPanel
                doc={selectedDoc}
                isOpen={isDocPanelOpen}
                onClose={handleDocPanelClose}
                isTrustDoc={activeCollection === 'trust-documents'}
                onViewTimeline={onNavigateToTimeline}
            />

            {isNewCollectionOpen && createPortal(
                <div ref={dropdownRef} className="docs-dropdown w-[424px] bg-white border border-[var(--color-gray-4)] rounded-[var(--radius-2xl)] shadow-[0_24px_80px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] animate-[notif-dropdown-in_0.22s_cubic-bezier(0.16,1,0.3,1)] origin-top-right p-[var(--spacing-5)] flex flex-col gap-[var(--spacing-5)]" style={getDropdownStyle()}>
                    <div className="flex items-center gap-4">
                        <img className="w-[52px] h-[52px] rounded-full shrink-0" src={fojoMascotSmall} alt="Fojo" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[15px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] leading-[1.4]">Create smart collection</span>
                            <span className="text-sm text-[var(--color-neutral-11)] leading-[1.5]">Describe what to group – Fojo will find and add matching documents automatically.</span>
                        </div>
                    </div>
                    <div className="chat-footer rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] flex w-full pt-[var(--spacing-4)] px-[var(--spacing-3)] pb-[var(--spacing-3)] flex-col bg-[var(--color-white)] focus-within:border-[var(--color-purple)] focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ marginTop: 0 }}>
                        <div className="w-full cursor-text" style={{ position: 'relative' }}>
                            {!collectionPrompt && (
                                <span className={`absolute top-0 left-0 right-0 px-[var(--spacing-2)] text-sm text-[var(--color-neutral-8)] leading-[1.47] pointer-events-none transition-opacity duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis${placeholder.isVisible ? '' : ' opacity-0'}`}>
                                    {placeholder.text}
                                </span>
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                className="chat-input w-full border-none outline-none font-sans text-sm text-[var(--color-gray-12)] bg-transparent px-[var(--spacing-2)] py-0 leading-[1.47] block"
                                value={collectionPrompt}
                                onChange={e => setCollectionPrompt(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCollection() } }}
                                autoFocus
                            />
                        </div>
                        <div className="flex mt-[var(--spacing-4)] w-full items-center justify-between">
                            <button className="p-[6px] rounded-[var(--radius-md)] flex items-center transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]">
                                <Icons.IconAt size={18} stroke={2} color="var(--color-neutral-11)" />
                            </button>
                            <button
                                className="flex items-center justify-center gap-[var(--spacing-1)] rounded-[var(--radius-md)] border border-[var(--color-accent-9)] bg-[var(--color-accent-9)] min-h-[32px] px-3.5 py-[4px] text-[13px] font-[var(--font-weight-semibold)] leading-[1.43] text-[var(--color-accent-contrast)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={!collectionPrompt.trim()}
                                onClick={handleCreateCollection}
                            >
                                <span>Create</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
