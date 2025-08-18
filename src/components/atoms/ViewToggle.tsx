'use client';

import { cn } from '@/lib/utils';

interface ViewToggleOption {
  value: string;
  label: string;
  icon?: string;
}

interface ViewToggleProps {
  view: string;
  onViewChange: (view: string) => void;
  options?: ViewToggleOption[];
  className?: string;
}

export function ViewToggle({ view, onViewChange, options, className }: ViewToggleProps) {
  // Options par défaut pour la compatibilité
  const defaultOptions: ViewToggleOption[] = [
    { value: 'grid', label: 'Grille', icon: '⊞' },
    { value: 'list', label: 'Liste', icon: '☰' }
  ];

  const toggleOptions = options || defaultOptions;

  return (
    <div className={cn('flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1', className)}>
      {toggleOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onViewChange(option.value)}
          className={cn(
            'flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors',
            view === option.value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
          aria-label={`Vue ${option.label}`}
        >
          {option.icon && <span className="text-base">{option.icon}</span>}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
