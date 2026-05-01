import { getCategoryByKey, getCategoryOrFallback } from '@/data/categories'
import type { AnyCatalogItem, Asset, BusinessEntity, Person, Trust } from '@/data/types'

/** Field labels marked required — matches asset detail asterisk UX */
export const DETAIL_REQUIRED_FIELD_LABELS = new Set(['Category'])

export function getItemFields(item: AnyCatalogItem): { label: string; value: string | number; required?: boolean }[] {
    const fields: { label: string; value: string | number; required?: boolean }[] = []
    const category = getCategoryByKey(item.categoryKey) ?? getCategoryOrFallback(item.categoryKey)

    fields.push({ label: 'Category', value: category.label, required: true })

    switch (item.categoryKey) {
        case 'person': {
            const p = item as Person
            if (p.relationship) fields.push({ label: 'Relationship', value: p.relationship })
            if (p.age) fields.push({ label: 'Age', value: p.age })
            if (p.dob) fields.push({ label: 'Date of Birth', value: p.dob })
            if (p.roles?.length) fields.push({ label: 'Roles', value: p.roles.join(', ') })
            break
        }
        case 'trust': {
            const t = item as Trust
            if (t.trustType) fields.push({ label: 'Trust Type', value: t.trustType })
            if (t.status) fields.push({ label: 'Status', value: t.status })
            if (t.dateEstablished) fields.push({ label: 'Established', value: t.dateEstablished })
            if (t.state) fields.push({ label: 'Governing State', value: t.state })
            break
        }
        case 'entity': {
            const e = item as BusinessEntity
            if (e.entityType) fields.push({ label: 'Entity Type', value: e.entityType })
            if (e.purpose) fields.push({ label: 'Purpose', value: e.purpose })
            if (e.dateFormed) fields.push({ label: 'Date Formed', value: e.dateFormed })
            if (e.stateOfFormation) fields.push({ label: 'State of Formation', value: e.stateOfFormation })
            break
        }
        default: {
            const a = item as Asset
            if (a.assetType) fields.push({ label: 'Asset Type', value: a.assetType })
            if (a.value) fields.push({ label: 'Value', value: `$${a.value.toLocaleString('en-US')}` })
            if (a.address) fields.push({ label: 'Address', value: a.address })
        }
    }

    if (item.customFields) {
        for (const [label, value] of Object.entries(item.customFields)) {
            fields.push({ label, value })
        }
    }

    return fields
}
