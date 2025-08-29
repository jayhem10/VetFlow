'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import { toast } from '@/lib/toast'
import InvoiceActions from './InvoiceActions'
import FileUpload from './FileUpload'
import { 
  translateAppointmentStatus, 
  translateAppointmentType, 
  translateSpecies,
  getStatusColor 
} from '@/lib/utils'
import type { AppointmentWithDetails } from '@/types/appointment.types'

interface AppointmentDetailsProps {
  appointment: AppointmentWithDetails
}

export default function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  const [existingInvoice, setExistingInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkExistingInvoice()
  }, [appointment.id])

  const checkExistingInvoice = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/invoice`)
      if (response.ok) {
        const invoice = await response.json()
        setExistingInvoice(invoice)
      }
    } catch (error) {
      console.error('Erreur vérification facture:', error)
    }
  }

  const handleInvoiceCreated = (invoice: any) => {
    setExistingInvoice(invoice)
    toast.success('Facture créée avec succès')
  }

  const handleInvoiceUpdated = (invoice: any) => {
    setExistingInvoice(invoice)
    toast.success('Facture mise à jour avec succès')
  }

  return (
    <div className="space-y-6">
      {/* Informations du rendez-vous */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Détails du rendez-vous</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Titre :</span> {appointment.title}
              </div>
              <div>
                <span className="font-medium">Date et heure :</span> {new Date(appointment.appointment_date).toLocaleString('fr-FR')}
              </div>
              <div>
                <span className="font-medium">Durée :</span> {appointment.duration_minutes || 30} minutes
              </div>
              <div>
                <span className="font-medium">Type de rendez-vous :</span> {translateAppointmentType(appointment.appointment_type)}
              </div>
              <div>
                <span className="font-medium">Statut :</span> 
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                  {translateAppointmentStatus(appointment.status)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Informations patient et propriétaire</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Nom du patient :</span> {appointment.animal?.name || 'Non renseigné'}
              </div>
              <div>
                <span className="font-medium">Espèce :</span> {translateSpecies(appointment.animal?.species)}
              </div>
              <div>
                <span className="font-medium">Propriétaire :</span> {
                  appointment.animal?.owner 
                    ? `${appointment.animal.owner.first_name} ${appointment.animal.owner.last_name}`
                    : 'Non renseigné'
                }
              </div>
              <div>
                <span className="font-medium">Adresse email :</span> {appointment.animal?.owner?.email || 'Non renseigné'}
              </div>
            </div>
          </div>
        </div>

        {appointment.description && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Notes et observations :</h4>
            <p className="text-gray-600">{appointment.description}</p>
          </div>
        )}

        {/* Actions de facture */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Actions de facturation :</h4>
          <InvoiceActions
            appointment={appointment}
            existingInvoice={existingInvoice}
            onInvoiceCreated={handleInvoiceCreated}
            onInvoiceUpdated={handleInvoiceUpdated}
          />
                  </div>
                  
        {/* Gestion des fichiers */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Fichiers attachés :</h4>
          <FileUpload
            appointmentId={appointment.id}
            animalId={appointment.animal?.id}
            ownerId={appointment.animal?.owner?.id}
            onFileUploaded={(file) => {
              toast.success(`Fichier "${file.originalName}" ajouté avec succès`)
            }}
            onFileDeleted={(fileId) => {
              toast.success('Fichier supprimé avec succès')
            }}
          />
        </div>
      </Card>
    </div>
  )
}
