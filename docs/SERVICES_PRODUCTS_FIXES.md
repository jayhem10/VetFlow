# Corrections Prestations et Produits

## 🎯 Problèmes Résolus

### **1. Erreur `toFixed` sur les prix**
- **Problème** : `service.default_price.toFixed(2)` ne fonctionnait pas
- **Cause** : `default_price` est un `Decimal` de Prisma, pas un `number`
- **Solution** : Conversion en `Number()` avant `toFixed()`

### **2. Permissions mouvements de stock**
- **Problème** : Erreur "Accès non autorisé" pour les mouvements de stock
- **Cause** : Les API routes ne géraient pas les rôles multiples
- **Solution** : Mise à jour des vérifications de permissions

### **3. Fonctionnalités manquantes**
- **Problème** : Impossible de modifier/supprimer les prestations et produits
- **Cause** : API routes et UI manquantes
- **Solution** : Ajout des API routes et modals d'édition

## 🔧 Corrections Apportées

### **1. Correction de l'erreur `toFixed`**

#### **Services Page** (`/services/page.tsx`)
```typescript
// AVANT
<span>Prix: {service.default_price.toFixed(2)}€</span>

// APRÈS
<span>Prix: {Number(service.default_price).toFixed(2)}€</span>
```

#### **AppointmentDetails** (`AppointmentDetails.tsx`)
```typescript
// AVANT
<div className="font-medium">{service.default_price.toFixed(2)}€</div>

// APRÈS
<div className="font-medium">{Number(service.default_price).toFixed(2)}€</div>
```

### **2. Permissions Mouvements de Stock**

#### **API Route** (`/api/products/[id]/stock/route.ts`)
```typescript
// AVANT
const userRole = (profile.role as any) || 'assistant'
if (!hasPermission(userRole, 'stock', 'create')) {
  return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
}

// APRÈS
const userRoles = profile.role ? profile.role.split(',').map(r => r.trim()) : ['assistant']
const hasAccess = userRoles.some(role => hasPermission(role as any, 'stock', 'create'))
if (!hasAccess) {
  return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
}
```

### **3. Nouvelles API Routes**

#### **Services CRUD** (`/api/services/[id]/route.ts`)
```typescript
// PATCH - Modifier une prestation
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Validation des permissions
  // Vérification de l'existence
  // Mise à jour avec validation du code unique
}

// DELETE - Désactiver une prestation (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Validation des permissions
  // Soft delete (active: false)
}
```

#### **Produits CRUD** (`/api/products/[id]/route.ts`)
```typescript
// PATCH - Modifier un produit
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Validation des permissions
  // Vérification de l'existence
  // Mise à jour avec validation du SKU unique
}

// DELETE - Désactiver un produit (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Validation des permissions
  // Soft delete (active: false)
}
```

### **4. Interface Utilisateur**

#### **Services Page** (`/services/page.tsx`)
```typescript
// Nouvelles fonctions
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
  // Appel API PATCH /api/services/[id]
  // Gestion des erreurs
  // Refresh de la liste
}

const handleToggleServiceStatus = async (service: any) => {
  // Appel API DELETE /api/services/[id]
  // Soft delete (active: false)
  // Refresh de la liste
}
```

#### **Boutons d'action**
```typescript
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
```

#### **Modal d'édition**
```typescript
{showEditModal && editingService && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <Card className="w-full max-w-md">
      <h2 className="text-xl font-semibold">Modifier la prestation</h2>
      <form onSubmit={handleUpdateService}>
        {/* Champs de formulaire pré-remplis */}
        <Button type="submit">Modifier la prestation</Button>
      </form>
    </Card>
  </div>
)}
```

## 📋 Fonctionnalités Ajoutées

### **Prestations**
- ✅ **Création** : Formulaire modal avec validation
- ✅ **Modification** : Modal d'édition avec données pré-remplies
- ✅ **Désactivation** : Soft delete (active: false)
- ✅ **Réactivation** : Remise à active: true
- ✅ **Validation** : Code unique par clinique

### **Produits**
- ✅ **Création** : Formulaire modal avec validation
- ✅ **Modification** : Modal d'édition avec données pré-remplies
- ✅ **Désactivation** : Soft delete (active: false)
- ✅ **Réactivation** : Remise à active: true
- ✅ **Validation** : SKU unique par clinique

### **Mouvements de Stock**
- ✅ **Permissions** : Gestion des rôles multiples
- ✅ **Entrée** : Ajout de stock
- ✅ **Sortie** : Retrait de stock avec vérification
- ✅ **Ajustement** : Correction de stock
- ✅ **Transactions** : Opérations atomiques

## 🔄 Client Prisma Régénéré

```bash
npx prisma generate
```

**Raison** : Les nouveaux modèles n'étaient pas reconnus par TypeScript.

## ✅ Tests de Fonctionnement

### **Prix affichés correctement**
1. Aller sur `/services` ou `/inventory`
2. Vérifier que les prix s'affichent avec 2 décimales
3. Pas d'erreur `toFixed is not a function`

### **Modification des prestations**
1. Aller sur `/services`
2. Cliquer sur "Modifier" d'une prestation
3. Modifier les champs
4. Sauvegarder → Prestation mise à jour

### **Désactivation des prestations**
1. Cliquer sur "Désactiver"
2. La prestation disparaît de la liste active
3. Cliquer sur "Activer" pour la remettre

### **Mouvements de stock**
1. Aller sur `/inventory`
2. Cliquer sur "Mouvement" d'un produit
3. Ajouter/retirer du stock → Plus d'erreur d'autorisation

## 📝 Notes Importantes

- **Soft Delete** : Les suppressions sont des désactivations (active: false)
- **Validation** : Codes et SKUs uniques par clinique
- **Permissions** : Gestion des rôles multiples (vet, stock_manager, etc.)
- **Transactions** : Mouvements de stock atomiques
- **UI Responsive** : Modals adaptés mobile/desktop
