import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Zap, TrendingUp, Users, BarChart3, Shield, Clock,
  CheckCircle, ArrowRight, Sparkles, Brain, Target
} from 'lucide-react'

const features = [
  {
    id: 'smart-pricing',
    icon: TrendingUp,
    gradient: 'from-brand-600 to-brand-800',
    badge: 'Vendor Tool',
    badgeColor: 'bg-brand-100 text-brand-700',
    title: 'Smart Pricing AI',
    subtitle: 'Optimal daily rate suggestion engine',
    description:
      'The AI analyses category benchmarks, similar listings in the same city, seasonal demand patterns (trade fair months, construction peaks, event seasons), and real-time platform occupancy to recommend the best daily rate for each piece of equipment.',
    howItWorks: [
      'Vendor opens "Add Product" or "Edit Listing"',
      'AI scans all active listings in same category + location',
      'Seasonality model applies (e.g. 20% premium for event months)',
      'Suggested price is shown as a chip — vendor accepts or overrides',
    ],
    whereInFlow: '/vendor/products/new',
    flowLabel: 'Appears in: Add Product form',
    impact: ['15–30% higher booking rate', 'Prevents under/over-pricing', 'Adapts to market in real time'],
  },
  {
    id: 'demand-forecasting',
    icon: BarChart3,
    gradient: 'from-purple-600 to-purple-800',
    badge: 'Vendor Insight',
    badgeColor: 'bg-purple-100 text-purple-700',
    title: 'Demand Forecasting',
    subtitle: 'Predict which categories will spike next',
    description:
      'A time-series model trained on platform booking data, event calendars, construction permits, and seasonal cycles predicts which equipment categories will see increased demand in the next 30–90 days, so vendors know when to list and what to price at a premium.',
    howItWorks: [
      'Platform ingests booking velocity + external event data',
      'LSTM model predicts demand index per category per region',
      'Vendors see a "Trending soon 🔥" badge on their dashboard',
      'Email alert sent when a category the vendor lists in spikes',
    ],
    whereInFlow: '/vendor/dashboard',
    flowLabel: 'Appears in: Vendor Dashboard',
    impact: ['Plan inventory 60 days ahead', 'Capture peak pricing windows', 'Reduce idle equipment days'],
  },
  {
    id: 'matching',
    icon: Users,
    gradient: 'from-orange-500 to-orange-700',
    badge: 'Renter Tool',
    badgeColor: 'bg-orange-100 text-orange-700',
    title: 'Vendor–Renter Matching',
    subtitle: 'The right equipment from the right vendor',
    description:
      'A recommendation engine analyses the renter\'s booking history, industry type, city, typical usage duration, and past vendor ratings to surface the most relevant listings at the top of search results — like a B2B "For You" page.',
    howItWorks: [
      'Renter opens Browse Equipment or searches for a category',
      'Collaborative filtering cross-references past rentals + similar businesses',
      'Location-aware ranking weights nearby vendors higher',
      '"Best Match for You" badge shown on top 3 listings',
    ],
    whereInFlow: '/marketplace',
    flowLabel: 'Appears in: Marketplace search results',
    impact: ['2× faster equipment selection', 'Higher renter satisfaction', 'Reduced cancellation rate'],
  },
]

const flowMap = [
  {
    step: 1, role: 'Vendor', color: 'brand',
    actions: ['Register & KYC verification', 'List equipment with Smart Pricing AI ✨', 'Receive demand forecast alerts ✨'],
  },
  {
    step: 2, role: 'Renter', color: 'orange',
    actions: ['Browse with AI-matched results ✨', 'Select dates + transport + insurance', 'Submit booking request'],
  },
  {
    step: 3, role: 'Vendor', color: 'brand',
    actions: ['Receive booking notification', 'Accept → Package → Dispatch', '48-hour dispatch compliance'],
  },
  {
    step: 4, role: 'Admin', color: 'purple',
    actions: ['Monitor all bookings + commissions', 'Resolve disputes', 'View AI analytics dashboard ✨'],
  },
  {
    step: 5, role: 'Renter', color: 'orange',
    actions: ['Receive equipment', 'Track via order history', 'Rate vendor & equipment ✨'],
  },
  {
    step: 6, role: 'Vendor', color: 'brand',
    actions: ['Receive return + quality check', 'Payout (90%) processed', 'AI improves pricing model ✨'],
  },
]

const colorMap: Record<string, string> = {
  brand: 'bg-brand-600', orange: 'bg-orange-500', purple: 'bg-purple-600',
}
const bgMap: Record<string, string> = {
  brand: 'bg-brand-50 border-brand-200', orange: 'bg-orange-50 border-orange-200', purple: 'bg-purple-50 border-purple-200',
}
const textMap: Record<string, string> = {
  brand: 'text-brand-700', orange: 'text-orange-700', purple: 'text-purple-700',
}

