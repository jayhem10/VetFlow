'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppointmentStore } from '@/stores/useAppointmentStore'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useOwnerStore } from '@/stores/useOwnerStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import { useClinic } from '@/modules/clinic/hooks/use-clinic'
import { toast } from '@/lib/toast'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import SearchInput from '@/components/atoms/SearchInput'
import Select from '@/components/atoms/Select'
import AppointmentDetails from '@/components/molecules/AppointmentDetails'
import InvoiceFormModal from '@/components/molecules/InvoiceFormModal'
import InvoiceEditModal from '@/components/molecules/InvoiceEditModal'
import { Tooltip } from '@/components/atoms/Tooltip'
import { AppointmentFormModal } from '@/components/molecules/AppointmentFormModal'
import AppointmentSummaryModal from '@/components/molecules/AppointmentSummaryModal'
import FileUpload from '@/components/molecules/FileUpload'
import type { Invoice } from '@/types/invoice.types'
import Dialog from '@/components/atoms/Dialog'
import { cn, translateAppointmentStatus, getStatusColor } from '@/lib/utils'
import { EditButton } from '@/components/atoms/EditButton'
import { AppointmentWithDetails } from '@/types'
import { canEditAppointments } from '@/lib/auth-utils'
import { useProfileStore } from '@/stores/useProfileStore'
import { Plus, Calendar, PawPrint, User, DollarSign, Paperclip, FileText, Receipt, Edit, Trash2, Eye, FileText as FileTextIcon } from 'lucide-react'

interface AppointmentsListProps {
  className?: string
  onEditAppointment?: (appointment: AppointmentWithDetails) => void
  onShowSummary?: (appointment: AppointmentWithDetails) => void
  onShowInvoice?: (appointment: AppointmentWithDetails) => void
  onShowFiles?: (appointment: AppointmentWithDetails) => void
}

