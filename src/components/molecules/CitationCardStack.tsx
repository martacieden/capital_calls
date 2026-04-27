import { useState, useEffect } from 'react'
import { IconFileText, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { PdfCitationPreview, getPdfPath } from './PdfCitationPreview'
import type { Citation } from '@/data/citations'

interface CitationCardStackProps {
    citationGroups: Map<string, Citation[]>
}

export function CitationCardStack({ citationGroups }: CitationCardStackProps) {
    const allCitations: Citation[] = []
    citationGroups.forEach((docCitations) => {
        docCitations.forEach(c => allCitations.push(c))
    })

    const [displayIndex, setDisplayIndex] = useState(0)
    const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)
    const [enterDir, setEnterDir] = useState<'left' | 'right' | null>(null)

    // Preload all PDFs into browser cache on mount so switching is instant
    useEffect(() => {
        allCitations.forEach(c => fetch(getPdfPath(c)).catch(() => {}))
    }, [])

    const total = allCitations.length
    const activeCitation = allCitations[displayIndex]
    const behindCount = Math.min(total - 1, 2)

    const navigate = (dir: 'prev' | 'next') => {
        if (exitDir || enterDir) return
        const exitDirection = dir === 'next' ? 'left' : 'right'
        const enterDirection = dir === 'next' ? 'right' : 'left'
        setExitDir(exitDirection)
        setTimeout(() => {
            setDisplayIndex(i => dir === 'next' ? (i + 1) % total : (i - 1 + total) % total)
            setExitDir(null)
            setEnterDir(enterDirection)
            setTimeout(() => setEnterDir(null), 180)
        }, 150)
    }

    const cardClass = [
        'doc-stack__card',
        exitDir ? `doc-stack__card--exit-${exitDir}` : '',
        enterDir ? `doc-stack__card--enter-from-${enterDir}` : '',
    ].filter(Boolean).join(' ')

    return (
        <div className="doc-stack">
            <div className="doc-stack__stage">
                {behindCount >= 2 && <div className="doc-stack__back doc-stack__back--2" />}
                {behindCount >= 1 && <div className="doc-stack__back doc-stack__back--1" />}

                <div className={cardClass}>
                    <div className="doc-stack__card-header">
                        <div className="doc-stack__card-label">
                            <IconFileText size={18} stroke={1.5} className="doc-stack__card-icon" />
                            <span className="doc-stack__card-name">{activeCitation.documentLabel}</span>
                        </div>
                        <div className="doc-stack__card-meta">
                            {total > 1 && (
                                <span className="doc-stack__counter">{displayIndex + 1} / {total}</span>
                            )}
                            <button className="doc-stack__open-btn">Open</button>
                        </div>
                    </div>

                    <PdfCitationPreview key={displayIndex} citation={activeCitation} />
                </div>
            </div>

            {total > 1 && (
                <div className="doc-stack__nav">
                    <button
                        className="doc-stack__nav-btn"
                        onClick={() => navigate('prev')}
                        disabled={!!(exitDir || enterDir)}
                        aria-label="Previous"
                    >
                        <IconChevronLeft size={14} stroke={2.5} />
                    </button>

                    <div className="doc-stack__dots">
                        {allCitations.map((_, idx) => (
                            <span
                                key={idx}
                                className={`doc-stack__dot${idx === displayIndex ? ' doc-stack__dot--active' : ''}`}
                            />
                        ))}
                    </div>

                    <button
                        className="doc-stack__nav-btn"
                        onClick={() => navigate('next')}
                        disabled={!!(exitDir || enterDir)}
                        aria-label="Next"
                    >
                        <IconChevronRight size={14} stroke={2.5} />
                    </button>
                </div>
            )}
        </div>
    )
}
