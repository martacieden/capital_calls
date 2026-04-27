import { useState, useEffect, useRef, useCallback } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'
import { getIcon } from '@/lib/icons'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'
import type { AnyCatalogItem } from '@/data/types'
import { getCategoryByKey, getCategoryOrFallback } from '@/data/categories'

/*
 * SearchOverlay — Global search (Cmd+K style) with mocked results.
 * Centered search field + backdrop, static results on typing.
 * Last result is "Ask Fojo" shortcut.
 * Ref: FEEDBACK-SUMMARY.md §12b
 */

interface SearchOverlayProps {
    isOpen: boolean
    onClose: () => void
    onAskFojo: (query: string) => void
    onItemClick: (id: string) => void
    items: AnyCatalogItem[]
}

export function SearchOverlay({ isOpen, onClose, onAskFojo, onItemClick, items }: SearchOverlayProps) {
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setActiveIndex(-1)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    const results = query.trim()
        ? items
            .filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
        : []

    // Total selectable items: results + "Ask Fojo" (when query is present)
    const totalItems = query.trim() ? results.length + 1 : 0

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') { onClose(); return }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(i => (i + 1) % totalItems)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(i => (i - 1 + totalItems) % totalItems)
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault()
            if (activeIndex === 0) {
                onAskFojo(query)
                onClose()
            } else if (activeIndex > 0 && activeIndex <= results.length) {
                onItemClick(results[activeIndex - 1].id)
                onClose()
            }
        }
    }, [onClose, totalItems, activeIndex, results, onItemClick, onAskFojo, query])

    useEffect(() => {
        if (!isOpen) return
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleKeyDown])

    // Reset active index when query changes
    useEffect(() => { setActiveIndex(-1) }, [query])

    if (!isOpen) return null

    return (
        <>
            <div className="search-overlay__backdrop" onClick={onClose} />
            <div className="search-overlay__container">
                <div className="flex items-center gap-[var(--spacing-3)] p-[var(--spacing-4)]">
                    <IconSearch size={18} stroke={1.75} color="var(--color-neutral-9)" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 border-none bg-transparent text-[15px] font-normal text-[var(--color-gray-12)] outline-none placeholder:text-[var(--color-neutral-9)]"
                        placeholder="Search assets, documents, people..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    {query ? (
                        <button className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)]" onClick={onClose}>
                            <IconX size={16} stroke={2} />
                        </button>
                    ) : (
                        <kbd className="rounded-[var(--radius-sm)] bg-[var(--color-neutral-3)] px-1.5 py-0.5 font-inherit text-xs font-[var(--font-weight-medium)] leading-[20px] text-[var(--color-neutral-9)]">Esc</kbd>
                    )}
                </div>

                {query.trim() && (
                    <div className="flex max-h-[360px] flex-col gap-0.5 overflow-y-auto p-[var(--spacing-2)]">
                        <button
                            className={`flex w-full items-center gap-[var(--spacing-3)] rounded-[var(--radius-xl)] border-none bg-transparent px-[12px] py-[10px] text-left transition-[background] duration-150 cursor-pointer hover:bg-[var(--color-accent-3)]${activeIndex === 0 ? ' bg-[var(--color-accent-3)]' : ''}`}
                            onClick={() => { onAskFojo(query); onClose() }}
                            onMouseEnter={() => setActiveIndex(0)}
                        >
                            <img src={fojoMascotSmall} alt="Fojo" className="h-[24px] w-[24px] shrink-0 rounded-full" />
                            <span className="flex-1 truncate text-sm font-medium text-[var(--color-accent-9)]">Ask Fojo: &ldquo;{query}&rdquo;</span>
                        </button>
                        {results.map((item, i) => {
                            const cat = getCategoryByKey(item.categoryKey) ?? getCategoryOrFallback(item.categoryKey)
                            const CatIcon = getIcon(cat.icon)
                            return (
                                <button
                                    key={item.id}
                                    className={`flex w-full items-center gap-[var(--spacing-3)] rounded-[var(--radius-xl)] border-none bg-transparent px-[12px] py-[10px] text-left transition-[background] duration-150 cursor-pointer hover:bg-[var(--color-accent-3)]${i + 1 === activeIndex ? ' bg-[var(--color-accent-3)]' : ''}`}
                                    onClick={() => { onItemClick(item.id); onClose() }}
                                    onMouseEnter={() => setActiveIndex(i + 1)}
                                >
                                    <div className="flex shrink-0 items-center justify-center text-[var(--color-neutral-9)]">
                                        <CatIcon size={18} stroke={1.75} />
                                    </div>
                                    <span className="flex-1 truncate text-sm font-[var(--font-weight-medium)] text-[var(--color-gray-12)]">{item.name}</span>
                                    <span className="shrink-0 text-xs font-normal text-[var(--color-neutral-11)]">{cat.label}</span>
                                </button>
                            )
                        })}
                        {results.length === 0 && (
                            <div className="flex min-h-[80px] flex-col items-center justify-center gap-[var(--spacing-2)] p-[16px] text-center text-[13px] text-[var(--color-neutral-9)]">
                                <IconSearch size={20} stroke={1.5} />
                                No results for &ldquo;{query}&rdquo;
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
