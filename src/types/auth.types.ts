import { type User as NextAuthUser } from 'next-auth'
import { type Session as NextAuthSession } from 'next-auth'

export interface TUser extends NextAuthUser {
  id: string
  email: string
}

export interface TSession extends NextAuthSession {
  user: TUser
}

export interface TSignInData {
  email: string
  password: string
}

export interface TSignUpData {
  firstName: string
  lastName: string
  email: string
  password: string
  clinicName: string
  phone: string
}

export interface TProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  city?: string
  postal?: string
  country?: string
  clinicId?: string
}

export interface TClinic {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  subscriptionPlan: string
  subscriptionStatus: string
}

export interface TAuthResult {
  success: boolean
  error?: string
  redirectTo?: string
  user?: TUser
}

export interface TCreateInitialProfileData {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string // Rôles multiples séparés par des virgules
  license_number?: string
  specialties?: string[]
  clinic_id?: string
  registration_step: string
} 