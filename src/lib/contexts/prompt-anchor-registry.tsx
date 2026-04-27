import { createContext } from 'react'

/** Returns the DOM node whose screen rect should anchor a portaled menu/prompt. */
export type AnchorElGetter = () => HTMLElement | null

export type PromptAnchorRegistry = {
    register: (id: string, getEl: AnchorElGetter) => void
    unregister: (id: string) => void
}

export const GraphPromptAnchorRegistryContext = createContext<PromptAnchorRegistry | null>(null)

export const TimelinePromptAnchorRegistryContext = createContext<PromptAnchorRegistry | null>(null)
