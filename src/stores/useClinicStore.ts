import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TClinic } from '@/types/database.types'

interface ClinicStore {
  // État
  clinic: TClinic | null
  loading: boolean
  error: string | null
  lastFetched: number | null

  // Actions
  setClinic: (clinic: TClinic | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Actions API
  fetchClinic: (userId?: string, force?: boolean) => Promise<TClinic | null>
  createClinic: (data: any) => Promise<TClinic>
  updateClinic: (id: string, updates: any) => Promise<TClinic>
  
  // Utilitaires
  clearClinic: () => void
  isStale: () => boolean // Vérifie si les données sont périmées (plus de 5 minutes)
}

export const useClinicStore = create<ClinicStore>()(
  persist(
    (set, get) => ({
      // État initial
      clinic: null,
      loading: false,
      error: null,
      lastFetched: null,

      // Actions de base
      setClinic: (clinic) => set({ 
        clinic, 
        lastFetched: Date.now(),
        error: null 
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),

      // Actions API
      fetchClinic: async (userId?: string, force = false) => {
        const state = get()
        
        // Si pas d'utilisateur fourni, pas de fetch
        if (!userId) {
          console.log('❌ fetchClinic: Pas d\'ID utilisateur fourni')
          return state.clinic
        }
        
        // Si on a déjà des données récentes et que ce n'est pas forcé, les retourner
        if (!force && state.clinic && !state.isStale()) {
          // console.log('✅ fetchClinic: Utilisation du cache')
          return state.clinic
        }

        set({ loading: true, error: null })

        try {
          const response = await fetch('/api/clinic/get')
          
          if (!response.ok) {
            if (response.status === 404) {
              set({ clinic: null, lastFetched: Date.now() })
              return null
            }
            throw new Error('Erreur lors de la récupération de la clinique')
          }

          const result = await response.json()
          set({ 
            clinic: result.clinic, 
            lastFetched: Date.now(),
            error: null 
          })
          
          return result.clinic
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
          set({ error: errorMessage })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      createClinic: async (data) => {
        set({ loading: true, error: null })

        try {
          const response = await fetch('/api/clinic/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const result = await response.json()
            throw new Error(result.error || 'Erreur lors de la création de la clinique')
          }

          const result = await response.json()
          set({ 
            clinic: result.clinic, 
            lastFetched: Date.now(),
            error: null 
          })
          
          return result.clinic
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
          set({ error: errorMessage })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      updateClinic: async (id, updates) => {
        set({ loading: true, error: null })
        
        try {
          const response = await fetch(`/api/clinic/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          })

          if (!response.ok) {
            const result = await response.json()
            throw new Error(result.error || 'Erreur lors de la mise à jour')
          }

          const updatedClinic = await response.json()
          console.log('✅ updateClinic: Clinique mise à jour:', updatedClinic)
          set({ 
            clinic: updatedClinic, 
            lastFetched: Date.now(),
            error: null 
          })
          
          return updatedClinic
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
          set({ error: errorMessage })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      // Utilitaires
      clearClinic: () => set({ 
        clinic: null, 
        lastFetched: null, 
        error: null 
      }),

      isStale: () => {
        const { lastFetched } = get()
        if (!lastFetched) return true
        // Considérer comme périmé après 5 minutes
        return Date.now() - lastFetched > 5 * 60 * 1000
      },
    }),
    {
      name: 'vetflow-clinic-store',
      // Ne persister que les données essentielles
      partialize: (state) => ({
        clinic: state.clinic,
        lastFetched: state.lastFetched,
      }),
    }
  )
) 