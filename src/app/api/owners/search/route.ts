import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer le profil de l'utilisateur pour obtenir sa clinique
    const profile = await prisma.profile.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!profile || !profile.clinicId) {
      return NextResponse.json(
        { error: 'Aucune clinique associée à votre profil' },
        { status: 404 }
      )
    }

    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const city = searchParams.get('city')
    const hasAnimals = searchParams.get('hasAnimals')
    const marketingConsent = searchParams.get('marketingConsent')

    // Construire les conditions de recherche
    const whereConditions: any = {
      clinic_id: profile.clinicId,
    }

    if (query) {
      const isShort = query.trim().length < 3
      if (isShort) {
        // Requêtes très courtes: éviter le bruit → privilégier débuts de chaînes
        whereConditions.OR = [
          { first_name: { startsWith: query, mode: 'insensitive' } },
          { last_name: { startsWith: query, mode: 'insensitive' } },
          { email: { startsWith: query, mode: 'insensitive' } },
          { phone: { startsWith: query } },
          { mobile: { startsWith: query } },
        ]
      } else {
        whereConditions.OR = [
          { first_name: { contains: query, mode: 'insensitive' } },
          { last_name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { mobile: { contains: query } },
        ]
      }
    }

    if (city) {
      whereConditions.city = { contains: city, mode: 'insensitive' }
    }

    if (hasAnimals === 'true') {
      whereConditions.animals = { some: {} }
    } else if (hasAnimals === 'false') {
      whereConditions.animals = { none: {} }
    }

    if (marketingConsent === 'true') {
      whereConditions.marketing_consent = true
    } else if (marketingConsent === 'false') {
      whereConditions.marketing_consent = false
    }

    // Récupérer les propriétaires avec filtres
    const owners = await prisma.owner.findMany({
      where: whereConditions,
      include: {
        _count: {
          select: {
            animals: true
          }
        }
      },
      orderBy: [
        { last_name: 'asc' },
        { first_name: 'asc' }
      ],
    })

    const formattedOwners = owners.map(owner => ({
      id: owner.id,
      clinic_id: owner.clinic_id,
      first_name: owner.first_name,
      last_name: owner.last_name,
      email: owner.email,
      phone: owner.phone,
      mobile: owner.mobile,
      address: owner.address,
      city: owner.city,
      postal_code: owner.postal_code,
      country: owner.country,
      preferred_contact: owner.preferred_contact,
      marketing_consent: owner.marketing_consent,
      notes: owner.notes,
      created_at: owner.created_at?.toISOString(),
      updated_at: owner.updated_at?.toISOString(),
      animals: owner._count.animals,
    }))

    return NextResponse.json({
      owners: formattedOwners
    })

  } catch (error) {
    console.error('Erreur recherche propriétaires:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
