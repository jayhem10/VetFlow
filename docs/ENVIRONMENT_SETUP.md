# Configuration des Variables d'Environnement

## 🔧 Variables Requises

Pour que le système de période d'essai et de paiement fonctionne, vous devez configurer les variables suivantes :

### 📊 Base de Données
```env
DATABASE_URL="postgresql://username:password@localhost:5432/vetflow"
```

### 🔐 NextAuth
```env
NEXTAUTH_URL="http://localhost:3000"  # ou votre domaine en production
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

### 💳 Stripe (Système de Paiement)
```env
STRIPE_SECRET_KEY="sk_test_..."  # Clé secrète Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."  # Clé publique Stripe
```

## 🏗️ Configuration Stripe

### 1. Créer un compte Stripe
1. Allez sur https://stripe.com
2. Créez un compte
3. Récupérez vos clés de test dans le tableau de bord

### 2. Créer les produits dans Stripe
Vous devez créer 3 produits dans votre tableau de bord Stripe avec les IDs suivants :

```
price_starter_monthly = Plan Starter à 29€/mois
price_professional_monthly = Plan Professional à 59€/mois  
price_enterprise_monthly = Plan Enterprise à 99€/mois
```

### 3. Configurer les webhooks (optionnel)
Pour gérer automatiquement les changements d'abonnement :
- URL: `https://votre-domaine.com/api/stripe/webhook`
- Événements à écouter :
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`

## 🚀 Démarrage Rapide

1. Copiez votre fichier `.env.local` :
```bash
cp .env.example .env.local
```

2. Remplissez les variables Stripe dans `.env.local`

3. Créez les produits dans Stripe avec les IDs mentionnés

4. Testez le système :
```bash
npm run dev
# Allez sur http://localhost:3000/api/test-trial
```

## 🧪 Test du Système

Le système est maintenant configuré avec :

- ✅ **Période d'essai** : 14 jours automatiquement à l'inscription
- ✅ **Notification** : Affichage du décompte des jours restants
- ✅ **Restriction** : Redirection forcée vers `/payment` après expiration
- ✅ **Paiement** : Intégration Stripe avec 3 plans tarifaires
- ✅ **Activation** : Accès restauré après paiement réussi

## 🔍 Points de Test

1. **Inscription** : Vérifiez que `trialEndDate` est définie à +14 jours
2. **Notification** : Testez l'affichage avec différents nombres de jours restants
3. **Expiration** : Testez la redirection quand `now() > trialEndDate`
4. **Paiement** : Testez le checkout Stripe (mode test)
5. **Activation** : Vérifiez que l'accès est restauré après paiement

## 🚨 Variables Optionnelles

```env
# Email (pour les notifications)
RESEND_API_KEY="re_..."

# SMS (pour les rappels)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"

# Stockage de fichiers
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="vetflow-files"
```
