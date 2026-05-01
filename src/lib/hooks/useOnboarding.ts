import { useState, useEffect, useCallback } from 'react'

const ONBOARDING_STORAGE_KEY = 'v3-onboarding-complete'

function readOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
}

export function useOnboarding() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(readOnboardingComplete)
  const [isProcessing, setIsProcessing] = useState(false)
  const [navBadges, setNavBadges] = useState<Set<string>>(new Set())

  // Processing complete timer — lives in App so navigation doesn't cancel it
  useEffect(() => {
    if (!isProcessing) return
    const timer = setTimeout(() => {
      setIsProcessing(false)
      setNavBadges(new Set(['catalog', 'timeline', 'portfolio']))
    }, 12000)
    return () => clearTimeout(timer)
  }, [isProcessing])

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    setIsOnboardingComplete(true)
    setIsProcessing(true)
  }, [])

  const clearBadge = useCallback((id: string) => {
    setNavBadges(prev => {
      if (!prev.has(id)) return prev // no-op guard — avoid new Set + re-render
      const n = new Set(prev)
      n.delete(id)
      return n
    })
  }, [])

  return {
    isOnboardingComplete,
    isProcessing,
    navBadges,
    completeOnboarding,
    clearBadge,
  }
}
