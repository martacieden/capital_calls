import { IconCalendarEvent, IconExternalLink, IconChevronRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { getIcon } from '@/lib/icons'
import { getCategoryOrFallback } from '@/data/categories'
import type { ChatMessage } from '@/data/types/fojo'

function renderFormattedText(text: string) {
    const lines = text.split('\n')
    return lines.map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*)/g)
        const rendered = parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>
            }
            return part
        })

        if (line.startsWith('- ')) {
            return <div key={i} className="pl-[var(--spacing-2)]">{'• '}{rendered.map((r, _k) => typeof r === 'string' ? r.replace(/^- /, '') : r)}</div>
        }
        if (/^\d+\. /.test(line)) {
            return <div key={i} className="pl-[var(--spacing-2)]">{rendered}</div>
        }
        if (line === '') {
            return <br key={i} />
        }
        return <div key={i}>{rendered}</div>
    })
}

interface ChatMessageBubbleProps {
    msg: ChatMessage
    onOpenTimeline?: () => void
    distributionSummary?: { count: number; trustCount: number; yearRange?: string }
    onItemClick?: (itemId: string) => void
}

export function ChatMessageBubble({ msg, onOpenTimeline, distributionSummary, onItemClick }: ChatMessageBubbleProps) {
    return (
        <div className={cn('chat-message flex gap-[var(--spacing-2)] items-start', msg.role === 'user' ? 'chat-message--user justify-end' : 'chat-message--assistant')}>
            <div className="chat-message__col">
                <div className="chat-message__bubble">
                    {renderFormattedText(msg.text)}
                </div>
                {msg.cards && msg.cards.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2">
                        {msg.cards.map(card => {
                            const cat = getCategoryOrFallback(card.categoryKey)
                            const iconName = card._icon || cat.icon
                            const CatIcon = getIcon(iconName)
                            const meta = card._meta ?? cat.label
                            const isRel = !!(card._relLabel || card._accentIcon)
                            return (
                                <div key={card.id} className={cn('flex items-center gap-3 py-[10px] px-3 border border-[var(--color-gray-4)] rounded-[var(--radius-lg)] bg-[var(--color-white)] transition-[background,border-color] duration-150 hover:bg-[rgba(0,91,226,0.04)]', isRel && 'creation-item-card--relationship')} style={{ cursor: onItemClick ? 'pointer' : undefined }} onClick={() => onItemClick?.(card.id)}>
                                    {card.imageUrl ? (
                                        <div className="creation-item-card__image w-11 h-11 rounded-[var(--radius-md)] overflow-hidden shrink-0">
                                            <img src={card.imageUrl} alt={card.name} />
                                        </div>
                                    ) : (
                                        <div className="creation-item-card__icon w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
                                            <CatIcon size={20} stroke={1.5} />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                        {card._relLabel ? (
                                            <>
                                                <span className="text-xs font-normal text-[var(--color-neutral-11)] leading-4">{card._relLabel}</span>
                                                <span className="text-[13px] font-medium text-[var(--color-gray-12)] leading-5 whitespace-nowrap overflow-hidden text-ellipsis">{card.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[13px] font-medium text-[var(--color-gray-12)] leading-5 whitespace-nowrap overflow-hidden text-ellipsis">{card.name}</span>
                                                <span className="text-xs font-normal text-[var(--color-neutral-11)] leading-4">{meta}</span>
                                            </>
                                        )}
                                    </div>
                                    <IconChevronRight size={16} color="var(--color-neutral-11)" />
                                </div>
                            )
                        })}
                    </div>
                )}
                {msg.artifact === 'timeline' && (
                    <div className="flex items-center gap-3 py-[10px] px-3 border border-[var(--color-gray-4)] rounded-[var(--radius-lg)] bg-[var(--color-white)] mt-1">
                        <div className="shrink-0 w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-neutral-3)] flex items-center justify-center">
                            <IconCalendarEvent size={18} stroke={1.5} color="var(--color-neutral-11)" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                            <div className="text-[13px] font-medium text-[var(--color-gray-12)] leading-5">Distribution Timeline</div>
                            <div className="text-xs text-[var(--color-neutral-11)] leading-4">
                                {distributionSummary
                                    ? `${distributionSummary.count} events · ${distributionSummary.trustCount} trust${distributionSummary.trustCount !== 1 ? 's' : ''}${distributionSummary.yearRange ? ` · ${distributionSummary.yearRange}` : ''}`
                                    : 'Distribution events ready to view'}
                            </div>
                        </div>
                        <button className="shrink-0 w-7 h-7 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] flex items-center justify-center text-[var(--color-neutral-11)] transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]" onClick={onOpenTimeline}>
                            <IconExternalLink size={13} stroke={2} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
