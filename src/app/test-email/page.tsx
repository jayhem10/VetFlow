'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import { Mail } from 'lucide-react'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTestEmail = async () => {
    if (!email) {
      toast.error('Veuillez saisir un email')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du test')
      }

      toast.success('Email de test envoyé avec succès !')
      setEmail('')
    } catch (error) {
      const message = (error as Error)?.message || 'Erreur lors du test'
      toast.error(message)
      console.error('Erreur test email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            🧪 Test Email Brevo
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Testez la configuration email avec Brevo
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email de test
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>

            <Button
              onClick={handleTestEmail}
              className="w-full"
              disabled={isLoading || !email}
              loading={isLoading}
            >
              {isLoading ? 'Envoi...' : (
                <>
                  <Mail className="w-4 h-4" />
                  Envoyer email de test
                </>
              )}
            </Button>
          </div>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-blue-700 dark:text-blue-400 text-lg">ℹ️</span>
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-medium mb-1">Information</p>
              <p>
                Cet email de test contiendra les identifiants temporaires et le lien de connexion.
                Vérifiez votre boîte de réception et vos spams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
