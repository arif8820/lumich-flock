import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getAppSetting, upsertAppSetting } from '@/lib/db/queries/app-settings.queries'

const SETTINGS = [
  {
    key: 'alert_fcr_threshold',
    label: 'Batas FCR',
    description: 'Notifikasi dikirim jika FCR melebihi nilai ini. Default: 2.5',
    placeholder: '2.5',
    unit: 'kg pakan / lusin',
  },
  {
    key: 'alert_depletion_pct',
    label: 'Batas Depletion Harian (%)',
    description: 'Notifikasi dikirim jika depletion harian > X% dari populasi. Default: 0.5',
    placeholder: '0.5',
    unit: '%',
  },
  {
    key: 'alert_hdp_drop_pct',
    label: 'Batas Penurunan HDP (%)',
    description: 'Notifikasi dikirim jika HDP turun > X% dari hari sebelumnya. Default: 5',
    placeholder: '5',
    unit: '%',
  },
  {
    key: 'alert_overdue_delay_days',
    label: 'Toleransi Invoice Jatuh Tempo (hari)',
    description: 'Notifikasi invoice overdue dikirim setelah X hari dari due date. Default: 1',
    placeholder: '1',
    unit: 'hari',
  },
  {
    key: 'alert_stock_max_threshold',
    label: 'Batas Stok Maksimal (butir)',
    description: 'Alert jika total stok melebihi batas ini. Default: 10000',
    placeholder: '10000',
    unit: 'butir',
  },
]

export default async function AlertSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const { success, error } = await searchParams

  const values = await Promise.all(
    SETTINGS.map(async (s) => ({
      key: s.key,
      value: await getAppSetting(s.key) ?? s.placeholder,
    }))
  )
  const settingMap = Object.fromEntries(values.map((v) => [v.key, v.value]))

  async function handleSave(formData: FormData) {
    'use server'
    const sess = await getSession()
    if (!sess || sess.role !== 'admin') redirect('/dashboard')

    try {
      for (const s of SETTINGS) {
        const val = formData.get(s.key) as string
        if (val) await upsertAppSetting(s.key, val, sess.id)
      }
    } catch {
      redirect('/admin/settings/alerts?error=Gagal+menyimpan+pengaturan')
    }
    redirect('/admin/settings/alerts?success=1')
  }

  return (
    <div className="p-6 space-y-6" style={{ maxWidth: 640 }}>
      <div>
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Konfigurasi Alert
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8fa08f' }}>
          Atur ambang batas notifikasi otomatis harian (dijalankan pg_cron pukul 06:00 WIB).
        </p>
      </div>

      {error && (
        <div role="alert" className="px-4 py-3 rounded-lg text-sm" style={{ background: '#fde8e8', color: '#c0392b' }}>
          {decodeURIComponent(error)}
        </div>
      )}
      {success && (
        <div role="alert" className="px-4 py-3 rounded-lg text-sm" style={{ background: '#e8f8f5', color: '#1a7a5e' }}>
          Pengaturan alert berhasil disimpan.
        </div>
      )}

      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--lf-border)' }}>
        <form action={handleSave} className="space-y-6">
          {SETTINGS.map((s) => (
            <div key={s.key}>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2d3a2e' }}>
                {s.label}
              </label>
              <p className="text-xs mb-2" style={{ color: '#8fa08f' }}>{s.description}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name={s.key}
                  step="0.1"
                  min="0"
                  defaultValue={settingMap[s.key]}
                  placeholder={s.placeholder}
                  required
                  className="w-32 border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--lf-border)', borderRadius: '10px', color: '#2d3a2e' }}
                />
                <span className="text-xs" style={{ color: '#8fa08f' }}>{s.unit}</span>
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--lf-blue)', borderRadius: '10px' }}
          >
            Simpan Pengaturan
          </button>
        </form>
      </div>
    </div>
  )
}
