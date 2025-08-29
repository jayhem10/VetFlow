'use client'

import { useAuth } from '@/modules/auth/hooks/use-auth'
import { useProfile } from '@/modules/profile/hooks/use-profile'
import { useClinic } from '@/modules/clinic/hooks/use-clinic'
import { useOwnerStore } from '@/stores/useOwnerStore'
import { useAnimalStore } from '@/stores/useAnimalStore'
import { useAppointmentStore } from '@/stores/useAppointmentStore'
import { useCollaboratorsStore } from '@/stores/useCollaboratorsStore'
import TodayAppointments from '@/components/organisms/TodayAppointments'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppointmentFormModal } from '@/components/molecules/AppointmentFormModal'
import { AppointmentWithDetails } from '@/types/appointment.types'
import { toast } from '@/lib/toast'
import AppointmentSummaryModal from '@/components/molecules/AppointmentSummaryModal'
import InvoiceFormModal from '@/components/molecules/InvoiceFormModal'
import InvoiceEditModal from '@/components/molecules/InvoiceEditModal'
import type { Invoice } from '@/types/invoice.types'
import FileUpload from '@/components/molecules/FileUpload'
import { usePermissions } from '@/hooks/usePermissions'
import { Users, User, PawPrint, Calendar, FileText, Boxes, Briefcase } from 'lucide-react'


