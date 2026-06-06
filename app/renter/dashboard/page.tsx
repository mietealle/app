'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import RenterPageLayout from '@/components/layout/RenterPageLayout'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { StatCard } from '@/components/ui/Card'
import { getSession } from '@/lib/session'
import { ShoppingBag, Search, Calendar, TrendingDown, CheckCircle, Clock, ArrowRight, MapPin, Star, Zap } from 'lucide-react'
import AIMatchingPanel from '@/components/ai/AIMatchingPanel'

export default function RenterDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [recommended, setRecommended] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== 'renter') { router.push('/renter/login'); return }
    setProfile(session)

    Promise.all([
      fetch(`/api/bookings?renter_id=${session.id}`).then(r => r.json()),
      fetch('/api/products?available=true').then(r => r.json()),
    ]).then(([b, p]) => {
      setBookings(b.bookings ?? [])
      setRecommended((p.products ?? []).slice(0, 3))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  const totalSpent = bookings.reduce((s, b) => s + Number(b.total_amount), 0)

  if (loading || !profile) return (
    <RenterPageLayout>
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </RenterPageLayout>
  )

  return (
    <RenterPageLayout>
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
          <Link href="/marketplace" className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 shadow-sm">
            <Search className="w-4 h-4" />Browse Equipment
          </Link>
        </div>

        {/* AI Matching Panel */}
        <AIMatchingPanel
          products={recommended}
          userName={profile?.name}
          companyName={profile?.company}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Bookings" value={bookings.length}                                              icon={ShoppingBag} color="brand" />
          <StatCard label="Active Orders"  value={bookings.filter(b => b.status === 'confirmed').length}        icon={CheckCircle}  color="green" />
          <StatCard label="Pending"        value={bookings.filter(b => b.status === 'pending').length}          icon={Clock}        color="orange" />
          <StatCard label="Total Spent"    value={formatCurrency(totalSpent)}                                   icon={TrendingDown}  color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">My Orders</h2>
                <Link href="/renter/orders" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
              </div>
              {bookings.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No orders yet</p>
                  <Link href="/marketplace" className="mt-2 text-xs text-brand-600 hover:underline">Browse equipment →</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {bookings.slice(0, 4).map(b => (
                    <div key={b.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-gray-900 truncate">{b.product?.title ?? 'Equipment'}</p>
                            <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(b.status)}`}>{b.status}</span>
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(b.start_date)} – {formatDate(b.end_date)} · {b.total_days} days</p>
                        </div>
                        <span className="font-bold text-gray-900 text-sm shrink-0">{formatCurrency(b.total_amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recommended for You</h2>
                <Link href="/marketplace" className="text-xs font-medium text-brand-600 hover:underline">See all</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recommended.map(p => (
                  <Link key={p.id} href={`/marketplace/${p.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors block">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {p.images?.[0] && <Image src={p.images[0]} alt={p.title} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{p.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3" />{p.location}<span>·</span><Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /><span>4.8</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900 text-sm">{formatCurrency(p.price_per_day)}</p>
                      <p className="text-xs text-gray-400">/day</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Company</span><span className="font-medium">{profile.company}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">City</span><span className="font-medium">{profile.city ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span>
                  <span className="font-medium text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />{profile.verification_status}</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-1">Need something?</h3>
              <p className="text-brand-200 text-sm mb-4">Browse 500+ verified listings</p>
              <Link href="/marketplace" className="inline-flex items-center gap-2 bg-white text-brand-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-50 transition-colors w-full justify-center">
                Browse Equipment <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RenterPageLayout>
  )
}
