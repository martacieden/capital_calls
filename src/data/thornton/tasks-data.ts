import type { AnyCatalogItem } from '@/data/types'

export type TaskStatus = 'To Do' | 'In Progress' | 'Upcoming' | 'Done'
export type TaskPriority = 'High' | 'Medium' | 'Low'
export type TaskType = 'Insurance' | 'Maintenance' | 'Legal' | 'Tax & Accounting'

const TASK_TYPES: TaskType[] = ['Insurance', 'Maintenance', 'Legal', 'Tax & Accounting']

export function initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]!}${parts[parts.length - 1]![0]!}`.toUpperCase()
}

function catalogPriority(raw: unknown): TaskPriority {
    const p = String(raw ?? '').toLowerCase()
    if (p.includes('high')) return 'High'
    if (p.includes('low')) return 'Low'
    return 'Medium'
}

export interface Task {
    id: string
    title: string
    type: TaskType
    relatedAsset?: string
    relatedAssetId?: string
    relatedAssetType?: string
    /** FO context: monetary or risk headline, e.g. "$4.2M yacht insurance" */
    relatedValue?: string
    assignee: string
    /** When set, UI shows multiple assignees (avatar stack); primary remains `assignee` for sorting */
    assignees?: string[]
    assigneeRole?: string
    dueDate: string
    status: TaskStatus
    priority: TaskPriority
    recurring: boolean
    recurrenceInterval?: string
    nextOccurrence?: string
    description: string
    notes?: string
    createdAt: string

    // Insurance-specific
    insurer?: string
    policyNumber?: string
    currentPremium?: string
    coverageAmount?: string

    // Maintenance-specific
    serviceProvider?: string
    estimatedCost?: string
    location?: string
    lastCompleted?: string

    // Legal-specific
    lawFirm?: string
    contactEmail?: string
    contactPhone?: string
    relatedTrust?: string
    estimatedLegalFee?: string

    // Contact-modal–created task fields
    relatedEvent?: string
    relatedEventId?: string
    assigneeFirm?: string
    assigneeEmail?: string
    assigneePhone?: string
    createdFrom?: string
}

/** Map a catalog row created by Fojo (categoryKey `task`) into the Tasks UI model. */
export function taskFromCatalogItem(item: AnyCatalogItem): Task | null {
    if (item.categoryKey !== 'task') return null
    const f = item.customFields ?? {}
    const rawType = f['Task Type'] ?? f['Type']
    const type: TaskType =
        typeof rawType === 'string' && TASK_TYPES.includes(rawType as TaskType)
            ? (rawType as TaskType)
            : 'Legal'
    const assignee = String(f['Assignee'] ?? 'Unassigned')
    const dueRaw = f['Due Date'] != null ? String(f['Due Date']) : item.createdAt
    const dueDate = dueRaw.slice(0, 10)
    const relatedAsset = f['Related Entity'] != null ? String(f['Related Entity']) : undefined
    const relatedAssetId = f['Related Entity Id'] != null ? String(f['Related Entity Id']).trim() : undefined

    const relatedValue = f['Related Value'] != null ? String(f['Related Value']) : undefined

    return {
        id: item.id,
        title: item.name,
        type,
        status: 'To Do',
        priority: catalogPriority(f['Priority']),
        assignee,
        dueDate,
        recurring: false,
        relatedAsset,
        relatedAssetId: relatedAssetId || undefined,
        relatedValue,
        description: item.description ?? '',
        createdAt: item.createdAt.slice(0, 10),
    }
}

export const mockTasks: Task[] = [
    {
        id: 'task-001',
        title: 'Renew Hull & Machinery Insurance',
        type: 'Insurance',
        relatedAsset: 'Motor Yacht Sovereign',
        relatedAssetId: 'thn-a26',
        relatedAssetType: 'Maritime',
        assignee: 'James Hartwell',
        assigneeRole: 'Insurance Advisor',
        dueDate: '2025-02-15',
        status: 'Upcoming',
        priority: 'High',
        recurring: true,
        recurrenceInterval: 'Every 12 months',
        nextOccurrence: '2026-02-15',
        description: 'Annual renewal of Hull & Machinery insurance policy for M/Y Sovereign. Current coverage: $4.2M. Contact broker at Marsh McLennan to review updated valuation and terms before expiry.',
        insurer: 'Chubb Marine Insurance',
        policyNumber: 'CHB-MAR-2024-7821',
        currentPremium: '$18,400/year',
        coverageAmount: '$4,200,000',
        relatedValue: '$4.2M yacht insurance (Hull & Machinery)',
        assignees: ['James Hartwell', 'Marco Delgado'],
        notes: 'Request updated vessel appraisal report before renewal. Last renewal included agreed value endorsement.',
        createdAt: '2025-01-15',
    },
    {
        id: 'task-002',
        title: 'Scheduled Engine Service & Antifouling',
        type: 'Maintenance',
        relatedAsset: 'Motor Yacht Sovereign',
        relatedAssetId: 'thn-a26',
        relatedAssetType: 'Maritime',
        assignee: 'Marco Delgado',
        assigneeRole: 'Marine Technician',
        dueDate: '2025-03-10',
        status: 'In Progress',
        priority: 'High',
        recurring: true,
        recurrenceInterval: 'Every 6 months',
        nextOccurrence: '2025-09-10',
        description: 'Bi-annual full engine service for twin MTU diesel engines on M/Y Sovereign. Includes oil change, impeller replacement, zincs, and full antifouling bottom paint at Fort Lauderdale home port.',
        serviceProvider: 'Lauderdale Marine Center',
        estimatedCost: '$12,500',
        location: 'Fort Lauderdale, FL',
        lastCompleted: '2024-09-08',
        relatedValue: '~$12.5K marine service scope',
        notes: 'Check starboard engine oil seal — minor leak reported by captain in October. Confirm with boatyard before haul-out.',
        createdAt: '2025-02-01',
    },
    {
        id: 'task-003',
        title: 'Annual Airworthiness Inspection – FAA Part 91 (G700)',
        type: 'Maintenance',
        relatedAsset: 'Gulfstream G700',
        relatedAssetId: 'thn-a25',
        relatedAssetType: 'Aviation',
        assignee: 'Sarah Kimura',
        assigneeRole: 'Aviation Manager',
        dueDate: '2025-04-01',
        status: 'To Do',
        priority: 'High',
        recurring: true,
        recurrenceInterval: 'Every 12 months',
        nextOccurrence: '2026-04-01',
        description: 'Annual FAA-mandated airworthiness inspection on the Gulfstream G700 fleet aircraft. Includes avionics check, structural inspection, and engine borescope. Aircraft to be taken offline for 5 business days at Signature FBO, Teterboro.',
        serviceProvider: 'Duncan Aviation',
        estimatedCost: '$68,000',
        location: 'Teterboro Airport (TEB), NJ',
        lastCompleted: '2024-03-28',
        relatedValue: 'G700 · ~$68K inspection program',
        notes: 'Coordinate with pilot team to block calendar. Arrange charter backup for owner travel during downtime.',
        createdAt: '2025-03-01',
    },
    {
        id: 'task-004',
        title: 'Review & Update Revocable Living Trust – Art Collection',
        type: 'Legal',
        relatedAsset: 'Basquiat Collection',
        relatedAssetId: 'thn-a28',
        relatedAssetType: 'Art',
        assignee: 'Richard Calloway',
        assigneeRole: 'Estate Attorney',
        dueDate: '2025-02-28',
        status: 'To Do',
        priority: 'Medium',
        recurring: false,
        description: 'Schedule review meeting with estate attorney to update the revocable living trust provisions related to the contemporary art collection. Current appraised value has increased by ~$3.1M since last trust amendment. Beneficiary allocations may need adjustment.',
        lawFirm: 'Sullivan & Cromwell LLP',
        contactEmail: 'r.calloway@sullcrom.com',
        contactPhone: '+1 (212) 558-4000',
        relatedTrust: 'The Whitmore Family Revocable Trust, 2019',
        relatedValue: 'Art collection · ~$9.4M appraised (2024)',
        notes: "Bring latest appraisal reports from Sotheby's (Oct 2024). Discuss Basquiat piece separately — authentication still pending.",
        createdAt: '2025-01-20',
    },
    {
        id: 'task-005',
        title: 'Transfer BC Waterfront Residence to Holding LLC',
        type: 'Legal',
        relatedAsset: 'Vancouver Waterfront Residence',
        relatedAssetId: 'thn-a5',
        relatedAssetType: 'Real Estate',
        assignee: 'Isabelle Fontaine',
        assigneeRole: 'Tax & Structuring Attorney',
        dueDate: '2025-05-15',
        status: 'In Progress',
        priority: 'High',
        recurring: false,
        description: 'Coordinate with Canadian counsel to transfer BC waterfront title into a discretionary holding entity. Obtain independent appraisal for contemplated transfer-pricing memo.',
        lawFirm: 'Osler LLP (Vancouver)',
        contactEmail: 'i.fontaine@lenzstaehelin.com',
        estimatedLegalFee: '$45,000',
        relatedValue: 'BC residence · title transfer · ~$45K legal',
        assignees: ['Isabelle Fontaine', 'Richard Calloway'],
        notes: 'Deadline driven by upcoming Monaco tax residency review. Ensure coordination with Geneva family office team.',
        createdAt: '2025-03-15',
    },
    {
        id: 'task-demo-001',
        title: 'Scheduled Engine Service — Azimut 72',
        type: 'Maintenance',
        relatedAsset: 'Azimut 72',
        relatedAssetId: 'thn-a-azimut72',
        relatedAssetType: 'Maritime',
        assignee: 'Marco Delgado',
        assigneeRole: 'Marine Technician',
        dueDate: '2026-06-01',
        status: 'Upcoming',
        priority: 'High',
        recurring: true,
        recurrenceInterval: 'Every 6 months',
        nextOccurrence: '2026-12-01',
        description: 'Bi-annual engine service & antifouling for Azimut 72. Includes oil change, impeller replacement, zincs, and bottom paint. Home port Fort Lauderdale.',
        serviceProvider: 'Lauderdale Marine Center',
        estimatedCost: '$8,500',
        location: 'Fort Lauderdale, FL',
        relatedValue: 'Azimut 72 · ~$8.5K service',
        notes: 'Coordinate with captain to schedule haul-out window. Allow 5 days offline.',
        createdAt: '2026-04-01',
    },
    {
        id: 'task-demo-002',
        title: 'Year-End Tax Planning Review',
        type: 'Tax & Accounting',
        relatedAsset: undefined,
        assignee: 'Michael Torres',
        assigneeRole: 'Senior Tax Partner',
        assigneeFirm: 'Deloitte Private',
        assigneeEmail: 'm.torres@deloitte.com',
        assigneePhone: '+1 (212) 436-2000',
        dueDate: '2026-12-31',
        status: 'To Do',
        priority: 'High',
        recurring: false,
        description: 'Year-end tax review required. Real estate portfolio generated significant capital gains this fiscal year. Coordinate with CPA on tax optimization strategies.',
        relatedEvent: 'Annual Tax Review',
        relatedEventId: 'thn-d-demo-003',
        createdFrom: 'timeline',
        notes: 'Focus on capital gains from real estate disposals and carry-over losses.',
        relatedValue: 'Household tax · multi-entity scope',
        assignees: ['Michael Torres', 'Isabelle Fontaine'],
        createdAt: '2026-04-01',
    },
]

/** Alias kept for any existing imports */
export const thorntonTasks = mockTasks
