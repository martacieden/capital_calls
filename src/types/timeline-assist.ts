import type { DistributionEvent } from '@/data/types'

/**
 * Контекст з таймлайн-картки (⋯): уся взаємодія лише всередині Fojo-панелі, без модалок.
 */
export type TimelineAssistFlow = 'create-task' | 'contact-lawyer' | 'contact-cpa'

export interface TimelineAssistSession {
    flow: TimelineAssistFlow
    /** Підпис події («New Dependent» тощо) */
    contextName: string
    contextEventId: string
    /** Для trust-розподілів — щоб створити запис на таймлайні як у ContactModal */
    sourceDistributionEvent?: DistributionEvent | null
    suggestedTaskTitle?: string
    suggestedLawyerSpecialization?: string
    suggestedDescription?: string
    eventDescription?: string
}
