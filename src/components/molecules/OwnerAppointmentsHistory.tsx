'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { AppointmentWithDetails } from '@/types/appointment.types'

interface OwnerAppointmentsHistoryProps {
  ownerId: string
  className?: string
}

export function OwnerAppointmentsHistory({ ownerId, className }: OwnerAppointmentsHistoryProps) {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/owners/${ownerId}/appointments`)
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des rendez-vous')
        }
        
        const data = await response.json()
        setAppointments(data.appointments || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    if (ownerId) {
      fetchAppointments()
    }
  }, [ownerId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'no_show':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'confirmed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Planifié'
      case 'confirmed':
        return 'Confirmé'
      case 'in_progress':
        return 'En cours'
      case 'completed':
        return 'Terminé'
      case 'cancelled':
        return 'Annulé'
      case 'no_show':
        return 'Absent'
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consultation'
      case 'surgery':
        return 'Chirurgie'
      case 'vaccination':
        return 'Vaccination'
      case 'emergency':
        return 'Urgence'
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historique des rendez-vous
          </h3>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Historique des rendez-vous
        </h3>
        <div className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Historique des rendez-vous
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {appointments.length} rendez-vous
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">📅</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Aucun rendez-vous trouvé
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {appointment.title}
                    </h4>
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      getStatusColor(appointment.status || 'scheduled')
                    )}>
                      {getStatusLabel(appointment.status || 'scheduled')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">📅 Date:</span> {formatDate(appointment.appointment_date)}
                    </div>
                    <div>
                      <span className="font-medium">🐾 Animal:</span> {appointment.animal?.name || 'Inconnu'}
                    </div>
                    <div>
                      <span className="font-medium">👨‍⚕️ Vétérinaire:</span> {appointment.veterinarian && appointment.veterinarian.first_name && appointment.veterinarian.last_name 
                        ? `${appointment.veterinarian.first_name} ${appointment.veterinarian.last_name}` 
                        : appointment.veterinarian 
                          ? 'Nom non disponible' 
                          : 'Non assigné'}
                    </div>
                    <div>
                      <span className="font-medium">🏥 Type:</span> {getTypeLabel(appointment.appointment_type || 'consultation')}
                    </div>
                  </div>

                  {appointment.description && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">📝 Description:</span> {appointment.description}
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">📋 Notes:</span> {appointment.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
