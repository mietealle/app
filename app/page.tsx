import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroAISearch from '@/components/ai/HeroAISearch'
import { mockProducts, categories } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowRight, Search, Shield, Clock, Star, CheckCircle,
  MapPin, Zap, Users, TrendingUp, ChevronRight
} from 'lucide-react'

export default function HomePage() {
  const featuredProducts = mockProducts.slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-brand-900 to-brand-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-600 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Germany's #1 B2B Industrial Equipment Marketplace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Rent Industrial Equipment.<br />
              <span className="text-brand-300">Pay Only for the Days You Need.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl">
              Access forklifts, generators, display boards, and 500+ categories of industrial equipment — directly from verified vendors across Germany. No ownership. No maintenance. Just results.
            </p>

            {/* ✨ AI Search bar */}
            <HeroAISearch />

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mt-8 text-sm text-gray-400">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> KYC Verified Vendors</div>
              <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-400" /> Insured Transactions</div>
              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-yellow-400" /> Rent from 1 day</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Equipment Listings' },
              { value: '120+', label: 'Verified Vendors' },
              { value: '800+', label: 'B2B Rentals Done' },
              { value: '15', label: 'Cities Covered' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-brand-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {categories.slice(1).map((cat) => (
              <Link
                key={cat}
                href={`/marketplace?category=${encodeURIComponent(cat)}`}
                className="shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all whitespace-nowrap"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Equipment</h2>
              <p className="text-gray-500 mt-1">Top-rated listings from verified vendors</p>
            </div>
            <Link href="/marketplace" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/marketplace/${product.id}`}>
                <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!product.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">Unavailable</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{product.location}</span>
                      <span>·</span>
                      <span>{product.vendorName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(product.pricePerDay)}</span>
                        <span className="text-sm text-gray-500">/day</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                        4.8 (12)
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">How Mietealle Works</h2>
            <p className="text-gray-500 mt-2">Three steps to rent industrial equipment for your business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Register & Verify',
                desc: 'Create your business account and complete our quick KYC verification using your government documents.',
                color: 'bg-brand-50 text-brand-600',
              },
              {
                step: '02',
                icon: Search,
                title: 'Find Equipment',
                desc: 'Browse 500+ verified listings. Filter by category, location, availability, and daily rate.',
                color: 'bg-orange-50 text-orange-600',
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Book & Rent',
                desc: 'Select your dates, request a booking, and coordinate directly with the vendor. That\'s it.',
                color: 'bg-green-50 text-green-600',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-gray-100">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA split */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor CTA */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 text-white">
              <div className="mb-4">
                <Image src="/logo.png" alt="Mietealle" width={48} height={48} className="rounded-xl" unoptimized />
              </div>
              <h3 className="text-xl font-bold mb-2">List Your Equipment</h3>
              <p className="text-brand-200 text-sm mb-6">Turn idle industrial assets into revenue. List for free and get bookings from verified businesses.</p>
              <Link href="/vendor/register" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-50 transition-colors">
                Become a Vendor <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Renter CTA */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rent Without Commitment</h3>
              <p className="text-gray-400 text-sm mb-6">No long-term contracts. Rent exactly what you need, for exactly how long you need it — from verified vendors.</p>
              <Link href="/renter/register" className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-500 transition-colors">
                Start Renting <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
