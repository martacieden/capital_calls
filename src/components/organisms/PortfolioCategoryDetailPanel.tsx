import { IconArrowsMaximize, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GeoExposureChart } from '@/components/atoms/GeoExposureChart'
import { PortfolioHoldingsTable } from '@/components/atoms/PortfolioHoldingsTable'
import { DetailPanelShell } from '@/components/molecules/DetailPanelShell'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import {
    getDrilldownData,
    getCategoryLabel,
    getPortfolioSubcategories,
    holdingMatchesPortfolioSubcategory,
    PORTFOLIO_ALLOCATION_DISPLAY_TOTAL,
    type PortfolioHolding,
    type PortfolioSector,
} from '@/data/thornton/portfolio-data'

/** Один рядок: «Portfolio / Назва» без detail-breadcrumb стилів. */
export function PortfolioSimpleBreadcrumb({
    parentLabel,
    currentLabel,
    onParentClick,
}: {
    parentLabel: string
    currentLabel: string
    onParentClick: () => void
}) {
    return (
        <nav
            className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm leading-snug text-[var(--color-neutral-10)]"
            aria-label="Breadcrumb"
        >
            <button
                type="button"
                className="shrink-0 cursor-pointer border-none bg-transparent p-0 font-[var(--font-weight-medium)] text-inherit hover:text-[var(--color-gray-12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)] focus-visible:ring-offset-1 rounded-sm"
                onClick={onParentClick}
            >
                {parentLabel}
            </button>
            <span className="shrink-0 text-[var(--color-neutral-7)]" aria-hidden>
                /
            </span>
            <span
                className="min-w-0 truncate font-[var(--font-weight-medium)] text-[var(--color-gray-12)]"
                title={currentLabel}
            >
                {currentLabel}
            </span>
        </nav>
    )
}

/** Той самий вигляд значення, що й pill у DetailKvRow / Asset detail. */
const SUBCATEGORY_TRIGGER_PILL =
    'flex h-8 w-full max-w-[min(220px,100%)] min-w-0 items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-gray-2)] pl-3 pr-2 text-sm font-[var(--font-weight-regular)] text-[var(--color-gray-12)] border-none cursor-pointer transition-colors duration-150 hover:bg-[var(--color-accent-3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-9)] focus-visible:ring-offset-0'

const SUBCATEGORY_MENU_ITEM =
    'flex w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors'

function PortfolioSubcategoryPick({
    value,
    options,
    onChange,
    fieldId,
}: {
    value: string | null
    options: string[]
    onChange: (v: string | null) => void
    /** Стабільний id (наприклад `portfolio-subcategory-${categoryId}`). */
    fieldId: string
}) {
    const [open, setOpen] = useState(false)
    const wrapRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLUListElement>(null)
    const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; minWidth: number } | null>(null)

    useClickOutside([wrapRef, menuRef], () => setOpen(false), open)

    const displayLabel = value ?? 'All types'

    useLayoutEffect(() => {
        if (!open) {
            setMenuStyle(null)
            return
        }
        const el = wrapRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        setMenuStyle({
            top: r.bottom + 4,
            left: r.left,
            minWidth: r.width,
        })
    }, [open])

    useEffect(() => {
        if (!open) return
        const close = () => setOpen(false)
        window.addEventListener('scroll', close, true)
        window.addEventListener('resize', close)
        return () => {
            window.removeEventListener('scroll', close, true)
            window.removeEventListener('resize', close)
        }
    }, [open])

    const menuItemClass = (selected: boolean) =>
        `${SUBCATEGORY_MENU_ITEM} ${
            selected
                ? 'bg-[var(--color-neutral-3)] font-semibold text-[var(--color-gray-12)]'
                : 'text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-2)]'
        }`

    return (
        <div ref={wrapRef} className="relative mt-2 max-w-full">
            <span id={fieldId} className="sr-only">Subcategory filter</span>
            <button
                type="button"
                className={SUBCATEGORY_TRIGGER_PILL}
                aria-labelledby={fieldId}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
            >
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left leading-8">
                    {displayLabel}
                </span>
                <IconChevronDown size={16} stroke={2} className="shrink-0 text-[var(--color-neutral-10)]" aria-hidden />
            </button>
            {open && menuStyle && createPortal(
                <ul
                    ref={menuRef}
                    role="listbox"
                    className="fixed z-[5000] m-0 max-h-[min(280px,45vh)] list-none overflow-y-auto rounded-lg border border-[var(--color-gray-4)] bg-[var(--color-white)] p-1 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12)]"
                    style={{ top: menuStyle.top, left: menuStyle.left, minWidth: menuStyle.minWidth }}
                >
                    <li role="presentation">
                        <button
                            type="button"
                            role="option"
                            aria-selected={value === null}
                            className={menuItemClass(value === null)}
                            onClick={() => {
                                onChange(null)
                                setOpen(false)
                            }}
                        >
                            All types
                        </button>
                    </li>
                    {options.map(s => (
                        <li key={s} role="presentation">
                            <button
                                type="button"
                                role="option"
                                aria-selected={value === s}
                                className={menuItemClass(value === s)}
                                onClick={() => {
                                    onChange(s)
                                    setOpen(false)
                                }}
                            >
                                {s}
                            </button>
                        </li>
                    ))}
                </ul>,
                document.body,
            )}
        </div>
    )
}

