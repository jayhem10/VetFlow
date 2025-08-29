import Button from '@/components/atoms/Button'
import { StatusFilterType } from '@/hooks/useStatusFilter'

interface StatusFilterButtonsProps {
  currentFilter: StatusFilterType
  onFilterChange: (filter: StatusFilterType) => void
  counts: {
    all: number
    active: number
    inactive: number
    lowStock?: number
  }
  showLowStock?: boolean
  className?: string
}

export function StatusFilterButtons({
  currentFilter,
  onFilterChange,
  counts,
  showLowStock = false,
  className
}: StatusFilterButtonsProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant={currentFilter === 'active' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('active')}
      >
        ✅ Actifs ({counts.active})
      </Button>
      
      {showLowStock && counts.lowStock !== undefined && (
        <Button
          variant={currentFilter === 'low_stock' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('low_stock')}
          className={counts.lowStock > 0 ? 'border-orange-300 text-orange-700 dark:text-orange-300' : ''}
        >
          ⚠️ Stock faible ({counts.lowStock})
        </Button>
      )}
      
      <Button
        variant={currentFilter === 'inactive' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('inactive')}
      >
        ⏸️ Inactifs ({counts.inactive})
      </Button>
      
      <Button
        variant={currentFilter === 'all' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
      >
        📋 Tous les éléments ({counts.all})
      </Button>
    </div>
  )
}
