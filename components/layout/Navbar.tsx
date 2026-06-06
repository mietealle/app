'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getSession, clearSession, type SessionUser } from '@/lib/session'
import NotificationBell from '@/components/ui/NotificationBell'
import {
  Package, Menu, X, ChevronDown, LogOut,
  LayoutDashboard, Store, ShieldCheck,
} from 'lucide-react'

const DASH_LINK: Record<string, string> = {
  vendor: '/vendor/dashboard',
  renter: '/renter/dashboard',
  admin:  '/admin/dashboard',
}

const ROLE_COLOR: Record<string, string> = {
  vendor: 'bg-brand-100 text-brand-700',
  renter: 'bg-orange-100 text-orange-700',
  admin:  'bg-purple-100 text-purple-700',
}


function UserMenu({ session, onLogout }: { session: SessionUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
          {session.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-gray-900 leading-tight">{session.name?.split(' ')[0]}</p>
          <p className="text-[10px] text-gray-500 capitalize leading-tight">{session.company ?? session.role}</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold">
                {session.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{session.name}</p>
                <p className="text-xs text-gray-500 truncate">{session.email}</p>
                <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_COLOR[session.role] ?? 'bg-gray-100 text-gray-700'}`}>
                  {session.role}
                </span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link href={DASH_LINK[session.role] ?? '/'} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <LayoutDashboard className="w-4 h-4 text-gray-400" />My Dashboard
            </Link>
            <Link href="/marketplace" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Store className="w-4 h-4 text-gray-400" />Browse Equipment
            </Link>
            {session.role === 'admin' && (
              <Link href="/admin/verifications" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <ShieldCheck className="w-4 h-4 text-gray-400" />KYC Verifications
              </Link>
            )}
          </div>

          {/* Verification badge */}
          <div className="px-4 py-2 border-t border-gray-100">
            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
              session.verification_status === 'verified' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${session.verification_status === 'verified' ? 'bg-green-500' : 'bg-amber-400'}`} />
              {session.verification_status === 'verified' ? 'Account Verified' : 'Verification Pending'}
            </div>
          </div>

          {/* Logout */}
          <div className="py-1 border-t border-gray-100">
            <button onClick={() => { setOpen(false); onLogout() }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const [session, setSession]       = useState<SessionUser | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [loginOpen, setLoginOpen]   = useState(false)
  const registerRef = useRef<HTMLDivElement>(null)
  const loginRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSession(getSession())
  }, [pathname])  // re-check on route change (catches login redirect)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (registerRef.current && !registerRef.current.contains(e.target as Node)) setRegisterOpen(false)
      if (loginRef.current    && !loginRef.current.contains(e.target as Node))    setLoginOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const logout = () => {
    clearSession()
    setSession(null)
    router.push('/')
  }

  // ── Admin pages: don't show the public navbar ──────────────────────────────
  if (pathname.startsWith('/admin')) return null

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">miete<span className="text-brand-600">alle</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/marketplace" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
              Browse Equipment
            </Link>

            {session ? (
              /* ── Logged-in state ── */
              <div className="flex items-center gap-2">
                <NotificationBell session={session} />
                <UserMenu session={session} onLogout={logout} />
              </div>
            ) : (
              /* ── Logged-out state ── */
              <>
                {/* Register dropdown */}
                <div className="relative" ref={registerRef}>
                  <button onClick={() => { setRegisterOpen(!registerOpen); setLoginOpen(false) }}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                    Register <ChevronDown className="w-4 h-4" />
                  </button>
                  {registerOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <Link href="/vendor/register" onClick={() => setRegisterOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">
                        <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 text-xs font-bold">V</div>
                        <div><p className="font-medium">As a Vendor</p><p className="text-xs text-gray-400">List your equipment</p></div>
                      </Link>
                      <Link href="/renter/register" onClick={() => setRegisterOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xs font-bold">R</div>
                        <div><p className="font-medium">As a Renter</p><p className="text-xs text-gray-400">Rent equipment</p></div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Sign In dropdown */}
                <div className="relative" ref={loginRef}>
                  <button onClick={() => { setLoginOpen(!loginOpen); setRegisterOpen(false) }}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                    Sign In <ChevronDown className="w-4 h-4" />
                  </button>
                  {loginOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <Link href="/vendor/login" onClick={() => setLoginOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">
                        <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 text-xs font-bold">V</div>
                        <div><p className="font-medium">Vendor Login</p><p className="text-xs text-gray-400">Manage listings</p></div>
                      </Link>
                      <Link href="/renter/login" onClick={() => setLoginOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xs font-bold">R</div>
                        <div><p className="font-medium">Renter Login</p><p className="text-xs text-gray-400">Browse &amp; book</p></div>
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link href="/admin/login" onClick={() => setLoginOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50">
                          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs font-bold">A</div>
                          <div><p className="font-medium">Admin Portal</p><p className="text-xs text-gray-400">Platform management</p></div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/renter/login"
                  className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-1">
          <Link href="/marketplace" className="block text-sm font-medium text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
            Browse Equipment
          </Link>
          {session ? (
            <>
              <Link href={DASH_LINK[session.role] ?? '/'} className="block text-sm font-medium text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                My Dashboard
              </Link>
              <button onClick={() => { setMobileOpen(false); logout() }}
                className="block w-full text-left text-sm font-medium text-red-600 px-3 py-2.5 rounded-lg hover:bg-red-50">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="text-xs font-semibold text-gray-400 px-3 pt-3 pb-1">Register</div>
              <Link href="/vendor/register" className="block text-sm text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>As a Vendor</Link>
              <Link href="/renter/register" className="block text-sm text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>As a Renter</Link>
              <div className="text-xs font-semibold text-gray-400 px-3 pt-3 pb-1">Sign In</div>
              <Link href="/vendor/login" className="block text-sm text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Vendor Login</Link>
              <Link href="/renter/login" className="block text-sm text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Renter Login</Link>
              <Link href="/admin/login" className="block text-sm text-gray-500 px-3 py-2.5 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Admin Portal</Link>
              <div className="pt-2">
                <Link href="/renter/login" className="block w-full text-center px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
