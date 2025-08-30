import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { EmailService } from '@/lib/email'

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const id = context?.params?.id as string

    const profile = await prisma.profile.findFirst({ 
      where: { userId: session.user.id },
      include: { user: true }
    })
    
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Aucune clinique associée' }, { status: 404 })
    }

    // Vérifier les permissions
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim().toLowerCase()) : ['assistant']
    const hasInvoicePermission = userRoles.some(role => 
      hasPermission(role as any, 'invoices', 'read')
    )
    
    if (!hasInvoicePermission) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        clinic_id: profile.clinicId,
      },
      include: {
        appointment: {
          include: {
            animal: {
              include: { owner: true }
            }
          }
        },
        owner: true,
        items: true,
        clinic: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Préparer la pièce jointe PDF en utilisant la session courante (cookie)
    let attachments: { name: string; content: string }[] | undefined
    try {
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL
      const cookies = request.headers.get('cookie') || ''
      if (baseUrl) {
        const pdfRes = await fetch(`${baseUrl}/api/invoices/${id}/pdf`, {
          headers: { cookie: cookies }
        })
        if (pdfRes.ok) {
          const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer())
          attachments = [{
            name: `facture-${invoice.invoice_number}.pdf`,
            content: pdfBuffer.toString('base64')
          }]
        } else {
          console.warn('PDF fetch failed for email attachment:', pdfRes.status)
        }
      }
    } catch (e) {
      console.warn('Error creating PDF attachment for invoice email:', e)
    }

    // Envoyer l'email (une seule fois), avec pièce jointe si disponible
    try {
      const recipientEmail = (invoice.owner?.email || invoice.appointment?.animal?.owner?.email) as string
      const recipientName = invoice.owner
        ? `${invoice.owner.first_name} ${invoice.owner.last_name}`
        : invoice.appointment?.animal?.owner
          ? `${invoice.appointment.animal.owner.first_name} ${invoice.appointment.animal.owner.last_name}`
          : 'Client'

      await EmailService.sendInvoiceEmail({
        invoice: invoice as any,
        recipientEmail,
        recipientName,
        clinicName: invoice.clinic?.name || 'Clinique vétérinaire',
        attachments,
      })
      
      // Marquer comme envoyé (optionnel)
      await prisma.invoice.update({
        where: { id: id },
        data: {
          // Ajouter un champ pour tracker l'envoi si nécessaire
        }
      })

      return NextResponse.json({
        message: 'Facture envoyée par email avec succès',
        sentTo: invoice.owner?.email || invoice.appointment?.animal?.owner?.email
      })
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      return NextResponse.json({ 
        error: 'Erreur lors de l\'envoi de l\'email',
        details: emailError instanceof Error ? emailError.message : 'Erreur inconnue'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Erreur POST /api/invoices/[id]/send-email:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
