import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import type { FojoNotification } from '@/data/types/fojo'

function formatNotifTime(timestamp: number): string {
    const mins = Math.floor((Date.now() - timestamp) / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

interface FojoNotificationDropdownProps {
    notifications: FojoNotification[]
    onItemClick: (notif: FojoNotification) => void
    getDropdownStyle: () => React.CSSProperties
}

export function FojoNotificationDropdown({ notifications, onItemClick, getDropdownStyle }: FojoNotificationDropdownProps) {
    return createPortal(
        <div className="chat-notification__dropdown w-[360px] max-h-[480px] overflow-y-auto bg-[rgba(255,255,255,0.95)] backdrop-blur-[40px] [backdrop-filter:blur(40px)_saturate(180%)] [-webkit-backdrop-filter:blur(40px)_saturate(180%)] border border-[rgba(0,0,0,0.08)] rounded-[var(--radius-lg)] shadow-[0_24px_80px_rgba(0,0,0,0.12),0_8px_24px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] z-200 animate-[notif-dropdown-in_0.22s_cubic-bezier(0.16,1,0.3,1)] origin-top-left overscroll-contain py-1.5 px-0" style={getDropdownStyle()}>
            <div className="px-5 pt-4 pb-2 text-[13px] font-semibold text-[var(--color-neutral-11)] tracking-[0.02em]">Fojo Updates</div>
            {notifications.length === 0 ? (
                <div className="py-10 px-5 text-[13px] text-[var(--color-neutral-11)] text-center leading-[1.5]">No updates yet. Fojo will notify you when it finds something.</div>
            ) : (
                notifications.map(notif => (
                    <button
                        key={notif.id}
                        className={cn('chat-notification__item flex items-start gap-0 p-0 mx-2 my-1 w-[calc(100%-16px)] border-none bg-none cursor-pointer text-left rounded-[var(--radius-lg)] relative transition-[background] duration-150 hover:bg-[rgba(0,0,0,0.04)] active:bg-[rgba(0,0,0,0.07)]', !notif.read && 'chat-notification__item--unread bg-[rgba(0,91,226,0.04)] hover:bg-[rgba(0,91,226,0.07)]')}
                        onClick={() => onItemClick(notif)}
                    >
                        <div className="flex-1 min-w-0 py-3.5 px-4 pl-6">
                            <div className="flex items-start justify-between gap-3">
                                <div className="text-[13.5px] font-medium text-[var(--color-neutral-12)] leading-[1.4] flex-1 min-w-0">{notif.title}</div>
                                <span className="text-xs text-[var(--color-neutral-11)] shrink-0 whitespace-nowrap pt-px">{formatNotifTime(notif.timestamp)}</span>
                            </div>
                            <div className="text-[13px] text-[var(--color-neutral-11)] leading-[1.45] mt-1 line-clamp-2">{notif.preview}</div>
                        </div>
                    </button>
                ))
            )}
        </div>,
        document.body
    )
}
