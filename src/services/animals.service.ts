import type { Animal, CreateAnimal, UpdateAnimal, AnimalSearchFilters } from '@/types/animal.types'

export class AnimalsService {
  
  static async getAll(page = 1, pageSize = 25): Promise<{ animals: Animal[]; total: number; page: number; pageSize: number }> {
    console.log('🔍 AnimalsService.getAll() - Calling /api/animals')
    const response = await fetch(`/api/animals?page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erreur lors de la récupération des animaux')
    }

    const data = await response.json()
    console.log('🔍 AnimalsService.getAll() - Received', data.animals?.length || 0, 'animals')
    return { animals: data.animals, total: data.total, page: data.page, pageSize: data.pageSize }
  }

  static async getById(id: string): Promise<Animal> {
    const response = await fetch(`/api/animals/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erreur lors de la récupération de l\'animal')
    }

    const data = await response.json()
    return data.animal
  }

  static async create(animalData: Omit<CreateAnimal, 'clinic_id'>): Promise<Animal> {
    const response = await fetch('/api/animals/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(animalData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erreur lors de la création de l\'animal')
    }

    const data = await response.json()
    return data.animal
  }

  static async update(id: string, updates: UpdateAnimal): Promise<Animal> {
    const response = await fetch(`/api/animals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erreur lors de la mise à jour de l\'animal')
    }

    const data = await response.json()
    return data.animal
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`/api/animals/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erreur lors de la suppression de l\'animal')
    }
  }

  static async search(filters: AnimalSearchFilters): Promise<Animal[]> {
    const params = new URLSearchParams()
    if (filters.query) params.append('query', filters.query)
    if (filters.species) params.append('species', filters.species)
    if (filters.ownerId) params.append('ownerId', filters.ownerId)
    if (filters.status) params.append('status', filters.status)

    const response = await fetch(`/api/animals/search?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erreur lors de la recherche')
    }

    const data = await response.json()
    return data.animals
  }

  static async getByOwner(ownerId: string): Promise<Animal[]> {
    const response = await fetch(`/api/animals/search?ownerId=${ownerId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erreur lors de la récupération des animaux du propriétaire')
    }

    const data = await response.json()
    return data.animals
  }

  static async updateStatus(id: string, status: 'active' | 'deceased' | 'inactive', deceasedDate?: string): Promise<Animal> {
    const response = await fetch(`/api/animals/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, deceasedDate }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Erreur lors de la mise à jour du statut')
    }

    const data = await response.json()
    return data.animal
  }
}