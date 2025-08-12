'use client';

import { useState, useEffect, useRef } from 'react';
import SearchInput from '@/components/atoms/SearchInput';
import { useClinic } from '@/modules/clinic/hooks/use-clinic';
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import { InviteCollaboratorModal } from '@/modules/collaborators/components/InviteCollaboratorModal';
import ListLoader from '@/components/atoms/ListLoader';
import { CollaboratorCard } from '@/modules/collaborators/components/CollaboratorCard';

export default function CollaboratorsPage() {
  const { clinic, hasClinic } = useClinic();
  const { 
    collaborators, 
    loading, 
    error, 
    fetchCollaborators, 
    searchCollaborators,
    clearError 
  } = useCollaboratorsStore();
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [query, setQuery] = useState('');
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (clinic?.id) {
      fetchCollaborators();
    }
  }, [clinic?.id, fetchCollaborators]);

  // Recherche avec debounce
  useEffect(() => {
    if (!clinic?.id) return
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      if (!query) {
        fetchCollaborators()
      } else {
        searchCollaborators(query)
      }
    }, 300)
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
    }
  }, [query, clinic?.id, fetchCollaborators, searchCollaborators])

  if (!hasClinic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Clinique requise
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Vous devez créer votre clinique avant de pouvoir inviter des collaborateurs.
              </p>
              <a href="/complete-profile">
                <Button>
                  🏥 Créer ma clinique
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const isInitialLoading = loading && collaborators.length === 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Collaborateurs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez l'équipe de votre clinique {clinic?.name}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-1 justify-end min-w-[280px]">
            <div className="w-full max-w-sm">
              <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un collaborateur..." />
            </div>
            <Button onClick={() => setShowInviteModal(true)}>
              ➕ Inviter un collaborateur
            </Button>
          </div>
        </div>

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

        {/* Loading initial */}
        {isInitialLoading && (
          <ListLoader rows={6} avatar className="mt-2" />
        )}

        {/* Liste des collaborateurs */}
        {!isInitialLoading && (
          <>
            {collaborators.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun collaborateur
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Commencez par inviter vos premiers collaborateurs à rejoindre votre clinique.
                </p>
                <Button onClick={() => setShowInviteModal(true)}>
                  ➕ Inviter un collaborateur
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborators.map((collaborator) => (
                  <CollaboratorCard 
                    key={collaborator.id} 
                    collaborator={collaborator}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Statistiques */}
        {collaborators.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statistiques de l'équipe
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {collaborators.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total collaborateurs
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {collaborators.filter(c => c.role === 'vet').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Vétérinaires
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {collaborators.filter(c => c.role === 'assistant').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Assistants
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {collaborators.filter(c => (c as any).is_active).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Actifs
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Actions rapides */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actions rapides
          </h3>
          <div className="flex flex-wrap gap-4">
            <a href="/profile">
              <Button variant="outline">
                👤 Mon profil
              </Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline">
                📊 Retour au dashboard
              </Button>
            </a>
          </div>
        </Card>
      </div>

      {/* Modal d'invitation */}
      {showInviteModal && (
        <InviteCollaboratorModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            fetchCollaborators();
          }}
        />
      )}
    </div>
  );
}