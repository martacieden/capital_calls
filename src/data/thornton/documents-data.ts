/**
 * documents-data.ts — Static document metadata for the Document Hub page.
 * These are the 3 source PDFs uploaded during onboarding.
 */

import type { PriorityStatus } from '@/data/types'

export interface DocumentRecord {
    id: string
    fileName: string
    name: string
    description: string
    fileType: 'PDF'
    pageCount: number
    uploadedBy: { name: string; initials: string }
    uploadedOn: string
    organizationId: string
    organizationName: string
    sharedWith: { name: string; initials: string }[]
    attachedItemIds: string[]
    status: 'Available'
    collections: string[]
    thumbnailPdf?: string
    priorityStatus?: PriorityStatus
}

export interface DocCollection {
    key: string
    label: string
    icon: string
    pinned?: boolean
    docIds: string[]
    description?: string
    priorityStatus?: PriorityStatus
}

export const documentCollections: DocCollection[] = [
    { key: 'signatures', label: 'Signatures', icon: '\u{270D}\uFE0F', pinned: true, docIds: [], description: 'Documents requiring or containing electronic signatures via DocuSign.' },
    { key: 'trust-documents', label: 'Trust Documents', icon: '\u{1F4DC}', docIds: ['doc-family-trust', 'doc-dynasty-trust-1', 'doc-dynasty-trust-2'], description: 'Trust agreements, amendments, and governing instruments for all Thornton family trusts.', priorityStatus: { type: 'expiring-soon', detail: 'Trust amendment deadline approaching May 1' } },
    { key: 'inventory-lists', label: 'Inventory Lists', icon: '\u{1F4CB}', docIds: ['doc-inventory'], description: 'Annual inventory reports of tangible and intangible assets held across family entities.' },
    { key: 'insurance-policies', label: 'Insurance Policies', icon: '\u{1F6E1}\uFE0F', docIds: ['doc-insurance'], description: 'Life insurance, umbrella liability, and property insurance policies protecting family assets.' },
]

