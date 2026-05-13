import type { PipelineStage } from '@/data/thornton/pipeline-data'
import type { WorkflowStage } from '@/data/thornton/capital-call-decisions-data'

/**
 * Shared Investment Pipeline hub Kanban columns — aligned with deal-flow stages.
 * Capital-call operational steps map into these lanes so both workspaces match visually.
 */

export type HubPipelineColumn = {
    id: PipelineStage
    label: string
    dot: string
    text: string
    bg: string
    headerBg: string
}

export const HUB_PIPELINE_COLUMNS: HubPipelineColumn[] = [
    { id: 'sourcing',       label: 'Sourcing',       dot: '#6B7280', text: '#374151', bg: '#F9FAFB', headerBg: '#F3F4F6' },
    { id: 'initial-review', label: 'Initial Review', dot: '#3B82F6', text: '#1E40AF', bg: '#EFF6FF', headerBg: '#DBEAFE' },
    { id: 'due-diligence',  label: 'Due Diligence',  dot: '#F59E0B', text: '#92400E', bg: '#FFFBEB', headerBg: '#FEF3C7' },
    { id: 'ic-review',      label: 'IC Review',      dot: '#8B5CF6', text: '#5B21B6', bg: '#F5F3FF', headerBg: '#EDE9FE' },
    { id: 'approved',       label: 'Approved',       dot: '#10B981', text: '#065F46', bg: '#ECFDF5', headerBg: '#D1FAE5' },
    { id: 'declined',       label: 'Declined',       dot: '#EF4444', text: '#991B1B', bg: '#FEF2F2', headerBg: '#FECACA' },
]

/** Capital Kanban subtitle — explains how backend workflow maps into this lane */
export const HUB_CAPITAL_KANBAN_CAPTION: Record<PipelineStage, string> = {
    sourcing:
        'Notice intake — PDF upload, AI match & allocator notes.',
    'initial-review':
        'Light triage when a call needs a second look before diligence.',
    'due-diligence':
        'Liquidity checks & document validation.',
    'ic-review':
        'Formal approval chain.',
    approved:
        'Wire-ready — execution & custody.',
    declined:
        'Withdrawn or rejected calls.',
}

/**
 * Maps capital-call workflow rows onto hub columns (same IDs as deal PipelineStage).
 * Keeps granular WorkflowStage on records for detail / table badges.
 */
export function capitalWorkflowToHubStage(stage: WorkflowStage): PipelineStage {
    switch (stage) {
        case 'ai-match':
        case 'allocator-review':
            return 'sourcing'
        case 'approval':
            return 'ic-review'
        case 'liquidity-check':
        case 'validation':
            return 'due-diligence'
        case 'execution':
            return 'approved'
    }
}
