import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAppSetting } from '@/lib/services/app-settings.service'
import { saveWaTemplateAction } from '@/lib/actions/app-settings.actions'

const DEFAULT_TEMPLATE = `Halo {customerName},

Berikut adalah invoice {invoiceNumber} dengan total tagihan Rp {totalAmount}.
Jatuh tempo: {dueDate}.

Silakan download invoice di: {pdfUrl}

Terima kasih.`

const EXAMPLE_VALUES: Record<string, string> = {
  customerName: 'Budi Santoso',
  invoiceNumber: 'INV-2024-0042',
  totalAmount: '2.500.000',
  dueDate: '30 April 2024',
  pdfUrl: 'https://example.com/invoice/INV-2024-0042.pdf',
}

function renderPreview(template: string): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => EXAMPLE_VALUES[key] ?? `{${key}}`)
}

export default async function WaTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const { success, error } = await searchParams

  const currentTemplate = await getAppSetting('wa_invoice_template') ?? DEFAULT_TEMPLATE

  async function handleSaveTemplate(formData: FormData) {
    'use server'
    const res = await saveWaTemplateAction(formData)
    if (!res.success) {
      redirect(`/admin/settings/wa-template?error=${encodeURIComponent(res.error)}`)
    }
    redirect('/admin/settings/wa-template?success=1')
  }

  const preview = renderPreview(currentTemplate)

  return (
    <div className="p-6 space-y-6" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div>
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Template WhatsApp Invoice
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8fa08f' }}>
          Konfigurasi pesan WhatsApp yang dikirim ke pelanggan saat invoice dibuat.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div role="alert" className="px-4 py-3 rounded-lg text-sm" style={{ background: '#fde8e8', color: '#c0392b' }}>
          {decodeURIComponent(error)}
        </div>
      )}
      {success && (
        <div role="alert" className="px-4 py-3 rounded-lg text-sm" style={{ background: '#e8f8f5', color: '#1a7a5e' }}>
          Template berhasil disimpan.
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: 'var(--lf-border)' }}>
        <form action={handleSaveTemplate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#2d3a2e' }}>
              Isi Template
            </label>
            <textarea
              name="template"
              rows={8}
              required
              defaultValue={currentTemplate}
              className="w-full border px-3 py-2 text-sm resize-y"
              style={{
                borderColor: 'var(--lf-border)',
                borderRadius: '10px',
                color: '#2d3a2e',
                lineHeight: '1.6',
              }}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: 'var(--lf-blue)',
              borderRadius: '10px',
            }}
          >
            Simpan Template
          </button>
        </form>
      </div>

      {/* Variable hints */}
      <div className="bg-white rounded-2xl border p-6 space-y-3" style={{ borderColor: 'var(--lf-border)' }}>
        <h2 className="text-[15px] font-semibold" style={{ color: '#2d3a2e' }}>
          Variabel yang Tersedia
        </h2>
        <p className="text-xs" style={{ color: '#8fa08f' }}>
          Gunakan variabel berikut di dalam template — akan diganti otomatis saat pesan dikirim.
        </p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2 pr-6 font-medium" style={{ color: '#5a6b5b', borderBottom: '1px solid var(--lf-border)' }}>Variabel</th>
              <th className="text-left py-2 font-medium" style={{ color: '#5a6b5b', borderBottom: '1px solid var(--lf-border)' }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['{customerName}', 'Nama pelanggan'],
              ['{invoiceNumber}', 'Nomor invoice'],
              ['{totalAmount}', 'Total tagihan (Rp)'],
              ['{dueDate}', 'Tanggal jatuh tempo'],
              ['{pdfUrl}', 'Link PDF invoice'],
            ].map(([variable, desc]) => (
              <tr key={variable} style={{ borderBottom: '1px solid var(--lf-border)' }}>
                <td className="py-2 pr-6">
                  <code
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--lf-blue-pale)', color: 'var(--lf-blue-dark)', fontFamily: 'monospace' }}
                  >
                    {variable}
                  </code>
                </td>
                <td className="py-2 text-xs" style={{ color: '#5a6b5b' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl border p-6 space-y-3" style={{ borderColor: 'var(--lf-border)' }}>
        <h2 className="text-[15px] font-semibold" style={{ color: '#2d3a2e' }}>
          Pratinjau Pesan
        </h2>
        <p className="text-xs" style={{ color: '#8fa08f' }}>
          Contoh tampilan pesan dengan data dummy.
        </p>
        <pre
          className="text-sm whitespace-pre-wrap rounded-xl p-4"
          style={{
            background: '#f0f7f0',
            color: '#2d3a2e',
            fontFamily: 'DM Sans, sans-serif',
            lineHeight: '1.6',
            borderRadius: '12px',
          }}
        >
          {preview}
        </pre>
      </div>
    </div>
  )
}
