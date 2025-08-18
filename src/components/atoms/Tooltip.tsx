'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ children, content, position = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  // Fonction pour détecter si le tooltip dépasserait à droite
  const getAdjustedPosition = (defaultPosition: 'top' | 'bottom' | 'left' | 'right'): 'top' | 'bottom' | 'left' | 'right' => {
    if (typeof window === 'undefined') return defaultPosition;
    
    // Pour les tooltips avec du texte long, on préfère les positionner au-dessus
    if (content.length > 15) {
      return 'top';
    }
    
    return defaultPosition;
  };

  const adjustedPosition = getAdjustedPosition(position);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-[9999] px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap',
            positionClasses[adjustedPosition],
            className
          )}
          style={{
            pointerEvents: 'none'
          }}
        >
          {content}
          {/* Flèche */}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              adjustedPosition === 'top' && 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700',
              adjustedPosition === 'bottom' && 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700',
              adjustedPosition === 'left' && 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700',
              adjustedPosition === 'right' && 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700',
            )}
          />
        </div>
      )}
    </div>
  );
}
