'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import { ViewToggle } from '@/components/atoms/ViewToggle';
import ListLoader from '@/components/atoms/ListLoader';
import SearchInput from '@/components/atoms/SearchInput';
import { useOwnerStore } from '@/stores/useOwnerStore';
import { useClinic } from '@/modules/clinic/hooks/use-clinic';
import { OwnerForm } from './OwnerForm';
import { OwnersListTable } from './OwnersListTable';
import { useConfirm } from '@/hooks/useConfirm';
import type { Owner } from '@/types/owner.types';

export function OwnersList() {
  const { clinic } = useClinic();
  const { owners, loading, error, fetchOwners, deleteOwner, clearError, searchOwners } = useOwnerStore();
  const { confirm, ConfirmDialog } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [query, setQuery] = useState('');
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (clinic?.id) {
      fetchOwners();
    }
  }, [clinic?.id, fetchOwners]);

  // Recherche avec debounce
  useEffect(() => {
    if (!clinic?.id) return
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      if (!query) {
        fetchOwners()
      } else {
        searchOwners({ query })
      }
    }, 300)
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
    }
  }, [query, clinic?.id, fetchOwners, searchOwners])

  const handleEdit = (owner: Owner) => {
    setSelectedOwner(owner);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedOwner(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedOwner(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedOwner(null);
    if (clinic?.id) {
      fetchOwners();
    }
  };

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
      await deleteOwner(owner.id);
      toast.success('Propriétaire supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const isInitialLoading = loading && owners.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Propriétaires d'animaux
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les propriétaires d'animaux de votre clinique
          </p>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end min-w-[280px]">
          <div className="w-full max-w-sm">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un propriétaire..." />
          </div>
          <ViewToggle 
            view={viewMode} 
            onViewChange={setViewMode}
          />
          <Button onClick={handleAdd}>
            ➕ Ajouter un propriétaire
          </Button>
        </div>
      </div>

      {isInitialLoading && (
        <ListLoader rows={6} avatar className="mt-2" />
      )}

      {/* Erreur */}
      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-red-600 dark:text-red-400">❌</span>
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
            <Button variant="ghost" onClick={clearError}>
              ×
            </Button>
          </div>
        </Card>
      )}

      {/* Contenu selon le mode d'affichage */}
      {!isInitialLoading && (viewMode === 'list' ? (
        <OwnersListTable
          owners={owners}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          showForm={showForm}
          selectedOwner={selectedOwner}
          onCloseForm={handleCloseForm}
          onFormSuccess={handleFormSuccess}
        />
      ) : (
        // Mode grille (affichage actuel)
        owners.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun propriétaire
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Commencez par ajouter les propriétaires d'animaux de votre clinique.
            </p>
            <Button onClick={handleAdd}>
              ➕ Ajouter le premier propriétaire
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {owners.map((owner) => (
              <Card key={owner.id} className="p-6 flex flex-col">
                {/* Avatar et nom */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-700 text-white rounded-full flex items-center justify-center text-lg font-medium flex-shrink-0">
                    {owner.first_name.charAt(0).toUpperCase()}{owner.last_name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {owner.first_name} {owner.last_name}
                    </h3>
                    {owner.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        📧 {owner.email}
                      </p>
                    )}
                    {owner.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📞 {owner.phone}
                      </p>
                    )}
                    {owner.mobile && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📱 {owner.mobile}
                      </p>
                    )}
                  </div>
                </div>

                {/* Adresse */}
                {owner.address && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📍 {owner.address}
                      {owner.city && `, ${owner.city}`}
                      {owner.postal_code && ` ${owner.postal_code}`}
                    </p>
                  </div>
                )}

                {/* Contact préféré */}
                {owner.preferred_contact && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {owner.preferred_contact === 'email' ? '📧' : '📞'} Contact préféré: {owner.preferred_contact === 'email' ? 'Email' : 'Téléphone'}
                    </p>
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {owner.marketing_consent && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      ✅ Marketing OK
                    </span>
                  )}
                  {owner.animals && owner.animals > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      🐾 {owner.animals} anima{owner.animals > 1 ? 'ux' : 'l'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      🐾 Aucun animal
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex justify-end gap-2">
                  <a href={`/owners/${owner.id}`}>
                    <Button variant="outline" size="sm">🔎 Voir la fiche</Button>
                  </a>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(owner)}>✏️ Modifier</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(owner)}>🗑️ Supprimer</Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ))}

      {/* Statistiques */}
      {owners.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statistiques
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {owners.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total propriétaires
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {owners.filter(o => o.email).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avec email
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {owners.filter(o => o.phone || o.mobile).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avec téléphone
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {owners.filter(o => o.marketing_consent).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Marketing OK
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <OwnerForm
          owner={selectedOwner}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Dialog de confirmation */}
      <ConfirmDialog />
    </div>
  );
} 