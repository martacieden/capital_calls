import { useState, type CSSProperties, type HTMLAttributes, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface MagicCardProps extends HTMLAttributes<HTMLDivElement> {
    gradientColor?: string
}

export function MagicCard({
    children,
    className,
    gradientColor = 'rgba(0, 91, 226, 0.16)',
    onMouseMove,
    ...props
}: MagicCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect()
        setMousePosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        })
        onMouseMove?.(event)
    }

    return (
        <div
            {...props}
            onMouseMove={handleMouseMove}
            style={{
                '--magic-x': `${mousePosition.x}px`,
                '--magic-y': `${mousePosition.y}px`,
                '--magic-color': gradientColor,
                ...props.style,
            } as CSSProperties}
            className={cn(
                'group relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-neutral-4)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[box-shadow,transform,border-color] duration-200 hover:border-[var(--color-accent-6)] hover:shadow-[0_6px_18px_rgba(0,91,226,0.07)]',
                className,
            )}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-80 group-focus-within:opacity-80"
                style={{
                    background:
                        'radial-gradient(180px circle at var(--magic-x) var(--magic-y), var(--magic-color), transparent 72%)',
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-35"
                style={{
                    background:
                        'linear-gradient(120deg, rgba(0,91,226,0.05), rgba(56,189,248,0.04), rgba(139,92,246,0.03))',
                }}
            />
            <div className="relative z-[1]">{children}</div>
        </div>
    )
}
