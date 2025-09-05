import NextAuth, { type DefaultSession, type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      hasProfile?: boolean
      hasClinic?: boolean
      mustChangePassword?: boolean
      profile?: any
    } & DefaultSession['user']
  }
}

const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const normalizedEmail = credentials.email.trim().toLowerCase()

          // Recherche insensible à la casse pour éviter les problèmes d'email
          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: normalizedEmail,
                mode: 'insensitive',
              },
            },
            include: {
              profile: {
                include: {
                  clinic: true,
                },
              },
            },
          })

          if (!user || !user.password) {
            return null
          }

          // Bloquer l'accès si email non vérifié
          if (!user.emailVerified) {
            throw new Error('EMAIL_NOT_VERIFIED')
          }

          const isValidPassword = await compare(credentials.password, user.password)

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: !!user.emailVerified,
            profileCompleted: !!user.profileCompleted,
            hasProfile: !!user.profile,
            hasClinic: !!(user.profile?.clinic),
            mustChangePassword: user.mustChangePassword,
            profile: user.profile,
          }
        } catch (error) {
          console.error('Erreur auth:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.hasProfile = (user as any).hasProfile
        token.hasClinic = (user as any).hasClinic
        token.emailVerified = (user as any).emailVerified
        token.profileCompleted = (user as any).profileCompleted
        token.mustChangePassword = (user as any).mustChangePassword
        token.profile = (user as any).profile
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.hasProfile = token.hasProfile as boolean
        session.user.hasClinic = token.hasClinic as boolean
        // session.user.emailVerified = (token as any).emailVerified as boolean // Géré par NextAuth
        ;(session.user as any).profileCompleted = (token as any).profileCompleted as boolean
        session.user.mustChangePassword = token.mustChangePassword as boolean
        session.user.profile = token.profile as any
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export default handler
export { authOptions } 