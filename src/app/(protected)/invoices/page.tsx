'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import SearchInput from '@/components/atoms/SearchInput'
import Select from '@/components/atoms/Select'
import { useStatusFilter } from '@/hooks/useStatusFilter'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import { StatusFilterButtons } from '@/components/molecules/StatusFilterButtons'
import { Pagination } from '@/components/molecules/Pagination'
import { EmptyState } from '@/components/molecules/EmptyState'
import InvoiceEditModal from '@/components/molecules/InvoiceEditModal'
import { Invoice } from '@/types/invoice.types'
import { formatInvoiceNumberForDisplay } from '@/lib/invoice-utils'
import { Edit, Mail, FileText } from 'lucide-react'
import { Tooltip } from '@/components/atoms/Tooltip'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Recherche côté client pour tous les champs
  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) {
      return invoices
    }

    const searchLower = searchTerm.toLowerCase()
    
    return invoices.filter(invoice => {
      // Recherche dans le numéro de facture
      if (invoice.invoice_number.toLowerCase().includes(searchLower)) {
        return true
      }
      
      // Recherche dans le titre du rendez-vous
      if (invoice.appointment?.title?.toLowerCase().includes(searchLower)) {
        return true
      }
      
      // Recherche dans le nom du patient
      if (invoice.appointment?.animal?.name?.toLowerCase().includes(searchLower)) {
        return true
      }
      
      // Recherche dans le nom du propriétaire
      const ownerName = invoice.owner 
        ? `${invoice.owner.first_name} ${invoice.owner.last_name}`.toLowerCase()
        : invoice.appointment?.animal?.owner
          ? `${invoice.appointment.animal.owner.first_name} ${invoice.appointment.animal.owner.last_name}`.toLowerCase()
          : ''
      
      if (ownerName.includes(searchLower)) {
        return true
      }
      
      return false
    })
  }, [invoices, searchTerm])
  const { filteredItems: statusFilteredItems, statusFilter: currentFilter, setStatusFilter: setCurrentFilter, counts } = useStatusFilter({
    items: filteredInvoices,
    getActiveStatus: (invoice) => invoice.payment_status === 'pending',
    initialFilter: 'all'
  })
  const { currentPage, setCurrentPage, itemsPerPage, paginatedItems } = usePagination(statusFilteredItems, { itemsPerPage: 25 })

  // Charger les factures
  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(currentFilter !== 'all' && { status: currentFilter })
      })

      console.log('🔍 Debug - Appel API factures avec params:', params.toString())
      
      const response = await fetch(`/api/invoices?${params}`)
      console.log('🔍 Debug - Status response:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Debug - Données reçues:', data)
        setInvoices(data.invoices)
        setTotalInvoices(data.pagination.total)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        console.error('🔍 Debug - Erreur API:', errorData)
        toast.error(`Erreur lors du chargement des factures: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('🔍 Debug - Erreur fetch:', error)
      toast.error('Erreur réseau lors du chargement des factures')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [currentFilter, currentPage])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée'
      case 'pending': return 'En attente'
      case 'overdue': return 'En retard'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowEditModal(true)
  }

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(invoices.map(inv => 
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    ))
  }

  const handleSendEmail = (invoice: Invoice) => {
    // TODO: Implémenter l'envoi par email
    toast.success(`Envoi de la facture ${invoice.invoice_number} par email`)
  }

  const handleDownload = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
        method: 'GET',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `facture-${formatInvoiceNumberForDisplay(invoice.invoice_number)}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Facture téléchargée avec succès')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du téléchargement')
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  if (loading && invoices.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chargement des factures...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Factures</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez et consultez toutes vos factures
        </p>
      </div>

      {/* Filtres et recherche */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Rechercher par numéro de facture, patient ou propriétaire..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
          </div>

          {/* Filtres de statut */}
          <StatusFilterButtons
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            counts={counts}
            showLowStock={false}
          />
        </div>
      </Card>

      {/* Liste des factures */}
      {paginatedItems.length === 0 ? (
        <EmptyState type="invoices" />
      ) : (
        <div className="space-y-4">
          {paginatedItems.map((invoice) => (
            <Card key={invoice.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatInvoiceNumberForDisplay(invoice.invoice_number)}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.payment_status)}`}>
                      {getStatusLabel(invoice.payment_status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Date :</span> {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                    </div>
                    <div>
                      <span className="font-medium">Animal :</span> {invoice.appointment?.animal?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Propriétaire :</span> {
                        invoice.owner 
                          ? `${invoice.owner.first_name} ${invoice.owner.last_name}`
                          : invoice.appointment?.animal?.owner
                            ? `${invoice.appointment.animal.owner.first_name} ${invoice.appointment.animal.owner.last_name}`
                            : 'N/A'
                      }
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Articles :</span> {invoice.items.length} article(s)
                  </div>
                </div>
                
                <div className="text-right ml-6">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {Number(invoice.total_amount).toFixed(2)}€
                  </div>
                  
                  <div className="flex gap-2">
                    <Tooltip content="Modifier la facture">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(invoice)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    
                    <Tooltip content="Envoyer par email">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendEmail(invoice)}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    
                    <Tooltip content="Télécharger PDF">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(invoice)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {statusFilteredItems.length > itemsPerPage && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(statusFilteredItems.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modale de modification */}
      <InvoiceEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedInvoice(null)
        }}
        invoice={selectedInvoice}
        onUpdate={handleUpdateInvoice}
      />
    </div>
  )
}
