'use client'

import { useEffect, useState, useCallback, use as usePromise } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import { AnimalsService } from '@/services/animals.service'
import { OwnersService } from '@/services/owners.service'
import type { Owner } from '@/types/owner.types'
import type { Animal } from '@/types/animal.types'
import { AnimalForm } from '@/modules/animal/components/AnimalForm'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { OwnerForm } from '@/modules/owner/components/OwnerForm'
import { OwnerAppointmentsHistory } from '@/components/molecules/OwnerAppointmentsHistory'
import { toast } from 'react-hot-toast'
import { useConfirm } from '@/hooks/useConfirm'
import { EditButton } from '@/components/atoms/EditButton'

export default function OwnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = usePromise(params)

  const [owner, setOwner] = useState<Owner | null>(null)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAnimalForm, setShowAnimalForm] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null)
  const [showOwnerForm, setShowOwnerForm] = useState(false)

  const { deleteAnimal } = useAnimalStore()
  const { confirm, ConfirmDialog } = useConfirm()

  const loadData = useCallback(async (ownerId: string) => {
    setLoading(true)
    try {
      const o = await OwnersService.getById(ownerId)
      setOwner(o)
      const a = await AnimalsService.search({ ownerId })
      setAnimals(a)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      loadData(id).catch(console.error)
    }
  }, [id, loadData])

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal)
    setShowAnimalForm(true)
  }

  const handleDeleteAnimal = async (animalId: string) => {
    const confirmed = await confirm({
      title: "Supprimer l'animal",
      message: "Êtes-vous sûr de vouloir supprimer définitivement cet animal ? Cette action est irréversible.",
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger'
    })
    if (!confirmed) return

    try {
      await deleteAnimal(animalId)
      toast.success('Animal supprimé avec succès')
      // Mettre à jour l'état local des animaux
      setAnimals(prev => prev.filter(animal => animal.id !== animalId))
    } catch (e) {
      toast.error("Erreur lors de la suppression de l'animal")
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        </div>
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="text-red-600">Propriétaire introuvable</div>
          <Button variant="outline" onClick={() => router.push('/owners')}>Retour</Button>
        </Card>
      </div>
    )
  }

  const animalsCount = animals.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Fiche propriétaire structurée en blocs */}
      <Card className="p-0 overflow-hidden">
        {/* En-tête moderne */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-green-900/20 dark:to-emerald-900/10 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 bg-green-700 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                {owner.first_name.charAt(0).toUpperCase()}{owner.last_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold truncate text-gray-900 dark:text-white">{owner.first_name} {owner.last_name}</h1>
                <div className="mt-1 flex flex-wrap gap-2">
                  {owner.preferred_contact && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {owner.preferred_contact === 'email' ? '📧 Email préféré' : owner.preferred_contact === 'mobile' ? '📱 Mobile préféré' : '📞 Téléphone préféré'}
                    </span>
                  )}
                  {owner.marketing_consent && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      ✅ Marketing OK
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                    🐾 {animalsCount} animal{animalsCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            {/* Toolbar actions */}
            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-end">
              <a href="/owners" className="md:order-3">
                <Button variant="outline">↩ Retour</Button>
              </a>
              <EditButton 
                className="md:order-2" 
                showText={true}
                text="Modifier le profil"
                onClick={() => setShowOwnerForm(true)}
              />
              <Button className="md:order-1" onClick={() => { setEditingAnimal(null); setShowAnimalForm(true) }}>➕ Ajouter un animal</Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Blocs horizontaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bloc Contact */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 h-full">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span>📞</span>
                  <span>Contact</span>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm text-gray-800 dark:text-gray-200">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Email</div>
                    <div>{owner.email ? <a className="hover:underline" href={`mailto:${owner.email}`}>{owner.email}</a> : '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Téléphone</div>
                    <div className="flex flex-wrap gap-2">
                      {owner.phone ? <a className="hover:underline" href={`tel:${owner.phone}`}>📞 {owner.phone}</a> : <span>—</span>}
                      {owner.mobile ? <a className="hover:underline" href={`tel:${owner.mobile}`}>📱 {owner.mobile}</a> : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloc Adresse */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 h-full">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span>📍</span>
                  <span>Adresse</span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {owner.address || owner.city || owner.postal_code ? (
                    <p>
                      {owner.address}
                      {owner.postal_code && `, ${owner.postal_code}`}
                      {owner.city && ` ${owner.city}`}
                    </p>
                  ) : '—'}
                </div>
              </div>

              {/* Bloc Notes (avant Historique) */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 h-full">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span>📝</span>
                  <span>Notes</span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{owner.notes || '—'}</div>
              </div>

              {/* Bloc Historique */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 h-full">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span>🗓️</span>
                  <span>Historique</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-700 dark:text-gray-300">
                  {owner.created_at && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      Créé le {new Date(owner.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  {owner.updated_at && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      Maj le {new Date(owner.updated_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
          </div>
        </div>
      </Card>

      {/* Liste des animaux */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Animaux</h2>
        {animals.length === 0 ? (
          <div className="text-gray-600">Aucun animal</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {animals.map((animal) => (
              <Card key={animal.id} className="p-4">
                <div className="font-semibold">{animal.name}</div>
                <div className="text-sm text-gray-600">{animal.species}{animal.breed ? ` • ${animal.breed}` : ''}</div>
                {animal.status && (
                  <div className="text-xs text-gray-500 mt-1">Statut: {animal.status}</div>
                )}
                <div className="flex gap-2 mt-3 justify-end">
                  <EditButton
                    showText={true}
                    onClick={() => handleEditAnimal(animal)}
                  />
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteAnimal(animal.id)}>
                    🗑️
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Historique des rendez-vous */}
      <Card className="p-6">
        <OwnerAppointmentsHistory ownerId={owner.id} />
      </Card>

      {/* Modal ajout/édition animal */}
      {showAnimalForm && owner && (
        <AnimalForm
          animal={editingAnimal}
          onClose={() => setShowAnimalForm(false)}
          onSuccess={async () => {
            setShowAnimalForm(false)
            await loadData(owner.id)
          }}
          presetOwner={owner as any}
          lockOwner
        />
      )}

      {/* Modal modification propriétaire */}
      {showOwnerForm && (
        <OwnerForm
          owner={owner}
          onClose={() => setShowOwnerForm(false)}
          onSuccess={async () => {
            setShowOwnerForm(false)
            await loadData(owner.id)
            toast.success('Profil propriétaire mis à jour')
          }}
        />
      )}

      {/* Dialog de confirmation */}
      <ConfirmDialog />
    </div>
  )
}
