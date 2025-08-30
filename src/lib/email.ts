interface EmailAttachment {
  name: string
  content: string // base64
}

interface EmailData {
  to: string
  subject: string
  htmlContent: string
  sender?: {
    name: string
    email: string
  }
  attachments?: EmailAttachment[]
}

interface InvoiceEmailData {
  invoice: any
  recipientEmail: string
  recipientName: string
  clinicName: string
  attachments?: EmailAttachment[]
}

interface InvoiceData {
  id: string
  invoice_number: string
  invoice_date: string
  total_amount: number
  payment_status: string
  appointment?: {
    title: string
    animal?: {
      name: string
      owner?: {
        first_name: string
        last_name: string
        email: string
      }
    }
  }
  owner?: {
    first_name: string
    last_name: string
    email: string
  }
  clinic?: {
    name: string
    email?: string
  }
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}

export class EmailService {
  private static readonly BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
  private static readonly API_KEY = process.env.BREVO_API_KEY

  static async sendEmail(data: EmailData): Promise<void> {
    if (!this.API_KEY) {
      console.error('BREVO_API_KEY non configurée dans les variables d\'environnement')
      throw new Error('Configuration email manquante. Veuillez configurer BREVO_API_KEY dans .env.local')
    }

    const payload: any = {
      sender: data.sender || {
        name: 'VetFlow',
        email: 'noreply@vetflow.cloud'
      },
      to: [{ email: data.to }],
      subject: data.subject,
      htmlContent: data.htmlContent
    }

    if (data.attachments && data.attachments.length > 0) {
      payload.attachment = data.attachments.map(att => ({
        name: att.name,
        content: att.content,
      }))
    }

    const response = await fetch(this.BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur envoi email Brevo:', response.status, errorText)
      throw new Error(`Erreur envoi email: ${response.status}`)
    }
  }

  static async sendInvoiceEmail(data: InvoiceEmailData): Promise<void> {
    const LOGO_SVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="36" height="36" role="img" aria-label="VetFlow">
        <g fill="#10b981">
          <ellipse transform="rotate(15 60 75)" cx="60" cy="75" rx="22" ry="18" />
          <ellipse transform="rotate(15 40 50)" cx="40" cy="50" rx="9" ry="12" />
          <ellipse transform="rotate(15 80 50)" cx="80" cy="50" rx="9" ry="12" />
          <ellipse transform="rotate(15 50 30)" cx="50" cy="30" rx="7" ry="10" />
          <ellipse transform="rotate(15 70 30)" cx="70" cy="30" rx="7" ry="10" />
        </g>
      </svg>`

    const emailContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture ${data.invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 24px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .brand { display:inline-flex; align-items:center; gap:10px; justify-content:center; }
          .brand-name { font-weight: 800; letter-spacing: .5px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .invoice-details { background: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
          .items-table th { background-color: #f3f4f6; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">
              ${LOGO_SVG}
              <div>
                <div class="brand-name">VetFlow</div>
                <div style="font-size:12px;opacity:.9;">${data.clinicName}</div>
              </div>
            </div>
            <p style="margin-top:8px">Facture ${data.invoice.invoice_number}</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.recipientName},</h2>
            
            <p>Veuillez trouver ci-joint la facture pour la consultation de ${data.invoice.appointment?.animal?.name || 'votre animal'}.</p>
            
            <div class="invoice-details">
              <h3>Détails de la facture :</h3>
              <p><strong>Numéro :</strong> ${data.invoice.invoice_number}</p>
              <p><strong>Date :</strong> ${new Date(data.invoice.invoice_date).toLocaleDateString('fr-FR')}</p>
              <p><strong>Montant total :</strong> ${data.invoice.total_amount.toFixed(2)}€</p>
              <p><strong>Statut :</strong> ${data.invoice.payment_status}</p>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.invoice.items.map((item: any) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit_price.toFixed(2)}€</td>
                    <td>${item.total_price.toFixed(2)}€</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total">
              <p>Total : ${data.invoice.total_amount.toFixed(2)}€</p>
            </div>
            
            <p>Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>
            L'équipe ${data.clinicName}</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par VetFlow</p>
            <p>© 2025 VetFlow - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: data.recipientEmail,
      subject: `Facture ${data.invoice.invoice_number} - ${data.clinicName}`,
      htmlContent: emailContent,
      attachments: data.attachments
    })
  }
}

export async function sendInvoiceEmail(invoice: InvoiceData) {
  const recipientEmail = invoice.owner?.email || invoice.appointment?.animal?.owner?.email
  
  if (!recipientEmail) {
    throw new Error('Aucune adresse email trouvée pour le destinataire')
  }

  const recipientName = invoice.owner 
    ? `${invoice.owner.first_name} ${invoice.owner.last_name}`
    : invoice.appointment?.animal?.owner 
      ? `${invoice.appointment.animal.owner.first_name} ${invoice.appointment.animal.owner.last_name}`
      : 'Client'

  await EmailService.sendInvoiceEmail({
    invoice,
    recipientEmail,
    recipientName,
    clinicName: invoice.clinic?.name || 'Clinique vétérinaire'
  })
}

export async function sendTestEmail() {
  try {
    await EmailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test email VetFlow',
      htmlContent: '<p>Ceci est un test d\'envoi d\'email depuis VetFlow.</p>',
    })
  } catch (error) {
    console.error('Erreur envoi email de test:', error)
    throw error
  }
}
