'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  actions?: ReactNode
}

export function DashboardLayout({ children, title = 'Dashboard', actions }: DashboardLayoutProps) {
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {actions && (
                <div className="flex items-center space-x-2">
                  {actions}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
} 