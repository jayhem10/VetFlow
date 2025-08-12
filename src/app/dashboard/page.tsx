'use client'

import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { useProfile } from '@/modules/profile/hooks/use-profile'
import { useClinic } from '@/modules/clinic/hooks/use-clinic'
import { useOwnerStore } from '@/stores/useOwnerStore'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useAppointmentStore } from '@/stores/useAppointmentStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const { user, hasProfile } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const { clinic, loading: clinicLoading, hasClinic } = useClinic()
  const router = useRouter()

  // Stores pour les statistiques
  const { owners, fetchOwners, loading: ownersLoading } = useOwnerStore()
  const { animals, fetchAnimals, loading: animalsLoading } = useAnimalStore()
  const { appointments, fetchAppointments, loading: appointmentsLoading } = useAppointmentStore()
  const { collaborators, fetchCollaborators, loading: collaboratorsLoading } = useCollaboratorsStore()

  // Loading state pour les données
  const dataLoading = ownersLoading || animalsLoading || appointmentsLoading || collaboratorsLoading

  // Charger les données une fois que la clinique est disponible
  useEffect(() => {
    if (clinic?.id) {
      fetchOwners()
      fetchAnimals()
      fetchAppointments(clinic.id)
      fetchCollaborators()
    }
  }, [clinic?.id, fetchOwners, fetchAnimals, fetchAppointments, fetchCollaborators])

  // Récupérer les compteurs globaux via API count
  const [counts, setCounts] = useState<{owners?: number; animals?: number; appointments?: number; collaborators?: number}>({})
  useEffect(() => {
    let aborted = false
    async function loadCounts() {
      try {
        const [co, ca, capp, ccol] = await Promise.all([
          fetch('/api/owners/count').then(r => r.json()),
          fetch('/api/animals/count').then(r => r.json()),
          fetch('/api/appointments/count').then(r => r.json()),
          fetch('/api/collaborators/count').then(r => r.json()),
        ])
        if (!aborted) setCounts({ owners: co.count, animals: ca.count, appointments: capp.count, collaborators: ccol.count })
      } catch (e) {
        // silencieux, on retombe sur les longueurs locales
      }
    }
    if (clinic?.id) loadCounts()
    return () => { aborted = true }
  }, [clinic?.id])

  // Calculer les statistiques (fallback aux longueurs locales)
  const stats = {
    owners: counts.owners ?? owners.length,
    animals: counts.animals ?? animals.length,
    appointmentsThisMonth: appointments.filter(apt => {
      const now = new Date()
      const aptDate = new Date(apt.appointment_date)
      return aptDate.getMonth() === now.getMonth() && 
             aptDate.getFullYear() === now.getFullYear()
    }).length,
    collaborators: counts.collaborators ?? collaborators.length
  }

  

  // Afficher un loading pendant la récupération des données
  if (profileLoading || clinicLoading) {
    return (
      <DashboardLayout title="Chargement...">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chargement de vos informations...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Récupération de votre profil et de votre clinique
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Si l'utilisateur n'a pas de profil ou de clinique, afficher le bouton de création
  if (!hasProfile || !hasClinic) {
    return (
      <DashboardLayout title="Configuration requise">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Configuration incomplète
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {!hasProfile && !hasClinic 
                ? 'Vous devez compléter votre profil et créer votre clinique pour continuer.'
                : !hasProfile 
                ? 'Vous devez compléter votre profil pour continuer.'
                : 'Vous devez créer votre clinique pour continuer.'
              }
            </p>
            <button
              onClick={() => router.push('/complete-profile')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Compléter la configuration
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">

        {/* En-tête visuel amélioré (sans salutation personnelle) */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 text-white shadow-lg">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm opacity-90">Bienvenue{clinic?.name ? ` à ${clinic.name}` : ''}</div>
                <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Tableau de bord</h1>
                <p className="mt-2 text-white/90 max-w-2xl">
                  Accédez rapidement à vos données, recherchez des propriétaires, animaux et collaborateurs, et gérez votre activité en un clin d'œil.
                </p>
                {/* Boutons d'accès rapides intégrés au bloc */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/owners" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 transition shadow-sm">
                    <span>👨‍👩‍👧‍👦</span>
                    <span className="font-medium">Propriétaires</span>
                  </a>
                  <a href="/animals" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 transition shadow-sm">
                    <span>🐾</span>
                    <span className="font-medium">Animaux</span>
                  </a>
                  <a href="/collaborators" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 transition shadow-sm">
                    <span>👥</span>
                    <span className="font-medium">Équipe</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Actions rapides - Colonne latérale */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Aperçu de la clinique sous la recherche */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                Aperçu de la clinique
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {dataLoading ? (
                      <div className="animate-pulse bg-blue-300 dark:bg-blue-600 h-6 w-6 rounded mx-auto"></div>
                    ) : (
                      stats.owners
                    )}
                  </div>
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Propriétaires</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {dataLoading ? (
                      <div className="animate-pulse bg-green-300 dark:bg-green-600 h-6 w-6 rounded mx-auto"></div>
                    ) : (
                      stats.animals
                    )}
                  </div>
                  <div className="text-xs font-medium text-green-700 dark:text-green-300">Animaux</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {dataLoading ? (
                      <div className="animate-pulse bg-purple-300 dark:bg-purple-600 h-6 w-6 rounded mx-auto"></div>
                    ) : (
                      stats.appointmentsThisMonth
                    )}
                  </div>
                  <div className="text-xs font-medium text-purple-700 dark:text-purple-300">RDV ce mois</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-700">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {dataLoading ? (
                      <div className="animate-pulse bg-orange-300 dark:bg-orange-600 h-6 w-6 rounded mx-auto"></div>
                    ) : (
                      stats.collaborators
                    )}
                  </div>
                  <div className="text-xs font-medium text-orange-700 dark:text-orange-300">Collaborateurs</div>
                  </div>
              </div>
            </div>
            {/* Accès rapides (ajoutés ensuite) */}
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-8">
            

            {/* Activité récente */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></span>
                Activité récente
              </h2>
              
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune activité récente
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Commencez par ajouter des propriétaires et leurs animaux pour voir l'activité de votre clinique.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.push('/owners')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Ajouter un propriétaire
                  </button>
                  <button
                    onClick={() => router.push('/animals')}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Ajouter un animal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}