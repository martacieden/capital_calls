import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { IconPlus, IconMinus } from '@tabler/icons-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import type { Citation } from '@/data/citations'
import { usePdfZoomPan } from '@/lib/hooks/usePdfZoomPan'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

function slugify(name: string): string {
    return name.replace(/\.pdf$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
}

export function getPdfPath(citation: Pick<Citation, 'documentName' | 'page' | 'itemId'>): string {
    return `/documents/${slugify(citation.documentName)}-p${citation.page}-${citation.itemId}.pdf`
}

interface PdfCitationPreviewProps {
    citation: Citation
}

export function PdfCitationPreview({ citation }: PdfCitationPreviewProps) {
    const { page, excerpt, highlightedText } = citation
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
    const [containerWidth, setContainerWidth] = useState(0)
    const measureRef = useRef<HTMLDivElement>(null)
    const zp = usePdfZoomPan(1, 2.5, 1.3)

    const pdfPath = getPdfPath(citation)

    useEffect(() => {
        const el = measureRef.current
        if (!el) return
        const ro = new ResizeObserver(([entry]) => {
            setContainerWidth(Math.floor(entry.contentRect.width))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    if (status === 'error') {
        const hlIndex = excerpt.indexOf(highlightedText)
        let excerptContent: React.ReactNode
        if (hlIndex >= 0) {
            const before = excerpt.slice(0, hlIndex)
            const after = excerpt.slice(hlIndex + highlightedText.length)
            excerptContent = (
                <>
                    {before}
                    <mark className="pdf-page__mark">{highlightedText}</mark>
                    {after}
                </>
            )
        } else {
            excerptContent = excerpt
        }

        return (
            <div className="pdf-page">
                <div className="pdf-page__content">
                    <div className="pdf-page__excerpt">{excerptContent}</div>
                </div>
                <div className="pdf-page__footer">
                    <span className="pdf-page__number">Page {page}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="pdf-page">
            <div className="pdf-page__canvas pdf-page__canvas--zoomed" ref={(el) => { measureRef.current = el; zp.containerRef.current = el }}>
                {(status === 'loading' || !containerWidth) && (
                    <div className="pdf-page__skeleton">
                        <div className="pdf-page__skeleton-bar pdf-page__skeleton-bar--heading" style={{ width: '45%' }} />
                        <div className="pdf-page__skeleton-spacer" />
                        <div className="pdf-page__skeleton-bar" style={{ width: '100%' }} />
                        <div className="pdf-page__skeleton-bar" style={{ width: '97%' }} />
                        <div className="pdf-page__skeleton-bar" style={{ width: '100%' }} />
                        <div className="pdf-page__skeleton-bar" style={{ width: '92%' }} />
                        <div className="pdf-page__skeleton-bar" style={{ width: '100%' }} />
                        <div className="pdf-page__skeleton-bar" style={{ width: '88%' }} />
                        <div className="pdf-page__skeleton-bar" style={{ width: '100%' }} />
                        <div className="pdf-page__skeleton-bar" style={{ width: '60%' }} />
                    </div>
                )}
                {containerWidth > 0 && (
                    <div style={zp.style}>
                        <Document
                            file={pdfPath}
                            loading={null}
                            onLoadSuccess={() => setStatus('ready')}
                            onLoadError={() => setStatus('error')}
                        >
                            <Page
                                pageNumber={1}
                                width={containerWidth}
                                devicePixelRatio={Math.max(window.devicePixelRatio, 2)}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Document>
                    </div>
                )}
            </div>
            <div className="pdf-page__zoom-controls">
                <button className="flex items-center justify-center w-9 h-9 bg-[var(--color-white)] border-none text-[var(--color-neutral-11)] transition-colors duration-150 hover:bg-[var(--color-neutral-3)]" onClick={zp.zoomIn} title="Zoom in">
                    <IconPlus size={16} stroke={2} />
                </button>
                <button className="flex items-center justify-center w-9 h-9 bg-[var(--color-white)] border-none text-[var(--color-neutral-11)] transition-colors duration-150 hover:bg-[var(--color-neutral-3)]" onClick={zp.zoomOut} title="Zoom out">
                    <IconMinus size={16} stroke={2} />
                </button>
            </div>
            <div className="pdf-page__footer">
                <span className="pdf-page__number">Page {page}</span>
            </div>
        </div>
    )
}
