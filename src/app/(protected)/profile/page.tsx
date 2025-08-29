'use client';

import { useState } from 'react';
import { useProfile } from '@/modules/profile/hooks/use-profile';
import Button from '@/components/atoms/Button';
import { EditButton } from '@/components/atoms/EditButton';
import Card from '@/components/atoms/Card';
import { ProfileEditForm } from '@/modules/profile/components/ProfileEditForm';

export default function ProfilePage() {
  const { profile, loading: profileLoading, hasProfile } = useProfile();
  const [editingProfile, setEditingProfile] = useState(false);

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mon profil
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos informations personnelles
            </p>
          </div>
        </div>

        {/* Informations personnelles */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Informations personnelles
            </h2>
            <div className="flex justify-end">
              <EditButton
                showText={true}
                text={editingProfile ? 'Annuler' : 'Modifier'}
                onClick={() => setEditingProfile(!editingProfile)}
              />
            </div>
          </div>

          {editingProfile ? (
            <ProfileEditForm 
              profile={profile}
              onSuccess={() => setEditingProfile(false)}
              onCancel={() => setEditingProfile(false)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prénom
                </label>
                <p className="text-gray-900 dark:text-white">
                  {profile?.first_name || 'Non renseigné'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <p className="text-gray-900 dark:text-white">
                  {profile?.last_name || 'Non renseigné'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone
                </label>
                <p className="text-gray-900 dark:text-white">
                  {profile?.phone || 'Non renseigné'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rôles
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile?.role ? profile.role.split(',').map((role, index) => {
                    const roleLabel = (() => {
                      switch (role.trim()) {
                        case 'vet':
                          return 'Vétérinaire';
                        case 'assistant':
                          return 'Assistant(e)';
                        case 'stock_manager':
                          return 'Gestionnaire de stock';
                        case 'owner':
                          return 'Propriétaire';
                        case 'admin':
                          return 'Admin';
                        default:
                          return role.trim();
                      }
                    })();
                    
                    return (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200"
                      >
                        {roleLabel}
                      </span>
                    );
                  }) : (
                    <span className="text-gray-500 dark:text-gray-400">Non défini</span>
                  )}
                </div>
              </div>
              
              {profile?.license_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Numéro de licence
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {profile.license_number}
                  </p>
                </div>
              )}
              
              {profile?.specialties && profile.specialties.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Spécialités
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
  );
}