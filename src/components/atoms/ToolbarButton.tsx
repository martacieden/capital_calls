import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const BASE = 'flex items-center justify-center gap-[var(--spacing-2)] rounded-[var(--radius-md)] min-h-[32px] px-[var(--spacing-2)] py-0.5 pl-[var(--spacing-3)] text-[13px] font-[var(--font-weight-medium)] leading-[1.54] text-[var(--color-gray-12)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear hover:bg-[var(--color-neutral-3)]'

interface ToolbarButtonProps {
    label?: string
    icon?: ReactNode
    isActive?: boolean
    variant?: 'default' | 'accent'
    className?: string
    onClick?: () => void
}

export function ToolbarButton({ label, icon, isActive, variant = 'default', className, onClick }: ToolbarButtonProps) {
    return (
        <button className={cn(
            BASE,
            variant === 'default' && isActive && 'bg-[var(--color-neutral-3)]',
            variant === 'accent' && 'bg-[var(--color-accent-9)] text-white hover:bg-[var(--color-accent-10)]',
            className
        )} onClick={onClick}>
            {icon}
            {label && <span>{label}</span>}
        </button>
    )
}

