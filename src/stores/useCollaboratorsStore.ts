import { create } from 'zustand'
import { CollaboratorsService } from '@/services/collaborators.service'
import type { TProfile } from '@/types/database.types'

export interface InviteCollaboratorData {
  email: string
  firstName: string
  lastName: string
  role: 'vet' | 'assistant'
  is_admin?: boolean
  calendarColor?: string
}

interface CollaboratorsStore {
  // État
  collaborators: TProfile[]
  deactivatedCollaborators: TProfile[]
  invitations: any[] // Pour les invitations en attente
  loading: boolean
  error: string | null

  // Actions
  fetchCollaborators: () => Promise<void>
  fetchDeactivated: () => Promise<void>
  searchCollaborators: (query: string) => Promise<void>
  inviteCollaborator: (data: InviteCollaboratorData) => Promise<void>
  updateCollaboratorRole: (profileId: string, role: 'vet' | 'assistant') => Promise<void>
  updateCollaboratorColor: (profileId: string, calendarColor: string) => Promise<void>
  removeCollaborator: (profileId: string) => Promise<void>
  reactivateCollaborator: (profileId: string) => Promise<void>
  clearError: () => void
  reset: () => void
}

export const useCollaboratorsStore = create<CollaboratorsStore>((set, get) => ({
  // État initial
  collaborators: [],
  deactivatedCollaborators: [],
  invitations: [],
  loading: false,
  error: null,

  // Actions
  fetchCollaborators: async () => {
    set({ loading: true, error: null })
    try {
      const collaborators = await CollaboratorsService.getAll()
      set({ collaborators, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchDeactivated: async () => {
    set({ loading: true, error: null })
    try {
      const deactivated = await CollaboratorsService.getDeactivated()
      set({ deactivatedCollaborators: deactivated, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  searchCollaborators: async (query: string) => {
    set({ loading: true, error: null })
    try {
      const collaborators = await CollaboratorsService.search(query)
      set({ collaborators, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  inviteCollaborator: async (data: InviteCollaboratorData) => {
    set({ loading: true, error: null })
    try {
      await CollaboratorsService.invite(data)
      await Promise.all([get().fetchCollaborators(), get().fetchDeactivated()])
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateCollaboratorRole: async (profileId: string, role: string) => {
    set({ loading: true, error: null })
    try {
      await CollaboratorsService.updateRole(profileId, role)
      set((state) => ({
        collaborators: state.collaborators.map(collab => 
          collab.id === profileId ? { ...collab, role } : collab
        ),
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateCollaboratorColor: async (profileId: string, calendarColor: string) => {
    set({ loading: true, error: null })
    try {
      await CollaboratorsService.updateColor(profileId, calendarColor)
      set((state) => ({
        collaborators: state.collaborators.map(collab => 
          collab.id === profileId ? { ...collab, calendar_color: calendarColor } : collab
        ),
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  removeCollaborator: async (profileId: string) => {
    set({ loading: true, error: null })
    try {
      await CollaboratorsService.remove(profileId)
      // Retirer de la liste active et rafraîchir la liste des désactivés
      set((state) => ({
        collaborators: state.collaborators.filter(collab => collab.id !== profileId),
        loading: false
      }))
      await get().fetchDeactivated()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  reactivateCollaborator: async (profileId: string) => {
    set({ loading: true, error: null })
    try {
      await CollaboratorsService.reactivate(profileId)
      await Promise.all([get().fetchCollaborators(), get().fetchDeactivated()])
      set({ loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ collaborators: [], deactivatedCollaborators: [], invitations: [], loading: false, error: null })
}))