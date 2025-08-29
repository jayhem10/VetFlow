'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppointmentStore } from '@/stores/useAppointmentStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import { useClinic } from '@/modules/clinic/hooks/use-clinic'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { useProfile } from '@/modules/profile/hooks/use-profile'
import { toast } from '@/lib/toast'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Select from '@/components/atoms/Select'
import { cn, translateAppointmentStatus, getStatusColor } from '@/lib/utils'
import AppointmentDetails from '@/components/molecules/AppointmentDetails'
import type { AppointmentWithDetails } from '@/types/appointment.types'
import { AppointmentFormModal } from '@/components/molecules/AppointmentFormModal'
import { canCreateAppointments, canEditAppointments } from '@/lib/auth-utils'
import { useSession } from 'next-auth/react'
import { useProfileStore } from '@/stores/useProfileStore'
import { useClinicStore } from '@/stores/useClinicStore'
import { EditButton } from '@/components/atoms/EditButton'
import { Tooltip } from '@/components/atoms/Tooltip'
import { Plus, Calendar, PawPrint, User, DollarSign, Paperclip, FileText, Receipt, Eye, FileText as FileTextIcon } from 'lucide-react'

interface TodayAppointmentsProps {
  className?: string
  onEditAppointment?: (appointment: AppointmentWithDetails) => void
  onCreateAppointment?: () => void
  onShowSummary?: (appointment: AppointmentWithDetails) => void
  onShowInvoice?: (appointment: AppointmentWithDetails) => void
  onShowFiles?: (appointment: AppointmentWithDetails) => void
}

