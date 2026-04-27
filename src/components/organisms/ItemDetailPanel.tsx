import { useState, useRef, useEffect, useMemo } from 'react'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { createPortal } from 'react-dom'
import { IconChevronRight, IconPencil, IconTrash, IconPlus, IconExternalLink, IconFolder } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/atoms/ConfirmDialog'
import { showToast } from '@/components/atoms/Toast'
import { SourcesTabContent } from '@/components/molecules/SourcesTabContent'
import { ItemEditForm } from '@/components/molecules/ItemEditForm'
import { OwnershipTree } from '@/components/molecules/OwnershipTree'
import { ConnectionsGraph } from '@/components/molecules/ConnectionsGraph'
import { DetailPanelShell, DetailTabs } from '@/components/molecules/DetailPanelShell'
import { getOwnershipPath, isHierarchyRelationship } from '@/lib/helpers/ownership-chain'
import type { AnyCatalogItem, Relationship } from '@/data/types'

interface ItemDetailPanelProps {
    item: AnyCatalogItem | null
    path?: string[]
    isOpen: boolean
    onClose: () => void
    onNavigate?: (id: string) => void
    onBreadcrumbClick?: (index: number) => void
    getItemById?: (id: string) => AnyCatalogItem | null
    relationships?: Relationship[]
    onDeleteItem?: (id: string) => void
    onUpdateItem?: (id: string, updates: Partial<AnyCatalogItem>) => void
    onCreateCollection?: (item: AnyCatalogItem) => void
    onOpenFullRecord?: (id: string) => void
    onAddRelationship?: (item: AnyCatalogItem) => void
    openInEditMode?: boolean
    onEditModeActivated?: () => void
    hideOverlay?: boolean
}

