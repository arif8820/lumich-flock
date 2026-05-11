// app/changelog/page.tsx
import { changelog, CURRENT_VERSION } from '@/lib/changelog/data'
import type { ChangeType } from '@/lib/changelog/types'
import { ChangelogSeenMarker } from './ChangelogSeenMarker'
import { Bird } from 'lucide-react'

const CHANGE_TYPE_STYLES: Record<ChangeType, { bg: string; color: string; label: string }> = {
  feature:     { bg: '#dcfce7', color: '#16a34a', label: 'FITUR' },
  fix:         { bg: '#dbeafe', color: '#2563eb', label: 'FIX' },
  improvement: { bg: '#fef3c7', color: '#d97706', label: 'PENINGKATAN' },
  breaking:    { bg: '#ede9fe', color: '#7c3aed', label: 'BREAKING' },
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f7f5f1' }}>
      <ChangelogSeenMarker />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7aadd4, #5090be)' }}
          >
            <Bird size={18} color="white" strokeWidth={1.8} />
          </div>
          <span className="text-xl font-bold" style={{ color: '#2d3a2e' }}>LumichFlock</span>
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: '#0ea5e9', color: 'white' }}
          >
            {CURRENT_VERSION}
          </span>
        </div>
        <p className="text-sm mb-10 ml-12" style={{ color: '#8fa08f' }}>Catatan pembaruan aplikasi</p>

        {/* Entries */}
        <div className="flex flex-col gap-8">
          {changelog.length === 0 ? (
            <p style={{ color: '#8fa08f' }}>Belum ada catatan pembaruan.</p>
          ) : changelog.map((entry, index) => {
            const isLatest = index === 0
            return (
              <div
                key={entry.version}
                className="pl-5"
                style={{ borderLeft: `3px solid ${isLatest ? '#0ea5e9' : '#e2e8f0'}` }}
              >
                {/* Version header */}
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-bold text-base" style={{ color: '#1e293b' }}>
                    {entry.version}
                  </span>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>
                    {(() => {
                      const parts = entry.date.split('-').map(Number)
                      const year = parts[0] ?? 0
                      const month = parts[1] ?? 1
                      const day = parts[2] ?? 1
                      return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    })()}
                  </span>
                  {isLatest && (
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded"
                      style={{ background: '#dcfce7', color: '#16a34a' }}
                    >
                      TERBARU
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className="font-semibold text-[15px] mb-3" style={{ color: '#334155' }}>
                  {entry.title}
                </p>

                {/* Changes */}
                <div className="flex flex-col gap-1.5">
                  {entry.changes.map((change, i) => {
                    const style = CHANGE_TYPE_STYLES[change.type]
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                          style={{ background: style.bg, color: style.color }}
                        >
                          {style.label}
                        </span>
                        <span className="text-[13px]" style={{ color: '#475569' }}>
                          {change.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
