'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import { toast } from '@/lib/toast'
import type { AppointmentWithDetails } from '@/types/appointment.types'

interface Service {
  id: string
  code: string
  name: string
  default_price: number
}

interface Product {
  id: string
  sku: string
  name: string
  price: number
  stock_qty: number
  unit: string
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

interface AppointmentDetailsProps {
  appointment: AppointmentWithDetails
}

export default function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchServicesAndProducts()
  }, [])

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
    const newItem: InvoiceItem = {
      item_type: 'service',
      service_id: service.id,
      description: service.name,
      quantity: 1,
      unit_price: service.default_price,
      total_price: service.default_price,
    }
    setInvoiceItems([...invoiceItems, newItem])
  }

  const addProductToInvoice = (product: Product) => {
    const newItem: InvoiceItem = {
      item_type: 'product',
      product_id: product.id,
      description: `${product.name} (${product.sku})`,
      quantity: 1,
      unit_price: product.price,
      total_price: product.price,
    }
    setInvoiceItems([...invoiceItems, newItem])
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...invoiceItems]
    updatedItems[index].quantity = quantity
    updatedItems[index].total_price = updatedItems[index].unit_price * quantity
    setInvoiceItems(updatedItems)
  }

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
  }

  const createInvoice = async () => {
    if (invoiceItems.length === 0) {
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
        toast.success('Facture créée avec succès')
        setShowInvoiceModal(false)
        setInvoiceItems([])
        // Optionnel: rediriger vers la facture ou l'envoyer par email
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

  return (
    <div className="space-y-6">
      {/* Informations du rendez-vous */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Détails du rendez-vous</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Titre:</span> {appointment.title}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(appointment.appointment_date).toLocaleString('fr-FR')}
              </div>
              <div>
                <span className="font-medium">Durée:</span> {appointment.duration_minutes || 30} minutes
              </div>
              <div>
                <span className="font-medium">Type:</span> {appointment.appointment_type || 'consultation'}
              </div>
              <div>
                <span className="font-medium">Statut:</span> {appointment.status || 'planifié'}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Animal et propriétaire</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Animal:</span> {appointment.animal?.name || 'Non spécifié'}
              </div>
              <div>
                <span className="font-medium">Espèce:</span> {appointment.animal?.species || 'Non spécifié'}
              </div>
              <div>
                <span className="font-medium">Propriétaire:</span> {
                  appointment.animal?.owner 
                    ? `${appointment.animal.owner.first_name} ${appointment.animal.owner.last_name}`
                    : 'Non spécifié'
                }
              </div>
              <div>
                <span className="font-medium">Email:</span> {appointment.animal?.owner?.email || 'Non spécifié'}
              </div>
            </div>
          </div>
        </div>

        {appointment.description && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Description:</h4>
            <p className="text-gray-600">{appointment.description}</p>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <Button onClick={() => setShowInvoiceModal(true)}>
            📄 Créer une facture
          </Button>
        </div>
      </Card>

      {/* Modal de création de facture */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Créer une facture</h2>
              <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sélection des articles */}
              <div>
                <h3 className="font-semibold mb-4">Prestations</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {services.map((service) => (
                    <div key={service.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.code}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{Number(service.default_price).toFixed(2)}€</div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addServiceToInvoice(service)}
                        >
                          ➕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="font-semibold mb-4 mt-6">Produits</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">
                          {product.sku} • Stock: {product.stock_qty} {product.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{product.price.toFixed(2)}€</div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addProductToInvoice(product)}
                          disabled={product.stock_qty <= 0}
                        >
                          ➕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facture en cours */}
              <div>
                <h3 className="font-semibold mb-4">Facture</h3>
                {invoiceItems.length === 0 ? (
                  <p className="text-gray-500">Aucun article ajouté</p>
                ) : (
                  <div className="space-y-3">
                    {invoiceItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-gray-600">
                            {item.unit_price.toFixed(2)}€ × 
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-16 mx-1 p-1 border rounded text-center"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.total_price.toFixed(2)}€</div>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => removeItem(index)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>{totalAmount.toFixed(2)}€</span>
                      </div>
                    </div>

                    <Button 
                      onClick={createInvoice}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Création...' : 'Créer la facture'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
