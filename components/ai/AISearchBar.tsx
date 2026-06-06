'use client'
import { useState, useRef } from 'react'
import { Sparkles, Search, X, Loader, ChevronDown } from 'lucide-react'
import Link from 'next/link'

// ── Mock AI parse result ───────────────────────────────────────────────────
interface ParsedQuery {
  keywords: string[]
  category?: string
  location?: string
  days?: number
  available?: boolean
  interpretation: string   // human-readable summary of what AI understood
}

const CATEGORY_MAP: { keywords: string[]; category: string }[] = [
  { keywords: ['forklift', 'lift truck', 'pallet', 'lifting'],       category: 'Material Handling' },
  { keywords: ['display', 'led', 'screen', 'board', 'monitor'],      category: 'Display & Visual'  },
  { keywords: ['generator', 'power', 'energy', 'diesel', 'fuel'],    category: 'Power & Energy'    },
  { keywords: ['scissor', 'boom', 'access', 'platform', 'height'],   category: 'Access Equipment'  },
  { keywords: ['sound', 'audio', 'speaker', 'pa system', 'music'],   category: 'Audio & Visual'    },
  { keywords: ['excavator', 'crane', 'drill', 'bulldozer', 'concrete'], category: 'Construction'  },
  { keywords: ['helmet', 'safety', 'harness', 'protection', 'ppe'],  category: 'Safety Equipment'  },
]

const CITIES = ['hamburg', 'berlin', 'munich', 'frankfurt', 'cologne', 'stuttgart', 'düsseldorf']

function parseNaturalQuery(raw: string): ParsedQuery {
  const q = raw.toLowerCase().trim()

  // Extract duration
  const daysMatch = q.match(/(\d+)\s*(day|days|tag|tage)/i)
  const days = daysMatch ? parseInt(daysMatch[1]) : undefined

  // Extract location
  const location = CITIES.find(c => q.includes(c))

  // Match category
  let category: string | undefined
  for (const { keywords, category: cat } of CATEGORY_MAP) {
    if (keywords.some(kw => q.includes(kw))) { category = cat; break }
  }

  // Extract remaining keywords (remove filler words)
  const fillerWords = ['i want', 'i need', 'looking for', 'find', 'search', 'give', 'show', 'me', 'a', 'an', 'the',
                       'for', 'in', 'at', 'to', 'and', 'or', 'with', 'only', 'that', 'please', 'days', 'day']
  const keywords = q.split(/\s+/).filter(w => w.length > 2 && !fillerWords.includes(w) && !/^\d+$/.test(w))

  // Build human-readable interpretation
  const parts: string[] = []
  if (keywords.length) parts.push(`"${keywords.slice(0, 4).join(' ')}"`)
  if (category)        parts.push(`in <strong>${category}</strong>`)
  if (location)        parts.push(`near <strong>${location.charAt(0).toUpperCase() + location.slice(1)}</strong>`)
  if (days)            parts.push(`for <strong>${days} day${days !== 1 ? 's' : ''}</strong>`)
  const interpretation = parts.length ? parts.join(' · ') : `"${raw}"`

  return { keywords, category, location: location ? location.charAt(0).toUpperCase() + location.slice(1) : undefined, days, interpretation }
}

// ── Props ──────────────────────────────────────────────────────────────────
interface Props {
  onSearch: (parsed: ParsedQuery & { raw: string }) => void
  onClear: () => void
  isActive: boolean
}

export default function AISearchBar({ onSearch, onClear, isActive }: Props) {
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed]   = useState<ParsedQuery | null>(null)
  const [showHints, setShowHints] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const HINTS = [
    'I want Electric Forklift for 3 days',
    'LED display board in Hamburg for 2 days',
    'Sound system for a conference',
    'Generator in Berlin, 5 days',
    'Scissor lift for indoor maintenance',
  ]

  const handleSearch = () => {
    if (!query.trim()) return
    setLoading(true)
    setShowHints(false)
    // Simulate AI processing delay
    setTimeout(() => {
      const result = parseNaturalQuery(query)
      setParsed(result)
      onSearch({ ...result, raw: query })
      setLoading(false)
    }, 700)
  }

  const handleClear = () => {
    setQuery('')
    setParsed(null)
    onClear()
    inputRef.current?.focus()
  }

  const applyHint = (hint: string) => {
    setQuery(hint)
    setShowHints(false)
    setTimeout(() => {
      const result = parseNaturalQuery(hint)
      setParsed(result)
      onSearch({ ...result, raw: hint })
    }, 50)
  }

  return (
    <div className="mb-4">
      {/* Main input row */}
      <div className="flex gap-2">
        {/* AI badge + input */}
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-purple-600 hidden sm:block">AI</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setParsed(null); if (!e.target.value) onClear() }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            onFocus={() => setShowHints(true)}
            onBlur={() => setTimeout(() => setShowHints(false), 200)}
            placeholder='Try: "I need a forklift for 3 days in Hamburg"'
            className="w-full pl-12 pr-10 py-3 text-sm border-2 border-purple-200 rounded-xl bg-white focus:outline-none focus:border-purple-500 shadow-sm placeholder:text-gray-400"
          />
          {query && (
            <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Hints dropdown */}
          {showHints && !query && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-1.5">✨ Try saying...</p>
              {HINTS.map(hint => (
                <button key={hint} onMouseDown={() => applyHint(hint)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  {hint}
                </button>
              ))}
              <div className="border-t border-gray-100 px-4 py-2 mt-1">
                <p className="text-[10px] text-gray-400">AI understands equipment type, location, duration &amp; availability</p>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSearch} disabled={!query.trim() || loading}
          className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap">
          {loading
            ? <><Loader className="w-4 h-4 animate-spin" />Thinking…</>
            : <><Search className="w-4 h-4" />Search</>}
        </button>
      </div>

      {/* AI interpretation chip */}
      {parsed && !loading && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span className="text-xs text-purple-700">
              AI understood: <span dangerouslySetInnerHTML={{ __html: parsed.interpretation }} />
            </span>
          </div>
          {parsed.days && (
            <span className="text-xs bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              📅 {parsed.days} day{parsed.days !== 1 ? 's' : ''}
            </span>
          )}
          {isActive && (
            <button onClick={handleClear}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <X className="w-3 h-3" />Clear AI filter
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export type { ParsedQuery }
