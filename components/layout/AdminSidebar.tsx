'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, CheckSquare, Package, Users, Shield, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

// Auth guard is handled by the admin layout (skips sidebar on /admin/login).
// Individual pages also redirect if no session.
// Sidebar itself always renders on authenticated admin pages.

const nav = [
  { href: '/admin/dashboard',     icon: BarChart3,   label: 'Dashboard'    },
  { href: '/admin/verifications', icon: CheckSquare, label: 'Verifications'},
  { href: '/admin/bookings',      icon: ShoppingBag, label: 'All Bookings' },
  { href: '/admin/vendors',       icon: Package,     label: 'Vendors'      },
  { href: '/admin/renters',       icon: Users,       label: 'Renters'      },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Mietealle</p>
            <p className="text-gray-500 text-xs">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
                ? 'bg-brand-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}>
            <Icon className="w-4 h-4" />{label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">Sign out via top-right menu</p>
      </div>
    </aside>
  )
}
