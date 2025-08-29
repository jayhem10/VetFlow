'use client';

import { useState } from 'react';
import { toast } from '@/lib/toast';
import Button from '@/components/atoms/Button';
import { EditButton } from '@/components/atoms/EditButton';
import Card from '@/components/atoms/Card';
import { Dropdown } from '@/components/atoms/Dropdown';
import { Tooltip } from '@/components/atoms/Tooltip';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore';
import { EditCollaboratorModal } from './EditCollaboratorModal';
import { DebugErrorModal } from './DebugErrorModal';
import { Phone } from 'lucide-react';
import type { TProfile } from '@/types/database.types';

interface CollaboratorCardProps {
  collaborator: TProfile;
}

export function CollaboratorCard({ collaborator }: CollaboratorCardProps) {
  const { removeCollaborator } = useCollaboratorsStore();
  const [updating, setUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const handleRemove = async () => {
    setUpdating(true);
    setError(null);
    try {
      await removeCollaborator(collaborator.id);
      toast.success('Collaborateur retiré avec succès');
      setShowDeleteDialog(false);
    } catch (error) {
      const message = (error as Error)?.message || 'Erreur lors de la suppression';
      toast.error(message);
      setError(message);
      console.error('Erreur suppression:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleColor = (role: string) => {
    // Si le rôle contient 'admin', utiliser la couleur admin
    if (role.includes('admin')) {
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
    }
    
    // Sinon, utiliser la couleur du rôle principal
    const primaryRole = role.split(',')[0].trim();
    switch (primaryRole) {
      case 'vet':
        return 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200';
      case 'assistant':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    const roles = role.split(',').map(r => {
      switch (r.trim()) {
        case 'vet':
          return 'Vétérinaire';
        case 'assistant':
          return 'Assistant(e)';
        case 'stock_manager':
          return 'Gestionnaire de stock';
        case 'admin':
          return 'Admin';
        default:
          return r.trim();
      }
    });
    return roles.join(', ');
  };

  const hasRole = (collaboratorRole: string, role: string) => {
    return collaboratorRole.split(',').some(r => r.trim() === role);
  };

  // Fonctions pour afficher les couleurs
  const getCalendarColorStyles = (color?: string) => {
    const colorMap: Record<string, any> = {
      emerald: {
        bg: 'rgb(236 253 245)',
        border: 'rgb(16 185 129)',
        accent: 'rgb(16 185 129)',
        text: 'rgb(21 128 61)'
      },
      blue: {
        bg: 'rgb(239 246 255)',
        border: 'rgb(59 130 246)',
        accent: 'rgb(59 130 246)',
        text: 'rgb(30 64 175)'
      },
      purple: {
        bg: 'rgb(250 245 255)',
        border: 'rgb(147 51 234)',
        accent: 'rgb(147 51 234)',
        text: 'rgb(107 33 168)'
      },
      rose: {
        bg: 'rgb(255 241 242)',
        border: 'rgb(244 63 94)',
        accent: 'rgb(244 63 94)',
        text: 'rgb(190 18 60)'
      },
      amber: {
        bg: 'rgb(255 251 235)',
        border: 'rgb(245 158 11)',
        accent: 'rgb(245 158 11)',
        text: 'rgb(161 98 7)'
      },
      lime: {
        bg: 'rgb(247 254 231)',
        border: 'rgb(132 204 22)',
        accent: 'rgb(132 204 22)',
        text: 'rgb(77 124 15)'
      },
      cyan: {
        bg: 'rgb(236 254 255)',
        border: 'rgb(34 211 238)',
        accent: 'rgb(34 211 238)',
        text: 'rgb(14 116 144)'
      },
      fuchsia: {
        bg: 'rgb(253 244 255)',
        border: 'rgb(236 72 153)',
        accent: 'rgb(236 72 153)',
        text: 'rgb(157 23 77)'
      },
      indigo: {
        bg: 'rgb(238 242 255)',
        border: 'rgb(99 102 241)',
        accent: 'rgb(99 102 241)',
        text: 'rgb(67 56 202)'
      },
      teal: {
        bg: 'rgb(240 253 250)',
        border: 'rgb(20 184 166)',
        accent: 'rgb(20 184 166)',
        text: 'rgb(15 118 110)'
      }
    }
    return colorMap[color || 'emerald'] || colorMap.emerald
  }

  const getColorLabel = (color?: string) => {
    const colorLabels: Record<string, string> = {
      emerald: 'Émeraude',
      blue: 'Bleu',
      purple: 'Violet',
      rose: 'Rose',
      amber: 'Ambre',
      lime: 'Citron',
      cyan: 'Cyan',
      fuchsia: 'Fuchsia',
      indigo: 'Indigo',
      teal: 'Sarcelle'
    }
    return colorLabels[color || 'emerald'] || 'Émeraude'
  }

  return (
    <>
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
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {collaborator.phone}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Tooltip content="Modifier">
            <EditButton
              onClick={() => setShowEditModal(true)}
              disabled={updating}
            />
          </Tooltip>
          
          <Tooltip content="Supprimer">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={updating}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </Tooltip>
        </div>
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
      {hasRole(collaborator.role, 'vet') && collaborator.specialties && collaborator.specialties.length > 0 && (
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
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                +{collaborator.specialties.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Couleur personnalisée */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-500 dark:text-gray-400">Couleur:</span>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ 
              backgroundColor: getCalendarColorStyles(collaborator.calendar_color).accent,
              borderColor: getCalendarColorStyles(collaborator.calendar_color).border
            }}
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {getColorLabel(collaborator.calendar_color)}
          </span>
        </div>
      </div>

      {/* Numéro de licence (pour les vétérinaires) */}
      {hasRole(collaborator.role, 'vet') && collaborator.license_number && (
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

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          if (!updating) {
            setShowDeleteDialog(false);
          }
        }}
        onConfirm={handleRemove}
        title="Retirer le collaborateur"
        message={`Êtes-vous sûr de vouloir retirer ${collaborator.first_name} ${collaborator.last_name} de la clinique ? Cette action ne peut pas être annulée.`}
        confirmText="Retirer"
        cancelText="Annuler"
        variant="danger"
        loading={updating}
      />

      <EditCollaboratorModal
        collaborator={collaborator}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          // Optionnel: rafraîchir la liste
        }}
      />

      <DebugErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        error={error || ''}
        title="Erreur de suppression"
      />
    </>
  );
}