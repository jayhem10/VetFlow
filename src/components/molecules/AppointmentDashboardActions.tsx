'use client'

import { useState } from 'react'
import Button from '@/components/atoms/Button'
import { toast } from '@/lib/toast'
import InvoiceActions from './InvoiceActions'
import { Eye, Edit, FileText, Download } from 'lucide-react'

interface AppointmentDashboardActionsProps {
  appointment: any
  existingInvoice?: any
  onEdit?: () => void
  onViewDetails?: () => void
  onInvoiceCreated?: (invoice: any) => void
  onInvoiceUpdated?: (invoice: any) => void
}

export default function AppointmentDashboardActions({
  appointment,
  existingInvoice,
  onEdit,
  onViewDetails,
  onInvoiceCreated,
  onInvoiceUpdated
}: AppointmentDashboardActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (!existingInvoice) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/invoices/${existingInvoice.id}/pdf`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `facture-${existingInvoice.invoice_number}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Facture téléchargée avec succès')
      } else {
        toast.error('Erreur lors du téléchargement')
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      toast.error('Erreur lors du téléchargement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Bouton consulter les détails */}
      <Button
        onClick={onViewDetails}
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
      >
        <Eye className="h-4 w-4" />
        Consulter
      </Button>

      {/* Bouton modifier */}
      <Button
        onClick={onEdit}
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
      >
        <Edit className="h-4 w-4" />
        Modifier
      </Button>

      {/* Actions de facture */}
      <div className="flex gap-2">
        {existingInvoice ? (
          <>
            <Button
              onClick={() => {
                // Ouvrir la modal de modification de facture
                // TODO: Implémenter la modal de modification
                toast.info('Modal de modification de facture à implémenter')
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Modifier facture
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              // Ouvrir la modal de création de facture
              // TODO: Implémenter la modal de création
              toast.info('Modal de création de facture à implémenter')
            }}
            size="sm"
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Créer facture
          </Button>
        )}
      </div>
    </div>
  )
}
