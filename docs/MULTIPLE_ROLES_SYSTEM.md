# Système de Rôles Multiples

## 📋 Vue d'ensemble

Le système permet maintenant d'attribuer **plusieurs rôles** à un même collaborateur, offrant une flexibilité maximale dans la gestion des permissions.

## 🎯 Rôles Disponibles

### **Rôles de base :**
- **`vet`** : Vétérinaire
- **`assistant`** : Assistant(e) vétérinaire  
- **`stock_manager`** : Gestionnaire de stock
- **`admin`** : Administrateur (protégé)
- **`owner`** : Propriétaire de clinique

### **Combinaisons possibles :**
- `vet, stock_manager` : Vétérinaire + gestionnaire de stock
- `assistant, stock_manager` : Assistant + gestionnaire de stock
- `vet, assistant` : Vétérinaire + assistant
- `admin` : Administrateur (accès complet)

## 🔧 Composant MultiRoleSelect

### **Fonctionnalités :**
- ✅ **Checkboxes multiples** : Sélection de plusieurs rôles
- ✅ **Validation** : Au moins un rôle requis
- ✅ **Protection** : Rôle admin protégé pour le créateur
- ✅ **Descriptions** : Explication de chaque rôle
- ✅ **Affichage** : Rôles sélectionnés en badges
- ✅ **Responsive** : Optimisé mobile
- ✅ **Simplifié** : Pas de checkbox admin redondante

### **Rôle Administrateur :**
Le rôle "Administrateur" dans la sélection des rôles donne automatiquement tous les droits :
- ✅ Inviter d'autres collaborateurs
- ✅ Accéder aux paramètres avancés
- ✅ Gestion complète de la clinique
- ✅ Pas de checkbox séparée nécessaire

### **Utilisation :**
```typescript
import { MultiRoleSelect } from '@/components/molecules/MultiRoleSelect'

<MultiRoleSelect
  value={form.watch('role')}
  onChange={(value) => form.setValue('role', value)}
  label="Rôles professionnels *"
  error={form.formState.errors.role?.message}
/>
```

## 📝 Formulaires Mis à Jour

### **1. Création de Profil** (`ProfileCreationForm`)
- ✅ Remplacé le select simple par `MultiRoleSelect`
- ✅ Validation des rôles multiples
- ✅ Support du rôle `stock_manager`

### **2. Invitation Collaborateur** (`InviteCollaboratorModal`)
- ✅ Remplacé le select simple par `MultiRoleSelect`
- ✅ Permet d'attribuer plusieurs rôles dès l'invitation
- ✅ Validation côté client et serveur

### **3. Modification Collaborateur** (`EditCollaboratorModal`)
- ✅ Remplacé le select simple par `MultiRoleSelect`
- ✅ Permet de modifier les rôles existants
- ✅ Gestion des rôles protégés

### **4. Page Profil** (`/profile`)
- ✅ Affichage des rôles multiples
- ✅ Support du rôle `stock_manager`
- ✅ Badges colorés pour chaque rôle

## 🔐 Système de Permissions

### **Logique de permissions :**
```typescript
// L'utilisateur a tous les droits de ses rôles combinés
const userRoles = ['vet', 'stock_manager']
const permissions = userRoles.flatMap(role => ROLE_PERMISSIONS[role])
```

### **Exemple concret :**
Un utilisateur avec les rôles `vet, stock_manager` aura :
- ✅ Accès aux animaux, propriétaires, rendez-vous (rôle vet)
- ✅ Gestion complète des prestations et stock (rôle stock_manager)
- ✅ Création de factures (rôle vet + stock_manager)

## 🎨 Interface Utilisateur

### **Sélection des rôles :**
```
☑️ Vétérinaire
   Gestion des rendez-vous et dossiers médicaux

☑️ Gestionnaire de stock  
   Gestion des prestations, produits et stock

☐ Assistant(e)
   Accès limité aux fonctionnalités de base
```

### **Affichage des rôles :**
```
Rôles sélectionnés :
[Vétérinaire] [Gestionnaire de stock]
```

## 🔄 Stockage en Base

### **Format en base de données :**
```sql
-- Rôles séparés par des virgules
role = 'vet, stock_manager'
role = 'assistant, stock_manager'
role = 'admin'  -- Rôle unique
```

### **Parsing côté application :**
```typescript
const roles = user.role.split(',').map(r => r.trim())
// ['vet', 'stock_manager']
```

## 🚀 Avantages

1. **Flexibilité** : Un collaborateur peut avoir plusieurs responsabilités
2. **Évolutivité** : Facile d'ajouter de nouveaux rôles
3. **UX améliorée** : Interface claire avec checkboxes
4. **Validation robuste** : Contrôle des rôles valides
5. **Permissions cumulatives** : Droits combinés de tous les rôles

## 📋 Cas d'usage Typiques

### **Vétérinaire + Gestionnaire de stock :**
- Peut gérer les rendez-vous ET le stock
- Idéal pour les petites cliniques

### **Assistant + Gestionnaire de stock :**
- Peut aider aux RDV ET gérer l'inventaire
- Polyvalence maximale

### **Vétérinaire + Assistant :**
- Peut faire des consultations ET du secrétariat
- Flexibilité opérationnelle

## 🔧 Configuration

### **Ajouter un nouveau rôle :**
1. Ajouter dans `AVAILABLE_ROLES` (MultiRoleSelect)
2. Ajouter dans `ROLE_PERMISSIONS` (permissions.ts)
3. Ajouter dans les schémas de validation
4. Mettre à jour la documentation

### **Modifier les permissions :**
```typescript
// Dans lib/permissions.ts
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  new_role: [
    { resource: 'dashboard', actions: ['read'] },
    // ... autres permissions
  ],
}
```

## 📝 Notes Importantes

- **Rôle admin** : Toujours protégé pour le créateur de la clinique
- **Validation** : Vérification côté client ET serveur
- **Rétrocompatibilité** : Les anciens rôles simples fonctionnent toujours
- **Performance** : Parsing optimisé des rôles multiples
