'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Button from '@/components/atoms/Button'

export function TemporaryPasswordBanner() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Vérifier si l'utilisateur doit changer son mot de passe
  const mustChangePassword = session?.user?.mustChangePassword || false

  // Ne pas afficher sur la home page ou la page de changement de mot de passe
  if (!mustChangePassword || pathname === '/' || pathname === '/change-password') {
    return null
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-amber-700 dark:text-amber-400 text-lg">🔐</span>
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Mot de passe temporaire détecté
              </p>
              <p className="text-amber-800 dark:text-amber-200">
                Pour des raisons de sécurité, vous devez changer votre mot de passe.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Utiliser window.location pour éviter les problèmes de navigation
              window.location.href = '/change-password'
            }}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/30"
          >
            Changer maintenant
          </Button>
        </div>
      </div>
    </div>
  )
}
