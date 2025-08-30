import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Test d'envoi d'email
    await EmailService.sendEmail({
      to: email,
      subject: 'Test email VetFlow',
      htmlContent: '<p>Ceci est un test d\'envoi d\'email depuis VetFlow.</p>'
    })

    return NextResponse.json({
      message: 'Email de test envoyé avec succès',
      email
    })

  } catch (error) {
    console.error('Erreur test email:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'envoi de l\'email de test',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
