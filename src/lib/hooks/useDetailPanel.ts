import { useState, useMemo, useCallback } from 'react'
import type { AnyCatalogItem } from '@/data/types'

export function useDetailPanel(getItemById: (id: string) => AnyCatalogItem | null) {
  const [detailPath, setDetailPath] = useState<string[]>([])
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const selectedItem = useMemo(() => {
    const id = detailPath[detailPath.length - 1]
    if (!id) return null
    return getItemById(id) ?? null
  }, [detailPath, getItemById])

  const handleItemClick = useCallback((item: AnyCatalogItem) => {
    setDetailPath([item.id])
    setIsDetailOpen(true)
  }, [])

  const handleNavigate = useCallback((id: string) => {
    setDetailPath(prev => [...prev, id])
  }, [])

  const handleBreadcrumbClick = useCallback((index: number) => {
    if (index === 0) {
      handleCloseDetail()
    } else {
      setDetailPath(prev => prev.slice(0, index))
    }
  }, [])

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false)
    setDetailPath([])
  }, [])

  return {
    detailPath,
    setDetailPath,
    isDetailOpen,
    setIsDetailOpen,
    selectedItem,
    handleItemClick,
    handleNavigate,
    handleBreadcrumbClick,
    handleCloseDetail,
  }
}
