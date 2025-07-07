'use client'

import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { useProfile } from '@/modules/profile/hooks/use-profile'
import { useClinic } from '@/modules/clinic/hooks/use-clinic'

export default function Dashboard() {
  const { user } = useAuth()
  const { profile, loading: profileLoading, error: profileError, hasProfile } = useProfile()
  const { clinic, loading: clinicLoading, error: clinicError, hasClinic } = useClinic()

  return (
    <DashboardLayout title="Dashboard VetFlow">
      <div className="max-w-4xl mx-auto">

        {/* Informations utilisateur */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Profil utilisateur */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Informations du profil
            </h2>
            
            {profileError ? (
              <div className="text-red-600 dark:text-red-400 mb-4">
                Erreur: {profileError}
              </div>
            ) : hasProfile && profile ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom complet:</span>
                  <p className="text-gray-900 dark:text-white">{profile.first_name} {profile.last_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                  <p className="text-gray-900 dark:text-white">{profile.email}</p>
                </div>
                {profile.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone:</span>
                    <p className="text-gray-900 dark:text-white">{profile.phone}</p>
                  </div>
                )}


              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Aucun profil trouvé. Votre profil sera créé automatiquement lors de la prochaine connexion.
                </p>
              </div>
            )}
          </div>

          {/* Informations Auth */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Informations de connexion
            </h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ID utilisateur:</span>
                <p className="text-gray-900 dark:text-white text-sm font-mono">{user?.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                <p className="text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email confirmé:</span>
                <p className={`${user?.email_confirmed_at ? 'text-green-600' : 'text-orange-600'}`}>
                  {user?.email_confirmed_at ? 'Oui' : 'En attente de confirmation'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière connexion:</span>
                <p className="text-gray-900 dark:text-white text-sm">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('fr-FR') : 'Jamais'}
                </p>
              </div>
            </div>
          </div>

          {/* Informations Clinique */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Informations de la clinique
            </h2>
            
            {clinicError ? (
              <div className="text-red-600 dark:text-red-400 mb-4">
                Erreur: {clinicError}
              </div>
            ) : hasClinic && clinic ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom:</span>
                  <p className="text-gray-900 dark:text-white">{clinic.name}</p>
                </div>
                {clinic.email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                    <p className="text-gray-900 dark:text-white">{clinic.email}</p>
                  </div>
                )}
                {clinic.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone:</span>
                    <p className="text-gray-900 dark:text-white">{clinic.phone}</p>
                  </div>
                )}
                {clinic.address && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse:</span>
                    <p className="text-gray-900 dark:text-white">{clinic.address}</p>
                    {clinic.city && clinic.postal_code && (
                      <p className="text-gray-900 dark:text-white text-sm">
                        {clinic.postal_code} {clinic.city}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan d'abonnement:</span>
                  <p className="text-gray-900 dark:text-white capitalize">
                    {clinic.subscription_plan || 'Non défini'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut:</span>
                  <p className={`capitalize ${
                    clinic.subscription_status === 'active' ? 'text-green-600' : 
                    clinic.subscription_status === 'trial' ? 'text-blue-600' : 
                    'text-orange-600'
                  }`}>
                    {clinic.subscription_status || 'Non défini'}
                  </p>
                </div>
                {clinic.trial_ends_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Fin d'essai:</span>
                    <p className="text-gray-900 dark:text-white text-sm">
                      {new Date(clinic.trial_ends_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Aucune clinique associée à ce profil.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
} 