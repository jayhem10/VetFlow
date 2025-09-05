'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/atoms/Button'
import { toast } from '@/lib/toast'

export default function VetsDebugPage() {
  const [vets, setVets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchVets = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/collaborators/vets')
      const data = await response.json()
      
      if (response.ok) {
        setVets(data.veterinarians || [])
        toast.success(`${data.veterinarians?.length || 0} vétérinaire(s) trouvé(s)`)
      } else {
        toast.error(data.error || 'Erreur lors du chargement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des vétérinaires')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVets()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Debug Vétérinaires
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Liste des vétérinaires
          </h2>
          <Button onClick={fetchVets} loading={loading}>
            Recharger
          </Button>
        </div>
        
        {vets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {loading ? 'Chargement...' : 'Aucun vétérinaire trouvé'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vets.map((vet) => (
              <div 
                key={vet.id} 
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {vet.first_name} {vet.last_name}
                      {vet.is_current_user && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                          Vous
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{vet.email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rôles: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
                        {vet.role}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {vet.id}</p>
                    {vet.phone && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{vet.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
