'use client'

import { useOwnerStore } from '@/stores/useOwnerStore'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useAppointmentStore } from '@/stores/useAppointmentStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'

export function DebugStores() {
  const { owners, loading: ownersLoading, error: ownersError } = useOwnerStore()
  const { animals, loading: animalsLoading, error: animalsError } = useAnimalStore()
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useAppointmentStore()
  const { collaborators, loading: collaboratorsLoading, error: collaboratorsError } = useCollaboratorsStore()

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Stores</h3>
      
      <div className="space-y-1">
        <div>Owners: {owners.length} {ownersLoading ? '(loading)' : ''} {ownersError ? `(error: ${ownersError})` : ''}</div>
        <div>Animals: {animals.length} {animalsLoading ? '(loading)' : ''} {animalsError ? `(error: ${animalsError})` : ''}</div>
        <div>Appointments: {appointments.length} {appointmentsLoading ? '(loading)' : ''} {appointmentsError ? `(error: ${appointmentsError})` : ''}</div>
        <div>Collaborators: {collaborators.length} {collaboratorsLoading ? '(loading)' : ''} {collaboratorsError ? `(error: ${collaboratorsError})` : ''}</div>
      </div>
    </div>
  )
}
