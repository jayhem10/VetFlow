'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { appointmentSchema, type AppointmentFormData } from '@/schemas/appointment.schema'
import { useAppointmentStore } from '@/stores/useAppointmentStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useClinic } from '@/modules/clinic/hooks/use-clinic'
import { toast } from '@/lib/toast'
import Dialog from '@/components/atoms/Dialog'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import { OwnerSearchInput } from '@/components/molecules/OwnerSearchInput'
import { AnimalsService } from '@/services/animals.service'
import type { Owner } from '@/types/owner.types'
import type { Animal } from '@/types/animal.types'
import type { AppointmentWithDetails } from '@/types/appointment.types'

interface AppointmentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  mode: 'create' | 'edit'
  appointment?: AppointmentWithDetails | null
  defaultDate?: string
  defaultVetId?: string
}

export function AppointmentFormModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  mode,
  appointment,
  defaultDate,
  defaultVetId
}: AppointmentFormModalProps) {
  const { clinic } = useClinic()
  const { createAppointment, updateAppointment, loading } = useAppointmentStore()
  const { collaborators, fetchCollaborators } = useCollaboratorsStore()
  const { animals, fetchAnimals } = useAnimalStore()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [ownerAnimals, setOwnerAnimals] = useState<Animal[]>([])
  const [loadingAnimals, setLoadingAnimals] = useState(false)

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      animal_id: '',
      veterinarian_id: defaultVetId || '',
      title: '',
      description: '',
      appointment_date: defaultDate || new Date().toISOString().slice(0, 16),
      duration_minutes: 30,
      appointment_type: 'consultation',
      priority: 'normal',
      notes: '',
      internal_notes: ''
    }
  })

  // Charger les données nécessaires
  useEffect(() => {
    if (clinic?.id) {
      fetchCollaborators()
      fetchAnimals()
    }
  }, [clinic?.id, fetchCollaborators, fetchAnimals])

  // Pré-remplir le formulaire pour l'édition
  useEffect(() => {
    if (appointment && mode === 'edit' && isOpen) {
      form.reset({
        animal_id: appointment.animal_id,
        veterinarian_id: appointment.veterinarian_id,
        title: appointment.title,
        description: appointment.description || '',
        appointment_date: new Date(appointment.appointment_date).toISOString().slice(0, 16),
        duration_minutes: appointment.duration_minutes || 30,
        appointment_type: appointment.appointment_type || 'consultation',
        priority: appointment.priority || 'normal',
        notes: appointment.notes || '',
        internal_notes: appointment.internal_notes || ''
      })

      // Charger les données du propriétaire et animal
      if (appointment.animal?.owner) {
        const owner = appointment.animal.owner as any
        setSelectedOwner(owner)
        loadOwnerAnimals(owner.id)
      }
    }
  }, [appointment, mode, isOpen, form])

  const loadOwnerAnimals = async (ownerId: string) => {
    setLoadingAnimals(true)
    try {
      const list = await AnimalsService.getByOwner(ownerId)
      setOwnerAnimals(list)
    } catch (error) {
      console.error('Erreur lors du chargement des animaux:', error)
      toast.error('Erreur lors du chargement des animaux')
    } finally {
      setLoadingAnimals(false)
    }
  }

  const handleSubmit = async (data: AppointmentFormData) => {
    if (!clinic?.id) return

    setIsSubmitting(true)
    try {
      if (mode === 'create') {
        await createAppointment({
          ...data,
          clinic_id: clinic.id
        })
        toast.success('Rendez-vous créé avec succès')
      } else if (appointment) {
        await updateAppointment(appointment.id, data)
        toast.success('Rendez-vous modifié avec succès')
      }
      
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error(`Erreur lors de la ${mode === 'create' ? 'création' : 'modification'} du rendez-vous`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setSelectedOwner(null)
    setOwnerAnimals([])
    onClose()
  }

  // Filtrer les vétérinaires (seulement les vétérinaires et admins)
  const veterinarians = collaborators.filter(collab => {
    const roles = collab.role ? collab.role.split(',').map(r => r.trim()) : []
    return roles.some(role => role === 'vet' || role === 'admin')
  })

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Nouveau rendez-vous' : 'Modifier le rendez-vous'}
      size="xl"
    >
      <div className="flex flex-col h-full">
        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Aperçu de la date/heure */}
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
                  setSelectedOwner(owner as any)
                  form.setValue('animal_id', '')
                  if (owner?.id) {
                    await loadOwnerAnimals(owner.id)
                  } else {
                    setOwnerAnimals([])
                  }
                }}
                value={selectedOwner}
                placeholder="Rechercher un propriétaire..."
              />
            </div>

            {/* Animal (affiché uniquement après sélection propriétaire) */}
            {selectedOwner && (
              <div>
                <label className="block text-sm font-medium mb-1">Animal du propriétaire</label>
                <div className="relative">
                  {loadingAnimals ? (
                    <div className="w-full border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-500">Chargement des animaux...</span>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <Input
                {...form.register('title')}
                placeholder="Titre du rendez-vous"
                error={form.formState.errors.title?.message}
              />
            </div>

            {/* Date et heure */}
            <div>
              <label className="block text-sm font-medium mb-1">Date et heure *</label>
              <input
                type="datetime-local"
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                {...form.register('appointment_date')}
              />
              {form.formState.errors.appointment_date?.message && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.appointment_date.message}</p>
              )}
            </div>

            {/* Vétérinaire */}
            <div>
              <label className="block text-sm font-medium mb-1">Vétérinaire *</label>
              <Select
                value={form.watch('veterinarian_id')}
                onChange={(value) => form.setValue('veterinarian_id', value)}
                options={veterinarians.map(vet => ({
                  value: vet.id,
                  label: `${vet.first_name} ${vet.last_name}`
                }))}
                placeholder="Sélectionner un vétérinaire"
                error={form.formState.errors.veterinarian_id?.message}
              />
            </div>

            {/* Durée, Type et Priorité */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Durée (min)</label>
                <input
                  type="number"
                  min={15}
                  step={5}
                  className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                  {...form.register('duration_minutes', { valueAsNumber: true })}
                />
                {form.formState.errors.duration_minutes?.message && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.duration_minutes.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <Select
                  value={form.watch('appointment_type')}
                  onChange={(value) => form.setValue('appointment_type', value as any)}
                  options={[
                    { value: 'consultation', label: 'Consultation' },
                    { value: 'vaccination', label: 'Vaccination' },
                    { value: 'surgery', label: 'Chirurgie' },
                    { value: 'checkup', label: 'Contrôle' },
                    { value: 'emergency', label: 'Urgence' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priorité</label>
                <Select
                  value={form.watch('priority')}
                  onChange={(value) => form.setValue('priority', value as any)}
                  options={[
                    { value: 'low', label: 'Basse' },
                    { value: 'normal', label: 'Normale' },
                    { value: 'high', label: 'Haute' },
                    { value: 'urgent', label: 'Urgente' }
                  ]}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                rows={2}
                {...form.register('description')}
                placeholder="Détails du rendez-vous..."
              />
            </div>

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Notes (client)</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                  rows={2}
                  {...form.register('notes')}
                  placeholder="Notes visibles par le client..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes internes</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                  rows={2}
                  {...form.register('internal_notes')}
                  placeholder="Notes internes..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Actions - Fixées en bas */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isSubmitting 
              ? (mode === 'create' ? 'Création...' : 'Modification...') 
              : (mode === 'create' ? 'Créer le rendez-vous' : 'Modifier le rendez-vous')
            }
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
