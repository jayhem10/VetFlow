'use client'

import { useState } from 'react'
import AppointmentScheduler from '@/components/organisms/AppointmentScheduler'
import AppointmentsList from '@/components/organisms/AppointmentsList'
import Button from '@/components/atoms/Button'
import { ViewToggle } from '@/components/atoms/ViewToggle'

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  const handleViewChange = (view: string) => {
    setViewMode(view as 'calendar' | 'list')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête avec toggle de vue */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Rendez-vous
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos rendez-vous en vue calendrier ou liste
            </p>
          </div>
          <ViewToggle
            view={viewMode}
            onViewChange={handleViewChange}
            options={[
              { value: 'calendar', label: 'Calendrier', icon: '📅' },
              { value: 'list', label: 'Liste', icon: '📋' }
            ]}
          />
        </div>
      </div>

      {/* Contenu selon la vue sélectionnée */}
      {viewMode === 'calendar' ? (
        <AppointmentScheduler />
      ) : (
        <AppointmentsList />
      )}
    </div>
  )
}


