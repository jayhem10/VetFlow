'use client'

import { Dialog } from '@/components/atoms/Dialog'
import type { AppointmentWithDetails } from '@/types/appointment.types'
import { cn } from '@/lib/utils'
import { Calendar, PawPrint, User, DollarSign, Paperclip, FileText, Eye } from 'lucide-react'

interface AppointmentSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentWithDetails
}

export default function AppointmentSummaryModal({ isOpen, onClose, appointment }: AppointmentSummaryModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="w-[96vw] max-w-lg max-h-[85vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Résumé du rendez-vous
          </h3>
        </div>
        
        <div className="space-y-4">
          {/* Informations de base */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Informations du rendez-vous
            </h4>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span className="font-medium">Titre :</span>
                <span>{appointment.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Date :</span>
                <span>
                  {new Date(appointment.appointment_date).toLocaleString('fr-FR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Durée :</span>
                <span>{appointment.duration_minutes || 30} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Type :</span>
                <span className="capitalize">{appointment.appointment_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Priorité :</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  appointment.priority === 'urgent' ? "bg-red-100 text-red-700" :
                  appointment.priority === 'high' ? "bg-orange-100 text-orange-700" :
                  appointment.priority === 'normal' ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-700"
                )}>
                  {appointment.priority === 'urgent' ? 'Urgente' :
                   appointment.priority === 'high' ? 'Haute' :
                   appointment.priority === 'normal' ? 'Normale' : 'Basse'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Statut :</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  appointment.status === 'completed' ? "bg-green-100 text-green-700" :
                  appointment.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                  appointment.status === 'confirmed' ? "bg-yellow-100 text-yellow-700" :
                  appointment.status === 'cancelled' ? "bg-red-100 text-red-700" :
                  appointment.status === 'no_show' ? "bg-gray-100 text-gray-700" :
                  "bg-gray-100 text-gray-700"
                )}>
                  {appointment.status === 'completed' ? 'Terminé' :
                   appointment.status === 'in_progress' ? 'En cours' :
                   appointment.status === 'confirmed' ? 'Confirmé' :
                   appointment.status === 'cancelled' ? 'Annulé' :
                   appointment.status === 'no_show' ? 'Absent' : 'Planifié'}
                </span>
              </div>
            </div>
          </div>

          {/* Animal et propriétaire */}
          {appointment.animal && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <PawPrint className="w-5 h-5" />
                Informations du patient
              </h4>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Nom :</span>
                  <span>{appointment.animal.name}</span>
                </div>
                {appointment.animal.species && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Espèce :</span>
                    <span className="capitalize">{appointment.animal.species}</span>
                  </div>
                )}
                {appointment.animal.breed && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Race :</span>
                    <span>{appointment.animal.breed}</span>
                  </div>
                )}
                {appointment.animal.owner && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Propriétaire :</span>
                      <span>
                        {appointment.animal.owner.first_name} {appointment.animal.owner.last_name}
                      </span>
                    </div>
                    {appointment.animal.owner.email && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Email :</span>
                        <span className="text-blue-600">{appointment.animal.owner.email}</span>
                      </div>
                    )}
                    {appointment.animal.owner.phone && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Téléphone :</span>
                        <span className="text-blue-600">{appointment.animal.owner.phone}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Vétérinaire */}
          {appointment.veterinarian ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Vétérinaire assigné
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Nom :</span>
                  <span>
                    {appointment.veterinarian.first_name} {appointment.veterinarian.last_name}
                  </span>
                </div>
                {appointment.veterinarian.role && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Rôle :</span>
                    <span className="capitalize">{appointment.veterinarian.role}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Vétérinaire assigné
              </h4>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Vétérinaire non assigné ou données manquantes</p>
                <p className="text-xs mt-1">ID: {appointment.veterinarian_id}</p>
              </div>
            </div>
          )}

          {/* Facture */}
          {appointment.invoice && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Facture
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Numéro :</span>
                  <span className="font-mono">{appointment.invoice.invoice_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Montant :</span>
                  <span className="font-medium">{Number(appointment.invoice.total_amount).toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Statut :</span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    appointment.invoice.payment_status === 'paid' 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                  )}>
                    {appointment.invoice.payment_status === 'paid' ? 'Payée' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fichiers */}
          {appointment.files && appointment.files.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Documents attachés
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Nombre :</span>
                  <span>{appointment.files.length} document{appointment.files.length > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Dernier upload :</span>
                  <span>{new Date(appointment.files[0].uploaded_at || '').toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes du rendez-vous
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{appointment.notes}</p>
            </div>
          )}

          {/* Notes internes */}
          {appointment.internal_notes && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes internes
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{appointment.internal_notes}</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Fermer
          </button>
        </div>
      </div>
    </Dialog>
  )
}


