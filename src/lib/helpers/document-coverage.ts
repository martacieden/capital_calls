import { thorntonDocuments, mockCollectionDocuments } from '@/data/thornton/documents-data'

const allDocuments = [...thorntonDocuments, ...mockCollectionDocuments]

/** Set of item IDs that appear in at least one DocumentRecord.attachedItemIds */
export const documentedItemIds: Set<string> = new Set(
    allDocuments.flatMap(d => d.attachedItemIds)
)
