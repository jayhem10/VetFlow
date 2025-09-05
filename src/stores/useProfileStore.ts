import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TProfile } from '@/types/database.types'

interface ProfileStore {
  // État
  profile: TProfile | null
  loading: boolean
  error: string | null
  lastFetched: number | null
  cachedUserId: string | null // Pour invalider le cache si l'utilisateur change
  isCreatingProfile: boolean // Flag pour bloquer les fetch pendant la création

  // Actions
  setProfile: (profile: TProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCreatingProfile: (creating: boolean) => void
  
  // Actions API
  fetchProfile: (userId?: string, force?: boolean) => Promise<TProfile | null>
  createProfile: (data: any) => Promise<TProfile>
  updateProfile: (id: string, updates: any) => Promise<TProfile>
  
  // Utilitaires
  hasProfile: boolean
  clearProfile: () => void
  isStale: () => boolean // Vérifie si les données sont périmées (plus de 15 minutes)
  isCacheValid: (userId: string) => boolean // Vérifie si le cache est valide pour cet utilisateur
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      // État initial
      profile: null,
      loading: false,
      error: null,
      lastFetched: null,
      cachedUserId: null,
      isCreatingProfile: false,

      // Getters
      get hasProfile() {
        return !!get().profile
      },

      // Actions de base
      setProfile: (profile) => set({ 
        profile, 
        lastFetched: Date.now(),
        error: null 
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),

      setCreatingProfile: (creating) => set({ isCreatingProfile: creating }),

      // Actions API
      fetchProfile: async (userId?: string, force = false) => {
        const state = get()
        
        // Si pas d'utilisateur fourni, pas de fetch
        if (!userId) {
          console.log('❌ fetchProfile: Pas d\'ID utilisateur fourni')
          return state.profile
        }

        // Si on est en train de créer un profil, bloquer les fetch
        if (state.isCreatingProfile && !force) {
          console.log('🚧 fetchProfile: Création de profil en cours, ignore pour', userId)
          return state.profile
        }
        
        // Empêcher les appels concurrents inutiles
        if (state.loading && state.cachedUserId === userId && !force) {
          console.log('⏳ fetchProfile: Requête déjà en cours pour', userId)
          return state.profile
        }
        
        // Vérifier si le cache est valide pour cet utilisateur
        if (!force && state.isCacheValid(userId)) {
          console.log('✅ fetchProfile: Utilisation du cache pour', userId)
          return state.profile
        }

        // Si c'est un nouvel utilisateur, vider le cache
        if (state.cachedUserId && state.cachedUserId !== userId) {
          console.log('🔄 fetchProfile: Nouvel utilisateur, vidage du cache')
          set({ 
            profile: null, 
            lastFetched: null, 
            cachedUserId: userId, 
            error: null 
          })
        }

        // Si on a déjà essayé récemment pour ce user, pas de nouvel appel
        const recentAttempt = state.lastFetched && (Date.now() - state.lastFetched < 10000) // 10 secondes
        if (!force && state.cachedUserId === userId && recentAttempt) {
          console.log('🚫 fetchProfile: Tentative trop récente, ignore pour', userId)
          return state.profile
        }

        // console.log('🔍 fetchProfile: Chargement depuis l\'API pour', userId)
        set({ loading: true, error: null, cachedUserId: userId })

        try {
          const response = await fetch('/api/profile/get')
          
          if (!response.ok) {
            if (response.status === 404) {
              set({ 
                profile: null, 
                lastFetched: Date.now(), 
                cachedUserId: userId 
              })
              return null
            }
            if (response.status === 401) {
              // Non authentifié: ne pas boucler; marquer l'état comme non chargé
              set({ loading: false })
              return null
            }
            throw new Error('Erreur lors de la récupération du profil')
          }

          const result = await response.json()
          set({ 
            profile: result.profile, 
            lastFetched: Date.now(),
            cachedUserId: userId,
            error: null 
          })
          
          return result.profile
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
          set({ error: errorMessage })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      createProfile: async (data) => {
        set({ loading: true, error: null })

        try {
          const response = await fetch('/api/profile/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const result = await response.json()
            throw new Error(result.error || 'Erreur lors de la création du profil')
          }

          const result = await response.json()
          set({ 
            profile: result.profile, 
            lastFetched: Date.now(),
            error: null 
          })
          
          return result.profile
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
          set({ error: errorMessage })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      updateProfile: async (id, updates) => {
        set({ loading: true, error: null })
        
        try {
          const response = await fetch(`/api/profile/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          })

          if (!response.ok) {
            const result = await response.json()
            throw new Error(result.error || 'Erreur lors de la mise à jour')
          }

          const result = await response.json()
          set({ 
            profile: result.profile, 
            lastFetched: Date.now(),
            error: null 
          })
          
          return result.profile
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
          set({ error: errorMessage })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      // Utilitaires
      clearProfile: () => set({ 
        profile: null, 
        lastFetched: null, 
        cachedUserId: null,
        error: null 
      }),

      isStale: () => {
        const { lastFetched } = get()
        if (!lastFetched) return true
        // Considérer comme périmé après 15 minutes (au lieu de 5)
        return Date.now() - lastFetched > 15 * 60 * 1000
      },

      isCacheValid: (userId: string) => {
        const state = get()
        // Considérer le cache valide si:
        // 1. C'est le même utilisateur
        // 2. On a tenté récemment (même si profile est null)
        // 3. Ou si on a un profil et qu'il n'est pas périmé
        const recentAttempt = state.lastFetched && (Date.now() - state.lastFetched < 30 * 1000) // 30 secondes
        const hasValidProfile = state.profile && !state.isStale()
        return state.cachedUserId === userId && (hasValidProfile || !!recentAttempt)
      },
    }),
    {
      name: 'vetflow-profile-store',
      // Ne persister que les données essentielles
      partialize: (state) => ({
        profile: state.profile,
        lastFetched: state.lastFetched,
        cachedUserId: state.cachedUserId,
      }),
    }
  )
) 