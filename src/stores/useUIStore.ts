// stores/useUIStore.ts
import { create } from 'zustand'
import toast from 'react-hot-toast'

interface UIStore {
  // Navigation
  sidebarOpen: boolean
  currentPage: string
  
  // Modales
  modals: {
    ownerForm: boolean
    animalForm: boolean
    appointmentForm: boolean
    consultationForm: boolean
    invoiceForm: boolean
  }
  
  // Thème
  theme: 'light' | 'dark'
  
  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setCurrentPage: (page: string) => void
  
  // Modales
  openModal: (modal: keyof UIStore['modals']) => void
  closeModal: (modal: keyof UIStore['modals']) => void
  closeAllModals: () => void
  
  // Notifications avec react-hot-toast
  showNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void
  
  // Thème
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  // État initial
  sidebarOpen: true,
  currentPage: 'dashboard',
  
  modals: {
    ownerForm: false,
    animalForm: false,
    appointmentForm: false,
    consultationForm: false,
    invoiceForm: false,
  },
  
  theme: 'light',
  
  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // Modales
  openModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: true }
  })),
  closeModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: false }
  })),
  closeAllModals: () => set({
    modals: {
      ownerForm: false,
      animalForm: false,
      appointmentForm: false,
      consultationForm: false,
      invoiceForm: false,
    }
  }),
  
  // Notifications avec react-hot-toast
  showNotification: (type, message) => {
    switch (type) {
      case 'success':
        toast.success(message)
        break
      case 'error':
        toast.error(message)
        break
      case 'warning':
        toast(message, { icon: '⚠️' })
        break
      case 'info':
        toast(message, { icon: 'ℹ️' })
        break
    }
  },
  
  // Thème
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  }))
}))