import { IconAlertTriangle } from '@tabler/icons-react'

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmDialogProps) {
    if (!isOpen) return null

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-[4px] z-[3000]" onClick={onCancel} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-[var(--color-white)] rounded-[var(--radius-2xl)] shadow-[0_24px_64px_rgba(0,0,0,0.15)] z-[3001] p-[var(--spacing-6)] text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-red-1)] flex items-center justify-center mx-auto mb-[var(--spacing-4)]">
                    <IconAlertTriangle size={24} stroke={1.5} color="#dc2626" />
                </div>
                <h3 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-gray-12)] mb-[var(--spacing-2)]">{title}</h3>
                <p className="text-sm text-[var(--color-neutral-11)] leading-[1.5] mb-[var(--spacing-6)]">{message}</p>
                <div className="flex gap-[var(--spacing-3)] justify-center">
                    <button className="confirm-dialog__cancel" onClick={onCancel}>Cancel</button>
                    <button className="confirm-dialog__confirm" onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </>
    )
}
