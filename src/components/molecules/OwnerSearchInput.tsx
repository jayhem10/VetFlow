'use client'

import { useRef } from 'react'
import SearchInput from '@/components/atoms/SearchInput'
import { useOwnerSearch, UseOwnerSearchOptions } from '@/hooks/useOwnerSearch'
import { cn } from '@/lib/utils'
import type { Owner } from '@/types/owner.types'

interface OwnerSearchInputProps extends UseOwnerSearchOptions {
  onOwnerSelect: (owner: Owner | null) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
  required?: boolean
  value?: Owner | null // Pour controlled component
}

export function OwnerSearchInput({
  onOwnerSelect,
  label = "Propriétaire",
  placeholder = "Rechercher un propriétaire...",
  error,
  disabled = false,
  className,
  required = false,
  value,
  ...searchOptions
}: OwnerSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    searchQuery,
    isOpen,
    selectedOwner,
    filteredOwners,
    highlightedIndex,
    loading,
    handleInputChange,
    handleKeyDown,
    handleFocus,
    handleBlur,
    selectOwner,
    clearSelection
  } = useOwnerSearch(searchOptions)

  // Synchroniser avec la prop value (controlled component)
  const currentOwner = value || selectedOwner

  const handleOwnerSelection = (owner: Owner) => {
    selectOwner(owner)
    onOwnerSelect(owner)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    clearSelection()
    onOwnerSelect(null)
  }

  const formatOwnerDisplay = (owner: Owner) => {
    return `${owner.first_name} ${owner.last_name}`
  }

  const formatOwnerDetails = (owner: Owner) => {
    const details = []
    if (owner.email) details.push(owner.email)
    if (owner.phone) details.push(owner.phone)
    return details.join(' • ')
  }

  return (
    <div className={cn("relative", className)}>
      <SearchInput
        ref={inputRef}
        label={required ? `${label} *` : label}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClear={handleClear}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        loading={loading}
        showClearButton={!!currentOwner}
      />

      {/* Liste des résultats */}
      {isOpen && filteredOwners.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOwners.map((owner, index) => (
            <button
              key={owner.id}
              type="button"
              onClick={() => handleOwnerSelection(owner)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                "border-b border-gray-100 dark:border-gray-700 last:border-b-0",
                "focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700",
                highlightedIndex === index && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {/* Nom du propriétaire */}
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatOwnerDisplay(owner)}
                  </div>
                  
                  {/* Détails (email, téléphone) */}
                  {formatOwnerDetails(owner) && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatOwnerDetails(owner)}
                    </div>
                  )}
                </div>

                {/* Indicateur de sélection */}
                {currentOwner?.id === owner.id && (
                  <div className="ml-2 text-green-600 dark:text-green-400">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {isOpen && searchQuery.length >= 2 && filteredOwners.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          <div className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">
            <div className="text-sm">
              Aucun propriétaire trouvé pour "{searchQuery}"
            </div>
            <div className="text-xs mt-1">
              Essayez de chercher par nom, prénom ou email
            </div>
          </div>
        </div>
      )}

      {/* Propriétaire sélectionné */}
      {currentOwner && !isOpen && (
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-green-800 dark:text-green-200">
                {formatOwnerDisplay(currentOwner)}
              </div>
              {formatOwnerDetails(currentOwner) && (
                <div className="text-sm text-green-600 dark:text-green-300 mt-1">
                  {formatOwnerDetails(currentOwner)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
              title="Supprimer la sélection"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerSearchInput
