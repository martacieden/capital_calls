import { cn } from '@/lib/utils'

const SKELETON_ROW_COUNT = 10

export function CardSkeleton({ isChatOpen }: { isChatOpen?: boolean }) {
    const count = isChatOpen ? 9 : 12
    return (
        <div className="cards-section">
            <div className={cn('cards-grid', !isChatOpen && 'cards-grid--wide')}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="card skeleton-card">
                        <div className="card__image w-full aspect-[1.67] overflow-hidden bg-[var(--color-neutral-3)] flex items-center justify-center skeleton-shimmer skeleton-card-image" />
                        <div className="flex flex-col overflow-hidden flex-1 justify-between border-t border-[var(--color-gray-4)] px-[var(--spacing-4)] pt-[var(--spacing-2)] pb-[var(--spacing-4)]">
                            <div className="flex items-start gap-[var(--spacing-2)]">
                                <div className="flex flex-col flex-1 min-w-0 pt-[var(--spacing-1)]">
                                    <div className="skeleton-shimmer skeleton-line skeleton-line--title" />
                                    <div className="skeleton-shimmer skeleton-line skeleton-line--subtitle" style={{ marginTop: '4px' }} />
                                </div>
                                <div className="skeleton-shimmer skeleton-btn-placeholder" />
                            </div>
                            <div className="skeleton-shimmer skeleton-line skeleton-line--desc-1" />
                            <div className="skeleton-shimmer skeleton-line skeleton-line--desc-2" />
                            <div className="flex items-center gap-[var(--spacing-2)] mt-[var(--spacing-2)] pt-[var(--spacing-1)]">
                                <div className="skeleton-shimmer skeleton-avatar" />
                                <div className="skeleton-shimmer skeleton-line skeleton-line--date" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ListSkeleton() {
    return (
        <div className="list-view">
            <table className="list-table">
                <thead>
                    <tr className="list-header-row">
                        <th className="list-header-cell" style={{ width: '40%' }}>Name</th>
                        <th className="list-header-cell">Category</th>
                        <th className="list-header-cell">Created By</th>
                        <th className="list-header-cell">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                        <tr key={i} className="list-row skeleton-row">
                            <td className="list-cell list-cell--name">
                                <div className="skeleton-shimmer skeleton-avatar-mini" />
                                <div className="skeleton-shimmer skeleton-line" style={{ width: '55%' }} />
                            </td>
                            <td className="list-cell">
                                <div className="skeleton-shimmer skeleton-badge" />
                            </td>
                            <td className="list-cell">
                                <div className="skeleton-shimmer skeleton-line" style={{ width: '65%' }} />
                            </td>
                            <td className="list-cell">
                                <div className="skeleton-shimmer skeleton-line" style={{ width: '75%' }} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
