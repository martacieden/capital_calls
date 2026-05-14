import {
    IconFileText,
    IconBug,
    IconHome,
    IconGitBranch,
    IconUsers,
    IconReceipt,
} from '@tabler/icons-react'
import type { ComponentType } from 'react'
import { FojoMascot } from '@/components/atoms/FojoMascot'

interface NavItem {
    icon: ComponentType<{ size?: number; stroke?: number; color?: string }>
    label: string
    id: string
    /** Long tooltip — explains how this item differs from the others */
    hint?: string
}

/** One Pipeline board: deal flow in every lane; capital-call cards in IC Review and Approved. */
const navItems: NavItem[] = [
    { icon: IconHome, label: 'Dashboard', id: 'home' },
    {
        icon: IconGitBranch,
        label: 'Pipeline',
        id: 'investment-pipeline',
        hint: 'Deal flow and pipeline decisions.',
    },
    {
        icon: IconReceipt,
        label: 'Capital Activities',
        id: 'capital-flows',
        hint: 'Post-deal capital call workflow, notices, and payments.',
    },
    { icon: IconUsers, label: 'Contacts', id: 'contacts' },
    { icon: IconFileText, label: 'Documents', id: 'documents' },
]

interface LeftNavProps {
    activeItem?: string
    onNavItemClick?: (id: string) => void
    navBadges?: Set<string>
    onFojoToggle?: () => void
    fojoUnreadCount?: number
    isFojoOpen?: boolean
}

export function LeftNav({ activeItem = 'home', onNavItemClick, navBadges, onFojoToggle, fojoUnreadCount = 0, isFojoOpen = false }: LeftNavProps) {
    return (
        <nav className="left-nav flex flex-col items-center justify-between shrink-0 py-[var(--spacing-2)]">
            <div className="flex flex-col items-center">
                <div className="left-nav__logo flex items-center justify-center w-[44px]">
                    <img
                        src="https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/446dbae60d5347cefb5d7203a381bca1f6421994?placeholderIfAbsent=true"
                        alt="Way2B1"
                    />
                </div>
                <div className="flex flex-col items-center mt-[var(--spacing-5)] w-[48px]">
                    {navItems.map((item, index) => {
                        const isActive = item.id === activeItem
                        const hasBadge = navBadges?.has(item.id)
                        return (
                            <button
                                key={item.id}
                                title={item.hint ?? item.label}
                                className={`relative flex w-full min-h-[40px] flex-col items-center justify-center overflow-hidden rounded-[var(--radius-md)] px-[var(--spacing-2)] py-[10px] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear hover:bg-[var(--color-neutral-3)]${index > 0 ? ' mt-[var(--spacing-2)]' : ''}${isActive ? ' bg-[var(--color-blue-3)] hover:bg-[var(--color-blue-3)]' : ''}`}
                                onClick={() => onNavItemClick?.(item.id)}
                            >
                                <item.icon
                                    size={20}
                                    stroke={2}
                                    color={isActive ? 'var(--color-accent-9)' : 'var(--color-neutral-11)'}
                                />
                                {hasBadge && <span className="absolute -top-[1px] -right-[1px] h-[10px] w-[10px] rounded-full border-2 border-white bg-[var(--color-red-9)]" />}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="flex flex-col items-center">
                <button title="Report bug" className="flex min-h-[36px] w-[48px] flex-col items-center justify-center overflow-hidden rounded-[var(--radius-md)] p-[var(--spacing-2)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear hover:bg-[var(--color-neutral-3)]">
                    <IconBug size={20} stroke={2} color="var(--color-neutral-11)" />
                </button>
                {/* Fojo AI chat toggle — same mascot + badge as floating FAB, no nav active state */}
                <button
                    title="Open Fojo AI"
                    className="relative mt-[var(--spacing-3)] flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center overflow-visible rounded-full border-none bg-transparent p-0 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
                    onClick={onFojoToggle}
                >
                    <FojoMascot size="100%" className="block rounded-full" animated={!isFojoOpen} />
                    {fojoUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-[var(--radius-md)] bg-[var(--color-red-9)] px-1 text-center text-xs font-bold leading-[18px] text-white shadow-[0_0_0_2px_var(--color-red-1)] animate-badge-pulse">
                            {fojoUnreadCount > 9 ? '9+' : fojoUnreadCount}
                        </span>
                    )}
                </button>
                <button
                    title="User"
                    className="mt-[var(--spacing-3)] flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-none bg-[var(--color-neutral-4)] p-0"
                >
                    <span className="select-none text-sm font-semibold tracking-[0.02em] text-[var(--color-neutral-11)]">SW</span>
                </button>
            </div>
        </nav>
    )
}
