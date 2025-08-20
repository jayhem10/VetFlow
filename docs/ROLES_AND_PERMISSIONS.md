# Système de Rôles et Permissions

## 📋 Rôles Disponibles

### 👑 **Admin** (`admin`)
**Accès complet à toutes les fonctionnalités**
- Dashboard, animaux, propriétaires, rendez-vous
- Gestion de l'équipe (collaborateurs)
- Gestion complète des prestations et du stock
- Création et gestion des factures
- Paramètres de la clinique

### 🏥 **Vétérinaire** (`vet`)
**Accès médical et facturation**
- Dashboard, animaux, propriétaires, rendez-vous
- Consultation des prestations et du stock (lecture seule)
- Création de factures depuis les rendez-vous
- Gestion des dossiers médicaux
- Pas d'accès à la gestion de l'équipe

### 💼 **Assistant** (`assistant`)
**Accès administratif**
- Dashboard, animaux, propriétaires, rendez-vous
- Consultation des prestations et du stock (lecture seule)
- Pas d'accès à la facturation
- Pas d'accès à la gestion de l'équipe

### 📦 **Gestionnaire de Stock** (`stock_manager`)
**Gestion des stocks et prestations**
- Dashboard, consultation animaux/propriétaires/RDV
- Gestion complète des prestations (CRUD)
- Gestion complète du stock (CRUD)
- Création de factures
- Pas d'accès à la gestion de l'équipe

## 🔐 Matrice des Permissions

| Ressource | Admin | Vétérinaire | Assistant | Stock Manager |
|-----------|-------|-------------|-----------|---------------|
| **Dashboard** | ✅ Lecture | ✅ Lecture | ✅ Lecture | ✅ Lecture |
| **Animaux** | ✅ CRUD | ✅ CRUD (pas supprimer) | ✅ CRUD (pas supprimer) | ✅ Lecture |
| **Propriétaires** | ✅ CRUD | ✅ CRUD (pas supprimer) | ✅ CRUD (pas supprimer) | ✅ Lecture |
| **Rendez-vous** | ✅ CRUD | ✅ CRUD (pas supprimer) | ✅ CRUD (pas supprimer) | ✅ Lecture |
| **Équipe** | ✅ CRUD | ❌ | ❌ | ❌ |
| **Prestations** | ✅ CRUD | ✅ Lecture | ✅ Lecture | ✅ CRUD |
| **Produits** | ✅ CRUD | ✅ Lecture | ✅ Lecture | ✅ CRUD |
| **Stock** | ✅ CRUD | ✅ Lecture | ✅ Lecture | ✅ CRUD |
| **Factures** | ✅ CRUD | ✅ CRUD (pas supprimer) | ✅ Lecture | ✅ CRUD (pas supprimer) |
| **Dossiers médicaux** | ✅ CRUD | ✅ CRUD (pas supprimer) | ❌ | ❌ |

## 🎯 Rôles dans les Formulaires

### **Création de Profil** (`ProfileCreationForm`)
```typescript
const roleOptions = [
  { value: 'owner', label: 'Propriétaire de clinique' }, // → admin
  { value: 'vet', label: 'Vétérinaire' },
  { value: 'assistant', label: 'Assistant(e) vétérinaire' },
  { value: 'stock_manager', label: 'Gestionnaire de stock' },
]
```

### **Invitation Collaborateur** (`InviteCollaboratorModal`)
```typescript
role: z.enum(['vet', 'assistant', 'stock_manager'])
```

### **Modification Collaborateur** (`EditCollaboratorModal`)
```typescript
role: z.enum(['vet', 'assistant', 'stock_manager'])
```

## 🔄 Mapping des Rôles

Le système inclut un mapping automatique pour assurer la compatibilité :

```typescript
const roleMap = {
  'veterinarian': 'vet',        // Ancien nom → nouveau
  'owner': 'admin',             // Propriétaire → admin
  'vet': 'vet',                 // Déjà correct
  'assistant': 'assistant',     // Déjà correct
  'stock_manager': 'stock_manager', // Déjà correct
  'admin': 'admin'              // Déjà correct
}
```

## 🚀 Utilisation

### **Vérification des permissions**
```typescript
import { usePermissions } from '@/hooks/usePermissions'

const { can, userRole } = usePermissions()

// Vérifier une permission
if (can('services', 'create')) {
  // Afficher le bouton "Créer prestation"
}

// Vérifier le rôle
if (userRole === 'admin') {
  // Accès complet
}
```

### **Affichage conditionnel**
```typescript
{can('services', 'create') && (
  <Button onClick={createService}>
    ➕ Nouvelle prestation
  </Button>
)}
```

### **Menu dynamique**
```typescript
const { menuItems } = usePermissions()
// menuItems contient les éléments selon le rôle
```

## 📝 Notes Importantes

1. **Rôle par défaut** : `assistant` si aucun rôle n'est défini
2. **Admin automatique** : Si le rôle contient "admin", l'utilisateur devient admin
3. **Compatibilité** : Les anciens rôles sont automatiquement mappés
4. **Sécurité** : Vérifications côté serveur ET client
5. **Évolutivité** : Facile d'ajouter de nouveaux rôles et permissions
