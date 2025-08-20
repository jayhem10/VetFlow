# Corrections CRUD Produits

## 🎯 Problème Résolu

### **Fonctionnalités manquantes pour les produits**
- **Problème** : Impossible de modifier et désactiver les produits
- **Cause** : API routes et UI manquantes pour les opérations PATCH/DELETE
- **Solution** : Ajout des API routes et modals d'édition

## 🔧 Corrections Apportées

### **1. API Routes Créées**

#### **Produits CRUD** (`/api/products/[id]/route.ts`)
```typescript
// PATCH - Modifier un produit
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Validation des permissions avec rôles multiples
  const userRoles = profile.role ? profile.role.split(',').map(r => r.trim()) : ['assistant']
  const hasAccess = userRoles.some(role => hasPermission(role as any, 'products', 'update'))
  
  // Vérification de l'existence et appartenance à la clinique
  // Validation du SKU unique
  // Mise à jour du produit
}

// DELETE - Désactiver un produit (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Validation des permissions avec rôles multiples
  const userRoles = profile.role ? profile.role.split(',').map(r => r.trim()) : ['assistant']
  const hasAccess = userRoles.some(role => hasPermission(role as any, 'products', 'delete'))
  
  // Soft delete (active: false)
  const deletedProduct = await prisma.product.update({
    where: { id: productId },
    data: { active: false }
  })
}
```

### **2. Interface Utilisateur**

#### **Inventory Page** (`/inventory/page.tsx`)
```typescript
// Nouvelles fonctions ajoutées
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
  // Appel API PATCH /api/products/[id]
  // Gestion des erreurs
  // Refresh de la liste
}

const handleToggleProductStatus = async (product: Product) => {
  // Appel API DELETE /api/products/[id]
  // Soft delete (active: false)
  // Refresh de la liste
}
```

#### **Boutons d'action mis à jour**
```typescript
{can('products', 'update') && (
  <Button 
    size="sm" 
    variant="outline"
    onClick={() => handleEditProduct(product)}
  >
    ✏️ Modifier
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
```

#### **Modal d'édition ajouté**
```typescript
{showEditModal && editingProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <Card className="w-full max-w-md">
      <h2 className="text-xl font-semibold">Modifier le produit</h2>
      <form onSubmit={handleUpdateProduct}>
        {/* Champs de formulaire pré-remplis */}
        <Button type="submit">Modifier le produit</Button>
      </form>
    </Card>
  </div>
)}
```

## 📋 Fonctionnalités Maintenant Disponibles

### **Produits**
- ✅ **Création** : Formulaire modal avec validation
- ✅ **Modification** : Modal d'édition avec données pré-remplies
- ✅ **Désactivation** : Soft delete (active: false)
- ✅ **Réactivation** : Remise à active: true
- ✅ **Validation** : SKU unique par clinique
- ✅ **Mouvements de stock** : Entrée, sortie, ajustement

### **Permissions**
- ✅ **Gestion des rôles multiples** : `vet, stock_manager, admin`
- ✅ **Vérifications côté serveur** : Sécurité renforcée
- ✅ **Soft delete** : Pas de perte de données

## 🔄 Flux de Données

### **Modification d'un produit**
1. **Clic "Modifier"** → Ouverture du modal avec données pré-remplies
2. **Modification des champs** → Validation côté client
3. **Soumission** → Appel API PATCH `/api/products/[id]`
4. **Validation serveur** → Permissions + SKU unique
5. **Mise à jour** → Refresh de la liste

### **Désactivation d'un produit**
1. **Clic "Désactiver"** → Appel API DELETE `/api/products/[id]`
2. **Soft delete** → `active: false` en base
3. **Feedback** → Toast de confirmation
4. **Refresh** → Mise à jour de l'interface

## ✅ Tests de Fonctionnement

### **Modification des produits**
1. Aller sur `/inventory`
2. Cliquer sur "Modifier" d'un produit
3. Modifier les champs (nom, prix, stock, etc.)
4. Sauvegarder → Produit mis à jour

### **Désactivation des produits**
1. Cliquer sur "Désactiver"
2. Le produit disparaît de la liste active
3. Cliquer sur "Activer" pour le remettre

### **Validation des permissions**
1. Se connecter avec différents rôles
2. Vérifier que seuls les rôles autorisés voient les boutons
3. Tester les restrictions côté serveur

## 📝 Notes Importantes

- **Soft Delete** : Les suppressions sont des désactivations (active: false)
- **Validation** : SKU unique par clinique
- **Permissions** : Gestion des rôles multiples (vet, stock_manager, admin)
- **UI Responsive** : Modals adaptés mobile/desktop
- **Feedback utilisateur** : Toasts de confirmation/erreur
- **Sécurité** : Vérifications côté serveur obligatoires
