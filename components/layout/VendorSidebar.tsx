'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag, Plus, LogOut,
  ChevronDown, CheckCircle, Clock
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getSession, clearSession, type SessionUser } from '@/lib/session'
import NotificationBell from '@/components/ui/NotificationBell'

const nav = [
  { href: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/vendor/products',  icon: Package,         label: 'My Products' },
  { href: '/vendor/bookings',  icon: ShoppingBag,     label: 'Bookings'    },
  { href: '/vendor/products/new', icon: Plus,         label: 'Add Product' },
]

export default function VendorSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  // Lazy init — no flash
  const [session] = useState<SessionUser | null>(() => {
    if (typeof window === 'undefined') return null
    const s = getSession()
    return s?.role === 'vendor' ? s : null
  })
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!session) return null

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Mietealle" width={36} height={36} className="rounded-xl" unoptimized />
          <div>
            <p className="text-gray-900 font-bold text-sm">Vendor Portal</p>
            <p className="text-gray-400 text-xs truncate max-w-[120px]">{session.company}</p>
          </div>
        </div>
      </div>

      {/* Verification badge */}
      <div className={`mx-4 mt-3 px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${
        session.verification_status === 'verified'
          ? 'bg-green-50 text-green-700'
          : 'bg-amber-50 text-amber-700'
      }`}>
        {session.verification_status === 'verified'
          ? <><CheckCircle className="w-3.5 h-3.5 shrink-0" />Account Verified</>
          : <><Clock className="w-3.5 h-3.5 shrink-0" />Verification Pending</>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 mt-2">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = href === '/vendor/dashboard'
            ? pathname === href
            : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: notification + user */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        {/* Notification bell row */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-gray-500 font-medium">Notifications</span>
          <NotificationBell session={session} />
        </div>

        {/* User info */}
        <div className="relative" ref={userRef}>
          <button onClick={() => setUserOpen(!userOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
              {session.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 truncate">{session.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.email}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </button>

          {userOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">{session.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">Vendor</span>
              </div>
              <button onClick={() => { clearSession(); router.push('/') }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" />Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
