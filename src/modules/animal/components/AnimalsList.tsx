'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import { ViewToggle } from '@/components/atoms/ViewToggle';
import SearchInput from '@/components/atoms/SearchInput';
import ListLoader from '@/components/atoms/ListLoader';
import { useAnimalStore } from '@/stores/useAnimalStore';
import { useOwnerStore } from '@/stores/useOwnerStore';
import { useClinic } from '@/modules/clinic/hooks/use-clinic';
import { AnimalForm } from './AnimalForm';
import { AnimalsListTable } from './AnimalsListTable';
import type { Animal } from '@/types/animal.types';

export function AnimalsList() {
  const { clinic } = useClinic();
  const { animals, loading, error, fetchAnimals, deleteAnimal, clearError, animalsTotal, animalsPageSize } = useAnimalStore();
  const { owners, fetchOwners, loading: ownersLoading } = useOwnerStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [query, setQuery] = useState('');
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const [page, setPage] = useState(1);
  const [ownersInitialized, setOwnersInitialized] = useState(false);
  const [animalsInitialized, setAnimalsInitialized] = useState(false);

  useEffect(() => {
    if (!clinic?.id) return
    // Charger d'abord les owners, puis les animaux pour éviter le flash de l'avertissement
    ;(async () => {
      try {
        setOwnersInitialized(false)
        await fetchOwners()
        setOwnersInitialized(true)
      } finally {
        setAnimalsInitialized(false)
        await fetchAnimals(page, 25)
        setAnimalsInitialized(true)
      }
    })()
  }, [clinic?.id, fetchAnimals, fetchOwners, page]);

  // Recherche avec debounce
  useEffect(() => {
    if (!clinic?.id) return
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      if (!query) {
        setAnimalsInitialized(false)
        fetchAnimals(page, 25).finally(() => setAnimalsInitialized(true))
      } else {
        setAnimalsInitialized(false)
        Promise.resolve(useAnimalStore.getState().searchAnimals({ query }))
          .finally(() => setAnimalsInitialized(true))
      }
    }, 300)
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
    }
  }, [query, clinic?.id, fetchAnimals, page])

  const handleEdit = (animal: Animal) => {
    setSelectedAnimal(animal);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedAnimal(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedAnimal(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedAnimal(null);
    if (clinic?.id) {
      fetchAnimals(page, 25);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) {
      return;
    }

    try {
      await deleteAnimal(id);
      toast.success('Animal supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getSpeciesEmoji = (species: string) => {
    const emojiMap: Record<string, string> = {
      dog: '🐕',
      cat: '🐱',
      bird: '🐦',
      rabbit: '🐰',
      hamster: '🐹',
      'guinea pig': '🐹',
      ferret: '🦔',
      reptile: '🦎',
      fish: '🐠',
      other: '🐾',
    };
    return emojiMap[species] || '🐾';
  };

  const getSpeciesLabel = (species: string) => {
    const labelMap: Record<string, string> = {
      dog: 'Chien',
      cat: 'Chat',
      bird: 'Oiseau',
      rabbit: 'Lapin',
      hamster: 'Hamster',
      'guinea pig': 'Cochon d\'inde',
      ferret: 'Furet',
      reptile: 'Reptile',
      fish: 'Poisson',
      other: 'Autre',
    };
    return labelMap[species] || species;
  };

  const getGenderEmoji = (gender?: string) => {
    switch (gender) {
      case 'male': return '♂️';
      case 'female': return '♀️';
      default: return '';
    }
  };

  const getOwnerName = (ownerId: string, fallbackFromAnimal?: string) => {
    if (fallbackFromAnimal) return fallbackFromAnimal
    const owner = owners.find(o => o.id === ownerId);
    return owner ? `${owner.first_name} ${owner.last_name}` : 'Propriétaire inconnu';
  };

  const isInitialLoading = loading && animals.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Animaux
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez tous les animaux de votre clinique
          </p>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end min-w-[280px]">
          <div className="w-full max-w-sm">
            <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un animal..." />
          </div>
          <ViewToggle 
            view={viewMode} 
            onViewChange={setViewMode}
          />
          <Button onClick={handleAdd} disabled={owners.length === 0}>
            🐾 Ajouter un animal
          </Button>
        </div>
      </div>

      {isInitialLoading && (
        <ListLoader rows={6} avatar className="mt-2" />
      )}

      

      {/* Avertissement si pas de propriétaires (attendre la fin du chargement pour éviter le flash) */}
      {ownersInitialized && !ownersLoading && owners.length === 0 && (
        <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                Aucun propriétaire trouvé
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Vous devez d'abord ajouter des propriétaires avant de pouvoir créer des animaux.
              </p>
              <a 
                href="/owners" 
                className="inline-block mt-2 text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
              >
                → Ajouter des propriétaires
              </a>
            </div>
          </div>
        </Card>
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
        (animals.length === 0 && (!animalsInitialized || loading)) ? (
          <ListLoader rows={6} avatar className="mt-2" />
        ) : (
          <AnimalsListTable
            animals={animals}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
            showForm={showForm}
            selectedAnimal={selectedAnimal}
            onCloseForm={handleCloseForm}
            onFormSuccess={handleFormSuccess}
          />
        )
      ) : (
        // Mode grille (affichage actuel)
        (animals.length === 0 && animalsInitialized && !loading) ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🐾</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun animal
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Commencez par ajouter les animaux de vos clients.
            </p>
            {owners.length > 0 ? (
              <Button onClick={handleAdd}>
                🐾 Ajouter le premier animal
              </Button>
            ) : (
              <a href="/owners">
                <Button>
                  👥 Ajouter des propriétaires d'abord
                </Button>
              </a>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((animal) => (
              <Card key={animal.id} className="p-6 flex flex-col">
                {/* Avatar et infos principales */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 text-white rounded-full flex items-center justify-center text-lg flex-shrink-0">
                    {getSpeciesEmoji(animal.species)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {animal.name} {getGenderEmoji(animal.gender)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getSpeciesLabel(animal.species)}
                      {animal.breed && ` - ${animal.breed}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🏠 {getOwnerName(animal.owner_id, animal.owner_name)}
                    </p>
                    <a
                       href={`/owners/${animal.owner_id}`}
                      className="inline-block text-green-700 dark:text-green-400 text-sm hover:underline mt-1"
                      aria-label="Voir la fiche du propriétaire"
                    >
                      → Voir le propriétaire
                    </a>
                  </div>
                </div>
 
                 {/* Informations détaillées */}
                 <div className="space-y-2 mb-4">
                   {animal.birth_date && (
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       🎂 Né(e) le {new Date(animal.birth_date).toLocaleDateString('fr-FR')}
                     </p>
                   )}
                   {animal.weight && (
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       ⚖️ {animal.weight} kg
                     </p>
                   )}
                   {animal.color && (
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       🎨 {animal.color}
                     </p>
                   )}
                   {animal.microchip && (
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       🔍 Puce: {animal.microchip}
                     </p>
                   )}
                   {animal.tattoo && (
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       🖋️ Tatouage: {animal.tattoo}
                     </p>
                   )}
                 </div>
 
                 {/* Statuts */}
                 <div className="flex flex-wrap gap-2 mb-4">
                   {animal.sterilized && (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                       🏥 Stérilisé(e)
                     </span>
                   )}
                   {animal.microchip && (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                       🔍 Pucé(e)
                     </span>
                   )}
                 </div>
 
                 {/* Actions */}
                <div className="mt-auto flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(animal)}>✏️ Modifier</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(animal.id)}>🗑️ Supprimer</Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ))}

      {/* Statistiques */}
      {animals.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statistiques
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {animalsTotal ?? animals.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total animaux
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {animals.filter(a => a.species === 'dog').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Chiens
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {animals.filter(a => a.species === 'cat').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Chats
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {animals.filter(a => a.sterilized).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Stérilisés
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Pagination (bas de page) */}
      {!isInitialLoading && !query && animalsTotal && animalsTotal > (animalsPageSize || 25) && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} / {Math.ceil((animalsTotal || 0) / (animalsPageSize || 25))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>Précédent</Button>
            <Button variant="outline" disabled={page >= Math.ceil((animalsTotal || 0) / (animalsPageSize || 25))} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
          </div>
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <AnimalForm
          animal={selectedAnimal}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}