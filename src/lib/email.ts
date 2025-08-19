interface EmailData {
  to: string
  subject: string
  htmlContent: string
  sender?: {
    name: string
    email: string
  }
}

interface InvitationEmailData {
  email: string
  firstName: string
  lastName: string
  tempPassword: string
  clinicName: string
  inviterName: string
  loginUrl: string
}

export class EmailService {
  private static readonly BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
  private static readonly API_KEY = process.env.BREVO_API_KEY

  private static async sendEmail(data: EmailData): Promise<void> {
    if (!this.API_KEY) {
      throw new Error('BREVO_API_KEY non configurée')
    }

    const payload = {
      sender: data.sender || {
        name: 'VetFlow',
        email: 'noreply@vetflow.cloud'
      },
      to: [{ email: data.to }],
      subject: data.subject,
      htmlContent: data.htmlContent
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

  static async sendCollaboratorInvitation(data: InvitationEmailData): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation VetFlow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .password-box { background: #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: monospace; font-size: 16px; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 VetFlow</h1>
            <p>Invitation à rejoindre votre équipe vétérinaire</p>
          </div>
          
          <div class="content">
            <h2>Bonjour ${data.firstName} ${data.lastName},</h2>
            
            <p>Vous avez été invité(e) par <strong>${data.inviterName}</strong> à rejoindre l'équipe de la clinique <strong>${data.clinicName}</strong> sur VetFlow.</p>
            
            <p>VetFlow est une plateforme moderne de gestion vétérinaire qui vous permettra de :</p>
            <ul>
              <li>📅 Gérer les rendez-vous et le planning</li>
              <li>🐕 Suivre les dossiers patients</li>
              <li>👥 Collaborer avec votre équipe</li>
              <li>📊 Analyser les données de votre clinique</li>
            </ul>
            
            <h3>🔐 Vos identifiants temporaires :</h3>
            <div class="password-box">
              <strong>Email :</strong> ${data.email}<br>
              <strong>Mot de passe temporaire :</strong> ${data.tempPassword}
            </div>
            
            <p><strong>⚠️ Important :</strong> Vous devrez changer votre mot de passe lors de votre première connexion.</p>
            
            <div style="text-align: center;">
              <a href="${data.loginUrl}" class="button">🚀 Se connecter à VetFlow</a>
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #6b7280;">${data.loginUrl}</p>
            
            <p>Bienvenue dans l'équipe VetFlow ! 🎉</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par VetFlow</p>
            <p>© 2024 VetFlow - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: data.email,
      subject: `Invitation VetFlow - Rejoignez ${data.clinicName}`,
      htmlContent
    })
  }

  static async sendPasswordReset(data: { email: string; resetToken: string; resetUrl: string }): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe - VetFlow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 VetFlow</h1>
            <p>Réinitialisation de votre mot de passe</p>
          </div>
          
          <div class="content">
            <h2>Bonjour,</h2>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe VetFlow.</p>
            
            <div style="text-align: center;">
              <a href="${data.resetUrl}" class="button">🔐 Réinitialiser mon mot de passe</a>
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #6b7280;">${data.resetUrl}</p>
            
            <p><strong>⚠️ Ce lien expirera dans 1 heure pour des raisons de sécurité.</strong></p>
            
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par VetFlow</p>
            <p>© 2024 VetFlow - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: data.email,
      subject: 'Réinitialisation de mot de passe - VetFlow',
      htmlContent
    })
  }
}
