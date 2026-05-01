import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
    IconChevronDown,
    IconChevronRight,
    IconChevronLeft,
    IconShare,
    IconHistory,
    IconMessage,
    IconUpload,
    IconDots,
    IconFileText,
    IconTable,
    IconSettings,
    IconX,
    IconPlus,
    IconArrowsMaximize,
    IconLink,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { DETAIL_REQUIRED_FIELD_LABELS, getItemFields } from '@/lib/helpers/item-detail-fields'
import { getCitationsForItem } from '@/data/citations'
import { getFieldSource } from '@/data/field-sources'
import { FieldSourceIcon } from '@/components/atoms/FieldSourceIcon'
import { OwnershipTree } from '@/components/molecules/OwnershipTree'
import { ConnectionsGraph } from '@/components/molecules/ConnectionsGraph'
import { ItemDetailPanel } from '@/components/organisms/ItemDetailPanel'
import { MapToolbar } from '@/components/molecules/MapToolbar'
import { getOwnershipPath, isHierarchyRelationship } from '@/lib/helpers/ownership-chain'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import type { CardActionType } from '@/components/molecules/CardActionsMenu'
import type { PromptAnchorRect } from '@/lib/helpers/prompt-anchor'
import type { AnyCatalogItem, Relationship } from '@/data/types'

/* ── Helpers ── */

function getAttachments(itemId: string) {
    const groups = getCitationsForItem(itemId)
    const docs: { name: string; detail: string; type: 'pdf' | 'csv' | 'doc' }[] = []
    groups.forEach((_citations, docName) => {
        const ext = docName.split('.').pop()?.toLowerCase()
        docs.push({
            name: docName,
            detail: 'Uploaded by Sandra Whitfield on Mar 15, 2026',
            type: ext === 'csv' ? 'csv' : ext === 'doc' || ext === 'docx' ? 'doc' : 'pdf',
        })
    })
    return docs
}

/* ── Component ── */

interface AssetDetailPageProps {
    item: AnyCatalogItem
    relationships: Relationship[]
    getItemById: (id: string) => AnyCatalogItem | null
    onBack: () => void
    onNavigate: (id: string) => void
    onActionRequest?: (item: AnyCatalogItem, action: CardActionType, anchor?: PromptAnchorRect | null) => void
    isGraphExpanded?: boolean
    onGraphExpandChange?: (expanded: boolean) => void
}

