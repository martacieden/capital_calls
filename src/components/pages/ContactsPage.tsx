import { useState } from 'react'
import {
    IconPlus, IconMail, IconPhone, IconSearch, IconUser,
    IconBriefcase, IconScale,
} from '@tabler/icons-react'
import { mockContacts } from '@/data/thornton/contacts-data'
import type { Contact } from '@/data/thornton/contacts-data'

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
        <tr className="group border-b border-[var(--color-neutral-3)] last:border-0 hover:bg-[var(--color-neutral-2)] transition-colors">
            <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                        style={{ background: color }}
                    >
                        {initials(contact.name)}
                    </div>
                    <span className="text-[13px] font-semibold text-[var(--color-black)]">{contact.name}</span>
                </div>
            </td>
            <td className="px-4 py-3 text-[13px] text-[var(--color-neutral-10)]">{contact.role}</td>
            <td className="px-4 py-3">
                <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-neutral-10)]">
                    <IconBriefcase size={13} stroke={1.8} className="shrink-0" />
                    {contact.firm}
                </span>
            </td>
            <td className="px-4 py-3">
                <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1.5 text-[12px] text-[var(--color-accent-9)] hover:underline"
                >
                    <IconMail size={13} stroke={1.8} className="shrink-0" />
                    {contact.email}
                </a>
            </td>
            <td className="px-5 py-3 text-[12px] text-[var(--color-neutral-10)] whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                    <IconPhone size={13} stroke={1.8} className="shrink-0" />
                    {contact.phone}
                </span>
            </td>
        </tr>
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
        <div className="bg-white border border-[var(--color-neutral-4)] rounded-[var(--radius-xl)] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--color-neutral-3)]">
                <Icon size={15} stroke={2} className="text-[var(--color-neutral-9)] shrink-0" />
                <h2 className="m-0 text-[13px] font-semibold text-[var(--color-neutral-11)]">{title}</h2>
                <span className="ml-auto text-[11px] font-medium text-[var(--color-neutral-9)]">{contacts.length}</span>
            </div>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-[var(--color-neutral-3)]">
                        <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-neutral-9)] w-[220px]">Name</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-neutral-9)]">Role</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-neutral-9)]">Firm</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-neutral-9)]">Email</th>
                        <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-neutral-9)]">Phone</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map(c => <ContactRow key={c.id} contact={c} />)}
                </tbody>
            </table>
        </div>
    )
}

// ─── main page ────────────────────────────────────────────────────────────────

export function ContactsPage() {
    const [search, setSearch] = useState('')

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
        <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="px-[var(--spacing-6)] pt-[36px] pb-0 bg-white shrink-0 border-b border-[var(--color-gray-4)]">
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-neutral-9)] m-0 mb-1">
                            People
                        </p>
                        <h1
                            className="m-0 text-[28px] font-bold tracking-[-0.02em] text-[var(--color-black)] leading-none"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            Contacts
                        </h1>
                        <p className="m-0 mt-1.5 text-[13px] text-[var(--color-neutral-10)]">
                            Legal, tax, and financial advisors across the Thornton family office.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="shrink-0 flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-accent-9)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-accent-10)] transition-colors"
                    >
                        <IconPlus size={15} stroke={2.5} />
                        New Contact
                    </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 mb-4 max-w-[360px]">
                    <div className="relative flex-1">
                        <IconSearch
                            size={14}
                            stroke={2}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-9)] pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Search by name, role, or firm…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full rounded-[var(--radius-md)] border border-[var(--color-neutral-4)] bg-white pl-8 pr-3 py-1.5 text-[13px] text-[var(--color-black)] placeholder:text-[var(--color-neutral-8)] focus:outline-none focus:border-[var(--color-accent-9)] transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* ── Body ────────────────────────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-[var(--color-white)]">
                <div className="flex flex-col gap-4 px-[var(--spacing-6)] py-5 max-w-[1120px] w-full mx-auto">

                    {total === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-neutral-3)] flex items-center justify-center">
                                <IconUser size={20} stroke={1.5} className="text-[var(--color-neutral-9)]" />
                            </div>
                            <p className="m-0 text-[14px] font-semibold text-[var(--color-neutral-11)]">No contacts found</p>
                            <p className="m-0 text-[13px] text-[var(--color-neutral-9)]">Try a different search term.</p>
                        </div>
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
                    )}
                </div>
            </div>
        </div>
    )
}
