'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/atoms/Button';
import { useOwnerStore } from '@/stores/useOwnerStore';
import { useClinic } from '@/modules/clinic/hooks/use-clinic';
import { OwnerForm } from './OwnerForm';
import { useConfirm } from '@/hooks/useConfirm';
import type { Owner } from '@/types/owner.types';

interface OwnersListTableProps {
  owners: Owner[];
  onEdit: (owner: Owner) => void;
  onDelete: (owner: Owner) => void;
  onAdd: () => void;
  showForm: boolean;
  selectedOwner: Owner | null;
  onCloseForm: () => void;
  onFormSuccess: () => void;
}

export function OwnersListTable({
  owners,
  onEdit,
  onDelete,
  onAdd,
  showForm,
  selectedOwner,
  onCloseForm,
  onFormSuccess
}: OwnersListTableProps) {
  const { confirm, ConfirmDialog } = useConfirm();

  const handleDelete = async (owner: Owner) => {
    const confirmed = await confirm({
      title: 'Supprimer le propriétaire',
      description: `Êtes-vous sûr de vouloir supprimer ${owner.first_name} ${owner.last_name} ? Cette action est irréversible et supprimera également tous les animaux associés.`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await onDelete(owner);
      toast.success('Propriétaire supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (owners.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucun propriétaire
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Commencez par ajouter les propriétaires d'animaux de votre clinique.
          </p>
          <Button onClick={onAdd}>
            ➕ Ajouter le premier propriétaire
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Propriétaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Préférences
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Animaux
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {owners.map((owner) => (
              <tr key={owner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {owner.first_name.charAt(0).toUpperCase()}{owner.last_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {owner.first_name} {owner.last_name}
                      </div>
                      {owner.email && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {owner.email}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {owner.phone && (
                      <div>📞 {owner.phone}</div>
                    )}
                    {owner.mobile && (
                      <div>📱 {owner.mobile}</div>
                    )}
                    {!owner.phone && !owner.mobile && (
                      <div className="text-gray-500 dark:text-gray-400">-</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {owner.address ? (
                      <div>
                        <div>{owner.address}</div>
                        {owner.city && owner.postal_code && (
                          <div className="text-gray-500 dark:text-gray-400">
                            {owner.postal_code} {owner.city}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">-</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {owner.preferred_contact && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {owner.preferred_contact === 'email' ? '📧 Email' : '📞 Téléphone'}
                      </span>
                    )}
                    {owner.marketing_consent && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Marketing OK
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {owner.animals && owner.animals > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {owner.animals} anima{owner.animals > 1 ? 'ux' : 'l'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        Aucun animal
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <a href={`/owners/${owner.id}`}>
                      <Button variant="outline" size="sm">🔎 Voir la fiche</Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(owner)}
                    >
                      ✏️ Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(owner)}
                    >
                      🗑️ Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <OwnerForm
          owner={selectedOwner}
          onClose={onCloseForm}
          onSuccess={onFormSuccess}
        />
      )}

      {/* Dialog de confirmation */}
      <ConfirmDialog />
    </div>
  );
}
