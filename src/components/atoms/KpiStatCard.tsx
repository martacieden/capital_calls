import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

interface KpiStatCardProps {
    label: string
    value: string
    badge?: { text: string; positive?: boolean }
    icon?: ComponentType<{ size?: number; stroke?: number }>
    onClick?: () => void
}

export function KpiStatCard({ label, value, badge, icon: Icon, onClick }: KpiStatCardProps) {
    return (
        <div
            className={cn(
                'bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-lg)] px-5 py-4.5 flex flex-col gap-2.5 [transition:box-shadow_0.2s,transform_0.15s] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-px',
                onClick && 'cursor-pointer'
            )}
            onClick={onClick}
        >
            {Icon && (
                <div className="w-8 h-8 rounded-[4px] bg-[var(--color-card-blue-bg)] flex items-center justify-center text-[var(--color-card-blue)] mb-1">
                    <Icon size={18} stroke={1.5} />
                </div>
            )}
            <div className="font-display text-[22px] font-bold text-[var(--color-black)] tracking-[-0.02em] leading-none">{value}</div>
            <div className="text-xs text-[var(--color-neutral-11)] font-[var(--font-weight-regular)]">{label}</div>
            {badge && (
                <div className={cn(
                    'inline-flex items-center self-start px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5',
                    badge.positive
                        ? 'bg-[rgba(16,185,129,0.1)] text-[var(--color-card-green)]'
                        : 'bg-[var(--color-neutral-3)] text-[var(--color-neutral-11)]'
                )}>
                    {badge.text}
                </div>
            )}
        </div>
    )
}
