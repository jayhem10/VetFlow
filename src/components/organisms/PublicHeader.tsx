'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import ThemeToggle from '@/components/atoms/ThemeToggle'
import Button from '@/components/atoms/Button'
import LogoIcon from '@/components/atoms/LogoIcon'

export default function PublicHeader() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600">
                <LogoIcon size={32} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Vet<span className="text-green-700 dark:text-green-400">Flow</span>
              </span>
            </Link>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="#features" 
              className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition-colors"
            >
              Fonctionnalités
            </Link>
            <Link 
              href="#pricing" 
              className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition-colors"
            >
              Tarifs
            </Link>
            <Link 
              href="#testimonials" 
              className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition-colors"
            >
              Témoignages
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {session ? (
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  🏠 Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Commencer
                  </Button>
                </Link>
              </div>
            )}

            {/* Menu mobile button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link 
                href="#features" 
                className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Fonctionnalités
              </Link>
              <Link 
                href="#pricing" 
                className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tarifs
              </Link>
              <Link 
                href="#testimonials" 
                className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Témoignages
              </Link>
              
              {session ? (
                <Link href="/dashboard">
                  <Button variant="primary" size="sm" className="w-full">
                    🏠 Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="w-full">
                      Commencer
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
