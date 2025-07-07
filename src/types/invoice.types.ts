export interface Invoice {
  id: string
  clinic_id: string
  owner_id: string
  appointment_id?: string
  invoice_number: string
  invoice_date: string
  due_date?: string
  subtotal: number
  tax_rate?: number
  tax_amount: number
  total_amount: number
  payment_status?: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
  payment_method?: 'cash' | 'card' | 'transfer' | 'check'
  paid_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  category?: string
  created_at: string
}

export type CreateInvoice = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>
export type UpdateInvoice = Partial<CreateInvoice>

export type CreateInvoiceItem = Omit<InvoiceItem, 'id' | 'created_at'>
export type UpdateInvoiceItem = Partial<CreateInvoiceItem>

export interface InvoiceFormData {
  owner_id: string
  appointment_id?: string
  invoice_date: string
  due_date?: string
  tax_rate?: number
  payment_method?: 'cash' | 'card' | 'transfer' | 'check'
  notes?: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    category?: string
  }>
}

export interface InvoiceSearchFilters {
  owner_id?: string
  status?: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
  dateRange?: { start: string; end: string }
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check'
} 