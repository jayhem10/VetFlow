'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Card from '@/components/atoms/Card'
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button'
import PublicHeader from '@/components/organisms/PublicHeader'
import AuthenticatedHeader from '@/components/organisms/Header'
import Footer from '@/components/organisms/Footer'
import { toast } from '@/lib/toast'

export default function ContactPage() {
  const { data: session } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const mail = session?.user?.email || ''
    const displayName = (session?.user as any)?.name || ''
    if (displayName && !name) setName(displayName)
    if (mail && !email) setEmail(mail)
  }, [session, name, email])

  useEffect(() => {
    // Si connecté, tenter de récupérer le profil pour préremplir nom/prénom
    const loadProfile = async () => {
      if (!session?.user) return
      try {
        const res = await fetch('/api/profile/get', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const first = data?.profile?.first_name || ''
        const last = data?.profile?.last_name || ''
        if ((first || last) && !name) setName(`${first} ${last}`.trim())
        const mail = session.user.email || ''
        if (mail && !email) setEmail(mail)
      } catch {}
    }
    loadProfile()
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      })
      if (res.ok) {
        setName('')
        setEmail('')
        setMessage('')
        toast.success('Message envoyé avec succès ! Nous vous répondrons rapidement.')
      } else {
        const err = await res.json().catch(() => ({} as any))
        toast.error(err?.error || "Erreur lors de l'envoi du message")
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
      toast.error('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {session?.user ? <AuthenticatedHeader /> : <PublicHeader />}
      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Contact</h1>
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <Input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Votre nom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <Input value={email} onChange={(e: any) => setEmail(e.target.value)} type="email" placeholder="vous@exemple.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={loading} disabled={loading}>Envoyer</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}


