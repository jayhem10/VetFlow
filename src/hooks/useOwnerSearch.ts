'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useOwnerStore } from '@/stores/useOwnerStore'
import { useClinic } from '@/modules/clinic/hooks/use-clinic'
import type { Owner } from '@/types/owner.types'

export interface UseOwnerSearchOptions {
  minSearchLength?: number
  maxResults?: number
  debounceMs?: number
}

export function useOwnerSearch(options: UseOwnerSearchOptions = {}) {
  const {
    minSearchLength = 2,
    maxResults = 10,
    debounceMs = 300
  } = options

  const { clinic } = useClinic()
  const { owners, fetchOwners, loading } = useOwnerStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // Debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchQuery, debounceMs])

  // Charger les propriétaires si pas encore fait
  useEffect(() => {
    if (clinic?.id && owners.length === 0) {
      fetchOwners()
    }
  }, [clinic?.id, owners.length, fetchOwners])

  // Filtrer les propriétaires selon la recherche
  const filteredOwners = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minSearchLength) {
      return []
    }

    const query = debouncedQuery.toLowerCase()
    return owners
      .filter(owner => {
        const fullName = `${owner.first_name} ${owner.last_name}`.toLowerCase()
        const reverseName = `${owner.last_name} ${owner.first_name}`.toLowerCase()
        const email = owner.email?.toLowerCase() || ''
        
        return fullName.includes(query) || 
               reverseName.includes(query) || 
               email.includes(query) ||
               owner.first_name.toLowerCase().includes(query) ||
               owner.last_name.toLowerCase().includes(query)
      })
      .slice(0, maxResults)
  }, [owners, debouncedQuery, minSearchLength, maxResults])

  // Réinitialiser l'index surligné quand les résultats changent
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [filteredOwners])

  // Fonctions utilitaires
  const selectOwner = useCallback((owner: Owner) => {
    setSelectedOwner(owner)
    setSearchQuery(`${owner.first_name} ${owner.last_name}`)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedOwner(null)
    setSearchQuery('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }, [])

  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value)
    
    // Si on modifie la recherche et qu'il y avait une sélection, la réinitialiser
    if (selectedOwner && value !== `${selectedOwner.first_name} ${selectedOwner.last_name}`) {
      setSelectedOwner(null)
    }
    
    // Ouvrir la liste si il y a du texte
    if (value.length >= minSearchLength) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [selectedOwner, minSearchLength])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || filteredOwners.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOwners.length - 1 ? prev + 1 : 0
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOwners.length - 1
        )
        break
      
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOwners.length) {
          selectOwner(filteredOwners[highlightedIndex])
        }
        break
      
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }, [isOpen, filteredOwners, highlightedIndex, selectOwner])

  const handleFocus = useCallback(() => {
    if (searchQuery.length >= minSearchLength) {
      setIsOpen(true)
    }
  }, [searchQuery, minSearchLength])

  const handleBlur = useCallback(() => {
    // Délai pour permettre les clics sur les éléments de la liste
    setTimeout(() => {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }, 150)
  }, [])

  return {
    // État
    searchQuery,
    isOpen,
    selectedOwner,
    filteredOwners,
    highlightedIndex,
    loading,
    
    // Actions
    handleInputChange,
    handleKeyDown,
    handleFocus,
    handleBlur,
    selectOwner,
    clearSelection,
    setIsOpen
  }
}
