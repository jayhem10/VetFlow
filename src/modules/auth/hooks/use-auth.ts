'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { authService } from '../services/auth.service'
import { useProfile } from '@/modules/profile/hooks/use-profile'
import type { TSignInData, TSignUpData, TAuthResult } from '@/types/auth.types'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(false)
  const { hasProfile, refreshProfile } = useProfile()
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

  // Effet pour forcer le rechargement du profil quand l'utilisateur change
  useEffect(() => {
    if (session?.user?.id && (!hasProfileInSession || !hasClinicInSession)) {
      // Si on n'a pas les infos dans la session, essayer de recharger le profil (profil ou clinique manquants)
      refreshProfile().then((profile) => {
        if (profile) {
          setLocalHasProfile(true)
          setLocalHasClinic(!!profile.clinic_id)
          
          // Mettre à jour la session si nécessaire
          if (!hasProfileInSession || !hasClinicInSession) {
            update({
              ...session,
              user: {
                ...session.user,
                hasProfile: true,
                hasClinic: !!profile.clinic_id,
              },
            }).catch(console.error)
          }
        }
      }).catch(console.error)
    }
  }, [session?.user?.id, hasProfileInSession, hasClinicInSession, refreshProfile, update])

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
    hasProfile: localHasProfile || hasProfileInSession || hasProfile, // Priorité à l'état local, puis session, puis store
    hasClinic: localHasClinic || hasClinicInSession,
    loading: isLoading,
    signIn,
    signUp,
    signOut,
  }
} 