import type { TProfile } from '@/types/database.types'
import type { InviteCollaboratorData } from '@/stores/useCollaboratorsStore'

export class CollaboratorsService {
  
  static async getAll(): Promise<TProfile[]> {
    const response = await fetch('/api/collaborators', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la récupération des collaborateurs')
    }

    const data = await response.json()
    return data.collaborators
  }

  static async search(query: string): Promise<TProfile[]> {
    const params = new URLSearchParams()
    if (query) params.append('query', query)

    const response = await fetch(`/api/collaborators/search?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la recherche de collaborateurs')
    }

    const data = await response.json()
    return data.collaborators
  }

  static async invite(inviteData: Omit<InviteCollaboratorData, 'clinicId'>): Promise<void> {
    const response = await fetch('/api/collaborators/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inviteData.email,
        first_name: inviteData.firstName,
        last_name: inviteData.lastName,
        role: inviteData.role,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'invitation')
    }
  }

  static async updateRole(profileId: string, role: 'vet' | 'assistant'): Promise<void> {
    const response = await fetch(`/api/collaborators/${profileId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la mise à jour du rôle')
    }
  }

  static async remove(profileId: string): Promise<void> {
    const response = await fetch(`/api/collaborators/${profileId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la suppression')
    }
  }
}