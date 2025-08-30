export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  item_type?: 'product' | 'service'
  product_id?: string
  service_id?: string
}

export type PaymentMethod = 'cash' | 'card' | 'check' | 'transfer' | 'insurance'
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date?: string
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  paid_at?: string
  notes?: string
  appointment?: {
    id: string
    title: string
    animal?: {
      name: string
      owner?: {
        first_name: string
        last_name: string
        email: string
      }
    }
  }
  owner?: {
    first_name: string
    last_name: string
    email: string
  }
  items: InvoiceItem[]
}

export interface CreateInvoiceData {
  appointment_id: string
  items: Array<{
    item_type: 'product' | 'service'
    product_id?: string
    service_id?: string
    description: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}

export interface UpdateInvoiceData {
  payment_status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
  payment_method?: string
  paid_at?: string
  notes?: string
  due_date?: string
  items?: InvoiceItem[]
}

// Types d'insertion/mise à jour pour les lignes de facture
export interface CreateInvoiceItem {
  description: string
  quantity: number
  unit_price: number
  total_price: number
  tax_rate?: number
  item_type?: 'product' | 'service'
  product_id?: string
  service_id?: string
}

export interface UpdateInvoiceItem {
  description?: string
  quantity?: number
  unit_price?: number
  total_price?: number
  tax_rate?: number
  item_type?: 'product' | 'service'
  product_id?: string | null
  service_id?: string | null
}

export interface InvoiceSearchFilters {
  owner_id?: string
  status?: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
  dateRange?: { start: string; end: string }
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check'
} 