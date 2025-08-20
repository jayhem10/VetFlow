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
import Dialog from '@/components/atoms/Dialog'
import { cn } from '@/lib/utils'
import { EditButton } from '@/components/atoms/EditButton'

interface AppointmentsListProps {
  className?: string
}

export function AppointmentsList({ className }: AppointmentsListProps) {
  const { clinic } = useClinic()
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'scheduled': return 'Planifié'
      case 'confirmed': return 'Confirmé'
      case 'in_progress': return 'En cours'
      case 'completed': return 'Terminé'
      case 'cancelled': return 'Annulé'
      case 'no_show': return 'Absent'
      default: return status
    }
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
            const aptWithDetails = appointment as any
            
            // Utiliser les données enrichies de l'API si disponibles, sinon fallback sur les stores
            const animalName = aptWithDetails.animal?.name || animals.find(a => a.id === appointment.animal_id)?.name || 'Animal inconnu'
            const ownerName = aptWithDetails.animal?.owner 
              ? `${aptWithDetails.animal.owner.first_name || ''} ${aptWithDetails.animal.owner.last_name || ''}`.trim()
              : (() => {
                  const animal = animals.find(a => a.id === appointment.animal_id)
                  const owner = animal ? owners.find(o => o.id === animal.owner_id) : null
                  return owner ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() : 'Propriétaire inconnu'
                })()
            
            // Améliorer la gestion du nom du vétérinaire
            let vetName = 'Vétérinaire inconnu'
            if (aptWithDetails.veterinarian) {
              const firstName = aptWithDetails.veterinarian.first_name || ''
              const lastName = aptWithDetails.veterinarian.last_name || ''
              vetName = `${firstName} ${lastName}`.trim() || 'Vétérinaire inconnu'
            } else if (collaborators.length > 0) {
              const vet = collaborators.find(c => c.id === appointment.veterinarian_id)
              if (vet) {
                const firstName = vet.first_name || ''
                const lastName = vet.last_name || ''
                vetName = `${firstName} ${lastName}`.trim() || 'Vétérinaire inconnu'
              }
            }
            
            // S'assurer que le nom du vétérinaire n'est pas vide ou undefined
            const displayVetName = vetName && vetName !== 'undefined undefined' && vetName !== ' ' ? vetName : 'Vétérinaire inconnu'

            return (
              <div key={appointment.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700" onClick={() => {
                setSelectedAppointment(appointment)
                setShowDetailsModal(true)
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          getStatusColor(appointment.status)
                        )}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {appointment.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(appointment.appointment_date)}
                          {appointment.duration_minutes && ` • ${appointment.duration_minutes} min`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Animal:</span> {animalName}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Propriétaire:</span> {ownerName}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Vétérinaire:</span> {displayVetName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex gap-2">
                      <EditButton
                        showText={true}
                        onClick={() => {
                          // Rediriger vers la page du planning pour modifier
                          window.location.href = '/appointments?edit=' + appointment.id
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowDetailsModal(true)
                        }}
                      >
                        👁️ Détails
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modale de détails */}
      <Dialog isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} className="w-[96vw] max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Détails du rendez-vous</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedAppointment) {
                    // Rediriger vers la page du planning pour modifier
                    window.location.href = '/appointments?edit=' + selectedAppointment.id
                  }
                }}
              >
                ✏️ Modifier
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedAppointment) {
                    setShowDeleteConfirm(true)
                  }
                }}
              >
                🗑️ Supprimer
              </Button>
            </div>
          </div>
          
          {selectedAppointment && (
            <AppointmentDetails appointment={selectedAppointment} />
          )}
          
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Modale de confirmation de suppression */}
      <Dialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="w-[96vw] max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600">
            🗑️ Confirmer la suppression
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
              🗑️ Supprimer définitivement
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default AppointmentsList
