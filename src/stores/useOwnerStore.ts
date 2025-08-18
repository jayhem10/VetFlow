import { create } from 'zustand'
import { OwnersService } from '@/services/owners.service'
import type { Owner, CreateOwner, UpdateOwner, OwnerSearchFilters } from '@/types/owner.types'

interface OwnerStore {
  // État
  owners: Owner[]
  ownersTotal?: number
  ownersPage?: number
  ownersPageSize?: number
  selectedOwner: Owner | null
  loading: boolean
  error: string | null

  // Actions
  fetchOwners: (page?: number, pageSize?: number) => Promise<void>
  fetchAllOwners: () => Promise<void>
  fetchOwnerById: (id: string) => Promise<void>
  createOwner: (owner: Omit<CreateOwner, 'clinic_id'>) => Promise<Owner>
  updateOwner: (id: string, updates: UpdateOwner) => Promise<Owner>
  deleteOwner: (id: string) => Promise<void>
  searchOwners: (filters: OwnerSearchFilters) => Promise<void>
  setSelectedOwner: (owner: Owner | null) => void
  clearError: () => void
  reset: () => void
}

export const useOwnerStore = create<OwnerStore>((set, get) => ({
  // État initial
  owners: [],
  ownersTotal: 0,
  ownersPage: 1,
  ownersPageSize: 25,
  selectedOwner: null,
  loading: false,
  error: null,

  // Actions
  fetchOwners: async (page = 1, pageSize = 25) => {
    set({ loading: true, error: null })
    try {
      const { owners, total, page: p, pageSize: ps } = await OwnersService.getAll(page, pageSize)
      set({ owners, ownersTotal: total, ownersPage: p, ownersPageSize: ps, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchAllOwners: async () => {
    set({ loading: true, error: null })
    try {
      const owners = await OwnersService.getAllForSearch()
      set({ owners, ownersTotal: owners.length, ownersPage: 1, ownersPageSize: owners.length, loading: false })
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

  createOwner: async (ownerData: Omit<CreateOwner, 'clinic_id'>) => {
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

  searchOwners: async (filters: OwnerSearchFilters) => {
    set({ loading: true, error: null })
    try {
      const owners = await OwnersService.search(filters)
      set({ owners, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  setSelectedOwner: (owner) => set({ selectedOwner: owner }),
  clearError: () => set({ error: null }),
  reset: () => set({ owners: [], selectedOwner: null, loading: false, error: null })
})) 