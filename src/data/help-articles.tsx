import React from 'react'
import { BookOpen, Users, Calendar, PawPrint, ShoppingBag, FileText, Settings, CreditCard, Building2, UserCog, Package } from 'lucide-react'

export type HelpArticle = {
  id: string
  title: string
  description: string
  content: React.ReactNode
  popular?: boolean
}

export type HelpCategory = {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  articles: HelpArticle[]
}

// Composant pour les étapes avec numérotation
const Step = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
      {number}
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <div className="text-gray-600 dark:text-gray-300 text-sm">
        {children}
      </div>
    </div>
  </div>
)

// Composant pour les alertes colorées
const Alert = ({ type, title, children }: { type: 'info' | 'warning' | 'success'; title: string; children: React.ReactNode }) => {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400',
    success: 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400'
  }
  
  const titleStyles = {
    info: 'text-blue-800 dark:text-blue-200',
    warning: 'text-amber-800 dark:text-amber-200',
    success: 'text-green-800 dark:text-green-200'
  }
  
  const contentStyles = {
    info: 'text-blue-700 dark:text-blue-300',
    warning: 'text-amber-700 dark:text-amber-300',
    success: 'text-green-700 dark:text-green-300'
  }

  return (
    <div className={`${styles[type]} p-4 rounded mb-6`}>
      <h4 className={`font-semibold ${titleStyles[type]} mb-2`}>{title}</h4>
      <div className={`text-sm ${contentStyles[type]}`}>
        {children}
      </div>
    </div>
  )
}

// Composant pour les listes avec puces
const List = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 text-sm mb-4">
    {children}
  </ul>
)

// Composant pour les conseils
const TipsBox = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">💡 Conseils pratiques</h4>
    <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
      {children}
    </div>
  </div>
)

