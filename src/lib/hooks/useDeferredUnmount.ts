import { useState, useEffect } from 'react'

export function useDeferredUnmount(visible: boolean, duration = 350) {
  const [shouldRender, setShouldRender] = useState(visible)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (visible) {
      setShouldRender(true)
      setIsLeaving(false)
    } else if (shouldRender) {
      setIsLeaving(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
        setIsLeaving(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible])

  return { shouldRender, isLeaving }
}
