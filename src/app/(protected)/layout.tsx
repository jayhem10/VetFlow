'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/atoms/Button'
import ThemeToggle from '@/components/atoms/ThemeToggle'

function ProtectedHeader() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  }

  return (
    <header className="bg-white/90 dark:bg-gray-900 shadow-sm border-b border-stone-200 dark:border-gray-700 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
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
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Vet<span className="text-blue-700 dark:text-blue-400">Flow</span>
              </span>
              <span className="text-xs text-gray-700 dark:text-gray-400 -mt-1">Gestion Vétérinaire</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="/dashboard" className="text-gray-800 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium">
              Tableau de bord
            </a>
            <a href="/patients" className="text-gray-800 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium">
              Patients
            </a>
            <a href="/appointments" className="text-gray-800 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium">
              Rendez-vous
            </a>
            <a href="/invoices" className="text-gray-800 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium">
              Facturation
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {profile && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">
                    {profile.first_name?.[0] || profile.email[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {profile.first_name || profile.email}
                </span>
              </div>
            )}
            
            <Button variant="ghost" onClick={handleSignOut}>
              Se déconnecter
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
}

function ProtectedFooter() {
  return (
    <footer className="bg-stone-100 dark:bg-gray-900 border-t border-stone-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Vet<span className="text-blue-700 dark:text-blue-400">Flow</span>
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 text-sm max-w-md">
              Votre solution complète pour la gestion vétérinaire moderne.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li><a href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-sm">Tableau de bord</a></li>
              <li><a href="/patients" className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-sm">Patients</a></li>
              <li><a href="/appointments" className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-sm">Rendez-vous</a></li>
              <li><a href="/invoices" className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-sm">Facturation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              <li><a href="/help" className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-sm">Centre d'aide</a></li>
              <li><a href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-sm">Nous contacter</a></li>
              <li><a href="/settings" className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-sm">Paramètres</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-stone-300 dark:border-gray-700 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              © 2025 VetFlow. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-sm">
                Confidentialité
              </a>
              <a href="/terms" className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-sm">
                Conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, hasProfile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (loading) return // Attendre que l'authentification soit chargée

    console.log('🔍 ProtectedLayout - user:', !!user, 'hasProfile:', hasProfile, 'pathname:', pathname)

    if (!user) {
      console.log('👤 Pas d\'utilisateur, redirection vers login')
      // SEULEMENT rediriger si on n'est pas déjà sur login ou register
      if (pathname !== '/login' && pathname !== '/register') {
        router.push('/login')
      }
      return
    }

    // Si on est déjà sur la page complete-profile, ne pas rediriger
    if (pathname === '/complete-profile') {
      return
    }

    // Si l'utilisateur n'a pas de profil, rediriger vers complete-profile
    if (!hasProfile && !redirecting) {
      console.log('📋 Pas de profil, redirection vers complete-profile')
      setRedirecting(true)
      router.push('/complete-profile')
    }
  }, [loading, user, hasProfile, router, pathname, redirecting])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirection vers la page de connexion...</p>
        </div>
      </div>
    )
  }

  // Si on est sur complete-profile, afficher sans header/footer pour se concentrer sur la création du profil
  if (pathname === '/complete-profile') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    )
  }

  // Si l'utilisateur n'a pas de profil et n'est pas sur complete-profile, rediriger
  if (!hasProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirection vers la création du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ProtectedHeader />
      <main className="flex-1">
        {children}
      </main>
      <ProtectedFooter />
    </div>
  )
} 