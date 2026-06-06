'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import VendorPageLayout from '@/components/layout/VendorPageLayout'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { StatCard } from '@/components/ui/Card'
import { getSession } from '@/lib/session'
import { Package, Plus, TrendingUp, Calendar, CheckCircle, Clock, AlertCircle, Eye, Edit3, Star, ShoppingBag, Search, Zap } from 'lucide-react'

const COMMISSION = 0.10

export default function VendorDashboard() {
  const router  = useRouter()
  const [profile, setProfile]   = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== 'vendor') { router.push('/vendor/login'); return }
    setProfile(session)
    Promise.all([
      fetch(`/api/products?vendor_id=${session.id}`).then(r => r.json()),
      fetch(`/api/bookings?vendor_id=${session.id}`).then(r => r.json()),
    ]).then(([p, b]) => {
      setProducts(p.products ?? [])
      setBookings(b.bookings ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  const confirmedAmt = bookings.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s,b) => s + Number(b.total_amount), 0)
  const myEarnings   = confirmedAmt * (1 - COMMISSION)
  const platformFee  = confirmedAmt * COMMISSION

  if (loading || !profile) return (
    <VendorPageLayout>
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </VendorPageLayout>
  )

  return (
    <VendorPageLayout>
      <div className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile.name?.split(' ')[0]} 👋</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">{profile.company}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${profile.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {profile.verification_status === 'verified' ? <><CheckCircle className="w-3 h-3" />Verified</> : <><Clock className="w-3 h-3" />Pending</>}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/marketplace" className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 shadow-sm">
              <Search className="w-4 h-4" />Browse
            </Link>
            <Link href="/vendor/bookings" className="flex items-center gap-2 px-4 py-2.5 border border-brand-200 bg-brand-50 text-brand-700 text-sm font-semibold rounded-xl hover:bg-brand-100 shadow-sm">
              <ShoppingBag className="w-4 h-4" />Bookings
              {bookings.filter((b:any)=>b.status==='pending'||b.tracking_status==='pending').length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {bookings.filter((b:any)=>b.status==='pending'||b.tracking_status==='pending').length}
                </span>
              )}
            </Link>
            <Link href="/vendor/products/new" className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />Add Product
            </Link>
          </div>
        </div>

        {/* AI Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-brand-50 border border-purple-100 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                  ✨ AI Features — Coming in Phase 2
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  <strong>Smart Pricing AI</strong> will suggest the optimal daily rate for your listings based on category, location and season.
                  <strong> Demand Forecasting</strong> will alert you when your equipment category is trending — so you list at the right time and price.
                </p>
              </div>
            </div>
            <Link href="/ai-features" className="shrink-0 text-xs font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
              See AI Roadmap →
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Products"    value={products.length}                                    icon={Package}    color="brand"  />
          <StatCard label="Active Listings"   value={products.filter(p=>p.status==='active').length}     icon={CheckCircle} color="green" />
          <StatCard label="Booking Requests"  value={bookings.length}                                    icon={Calendar}   color="orange" />
          <StatCard label="Your Earnings (90%)" value={formatCurrency(myEarnings)}                       icon={TrendingUp}  color="purple" />
        </div>

        {/* Revenue breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Revenue Breakdown</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Total Booking Value</p>
              <p className="font-bold text-gray-900">{formatCurrency(confirmedAmt)}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-xs text-purple-600 mb-1">Mietealle Commission (10%)</p>
              <p className="font-bold text-purple-700">{formatCurrency(platformFee)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-green-600 mb-1">Your Payout (90%)</p>
              <p className="font-bold text-green-700">{formatCurrency(myEarnings)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">My Listings</h2>
                <Link href="/vendor/products" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
              </div>
              {products.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">No listings yet</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {products.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {p.images?.[0] && <Image src={p.images[0]} alt={p.title} fill className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{p.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.category} · {formatCurrency(p.price_per_day)}/day</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {p.available ? 'Available' : 'Booked'}
                        </span>
                        <Link href={`/marketplace/${p.id}`} className="p-1.5 rounded-lg hover:bg-gray-100" title="View"><Eye className="w-4 h-4 text-gray-500" /></Link>
                        <Link href={`/vendor/products/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100" title="Edit"><Edit3 className="w-4 h-4 text-gray-500" /></Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="px-6 py-4 border-t border-gray-100">
                <Link href="/vendor/products/new" className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600">
                  <Plus className="w-4 h-4" />Add New Listing
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Booking Requests</h2>
                {bookings.filter(b=>b.status==='pending').length > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{bookings.filter(b=>b.status==='pending').length} new</span>
                )}
              </div>
              {bookings.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-400">No bookings yet</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {bookings.slice(0, 4).map(b => (
                    <div key={b.id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-gray-900 truncate">{b.renter?.company ?? b.renter?.name ?? 'Renter'}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(b.status)}`}>{b.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-2">{b.product?.title ?? ''}</p>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{formatDate(b.start_date)} – {formatDate(b.end_date)}</span>
                        <div className="text-right">
                          <span className="font-semibold text-gray-700">{formatCurrency(b.total_amount)}</span>
                          <span className="block text-green-600">You get: {formatCurrency(Number(b.total_amount)*0.9)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className={`rounded-2xl p-5 border ${profile.verification_status === 'verified' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
              {profile.verification_status === 'verified' ? (
                <><div className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-green-600" /><span className="font-semibold text-green-800 text-sm">Account Verified</span></div>
                <p className="text-xs text-green-700">Customers can book your equipment.</p></>
              ) : (
                <><div className="flex items-center gap-2 mb-2"><AlertCircle className="w-5 h-5 text-amber-600" /><span className="font-semibold text-amber-800 text-sm">Verification Pending</span></div>
                <p className="text-xs text-amber-700">Admin review in progress (1–2 business days).</p></>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Performance</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Avg. Rating</span><span className="font-semibold flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />4.8</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Pending bookings</span><span className="font-semibold text-orange-600">{bookings.filter(b=>b.status==='pending').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Confirmed bookings</span><span className="font-semibold text-green-600">{bookings.filter(b=>b.status==='confirmed').length}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendorPageLayout>
  )
}
