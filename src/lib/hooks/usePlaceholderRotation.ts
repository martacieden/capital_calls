import { useState, useEffect, useCallback } from 'react'

/**
 * Cycles through a list of placeholder strings with a fade transition.
 *
 * @param items - Array of placeholder strings to cycle through
 * @param enabled - Only cycles when true (e.g., dropdown is open and input is empty)
 * @param interval - Time between rotations in ms (default 4000)
 * @param fadeDuration - Fade-out duration in ms before switching text (default 300)
 *
 * @example
 * const { text, isVisible } = usePlaceholderRotation(
 *   ['Search assets...', 'Find trusts...'],
 *   isDropdownOpen && !inputValue,
 * )
 */
export function usePlaceholderRotation(
  items: string[],
  enabled: boolean,
  interval = 4000,
  fadeDuration = 300,
) {
  const [index, setIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const reset = useCallback(() => {
    setIndex(0)
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    let fadeTimer: ReturnType<typeof setTimeout>
    const timer = setInterval(() => {
      setIsVisible(false)
      fadeTimer = setTimeout(() => {
        setIndex(i => (i + 1) % items.length)
        setIsVisible(true)
      }, fadeDuration)
    }, interval)
    return () => {
      clearInterval(timer)
      clearTimeout(fadeTimer)
    }
  }, [enabled, items.length, interval, fadeDuration])

  return { text: items[index], isVisible, reset }
}
