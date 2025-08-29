'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import Dialog from '@/components/atoms/Dialog'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Card from '@/components/atoms/Card'
import { X, Plus, Trash2, Search } from 'lucide-react'
import type { AppointmentWithDetails } from '@/types/appointment.types'

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

interface InvoiceItem {
  item_type: 'product' | 'service'
  product_id?: string
  service_id?: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentWithDetails | null
  onInvoiceCreated: (invoice: any) => void
}

export default function InvoiceFormModal({ isOpen, onClose, appointment, onInvoiceCreated }: InvoiceFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [serviceSearch, setServiceSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [showServiceSearch, setShowServiceSearch] = useState(false)
  const [showProductSearch, setShowProductSearch] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchServicesAndProducts()
    }
  }, [isOpen])

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

  const addServiceToInvoice = (service: Service) => {
    const unitPrice = Number(service.default_price)
    const newItem: InvoiceItem = {
      item_type: 'service',
      service_id: service.id,
      description: service.name,
      quantity: 1,
      unit_price: unitPrice,
      total_price: unitPrice,
    }
    setInvoiceItems([...invoiceItems, newItem])
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
      item_type: 'product',
      product_id: product.id,
      description: `${product.name} (${product.sku})`,
      quantity: 1,
      unit_price: unitPrice,
      total_price: unitPrice,
    }
    setInvoiceItems([...invoiceItems, newItem])
    setShowProductSearch(false)
    setProductSearch('')
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...invoiceItems]
    updatedItems[index].quantity = quantity
    updatedItems[index].total_price = Number(updatedItems[index].unit_price) * quantity
    setInvoiceItems(updatedItems)
  }

  const updateItemPrice = (index: number, price: number) => {
    const updatedItems = [...invoiceItems]
    updatedItems[index].unit_price = price
    updatedItems[index].total_price = price * updatedItems[index].quantity
    setInvoiceItems(updatedItems)
  }

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
  }

  const createInvoice = async () => {
    if (!appointment || invoiceItems.length === 0) {
      toast.error('Ajoutez au moins un article à la facture')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/invoices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointment.id,
          items: invoiceItems,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        onInvoiceCreated(result.invoice)
        setInvoiceItems([])
        onClose()
        toast.success('Facture créée avec succès')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création de la facture')
      }
    } catch (error) {
      toast.error('Erreur lors de la création de la facture')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total_price, 0)

  // Filtrer les services et produits selon la recherche
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(serviceSearch.toLowerCase())
  )

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase())
  )

  if (!appointment) return null

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="2xl" title="Créer une facture" className="max-w-6xl">
      <div className="space-y-6">
        {/* Informations du rendez-vous */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {appointment.title} • {appointment.animal?.name} ({appointment.animal?.owner?.first_name} {appointment.animal?.owner?.last_name})
          </p>
        </div>

        {/* Blocs de recherche côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recherche de services */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ajouter un service</h3>
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowServiceSearch(!showServiceSearch)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Rechercher un service
              </Button>
              
              {showServiceSearch && (
                <div className="space-y-2">
                  <Input
                    placeholder="Rechercher un service..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredServices.map(service => (
                      <div
                        key={service.id}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => addServiceToInvoice(service)}
                      >
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {Number(service.default_price).toFixed(2)}€
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Recherche de produits */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ajouter un produit</h3>
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProductSearch(!showProductSearch)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Rechercher un produit
              </Button>
              
              {showProductSearch && (
                <div className="space-y-2">
                  <Input
                    placeholder="Rechercher un produit..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => addProductToInvoice(product)}
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {Number(product.price).toFixed(2)}€ - Stock: {product.stock_qty}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Détail de la facture sur toute la largeur */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Articles de la facture</h3>

          {invoiceItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun article ajouté
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2">Désignation</th>
                    <th className="text-center py-3 px-2 w-24">Qté</th>
                    <th className="text-center py-3 px-2 w-28">PU (€)</th>
                    <th className="text-right py-3 px-2 w-28">Total (€)</th>
                    <th className="text-center py-3 px-2 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoiceItems.map((item, index) => (
                    <tr key={index} className="align-middle hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></div>
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                            value={item.description}
                            onChange={(e) => {
                              const updatedItems = [...invoiceItems]
                              updatedItems[index].description = e.target.value
                              setInvoiceItems(updatedItems)
                            }}
                            placeholder="Description de l'article"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateItemQuantity(index, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 p-0"
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateItemQuantity(index, item.quantity + 1)}
                            className="w-8 h-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                          className="w-24 text-center"
                        />
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {Number(item.total_price).toFixed(2)}€
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totaux */}
              {invoiceItems.length > 0 && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Sous-total HT:</span>
                        <span>{totalAmount.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>TVA (20%):</span>
                        <span>{(totalAmount * 0.20).toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
                        <span>Total TTC:</span>
                        <span>{(totalAmount * 1.20).toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {invoiceItems.length} article(s) sélectionné(s)
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={createInvoice}
              disabled={loading || invoiceItems.length === 0}
            >
              {loading ? 'Création...' : 'Créer la facture'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
