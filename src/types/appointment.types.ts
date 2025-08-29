export interface Appointment {
  id: string
  clinic_id: string
  animal_id: string
  veterinarian_id: string
  title: string
  description?: string
  appointment_date: string
  duration_minutes?: number
  appointment_type?: 'consultation' | 'vaccination' | 'surgery' | 'checkup' | 'emergency'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  internal_notes?: string
  reminder_sent?: boolean
  reminder_sent_at?: string
  created_at: string
  updated_at: string
}

// Type pour les rendez-vous avec données enrichies (animal et propriétaire)
export interface AppointmentWithDetails extends Appointment {
  animal?: {
    id: string
    name: string
    species: string
    breed?: string
    owner?: {
      id: string
      first_name: string
      last_name: string
      email?: string
      phone?: string
    } | null
  } | null
  veterinarian?: {
    id: string
    first_name: string
    last_name: string
    role?: string
  } | null
  invoice?: {
    id: string
    invoice_number: string
    total_amount: number
    payment_status: string
    payment_method?: string
    paid_at?: string
    created_at: string
    updated_at: string
    items: Array<{
      id: string
      description: string
      quantity: number
      unit_price: number
      total_price: number
      type: string
    }>
    owner?: {
      id: string
      first_name: string
      last_name: string
      email?: string
    } | null
  } | null
  files?: Array<{
    id: string
    filename: string
    original_name: string
    size: number
    mime_type: string
    uploaded_at?: string
  }>
}

export type CreateAppointment = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
export type UpdateAppointment = Partial<CreateAppointment>

export interface AppointmentFormData {
  animal_id: string
  veterinarian_id: string
  title: string
  description?: string
  appointment_date: string
  duration_minutes?: number
  appointment_type?: 'consultation' | 'vaccination' | 'surgery' | 'checkup' | 'emergency'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  notes?: string
  internal_notes?: string
}

export interface AppointmentSearchFilters {
  date?: string
  dateRange?: { start: string; end: string }
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  veterinarian_id?: string
  animal_id?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  type?: 'consultation' | 'vaccination' | 'surgery' | 'checkup' | 'emergency'
} 