export const thorntonDocuments: DocumentRecord[] = [
    {
        id: 'doc-family-trust',
        fileName: 'family-trust-agreement.pdf',
        name: 'Family Trust Agreement',
        description: 'Thornton Family Revocable Living Trust agreement establishing trust structure, beneficiary designations, and distribution schedules.',
        fileType: 'PDF',
        pageCount: 42,
        uploadedBy: { name: 'Sandra Whitfield', initials: 'SW' },
        uploadedOn: '2026-03-15',
        organizationId: 'org-thornton',
        organizationName: 'Thornton Family',
        sharedWith: [
            { name: 'Edward Thornton IV', initials: 'ET' },
            { name: 'Michael Chen', initials: 'MC' },
        ],
        attachedItemIds: [
            'thn-p1', 'thn-p2', 'thn-p3', 'thn-p4', 'thn-p5', 'thn-p6', 'thn-p7', 'thn-p8', 'thn-p9', 'thn-p10', 'thn-p11', 'thn-p16', 'thn-p17', 'thn-p18', 'thn-p19',
            'thn-t1', 'thn-t2', 'thn-t3', 'thn-t4', 'thn-t5', 'thn-t6', 'thn-t7', 'thn-t8', 'thn-t9', 'thn-t10', 'thn-t11', 'thn-t12', 'thn-t13', 'thn-t14',
            'thn-e1', 'thn-e2', 'thn-e9', 'thn-e12',
            'thn-a32', 'thn-a34',
        ],
        status: 'Available',
        collections: [],
        thumbnailPdf: '/documents/family-trust-agreement-p1-thn-t1.pdf',
        priorityStatus: { type: 'expiring-soon', detail: 'Expiring soon — trust amendment deadline approaching May 1' },
    },
    {
        id: 'doc-dynasty-trust-1',
        fileName: 'dynasty-trust-i-agreement.pdf',
        name: 'Dynasty Trust I Agreement',
        description: 'Dynasty Trust I instrument under South Dakota law — perpetual trust for Marriage 1 descendants, asset protection provisions, and trustee succession.',
        fileType: 'PDF',
        pageCount: 28,
        uploadedBy: { name: 'Sandra Whitfield', initials: 'SW' },
        uploadedOn: '2026-03-15',
        organizationId: 'org-thornton',
        organizationName: 'Thornton Family',
        sharedWith: [
            { name: 'Edward Thornton IV', initials: 'ET' },
            { name: 'Michael Chen', initials: 'MC' },
        ],
        attachedItemIds: [
            'thn-p1', 'thn-p2', 'thn-p4', 'thn-p5',
            'thn-t2',
        ],
        status: 'Available',
        collections: [],
        thumbnailPdf: '/documents/family-trust-agreement-p28-thn-t2.pdf',
        priorityStatus: { type: 'updated', detail: 'Edited 2 hours ago by Sandra Whitfield' },
    },
    {
        id: 'doc-dynasty-trust-2',
        fileName: 'dynasty-trust-ii-agreement.pdf',
        name: 'Dynasty Trust II Agreement',
        description: 'Dynasty Trust II instrument for Marriage 2 children and philanthropy — separate governance from Dynasty I, South Dakota situs.',
        fileType: 'PDF',
        pageCount: 24,
        uploadedBy: { name: 'Sandra Whitfield', initials: 'SW' },
        uploadedOn: '2026-03-15',
        organizationId: 'org-thornton',
        organizationName: 'Thornton Family',
        sharedWith: [
            { name: 'Edward Thornton IV', initials: 'ET' },
        ],
        attachedItemIds: [
            'thn-p1', 'thn-p3', 'thn-p6', 'thn-p7', 'thn-p8',
            'thn-t3',
        ],
        status: 'Available',
        collections: [],
        thumbnailPdf: '/documents/family-trust-agreement-p34-thn-t3.pdf',
    },
    {
        id: 'doc-inventory',
        fileName: 'inventory-list-2026.pdf',
        name: 'Inventory List 2026',
        description: 'Annual inventory of all tangible and intangible assets held across Thornton family entities and trusts.',
        fileType: 'PDF',
        pageCount: 15,
        uploadedBy: { name: 'Sandra Whitfield', initials: 'SW' },
        uploadedOn: '2026-03-15',
        organizationId: 'org-thornton',
        organizationName: 'Thornton Family',
        sharedWith: [
            { name: 'Michael Chen', initials: 'MC' },
            { name: 'Richard Caldwell', initials: 'RC' },
        ],
        attachedItemIds: [
            'thn-e3', 'thn-e4', 'thn-e5', 'thn-e6', 'thn-e8', 'thn-e12',
            'thn-a1', 'thn-a2', 'thn-a5', 'thn-a7', 'thn-a8', 'thn-a9', 'thn-a15',
            'thn-a25', 'thn-a26', 'thn-a27', 'thn-a28', 'thn-a29', 'thn-a30', 'thn-a35', 'thn-a36', 'thn-a37', 'thn-a39', 'thn-a40', 'thn-a43',
        ],
        status: 'Available',
        collections: [],
        thumbnailPdf: '/documents/inventory-list-2024-p10-thn-a8.pdf',
    },
    {
        id: 'doc-insurance',
        fileName: 'insurance-policies.pdf',
        name: 'Insurance Policies',
        description: 'Life insurance, umbrella liability, and property insurance policies held by or benefiting Thornton family trusts.',
        fileType: 'PDF',
        pageCount: 18,
        uploadedBy: { name: 'Sandra Whitfield', initials: 'SW' },
        uploadedOn: '2026-03-15',
        organizationId: 'org-thornton',
        organizationName: 'Thornton Family',
        sharedWith: [
            { name: 'Edward Thornton IV', initials: 'ET' },
        ],
        attachedItemIds: [
            'thn-p2', 'thn-p3', 'thn-t4', 'thn-e10',
            'thn-a24', 'thn-a25', 'thn-a26', 'thn-a27', 'thn-a28', 'thn-a29', 'thn-a36', 'thn-a38', 'thn-a39', 'thn-a44', 'thn-a45', 'thn-a46',
        ],
        status: 'Available',
        collections: [],
        thumbnailPdf: '/documents/insurance-policies-p1-thn-a24.pdf',
    },
]

/* ── Mock documents for smart collection demos ── */

const SW = { name: 'Sandra Whitfield', initials: 'SW' }
const MC = { name: 'Michael Chen', initials: 'MC' }
const RC = { name: 'Richard Caldwell', initials: 'RC' }
const THN = { organizationId: 'org-thornton', organizationName: 'Thornton Family', status: 'Available' as const, collections: [], fileType: 'PDF' as const }

