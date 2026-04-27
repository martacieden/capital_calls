import { useState, useEffect } from 'react'
import * as Icons from '@tabler/icons-react'
import { IconFileTypePdf } from '@tabler/icons-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import type { DocumentRecord } from '@/data/thornton/documents-data'
import { DetailPanelShell } from '@/components/molecules/DetailPanelShell'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

export function DocumentDetailPanel({ doc, isOpen, onClose, isTrustDoc, onViewTimeline }: {
    doc: DocumentRecord | null
    isOpen: boolean
    onClose: () => void
    isTrustDoc: boolean
    onViewTimeline?: () => void
}) {
    const [pdfError, setPdfError] = useState(false)
    const [zoom, setZoom] = useState(1)

    useEffect(() => {
        setPdfError(false)
        setZoom(1)
    }, [doc?.id])

    if (!doc) return null

    return (
        <DetailPanelShell
            isOpen={isOpen}
            onClose={onClose}
            breadcrumbs={
                <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
                    <span className="detail-breadcrumb-segment">
                        <button type="button" className="detail-breadcrumb-item detail-breadcrumb-item--root" onClick={onClose}>
                            Documents
                        </button>
                    </span>
                    <span className="detail-breadcrumb-segment detail-breadcrumb-segment--truncate">
                        <Icons.IconChevronRight size={14} stroke={2} className="detail-breadcrumb-separator" />
                        <span className="detail-breadcrumb-item detail-breadcrumb-item--current" title={doc.name}>{doc.name}</span>
                    </span>
                </nav>
            }
            footer={isTrustDoc && onViewTimeline ? (
                <div className="shrink-0 flex items-center justify-end gap-[var(--spacing-2)] py-[var(--spacing-4)] pr-[var(--spacing-5)] pb-6 pl-4 border-t border-[var(--color-gray-4)]">
                    <button className="inline-flex items-center gap-[var(--spacing-2)] py-1.5 px-3.5 text-[13px] font-[var(--font-weight-medium)] text-[var(--color-gray-12)] bg-white border border-[var(--color-gray-4)] rounded-[var(--radius-md)] cursor-pointer transition-[background] duration-150 hover:bg-[var(--color-neutral-2)]" onClick={onViewTimeline}>
                        <Icons.IconCalendarEvent size={16} stroke={2} />
                        View in timeline
                    </button>
                </div>
            ) : undefined}
        >
            <div className="detail-title-section mb-[var(--spacing-6)]">
                <div className="flex-1 min-w-0">
                    <button className="detail-name-link" title="Open full record">
                        <h2 className="detail-name font-display text-[24px] font-[var(--font-weight-bold)] text-[var(--color-gray-12)] leading-[1.2] [-webkit-text-stroke:0.3px_currentColor] whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{doc.name}</h2>
                        <Icons.IconExternalLink size={24} stroke={2} className="detail-name-link__icon" />
                    </button>
                    <p className="detail-description text-sm leading-[1.6] text-[var(--color-neutral-11)] mt-[var(--spacing-3)] line-clamp-2">{doc.description}</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 rounded-[var(--radius-md)] border border-[var(--color-gray-4)] overflow-hidden bg-[var(--color-neutral-2)] relative flex flex-col">
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[2] flex gap-1 bg-white border border-[var(--color-gray-4)] rounded-[var(--radius-md)] p-1 shadow-[var(--shadow-subtle)]">
                    <button className="flex items-center justify-center w-9 h-9 bg-[var(--color-white)] border-none text-[var(--color-neutral-11)] transition-colors duration-150 hover:bg-[var(--color-neutral-3)]" onClick={() => setZoom(z => Math.min(z + 0.25, 3))} title="Zoom in">
                        <Icons.IconPlus size={16} stroke={2} />
                    </button>
                    <button className="flex items-center justify-center w-9 h-9 bg-[var(--color-white)] border-none text-[var(--color-neutral-11)] transition-colors duration-150 hover:bg-[var(--color-neutral-3)]" onClick={() => setZoom(z => Math.max(z - 0.25, 1))} title="Zoom out">
                        <Icons.IconMinus size={16} stroke={2} />
                    </button>
                </div>
                <div className="flex-1 overflow-auto [&_canvas]:block" style={{ scrollbarWidth: 'thin' }}>
                    {doc.thumbnailPdf && !pdfError ? (
                        <div style={{ transformOrigin: 'top left', transform: `scale(${zoom})` }}>
                            <Document
                                file={doc.thumbnailPdf}
                                loading={<div className="aspect-[8.5/11] bg-[var(--color-neutral-3)] animate-[shimmer_1.5s_infinite]" />}
                                onLoadError={() => setPdfError(true)}
                            >
                                <Page pageNumber={1} width={450} renderTextLayer={false} renderAnnotationLayer={false} />
                            </Document>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-[var(--spacing-3)] p-[var(--spacing-8)] text-[var(--color-neutral-11)] text-[13px] flex-1">
                            <IconFileTypePdf size={48} stroke={1.2} color="var(--color-accent-9)" />
                            <span>{doc.fileName}</span>
                        </div>
                    )}
                </div>
            </div>
        </DetailPanelShell>
    )
}
