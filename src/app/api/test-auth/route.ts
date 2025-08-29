import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      authenticated: !!session?.user?.id,
      session: session ? {
        userId: session.user.id,
        email: session.user.email,
        hasProfile: session.user.hasProfile,
        hasClinic: session.user.hasClinic,
        mustChangePassword: session.user.mustChangePassword
      } : null,
      cookies: request.headers.get('cookie') || 'Aucun cookie'
    })
  } catch (error) {
    console.error('Erreur test auth:', error)
    return NextResponse.json({ 
      error: 'Erreur lors du test d\'authentification',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