export default function AIFeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-sm mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            AI-Powered Features — Roadmap
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Where AI Fits in <span className="text-brand-300">Mietealle</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Three AI capabilities woven into the rental marketplace to increase revenue for vendors,
            reduce friction for renters, and give admins full platform intelligence.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm"><Brain className="w-4 h-4 text-purple-400" />ML-powered pricing</div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm"><TrendingUp className="w-4 h-4 text-green-400" />Demand forecasting</div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm"><Target className="w-4 h-4 text-orange-400" />Smart matching</div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-12">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header stripe */}
                <div className={`bg-gradient-to-r ${f.gradient} p-6 text-white`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20`}>{f.badge}</span>
                          <span className="text-xs text-white/70">Feature #{i + 1}</span>
                        </div>
                        <h2 className="text-xl font-bold">{f.title}</h2>
                        <p className="text-white/80 text-sm mt-0.5">{f.subtitle}</p>
                      </div>
                    </div>
                    <Link href={f.whereInFlow}
                      className="shrink-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors">
                      {f.flowLabel} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Description */}
                  <div className="md:col-span-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">What it does</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
                  </div>

                  {/* How it works */}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-3">How it works</h3>
                    <ol className="space-y-2">
                      {f.howItWorks.map((step, si) => (
                        <li key={si} className="flex gap-2.5 text-sm">
                          <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 mt-0.5">{si + 1}</span>
                          <span className="text-gray-600">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Impact */}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-3">Business impact</h3>
                    <div className="space-y-2">
                      {f.impact.map((imp, ii) => (
                        <div key={ii} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700">{imp}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />Status: Planned — Phase 2
                      </p>
                      <p className="text-xs text-amber-600 mt-0.5">UI placeholders shown in the app today. Backend model training begins post-launch.</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Flow map */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">AI in the Full Rental Flow</h2>
            <p className="text-gray-500 mt-2">Where ✨ AI touchpoints appear across the end-to-end journey</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {flowMap.map(({ step, role, color, actions }) => (
              <div key={step} className={`rounded-2xl border p-4 ${bgMap[color]}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-6 h-6 rounded-full ${colorMap[color]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{step}</div>
                  <span className={`text-xs font-bold ${textMap[color]}`}>{role}</span>
                </div>
                <ul className="space-y-1.5">
                  {actions.map((a, i) => (
                    <li key={i} className={`text-xs leading-tight ${a.includes('✨') ? `font-semibold ${textMap[color]}` : 'text-gray-600'}`}>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><span className="text-base">✨</span>AI-powered touchpoint</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-brand-600" />Vendor action</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" />Renter action</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-600" />Admin action</div>
          </div>
        </div>
      </section>

      {/* Tech stack for AI */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gray-900 rounded-2xl p-8 text-white">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" />Recommended AI Tech Stack</h2>
          <p className="text-gray-400 text-sm mb-6">Suggested implementation path for each feature</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                feature: 'Smart Pricing',
                stack: ['scikit-learn (regression)', 'Python FastAPI microservice', 'Supabase Edge Function wrapper', 'Retrain weekly on booking data'],
                color: 'border-brand-500',
              },
              {
                feature: 'Demand Forecasting',
                stack: ['Prophet (Facebook) time-series', 'Event calendar API integration', 'Cron job: daily forecast update', 'Push notification via Supabase Realtime'],
                color: 'border-purple-500',
              },
              {
                feature: 'Vendor–Renter Matching',
                stack: ['Collaborative filtering (Surprise lib)', 'pgvector in Supabase for embeddings', 'Embedding: OpenAI text-embedding-3', 'Real-time re-rank on each search'],
                color: 'border-orange-500',
              },
            ].map(({ feature, stack, color }) => (
              <div key={feature} className={`border-l-2 ${color} pl-4`}>
                <p className="font-semibold text-white text-sm mb-3">{feature}</p>
                <ul className="space-y-1.5">
                  {stack.map((s, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                      <span className="text-gray-600 mt-0.5">→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-brand-50 border-t border-brand-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Sparkles className="w-8 h-8 text-brand-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">AI features ship in Phase 2</h2>
          <p className="text-gray-600 text-sm mb-6">
            The marketplace infrastructure is built. AI training begins once we have 100+ bookings for meaningful signal.
            Placeholders are already wired in the vendor and marketplace UIs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/marketplace" className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">
              Browse Marketplace
            </Link>
            <Link href="/vendor/login" className="px-5 py-2.5 border border-brand-200 bg-white text-brand-700 text-sm font-semibold rounded-xl hover:bg-brand-50">
              Vendor Portal
            </Link>
            <Link href="/demo" className="px-5 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">
              View All Demo Accounts
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
