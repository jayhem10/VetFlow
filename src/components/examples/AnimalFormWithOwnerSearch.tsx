'use client'

/**
 * Exemple d'intégration du OwnerSearchInput dans un formulaire d'animal
 * Montre comment remplacer un select classique par la recherche
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import OwnerSearchInput from '@/components/molecules/OwnerSearchInput'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import type { Owner } from '@/types/owner.types'

const animalFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  breed: z.string().optional(),
  weight: z.number().positive().optional(),
  owner_id: z.string().uuid('Propriétaire requis')
})

type AnimalFormData = z.infer<typeof animalFormSchema>

export function AnimalFormWithOwnerSearch() {
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  
  const form = useForm<AnimalFormData>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      name: '',
      species: 'dog',
      breed: '',
      weight: undefined,
      owner_id: ''
    }
  })

  const handleOwnerSelect = (owner: Owner | null) => {
    setSelectedOwner(owner)
    // Mettre à jour le formulaire avec l'ID du propriétaire
    form.setValue('owner_id', owner?.id || '')
    // Effacer l'erreur si il y en avait une
    if (owner) {
      form.clearErrors('owner_id')
    }
  }

  const onSubmit = (data: AnimalFormData) => {
    console.log('Données de l\'animal:', data)
    console.log('Propriétaire sélectionné:', selectedOwner)
    
    // Ici vous feriez l'appel API pour créer l'animal
    alert(`Animal ${data.name} créé pour ${selectedOwner?.first_name} ${selectedOwner?.last_name}`)
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Nouvel Animal</h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Recherche de propriétaire - NOUVEAU COMPOSANT */}
        <OwnerSearchInput
          label="Propriétaire"
          onOwnerSelect={handleOwnerSelect}
          value={selectedOwner}
          error={form.formState.errors.owner_id?.message}
          required
          placeholder="Rechercher le propriétaire..."
        />

        {/* Nom de l'animal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom de l'animal *
          </label>
          <Input
            {...form.register('name')}
            placeholder="Rex, Mimi, etc."
            error={form.formState.errors.name?.message}
          />
        </div>

        {/* Espèce */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Espèce *
          </label>
          <select
            {...form.register('species')}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="dog">🐕 Chien</option>
            <option value="cat">🐱 Chat</option>
            <option value="bird">🐦 Oiseau</option>
            <option value="rabbit">🐰 Lapin</option>
            <option value="other">🐾 Autre</option>
          </select>
        </div>

        {/* Race */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Race
          </label>
          <Input
            {...form.register('breed')}
            placeholder="Labrador, Persan, etc."
            error={form.formState.errors.breed?.message}
          />
        </div>

        {/* Poids */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Poids (kg)
          </label>
          <Input
            {...form.register('weight', { valueAsNumber: true })}
            type="number"
            step="0.1"
            placeholder="12.5"
            error={form.formState.errors.weight?.message}
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={!selectedOwner}
          >
            Créer l'animal
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AnimalFormWithOwnerSearch
