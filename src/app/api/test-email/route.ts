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
    await EmailService.sendCollaboratorInvitation({
      email,
      firstName: 'Test',
      lastName: 'User',
      tempPassword: 'TestPassword123',
      clinicName: 'Clinique Test',
      inviterName: 'Admin Test',
      loginUrl: 'http://localhost:3000/login'
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
