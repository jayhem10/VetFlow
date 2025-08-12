export interface Owner {
  id: string
  clinic_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  preferred_contact?: 'email' | 'phone' | 'mobile'
  marketing_consent?: boolean
  notes?: string
  created_at: string
  updated_at: string
  animals?: number // Nombre d'animaux associés
}

export type CreateOwner = Omit<Owner, 'id' | 'created_at' | 'updated_at' | 'animals'>
export type UpdateOwner = Partial<CreateOwner>

export interface OwnerFormData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  preferred_contact?: 'email' | 'phone' | 'mobile'
  marketing_consent?: boolean
  notes?: string
}

export interface OwnerSearchFilters {
  query?: string
  city?: string
  hasAnimals?: boolean
  marketingConsent?: boolean
} 