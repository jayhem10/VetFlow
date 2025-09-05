import type { TProfile } from '@/types/database.types'

export class VeterinariansService {
  static async getAll(): Promise<TProfile[]> {
    const response = await fetch('/api/collaborators/vets', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la récupération des vétérinaires')
    }

    const data = await response.json()
    return data.veterinarians
  }
}
