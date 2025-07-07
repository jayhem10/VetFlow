import React from 'react'
import { useOwners } from '@/hooks/useOwners'
import { useUIStore } from '@/stores/useUIStore'

export function OwnersList() {
  const { owners, loading, error, deleteOwner } = useOwners()
  const { openModal, showNotification } = useUIStore()

  if (loading) return <div className="p-4">Chargement des propriétaires...</div>
  if (error) return <div className="p-4 text-red-500">Erreur: {error}</div>

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce propriétaire ?')) {
      try {
        await deleteOwner(id)
        showNotification('success', 'Propriétaire supprimé avec succès')
      } catch (error) {
        showNotification('error', 'Erreur lors de la suppression')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Propriétaires</h2>
        <button
          onClick={() => openModal('ownerForm')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Ajouter un propriétaire
        </button>
      </div>

      {owners.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun propriétaire trouvé
        </div>
      ) : (
        <div className="grid gap-4">
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {owner.first_name} {owner.last_name}
                  </h3>
                  {owner.email && (
                    <p className="text-gray-600">{owner.email}</p>
                  )}
                  {owner.phone && (
                    <p className="text-gray-600">{owner.phone}</p>
                  )}
                  {owner.address && (
                    <p className="text-sm text-gray-500 mt-1">
                      {owner.address}
                      {owner.city && `, ${owner.city}`}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal('ownerForm')}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(owner.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 