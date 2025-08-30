'use client'

import { ReactNode } from 'react'
import ThemeToggle from '@/components/atoms/ThemeToggle'
import LogoIcon from '@/components/atoms/LogoIcon'

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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600">
                <LogoIcon size={28} />
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
              <a href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400">Contact</a>
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