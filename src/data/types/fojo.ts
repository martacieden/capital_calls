import type { AnyCatalogItem, Relationship } from '@/data/types'

/** Augmented catalog item with display hints added during chat rendering */
export type ChatCardItem = AnyCatalogItem & {
    _icon?: string
    _meta?: string
    _relLabel?: string
    _accentIcon?: boolean
    _detail?: string
}

export interface ChatAction {
    label: string
    key: string
    group?: string
    description?: string
}

export interface QAOption {
    title: string
    description: string
    value: string
}

export interface ChatMessage {
    id: number
    role: 'user' | 'assistant'
    text: string
    artifact?: 'timeline'
    cards?: ChatCardItem[]
    actions?: ChatAction[]
    questionText?: string
}

export interface Conversation {
    id: string
    title: string
    messages: ChatMessage[]
    source: 'user' | 'fojo'
    createdAt: number
}

export interface FojoNotification {
    id: string
    conversationId: string
    type: 'estate-review' | 'coverage-gap' | 'distribution'
    title: string
    preview: string
    timestamp: number
    read: boolean
}

export interface CatalogUpdate {
    items?: AnyCatalogItem[]
    relationships?: Relationship[]
}
