export interface TProfile {
  id: string
  clinic_id?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: 'owner' | 'vet' | 'assistant' | 'admin'
  permissions?: any
  license_number?: string
  specialties?: string[]
  is_active: boolean
  last_login_at?: string
  calendar_color?: string
  registration_step: 'profile' | 'clinic' | 'completed'
  created_at?: string
  updated_at?: string
}

export interface TClinic {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
  subscription_plan: 'starter' | 'professional' | 'clinic'
  subscription_status: 'trial' | 'active' | 'suspended' | 'cancelled'
  trial_ends_at?: string
  settings: {
    timezone: string
    language: string
    notifications: {
      email: boolean
      sms: boolean
    }
  }
  created_at?: string
  updated_at?: string
}

// Étape 1 : Création du profil initial (tous les champs de la table profiles)
export interface TCreateInitialProfileData {
  id: string // UUID de l'utilisateur auth
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: 'owner' | 'vet' | 'assistant' | 'admin'
  permissions?: any
  license_number?: string
  specialties?: string[]
  registration_step: 'profile' | 'clinic' | 'completed'
}

// Étape 2 : Création de la clinique
export interface TCreateClinicData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  country?: string
  subscription_plan: 'starter' | 'professional' | 'clinic'
  settings: {
    timezone: string
    language: string
    notifications: {
      email: boolean
      sms: boolean
    }
  }
}

// Étape 3 : Mise à jour du profil avec l'ID de la clinique
export interface TUpdateProfileWithClinicData {
  clinic_id: string
  registration_step: 'completed'
}

// Pour les mises à jour générales du profil
export interface TUpdateProfileData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  role?: 'owner' | 'vet' | 'assistant' | 'admin'
  permissions?: any
  license_number?: string
  specialties?: string[]
} 