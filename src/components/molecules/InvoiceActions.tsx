'use client'

import { useState } from 'react'
import Button from '@/components/atoms/Button'
import { toast } from '@/lib/toast'
import InvoiceFormModal from './InvoiceFormModal'
import InvoiceEditModal from './InvoiceEditModal'
import { formatInvoiceNumberForDisplay } from '@/lib/invoice-utils'
import { Edit, FileText, Mail } from 'lucide-react'

interface InvoiceActionsProps {
  appointment: any
  existingInvoice?: any
  onInvoiceCreated?: (invoice: any) => void
  onInvoiceUpdated?: (invoice: any) => void
}

export default function InvoiceActions({ 
  appointment, 
  existingInvoice, 
  onInvoiceCreated, 
  onInvoiceUpdated 
}: InvoiceActionsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [loadingDownload, setLoadingDownload] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)

  const handleDownload = async () => {
    if (!existingInvoice) return
    
    setLoadingDownload(true)
    try {
      const response = await fetch(`/api/invoices/${existingInvoice.id}/pdf`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `facture-${formatInvoiceNumberForDisplay(existingInvoice.invoice_number)}.pdf`
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
      setLoadingDownload(false)
    }
  }

  const handleSendEmail = async () => {
    if (!existingInvoice) return
    
    setLoadingEmail(true)
    try {
      const response = await fetch(`/api/invoices/${existingInvoice.id}/send-email`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Facture envoyée par email')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur envoi email:', error)
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setLoadingEmail(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {existingInvoice ? (
        <>
          <Button
            onClick={() => setShowEditModal(true)}
            variant="outline"
            size="sm"
          >
            <Edit className="w-4 h-4" /> Modifier la facture
          </Button>
          
          <Button
            onClick={handleDownload}
            disabled={loadingDownload}
            variant="outline"
            size="sm"
          >
            {loadingDownload ? 'Téléchargement…' : (<><FileText className="w-4 h-4" /> Télécharger PDF</>)}
          </Button>
          
          <Button
            onClick={handleSendEmail}
            disabled={loadingEmail}
            variant="outline"
            size="sm"
          >
            {loadingEmail ? 'Envoi…' : (<><Mail className="w-4 h-4" /> Envoyer par email</>)}
          </Button>
        </>
      ) : (
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
        >
                      <FileText className="w-4 h-4" /> Créer une facture
        </Button>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <InvoiceFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          appointment={appointment}
          onInvoiceCreated={(invoice) => {
            onInvoiceCreated?.(invoice)
            setShowCreateModal(false)
          }}
        />
      )}

      {/* Modal de modification */}
      {showEditModal && existingInvoice && (
        <InvoiceEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          invoice={existingInvoice}
          onUpdate={(invoice) => {
            onInvoiceUpdated?.(invoice)
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}
