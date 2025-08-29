'use client';

import { useState } from 'react';
import { toast } from '@/lib/toast';
import Button from '@/components/atoms/Button';
import { EditButton } from '@/components/atoms/EditButton';
import Card from '@/components/atoms/Card';
import { Tooltip } from '@/components/atoms/Tooltip';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore';
import { EditCollaboratorModal } from './EditCollaboratorModal';
import type { TProfile } from '@/types/database.types';

interface CollaboratorsListProps {
  collaborators: TProfile[];
}

export function CollaboratorsList({ collaborators }: CollaboratorsListProps) {
  const { removeCollaborator } = useCollaboratorsStore();
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; collaborator: TProfile | null }>({
    isOpen: false,
    collaborator: null
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; collaborator: TProfile | null }>({
    isOpen: false,
    collaborator: null
  });



  const handleRemove = async () => {
    if (!deleteDialog.collaborator) return;
    
    setUpdating(deleteDialog.collaborator.id);
    try {
      await removeCollaborator(deleteDialog.collaborator.id);
      toast.success('Collaborateur retiré avec succès');
      setDeleteDialog({ isOpen: false, collaborator: null });
    } catch (error) {
      const message = (error as Error)?.message || 'Erreur lors de la suppression';
      toast.error(message);
      console.error('Erreur suppression:', error);
      // Fermer le modal en cas d'erreur
      setDeleteDialog({ isOpen: false, collaborator: null });
      throw error; // Re-lancer l'erreur pour que ConfirmDialog puisse la gérer
    } finally {
      setUpdating(null);
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
    const roles = role.split(',').map(r => {
      switch (r.trim()) {
        case 'vet':
          return 'Vétérinaire';
        case 'assistant':
          return 'Assistant(e)';
        case 'admin':
          return 'Admin';
        case 'stock_manager':
          return 'Gestionnaire de stock';
        case 'owner':
          return 'Propriétaire';
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
      <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Collaborateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Couleur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {collaborators.map((collaborator) => (
              <tr key={collaborator.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {collaborator.first_name.charAt(0).toUpperCase()}{collaborator.last_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {collaborator.first_name} {collaborator.last_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {collaborator.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(collaborator.role)}`}>
                    {getRoleLabel(collaborator.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ 
                        backgroundColor: getCalendarColorStyles(collaborator.calendar_color).accent,
                        borderColor: getCalendarColorStyles(collaborator.calendar_color).border
                      }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {getColorLabel(collaborator.calendar_color)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${collaborator.is_active ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                      {collaborator.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip content="Modifier">
                      <EditButton
                        onClick={() => setEditModal({ isOpen: true, collaborator })}
                        disabled={updating === collaborator.id}
                      />
                    </Tooltip>
                    
                    <Tooltip content="Supprimer">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialog({ isOpen: true, collaborator })}
                        disabled={updating === collaborator.id}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => {
          setDeleteDialog({ isOpen: false, collaborator: null });
          setUpdating(null); // Réinitialiser l'état updating
        }}
        onConfirm={handleRemove}
        onError={() => {
          setDeleteDialog({ isOpen: false, collaborator: null });
          setUpdating(null); // Réinitialiser l'état updating
        }}
        title="Retirer le collaborateur"
        message={`Êtes-vous sûr de vouloir retirer ${deleteDialog.collaborator?.first_name} ${deleteDialog.collaborator?.last_name} de la clinique ? Cette action ne peut pas être annulée.`}
        confirmText="Retirer"
        cancelText="Annuler"
        variant="danger"
        loading={updating === deleteDialog.collaborator?.id}
      />

      {editModal.collaborator && (
        <EditCollaboratorModal
          collaborator={editModal.collaborator}
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, collaborator: null })}
          onSuccess={() => {
            setEditModal({ isOpen: false, collaborator: null });
            // Optionnel: rafraîchir la liste
          }}
        />
      )}
    </>
  );
}
