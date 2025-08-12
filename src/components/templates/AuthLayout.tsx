'use client'

import { ReactNode } from 'react'
import ThemeToggle from '@/components/atoms/ThemeToggle'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-gray-900 flex flex-col">
      {/* Header simplifié */}
      <header className="bg-white/90 dark:bg-gray-900 shadow-sm border-b border-stone-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* Logo VetFlow */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                  >
                    <path d="M11 2v20h2V2h-2zm-9 9v2h20v-2H2z" opacity="0.8"/>
                    <circle cx="6" cy="6" r="1.5" opacity="0.9"/>
                    <circle cx="8" cy="4" r="1" opacity="0.7"/>
                    <circle cx="4" cy="4" r="1" opacity="0.7"/>
                    <ellipse cx="6" cy="8.5" rx="1" ry="1.5" opacity="0.6"/>
                    <path d="M18 7c0-1.1-.9-2-2-2s-2 .9-2 2v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V7z" opacity="0.8"/>
                    <path d="M18 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" opacity="0.9"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              
              <div className="flex flex-col">
                <a href="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-green-700 dark:hover:text-green-400 transition-colors">
                  Vet<span className="text-green-700 dark:text-green-400">Flow</span>
                </a>
                <span className="text-xs text-gray-700 dark:text-gray-400 -mt-1">Gestion Vétérinaire</span>
              </div>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center py-6 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          {children}
        </div>
      </main>

      {/* Footer simplifié */}
      <footer className="bg-white dark:bg-gray-900 border-t border-stone-200 dark:border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 VetFlow. Tous droits réservés.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400">
                Aide
              </a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400">
                Contact
              </a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400">
                Confidentialité
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 