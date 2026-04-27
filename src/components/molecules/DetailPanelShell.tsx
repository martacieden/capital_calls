import type { ReactNode } from 'react'
import { IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface DetailPanelShellProps {
    isOpen: boolean
    onClose: () => void
    /** Breadcrumb navigation rendered in the header left area */
    breadcrumbs: ReactNode
    /** Action buttons (edit, delete, etc.) rendered before the close button */
    headerActions?: ReactNode
    /** Pinned footer (e.g., save/cancel buttons in edit mode) */
    footer?: ReactNode
    /** Hide the backdrop overlay */
    hideOverlay?: boolean
    /** aria-label for the panel */
    ariaLabel?: string
    /** Ref forwarded to the close button for focus management */
    closeButtonRef?: React.RefObject<HTMLButtonElement | null>
    children: ReactNode
}

export function DetailPanelShell({
    isOpen, onClose, breadcrumbs, headerActions, footer, hideOverlay, ariaLabel, closeButtonRef, children,
}: DetailPanelShellProps) {
    return (
        <>
            {!hideOverlay && (
                <div
                    className={cn('detail-overlay', isOpen && 'detail-overlay--open')}
                    onClick={onClose}
                />
            )}
            <aside className={cn('detail-sidebar', isOpen && 'detail-sidebar--open')} aria-label={ariaLabel}>
                <header className="flex justify-between items-center gap-[var(--spacing-3)] p-[var(--spacing-5)] border-b border-[var(--color-gray-4)]">
                    {breadcrumbs}
                    <div className="flex items-center gap-[var(--spacing-1)]">
                        {headerActions}
                        <button
                            ref={closeButtonRef}
                            className="detail-close-btn p-2 rounded-[var(--radius-md)] text-[var(--color-neutral-11)] transition-[background,color] duration-150 hover:bg-[var(--color-neutral-3)] hover:text-[var(--color-gray-12)]"
                            onClick={onClose}
                            aria-label="Close details"
                        >
                            <IconX size={20} stroke={2} />
                        </button>
                    </div>
                </header>

                <div className="detail-content flex-1 overflow-y-auto px-[var(--spacing-6)] pt-[var(--spacing-6)] pb-[var(--spacing-8)]" style={{ scrollbarWidth: 'none' }}>
                    {children}
                </div>

                {footer}
            </aside>
        </>
    )
}

/** Shared tab bar used by detail panels */
export function DetailTabs({ tabs, activeTab, onTabChange }: {
    tabs: { key: string; label: string }[]
    activeTab: string
    onTabChange: (key: string) => void
}) {
    return (
        <div className="detail-tabs flex items-center gap-0 mb-[var(--spacing-5)] bg-[var(--color-neutral-3)] rounded-[var(--radius-md)] p-[3px]">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    className={cn(
                        'detail-tab relative flex-1 py-[7px] px-[var(--spacing-3)] text-[13px] border-none rounded-[var(--radius-sm)] cursor-pointer transition-[color,background,box-shadow] duration-150 text-center',
                        activeTab === tab.key && 'detail-tab--active',
                    )}
                    onClick={() => onTabChange(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
