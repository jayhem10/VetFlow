import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/register', '/change-password', '/forgot-password', '/test-email', '/contact', '/api/contact']
const authRoutes = ['/api/auth']
const paymentRoutes = ['/payment', '/subscription', '/billing']
const allowedRoutesAfterExpiry = [...publicRoutes, ...authRoutes, ...paymentRoutes, '/api/payment', '/api/stripe']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Laisser passer les routes API auth
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Si route publique, laisser passer sans vérification
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Pour les routes protégées, vérifier la présence d'un token de session
  const sessionToken = req.cookies.get('next-auth.session-token') || 
                      req.cookies.get('__Secure-next-auth.session-token')
  
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Vérifier le statut de la période d'essai
  const trialExpired = req.cookies.get('trial-expired')?.value === 'true'
  
  if (trialExpired && !allowedRoutesAfterExpiry.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/payment', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 