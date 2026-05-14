/**
 * MockFileBrowser — Modern macOS Finder–style modal (Ventura/Sonoma-era layout).
 * Light chrome, sidebar with blue selection, icon grid with label highlights + list view.
 */

import { useState } from 'react'
import type { ComponentProps } from 'react'
import { createPortal } from 'react-dom'
import {
    IconChevronLeft,
    IconChevronRight,
    IconLayoutGrid,
    IconList,
    IconSearch,
    IconDots,
    IconShare,
    IconTag,
    IconClock,
    IconUsersGroup,
    IconApps,
    IconDeviceDesktop,
    IconFolder,
    IconDownload,
    IconCloud,
    IconTrash,
    IconBroadcast,
} from '@tabler/icons-react'

type TablerIconProps = ComponentProps<typeof IconChevronLeft>

export interface BrowserFile {
    id: string
    fileName: string
    displayName: string
    size: string
    date: string
    kind: string
    scenarioId: string
}

export const BROWSER_FILES: BrowserFile[] = [
    {
        id: 'bf-1',
        fileName: 'dynasty-trust-i-distribution-schedule.pdf',
        displayName: 'Dynasty Trust I — 2025 Distribution Schedule',
        size: '245 KB',
        date: 'Dec 15, 2025',
        kind: 'PDF Document',
        scenarioId: 'scenario-doc-trust',
    },
    {
        id: 'bf-2',
        fileName: 'inventory-list-2026.pdf',
        displayName: 'Thornton Asset Inventory — 2026',
        size: '182 KB',
        date: 'Jan 5, 2026',
        kind: 'PDF Document',
        scenarioId: 'scenario-doc-inventory',
    },
    {
        id: 'bf-3',
        fileName: 'thornton-charitable-donations-2025.pdf',
        displayName: 'Charitable Donation Receipts 2025',
        size: '3.2 MB',
        date: 'Jan 15, 2026',
        kind: 'PDF Document',
        scenarioId: 'scenario-doc-documents',
    },
    {
        id: 'bf-4',
        fileName: 'tesla-model-x-auto-policy.pdf',
        displayName: 'Tesla Model X — Auto Insurance Policy',
        size: '892 KB',
        date: 'Sep 14, 2025',
        kind: 'PDF Document',
        scenarioId: 'scenario-doc-car-insurance',
    },
    {
        id: 'bf-5',
        fileName: 'hamptons-estate-deed.pdf',
        displayName: 'Hamptons Estate — Property Deed',
        size: '1.1 MB',
        date: 'Jun 15, 2024',
        kind: 'PDF Document',
        scenarioId: 'scenario-doc-deed',
    },
    {
        id: 'bf-6',
        fileName: 'hamptons-homeowners-policy.pdf',
        displayName: 'Hamptons Estate — Homeowners Policy',
        size: '1.4 MB',
        date: 'Jan 10, 2025',
        kind: 'PDF Document',
        scenarioId: 'scenario-doc-home-insurance',
    },
]

const MAC_BLUE = '#007AFF'
const MAC_BLUE_BG = 'rgba(0, 122, 255, 0.12)'
const MAC_SIDEBAR = '#F5F5F7'
const MAC_TOOLBAR = '#FAFAFA'
const ICON_GRAY = '#636366'

function PdfThumbnail() {
    return (
        <svg width="72" height="88" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <rect x="4" y="2" width="56" height="72" rx="4" fill="white" stroke="#D2D2D7" strokeWidth="1" />
            <path d="M44 2h8l8 8v12H44V2z" fill="#F5F5F7" stroke="#D2D2D7" strokeWidth="1" strokeLinejoin="round" />
            <rect x="12" y="22" width="36" height="3" rx="1.5" fill="#E5E5EA" />
            <rect x="12" y="28" width="42" height="3" rx="1.5" fill="#E5E5EA" />
            <rect x="12" y="34" width="28" height="3" rx="1.5" fill="#E5E5EA" />
            <rect x="6" y="52" width="52" height="22" rx="3" fill="#FF3B30" />
            <text x="32" y="67" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif">PDF</text>
        </svg>
    )
}

function SidebarRow({
    Icon,
    label,
    selected,
}: {
    Icon: React.ComponentType<TablerIconProps>
    label: string
    selected?: boolean
}) {
    const color = selected ? MAC_BLUE : ICON_GRAY
    return (
        <div
            className="flex items-center gap-2 mx-2 px-2 py-[5px] rounded-md cursor-default"
            style={{
                background: selected ? MAC_BLUE_BG : undefined,
            }}
        >
            <Icon size={16} stroke={1.75} color={color} className="shrink-0" />
            <span
                className="text-[13px] leading-snug tracking-[-0.01em]"
                style={{ color, fontWeight: selected ? 600 : 400 }}
            >
                {label}
            </span>
        </div>
    )
}

