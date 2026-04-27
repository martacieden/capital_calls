import { useState, useCallback } from 'react'
import {
    IconDots,
} from '@tabler/icons-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import type { DocumentRecord } from '@/data/thornton/documents-data'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()
import { formatDate } from '@/lib/helpers/format'
import { PriorityBadge, ALERT_TYPES } from '@/components/atoms/PriorityBadge'

// Module-level cache: doc id → data URL of rendered first page
const thumbnailCache = new Map<string, string>()

export function DocumentCard({ doc, onClick }: { doc: DocumentRecord; onClick?: () => void }) {
    const [pdfError, setPdfError] = useState(false)
    const cached = thumbnailCache.get(doc.id)

    const handleRenderSuccess = useCallback(() => {
        if (thumbnailCache.has(doc.id)) return
        // Find the canvas rendered by react-pdf and cache it as a data URL
        setTimeout(() => {
            const canvas = document.querySelector(`[data-doc-id="${doc.id}"] canvas`) as HTMLCanvasElement | null
            if (canvas) {
                try {
                    thumbnailCache.set(doc.id, canvas.toDataURL('image/png'))
                } catch { /* cross-origin or tainted canvas — ignore */ }
            }
        }, 100)
    }, [doc.id])

    return (
        <div className="card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
            {doc.priorityStatus && ALERT_TYPES.has(doc.priorityStatus.type) && (
                <div className="absolute top-2 right-2 z-[1]">
                    <PriorityBadge status={doc.priorityStatus} compact />
                </div>
            )}
            <div className="card__image w-full aspect-[1.67] overflow-hidden bg-[var(--color-neutral-3)] flex items-center justify-center" data-doc-id={doc.id}>
                {cached ? (
                    <img src={cached} alt="" className="w-full h-full object-cover object-top" />
                ) : doc.thumbnailPdf && !pdfError ? (
                    <Document
                        file={doc.thumbnailPdf}
                        loading={<div className="card__image--placeholder" />}
                        onLoadError={() => setPdfError(true)}
                    >
                        <Page
                            pageNumber={1}
                            width={340}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            onRenderSuccess={handleRenderSuccess}
                        />
                    </Document>
                ) : (
                    <div className="card__image--placeholder" />
                )}
            </div>
            <div className="flex flex-col overflow-hidden flex-1 justify-between border-t border-[var(--color-gray-4)] px-[var(--spacing-4)] pt-[var(--spacing-2)] pb-[var(--spacing-4)]">
                <div className="flex items-start gap-[var(--spacing-2)]">
                    <div className="flex flex-col flex-1 min-w-0 pt-[var(--spacing-1)]">
                        <div className="card__name flex items-center gap-1.5 text-[var(--color-neutral-12)] text-[15px] font-[var(--font-weight-semibold)] leading-[1.47] tracking-[-0.01px] overflow-hidden">
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">{doc.name}</span>
                        </div>
                        <div className="text-[var(--color-neutral-11)] text-xs font-[var(--font-weight-medium)] leading-5">
                            Document
                        </div>
                    </div>
                    <button className="card__menu-btn flex justify-center items-center aspect-square rounded-[var(--radius-sm)] min-h-7 w-7 overflow-hidden shrink-0 transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]" onClick={(e) => e.stopPropagation()}>
                        <IconDots size={16} stroke={2} color="var(--color-neutral-11)" />
                    </button>
                </div>
                <div className="card__description text-[var(--color-neutral-12)] text-[13px] font-[var(--font-weight-regular)] leading-[22px] mt-[var(--spacing-2)] line-clamp-2">{doc.description}</div>
                <div className="flex items-center gap-[var(--spacing-2)] mt-[var(--spacing-2)] pt-[var(--spacing-1)]">
                    <div className="rounded-full w-6 h-6 overflow-hidden shrink-0 border-2 border-[var(--color-white)] flex items-center justify-center bg-[var(--color-neutral-3)] text-xs font-[var(--font-weight-medium)] text-[var(--color-gray-11)] tracking-[0.04px] leading-[1.2]">
                        {doc.uploadedBy.initials}
                    </div>
                    <span className="text-[var(--color-neutral-11)] text-xs font-[var(--font-weight-medium)] leading-5">
                        Uploaded on {formatDate(doc.uploadedOn)}
                    </span>
                </div>
            </div>
        </div>
    )
}
