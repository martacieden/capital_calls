/**
 * asset-collections.ts — Asset collection definitions for the Assets page.
 * Mirrors the DocCollection pattern from documents-data.ts.
 */

import type { PriorityStatus } from '@/data/types'

export interface AssetCollection {
    key: string
    label: string
    icon: string
    description: string
    itemIds: string[]
    priorityStatus?: PriorityStatus
}

export const assetCollections: AssetCollection[] = [
    {
        key: 'dynasty-trust-i',
        label: 'Dynasty Trust I',
        icon: '\u{1F3DB}\uFE0F',
        description: 'All assets currently held within Dynasty Trust I, including real estate, managed accounts, and personal property for Marriage 1 descendants.',
        itemIds: ['thn-a1', 'thn-a2', 'thn-a10', 'thn-a11', 'thn-a25', 'thn-a27', 'thn-a28'],
        priorityStatus: { type: 'expiring-soon', detail: '2 assets have expiring policies that need renewal' },
    },
    {
        key: 'edward-lifestyle',
        label: "Edward's Lifestyle Assets",
        icon: '\u{1F451}',
        description: 'Personal-use assets designated for Edward Thornton IV, including residences, vehicles, watercraft, and art.',
        itemIds: ['thn-a1', 'thn-a2', 'thn-a5', 'thn-a25', 'thn-a26', 'thn-a29', 'thn-a43', 'thn-a51'],
    },
    {
        key: 'needs-2026-appraisal',
        label: '2026 Appraisal Queue',
        icon: '\u{1F50D}',
        description: 'Assets due for independent appraisal or revaluation in 2026 for tax reporting and insurance purposes.',
        itemIds: ['thn-a27', 'thn-a28', 'thn-a2', 'thn-a7', 'thn-a26', 'thn-a47', 'thn-a48', 'thn-a49'],
        priorityStatus: { type: 'updated', detail: 'Updated 5 hours ago — 2 new assets added' },
    },
    {
        key: 'south-dakota-situs',
        label: 'South Dakota Situs',
        icon: '\u{1F4CD}',
        description: 'Assets held in South Dakota trust structures, benefiting from favorable tax treatment and asset protection laws.',
        itemIds: ['thn-a10', 'thn-a11', 'thn-a12', 'thn-a15', 'thn-a30', 'thn-a41', 'thn-a42'],
    },
]

/* ── Smart collection templates for demo (randomized AI creation) ── */

export const MOCK_ASSET_COLLECTION_TEMPLATES: Omit<AssetCollection, 'key'>[] = [
    {
        label: 'Thornton Foundation',
        icon: '\u{1F49C}',
        description: 'Endowment, art collection, and charitable assets held by the Thornton Family Foundation.',
        itemIds: ['thn-a34', 'thn-a35'],
    },
    {
        label: 'Montana Operations',
        icon: '\u{1F33E}',
        description: 'Ranch land, agricultural operations, crop insurance, and related assets in Paradise Valley.',
        itemIds: ['thn-a7', 'thn-a9', 'thn-a44'],
    },
    {
        label: 'High-Net-Worth Coverage',
        icon: '\u{1F6E1}\uFE0F',
        description: 'Assets with dedicated insurance coverage exceeding ten million dollars in aggregate value.',
        itemIds: ['thn-a1', 'thn-a2', 'thn-a25', 'thn-a26', 'thn-a27', 'thn-a28'],
    },
    {
        label: 'Crypto & Alternatives',
        icon: '\u{26A1}',
        description: 'Cryptocurrency holdings, private equity fund commitments, and non-traditional investment positions.',
        itemIds: ['thn-a30', 'thn-a15', 'thn-a41', 'thn-a42'],
    },
    {
        label: 'Sandra Review — Q2',
        icon: '\u{1F4DD}',
        description: 'Assets flagged for Sandra Whitfield to review in Q2, including account statements and policy renewals.',
        itemIds: ['thn-a10', 'thn-a11', 'thn-a12', 'thn-a13', 'thn-a24', 'thn-a45'],
    },
    {
        label: 'Transfer to Children',
        icon: '\u{1F91D}',
        description: 'Assets being considered for gradual transfer to children through trusts, gifts, or entity restructuring.',
        itemIds: ['thn-a5', 'thn-a8', 'thn-a43', 'thn-a50', 'thn-a52'],
    },
    {
        label: 'NYC & East Coast',
        icon: '\u{1F5FD}',
        description: 'Properties, accounts, and personal assets located in New York City and the eastern seaboard.',
        itemIds: ['thn-a1', 'thn-a2', 'thn-a8', 'thn-a10', 'thn-a33', 'thn-a29'],
    },
]
