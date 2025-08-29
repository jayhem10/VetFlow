import type { Appointment, CreateAppointment, UpdateAppointment, AppointmentSearchFilters, AppointmentWithDetails } from '@/types/appointment.types'

export class AppointmentsService {
  static async getAll(_clinicId?: string): Promise<AppointmentWithDetails[]> {
    const timestamp = Date.now()
    const response = await fetch(`/api/appointments?t=${timestamp}`, {
      cache: 'no-store'
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des rendez-vous')
    }
    const data = await response.json()
    return data.appointments
  }

  static async getById(id: string): Promise<Appointment> {
    const response = await fetch(`/api/appointments/${id}`)
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du rendez-vous')
    }
    const data = await response.json()
    return data.appointment
  }

  static async create(appointment: CreateAppointment): Promise<Appointment> {
    const response = await fetch('/api/appointments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la création du rendez-vous')
    }
    const data = await response.json()
    return data.appointment
  }

  static async update(id: string, appointment: UpdateAppointment): Promise<Appointment> {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du rendez-vous')
    }
    const data = await response.json()
    return data.appointment
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du rendez-vous')
    }
  }

  static async search(filters: AppointmentSearchFilters): Promise<Appointment[]> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
    
    const response = await fetch(`/api/appointments/search?${params.toString()}`)
    if (!response.ok) {
      throw new Error('Erreur lors de la recherche de rendez-vous')
    }
    const data = await response.json()
    return data.appointments
  }

  static async getToday(_clinicId?: string): Promise<Appointment[]> {
    const response = await fetch(`/api/appointments/today`)
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des rendez-vous du jour')
    }
    const data = await response.json()
    return data.appointments
  }

  static async getUpcoming(_clinicId?: string, days: number = 7): Promise<Appointment[]> {
    const response = await fetch(`/api/appointments/upcoming?days=${days}`)
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des rendez-vous à venir')
    }
    const data = await response.json()
    return data.appointments
  }

  static async updateStatus(id: string, status: string): Promise<Appointment> {
    const response = await fetch(`/api/appointments/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du statut')
    }
    const data = await response.json()
    return data.appointment
  }

  static async checkAvailability(
    clinicId: string,
    veterinarianId: string,
    appointmentDate: string,
    duration: number = 30,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const response = await fetch(`/api/appointments/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        veterinarianId,
        appointmentDate,
        duration,
        excludeAppointmentId,
      }),
    })
    if (!response.ok) {
      throw new Error('Erreur lors de la vérification de disponibilité')
    }
    const data = await response.json()
    return data.available
  }
} 