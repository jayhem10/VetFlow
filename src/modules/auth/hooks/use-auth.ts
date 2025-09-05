'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { authService } from '../services/auth.service'
import { useProfileStore } from '@/stores/useProfileStore'
import type { TSignInData, TSignUpData, TAuthResult } from '@/types/auth.types'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(false)
  const { profile, fetchProfile } = useProfileStore()
  const [triedRefresh, setTriedRefresh] = useState<string | null>(null)
  const [localHasProfile, setLocalHasProfile] = useState(false)
  const [localHasClinic, setLocalHasClinic] = useState(false)

  const user = session?.user || null
  const isAuthenticated = !!session
  const isLoading = status === 'loading' || loading

  // Vérifier si l'utilisateur a un profil et une clinique dans la session
  const hasProfileInSession = session?.user?.hasProfile || false
  const hasClinicInSession = session?.user?.hasClinic || false

  // Effet pour synchroniser l'état local avec la session
  useEffect(() => {
    setLocalHasProfile(hasProfileInSession)
    setLocalHasClinic(hasClinicInSession)
  }, [hasProfileInSession, hasClinicInSession])

  // DÉSACTIVÉ : Le fetch est maintenant géré uniquement par ProtectedLayout
  // selon le process : profileCompleted = true → fetch données
  // useEffect(() => {
  //   // Ancien code de fetch redondant désactivé
  // }, [])

  const signIn = async (data: TSignInData): Promise<TAuthResult> => {
    setLoading(true)
    try {
      const result = await authService.signIn(data.email, data.password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: TSignUpData): Promise<TAuthResult> => {
    setLoading(true)
    try {
      const result = await authService.signUp(data)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<TAuthResult> => {
    setLoading(true)
    try {
      const result = await authService.signOut()
      // Réinitialiser l'état local
      setLocalHasProfile(false)
      setLocalHasClinic(false)
      return result
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    isAuthenticated,
    hasProfile: localHasProfile || hasProfileInSession || !!profile, // Priorité à l'état local, puis session, puis store
    hasClinic: localHasClinic || hasClinicInSession,
    loading: isLoading,
    signIn,
    signUp,
    signOut,
  }
} 