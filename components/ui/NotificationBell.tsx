'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell, Package, ShoppingBag, CheckCircle, Clock, Truck, AlertTriangle, User, X } from 'lucide-react'
import type { SessionUser } from '@/lib/session'

interface Notif {
  id: string
  icon: any
  iconBg: string
  iconColor: string
  title: string
  detail: string
  time: string
  unread: boolean
  href?: string
}

function timeAgo(ts: string): string {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell({ session }: { session: SessionUser }) {
  const [open, setOpen]       = useState(false)
  const [notifs, setNotifs]   = useState<Notif[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    buildNotifications(session).then(n => { setNotifs(n); setLoading(false) })
  }, [open, session])

  const unreadCount = notifs.filter(n => n.unread).length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Notifications</p>
              {unreadCount > 0 && <p className="text-xs text-brand-600">{unreadCount} unread</p>}
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-200">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifs.map(n => (
                  <div key={n.id} className={`flex gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${n.unread ? 'bg-brand-50/40' : ''}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.iconBg}`}>
                      <n.icon className={`w-4 h-4 ${n.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${n.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{n.time}</span>
                      </div>
                      {n.detail && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.detail}</p>}
                      {n.unread && <div className="w-2 h-2 bg-brand-500 rounded-full mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
              <button onClick={() => setNotifs(prev => prev.map(n => ({ ...n, unread: false })))}
                className="text-xs text-brand-600 hover:underline font-medium">
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

async function buildNotifications(session: SessionUser): Promise<Notif[]> {
  const notifs: Notif[] = []

  try {
    if (session.role === 'vendor') {
      const [bRes] = await Promise.all([
        fetch(`/api/bookings?vendor_id=${session.id}`).then(r => r.json()),
      ])
      const bookings: any[] = bRes.bookings ?? []

      bookings.filter(b => b.tracking_status === 'pending' || b.status === 'pending').slice(0, 5).forEach(b => {
        notifs.push({
          id: b.id + '_new', icon: ShoppingBag, iconBg: 'bg-orange-100', iconColor: 'text-orange-600',
          title: 'New booking request!',
          detail: `${b.renter?.company ?? 'A renter'} wants to rent ${b.product?.title ?? 'your equipment'} · €${Number(b.total_amount).toFixed(0)}`,
          time: timeAgo(b.created_at), unread: true, href: '/vendor/bookings'
        })
      })
      bookings.filter(b => b.tracking_status === 'return_initiated').forEach(b => {
        notifs.push({
          id: b.id + '_return', icon: Truck, iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
          title: 'Return initiated by renter',
          detail: `${b.product?.title ?? 'Equipment'} is being returned`,
          time: timeAgo(b.return_initiated_at ?? b.created_at), unread: true, href: '/vendor/bookings'
        })
      })
      bookings.filter(b => b.tracking_status === 'delivered').forEach(b => {
        notifs.push({
          id: b.id + '_delivered', icon: CheckCircle, iconBg: 'bg-green-100', iconColor: 'text-green-600',
          title: 'Equipment delivered to renter',
          detail: `${b.product?.title ?? 'Equipment'} · ${b.renter?.company}`,
          time: timeAgo(b.delivered_at ?? b.created_at), unread: false, href: '/vendor/bookings'
        })
      })
    }

    else if (session.role === 'renter') {
      const bRes = await fetch(`/api/bookings?renter_id=${session.id}`).then(r => r.json())
      const bookings: any[] = bRes.bookings ?? []

      bookings.filter(b => b.tracking_status === 'confirmed').forEach(b => {
        notifs.push({
          id: b.id + '_conf', icon: CheckCircle, iconBg: 'bg-green-100', iconColor: 'text-green-600',
          title: 'Booking confirmed!',
          detail: `${b.vendor?.company ?? 'Vendor'} confirmed your rental of ${b.product?.title}`,
          time: timeAgo(b.created_at), unread: true, href: '/renter/orders'
        })
      })
      bookings.filter(b => b.tracking_status === 'packaging').forEach(b => {
        notifs.push({
          id: b.id + '_pack', icon: Package, iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
          title: 'Vendor is preparing your order',
          detail: `${b.product?.title} is being packaged for dispatch`,
          time: timeAgo(b.created_at), unread: true, href: '/renter/orders'
        })
      })
      bookings.filter(b => b.tracking_status === 'in_transit').forEach(b => {
        notifs.push({
          id: b.id + '_transit', icon: Truck, iconBg: 'bg-brand-100', iconColor: 'text-brand-600',
          title: 'Your equipment is on the way!',
          detail: `${b.product?.title} has been dispatched · Expected soon`,
          time: timeAgo(b.dispatched_at ?? b.created_at), unread: true, href: '/renter/orders'
        })
      })
      bookings.filter(b => b.tracking_status === 'delivered').forEach(b => {
        notifs.push({
          id: b.id + '_deliv', icon: CheckCircle, iconBg: 'bg-green-100', iconColor: 'text-green-600',
          title: 'Equipment delivered!',
          detail: `${b.product?.title} has arrived. Please confirm receipt.`,
          time: timeAgo(b.delivered_at ?? b.created_at), unread: true, href: '/renter/orders'
        })
      })
    }

    else if (session.role === 'admin') {
      const [uRes, bRes] = await Promise.all([
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
      ])
      const users: any[]    = uRes.users    ?? []
      const bookings: any[] = bRes.bookings ?? []

      users.filter(u => u.verification_status === 'pending').slice(0, 3).forEach(u => {
        notifs.push({
          id: u.id + '_kyc', icon: User, iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
          title: `New ${u.role} awaiting KYC`,
          detail: `${u.name} · ${u.company}`,
          time: timeAgo(u.created_at), unread: true, href: '/admin/verifications'
        })
      })
      bookings.filter(b => b.tracking_status === 'pending').slice(0, 3).forEach(b => {
        notifs.push({
          id: b.id + '_pending', icon: Clock, iconBg: 'bg-orange-100', iconColor: 'text-orange-600',
          title: 'New booking pending',
          detail: `${b.product?.title ?? 'Equipment'} · ${b.renter?.company ?? ''}`,
          time: timeAgo(b.created_at), unread: true, href: '/admin/bookings'
        })
      })
      bookings.filter(b => b.tracking_status === 'return_initiated').forEach(b => {
        notifs.push({
          id: b.id + '_ret', icon: Truck, iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
          title: 'Return in progress',
          detail: `${b.product?.title} is being returned by ${b.renter?.company}`,
          time: timeAgo(b.return_initiated_at ?? b.created_at), unread: false, href: '/admin/bookings'
        })
      })
    }
  } catch (e) {
    console.error('notification fetch error', e)
  }

  return notifs.slice(0, 8)
}
