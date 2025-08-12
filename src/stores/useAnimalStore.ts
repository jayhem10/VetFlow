import { create } from 'zustand'
import { AnimalsService } from '@/services/animals.service'
import type { Animal, CreateAnimal, UpdateAnimal, AnimalSearchFilters } from '@/types/animal.types'

interface AnimalStore {
  // État
  animals: Animal[]
  selectedAnimal: Animal | null
  loading: boolean
  error: string | null

  // Actions
  fetchAnimals: () => Promise<void>
  fetchAnimalById: (id: string) => Promise<void>
  createAnimal: (animal: Omit<CreateAnimal, 'clinic_id'>) => Promise<Animal>
  updateAnimal: (id: string, updates: UpdateAnimal) => Promise<Animal>
  deleteAnimal: (id: string) => Promise<void>
  searchAnimals: (filters: AnimalSearchFilters) => Promise<void>
  getAnimalsByOwner: (ownerId: string) => Promise<void>
  updateAnimalStatus: (id: string, status: 'active' | 'deceased' | 'inactive', deceasedDate?: string) => Promise<void>
  setSelectedAnimal: (animal: Animal | null) => void
  clearError: () => void
  reset: () => void
}

export const useAnimalStore = create<AnimalStore>((set, get) => ({
  // État initial
  animals: [],
  selectedAnimal: null,
  loading: false,
  error: null,

  // Actions
  fetchAnimals: async () => {
    set({ loading: true, error: null })
    try {
      const animals = await AnimalsService.getAll()
      set({ animals, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchAnimalById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const animal = await AnimalsService.getById(id)
      set({ selectedAnimal: animal, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createAnimal: async (animalData: Omit<CreateAnimal, 'clinic_id'>) => {
    set({ loading: true, error: null })
    try {
      const newAnimal = await AnimalsService.create(animalData)
      set((state) => ({ 
        animals: [...state.animals, newAnimal],
        loading: false 
      }))
      return newAnimal
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateAnimal: async (id: string, updates: UpdateAnimal) => {
    set({ loading: true, error: null })
    try {
      const updatedAnimal = await AnimalsService.update(id, updates)
      set((state) => ({
        animals: state.animals.map(animal => 
          animal.id === id ? updatedAnimal : animal
        ),
        selectedAnimal: state.selectedAnimal?.id === id ? updatedAnimal : state.selectedAnimal,
        loading: false
      }))
      return updatedAnimal
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  deleteAnimal: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await AnimalsService.delete(id)
      set((state) => ({
        animals: state.animals.filter(animal => animal.id !== id),
        selectedAnimal: state.selectedAnimal?.id === id ? null : state.selectedAnimal,
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  searchAnimals: async (filters: AnimalSearchFilters) => {
    set({ loading: true, error: null })
    try {
      const animals = await AnimalsService.search(filters)
      set({ animals, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  getAnimalsByOwner: async (ownerId: string) => {
    set({ loading: true, error: null })
    try {
      const animals = await AnimalsService.getByOwner(ownerId)
      set({ animals, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateAnimalStatus: async (id: string, status: 'active' | 'deceased' | 'inactive', deceasedDate?: string) => {
    set({ loading: true, error: null })
    try {
      const updatedAnimal = await AnimalsService.updateStatus(id, status, deceasedDate)
      set((state) => ({
        animals: state.animals.map(animal => 
          animal.id === id ? updatedAnimal : animal
        ),
        selectedAnimal: state.selectedAnimal?.id === id ? updatedAnimal : state.selectedAnimal,
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  setSelectedAnimal: (animal) => set({ selectedAnimal: animal }),
  clearError: () => set({ error: null }),
  reset: () => set({ animals: [], selectedAnimal: null, loading: false, error: null })
})) 