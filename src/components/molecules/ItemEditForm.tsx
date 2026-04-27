import { ASSET_CATEGORIES } from '@/lib/constants'
import { catalogCategories, getCategoryByKey } from '@/data/categories'
import type { AnyCatalogItem, Person, Trust, BusinessEntity, Asset } from '@/data/types'

interface ItemEditFormProps {
    item: AnyCatalogItem
    editForm: Record<string, unknown>
    updateField: (key: string, value: string | number | undefined) => void
    mode: 'view' | 'edit'
}

export function ItemEditForm({ item, editForm, updateField, mode }: ItemEditFormProps) {
    const category = getCategoryByKey(item.categoryKey)
    const formatCurrency = (value: number): string =>
        '$' + value.toLocaleString('en-US')

    // Render helpers
    const renderField = (label: string, value: string | number | undefined | null) => {
        if (value === undefined || value === null || value === '') return null
        return (
            <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[var(--color-neutral-11)] font-[var(--font-weight-medium)]">{label}</span>
                <span className="text-sm text-[var(--color-gray-12)] font-[var(--font-weight-semibold)]">{value}</span>
            </div>
        )
    }

    const renderEditField = (label: string, key: string, type: 'text' | 'number' | 'date' | 'select' = 'text', options?: string[]) => {
        const value = (editForm[key] as string | number | undefined) ?? ''
        return (
            <div className="flex flex-col gap-0.5">
                <label className="text-xs text-[var(--color-neutral-11)] font-[var(--font-weight-medium)]">{label}</label>
                {type === 'select' && options ? (
                    <select
                        className="w-full px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-md)] font-sans text-sm text-[var(--color-gray-12)] bg-white outline-none transition-[border-color] duration-150 focus:border-[var(--color-accent-9)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)] appearance-none bg-no-repeat pr-8"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2380838D' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center' }}
                        value={value}
                        onChange={e => updateField(key, e.target.value)}
                    >
                        <option value="">Select...</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        className="w-full px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-md)] font-sans text-sm text-[var(--color-gray-12)] bg-white outline-none transition-[border-color] duration-150 focus:border-[var(--color-accent-9)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)]"
                        type={type}
                        value={value}
                        onChange={e => updateField(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                    />
                )}
            </div>
        )
    }

    const renderPersonDetails = (p: Person) => (
        <>
            {renderField('Relationship', p.relationship)}
            {renderField('Age', p.age)}
            {renderField('DOB', p.dob)}
            {renderField('Roles', p.roles?.join(', '))}
        </>
    )

    const renderPersonEdit = () => (
        <>
            {renderEditField('Name', 'name')}
            {renderEditField('Relationship', 'relationship')}
            {renderEditField('Age', 'age', 'number')}
            {renderEditField('DOB', 'dob', 'date')}
            {renderEditField('Description', 'description')}
        </>
    )

    const renderTrustDetails = (t: Trust) => (
        <>
            {renderField('Trust Type', t.trustType)}
            {renderField('Status', t.status)}
            {renderField('Established', t.dateEstablished)}
            {renderField('State', t.state)}
        </>
    )

    const renderTrustEdit = () => (
        <>
            {renderEditField('Name', 'name')}
            {renderEditField('Trust Type', 'trustType', 'select', [
                'Revocable Living Trust', 'Irrevocable Life Insurance Trust',
                'Spousal Lifetime Access Trust', 'Grantor Retained Annuity Trust',
                'Dynasty Trust', "Children's Trust", 'Marital Trust', 'Other',
            ])}
            {renderEditField('Status', 'status', 'select', ['Active', 'Created at death', 'Terminated', 'Pending'])}
            {renderEditField('Established', 'dateEstablished', 'date')}
            {renderEditField('State', 'state')}
            {renderEditField('Description', 'description')}
        </>
    )

    const renderEntityDetails = (e: BusinessEntity) => (
        <>
            {renderField('Entity Type', e.entityType)}
            {renderField('Purpose', e.purpose)}
            {renderField('Formed', e.dateFormed)}
            {renderField('State', e.stateOfFormation)}
        </>
    )

    const renderEntityEdit = () => (
        <>
            {renderEditField('Name', 'name')}
            {renderEditField('Entity Type', 'entityType', 'select', ['LLC', 'LP', 'Foundation', 'DAF', 'Corporation', 'FLP', 'Other'])}
            {renderEditField('Purpose', 'purpose')}
            {renderEditField('Formed', 'dateFormed', 'date')}
            {renderEditField('State', 'stateOfFormation')}
            {renderEditField('Description', 'description')}
        </>
    )

    const renderAssetDetails = (a: Asset) => (
        <>
            {renderField('Asset Type', a.assetType)}
            {renderField('Value', a.value ? formatCurrency(a.value) : null)}
            {renderField('Address', a.address)}
        </>
    )

    const renderAssetEdit = () => (
        <>
            {renderEditField('Name', 'name')}
            {renderEditField('Asset Type', 'assetType', 'select', [
                'Real Estate', 'Investment Account', 'Business Interest',
                'Insurance Policy', 'Vehicle', 'Art & Collectibles', 'Other',
            ])}
            {renderEditField('Value', 'value', 'number')}
            {renderEditField('Address', 'address')}
            {renderEditField('Description', 'description')}
        </>
    )

    if (mode === 'edit') {
        return (
            <>
                <div className="flex flex-col gap-0.5">
                    <label className="text-xs text-[var(--color-neutral-11)] font-[var(--font-weight-medium)]">Category</label>
                    <select
                        className="w-full px-3 py-2 border border-[var(--color-gray-4)] rounded-[var(--radius-md)] font-sans text-sm text-[var(--color-gray-12)] bg-white outline-none transition-[border-color] duration-150 focus:border-[var(--color-accent-9)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)] appearance-none bg-no-repeat pr-8"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2380838D' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center' }}
                        value={(editForm.categoryKey as string) ?? item.categoryKey}
                        onChange={e => updateField('categoryKey', e.target.value)}
                    >
                        {catalogCategories.map(c => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                    </select>
                </div>
                {item.categoryKey === 'person' && renderPersonEdit()}
                {item.categoryKey === 'trust' && renderTrustEdit()}
                {item.categoryKey === 'entity' && renderEntityEdit()}
                {ASSET_CATEGORIES.has(item.categoryKey) && renderAssetEdit()}
            </>
        )
    }

    return (
        <>
            {renderField('Category', category?.label)}
            {item.categoryKey === 'person' && renderPersonDetails(item as Person)}
            {item.categoryKey === 'trust' && renderTrustDetails(item as Trust)}
            {item.categoryKey === 'entity' && renderEntityDetails(item as BusinessEntity)}
            {ASSET_CATEGORIES.has(item.categoryKey) && renderAssetDetails(item as Asset)}
        </>
    )
}
