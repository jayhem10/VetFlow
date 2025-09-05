import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Trouver toutes les cliniques sans trialEndDate
    const clinicsWithoutTrial = await prisma.clinic.findMany({
      where: {
        trialEndDate: null,
        subscriptionStatus: 'trial', // Seulement celles en trial
      },
    })

    console.log('🔍 Cliniques sans trialEndDate trouvées:', clinicsWithoutTrial.length)

    // Mettre à jour chaque clinique avec une période d'essai de 14 jours
    const updates = []
    for (const clinic of clinicsWithoutTrial) {
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 14)

      const updated = await prisma.clinic.update({
        where: { id: clinic.id },
        data: { trialEndDate },
      })

      updates.push({
        clinicId: clinic.id,
        name: clinic.name,
        trialEndDate: trialEndDate.toISOString(),
      })

      console.log(`✅ Clinique ${clinic.name} (${clinic.id}) mise à jour avec trialEndDate: ${trialEndDate.toISOString()}`)
    }

    return NextResponse.json({
      success: true,
      message: `${updates.length} cliniques mises à jour`,
      updates,
    })
  } catch (error) {
    console.error('Erreur mise à jour trial dates:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
