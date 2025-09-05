'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useProfileStore } from '@/stores/useProfileStore'
import type { TProfile } from '@/types/database.types'

interface TCreateProfileData {
  first_name: string
  last_name: string
  phone?: string
  role?: string
  license_number?: string
  specialties?: string[]
  clinic_id?: string
}

export function useProfile() {
  const { data: session, update } = useSession()
  const { 
    profile, 
    loading, 
    error, 
    hasProfile, 
    fetchProfile, 
    createProfile, 
    updateProfile 
  } = useProfileStore()

  // DÉSACTIVÉ : Le chargement automatique est maintenant géré par ProtectedLayout
  // pour éviter les appels redondants
  // useEffect(() => {
  //   if (session?.user?.id && !loading && !profile) {
  //     // Ne refetch que si on n'a vraiment aucune donnée
  //     const hasProfileInSession = (session?.user as any)?.profileCompleted || (session?.user as any)?.hasProfile
  //     if (!hasProfileInSession) {
  //       console.log('🎯 useProfile: Tentative de chargement pour', session.user.id)
  //       fetchProfile(session.user.id).catch(console.error)
  //     }
  //   }
  // }, [session?.user?.id, fetchProfile])

  const createInitialProfile = async (data: TCreateProfileData) => {
    try {
      const newProfile = await createProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role,
        license_number: data.license_number,
        specialties: data.specialties,
        clinic_id: data.clinic_id,
      })
      
      // Mettre à jour la session de manière non-bloquante
      update().catch(console.error)
      
      return newProfile
    } catch (error) {
      throw error
    }
  }

  // Fonction pour forcer le rechargement
  const refreshProfile = async () => {
    if (session?.user?.id) {
      try {
        const profile = await fetchProfile(session.user.id, true) // force = true
        
        // Si on a un profil, mettre à jour la session
        if (profile) {
          await update({
            ...session,
            user: {
              ...session.user,
              hasProfile: true,
              hasClinic: !!(profile as any).clinic_id,
            },
          })
        }
        
        return profile
      } catch (error) {
        console.error('Erreur lors du rechargement du profil:', error)
        return null
      }
    }
    return null
  }

  return {
    profile,
    loading,
    error,
    hasProfile,
    createInitialProfile,
    fetchProfile,
    updateProfile,
    refreshProfile, // Nouveau: pour forcer le refresh
  }
}