const SIDEBAR_TOP: { label: string; Icon: React.ComponentType<TablerIconProps> }[] = [
    { label: 'Recents', Icon: IconClock },
    { label: 'Shared', Icon: IconUsersGroup },
]
const SIDEBAR_FAV: { label: string; Icon: React.ComponentType<TablerIconProps> }[] = [
    { label: 'Applications', Icon: IconApps },
    { label: 'Desktop', Icon: IconDeviceDesktop },
    { label: 'Documents', Icon: IconFolder },
    { label: 'Downloads', Icon: IconDownload },
]
const SIDEBAR_LOC: { label: string; Icon: React.ComponentType<TablerIconProps>; selected?: boolean }[] = [
    { label: 'iCloud Drive', Icon: IconCloud },
    { label: 'AirDrop', Icon: IconBroadcast },
    { label: 'Thornton Documents', Icon: IconFolder, selected: true },
    { label: 'Trash', Icon: IconTrash },
]

function SectionTitle({ children }: { children: string }) {
    return (
        <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#8E8E93]">
            {children}
        </div>
    )
}

interface MockFileBrowserProps {
    onFileSelect: (scenarioId: string, file: { id: string; name: string }) => void
    onClose: () => void
}

export function MockFileBrowser({ onFileSelect, onClose }: MockFileBrowserProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'icon' | 'list'>('icon')

    const selectedFile = BROWSER_FILES.find(f => f.id === selectedId) ?? null

    const handleOpen = () => {
        if (!selectedFile) return
        onFileSelect(selectedFile.scenarioId, { id: selectedFile.id, name: selectedFile.fileName })
    }

    const font =
        '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif'

    return createPortal(
        <div
            className="fixed inset-0 z-[12000] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(20px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                className="flex flex-col overflow-hidden select-none w-full max-w-[920px] h-[min(560px,85vh)]"
                style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(0,0,0,0.06)',
                    fontFamily: font,
                }}
            >
                {/* Window chrome */}
                <div
                    className="flex items-center shrink-0 h-11 px-3 gap-3"
                    style={{
                        background: MAC_SIDEBAR,
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                    }}
                >
                    <div className="flex items-center gap-2 shrink-0 pl-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-3 h-3 rounded-full flex items-center justify-center group border-0 p-0 cursor-default"
                            style={{ background: '#FF5F57', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.12)' }}
                            aria-label="Close"
                        >
                            <svg width="6" height="6" viewBox="0 0 6 6" className="opacity-0 group-hover:opacity-100">
                                <path d="M1 1l4 4M5 1L1 5" stroke="#590000" strokeWidth="1" strokeLinecap="round" />
                            </svg>
                        </button>
                        <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.12)' }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.12)' }} />
                    </div>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Sidebar */}
                    <div
                        className="flex flex-col shrink-0 w-[192px] overflow-y-auto pb-2"
                        style={{
                            background: MAC_SIDEBAR,
                            borderRight: '1px solid rgba(0,0,0,0.06)',
                        }}
                    >
                        {SIDEBAR_TOP.map(({ label, Icon }) => (
                            <SidebarRow key={label} Icon={Icon} label={label} />
                        ))}
                        <SectionTitle>Favorites</SectionTitle>
                        {SIDEBAR_FAV.map(({ label, Icon }) => (
                            <SidebarRow key={label} Icon={Icon} label={label} />
                        ))}
                        <SectionTitle>Locations</SectionTitle>
                        {SIDEBAR_LOC.map(({ label, Icon, selected }) => (
                            <SidebarRow key={label} Icon={Icon} label={label} selected={selected} />
                        ))}
                    </div>

                    {/* Main */}
                    <div className="flex flex-col flex-1 min-w-0 min-h-0 bg-white">
                        {/* Toolbar */}
                        <div
                            className="flex items-center gap-2 px-3 py-2 shrink-0"
                            style={{ background: MAC_TOOLBAR, borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                        >
                            <div className="flex items-center gap-0.5">
                                <button type="button" className="w-7 h-7 flex items-center justify-center rounded opacity-35 cursor-not-allowed text-[#3C3C43]" aria-disabled>
                                    <IconChevronLeft size={18} stroke={1.75} />
                                </button>
                                <button type="button" className="w-7 h-7 flex items-center justify-center rounded opacity-35 cursor-not-allowed text-[#3C3C43]" aria-disabled>
                                    <IconChevronRight size={18} stroke={1.75} />
                                </button>
                            </div>
                            <span className="text-[13px] font-semibold text-[#1D1D1F] tracking-[-0.02em] ml-1">
                                Thornton Documents
                            </span>
                            <div className="flex-1" />
                            <div
                                className="flex rounded-md overflow-hidden p-0.5"
                                style={{ background: 'rgba(0,0,0,0.05)' }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setViewMode('icon')}
                                    className="w-7 h-7 flex items-center justify-center rounded"
                                    style={{
                                        background: viewMode === 'icon' ? '#fff' : 'transparent',
                                        boxShadow: viewMode === 'icon' ? '0 1px 3px rgba(0,0,0,0.12)' : undefined,
                                    }}
                                    aria-pressed={viewMode === 'icon'}
                                >
                                    <IconLayoutGrid size={16} stroke={1.75} color="#3C3C43" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className="w-7 h-7 flex items-center justify-center rounded"
                                    style={{
                                        background: viewMode === 'list' ? '#fff' : 'transparent',
                                        boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.12)' : undefined,
                                    }}
                                    aria-pressed={viewMode === 'list'}
                                >
                                    <IconList size={16} stroke={1.75} color="#3C3C43" />
                                </button>
                            </div>
                            <button type="button" className="w-7 h-7 flex items-center justify-center rounded-md text-[#636366] hover:bg-black/[0.05]">
                                <IconShare size={17} stroke={1.5} />
                            </button>
                            <button type="button" className="w-7 h-7 flex items-center justify-center rounded-md text-[#636366] hover:bg-black/[0.05]">
                                <IconTag size={17} stroke={1.5} />
                            </button>
                            <button type="button" className="w-7 h-7 flex items-center justify-center rounded-md text-[#636366] hover:bg-black/[0.05]">
                                <IconDots size={17} stroke={1.5} />
                            </button>
                            <div
                                className="flex items-center gap-1 rounded-[var(--radius-lg)] px-2 h-7 ml-1 min-w-[140px]"
                                style={{ background: 'rgba(0,0,0,0.06)' }}
                            >
                                <IconSearch size={14} stroke={2} color="#8E8E93" />
                                <span className="text-[13px] text-[#8E8E93]">Search</span>
                            </div>
                        </div>

                        {/* Content */}
                        {viewMode === 'icon' ? (
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                <div
                                    className="grid gap-x-4 gap-y-6"
                                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))' }}
                                >
                                    {BROWSER_FILES.map((file) => {
                                        const isSelected = file.id === selectedId
                                        return (
                                            <button
                                                key={file.id}
                                                type="button"
                                                onClick={() => setSelectedId(file.id)}
                                                onDoubleClick={handleOpen}
                                                className="flex flex-col items-stretch gap-2 p-1 rounded-[var(--radius-lg)] border-0 bg-transparent cursor-default text-left min-w-0"
                                            >
                                                <div className="flex justify-center pointer-events-none">
                                                    <PdfThumbnail />
                                                </div>
                                                <div className="flex justify-center px-0.5 min-h-[2.75rem]">
                                                    <span
                                                        className="text-center text-[12px] leading-[1.3] line-clamp-3 px-1.5 py-0.5 rounded-md max-w-full"
                                                        style={{
                                                            background: isSelected ? MAC_BLUE : undefined,
                                                            color: isSelected ? '#fff' : '#1D1D1F',
                                                            fontWeight: isSelected ? 500 : 400,
                                                        }}
                                                    >
                                                        {file.displayName}
                                                    </span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                <div
                                    className="grid shrink-0 px-4 py-1.5 text-[11px] font-medium text-[#8E8E93] uppercase tracking-wide border-b border-black/[0.06]"
                                    style={{ gridTemplateColumns: '1fr 88px 72px 100px' }}
                                >
                                    <span>Name</span>
                                    <span>Date</span>
                                    <span>Size</span>
                                    <span>Kind</span>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {BROWSER_FILES.map((file) => {
                                        const isSelected = file.id === selectedId
                                        return (
                                            <button
                                                key={file.id}
                                                type="button"
                                                onClick={() => setSelectedId(file.id)}
                                                onDoubleClick={handleOpen}
                                                className="grid w-full items-center px-4 py-2 text-left border-0 border-b border-black/[0.04] cursor-default"
                                                style={{
                                                    gridTemplateColumns: '1fr 88px 72px 100px',
                                                    background: isSelected ? MAC_BLUE_BG : undefined,
                                                }}
                                            >
                                                <span className="text-[13px] text-[#1D1D1F] truncate pr-2" style={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? MAC_BLUE : undefined }}>
                                                    {file.displayName}
                                                </span>
                                                <span className="text-[12px] text-[#8E8E93]">{file.date}</span>
                                                <span className="text-[12px] text-[#8E8E93]">{file.size}</span>
                                                <span className="text-[12px] text-[#8E8E93]">{file.kind}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div
                            className="flex items-center justify-between px-4 py-3 shrink-0"
                            style={{
                                background: '#FAFAFA',
                                borderTop: '1px solid rgba(0,0,0,0.06)',
                            }}
                        >
                            <span className="text-[12px] text-[#8E8E93] font-mono truncate pr-4">
                                {selectedFile ? selectedFile.fileName : `${BROWSER_FILES.length} items`}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 h-8 rounded-md text-[13px] text-[#1D1D1F]"
                                    style={{ background: '#fff', border: '1px solid #D2D2D7' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleOpen}
                                    disabled={!selectedFile}
                                    className="px-5 h-8 rounded-md text-[13px] font-medium text-white disabled:opacity-45"
                                    style={{ background: MAC_BLUE, border: 'none' }}
                                >
                                    Open
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