export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Premiers pas',
    icon: <BookOpen className="h-5 w-5" />,
    description: 'Configuration initiale et prise en main de VetFlow',
    articles: [
      {
        id: 'setup-clinic',
        title: 'Configurer ma clinique',
        description: 'Comment paramétrer les informations de base de votre clinique',
        content: (
          <div className="space-y-6">
            <Alert type="info" title="📋 Configuration de base">
              Commencez par renseigner les informations essentielles de votre clinique pour personnaliser VetFlow.
            </Alert>

            <Step number={1} title="Accédez aux paramètres">
              Cliquez sur <span className="font-medium">"Paramètres clinique"</span> dans le menu principal
            </Step>

            <Step number={2} title="Complétez les informations essentielles">
              <List>
                <li>Nom de la clinique</li>
                <li>Adresse complète</li>
                <li>Téléphone principal</li>
                <li>Email de contact</li>
              </List>
            </Step>

            <Step number={3} title="Personnalisez avec votre logo">
              Ajoutez votre logo pour qu'il apparaisse sur l'interface et les documents
            </Step>

            <Step number={4} title="Configurez vos horaires">
              Définissez les horaires d'ouverture par défaut (modifiables pour chaque vétérinaire)
            </Step>

            <TipsBox>
              <p>• Ces données apparaîtront sur vos factures et communications</p>
              <p>• Le logo s'affiche sur le tableau de bord et les documents</p>
              <p>• Les horaires peuvent être personnalisés par vétérinaire</p>
            </TipsBox>
          </div>
        ),
        popular: true
      },
      {
        id: 'invite-team',
        title: 'Inviter mon équipe',
        description: 'Comment ajouter des collaborateurs et gérer les rôles',
        content: (
          <div className="space-y-6">
            <Alert type="info" title="👥 Gestion d'équipe">
              Invitez vos collaborateurs et attribuez-leur les bons rôles selon leurs responsabilités.
            </Alert>

            <Step number={1} title="Accédez à la gestion d'équipe">
              Rendez-vous dans <span className="font-medium">"Collaborateurs"</span> depuis le menu
            </Step>

            <Step number={2} title="Cliquez sur 'Inviter un collaborateur'">
              Bouton visible en haut à droite de la liste
            </Step>

            <Step number={3} title="Remplissez les informations">
              <List>
                <li>Email du collaborateur</li>
                <li>Prénom et nom</li>
                <li>Rôle(s) à attribuer</li>
              </List>
            </Step>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">🎯 Rôles disponibles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Administrateur :</span> accès complet
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Vétérinaire :</span> consultations et dossiers
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Assistant(e) :</span> gestion de base
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Gestionnaire stock :</span> inventaire
                </div>
              </div>
            </div>

            <TipsBox>
              <p>• Chaque rôle a des permissions spécifiques</p>
              <p>• Vous pouvez modifier les rôles à tout moment</p>
              <p>• L'invitation est envoyée par email automatiquement</p>
            </TipsBox>
          </div>
        )
      },
      {
        id: 'first-patient',
        title: 'Créer mon premier patient',
        description: 'Enregistrer votre premier animal et propriétaire',
        content: (
          <div className="space-y-6">
            <Alert type="warning" title="⚠️ Important : Ordre obligatoire">
              Vous devez créer le propriétaire AVANT l'animal
            </Alert>

            <div>
              <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">🧑‍🦱 Étape 1 : Créer le propriétaire</h4>
              <div className="space-y-4">
                <Step number={1} title="Allez dans 'Propriétaires'">
                  Depuis le menu principal
                </Step>
                <Step number={2} title="Cliquez sur 'Nouveau propriétaire'">
                  Bouton visible en haut de la liste
                </Step>
                <Step number={3} title="Remplissez les informations">
                  <List>
                    <li>Prénom et nom</li>
                    <li>Téléphone (pour les rappels)</li>
                    <li>Email (notifications automatiques)</li>
                    <li>Adresse complète</li>
                  </List>
                </Step>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">🐕 Étape 2 : Ajouter l'animal</h4>
              <div className="space-y-4">
                <Step number={1} title="Allez dans 'Animaux'">
                  Ou depuis la fiche du propriétaire créé
                </Step>
                <Step number={2} title="Recherchez et sélectionnez le propriétaire">
                  Tapez son nom dans le champ de recherche
                </Step>
                <Step number={3} title="Complétez les informations de l'animal">
                  <List>
                    <li>Nom de l'animal</li>
                    <li>Espèce (chien, chat, NAC...)</li>
                    <li>Race, sexe, date de naissance</li>
                    <li>Poids, couleur</li>
                    <li>Numéro de puce/tatouage</li>
                    <li>Photos (optionnelles mais utiles)</li>
                  </List>
                </Step>
              </div>
            </div>

            <TipsBox>
              <p>• Les photos aident à identifier rapidement l'animal</p>
              <p>• Le poids sera suivi à chaque consultation</p>
              <p>• L'historique médical se construit automatiquement</p>
              <p>• Un propriétaire peut avoir plusieurs animaux</p>
            </TipsBox>
          </div>
        )
      }
    ]
  },
  {
    id: 'appointments',
    title: 'Rendez-vous',
    icon: <Calendar className="h-5 w-5" />,
    description: 'Planning, réservations et gestion des consultations',
    articles: [
      {
        id: 'create-appointment',
        title: 'Créer un rendez-vous',
        description: 'Planifier une consultation pour un patient',
        content: (
          <div className="space-y-6">
            <Alert type="info" title="📋 Processus étape par étape">
              Suivez ces étapes dans l'ordre pour créer un rendez-vous
            </Alert>
            
            <Step number={1} title="Cliquez sur 'Nouveau RDV' dans le planning">
              Ou cliquez directement sur un créneau libre
            </Step>
            
            <Step number={2} title="Recherchez et sélectionnez le propriétaire">
              Tapez le nom du propriétaire dans le champ de recherche
            </Step>
            
            <Step number={3} title="Choisissez l'animal du propriétaire">
              La liste des animaux du propriétaire s'affiche automatiquement
            </Step>
            
            <Step number={4} title="Configurez le rendez-vous">
              Date, heure, vétérinaire, type de consultation
            </Step>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">🎯 Types de rendez-vous</h4>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div><span className="font-medium">Consultation :</span> visite standard</div>
                <div><span className="font-medium">Vaccination :</span> rappels et primo</div>
                <div><span className="font-medium">Chirurgie :</span> interventions</div>
                <div><span className="font-medium">Urgence :</span> priorité élevée</div>
              </div>
            </div>
          </div>
        ),
        popular: true
      },
      {
        id: 'appointment-status',
        title: 'Statuts des rendez-vous',
        description: 'Comprendre et modifier les statuts de RDV',
        content: (
          <div className="space-y-6">
            <Alert type="info" title="📊 Gestion des statuts">
              Les statuts vous aident à suivre l'avancement de vos consultations
            </Alert>

            <div className="space-y-4">
              <div className="border dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Statuts disponibles</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300"><span className="font-medium">Programmé :</span> RDV planifié</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300"><span className="font-medium">Confirmé :</span> client a confirmé</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300"><span className="font-medium">En cours :</span> consultation active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300"><span className="font-medium">Terminé :</span> consultation finie</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300"><span className="font-medium">Annulé :</span> RDV annulé</span>
                  </div>
                </div>
              </div>
            </div>

            <TipsBox>
              <p>• Cliquez sur un RDV dans le planning pour changer son statut</p>
              <p>• Les statuts "Terminé" permettent de générer automatiquement les factures</p>
              <p>• Les notifications automatiques sont envoyées selon les statuts</p>
            </TipsBox>
          </div>
        )
      }
    ]
  },
  {
    id: 'patients',
    title: 'Patients & Propriétaires',
    icon: <PawPrint className="h-5 w-5" />,
    description: 'Gestion des animaux et de leurs propriétaires',
    articles: [
      {
        id: 'patient-files',
        title: 'Dossiers médicaux',
        description: 'Créer et gérer les dossiers de santé des animaux',
        content: (
          <div className="space-y-6">
            <Alert type="info" title="📋 Dossiers médicaux">
              Centralisez toutes les informations de santé de vos patients
            </Alert>

            <Step number={1} title="Accédez au dossier du patient">
              Depuis la liste des animaux ou lors d'un rendez-vous
            </Step>

            <Step number={2} title="Ajoutez une consultation">
              Cliquez sur "Nouvelle consultation" ou "Ajouter des notes"
            </Step>

            <Step number={3} title="Remplissez les informations médicales">
              <List>
                <li>Motif de consultation</li>
                <li>Examen clinique</li>
                <li>Diagnostic</li>
                <li>Traitement prescrit</li>
                <li>Recommandations</li>
              </List>
            </Step>

            <TipsBox>
              <p>• L'historique médical se construit automatiquement</p>
              <p>• Vous pouvez attacher des photos et documents</p>
              <p>• Les vaccinations sont trackées automatiquement</p>
            </TipsBox>
          </div>
        ),
        popular: true
      }
    ]
  },
  {
    id: 'inventory',
    title: 'Stock & Prestations',
    icon: <Package className="h-5 w-5" />,
    description: 'Gestion des produits, médicaments et services',
    articles: [
      {
        id: 'manage-inventory',
        title: 'Gérer le stock',
        description: 'Comment suivre vos produits et médicaments',
        content: (
          <div className="space-y-6">
            <Alert type="info" title="📦 Gestion de stock">
              Suivez vos produits et médicaments pour éviter les ruptures
            </Alert>

            <Step number={1} title="Ajoutez vos produits">
              Allez dans "Stock" et cliquez sur "Nouveau produit"
            </Step>

            <Step number={2} title="Configurez les alertes">
              Définissez des seuils minimums pour chaque produit
            </Step>

            <Step number={3} title="Mettez à jour les quantités">
              Lors des réceptions ou utilisations de produits
            </Step>

            <TipsBox>
              <p>• Les alertes de stock bas vous préviennent automatiquement</p>
              <p>• Scannez les codes-barres pour plus de rapidité</p>
              <p>• L'historique des mouvements est conservé</p>
            </TipsBox>
          </div>
        )
      }
    ]
  },
  {
    id: 'billing',
    title: 'Facturation',
    icon: <FileText className="h-5 w-5" />,
    description: 'Génération de factures et suivi des paiements',
    articles: [
      {
        id: 'create-invoice',
        title: 'Créer une facture',
        description: 'Comment facturer vos consultations et produits',
        content: (
          <div className="space-y-6">
            <Alert type="info" title="💰 Facturation">
              Générez facilement vos factures depuis les consultations
            </Alert>

            <Step number={1} title="Depuis un rendez-vous terminé">
              Cliquez sur "Générer facture" dans le détail du RDV
            </Step>

            <Step number={2} title="Ajoutez les prestations">
              <List>
                <li>Consultation</li>
                <li>Médicaments utilisés</li>
                <li>Examens complémentaires</li>
                <li>Autres prestations</li>
              </List>
            </Step>

            <Step number={3} title="Vérifiez et validez">
              Contrôlez les montants et envoyez la facture
            </Step>

            <TipsBox>
              <p>• Les factures sont automatiquement numérotées</p>
              <p>• Vous pouvez envoyer par email directement</p>
              <p>• Le suivi des paiements est intégré</p>
            </TipsBox>
          </div>
        ),
        popular: true
      }
    ]
  },
  {
    id: 'settings',
    title: 'Paramètres',
    icon: <Settings className="h-5 w-5" />,
    description: 'Configuration de la clinique et préférences',
    articles: [
      {
        id: 'clinic-settings',
        title: 'Paramètres de la clinique',
        description: 'Configurer les informations et préférences de votre clinique',
        content: (
          <div className="space-y-6">
            <Alert type="info" title="⚙️ Configuration">
              Personnalisez VetFlow selon vos besoins et préférences
            </Alert>

            <div className="space-y-4">
              <div className="border dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sections disponibles</h4>
                <List>
                  <li>Informations générales de la clinique</li>
                  <li>Gestion des abonnements et paiements</li>
                  <li>Personnalisation du logo et des couleurs</li>
                  <li>Paramètres de notification (email, SMS)</li>
                  <li>Configuration des horaires par défaut</li>
                  <li>Préférences de facturation</li>
                </List>
              </div>
            </div>

            <Alert type="warning" title="🔒 Permissions">
              Seuls les administrateurs peuvent modifier ces paramètres pour des raisons de sécurité.
            </Alert>
          </div>
        )
      }
    ]
  }
]
