import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Mietealle" width={32} height={32} className="rounded-lg" unoptimized />
              <span className="text-xl font-bold text-white">miete<span className="text-brand-400">alle</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Germany's B2B marketplace for industrial equipment rental. Trusted by businesses across Europe.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Browse Equipment</Link></li>
              <li><Link href="/vendor/register" className="hover:text-white transition-colors">Become a Vendor</Link></li>
              <li><Link href="/renter/register" className="hover:text-white transition-colors">Start Renting</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2024 Mietealle GmbH. All rights reserved.</p>
          <p className="text-xs">Made in Hamburg 🇩🇪</p>
        </div>
      </div>
    </footer>
  )
}
