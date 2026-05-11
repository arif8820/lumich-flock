'use client'
// client: needs useEffect to fire server action on mount

import { useEffect } from 'react'
import { markChangelogSeen } from '@/lib/actions/changelog.actions'

export function ChangelogSeenMarker() {
  useEffect(() => {
    markChangelogSeen()
  }, [])

  return null
}
