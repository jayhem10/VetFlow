'use client'

import { useState } from 'react'
import AppointmentScheduler from '@/components/organisms/AppointmentScheduler'
import AppointmentsList from '@/components/organisms/AppointmentsList'
import Button from '@/components/atoms/Button'
import { ViewToggle } from '@/components/atoms/ViewToggle'
import { Calendar, List } from 'lucide-react'
import AppointmentSummaryModal from '@/components/molecules/AppointmentSummaryModal'
import { AppointmentFormModal } from '@/components/molecules/AppointmentFormModal'
import InvoiceFormModal from '@/components/molecules/InvoiceFormModal'
import InvoiceEditModal from '@/components/molecules/InvoiceEditModal'
import FileUpload from '@/components/molecules/FileUpload'
import Dialog from '@/components/atoms/Dialog'
import type { Invoice } from '@/types/invoice.types'
import { AppointmentWithDetails } from '@/types'
import { useClinic } from '@/modules/clinic/hooks/use-clinic'
import { useAppointmentStore } from '@/stores/useAppointmentStore'

export default function AppointmentsPage() {
  const { clinic } = useClinic()
  const { fetchAppointments } = useAppointmentStore()
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  // États pour les modales page-level
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false)
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false)
  const [existingInvoice, setExistingInvoice] = useState<Invoice | null>(null)
  const [showFilesModal, setShowFilesModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleViewChange = (view: string) => {
    setViewMode(view as 'calendar' | 'list')
  }

  // Callbacks pour les actions des rendez-vous
  const handleShowSummary = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment)
    setShowSummaryModal(true)
  }

  const handleShowInvoice = async (appointment: AppointmentWithDetails) => {
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

  const handleShowFiles = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment)
    setShowFilesModal(true)
  }

  const handleEditAppointment = (appointment: AppointmentWithDetails) => {
    // Ouvrir la modale de modification
    setSelectedAppointment(appointment)
    setShowEditModal(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête avec toggle de vue */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Rendez-vous
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos rendez-vous en vue calendrier ou liste
            </p>
          </div>
          <ViewToggle
            view={viewMode}
            onViewChange={handleViewChange}
            options={[
              { value: 'calendar', label: 'Calendrier', icon: '📅' },
              { value: 'list', label: 'Liste', icon: '📋' }
            ]}
          />
        </div>
      </div>

      {/* Contenu selon la vue sélectionnée */}
      {viewMode === 'calendar' ? (
        <AppointmentScheduler />
      ) : (
        <AppointmentsList 
          onShowSummary={handleShowSummary}
          onShowInvoice={handleShowInvoice}
          onShowFiles={handleShowFiles}
          onEditAppointment={handleEditAppointment}
        />
      )}

      {/* Modales page-level */}
      {showSummaryModal && selectedAppointment && (
        <AppointmentSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          appointment={selectedAppointment}
        />
      )}

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

      {showCreateInvoiceModal && selectedAppointment && (
        <InvoiceFormModal
          isOpen={showCreateInvoiceModal}
          onClose={() => {
            setShowCreateInvoiceModal(false)
            setSelectedAppointment(null)
          }}
          appointment={selectedAppointment}
          onInvoiceCreated={async () => {
            // Rafraîchir les données des rendez-vous pour mettre à jour l'affichage
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
          onUpdate={async (updatedInvoice) => {
            // Rafraîchir les données des rendez-vous pour mettre à jour l'affichage
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
            // Rafraîchir les données des rendez-vous pour mettre à jour l'affichage
            if (clinic?.id) {
              await fetchAppointments(clinic.id)
            }
            setShowEditModal(false)
            setSelectedAppointment(null)
          }}
        />
      )}
    </div>
  )
}


