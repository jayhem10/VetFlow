import { useState, useMemo } from 'react'

interface UseSearchOptions<T> {
  items: T[]
  searchFields: (keyof T)[]
  debounceMs?: number
}

interface UseSearchReturn<T> {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredItems: T[]
  isSearching: boolean
}

export function useSearch<T>({
  items,
  searchFields,
  debounceMs = 300
}: UseSearchOptions<T>): UseSearchReturn<T> {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return items
    }

    const searchLower = debouncedSearchTerm.toLowerCase()
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        if (value == null) return false
        
        const stringValue = String(value).toLowerCase()
        return stringValue.includes(searchLower)
      })
    })
  }, [items, searchFields, debouncedSearchTerm])

  const isSearching = searchTerm !== debouncedSearchTerm

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    isSearching
  }
}
