import { useSession } from 'next-auth/react'
import { isTemporaryPassword } from '@/lib/password'

export function useTemporaryPassword() {
  const { data: session, status } = useSession()

  // Pour l'instant, on ne peut pas détecter directement si le mot de passe est temporaire
  // car on n'a pas accès au mot de passe hashé côté client
  // On peut utiliser d'autres indicateurs comme :
  // - L'utilisateur vient d'être créé (date de création récente)
  // - Un flag dans la session ou le profil
  // - La première connexion

  const hasTemporaryPassword = false // À implémenter selon vos besoins

  return {
    hasTemporaryPassword,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user
  }
}
