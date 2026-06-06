'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, X, ChevronDown, ChevronUp, Package, ShoppingBag, Shield, Search, RefreshCw } from 'lucide-react'
import { clearSession } from '@/lib/session'

const links = [
  { label: 'Marketplace', desc: 'Browse equipment', href: '/marketplace',      icon: Search,      color: 'bg-gray-700 hover:bg-gray-600' },
  { label: 'Vendor',      desc: 'Manage listings',  href: '/vendor/dashboard', icon: Package,     color: 'bg-brand-600 hover:bg-brand-500' },
  { label: 'Renter',      desc: 'Book equipment',   href: '/renter/dashboard', icon: ShoppingBag, color: 'bg-orange-500 hover:bg-orange-400' },
  { label: 'Admin',       desc: 'KYC & oversight',  href: '/admin/dashboard',  icon: Shield,      color: 'bg-green-600 hover:bg-green-500' },
]

export default function DemoBanner() {
  const router   = useRouter()
  const [visible, setVisible]   = useState(true)
  const [expanded, setExpanded] = useState(false)

  const handleStartFresh = () => {
    clearSession()
    router.push('/')
    router.refresh()
  }

  if (!visible) return (
    <button onClick={() => setVisible(true)}
      className="fixed bottom-4 right-4 z-[100] bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-gray-800 transition-colors">
      <Zap className="w-3.5 h-3.5 text-yellow-400" /> Demo
    </button>
  )

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-64 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-white text-sm font-bold">Demo Navigator</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-400 hover:text-white rounded">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button onClick={() => setVisible(false)} className="p-1 text-gray-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 🔄 Start Fresh button — clears all sessions */}
      <div className="px-3 pt-3 pb-1">
        <button onClick={handleStartFresh}
          className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Clear Session &amp; Start Fresh
        </button>
      </div>

      {/* Quick-access module buttons */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {links.map(({ label, desc, href, icon: Icon, color }) => (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-white transition-colors ${color}`}>
            <Icon className="w-5 h-5" />
            <span className="text-xs font-bold">{label}</span>
            <span className="text-xs opacity-70 text-center leading-tight">{desc}</span>
          </Link>
        ))}
      </div>

      {/* Expanded: key flows */}
      {expanded && (
        <div className="border-t border-gray-800 p-3 space-y-1">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 px-1">Key Flows</p>
          {[
            { label: '📋 Vendor Registration',  href: '/vendor/register'     },
            { label: '🔑 Vendor Login',          href: '/vendor/login'        },
            { label: '➕ Add New Product',        href: '/vendor/products/new' },
            { label: '📋 Renter Registration',   href: '/renter/register'     },
            { label: '🔑 Renter Login',           href: '/renter/login'        },
            { label: '📦 My Bookings',            href: '/renter/orders'       },
            { label: '📜 Order History',          href: '/renter/history'      },
            { label: '✅ KYC Verifications',      href: '/admin/verifications'  },
            { label: '🤖 AI Features',            href: '/ai-features'          },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              className="block text-xs text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
              {label}
            </Link>
          ))}
        </div>
      )}

      <div className="px-3 pb-3 pt-1">
        <Link href="/demo"
          className="block w-full text-center py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-xs font-bold rounded-xl transition-colors">
          📋 All Demo Accounts &amp; Flows
        </Link>
        <p className="text-xs text-gray-600 text-center mt-2">No backend needed · All mock data</p>
      </div>
    </div>
  )
}
