import { useState, useEffect } from 'react'

export function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
    const [width, setWidth] = useState(0)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        setWidth(el.clientWidth)
        const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
        ro.observe(el)
        return () => ro.disconnect()
    }, [ref])
    return width
}
