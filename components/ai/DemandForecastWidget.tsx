'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Zap, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'

const FORECASTS = [
  { category: 'Audio & Visual',   icon: '🎵', change: +34, reason: 'Trade fair season begins next month',        bookingsNext30: 47, demand: 'very-high' },
  { category: 'Display & Visual', icon: '📺', change: +19, reason: 'Event season peak — June to September',     bookingsNext30: 38, demand: 'high'      },
  { category: 'Power & Energy',   icon: '⚡', change: +8,  reason: 'Construction projects ramping up',          bookingsNext30: 29, demand: 'medium'    },
  { category: 'Material Handling',icon: '🏗️', change: +3,  reason: 'Stable logistics demand',                  bookingsNext30: 22, demand: 'medium'    },
  { category: 'Access Equipment', icon: '🪜', change: -4,  reason: 'Seasonal slowdown post-construction peak', bookingsNext30: 15, demand: 'low'       },
  { category: 'Safety Equipment', icon: '🦺', change: 0,   reason: 'Regulation-driven — always steady',        bookingsNext30: 10, demand: 'stable'    },
]

const DEMAND_COLOR: Record<string, string> = {
  'very-high': 'bg-red-100 text-red-700',
  'high':      'bg-orange-100 text-orange-700',
  'medium':    'bg-blue-100 text-blue-700',
  'low':       'bg-gray-100 text-gray-500',
  'stable':    'bg-green-100 text-green-700',
}

export default function DemandForecastWidget() {
  const [selected, setSelected] = useState<typeof FORECASTS[0] | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-brand-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
              ✨ AI Demand Forecast — Next 30 Days
              <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">DEMO</span>
            </p>
            <p className="text-gray-500 text-xs">Predicts which equipment categories will spike — so you onboard the right vendors first.</p>
          </div>
        </div>
        <Link href="/ai-features" className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap">
          AI Roadmap <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {FORECASTS.map((f, i) => (
            <button key={f.category} onClick={() => setSelected(selected?.category === f.category ? null : f)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${selected?.category === f.category ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl">{f.icon}</span>
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${DEMAND_COLOR[f.demand]}`}>
                  {f.demand.replace('-', ' ')}
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{f.category}</p>

              {/* Mini bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                <div
                  className={`h-1.5 rounded-full ${f.change > 15 ? 'bg-red-500' : f.change > 5 ? 'bg-orange-400' : f.change > 0 ? 'bg-blue-400' : f.change < 0 ? 'bg-gray-300' : 'bg-green-400'}`}
                  style={{ width: `${Math.min(100, 50 + f.change * 1.5)}%` }}
                />
              </div>

              <div className="flex items-center gap-1.5">
                {f.change > 5 ? <TrendingUp className="w-3.5 h-3.5 text-green-500 shrink-0" /> :
                 f.change < -2 ? <TrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0" /> :
                 <Minus className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                <span className={`text-xs font-bold ${f.change > 5 ? 'text-green-600' : f.change < -2 ? 'text-red-500' : 'text-gray-500'}`}>
                  {f.change > 0 ? '+' : ''}{f.change}%
                </span>
                <span className="text-xs text-gray-400">· ~{f.bookingsNext30} bookings/month</span>
              </div>
            </button>
          ))}
        </div>

        {/* Expanded insight */}
        {selected && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">{selected.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-purple-900 text-sm mb-1">{selected.category} — Forecast Detail</p>
              <p className="text-xs text-purple-700 mb-2">🤖 <strong>AI insight:</strong> {selected.reason}</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                  Predicted bookings: {selected.bookingsNext30}/month
                </span>
                <span className={`px-2.5 py-1 rounded-full font-medium ${selected.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {selected.change > 0 ? '↑' : '↓'} {Math.abs(selected.change)}% vs last month
                </span>
                <span className="bg-white border border-purple-200 text-purple-600 px-2.5 py-1 rounded-full font-medium">
                  Action: {selected.change > 10 ? 'Actively recruit vendors in this category' : selected.change < 0 ? 'Monitor — may need promotional push' : 'Maintain current vendor count'}
                </span>
              </div>
            </div>
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-3 text-center">
          🤖 Model trained on platform booking velocity, external event calendars &amp; seasonality patterns · Phase 2 feature
        </p>
      </div>
    </div>
  )
}