export default function Dashboard() {
  const { user, hasProfile } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const { clinic, loading: clinicLoading, hasClinic } = useClinic()


  const router = useRouter()
  const { can } = usePermissions()

  // Stores pour les statistiques
  const { owners, fetchOwners, loading: ownersLoading } = useOwnerStore()
  const { animals, fetchAnimals, loading: animalsLoading } = useAnimalStore()
  const { appointments, fetchAppointments, loading: appointmentsLoading } = useAppointmentStore()
  const { collaborators, fetchCollaborators, loading: collaboratorsLoading } = useCollaboratorsStore()

  // Loading state pour les données
  const dataLoading = ownersLoading || animalsLoading || appointmentsLoading || collaboratorsLoading

  // Charger les données une fois que la clinique est disponible
  useEffect(() => {
    console.log('🔍 Dashboard - Clinic ID:', clinic?.id, 'Loading states:', { profileLoading, clinicLoading })
    
    if (clinic?.id) {
      console.log('🔍 Dashboard - Loading data for clinic:', clinic.id)
      fetchOwners()
      fetchAnimals()
      fetchAppointments(clinic.id)
      fetchCollaborators()
    }
  }, [clinic?.id, fetchAnimals, fetchAppointments, fetchCollaborators])

  // Récupérer les compteurs globaux via API count
  const [counts, setCounts] = useState<{owners?: number; animals?: number; appointments?: number; collaborators?: number}>({})
  useEffect(() => {
    let aborted = false
    async function loadCounts() {
      try {
        const [co, ca, capp, ccol] = await Promise.all([
          fetch('/api/owners/count').then(r => r.json()),
          fetch('/api/animals/count').then(r => r.json()),
          fetch('/api/appointments/count').then(r => r.json()),
          fetch('/api/collaborators/count').then(r => r.json()),
        ])
        if (!aborted) setCounts({ owners: co.count, animals: ca.count, appointments: capp.count, collaborators: ccol.count })
      } catch (e) {
        // silencieux, on retombe sur les longueurs locales
      }
    }
    if (clinic?.id) loadCounts()
    return () => { aborted = true }
  }, [clinic?.id])

  // Calculer les statistiques (fallback aux longueurs locales)
  const stats = {
    owners: counts.owners ?? owners.length,
    animals: counts.animals ?? animals.length,
    appointmentsThisMonth: appointments.filter(apt => {
      const now = new Date()
      const aptDate = new Date(apt.appointment_date)
      return aptDate.getMonth() === now.getMonth() && 
             aptDate.getFullYear() === now.getFullYear()
    }).length,
    collaborators: counts.collaborators ?? collaborators.length
  }

  // États pour les modales
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false)
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false)
  const [existingInvoice, setExistingInvoice] = useState<Invoice | null>(null)
  const [showFilesModal, setShowFilesModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null)
  const [selectedVet, setSelectedVet] = useState<string>('all')

  // Stats du jour
  const [dailyStats, setDailyStats] = useState({ appointmentsToday: 0, revenueToday: 0, paidToday: 0, pendingToday: 0, remainingToday: 0 })

  const recomputeDaily = async () => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    const aptsTodayList = appointments.filter(a => {
      const d = new Date(a.appointment_date)
      return d >= start && d <= end
    })
    const aptsToday = aptsTodayList.length
    const remaining = aptsTodayList.filter(a => new Date(a.appointment_date) > today).length

    try {
      const [paidRes, pendingRes] = await Promise.all([
        fetch('/api/invoices?status=paid&limit=200', { cache: 'no-store' }),
        fetch('/api/invoices?status=pending&limit=200', { cache: 'no-store' }),
      ])
      const paidJson = paidRes.ok ? await paidRes.json() : { invoices: [] }
      const pendingJson = pendingRes.ok ? await pendingRes.json() : { invoices: [] }

      const dateInRange = (dateStr?: string) => {
        if (!dateStr) return false
        const d = new Date(dateStr)
        return d >= start && d <= end
      }

      // Factures payées du jour: basées sur paid_at, fallback sur invoice_date
      const paidTodayList = (paidJson.invoices || []).filter((inv: any) =>
        dateInRange(inv.paid_at || inv.invoice_date)
      )

      // Factures en attente du jour: basées sur la date de facture
      const pendingTodayList = (pendingJson.invoices || []).filter((inv: any) =>
        dateInRange(inv.invoice_date)
      )

      // CA du jour = somme des montants HT (subtotal) des factures payées aujourd'hui
      const revenue = paidTodayList.reduce((sum: number, inv: any) => sum + Number(inv.subtotal ?? 0), 0)
      setDailyStats({
        appointmentsToday: aptsToday,
        revenueToday: revenue,
        paidToday: paidTodayList.length,
        pendingToday: pendingTodayList.length,
        remainingToday: remaining,
      })
    } catch (e) {
      setDailyStats({ appointmentsToday: aptsToday, revenueToday: 0, paidToday: 0, pendingToday: 0, remainingToday: remaining })
    }
  }

  // Recalcul automatique quand RDV changent ou clinique prête
  useEffect(() => {
    if (clinic?.id) {
      recomputeDaily()
    }
  }, [clinic?.id, appointments])


  // Callbacks pour les modales
  const handleEditAppointment = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment)
    setShowEditModal(true)
  }

  const handleCreateAppointment = () => {
    setShowCreateModal(true)
  }

  const handleShowSummary = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment)
    setShowSummaryModal(true)
  }

  const handleShowInvoice = async (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}/invoice`)
      if (res.ok) {
        const data = await res.json()
        setExistingInvoice(data as Invoice)
        setShowEditInvoiceModal(true)
        return
      }
      setExistingInvoice(null)
      setShowCreateInvoiceModal(true)
    } catch {
      setExistingInvoice(null)
      setShowCreateInvoiceModal(true)
    }
  }

  const handleShowFiles = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment)
    setShowFilesModal(true)
  }

  const handleModalSuccess = async () => {
    if (clinic?.id) {
      await fetchAppointments(clinic.id)
      await recomputeDaily()
    }
    setShowEditModal(false)
    setShowCreateModal(false)
    setShowSummaryModal(false)
    setShowCreateInvoiceModal(false)
    setShowEditInvoiceModal(false)
    setSelectedAppointment(null)
    setExistingInvoice(null)
  }

  const handleModalClose = () => {
    setShowEditModal(false)
    setShowCreateModal(false)
    setShowSummaryModal(false)
    setShowCreateInvoiceModal(false)
    setShowEditInvoiceModal(false)
    setShowFilesModal(false)
    setSelectedAppointment(null)
    setExistingInvoice(null)
  }

  if (profileLoading || clinicLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête visuel amélioré avec bonjour personnalisé */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 text-white shadow-lg">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm opacity-90">Bienvenue{clinic?.name ? ` à ${clinic.name}` : ''}</div>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Tableau de bord</h1>
              <p className="mt-2 text-white/90 max-w-2xl">
                Accédez rapidement à vos données, recherchez des propriétaires, animaux et collaborateurs, et gérez votre activité en un clin d'œil.
              </p>
              {/* Boutons d'accès rapides conditionnels par droits */}
              <div className="mt-4 flex flex-wrap gap-3">
                {can('owners', 'read') && (
                  <a href="/owners" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 transition shadowsm">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Propriétaires</span>
                  </a>
                )}
                {can('animals', 'read') && (
                  <a href="/animals" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 transition shadow-sm">
                    <PawPrint className="h-4 w-4" />
                    <span className="font-medium">Animaux</span>
                  </a>
                )}
                {can('appointments', 'read') && (
                  <a href="/appointments" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 transition shadow-sm">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Rendez-vous</span>
                  </a>
                )}
                {can('invoices', 'read') && (
                  <a href="/invoices" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 transition shadow-sm">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Factures</span>
                  </a>
                )}
                {can('stock', 'read') && (
                  <a href="/inventory" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 transition shadow-sm">
                    <Boxes className="h-4 w-4" />
                    <span className="font-medium">Stocks</span>
                  </a>
                )}
                {can('collaborators', 'read') && (
                  <a href="/collaborators" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 transition shadow-sm">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Collaborateurs</span>
                  </a>
                )}
                {can('services', 'read') && (
                  <a href="/services" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 transition shadow-sm">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">Prestations</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Contenu principal */}
        <div className="space-y-8">
          {/* Stats du jour */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aujourd'hui</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                <div className="text-sm text-emerald-700 dark:text-emerald-300">RDV du jour</div>
                <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{dailyStats.appointmentsToday}</div>
              </div>
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                <div className="text-sm text-blue-700 dark:text-blue-300">CA du jour</div>
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{dailyStats.revenueToday.toFixed(2)} €</div>
              </div>
              <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                <div className="text-sm text-green-700 dark:text-green-300">Factures payées</div>
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">{dailyStats.paidToday}</div>
              </div>
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
                <div className="text-sm text-amber-700 dark:text-amber-300">En attente</div>
                <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">{dailyStats.pendingToday}</div>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <TodayAppointments 
            onEditAppointment={handleEditAppointment}
            onCreateAppointment={handleCreateAppointment}
            onShowSummary={handleShowSummary}
            onShowInvoice={handleShowInvoice}
            onShowFiles={handleShowFiles}
          />
          {/* Aperçu de la clinique en bas, pleine largeur */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              Aperçu de la clinique
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{dataLoading ? '-' : stats.owners}</div>
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Propriétaires</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{dataLoading ? '-' : stats.animals}</div>
                <div className="text-xs font-medium text-green-700 dark:text-green-300">Animaux</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">{dataLoading ? '-' : stats.appointmentsThisMonth}</div>
                <div className="text-xs font-medium text-purple-700 dark:text-purple-300">RDV ce mois</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{dataLoading ? '-' : stats.collaborators}</div>
                <div className="text-xs font-medium text-orange-700 dark:text-orange-300">Collaborateurs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <AppointmentFormModal
        appointment={selectedAppointment}
        isOpen={showEditModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        mode="edit"
      />

      <AppointmentFormModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        mode="create"
        defaultDate={new Date().toISOString().slice(0, 16)}
        defaultVetId={selectedVet !== 'all' ? selectedVet : undefined}
      />

      {/* Modales page-level */}
      {showSummaryModal && selectedAppointment && (
        <AppointmentSummaryModal
          isOpen={showSummaryModal}
          onClose={handleModalClose}
          appointment={selectedAppointment}
        />
      )}

      {showCreateInvoiceModal && selectedAppointment && (
        <InvoiceFormModal
          isOpen={showCreateInvoiceModal}
          onClose={handleModalClose}
          appointment={selectedAppointment}
          onInvoiceCreated={(invoice) => {
            // Rafraîchir et lier l'invoice au rendez-vous courant
            setExistingInvoice(invoice as Invoice)
            setShowCreateInvoiceModal(false)
            setShowEditInvoiceModal(true)
            if (clinic?.id) {
              fetchAppointments(clinic.id).catch(() => {})
            }
          }}
        />
      )}

      {showEditInvoiceModal && existingInvoice && (
        <InvoiceEditModal
          isOpen={showEditInvoiceModal}
          onClose={handleModalClose}
          invoice={existingInvoice}
          onUpdate={async (updatedInvoice) => {
            // Rafraîchir les données des rendez-vous pour mettre à jour l'affichage
            if (clinic?.id) {
              await fetchAppointments(clinic.id)
            }
            handleModalSuccess()
          }}
        />
      )}

      {showFilesModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-lg font-semibold">Documents du rendez-vous</h2>
              <button onClick={handleModalClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">×</button>
            </div>
            <div className="p-6">
              <FileUpload
                appointmentId={selectedAppointment.id}
                animalId={selectedAppointment.animal?.id}
                ownerId={selectedAppointment.animal?.owner?.id}
                onFileUploaded={() => toast.success('Fichier ajouté')}
                onFileDeleted={() => toast.success('Fichier supprimé')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
