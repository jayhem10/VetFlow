import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonctions de traduction pour les valeurs de la BDD

export function translateAppointmentStatus(status?: string): string {
  switch (status) {
    case 'scheduled':
      return 'Planifié'
    case 'confirmed':
      return 'Confirmé'
    case 'in_progress':
      return 'En cours'
    case 'completed':
      return 'Terminé'
    case 'cancelled':
      return 'Annulé'
    case 'no_show':
      return 'Absent'
    default:
      return 'Planifié'
  }
}

export function translateAppointmentType(type?: string): string {
  switch (type) {
    case 'consultation':
      return 'Consultation'
    case 'vaccination':
      return 'Vaccination'
    case 'surgery':
      return 'Chirurgie'
    case 'checkup':
      return 'Contrôle'
    case 'emergency':
      return 'Urgence'
    default:
      return 'Consultation'
  }
}

export function translatePriority(priority?: string): string {
  switch (priority) {
    case 'low':
      return 'Faible'
    case 'normal':
      return 'Normal'
    case 'high':
      return 'Élevée'
    case 'urgent':
      return 'Urgente'
    default:
      return 'Normal'
  }
}

export function translateSpecies(species?: string): string {
  switch (species?.toLowerCase()) {
    case 'dog':
      return 'Chien'
    case 'cat':
      return 'Chat'
    case 'bird':
      return 'Oiseau'
    case 'rabbit':
      return 'Lapin'
    case 'horse':
      return 'Cheval'
    case 'cow':
      return 'Vache'
    case 'pig':
      return 'Cochon'
    case 'sheep':
      return 'Mouton'
    case 'goat':
      return 'Chèvre'
    case 'other':
      return 'Autre'
    default:
      return species || 'Non renseigné'
  }
}

export function translateRole(role?: string): string {
  switch (role) {
    case 'vet':
      return 'Vétérinaire'
    case 'assistant':
      return 'Assistant(e)'
    case 'admin':
      return 'Administrateur'
    case 'stock_manager':
      return 'Gestionnaire de stock'
    default:
      return role || 'Non renseigné'
  }
}

export function getStatusColor(status?: string): string {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'no_show':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'normal':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'high':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'urgent':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
}

export function formatError(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return 'Une erreur inattendue s\'est produite'
} 