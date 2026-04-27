import { useState, useEffect, useCallback } from 'react'
import { IconCheck, IconX } from '@tabler/icons-react'

type ToastType = 'success' | 'error' | 'loading'

interface ToastAction {
    label: string
    onClick: () => void
}

interface ToastMessage {
    id: number
    text: string
    type: ToastType
    action?: ToastAction
}

let toastId = 0
let addToastFn: ((text: string, type?: ToastType, action?: ToastAction) => number) | null = null
let updateToastFn: ((id: number, text: string, type: ToastType, action?: ToastAction) => void) | null = null

export function showToast(text: string, type: ToastType = 'success', action?: ToastAction): number {
    return addToastFn?.(text, type, action) ?? 0
}

export function updateToast(id: number, text: string, type: ToastType, action?: ToastAction) {
    updateToastFn?.(id, text, type, action)
}

export function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const scheduleRemoval = useCallback((id: number, action?: ToastAction) => {
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, action ? 8000 : 6000)
    }, [])

    const addToast = useCallback((text: string, type: ToastType = 'success', action?: ToastAction): number => {
        const id = ++toastId
        setToasts(prev => [...prev, { id, text, type, action }])
        if (type !== 'loading') {
            scheduleRemoval(id, action)
        }
        return id
    }, [scheduleRemoval])

    const handleUpdateToast = useCallback((id: number, text: string, type: ToastType, action?: ToastAction) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, text, type, action } : t))
        if (type !== 'loading') {
            scheduleRemoval(id, action)
        }
    }, [scheduleRemoval])

    useEffect(() => {
        addToastFn = addToast
        updateToastFn = handleUpdateToast
        return () => { addToastFn = null; updateToastFn = null }
    }, [addToast, handleUpdateToast])

    if (toasts.length === 0) return null

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[5000] flex flex-col gap-[var(--spacing-2)] pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast--${toast.type}`}>
                    {toast.type === 'success' && <IconCheck size={16} stroke={2.5} />}
                    {toast.type === 'error' && <IconX size={16} stroke={2.5} />}
                    {toast.type === 'loading' && <div className="toast__spinner" />}
                    <span>{toast.text}</span>
                    {toast.action && (
                        <button className="toast__action" onClick={toast.action.onClick}>
                            {toast.action.label}
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}
