// Export centralisé des types
export * from './owner.types'
export * from './animal.types'
export * from './appointment.types'
export * from './consultation.types'
export * from './invoice.types'

// Types génériques pour la base de données
export interface Database {
  public: {
    Tables: {
      owners: {
        Row: Owner
        Insert: CreateOwner
        Update: UpdateOwner
      }
      animals: {
        Row: Animal
        Insert: CreateAnimal
        Update: UpdateAnimal
      }
      appointments: {
        Row: Appointment
        Insert: CreateAppointment
        Update: UpdateAppointment
      }
      medical_records: {
        Row: Consultation
        Insert: CreateConsultation
        Update: UpdateConsultation
      }
      invoices: {
        Row: Invoice
        Insert: CreateInvoice
        Update: UpdateInvoice
      }
      invoice_items: {
        Row: InvoiceItem
        Insert: CreateInvoiceItem
        Update: UpdateInvoiceItem
      }
    }
  }
}

import type { Owner, CreateOwner, UpdateOwner } from './owner.types'
import type { Animal, CreateAnimal, UpdateAnimal } from './animal.types'
import type { Appointment, CreateAppointment, UpdateAppointment } from './appointment.types'
import type { Consultation, CreateConsultation, UpdateConsultation } from './consultation.types'
import type { Invoice, CreateInvoice, UpdateInvoice, InvoiceItem, CreateInvoiceItem, UpdateInvoiceItem } from './invoice.types' 