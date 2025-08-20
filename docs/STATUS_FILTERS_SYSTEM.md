# Système de Filtres par Statut

## 🎯 Problème Résolu

### **Gestion des éléments inactifs**
- **Problème** : Les produits et prestations désactivés disparaissaient complètement
- **Cause** : Filtrage côté serveur pour ne récupérer que les éléments actifs
- **Solution** : Système de filtres côté client avec affichage différencié

## 🔧 Améliorations Apportées

### **1. API Routes Modifiées**

#### **Services API** (`/api/services/route.ts`)
```typescript
// AVANT - Seulement les actifs
const services = await prisma.service.findMany({
  where: { 
    clinic_id: profile.clinicId,
    active: true  // ❌ Filtrage côté serveur
  },
  orderBy: [{ name: 'asc' }],
})

// APRÈS - Tous les services
const services = await prisma.service.findMany({
  where: { 
    clinic_id: profile.clinicId  // ✅ Pas de filtre actif
  },
  orderBy: [{ name: 'asc' }],
})
```

#### **Produits API** (`/api/products/route.ts`)
```typescript
// Même modification appliquée
const products = await prisma.product.findMany({
  where: { 
    clinic_id: profile.clinicId  // ✅ Récupération de tous les produits
  },
  orderBy: [{ name: 'asc' }],
})
```

### **2. Système de Filtres Côté Client**

#### **État de filtre**
```typescript
// Services
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')

// Inventaire (avec filtre stock bas)
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'low_stock'>('active')
```

#### **Logique de filtrage**
```typescript
const filteredItems = items.filter(item => {
  // Filtre par recherche
  const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  
  // Filtre par statut
  const matchesStatus = statusFilter === 'all' || 
    (statusFilter === 'active' && item.active) ||
    (statusFilter === 'inactive' && !item.active) ||
    (statusFilter === 'low_stock' && item.active && item.stock_qty <= item.low_stock_threshold)
  
  return matchesSearch && matchesStatus
})
```

### **3. Interface Utilisateur**

#### **Boutons de filtre**
```typescript
<div className="flex gap-2">
  <Button
    variant={statusFilter === 'active' ? 'primary' : 'outline'}
    size="sm"
    onClick={() => {
      setStatusFilter('active')
      setCurrentPage(1)
    }}
  >
    ✅ Actifs ({items.filter(i => i.active).length})
  </Button>
  <Button
    variant={statusFilter === 'inactive' ? 'primary' : 'outline'}
    size="sm"
    onClick={() => {
      setStatusFilter('inactive')
      setCurrentPage(1)
    }}
  >
    ⏸️ Inactifs ({items.filter(i => !i.active).length})
  </Button>
  <Button
    variant={statusFilter === 'all' ? 'primary' : 'outline'}
    size="sm"
    onClick={() => {
      setStatusFilter('all')
      setCurrentPage(1)
    }}
  >
    📋 Tous ({items.length})
  </Button>
  
  {/* Bouton spécialisé pour inventaire */}
  <Button
    variant={statusFilter === 'low_stock' ? 'primary' : 'outline'}
    size="sm"
    onClick={() => {
      setStatusFilter('low_stock')
      setCurrentPage(1)
    }}
    className={lowStockItems.length > 0 ? 'border-orange-300 text-orange-700 dark:text-orange-300' : ''}
  >
    ⚠️ Stock bas ({lowStockItems.length})
  </Button>
</div>
```

#### **Indicateurs visuels**
```typescript
// Badge de statut sur chaque élément
<span className={`px-2 py-1 text-xs font-medium rounded-full ${
  item.active 
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}`}>
  {item.active ? 'Active' : 'Inactive'}
</span>
```

## 📋 Fonctionnalités Disponibles

### **Filtres de Statut**
- ✅ **Actifs** : Affiche seulement les éléments actifs (par défaut)
- ✅ **Inactifs** : Affiche seulement les éléments désactivés
- ✅ **Tous** : Affiche tous les éléments (actifs + inactifs)

### **Filtres Spécialisés (Inventaire)**
- ⚠️ **Stock bas** : Affiche seulement les produits actifs avec stock ≤ seuil d'alerte

### **Indicateurs Visuels**
- ✅ **Badges de statut** : "Active" en vert, "Inactive" en gris
- ✅ **Compteurs** : Nombre d'éléments par statut
- ✅ **Boutons actifs** : Mise en évidence du filtre sélectionné

### **Actions Disponibles**
- ✅ **Modifier** : Fonctionne sur actifs et inactifs
- ✅ **Désactiver** : Transforme actif → inactif
- ✅ **Activer** : Transforme inactif → actif
- ✅ **Recherche** : Fonctionne sur tous les éléments

## 🔄 Flux Utilisateur

### **Réactivation d'un élément**
1. **Filtre "Inactifs"** → Voir les éléments désactivés
2. **Cliquer "Activer"** → L'élément devient actif
3. **Filtre "Actifs"** → L'élément apparaît dans la liste active

### **Désactivation d'un élément**
1. **Filtre "Actifs"** → Voir les éléments actifs
2. **Cliquer "Désactiver"** → L'élément devient inactif
3. **Filtre "Inactifs"** → L'élément apparaît dans la liste inactive

### **Recherche globale**
1. **Filtre "Tous"** → Voir tous les éléments
2. **Recherche** → Trouver un élément spécifique
3. **Action** → Modifier/activer/désactiver directement

## ✅ Avantages du Système

### **Pour l'utilisateur**
- 🎯 **Visibilité complète** : Voir tous les éléments
- 🔄 **Réactivation facile** : Accès direct aux inactifs
- 📊 **Statistiques** : Compteurs par statut
- 🔍 **Recherche globale** : Trouver n'importe quel élément

### **Pour l'application**
- 🚀 **Performance** : Filtrage côté client
- 💾 **Données complètes** : Pas de perte d'information
- 🎨 **UX améliorée** : Interface intuitive
- 🔒 **Sécurité** : Contrôle d'accès maintenu

## 📝 Notes Importantes

- **Filtre par défaut** : "Actifs" pour éviter la confusion
- **Pagination** : Reset à la page 1 lors du changement de filtre
- **Recherche** : Fonctionne sur tous les éléments filtrés
- **Permissions** : Contrôles d'accès maintenus côté serveur
- **Responsive** : Interface adaptée mobile/desktop
