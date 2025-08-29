'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  showClearButton?: boolean
  onClear?: () => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder = "Rechercher...",
  label,
  error,
  disabled = false,
  loading = false,
  className,
  showClearButton = true,
  onClear,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Icône de recherche */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
            "placeholder-gray-500 dark:placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
            "disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed",
            isFocused 
              ? "border-green-500 ring-1 ring-green-500" 
              : "border-gray-300 dark:border-gray-600",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />

        {/* Loading spinner ou bouton clear */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {loading ? (
            <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full" />
          ) : (
            showClearButton && value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

export default SearchInput
