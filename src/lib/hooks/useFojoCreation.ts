import { useState, useCallback, useRef } from 'react'
import { getRandomScenario, getScenarioByActionType, getScenarioById, type MockScenario } from '@/data/mock-scenarios'
import { getPipelineSequence } from '@/data/mock-pipeline'
import { BROWSER_FILES } from '@/components/molecules/MockFileBrowser'
import type { AnyCatalogItem } from '@/data/types'

/*
 * useFojoCreation — State machine for the Fojo creation flow.
 *
 * Flow:
 * 1. idle → user clicks "Create new asset" → prompt (Fojo asks for input)
 * 2. prompt → user types text or drops files → processing
 * 3. processing → pipeline steps appear one at a time as chat messages → qa (if needed) → done
 *
 * Each pipeline step is delivered as a separate chat message, not a single block.
 * Ref: FEEDBACK-SUMMARY.md §3, §4, §7, §8
 */

export type CreationPhase = 'idle' | 'prompt' | 'processing' | 'qa' | 'done'

export interface AttachedFile {
    id: string
    name: string
}

/** A single step message in the creation conversation */
export interface CreationMessage {
    id: string
    type: 'fojo-text' | 'fojo-dropzone' | 'user-input' | 'fojo-tool' | 'fojo-result' | 'fojo-summary'
    text: string
    detail?: string
    toolStatus?: 'running' | 'complete'
    items?: AnyCatalogItem[]
    files?: AttachedFile[]
    /** When true, summary item cards show hover state but clicking does nothing */
    noClickItems?: boolean
}

const DEMO_FILES: AttachedFile[] = [
    { id: 'demo-1', name: 'vehicle-title-tesla-x.pdf' },
    { id: 'demo-2', name: 'property-deed-740-park.pdf' },
    { id: 'demo-3', name: 'trust-amendment-2024.pdf' },
]

export interface FojoCreationState {
    phase: CreationPhase
    messages: CreationMessage[]
    attachedFiles: AttachedFile[]
    isUploading: boolean
    uploadJustFinished: boolean
    isTyping: boolean
    qaQuestion: string | null
    qaOptions: { title: string; description: string; value: string }[]
    createdItems: AnyCatalogItem[]
    startCreation: () => void
    startCreationWithFiles: (text?: string, withFiles?: boolean, actionType?: 'asset' | 'task' | 'relation', scenarioId?: string) => void
    addTextMessage: (text: string) => void
    handleFileUpload: (scenarioId?: string, file?: AttachedFile) => void
    removeFile: (id: string) => void
    submitInput: (text: string) => void
    answerQA: (values: string[]) => void
    reset: () => void
}

interface UseFojoCreationOptions {
    onItemsCreated?: (items: AnyCatalogItem[]) => void
    onPostNavigation?: (nav: string, items: AnyCatalogItem[]) => void
}

let msgCounter = 0
const nextId = () => `creation-${++msgCounter}`

function getSummaryText(actionType: 'asset' | 'task' | 'relation', scenario: MockScenario, items: AnyCatalogItem[]): string {
    if (actionType === 'task') {
        return `Done! I created a task: **${scenario.name}**.\n\n${scenario.description}`
    }
    if (actionType === 'relation') {
        return `Done! I updated the relationship: **${scenario.name}**.\n\n${scenario.description}`
    }
    if (scenario.hideSummaryCards) {
        const count = scenario.customFields?.['Asset Count'] ?? scenario.customFields?.['Document Count']
        const value = scenario.customFields?.['Total Value'] ?? scenario.customFields?.['Total Donations']
        const countStr = count != null ? `**${count} assets**` : 'the assets'
        const valueStr = value != null ? ` (${value} total value)` : ''
        return `Done! I've cataloged ${countStr}${valueStr} from the inventory. You can review them on the assets page.`
    }
    return items.length === 1
        ? `Done! I added **${items[0].name}** to your assets.`
        : `Done! I added ${items.length} new records to your assets:`
}

export function useFojoCreation({ onItemsCreated, onPostNavigation }: UseFojoCreationOptions = {}): FojoCreationState {
    const [phase, setPhase] = useState<CreationPhase>('idle')
    const [messages, setMessages] = useState<CreationMessage[]>([])
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadJustFinished, setUploadJustFinished] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [qaQuestion, setQaQuestion] = useState<string | null>(null)
    const [qaOptions, setQaOptions] = useState<{ title: string; description: string; value: string }[]>([])
    const [createdItems, setCreatedItems] = useState<AnyCatalogItem[]>([])

    const [pendingDocumentScenarioId, setPendingDocumentScenarioId] = useState<string | null>(null)

    const scenarioRef = useRef<MockScenario | null>(null)
    const actionTypeRef = useRef<'asset' | 'task' | 'relation'>('asset')
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
    const pauseIndexRef = useRef(-1)

    const clearTimers = () => {
        timersRef.current.forEach(clearTimeout)
        timersRef.current = []
    }

    const addMessage = useCallback((msg: CreationMessage) => {
        setMessages(prev => [...prev, msg])
    }, [])

    const updateLastToolMessage = useCallback((status: 'complete') => {
        setMessages(prev => {
            const last = [...prev]
            for (let i = last.length - 1; i >= 0; i--) {
                if (last[i].type === 'fojo-tool' && last[i].toolStatus === 'running') {
                    last[i] = { ...last[i], toolStatus: status }
                    break
                }
            }
            return last
        })
    }, [])

    const buildItems = useCallback((scenario: MockScenario, includeAdditional: boolean): AnyCatalogItem[] => {
        const items: AnyCatalogItem[] = []
        const base = {
            organizationId: 'org-thornton',
            createdAt: new Date().toISOString(),
            createdBy: { id: 'fojo', name: 'Fojo AI' },
        }
        items.push({
            id: crypto.randomUUID(),
            name: scenario.name,
            categoryKey: scenario.categoryKey,
            description: scenario.description,
            imageUrl: scenario.imageUrl,
            customFields: { ...scenario.customFields },
            ...base,
        } as AnyCatalogItem)

        if (includeAdditional && scenario.additionalItems) {
            for (const add of scenario.additionalItems) {
                items.push({
                    id: crypto.randomUUID(),
                    name: add.name,
                    categoryKey: add.categoryKey,
                    description: add.description,
                    customFields: { ...add.customFields },
                    ...base,
                } as AnyCatalogItem)
            }
        }
        return items
    }, [])

    const runPipeline = useCallback((scenario: MockScenario, startEntryIdx = 0) => {
        const entries = getPipelineSequence(scenario.id)
        let elapsed = 0

        for (let i = startEntryIdx; i < entries.length; i++) {
            const entry = entries[i]
            const capturedI = i

            if (entry.type === 'text') {
                timersRef.current.push(setTimeout(() => {
                    addMessage({ id: nextId(), type: 'fojo-text', text: entry.text })
                }, elapsed))
                elapsed += entry.delayMs
            } else {
                timersRef.current.push(setTimeout(() => {
                    addMessage({
                        id: nextId(),
                        type: 'fojo-tool',
                        text: entry.text,
                        detail: entry.detail,
                        toolStatus: 'running',
                    })
                }, elapsed))
                elapsed += entry.delayMs
                timersRef.current.push(setTimeout(() => {
                    updateLastToolMessage('complete')
                }, elapsed))
                elapsed += 400
            }

            // Q&A pause
            if (entry.pauseForQA && scenario.triggersQA && scenario.qa) {
                timersRef.current.push(setTimeout(() => {
                    setQaQuestion(scenario.qa!.question)
                    setQaOptions(scenario.qa!.options)
                    setPhase('qa')
                }, elapsed + 200))
                return { pausedAfterEntry: capturedI + 1 }
            }
        }

        // Done — create items and show summary
        timersRef.current.push(setTimeout(() => {
            const isAsset = actionTypeRef.current === 'asset'
            const items = buildItems(scenario, false)
            if (isAsset) {
                setCreatedItems(items)
                onItemsCreated?.(items)
            }
            addMessage({
                id: nextId(),
                type: 'fojo-summary',
                text: getSummaryText(actionTypeRef.current, scenario, items),
                items: scenario.hideSummaryCards ? [] : items,
                noClickItems: scenario.noClickSummaryCards,
            })
            setPhase('done')
            if (scenario.postNavigation) {
                onPostNavigation?.(scenario.postNavigation, items)
            }
        }, elapsed + 200))

        return { pausedAfterEntry: -1 }
    }, [addMessage, updateLastToolMessage, buildItems, onItemsCreated])

    /** Start creation skipping the prompt — goes straight to processing (used by home page upload and header dropdown) */
    const startCreationWithFiles = useCallback((text?: string, withFiles = true, actionType?: 'asset' | 'task' | 'relation', scenarioId?: string) => {
        clearTimers()
        const at = actionType ?? 'asset'
        actionTypeRef.current = at
        const scenario = scenarioId
            ? (getScenarioById(scenarioId) ?? getRandomScenario())
            : at !== 'asset' ? getScenarioByActionType(at) : getRandomScenario()
        scenarioRef.current = scenario

        const browserFile = scenarioId ? BROWSER_FILES.find(f => f.scenarioId === scenarioId) : undefined
        const files = withFiles
            ? (browserFile ? [{ id: browserFile.id, name: browserFile.fileName }] : DEMO_FILES)
            : undefined
        setMessages([{
            id: nextId(),
            type: 'user-input',
            text: text || '',
            files,
        }])
        setCreatedItems([])
        setAttachedFiles([])
        setIsUploading(false)
        setUploadJustFinished(false)
        setQaQuestion(null)
        setQaOptions([])
        pauseIndexRef.current = -1
        setPhase('processing')
        setIsTyping(true)

        timersRef.current.push(setTimeout(() => {
            setIsTyping(false)
            const result = runPipeline(scenario)
            pauseIndexRef.current = result.pausedAfterEntry
        }, 1200))
    }, [runPipeline])

    const startCreation = useCallback(() => {
        clearTimers()
        setPhase('prompt')
        setMessages([{ id: nextId(), type: 'user-input', text: 'Create new asset' }])
        setCreatedItems([])
        setAttachedFiles([])
        setIsUploading(false)
        setUploadJustFinished(false)
        setIsTyping(true)
        setQaQuestion(null)
        setQaOptions([])
        pauseIndexRef.current = -1
        timersRef.current.push(setTimeout(() => {
            setIsTyping(false)
            setMessages(prev => [...prev,
                {
                    id: nextId(),
                    type: 'fojo-text',
                    text: "Tell me about the asset you'd like to add, or drop your documents below.\n\nI'll read it through, pull in details from public sources, and set up everything automatically.",
                },
                {
                    id: nextId(),
                    type: 'fojo-dropzone',
                    text: '',
                },
            ])
        }, 1400))
    }, [])

    const handleFileUpload = useCallback((scenarioId?: string, file?: AttachedFile) => {
        if (attachedFiles.length > 0 || isUploading) return
        const chip = file ?? DEMO_FILES[0]
        setPendingDocumentScenarioId(scenarioId ?? null)
        setAttachedFiles([chip])
        setIsUploading(true)
        timersRef.current.push(setTimeout(() => {
            setIsUploading(false)
            setUploadJustFinished(true)
            timersRef.current.push(setTimeout(() => {
                setUploadJustFinished(false)
            }, 2000))
        }, 1200))
    }, [attachedFiles, isUploading])

    const removeFile = useCallback((id: string) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== id))
    }, [])

    const submitInput = useCallback((text: string) => {
        const scenario = pendingDocumentScenarioId
            ? (getScenarioById(pendingDocumentScenarioId) ?? getRandomScenario())
            : getRandomScenario()
        scenarioRef.current = scenario
        setPendingDocumentScenarioId(null)

        // Remove dropzone if still showing
        setMessages(prev => prev.filter(m => m.type !== 'fojo-dropzone'))

        // Show user message with attached files
        addMessage({
            id: nextId(),
            type: 'user-input',
            text: text,
            files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
        })
        setAttachedFiles([])
        setIsUploading(false)
        setUploadJustFinished(false)

        setPhase('processing')
        setIsTyping(true)

        // Small delay then start pipeline
        timersRef.current.push(setTimeout(() => {
            setIsTyping(false)
            const result = runPipeline(scenario)
            pauseIndexRef.current = result.pausedAfterEntry
        }, 1200))
    }, [addMessage, runPipeline, attachedFiles, pendingDocumentScenarioId])

    const answerQA = useCallback((values: string[]) => {
        const scenario = scenarioRef.current
        if (!scenario) return

        setQaQuestion(null)
        setQaOptions([])

        // Show user's choice as a message
        const chosenOption = scenario.qa?.options.find(o => values.includes(o.value))
        addMessage({
            id: nextId(),
            type: 'user-input',
            text: chosenOption?.title ?? values.join(', '),
        })

        const includeAdditional = values.includes('add-vehicle') || values.includes('add')

        // Resume pipeline or go straight to creation
        const resumeIdx = pauseIndexRef.current
        const entries = getPipelineSequence(scenario.id)

        setIsTyping(true)

        if (resumeIdx >= 0 && resumeIdx < entries.length) {
            setPhase('processing')
            timersRef.current.push(setTimeout(() => {
                setIsTyping(false)
                const remaining = entries.slice(resumeIdx)
                let elapsed = 0

                for (const entry of remaining) {
                    if (entry.type === 'text') {
                        timersRef.current.push(setTimeout(() => {
                            addMessage({ id: nextId(), type: 'fojo-text', text: entry.text })
                        }, elapsed))
                        elapsed += entry.delayMs
                    } else {
                        timersRef.current.push(setTimeout(() => {
                            addMessage({ id: nextId(), type: 'fojo-tool', text: entry.text, detail: entry.detail, toolStatus: 'running' })
                        }, elapsed))
                        elapsed += entry.delayMs
                        timersRef.current.push(setTimeout(() => { updateLastToolMessage('complete') }, elapsed))
                        elapsed += 400
                    }
                }

                timersRef.current.push(setTimeout(() => {
                    const isAsset = actionTypeRef.current === 'asset'
                    const items = buildItems(scenario, includeAdditional)
                    if (isAsset) {
                        setCreatedItems(items)
                        onItemsCreated?.(items)
                    }
                    addMessage({
                        id: nextId(),
                        type: 'fojo-summary',
                        text: getSummaryText(actionTypeRef.current, scenario, items),
                        items: scenario.hideSummaryCards ? [] : items,
                        noClickItems: scenario.noClickSummaryCards,
                    })
                    setPhase('done')
                    if (scenario.postNavigation) {
                        onPostNavigation?.(scenario.postNavigation, items)
                    }
                }, elapsed + 200))
            }, 900))
        } else {
            timersRef.current.push(setTimeout(() => {
                setIsTyping(false)
                const isAsset = actionTypeRef.current === 'asset'
                const items = buildItems(scenario, includeAdditional)
                if (isAsset) {
                    setCreatedItems(items)
                    onItemsCreated?.(items)
                }
                addMessage({
                    id: nextId(),
                    type: 'fojo-summary',
                    text: getSummaryText(actionTypeRef.current, scenario, items),
                    items: scenario.hideSummaryCards ? [] : items,
                    noClickItems: scenario.noClickSummaryCards,
                })
                setPhase('done')
                if (scenario.postNavigation) {
                    onPostNavigation?.(scenario.postNavigation, items)
                }
            }, 1000))
        }
    }, [addMessage, updateLastToolMessage, buildItems, onItemsCreated])

    const reset = useCallback(() => {
        clearTimers()
        setPhase('idle')
        setMessages([])
        setAttachedFiles([])
        setIsUploading(false)
        setUploadJustFinished(false)
        setQaQuestion(null)
        setQaOptions([])
        setCreatedItems([])
        setPendingDocumentScenarioId(null)
        scenarioRef.current = null
        pauseIndexRef.current = -1
    }, [])

    return {
        phase,
        messages,
        attachedFiles,
        isUploading,
        uploadJustFinished,
        isTyping,
        qaQuestion,
        qaOptions,
        createdItems,
        startCreation,
        startCreationWithFiles,
        addTextMessage: useCallback((text: string) => {
            addMessage({ id: nextId(), type: 'fojo-text', text })
        }, [addMessage]),
        handleFileUpload,
        removeFile,
        submitInput,
        answerQA,
        reset,
    }
}
