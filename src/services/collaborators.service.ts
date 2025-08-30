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

  static async getDeactivated(): Promise<TProfile[]> {
    const response = await fetch('/api/collaborators/deactivated', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de la récupération des collaborateurs désactivés')
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
        calendar_color: inviteData.calendarColor,
      }),
    })

    if (!response.ok) {
      let message = 'Erreur lors de l\'invitation'
      try {
        const text = await response.text()
        try {
          const errJson = JSON.parse(text)
          message = errJson.error || errJson.message || message
        } catch {
          if (text) message = text
        }
      } catch {}
      throw new Error(message)
    }
  }

  static async updateRole(profileId: string, role: string): Promise<void> {
    const response = await fetch(`/api/collaborators/${profileId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      let message = 'Erreur lors de la mise à jour du rôle'
      try {
        const errorData = await response.json()
        message = errorData.error || errorData.message || message
      } catch {
        // Si la réponse n'est pas du JSON, utiliser le texte brut
        try {
          const text = await response.text()
          if (text) message = text
        } catch {}
      }
      throw new Error(message)
    }
  }

  static async updateColor(profileId: string, calendarColor: string): Promise<void> {
    const response = await fetch(`/api/collaborators/${profileId}/color`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendar_color: calendarColor }),
    })

    if (!response.ok) {
      let message = 'Erreur lors de la mise à jour de la couleur'
      try {
        const errorData = await response.json()
        message = errorData.error || errorData.message || message
      } catch {
        // Si la réponse n'est pas du JSON, utiliser le texte brut
        try {
          const text = await response.text()
          if (text) message = text
        } catch {}
      }
      throw new Error(message)
    }
  }

  static async remove(profileId: string): Promise<void> {
    const response = await fetch(`/api/collaborators/${profileId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      let message = 'Erreur lors de la désactivation'
      try {
        const errorData = await response.json()
        message = errorData.error || errorData.message || message
      } catch {
        // Si la réponse n'est pas du JSON, utiliser le texte brut
        try {
          const text = await response.text()
          if (text) message = text
        } catch {}
      }
      throw new Error(message)
    }
  }

  static async reactivate(profileId: string): Promise<void> {
    const response = await fetch(`/api/collaborators/${profileId}/reactivate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      let message = 'Erreur lors de la réactivation'
      try {
        const errorData = await response.json()
        message = errorData.error || errorData.message || message
      } catch {
        // Si la réponse n'est pas du JSON, utiliser le texte brut
        try {
          const text = await response.text()
          if (text) message = text
        } catch {}
      }
      throw new Error(message)
    }
  }
}