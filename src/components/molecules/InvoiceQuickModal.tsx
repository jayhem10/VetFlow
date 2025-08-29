'use client'

import { Dialog } from '@/components/atoms/Dialog'
import type { AppointmentWithDetails } from '@/types/appointment.types'
import InvoiceActions from './InvoiceActions'

interface InvoiceQuickModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentWithDetails
}

export default function InvoiceQuickModal({ isOpen, onClose, appointment }: InvoiceQuickModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Facturation" size="2xl">
      <div className="space-y-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {appointment.title} • {new Date(appointment.appointment_date).toLocaleString('fr-FR')}
        </div>
        <InvoiceActions appointment={appointment} existingInvoice={null} />
      </div>
    </Dialog>
  )
}


