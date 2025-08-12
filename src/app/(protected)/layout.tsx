'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import Header from '@/components/organisms/Header'

// Utiliser le header unifié pour toutes les pages connectées

function ProtectedFooter() {
  return (
    <footer className="bg-stone-100 dark:bg-gray-900 border-t border-stone-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-700 to-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Vet<span className="text-green-700 dark:text-green-400">Flow</span>
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
              <li><a href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">Tableau de bord</a></li>
              <li><a href="/animals" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">Animaux</a></li>
              <li><a href="/owners" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">Propriétaires</a></li>
              <li><a href="/collaborators" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">Équipe</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              <li><a href="/help" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">Centre d'aide</a></li>
              <li><a href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">Nous contacter</a></li>
              <li><a href="/settings" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">Paramètres</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-stone-300 dark:border-gray-700 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              © 2025 VetFlow. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">
                Confidentialité
              </a>
              <a href="/terms" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">
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
  const { user, hasProfile, hasClinic, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [redirecting, setRedirecting] = useState(false)

  const loading = authLoading

  useEffect(() => {
    if (loading) return // Attendre que l'authentification, le profil et la clinique soient chargés

    console.log('🔍 ProtectedLayout - user:', !!user, 'hasProfile:', hasProfile, 'hasClinic:', hasClinic, 'pathname:', pathname, 'loading:', loading)

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

    // Si l'utilisateur n'a pas de profil OU de clinique et que le chargement est terminé, rediriger vers complete-profile
    if ((!hasProfile || !hasClinic) && !redirecting && !loading) {
      console.log('📋 Profil ou clinique manquant, redirection vers complete-profile')
      setRedirecting(true)
      // Petit délai pour éviter les redirections trop rapides
      setTimeout(() => {
        router.push('/complete-profile')
      }, 100)
    }
  }, [loading, user, hasProfile, hasClinic, router, pathname, redirecting])

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

  // Si l'utilisateur n'a pas de profil ou de clinique et n'est pas sur complete-profile, rediriger
  if (!hasProfile || !hasClinic) {
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
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <ProtectedFooter />
    </div>
  )
} 