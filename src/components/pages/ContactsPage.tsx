import { useState } from 'react'
import {
    IconPlus, IconUser,
    IconBriefcase, IconScale, IconLayoutGrid, IconTable,
} from '@tabler/icons-react'
import { mockContacts } from '@/data/thornton/contacts-data'
import type { Contact } from '@/data/thornton/contacts-data'
import { cn } from '@/lib/utils'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { ToolbarSearchInput } from '@/components/atoms/ToolbarSearchInput'

// ─── avatar initials ──────────────────────────────────────────────────────────

const AVATAR_COLORS = [
    '#005BE2', '#059669', '#7C3AED', '#D97706', '#DC2626', '#0891B2',
]

function getAvatarColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}

function initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

// ─── contact row ─────────────────────────────────────────────────────────────

function ContactRow({ contact }: { contact: Contact }) {
    const color = getAvatarColor(contact.name)
    return (
        <tr className="list-row group">
            <td className="list-cell list-cell--name">
                <div className="flex items-center gap-3">
                    <div
                        className="list-avatar-mini flex items-center justify-center text-[10px] font-semibold text-white"
                        style={{ background: color }}
                    >
                        {initials(contact.name)}
                    </div>
                    <span className="text-[13px] font-semibold text-[var(--color-black)]">{contact.name}</span>
                </div>
            </td>
            <td className="list-cell text-[13px] text-[var(--color-neutral-11)]">{contact.role}</td>
            <td className="list-cell">
                <span className="text-[13px] text-[var(--color-neutral-11)]">
                    {contact.firm}
                </span>
            </td>
            <td className="list-cell">
                <a
                    href={`mailto:${contact.email}`}
                    className="text-[13px] text-[var(--color-accent-9)] hover:underline"
                >
                    {contact.email}
                </a>
            </td>
            <td className="list-cell text-[13px] text-[var(--color-neutral-11)] whitespace-nowrap">
                {contact.phone}
            </td>
        </tr>
    )
}

function ContactCard({ contact }: { contact: Contact }) {
    const color = getAvatarColor(contact.name)
    return (
        <article className="card group flex flex-col gap-[var(--spacing-3)] p-[var(--spacing-5)]">
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[13px] font-semibold text-white"
                style={{ background: color }}
            >
                {initials(contact.name)}
            </div>

            <div className="min-w-0">
                <h3 className="m-0 truncate text-[15px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)]">
                    {contact.name}
                </h3>
                <p className="m-0 mt-1 line-clamp-2 text-[13px] leading-[1.5] text-[var(--color-neutral-11)]">
                    {contact.role}. {contact.specialization}.
                </p>
            </div>

            <span className="mt-auto text-[13px] text-[var(--color-neutral-11)]">{contact.firm}</span>
        </article>
    )
}

// ─── section table ────────────────────────────────────────────────────────────

function ContactSection({
    icon: Icon,
    title,
    contacts,
}: {
    icon: typeof IconScale
    title: string
    contacts: Contact[]
}) {
    if (contacts.length === 0) return null
    return (
        <div className="list-view">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--color-neutral-3)]">
                <Icon size={15} stroke={2} className="text-[var(--color-neutral-9)] shrink-0" />
                <h2 className="m-0 text-[13px] font-semibold text-[var(--color-neutral-11)]">{title}</h2>
                <span className="ml-auto text-[11px] font-medium text-[var(--color-neutral-9)]">{contacts.length}</span>
            </div>
            <table className="list-table">
                <thead>
                    <tr className="list-header-row">
                        <th className="list-header-cell list-header-cell--name" style={{ width: '24%' }}>Name</th>
                        <th className="list-header-cell">Role</th>
                        <th className="list-header-cell">Firm</th>
                        <th className="list-header-cell">Email</th>
                        <th className="list-header-cell">Phone</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map(c => <ContactRow key={c.id} contact={c} />)}
                </tbody>
            </table>
        </div>
    )
}

