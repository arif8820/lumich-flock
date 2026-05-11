import Link from 'next/link'
import { CURRENT_VERSION } from '@/lib/changelog/data'

export function VersionBadge({ hasNewVersion }: { hasNewVersion: boolean }) {
  return (
    <Link
      href="/changelog"
      className="flex items-center gap-2 px-[10px] py-[8px] rounded-[9px] mx-[10px] mb-2 transition-colors"
      style={{
        background: hasNewVersion ? '#e3f0f9' : '#f7f5f1',
        textDecoration: 'none',
      }}
    >
      <span className="text-[11px]" style={{ color: '#8fa08f' }}>Versi</span>
      <span
        className="text-[11px] font-semibold flex-1"
        style={{ color: hasNewVersion ? '#3d7cb0' : '#5a6b5b' }}
      >
        {CURRENT_VERSION}
      </span>
      {hasNewVersion && (
        <span
          className="flex-shrink-0 rounded-full"
          style={{ width: 7, height: 7, background: '#ef4444' }}
        />
      )}
    </Link>
  )
}
