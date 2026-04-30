'use client' // client: file upload, multi-step state, CSV preview

import { useState, useTransition } from 'react'
import { Upload, Download, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { parseCsvAction, commitImportAction, getCsvTemplateAction } from '@/lib/actions/import.actions'
import type { ImportEntity } from '@/lib/services/import.service'

const ENTITIES: { value: ImportEntity; label: string; hint: string }[] = [
  { value: 'flocks', label: 'Flock (Master)', hint: 'Batch ayam baru — coop_id, nama, tgl_masuk, populasi' },
  { value: 'daily_records', label: 'Produksi Harian', hint: 'Data historis produksi per kandang' },
  { value: 'customers', label: 'Pelanggan', hint: 'Daftar pelanggan dengan limit kredit' },
  { value: 'opening_stock', label: 'Stok Awal', hint: 'Saldo stok awal cutover — satu kali import per tanggal' },
]

type Step = 'select' | 'preview' | 'done'

export function ImportPanel() {
  const [entity, setEntity] = useState<ImportEntity>('flocks')
  const [step, setStep] = useState<Step>('select')
  const [csvText, setCsvText] = useState('')
  const [preview, setPreview] = useState<{
    valid: { rowNum: number; data: Record<string, unknown> }[]
    errors: { rowNum: number; errors: string[] }[]
  } | null>(null)
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCsvText((ev.target?.result as string) ?? '')
    reader.readAsText(file, 'UTF-8')
  }

  function handleDownloadTemplate() {
    startTransition(async () => {
      const res = await getCsvTemplateAction(entity)
      if (!res.success) return
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template_${entity}.csv`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  function handleParse() {
    if (!csvText.trim()) {
      setErrorMsg('Pilih file CSV terlebih dahulu')
      return
    }
    setErrorMsg(null)
    startTransition(async () => {
      const res = await parseCsvAction(entity, csvText)
      if (!res.success) {
        setErrorMsg(res.error)
        return
      }
      setPreview(res.data)
      setStep('preview')
    })
  }

  function handleConfirmImport() {
    if (!preview) return
    startTransition(async () => {
      const res = await commitImportAction(entity, preview.valid)
      if (!res.success) {
        setErrorMsg(res.error)
        return
      }
      setImportResult(res.data)
      setStep('done')
    })
  }

  function handleReset() {
    setStep('select')
    setCsvText('')
    setPreview(null)
    setImportResult(null)
    setErrorMsg(null)
  }

  return (
    <div className="space-y-4">
      {/* Entity selector */}
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--lf-border)' }}>
        <p className="text-sm font-semibold mb-3" style={{ color: '#2d3a2e' }}>Pilih Jenis Data</p>
        <div className="grid grid-cols-2 gap-3">
          {ENTITIES.map((e) => (
            <button
              key={e.value}
              onClick={() => { setEntity(e.value); handleReset() }}
              disabled={step !== 'select' && isPending}
              className="text-left p-3 rounded-xl border transition-all"
              style={{
                borderColor: entity === e.value ? 'var(--lf-blue)' : 'var(--lf-border)',
                background: entity === e.value ? '#e3f0f9' : '#fff',
              }}
            >
              <p className="text-[13px] font-semibold" style={{ color: entity === e.value ? '#3d7cb0' : '#2d3a2e' }}>{e.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#8fa08f' }}>{e.hint}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step: select */}
      {step === 'select' && (
        <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: 'var(--lf-border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: '#2d3a2e' }}>Upload File CSV</p>
            <button
              onClick={handleDownloadTemplate}
              disabled={isPending}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-[8px] transition-colors"
              style={{ background: '#e3f0f9', color: '#3d7cb0' }}
            >
              <Download size={13} />
              Download Template
            </button>
          </div>

          <label
            className="flex flex-col items-center justify-center w-full h-[120px] rounded-xl border-2 border-dashed cursor-pointer transition-colors"
            style={{ borderColor: '#d0d8d0', background: '#fafcfa' }}
          >
            <Upload size={24} style={{ color: '#b0bab0', marginBottom: 8 }} />
            <p className="text-sm" style={{ color: '#5a6b5b' }}>Klik atau seret file CSV ke sini</p>
            <p className="text-[11px] mt-1" style={{ color: '#b0bab0' }}>Encoding: UTF-8 · Delimiter: koma</p>
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
          </label>

          {csvText && (
            <p className="text-[12px]" style={{ color: '#5a6b5b' }}>
              File dimuat — {csvText.split('\n').length - 1} baris data
            </p>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: '#fde8e8', color: '#c0392b' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleParse}
            disabled={isPending || !csvText}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--lf-blue)', borderRadius: '10px' }}
          >
            <ChevronRight size={16} />
            {isPending ? 'Memproses...' : 'Pratinjau Data'}
          </button>
        </div>
      )}

      {/* Step: preview */}
      {step === 'preview' && preview && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--lf-border)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: '#2d3a2e' }}>Ringkasan Pratinjau</p>
            <div className="flex gap-6">
              <div>
                <p className="text-[28px] font-bold" style={{ color: '#1a7a5e' }}>{preview.valid.length}</p>
                <p className="text-[12px]" style={{ color: '#8fa08f' }}>baris valid</p>
              </div>
              <div>
                <p className="text-[28px] font-bold" style={{ color: preview.errors.length > 0 ? '#c0392b' : '#b0bab0' }}>
                  {preview.errors.length}
                </p>
                <p className="text-[12px]" style={{ color: '#8fa08f' }}>baris error (dilewati)</p>
              </div>
            </div>
          </div>

          {/* Error rows */}
          {preview.errors.length > 0 && (
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--lf-border)' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: '#c0392b' }}>Baris dengan Error</p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {preview.errors.slice(0, 20).map((e) => (
                  <div key={e.rowNum} className="text-[12px] px-3 py-2 rounded-lg" style={{ background: '#fde8e8' }}>
                    <p className="font-semibold" style={{ color: '#c0392b' }}>Baris {e.rowNum}</p>
                    {e.errors.map((err, i) => (
                      <p key={i} style={{ color: '#8b0000' }}>• {err}</p>
                    ))}
                  </div>
                ))}
                {preview.errors.length > 20 && (
                  <p className="text-[11px]" style={{ color: '#8fa08f' }}>
                    ...dan {preview.errors.length - 20} baris error lainnya
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Sample valid rows */}
          {preview.valid.length > 0 && (
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--lf-border)' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: '#2d3a2e' }}>5 Contoh Baris Valid</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr>
                      {Object.keys(preview.valid[0]!.data).map((k) => (
                        <th key={k} className="text-left py-1 pr-4 font-medium" style={{ color: '#8fa08f', borderBottom: '1px solid var(--lf-border)' }}>
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.valid.slice(0, 5).map((row) => (
                      <tr key={row.rowNum} style={{ borderBottom: '1px solid #f0f4f0' }}>
                        {Object.values(row.data).map((v, i) => (
                          <td key={i} className="py-1 pr-4 max-w-[120px] truncate" style={{ color: '#2d3a2e' }}>
                            {String(v ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: '#fde8e8', color: '#c0392b' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={isPending}
              className="px-5 py-2 text-sm font-semibold transition-colors"
              style={{ background: '#f0f4f0', color: '#5a6b5b', borderRadius: '10px' }}
            >
              Batal
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={isPending || preview.valid.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--lf-blue)', borderRadius: '10px' }}
            >
              {isPending ? 'Mengimpor...' : `Konfirmasi Import (${preview.valid.length} baris valid)`}
            </button>
          </div>
        </div>
      )}

      {/* Step: done */}
      {step === 'done' && importResult && (
        <div className="bg-white rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--lf-border)' }}>
          <CheckCircle2 size={40} style={{ color: '#1a7a5e', margin: '0 auto 12px' }} />
          <p className="text-[16px] font-semibold" style={{ color: '#2d3a2e' }}>Import Berhasil</p>
          <p className="text-sm mt-1" style={{ color: '#8fa08f' }}>
            {importResult.inserted} baris berhasil diimpor.
          </p>
          <button
            onClick={handleReset}
            className="mt-5 px-5 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--lf-blue)', borderRadius: '10px' }}
          >
            Import Lagi
          </button>
        </div>
      )}
    </div>
  )
}
