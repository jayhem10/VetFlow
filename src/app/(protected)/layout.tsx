'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import LogoIcon from '@/components/atoms/LogoIcon'
import AuthenticatedHeader from '@/components/organisms/Header'
import { TrialNotification } from '@/components/molecules/TrialNotification'
import { useTrialStatus } from '@/hooks/useTrialStatus'
import { useProfileStore } from '@/stores/useProfileStore'

function ProtectedFooter() {
  return (
    <footer className="bg-stone-100 dark:bg-gray-900 border-t border-stone-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-emerald-600">
                <LogoIcon size={40} />
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
              <li><a href="/services" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">Prestations</a></li>
              <li><a href="/inventory" className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-sm">Stock</a></li>
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [redirecting, setRedirecting] = useState(false)
  
  const loading = status === 'loading'
  const { profile, loading: profileLoading, fetchProfile } = useProfileStore()
  
  // Déclencher fetch SEULEMENT si profileCompleted = true
  useEffect(() => {
    if (session?.user?.id && !profile && !profileLoading) {
      const profileCompleted = (session.user as any)?.profileCompleted
      if (profileCompleted) {
        // console.log('🎯 ProtectedLayout: profileCompleted=true, chargement des données pour', session.user.id)
        fetchProfile(session.user.id).catch(console.error)
      }
    }
  }, [session?.user?.id, profile, profileLoading, fetchProfile])
  
  // Appeler useTrialStatus seulement si on a une session avec clinique
  const hasValidSession = session?.user?.profile?.clinicId
  const { trialStatus, shouldShowNotification, isExpired, daysLeft } = useTrialStatus()

  useEffect(() => {
    if (loading || profileLoading) return

    // console.log('🔍 ProtectedLayout - session:', !!session, 'pathname:', pathname, 'loading:', loading)

    if (!session) {
      console.log('👤 Pas de session, redirection vers login')
      if (pathname !== '/login' && pathname !== '/register') {
        router.push('/login')
      }
      return
    }

    // Si on est déjà sur la page complete-profile, ne pas rediriger
    if (pathname === '/complete-profile') {
      return
    }

    // Process souhaité : utiliser UNIQUEMENT profileCompleted de la session (valeur de base)
    const profileCompleted = (session.user as any)?.profileCompleted || false
    const mustChangePassword = session.user?.mustChangePassword || false
    
    // console.log('🔍 ProtectedLayout - session.user:', session?.user)
    // console.log('🔍 ProtectedLayout - profileCompleted:', profileCompleted, 'mustChangePassword:', mustChangePassword)
    // console.log('🔍 ProtectedLayout - session raw profileCompleted:', (session?.user as any)?.profileCompleted)
    
    // Si l'utilisateur doit changer son mot de passe, on ne force plus la redirection
    // Il peut naviguer librement et verra la bannière d'avertissement
    if (mustChangePassword) {
      console.log('🔐 Mot de passe temporaire détecté, bannière affichée')
    }

    // Process souhaité : si profileCompleted = false → redirection directe vers complete-profile
    if (!profileCompleted && !mustChangePassword && !redirecting) {
      console.log('📋 profileCompleted=false, redirection directe vers complete-profile')
      setRedirecting(true)
      setTimeout(() => {
        router.push('/complete-profile')
      }, 100)
    }
    
    // Process souhaité : si profileCompleted = true et pas de données → attendre le chargement
    if (profileCompleted && !profile && profileLoading) {
      console.log('⏳ profileCompleted=true, attente chargement des données...')
    }
  }, [loading, profileLoading, profile, session, router, pathname, redirecting])

  // Rediriger vers paiement si la période d'essai a expiré (doit être avant tout return)
  useEffect(() => {
    if (hasValidSession && isExpired && pathname !== '/payment') {
      router.push('/payment')
    }
  }, [hasValidSession, isExpired, pathname, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirection vers la page de connexion...</p>
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



  // Si le profil/clinique ne sont pas prêts, forcer la redirection immédiate et ne rien afficher
  const mustChangePassword = session.user?.mustChangePassword || false
  const combinedHasProfile = !!profile || session.user?.hasProfile || false
  const combinedHasClinic = (!!profile && !!(profile as any).clinic_id) || session.user?.hasClinic || false
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    )
  }

  const handlePaymentClick = () => {
    router.push('/payment')
  }


  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedHeader />
      
      {/* Notification période d'essai */}
      {hasValidSession && shouldShowNotification && !isExpired && (
        <div className="bg-white/90 dark:bg-gray-900/80 border-b border-stone-200 dark:border-gray-700 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <TrialNotification
              daysLeft={daysLeft}
              onPaymentClick={handlePaymentClick}
            />
          </div>
        </div>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      <ProtectedFooter />
    </div>
  )
} 