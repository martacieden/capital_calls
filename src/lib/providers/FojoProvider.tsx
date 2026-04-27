import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useBreakpoint } from '@/lib/hooks/useBreakpoint'
import { useOnboarding } from '@/lib/hooks/useOnboarding'
import { BREAKPOINTS } from '@/lib/constants'
import type { DocCollection } from '@/data/thornton/documents-data'

type FojoVisibility = 'open' | 'collapsed' | 'hidden'

interface FojoContextValue {
  // ── Visibility ──
  fojoVisibility: FojoVisibility
  fojoForceOpen: boolean
  setFojoForceOpen: (open: boolean) => void
  isSmallScreen: boolean

  // ── Unread badge ──
  fojoUnreadCount: number
  setFojoUnreadCount: (count: number) => void

  // ── Creation trigger (from header "New asset" or upload) ──
  triggerCreation: boolean | 'with-files'
  triggerCreationText: string
  triggerCreationHasFiles: boolean
  triggerCreationActionType?: 'asset' | 'task' | 'relation'
  triggerCreationScenarioId: string | null
  triggerCreationWithFiles: (text: string, hasFiles: boolean, actionType?: 'asset' | 'task' | 'relation', scenarioId?: string) => void
  consumeTriggerCreation: () => void

  // ── Pending query (from global search "Ask Fojo") ──
  pendingFojoQuery: string | null
  setPendingFojoQuery: (query: string | null) => void
  consumePendingFojoQuery: () => void

  // ── Pending collection (from detail panel "Create collection") ──
  pendingCollection: DocCollection | null
  setPendingCollection: (c: DocCollection | null) => void

  // ── Onboarding (exposed for shell layout) ──
  isOnboardingComplete: boolean
  isProcessing: boolean
  navBadges: Set<string>
  completeOnboarding: () => void
  clearBadge: (id: string) => void

  // ── Fullscreen state (needed for visibility calc) ──
  isMapExpanded: boolean
  setIsMapExpanded: React.Dispatch<React.SetStateAction<boolean>>
  isTimelineExpanded: boolean
  setIsTimelineExpanded: React.Dispatch<React.SetStateAction<boolean>>

  // ── Post-navigation helper: suppress one fullscreen-close so chat stays open ──
  keepFojoOpenForNextExpand: () => void
}

const FojoContext = createContext<FojoContextValue | null>(null)

export function FojoProvider({ children }: { children: ReactNode }) {
  const isSmallScreen = useBreakpoint(BREAKPOINTS.small)
  const { isOnboardingComplete, isProcessing, navBadges, completeOnboarding, clearBadge } = useOnboarding()

  // Fojo panel state
  const [fojoForceOpen, setFojoForceOpen] = useState(false)
  const [fojoUnreadCount, setFojoUnreadCount] = useState(0)

  // Creation trigger
  const [triggerCreation, setTriggerCreation] = useState<boolean | 'with-files'>(false)
  const [triggerCreationText, setTriggerCreationText] = useState('')
  const [triggerCreationHasFiles, setTriggerCreationHasFiles] = useState(false)
  const [triggerCreationActionType, setTriggerCreationActionType] = useState<'asset' | 'task' | 'relation' | undefined>()
  const [triggerCreationScenarioId, setTriggerCreationScenarioId] = useState<string | null>(null)

  // External query
  const [pendingFojoQuery, setPendingFojoQuery] = useState<string | null>(null)

  // Pending collection
  const [pendingCollection, setPendingCollection] = useState<DocCollection | null>(null)

  // Fullscreen (affects fojo visibility)
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false)

  // When set to true, the next fullscreen-close effect is suppressed once.
  const skipNextFullscreenClose = useRef(false)
  const keepFojoOpenForNextExpand = useCallback(() => {
    skipNextFullscreenClose.current = true
  }, [])

  // Fojo is always collapsed by default; only opens when explicitly triggered
  const isAnyFullscreenView = isMapExpanded || isTimelineExpanded
  const fojoVisibility = useMemo<FojoVisibility>(() => {
    if (!isOnboardingComplete) return 'hidden'
    if (fojoForceOpen) return 'open'
    return 'collapsed'
  }, [isOnboardingComplete, fojoForceOpen])

  // Reset force-open when entering fullscreen (user must re-open via FAB)
  useEffect(() => {
    if (isAnyFullscreenView) {
      if (skipNextFullscreenClose.current) {
        skipNextFullscreenClose.current = false
      } else {
        setFojoForceOpen(false)
      }
    }
  }, [isAnyFullscreenView])

  // Auto-open panel whenever an external trigger fires
  useEffect(() => {
    if (triggerCreation) setFojoForceOpen(true)
  }, [triggerCreation])

  useEffect(() => {
    if (pendingFojoQuery) setFojoForceOpen(true)
  }, [pendingFojoQuery])

  const triggerCreationWithFiles = useCallback((text: string, hasFiles: boolean, actionType?: 'asset' | 'task' | 'relation', scenarioId?: string) => {
    setTriggerCreationText(text)
    setTriggerCreationHasFiles(hasFiles)
    setTriggerCreationActionType(actionType)
    setTriggerCreationScenarioId(scenarioId ?? null)
    setTriggerCreation('with-files')
  }, [])

  const consumeTriggerCreation = useCallback(() => {
    setTriggerCreation(false)
    setTriggerCreationText('')
    setTriggerCreationHasFiles(false)
    setTriggerCreationActionType(undefined)
    setTriggerCreationScenarioId(null)
  }, [])

  const consumePendingFojoQuery = useCallback(() => {
    setPendingFojoQuery(null)
  }, [])

  const value = useMemo<FojoContextValue>(() => ({
    fojoVisibility, fojoForceOpen, setFojoForceOpen, isSmallScreen,
    fojoUnreadCount, setFojoUnreadCount,
    triggerCreation, triggerCreationText, triggerCreationHasFiles, triggerCreationActionType,
    triggerCreationScenarioId,
    triggerCreationWithFiles, consumeTriggerCreation,
    pendingFojoQuery, setPendingFojoQuery, consumePendingFojoQuery,
    pendingCollection, setPendingCollection,
    isOnboardingComplete, isProcessing, navBadges, completeOnboarding, clearBadge,
    isMapExpanded, setIsMapExpanded, isTimelineExpanded, setIsTimelineExpanded,
    keepFojoOpenForNextExpand,
  }), [
    fojoVisibility, fojoForceOpen, isSmallScreen,
    fojoUnreadCount,
    triggerCreation, triggerCreationText, triggerCreationHasFiles, triggerCreationActionType,
    triggerCreationScenarioId,
    triggerCreationWithFiles, consumeTriggerCreation,
    pendingFojoQuery, consumePendingFojoQuery,
    pendingCollection,
    isOnboardingComplete, isProcessing, navBadges, completeOnboarding, clearBadge,
    isMapExpanded, isTimelineExpanded, keepFojoOpenForNextExpand,
  ])

  return (
    <FojoContext.Provider value={value}>
      {children}
    </FojoContext.Provider>
  )
}

export function useFojo() {
  const ctx = useContext(FojoContext)
  if (!ctx) throw new Error('useFojo must be used inside FojoProvider')
  return ctx
}
