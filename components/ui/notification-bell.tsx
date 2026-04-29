'use client' // client: needs useState + onClick for dropdown + real-time updates

import { useState, useTransition, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Check, CheckCheck } from 'lucide-react'
import {
  getNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from '@/lib/actions/notification.actions'
import type { Notification } from '@/lib/services/notification.service'

const TYPE_LABEL: Record<Notification['type'], string> = {
  production_alert: 'Produksi',
  overdue_invoice: 'Invoice',
  stock_warning: 'Stok',
  phase_change: 'Fase Flock',
  other: 'Info',
}

const TYPE_COLOR: Record<Notification['type'], string> = {
  production_alert: '#e07b54',
  overdue_invoice: '#c0392b',
  stock_warning: '#d4a017',
  phase_change: '#5090be',
  other: '#8fa08f',
}

type Props = {
  initialUnread: number
  initialNotifications: Notification[]
  readIds: string[]
}

export function NotificationBell({ initialUnread, initialNotifications, readIds: initialReadIds }: Props) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [readIds, setReadIds] = useState<Set<string>>(new Set(initialReadIds))
  const [unread, setUnread] = useState(initialUnread)
  const [isPending, startTransition] = useTransition()
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const bellRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  function handleToggle() {
    if (!open && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 8, left: rect.right - 340 })
      startTransition(async () => {
        const res = await getNotificationsAction()
        if (res.success) setNotifications(res.data)
      })
    }
    setOpen((v) => !v)
  }

  function handleRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id)
      setReadIds((prev) => new Set([...prev, id]))
      setUnread((v) => Math.max(0, v - 1))
    })
  }

  function handleReadAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction()
      const allIds = new Set(notifications.map((n) => n.id))
      setReadIds(allIds)
      setUnread(0)
    })
  }

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={handleToggle}
        className="relative flex items-center justify-center w-9 h-9 rounded-[10px] transition-colors"
        style={{ background: open ? '#e3f0f9' : 'transparent' }}
        aria-label="Notifikasi"
      >
        <Bell size={18} strokeWidth={1.8} style={{ color: '#5a6b5b' }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full min-w-[16px] h-[16px] px-[3px]"
            style={{ background: '#c0392b', lineHeight: 1 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && mounted && dropdownPos && createPortal(
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div
            className="fixed z-50 w-[340px] rounded-2xl shadow-lf-md border overflow-hidden"
            style={{ background: '#fff', borderColor: '#e0e8df', top: dropdownPos.top, left: Math.max(8, dropdownPos.left) }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: '#e0e8df' }}
            >
              <div>
                <p className="text-[13px] font-semibold" style={{ color: '#2d3a2e' }}>Notifikasi</p>
                {unreadCount > 0 && (
                  <p className="text-[11px]" style={{ color: '#8fa08f' }}>{unreadCount} belum dibaca</p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleReadAll}
                  disabled={isPending}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-[7px] transition-colors"
                  style={{ color: '#3d7cb0', background: '#e3f0f9' }}
                >
                  <CheckCheck size={12} strokeWidth={2} />
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={28} style={{ color: '#d0d8d0', margin: '0 auto 8px' }} />
                  <p className="text-[12px]" style={{ color: '#8fa08f' }}>Tidak ada notifikasi</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = readIds.has(n.id)
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 border-b cursor-pointer transition-colors"
                      style={{
                        borderColor: '#e0e8df',
                        background: isRead ? 'transparent' : '#f0f7ff',
                      }}
                      onClick={() => !isRead && handleRead(n.id)}
                    >
                      {/* Type dot */}
                      <span
                        className="mt-1 flex-shrink-0 w-2 h-2 rounded-full"
                        style={{ background: TYPE_COLOR[n.type] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-medium uppercase" style={{ color: TYPE_COLOR[n.type], letterSpacing: '0.5px' }}>
                            {TYPE_LABEL[n.type]}
                          </span>
                          <span className="text-[10px]" style={{ color: '#b0bab0' }}>
                            {new Date(n.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[12px] font-semibold leading-tight" style={{ color: '#2d3a2e' }}>{n.title}</p>
                        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#5a6b5b' }}>{n.body}</p>
                      </div>
                      {!isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRead(n.id) }}
                          className="flex-shrink-0 mt-1"
                          title="Tandai dibaca"
                        >
                          <Check size={14} style={{ color: '#7aadd4' }} />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
