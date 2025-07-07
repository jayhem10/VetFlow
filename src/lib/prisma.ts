import { PrismaClient } from '@prisma/client'

// Prévenir l'initialisation multiple en dev avec hot reload Next.js
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 