'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import { Dropdown } from '@/components/atoms/Dropdown';
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore';
import type { TProfile } from '@/types/database.types';

interface CollaboratorCardProps {
  collaborator: TProfile;
}

export function CollaboratorCard({ collaborator }: CollaboratorCardProps) {
  const { updateCollaboratorRole, removeCollaborator } = useCollaboratorsStore();
  const [updating, setUpdating] = useState(false);

  const handleRoleChange = async (newRole: 'vet' | 'assistant') => {
    if (newRole === collaborator.role) return;
    
    setUpdating(true);
    try {
      await updateCollaboratorRole(collaborator.id, newRole);
      toast.success('Rôle mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce collaborateur de la clinique ?')) {
      return;
    }

    setUpdating(true);
    try {
      await removeCollaborator(collaborator.id);
      toast.success('Collaborateur retiré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'vet':
        return 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200';
      case 'assistant':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'vet':
        return 'Vétérinaire';
      case 'assistant':
        return 'Assistant(e)';
      case 'admin':
        return 'Administrateur';
      default:
        return 'Non défini';
    }
  };

  return (
    <Card className="p-6 relative">
      {/* Avatar et infos principales */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-green-700 text-white rounded-full flex items-center justify-center text-lg font-medium flex-shrink-0">
          {collaborator.first_name.charAt(0).toUpperCase()}{collaborator.last_name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {collaborator.first_name} {collaborator.last_name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {collaborator.email}
          </p>
          {collaborator.phone && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              📞 {collaborator.phone}
            </p>
          )}
        </div>

        {/* Menu actions */}
        <Dropdown
          trigger={
            <button 
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={updating}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          }
          items={[
            {
              label: 'Promouvoir vétérinaire',
              onClick: () => handleRoleChange('vet'),
              icon: '⬆️',
              disabled: collaborator.role === 'vet' || updating
            },
            {
              label: 'Rétrograder assistant',
              onClick: () => handleRoleChange('assistant'),
              icon: '⬇️',
              disabled: collaborator.role === 'assistant' || updating
            },
            {
              separator: true
            },
            {
              label: 'Retirer de la clinique',
              onClick: handleRemove,
              icon: '🗑️',
              disabled: updating
            }
          ]}
        />
      </div>

      {/* Rôle et statut */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(collaborator.role)}`}>
          {getRoleLabel(collaborator.role)}
        </span>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${collaborator.is_active ? 'bg-green-400' : 'bg-gray-300'}`}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {collaborator.is_active ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>

      {/* Spécialités (pour les vétérinaires) */}
      {collaborator.role === 'vet' && collaborator.specialties && collaborator.specialties.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Spécialités</div>
          <div className="flex flex-wrap gap-1">
            {collaborator.specialties.slice(0, 3).map((specialty, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200"
              >
                {specialty}
              </span>
            ))}
            {collaborator.specialties.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{collaborator.specialties.length - 3} autres
              </span>
            )}
          </div>
        </div>
      )}

      {/* Numéro de licence (pour les vétérinaires) */}
      {collaborator.role === 'vet' && collaborator.license_number && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">Licence :</span> {collaborator.license_number}
        </div>
      )}

      {/* Dernière connexion */}
      {collaborator.last_login_at && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Dernière connexion: {new Date(collaborator.last_login_at).toLocaleDateString('fr-FR')}
        </div>
      )}

      {/* Loading overlay */}
      {updating && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-700"></div>
        </div>
      )}
    </Card>
  );
}