export default function TodayAppointments({ 
  className,
  onEditAppointment,
  onCreateAppointment,
  onShowSummary,
  onShowInvoice,
  onShowFiles,
}: TodayAppointmentsProps) {
  const { data: session } = useSession()
  const { profile } = useProfileStore()
  const { clinic } = useClinicStore()
  const { appointments, fetchAppointments, loading } = useAppointmentStore()
  const { collaborators } = useCollaboratorsStore()
  
  const [selectedVet, setSelectedVet] = useState<string>('all')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null)

  useEffect(() => {
    if (clinic?.id) {
      fetchAppointments(clinic.id)
    }
  }, [clinic?.id, fetchAppointments])

  // Filtrer les rendez-vous du jour
  const todayAppointments = useMemo(() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    let filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date)
      return aptDate >= todayStart && aptDate < todayEnd
    })

    // Filtrer par vétérinaire si sélectionné
    if (selectedVet !== 'all') {
      filtered = filtered.filter(apt => apt.veterinarian_id === selectedVet)
    }

    // Trier par heure
    return filtered.sort((a, b) => 
      new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
    )
  }, [appointments, selectedVet])

  // Statistiques du jour
  const stats = useMemo(() => {
    const total = todayAppointments.length
    const scheduled = todayAppointments.filter(apt => apt.status === 'scheduled').length
    const confirmed = todayAppointments.filter(apt => apt.status === 'confirmed').length
    const inProgress = todayAppointments.filter(apt => apt.status === 'in_progress').length
    const completed = todayAppointments.filter(apt => apt.status === 'completed').length
    const cancelled = todayAppointments.filter(apt => apt.status === 'cancelled').length
    const noShow = todayAppointments.filter(apt => apt.status === 'no_show').length

    return { total, scheduled, confirmed, inProgress, completed, cancelled, noShow }
  }, [todayAppointments])

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    setIsUpdating(appointmentId)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Mise à jour impossible')
      }
      // rafraîchir la liste du jour
      if (clinic?.id) {
        await fetchAppointments(clinic.id)
      }
      toast.success('Statut mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleEditAppointment = (appointment: AppointmentWithDetails) => {
    if (onEditAppointment) {
      onEditAppointment(appointment)
    }
  }

  const handleGenerateInvoice = (appointment: AppointmentWithDetails) => {
    onShowInvoice?.(appointment)
  }

  const handleShowSummary = (appointment: AppointmentWithDetails) => {
    onShowSummary?.(appointment)
  }

  const handleShowFiles = (appointment: AppointmentWithDetails) => {
    onShowFiles?.(appointment)
  }

  const handleCreateAppointment = () => {
    if (onCreateAppointment) {
      onCreateAppointment()
    }
  }

  const handleModalSuccess = () => {
    if (clinic?.id) {
      fetchAppointments(clinic.id)
    }
  }

  // Utilisation des fonctions centralisées de utils.ts

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVetName = (vetId: string) => {
    const vet = collaborators.find(c => c.id === vetId)
    return vet ? `${vet.first_name} ${vet.last_name}` : 'Vétérinaire inconnu'
  }

  const getVetColor = (vetId: string) => {
    const vet = collaborators.find(c => c.id === vetId)
    if (vet?.calendar_color) {
      const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
        amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        lime: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
        cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
        fuchsia: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
        indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
        teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
      }
      return colorMap[vet.calendar_color] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chargement des rendez-vous...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      {/* En-tête avec statistiques */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></span>
            Rendez-vous du jour
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Filtre par vétérinaire */}
        <div className="flex items-center gap-3">
          <Select
            value={selectedVet}
            onChange={setSelectedVet}
            options={[
              { value: 'all', label: 'Tous les vétérinaires' },
              ...collaborators
                .filter(c => {
                  const roles = c.role ? c.role.split(',').map(r => r.trim()) : []
                  return roles.some(role => role === 'vet' || role === 'admin')
                })
                .map(c => ({
                  value: c.id,
                  label: `${c.first_name} ${c.last_name}`
                }))
            ]}
            placeholder="Filtrer par vétérinaire"
          />
          
          {/* Bouton de création rapide */}
          {canCreateAppointments(profile?.role) && (
            <Button
              onClick={handleCreateAppointment}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau RDV
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Total</div>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.scheduled}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Planifiés</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.confirmed}</div>
          <div className="text-xs text-green-700 dark:text-green-300">Confirmés</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress}</div>
          <div className="text-xs text-yellow-700 dark:text-yellow-300">En cours</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{stats.completed}</div>
          <div className="text-xs text-gray-700 dark:text-gray-300">Terminés</div>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.cancelled}</div>
          <div className="text-xs text-red-700 dark:text-red-300">Annulés</div>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.noShow}</div>
          <div className="text-xs text-orange-700 dark:text-orange-300">Absents</div>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="space-y-3">
        {todayAppointments.length === 0 ? (
          <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-gray-500" />
          </div>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedVet === 'all' 
                ? 'Aucun rendez-vous aujourd\'hui' 
                : 'Aucun rendez-vous pour ce vétérinaire aujourd\'hui'
              }
            </p>
          </div>
        ) : (
          todayAppointments.map((appointment) => {
            const aptWithDetails = appointment as AppointmentWithDetails
            const animalName = aptWithDetails.animal?.name || 'Animal inconnu'
            const ownerName = aptWithDetails.animal?.owner 
              ? `${aptWithDetails.animal.owner.first_name} ${aptWithDetails.animal.owner.last_name}`
              : 'Propriétaire inconnu'

            return (
              <div 
                key={appointment.id} 
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Heure */}
                <div className="flex-shrink-0 text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatTime(appointment.appointment_date)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {appointment.duration_minutes || 30} min
                  </div>
                </div>

                {/* Informations du rendez-vous */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {appointment.title}
                    </h3>
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      getStatusColor(appointment.status)
                    )}>
                      {translateAppointmentStatus(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-1">
                      <PawPrint className="w-3 h-3" />
                      {animalName}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ownerName}
                    </div>
                    {aptWithDetails.invoice && (
                      <div className="flex items-center gap-1 text-xs">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 font-medium">Facture #{aptWithDetails.invoice.invoice_number}</span>
                        <span className={cn(
                          "px-1 py-0.5 text-xs rounded",
                          aptWithDetails.invoice.payment_status === 'paid' 
                            ? "bg-green-100 text-green-700" 
                            : "bg-yellow-100 text-yellow-700"
                        )}>
                          {aptWithDetails.invoice.payment_status === 'paid' ? 'Payée' : 'En attente'}
                        </span>
                      </div>
                    )}
                    {aptWithDetails.files && aptWithDetails.files.length > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Paperclip className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-600 font-medium">{aptWithDetails.files.length} document{aptWithDetails.files.length > 1 ? 's' : ''}</span>
                        {aptWithDetails.files.length > 0 && (
                          <span className="text-gray-500">
                            ({new Date(aptWithDetails.files[0].uploaded_at || '').toLocaleDateString('fr-FR')})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vétérinaire */}
                <div className="flex-shrink-0">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    getVetColor(appointment.veterinarian_id)
                  )}>
                    {aptWithDetails.veterinarian 
                      ? `${aptWithDetails.veterinarian.first_name || ''} ${aptWithDetails.veterinarian.last_name || ''}`.trim()
                      : getVetName(appointment.veterinarian_id)
                    }
                  </span>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-2">
                  <Select
                    value={appointment.status || 'scheduled'}
                    onChange={(value) => handleStatusChange(appointment.id, value)}
                    options={[
                      { value: 'scheduled', label: 'Planifié' },
                      { value: 'confirmed', label: 'Confirmé' },
                      { value: 'in_progress', label: 'En cours' },
                      { value: 'completed', label: 'Terminé' },
                      { value: 'cancelled', label: 'Annulé' },
                      { value: 'no_show', label: 'Absent' }
                    ]}
                    disabled={isUpdating === appointment.id}
                    className="w-32"
                  />
                  
                  {/* Bouton résumé */}
                  <Tooltip content="Voir le résumé">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShowSummary(aptWithDetails)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  <Tooltip content={aptWithDetails.invoice ? "Modifier la facture" : "Créer une facture"}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateInvoice(aptWithDetails)}
                      className={aptWithDetails.invoice ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : ""}
                    >
                      {aptWithDetails.invoice ? <Receipt className="w-4 h-4" /> : <FileTextIcon className="w-4 h-4" />}
                    </Button>
                  </Tooltip>
                  
                  {/* Bouton fichiers */}
                  <Tooltip content="Ajouter / voir des documents">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShowFiles(aptWithDetails)}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  {canEditAppointments(profile?.role) && (
                    <Tooltip content='Modifier le rendez-vous'>
                    <EditButton
                      onClick={() => handleEditAppointment(aptWithDetails)}
                      disabled={isUpdating === appointment.id}
                    />
                    </Tooltip>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

    </Card>
  )
}
