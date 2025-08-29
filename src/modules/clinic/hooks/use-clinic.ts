'use client'

import { useEffect } from 'react'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { useClinicStore } from '@/stores/useClinicStore'
import type { TClinic } from '@/types/database.types'

interface TCreateClinicData {
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  subscription_plan?: 'starter' | 'professional' | 'clinic'
}

export function useClinic() {
  const { user, hasClinic: hasClinicFromAuth } = useAuth()
  const { 
    clinic, 
    loading, 
    error, 
    fetchClinic, 
    createClinic, 
    updateClinic 
  } = useClinicStore()

  // Charger la clinique automatiquement quand l'utilisateur est connecté
  useEffect(() => {
    if (user?.id) {
      // Toujours tenter de charger la clinique quand l'utilisateur change
      fetchClinic(user.id).catch(console.error)
    }
  }, [user?.id, fetchClinic])

  return {
    clinic,
    loading,
    error,
    hasClinic: hasClinicFromAuth, // Utiliser hasClinic depuis useAuth (session)
    createClinic,
    fetchClinic,
    updateClinic,
  }
}