import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { TIMING } from '@/lib/constants'
import { useRandomTemplate } from '@/lib/hooks/useRandomTemplate'
import { useDeferredUnmount } from '@/lib/hooks/useDeferredUnmount'
import { useDetailPanel } from '@/lib/hooks/useDetailPanel'
import { CatalogDataProvider, useCatalogData } from '@/lib/providers/CatalogDataProvider'
import { FojoProvider, useFojo } from '@/lib/providers/FojoProvider'
import { LeftNav } from '@/components/molecules/LeftNav'
import { ContentHeader } from '@/components/molecules/ContentHeader'
import { FojoPanel } from '@/components/organisms/FojoPanel'
import { CatalogToolbar } from '@/components/organisms/CatalogToolbar'
import { CardView } from '@/components/molecules/CardView'
import { ListView } from '@/components/molecules/ListView'
import { FamilyTreeView } from '@/components/organisms/FamilyTreeView'
import { ItemDetailPanel } from '@/components/organisms/ItemDetailPanel'
import { UnifiedTimelineStrip } from '@/components/molecules/UnifiedTimelineStrip'
import { thorntonAssetTimeline } from '@/data/thornton/asset-timeline'
import { TimelinePage } from '@/components/pages/TimelinePage'
import { HomePage } from '@/components/pages/HomePage'
import { ValuationsPage } from '@/components/pages/ValuationsPage'
import { PortfolioCategoryDetailPanel } from '@/components/organisms/PortfolioCategoryDetailPanel'
import { CapitalActivitiesChartDetailPanel, type CapitalChartDrill } from '@/components/organisms/CapitalActivitiesChartDetailPanel'
import { PortfolioCategoryDetailPage } from '@/components/pages/PortfolioCategoryDetailPage'
import { CategoryHoldingsPage } from '@/components/pages/CategoryHoldingsPage'
import { DocumentsPage } from '@/components/pages/DocumentsPage'
import { AssetDetailPage } from '@/components/pages/AssetDetailPage'
import { TasksPage } from '@/components/pages/TasksPage'
import { TaskDetailPage } from '@/components/pages/TaskDetailPage'
import { InvestmentPipelineHubPage } from '@/components/pages/InvestmentPipelineHubPage'
import { CapitalCallsPage } from '@/components/pages/CapitalCallsPage'
import { CapitalCallsPageV2 } from '@/components/pages/CapitalCallsPageV2'
import { CapitalCallDetailPage } from '@/components/pages/CapitalCallDetailPage'
import { InvestmentRecordPage } from '@/components/pages/InvestmentRecordPage'
import { ContactsPage } from '@/components/pages/ContactsPage'
import { getInvestmentById } from '@/data/thornton/investments-data'
import {
    getCapitalCallPostDealStatus,
    type CapitalCallDecision,
    type CapitalCallPostDealStatus,
} from '@/data/thornton/capital-call-decisions-data'
import { ToastContainer, showToast, updateToast } from '@/components/atoms/Toast'
import { SearchOverlay } from '@/components/organisms/SearchOverlay'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'
import { FojoMascot } from '@/components/atoms/FojoMascot'
import type { AnyCatalogItem, DistributionEvent, AssetTimelineEvent, QuickFilterKey, CatalogView } from '@/data/types'
import type { CardActionType } from '@/components/molecules/CardActionsMenu'
import { ActionPromptDropdown } from '@/components/molecules/ActionPromptDropdown'
import type { PromptAnchorRect } from '@/lib/helpers/prompt-anchor'
import { THORNTON_POSITIONS, THORNTON_VISUAL_EDGES } from '@/data/thornton/graph-positions'
import { NODE_W } from '@/lib/helpers/graph-layout'
import { MOCK_COLLECTION_TEMPLATES } from '@/data/thornton/documents-data'
import type { DocCollection } from '@/data/thornton/documents-data'
import { assetCollections as defaultAssetCollections, MOCK_ASSET_COLLECTION_TEMPLATES } from '@/data/thornton/asset-collections'
import type { AssetCollection } from '@/data/thornton/asset-collections'
import { CollectionCard } from '@/components/molecules/CollectionCard'
import { IconChevronRight, IconChevronDown, IconAt } from '@tabler/icons-react'
import { usePlaceholderRotation } from '@/lib/hooks/usePlaceholderRotation'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { createPortal } from 'react-dom'
import { sortByPriority } from '@/lib/helpers/priority-sort'
import type { TimelineAssistSession } from '@/types/timeline-assist'
import type { Task } from '@/data/thornton/tasks-data'
import { ContactModal, type ContactEventContext } from '@/components/molecules/ContactModal'
import { ShareModal } from '@/components/molecules/ShareModal'
import { mockContacts } from '@/data/thornton/contacts-data'
function App() {
  return (
    <FojoProvider>
      <CatalogDataProvider>
        <AppShell />
      </CatalogDataProvider>
    </FojoProvider>
  )
}

