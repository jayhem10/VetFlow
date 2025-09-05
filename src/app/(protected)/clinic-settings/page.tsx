'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import { toast } from '@/lib/toast'
import LogoUpload from '@/components/molecules/LogoUpload'
import { useClinic } from '@/modules/clinic/hooks/use-clinic'



export default function ClinicSettingsPage() {
  // Utiliser le hook useClinic au lieu de l'état local
  const { clinic, loading: clinicLoading, updateClinic } = useClinic()
  
  console.log('🏥 ClinicSettingsPage - clinic:', clinic)
  console.log('🏥 ClinicSettingsPage - loading:', clinicLoading)
  
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  })

  // Mettre à jour le formulaire quand les données de clinique sont chargées
  useEffect(() => {
    if (clinic) {
      console.log('🏥 Clinic data loaded:', clinic)
      setFormData({
        name: clinic.name || '',
        email: clinic.email || '',
        phone: clinic.phone || '',
        address: clinic.address || '',
        city: clinic.city || '',
        postalCode: clinic.postalCode || '',
        country: clinic.country || ''
      })
    }
  }, [clinic])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (!clinic?.id) {
      toast.error('Aucune clinique trouvée')
      return
    }

    try {
      console.log('🔄 Début mise à jour clinique avec ID:', clinic.id)
      console.log('🔄 Données à envoyer:', formData)
      
      // Utiliser updateClinic du store au lieu d'un fetch direct
      const updatedClinic = await updateClinic(clinic.id, {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country || undefined
      })
      
      console.log('✅ Clinique mise à jour avec succès:', updatedClinic)
      toast.success('Clinique mise à jour avec succès')
    } catch (error) {
      console.error('❌ Erreur update clinic:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUploaded = (logoUrl: string) => {
    // Le logo sera automatiquement mis à jour via le store
    console.log('🖼️ Logo uploaded:', logoUrl)
  }

  if (clinicLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-gray-600">Aucune clinique trouvée</p>
            <div className="mt-4 text-xs text-gray-500">
              <p>Debug info:</p>
              <p>Clinic: {JSON.stringify(clinic)}</p>
              <p>Loading: {JSON.stringify(clinicLoading)}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Paramètres de la clinique
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez les informations et l'apparence de votre clinique
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informations de la clinique */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Informations générales</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de la clinique *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nom de votre clinique"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@clinique.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01 23 45 67 89"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Rue de la Santé"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ville
                </label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code postal
                </label>
                <Input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="75001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pays
              </label>
              <Input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="France"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </Button>
          </form>
        </Card>

        {/* Logo de la clinique */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Logo de la clinique</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Le logo de votre clinique apparaîtra sur les factures et documents générés.
              Formats acceptés : JPG, PNG, WebP - Taille maximale : 5MB
            </p>
          </div>

          <LogoUpload
            currentLogoUrl={clinic.logo}
            onLogoUploaded={handleLogoUploaded}
            clinicId={clinic.id}
          />
        </Card>
      </div>
    </div>
  )
}
