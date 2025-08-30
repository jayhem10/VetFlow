'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/lib/toast';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import OwnerSearchInput from '@/components/molecules/OwnerSearchInput';
import { useAnimalStore } from '@/stores/useAnimalStore';
import { useOwnerStore } from '@/stores/useOwnerStore';
import { useClinic } from '@/modules/clinic/hooks/use-clinic';
import type { Animal } from '@/types/animal.types';
import type { Owner } from '@/types/owner.types';

const animalSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  species: z.string().min(1, 'L\'espèce est requise'),
  breed: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  birth_date: z.string().optional(),
  weight: z.number().positive('Le poids doit être positif').optional(),
  color: z.string().optional(),
  microchip: z.string().optional(),
  tattoo: z.string().optional(),
  sterilized: z.boolean().optional(),
  sterilized_date: z.string().optional(),
  allergies: z.string().optional(),
  status: z.enum(['active', 'deceased', 'inactive']).optional(),
  deceased_date: z.string().optional(),
  notes: z.string().optional(),
  owner_id: z.string().min(1, 'Le propriétaire est requis'),
});

type AnimalFormData = z.infer<typeof animalSchema>;

interface AnimalFormProps {
  animal?: Animal | null;
  onClose: () => void;
  onSuccess: () => void;
  presetOwner?: Owner; // nouveau: pré-sélection du propriétaire
  lockOwner?: boolean; // nouveau: désactiver la sélection du propriétaire
}

