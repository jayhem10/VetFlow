import { toast as hotToast, ToastOptions } from 'react-hot-toast'

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#363636',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
  },
}

const successOptions: ToastOptions = {
  ...defaultOptions,
  icon: '✅',
  style: {
    ...defaultOptions.style,
    background: '#10b981',
  },
}

const errorOptions: ToastOptions = {
  ...defaultOptions,
  icon: '❌',
  style: {
    ...defaultOptions.style,
    background: '#ef4444',
  },
}

const warningOptions: ToastOptions = {
  ...defaultOptions,
  icon: '⚠️',
  style: {
    ...defaultOptions.style,
    background: '#f59e0b',
  },
}

export const toast = {
  success: (message: string, options?: ToastOptions) => 
    hotToast.success(message, { ...successOptions, ...options }),
  
  error: (message: string, options?: ToastOptions) => 
    hotToast.error(message, { ...errorOptions, ...options }),
  
  warning: (message: string, options?: ToastOptions) => 
    hotToast(message, { ...warningOptions, ...options }),
  
  loading: (message: string, options?: ToastOptions) => 
    hotToast.loading(message, { ...defaultOptions, ...options }),
  
  dismiss: hotToast.dismiss,
  
  // Méthodes utilitaires pour le domaine vétérinaire
  appointmentCreated: () => toast.success('Rendez-vous créé avec succès'),
  appointmentUpdated: () => toast.success('Rendez-vous modifié avec succès'),
  appointmentCancelled: () => toast.success('Rendez-vous annulé'),
  
  patientCreated: () => toast.success('Patient ajouté avec succès'),
  patientUpdated: () => toast.success('Patient modifié avec succès'),
  
  ownerCreated: () => toast.success('Propriétaire ajouté avec succès'),
  ownerUpdated: () => toast.success('Propriétaire modifié avec succès'),
  
  serviceCreated: () => toast.success('Prestation créée avec succès'),
  serviceUpdated: () => toast.success('Prestation modifiée avec succès'),
  
  productCreated: () => toast.success('Produit ajouté avec succès'),
  productUpdated: () => toast.success('Produit modifié avec succès'),
  
  stockUpdated: () => toast.success('Stock mis à jour'),
  stockLow: () => toast.warning('Stock bas détecté'),
  
  collaboratorInvited: () => toast.success('Collaborateur invité avec succès'),
  collaboratorUpdated: () => toast.success('Collaborateur modifié avec succès'),
  
  profileCompleted: () => toast.success('Profil complété avec succès'),
  passwordChanged: () => toast.success('Mot de passe modifié avec succès'),
  
  // Système de paiement
  subscriptionActivated: () => toast.success('Abonnement activé avec succès !'),
  paymentProcessing: () => toast.loading('Traitement du paiement en cours...'),
  trialExpired: () => toast.warning('Votre période d\'essai a expiré'),
  trialReminder: (days: number) => toast.warning(`Il vous reste ${days} jour${days > 1 ? 's' : ''} d'essai`),
} 