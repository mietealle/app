'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Search, ShoppingBag, Clock, LogOut,
  ChevronDown, CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSession, clearSession, type SessionUser } from '@/lib/session'
import NotificationBell from '@/components/ui/NotificationBell'

const nav = [
  { href: '/renter/dashboard', icon: LayoutDashboard, label: 'Dashboard'       },
  { href: '/marketplace',      icon: Search,          label: 'Browse Equipment'},
  { href: '/renter/orders',    icon: ShoppingBag,     label: 'My Bookings'     },
  { href: '/renter/history',   icon: Clock,           label: 'Order History'   },
]

export default function RenterSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const [session] = useState<SessionUser | null>(() => {
    if (typeof window === 'undefined') return null
    const s = getSession()
    return s?.role === 'renter' ? s : null
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
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm">Renter Portal</p>
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
          const active = href === '/renter/dashboard'
            ? pathname === href
            : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: notification + user */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-gray-500 font-medium">Notifications</span>
          <NotificationBell session={session} />
        </div>

        <div className="relative" ref={userRef}>
          <button onClick={() => setUserOpen(!userOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
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
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Renter</span>
              </div>
              <button onClick={() => { clearSession(); router.push('/renter/login') }}
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
