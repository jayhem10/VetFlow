import NextAuth, { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }
        if (!email || !password) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) return null
        const isValid = await compare(password, user.password)
        if (!isValid) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          image: user.image ?? undefined,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
  },
}

export const { handlers: { GET, POST }, auth } = NextAuth(authOptions) 