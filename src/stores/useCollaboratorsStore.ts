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
  invitations: any[] // Pour les invitations en attente
  loading: boolean
  error: string | null

  // Actions
  fetchCollaborators: () => Promise<void>
  searchCollaborators: (query: string) => Promise<void>
  inviteCollaborator: (data: InviteCollaboratorData) => Promise<void>
  updateCollaboratorRole: (profileId: string, role: 'vet' | 'assistant') => Promise<void>
  removeCollaborator: (profileId: string) => Promise<void>
  clearError: () => void
  reset: () => void
}

export const useCollaboratorsStore = create<CollaboratorsStore>((set, get) => ({
  // État initial
  collaborators: [],
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
      await get().fetchCollaborators()
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
      set((state) => ({
        collaborators: state.collaborators.filter(collab => collab.id !== profileId),
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ collaborators: [], invitations: [], loading: false, error: null })
}))