'use client'

import { cn } from '@/lib/utils'
import Card from '@/components/atoms/Card'

interface AppointmentDetailsProps {
  appointment: {
    id: string
    title: string
    description?: string
    appointment_date: string
    duration_minutes?: number
    appointment_type?: string
    priority?: string
    status?: string
    notes?: string
    internal_notes?: string
    animal?: {
      id: string
      name: string
      species: string
      breed?: string
      owner?: {
        id: string
        first_name: string
        last_name: string
        email?: string
        phone?: string
      } | null
    } | null
    veterinarian?: {
      id: string
      first_name: string
      last_name: string
      role?: string
    } | null
  }
  className?: string
}

export function AppointmentDetails({ appointment, className }: AppointmentDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'no_show': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'consultation': return '🩺'
      case 'vaccination': return '💉'
      case 'surgery': return '🔪'
      case 'checkup': return '🔍'
      case 'emergency': return '🚨'
      default: return '📅'
    }
  }

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      {/* En-tête avec titre et statut */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {appointment.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(appointment.appointment_date)}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {appointment.status && (
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              getStatusColor(appointment.status)
            )}>
              {appointment.status === 'scheduled' && 'Planifié'}
              {appointment.status === 'confirmed' && 'Confirmé'}
              {appointment.status === 'in_progress' && 'En cours'}
              {appointment.status === 'completed' && 'Terminé'}
              {appointment.status === 'cancelled' && 'Annulé'}
              {appointment.status === 'no_show' && 'Absent'}
            </span>
          )}
          {appointment.priority && (
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              getPriorityColor(appointment.priority)
            )}>
              {appointment.priority === 'low' && 'Basse'}
              {appointment.priority === 'normal' && 'Normale'}
              {appointment.priority === 'high' && 'Haute'}
              {appointment.priority === 'urgent' && 'Urgente'}
            </span>
          )}
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Animal et propriétaire */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🐾 Animal et propriétaire
            </h4>
            {appointment.animal ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{appointment.animal.name}</span>
                  <span className="text-sm text-gray-500">
                    ({appointment.animal.species}
                    {appointment.animal.breed && ` - ${appointment.animal.breed}`})
                  </span>
                </div>
                {appointment.animal.owner && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>👤 {appointment.animal.owner.first_name} {appointment.animal.owner.last_name}</div>
                    {appointment.animal.owner.email && (
                      <div>📧 {appointment.animal.owner.email}</div>
                    )}
                    {appointment.animal.owner.phone && (
                      <div>📞 {appointment.animal.owner.phone}</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucun animal associé</p>
            )}
          </div>
        </div>

        {/* Vétérinaire et détails */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              👩‍⚕️ Vétérinaire et détails
            </h4>
            <div className="space-y-2">
              {appointment.veterinarian ? (
                <div className="text-sm">
                  <div className="font-medium">
                    {appointment.veterinarian.first_name} {appointment.veterinarian.last_name}
                  </div>
                  {appointment.veterinarian.role && (
                    <div className="text-gray-500">{appointment.veterinarian.role}</div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun vétérinaire assigné</p>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{getTypeIcon(appointment.appointment_type)}</span>
                <span className="capitalize">
                  {appointment.appointment_type === 'consultation' && 'Consultation'}
                  {appointment.appointment_type === 'vaccination' && 'Vaccination'}
                  {appointment.appointment_type === 'surgery' && 'Chirurgie'}
                  {appointment.appointment_type === 'checkup' && 'Contrôle'}
                  {appointment.appointment_type === 'emergency' && 'Urgence'}
                  {!appointment.appointment_type && 'Rendez-vous'}
                </span>
              </div>
              
              {appointment.duration_minutes && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ⏱️ {appointment.duration_minutes} minutes
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description et notes */}
      {(appointment.description || appointment.notes || appointment.internal_notes) && (
        <div className="space-y-3">
          {appointment.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                📝 Description
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {appointment.description}
              </p>
            </div>
          )}
          
          {appointment.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                📋 Notes
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {appointment.notes}
              </p>
            </div>
          )}
          
          {appointment.internal_notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                🔒 Notes internes
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {appointment.internal_notes}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default AppointmentDetails
