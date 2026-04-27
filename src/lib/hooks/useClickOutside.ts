import { useEffect, type RefObject } from 'react'

/**
 * Detects clicks outside one or more ref elements and fires a callback.
 *
 * @param refs - Single ref or array of refs to consider "inside"
 * @param callback - Fires when a mousedown lands outside all refs
 * @param enabled - Guard flag (typically the dropdown's open state)
 *
 * @example
 * // Single ref
 * useClickOutside(dropdownRef, () => setOpen(false), isOpen)
 *
 * // Two refs (button + dropdown panel)
 * useClickOutside([btnRef, panelRef], () => setOpen(false), isOpen)
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  callback: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      const refArray = Array.isArray(refs) ? refs : [refs]
      if (refArray.every(ref => ref.current && !ref.current.contains(target))) {
        callback()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [refs, callback, enabled])
}
