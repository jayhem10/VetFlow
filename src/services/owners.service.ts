import type { Owner, CreateOwner, UpdateOwner, OwnerSearchFilters } from '@/types/owner.types'

export class OwnersService {
  
  static async getAll(page = 1, pageSize = 25): Promise<{ owners: Owner[]; total: number; page: number; pageSize: number }> {
    console.log('🔍 OwnersService.getAll() - Calling /api/owners')
    const response = await fetch(`/api/owners?page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la récupération des propriétaires')
    }

    const data = await response.json()
    console.log('🔍 OwnersService.getAll() - Received', data.owners?.length || 0, 'owners')
    return { owners: data.owners, total: data.total, page: data.page, pageSize: data.pageSize }
  }

  static async getAllForSearch(): Promise<Owner[]> {
    console.log('🔍 OwnersService.getAllForSearch() - Calling /api/owners/all')
    const response = await fetch('/api/owners/all', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la récupération des propriétaires')
    }

    const data = await response.json()
    console.log('🔍 OwnersService.getAllForSearch() - Received', data.owners?.length || 0, 'owners')
    return data.owners
  }

  static async getById(id: string): Promise<Owner> {
    const response = await fetch(`/api/owners/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la récupération du propriétaire')
    }

    const data = await response.json()
    return data.owner
  }

  static async create(ownerData: Omit<CreateOwner, 'clinic_id'>): Promise<Owner> {
    const response = await fetch('/api/owners/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ownerData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la création du propriétaire')
    }

    const data = await response.json()
    return data.owner
  }

  static async update(id: string, updates: UpdateOwner): Promise<Owner> {
    const response = await fetch(`/api/owners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la mise à jour du propriétaire')
    }

    const data = await response.json()
    return data.owner
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`/api/owners/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la suppression du propriétaire')
    }
  }

  static async search(filters: OwnerSearchFilters): Promise<Owner[]> {
    const params = new URLSearchParams()
    if (filters.query) params.append('query', filters.query)
    if (filters.city) params.append('city', filters.city)
    if (filters.hasAnimals !== undefined) params.append('hasAnimals', filters.hasAnimals.toString())
    if (filters.marketingConsent !== undefined) params.append('marketingConsent', filters.marketingConsent.toString())

    const response = await fetch(`/api/owners/search?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la recherche')
    }

    const data = await response.json()
    return data.owners
  }
}