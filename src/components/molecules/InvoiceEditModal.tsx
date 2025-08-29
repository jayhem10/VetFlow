'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import Dialog from '@/components/atoms/Dialog'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Card from '@/components/atoms/Card'
import { X, Plus, Trash2, Send, Printer, CreditCard, Banknote, CheckCircle, Search } from 'lucide-react'
import { Invoice, InvoiceItem, PaymentMethod, PaymentStatus } from '@/types/invoice.types'
import { formatInvoiceNumberForDisplay } from '@/lib/invoice-utils'

interface Service {
  id: string
  name: string
  default_price: number | string | any // Prisma Decimal
  description?: string
}

interface Product {
  id: string
  name: string
  price: number | string | any // Prisma Decimal
  sku: string
  stock_qty: number
}

interface InvoiceEditModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice | null
  onUpdate: (invoice: Invoice) => void
}

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; icon: any }> = [
  { value: 'cash', label: 'Espèces', icon: Banknote },
  { value: 'card', label: 'Carte bancaire', icon: CreditCard },
  { value: 'check', label: 'Chèque', icon: CheckCircle },
  { value: 'transfer', label: 'Virement', icon: Banknote },
  { value: 'insurance', label: 'Assurance', icon: CheckCircle },
]

const PAYMENT_STATUSES: Array<{ value: PaymentStatus; label: string; color: string }> = [
  { value: 'pending', label: 'En attente', color: 'text-yellow-600' },
  { value: 'paid', label: 'Payée', color: 'text-green-600' },
  { value: 'overdue', label: 'En retard', color: 'text-red-600' },
  { value: 'cancelled', label: 'Annulée', color: 'text-gray-600' },
]

