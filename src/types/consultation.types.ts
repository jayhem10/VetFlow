export interface Consultation {
  id: string
  clinic_id: string
  animal_id: string
  veterinarian_id: string
  appointment_id?: string
  visit_date: string
  reason: string
  weight?: number
  temperature?: number
  heart_rate?: number
  respiratory_rate?: number
  symptoms?: string
  examination_findings?: string
  diagnosis?: string
  treatment_plan?: string
  recommendations?: string
  next_visit_date?: string
  next_visit_reason?: string
  documents?: Array<{
    name: string
    url: string
    type: string
  }>
  created_at: string
  updated_at: string
}

export type CreateConsultation = Omit<Consultation, 'id' | 'created_at' | 'updated_at'>
export type UpdateConsultation = Partial<CreateConsultation>

export interface ConsultationFormData {
  animal_id: string
  veterinarian_id: string
  appointment_id?: string
  reason: string
  weight?: number
  temperature?: number
  heart_rate?: number
  respiratory_rate?: number
  symptoms?: string
  examination_findings?: string
  diagnosis?: string
  treatment_plan?: string
  recommendations?: string
  next_visit_date?: string
  next_visit_reason?: string
}

export interface ConsultationSearchFilters {
  animal_id?: string
  veterinarian_id?: string
  dateRange?: { start: string; end: string }
  reason?: string
  diagnosis?: string
} 