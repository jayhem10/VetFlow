
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value?: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  label,
  error,
  disabled = false,
  className
}: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm",
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
          "disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          className
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 