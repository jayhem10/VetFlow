'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'

import { OwnerSearchInput } from '@/components/molecules/OwnerSearchInput'
import { AnimalsService } from '@/services/animals.service'
import type { Owner } from '@/types/owner.types'
import { toast } from '@/lib/toast'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Dialog from '@/components/atoms/Dialog'
import SearchInput from '@/components/atoms/SearchInput'
import { useAppointmentStore } from '@/stores/useAppointmentStore'
import { useOwnerStore } from '@/stores/useOwnerStore'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import { useClinic } from '@/modules/clinic/hooks/use-clinic'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { appointmentSchema, type AppointmentFormData } from '@/schemas/appointment.schema'
import { type AppointmentWithDetails } from '@/types/appointment.types'
import AppointmentDetails from '@/components/molecules/AppointmentDetails'
import { EditButton } from '@/components/atoms/EditButton'

interface AppointmentSchedulerProps {
  defaultView?: 'timeGridWeek' | 'timeGridDay' | 'dayGridMonth'
}

export function AppointmentScheduler({ defaultView = 'timeGridWeek' }: AppointmentSchedulerProps) {
  const { clinic } = useClinic()
  const { appointments, fetchAppointments, createAppointment, updateAppointment, deleteAppointment, loading } = useAppointmentStore()
  const { animals, fetchAnimals } = useAnimalStore()
  const { owners, fetchOwners } = useOwnerStore()
  const { collaborators, fetchCollaborators } = useCollaboratorsStore()

  const calendarRef = useRef<FullCalendar | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [ownerAnimals, setOwnerAnimals] = useState<typeof animals>([])
  const [selectedVets, setSelectedVets] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Nouveaux états pour la recherche
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilter, setSearchFilter] = useState<'all' | 'animal' | 'owner'>('all')
  
  // Nouvel état pour afficher les détails
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null)
  
  // États de chargement
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false)
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false)
  
  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = date.getFullYear()
    const mm = pad(date.getMonth() + 1)
    const dd = pad(date.getDate())
    const hh = pad(date.getHours())
    const mi = pad(date.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      appointment_type: 'consultation',
      priority: 'normal',
      duration_minutes: 30,
      status: 'scheduled',
    },
  })

  useEffect(() => {
    if (!clinic?.id) return
    
    const loadData = async () => {
      setIsLoadingAppointments(true)
      setIsLoadingCollaborators(true)
      
      try {
        await Promise.all([
          fetchAppointments(clinic.id),
          fetchAnimals(1, 25),
          fetchOwners(),
          fetchCollaborators()
        ])
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        toast.error('Erreur lors du chargement des données')
      } finally {
        setIsLoadingAppointments(false)
        setIsLoadingCollaborators(false)
      }
    }
    
    loadData()
  }, [clinic?.id, fetchAppointments, fetchAnimals, fetchOwners, fetchCollaborators])

  // Forcer la mise à jour du calendrier quand les collaborateurs changent (pour les couleurs)
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents()
    }
  }, [collaborators])

  // Forcer la mise à jour du calendrier quand les appointments changent
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents()
    }
  }, [appointments])

  const colorForVet = (vetId?: string, appointmentData?: any) => {
    if (!vetId) return 'emerald'
    
    // Priorité 1: Utiliser la couleur depuis les données enrichies de l'API
    if (appointmentData?.veterinarian?.calendar_color) {
      return appointmentData.veterinarian.calendar_color
    }
    
    // Priorité 2: Chercher le vétérinaire dans les collaborateurs pour obtenir sa couleur personnalisée
    const vet = collaborators.find(c => c.id === vetId)
    if (vet?.calendar_color) {
      return vet.calendar_color
    }
    
    // Fallback sur le calcul par hash si pas de couleur personnalisée
    const hues = ['emerald', 'blue', 'purple', 'rose', 'amber', 'lime', 'cyan', 'fuchsia', 'indigo', 'teal']
    let hash = 0
    for (let i = 0; i < vetId.length; i++) hash = (hash * 31 + vetId.charCodeAt(i)) >>> 0
    return hues[hash % hues.length]
  }

  // Fonction pour obtenir les styles CSS selon la couleur
  const getVetStyles = (color: string) => {
    const colorMap: Record<string, any> = {
      emerald: {
        bg: 'rgb(236 253 245)',
        bgDark: 'rgba(6 78 59, 0.1)',
        border: 'rgb(16 185 129)',
        borderDark: 'rgb(6 78 59)',
        text: 'rgb(21 128 61)',
        textDark: 'rgb(167 243 208)',
        accent: 'rgb(16 185 129)',
        accentDark: 'rgb(5 150 105)'
      },
      blue: {
        bg: 'rgb(239 246 255)',
        bgDark: 'rgba(30 58 138, 0.1)',
        border: 'rgb(59 130 246)',
        borderDark: 'rgb(30 58 138)',
        text: 'rgb(30 64 175)',
        textDark: 'rgb(191 219 254)',
        accent: 'rgb(59 130 246)',
        accentDark: 'rgb(37 99 235)'
      },
      purple: {
        bg: 'rgb(250 245 255)',
        bgDark: 'rgba(88 28 135, 0.1)',
        border: 'rgb(147 51 234)',
        borderDark: 'rgb(88 28 135)',
        text: 'rgb(107 33 168)',
        textDark: 'rgb(233 213 255)',
        accent: 'rgb(147 51 234)',
        accentDark: 'rgb(126 34 206)'
      },
      rose: {
        bg: 'rgb(255 241 242)',
        bgDark: 'rgba(159 18 57, 0.1)',
        border: 'rgb(244 63 94)',
        borderDark: 'rgb(159 18 57)',
        text: 'rgb(190 18 60)',
        textDark: 'rgb(255 205 210)',
        accent: 'rgb(244 63 94)',
        accentDark: 'rgb(225 29 72)'
      },
      amber: {
        bg: 'rgb(255 251 235)',
        bgDark: 'rgba(146 64 14, 0.1)',
        border: 'rgb(245 158 11)',
        borderDark: 'rgb(146 64 14)',
        text: 'rgb(161 98 7)',
        textDark: 'rgb(254 243 199)',
        accent: 'rgb(245 158 11)',
        accentDark: 'rgb(217 119 6)'
      },
      lime: {
        bg: 'rgb(247 254 231)',
        bgDark: 'rgba(77 124 15, 0.1)',
        border: 'rgb(132 204 22)',
        borderDark: 'rgb(77 124 15)',
        text: 'rgb(77 124 15)',
        textDark: 'rgb(236 252 203)',
        accent: 'rgb(132 204 22)',
        accentDark: 'rgb(101 163 13)'
      },
      cyan: {
        bg: 'rgb(236 254 255)',
        bgDark: 'rgba(21 94 117, 0.1)',
        border: 'rgb(34 211 238)',
        borderDark: 'rgb(21 94 117)',
        text: 'rgb(14 116 144)',
        textDark: 'rgb(207 250 254)',
        accent: 'rgb(34 211 238)',
        accentDark: 'rgb(8 145 178)'
      },
      fuchsia: {
        bg: 'rgb(253 244 255)',
        bgDark: 'rgba(134 25 143, 0.1)',
        border: 'rgb(217 70 239)',
        borderDark: 'rgb(134 25 143)',
        text: 'rgb(134 25 143)',
        textDark: 'rgb(250 232 255)',
        accent: 'rgb(217 70 239)',
        accentDark: 'rgb(192 38 211)'
      },
      indigo: {
        bg: 'rgb(238 242 255)',
        bgDark: 'rgba(67 56 202, 0.1)',
        border: 'rgb(99 102 241)',
        borderDark: 'rgb(67 56 202)',
        text: 'rgb(67 56 202)',
        textDark: 'rgb(224 231 255)',
        accent: 'rgb(99 102 241)',
        accentDark: 'rgb(79 70 229)'
      },
      teal: {
        bg: 'rgb(240 253 250)',
        bgDark: 'rgba(19 78 74, 0.1)',
        border: 'rgb(20 184 166)',
        borderDark: 'rgb(19 78 74)',
        text: 'rgb(15 118 110)',
        textDark: 'rgb(204 251 241)',
        accent: 'rgb(20 184 166)',
        accentDark: 'rgb(13 148 136)'
      }
    }
    return colorMap[color] || colorMap.emerald
  }

  // Fonction de filtrage des rendez-vous par recherche
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments

    const query = searchQuery.toLowerCase().trim()
    
    return appointments.filter(apt => {
      // Cast pour accéder aux données enrichies si elles existent
      const aptWithDetails = apt as AppointmentWithDetails
      
      // Utiliser les données enrichies de l'API si disponibles, sinon fallback sur les stores
      const animalName = aptWithDetails.animal?.name || animals.find(a => a.id === apt.animal_id)?.name || ''
      const ownerName = aptWithDetails.animal?.owner 
        ? `${aptWithDetails.animal.owner.first_name} ${aptWithDetails.animal.owner.last_name}`
        : (() => {
            const animal = animals.find(a => a.id === apt.animal_id)
            const owner = animal ? owners.find(o => o.id === animal.owner_id) : null
            return owner ? `${owner.first_name} ${owner.last_name}` : ''
          })()
      
      // Recherche par nom d'animal
      if (searchFilter === 'animal' || searchFilter === 'all') {
        if (animalName.toLowerCase().includes(query)) {
          return true
        }
      }
      
      // Recherche par nom de propriétaire
      if (searchFilter === 'owner' || searchFilter === 'all') {
        if (ownerName.toLowerCase().includes(query)) {
          return true
        }
      }
      
      // Recherche par titre du rendez-vous
      if (searchFilter === 'all' && apt.title?.toLowerCase().includes(query)) {
        return true
      }
      
      return false
    })
  }, [appointments, animals, owners, searchQuery, searchFilter])

  const events = useMemo(() => {
    let filteredEvents = filteredAppointments
    
    // Filtrer par vétérinaires sélectionnés
    if (selectedVets.length > 0) {
      filteredEvents = filteredEvents.filter(apt => selectedVets.includes(apt.veterinarian_id))
    }
    
    return filteredEvents.map((apt) => {
      const hue = colorForVet(apt.veterinarian_id, apt)
      const vetStyles = getVetStyles(hue)
      
      // Cast pour accéder aux données enrichies si elles existent
      const aptWithDetails = apt as AppointmentWithDetails
      
      // Utiliser les données enrichies de l'API si disponibles, sinon fallback sur les stores
      const animalName = aptWithDetails.animal?.name || animals.find(a => a.id === apt.animal_id)?.name || 'Animal inconnu'
      const ownerName = aptWithDetails.animal?.owner 
        ? `${aptWithDetails.animal.owner.first_name} ${aptWithDetails.animal.owner.last_name}`
        : (() => {
            const animal = animals.find(a => a.id === apt.animal_id)
            const owner = animal ? owners.find(o => o.id === animal.owner_id) : null
            return owner ? `${owner.first_name} ${owner.last_name}` : 'Propriétaire inconnu'
          })()
      
      // Titre enrichi avec animal et propriétaire
      const enrichedTitle = animalName
      
      // Données étendues pour l'info-bulle
      const extendedData = {
        animal: animalName,
        owner: ownerName,
        duration: `${apt.duration_minutes || 30} min`,
        type: apt.appointment_type || 'consultation',
        title: apt.title,
        description: apt.description
      }
      
      return {
        id: apt.id,
        title: enrichedTitle,
        start: apt.appointment_date,
        end: new Date(new Date(apt.appointment_date).getTime() + (apt.duration_minutes ?? 30) * 60000).toISOString(),
        extendedProps: { ...apt, extendedData, durationMinutes: apt.duration_minutes ?? 30, ownerName },
        backgroundColor: vetStyles.bg,
        borderColor: vetStyles.accent,
        textColor: '#111827',
        classNames: ['rounded-md', 'border'],
      }
    })
  }, [filteredAppointments, animals, owners, selectedVets])

  const renderEventContent = useCallback((arg: any) => {
    const ext = arg.event.extendedProps?.extendedData || {}
    const duration = arg.event.extendedProps?.durationMinutes || 30
    const ownerName = arg.event.extendedProps?.ownerName || ''
    const start = arg.timeText || ''
    const viewType = (calendarRef.current as any)?.getApi()?.view?.type || ''
    const isTimeGrid = viewType.includes('timeGrid')
    
    const container = document.createElement('div')
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.gap = '2px'
    container.style.padding = '2px 4px'
    container.style.overflow = 'hidden'
    container.style.maxHeight = '100%'

    if (isTimeGrid) {
      // Vue semaine/jour : contenu compact
      const line1 = document.createElement('div')
      line1.style.display = 'flex'
      line1.style.alignItems = 'center'
      line1.style.justifyContent = 'space-between'
      line1.style.fontSize = '10px'
      line1.style.fontWeight = '600'
      const left = document.createElement('span')
      left.textContent = start
      const right = document.createElement('span')
      right.style.opacity = '0.8'
      right.textContent = ext.type ? String(ext.type).substring(0, 3) : ''
      line1.appendChild(left)
      line1.appendChild(right)

      const line2 = document.createElement('div')
      line2.style.fontSize = '11px'
      line2.style.fontWeight = '700'
      line2.style.whiteSpace = 'nowrap'
      line2.style.overflow = 'hidden'
      line2.style.textOverflow = 'ellipsis'
      line2.textContent = String(arg.event.title || '')

      container.appendChild(line1)
      container.appendChild(line2)
      
      // Ajouter la 3ème ligne seulement si l'événement est assez long (>= 45 min)
      if (duration >= 45 && (ownerName || ext.owner)) {
        const line3 = document.createElement('div')
        line3.style.fontSize = '9px'
        line3.style.opacity = '0.9'
        line3.style.whiteSpace = 'nowrap'
        line3.style.overflow = 'hidden'
        line3.style.textOverflow = 'ellipsis'
        line3.textContent = (ownerName || ext.owner || '').substring(0, 15)
        container.appendChild(line3)
      }
    } else {
      // Vue mois : contenu complet
      const line1 = document.createElement('div')
      line1.style.display = 'flex'
      line1.style.alignItems = 'center'
      line1.style.justifyContent = 'space-between'
      line1.style.fontSize = '11px'
      line1.style.fontWeight = '600'
      const left = document.createElement('span')
      left.textContent = start
      const right = document.createElement('span')
      right.style.opacity = '0.8'
      right.textContent = ext.type ? String(ext.type) : ''
      line1.appendChild(left)
      line1.appendChild(right)

      const line2 = document.createElement('div')
      line2.style.fontSize = '12px'
      line2.style.fontWeight = '700'
      line2.style.whiteSpace = 'nowrap'
      line2.style.overflow = 'hidden'
      line2.style.textOverflow = 'ellipsis'
      line2.textContent = String(arg.event.title || '')

      const line3 = document.createElement('div')
      line3.style.fontSize = '11px'
      line3.style.opacity = '0.9'
      line3.style.whiteSpace = 'nowrap'
      line3.style.overflow = 'hidden'
      line3.style.textOverflow = 'ellipsis'
      line3.textContent = ownerName || (ext.owner ? String(ext.owner) : '')

      container.appendChild(line1)
      container.appendChild(line2)
      if (ownerName || ext.owner) container.appendChild(line3)
    }

    return { domNodes: [container] }
  }, [])

  const watched = form.watch()
  const canSubmit = Boolean(
    watched?.animal_id &&
    watched?.veterinarian_id &&
    watched?.title && watched.title.trim().length > 0 &&
    watched?.appointment_date && watched.appointment_date.trim().length > 0
  )

  // Obtenir la couleur du vétérinaire sélectionné
  const selectedVetColor = colorForVet(watched?.veterinarian_id)
  const vetStyles = getVetStyles(selectedVetColor)

  const handleDateSelect = (selection: any) => {
    setSelectedSlot({ start: selection.start, end: selection.end })
    setDialogMode('create')
    setEditingId(null)
    // Préremplir la date
    const appointment_date = formatDateTimeLocal(selection.start as Date)
    form.reset({
      title: '',
      appointment_date,
      duration_minutes: Math.max(15, Math.round((selection.end.getTime() - selection.start.getTime()) / 60000)),
      appointment_type: 'consultation',
      priority: 'normal',
      status: 'scheduled',
    })
    setIsDialogOpen(true)
  }

  const handleEventClick = (info: any) => {
    const apt = appointments.find(a => a.id === info.event.id)
    if (apt) {
      // Afficher d'abord les détails
      setSelectedAppointment(apt)
      setShowDetailsModal(true)
    }
  }

  const handleEditAppointment = (apt: any) => {
    setEditingId(apt.id)
    setDialogMode('edit')
    
    // Trouver l'animal et le propriétaire pour pré-remplir
    const animal = animals.find(a => a.id === apt.animal_id)
    const owner = animal ? owners.find(o => o.id === animal.owner_id) : null
    
    setSelectedOwner(owner || null)
    if (owner) {
      AnimalsService.getByOwner(owner.id).then(list => {
        setOwnerAnimals(list)
      })
    }
    
    form.reset({
      animal_id: apt.animal_id,
      veterinarian_id: apt.veterinarian_id,
      title: apt.title,
      description: apt.description,
      appointment_date: formatDateTimeLocal(new Date(apt.appointment_date)),
      duration_minutes: apt.duration_minutes ?? 30,
      appointment_type: apt.appointment_type ?? 'consultation',
      priority: apt.priority ?? 'normal',
      status: apt.status ?? 'scheduled',
      notes: apt.notes,
      internal_notes: apt.internal_notes,
    })
    
    setShowDetailsModal(false)
    setIsDialogOpen(true)
  }

  const handleVetToggle = (vetId: string) => {
    setSelectedVets(prev => {
      if (prev.includes(vetId)) {
        // Retirer le vétérinaire
        const newSelection = prev.filter(id => id !== vetId)
        return newSelection
      } else {
        // Ajouter le vétérinaire
        return [...prev, vetId]
      }
    })
  }

  const handleShowAllVets = () => {
    setSelectedVets([])
  }

  // Fonction pour réinitialiser la recherche
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchFilter('all')
  }

  const handleSubmit = async (data: AppointmentFormData) => {
    try {
      // Vérifier la dispo
      const available = await useAppointmentStore.getState().checkAvailability(
        clinic?.id || '',
        data.veterinarian_id,
        data.appointment_date,
        data.duration_minutes || 30,
        editingId || undefined,
      )
      if (!available) {
        toast.error('Ce créneau n\'est pas disponible pour ce vétérinaire')
        return
      }

      if (dialogMode === 'create') {
        await createAppointment(data as any)
        toast.success('Rendez-vous créé avec succès')
      } else if (editingId) {
        await updateAppointment(editingId, data as any)
        toast.success('Rendez-vous modifié avec succès')
      }
      
      // Rafraîchir les données pour obtenir les informations enrichies
      if (clinic?.id) {
        await fetchAppointments(clinic.id)
      }
      
      setIsDialogOpen(false)
    } catch (e) {
      toast.error((e as Error).message || 'Erreur lors de l\'enregistrement du rendez-vous')
    }
  }

  // Drag & drop: mise à jour de la date
  const handleEventDrop = async (info: any) => {
    try {
      const newStart = info.event.start
      const durationMin = info.event.extendedProps?.duration_minutes ??
        Math.max(15, Math.round(((info.event.end?.getTime() || newStart.getTime()) - newStart.getTime()) / 60000))
      const ok = await useAppointmentStore.getState().checkAvailability(
        clinic?.id || '',
        info.event.extendedProps?.veterinarian_id,
        newStart.toISOString(),
        durationMin,
        info.event.id,
      )
      if (!ok) {
        info.revert()
        toast.error('Ce créneau n\'est pas disponible pour ce vétérinaire')
        return
      }
      await updateAppointment(info.event.id, {
        appointment_date: newStart.toISOString(),
        duration_minutes: durationMin,
      } as any)
      
      // Rafraîchir les données pour obtenir les informations enrichies
      if (clinic?.id) {
        await fetchAppointments(clinic.id)
      }
      
      toast.success('Rendez-vous déplacé avec succès')
    } catch (e) {
      info.revert()
      toast.error((e as Error).message || 'Erreur lors du déplacement du rendez-vous')
    }
  }

  // Redimensionnement: mise à jour de la durée
  const handleEventResize = async (info: any) => {
    try {
      const newStart = info.event.start
      const newEnd = info.event.end
      const durationMin = Math.max(15, Math.round((newEnd.getTime() - newStart.getTime()) / 60000))
      
      const ok = await useAppointmentStore.getState().checkAvailability(
        clinic?.id || '',
        info.event.extendedProps?.veterinarian_id,
        newStart.toISOString(),
        durationMin,
        info.event.id,
      )
      if (!ok) {
        info.revert()
        toast.error('Ce créneau n\'est pas disponible pour ce vétérinaire')
        return
      }
      
      await updateAppointment(info.event.id, {
        appointment_date: newStart.toISOString(),
        duration_minutes: durationMin,
      } as any)
      
      // Rafraîchir les données pour obtenir les informations enrichies
      if (clinic?.id) {
        await fetchAppointments(clinic.id)
      }
      
      toast.success('Durée du rendez-vous modifiée avec succès')
    } catch (e) {
      info.revert()
      toast.error((e as Error).message || 'Erreur lors de la modification de la durée')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Planifier des rendez-vous</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pour vous ou un collaborateur</p>
          </div>
          
          {/* Actions et recherche - Mobile first */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchInput 
                    placeholder="Rechercher un animal ou un propriétaire..." 
                    value={searchQuery} 
                    onChange={setSearchQuery}
                    onClear={handleClearSearch}
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
              {searchQuery && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {filteredAppointments.length} rendez-vous trouvé{filteredAppointments.length > 1 ? 's' : ''}
                  {searchFilter !== 'all' && ` (filtre: ${searchFilter === 'animal' ? 'animal' : 'propriétaire'})`}
                </div>
              )}
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="whitespace-nowrap">
              ➕ Nouveau RDV
            </Button>
          </div>
        </div>
      </Card>

      {/* Filtrage par collaborateurs */}
      <Card className="p-4 mb-4">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Filtrer par collaborateur
          </h3>
          
          {isLoadingCollaborators ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chargement des collaborateurs...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {collaborators
                .filter(collaborator => {
                  const roles = collaborator.role ? collaborator.role.split(',').map(r => r.trim()) : []
                  return roles.some(role => role === 'vet' || role === 'admin')
                })
                .map((collaborator) => {
                const color = colorForVet(collaborator.id)
                const styles = getVetStyles(color)
                const isSelected = selectedVets.includes(collaborator.id)
                const isActive = selectedVets.length === 0 || isSelected
                
                return (
                  <button
                    key={collaborator.id}
                    onClick={() => handleVetToggle(collaborator.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200
                      ${isSelected 
                        ? 'ring-2 ring-blue-500 ring-offset-2' 
                        : isActive 
                          ? 'opacity-100' 
                          : 'opacity-40'
                      }
                      hover:opacity-100 hover:scale-105
                    `}
                    style={{
                      backgroundColor: styles.bg,
                      borderColor: isSelected ? '#3b82f6' : styles.border,
                      color: styles.text
                    }}
                  >
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: styles.accent }}
                    ></span>
                    <span className="font-medium">{collaborator.first_name} {collaborator.last_name}</span>
                    <span className="text-xs opacity-75">({collaborator.role})</span>
                    {isSelected && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </button>
                )
              })}
              {selectedVets.length > 0 && (
                <button
                  onClick={handleShowAllVets}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200 hover:scale-105 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  🔄 Voir tous
                </button>
              )}
            </div>
          )}
          
          {selectedVets.length > 0 && !isLoadingCollaborators && (
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              Affichage des rendez-vous pour {selectedVets.length} collaborateur{selectedVets.length > 1 ? 's' : ''} sélectionné{selectedVets.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </Card>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 fc fc-media-screen">
        {isLoadingAppointments ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-12 w-12 border-3 border-blue-500 border-t-transparent rounded-full"></div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white">Chargement du planning...</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Récupération des rendez-vous</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <style jsx>{`
              .fc-event {
                border-radius: 6px !important;
                border-width: 2px !important;
                margin: 1px 0 !important;
                min-height: 28px !important;
                z-index: 1 !important;
              }
              .fc-event-title {
                font-weight: 600 !important;
                text-align: center !important;
                padding: 3px 5px !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                font-size: 0.75rem !important;
                line-height: 1.2 !important;
              }
              .fc-timegrid-event {
                border-radius: 6px !important;
                margin: 1px 2px !important;
                min-height: 24px !important;
                overflow: hidden !important;
              }
              .fc-timegrid-event-harness {
                margin: 1px 0 !important;
              }
              .fc-timegrid-col-events {
                margin: 0 !important;
              }
              .fc-timegrid-event-harness-inset .fc-timegrid-event {
                margin: 0 2px !important;
              }
              .fc-timegrid-event .fc-event-main, 
              .fc-timegrid-event .fc-event-main-frame {
                overflow: hidden !important;
              }
              /* Améliorer la lisibilité quand les événements se chevauchent */
              .fc-timegrid-event.fc-event {
                box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
              }
              /* Réduire l'espacement entre les événements */
              .fc-timegrid-slot-lane {
                padding: 0 !important;
              }
              /* Augmenter légèrement la hauteur des créneaux */
              .fc-timegrid-slot {
                height: 45px !important;
              }
              /* Bandes alternées pour repères visuels */
              .fc-timegrid-slots tr:nth-child(2n) td {
                background-color: rgba(0,0,0,0.015);
              }
              /* Mettre en évidence le jour courant */
              .fc .fc-day-today {
                background-color: rgba(16,185,129,0.08) !important;
              }
              /* Lien +N événements en vue mois */
              .fc-daygrid-more-link {
                font-weight: 600;
              }
            `}</style>
            <FullCalendar
              ref={calendarRef as any}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={defaultView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              allDaySlot={false}
              slotMinTime={'07:00:00'}
              slotMaxTime={'20:00:00'}
              selectable
              selectMirror
              select={handleDateSelect}
              events={events}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              editable
              droppable={false}
              locale={frLocale}
              firstDay={1}
              nowIndicator={true}
              dayMaxEventRows={3}
              expandRows={true}
              slotDuration={'00:30:00'}
              eventOverlap={false}
              eventDisplay={'block'}
              stickyHeaderDates={true}
              eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              moreLinkClick={(arg) => { (calendarRef.current as any)?.getApi().changeView('timeGridDay', arg.date); return 'popover'; }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              weekNumbers={true}
              weekText={'S'}
              eventClassNames={(arg) => arg.event.classNames as string[]}
              eventContent={renderEventContent}
              eventDidMount={(info) => {
                // Appliquer les styles personnalisés aux événements
                const event = info.event
                const backgroundColor = event.backgroundColor
                const borderColor = event.borderColor
                const textColor = event.textColor
                
                if (backgroundColor) {
                  info.el.style.backgroundColor = backgroundColor
                }
                if (borderColor) {
                  info.el.style.borderColor = borderColor
                }
                if (textColor) {
                  info.el.style.color = textColor
                }
                
                // Améliorer l'affichage du contenu
                const titleEl = info.el.querySelector('.fc-event-title') as HTMLElement
                if (titleEl) {
                  titleEl.style.fontSize = '0.75rem'
                  titleEl.style.lineHeight = '1.2'
                  titleEl.style.fontWeight = '600'
                  titleEl.style.textAlign = 'center'
                  titleEl.style.padding = '3px 5px'
                  titleEl.style.whiteSpace = 'nowrap'
                  titleEl.style.overflow = 'hidden'
                  titleEl.style.textOverflow = 'ellipsis'
                  titleEl.style.minHeight = '20px'
                  titleEl.style.display = 'flex'
                  titleEl.style.alignItems = 'center'
                  titleEl.style.justifyContent = 'center'
                }
                
                // Effet hover simple sans info-bulle
                const el = info.el as HTMLElement
                el.style.cursor = 'pointer'
                el.style.transition = 'all 0.2s ease'
                el.style.minHeight = '35px'
                // Title attribute en fallback pour accessibilité
                const ext = (event as any)?.extendedProps?.extendedData
                if (ext) {
                  const tooltip = `${event.title || ''}\n${ext.owner || ''}\n${ext.duration || ''} • ${ext.type || ''}`.trim()
                  if (tooltip) el.setAttribute('title', tooltip)
                }
                
                // Gestionnaires d'événements
                el.addEventListener('mouseenter', () => {
                  el.style.transform = 'scale(1.02)'
                  el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                })
                
                el.addEventListener('mouseleave', () => {
                  el.style.transform = 'scale(1)'
                  el.style.boxShadow = 'none'
                })
              }}
              height="auto"
            />
          </>
        )}
      </div>

      {/* Modale de détails du rendez-vous */}
      <Dialog isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} className="w-[96vw] max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Détails du rendez-vous</h3>
            <div className="flex gap-2">
              <EditButton
                showText={true}
                onClick={() => selectedAppointment && handleEditAppointment(selectedAppointment)}
              />
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedAppointment) {
                    setEditingId(selectedAppointment.id)
                    setShowDetailsModal(false)
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

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="w-[96vw] max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto p-5">
        <h3 id="dialog-title" className="text-lg font-semibold mb-4">
          {dialogMode === 'create' ? 'Nouveau rendez-vous' : 'Modifier le rendez-vous'}
        </h3>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          {form.watch('appointment_date') && (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-800 dark:text-emerald-200">
              {new Date(form.watch('appointment_date')).toLocaleString('fr-FR')}
              {form.watch('duration_minutes') ? ` • ${form.watch('duration_minutes')} min` : ''}
            </div>
          )}
          {/* Propriétaire */}
          <div>
            <OwnerSearchInput
              label="Propriétaire"
              onOwnerSelect={async (owner) => {
                setSelectedOwner(owner)
                form.setValue('animal_id', '')
                if (owner?.id) {
                  const list = await AnimalsService.getByOwner(owner.id)
                  setOwnerAnimals(list)
                } else {
                  setOwnerAnimals([])
                }
              }}
              placeholder="Rechercher un propriétaire..."
            />
          </div>

          {/* Animal (affiché uniquement après sélection propriétaire) */}
          {selectedOwner && (
            <div>
              <label className="block text-sm font-medium mb-1">Animal du propriétaire</label>
              <div className="relative">
                <select
                  className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 pr-10"
                  {...form.register('animal_id')}
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionner...</option>
                  {ownerAnimals.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">🐾</span>
              </div>
              {ownerAnimals.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">Aucun animal trouvé pour ce propriétaire.</p>
              )}
              {form.formState.errors.animal_id && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.animal_id.message}</p>
              )}
            </div>
          )}

          {/* Vétérinaire */}
          <div>
            <label className="block text-sm font-medium mb-1">Vétérinaire</label>
            <div className="relative">
              <select
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 pr-10"
                {...form.register('veterinarian_id')}
                defaultValue=""
              >
                <option value="" disabled>Sélectionner...</option>
                {collaborators
                  .filter(c => {
                    const roles = c.role ? c.role.split(',').map(r => r.trim()) : []
                    return roles.some(role => role === 'vet' || role === 'admin')
                  })
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">👩‍⚕️</span>
            </div>
            {form.formState.errors.veterinarian_id && (
              <p className="text-red-600 text-sm mt-1">{form.formState.errors.veterinarian_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800" {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date et heure</label>
              <input type="datetime-local" className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800" {...form.register('appointment_date')} />
              {form.formState.errors.appointment_date && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.appointment_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Durée (min)</label>
              <input type="number" min={15} step={5} className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800" {...form.register('duration_minutes', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800" {...form.register('appointment_type')}>
                <option value="consultation">Consultation</option>
                <option value="vaccination">Vaccination</option>
                <option value="surgery">Chirurgie</option>
                <option value="checkup">Contrôle</option>
                <option value="emergency">Urgence</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priorité</label>
              <select className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800" {...form.register('priority')}>
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800" rows={4} {...form.register('description')} placeholder="Détails du rendez-vous..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800" {...form.register('status')}>
                <option value="scheduled">Planifié</option>
                <option value="confirmed">Confirmé</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
                <option value="no_show">Absent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes internes</label>
              <textarea className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800" rows={3} {...form.register('internal_notes')} placeholder="Notes privées..." />
            </div>
          </div>

          <div className="flex justify-between">
            {dialogMode === 'edit' && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                🗑️ Supprimer
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={!canSubmit}>
                {dialogMode === 'create' ? 'Créer' : 'Modifier'}
              </Button>
            </div>
          </div>
        </form>
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
              onClick={async () => {
                if (editingId) {
                  try {
                    await deleteAppointment(editingId)
                    setShowDeleteConfirm(false)
                    setIsDialogOpen(false)
                    toast.success('Rendez-vous supprimé avec succès')
                  } catch (e) {
                    toast.error((e as Error).message || 'Erreur lors de la suppression')
                  }
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

export default AppointmentScheduler


