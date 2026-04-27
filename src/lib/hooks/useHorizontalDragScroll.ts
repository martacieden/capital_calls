import { useRef, useState, useCallback } from 'react'

const DRAG_THRESHOLD = 3

export function useHorizontalDragScroll() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const dragState = useRef<{ isDown: boolean; startX: number; scrollLeft: number; hasDragged: boolean }>({
        isDown: false, startX: 0, scrollLeft: 0, hasDragged: false,
    })
    const [isDragging, setIsDragging] = useState(false)

    const handleWheel = useCallback((e: React.WheelEvent) => {
        const el = scrollRef.current
        if (!el) return
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
        const maxScroll = el.scrollWidth - el.clientWidth
        if (maxScroll <= 0) return
        const atStart = el.scrollLeft <= 0 && e.deltaY < 0
        const atEnd = el.scrollLeft >= maxScroll && e.deltaY > 0
        if (atStart || atEnd) return
        e.preventDefault()
        el.scrollBy({ left: e.deltaY * 2, behavior: 'auto' })
    }, [])

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const el = scrollRef.current
        if (!el) return
        dragState.current = { isDown: true, startX: e.clientX, scrollLeft: el.scrollLeft, hasDragged: false }
        el.setPointerCapture(e.pointerId)
        setIsDragging(false)
    }, [])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragState.current.isDown) return
        const dx = e.clientX - dragState.current.startX
        if (Math.abs(dx) > DRAG_THRESHOLD) dragState.current.hasDragged = true
        if (!dragState.current.hasDragged) return
        setIsDragging(true)
        const el = scrollRef.current
        if (el) el.scrollLeft = dragState.current.scrollLeft - dx
    }, [])

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        const wasDragging = dragState.current.hasDragged
        dragState.current.isDown = false
        dragState.current.hasDragged = false
        setIsDragging(false)
        const el = scrollRef.current
        if (el) el.releasePointerCapture(e.pointerId)
        if (wasDragging) {
            const suppress = (ev: Event) => { ev.stopPropagation(); ev.preventDefault() }
            el?.addEventListener('click', suppress, { capture: true, once: true })
        }
    }, [])

    return {
        scrollRef,
        isDragging,
        scrollHandlers: {
            onWheel: handleWheel,
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerCancel: handlePointerUp,
        },
    }
}