export function AnimalForm({ animal, onClose, onSuccess, presetOwner, lockOwner = false }: AnimalFormProps) {
  const { clinic } = useClinic();
  const { createAnimal, updateAnimal } = useAnimalStore();
  const { owners, fetchOwners } = useOwnerStore();
  
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(presetOwner || null);
  
  // Charger les propriétaires au montage du composant
  useEffect(() => {
    if (clinic?.id) {
      fetchOwners();
    }
  }, [clinic?.id, fetchOwners]);

  // Appliquer presetOwner dans le formulaire
  useEffect(() => {
    if (presetOwner) {
      setSelectedOwner(presetOwner);
      form.setValue('owner_id', presetOwner.id, { shouldValidate: true });
      form.clearErrors('owner_id');
    }
  }, [presetOwner]);
  
  // Pré-sélectionner le propriétaire en mode édition
  useEffect(() => {
    if (!presetOwner && animal?.owner_id && owners.length > 0) {
      const owner = owners.find(o => o.id === animal.owner_id);
      if (owner) {
        setSelectedOwner(owner);
      }
    }
  }, [animal?.owner_id, owners, presetOwner]);

  const form = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: animal ? {
      name: animal.name,
      species: animal.species,
      breed: animal.breed || '',
      gender: animal.gender || 'unknown',
      birth_date: animal.birth_date || '',
      weight: animal.weight || undefined,
      color: animal.color || '',
      microchip: animal.microchip || '',
      tattoo: animal.tattoo || '',
      sterilized: animal.sterilized || false,
      sterilized_date: animal.sterilized_date || '',
      allergies: animal.allergies || '',
      status: animal.status || 'active',
      deceased_date: animal.deceased_date || '',
      notes: animal.notes || '',
      owner_id: animal.owner_id,
    } : {
      name: '',
      species: '',
      breed: '',
      gender: 'unknown',
      birth_date: '',
      weight: undefined,
      color: '',
      microchip: '',
      tattoo: '',
      sterilized: false,
      sterilized_date: '',
      allergies: '',
      status: 'active',
      deceased_date: '',
      notes: '',
      owner_id: presetOwner?.id || '',
    },
  });

  const onSubmit = async (data: AnimalFormData) => {
    try {
      if (!clinic?.id) {
        toast.error('Clinique non trouvée');
        return;
      }

      if (animal) {
        await updateAnimal(animal.id, {
          ...data,
          breed: data.breed || undefined,
          birth_date: data.birth_date || undefined,
          weight: data.weight || undefined,
          color: data.color || undefined,
          microchip: data.microchip || undefined,
          tattoo: data.tattoo || undefined,
          sterilized_date: data.sterilized_date || undefined,
          allergies: data.allergies || undefined,
          status: data.deceased_date && !data.status ? 'inactive' : data.status || undefined,
          deceased_date: data.deceased_date || undefined,
          notes: data.notes || undefined,
        });
        toast.success('Animal modifié avec succès');
      } else {
        await createAnimal({
          ...data,
          breed: data.breed || undefined,
          birth_date: data.birth_date || undefined,
          weight: data.weight || undefined,
          color: data.color || undefined,
          microchip: data.microchip || undefined,
          tattoo: data.tattoo || undefined,
          sterilized_date: data.sterilized_date || undefined,
          allergies: data.allergies || undefined,
          status: data.deceased_date ? 'inactive' : 'active',
          deceased_date: data.deceased_date || undefined,
          notes: data.notes || undefined,
        });
        toast.success('Animal créé avec succès');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erreur sauvegarde animal:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      toast.error(message);
    }
  };

  const [speciesOptions, setSpeciesOptions] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        const res = await fetch('/api/species', { cache: 'no-store' })
        if (!res.ok) throw new Error('load species failed')
        const data = await res.json()
        const opts = (data.species || []).map((s: any) => ({ value: s.name.toLowerCase(), label: s.name }))
        // Trier pour mettre les espèces courantes en tête
        const PRIORITY = [
          'chien',
          'chat',
          'lapin',
          'oiseau',
          'furet',
          "cochon d'inde",
          'hamster',
          'reptile',
          'poisson',
          'autre',
        ]
        const normalize = (s: string) => s.toLowerCase().replace(/[’']/g, "'")
        const rank = (label: string) => {
          const idx = PRIORITY.indexOf(normalize(label))
          return idx === -1 ? 999 : idx
        }
        opts.sort((a: { label: string }, b: { label: string }) => {
          const ra = rank(a.label)
          const rb = rank(b.label)
          if (ra !== rb) return ra - rb
          return a.label.localeCompare(b.label, 'fr')
        })
        // Insérer un séparateur visuel entre les prioritaires et les autres
        const firstNonPriority = opts.findIndex((o: { label: string }) => rank(o.label) === 999)
        const withSeparator = [...opts]
        if (firstNonPriority > 0 && firstNonPriority < opts.length) {
          withSeparator.splice(firstNonPriority, 0, { value: '__sep__', label: '──────────' } as any)
        }
        setSpeciesOptions(withSeparator)
      } catch (e) {
        setSpeciesOptions([
          { value: 'dog', label: '🐕 Chien' },
          { value: 'cat', label: '🐱 Chat' },
          { value: 'rabbit', label: '🐰 Lapin' },
          { value: 'bird', label: '🐦 Oiseau' },
          { value: '__sep__', label: '──────────' } as any,
          { value: 'hamster', label: '🐹 Hamster' },
          { value: 'guinea pig', label: '🐹 Cochon d\'inde' },
          { value: 'ferret', label: '🦔 Furet' },
          { value: 'reptile', label: '🦎 Reptile' },
          { value: 'fish', label: '🐠 Poisson' },
          { value: 'other', label: '🐾 Autre' },
        ])
      }
    }
    loadSpecies()
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {animal ? 'Modifier' : 'Ajouter'} un animal
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          {/* Informations de base */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom *
                </label>
                <Input
                  {...form.register('name')}
                  placeholder="Rex, Mimi, etc."
                  error={form.formState.errors.name?.message}
                />
              </div>

              <div>
                <OwnerSearchInput
                  label="Propriétaire"
                  onOwnerSelect={(owner) => {
                    setSelectedOwner(owner);
                    form.setValue('owner_id', owner?.id || '');
                    if (owner) {
                      form.clearErrors('owner_id');
                    }
                  }}
                  value={selectedOwner}
                  error={form.formState.errors.owner_id?.message}
                  required
                  placeholder="Rechercher un propriétaire..."
                  disabled={lockOwner}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Espèce *
                </label>
                <Select
                  value={form.watch('species')}
                  onChange={(value) => form.setValue('species', value)}
                  options={speciesOptions}
                  placeholder="Sélectionner une espèce"
                  error={form.formState.errors.species?.message}
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sexe
                </label>
                <Select
                  value={form.watch('gender')}
                  onChange={(value) => form.setValue('gender', value as 'male' | 'female' | 'unknown')}
                  options={[
                    { value: 'male', label: '♂️ Mâle' },
                    { value: 'female', label: '♀️ Femelle' },
                    { value: 'unknown', label: '❓ Inconnu' },
                  ]}
                  placeholder="Sélectionner un sexe"
                  error={form.formState.errors.gender?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de naissance
                </label>
                <input
                  {...form.register('birth_date')}
                  type="date"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors border-stone-300 dark:border-gray-600"
                />
                {form.formState.errors.birth_date?.message && (
                  <p className="mt-1 text-sm text-red-500">{form.formState.errors.birth_date.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Caractéristiques physiques */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Caractéristiques physiques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Poids (kg)
                </label>
                <input
                  {...form.register('weight', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="12.5"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors border-stone-300 dark:border-gray-600"
                />
                {form.formState.errors.weight?.message && (
                  <p className="mt-1 text-sm text-red-500">{form.formState.errors.weight.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Couleur
                </label>
                <Input
                  {...form.register('color')}
                  placeholder="Brun, noir et blanc, etc."
                  error={form.formState.errors.color?.message}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  {...form.register('sterilized')}
                  className="h-4 w-4 text-green-700 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  Stérilisé(e)
                </label>
              </div>
            </div>

            {form.watch('sterilized') && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de stérilisation
                </label>
                <input
                  {...form.register('sterilized_date')}
                  type="date"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors border-stone-300 dark:border-gray-600"
                />
                {form.formState.errors.sterilized_date?.message && (
                  <p className="mt-1 text-sm text-red-500">{form.formState.errors.sterilized_date.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Identification */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Puce électronique
                </label>
                <Input
                  {...form.register('microchip')}
                  placeholder="250269604123456"
                  error={form.formState.errors.microchip?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tatouage
                </label>
                <Input
                  {...form.register('tattoo')}
                  placeholder="ABC123"
                  error={form.formState.errors.tattoo?.message}
                />
              </div>
            </div>
          </div>

          {/* Informations médicales */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Informations médicales
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Allergies
                </label>
                <textarea
                  {...form.register('allergies')}
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Allergies connues..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  {...form.register('notes')}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Notes additionnelles..."
                />
              </div>

              {/* Statut et Décès */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statut
                  </label>
                  <Select
                    value={form.watch('status') || 'active'}
                    onChange={(value) => form.setValue('status', value as any)}
                    options={[
                      { value: 'active', label: 'Actif' },
                      { value: 'inactive', label: 'Inactif' },
                      { value: 'deceased', label: 'Décédé' },
                    ]}
                    placeholder="Sélectionner un statut"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de décès
                  </label>
                  <input
                    type="date"
                    {...form.register('deceased_date')}
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors border-stone-300 dark:border-gray-600"
                  />
                  <p className="mt-1 text-xs text-gray-500">Si une date est renseignée et aucun statut choisi, le statut passera en « Inactif » automatiquement.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}