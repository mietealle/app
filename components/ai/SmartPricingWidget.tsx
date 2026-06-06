'use client'
import { useState, useEffect } from 'react'
import { Zap, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react'

// Mock AI pricing suggestions by category
const SUGGESTIONS: Record<string, { min: number; max: number; reason: string; bookings: number; trend: string }> = {
  'Display & Visual':   { min: 340, max: 420, reason: 'High demand during event season (June–Sept)', bookings: 18, trend: '+12% vs last month' },
  'Power & Energy':     { min: 210, max: 280, reason: 'Steady demand from construction sector', bookings: 24, trend: '+5% vs last month' },
  'Material Handling':  { min: 180, max: 220, reason: 'Consistent logistics & warehouse demand', bookings: 31, trend: '+2% vs last month' },
  'Access Equipment':   { min: 150, max: 195, reason: 'Growing construction activity in your region', bookings: 14, trend: '+8% vs last month' },
  'Audio & Visual':     { min: 390, max: 480, reason: 'Peak conference season — price premium applies', bookings: 11, trend: '+19% vs last month' },
  'Construction':       { min: 160, max: 240, reason: 'High rental volume — competitive market', bookings: 42, trend: 'Stable' },
  'Safety Equipment':   { min: 50,  max: 90,  reason: 'Regulation-driven demand, stable year-round', bookings: 8,  trend: 'Stable' },
}

const DEFAULT = { min: 150, max: 300, reason: 'Based on similar listings on the platform', bookings: 12, trend: 'Stable' }

interface Props {
  category: string
  location: string
  onAccept: (price: number) => void
}

export default function SmartPricingWidget({ category, location, onAccept }: Props) {
  const [loading, setLoading]   = useState(false)
  const [visible, setVisible]   = useState(false)
  const [accepted, setAccepted] = useState(false)
  const sugg = SUGGESTIONS[category] ?? DEFAULT
  const suggested = Math.round((sugg.min + sugg.max) / 2)

  useEffect(() => {
    if (!category) { setVisible(false); return }
    setLoading(true)
    setAccepted(false)
    setVisible(false)
    const t = setTimeout(() => { setLoading(false); setVisible(true) }, 900)
    return () => clearTimeout(t)
  }, [category, location])

  if (!category) return null

  return (
    <div className="mt-2">
      {loading ? (
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2.5">
          <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <p className="text-xs text-purple-600">✨ Smart Pricing AI analysing {category} in {location || 'your region'}…</p>
        </div>
      ) : visible && !accepted ? (
        <div className="bg-gradient-to-r from-purple-50 to-brand-50 border border-purple-200 rounded-xl p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs font-bold text-purple-900">✨ Smart Pricing AI Recommendation</p>
          </div>

          {/* Price range */}
          <div className="bg-white rounded-xl p-3 border border-purple-100">
            <p className="text-xs text-gray-500 mb-1">Suggested daily rate for <strong>{category}</strong></p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-extrabold text-purple-700">€{suggested}</p>
              <p className="text-sm text-gray-500 mb-1">/ day</p>
              <p className="text-xs text-gray-400 mb-1 ml-1">(range: €{sugg.min}–€{sugg.max})</p>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
              <span><strong>Demand signal:</strong> {sugg.reason}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 shrink-0">📊</span>
              <span><strong>{sugg.bookings} similar listings</strong> analysed in your category</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 shrink-0">📈</span>
              <span>Category trend: <strong className="text-green-600">{sugg.trend}</strong></span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => { onAccept(suggested); setAccepted(true) }}
              className="flex-1 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />Use €{suggested}/day
            </button>
            <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false) }, 600) }}
              className="p-2 border border-purple-200 rounded-xl hover:bg-purple-50 text-purple-600">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setVisible(false)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50">
              Dismiss
            </button>
          </div>
        </div>
      ) : accepted ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
          <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 font-medium">✨ AI price €{suggested}/day applied — you can still adjust it above.</p>
        </div>
      ) : null}
    </div>
  )
}
