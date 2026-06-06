'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StatCard } from '@/components/ui/Card'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { getSession } from '@/lib/session'
import { Users, Package, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const COMMISSION = 0.10 // 10% platform fee

export default function AdminDashboard() {
  const router = useRouter()
  const [vendors, setVendors]   = useState<any[]>([])
  const [renters, setRenters]   = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== 'admin') { router.push('/admin/login'); return }
    Promise.all([
      fetch('/api/admin/users?role=vendor').then(r => r.json()),
      fetch('/api/admin/users?role=renter').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
    ]).then(([v, r, p, b]) => {
      setVendors(v.users ?? []); setRenters(r.users ?? [])
      setProducts(p.products ?? []); setBookings(b.bookings ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  const pendingVendors = vendors.filter(v => v.verification_status === 'pending')
  const pendingRenters = renters.filter(r => r.verification_status === 'pending')
  const confirmedAmt   = bookings.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s,b) => s + Number(b.total_amount), 0)
  const platformRev    = confirmedAmt * COMMISSION

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time data from Supabase.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Vendors"       value={vendors.length}                                    icon={Package}     color="brand"  />
        <StatCard label="Total Renters"       value={renters.length}                                    icon={Users}       color="orange" />
        <StatCard label="Active Listings"     value={products.filter(p=>p.status==='active').length}    icon={ShoppingBag} color="green"  />
        <StatCard label={`Platform Revenue (${COMMISSION*100}%)`} value={formatCurrency(platformRev)}  icon={TrendingUp}  color="purple" />
      </div>

      {(pendingVendors.length > 0 || pendingRenters.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">Action Required</p>
            <p className="text-amber-700 text-sm mt-0.5">
              {pendingVendors.length} vendor{pendingVendors.length!==1?'s':''} and {pendingRenters.length} renter{pendingRenters.length!==1?'s':''} awaiting KYC.
            </p>
          </div>
          <Link href="/admin/verifications" className="text-sm font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap">Review →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pending vendors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Pending Vendors</h2>
            <Link href="/admin/vendors" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
          </div>
          {pendingVendors.length === 0
            ? <div className="px-6 py-8 text-center text-sm text-gray-400">All vendors verified ✓</div>
            : <div className="divide-y divide-gray-50">
                {pendingVendors.slice(0,3).map(v => (
                  <div key={v.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">{v.name[0]}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm text-gray-900">{v.name}</p><p className="text-xs text-gray-500">{v.company}</p></div>
                    <Link href="/admin/verifications" className="text-xs font-medium text-brand-600 hover:underline">Review</Link>
                  </div>
                ))}
              </div>
          }
        </div>
        {/* Pending renters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Pending Renters</h2>
            <Link href="/admin/renters" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
          </div>
          {pendingRenters.length === 0
            ? <div className="px-6 py-8 text-center text-sm text-gray-400">All renters verified ✓</div>
            : <div className="divide-y divide-gray-50">
                {pendingRenters.slice(0,3).map(r => (
                  <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">{r.name[0]}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm text-gray-900">{r.name}</p><p className="text-xs text-gray-500">{r.company}</p></div>
                    <Link href="/admin/verifications" className="text-xs font-medium text-brand-600 hover:underline">Review</Link>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-xs font-medium text-brand-600 hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Equipment</th>
                <th className="text-left px-6 py-3">Renter</th>
                <th className="text-left px-6 py-3">Dates</th>
                <th className="text-left px-6 py-3">Total</th>
                <th className="text-left px-6 py-3">Commission (10%)</th>
                <th className="text-left px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.slice(0,5).map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{b.product?.title ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{b.renter?.company ?? b.renter?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">{formatDate(b.start_date)} – {formatDate(b.end_date)}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(b.total_amount)}</td>
                  <td className="px-6 py-4 font-semibold text-purple-700">{formatCurrency(Number(b.total_amount)*COMMISSION)}</td>
                  <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(b.status)}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <div className="py-8 text-center text-sm text-gray-400">No bookings yet</div>}
        </div>
      </div>
    </div>
  )
}
