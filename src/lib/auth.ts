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
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
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

          const isValidPassword = await compare(credentials.password, user.password)

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
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