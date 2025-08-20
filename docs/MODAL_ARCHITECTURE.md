# Architecture des Modales

## 📋 Vue d'ensemble

Toutes les modales utilisent maintenant le composant `Dialog` de base pour assurer une expérience utilisateur cohérente, responsive et accessible.

## 🎯 Composant Dialog de Base

### **Fonctionnalités :**
- ✅ **Responsive** : S'adapte à toutes les tailles d'écran
- ✅ **Overflow géré** : Scroll automatique si le contenu dépasse
- ✅ **Accessibilité** : ARIA labels, navigation clavier (Escape)
- ✅ **Backdrop** : Fond flouté avec fermeture au clic
- ✅ **Animations** : Transitions fluides
- ✅ **Tailles** : sm, md, lg, xl, 2xl

### **Utilisation :**
```typescript
import { Dialog } from '@/components/atoms/Dialog'

<Dialog
  isOpen={isOpen}
  onClose={onClose}
  title="Titre de la modale"
  size="lg"
>
  {/* Contenu de la modale */}
</Dialog>
```

## 🔧 Modales Refactorisées

### **1. InviteCollaboratorModal**
- ✅ Utilise le composant `Dialog`
- ✅ Taille `lg` pour le formulaire complet
- ✅ Layout responsive (prénom/nom en colonnes)
- ✅ Gestion de l'overflow avec scroll

### **2. EditCollaboratorModal**
- ✅ Utilise le composant `Dialog`
- ✅ Taille `lg` pour le formulaire
- ✅ Informations collaborateur en header
- ✅ Actions en bas avec bordure

## 🎨 Structure Recommandée

### **Layout de base :**
```typescript
<Dialog isOpen={isOpen} onClose={onClose} title="Titre" size="lg">
  <div className="space-y-6">
    {/* Contenu principal */}
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Champs du formulaire */}
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button type="submit">Sauvegarder</Button>
      </div>
    </form>
  </div>
</Dialog>
```

### **Responsive Design :**
```typescript
// Grille responsive pour les champs
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <Input label="Prénom" />
  <Input label="Nom" />
</div>

// Espacement cohérent
<div className="space-y-6"> {/* 6 = 1.5rem */}
  <div className="space-y-2"> {/* 2 = 0.5rem pour les labels */}
    <label>...</label>
    <Input />
  </div>
</div>
```

## 📱 Tailles de Modales

| Taille | Largeur max | Usage |
|--------|-------------|-------|
| **sm** | 24rem (384px) | Alertes, confirmations |
| **md** | 28rem (448px) | Formulaires simples |
| **lg** | 32rem (512px) | Formulaires complexes |
| **xl** | 36rem (576px) | Tableaux, listes |
| **2xl** | 42rem (672px) | Contenu très large |

## 🔄 Gestion de l'Overflow

### **Automatique :**
- Le contenu défile automatiquement si nécessaire
- Header fixe, contenu scrollable
- Boutons d'action toujours visibles

### **Hauteur maximale :**
```css
max-h-[calc(100vh-2rem)] /* 100vh - marges */
```

### **Scroll interne :**
```css
overflow-y-auto /* Scroll vertical automatique */
```

## 🎯 Bonnes Pratiques

### **1. Structure cohérente :**
```typescript
// ✅ Bon
<Dialog title="Titre" size="lg">
  <div className="space-y-6">
    <form className="space-y-6">
      {/* Contenu */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {/* Actions */}
      </div>
    </form>
  </div>
</Dialog>
```

### **2. Responsive :**
```typescript
// ✅ Bon - Grille responsive
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

// ✅ Bon - Espacement adaptatif
<div className="space-y-4 sm:space-y-6">
```

### **3. Accessibilité :**
```typescript
// ✅ Bon - Labels explicites
<label className="block text-sm font-medium mb-2">
  Email *
</label>

// ✅ Bon - Messages d'erreur
{error && (
  <p className="text-sm text-red-600">{error}</p>
)}
```

### **4. États de chargement :**
```typescript
// ✅ Bon - Bouton avec loading
<Button 
  type="submit" 
  disabled={isSubmitting}
  loading={isSubmitting}
>
  {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
</Button>
```

## 🚀 Avantages

1. **Cohérence** : Toutes les modales ont le même comportement
2. **Responsive** : S'adapte automatiquement aux écrans
3. **Accessibilité** : Navigation clavier et ARIA
4. **Performance** : Composant optimisé et réutilisable
5. **Maintenance** : Un seul composant à maintenir

## 📝 Notes Importantes

- **Toujours utiliser `Dialog`** pour les nouvelles modales
- **Taille appropriée** selon le contenu
- **Gestion des erreurs** avec messages clairs
- **États de chargement** pour les actions
- **Responsive** dès la conception
