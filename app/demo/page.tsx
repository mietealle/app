'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { DEMO_ACCOUNTS } from '@/lib/demo-accounts'
import { CheckCircle, Clock, XCircle, ArrowRight, Package, ShoppingBag, Shield, Copy, Check } from 'lucide-react'

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="p-1 rounded text-gray-400 hover:text-gray-700 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

const roleConfig = {
  admin:  { icon: Shield,      bg: 'bg-purple-50',  border: 'border-purple-100', badge: 'bg-purple-100 text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700' },
  vendor: { icon: Package,     bg: 'bg-brand-50',   border: 'border-brand-100',  badge: 'bg-brand-100 text-brand-700',   btn: 'bg-brand-600 hover:bg-brand-700' },
  renter: { icon: ShoppingBag, bg: 'bg-orange-50',  border: 'border-orange-100', badge: 'bg-orange-100 text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600' },
}

const statusBadge = (s: string) => {
  if (s === 'verified') return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />Verified</span>
  if (s === 'pending')  return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" />Pending KYC</span>
  return                       <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Rejected</span>
}

export default function DemoPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            🎯 Demo Mode — No backend required
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Test Accounts</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Use these pre-built accounts to explore every module. Click <strong>Login as…</strong> to jump straight in.
          </p>
        </div>

        {/* Accounts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {DEMO_ACCOUNTS.map((account) => {
            const cfg = roleConfig[account.role]
            const Icon = cfg.icon
            return (
              <div key={account.email} className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
                {/* Role + status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold ${cfg.btn.split(' ')[0]}`}>
                      {account.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.company}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${cfg.badge}`}>
                    {account.role}
                  </span>
                </div>

                {/* Status */}
                <div className="mb-3">{statusBadge(account.status)}</div>

                {/* Description */}
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">{account.description}</p>

                {/* Credentials */}
                <div className="bg-white/70 rounded-xl p-3 space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Email</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-gray-800">{account.email}</span>
                      <CopyBtn text={account.email} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Password</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono font-bold text-gray-800">{account.password}</span>
                      <CopyBtn text={account.password} />
                    </div>
                  </div>
                </div>

                {/* Login button */}
                <button
                  onClick={() => router.push(account.redirectTo)}
                  className={`w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${cfg.btn}`}
                >
                  Login as {account.name.split(' ')[0]} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>

        {/* E2E flow guide */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">End-to-End Test Flows</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Vendor flow */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Vendor Flow</h3>
              </div>
              <ol className="space-y-3">
                {[
                  { step: 1, label: 'Register as Vendor',    href: '/vendor/register',      note: 'Fill 4-step form + doc upload' },
                  { step: 2, label: 'Vendor Login',           href: '/vendor/login',         note: 'k.mueller@ · vendor123' },
                  { step: 3, label: 'View Dashboard',         href: '/vendor/dashboard',     note: 'Stats, listings, bookings' },
                  { step: 4, label: 'Add New Product',        href: '/vendor/products/new',  note: 'Fill form + publish' },
                  { step: 5, label: 'Browse your listing',    href: '/marketplace/p1',       note: 'See it live in marketplace' },
                ].map(({ step, label, href, note }) => (
                  <li key={step} className="flex gap-3">
                    <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{step}</span>
                    <div>
                      <Link href={href} className="text-sm font-medium text-brand-600 hover:underline">{label}</Link>
                      <p className="text-xs text-gray-400 mt-0.5">{note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Renter flow */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Renter Flow</h3>
              </div>
              <ol className="space-y-3">
                {[
                  { step: 1, label: 'Register as Renter',    href: '/renter/register',      note: 'Fill 3-step form + KYC doc' },
                  { step: 2, label: 'Renter Login',           href: '/renter/login',         note: 's.bauer@ · renter123' },
                  { step: 3, label: 'Browse Marketplace',     href: '/marketplace',          note: 'Filter by category / location' },
                  { step: 4, label: 'Open a Product',         href: '/marketplace/p1',       note: 'Select dates → Request Booking' },
                  { step: 5, label: 'View Orders',            href: '/renter/orders',        note: 'Confirmed + pending orders' },
                ].map(({ step, label, href, note }) => (
                  <li key={step} className="flex gap-3">
                    <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{step}</span>
                    <div>
                      <Link href={href} className="text-sm font-medium text-orange-600 hover:underline">{label}</Link>
                      <p className="text-xs text-gray-400 mt-0.5">{note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Admin flow */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Admin Flow</h3>
              </div>
              <ol className="space-y-3">
                {[
                  { step: 1, label: 'Admin Login',            href: '/admin/login',          note: 'admin@mietealle.de · admin123' },
                  { step: 2, label: 'Platform Dashboard',     href: '/admin/dashboard',      note: 'Revenue, stats, pending alerts' },
                  { step: 3, label: 'KYC Verifications',      href: '/admin/verifications',  note: 'Review docs → Approve / Reject' },
                  { step: 4, label: 'Manage Vendors',         href: '/admin/vendors',        note: 'All vendors + listing counts' },
                  { step: 5, label: 'Manage Renters',         href: '/admin/renters',        note: 'All renters + spend tracking' },
                ].map(({ step, label, href, note }) => (
                  <li key={step} className="flex gap-3">
                    <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{step}</span>
                    <div>
                      <Link href={href} className="text-sm font-medium text-purple-600 hover:underline">{label}</Link>
                      <p className="text-xs text-gray-400 mt-0.5">{note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
