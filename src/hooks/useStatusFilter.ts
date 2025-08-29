import { useState, useMemo } from 'react'

export type StatusFilterType = 'all' | 'active' | 'inactive' | 'low_stock'

interface UseStatusFilterOptions<T> {
  items: T[]
  getActiveStatus: (item: T) => boolean
  getLowStockStatus?: (item: T) => boolean
  initialFilter?: StatusFilterType
}

interface UseStatusFilterReturn<T> {
  filteredItems: T[]
  statusFilter: StatusFilterType
  setStatusFilter: (filter: StatusFilterType) => void
  counts: {
    all: number
    active: number
    inactive: number
    lowStock: number
  }
}

export function useStatusFilter<T>({
  items,
  getActiveStatus,
  getLowStockStatus,
  initialFilter = 'active'
}: UseStatusFilterOptions<T>): UseStatusFilterReturn<T> {
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>(initialFilter)

  const counts = useMemo(() => {
    const active = items.filter(getActiveStatus).length
    const inactive = items.filter(item => !getActiveStatus(item)).length
    const lowStock = getLowStockStatus 
      ? items.filter(item => getActiveStatus(item) && getLowStockStatus(item)).length
      : 0

    return {
      all: items.length,
      active,
      inactive,
      lowStock
    }
  }, [items, getActiveStatus, getLowStockStatus])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const isActive = getActiveStatus(item)
      
      switch (statusFilter) {
        case 'active':
          return isActive
        case 'inactive':
          return !isActive
        case 'low_stock':
          return isActive && getLowStockStatus?.(item)
        case 'all':
        default:
          return true
      }
    })
  }, [items, statusFilter, getActiveStatus, getLowStockStatus])

  return {
    filteredItems,
    statusFilter,
    setStatusFilter,
    counts
  }
}
