import { signIn, signOut } from 'next-auth/react'
import type { TSignUpData, TAuthResult, TUser } from '@/types/auth.types'

class AuthService {
  // Inscription simple avec juste email/password (pour SimpleSignUpForm) - VERSION CLIENT
  async signUpSimple(email: string, password: string): Promise<TAuthResult> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erreur lors de la création du compte',
        }
      }

      return data
    } catch (error) {
      console.error('Erreur inscription simple:', error)
      return {
        success: false,
        error: 'Erreur lors de la création du compte',
      }
    }
  }

  // Inscription complète avec toutes les informations (pour AuthForm principal) - VERSION CLIENT
  async signUp(data: TSignUpData): Promise<TAuthResult> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Erreur lors de la création du compte',
        }
      }

      // Si la création du compte réussit, connecter automatiquement l'utilisateur
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        return {
          success: false,
          error: 'Compte créé mais erreur lors de la connexion automatique',
        }
      }

      return result
    } catch (error) {
      console.error('Erreur inscription:', error)
      return {
        success: false,
        error: 'Erreur lors de la création du compte',
      }
    }
  }

  async signIn(email: string, password: string): Promise<TAuthResult> {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect',
        }
      }

      return {
        success: true,
        redirectTo: '/dashboard',
      }
    } catch (error) {
      console.error('Erreur connexion:', error)
      return {
        success: false,
        error: 'Erreur lors de la connexion',
      }
    }
  }

  async signOut(): Promise<TAuthResult> {
    try {
      await signOut({ redirect: false })
      return {
        success: true,
        redirectTo: '/login',
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      return {
        success: false,
        error: 'Erreur lors de la déconnexion',
      }
    }
  }

  async getCurrentUser(): Promise<TUser | null> {
    try {
      // Cette méthode sera utilisée côté serveur
      // Pour côté client, utiliser directement useSession de next-auth
      return null
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error)
      return null
    }
  }

  async completeRegistration(profileData: any): Promise<TAuthResult> {
    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Erreur lors de la complétion du profil',
        }
      }

      return result
    } catch (error) {
      console.error('Erreur complétion profil:', error)
      return {
        success: false,
        error: 'Erreur lors de la complétion du profil',
      }
    }
  }
}

export const authService = new AuthService() 