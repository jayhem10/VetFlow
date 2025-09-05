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

  /** Logo VetFlow (SVG inline, compatible email) */
  private static readonly LOGO_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="36" height="36" role="img" aria-label="VetFlow">
      <g fill="#10b981">
        <ellipse transform="rotate(15 60 75)" cx="60" cy="75" rx="22" ry="18" />
        <ellipse transform="rotate(15 40 50)" cx="40" cy="50" rx="9" ry="12" />
        <ellipse transform="rotate(15 80 50)" cx="80" cy="50" rx="9" ry="12" />
        <ellipse transform="rotate(15 50 30)" cx="50" cy="30" rx="7" ry="10" />
        <ellipse transform="rotate(15 70 30)" cx="70" cy="30" rx="7" ry="10" />
      </g>
    </svg>`

  /**
   * Rend un template email standardisé (header + footer) et insère le contenu central.
   */
  static renderEmailTemplate({
    title,
    preheader,
    contentHtml,
    clinicName,
  }: {
    title?: string
    preheader?: string
    contentHtml: string
    clinicName?: string
  }): string {
    const brandName = 'VetFlow'
    const clinicLabel = clinicName || 'Gestion Vétérinaire'

    const safePreheader = preheader ? preheader.replace(/\n/g, ' ') : ''

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title || brandName}</title>
        <style>
          /* Basic reset */
          body { margin:0; padding:0; background:#f3f4f6; color:#111827; font-family: Arial, sans-serif; }
          a { color:#10b981; text-decoration:none; }
          .container { max-width: 600px; margin: 0 auto; padding: 16px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 20px 24px; border-radius: 12px 12px 0 0; }
          .brand { display:flex; align-items:center; gap:10px; }
          .brand-name { font-weight: 800; letter-spacing: .3px; font-size: 18px; }
          .brand-sub { font-size:12px; opacity:.9; }
          .content { background:#ffffff; padding: 24px; border-radius: 0 0 12px 12px; }
          .title { margin:0 0 12px 0; font-size: 18px; font-weight: 700; }
          .footer { text-align:center; margin-top: 12px; font-size: 12px; color: #6b7280; }
          .card { background:#f9fafb; border:1px solid #e5e7eb; border-radius: 10px; padding:16px; }
          .spacer { height: 8px; }
          .preheader { display:none !important; visibility:hidden; mso-hide:all; font-size:1px; color:#f3f4f6; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; }
        </style>
      </head>
      <body>
        <div class="preheader">${safePreheader}</div>
        <div class="container">
          <div class="header">
            <div class="brand">
              ${this.LOGO_SVG}
              <div>
                <div class="brand-name">${brandName}</div>
                <div class="brand-sub">${clinicLabel}</div>
              </div>
            </div>
            ${title ? `<p style="margin:8px 0 0 0; font-weight:600;">${title}</p>` : ''}
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par ${brandName}.</p>
            <p>© ${new Date().getFullYear()} ${brandName} — Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Envoie un email en enveloppant automatiquement le contenu dans le template standard.
   */
  static async sendTemplatedEmail({
    to,
    subject,
    title,
    preheader,
    htmlContent,
    clinicName,
    sender,
    attachments,
  }: EmailData & { title?: string; preheader?: string; clinicName?: string }): Promise<void> {
    const html = this.renderEmailTemplate({ title, preheader, contentHtml: htmlContent, clinicName })
    await this.sendEmail({ to, subject, htmlContent: html, sender, attachments })
  }

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
    const inner = `
      <div>
        <h2 style="margin:0 0 16px 0;">Bonjour ${data.recipientName},</h2>
        <p>Veuillez trouver ci-dessous la facture pour la consultation de ${data.invoice.appointment?.animal?.name || 'votre animal'}.</p>
        <div class="spacer"></div>
        <div class="card">
          <h3 style="margin:0 0 10px 0;">Détails de la facture</h3>
          <p><strong>Numéro :</strong> ${data.invoice.invoice_number}</p>
          <p><strong>Date :</strong> ${new Date(data.invoice.invoice_date).toLocaleDateString('fr-FR')}</p>
          <p><strong>Montant total :</strong> ${data.invoice.total_amount.toFixed(2)}€</p>
          <p><strong>Statut :</strong> ${data.invoice.payment_status}</p>
        </div>
        <div class="spacer"></div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 12px 0;">
          <thead>
            <tr>
              <th align="left" style="border-bottom:1px solid #e5e7eb; padding:8px 0;">Description</th>
              <th align="left" style="border-bottom:1px solid #e5e7eb; padding:8px 0;">Quantité</th>
              <th align="left" style="border-bottom:1px solid #e5e7eb; padding:8px 0;">Prix unitaire</th>
              <th align="left" style="border-bottom:1px solid #e5e7eb; padding:8px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.invoice.items.map((item: any) => `
              <tr>
                <td style="padding:6px 0; border-bottom:1px solid #f3f4f6;">${item.description}</td>
                <td style="padding:6px 0; border-bottom:1px solid #f3f4f6;">${item.quantity}</td>
                <td style="padding:6px 0; border-bottom:1px solid #f3f4f6;">${item.unit_price.toFixed(2)}€</td>
                <td style="padding:6px 0; border-bottom:1px solid #f3f4f6;">${item.total_price.toFixed(2)}€</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="text-align:right; font-size:16px; font-weight:700; margin-top:6px;">
          Total : ${data.invoice.total_amount.toFixed(2)}€
        </div>
        <div class="spacer"></div>
        <p>Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>
        <p style="margin:0;">Cordialement,<br>L'équipe ${data.clinicName}</p>
      </div>
    `

    const html = this.renderEmailTemplate({
      title: `Facture ${data.invoice.invoice_number}`,
      preheader: `Votre facture ${data.invoice.invoice_number}`,
      contentHtml: inner,
      clinicName: data.clinicName,
    })

    await this.sendEmail({
      to: data.recipientEmail,
      subject: `Facture ${data.invoice.invoice_number} - ${data.clinicName}`,
      htmlContent: html,
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
