'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Zap, Star, MapPin, ChevronRight, X } from 'lucide-react'

interface Product { id: string; title: string; price_per_day: number; location: string; images?: string[]; category?: string }

interface Props {
  products: Product[]
  userName?: string
  companyName?: string
}

const AI_REASONS = [
  'Matches your industry: Events & Exhibitions',
  'Popular with businesses in your city',
  'Frequently booked together with your last rental',
  'Trending in your equipment category this month',
  'Top-rated by B2B renters similar to you',
]

export default function AIMatchingPanel({ products, userName, companyName }: Props) {
  const [loading, setLoading]     = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useEffect(() => {
    if (products.length === 0) return
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [products])

  if (dismissed || products.length === 0) return null

  const picks = products.slice(0, 3)

  return (
    <div className="bg-gradient-to-r from-purple-900 to-brand-900 rounded-2xl p-5 mb-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-gray-900" />
          </div>
          <div>
            <p className="font-bold text-sm flex items-center gap-2">
              ✨ AI Picks for {companyName ?? 'You'}
              <span className="text-[10px] font-semibold bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full">DEMO</span>
            </p>
            <p className="text-purple-300 text-xs mt-0.5">
              Personalised recommendations based on your booking history &amp; industry
            </p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1 text-purple-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[0,1,2].map(i => (
            <div key={i} className="bg-white/10 rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {picks.map((product, i) => (
              <Link key={product.id} href={`/marketplace/${product.id}`}
                className="group bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-3 transition-all relative"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}>
                {/* Match score badge */}
                <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {95 - i * 7}% match
                </div>
                {/* Image */}
                <div className="relative w-full h-20 rounded-lg overflow-hidden bg-white/10 mb-2">
                  {product.images?.[0]
                    ? <Image src={product.images[0]} alt={product.title} fill className="object-cover" unoptimized />
                    : <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">No image</div>
                  }
                </div>
                <p className="text-xs font-semibold text-white line-clamp-2 leading-tight">{product.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-2.5 h-2.5 text-purple-300" />
                  <span className="text-[10px] text-purple-300">{product.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs font-bold text-yellow-300">€{product.price_per_day}/day</p>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                    <span className="text-[10px] text-purple-300">4.8</span>
                  </div>
                </div>

                {/* AI reason tooltip */}
                {hoveredIdx === i && (
                  <div className="absolute -top-10 left-0 right-0 bg-gray-900 text-white text-[10px] px-2 py-1.5 rounded-lg shadow-lg z-10 border border-gray-700">
                    🤖 {AI_REASONS[i % AI_REASONS.length]}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-purple-400">
              🤖 Model trained on platform bookings · Phase 2 feature · Currently showing demo suggestions
            </p>
            <Link href="/ai-features" className="flex items-center gap-1 text-xs text-purple-300 hover:text-white transition-colors">
              How it works <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