export default function InvoiceEditModal({ isOpen, onClose, invoice, onUpdate }: InvoiceEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingDownload, setLoadingDownload] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    payment_status: 'pending' as PaymentStatus,
    payment_method: '' as PaymentMethod | '',
    paid_at: '' as string,
    notes: '' as string,
    due_date: '' as string,
  })
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [serviceSearch, setServiceSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [showServiceSearch, setShowServiceSearch] = useState(false)
  const [showProductSearch, setShowProductSearch] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchServicesAndProducts()
    }
  }, [isOpen])

  useEffect(() => {
    if (invoice) {
      setFormData({
        payment_status: invoice.payment_status,
        payment_method: invoice.payment_method || '',
        paid_at: invoice.paid_at ? new Date(invoice.paid_at).toISOString().split('T')[0] : '',
        notes: invoice.notes || '',
        due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
      })
      setItems([...invoice.items])
    }
  }, [invoice])

  const fetchServicesAndProducts = async () => {
    try {
      const [servicesRes, productsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/products')
      ])
      
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData.services)
      }
      
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoice) return

    setLoading(true)
    try {
      const paidAtToSend =
        formData.payment_status === 'paid'
          ? (formData.paid_at ? new Date(formData.paid_at).toISOString() : new Date().toISOString())
          : null
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: formData.payment_status,
          payment_method: formData.payment_method || null,
          paid_at: paidAtToSend,
          notes: formData.notes,
          due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
          items: items,
        }),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        onUpdate(updatedInvoice.invoice)
        toast.success('Facture mise à jour avec succès')
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  // Sauvegarder sans fermer (utilisé avant envoi/téléchargement)
  const saveChanges = async (): Promise<boolean> => {
    if (!invoice) return false
    setLoading(true)
    try {
      const paidAtToSend =
        formData.payment_status === 'paid'
          ? (formData.paid_at ? new Date(formData.paid_at).toISOString() : new Date().toISOString())
          : null
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: formData.payment_status,
          payment_method: formData.payment_method || null,
          paid_at: paidAtToSend,
          notes: formData.notes,
          due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
          items: items,
        }),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erreur lors de la sauvegarde')
        return false
      }
      // On ne ferme pas la modale et on ne notifie pas le parent pour éviter la fermeture automatique.
      // La modale garde son état local déjà synchronisé.
      await response.json()
      return true
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!invoice) return
    // Sauvegarder d'abord pour garantir des données à jour
    const ok = await saveChanges()
    if (!ok) return
    setLoadingEmail(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send-email`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Facture envoyée par email avec succès')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'envoi de l\'email')
      }
    } catch (error) {
      console.error('Erreur email:', error)
      toast.error('Erreur lors de l\'envoi de l\'email')
    } finally {
      setLoadingEmail(false)
    }
  }

  const handleDownload = async () => {
    if (!invoice) return
    // Sauvegarder d'abord pour garantir des données à jour
    const ok = await saveChanges()
    if (!ok) return
    setLoadingDownload(true)
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
    } finally {
      setLoadingDownload(false)
    }
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...items]
    updatedItems[index].quantity = quantity
    updatedItems[index].total_price = updatedItems[index].unit_price * quantity
    setItems(updatedItems)
  }

  const updateItemPrice = (index: number, price: number) => {
    const updatedItems = [...items]
    updatedItems[index].unit_price = price
    updatedItems[index].total_price = price * updatedItems[index].quantity
    setItems(updatedItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const addServiceToInvoice = (service: Service) => {
    const unitPrice = Number(service.default_price)
    const newItem: InvoiceItem = {
      id: `temp-${Date.now()}`,
      item_type: 'service',
      service_id: service.id,
      description: service.name,
      quantity: 1,
      unit_price: unitPrice,
      total_price: unitPrice,
    }
    setItems([...items, newItem])
    setShowServiceSearch(false)
    setServiceSearch('')
  }

  const addProductToInvoice = (product: Product) => {
    if (Number(product.stock_qty) <= 0) {
      toast.error('Stock indisponible pour ce produit')
      return
    }
    const unitPrice = Number(product.price)
    const newItem: InvoiceItem = {
      id: `temp-${Date.now()}`,
      item_type: 'product',
      product_id: product.id,
      description: `${product.name} (${product.sku})`,
      quantity: 1,
      unit_price: unitPrice,
      total_price: unitPrice,
    }
    setItems([...items, newItem])
    setShowProductSearch(false)
    setProductSearch('')
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
  const taxAmount = subtotal * 0.20 // 20% TVA
  const totalAmount = subtotal + taxAmount

  if (!invoice) return null

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Modifier la facture {formatInvoiceNumberForDisplay(invoice.invoice_number)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {invoice.appointment?.animal?.name} - {invoice.owner?.first_name} {invoice.owner?.last_name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Informations de paiement */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informations de paiement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-sm font-medium mb-2">Statut de paiement</label>
                <Select
                  value={formData.payment_status}
                  onChange={(value) => {
                    const v = value as PaymentStatus
                    setFormData(prev => {
                      const next = { ...prev, payment_status: v }
                      if (v === 'paid') {
                        if (!prev.paid_at) {
                          next.paid_at = new Date().toISOString().split('T')[0]
                        }
                      } else {
                        next.paid_at = ''
                      }
                      return next
                    })
                  }}
                  options={PAYMENT_STATUSES.map(status => ({ value: status.value, label: status.label }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Moyen de paiement</label>
                <Select
                  value={formData.payment_method || ''}
                  onChange={(value) => setFormData({ ...formData, payment_method: value as PaymentMethod })}
                  options={[
                    { value: '', label: 'Sélectionner...' },
                    ...PAYMENT_METHODS.map(method => ({ value: method.value, label: method.label }))
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date de paiement</label>
                <Input
                  type="date"
                  value={formData.paid_at}
                  onChange={(e) => setFormData({ ...formData, paid_at: e.target.value })}
                  disabled={formData.payment_status !== 'paid'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date d'échéance</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes additionnelles..."
                />
              </div>
            </div>
          </Card>

          {/* Articles de la facture */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Articles de la facture</h3>
            
            {/* Ajouter des articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Ajouter un service */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowServiceSearch(!showServiceSearch)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un service
                </Button>
                
                {showServiceSearch && (
                  <div className="mt-2 space-y-2">
                    <Input
                      placeholder="Rechercher un service..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                    />
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {services
                        .filter(service => service.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                        .map(service => (
                          <div
                            key={service.id}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                            onClick={() => addServiceToInvoice(service)}
                          >
                            <div className="font-medium">{service.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {Number(service.default_price).toFixed(2)}€
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ajouter un produit */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
                
                {showProductSearch && (
                  <div className="mt-2 space-y-2">
                    <Input
                      placeholder="Rechercher un produit..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {products
                        .filter(product => 
                          product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          product.sku.toLowerCase().includes(productSearch.toLowerCase())
                        )
                        .map(product => (
                          <div
                            key={product.id}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                            onClick={() => addProductToInvoice(product)}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {Number(product.price).toFixed(2)}€ - Stock: {product.stock_qty}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      value={item.description}
                      onChange={(e) => {
                        const updatedItems = [...items]
                        updatedItems[index].description = e.target.value
                        setItems(updatedItems)
                      }}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-32 text-right font-medium">
                    {Number(item.total_price || 0).toFixed(2)} €
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="mt-6 space-y-2 text-right">
              <div className="text-gray-600 dark:text-gray-400">
                Sous-total: {subtotal.toFixed(2)} €
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                TVA (20%): {taxAmount.toFixed(2)} €
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Total: {totalAmount.toFixed(2)} €
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendEmail}
                disabled={loadingEmail}
              >
                {loadingEmail ? 'Envoi…' : (<><Send className="h-4 w-4 mr-2" /> Envoyer par email</>)}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
                disabled={loadingDownload}
              >
                {loadingDownload ? 'Téléchargement…' : (<><Printer className="h-4 w-4 mr-2" /> Télécharger PDF</>)}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Mise à jour…' : 'Mettre à jour'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
