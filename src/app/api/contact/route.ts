import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()
    if (!message || !email) {
      return NextResponse.json({ error: 'Email et message requis' }, { status: 400 })
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

    await EmailService.sendEmail({
      to: 'noreply@vetflow.cloud',
      subject: 'Contact VetFlow - Nouveau message',
      htmlContent: html,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erreur API contact:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


