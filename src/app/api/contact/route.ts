import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'
import { z } from 'zod'

// Mémoire simple en RAM pour le rate limiting (OK pour un MVP)
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 5 // 5 requêtes par minute
const requestsMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const timestamps = (requestsMap.get(ip) || []).filter(ts => ts > windowStart)
  timestamps.push(now)
  requestsMap.set(ip, timestamps)
  return timestamps.length > RATE_LIMIT_MAX
}

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().email().max(255),
  message: z.string().trim().min(10).max(2000),
  // Champ honeypot (ne doit pas être rempli par un humain)
  website: z.string().max(0).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const { name, email, message, website } = parsed.data

    // Honeypot: si rempli, on ignore silencieusement
    if (website && website.length > 0) {
      return NextResponse.json({ ok: true })
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Nouveau message contact</h2>
        <p><strong>Nom:</strong> ${name || '—'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr />
        <p>${(message || '').replace(/\n/g, '<br/>')}</p>
      </div>
    `

    await EmailService.sendTemplatedEmail({
      to: 'noreply@vetflow.cloud',
      subject: 'Contact VetFlow - Nouveau message',
      title: 'Nouveau message de contact',
      preheader: `Message de ${name || 'Anonyme'} (${email})`,
      htmlContent: html,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erreur API contact:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


