'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Card from '@/components/atoms/Card'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la réinitialisation')
      }

      setIsSuccess(true)
      toast.success('Email de réinitialisation envoyé !')
    } catch (error) {
      const message = (error as Error)?.message || 'Erreur lors de la réinitialisation'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Email envoyé !
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Si cet email existe dans notre base de données, vous recevrez un email avec un nouveau mot de passe temporaire.
          </p>
          <Button onClick={onBack} variant="outline">
            ← Retour à la connexion
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mot de passe oublié ?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Entrez votre adresse email pour recevoir un nouveau mot de passe temporaire
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adresse email
          </label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
            placeholder="votre@email.com"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          loading={isLoading}
        >
          {isLoading ? 'Envoi en cours...' : 'Envoyer le mot de passe temporaire'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Retour à la connexion
          </button>
        </div>
      </form>
    </Card>
  )
}
