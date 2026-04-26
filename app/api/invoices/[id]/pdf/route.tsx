export const runtime = 'nodejs' // REQUIRED — react-pdf fails on edge runtime

import { renderToBuffer } from '@react-pdf/renderer'
import { getSession } from '@/lib/auth/get-session'
import { createSupabaseServerClient } from '@/lib/auth/server'
import { getInvoiceForPdf } from '@/lib/services/invoice.service'
import { updateInvoicePdfInfo } from '@/lib/db/queries/invoice.queries'
import { InvoicePdfDocument } from '@/components/pdf/invoice-pdf-document'

const PDF_MAX_AGE_MS = 7 * 24 * 3600 * 1000

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  // 1. Auth check
  const session = await getSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Extract id
  const { id } = await params

  // 3. Fetch invoice (throws 'Invoice tidak ditemukan' if not found)
  let invoice: Awaited<ReturnType<typeof getInvoiceForPdf>>
  try {
    invoice = await getInvoiceForPdf(id)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invoice tidak ditemukan'
    if (message === 'Invoice tidak ditemukan') {
      return new Response(message, { status: 404 })
    }
    return new Response('Terjadi kesalahan server', { status: 500 })
  }

  // 4. Cache check — redirect to existing signed URL if still valid
  if (invoice.pdfUrl && invoice.pdfGeneratedAt && invoice.updatedAt) {
    const age = Date.now() - invoice.pdfGeneratedAt.getTime()
    if (age < PDF_MAX_AGE_MS && invoice.pdfGeneratedAt > invoice.updatedAt) {
      return Response.redirect(invoice.pdfUrl, 302)
    }
  }

  // 5–9. Generate, upload, sign, update, respond
  try {
    // 5. Render PDF to buffer
    const pdfBuffer = await renderToBuffer(<InvoicePdfDocument invoice={invoice} />)

    // 6. Upload to Supabase Storage
    const supabase = await createSupabaseServerClient()
    const storagePath = `invoices/${invoice.id}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) {
      throw new Error(`Upload gagal: ${uploadError.message}`)
    }

    // 7. Create signed URL (valid 7 days)
    const { data: signedData, error: signError } = await supabase.storage
      .from('invoices')
      .createSignedUrl(storagePath, 7 * 24 * 3600)

    if (signError || !signedData?.signedUrl) {
      throw new Error(`Gagal membuat signed URL: ${signError?.message ?? 'unknown'}`)
    }

    // 8. Persist PDF metadata on invoice record
    const now = new Date()
    await updateInvoicePdfInfo(id, signedData.signedUrl, now)

    // 9. Return PDF bytes — convert Buffer to Uint8Array for Web Response compatibility
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat PDF'
    console.error('[PDF route] error:', message)
    return new Response(`Gagal membuat PDF: ${message}`, { status: 500 })
  }
}
