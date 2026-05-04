import { IconChevronDown, IconFileTypePdf, IconUpload } from '@tabler/icons-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PortfolioCategoryDetailContent, PortfolioSimpleBreadcrumb } from '@/components/organisms/PortfolioCategoryDetailPanel'
import { showToast } from '@/components/atoms/Toast'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { CatalogToolbar } from '@/components/organisms/CatalogToolbar'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import {
    getDrilldownData,
    getCategoryLabel,
    getPortfolioSubcategories,
} from '@/data/thornton/portfolio-data'

interface PortfolioCategoryDetailPageProps {
    categoryId: string
    onBack: () => void
    onNavigateToAsset?: (id: string) => void
}

export function PortfolioCategoryDetailPage({
    categoryId,
    onBack,
    onNavigateToAsset,
}: PortfolioCategoryDetailPageProps) {
    const label = getCategoryLabel(categoryId)
    const data = getDrilldownData(categoryId)

    const [subKeys, setSubKeys] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [actionsOpen, setActionsOpen] = useState(false)
    const actionsBtnRef = useRef<HTMLButtonElement>(null)
    const actionsMenuRef = useRef<HTMLDivElement>(null)
    const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)

    const typeItems = useMemo(
        () => getPortfolioSubcategories(categoryId).map(s => ({ key: s, label: s })),
        [categoryId],
    )

    useLayoutEffect(() => {
        if (!actionsOpen) {
            setMenuPos(null)
            return
        }
        const el = actionsBtnRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        setMenuPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }, [actionsOpen])

    useClickOutside([actionsBtnRef, actionsMenuRef], () => setActionsOpen(false), actionsOpen)

    useEffect(() => {
        if (!data) onBack()
    }, [data, onBack])

    useEffect(() => {
        setSubKeys([])
        setSearchQuery('')
    }, [categoryId])

    if (!data) return null

    return (
        <div className="flex flex-col flex-1 gap-[var(--spacing-5)] pt-9 px-[var(--spacing-6)] pb-[var(--spacing-5)] max-w-[1120px] w-full mx-auto">
            <PortfolioSimpleBreadcrumb parentLabel="Portfolio" currentLabel={label} onParentClick={onBack} />
            <ContentHeader
                title={label}
                itemCount={data.topHoldings.length}
                secondaryAction={{
                    label: 'Actions',
                    onClick: () => setActionsOpen(o => !o),
                    buttonRef: actionsBtnRef,
                    icon: IconChevronDown,
                }}
            />

            {actionsOpen && menuPos && createPortal(
                <div
                    ref={actionsMenuRef}
                    className="fixed z-[200] min-w-[220px] rounded-[var(--radius-md)] border border-[var(--color-gray-4)] bg-[var(--color-white)] p-1 shadow-[var(--shadow-dropdown)]"
                    style={{ top: menuPos.top, right: menuPos.right }}
                >
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-[var(--spacing-3)] py-2 text-left text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] transition-[background] duration-[0.12s] hover:bg-[var(--color-neutral-3)]"
                        onClick={() => {
                            showToast(`Preparing PDF for "${label}"…`, 'success')
                            setActionsOpen(false)
                        }}
                    >
                        <IconFileTypePdf size={16} stroke={1.75} className="text-[var(--color-neutral-10)] shrink-0" aria-hidden />
                        Export PDF
                    </button>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-[var(--spacing-3)] py-2 text-left text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] transition-[background] duration-[0.12s] hover:bg-[var(--color-neutral-3)]"
                        onClick={() => {
                            showToast('Document upload coming soon — use Documents for now.', 'success')
                            setActionsOpen(false)
                        }}
                    >
                        <IconUpload size={16} stroke={1.75} className="text-[var(--color-neutral-10)] shrink-0" aria-hidden />
                        Upload document
                    </button>
                </div>,
                document.body,
            )}

            <div className="sticky top-[calc(-1*var(--spacing-4))] z-10 bg-[var(--color-white)] pt-[var(--spacing-4)] -mt-[var(--spacing-5)] pb-[var(--spacing-4)] [&>*]:mt-0">
                <CatalogToolbar
                    activeView="list"
                    onViewChange={() => {}}
                    activeOrgs={[]}
                    onOrgsChange={() => {}}
                    activeCategory={subKeys}
                    onCategoryChange={setSubKeys}
                    dropdownItems={typeItems}
                    dropdownLabel="Type"
                    dropdownAllLabel="All"
                    viewOptions={null}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search holdings…"
                    quickFilterItems={[]}
                />
            </div>

            <PortfolioCategoryDetailContent
                variant="page"
                categoryId={categoryId}
                subcategoryKeys={subKeys}
                holdingsSearchQuery={searchQuery}
                onNavigateToAsset={onNavigateToAsset}
                geoLegendColumns={2}
            />
        </div>
    )
}
