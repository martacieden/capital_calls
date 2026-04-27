import {
    IconFileTypePdf,
    IconLink,
} from '@tabler/icons-react'
import type { DocumentRecord } from '@/data/thornton/documents-data'
import { formatDate } from '@/lib/helpers/format'
import { PriorityBadge, ALERT_TYPES } from '@/components/atoms/PriorityBadge'

export function DocumentRow({ doc, onClick, hideType }: { doc: DocumentRecord; index?: number; onClick?: () => void; hideType?: boolean }) {
    return (
        <tr className="list-row" onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
            <td className="list-cell list-cell--name">
                <div className="list-avatar-mini" style={{ background: 'var(--color-blue-1)' }}>
                    <IconFileTypePdf size={14} stroke={1.5} color="var(--color-accent-9)" />
                </div>
                <span style={{ whiteSpace: 'nowrap' }}>{doc.name}</span>
                {doc.priorityStatus && ALERT_TYPES.has(doc.priorityStatus.type) && (
                    <PriorityBadge status={doc.priorityStatus} />
                )}
            </td>
            <td className="list-cell" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260, color: 'var(--color-neutral-11)', fontSize: 13 }}>
                {doc.description}
            </td>
            {!hideType && (
                <td className="list-cell" style={{ whiteSpace: 'nowrap' }}>
                    <span className="inline-flex px-2 py-0.5 rounded-[var(--radius-2xl)] text-xs font-[var(--font-weight-bold)]" style={{ background: 'var(--color-blue-1)', color: 'var(--color-accent-9)' }}>
                        {doc.fileType}
                    </span>
                </td>
            )}
            <td className="list-cell" style={{ whiteSpace: 'nowrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-accent-9)', fontWeight: 600 }}>
                    <IconLink size={13} stroke={2} />
                    {doc.attachedItemIds.length}
                </span>
            </td>
            <td className="list-cell" style={{ whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, borderRadius: 9999, fontSize: 12, fontWeight: 800,
                        background: 'var(--color-neutral-3)', color: 'var(--color-neutral-11)',
                    }}>
                        {doc.uploadedBy.initials}
                    </span>
                    <span style={{ fontSize: 13 }}>{doc.uploadedBy.name}</span>
                </div>
            </td>
            <td className="list-cell text-[var(--color-gray-12)] text-sm" style={{ whiteSpace: 'nowrap' }}>
                {formatDate(doc.uploadedOn)}
            </td>
        </tr>
    )
}
