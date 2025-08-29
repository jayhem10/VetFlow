import { prisma } from './prisma'

/**
 * Génère un numéro de facture séquentiel avec la date du jour
 * Format: YYYYMMDD-001, YYYYMMDD-002, etc.
 */
export async function generateInvoiceNumber(clinicId: string): Promise<string> {
  const today = new Date()
  const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
  
  // Trouver la dernière facture de la clinique pour aujourd'hui
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      clinic_id: clinicId,
      invoice_date: {
        gte: startOfDay,
        lte: endOfDay
      },
      invoice_number: {
        startsWith: datePrefix
      }
    },
    orderBy: {
      invoice_number: 'desc'
    }
  })
  
  let sequenceNumber = 1
  
  if (lastInvoice) {
    // Extraire le numéro de séquence de la dernière facture
    const lastSequence = parseInt(lastInvoice.invoice_number.split('-')[1])
    sequenceNumber = lastSequence + 1
  }
  
  // Formater le numéro de séquence avec des zéros de remplissage
  const formattedSequence = sequenceNumber.toString().padStart(3, '0')
  
  return `${datePrefix}-${formattedSequence}`
}

/**
 * Formate un numéro de facture pour l'affichage
 * Garde le même format partout : YYYYMMDD-001
 */
export function formatInvoiceNumberForDisplay(invoiceNumber: string): string {
  return invoiceNumber
}

/**
 * Formate un numéro de facture pour le nom de fichier
 * Transforme YYYYMMDD-001 en facture-YYYYMMDD-001
 */
export function formatInvoiceNumberForFilename(invoiceNumber: string): string {
  return `facture-${invoiceNumber}`
}
