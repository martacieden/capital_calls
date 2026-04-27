import { useCallback, useRef } from 'react'

/**
 * Picks a random item from an array without repeating until all have been used.
 *
 * @param templates - Array of items to randomly pick from
 * @returns `pick()` function that returns a random unused item
 *
 * @example
 * const pick = useRandomTemplate(MOCK_COLLECTION_TEMPLATES)
 * const template = pick() // random, non-repeating until exhausted
 */
export function useRandomTemplate<T>(templates: T[]): () => T {
  const usedRef = useRef<Set<number>>(new Set())

  return useCallback(() => {
    const available = templates
      .map((t, i) => ({ t, i }))
      .filter(({ i }) => !usedRef.current.has(i))
    if (available.length === 0) usedRef.current.clear()
    const pool = available.length > 0
      ? available
      : templates.map((t, i) => ({ t, i }))
    const pick = pool[Math.floor(Math.random() * pool.length)]
    usedRef.current.add(pick.i)
    return pick.t
  }, [templates])
}
