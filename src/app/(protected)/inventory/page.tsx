'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import { toast } from '@/lib/toast'
import { usePermissions } from '@/hooks/usePermissions'
import { useStatusFilter } from '@/hooks/useStatusFilter'
import { useSearch } from '@/hooks/useSearch'
import { usePagination } from '@/hooks/usePagination'
import { StatusFilterButtons } from '@/components/molecules/StatusFilterButtons'
import SearchInput from '@/components/atoms/SearchInput'
import { Pagination } from '@/components/molecules/Pagination'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Edit } from 'lucide-react'

interface Product {
  id: string
  sku: string
  name: string
  unit: string
  stock_qty: number
  low_stock_threshold: number
  price: number
  tax_rate: number
  active: boolean
  created_at: string
}

export default function InventoryPage() {
  const { can } = usePermissions()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  // Hooks réutilisables
  const { filteredItems: statusFilteredProducts, statusFilter, setStatusFilter, counts } = useStatusFilter({
    items: products,
    getActiveStatus: (product) => product.active,
    getLowStockStatus: (product) => product.stock_qty <= product.low_stock_threshold,
    initialFilter: 'active'
  })

  const { searchTerm, setSearchTerm, filteredItems: searchResults } = useSearch({
    items: statusFilteredProducts,
    searchFields: ['name', 'sku']
  })

  const { paginatedItems, currentPage, setCurrentPage, totalPages } = usePagination(searchResults)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    unit: '',
    stock_qty: '',
    low_stock_threshold: '',
    price: '',
    tax_rate: '20'
  })
  const [stockFormData, setStockFormData] = useState({
    type: 'in',
    quantity: '',
    reason: ''
  })

  const itemsPerPage = 25

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      } else {
        toast.error('Erreur lors du chargement des produits')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: formData.sku,
          name: formData.name,
          unit: formData.unit,
          stock_qty: parseInt(formData.stock_qty),
          low_stock_threshold: parseInt(formData.low_stock_threshold),
          price: parseFloat(formData.price),
          tax_rate: parseFloat(formData.tax_rate)
        })
      })

      if (response.ok) {
        toast.success('Produit créé avec succès')
        setShowCreateModal(false)
        setFormData({ sku: '', name: '', unit: '', stock_qty: '', low_stock_threshold: '', price: '', tax_rate: '20' })
        fetchProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur lors de la création')
    }
  }

  const handleStockMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: stockFormData.type,
          quantity: parseInt(stockFormData.quantity),
          reason: stockFormData.reason || undefined
        })
      })

      if (response.ok) {
        toast.success('Mouvement de stock enregistré')
        setShowStockModal(false)
        setSelectedProduct(null)
        setStockFormData({ type: 'in', quantity: '', reason: '' })
        fetchProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du mouvement de stock')
      }
    } catch (error) {
      toast.error('Erreur lors du mouvement de stock')
    }
  }

  const openStockModal = (product: Product) => {
    setSelectedProduct(product)
    setShowStockModal(true)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      stock_qty: product.stock_qty.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      price: product.price.toString(),
      tax_rate: product.tax_rate?.toString() || '20'
    })
    setShowEditModal(true)
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/products/${editingProduct?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: formData.sku,
          name: formData.name,
          unit: formData.unit,
          stock_qty: parseInt(formData.stock_qty),
          low_stock_threshold: parseInt(formData.low_stock_threshold),
          price: parseFloat(formData.price),
          tax_rate: parseFloat(formData.tax_rate)
        })
      })

      if (response.ok) {
        toast.success('Produit modifié avec succès')
        setShowEditModal(false)
        setEditingProduct(null)
        setFormData({ sku: '', name: '', unit: '', stock_qty: '', low_stock_threshold: '', price: '', tax_rate: '20' })
        fetchProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la modification')
      }
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleToggleProductStatus = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(product.active ? 'Produit désactivé' : 'Produit activé')
        fetchProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la modification')
      }
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const lowStockProducts = products.filter(p => p.stock_qty <= p.low_stock_threshold && p.active)

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
          Gestion du Stock
        </h1>
        {can('products', 'create') && (
          <Button onClick={() => setShowCreateModal(true)}>
            ➕ Nouveau produit
          </Button>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <SearchInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value)
            setCurrentPage(1)
          }}
          placeholder="Rechercher par nom ou SKU..."
          className="min-w-80 max-w-lg"
        />
        
        <StatusFilterButtons
          currentFilter={statusFilter}
          onFilterChange={(filter) => {
            setStatusFilter(filter)
            setCurrentPage(1)
          }}
          counts={counts}
          showLowStock={true}
        />
      </div>

      {/* Alertes stock bas */}
      {lowStockProducts.length > 0 && (
        <Card className="mb-6 p-4 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                Stock bas détecté
              </h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                {lowStockProducts.length} produit(s) nécessite(nt) un réapprovisionnement
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{products.length}</div>
          <div className="text-sm text-gray-600">Total produits</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {products.filter(p => p.active).length}
          </div>
          <div className="text-sm text-gray-600">Produits actifs</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
          <div className="text-sm text-gray-600">Stock bas</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">
            {products.reduce((sum, p) => sum + p.stock_qty, 0)}
          </div>
          <div className="text-sm text-gray-600">Total en stock</div>
        </Card>
      </div>

      {/* Liste des produits */}
      {paginatedItems.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm 
              ? `Aucun produit ne correspond à "${searchTerm}"`
              : 'Commencez par ajouter votre premier produit au stock'
            }
          </p>
          {!searchTerm && can('products', 'create') && (
            <Button onClick={() => setShowCreateModal(true)}>
              ➕ Ajouter le premier produit
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedItems.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {product.sku}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                    {product.stock_qty <= product.low_stock_threshold && product.active && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        ⚠️ Stock bas
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-2">
                    <span>Stock: {product.stock_qty} {product.unit}</span>
                    <span>Seuil: {product.low_stock_threshold} {product.unit}</span>
                    <span>Prix: {Number(product.price).toFixed(2)}€</span>
                    <span>TVA: {product.tax_rate}%</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Créé le: {new Date(product.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex gap-2">
                  {can('stock', 'create') && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openStockModal(product)}
                    >
                      📊 Mouvement
                    </Button>
                  )}
                  {can('products', 'update') && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {can('products', 'delete') && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleProductStatus(product)}
                    >
                      {product.active ? '⏸️ Désactiver' : '▶️ Activer'}
                    </Button>
                  )}
                </div>
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

      {/* Modal de création de produit */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Nouveau produit</h2>
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                ✕
              </Button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU *</label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    placeholder="PROD-001"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Unité *</label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="boîte, flacon..."
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nom du produit"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock initial *</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock_qty}
                    onChange={(e) => setFormData({...formData, stock_qty: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Seuil d'alerte *</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({...formData, low_stock_threshold: e.target.value})}
                    placeholder="5"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Prix HT *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="10.00"
                    required
                  />
                </div>
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
              
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Créer le produit
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal de mouvement de stock */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Mouvement de stock</h2>
              <Button variant="outline" size="sm" onClick={() => setShowStockModal(false)}>
                ✕
              </Button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="font-medium">{selectedProduct.name}</div>
              <div className="text-sm text-gray-600">
                Stock actuel: {selectedProduct.stock_qty} {selectedProduct.unit}
              </div>
            </div>
            
            <form onSubmit={handleStockMovement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type de mouvement *</label>
                <select
                  value={stockFormData.type}
                  onChange={(e) => setStockFormData({...stockFormData, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="in">Entrée de stock</option>
                  <option value="out">Sortie de stock</option>
                  <option value="adjust">Ajustement</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Quantité *</label>
                <Input
                  type="number"
                  min="1"
                  value={stockFormData.quantity}
                  onChange={(e) => setStockFormData({...stockFormData, quantity: e.target.value})}
                  placeholder="10"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Raison</label>
                <textarea
                  value={stockFormData.reason}
                  onChange={(e) => setStockFormData({...stockFormData, reason: e.target.value})}
                  placeholder="Raison du mouvement (optionnel)"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowStockModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Enregistrer le mouvement
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal d'édition de produit */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Modifier le produit</h2>
              <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>
                ✕
              </Button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU *</label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    placeholder="PROD-001"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nom du produit"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Unité *</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  placeholder="pièce, kg, ml..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock actuel *</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock_qty}
                    onChange={(e) => setFormData({...formData, stock_qty: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Seuil d'alerte *</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({...formData, low_stock_threshold: e.target.value})}
                    placeholder="5"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prix HT *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="10.00"
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
                  Modifier le produit
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
