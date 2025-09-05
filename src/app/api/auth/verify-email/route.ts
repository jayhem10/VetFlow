import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      return NextResponse.redirect(new URL('/login?verify=invalid', request.url))
    }

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!record || record.identifier.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.redirect(new URL('/login?verify=invalid', request.url))
    }

    if (record.expires < new Date()) {
      // Token expiré
      await prisma.verificationToken.delete({ where: { token } }).catch(() => {})
      return NextResponse.redirect(new URL('/login?verify=expired', request.url))
    }

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { email: record.identifier.toLowerCase() },
      data: { emailVerified: new Date() },
    })

    // Nettoyer le token
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {})

    return NextResponse.redirect(new URL('/login?verify=success', request.url))
  } catch (error) {
    console.error('Erreur vérification email:', error)
    return NextResponse.redirect(new URL('/login?verify=error', request.url))
  }
}


