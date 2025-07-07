import { User } from '@supabase/supabase-js'

export interface TUser extends User {
  id: string
  email: string
  user_metadata: {
    first_name?: string
    last_name?: string
    clinic_name?: string
    phone?: string
  }
}

export interface TUserProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface TClinic {
  id: string
  name: string
  ownerId: string
  subscription: 'starter' | 'professional' | 'clinic'
  address?: string
  phone?: string
  email?: string
  website?: string
  siret?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthContextType {
  user: TUser | null
  loading: boolean
  error: string | null
  signUp: (userData: SignUpData) => Promise<AuthResult>
  signIn: (credentials: SignInData) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  isAuthenticated: boolean
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  clinicName: string
  phone: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: TUser
}

export interface AuthError {
  message: string
  status?: number
  code?: string
} 