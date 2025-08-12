export interface Animal {
  id: string
  clinic_id: string
  owner_id: string
  owner_name?: string
  name: string
  species: string
  breed?: string
  species_id?: string
  breed_id?: string
  gender?: 'male' | 'female' | 'unknown'
  birth_date?: string
  weight?: number
  color?: string
  microchip?: string
  tattoo?: string
  sterilized?: boolean
  sterilized_date?: string
  allergies?: string
  status?: 'active' | 'deceased' | 'inactive'
  deceased_date?: string
  profile_photo_url?: string
  photos?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export type CreateAnimal = Omit<Animal, 'id' | 'created_at' | 'updated_at'>
export type UpdateAnimal = Partial<CreateAnimal>

export interface AnimalFormData {
  name: string
  species: string
  breed?: string
  species_id?: string
  breed_id?: string
  gender?: 'male' | 'female' | 'unknown'
  birth_date?: string
  weight?: number
  color?: string
  microchip?: string
  tattoo?: string
  sterilized?: boolean
  sterilized_date?: string
  allergies?: string
  notes?: string
}

export interface AnimalSearchFilters {
  query?: string
  species?: string
  breed?: string
  gender?: 'male' | 'female' | 'unknown'
  status?: 'active' | 'deceased' | 'inactive'
  sterilized?: boolean
  ownerId?: string
} 