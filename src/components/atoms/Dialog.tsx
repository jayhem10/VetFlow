'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
}

export function Dialog({ 
  isOpen, 
  onClose, 
  children, 
  className,
  title,
  size = 'md',
  showCloseButton = true
}: DialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }

  if (!mounted) return null

  return (
    <>
      {/* Backdrop flouté et non-interactif */}
      <div
        className={cn(
          'fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden="true"
      />

      {/* Container principal avec centrage et marges */}
      <div
        className={cn(
          'fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-200 ease-out',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
      >
        {/* Modal avec hauteur maximale et centrage */}
        <div
          className={cn(
            'relative w-full transform rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all duration-200 ease-out',
            'border border-gray-200 dark:border-gray-700',
            'mx-4 sm:mx-0',
            'max-h-[calc(100vh-2rem)] flex flex-col', // Hauteur avec marges
            'my-4', // Marges verticales
            isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec titre - fixe en haut */}
          {title && (
            <div className="flex items-center justify-between p-6 pb-0 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
              <h2 
                id="dialog-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Fermer"
                >
                  <span className="text-xl">×</span>
                </button>
              )}
            </div>
          )}

          {/* Contenu avec scroll - prend l'espace restant */}
          <div className={cn(
            "flex-1 overflow-y-auto",
            title ? "p-6" : "p-6"
          )}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default Dialog
