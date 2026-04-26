import { Resend } from 'resend'
import type { InvoiceDetails } from '@/lib/db/queries/invoice.queries'
import type { SalesOrderItem } from '@/lib/db/schema'

// Lazy-init so build does not fail when RESEND_API_KEY is not set
function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendInvoiceEmail(
  to: string,
  invoice: InvoiceDetails & { items: SalesOrderItem[] },
  pdfBuffer: Buffer
): Promise<void> {
  const resend = getResend()

  const totalFormatted = Number(invoice.totalAmount).toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })

  const dueDateFormatted = new Date(invoice.dueDate).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const subject = `Invoice ${invoice.invoiceNumber} dari LumichFarm`

  const html = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="font-family: sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #4a7fa5; padding-bottom: 12px; margin-bottom: 24px;">
    <h1 style="color: #4a7fa5; margin: 0; font-size: 24px;">LumichFarm</h1>
    <p style="color: #555555; margin: 4px 0 0; font-size: 13px;">Sistem ERP Ayam Petelur</p>
  </div>

  <p>Yth. ${invoice.customer.name},</p>

  <p>
    Bersama email ini kami sampaikan invoice dengan detail sebagai berikut:
  </p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr>
      <td style="padding: 8px; color: #555555; width: 40%;">No. Invoice</td>
      <td style="padding: 8px; font-weight: bold;">${invoice.invoiceNumber}</td>
    </tr>
    <tr style="background-color: #f7fafc;">
      <td style="padding: 8px; color: #555555;">Total Tagihan</td>
      <td style="padding: 8px; font-weight: bold;">${totalFormatted}</td>
    </tr>
    <tr>
      <td style="padding: 8px; color: #555555;">Jatuh Tempo</td>
      <td style="padding: 8px; font-weight: bold;">${dueDateFormatted}</td>
    </tr>
  </table>

  <p>Silakan lihat lampiran PDF untuk detail lengkap invoice.</p>

  <p>Mohon lakukan pembayaran sebelum tanggal jatuh tempo. Hubungi kami jika ada pertanyaan.</p>

  <p>Terima kasih atas kepercayaan Anda.</p>

  <p style="margin-top: 24px;">Hormat kami,<br /><strong>LumichFarm</strong></p>

  <div style="border-top: 1px solid #e5e5e5; margin-top: 32px; padding-top: 12px; font-size: 11px; color: #999999;">
    Email ini dikirim secara otomatis. Harap tidak membalas email ini.
  </div>
</body>
</html>
  `.trim()

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error('Gagal mengirim email: ' + message)
  }
}