export const mockCollectionDocuments: DocumentRecord[] = [
    // Tesla Model X
    { ...THN, id: 'mock-tesla-title', fileName: 'tesla-model-x-title.pdf', name: 'Tesla Model X — Certificate of Title', description: 'State of New York certificate of title for 2024 Tesla Model X, VIN 5YJXCDE27LF, titled to Thornton Family Trust.', pageCount: 2, uploadedBy: SW, uploadedOn: '2025-09-12', sharedWith: [], attachedItemIds: ['thn-a43'] },
    { ...THN, id: 'mock-tesla-insurance', fileName: 'tesla-model-x-auto-policy.pdf', name: 'Tesla Model X — Auto Insurance Policy', description: 'Chubb Private Auto umbrella policy covering 2024 Tesla Model X, $2M liability, comprehensive and collision.', pageCount: 8, uploadedBy: SW, uploadedOn: '2025-09-14', sharedWith: [MC], attachedItemIds: ['thn-a43'] },
    { ...THN, id: 'mock-tesla-purchase', fileName: 'tesla-model-x-purchase-agreement.pdf', name: 'Tesla Model X — Purchase Agreement', description: 'Purchase and sale agreement for 2024 Tesla Model X from Manhattan Motor Cars, paid from Family Trust operating account.', pageCount: 4, uploadedBy: MC, uploadedOn: '2025-08-30', sharedWith: [], attachedItemIds: ['thn-a43', 'thn-t1'] },

    // Hamptons Estate
    { ...THN, id: 'mock-hamptons-deed', fileName: 'hamptons-estate-deed.pdf', name: 'Hamptons Estate — Property Deed', description: 'Warranty deed for 14 Meadow Lane, Southampton, NY held by Thornton Real Estate Holdings LLC.', pageCount: 6, uploadedBy: RC, uploadedOn: '2024-06-15', sharedWith: [SW], attachedItemIds: ['thn-a2', 'thn-e3'] },
    { ...THN, id: 'mock-hamptons-insurance', fileName: 'hamptons-homeowners-policy.pdf', name: 'Hamptons Estate — Homeowners Policy', description: 'AIG Private Client Group homeowners policy, dwelling coverage $18.5M, scheduled personal property rider included.', pageCount: 12, uploadedBy: SW, uploadedOn: '2025-01-10', sharedWith: [MC], attachedItemIds: ['thn-a2'] },
    { ...THN, id: 'mock-hamptons-tax', fileName: 'hamptons-property-tax-2025.pdf', name: 'Hamptons Estate — Property Tax Assessment 2025', description: 'Town of Southampton property tax assessment and payment confirmation for fiscal year 2025.', pageCount: 3, uploadedBy: MC, uploadedOn: '2025-11-20', sharedWith: [], attachedItemIds: ['thn-a2'] },
    { ...THN, id: 'mock-hamptons-renovation', fileName: 'hamptons-renovation-contract.pdf', name: 'Hamptons Estate — Renovation Contract', description: 'General contractor agreement for pool house renovation and landscaping, $1.2M budget approved by trust.', pageCount: 14, uploadedBy: SW, uploadedOn: '2026-01-08', sharedWith: [RC], attachedItemIds: ['thn-a2', 'thn-e3'] },

    // Dynasty Trust I Distributions
    { ...THN, id: 'mock-dynasty1-schedule', fileName: 'dynasty-trust-i-distribution-schedule.pdf', name: 'Dynasty Trust I — 2025 Distribution Schedule', description: 'Annual distribution schedule for Dynasty Trust I beneficiaries, including quarterly income and discretionary principal distributions.', pageCount: 5, uploadedBy: RC, uploadedOn: '2025-12-15', sharedWith: [SW], attachedItemIds: ['thn-t2', 'thn-p4', 'thn-p5'] },
    { ...THN, id: 'mock-dynasty1-accounting', fileName: 'dynasty-trust-i-annual-accounting.pdf', name: 'Dynasty Trust I — Annual Trust Accounting 2025', description: 'Full fiduciary accounting for Dynasty Trust I, including receipts, disbursements, and asset valuations as of Dec 31, 2025.', pageCount: 22, uploadedBy: MC, uploadedOn: '2026-02-01', sharedWith: [RC], attachedItemIds: ['thn-t2'] },
    { ...THN, id: 'mock-dynasty1-letter', fileName: 'dynasty-trust-i-beneficiary-notice.pdf', name: 'Dynasty Trust I — Beneficiary Notification Letter', description: 'Annual Crummey withdrawal notice sent to Dynasty Trust I beneficiaries regarding 2025 gift contributions.', pageCount: 3, uploadedBy: RC, uploadedOn: '2025-12-20', sharedWith: [], attachedItemIds: ['thn-t2', 'thn-p4', 'thn-p5'] },

    // 2026 Tax Season
    { ...THN, id: 'mock-tax-return', fileName: 'thornton-family-trust-1041-2025.pdf', name: 'Family Trust — Form 1041 Draft (2025)', description: 'Draft federal fiduciary income tax return (Form 1041) for Thornton Family Revocable Living Trust, tax year 2025.', pageCount: 18, uploadedBy: MC, uploadedOn: '2026-02-28', sharedWith: [RC, SW], attachedItemIds: ['thn-t1'] },
    { ...THN, id: 'mock-tax-k1', fileName: 'dynasty-trust-i-k1-2025.pdf', name: 'Dynasty Trust I — Schedule K-1 (2025)', description: 'Beneficiary Schedule K-1 for Dynasty Trust I showing distributive share of income, deductions, and credits.', pageCount: 4, uploadedBy: MC, uploadedOn: '2026-03-01', sharedWith: [RC], attachedItemIds: ['thn-t2'] },
    { ...THN, id: 'mock-tax-charitable', fileName: 'thornton-charitable-donations-2025.pdf', name: 'Charitable Donation Receipts 2025', description: 'Compiled acknowledgment letters and receipts for all charitable contributions made through Thornton Foundation in 2025.', pageCount: 9, uploadedBy: SW, uploadedOn: '2026-01-15', sharedWith: [MC], attachedItemIds: ['thn-e9'] },

    // Art Collection
    { ...THN, id: 'mock-art-appraisal', fileName: 'art-collection-appraisal-2025.pdf', name: 'Art Collection — Appraisal Report 2025', description: 'Independent appraisal of Warhol portfolio and Basquiat collection by Christie\'s Advisory, aggregate fair market value $14.2M.', pageCount: 16, uploadedBy: SW, uploadedOn: '2025-10-05', sharedWith: [MC], attachedItemIds: ['thn-a7', 'thn-a8'] },
    { ...THN, id: 'mock-art-insurance', fileName: 'fine-art-insurance-rider.pdf', name: 'Art Collection — Fine Art Insurance Rider', description: 'Scheduled fine art floater under AIG Private Client Group policy, covering Warhol and Basquiat works in transit and at residence.', pageCount: 6, uploadedBy: SW, uploadedOn: '2025-10-12', sharedWith: [], attachedItemIds: ['thn-a7', 'thn-a8'] },
    { ...THN, id: 'mock-art-provenance', fileName: 'basquiat-provenance-docs.pdf', name: 'Basquiat Collection — Provenance Documentation', description: 'Chain of ownership documentation for three Basquiat works acquired through Sotheby\'s, including certificates of authenticity.', pageCount: 11, uploadedBy: SW, uploadedOn: '2024-03-22', sharedWith: [RC], attachedItemIds: ['thn-a8'] },

    // Gulfstream G700
    { ...THN, id: 'mock-gulf-registration', fileName: 'gulfstream-g700-faa-registration.pdf', name: 'Gulfstream G700 — FAA Registration', description: 'Federal Aviation Administration aircraft registration certificate, N-number N700TH, registered to Thornton Aviation LLC.', pageCount: 2, uploadedBy: RC, uploadedOn: '2025-04-10', sharedWith: [], attachedItemIds: ['thn-a5', 'thn-e6'] },
    { ...THN, id: 'mock-gulf-insurance', fileName: 'gulfstream-g700-hull-policy.pdf', name: 'Gulfstream G700 — Aviation Hull & Liability Policy', description: 'Global Aerospace hull all-risks and liability policy, insured value $72M, worldwide coverage including war risk.', pageCount: 14, uploadedBy: SW, uploadedOn: '2025-05-01', sharedWith: [MC], attachedItemIds: ['thn-a5'] },
    { ...THN, id: 'mock-gulf-hangar', fileName: 'gulfstream-hangar-lease.pdf', name: 'Gulfstream G700 — Hangar Lease Agreement', description: 'Hangar lease at Teterboro Airport (TEB) with Atlantic Aviation, includes maintenance facility access and ground handling.', pageCount: 8, uploadedBy: RC, uploadedOn: '2025-03-15', sharedWith: [], attachedItemIds: ['thn-a5', 'thn-e6'] },

    // Montana Ranch
    { ...THN, id: 'mock-ranch-deed', fileName: 'montana-ranch-deed.pdf', name: 'Montana Ranch — Property Deed', description: 'General warranty deed for 2,400-acre ranch property in Paradise Valley, MT, held by Thornton Real Estate Holdings LLC.', pageCount: 8, uploadedBy: RC, uploadedOn: '2023-09-20', sharedWith: [SW], attachedItemIds: ['thn-a40', 'thn-e3'] },
    { ...THN, id: 'mock-ranch-operations', fileName: 'montana-ranch-operations-agreement.pdf', name: 'Montana Ranch — Operations & Management Agreement', description: 'Property management agreement with Big Sky Ranch Services for livestock operations, land stewardship, and guest services.', pageCount: 10, uploadedBy: SW, uploadedOn: '2024-01-05', sharedWith: [MC], attachedItemIds: ['thn-a40'] },
    { ...THN, id: 'mock-ranch-ag-tax', fileName: 'montana-ranch-ag-exemption.pdf', name: 'Montana Ranch — Agricultural Tax Exemption', description: 'Montana Department of Revenue agricultural classification and property tax exemption certificate for qualifying ranch operations.', pageCount: 4, uploadedBy: MC, uploadedOn: '2025-08-10', sharedWith: [], attachedItemIds: ['thn-a40'] },
]

