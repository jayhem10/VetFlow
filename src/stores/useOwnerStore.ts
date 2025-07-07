import { create } from 'zustand'
import { OwnersService } from '@/services/owners.service'
import type { Owner, CreateOwner, UpdateOwner, OwnerSearchFilters } from '@/types/owner.types'

interface OwnerStore {
  // État
  owners: Owner[]
  selectedOwner: Owner | null
  loading: boolean
  error: string | null

  // Actions
  fetchOwners: (clinicId: string) => Promise<void>
  fetchOwnerById: (id: string) => Promise<void>
  createOwner: (owner: CreateOwner) => Promise<Owner>
  updateOwner: (id: string, updates: UpdateOwner) => Promise<Owner>
  deleteOwner: (id: string) => Promise<void>
  searchOwners: (clinicId: string, filters: OwnerSearchFilters) => Promise<void>
  setSelectedOwner: (owner: Owner | null) => void
  clearError: () => void
  reset: () => void
}

export const useOwnerStore = create<OwnerStore>((set, get) => ({
  // État initial
  owners: [],
  selectedOwner: null,
  loading: false,
  error: null,

  // Actions
  fetchOwners: async (clinicId: string) => {
    set({ loading: true, error: null })
    try {
      const owners = await OwnersService.getAll(clinicId)
      set({ owners, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchOwnerById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const owner = await OwnersService.getById(id)
      set({ selectedOwner: owner, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createOwner: async (ownerData: CreateOwner) => {
    set({ loading: true, error: null })
    try {
      const newOwner = await OwnersService.create(ownerData)
      set((state) => ({ 
        owners: [...state.owners, newOwner],
        loading: false 
      }))
      return newOwner
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateOwner: async (id: string, updates: UpdateOwner) => {
    set({ loading: true, error: null })
    try {
      const updatedOwner = await OwnersService.update(id, updates)
      set((state) => ({
        owners: state.owners.map(owner => 
          owner.id === id ? updatedOwner : owner
        ),
        selectedOwner: state.selectedOwner?.id === id ? updatedOwner : state.selectedOwner,
        loading: false
      }))
      return updatedOwner
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  deleteOwner: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await OwnersService.delete(id)
      set((state) => ({
        owners: state.owners.filter(owner => owner.id !== id),
        selectedOwner: state.selectedOwner?.id === id ? null : state.selectedOwner,
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  searchOwners: async (clinicId: string, filters: OwnerSearchFilters) => {
    set({ loading: true, error: null })
    try {
      const owners = await OwnersService.search(clinicId, filters)
      set({ owners, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  setSelectedOwner: (owner) => set({ selectedOwner: owner }),
  clearError: () => set({ error: null }),
  reset: () => set({ owners: [], selectedOwner: null, loading: false, error: null })
})) 