'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RenterPageLayout from '@/components/layout/RenterPageLayout'
import { getSession } from '@/lib/session'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import {
  Clock, CheckCircle, XCircle, Package, Calendar,
  Search, Star, ChevronDown, ChevronUp
} from 'lucide-react'

const HISTORY_STATUSES = ['completed', 'cancelled', 'returned', 'closed']

function Timeline({ booking }: { booking: any }) {
  const events = [
    { label: 'Booking Created',   time: booking.created_at,          icon: Package,       show: true },
    { label: 'Booking Confirmed', time: booking.confirmed_at ?? null, icon: CheckCircle,   show: booking.status !== 'cancelled' },
    { label: 'Dispatched',        time: booking.dispatched_at ?? null,icon: Package,       show: !!booking.dispatched_at },
    { label: 'Delivered',         time: booking.delivered_at ?? null, icon: CheckCircle,   show: !!booking.delivered_at },
    { label: 'Returned',          time: booking.returned_at ?? null,  icon: Package,       show: !!booking.returned_at },
    { label: 'Completed',         time: booking.closed_at ?? null,    icon: Star,          show: booking.status === 'completed' },
    { label: 'Cancelled',         time: booking.created_at,           icon: XCircle,       show: booking.status === 'cancelled' },
  ].filter(e => e.show)

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Timeline</p>
      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              e.label === 'Cancelled' ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <e.icon className={`w-3.5 h-3.5 ${e.label === 'Cancelled' ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{e.label}</span>
              <span className="text-xs text-gray-400">
                {e.time ? formatDate(e.time) : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RenterHistoryPage() {
  const router   = useRouter()
  const [orders, setOrders]       = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== 'renter') { router.push('/renter/login'); return }
    fetch(`/api/bookings?renter_id=${session.id}`)
      .then(r => r.json())
      .then(d => {
        const all: any[] = d.bookings ?? []
        setOrders(all.filter(b => HISTORY_STATUSES.includes(b.status ?? '')))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const filtered = orders.filter(o => {
    if (!search) return true
    return (
      o.product?.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.vendor?.company?.toLowerCase().includes(search.toLowerCase())
    )
  })

  const totalSpent = orders
    .filter(o => o.status === 'completed')
    .reduce((s, o) => s + Number(o.total_amount ?? 0), 0)

  return (
    <RenterPageLayout>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-500 text-sm mt-0.5">All your past, completed and cancelled bookings.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Orders',    value: orders.length,                                      color: 'text-gray-900' },
            { label: 'Completed',       value: orders.filter(o => o.status === 'completed').length, color: 'text-green-600'},
            { label: 'Total Spent',     value: formatCurrency(totalSpent),                          color: 'text-brand-600'},
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by equipment or vendor..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No order history yet</p>
            <p className="text-gray-400 text-sm mt-1">Completed and cancelled bookings will appear here</p>
            <Link href="/marketplace" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
              Browse equipment to make your first booking →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const isExpanded = expandedId === order.id
              const isCompleted = order.status === 'completed'
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Main row */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{order.product?.title ?? 'Equipment'}</h3>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(order.start_date)} – {formatDate(order.end_date)}
                          </span>
                          <span>{order.total_days} days</span>
                          {order.vendor?.company && <span>· {order.vendor.company}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(order.total_amount ?? 0)}</p>
                        <p className="text-xs text-gray-400">Booking #{order.id?.slice(0,8)}</p>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-3">
                      {order.product?.id && (
                        <Link href={`/marketplace/${order.product.id}`}
                          className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                          View Equipment
                        </Link>
                      )}
                      {isCompleted && (
                        <button className="flex items-center gap-1 text-xs px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 hover:bg-amber-100">
                          <Star className="w-3.5 h-3.5" />Leave Review
                        </button>
                      )}
                      <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                        {isExpanded ? <><ChevronUp className="w-4 h-4" />Less</> : <><ChevronDown className="w-4 h-4" />Details</>}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-50 bg-gray-50/50">
                      {/* Financial breakdown */}
                      <div className="grid grid-cols-2 gap-3 mt-4 mb-2">
                        {[
                          ['Rental amount',  formatCurrency(order.total_amount ?? 0)],
                          ['Transport',      order.transport_cost > 0 ? formatCurrency(order.transport_cost) : 'N/A'],
                          ['Insurance',      order.insurance_selected ? formatCurrency(order.insurance_cost ?? 0) : 'Not selected'],
                          ['Transport type', order.transport_option === 'vendor' ? 'Vendor delivery' : 'Self pickup'],
                          ['Delivery to',    order.delivery_address ?? '—'],
                          ['Pre-payment',    order.pre_payment_amount > 0 ? formatCurrency(order.pre_payment_amount) : '—'],
                        ].map(([l, v]) => (
                          <div key={String(l)} className="text-xs">
                            <span className="text-gray-500">{l}: </span>
                            <span className="font-medium text-gray-900">{v}</span>
                          </div>
                        ))}
                      </div>
                      <Timeline booking={order} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </RenterPageLayout>
  )
}