export function AppointmentsList({ 
  className,
  onEditAppointment,
  onShowSummary,
  onShowInvoice,
  onShowFiles
}: AppointmentsListProps) {
  const { clinic } = useClinic()
  const { profile } = useProfileStore()
  const { appointments, fetchAppointments, deleteAppointment, loading } = useAppointmentStore()
  const { animals, fetchAnimals } = useAnimalStore()
  const { owners, fetchOwners } = useOwnerStore()
  const { collaborators, fetchCollaborators } = useCollaboratorsStore()

  // États de recherche et filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilter, setSearchFilter] = useState<'all' | 'animal' | 'owner'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [vetFilter, setVetFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'animal' | 'owner' | 'vet'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // États pour les modales
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false)
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false)
  const [existingInvoice, setExistingInvoice] = useState<Invoice | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showFilesModal, setShowFilesModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // États de chargement
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Fonctions pour gérer les changements de filtres
  const handleStatusFilterChange = (value: string) => setStatusFilter(value)
  const handleVetFilterChange = (value: string) => setVetFilter(value)
  const handleDateFilterChange = (value: string) => setDateFilter(value)
  const handleSortByChange = (value: string) => setSortBy(value as 'date' | 'animal' | 'owner' | 'vet')

  useEffect(() => {
    if (!clinic?.id) return
    
    const loadData = async () => {
      setIsLoadingData(true)
      
      try {
        await Promise.all([
          fetchAppointments(clinic.id),
          fetchAnimals(1, 100),
          fetchOwners(),
          fetchCollaborators()
        ])
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        toast.error('Erreur lors du chargement des données')
      } finally {
        setIsLoadingData(false)
      }
    }
    
    loadData()
  }, [clinic?.id, fetchAppointments, fetchAnimals, fetchOwners, fetchCollaborators])

  // Filtrage et tri des rendez-vous
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = appointments

    // Filtre par recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(apt => {
        // Cast pour accéder aux données enrichies si elles existent
        const aptWithDetails = apt as any
        
        // Utiliser les données enrichies de l'API si disponibles, sinon fallback sur les stores
        const animalName = aptWithDetails.animal?.name || animals.find(a => a.id === apt.animal_id)?.name || ''
        const ownerName = aptWithDetails.animal?.owner 
          ? `${aptWithDetails.animal.owner.first_name} ${aptWithDetails.animal.owner.last_name}`
          : (() => {
              const animal = animals.find(a => a.id === apt.animal_id)
              const owner = animal ? owners.find(o => o.id === animal.owner_id) : null
              return owner ? `${owner.first_name} ${owner.last_name}` : ''
            })()
        
        if (searchFilter === 'animal' || searchFilter === 'all') {
          if (animalName.toLowerCase().includes(query)) return true
        }
        
        if (searchFilter === 'owner' || searchFilter === 'all') {
          if (ownerName.toLowerCase().includes(query)) return true
        }
        
        if (searchFilter === 'all' && apt.title?.toLowerCase().includes(query)) {
          return true
        }
        
        return false
      })
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Filtre par vétérinaire
    if (vetFilter !== 'all') {
      filtered = filtered.filter(apt => apt.veterinarian_id === vetFilter)
    }

    // Filtre par date
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointment_date)
        switch (dateFilter) {
          case 'today':
            return aptDate >= today && aptDate < tomorrow
          case 'tomorrow':
            return aptDate >= tomorrow && aptDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          case 'this_week':
            return aptDate >= today && aptDate < nextWeek
          case 'past':
            return aptDate < today
          case 'future':
            return aptDate >= today
          default:
            return true
        }
      })
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.appointment_date)
          bValue = new Date(b.appointment_date)
          break
        case 'animal':
          const animalA = animals.find(animal => animal.id === a.animal_id)
          const animalB = animals.find(animal => animal.id === b.animal_id)
          aValue = animalA?.name || ''
          bValue = animalB?.name || ''
          break
        case 'owner':
          const animalA2 = animals.find(animal => animal.id === a.animal_id)
          const animalB2 = animals.find(animal => animal.id === b.animal_id)
          const ownerA = animalA2 ? owners.find(owner => owner.id === animalA2.owner_id) : null
          const ownerB = animalB2 ? owners.find(owner => owner.id === animalB2.owner_id) : null
          aValue = ownerA ? `${ownerA.first_name} ${ownerA.last_name}` : ''
          bValue = ownerB ? `${ownerB.first_name} ${ownerB.last_name}` : ''
          break
        case 'vet':
          const vetA = collaborators.find(collab => collab.id === a.veterinarian_id)
          const vetB = collaborators.find(collab => collab.id === b.veterinarian_id)
          aValue = vetA ? `${vetA.first_name} ${vetA.last_name}` : ''
          bValue = vetB ? `${vetB.first_name} ${vetB.last_name}` : ''
          break
        default:
          aValue = new Date(a.appointment_date)
          bValue = new Date(b.appointment_date)
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [appointments, animals, owners, collaborators, searchQuery, searchFilter, statusFilter, vetFilter, dateFilter, sortBy, sortOrder])

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId)
      
      // Rafraîchir les données pour obtenir les informations enrichies
      if (clinic?.id) {
        await fetchAppointments(clinic.id)
      }
      
      setShowDeleteConfirm(false)
      setShowDetailsModal(false)
      toast.success('Rendez-vous supprimé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la suppression du rendez-vous')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Fonctions pour gérer les actions des boutons
  const handleShowSummary = (appointment: AppointmentWithDetails) => {
    if (onShowSummary) {
      onShowSummary(appointment)
    } else {
      setSelectedAppointment(appointment)
      setShowSummaryModal(true)
    }
  }

  const handleGenerateInvoice = async (appointment: AppointmentWithDetails) => {
    if (onShowInvoice) {
      onShowInvoice(appointment)
    } else {
      setSelectedAppointment(appointment)
      // Utiliser les données de facture incluses dans le rendez-vous
      if (appointment.invoice) {
        setExistingInvoice(appointment.invoice as unknown as Invoice)
        setShowEditInvoiceModal(true)
      } else {
        setExistingInvoice(null)
        setShowCreateInvoiceModal(true)
      }
    }
  }

  const handleShowFiles = (appointment: AppointmentWithDetails) => {
    if (onShowFiles) {
      onShowFiles(appointment)
    } else {
      setSelectedAppointment(appointment)
      setShowFilesModal(true)
    }
  }

  const handleEditAppointment = (appointment: AppointmentWithDetails) => {
    if (onEditAppointment) {
      onEditAppointment(appointment)
    } else {
      // Ouvrir la modale de modification
      setSelectedAppointment(appointment)
      setShowEditModal(true)
    }
  }

  // Fonctions utilitaires pour les vétérinaires
  const getVetName = (vetId: string) => {
    const vet = collaborators.find(c => c.id === vetId)
    if (vet) {
      const firstName = vet.first_name || ''
      const lastName = vet.last_name || ''
      return `${firstName} ${lastName}`.trim() || 'Vétérinaire inconnu'
    }
    return 'Vétérinaire inconnu'
  }

  const getVetColor = (vetId: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    ]
    const index = collaborators.findIndex(c => c.id === vetId)
    return colors[index % colors.length] || colors[0]
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Liste des rendez-vous
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gérez et recherchez tous vos rendez-vous
        </p>
      </div>

      {/* Filtres et recherche */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Recherche */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchInput
                    placeholder="Rechercher un animal ou un propriétaire..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                <select
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value as 'all' | 'animal' | 'owner')}
                  className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">Tout</option>
                  <option value="animal">Animal</option>
                  <option value="owner">Propriétaire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'scheduled', label: 'Planifié' },
                { value: 'confirmed', label: 'Confirmé' },
                { value: 'in_progress', label: 'En cours' },
                { value: 'completed', label: 'Terminé' },
                { value: 'cancelled', label: 'Annulé' },
                { value: 'no_show', label: 'Absent' }
              ]}
              placeholder="Statut"
            />

            <Select
              value={vetFilter}
              onChange={handleVetFilterChange}
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
              placeholder="Vétérinaire"
            />

            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              options={[
                { value: 'all', label: 'Toutes les dates' },
                { value: 'today', label: 'Aujourd\'hui' },
                { value: 'tomorrow', label: 'Demain' },
                { value: 'this_week', label: 'Cette semaine' },
                { value: 'past', label: 'Passés' },
                { value: 'future', label: 'À venir' }
              ]}
              placeholder="Date"
            />

            <div className="flex gap-2">
              <Select
                value={sortBy}
                onChange={handleSortByChange}
                options={[
                  { value: 'date', label: 'Date' },
                  { value: 'animal', label: 'Animal' },
                  { value: 'owner', label: 'Propriétaire' },
                  { value: 'vet', label: 'Vétérinaire' }
                ]}
                placeholder="Trier par"
              />
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Résultats */}
          {searchQuery || statusFilter !== 'all' || vetFilter !== 'all' || dateFilter !== 'all' ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredAndSortedAppointments.length} rendez-vous trouvé{filteredAndSortedAppointments.length > 1 ? 's' : ''}
            </div>
          ) : null}
        </div>
      </Card>

      {/* Liste des rendez-vous */}
      <div className="space-y-3">
        {isLoadingData ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-12 w-12 border-3 border-blue-500 border-t-transparent rounded-full"></div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white">Chargement des rendez-vous...</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Récupération des données</p>
              </div>
            </div>
          </div>
        ) : filteredAndSortedAppointments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {appointments.length === 0 ? 'Aucun rendez-vous trouvé' : 'Aucun rendez-vous ne correspond aux critères de recherche'}
            </p>
          </Card>
        ) : (
          filteredAndSortedAppointments.map((appointment) => {
            // Cast pour accéder aux données enrichies si elles existent
            const aptWithDetails = appointment as AppointmentWithDetails
            
            // Utiliser les données enrichies de l'API si disponibles, sinon fallback sur les stores
            const animalName = aptWithDetails.animal?.name || animals.find(a => a.id === appointment.animal_id)?.name || 'Animal inconnu'
            const ownerName = aptWithDetails.animal?.owner 
              ? `${aptWithDetails.animal.owner.first_name || ''} ${aptWithDetails.animal.owner.last_name || ''}`.trim()
              : (() => {
                  const animal = animals.find(a => a.id === appointment.animal_id)
                  const owner = animal ? owners.find(o => o.id === animal.owner_id) : null
                  return owner ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() : 'Propriétaire inconnu'
                })()

            return (
              <div key={appointment.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Date et heure */}
                <div className="flex-shrink-0 text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Date(appointment.appointment_date).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit'
                    })}
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

                {/* Actions - Identiques au Dashboard */}
                <div className="flex-shrink-0 flex gap-2">
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
                    <Tooltip content="Modifier le rendez-vous">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={(e) => {
                          if (e) {
                            e.preventDefault()
                            e.stopPropagation()
                          }
                          handleEditAppointment(aptWithDetails)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modale de résumé enrichi */}
      <Dialog isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} className="w-[96vw] max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Résumé du rendez-vous
            </h3>
          </div>
          
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Informations de base */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informations du rendez-vous
                </h4>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Titre :</span>
                    <span>{selectedAppointment.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Date :</span>
                    <span>
                      {new Date(selectedAppointment.appointment_date).toLocaleString('fr-FR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Durée :</span>
                    <span>{selectedAppointment.duration_minutes || 30} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Type :</span>
                    <span className="capitalize">{selectedAppointment.appointment_type?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Priorité :</span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      selectedAppointment.priority === 'urgent' ? "bg-red-100 text-red-700" :
                      selectedAppointment.priority === 'high' ? "bg-orange-100 text-orange-700" :
                      selectedAppointment.priority === 'normal' ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {selectedAppointment.priority === 'urgent' ? 'Urgente' :
                       selectedAppointment.priority === 'high' ? 'Haute' :
                       selectedAppointment.priority === 'normal' ? 'Normale' : 'Basse'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Statut :</span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      selectedAppointment.status === 'completed' ? "bg-green-100 text-green-700" :
                      selectedAppointment.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                      selectedAppointment.status === 'confirmed' ? "bg-yellow-100 text-yellow-700" :
                      selectedAppointment.status === 'cancelled' ? "bg-red-100 text-red-700" :
                      selectedAppointment.status === 'no_show' ? "bg-gray-100 text-gray-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {selectedAppointment.status === 'completed' ? 'Terminé' :
                       selectedAppointment.status === 'in_progress' ? 'En cours' :
                       selectedAppointment.status === 'confirmed' ? 'Confirmé' :
                       selectedAppointment.status === 'cancelled' ? 'Annulé' :
                       selectedAppointment.status === 'no_show' ? 'Absent' : 'Planifié'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Animal et propriétaire */}
              {selectedAppointment.animal && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <PawPrint className="w-5 h-5" />
                    Informations du patient
                  </h4>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Nom :</span>
                      <span>{selectedAppointment.animal.name}</span>
                    </div>
                    {selectedAppointment.animal.species && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Espèce :</span>
                        <span className="capitalize">{selectedAppointment.animal.species}</span>
                      </div>
                    )}
                    {selectedAppointment.animal.breed && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Race :</span>
                        <span>{selectedAppointment.animal.breed}</span>
                      </div>
                    )}
                    {selectedAppointment.animal.owner && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Propriétaire :</span>
                          <span>
                            {selectedAppointment.animal.owner.first_name} {selectedAppointment.animal.owner.last_name}
                          </span>
                        </div>
                        {selectedAppointment.animal.owner.email && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Email :</span>
                            <span className="text-blue-600">{selectedAppointment.animal.owner.email}</span>
                          </div>
                        )}
                        {selectedAppointment.animal.owner.phone && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Téléphone :</span>
                            <span className="text-blue-600">{selectedAppointment.animal.owner.phone}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Vétérinaire */}
              {selectedAppointment.veterinarian ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Vétérinaire assigné
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Nom :</span>
                      <span>
                        {selectedAppointment.veterinarian.first_name} {selectedAppointment.veterinarian.last_name}
                      </span>
                    </div>
                    {selectedAppointment.veterinarian.role && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Rôle :</span>
                        <span className="capitalize">{selectedAppointment.veterinarian.role}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Vétérinaire assigné
                  </h4>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Vétérinaire non assigné ou données manquantes</p>
                    <p className="text-xs mt-1">ID: {selectedAppointment.veterinarian_id}</p>
                  </div>
                </div>
              )}

              {/* Facture */}
              {selectedAppointment.invoice && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Facture
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Numéro :</span>
                      <span className="font-mono">{selectedAppointment.invoice.invoice_number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Montant :</span>
                      <span className="font-medium">{Number(selectedAppointment.invoice.total_amount).toFixed(2)} €</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Statut :</span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        selectedAppointment.invoice.payment_status === 'paid' 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      )}>
                        {selectedAppointment.invoice.payment_status === 'paid' ? 'Payée' : 'En attente'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fichiers */}
              {selectedAppointment.files && selectedAppointment.files.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Paperclip className="w-5 h-5" />
                    Documents attachés
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Nombre :</span>
                      <span>{selectedAppointment.files.length} document{selectedAppointment.files.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Dernier upload :</span>
                      <span>{new Date(selectedAppointment.files[0].uploaded_at || '').toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes du rendez-vous
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Notes internes */}
              {selectedAppointment.internal_notes && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes internes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selectedAppointment.internal_notes}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Modale de résumé */}
      {showSummaryModal && selectedAppointment && (
        <AppointmentSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          appointment={selectedAppointment}
        />
      )}

      {/* Modale de fichiers */}
      {showFilesModal && selectedAppointment && (
        <Dialog isOpen={showFilesModal} onClose={() => setShowFilesModal(false)} className="w-[96vw] max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Documents du rendez-vous</h3>
            </div>
            
            <FileUpload
              appointmentId={selectedAppointment.id}
            />
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setShowFilesModal(false)}>
                Fermer
                </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Modales de facturation page-level */}
      {showCreateInvoiceModal && selectedAppointment && (
        <InvoiceFormModal
          isOpen={showCreateInvoiceModal}
          onClose={() => {
            setShowCreateInvoiceModal(false)
            setSelectedAppointment(null)
          }}
          appointment={selectedAppointment}
          onInvoiceCreated={async () => {
            if (clinic?.id) {
              await fetchAppointments(clinic.id)
            }
            setShowCreateInvoiceModal(false)
            setSelectedAppointment(null)
          }}
        />
      )}

      {showEditInvoiceModal && existingInvoice && (
        <InvoiceEditModal
          isOpen={showEditInvoiceModal}
          onClose={() => {
            setShowEditInvoiceModal(false)
            setExistingInvoice(null)
          }}
          invoice={existingInvoice}
          onUpdate={async () => {
            if (clinic?.id) {
              await fetchAppointments(clinic.id)
            }
            setShowEditInvoiceModal(false)
            setExistingInvoice(null)
          }}
        />
      )}

      {/* Modale de modification d'appointment */}
      {showEditModal && selectedAppointment && (
        <AppointmentFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedAppointment(null)
          }}
          mode="edit"
          appointment={selectedAppointment}
          onSuccess={async () => {
            if (clinic?.id) {
              await fetchAppointments(clinic.id)
            }
            setShowEditModal(false)
            setSelectedAppointment(null)
            toast.success('Rendez-vous modifié avec succès')
          }}
        />
      )}

      {/* Modale de confirmation de suppression */}
      <Dialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="w-[96vw] max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Confirmer la suppression
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedAppointment) {
                  handleDeleteAppointment(selectedAppointment.id)
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default AppointmentsList
