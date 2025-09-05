import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les profils avec leurs rôles
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    // Analyser les rôles pour voir qui peut être vétérinaire
    const analysis = profiles.map(profile => {
      const roles = profile.role ? profile.role.split(',').map(r => r.trim()) : []
      const isVet = roles.some(role => role === 'vet' || role === 'admin')
      const hasVetRole = roles.includes('vet')
      const hasAdminRole = roles.includes('admin')
      
      return {
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.user.email,
        rawRoles: profile.role,
        parsedRoles: roles,
        canBeVet: isVet,
        hasVetRole,
        hasAdminRole,
        issues: {
          duplicateRoles: roles.length !== Array.from(new Set(roles)).length,
          emptyRoles: roles.some(r => r === ''),
          unknownRoles: roles.filter(r => !['admin', 'vet', 'owner', 'assistant', 'stock_manager'].includes(r))
        }
      }
    })

    const vets = analysis.filter(p => p.canBeVet)
    const issues = analysis.filter(p => 
      p.issues.duplicateRoles || 
      p.issues.emptyRoles || 
      p.issues.unknownRoles.length > 0
    )

    return NextResponse.json({
      success: true,
      totalProfiles: profiles.length,
      veterinarians: vets,
      profilesWithIssues: issues,
      summary: {
        totalVets: vets.length,
        totalIssues: issues.length,
        duplicateRoleProfiles: issues.filter(p => p.issues.duplicateRoles).length
      }
    })

  } catch (error) {
    console.error('Erreur vérification vétérinaires:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
