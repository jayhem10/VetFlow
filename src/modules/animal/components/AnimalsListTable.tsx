'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/atoms/Button';
import { useAnimalStore } from '@/stores/useAnimalStore';
import { useOwnerStore } from '@/stores/useOwnerStore';
import { useClinic } from '@/modules/clinic/hooks/use-clinic';
import { AnimalForm } from './AnimalForm';
import type { Animal } from '@/types/animal.types';

interface AnimalsListTableProps {
  animals: Animal[];
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  showForm: boolean;
  selectedAnimal: Animal | null;
  onCloseForm: () => void;
  onFormSuccess: () => void;
}

export function AnimalsListTable({
  animals,
  onEdit,
  onDelete,
  onAdd,
  showForm,
  selectedAnimal,
  onCloseForm,
  onFormSuccess
}: AnimalsListTableProps) {
  const { owners } = useOwnerStore();

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

  const getOwnerName = (ownerId: string) => {
    const owner = owners.find(o => o.id === ownerId);
    return owner ? `${owner.first_name} ${owner.last_name}` : 'Propriétaire inconnu';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatWeight = (weight?: number) => {
    if (!weight) return '-';
    return `${weight} kg`;
  };

  if (animals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🐾</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucun animal
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Commencez par ajouter les animaux de vos clients.
          </p>
          <Button onClick={onAdd}>
            🐾 Ajouter le premier animal
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
                Animal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Espèce
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Propriétaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Naissance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Poids
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {animals.map((animal) => (
              <tr key={animal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {getSpeciesEmoji(animal.species)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {animal.name} {getGenderEmoji(animal.gender)}
                      </div>
                      {animal.breed && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {animal.breed}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {getSpeciesLabel(animal.species)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    <a
                      href={`/owners/${animal.owner_id}`}
                      className="text-green-700 dark:text-green-400 hover:underline"
                      aria-label="Voir la fiche du propriétaire"
                    >
                      {getOwnerName(animal.owner_id)}
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDate(animal.birth_date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatWeight(animal.weight)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {animal.sterilized && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Stérilisé
                      </span>
                    )}
                    {animal.microchip && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Pucé
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(animal)}
                    >
                      ✏️ Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(animal.id)}
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
        <AnimalForm
          animal={selectedAnimal}
          onClose={onCloseForm}
          onSuccess={onFormSuccess}
        />
      )}
    </div>
  );
}
