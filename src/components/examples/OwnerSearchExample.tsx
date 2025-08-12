'use client'

/**
 * Exemple d'utilisation du composant OwnerSearchInput
 * Ce fichier sert de documentation et peut être supprimé en production
 */

import { useState } from 'react'
import OwnerSearchInput from '@/components/molecules/OwnerSearchInput'
import Button from '@/components/atoms/Button'
import type { Owner } from '@/types/owner.types'

export function OwnerSearchExample() {
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [formData, setFormData] = useState({
    owner: null as Owner | null,
    animalName: '',
    notes: ''
  })

  const handleOwnerSelect = (owner: Owner | null) => {
    setSelectedOwner(owner)
    console.log('Propriétaire sélectionné:', owner)
  }

  const handleFormOwnerSelect = (owner: Owner | null) => {
    setFormData(prev => ({ ...prev, owner }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Données du formulaire:', formData)
    alert(`Formulaire soumis pour ${formData.owner?.first_name} ${formData.owner?.last_name}`)
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Exemples OwnerSearchInput</h2>
      
      {/* Exemple basique */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">1. Utilisation basique</h3>
        <OwnerSearchInput
          onOwnerSelect={handleOwnerSelect}
          placeholder="Tapez pour rechercher un propriétaire..."
        />
        
        {selectedOwner && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm">
              <strong>Sélectionné:</strong> {selectedOwner.first_name} {selectedOwner.last_name}
              <br />
              <strong>ID:</strong> {selectedOwner.id}
            </p>
          </div>
        )}
      </div>

      {/* Exemple avec options personnalisées */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">2. Avec options personnalisées</h3>
        <OwnerSearchInput
          label="Propriétaire de l'animal"
          placeholder="Nom du propriétaire..."
          onOwnerSelect={handleOwnerSelect}
          required
          minSearchLength={1}
          maxResults={5}
          debounceMs={200}
        />
      </div>

      {/* Exemple dans un formulaire */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">3. Dans un formulaire</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <OwnerSearchInput
            label="Propriétaire"
            onOwnerSelect={handleFormOwnerSelect}
            value={formData.owner}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de l'animal *
            </label>
            <input
              type="text"
              value={formData.animalName}
              onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Rex, Mimi, etc."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Notes optionnelles..."
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={!formData.owner || !formData.animalName}
            className="w-full"
          >
            Enregistrer l'animal
          </Button>
        </form>
        
        {formData.owner && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm">
              <strong>Propriétaire:</strong> {formData.owner.first_name} {formData.owner.last_name}
              <br />
              <strong>Animal:</strong> {formData.animalName || '(non renseigné)'}
              <br />
              <strong>Notes:</strong> {formData.notes || '(aucune)'}
            </p>
          </div>
        )}
      </div>

      {/* Exemple avec gestion d'erreur */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">4. Avec validation</h3>
        <OwnerSearchInput
          label="Propriétaire requis"
          onOwnerSelect={handleOwnerSelect}
          error={!selectedOwner ? "Veuillez sélectionner un propriétaire" : undefined}
          required
        />
      </div>
    </div>
  )
}

export default OwnerSearchExample
