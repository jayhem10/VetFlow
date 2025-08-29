import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { R2StorageService } from '@/lib/r2-storage'
import { formatInvoiceNumberForDisplay } from '@/lib/invoice-utils'
import puppeteer from 'puppeteer'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le profil utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { clinic: true }
    })

    if (!profile || !profile.clinicId) {
      return NextResponse.json({ error: 'Profil ou clinique non trouvé' }, { status: 404 })
    }

    // Vérifier les permissions
    const userRoles = profile.role ? profile.role.split(',').map(r => r.trim().toLowerCase()) : ['assistant']
    const hasInvoicePermission = userRoles.some(role => hasPermission(role as any, 'invoices', 'read'))

    if (!hasInvoicePermission) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Récupérer la facture avec toutes les relations
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        clinic_id: profile.clinicId
      },
      include: {
        appointment: {
          include: {
            animal: {
              include: {
                owner: true
              }
            }
          }
        },
        owner: true,
        clinic: {
          select: {
            id: true,
            name: true,
            logo_url: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            postalCode: true,
            country: true
          }
        },
        items: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Debug: Vérifier les données de la clinique
    console.log('🔍 Debug PDF - Clinique:', {
      clinicId: invoice.clinic?.id,
      clinicName: invoice.clinic?.name,
      logoUrl: invoice.clinic?.logo_url,
      hasLogo: !!invoice.clinic?.logo_url
    })

    // Préparer le logo de la clinique en Data URL (évite les problèmes de chargement réseau dans Chromium)
    let logoDataUrl: string | null = null
    try {
      if (invoice.clinic?.logo_url) {
        // Supporter deux formats possibles en base:
        // 1) URL complète https://.../vetflow-logos/.../logos/{clinicId}/file
        // 2) Clé directe type "vetflow-logos/logos/{clinicId}/file" ou "logos/{clinicId}/file"
        let logoKey: string | null = null

        // Si c'est une URL http(s)
        if (/^https?:\/\//i.test(invoice.clinic.logo_url)) {
          // Essayer d'extraire via extractLogoKeyFromUrl (bucket logos)
          logoKey = R2StorageService.extractLogoKeyFromUrl(invoice.clinic.logo_url)
        } else {
          // C'est probablement une clé stockée en base
          // Retirer un éventuel préfixe de bucket pour garder la partie "logos/..."
          const raw = invoice.clinic.logo_url
          if (raw.startsWith('vetflow-logos/')) {
            logoKey = raw.replace('vetflow-logos/', '')
          } else if (raw.startsWith('logos/')) {
            logoKey = raw
          } else {
            // Dernier recours: prendre tel quel
            logoKey = raw
          }
        }

        // Si on a une clé, on signe depuis le bucket logos
        const fetchUrl = logoKey
          ? await R2StorageService.getSignedLogoDownloadUrl(logoKey, 300)
          : invoice.clinic.logo_url

        const res = await fetch(fetchUrl)
        if (res.ok) {
          const contentType = res.headers.get('content-type') || 'image/png'
          const buffer = Buffer.from(await res.arrayBuffer())
          logoDataUrl = `data:${contentType};base64,${buffer.toString('base64')}`
        }
      }
    } catch (e) {
      // En cas d'échec, on continue sans logo
      console.warn('Logo clinique indisponible pour le PDF:', e)
    }

    // Générer le HTML de la facture
    const htmlContent = generateInvoiceHTML(invoice, logoDataUrl || undefined)

    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size:10px; width:100%; text-align:center; color:#6b7280; padding:6px 0;">
          Page <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '18mm',
        left: '15mm'
      }
    })

    await browser.close()

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${formatInvoiceNumberForDisplay(invoice.invoice_number)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Erreur génération PDF:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du PDF' }, { status: 500 })
  }
}

