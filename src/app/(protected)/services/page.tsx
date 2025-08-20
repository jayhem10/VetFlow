'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import { toast } from '@/lib/toast'
import { usePermissions } from '@/hooks/usePermissions'

interface Service {
  id: string
  code: string
  name: string
  description?: string
  default_price: number
  tax_rate: number
  active: boolean
  created_at: string
}

export default function ServicesPage() {
  const { can } = usePermissions()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    default_price: '',
    tax_rate: '20'
  })

  const itemsPerPage = 25

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
      } else {
        toast.error('Erreur lors du chargement des prestations')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des prestations')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          description: formData.description || undefined,
          default_price: parseFloat(formData.default_price),
          tax_rate: parseFloat(formData.tax_rate)
        })
      })

      if (response.ok) {
        toast.success('Prestation créée avec succès')
        setShowCreateModal(false)
        setFormData({ code: '', name: '', description: '', default_price: '', tax_rate: '20' })
        fetchServices()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur lors de la création')
    }
  }

  // Filtrage et pagination
  const filteredServices = services.filter(service => {
    // Filtre par recherche
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Filtre par statut
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && service.active) ||
      (statusFilter === 'inactive' && !service.active)
    
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditService = (service: any) => {
    setEditingService(service)
    setFormData({
      code: service.code,
      name: service.name,
      description: service.description || '',
      default_price: service.default_price.toString(),
      tax_rate: service.tax_rate?.toString() || '20'
    })
    setShowEditModal(true)
  }

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/services/${editingService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          description: formData.description || undefined,
          default_price: parseFloat(formData.default_price),
          tax_rate: parseFloat(formData.tax_rate)
        })
      })

      if (response.ok) {
        toast.success('Prestation modifiée avec succès')
        setShowEditModal(false)
        setEditingService(null)
        setFormData({ code: '', name: '', description: '', default_price: '', tax_rate: '20' })
        fetchServices()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la modification')
      }
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleToggleServiceStatus = async (service: any) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(service.active ? 'Prestation désactivée' : 'Prestation activée')
        fetchServices()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la modification')
      }
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Prestations
        </h1>
        {can('services', 'create') && (
          <Button onClick={() => setShowCreateModal(true)}>
            ➕ Nouvelle prestation
          </Button>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Input
          type="text"
          placeholder="Rechercher par nom, code ou description..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset to first page when searching
          }}
          className="min-w-80 max-w-lg"
        />
        
        {/* Filtres de statut */}
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter('active')
              setCurrentPage(1)
            }}
          >
            ✅ Actifs ({services.filter(s => s.active).length})
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter('inactive')
              setCurrentPage(1)
            }}
          >
            ⏸️ Inactifs ({services.filter(s => !s.active).length})
          </Button>
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter('all')
              setCurrentPage(1)
            }}
          >
            📋 Tous ({services.length})
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{services.length}</div>
          <div className="text-sm text-gray-600">Total prestations</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {services.filter(s => s.active).length}
          </div>
          <div className="text-sm text-gray-600">Prestations actives</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">
            {services.filter(s => !s.active).length}
          </div>
          <div className="text-sm text-gray-600">Prestations inactives</div>
        </Card>
      </div>

      {/* Liste des prestations */}
      {filteredServices.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'Aucune prestation trouvée' : 'Aucune prestation'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm 
              ? `Aucune prestation ne correspond à "${searchTerm}"`
              : 'Commencez par créer votre première prestation'
            }
          </p>
          {!searchTerm && can('services', 'create') && (
            <Button onClick={() => setShowCreateModal(true)}>
              ➕ Créer la première prestation
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedServices.map((service) => (
            <Card key={service.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {service.code}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      service.active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Prix: {Number(service.default_price).toFixed(2)}€</span>
                    <span>TVA: {service.tax_rate}%</span>
                    <span>Créé le: {new Date(service.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                {(can('services', 'update') || can('services', 'delete')) && (
                  <div className="flex gap-2">
                    {can('services', 'update') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditService(service)}
                      >
                        ✏️ Modifier
                      </Button>
                    )}
                    {can('services', 'delete') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleToggleServiceStatus(service)}
                      >
                        {service.active ? '⏸️ Désactiver' : '▶️ Activer'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Précédent
            </Button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1
              const isCurrentPage = page === currentPage
              const isNearCurrent = Math.abs(page - currentPage) <= 2
              const isFirstOrLast = page === 1 || page === totalPages
              
              if (isCurrentPage || isNearCurrent || isFirstOrLast) {
                return (
                  <Button
                    key={page}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                )
              } else if (page === currentPage - 3 || page === currentPage + 3) {
                return <span key={page} className="px-2">...</span>
              }
              return null
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant →
            </Button>
          </div>
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Nouvelle prestation</h2>
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                ✕
              </Button>
            </div>
            
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="CONS-001"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Consultation standard"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de la prestation..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prix HT *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.default_price}
                    onChange={(e) => setFormData({...formData, default_price: e.target.value})}
                    placeholder="50.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">TVA %</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({...formData, tax_rate: e.target.value})}
                    placeholder="20"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Créer la prestation
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Modifier la prestation</h2>
              <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>
                ✕
              </Button>
            </div>
            
            <form onSubmit={handleUpdateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="CONS-001"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Consultation standard"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de la prestation..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prix HT *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.default_price}
                    onChange={(e) => setFormData({...formData, default_price: e.target.value})}
                    placeholder="50.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">TVA %</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({...formData, tax_rate: e.target.value})}
                    placeholder="20"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Modifier la prestation
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
