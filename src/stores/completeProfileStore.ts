import { create } from 'zustand'
import { toast } from 'react-hot-toast'

// Types pour les données de profil et de clinique
export interface ProfileData {
  first_name: string
  last_name: string
  phone?: string
  role?: 'owner' | 'vet' | 'assistant' | 'admin'
  license_number?: string
  specialties?: string[]
}

export interface ClinicData {
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
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
  completeRegistration: () => Promise<boolean>

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
  completeRegistration: async () => {
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

      // 3. Forcer le rechargement des données de profil
      try {
        // Appeler l'API pour recharger le profil
        await fetch('/api/profile/get', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        console.warn('Erreur lors du rechargement du profil:', error)
      }

      // 4. Succès : passer à l'étape finale
      toast.success('Profil et clinique créés avec succès !')
      set({ currentStep: 2 })
      
      return true

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      set({ error: errorMessage })
      toast.error(errorMessage)
      return false
    } finally {
      set({ loading: false })
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