export function AssetDetailPage({ item, relationships, getItemById, onBack, onNavigate, onActionRequest, isGraphExpanded = false, onGraphExpandChange }: AssetDetailPageProps) {
    const [showAllFields, setShowAllFields] = useState(false)
    const fields = getItemFields(item)
    const attachments = getAttachments(item.id)
    const VISIBLE_FIELDS = 6

    // Inline editing (ephemeral — resets on page load)
    const [editedFields, setEditedFields] = useState<Record<string, string>>({})
    const [editingField, setEditingField] = useState<string | null>(null)
    const [editingWidth, setEditingWidth] = useState<number>(0)
    const [editingMaxWidth, setEditingMaxWidth] = useState<number>(0)
    const [editedDescription, setEditedDescription] = useState<string | null>(null)
    const [editingDescription, setEditingDescription] = useState(false)
    const measureRef = useRef<HTMLSpanElement>(null)

    // Add custom fields
    const [addedFields, setAddedFields] = useState<{ label: string; value: string }[]>([])
    const [isAddingField, setIsAddingField] = useState(false)
    const addFieldBtnRef = useRef<HTMLButtonElement>(null)

    const detailsRef = useRef<HTMLDivElement>(null)
    const descriptionRef = useRef<HTMLDivElement>(null)
    const galleryRef = useRef<HTMLDivElement>(null)
    const attachmentsRef = useRef<HTMLDivElement>(null)
    const [activeTab, setActiveTab] = useState('details')

    const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, tab: string) => {
        setActiveTab(tab)
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Reset ephemeral state on item navigation
    useEffect(() => {
        setEditedFields({})
        setAddedFields([])
        setIsAddingField(false)
        setShowAllFields(false)
        setEditingField(null)
        setEditedDescription(null)
        setActiveRelTab('connections')
    }, [item.id])

    const itemRelationships = relationships.filter(r => r.from === item.id || r.to === item.id)
    const ownershipChain = useMemo(() => getOwnershipPath(item.id, getItemById), [item.id, getItemById])
    const nonHierarchyCount = itemRelationships.filter(r => !isHierarchyRelationship(r)).length
    const hasConnections = nonHierarchyCount > 0
    const hasOwnership = ownershipChain.length > 1
    const [activeRelTab, setActiveRelTab] = useState<'connections' | 'ownership'>('connections')
    const [sidebarItemId, setSidebarItemId] = useState<string | null>(null)
    const [expandSearchQuery, setExpandSearchQuery] = useState('')
    const [expandCategory, setExpandCategory] = useState<string[]>([])
    const setIsGraphExpanded = useCallback((v: boolean | ((prev: boolean) => boolean)) => {
        onGraphExpandChange?.(typeof v === 'function' ? v(isGraphExpanded) : v)
    }, [isGraphExpanded, onGraphExpandChange])

    // Adapt card actions for the detail page context
    const handleCardAction = useCallback((actionItem: AnyCatalogItem, action: CardActionType, anchor?: PromptAnchorRect | null) => {
        if (action === 'open-detail' || action === 'view-source' || action === 'edit-fields') {
            // Open sidebar instead of navigating away
            setSidebarItemId(actionItem.id)
            return
        }
        // Forward AI actions to App.tsx handler
        onActionRequest?.(actionItem, action, anchor)
    }, [onActionRequest])

    // Always show both tabs (user feedback: show empty state for empty tab)
    const effectiveRelTab = activeRelTab

    const allFields = [...fields, ...addedFields.map(f => ({ label: f.label, value: f.value }))]
    const visibleFields = showAllFields ? allFields : allFields.slice(0, VISIBLE_FIELDS)
    const leftFields = visibleFields.filter((_, i) => i % 2 === 0)
    const rightFields = visibleFields.filter((_, i) => i % 2 === 1)

    // Gallery
    const allImages = [
        ...(item.imageUrl ? [item.imageUrl] : []),
        ...(item.galleryImages || []),
    ]
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const closeLightbox = useCallback(() => setLightboxIndex(null), [])
    const prevImage = useCallback(() => setLightboxIndex(i => i !== null ? (i - 1 + allImages.length) % allImages.length : null), [allImages.length])
    const nextImage = useCallback(() => setLightboxIndex(i => i !== null ? (i + 1) % allImages.length : null), [allImages.length])

    useEffect(() => {
        if (lightboxIndex === null) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox()
            else if (e.key === 'ArrowLeft') prevImage()
            else if (e.key === 'ArrowRight') nextImage()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [lightboxIndex, closeLightbox, prevImage, nextImage])

    return (
        <>
            {/* Expanded full-screen graph — always mounted, toggled with display */}
            <div className="relationships-graph" style={{ position: 'absolute', inset: 0, zIndex: 1, border: 'none', borderRadius: 0, display: isGraphExpanded ? 'block' : 'none' }}>
                    {/* Toolbar at top-left */}
                    <div className="absolute top-3 left-3 z-10">
                        <MapToolbar
                            activeCategory={expandCategory}
                            onCategoryChange={setExpandCategory}
                            searchQuery={expandSearchQuery}
                            onSearchChange={setExpandSearchQuery}
                        />
                    </div>
                    {/* Close button at top-right — hidden when sidebar is open */}
                    {!sidebarItemId && (
                        <button
                            className="absolute top-3 right-3 z-10 flex items-center justify-center gap-[var(--spacing-2)] h-8 px-[var(--spacing-3)] py-0.5 !bg-[#ef4444] !text-white !border-[#ef4444] border rounded-[var(--radius-md)] shadow-[var(--shadow-subtle)] text-[13px] font-[var(--font-weight-medium)] leading-[1.54] whitespace-nowrap transition-colors duration-150 hover:!bg-[#dc2626] cursor-pointer"
                            onClick={() => { setIsGraphExpanded(false); setExpandSearchQuery(''); setExpandCategory([]) }}
                        >
                            <IconX size={16} stroke={2} />
                            <span>Close</span>
                        </button>
                    )}
                    {/* Graphs */}
                    {hasConnections && (
                        <div style={{ width: '100%', height: '100%', display: effectiveRelTab === 'connections' ? 'block' : 'none' }}>
                            <ConnectionsGraph
                                currentItem={item}
                                relationships={itemRelationships}
                                getItemById={getItemById}
                                onItemClick={(clickedItem) => { if (clickedItem.id !== item.id) setSidebarItemId(clickedItem.id) }}
                                onAction={handleCardAction}
                                sidebarOpen={sidebarItemId != null}
                            />
                        </div>
                    )}
                    {hasOwnership && (
                        <div style={{ width: '100%', height: '100%', display: effectiveRelTab === 'ownership' ? 'block' : 'none' }}>
                            <OwnershipTree
                                chain={ownershipChain}
                                currentItemId={item.id}
                                relationships={relationships}
                                onItemClick={(clickedItem) => { if (clickedItem.id !== item.id) setSidebarItemId(clickedItem.id) }}
                                onAction={handleCardAction}
                                sidebarOpen={sidebarItemId != null}
                            />
                        </div>
                    )}
                </div>
                {sidebarItemId != null && createPortal(
                    <ItemDetailPanel
                        item={getItemById(sidebarItemId)}
                        isOpen
                        onClose={() => setSidebarItemId(null)}
                        onNavigate={(id) => setSidebarItemId(id)}
                        getItemById={getItemById}
                        relationships={relationships}
                        onOpenFullRecord={(id) => { setSidebarItemId(null); onNavigate(id) }}
                        hideOverlay
                    />,
                    document.body,
                )}

            {/* Normal page content — hidden when expanded */}
            <div className="flex flex-col flex-1 w-full max-w-[920px] px-[var(--spacing-6)] pt-[24px] pb-[var(--spacing-5)] mx-auto animate-[chat-area-in_0.25s_ease-out_both]" style={{ display: isGraphExpanded ? 'none' : undefined }}>
            <span ref={measureRef} className="absolute invisible whitespace-nowrap text-sm font-[var(--font-weight-medium)] pointer-events-none" aria-hidden="true" />
            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4 pt-3 pb-5 overflow-hidden">
                <div className="flex items-center gap-2 font-display text-[28px] font-black leading-[1.25] tracking-[-0.02em] [-webkit-text-stroke:0.3px_currentColor] min-w-0">
                    <button className="text-[var(--color-neutral-9)] bg-none border-none font-[inherit] font-black cursor-pointer transition-colors duration-150 p-0 hover:text-[var(--color-gray-12)]" onClick={onBack}>Assets</button>
                    <IconChevronRight size={18} stroke={2} className="text-[var(--color-neutral-9)] shrink-0" />
                    <span className="text-[var(--color-gray-12)] overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Shared avatars */}
                    <div className="flex items-center pr-1">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-white)] flex items-center justify-center -mr-1 text-[11px] font-medium text-[var(--color-white)] shrink-0 bg-[#bea887]">
                            <span>SW</span>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-white)] flex items-center justify-center -mr-1 text-[11px] font-medium text-[var(--color-white)] shrink-0 bg-[var(--color-accent-9)]">
                            <span>MC</span>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-white)] flex items-center justify-center -mr-1 text-xs font-[var(--font-weight-medium)] shrink-0 bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)]">
                            <span>+4</span>
                        </div>
                    </div>
                    <div className="w-0.5 h-3 bg-[var(--color-gray-4)] shrink-0" />
                    <div className="flex items-center gap-1.5">
                        <button className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-[var(--color-white)] text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 relative hover:bg-[var(--color-neutral-3)]"><IconShare size={18} stroke={1.75} /></button>
                        <button className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-[var(--color-white)] text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 relative hover:bg-[var(--color-neutral-3)]"><IconHistory size={18} stroke={1.75} /></button>
                        <button className="detail-page__icon-btn--notif flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] border border-[var(--color-neutral-5)] bg-[var(--color-white)] text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 relative hover:bg-[var(--color-neutral-3)]">
                            <IconMessage size={18} stroke={1.75} />
                            <span className="detail-page__notif-dot" />
                        </button>
                    </div>
                    <button className="flex items-center gap-1 h-8 pl-4 pr-3 py-0.5 bg-[var(--color-accent-9)] text-white border border-[var(--color-accent-9)] rounded-[var(--radius-md)] text-sm font-medium leading-5 cursor-pointer transition-opacity duration-150 hover:opacity-90">
                        Actions
                        <IconChevronDown size={16} stroke={2} />
                    </button>
                </div>
            </div>

            {/* ── Tab bar (sticky) ── */}
            <div className="sticky top-[calc(-1*var(--spacing-4))] z-10 bg-[var(--color-white)] pt-[var(--spacing-4)] pb-2 -mt-[var(--spacing-4)]">
                <div className="flex items-center justify-between px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-xl)] bg-[var(--color-white)] shadow-[var(--shadow-toolbar)] mb-3">
                    <div className="flex items-center gap-0.5">
                        {[
                            { key: 'details', label: 'Details', ref: detailsRef },
                            { key: 'description', label: 'Description', ref: descriptionRef },
                            ...(allImages.length > 0 ? [{ key: 'gallery', label: 'Gallery', ref: galleryRef }] : []),
                            { key: 'attachments', label: 'Attachments', ref: attachmentsRef },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={cn(
                                    'h-7 px-2 py-0.5 border-none rounded-[var(--radius-md)] bg-transparent text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] cursor-pointer transition-colors duration-150 whitespace-nowrap leading-5 hover:bg-[var(--color-neutral-3)]',
                                    activeTab === tab.key && 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)] font-medium hover:bg-[var(--color-accent-3)]'
                                )}
                                onClick={() => scrollTo(tab.ref, tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center justify-center w-7 h-7 border-none rounded-[var(--radius-md)] bg-transparent text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-neutral-3)]">
                        <IconSettings size={16} stroke={1.75} />
                    </button>
                </div>
            </div>

            {/* ── Sections ── */}
            <div className="flex flex-col gap-10">
                {/* Details */}
                <div className="flex flex-col gap-3 mt-8" ref={detailsRef}>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-base font-medium text-[var(--color-gray-12)] tracking-[-0.016px] leading-6 m-0">Details</h3>
                        <div className="flex gap-4 rounded-xl">
                            {[leftFields, rightFields].map((col, ci) => (
                                <div key={ci} className="flex-1 flex flex-col gap-1 min-w-0 overflow-hidden">
                                    {col.map(f => {
                                        const displayValue = editedFields[f.label] ?? String(f.value)
                                        const isEditing = editingField === f.label
                                        const fieldSource = getFieldSource(item.id, f.label)
                                        return (
                                            <div key={f.label} className="detail-page__kv-row flex items-center gap-1 h-8">
                                                <span className="shrink-0 w-32 text-sm font-[var(--font-weight-regular)] text-[var(--color-neutral-11)] whitespace-nowrap flex items-center gap-1 leading-5">
                                                    {f.label}
                                                    {DETAIL_REQUIRED_FIELD_LABELS.has(f.label) && <span className="text-[var(--color-red-9)] text-xs font-medium">*</span>}
                                                </span>
                                                {isEditing ? (
                                                    <input
                                                        className="h-8 px-3 rounded-[var(--radius-md)] border border-[var(--color-accent-9)] bg-[var(--color-white)] text-sm font-[var(--font-weight-regular)] text-[var(--color-gray-12)] leading-5 outline-none font-[inherit] min-w-0 box-border"
                                                        style={{ width: editingWidth }}
                                                        defaultValue={displayValue}
                                                        autoFocus
                                                        onInput={e => {
                                                            const input = e.currentTarget
                                                            if (measureRef.current) {
                                                                measureRef.current.textContent = input.value || ' '
                                                                const measured = measureRef.current.offsetWidth + 26
                                                                input.style.width = Math.max(editingWidth, Math.min(measured, editingMaxWidth)) + 'px'
                                                            }
                                                        }}
                                                        onBlur={e => {
                                                            setEditingField(null)
                                                            if (e.target.value !== String(f.value)) {
                                                                setEditedFields(prev => ({ ...prev, [f.label]: e.target.value }))
                                                            }
                                                        }}
                                                        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                                                    />
                                                ) : (
                                                    <span
                                                        className="block h-8 px-3 rounded-[var(--radius-md)] bg-[var(--color-gray-2)] text-sm font-[var(--font-weight-regular)] text-[var(--color-gray-12)] whitespace-nowrap overflow-hidden text-ellipsis leading-8 min-w-0 cursor-text transition-colors duration-150 hover:bg-[var(--color-accent-3)]"
                                                        onClick={e => {
                                                            const span = e.currentTarget
                                                            const row = span.closest('.detail-page__kv-row') as HTMLElement
                                                            const label = row?.querySelector('span') as HTMLElement
                                                            const maxW = row ? row.offsetWidth - (label?.offsetWidth ?? 128) - 4 : 300
                                                            setEditingWidth(span.offsetWidth)
                                                            setEditingMaxWidth(maxW)
                                                            setEditingField(f.label)
                                                        }}
                                                    >
                                                        {displayValue}
                                                    </span>
                                                )}
                                                {!isEditing && fieldSource && <FieldSourceIcon source={fieldSource} />}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 relative">
                            {allFields.length > VISIBLE_FIELDS && (
                                <button
                                    className="flex items-center gap-1 h-8 px-3 py-1.5 border-none rounded-[var(--radius-md)] bg-[var(--color-accent-3)] text-sm font-medium text-[var(--color-accent-9)] cursor-pointer transition-colors duration-150 self-start leading-5 hover:bg-[var(--color-blue-hover)]"
                                    onClick={() => setShowAllFields(v => !v)}
                                >
                                    {showAllFields ? 'Show less' : 'Show more'}
                                    <IconChevronDown
                                        size={18} stroke={2}
                                        style={{ transform: showAllFields ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
                                    />
                                </button>
                            )}
                            <button
                                ref={addFieldBtnRef}
                                className="flex items-center gap-1 h-8 px-3 py-1.5 border-none rounded-[var(--radius-md)] bg-[var(--color-accent-3)] text-sm font-medium text-[var(--color-accent-9)] cursor-pointer transition-colors duration-150 self-start leading-5 hover:bg-[var(--color-blue-hover)]"
                                onClick={() => {
                                    setIsAddingField(true)
                                    setShowAllFields(true)
                                }}
                            >
                                <IconPlus size={16} stroke={2} />
                                Add detail
                            </button>
                        </div>
                        {isAddingField && (
                            <AddFieldPopover
                                anchorRef={addFieldBtnRef}
                                onAdd={(label, value) => {
                                    setAddedFields(prev => [...prev, { label, value }])
                                    setEditedFields(prev => ({ ...prev, [label]: value }))
                                    setIsAddingField(false)
                                }}
                                onClose={() => setIsAddingField(false)}
                            />
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-3" ref={descriptionRef}>
                    <h3 className="text-base font-medium text-[var(--color-gray-12)] tracking-[-0.016px] leading-6 m-0">Description</h3>
                    {editingDescription ? (
                        <textarea
                            className="block w-full py-4 pl-4 pr-6 rounded-[var(--radius-xl)] border border-[var(--color-accent-9)] bg-[var(--color-white)] text-sm font-normal text-[var(--color-gray-12)] leading-[22px] tracking-[-0.04px] outline-none font-[inherit] resize-none min-h-[100px] max-h-[300px] overflow-y-auto"
                            defaultValue={editedDescription ?? item.description ?? ''}
                            autoFocus
                            onInput={e => {
                                const t = e.target as HTMLTextAreaElement
                                t.style.height = 'auto'
                                t.style.height = t.scrollHeight + 'px'
                            }}
                            onBlur={e => {
                                setEditingDescription(false)
                                setEditedDescription(e.target.value || null)
                            }}
                        />
                    ) : (editedDescription ?? item.description) ? (
                        <div className="detail-page__description" onClick={() => setEditingDescription(true)}>
                            {(editedDescription ?? item.description ?? '').split('\n').map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                    ) : (
                        <div className="detail-page__description detail-page__description--empty" onClick={() => setEditingDescription(true)}>
                            No description yet.
                        </div>
                    )}
                </div>

                {/* Gallery */}
                {allImages.length > 0 && (
                <div className="flex flex-col gap-3" ref={galleryRef}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-medium text-[var(--color-gray-12)] tracking-[-0.016px] leading-6 m-0">Gallery</h3>
                            <span className="flex items-center justify-center min-w-6 h-6 px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] text-xs font-[var(--font-weight-medium)] text-[var(--color-gray-12)] leading-5">{allImages.length}</span>
                            <button className="flex items-center justify-center w-7 h-7 border-none rounded-[var(--radius-md)] bg-transparent text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-neutral-3)]"><IconDots size={16} stroke={1.75} /></button>
                        </div>
                        <button className="flex items-center gap-1 h-8 px-3 py-1.5 border-none rounded-[var(--radius-md)] bg-[var(--color-accent-3)] text-sm font-medium text-[var(--color-accent-9)] cursor-pointer transition-colors duration-150 leading-5 hover:bg-[var(--color-blue-hover)]">
                            <IconUpload size={16} stroke={1.75} />
                            Upload
                        </button>
                    </div>
                    {(() => {
                        const visibleThumbs = allImages.slice(1, 4)
                        const remaining = allImages.length - 4
                        const galleryClass = cn(
                            'detail-page__gallery',
                            allImages.length === 1 && 'detail-page__gallery--single',
                            allImages.length === 2 && 'detail-page__gallery--two',
                            allImages.length === 3 && 'detail-page__gallery--three',
                        )

                        return (
                            <div className={galleryClass}>
                                <div className="detail-page__gallery-hero" onClick={() => setLightboxIndex(0)}>
                                    <img src={allImages[0]} alt={item.name} />
                                </div>
                                {visibleThumbs.map((src, i) => (
                                    <div key={src} className="detail-page__gallery-thumb" onClick={() => setLightboxIndex(i + 1)}>
                                        <img src={src} alt={`${item.name} ${i + 2}`} />
                                        {i === visibleThumbs.length - 1 && remaining > 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-[var(--color-white)] text-xl font-semibold tracking-[-0.02em] cursor-pointer" onClick={(e) => { e.stopPropagation(); setLightboxIndex(i + 1) }}>+{remaining}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </div>
                )}

                {/* Lightbox */}
                {lightboxIndex !== null && createPortal(
                    <div className="detail-page__lightbox" onClick={closeLightbox}>
                        <img src={allImages[lightboxIndex]} alt={item.name} onClick={e => e.stopPropagation()} />
                        <button className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 border-none rounded-full bg-white/15 text-[var(--color-white)] cursor-pointer transition-colors duration-150 hover:bg-white/25" onClick={closeLightbox}>
                            <IconX size={20} stroke={2} />
                        </button>
                        {allImages.length > 1 && (
                            <>
                                <button className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 border-none rounded-full bg-white/15 text-[var(--color-white)] cursor-pointer transition-colors duration-150 hover:bg-white/25 left-5" onClick={e => { e.stopPropagation(); prevImage() }}>
                                    <IconChevronLeft size={20} stroke={2} />
                                </button>
                                <button className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 border-none rounded-full bg-white/15 text-[var(--color-white)] cursor-pointer transition-colors duration-150 hover:bg-white/25 right-5" onClick={e => { e.stopPropagation(); nextImage() }}>
                                    <IconChevronRight size={20} stroke={2} />
                                </button>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-[var(--font-weight-medium)] text-white/70 select-none">{lightboxIndex + 1} / {allImages.length}</div>
                            </>
                        )}
                    </div>,
                    document.body
                )}

                {/* Attachments */}
                <div className="flex flex-col gap-3" ref={attachmentsRef}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-medium text-[var(--color-gray-12)] tracking-[-0.016px] leading-6 m-0">Attachments</h3>
                            <span className="flex items-center justify-center min-w-6 h-6 px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] text-xs font-[var(--font-weight-medium)] text-[var(--color-gray-12)] leading-5">{attachments.length}</span>
                            <button className="flex items-center justify-center w-7 h-7 border-none rounded-[var(--radius-md)] bg-transparent text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-neutral-3)]"><IconDots size={16} stroke={1.75} /></button>
                        </div>
                        <button className="flex items-center gap-1 h-8 px-3 py-1.5 border-none rounded-[var(--radius-md)] bg-[var(--color-accent-3)] text-sm font-medium text-[var(--color-accent-9)] cursor-pointer transition-colors duration-150 leading-5 hover:bg-[var(--color-blue-hover)]">
                            <IconUpload size={16} stroke={1.75} />
                            Upload
                        </button>
                    </div>
                    {attachments.length > 0 ? (
                        <div className="flex flex-col">
                            <div className="flex items-start px-2 pb-2 border-b border-[var(--color-gray-4)] gap-4">
                                <span className="flex-1 text-[13px] font-[var(--font-weight-medium)] text-[var(--color-neutral-10)] leading-5">Name</span>
                                <span className="flex-1 text-[13px] font-[var(--font-weight-medium)] text-[var(--color-neutral-10)] leading-5">Details</span>
                                <span className="flex-[0_0_32px] text-[13px] font-[var(--font-weight-medium)] text-[var(--color-neutral-10)] leading-5" />
                            </div>
                            {attachments.map(doc => (
                                <div key={doc.name} className="flex items-center h-10 px-2 border-b border-[var(--color-neutral-4)] gap-4 cursor-pointer transition-colors duration-150 hover:bg-[var(--color-gray-2)]">
                                    <div className="flex-1 flex items-center gap-2 text-sm font-[var(--font-weight-medium)] text-[var(--color-gray-12)] whitespace-nowrap overflow-hidden text-ellipsis leading-5">
                                        <div className={cn(
                                            'flex items-center justify-center w-6 h-6 rounded-[6px] border border-[var(--color-white)] shrink-0',
                                            doc.type === 'csv' ? 'bg-[var(--color-green-1)] text-[#30a46c]' : 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)]'
                                        )}>
                                            {doc.type === 'csv' ? <IconTable size={14} stroke={1.75} /> : <IconFileText size={14} stroke={1.75} />}
                                        </div>
                                        <span>{doc.name}</span>
                                    </div>
                                    <span className="flex-1 text-sm font-normal text-[var(--color-gray-12)] whitespace-nowrap overflow-hidden text-ellipsis leading-5 px-4">{doc.detail}</span>
                                    <button className="flex-[0_0_32px] flex items-center justify-center h-8 bg-none border-none text-[var(--color-neutral-11)] cursor-pointer rounded-[6px] transition-colors duration-150 hover:bg-[var(--color-neutral-3)]"><IconDots size={16} stroke={1.75} /></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-[var(--spacing-2)] min-h-[140px] px-6 py-8 rounded-xl bg-[var(--color-gray-2)] text-sm text-[var(--color-neutral-9)] leading-5 text-center">
                            <IconFileText size={24} stroke={1.5} className="text-[var(--color-neutral-9)]" />
                            No documents attached yet. Upload files to link them to this item.
                        </div>
                    )}
                </div>

                {/* Relationships — tabbed: Connections (radial) + Ownership (tree) */}
                {itemRelationships.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {/* Header row: title + dots + tabs */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-base font-medium text-[var(--color-gray-12)] tracking-[-0.016px] leading-6 m-0">Relationships</h3>
                                <button className="flex items-center justify-center w-7 h-7 border-none rounded-[var(--radius-md)] bg-transparent text-[var(--color-neutral-11)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-neutral-3)]"><IconDots size={16} stroke={1.75} /></button>
                            </div>
                            <div className="flex items-center gap-0.5 bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-lg)] p-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                                <button
                                    className={cn(
                                        'h-7 px-2 py-0.5 border-none rounded-[var(--radius-sm)] bg-transparent text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] cursor-pointer transition-colors duration-150 whitespace-nowrap leading-5 hover:bg-[var(--color-neutral-3)]',
                                        effectiveRelTab === 'connections' && 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)] font-medium hover:bg-[var(--color-accent-3)]',
                                    )}
                                    onClick={() => setActiveRelTab('connections')}
                                >
                                    Connections <span className="ml-0.5 text-xs opacity-60">{nonHierarchyCount}</span>
                                </button>
                                <button
                                    className={cn(
                                        'h-7 px-2 py-0.5 border-none rounded-[var(--radius-sm)] bg-transparent text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] cursor-pointer transition-colors duration-150 whitespace-nowrap leading-5 hover:bg-[var(--color-neutral-3)]',
                                        effectiveRelTab === 'ownership' && 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)] font-medium hover:bg-[var(--color-accent-3)]',
                                    )}
                                    onClick={() => setActiveRelTab('ownership')}
                                >
                                    Ownership <span className="ml-0.5 text-xs opacity-60">{ownershipChain.length > 1 ? ownershipChain.length : 0}</span>
                                </button>
                            </div>
                        </div>
                        {/* Graph container */}
                        <div className="relationships-graph relative" style={{ height: 500 }}>
                            {/* Expand button at top-right */}
                            <button
                                className="absolute top-3 right-3 z-10 flex items-center justify-center gap-[var(--spacing-2)] h-8 px-[var(--spacing-3)] py-0.5 bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-md)] shadow-[var(--shadow-subtle)] text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] leading-[1.54] whitespace-nowrap transition-colors duration-150 hover:bg-[var(--color-neutral-3)] cursor-pointer"
                                onClick={() => setIsGraphExpanded(true)}
                            >
                                <IconArrowsMaximize size={16} stroke={1.5} />
                                <span>Expand</span>
                            </button>
                            {/* Both graphs stay mounted — toggle visibility to avoid re-init lag */}
                            {hasConnections && (
                                <div style={{ width: '100%', height: '100%', display: effectiveRelTab === 'connections' ? 'block' : 'none' }}>
                                    <ConnectionsGraph
                                        currentItem={item}
                                        relationships={itemRelationships}
                                        getItemById={getItemById}
                                        onItemClick={(clickedItem) => { if (clickedItem.id !== item.id) { setIsGraphExpanded(true); setSidebarItemId(clickedItem.id) } }}
                                        onAction={handleCardAction}
                                    />
                                </div>
                            )}
                            {hasOwnership && (
                                <div style={{ width: '100%', height: '100%', display: effectiveRelTab === 'ownership' ? 'block' : 'none' }}>
                                    <OwnershipTree
                                        chain={ownershipChain}
                                        currentItemId={item.id}
                                        relationships={relationships}
                                        onItemClick={(clickedItem) => { if (clickedItem.id !== item.id) { setIsGraphExpanded(true); setSidebarItemId(clickedItem.id) } }}
                                        onAction={handleCardAction}
                                    />
                                </div>
                            )}
                            {/* Empty states */}
                            {effectiveRelTab === 'connections' && !hasConnections && (
                                <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                                    <IconLink size={24} stroke={1.5} className="text-[var(--color-neutral-8)]" />
                                    <p className="text-sm text-[var(--color-neutral-9)] m-0">No connections yet</p>
                                    <p className="text-xs text-[var(--color-neutral-8)] m-0 max-w-[240px] leading-[1.45]">Non-ownership relationships like trustees, beneficiaries, and advisors will appear here.</p>
                                </div>
                            )}
                            {effectiveRelTab === 'ownership' && !hasOwnership && (
                                <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                                    <IconChevronDown size={24} stroke={1.5} className="text-[var(--color-neutral-8)]" />
                                    <p className="text-sm text-[var(--color-neutral-9)] m-0">No ownership chain</p>
                                    <p className="text-xs text-[var(--color-neutral-8)] m-0 max-w-[240px] leading-[1.45]">The ownership hierarchy for this item will appear here when available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar panel */}
            {sidebarItemId != null && createPortal(
                <ItemDetailPanel
                    item={getItemById(sidebarItemId)}
                    isOpen
                    onClose={() => setSidebarItemId(null)}
                    onNavigate={(id) => setSidebarItemId(id)}
                    getItemById={getItemById}
                    relationships={relationships}
                    onOpenFullRecord={(id) => { setSidebarItemId(null); onNavigate(id) }}
                    hideOverlay
                />,
                document.body,
            )}
        </div>
        </>
    )
}

/* ── Add Detail Popover ──────────────────────────────────────────── */

function AddFieldPopover({
    anchorRef,
    onAdd,
    onClose,
}: {
    anchorRef: React.RefObject<HTMLButtonElement | null>
    onAdd: (label: string, value: string) => void
    onClose: () => void
}) {
    const [label, setLabel] = useState('')
    const [value, setValue] = useState('')
    const popoverRef = useRef<HTMLDivElement>(null)
    const labelRef = useRef<HTMLInputElement>(null)
    const valueRef = useRef<HTMLInputElement>(null)

    useClickOutside([popoverRef, anchorRef], onClose, true)

    useEffect(() => {
        setTimeout(() => labelRef.current?.focus(), 80)
    }, [])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    const handleSubmit = () => {
        const trimmed = label.trim()
        if (!trimmed) return
        onAdd(trimmed, value.trim())
    }

    const rect = anchorRef.current?.getBoundingClientRect()
    const style: React.CSSProperties = rect
        ? { position: 'fixed', top: rect.bottom + 8, left: rect.left, zIndex: 11000 }
        : { position: 'fixed', top: 200, left: 200, zIndex: 11000 }

    return createPortal(
        <div
            ref={popoverRef}
            className="fixed w-[340px] bg-white border border-[var(--color-gray-4)] rounded-[var(--radius-2xl)] shadow-[0_24px_80px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] animate-[notif-dropdown-in_0.22s_cubic-bezier(0.16,1,0.3,1)] origin-top-left p-[var(--spacing-5)] flex flex-col gap-[var(--spacing-5)]"
            style={style}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-[15px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] leading-[1.4]">Add new detail</span>
                    <span className="text-sm text-[var(--color-neutral-11)] leading-[1.5]">Create a custom detail for this item.</span>
                </div>
                <button
                    type="button"
                    className="shrink-0 p-[5px] rounded-[var(--radius-md)] text-[var(--color-neutral-9)] transition-colors duration-100 hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-neutral-12)]"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <IconX size={16} stroke={2} />
                </button>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-[var(--spacing-3)]">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-[var(--font-weight-medium)] text-[var(--color-neutral-11)]">Name</label>
                    <input
                        ref={labelRef}
                        type="text"
                        className="w-full px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-md)] font-sans text-sm text-[var(--color-gray-12)] bg-white outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-accent-9)] focus:shadow-[0_0_0_3px_rgba(0,91,226,0.15)] placeholder:text-[var(--color-neutral-11)]"
                        placeholder="e.g. Registration number"
                        value={label}
                        onChange={e => setLabel(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && label.trim()) valueRef.current?.focus()
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-[var(--font-weight-medium)] text-[var(--color-neutral-11)]">Value</label>
                    <input
                        ref={valueRef}
                        type="text"
                        className="w-full px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-md)] font-sans text-sm text-[var(--color-gray-12)] bg-white outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-accent-9)] focus:shadow-[0_0_0_3px_rgba(0,91,226,0.15)] placeholder:text-[var(--color-neutral-11)]"
                        placeholder="Optional"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end">
                <button
                    className="flex items-center justify-center gap-[var(--spacing-1)] rounded-[var(--radius-md)] border border-[var(--color-accent-9)] bg-[var(--color-accent-9)] min-h-[32px] px-3.5 py-[4px] text-[13px] font-[var(--font-weight-semibold)] leading-[1.43] text-[var(--color-accent-contrast)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={!label.trim()}
                    onClick={handleSubmit}
                >
                    Add
                </button>
            </div>
        </div>,
        document.body
    )
}
