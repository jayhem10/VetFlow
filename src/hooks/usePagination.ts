import { useState, useMemo } from 'react'

interface UsePaginationOptions {
  itemsPerPage?: number
  initialPage?: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  setCurrentPage: (page: number) => void
  paginatedItems: T[]
  totalPages: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  itemsPerPage: number
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
}

export function usePagination<T>(
  items: T[],
  { itemsPerPage = 25, initialPage = 1 }: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex)
  }, [items, startIndex, endIndex])

  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages)
  }

  return {
    currentPage,
    setCurrentPage,
    paginatedItems,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    itemsPerPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage
  }
}
