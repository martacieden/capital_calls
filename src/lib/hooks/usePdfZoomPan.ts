import { useState, useCallback, useRef, useEffect } from 'react'

interface ZoomPanState {
    zoom: number
    panX: number
    panY: number
}

export function usePdfZoomPan(minZoom = 1, maxZoom = 2.5, defaultZoom = 1) {
    const [state, setState] = useState<ZoomPanState>({ zoom: defaultZoom, panX: 0, panY: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const stateRef = useRef(state)
    stateRef.current = state

    // Use native event listener for preventDefault (React synthetic events are passive)
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handler = (e: WheelEvent) => {
            const prev = stateRef.current

            if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
                e.stopPropagation()
                const delta = -e.deltaY * 0.01
                const newZoom = Math.min(maxZoom, Math.max(minZoom, prev.zoom + delta))
                if (newZoom <= minZoom) {
                    setState({ zoom: minZoom, panX: 0, panY: 0 })
                } else {
                    setState(p => ({ ...p, zoom: newZoom }))
                }
                return
            }

            if (prev.zoom > minZoom) {
                e.preventDefault()
                e.stopPropagation()
                setState(p => ({
                    ...p,
                    panX: p.panX - e.deltaX,
                    panY: p.panY - e.deltaY,
                }))
            }
        }

        el.addEventListener('wheel', handler, { passive: false })
        return () => el.removeEventListener('wheel', handler)
    }, [minZoom, maxZoom])

    // React onWheel for components that can't use ref
    const handleWheel = useCallback((_: React.WheelEvent) => {
        // handled by native listener via containerRef
    }, [])

    const zoomIn = useCallback(() => {
        setState(prev => ({ ...prev, zoom: Math.min(maxZoom, prev.zoom + 0.15) }))
    }, [maxZoom])

    const zoomOut = useCallback(() => {
        setState(prev => {
            const newZoom = Math.max(minZoom, prev.zoom - 0.15)
            if (newZoom <= minZoom) return { zoom: minZoom, panX: 0, panY: 0 }
            return { ...prev, zoom: newZoom }
        })
    }, [minZoom])

    const reset = useCallback(() => {
        setState({ zoom: defaultZoom, panX: 0, panY: 0 })
    }, [defaultZoom])

    const style: React.CSSProperties = {
        transform: `scale(${state.zoom}) translate(${state.panX / state.zoom}px, ${state.panY / state.zoom}px)`,
        transformOrigin: 'center center',
        transition: 'none',
    }

    return { ...state, style, handleWheel, zoomIn, zoomOut, reset, containerRef }
}