/* ── Smart collection templates for demo ── */

export const MOCK_COLLECTION_TEMPLATES: Omit<DocCollection, 'key'>[] = [
    { label: 'Tesla Model X', icon: '\u{1F697}', docIds: ['mock-tesla-title', 'mock-tesla-insurance', 'mock-tesla-purchase'], description: 'Title, insurance, and purchase documents for the 2024 Tesla Model X held by the Family Trust.' },
    { label: 'Hamptons Estate', icon: '\u{1F3D6}\uFE0F', docIds: ['mock-hamptons-deed', 'mock-hamptons-insurance', 'mock-hamptons-tax', 'mock-hamptons-renovation'], description: 'Property deed, homeowners policy, tax assessments, and renovation contracts for 14 Meadow Lane, Southampton.' },
    { label: 'Dynasty Trust I Distributions', icon: '\u{1F4B0}', docIds: ['mock-dynasty1-schedule', 'mock-dynasty1-accounting', 'mock-dynasty1-letter', 'doc-dynasty-trust-1'], description: 'Distribution schedules, annual accounting, and beneficiary notices for Dynasty Trust I.' },
    { label: '2026 Tax Season', icon: '\u{1F9FE}', docIds: ['mock-tax-return', 'mock-tax-k1', 'mock-tax-charitable', 'doc-family-trust'], description: 'Form 1041 drafts, Schedule K-1s, and charitable donation receipts for the 2025 tax year.' },
    { label: 'Art Collection', icon: '\u{1F3A8}', docIds: ['mock-art-appraisal', 'mock-art-insurance', 'mock-art-provenance'], description: 'Appraisal reports, fine art insurance riders, and provenance documentation for the Warhol and Basquiat works.' },
    { label: 'Gulfstream G700', icon: '\u{2708}\uFE0F', docIds: ['mock-gulf-registration', 'mock-gulf-insurance', 'mock-gulf-hangar'], description: 'FAA registration, hull and liability policy, and hangar lease for the Gulfstream G700 aircraft.' },
    { label: 'Montana Ranch', icon: '\u{1F33E}', docIds: ['mock-ranch-deed', 'mock-ranch-operations', 'mock-ranch-ag-tax'], description: 'Property deed, operations agreement, and agricultural tax exemption for the Paradise Valley ranch.' },
]
