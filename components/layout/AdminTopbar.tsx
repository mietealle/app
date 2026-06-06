'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ChevronDown, Bell } from 'lucide-react'
import { getSession, clearSession, type SessionUser } from '@/lib/session'
import NotificationBell from '@/components/ui/NotificationBell'

export default function AdminTopbar() {
  const router = useRouter()
  // Lazy initializer: reads cookie synchronously on first client render — no flash
  const [session, setSession] = useState<SessionUser | null>(() => {
    if (typeof window !== 'undefined') return getSession()
    return null
  })
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Refresh in case cookie changed (e.g. after login redirect)
    setSession(getSession())
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="bg-white border-b border-gray-100 h-14 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Mietealle Admin</h2>
        <p className="text-xs text-gray-400">Platform Management Console</p>
      </div>

      <div className="flex items-center gap-2">
        {session && <NotificationBell session={session} />}

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {session?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-900 leading-tight">
                {session?.name ?? 'Admin User'}
              </p>
              <p className="text-[10px] text-gray-500 leading-tight">Platform Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
              {/* Profile info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900 text-sm">{session?.name ?? 'Admin User'}</p>
                <p className="text-xs text-gray-500">{session?.email ?? ''}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Platform Admin
                </span>
              </div>

              {/* Nav links */}
              <div className="py-1">
                {[
                  { label: 'Dashboard',     href: '/admin/dashboard'     },
                  { label: 'Verifications', href: '/admin/verifications' },
                  { label: 'All Bookings',  href: '/admin/bookings'      },
                  { label: 'Vendors',       href: '/admin/vendors'       },
                  { label: 'Renters',       href: '/admin/renters'       },
                ].map(({ label, href }) => (
                  <Link key={href} href={href} onClick={() => setUserOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    {label}
                  </Link>
                ))}
              </div>

              {/* Sign out */}
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={() => { clearSession(); router.push('/admin/login') }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
