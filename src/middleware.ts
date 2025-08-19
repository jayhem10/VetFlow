import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/register', '/change-password', '/test-email']
const authRoutes = ['/api/auth']

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

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 