export function ItemDetailPanel({ item, path = [], isOpen, onClose, onNavigate, onBreadcrumbClick, getItemById, relationships: allRelationships = [], onDeleteItem, onUpdateItem, onCreateCollection, onOpenFullRecord, openInEditMode, onEditModeActivated, hideOverlay }: ItemDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<string>('sources')
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<Record<string, unknown>>({})
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
    const ellipsisBtnRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const closeBtnRef = useRef<HTMLButtonElement>(null)
    const previousFocusRef = useRef<Element | null>(null)

    const openInEditModeRef = useRef(openInEditMode)
    openInEditModeRef.current = openInEditMode

    useEffect(() => {
        if (openInEditModeRef.current && item) {
            setEditForm({ ...(item as unknown as Record<string, unknown>) })
            setIsEditing(true)
            onEditModeActivated?.()
        } else {
            setIsEditing(false)
            setEditForm({})
        }
        setIsDeleteDialogOpen(false)
        setActiveTab('sources')
        setActiveRelTab('connections')
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item?.id])

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement
            setTimeout(() => closeBtnRef.current?.focus(), 100)
        } else if (previousFocusRef.current instanceof HTMLElement) {
            previousFocusRef.current.focus()
            previousFocusRef.current = null
        }
    }, [isOpen])

    useClickOutside([ellipsisBtnRef, dropdownRef], () => setDropdownOpen(false), dropdownOpen)

    const ownershipChain = useMemo(
        () => item ? getOwnershipPath(item.id, getItemById ?? (() => null)) : [],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [item?.id, getItemById],
    )

    const itemRelationships = useMemo(
        () => item ? allRelationships.filter(r => r.from === item.id || r.to === item.id) : [],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [item?.id, allRelationships],
    )
    const nonHierarchyCount = itemRelationships.filter(r => !isHierarchyRelationship(r)).length
    const hasConnections = nonHierarchyCount > 0
    const hasOwnership = ownershipChain.length > 1
    const [activeRelTab, setActiveRelTab] = useState<'connections' | 'ownership'>('connections')

    if (!item) return null

    const breadcrumbPath = path.length > 0 ? path : [item.id]
    const COLLAPSE_THRESHOLD = 3
    const isCollapsed = breadcrumbPath.length + 1 > COLLAPSE_THRESHOLD
    const hiddenIndices = isCollapsed ? breadcrumbPath.slice(0, -2) : []
    const parentId = isCollapsed && breadcrumbPath.length >= 2 ? breadcrumbPath[breadcrumbPath.length - 2] : null
    const getItemName = (id: string) => getItemById?.(id)?.name ?? 'Item'

    const handleEllipsisClick = () => {
        if (ellipsisBtnRef.current) {
            const rect = ellipsisBtnRef.current.getBoundingClientRect()
            setDropdownPos({ top: rect.bottom + 4, left: rect.left })
        }
        setDropdownOpen(v => !v)
    }

    const handleStartEdit = () => { setEditForm({ ...item }); setIsEditing(true) }
    const handleCancelEdit = () => { setIsEditing(false); setEditForm({}) }
    const handleSaveEdit = () => {
        if (onUpdateItem) { onUpdateItem(item.id, editForm); showToast('Changes saved') }
        setIsEditing(false); setEditForm({})
    }
    const handleDelete = () => {
        if (onDeleteItem) { onDeleteItem(item.id); showToast(`${item.name} deleted`) }
        setIsDeleteDialogOpen(false); onClose()
    }
    const updateField = (key: string, value: string | number | undefined) => {
        setEditForm(prev => ({ ...prev, [key]: value }))
    }

    return (
        <>
            <DetailPanelShell
                isOpen={isOpen}
                onClose={onClose}
                hideOverlay={hideOverlay}
                ariaLabel={`Asset details for ${item.name}`}
                closeButtonRef={closeBtnRef}
                breadcrumbs={
                    isEditing ? (
                        <h2 style={{ fontSize: '16px', fontWeight: 800 }}>Editing</h2>
                    ) : (
                        <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
                            <span className="detail-breadcrumb-segment">
                                <button type="button" className="detail-breadcrumb-item detail-breadcrumb-item--root" onClick={() => (onBreadcrumbClick ? onBreadcrumbClick(0) : onClose())}>
                                    Assets
                                </button>
                            </span>

                            {isCollapsed ? (
                                <>
                                    <span className="detail-breadcrumb-segment">
                                        <IconChevronRight size={14} stroke={2} className="detail-breadcrumb-separator" />
                                        <button ref={ellipsisBtnRef} type="button" className="detail-breadcrumb-item detail-breadcrumb-item--ellipsis" onClick={handleEllipsisClick} aria-expanded={dropdownOpen} aria-haspopup="true">
                                            …
                                        </button>
                                        {dropdownOpen && createPortal(
                                            <div ref={dropdownRef} className="detail-breadcrumb-dropdown" style={{ top: dropdownPos.top, left: dropdownPos.left }}>
                                                {hiddenIndices.map((id, idx) => (
                                                    <button key={id} type="button" className="detail-breadcrumb-dropdown-item" onClick={() => { onBreadcrumbClick?.(idx + 1); setDropdownOpen(false) }}>
                                                        {getItemName(id)}
                                                    </button>
                                                ))}
                                            </div>,
                                            document.body
                                        )}
                                    </span>
                                    {parentId && (
                                        <span className="detail-breadcrumb-segment">
                                            <IconChevronRight size={14} stroke={2} className="detail-breadcrumb-separator" />
                                            <button type="button" className="detail-breadcrumb-item" onClick={() => onBreadcrumbClick?.(breadcrumbPath.length - 1)} title={getItemName(parentId)}>
                                                {getItemName(parentId)}
                                            </button>
                                        </span>
                                    )}
                                </>
                            ) : (
                                breadcrumbPath.slice(0, -1).map((id, index) => (
                                    <span key={id} className="detail-breadcrumb-segment">
                                        <IconChevronRight size={14} stroke={2} className="detail-breadcrumb-separator" />
                                        <button type="button" className="detail-breadcrumb-item" onClick={() => onBreadcrumbClick?.(index + 1)} title={getItemName(id)}>
                                            {getItemName(id)}
                                        </button>
                                    </span>
                                ))
                            )}

                            <span className="detail-breadcrumb-segment detail-breadcrumb-segment--truncate">
                                <IconChevronRight size={14} stroke={2} className="detail-breadcrumb-separator" />
                                <span className="detail-breadcrumb-item detail-breadcrumb-item--current" title={item.name}>{item.name}</span>
                            </span>
                        </nav>
                    )
                }
                headerActions={!isEditing ? (
                    <>
                        <button className="p-2 rounded-[var(--radius-md)] text-[var(--color-neutral-11)] transition-[background,color] duration-150 hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-gray-12)]" onClick={handleStartEdit} title="Edit">
                            <IconPencil size={16} stroke={2} />
                        </button>
                        <button className="p-2 rounded-[var(--radius-md)] text-[var(--color-neutral-11)] transition-[background,color] duration-150 hover:bg-[var(--color-red-1)] hover:text-[var(--color-red-9)]" onClick={() => setIsDeleteDialogOpen(true)} title="Delete">
                            <IconTrash size={16} stroke={2} />
                        </button>
                    </>
                ) : undefined}
                footer={isEditing ? (
                    <div className="shrink-0 flex items-center justify-end gap-[var(--spacing-2)] py-[var(--spacing-4)] pr-[var(--spacing-5)] pb-6 pl-4 border-t border-[var(--color-gray-4)]">
                        <button className="px-5 py-2 rounded-[var(--radius-md)] text-sm font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] border border-[var(--color-gray-4)] transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]" onClick={handleCancelEdit}>Cancel</button>
                        <button className="px-5 py-2 rounded-[var(--radius-md)] text-sm font-[var(--font-weight-semibold)] text-[var(--color-accent-contrast)] bg-[var(--color-accent-9)] border border-[var(--color-accent-9)] transition-opacity duration-150 hover:opacity-90" onClick={handleSaveEdit}>Save changes</button>
                    </div>
                ) : undefined}
            >
                {isEditing ? (
                    <div>
                        <h3 className="text-[13px] font-[var(--font-weight-bold)] uppercase tracking-[0.05em] text-[var(--color-neutral-11)] mb-[var(--spacing-4)] border-b border-[var(--color-gray-4)] pb-[var(--spacing-2)]">Details</h3>
                        <div className="flex flex-col gap-[var(--spacing-4)]">
                            <ItemEditForm item={item} editForm={editForm} updateField={updateField} mode="edit" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="detail-title-section mb-[var(--spacing-6)]">
                            {item.imageUrl && (
                                <div className="detail-image w-20 h-20 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-neutral-3)] shrink-0">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <button className="detail-name-link" title="Open full record" onClick={() => { onOpenFullRecord?.(item.id); onClose() }}>
                                    <h2 className="detail-name font-display text-[24px] font-[var(--font-weight-bold)] leading-[1.2] [-webkit-text-stroke:0.3px_currentColor] whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{item.name}</h2>
                                    <IconExternalLink size={24} stroke={2} className="detail-name-link__icon" />
                                </button>
                                {item.description && (
                                    <p className="detail-description text-sm leading-[1.6] text-[var(--color-neutral-11)] mt-[var(--spacing-3)] line-clamp-2">{item.description}</p>
                                )}
                            </div>
                        </div>

                        <DetailTabs
                            tabs={[{ key: 'sources', label: 'Sources' }, { key: 'overview', label: 'Overview' }]}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />

                        {activeTab === 'sources' && <SourcesTabContent itemId={item.id} />}

                        {activeTab === 'overview' && (
                            <>
                                <div>
                                    <h3 className="text-[13px] font-[var(--font-weight-bold)] uppercase tracking-[0.05em] text-[var(--color-neutral-11)] mb-[var(--spacing-4)] border-b border-[var(--color-gray-4)] pb-[var(--spacing-2)]">Details</h3>
                                    <div className="grid grid-cols-2 gap-[var(--spacing-5)]">
                                        <ItemEditForm item={item} editForm={editForm} updateField={updateField} mode="view" />
                                    </div>
                                </div>

                                {itemRelationships.length > 0 && (
                                    <div className="mt-[var(--spacing-8)]">
                                        <div className="flex items-center justify-between mb-[var(--spacing-4)] border-b border-[var(--color-gray-4)] pb-[var(--spacing-2)]">
                                            <h3 className="text-[13px] font-[var(--font-weight-bold)] uppercase tracking-[0.05em] text-[var(--color-neutral-11)] m-0">Relationships</h3>
                                            <div className="flex items-center gap-0.5 bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-lg)] p-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                                                <button
                                                    className={cn(
                                                        'h-6 px-1.5 py-0.5 border-none rounded-[var(--radius-sm)] bg-transparent text-[11px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] cursor-pointer transition-colors duration-150 whitespace-nowrap leading-4 hover:bg-[var(--color-neutral-3)]',
                                                        activeRelTab === 'connections' && 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)] font-medium hover:bg-[var(--color-accent-3)]',
                                                    )}
                                                    onClick={() => setActiveRelTab('connections')}
                                                >
                                                    Connections <span className="ml-0.5 opacity-60">{nonHierarchyCount}</span>
                                                </button>
                                                <button
                                                    className={cn(
                                                        'h-6 px-1.5 py-0.5 border-none rounded-[var(--radius-sm)] bg-transparent text-[11px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] cursor-pointer transition-colors duration-150 whitespace-nowrap leading-4 hover:bg-[var(--color-neutral-3)]',
                                                        activeRelTab === 'ownership' && 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)] font-medium hover:bg-[var(--color-accent-3)]',
                                                    )}
                                                    onClick={() => setActiveRelTab('ownership')}
                                                >
                                                    Ownership <span className="ml-0.5 opacity-60">{ownershipChain.length > 1 ? ownershipChain.length : 0}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relationships-graph relative" style={{ height: 400 }}>
                                            {hasConnections && (
                                                <div style={{ width: '100%', height: '100%', display: activeRelTab === 'connections' ? 'block' : 'none' }}>
                                                    <ConnectionsGraph currentItem={item} relationships={itemRelationships} getItemById={getItemById ?? (() => null)} onItemClick={(clickedItem) => onNavigate?.(clickedItem.id)} />
                                                </div>
                                            )}
                                            {hasOwnership && (
                                                <div style={{ width: '100%', height: '100%', display: activeRelTab === 'ownership' ? 'block' : 'none' }}>
                                                    <OwnershipTree chain={ownershipChain} currentItemId={item.id} relationships={allRelationships} onItemClick={(clickedItem) => onNavigate?.(clickedItem.id)} />
                                                </div>
                                            )}
                                            {activeRelTab === 'connections' && !hasConnections && (
                                                <div className="flex flex-col items-center justify-center h-full gap-1.5 text-center">
                                                    <p className="text-xs text-[var(--color-neutral-9)] m-0">No connections yet</p>
                                                </div>
                                            )}
                                            {activeRelTab === 'ownership' && !hasOwnership && (
                                                <div className="flex flex-col items-center justify-center h-full gap-1.5 text-center">
                                                    <p className="text-xs text-[var(--color-neutral-9)] m-0">No ownership chain</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-[var(--spacing-8)]">
                                    <h3 className="text-[13px] font-[var(--font-weight-bold)] uppercase tracking-[0.05em] text-[var(--color-neutral-11)] mb-[var(--spacing-4)] border-b border-[var(--color-gray-4)] pb-[var(--spacing-2)]">Documents</h3>
                                    <div className="flex flex-col items-center gap-[var(--spacing-2)] px-[var(--spacing-4)] py-[var(--spacing-6)] text-center">
                                        <IconFolder size={20} stroke={1.5} className="text-[var(--color-neutral-11)]" />
                                        <p className="text-[13px] text-[var(--color-neutral-11)] m-0">No document collection for this item</p>
                                        <p className="text-xs text-[var(--color-neutral-9)] m-0 leading-[1.45]">Create a smart collection and Fojo will find all related documents.</p>
                                        <button className="relationships-add-btn" onClick={() => item && onCreateCollection?.(item)}>
                                            <IconPlus size={13} stroke={2.5} />
                                            Create collection
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </DetailPanelShell>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                title={`Delete ${item.name}?`}
                message="This action cannot be undone. All data associated with this item will be permanently removed."
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteDialogOpen(false)}
            />
        </>
    )
}
