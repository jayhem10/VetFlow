import { create } from 'zustand'
import { AppointmentsService } from '@/services/appointments.service'
import type { Appointment, CreateAppointment, UpdateAppointment, AppointmentSearchFilters } from '@/types/appointment.types'

interface AppointmentStore {
  // État
  appointments: Appointment[]
  selectedAppointment: Appointment | null
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  loading: boolean
  error: string | null

  // Actions
  fetchAppointments: (clinicId: string) => Promise<void>
  fetchAppointmentById: (id: string) => Promise<void>
  createAppointment: (appointment: CreateAppointment) => Promise<Appointment>
  updateAppointment: (id: string, updates: UpdateAppointment) => Promise<Appointment>
  deleteAppointment: (id: string) => Promise<void>
  searchAppointments: (clinicId: string, filters: AppointmentSearchFilters) => Promise<void>
  fetchTodayAppointments: (clinicId: string) => Promise<void>
  fetchUpcomingAppointments: (clinicId: string, days?: number) => Promise<void>
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>
  checkAvailability: (clinicId: string, veterinarianId: string, appointmentDate: string, durationMinutes?: number, excludeAppointmentId?: string) => Promise<boolean>
  setSelectedAppointment: (appointment: Appointment | null) => void
  clearError: () => void
  reset: () => void
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  // État initial
  appointments: [],
  selectedAppointment: null,
  todayAppointments: [],
  upcomingAppointments: [],
  loading: false,
  error: null,

  // Actions
  fetchAppointments: async (clinicId: string) => {
    set({ loading: true, error: null })
    try {
      const appointments = await AppointmentsService.getAll(clinicId)
      set({ appointments, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchAppointmentById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const appointment = await AppointmentsService.getById(id)
      set({ selectedAppointment: appointment, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createAppointment: async (appointmentData: CreateAppointment) => {
    set({ loading: true, error: null })
    try {
      const newAppointment = await AppointmentsService.create(appointmentData)
      set((state) => ({ 
        appointments: [...state.appointments, newAppointment],
        loading: false 
      }))
      return newAppointment
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateAppointment: async (id: string, updates: UpdateAppointment) => {
    set({ loading: true, error: null })
    try {
      const updatedAppointment = await AppointmentsService.update(id, updates)
      set((state) => ({
        appointments: state.appointments.map(appointment => 
          appointment.id === id ? updatedAppointment : appointment
        ),
        selectedAppointment: state.selectedAppointment?.id === id ? updatedAppointment : state.selectedAppointment,
        loading: false
      }))
      return updatedAppointment
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  deleteAppointment: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await AppointmentsService.delete(id)
      set((state) => ({
        appointments: state.appointments.filter(appointment => appointment.id !== id),
        selectedAppointment: state.selectedAppointment?.id === id ? null : state.selectedAppointment,
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  searchAppointments: async (clinicId: string, filters: AppointmentSearchFilters) => {
    set({ loading: true, error: null })
    try {
      const appointments = await AppointmentsService.search(clinicId, filters)
      set({ appointments, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchTodayAppointments: async (clinicId: string) => {
    set({ loading: true, error: null })
    try {
      const todayAppointments = await AppointmentsService.getToday(clinicId)
      set({ todayAppointments, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchUpcomingAppointments: async (clinicId: string, days = 7) => {
    set({ loading: true, error: null })
    try {
      const upcomingAppointments = await AppointmentsService.getUpcoming(clinicId, days)
      set({ upcomingAppointments, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
    set({ loading: true, error: null })
    try {
      const updatedAppointment = await AppointmentsService.updateStatus(id, status)
      set((state) => ({
        appointments: state.appointments.map(appointment => 
          appointment.id === id ? updatedAppointment : appointment
        ),
        selectedAppointment: state.selectedAppointment?.id === id ? updatedAppointment : state.selectedAppointment,
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  checkAvailability: async (
    clinicId: string,
    veterinarianId: string,
    appointmentDate: string,
    durationMinutes = 30,
    excludeAppointmentId?: string
  ) => {
    try {
      return await AppointmentsService.checkAvailability(
        clinicId,
        veterinarianId,
        appointmentDate,
        durationMinutes,
        excludeAppointmentId
      )
    } catch (error) {
      set({ error: (error as Error).message })
      return false
    }
  },

  setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),
  clearError: () => set({ error: null }),
  reset: () => set({ 
    appointments: [], 
    selectedAppointment: null, 
    todayAppointments: [], 
    upcomingAppointments: [], 
    loading: false, 
    error: null 
  })
})) 