function AppShell() {
  // ── Data from contexts ──
  const {
    allItems, allRelationships, allDistributions, getItemById,
    activeOrgs, setActiveOrgs, activeCategory, setActiveCategory,
    allCategories, addCustomCategory,
    filters, addLocalItems, addLocalRelationships,
  } = useCatalogData()

  const {
    fojoVisibility, fojoForceOpen, setFojoForceOpen, isSmallScreen,
    fojoUnreadCount, setFojoUnreadCount,
    triggerCreation, triggerCreationText, triggerCreationHasFiles, triggerCreationActionType,
    triggerCreationScenarioId,
    triggerCreationWithFiles, consumeTriggerCreation,
    pendingFojoQuery, setPendingFojoQuery, consumePendingFojoQuery,
    pendingCollection, setPendingCollection,
    isProcessing, navBadges, clearBadge,
    isMapExpanded, setIsMapExpanded, isTimelineExpanded, setIsTimelineExpanded,
    keepFojoOpenForNextExpand,
  } = useFojo()

  // ── Local navigation state ──
  const [activeView, setActiveView] = useState<CatalogView>('grid')
  const [activePage, setActivePage] = useState<'catalog' | 'timeline' | 'home' | 'portfolio' | 'portfolio-private' | 'portfolio-category-detail' | 'documents' | 'detail' | 'category-holdings' | 'tasks' | 'task-detail' | 'investment-pipeline' | 'capital-flows' | 'capital-call-detail' | 'investment-record' | 'contacts'>('home')
  const [holdingsCategoryKeys, setHoldingsCategoryKeys] = useState<string[]>([])
  const [holdingsCategoryLabel, setHoldingsCategoryLabel] = useState('')
  const [detailItemId, setDetailItemId] = useState<string | null>(null)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [portfolioPanelCategoryId, setPortfolioPanelCategoryId] = useState<string | null>(null)
  const [capitalChartDrill, setCapitalChartDrill] = useState<CapitalChartDrill | null>(null)
  const [portfolioDetailCategoryId, setPortfolioDetailCategoryId] = useState<string | null>(null)
  const [previousPage, setPreviousPage] = useState<typeof activePage>('home')
  const [capitalFlowsVersion, setCapitalFlowsVersion] = useState<'v1' | 'v2' | 'v3'>('v1')
  const [detailCapCallId, setDetailCapCallId] = useState<string | null>(null)
  const [detailInvestmentId, setDetailInvestmentId] = useState<string | null>(null)
  /** Overrides mock post-deal status when user advances workflow on detail (syncs to Capital Activities list). */
  const [capCallStatusById, setCapCallStatusById] = useState<Record<string, CapitalCallPostDealStatus>>({})
  const resolvePostDealStatus = useCallback(
    (d: CapitalCallDecision) => capCallStatusById[d.id] ?? getCapitalCallPostDealStatus(d),
    [capCallStatusById],
  )
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [mapZoomTargetId, setMapZoomTargetId] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showFojoOnHome, setShowFojoOnHome] = useState(false)
  const [highlightedItemIds, setHighlightedItemIds] = useState<Set<string>>(new Set())
  const [isDetailGraphExpanded, setIsDetailGraphExpanded] = useState(false)
  const pickTemplate = useRandomTemplate(MOCK_COLLECTION_TEMPLATES)

  // ── Contact modal & externally-created tasks ──
  const [externalTasks, setExternalTasks] = useState<Task[]>([])
  const [dynamicDistributions, setDynamicDistributions] = useState<DistributionEvent[]>([])
  const [contactModalState, setContactModalState] = useState<{ type: 'lawyer' | 'cpa'; event: ContactEventContext; session: Omit<TimelineAssistSession, 'preselectedContactId' | 'prefilledText'> } | null>(null)
  const [shareModalTitle, setShareModalTitle] = useState<string | null>(null)
  /** Меню ⋮ на таймлайні — сценарії тільки всередині Fojo, без модалок. */
  const [timelineAssistSession, setTimelineAssistSession] = useState<TimelineAssistSession | null>(null)
  // ── Asset collections state ──
  const [assetCollections, setAssetCollections] = useState<AssetCollection[]>(defaultAssetCollections)
  const [catalogSubView, setCatalogSubView] = useState<'home' | 'all-collections' | 'collection-detail'>('home')
  const [activeAssetCollection, setActiveAssetCollection] = useState<string | null>(null)
  const [isNewAssetCollectionOpen, setIsNewAssetCollectionOpen] = useState(false)
  const [assetCollectionPrompt, setAssetCollectionPrompt] = useState('')
  const newAssetCollBtnRef = useRef<HTMLButtonElement>(null)
  const assetCollDropdownRef = useRef<HTMLDivElement>(null)
  const assetCollInputRef = useRef<HTMLInputElement>(null)
  const pickAssetTemplate = useRandomTemplate(MOCK_ASSET_COLLECTION_TEMPLATES)

  // ── Effects ──
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), TIMING.initialLoading)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (activePage !== 'portfolio' && activePage !== 'portfolio-private') setPortfolioPanelCategoryId(null)
    if (activePage !== 'portfolio-category-detail') setPortfolioDetailCategoryId(null)
    if (activePage !== 'capital-flows') setCapitalChartDrill(null)
  }, [activePage])

  useEffect(() => {
    // Timeline/Tasks are temporarily hidden from the main flow.
    if (activePage === 'timeline' || activePage === 'tasks' || activePage === 'task-detail') {
      setActivePage('home')
    }
  }, [activePage])

  useEffect(() => {
    if (activePage === 'capital-call-detail') {
      setFojoForceOpen(true)
    }
  }, [activePage, setFojoForceOpen])

  const v3Empty = useDeferredUnmount(isProcessing, TIMING.v3EmptyUnmount)

  // ── Asset collection helpers ──
  const assetCollPlaceholderExamples = useMemo(() => [
    'All real estate in Dynasty Trust I',
    'High-value art and collectibles',
    'Assets insured for over $10 million',
    'Investment portfolios managed by Goldman Sachs',
  ], [])
  const assetCollPlaceholder = usePlaceholderRotation(assetCollPlaceholderExamples, isNewAssetCollectionOpen && !assetCollectionPrompt)
  useClickOutside([assetCollDropdownRef, newAssetCollBtnRef], () => setIsNewAssetCollectionOpen(false), isNewAssetCollectionOpen)

  const getAssetCollDropdownStyle = useCallback((): React.CSSProperties => {
    const rect = newAssetCollBtnRef.current?.getBoundingClientRect()
    if (!rect) return {}
    return { position: 'fixed', top: rect.bottom + 6, right: window.innerWidth - rect.right, zIndex: 200 }
  }, [])

  const handleCreateAssetCollection = useCallback(() => {
    if (!assetCollectionPrompt.trim()) return
    setIsNewAssetCollectionOpen(false)
    setAssetCollectionPrompt('')
    const template = pickAssetTemplate()
    const newCollection: AssetCollection = {
      key: `custom-${Date.now()}`,
      label: template.label,
      icon: template.icon,
      description: template.description,
      itemIds: template.itemIds,
    }
    const toastId = showToast(`Creating "${template.label}" collection...`, 'loading')
    setTimeout(() => {
      setAssetCollections(prev => [...prev, newCollection])
      updateToast(
        toastId,
        `Collection "${template.label}" created — ${template.itemIds.length} asset${template.itemIds.length === 1 ? '' : 's'} added`,
        'success',
        { label: 'Open', onClick: () => { setActiveAssetCollection(newCollection.key); setCatalogSubView('collection-detail') } }
      )
    }, 3000)
  }, [assetCollectionPrompt, pickAssetTemplate])

  const handleOpenAssetCollection = useCallback((key: string) => {
    setActiveAssetCollection(key)
    setCatalogSubView('collection-detail')
  }, [])

  const handleBackToCatalogHome = useCallback(() => {
    setCatalogSubView('home')
    setActiveAssetCollection(null)
  }, [])

  const handleClosePortfolioPanel = useCallback(() => {
    setPortfolioPanelCategoryId(null)
  }, [])

  const handlePortfolioCategoryDetailBack = useCallback(() => {
    setPortfolioDetailCategoryId(null)
    setActivePage(previousPage === 'portfolio-private' ? 'portfolio-private' : 'portfolio')
  }, [previousPage])

  const handleOpenPortfolioFullDetail = useCallback((categoryId: string) => {
    setPortfolioPanelCategoryId(null)
    setPortfolioDetailCategoryId(categoryId)
    setActivePage(cur => { setPreviousPage(cur); return 'portfolio-category-detail' })
    setFojoForceOpen(true)
  }, [setFojoForceOpen])

  const currentAssetCollection = activeAssetCollection
    ? assetCollections.find(c => c.key === activeAssetCollection) ?? null
    : null

  const collectionFilteredItems = useMemo(() => {
    if (!currentAssetCollection) return []
    let items = allItems.filter(i => currentAssetCollection.itemIds.includes(i.id))
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase()
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q))
      )
    }
    return sortByPriority(items)
  }, [currentAssetCollection, allItems, filters.searchQuery])

  // Collections filtered by search + quick filter
  const filteredAssetCollections = useMemo(() => {
    let result = assetCollections as AssetCollection[]
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase()
      result = result.filter(c =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      )
    }
    if (filters.activeQuickFilters.size > 0) {
      result = result.filter(c => c.priorityStatus && filters.activeQuickFilters.has(c.priorityStatus.type as QuickFilterKey))
    }
    return sortByPriority(result)
  }, [assetCollections, filters.searchQuery, filters.activeQuickFilters])

  const MAX_VISIBLE_COLLECTIONS = 4

  // ── Detail panel ──
  const detail = useDetailPanel(getItemById)

  const handleAddCategory = useCallback((label: string, icon: string) => {
    const key = label.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!key) return
    addCustomCategory({ key, label: label.trim(), icon, color: '#A1A1AA', appearsInMap: true })
  }, [addCustomCategory])

  const handleDeleteItem = useCallback((_id: string) => {}, [])
  const handleUpdateItem = useCallback((_id: string, _updates: Partial<AnyCatalogItem>) => {}, [])
  const noop = useCallback(() => {}, [])
  const handleOpenTimeline = useCallback(() => setActivePage('timeline'), [])
  const handleItemsCreated = useCallback((items: AnyCatalogItem[]) => {
    addLocalItems(items)
    const ids = new Set(items.map(i => i.id))
    setHighlightedItemIds(ids)
    setTimeout(() => setHighlightedItemIds(new Set()), TIMING.highlightFade)
  }, [addLocalItems])

  // Optimistic placeholder for "add new asset" in graph tree
  const [pendingCreationForItemId, setPendingCreationForItemId] = useState<string | null>(null)

  const handleItemsCreatedWithPlaceholderClear = useCallback((items: AnyCatalogItem[]) => {
    const sourceId = pendingCreationForItemId
    handleItemsCreated(items)

    // Place new items in the graph tree, connected to the source node
    if (sourceId && items.length > 0) {
      const sourcePos = THORNTON_POSITIONS[sourceId]
      if (sourcePos) {
        items.forEach((item, i) => {
          THORNTON_POSITIONS[item.id] = {
            x: sourcePos.x + NODE_W + 40,
            y: sourcePos.y + 60 + i * 180,
          }
        })
        // Add visual edges so buildGraph renders them in Thornton mode
        items.forEach(item => {
          THORNTON_VISUAL_EDGES.push({ from: sourceId, to: item.id, label: 'Owned by' })
        })
        addLocalRelationships(items.map(item => ({
          from: sourceId,
          to: item.id,
          type: 'owns' as const,
          label: 'Owned by',
        })))
      }
    }

    setPendingCreationForItemId(null)
  }, [handleItemsCreated, pendingCreationForItemId, addLocalRelationships])

  // Whether the next detail-panel open should activate edit mode
  const [detailOpenInEditMode, setDetailOpenInEditMode] = useState(false)

  // Intermediate action prompt state — shown before triggering Fojo
  const [pendingCardAction, setPendingCardAction] = useState<{
    action: CardActionType
    contextName: string
    anchorRect: PromptAnchorRect | null
    /** Graph node whose actions menu triggered the prompt (keeps ⋮ visible). */
    sourceGraphItemId?: string | null
    /** Timeline event id when prompt came from timeline. */
    sourceTimelineEventId?: string | null
    onSubmit: (text: string, hasFiles: boolean) => void
  } | null>(null)

  // AI actions that need the intermediate prompt step (stable module-level reference via useMemo)
  const AI_ACTIONS = useMemo(() => new Set<CardActionType>(['create-task', 'add-new-asset', 'change-relation']), [])

  // Build the final prompt from user's typed text + action context
  const buildPromptFromInput = useCallback((base: string, userText: string): string => {
    return userText ? `${base} Here's more context: ${userText}` : base
  }, [])

  const registerTimelineAssistTask = useCallback((task: Task, session: TimelineAssistSession) => {
    setExternalTasks(prev => [task, ...prev])
    const srcEvent = session.sourceDistributionEvent ?? null
    const dueYear = new Date(task.dueDate).getFullYear()
    const newDist: DistributionEvent = {
      id: `dyn-dist-${task.id}`,
      beneficiaryId: srcEvent?.beneficiaryId ?? 'thn-p1',
      trustId: srcEvent?.trustId ?? 'thn-t1',
      triggerType: 'Condition',
      triggerCategory: task.type,
      triggerYear: dueYear,
      amount: 0,
      description: `${task.title} — Assigned to ${task.assignee}`,
      status: 'Pending',
      suggestedActions: [],
    }
    const allDists: DistributionEvent[] = [newDist]
    if (task.recurring && task.recurrenceInterval) {
      const monthMap: Record<string, number> = {
        'Every 3 months': 3,
        'Every 6 months': 6,
        'Every 12 months': 12,
      }
      const months = monthMap[task.recurrenceInterval] ?? 12
      let cur = new Date(task.dueDate)
      for (let i = 1; i <= 4; i++) {
        cur = new Date(cur)
        cur.setMonth(cur.getMonth() + months)
        allDists.push({
          id: `dyn-dist-${task.id}-r${i}`,
          beneficiaryId: srcEvent?.beneficiaryId ?? 'thn-p1',
          trustId: srcEvent?.trustId ?? 'thn-t1',
          triggerType: 'Condition',
          triggerCategory: task.type,
          triggerYear: cur.getFullYear(),
          amount: 0,
          description: `${task.title} — ${task.recurrenceInterval} (occurrence ${i + 1})`,
          status: 'Pending',
          suggestedActions: [],
        })
      }
    }
    setDynamicDistributions(prev => [...prev, ...allDists])
  }, [])

  const openTimelineAssist = useCallback((session: TimelineAssistSession) => {
    if (isTimelineExpanded)
      keepFojoOpenForNextExpand()
    setFojoForceOpen(true)
    setTimelineAssistSession(session)
  }, [isTimelineExpanded, keepFojoOpenForNextExpand, setFojoForceOpen])

  // Handle actions from graph tree cards
  const handleGraphCardAction = useCallback((item: AnyCatalogItem, action: CardActionType, anchor?: PromptAnchorRect | null) => {
    // Navigate to full detail page (collapse any expanded view so LeftNav is visible)
    if (action === 'open-detail') {
      detail.setIsDetailOpen(false)
      setActivePage(cur => { if (cur !== 'detail' && cur !== 'task-detail') setPreviousPage(cur); return cur })
      setDetailItemId(item.id)
      setActivePage('detail')
      setIsMapExpanded(false)
      setIsTimelineExpanded(false)
      return
    }
    // Open side panel (view sources shows the same detail panel which includes source docs)
    if (action === 'view-source') {
      detail.handleItemClick(item)
      return
    }
    // Open side panel in edit mode
    if (action === 'edit-fields') {
      setDetailOpenInEditMode(true)
      detail.handleItemClick(item)
      return
    }
    // AI actions — show the intermediate prompt_dropdown first (close side panel so it does not stack or steal clicks)
    if (AI_ACTIONS.has(action)) {
      detail.handleCloseDetail()
      const actionTypeMap: Record<string, 'asset' | 'task' | 'relation'> = {
        'add-new-asset': 'asset', 'create-task': 'task', 'change-relation': 'relation',
      }
      setPendingCardAction({
        action,
        contextName: item.name,
        anchorRect: anchor ?? null,
        sourceGraphItemId: item.id,
        sourceTimelineEventId: null,
        onSubmit: (text, hasFiles) => {
          setPendingCardAction(null)
          if (action === 'add-new-asset') setPendingCreationForItemId(item.id)
          const basePrompt = action === 'create-task'
            ? `I'd like help creating a task related to "${item.name}".`
            : action === 'add-new-asset'
              ? `I'd like help adding an asset connected to "${item.name}".`
              : `I'd like help updating relationships for "${item.name}".`
          const prompt = buildPromptFromInput(basePrompt, text)
          triggerCreationWithFiles(prompt, hasFiles, actionTypeMap[action])
        },
      })
    }
  }, [detail, AI_ACTIONS, buildPromptFromInput, triggerCreationWithFiles, setDetailOpenInEditMode])

  // Handle actions from timeline cards — create-task shows intermediate prompt first
  const handleTimelineCardAction = useCallback((event: DistributionEvent, action: CardActionType, anchor?: PromptAnchorRect | null) => {
    const eventLabel = event.triggerCategory ?? event.description ?? 'distribution'

    if (action === 'contact-lawyer' || action === 'contact-cpa') {
      const contactType = action === 'contact-lawyer' ? 'lawyer' : 'cpa'
      setContactModalState({
        type: contactType,
        event: {
          id: event.id,
          title: eventLabel,
          suggestedTaskTitle: event.suggestedTaskTitle,
          suggestedLawyerSpecialization: event.suggestedLawyerSpecialization,
          suggestedDescription: event.suggestedDescription,
          eventDescription: event.description,
        },
        session: {
          flow: action === 'contact-lawyer' ? 'contact-lawyer' : 'contact-cpa',
          contextName: eventLabel,
          contextEventId: event.id,
          sourceDistributionEvent: event,
          suggestedTaskTitle: event.suggestedTaskTitle,
          suggestedLawyerSpecialization: event.suggestedLawyerSpecialization,
          suggestedDescription: event.suggestedDescription,
          eventDescription: event.description,
        },
      })
      return
    }

    if (action === 'create-task') {
      detail.handleCloseDetail()
      setPendingCardAction({
        action,
        contextName: eventLabel,
        anchorRect: anchor ?? null,
        sourceGraphItemId: null,
        sourceTimelineEventId: event.id,
        onSubmit: (text) => {
          setPendingCardAction(null)
          openTimelineAssist({
            flow: 'create-task',
            contextName: eventLabel,
            contextEventId: event.id,
            sourceDistributionEvent: event,
            suggestedTaskTitle: event.suggestedTaskTitle,
            suggestedLawyerSpecialization: event.suggestedLawyerSpecialization,
            suggestedDescription: text || event.suggestedDescription,
            eventDescription: event.description,
          })
        },
      })
    }
  }, [detail, openTimelineAssist, setPendingCardAction])

  // Asset timeline ⋮ → create-task також через проміжний крок
  const handleAssetTimelineAction = useCallback((event: AssetTimelineEvent, action: CardActionType, anchor?: PromptAnchorRect | null) => {
    const assetItem = getItemById(event.assetId)
    const assetName = assetItem?.name ?? event.assetId
    const eventLabel = `${event.label} — ${assetName}`

    if (action === 'contact-lawyer' || action === 'contact-cpa') {
      setContactModalState({
        type: action === 'contact-lawyer' ? 'lawyer' : 'cpa',
        event: {
          id: event.id,
          title: eventLabel,
          suggestedTaskTitle: event.suggestedTaskTitle ?? `${event.label} — ${assetName}`,
          suggestedLawyerSpecialization: event.suggestedLawyerSpecialization,
          suggestedDescription: event.suggestedDescription,
          eventDescription: event.description,
        },
        session: {
          flow: action === 'contact-lawyer' ? 'contact-lawyer' : 'contact-cpa',
          contextName: eventLabel,
          contextEventId: event.id,
          sourceDistributionEvent: null,
          suggestedTaskTitle: event.suggestedTaskTitle ?? `${event.label} — ${assetName}`,
          suggestedLawyerSpecialization: event.suggestedLawyerSpecialization,
          suggestedDescription: event.suggestedDescription,
          eventDescription: event.description,
        },
      })
      return
    }

    if (action === 'create-task') {
      detail.handleCloseDetail()
      setPendingCardAction({
        action,
        contextName: eventLabel,
        anchorRect: anchor ?? null,
        sourceGraphItemId: null,
        sourceTimelineEventId: event.id,
        onSubmit: (text) => {
          setPendingCardAction(null)
          openTimelineAssist({
            flow: 'create-task',
            contextName: eventLabel,
            contextEventId: event.id,
            sourceDistributionEvent: null,
            suggestedTaskTitle: event.suggestedTaskTitle ?? `${event.label} — ${assetName}`,
            suggestedLawyerSpecialization: event.suggestedLawyerSpecialization,
            suggestedDescription: text || event.suggestedDescription,
            eventDescription: event.description,
          })
        },
      })
    }
  }, [detail, getItemById, openTimelineAssist, setPendingCardAction])

  // Handle "Add relationship" from detail panel
  const handleAddRelationship = useCallback((item: AnyCatalogItem) => {
    setPendingCardAction({
      action: 'change-relation',
      contextName: item.name,
      anchorRect: null,
      sourceGraphItemId: null,
      sourceTimelineEventId: null,
      onSubmit: (text, hasFiles) => {
        setPendingCardAction(null)
        const basePrompt = `I'd like help adding or updating relationships for "${item.name}".`
        const prompt = buildPromptFromInput(basePrompt, text)
        triggerCreationWithFiles(prompt, hasFiles, 'relation')
      },
    })
  }, [buildPromptFromInput, triggerCreationWithFiles])

  const handleCreateCollection = useCallback((item: AnyCatalogItem) => {
    const template = pickTemplate()
    const newCollection: DocCollection = {
      key: `custom-${Date.now()}`,
      label: template.label,
      icon: template.icon,
      pinned: false,
      docIds: template.docIds,
      description: template.description,
    }
    detail.setIsDetailOpen(false)
    detail.setDetailPath([])
    const toastId = showToast(`Creating "${item.name}" collection...`, 'loading')
    setTimeout(() => {
      setPendingCollection(newCollection)
      setIsMapExpanded(false)
      setActivePage('documents')
      updateToast(
        toastId,
        `Collection "${template.label}" created — ${template.docIds.length} document${template.docIds.length === 1 ? '' : 's'} added`,
        'success',
      )
    }, TIMING.toastDelay)
  }, [detail, pickTemplate, setPendingCollection, setIsMapExpanded])

  // ── Derived values ──
  const distributionSummary = useMemo(() => {
    const trusts = new Set(allDistributions.map(d => d.trustId))
    const years = allDistributions.map(d => d.triggerYear).filter((y): y is number => y != null)
    const yearRange = years.length > 0 ? `${Math.min(...years)}\u2013${Math.max(...years)}` : undefined
    return { count: allDistributions.length, trustCount: trusts.size, yearRange }
  }, [allDistributions])

  const stripSelectedItem = detail.selectedItem ?? null

  // ── Navigation helpers ──
  const navigateToDetail = useCallback((id: string) => {
    const item = getItemById(id)
    if (!item) return // guard: item not in catalog (e.g. task/relation summary cards)
    // Only capture previousPage when not already in a detail view (so nested navigation keeps original origin)
    setActivePage(cur => {
      if (cur !== 'detail' && cur !== 'task-detail') setPreviousPage(cur)
      return cur
    })
    setIsMapExpanded(false)
    setIsTimelineExpanded(false)
    if (item.categoryKey === 'task') {
      setDetailTaskId(id)
      setActivePage('task-detail')
      return
    }
    setDetailItemId(id)
    setActivePage('detail')
  }, [getItemById, setIsMapExpanded, setIsTimelineExpanded])

  const handleNavigateFromPortfolioPanel = useCallback((id: string) => {
    setPortfolioPanelCategoryId(null)
    navigateToDetail(id)
  }, [navigateToDetail])

  const navigateToTimeline = useCallback((itemId: string) => {
    setSelectedItemId(itemId)
    setIsMapExpanded(false)
    detail.setIsDetailOpen(false)
    detail.setDetailPath([])
    setActivePage('timeline')
  }, [detail, setIsMapExpanded])

  const handlePostNavigation = useCallback((nav: string, items: AnyCatalogItem[]) => {
    if (nav === 'timeline') {
      keepFojoOpenForNextExpand()
      setFojoForceOpen(true)
      setActivePage('timeline')
      setIsTimelineExpanded(true)
    } else if (nav === 'catalog-grid') {
      setActivePage('catalog')
      setActiveView('grid')
      setFojoForceOpen(true)
    } else if (nav === 'catalog-map') {
      // Arm suppression so the chat stays open when we expand the tree to fullscreen
      keepFojoOpenForNextExpand()
      setFojoForceOpen(true)
      setActivePage('catalog')
      setActiveView('map')
      setIsMapExpanded(true)
      // Zoom to the Hamptons Estate node (which has the homeowners-policy relationship)
      // without opening the detail side-panel.
      setMapZoomTargetId('thn-a2')
    } else if (nav === 'documents') {
      setActivePage('documents')
      setFojoForceOpen(true)
    } else if (nav === 'detail' && items[0]) {
      // Bypass navigateToDetail's getItemById guard — the item was just created and
      // the state update may not have propagated yet, so we set page state directly.
      const created = items[0]
      setActivePage(cur => { if (cur !== 'detail' && cur !== 'task-detail') setPreviousPage(cur); return cur })
      setIsMapExpanded(false)
      setIsTimelineExpanded(false)
      if (created.categoryKey === 'task') {
        setDetailTaskId(created.id)
        setActivePage('task-detail')
      } else {
        setDetailItemId(created.id)
        setActivePage('detail')
      }
    }
  }, [setFojoForceOpen, keepFojoOpenForNextExpand, setIsMapExpanded, setIsTimelineExpanded])

  // ── Layout flags ──
  const isMapView = activeView === 'map'
  const isFullscreen = isMapView && isMapExpanded
  const isFullscreenDetail = isFullscreen && detail.isDetailOpen
  const isTimelineDetail = isTimelineExpanded && detail.isDetailOpen
  const showHeader = !isFullscreen && !isDetailGraphExpanded
  const hasStrip = isFullscreen && !isProcessing
  const hasStripContent = hasStrip && stripSelectedItem != null
  const isAnyFullscreen = isFullscreen || isTimelineExpanded || isDetailGraphExpanded
  const isChatOpen = fojoVisibility === 'open' && !isSmallScreen


  return (
    <div className={`app-shell${(isFullscreen || isDetailGraphExpanded) ? ' app-shell--map-fullscreen' : ''}${isTimelineExpanded ? ' app-shell--tl-fullscreen' : ''}${isFullscreenDetail ? ' app-shell--map-detail' : ''}${isTimelineDetail ? ' app-shell--tl-detail' : ''}${hasStrip ? ' app-shell--has-strip' : ''}${hasStripContent ? ' app-shell--strip-active' : ''}`}>
      <LeftNav
          activeItem={
            activePage === 'task-detail' ? 'home'
            : activePage === 'detail' ? 'home'
            : activePage === 'capital-call-detail' ? (previousPage === 'capital-flows' ? 'capital-flows' : 'investment-pipeline')
            : activePage === 'investment-record' ? (previousPage === 'capital-flows' ? 'capital-flows' : 'investment-pipeline')
            : activePage === 'portfolio-category-detail'
                ? 'home'
            : activePage === 'category-holdings'
                ? 'home'
            : activePage
          }
          navBadges={navBadges}
          onNavItemClick={(id) => {
              clearBadge(id)
              if (id === 'home') setActivePage('home')
              else if (id === 'documents') setActivePage('documents')
              else if (id === 'contacts') setActivePage('contacts')
              else if (id === 'investment-pipeline') setActivePage('investment-pipeline')
              else if (id === 'capital-flows') setActivePage('capital-flows')
          }}
          onFojoToggle={() => {
            const nextOpen = !fojoForceOpen
            setFojoForceOpen(nextOpen)
            if (activePage === 'home' && nextOpen) setShowFojoOnHome(true)
          }}
          fojoUnreadCount={fojoUnreadCount}
          isFojoOpen={fojoVisibility === 'open'}
      />

      {(activePage !== 'home' || showFojoOnHome) && (
        <FojoPanel
          visibility={fojoVisibility}
          showCollapsedPreview={Boolean(portfolioPanelCategoryId) && activePage === 'portfolio' && !isSmallScreen}
          onExpandFromPreview={() => setFojoForceOpen(true)}
          onClose={() => {
            setTimelineAssistSession(null)
            // Closing Fojo should return the regular app shell with left nav.
            setIsTimelineExpanded(false)
            setFojoForceOpen(false)
            if (activePage === 'home') setShowFojoOnHome(false)
          }}
          onUnreadCountChange={setFojoUnreadCount}
          onOpenTimeline={handleOpenTimeline}
          distributionSummary={distributionSummary}
          onCreateItem={noop}
          onCatalogUpdate={noop}
          onItemsCreated={handleItemsCreatedWithPlaceholderClear}
          onItemClick={navigateToDetail}
          currentPage={activePage === 'portfolio-category-detail' ? 'portfolio' : activePage}
          currentItem={activePage === 'detail' && detailItemId ? getItemById(detailItemId) : null}
          triggerCreation={triggerCreation}
          triggerCreationText={triggerCreationText}
          triggerCreationHasFiles={triggerCreationHasFiles}
          triggerCreationActionType={triggerCreationActionType}
          triggerCreationScenarioId={triggerCreationScenarioId}
          onTriggerCreationConsumed={consumeTriggerCreation}
          isOverlay={isSmallScreen && fojoForceOpen}
          pendingFojoQuery={pendingFojoQuery}
          onPendingFojoQueryConsumed={consumePendingFojoQuery}
          onPostNavigation={handlePostNavigation}
          timelineAssistSession={timelineAssistSession}
          onDismissTimelineAssist={() => setTimelineAssistSession(null)}
          onTimelineAssistTaskCreated={registerTimelineAssistTask}
          onTimelineAssistOpenTask={(taskId) => {
            setPreviousPage('timeline')
            setDetailTaskId(taskId)
            setActivePage('task-detail')
          }}
          onClearTimelineAssist={() => setTimelineAssistSession(null)}
        />
      )}

      {(activePage === 'portfolio' || activePage === 'portfolio-private') && (
        <PortfolioCategoryDetailPanel
          categoryId={portfolioPanelCategoryId}
          isOpen={portfolioPanelCategoryId != null}
          onClose={handleClosePortfolioPanel}
          onNavigateToAsset={handleNavigateFromPortfolioPanel}
          onOpenFullDetail={handleOpenPortfolioFullDetail}
          onShare={(categoryId) => {
            const labelMap: Record<string, string> = {
              'real-estate': 'Real Estate',
              'lifestyle-assets': 'Lifestyle Assets',
              'private-investments': 'Private Investments',
              'cash-equivalents': 'Cash & Equivalents',
            }
            const label = labelMap[categoryId] ?? categoryId
            setShareModalTitle(`${label} allocation report`)
          }}
          onContactAction={(categoryId) => {
            const typeMap: Record<string, 'lawyer' | 'cpa'> = {
              'private-investments': 'lawyer',
              'real-estate': 'lawyer',
              'lifestyle-assets': 'lawyer',
              'cash-equivalents': 'cpa',
            }
            const labelMap: Record<string, string> = {
              'real-estate': 'Real Estate',
              'lifestyle-assets': 'Lifestyle Assets',
              'private-investments': 'Private Investments',
              'cash-equivalents': 'Cash & Equivalents',
            }
            const label = labelMap[categoryId] ?? categoryId
            setContactModalState({
              type: typeMap[categoryId] ?? 'lawyer',
              event: { id: categoryId, title: `${label} portfolio review` },
              session: {
                flow: typeMap[categoryId] === 'cpa' ? 'contact-cpa' : 'contact-lawyer',
                contextName: label,
                contextEventId: categoryId,
              },
            })
          }}
        />
      )}

      {activePage === 'capital-flows' && (
        <CapitalActivitiesChartDetailPanel
          drill={capitalChartDrill}
          isOpen={capitalChartDrill != null}
          onClose={() => setCapitalChartDrill(null)}
          onOpenCapCall={(id) => {
            setCapitalChartDrill(null)
            setDetailCapCallId(id)
            setPreviousPage('capital-flows')
            setActivePage('capital-call-detail')
          }}
        />
      )}

      {/* ── Contact Lawyer / CPA modal ── */}
      {contactModalState && (
        <ContactModal
          type={contactModalState.type}
          event={contactModalState.event}
          onClose={() => setContactModalState(null)}
          onDelegateToFojo={(contactId, text) => {
            setContactModalState(null)
            handleClosePortfolioPanel()
            const allContacts = [...mockContacts.lawyers, ...mockContacts.accountants]
            const contact = allContacts.find(c => c.id === contactId)
            openTimelineAssist({
              flow: 'create-task',
              contextName: contactModalState.event.title,
              contextEventId: contactModalState.session.contextEventId,
              sourceDistributionEvent: contactModalState.session.sourceDistributionEvent ?? null,
              suggestedTaskTitle: contact
                ? `Follow up with ${contact.name} — ${contactModalState.event.title}`
                : contactModalState.event.suggestedTaskTitle ?? contactModalState.event.title,
              suggestedDescription: text.trim() || contactModalState.event.suggestedDescription,
              eventDescription: [
                contact ? `Contact: ${contact.name}${contact.firm ? ` (${contact.firm})` : ''}` : null,
                text.trim() ? `Additional context: ${text.trim()}` : null,
              ].filter(Boolean).join('\n'),
            })
          }}
        />
      )}

      {shareModalTitle && (
        <ShareModal
          reportTitle={shareModalTitle}
          onClose={() => setShareModalTitle(null)}
        />
      )}

      {/* Floating FAB only shown in fullscreen mode (left nav is hidden there) */}
      {fojoVisibility === 'collapsed' && isAnyFullscreen && (
        <button
          className="fixed bottom-6 left-6 z-[300] flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 shadow-none transition-transform duration-[180ms] animate-fab-pop-in hover:-translate-y-0.5 active:translate-y-0"
          onClick={() => setFojoForceOpen(true)}
          aria-label="Open Fojo"
        >
          <FojoMascot size="100%" className="block rounded-full" animated />
          {fojoUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-[var(--radius-md)] bg-[#DC2626] px-1 text-center text-xs font-bold leading-[18px] text-white shadow-[0_0_0_2px_var(--color-white)] animate-badge-pulse">
              {fojoUnreadCount > 9 ? '9+' : fojoUnreadCount}
            </span>
          )}
        </button>
      )}

      <main
        className={`main-content${isAnyFullscreen ? ' main-content--map-expanded' : ''}${
          activePage === 'investment-pipeline' || activePage === 'capital-flows' ? ' main-content--pipeline-hub' : ''
        }${activePage === 'investment-pipeline' ? ' main-content--pipeline-fill' : ''}`}
      >
        <div style={{ display: activePage === 'home' ? undefined : 'none', height: '100%' }}>
          <HomePage
            onNavigate={(page) => setActivePage(page)}
            isFojoOpen={fojoVisibility === 'open'}
            onAskFojo={(prompt) => {
              setPendingFojoQuery(prompt)
              setShowFojoOnHome(true)
              setFojoForceOpen(true)
            }}
          />
        </div>

        {activePage !== 'home' && (activePage === 'task-detail' && detailTaskId ? (
          <TaskDetailPage
            taskId={detailTaskId}
            catalogFallback={getItemById(detailTaskId)}
            externalTask={externalTasks.find(t => t.id === detailTaskId) ?? undefined}
            getItemById={getItemById}
            onBack={() => setActivePage(previousPage)}
            onNavigateToAsset={(id) => { setDetailItemId(id); setActivePage('detail') }}
          />
        ) : activePage === 'tasks' ? (
          <TasksPage
            onTaskClick={(taskId) => { setPreviousPage('tasks'); setDetailTaskId(taskId); setActivePage('task-detail') }}
            externalTasks={externalTasks}
          />
        ) : activePage === 'detail' && detailItemId ? (
          <AssetDetailPage
            item={getItemById(detailItemId)!}
            relationships={allRelationships}
            getItemById={getItemById}
            onBack={() => { setIsDetailGraphExpanded(false); setActivePage(previousPage) }}
            onNavigate={(id) => { setIsDetailGraphExpanded(false); navigateToDetail(id) }}
            onActionRequest={handleGraphCardAction}
            isGraphExpanded={isDetailGraphExpanded}
            onGraphExpandChange={setIsDetailGraphExpanded}
          />
        ) : activePage === 'portfolio-category-detail' && portfolioDetailCategoryId ? (
          <PortfolioCategoryDetailPage
            categoryId={portfolioDetailCategoryId}
            onBack={handlePortfolioCategoryDetailBack}
            onNavigateToAsset={(id) => navigateToDetail(id)}
          />
        ) : activePage === 'portfolio' ? (
          <ValuationsPage
            key="all"
            items={allItems}
            isV3Processing={isProcessing}
            isChatOpen={isChatOpen}
            onOpenPortfolioCategory={(id) => {
              setPortfolioPanelCategoryId(id)
              setFojoForceOpen(false)
            }}
            onNavigateToAsset={(id) => navigateToDetail(id)}
            onNavigateToTasks={() => setActivePage('tasks')}
            onNavigateToTimeline={() => setActivePage('timeline')}
            onNavigateToInvestment={(investmentId) => {
              setDetailInvestmentId(investmentId)
              setPreviousPage(activePage)
              setActivePage('investment-record')
            }}
            onNavigateToCatalogCategory={(categories) => {
              const labelMap: Record<string, string> = {
                'investment': 'Private Investments',
                'public-market': 'Public Market',
                'property': 'Real Estate',
                'maritime,vehicle,art': 'Lifestyle Assets',
              }
              const key = categories.join(',')
              setHoldingsCategoryKeys(categories)
              setHoldingsCategoryLabel(labelMap[key] ?? categories.map(c => c[0].toUpperCase() + c.slice(1)).join(' & '))
              setActivePage(cur => { setPreviousPage(cur); return 'category-holdings' })
            }}
          />
        ) : activePage === 'portfolio-private' ? (
          <ValuationsPage
            key="private"
            items={allItems}
            lockedMode="private"
            isV3Processing={isProcessing}
            isChatOpen={isChatOpen}
            onOpenPortfolioCategory={(id) => {
              setPortfolioPanelCategoryId(id)
              setFojoForceOpen(false)
            }}
            onNavigateToAsset={(id) => navigateToDetail(id)}
            onNavigateToTasks={() => setActivePage('tasks')}
            onNavigateToTimeline={() => setActivePage('timeline')}
            onNavigateToInvestment={(investmentId) => {
              setDetailInvestmentId(investmentId)
              setPreviousPage(activePage)
              setActivePage('investment-record')
            }}
            onNavigateToCatalogCategory={(categories) => {
              const labelMap: Record<string, string> = {
                'investment': 'Private Investments',
                'public-market': 'Public Market',
                'property': 'Real Estate',
                'maritime,vehicle,art': 'Lifestyle Assets',
              }
              const key = categories.join(',')
              setHoldingsCategoryKeys(categories)
              setHoldingsCategoryLabel(labelMap[key] ?? categories.map(c => c[0].toUpperCase() + c.slice(1)).join(' & '))
              setActivePage(cur => { setPreviousPage(cur); return 'category-holdings' })
            }}
          />
        ) : activePage === 'category-holdings' ? (
          <CategoryHoldingsPage
            categoryKeys={holdingsCategoryKeys}
            categoryLabel={holdingsCategoryLabel}
            onBack={() => setActivePage(
              previousPage === 'portfolio-private' ? 'portfolio-private' : 'portfolio'
            )}
            onNavigateToAsset={(id) => {
              setDetailItemId(id)
              setActivePage('detail')
            }}
          />
        ) : activePage === 'investment-pipeline' ? (
          <InvestmentPipelineHubPage
            onOpenDeal={(id) => {
              setDetailInvestmentId(id)
              setPreviousPage('investment-pipeline')
              setActivePage('investment-record')
            }}
          />
        ) : activePage === 'capital-flows' ? (
          capitalFlowsVersion === 'v2' ? (
            <CapitalCallsPageV2
              resolvePostDealStatus={resolvePostDealStatus}
              onChartDrill={setCapitalChartDrill}
              onOpenDetail={(id) => {
                setDetailCapCallId(id)
                setPreviousPage('capital-flows')
                setActivePage('capital-call-detail')
              }}
              onSwitchToV1={() => setCapitalFlowsVersion('v1')}
            />
          ) : (
            <CapitalCallsPage
              layout={capitalFlowsVersion === 'v3' ? 'classic' : 'default'}
              resolvePostDealStatus={resolvePostDealStatus}
              onChartDrill={setCapitalChartDrill}
              onOpenDetail={(id) => {
                setDetailCapCallId(id)
                setPreviousPage('capital-flows')
                setActivePage('capital-call-detail')
              }}
              onSwitchToV2={() => setCapitalFlowsVersion('v2')}
              onSwitchToClassicLayout={() => setCapitalFlowsVersion('v3')}
              onSwitchToPriorityLayout={() => setCapitalFlowsVersion('v1')}
            />
          )
        ) : activePage === 'capital-call-detail' && detailCapCallId ? (
          <CapitalCallDetailPage
            id={detailCapCallId}
            investmentId={detailInvestmentId ?? undefined}
            investmentName={detailInvestmentId ? getInvestmentById(detailInvestmentId)?.fundNameShort : undefined}
            resolvePostDealStatus={resolvePostDealStatus}
            onPostDealStatusChange={(noticeId, status) => {
              setCapCallStatusById(prev => ({ ...prev, [noticeId]: status }))
            }}
            onBack={() => {
              if (detailInvestmentId && previousPage === 'investment-record') {
                setActivePage('investment-record')
              } else if (previousPage === 'capital-flows') {
                setActivePage('capital-flows')
              } else {
                setActivePage('investment-pipeline')
              }
            }}
          />
        ) : activePage === 'investment-record' && detailInvestmentId ? (
          <InvestmentRecordPage
            investmentId={detailInvestmentId}
            backSource={previousPage === 'portfolio-private' ? 'portfolio-private' : previousPage === 'investment-pipeline' ? 'investment-pipeline' : 'portfolio'}
            onBack={() => {
              if (previousPage === 'investment-pipeline') setActivePage('investment-pipeline')
              else if (previousPage === 'portfolio-private') setActivePage('portfolio-private')
              else setActivePage('portfolio')
            }}
            onNavigateToCapCall={(capCallId) => {
              setPreviousPage('investment-record')
              setDetailCapCallId(capCallId)
              setActivePage('capital-call-detail')
            }}
          />
        ) : activePage === 'documents' ? (
          <DocumentsPage
            onNavigateToTimeline={() => setActivePage('timeline')}
            pendingCollection={pendingCollection}
            onCollectionConsumed={() => setPendingCollection(null)}
            isChatOpen={isChatOpen}
          />
        ) : activePage === 'contacts' ? (
          <ContactsPage />
        ) : activePage === 'timeline' ? (
          <TimelinePage
            distributions={[...allDistributions, ...dynamicDistributions]}
            assetTimeline={thorntonAssetTimeline}
            getItemById={getItemById}
            activeOrgs={activeOrgs}
            onOrgsChange={setActiveOrgs}
            isV3Processing={isProcessing}
            selectedItemId={selectedItemId}
            onClearSelectedItem={() => setSelectedItemId(null)}
            isExpanded={isTimelineExpanded}
            onToggleExpand={() => setIsTimelineExpanded(v => !v)}
            onActionRequest={handleTimelineCardAction}
            onAssetActionRequest={handleAssetTimelineAction}
            actionPromptEventId={pendingCardAction?.sourceTimelineEventId ?? timelineAssistSession?.contextEventId ?? null}
            timelineActionPrompt={null}
            onCloseTimelineActionPrompt={() => {}}
          />
        ) : (
          <div className="flex flex-col flex-1 gap-[var(--spacing-5)] pt-[36px] px-[var(--spacing-6)] pb-0 max-w-[1120px] w-full mx-auto">
            {showHeader && (
              <>
                {catalogSubView === 'collection-detail' && currentAssetCollection ? (
                  <ContentHeader
                    title={currentAssetCollection.label}
                    itemCount={collectionFilteredItems.length}
                    onNewItemClick={(text, hasFiles) => triggerCreationWithFiles(text, hasFiles)}
                    breadcrumb={{ label: 'Assets', onClick: handleBackToCatalogHome }}
                    secondaryAction={{ label: 'Actions', onClick: () => {}, icon: IconChevronDown }}
                  />
                ) : catalogSubView === 'all-collections' ? (
                  <ContentHeader
                    title="All Collections"
                    itemCount={assetCollections.length}
                    breadcrumb={{ label: 'Assets', onClick: handleBackToCatalogHome }}
                    secondaryAction={{ label: 'New collection', onClick: () => setIsNewAssetCollectionOpen(prev => !prev), buttonRef: newAssetCollBtnRef }}
                  />
                ) : (
                  <ContentHeader
                    title="Assets"
                    itemCount={allItems.length}
                    onNewItemClick={(text, hasFiles) => triggerCreationWithFiles(text, hasFiles)}
                    secondaryAction={{ label: 'New collection', onClick: () => setIsNewAssetCollectionOpen(prev => !prev), buttonRef: newAssetCollBtnRef }}
                  />
                )}
                <div className="sticky top-[calc(-1*var(--spacing-4))] z-10 bg-[var(--color-white)] pt-[var(--spacing-4)] -mt-[var(--spacing-5)] pb-[var(--spacing-4)] [&>*]:mt-0">
                  <CatalogToolbar
                    activeView={activeView}
                    onViewChange={setActiveView}
                    activeOrgs={activeOrgs}
                    onOrgsChange={setActiveOrgs}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    dropdownItems={allCategories.map(c => ({ key: c.key, label: c.label, icon: c.icon }))}
                    onAddCategory={handleAddCategory}
                    searchQuery={filters.searchQuery}
                    onSearchChange={filters.setSearchQuery}
                    activeQuickFilters={filters.activeQuickFilters}
                    onQuickFilterChange={(key) => filters.toggleQuickFilter(key)}
                    viewOptions={catalogSubView === 'all-collections' ? null : (catalogSubView === 'collection-detail' ? ['grid', 'list'] : undefined)}
                    quickFilterItems={[
                      { key: 'recently-updated', label: 'Recently updated', count: filters.filterCounts['recently-updated'] },
                      { key: 'expiring-soon', label: 'Expiring soon', count: filters.filterCounts['expiring-soon'], isAlert: true },
                      { key: 'unlinked', label: 'Unlinked', count: filters.filterCounts['unlinked'] },
                      { key: 'missing-insurance', label: 'Uninsured', count: filters.filterCounts['missing-insurance'], isAlert: true },
                      { key: 'stale-valuation', label: 'Stale valuation', count: filters.filterCounts['stale-valuation'], isAlert: true },
                      { key: 'missing-documents', label: 'Missing documents', count: filters.filterCounts['missing-documents'], isAlert: true },
                    ]}
                  />
                </div>
              </>
            )}

            {v3Empty.shouldRender && (
              <div className={`v3-empty-state${v3Empty.isLeaving ? ' v3-empty-state--leaving' : ''}`}>
                <img className="v3-empty-state__icon" src={fojoMascotSmall} alt="Fojo" />
                <div className="v3-empty-state__title">Fojo is building your profile…</div>
                <div className="v3-empty-state__sub">This page will appear in a moment</div>
              </div>
            )}

            {/* ── All Collections dedicated view ── */}
            {catalogSubView === 'all-collections' && !isProcessing && (
              <div className="cards-section">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[var(--spacing-4)]">
                  {filteredAssetCollections.map(col => (
                    <CollectionCard
                      key={col.key}
                      label={col.label}
                      icon={col.icon}
                      count={col.itemIds.length}
                      countLabel={col.itemIds.length === 1 ? 'asset' : 'assets'}
                      description={col.description}
                      priorityStatus={col.priorityStatus}
                      onClick={() => handleOpenAssetCollection(col.key)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Collection drill-in view ── */}
            {catalogSubView === 'collection-detail' && !isProcessing && activeView === 'grid' && (
              <CardView
                items={collectionFilteredItems}
                onItemClick={(item) => navigateToDetail(item.id)}
                isLoading={false}
                isChatOpen={isChatOpen}
                highlightedIds={highlightedItemIds}
              />
            )}
            {catalogSubView === 'collection-detail' && !isProcessing && activeView === 'list' && (
              <ListView items={collectionFilteredItems} onItemClick={(item) => navigateToDetail(item.id)} isLoading={false} />
            )}
            {catalogSubView === 'collection-detail' && !isProcessing && collectionFilteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-[var(--spacing-3)] flex-1 text-center min-h-[400px]">
                <h3 className="text-[16px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] m-0">No assets in this collection</h3>
                <p className="text-sm text-[var(--color-neutral-11)] max-w-[340px] m-0 leading-[1.5]">
                  Assets matching this collection's criteria will appear here.
                </p>
              </div>
            )}

            {/* ── Default catalog home: Collections + All Assets ── */}
            {catalogSubView === 'home' && !isProcessing && (activeView === 'grid' || activeView === 'list') && (
              <div className="flex flex-col gap-[var(--spacing-5)] flex-1 min-h-0">
                {/* Collections */}
                {filteredAssetCollections.length > 0 && (
                  <div className="flex flex-col gap-[var(--spacing-2)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-[var(--font-weight-medium)] text-[var(--color-neutral-9)]">Collections</span>
                      <button
                        className="flex items-center gap-[2px] text-[13px] font-[var(--font-weight-semibold)] text-[var(--color-accent-9)] bg-transparent border-none rounded-[var(--radius-md)] cursor-pointer px-[10px] py-[4px] transition-[background,color] duration-150 hover:bg-[#EBF3FF]"
                        onClick={() => setCatalogSubView('all-collections')}
                      >
                        <span>Show all</span>
                        <IconChevronRight size={14} stroke={2} />
                      </button>
                    </div>
                    <div className={`grid ${isChatOpen ? 'grid-cols-3' : 'grid-cols-4'} gap-[var(--spacing-4)]`}>
                      {filteredAssetCollections.slice(0, isChatOpen ? 3 : MAX_VISIBLE_COLLECTIONS).map(col => (
                        <CollectionCard
                          key={col.key}
                          label={col.label}
                          icon={col.icon}
                          count={col.itemIds.length}
                          countLabel={col.itemIds.length === 1 ? 'asset' : 'assets'}
                          description={col.description}
                          priorityStatus={col.priorityStatus}
                          onClick={() => handleOpenAssetCollection(col.key)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* All Assets */}
                <div className="flex flex-col gap-[var(--spacing-3)] flex-1 min-h-0 [&>.cards-section]:mt-0 [&>.cards-section]:pt-0 [&>.list-view]:mt-0 [&>.list-view]:pt-0">
                  {filteredAssetCollections.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-[var(--font-weight-medium)] text-[var(--color-neutral-9)]">All Assets</span>
                    </div>
                  )}
                  {activeView === 'grid' && (
                    <CardView
                      items={filters.filteredItems}
                      onItemClick={(item) => navigateToDetail(item.id)}
                      isLoading={isInitialLoading}
                      isChatOpen={isChatOpen}
                      highlightedIds={highlightedItemIds}
                    />
                  )}
                  {activeView === 'list' && (
                    <ListView
                      items={filters.filteredItems}
                      onItemClick={(item) => navigateToDetail(item.id)}
                      isLoading={isInitialLoading}
                    />
                  )}
                </div>
              </div>
            )}

            {isMapView && !isProcessing && (
              <>
                <FamilyTreeView
                  items={allItems}
                  relationships={allRelationships}
                  onItemClick={detail.handleItemClick}
                  onActionRequest={handleGraphCardAction}
                  actionPromptItemId={pendingCardAction?.sourceGraphItemId ?? null}
                  graphActionPrompt={pendingCardAction?.sourceGraphItemId
                    ? {
                        action: pendingCardAction.action,
                        contextName: pendingCardAction.contextName,
                        anchorRect: pendingCardAction.anchorRect,
                        sourceGraphItemId: pendingCardAction.sourceGraphItemId,
                        onSubmit: pendingCardAction.onSubmit,
                      }
                    : null}
                  onCloseGraphActionPrompt={() => setPendingCardAction(null)}
                  pendingCreationForItemId={pendingCreationForItemId}
                  isExpanded={isMapExpanded}
                  onToggleExpand={() => setIsMapExpanded(prev => {
                    if (prev) detail.setIsDetailOpen(false)
                    return !prev
                  })}
                  activeOrgs={activeOrgs}
                  onOrgsChange={setActiveOrgs}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  selectedItemId={detail.isDetailOpen ? detail.detailPath[detail.detailPath.length - 1] ?? null : null}
                  zoomToItemId={mapZoomTargetId}
                  searchQuery={filters.searchQuery}
                  onSearchChange={filters.setSearchQuery}
                />
                {isFullscreen && (
                  <UnifiedTimelineStrip
                    selectedItem={stripSelectedItem}
                    distributions={allDistributions}
                    assetEvents={thorntonAssetTimeline}
                    getItemById={getItemById}
                    onViewFullTimeline={navigateToTimeline}
                    isChatOpen={isChatOpen}
                  />
                )}
              </>
            )}
          </div>
        ))}

        <ItemDetailPanel
          item={detail.selectedItem}
          path={detail.detailPath}
          isOpen={detail.isDetailOpen}
          onClose={detail.handleCloseDetail}
          onNavigate={detail.handleNavigate}
          onBreadcrumbClick={detail.handleBreadcrumbClick}
          getItemById={getItemById}
          relationships={allRelationships}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
          onCreateCollection={handleCreateCollection}
          onOpenFullRecord={navigateToDetail}
          onAddRelationship={handleAddRelationship}
          openInEditMode={detailOpenInEditMode}
          onEditModeActivated={() => setDetailOpenInEditMode(false)}
        />
      </main>

      {pendingCardAction && !pendingCardAction.sourceGraphItemId && (
        <ActionPromptDropdown
          action={pendingCardAction.action}
          contextName={pendingCardAction.contextName}
          anchorRect={pendingCardAction.anchorRect}
          onSubmit={pendingCardAction.onSubmit}
          onClose={() => setPendingCardAction(null)}
        />
      )}

      {isNewAssetCollectionOpen && createPortal(
        <div ref={assetCollDropdownRef} className="asset-coll-dropdown w-[424px] bg-white border border-[var(--color-gray-4)] rounded-[var(--radius-2xl)] shadow-[0_24px_80px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)] animate-[notif-dropdown-in_0.22s_cubic-bezier(0.16,1,0.3,1)] origin-top-right p-[var(--spacing-5)] flex flex-col gap-[var(--spacing-5)]" style={getAssetCollDropdownStyle()}>
          <style>{`.asset-coll-dropdown .chat-input::placeholder { color: transparent; }`}</style>
          <div className="flex items-center gap-4">
            <img className="w-[52px] h-[52px] rounded-full shrink-0" src={fojoMascotSmall} alt="Fojo" />
            <div className="flex flex-col gap-[2px]">
              <span className="text-[15px] font-[var(--font-weight-semibold)] text-[var(--color-gray-12)] leading-[1.4]">Create smart collection</span>
              <span className="text-sm text-[var(--color-neutral-11)] leading-[1.5]">Describe what to group – Fojo will find and add matching assets automatically.</span>
            </div>
          </div>
          <div className="chat-footer rounded-[var(--radius-lg)] border border-[var(--color-gray-4)] flex w-full pt-[var(--spacing-4)] px-[var(--spacing-3)] pb-[var(--spacing-3)] flex-col bg-[var(--color-white)] focus-within:border-[var(--color-purple)] focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ marginTop: 0 }}>
            <div className="w-full cursor-text" style={{ position: 'relative' }}>
              {!assetCollectionPrompt && (
                <span className={`absolute top-0 left-0 right-0 px-[var(--spacing-2)] text-sm text-[var(--color-neutral-8)] leading-[1.47] pointer-events-none transition-opacity duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis${assetCollPlaceholder.isVisible ? '' : ' opacity-0'}`}>
                  {assetCollPlaceholder.text}
                </span>
              )}
              <input
                ref={assetCollInputRef}
                type="text"
                className="chat-input w-full border-none outline-none font-sans text-sm text-[var(--color-gray-12)] bg-transparent px-[var(--spacing-2)] py-0 leading-[1.47] block"
                value={assetCollectionPrompt}
                onChange={e => setAssetCollectionPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateAssetCollection() } }}
                autoFocus
              />
            </div>
            <div className="flex mt-[var(--spacing-4)] w-full items-center justify-between">
              <button className="p-[6px] rounded-[var(--radius-md)] flex items-center transition-[background] duration-150 hover:bg-[var(--color-neutral-3)]">
                <IconAt size={18} stroke={2} color="var(--color-neutral-11)" />
              </button>
              <button
                className="flex items-center justify-center gap-[var(--spacing-1)] rounded-[var(--radius-md)] border border-[var(--color-accent-9)] bg-[var(--color-accent-9)] min-h-[32px] px-[14px] py-[4px] text-[13px] font-[var(--font-weight-semibold)] leading-[1.43] text-[var(--color-accent-contrast)] transition-[background,transform,color,border-color,opacity] duration-150 ease-linear hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!assetCollectionPrompt.trim()}
                onClick={handleCreateAssetCollection}
              >
                <span>Create</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAskFojo={(query) => { setIsSearchOpen(false); setPendingFojoQuery(query); if (fojoVisibility === 'collapsed') setFojoForceOpen(true) }}
        onItemClick={(id) => { navigateToDetail(id); setIsSearchOpen(false) }}
        items={allItems}
      />



      <ToastContainer />
    </div>
  )
}

export default App
