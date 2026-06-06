'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RenterPageLayout from '@/components/layout/RenterPageLayout'
import { getSession } from '@/lib/session'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { ChevronLeft, Calendar, Clock, CheckCircle, XCircle, Package, AlertCircle } from 'lucide-react'

const STATUS_STEPS = ['pending', 'confirmed', 'completed']

export default function RenterOrdersPage() {
  const router   = useRouter()
  const [orders, setOrders]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== 'renter') { router.push('/renter/login'); return }
    fetch(`/api/bookings?renter_id=${session.id}`)
      .then(r => r.json())
      .then(d => { setOrders(d.bookings ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [router])

  const tabs = [
    { key: 'all',       label: 'All',       count: orders.length },
    { key: 'pending',   label: 'Pending',   count: orders.filter(b=>b.status==='pending').length },
    { key: 'confirmed', label: 'Confirmed', count: orders.filter(b=>b.status==='confirmed').length },
    { key: 'completed', label: 'Completed', count: orders.filter(b=>b.status==='completed').length },
  ]
  const filtered = filter === 'all' ? orders : orders.filter(b => b.status === filter)

  return (
    <RenterPageLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/renter/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 text-sm mt-0.5">{orders.length} total booking{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/marketplace" className="px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">
            + New Booking
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit mb-6 shadow-sm">
          {tabs.map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === key ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No orders yet</p>
            <Link href="/marketplace" className="mt-3 inline-block text-sm text-brand-600 hover:underline">Browse equipment →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const stepIdx = STATUS_STEPS.indexOf(order.status)
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{order.product?.title ?? 'Equipment'}</h3>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(order.start_date)} – {formatDate(order.end_date)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{order.total_days} day{order.total_days !== 1 ? 's' : ''}</span>
                      </div>
                      {order.vendor && <p className="text-xs text-gray-400 mt-1">Vendor: {order.vendor.company ?? order.vendor.name}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Booking #{order.id.slice(0,8)}</p>
                    </div>
                  </div>

                  {/* Status progress */}
                  {order.status !== 'cancelled' && (
                    <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-xl p-3">
                      {STATUS_STEPS.map((step, i) => {
                        const done    = stepIdx >= i
                        const current = stepIdx === i
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                              </div>
                              <span className={`text-[10px] mt-1 capitalize ${current ? 'text-brand-600 font-bold' : done ? 'text-gray-600' : 'text-gray-400'}`}>{step}</span>
                            </div>
                            {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-px mx-1 mb-4 ${stepIdx > i ? 'bg-brand-600' : 'bg-gray-200'}`} />}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {order.status === 'pending' && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-700 mb-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />Awaiting vendor confirmation. You'll be notified once the vendor accepts.
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    {order.product?.id && (
                      <Link href={`/marketplace/${order.product.id}`}
                        className="px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        View Equipment
                      </Link>
                    )}
                    {order.status === 'confirmed' && (
                      <>
                        <a href={`mailto:${order.vendor?.email}`}
                          className="px-4 py-2 text-xs font-medium border border-brand-200 rounded-lg text-brand-600 hover:bg-brand-50">
                          📧 Contact Vendor
                        </a>
                        {order.vendor?.phone && (
                          <a href={`tel:${order.vendor.phone}`}
                            className="px-4 py-2 text-xs font-medium border border-green-200 rounded-lg text-green-600 hover:bg-green-50">
                            📞 Call Vendor
                          </a>
                        )}
                      </>
                    )}
                    {order.status === 'completed' && (
                      <button className="px-4 py-2 text-xs font-medium bg-brand-50 border border-brand-100 rounded-lg text-brand-600 hover:bg-brand-100">
                        ⭐ Leave Review
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </RenterPageLayout>
  )
}
