import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import { useProfileStore } from './useProfileStore'
import { getSession, signOut, signIn } from 'next-auth/react'

// Types pour les données de profil et de clinique
export interface ProfileData {
  first_name: string
  last_name: string
  phone?: string
  role?: string
  license_number?: string
  specialties?: string[]
}

export interface ClinicData {
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string  // Aligné avec le schéma Prisma
  country?: string
  subscription_plan?: 'starter' | 'professional' | 'clinic'
}

interface CompleteProfileStore {
  // État
  currentStep: number
  profileData: ProfileData | null
  clinicData: ClinicData | null
  loading: boolean
  error: string | null

  // Actions pour gérer les étapes
  setCurrentStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void

  // Actions pour sauvegarder les données localement
  setProfileData: (data: ProfileData) => void
  setClinicData: (data: ClinicData) => void

  // Action pour finaliser et envoyer tout
  completeRegistration: (updateSession?: () => Promise<any>) => Promise<boolean>

  // Utilitaires
  reset: () => void
  clearError: () => void
}

export const useCompleteProfileStore = create<CompleteProfileStore>((set, get) => ({
  // État initial
  currentStep: 0,
  profileData: null,
  clinicData: null,
  loading: false,
  error: null,

  // Gestion des étapes
  setCurrentStep: (step) => set({ currentStep: step }),
  
  nextStep: () => set((state) => ({ 
    currentStep: Math.min(state.currentStep + 1, 2) 
  })),
  
  previousStep: () => set((state) => ({ 
    currentStep: Math.max(state.currentStep - 1, 0) 
  })),

  // Sauvegarde locale des données
  setProfileData: (data) => set({ profileData: data }),
  
  setClinicData: (data) => set({ clinicData: data }),

  // Finalisation : envoie tout d'un coup
  completeRegistration: async (updateSession?: () => Promise<any>) => {
    const { profileData, clinicData } = get()
    
    if (!profileData) {
      set({ error: 'Données de profil manquantes' })
      return false
    }

    if (!clinicData) {
      set({ error: 'Données de clinique manquantes' })
      return false
    }

    set({ loading: true, error: null })
    
    // Bloquer les fetch de profil pendant la création
    useProfileStore.getState().setCreatingProfile(true)

    try {
      // 1. Créer le profil
      const profileResponse = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })

      if (!profileResponse.ok) {
        const profileError = await profileResponse.json()
        throw new Error(profileError.error || 'Erreur création profil')
      }

      const profileResult = await profileResponse.json()

      // 2. Créer la clinique
      const clinicResponse = await fetch('/api/clinic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clinicData),
      })

      if (!clinicResponse.ok) {
        const clinicError = await clinicResponse.json()
        throw new Error(clinicError.error || 'Erreur création clinique')
      }

      const clinicResult = await clinicResponse.json()

      // 3. Succès : mettre à jour la session pour refléter profileCompleted = true
      
      // Vider le store de profil pour éviter des conflits de cache + forcer refresh NextAuth
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vetflow-profile-store')
        
        // Forcer NextAuth à recréer la session en vidant le token JWT
        const nextAuthKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('next-auth') || key.includes('nextauth')
        )
        nextAuthKeys.forEach(key => {
          localStorage.removeItem(key)
          console.log('🧹 Vidage cache NextAuth:', key)
        })
      }
      
      // SOLUTION ROBUSTE : Forcer une nouvelle authentification
      console.log('🔄 Forcer une nouvelle authentification pour récupérer profileCompleted=true')
      
      // Obtenir l'email de l'utilisateur pour la reconnexion
      const currentUserEmail = await fetch('/api/debug/profile-status')
        .then(res => res.json())
        .then(data => data.email)
        .catch(() => null)
      
      if (currentUserEmail) {
        console.log('📧 Email récupéré pour reconnexion:', currentUserEmail)
        
        // Stocker temporairement l'email pour la reconnexion automatique
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auto-reconnect-email', currentUserEmail)
        }
      }
      
      toast.success('Profil et clinique créés avec succès !')
      
      // Forcer une déconnexion puis redirection vers login avec reconnexion auto
      setTimeout(async () => {
        try {
          console.log('🚪 Déconnexion forcée pour refresh session...')
          await signOut({ redirect: false })
          
          // Redirection vers login avec paramètre pour reconnexion automatique
          if (typeof window !== 'undefined') {
            window.location.replace('/login?auto-reconnect=true')
          }
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error)
          // Fallback : reload complet
          if (typeof window !== 'undefined') {
            window.location.replace('/dashboard')
          }
        }
      }, 1000)
      
      return true

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      set({ error: errorMessage })
      toast.error(errorMessage)
      return false
    } finally {
      set({ loading: false })
      // Débloquer les fetch de profil
      useProfileStore.getState().setCreatingProfile(false)
    }
  },

  // Utilitaires
  reset: () => set({
    currentStep: 0,
    profileData: null,
    clinicData: null,
    loading: false,
    error: null,
  }),

  clearError: () => set({ error: null }),
}))