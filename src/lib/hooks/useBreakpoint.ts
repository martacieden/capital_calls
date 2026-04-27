import { useState, useEffect } from 'react'

/**
 * Tracks whether the viewport is below a given width breakpoint.
 *
 * @param breakpoint - Width in pixels
 * @returns `true` when `window.innerWidth < breakpoint`
 *
 * @example
 * const isSmallScreen = useBreakpoint(1100)
 */
export function useBreakpoint(breakpoint: number): boolean {
  const [isBelow, setIsBelow] = useState(() => window.innerWidth < breakpoint)

  useEffect(() => {
    const handleResize = () => setIsBelow(window.innerWidth < breakpoint)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isBelow
}
