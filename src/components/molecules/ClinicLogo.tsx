'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ClinicLogoProps {
  clinicId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showFallback?: boolean
}

export default function ClinicLogo({ 
  clinicId, 
  className = '', 
  size = 'md',
  showFallback = true 
}: ClinicLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchClinicLogo()
  }, [clinicId])

  const fetchClinicLogo = async () => {
    try {
      const response = await fetch(`/api/clinic/get`)
      if (response.ok) {
        const clinic = await response.json()
        setLogoUrl(clinic.logo_url)
      }
    } catch (error) {
      console.error('Erreur récupération logo:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-32 h-32'
  }

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`} />
    )
  }

  if (error || !logoUrl) {
    if (!showFallback) return null
    
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center text-white font-bold ${className}`}>
        <span className="text-lg">V</span>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      <Image
        src={logoUrl}
        alt="Logo de la clinique"
        fill
        className="object-contain rounded-lg"
        onError={() => setError(true)}
      />
    </div>
  )
}