function formatValue(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`
    return `$${v.toLocaleString()}`
}

function SectorBreakdown({ sectors }: { sectors: PortfolioSector[] }) {
    const maxValue = Math.max(...sectors.map(s => s.value), 1)
    return (
        <div className="flex flex-col gap-2.5">
            {sectors.map(s => (
                <div key={s.label} className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-sm text-[var(--color-neutral-11)] w-36 shrink-0 truncate">{s.label}</span>
                    <div className="flex-1 h-1.5 bg-[var(--color-neutral-3)] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{ width: `${(s.value / maxValue) * 100}%`, background: s.color }}
                        />
                    </div>
                    <span className="text-xs text-[var(--color-neutral-9)] shrink-0 w-8 text-right">{s.percentage}%</span>
                    <span className="text-xs font-semibold tabular-nums text-[var(--color-black)] shrink-0 w-16 text-right">{formatValue(s.value)}</span>
                </div>
            ))}
        </div>
    )
}

function KpiCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] px-5 py-4">
            <div className="text-xs text-[var(--color-neutral-10)] mb-1">{label}</div>
            <div className="text-xl font-bold text-[var(--color-black)]">{value}</div>
        </div>
    )
}

const CARD_CATEGORIES = new Set(['lifestyle-assets', 'real-estate'])
const TOP_CARD_LIMIT = 10

function holdingSearchHaystack(h: PortfolioHolding, categoryId: string): string {
    const detail =
        categoryId === 'private-investments'
            ? [h.manager, h.vintage ? `Vintage ${h.vintage}` : null].filter(Boolean).join(' ')
            : (h.location ?? h.manager ?? h.vintage ?? '')
    return `${h.name} ${h.type} ${h.sector} ${detail}`.toLowerCase()
}

export function PortfolioCategoryDetailContent({
    categoryId,
    onNavigateToAsset,
    geoLegendColumns = 2,
    variant = 'panel',
    subcategoryKeys: controlledSubKeys,
    holdingsSearchQuery = '',
}: {
    categoryId: string
    onNavigateToAsset?: (id: string) => void
    /** Geographic exposure list: 1 column in narrow panel, 2 on full-width pages. */
    geoLegendColumns?: 1 | 2
    variant?: 'panel' | 'page'
    /** Зовнішній фільтр типів (multi-select з CatalogToolbar на повній сторінці). Порожній масив = усі типи. */
    subcategoryKeys?: string[]
    holdingsSearchQuery?: string
}) {
    const label = getCategoryLabel(categoryId)
    const data = getDrilldownData(categoryId)
    const [internalSub, setInternalSub] = useState<string | null>(null)
    const [holdingsExpanded, setHoldingsExpanded] = useState(false)

    const subcategories = useMemo(() => getPortfolioSubcategories(categoryId), [categoryId])

    useEffect(() => {
        if (controlledSubKeys === undefined) setInternalSub(null)
    }, [categoryId, controlledSubKeys])

    useEffect(() => {
        setHoldingsExpanded(false)
    }, [categoryId, holdingsSearchQuery, internalSub, controlledSubKeys])

    const effectiveSubKeys =
        controlledSubKeys !== undefined ? controlledSubKeys : internalSub === null ? [] : [internalSub]

    const sortedHoldings = useMemo(
        () => (data ? [...data.topHoldings].sort((a, b) => b.value - a.value) : []),
        [data],
    )

    const subFilteredHoldings = useMemo(() => {
        if (effectiveSubKeys.length === 0) return sortedHoldings
        return sortedHoldings.filter(h =>
            effectiveSubKeys.some(k => holdingMatchesPortfolioSubcategory(h, categoryId, k)),
        )
    }, [sortedHoldings, effectiveSubKeys, categoryId])

    const searchQ = holdingsSearchQuery.trim().toLowerCase()
    const filteredHoldings = useMemo(() => {
        if (!searchQ) return subFilteredHoldings
        return subFilteredHoldings.filter(h => holdingSearchHaystack(h, categoryId).includes(searchQ))
    }, [subFilteredHoldings, searchQ, categoryId])

    const filteredTotal = useMemo(
        () => filteredHoldings.reduce((s, h) => s + h.value, 0),
        [filteredHoldings],
    )

    if (!data) return null

    const portfolioPercent = PORTFOLIO_ALLOCATION_DISPLAY_TOTAL > 0
        ? ((filteredTotal / PORTFOLIO_ALLOCATION_DISPLAY_TOTAL) * 100).toFixed(1)
        : null

    const manyHoldings = CARD_CATEGORIES.has(categoryId) && filteredHoldings.length > TOP_CARD_LIMIT
    const visibleHoldings =
        manyHoldings && !holdingsExpanded
            ? filteredHoldings.slice(0, TOP_CARD_LIMIT)
            : filteredHoldings

    const holdingsTableScrollClass =
        manyHoldings && holdingsExpanded
            ? 'max-h-[min(70vh,640px)] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-neutral-3)]'
            : ''

    const showSectorGeo = effectiveSubKeys.length === 0 && !searchQ

    const enableTableSort = variant === 'page'

    const holdingsExpandToggleClass =
        'mt-3 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-[var(--color-white)] px-4 py-2.5 text-sm font-[var(--font-weight-medium)] text-[var(--color-gray-12)] transition-colors hover:bg-[var(--color-neutral-2)] hover:border-[var(--color-neutral-7)]'

    return (
        <div className="flex flex-col gap-5">
            {variant === 'page' ? (
                <p className="text-sm text-[var(--color-neutral-10)]">
                    {formatValue(filteredTotal)} &middot; {portfolioPercent}% of total portfolio
                </p>
            ) : (
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-black)]">{label}</h1>
                    <p className="text-sm text-[var(--color-neutral-10)] mt-1.5">
                        {formatValue(filteredTotal)} &middot; {portfolioPercent}% of total portfolio
                    </p>
                    {subcategories.length > 0 && (
                        <PortfolioSubcategoryPick
                            value={internalSub}
                            options={subcategories}
                            onChange={setInternalSub}
                            fieldId={`portfolio-subcategory-${categoryId}`}
                        />
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Total Value" value={formatValue(filteredTotal)} />
                <KpiCard label="Holdings" value={String(filteredHoldings.length)} />
            </div>

            {filteredHoldings.length === 0 && effectiveSubKeys.length > 0 && (
                <p className="text-sm text-[var(--color-neutral-10)]">No holdings in this slice.</p>
            )}
            {filteredHoldings.length === 0 && effectiveSubKeys.length === 0 && searchQ && (
                <p className="text-sm text-[var(--color-neutral-10)]">No holdings match your search.</p>
            )}

            {filteredHoldings.length > 0 && (
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-4 sm:p-6">
                    <h2 className="text-base font-semibold text-[var(--color-black)] mb-3">Holdings</h2>
                    {holdingsTableScrollClass ? (
                        <div className={holdingsTableScrollClass}>
                            <PortfolioHoldingsTable
                                holdings={visibleHoldings}
                                categoryId={categoryId}
                                onRowClick={categoryId === 'cash-equivalents' ? undefined : onNavigateToAsset}
                                enableColumnSort={enableTableSort}
                            />
                        </div>
                    ) : (
                        <PortfolioHoldingsTable
                            holdings={visibleHoldings}
                            categoryId={categoryId}
                            onRowClick={categoryId === 'cash-equivalents' ? undefined : onNavigateToAsset}
                            enableColumnSort={enableTableSort}
                        />
                    )}
                    {manyHoldings && !holdingsExpanded && (
                        <button
                            type="button"
                            className={holdingsExpandToggleClass}
                            onClick={() => setHoldingsExpanded(true)}
                        >
                            Show all {filteredHoldings.length} holdings
                            <IconChevronDown size={16} stroke={2} className="text-[var(--color-neutral-9)]" aria-hidden />
                        </button>
                    )}
                    {manyHoldings && holdingsExpanded && (
                        <button
                            type="button"
                            className={holdingsExpandToggleClass}
                            onClick={() => setHoldingsExpanded(false)}
                        >
                            Show top {TOP_CARD_LIMIT} only
                            <IconChevronUp size={16} stroke={2} className="text-[var(--color-neutral-9)]" aria-hidden />
                        </button>
                    )}
                </div>
            )}

            {data.topSectors.length > 0 && showSectorGeo && (
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6">
                    <h2 className="text-base font-semibold text-[var(--color-black)] mb-4">Breakdown by sector</h2>
                    <SectorBreakdown sectors={data.topSectors} />
                </div>
            )}

            {data.geographicExposure.length > 0 && showSectorGeo && (
                <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] p-6 w-full overflow-visible">
                    <h2 className="text-base font-semibold text-[var(--color-black)] mb-4">Geographic Exposure</h2>
                    <GeoExposureChart data={data.geographicExposure} legendColumns={geoLegendColumns} />
                </div>
            )}
        </div>
    )
}

export interface PortfolioCategoryDetailPanelProps {
    categoryId: string | null
    isOpen: boolean
    onClose: () => void
    onNavigateToAsset?: (id: string) => void
    onOpenFullDetail?: (portfolioCategoryId: string) => void
}

export function PortfolioCategoryDetailPanel({
    categoryId,
    isOpen,
    onClose,
    onNavigateToAsset,
    onOpenFullDetail,
}: PortfolioCategoryDetailPanelProps) {
    const closeBtnRef = useRef<HTMLButtonElement>(null)
    const label = categoryId ? getCategoryLabel(categoryId) : ''
    const data = categoryId ? getDrilldownData(categoryId) : null

    useEffect(() => {
        if (isOpen && categoryId && !data) onClose()
    }, [isOpen, categoryId, data, onClose])

    if (!categoryId || !isOpen) return null

    return createPortal(
        <DetailPanelShell
            isOpen={isOpen}
            onClose={onClose}
            ariaLabel={`Portfolio category: ${label}`}
            closeButtonRef={closeBtnRef}
            headerActions={
                onOpenFullDetail && categoryId ? (
                    <button
                        type="button"
                        className="detail-close-btn p-2 rounded-[var(--radius-md)] text-[var(--color-neutral-11)] transition-[background,color] duration-150 hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-gray-12)]"
                        onClick={() => onOpenFullDetail(categoryId)}
                        aria-label="Open full view"
                        title="Open full view"
                    >
                        <IconArrowsMaximize size={20} stroke={2} aria-hidden />
                    </button>
                ) : undefined
            }
            breadcrumbs={(
                <PortfolioSimpleBreadcrumb
                    parentLabel="Portfolio"
                    currentLabel={label}
                    onParentClick={onClose}
                />
            )}
        >
            <PortfolioCategoryDetailContent
                categoryId={categoryId}
                onNavigateToAsset={onNavigateToAsset}
                geoLegendColumns={1}
            />
        </DetailPanelShell>,
        document.body,
    )
}
