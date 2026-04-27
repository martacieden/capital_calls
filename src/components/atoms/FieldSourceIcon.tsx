import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { IconFileText, IconWorld } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { FieldSource } from '@/data/field-sources'

const TYPE_ICONS = { pdf: IconFileText, web: IconWorld } as const

function getLabel(s: FieldSource): string {
    if (s.sourceType === 'pdf') return s.page ? `${s.documentLabel}, p.${s.page}` : s.documentLabel ?? 'Document'
    return s.siteName ?? 'Web Search'
}

function getExcerpt(s: FieldSource): string {
    if (s.sourceType === 'pdf') return s.excerpt ?? ''
    return s.webExcerpt ?? ''
}

export function FieldSourceIcon({ source }: { source: FieldSource }) {
    const [visible, setVisible] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0, flip: false })
    const iconRef = useRef<HTMLSpanElement>(null)
    const enterTimer = useRef<ReturnType<typeof setTimeout>>(null)
    const leaveTimer = useRef<ReturnType<typeof setTimeout>>(null)

    const show = useCallback(() => {
        if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null }
        enterTimer.current = setTimeout(() => {
            if (!iconRef.current) return
            const r = iconRef.current.getBoundingClientRect()
            const flip = r.top < 160
            setPos({
                top: flip ? r.bottom + 8 : r.top - 8,
                left: Math.min(r.left, window.innerWidth - 320),
                flip,
            })
            setVisible(true)
        }, 150)
    }, [])

    const hide = useCallback(() => {
        if (enterTimer.current) { clearTimeout(enterTimer.current); enterTimer.current = null }
        leaveTimer.current = setTimeout(() => setVisible(false), 100)
    }, [])

    const Icon = TYPE_ICONS[source.sourceType]

    return (
        <>
            <span
                ref={iconRef}
                className="detail-page__kv-source-icon"
                onMouseEnter={show}
                onMouseLeave={hide}
            >
                <Icon size={14} stroke={1.5} />
            </span>
            {visible && createPortal(
                <div
                    className="fixed z-[1100] w-[300px] max-w-[320px] px-4 py-3 bg-[var(--color-white)] border border-[var(--color-gray-4)] rounded-[var(--radius-lg)] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] opacity-100 pointer-events-auto"
                    style={{
                        top: pos.flip ? pos.top : undefined,
                        bottom: pos.flip ? undefined : window.innerHeight - pos.top,
                        left: pos.left,
                    }}
                    onMouseEnter={show}
                    onMouseLeave={hide}
                >
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={cn(
                            'flex items-center justify-center w-6 h-6 rounded-[var(--radius-md)] shrink-0',
                            source.sourceType === 'pdf' ? 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)]' : 'bg-[var(--color-green-1)] text-[#30a46c]'
                        )}>
                            <Icon size={14} stroke={1.5} />
                        </span>
                        <span className="text-[13px] font-medium text-[var(--color-gray-12)] leading-5 whitespace-nowrap overflow-hidden text-ellipsis">{getLabel(source)}</span>
                    </div>
                    <div className="text-xs font-normal text-[var(--color-neutral-11)] leading-[18px] line-clamp-3">{getExcerpt(source)}</div>
                </div>,
                document.body,
            )}
        </>
    )
}
