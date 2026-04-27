import { useState, useRef } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'
import { ToolbarButton } from './ToolbarButton'

interface ToolbarSearchInputProps {
    value: string
    onChange: (query: string) => void
    placeholder?: string
}

export function ToolbarSearchInput({ value, onChange, placeholder = 'Search items…' }: ToolbarSearchInputProps) {
    const [searchOpen, setSearchOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <div className={`flex items-center rounded-[var(--radius-md)] transition-[background_0.15s,width_0.2s_ease]${searchOpen || value ? ' bg-[var(--color-neutral-3)] pr-1.5' : ''}`}>
            <ToolbarButton
                icon={<IconSearch size={16} stroke={2} color="var(--color-neutral-11)" />}
                label={!searchOpen && !value ? 'Search' : undefined}
                className={searchOpen || value ? 'pr-0' : undefined}
                onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
            />
            {(searchOpen || value) && (
                <>
                    <input
                        ref={inputRef}
                        className="w-[140px] border-none bg-transparent px-1 text-[13px] font-[var(--font-weight-medium)] leading-[1.54] text-[var(--color-gray-12)] outline-none placeholder:text-[var(--color-neutral-11)]"
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Escape') { onChange(''); setSearchOpen(false) } }}
                        onBlur={() => { if (!value) setSearchOpen(false) }}
                    />
                    {value && (
                        <button
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--color-neutral-11)] hover:bg-[var(--color-neutral-4)]"
                            onClick={() => { onChange(''); inputRef.current?.focus() }}
                        >
                            <IconX size={14} stroke={2} />
                        </button>
                    )}
                </>
            )}
        </div>
    )
}