function generateInvoiceHTML(invoice: any, clinicLogoDataUrl?: string) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Mapping espèces EN -> FR
  const speciesToFr: Record<string, string> = {
    dog: 'Chien',
    cat: 'Chat',
    bird: 'Oiseau',
    rabbit: 'Lapin',
    other: 'Autre'
  }

  const patientSpeciesFr = invoice?.appointment?.animal?.species
    ? (speciesToFr[String(invoice.appointment.animal.species).toLowerCase()] || invoice.appointment.animal.species)
    : ''

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${formatInvoiceNumberForDisplay(invoice.invoice_number)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            background: white;
            padding: 12px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #10b981;
            padding-top: 12px;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .logo {
            max-width: 160px;
            max-height: 70px;
            object-fit: contain;
        }
        .header-right {
            text-align: right;
        }
        .invoice-title {
            font-size: 18px; /* plus discret */
            font-weight: 700;
            letter-spacing: 1px;
            color: #111827;
        }
        .clinic-name {
            font-size: 14px;
            color: #10b981;
            margin-top: 4px;
            font-weight: 600;
        }
        
        .invoice-info {
            margin-bottom: 20px;
        }

        .parties {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 30px;
        }

        /* Panels verts discrets */
        .panel {
            padding: 10px;
            border-radius: 6px;
        }
        .panel-green {
            background: #f6fef9; /* vert encore plus discret */
            border-left: 4px solid #10b981; /* vert */
        }
        
        .info-section {
            flex: 1;
        }
        
        .info-section h3 {
            color: #065f46; /* vert discret */
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 600;
        }
        
        .info-item {
            margin-bottom: 4px;
            font-size: 12px;
        }
        
        .info-label {
            font-weight: bold;
            color: #666;
        }
        
        .client-details {
            background: #f6fef9;
            padding: 10px;
            border-radius: 5px;
            /* pas de bordure verte ici */
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #e5e7eb;
            font-size: 14px;
        }
        
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        
        .quantity, .price, .tax, .total, .total-ttc {
            text-align: center;
        }
        
        .totals-section {
            text-align: right;
            margin-bottom: 30px;
        }
        
        .total-row {
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .grand-total {
            font-size: 20px;
            font-weight: bold;
            color: #10b981;
            border-top: 2px solid #10b981;
            padding-top: 10px;
            margin-top: 10px;
        }
        
        .notes-section {
            background: #fef3c7;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        
        .notes-section h4 {
            color: #92400e;
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header avec logo -->
        <div class="header">
            <div class="header-left">
                ${clinicLogoDataUrl ? `
                <img src="${clinicLogoDataUrl}" alt="Logo" class="logo">
                ` : ''}
            </div>
            <div class="header-right">
                <div class="invoice-title">FACTURE</div>
                <div class="clinic-name">${invoice.clinic?.name || 'Clinique Vétérinaire'}</div>
            </div>
        </div>
        
        <!-- Informations de facturation (haut) -->
        <div class="invoice-info panel panel-green">
            <h3 style="color:#065f46; margin-bottom:8px; font-size:16px;">Informations de facturation</h3>
            <div class="info-item" style="display:flex; flex-wrap:wrap; gap:16px; align-items:center;">
              <span><span class="info-label">Numéro :</span> ${formatInvoiceNumberForDisplay(invoice.invoice_number)}</span>
              <span><span class="info-label">Date :</span> ${formatDate(invoice.invoice_date)}</span>
              ${invoice.due_date ? `
                <span><span class="info-label">Échéance :</span> ${formatDate(invoice.due_date)}</span>
              ` : ''}
              <span><span class="info-label">Statut :</span> ${invoice.payment_status === 'pending' ? 'En attente' : invoice.payment_status === 'paid' ? 'Payée' : invoice.payment_status === 'overdue' ? 'En retard' : 'Annulée'}</span>
              ${(() => {
                const methodMap: Record<string, string> = { cash: 'Espèces', card: 'Carte bancaire', check: 'Chèque', transfer: 'Virement', insurance: 'Assurance' }
                const label = invoice.payment_method ? (methodMap[invoice.payment_method] || invoice.payment_method) : null
                const paidDate = invoice.paid_at ? ` le ${formatDate(invoice.paid_at)}` : ''
                return label ? `<span><span class="info-label">Paiement :</span> ${label}${paidDate}</span>` : ''
              })()}
            </div>
        </div>

        <!-- Deux colonnes: Clinique (gauche) & Client (droite) -->
        <div class="parties">
            <div class="info-section panel panel-green">
                <h3 style="color:#065f46;">Clinique</h3>
                <div class="info-item">
                    <span class="info-label">Nom :</span> ${invoice.clinic?.name || 'Clinique Vétérinaire'}
                </div>
                ${invoice.clinic?.address ? `
                <div class="info-item">
                    <span class="info-label">Adresse :</span> ${invoice.clinic.address}${invoice.clinic.postalCode ? `, ${invoice.clinic.postalCode}` : ''}${invoice.clinic.city ? ` ${invoice.clinic.city}` : ''}
                </div>
                ` : ''}
                ${invoice.clinic?.phone ? `
                <div class="info-item">
                    <span class="info-label">Téléphone :</span> ${invoice.clinic.phone}
                </div>
                ` : ''}
                ${invoice.clinic?.email ? `
                <div class="info-item">
                    <span class="info-label">Email :</span> ${invoice.clinic.email}
                </div>
                ` : ''}
            </div>
            
            <div class="info-section panel panel-green">
                <h3 style="color:#065f46;">Client</h3>
                <div class="client-details" style="background:#ecfdf5; border-color:#10b981;">
                    <div class="info-item" style="margin-bottom:6px; font-size:13px;">
                        <strong>${invoice.owner?.first_name || invoice.appointment?.animal?.owner?.first_name} ${invoice.owner?.last_name || invoice.appointment?.animal?.owner?.last_name}</strong>
                    </div>
                    ${invoice.owner?.email || invoice.appointment?.animal?.owner?.email ? `
                    <div class="info-item"><span class="info-label">Email :</span> ${(invoice.owner?.email || invoice.appointment?.animal?.owner?.email)}</div>
                    ` : ''}
                    ${invoice.owner?.phone || invoice.appointment?.animal?.owner?.phone ? `
                    <div class="info-item"><span class="info-label">Téléphone :</span> ${(invoice.owner?.phone || invoice.appointment?.animal?.owner?.phone)}</div>
                    ` : ''}
                    ${(invoice.owner?.address || invoice.appointment?.animal?.owner?.address || invoice.owner?.postal_code || invoice.appointment?.animal?.owner?.postal_code) ? `
                    <div class="info-item">
                        <span class="info-label">Adresse :</span> ${(invoice.owner?.address || invoice.appointment?.animal?.owner?.address) || ''}
                        ${(invoice.owner?.postal_code || invoice.appointment?.animal?.owner?.postal_code) ? `, ${(invoice.owner?.postal_code || invoice.appointment?.animal?.owner?.postal_code)} ${(invoice.owner?.city || invoice.appointment?.animal?.owner?.city) || ''}` : ''}
                    </div>
                    ` : ''}
                    ${invoice.appointment?.animal ? `
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                        <div class="info-item" style="font-weight:600; margin-bottom:4px;">Animal</div>
                        <div class="info-item"><span class="info-label">Nom :</span> ${invoice.appointment.animal.name}</div>
                        <div class="info-item"><span class="info-label">Espèce :</span> ${patientSpeciesFr}${invoice.appointment.animal.breed ? `, ${invoice.appointment.animal.breed}` : ''}</div>
                        ${invoice.appointment.animal.microchip ? `<div class="info-item"><span class="info-label">N° puce :</span> ${invoice.appointment.animal.microchip}</div>` : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <!-- Articles -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="quantity">Qté</th>
                    <th class="price">Prix unit.</th>
                    <th class="tax">TVA</th>
                    <th class="total-ttc">Total TTC</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map((item: any) => `
                <tr>
                    <td>${item.description}</td>
                    <td class="quantity">${item.quantity}</td>
                    <td class="price">${formatCurrency(Number(item.unit_price))}</td>
                    <td class="tax">${typeof item.tax_rate !== 'undefined' ? `${Number(item.tax_rate)}%` : `${Number(invoice.tax_rate || 20)}%`}</td>
                    <td class="total-ttc">${formatCurrency(Number(item.total_price) * (1 + Number((item.tax_rate ?? invoice.tax_rate ?? 20)) / 100))}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        <!-- Notes -->
        ${invoice.notes ? `
        <div class="notes-section">
            <h4>Notes</h4>
            <div>${invoice.notes}</div>
        </div>
        ` : ''}
        
        <!-- Totaux -->
        <div class="totals-section">
            <div class="total-row">
                <span>Sous-total :</span>
                <span>${formatCurrency(Number(invoice.subtotal))}</span>
            </div>
            <div class="total-row">
                <span>TVA (20%) :</span>
                <span>${formatCurrency(Number(invoice.tax_amount))}</span>
            </div>
            <div class="total-row grand-total">
                <span>Total TTC :</span>
                <span>${formatCurrency(Number(invoice.total_amount))}</span>
            </div>
        </div>
        
        <!-- Mentions légales (compact) -->
        <div style="font-size: 12px; color: #6b7280; margin-top: 10px;">
            Prestations de services vétérinaires. Conditions de règlement: à réception. En cas de retard, pénalités selon l'article L441-10 du Code de commerce. 
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div>Merci de votre confiance</div>
            <div style="margin-top: 5px;">
                ${invoice.clinic?.name || 'Clinique Vétérinaire'}
                ${invoice.clinic?.phone ? ` - 📞 ${invoice.clinic.phone}` : ''}
                ${invoice.clinic?.email ? ` - ✉️ ${invoice.clinic.email}` : ''}
            </div>
            <div style="margin-top: 5px;">
                Facture générée le ${new Date().toLocaleDateString('fr-FR')}
            </div>
        </div>
    </div>
</body>
</html>
  `
}