function ContactCardSection({
    icon: Icon,
    title,
    contacts,
}: {
    icon: typeof IconScale
    title: string
    contacts: Contact[]
}) {
    if (contacts.length === 0) return null
    return (
        <section>
            <div className="mb-3 flex items-center gap-2">
                <Icon size={15} stroke={2} className="shrink-0 text-[var(--color-neutral-9)]" />
                <h2 className="m-0 text-[13px] font-semibold text-[var(--color-neutral-11)]">{title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-[var(--spacing-4)] sm:grid-cols-2 lg:grid-cols-4">
                {contacts.map(contact => <ContactCard key={contact.id} contact={contact} />)}
            </div>
        </section>
    )
}

// ─── main page ────────────────────────────────────────────────────────────────

export function ContactsPage() {
    const [search, setSearch] = useState('')
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
    const contactCount = mockContacts.lawyers.length + mockContacts.accountants.length

    const query = search.toLowerCase()

    function filterContacts(list: Contact[]) {
        if (!query) return list
        return list.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.role.toLowerCase().includes(query) ||
            c.firm.toLowerCase().includes(query) ||
            c.specialization.toLowerCase().includes(query),
        )
    }

    const lawyers = filterContacts(mockContacts.lawyers)
    const accountants = filterContacts(mockContacts.accountants)
    const total = lawyers.length + accountants.length

    return (
        <div className="flex flex-col flex-1 gap-[var(--spacing-5)] pt-9 px-[var(--spacing-6)] pb-[var(--spacing-5)] max-w-[1120px] w-full mx-auto">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <ContentHeader
                title="Contacts"
                itemCount={contactCount}
                onActionClick={() => {}}
                actionLabel="New contact"
                actionIcon={IconPlus}
            />
            <div className="sticky top-[calc(-1*var(--spacing-4))] z-10 bg-[var(--color-white)] pt-[var(--spacing-4)] -mt-[var(--spacing-5)] pb-[var(--spacing-4)] [&>*]:mt-0">
                <div className="flex items-center justify-between flex-wrap gap-[var(--spacing-2)] rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] bg-[var(--color-white)] p-[var(--spacing-2)] shadow-[var(--shadow-toolbar)]">
                    <div className="flex items-center">
                        <ToolbarSearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search contacts..."
                        />
                    </div>
                    <div className="flex items-center gap-0.5">
                        {([
                            { id: 'cards' as const, label: 'Cards', icon: IconLayoutGrid },
                            { id: 'table' as const, label: 'Table', icon: IconTable },
                        ]).map((option) => {
                            const OptionIcon = option.icon
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setViewMode(option.id)}
                                    aria-label={`Show ${option.label.toLowerCase()} view`}
                                    title={option.label}
                                    className={cn(
                                        'flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border-none text-[var(--color-gray-12)] transition-colors',
                                        viewMode === option.id
                                            ? 'bg-[var(--color-accent-3)] text-[var(--color-accent-9)] hover:bg-[var(--color-accent-3)]'
                                            : 'bg-transparent hover:bg-[var(--color-neutral-3)]',
                                    )}
                                >
                                    <OptionIcon size={16} stroke={2} />
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* ── Body ────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-5 flex-1 min-h-0">
                {total === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-neutral-3)] flex items-center justify-center">
                            <IconUser size={20} stroke={1.5} className="text-[var(--color-neutral-9)]" />
                        </div>
                        <p className="m-0 text-[14px] font-semibold text-[var(--color-neutral-11)]">No contacts found</p>
                        <p className="m-0 text-[13px] text-[var(--color-neutral-9)]">Try a different search term.</p>
                    </div>
                ) : (
                    viewMode === 'cards' ? (
                        <>
                            <ContactCardSection
                                icon={IconScale}
                                title="Legal Advisors"
                                contacts={lawyers}
                            />
                            <ContactCardSection
                                icon={IconBriefcase}
                                title="Tax & Accounting"
                                contacts={accountants}
                            />
                        </>
                    ) : (
                        <>
                            <ContactSection
                                icon={IconScale}
                                title="Legal Advisors"
                                contacts={lawyers}
                            />
                            <ContactSection
                                icon={IconBriefcase}
                                title="Tax & Accounting"
                                contacts={accountants}
                            />
                        </>
                    )
                )}
            </div>
        </div>
    )
}
