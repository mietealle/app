'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { categories, locations } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { Search, MapPin, Star, SlidersHorizontal, CheckCircle, X } from 'lucide-react'

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All Categories')
  const [location, setLocation] = useState('All Locations')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== 'All Categories') params.set('category', category)
    if (location !== 'All Locations')   params.set('location', location.replace('All Locations',''))
    if (onlyAvailable)                  params.set('available', 'true')
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [category, location, onlyAvailable])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const filtered = products.filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.vendor?.company?.toLowerCase().includes(search.toLowerCase())
  )

  const hasFilters = category !== 'All Categories' || location !== 'All Locations' || onlyAvailable || search
  const clearFilters = () => { setSearch(''); setCategory('All Categories'); setLocation('All Locations'); setOnlyAvailable(false) }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header + filters */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Browse Equipment</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search equipment or vendor..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[160px]">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={location} onChange={e => setLocation(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[140px]">
              {locations.map(l => <option key={l}>{l}</option>)}
            </select>
            <button onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-lg transition-colors whitespace-nowrap ${onlyAvailable ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400'}`}>
              <CheckCircle className="w-4 h-4" />Available Now
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg hover:border-red-200 bg-white">
                <X className="w-3.5 h-3.5" />Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-72 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No equipment found</p>
            <p className="text-gray-400 text-sm mt-1">{hasFilters ? 'Try adjusting your filters' : 'No active listings yet'}</p>
            {hasFilters && <button onClick={clearFilters} className="mt-3 text-sm text-brand-600 hover:underline">Clear all filters</button>}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Showing <span className="font-semibold text-gray-900">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''}
              {category !== 'All Categories' && <> in <span className="font-semibold text-gray-900">{category}</span></>}
              {location !== 'All Locations'   && <> near <span className="font-semibold text-gray-900">{location}</span></>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(product => (
                <Link key={product.id} href={`/marketplace/${product.id}`}>
                  <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {product.images?.[0]
                        ? <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                        : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                      }
                      {!product.available && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-full">Currently Unavailable</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${product.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {product.available ? '● Available' : '○ Booked'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium text-brand-700">
                        {product.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-brand-600">{product.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3 shrink-0" />{product.location}
                        <span>·</span><span className="text-brand-600 font-medium truncate">{product.vendor?.company ?? ''}</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4">{product.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div>
                          <span className="text-xl font-bold text-gray-900">{formatCurrency(product.price_per_day)}</span>
                          <span className="text-xs text-gray-400">/day</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /><span className="font-medium">4.8</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Min. {product.min_rental_days} day{product.min_rental_days > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
