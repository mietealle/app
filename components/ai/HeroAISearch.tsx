'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Loader, X } from 'lucide-react'

const HINTS = [
  'I need an Electric Forklift for 3 days in Hamburg',
  'LED display board for a trade fair in Berlin',
  'Sound system for a 200-person conference',
  'Industrial generator, 5 days, Frankfurt',
  'Scissor lift for indoor ceiling work',
  'Diesel generator for outdoor event',
]

// Minimal AI parser — extracts category + location + duration and builds
// a marketplace URL with those query params pre-filled.
const CATEGORY_MAP = [
  { keywords: ['forklift', 'pallet', 'lift truck', 'lifting'],       category: 'Material Handling' },
  { keywords: ['display', 'led', 'screen', 'board', 'monitor'],      category: 'Display & Visual'  },
  { keywords: ['generator', 'power', 'energy', 'diesel'],            category: 'Power & Energy'    },
  { keywords: ['scissor', 'boom', 'access', 'platform'],             category: 'Access Equipment'  },
  { keywords: ['sound', 'audio', 'speaker', 'pa system'],            category: 'Audio & Visual'    },
  { keywords: ['excavator', 'crane', 'drill', 'concrete'],           category: 'Construction'      },
]

const CITIES = ['hamburg', 'berlin', 'munich', 'frankfurt', 'cologne', 'stuttgart']

function parse(q: string) {
  const lower = q.toLowerCase()
  const category = CATEGORY_MAP.find(({ keywords }) => keywords.some(k => lower.includes(k)))?.category
  const location  = CITIES.find(c => lower.includes(c))
  const daysMatch = lower.match(/(\d+)\s*day/)
  return { category, location, days: daysMatch ? parseInt(daysMatch[1]) : undefined }
}

export default function HeroAISearch() {
  const router = useRouter()
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const go = (q: string) => {
    if (!q.trim()) { router.push('/marketplace'); return }
    setLoading(true)
    setTimeout(() => {
      const { category, location } = parse(q)
      const params = new URLSearchParams()
      params.set('q', q)
      if (category) params.set('category', category)
      if (location)  params.set('location', location.charAt(0).toUpperCase() + location.slice(1))
      router.push(`/marketplace?${params}`)
    }, 600)
  }

  return (
    <div className="max-w-2xl w-full">
      {/* Main input */}
      <div className="relative">
        <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-2xl border border-white/20">
          {/* AI badge + input */}
          <div className="flex-1 flex items-center gap-3 px-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs font-bold text-purple-600 hidden sm:block">AI</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go(query)}
              onFocus={() => setShowHints(true)}
              onBlur={() => setTimeout(() => setShowHints(false), 180)}
              placeholder='Try: "I need a forklift for 3 days in Hamburg"'
              className="flex-1 text-gray-900 text-sm outline-none placeholder:text-gray-400 bg-transparent py-2 min-w-0"
            />
            {query && (
              <button onClick={() => setQuery('')} className="shrink-0 text-gray-300 hover:text-gray-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={() => go(query)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-colors shadow-sm whitespace-nowrap disabled:opacity-70"
          >
            {loading
              ? <><Loader className="w-4 h-4 animate-spin" />Thinking…</>
              : <><Sparkles className="w-4 h-4" />Search <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        {/* Hints dropdown */}
        {showHints && !query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2">
              ✨ Try asking in plain language…
            </p>
            {HINTS.map(hint => (
              <button key={hint} onMouseDown={() => { setQuery(hint); go(hint) }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-3">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{hint}</span>
              </button>
            ))}
            <div className="border-t border-gray-100 px-4 py-2 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] text-gray-400">AI understands equipment type, location, duration &amp; more</span>
            </div>
          </div>
        )}
      </div>

      {/* Example chips below */}
      <div className="flex flex-wrap gap-2 mt-3">
        {['Forklift · 3 days', 'LED Display · Hamburg', 'Generator · outdoor', 'Scissor Lift'].map(chip => (
          <button
            key={chip}
            onMouseDown={() => { setQuery(chip); go(chip) }}
            className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 px-3 py-1.5 rounded-full transition-colors"
          >
            {chip}
          </button>
        ))}
        <button
          onMouseDown={() => router.push('/marketplace')}
          className="text-xs text-white/60 hover:text-white/90 px-3 py-1.5 underline underline-offset-2 transition-colors"
        >
          Browse all →
        </button>
      </div>
    </div>
  )
}
