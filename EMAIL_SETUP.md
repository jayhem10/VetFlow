# Configuration Email - Brevo (Sendinblue)

## 🚀 Configuration Brevo

### 1. Créer un compte Brevo
1. Allez sur [brevo.com](https://www.brevo.com)
2. Créez un compte gratuit (300 emails/jour)
3. Vérifiez votre domaine d'envoi

### 2. Obtenir votre clé API
1. Connectez-vous à votre dashboard Brevo
2. Allez dans **Settings** > **API Keys**
3. Créez une nouvelle clé API
4. Copiez la clé API

### 3. Configuration des variables d'environnement

Créez ou modifiez votre fichier `.env.local` :

```bash
# Brevo (Sendinblue) Email Service
BREVO_API_KEY="votre-clé-api-brevo-ici"

# URL de votre application
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Vérification du domaine d'envoi

Pour une meilleure délivrabilité, configurez votre domaine :

1. Dans Brevo, allez dans **Settings** > **Senders & Domains**
2. Ajoutez votre domaine (ex: `vetflow.cloud`)
3. Suivez les instructions pour configurer les enregistrements DNS
4. Attendez la vérification (peut prendre jusqu'à 24h)

### 5. Test de l'envoi d'emails

Une fois configuré, vous pouvez tester en invitant un collaborateur :

1. Connectez-vous à VetFlow
2. Allez dans **Équipe** > **Collaborateurs**
3. Cliquez sur **Inviter un collaborateur**
4. Remplissez le formulaire
5. L'email d'invitation sera envoyé automatiquement

## 📧 Templates d'emails

### Email d'invitation collaborateur
- **Sujet** : `Invitation VetFlow - Rejoignez [Nom de la clinique]`
- **Contenu** : Email HTML avec identifiants temporaires et lien de connexion

### Email de réinitialisation de mot de passe
- **Sujet** : `Réinitialisation de mot de passe - VetFlow`
- **Contenu** : Lien sécurisé pour réinitialiser le mot de passe

## 🔒 Sécurité

### Mots de passe temporaires
- Génération automatique de mots de passe sécurisés (12 caractères)
- Critères : majuscules, minuscules, chiffres
- Expiration : changement obligatoire à la première connexion

### Validation des mots de passe
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre

## 🛠️ Dépannage

### Erreur "BREVO_API_KEY non configurée"
- Vérifiez que la variable `BREVO_API_KEY` est définie dans `.env.local`
- Redémarrez le serveur de développement

### Erreur d'envoi d'email
- Vérifiez votre quota Brevo (300 emails/jour en gratuit)
- Vérifiez que votre domaine est bien configuré
- Consultez les logs dans la console

### Email non reçu
- Vérifiez les spams
- Vérifiez l'adresse email de destination
- Consultez les logs Brevo dans votre dashboard

## 📊 Monitoring

### Logs d'envoi
Les envois d'emails sont loggés dans la console :
```
Email d'invitation envoyé à user@example.com
```

### Dashboard Brevo
- Consultez les statistiques d'envoi
- Vérifiez les taux de délivrabilité
- Surveillez les bounces et plaintes

## 🔄 Migration vers la production

### Variables d'environnement de production
```bash
BREVO_API_KEY="votre-clé-api-brevo-production"
NEXTAUTH_URL="https://vetflow.cloud"
NEXT_PUBLIC_APP_URL="https://vetflow.cloud"
```

### Configuration DNS
Assurez-vous que votre domaine est correctement configuré dans Brevo pour la production.

## 📞 Support

Pour toute question sur la configuration email :
- Documentation Brevo : [docs.brevo.com](https://docs.brevo.com)
- Support VetFlow : [support@vetflow.cloud](mailto:support@vetflow.cloud)
