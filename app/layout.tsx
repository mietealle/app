import type { Metadata } from 'next'
import './globals.css'
import DemoBanner from '@/components/layout/DemoBanner'

export const metadata: Metadata = {
  title: 'Mietealle — B2B Industrial Equipment Rental',
  description: 'The marketplace for renting industrial equipment. Forklifts, generators, displays and more — rent by the day.',
  keywords: 'industrial equipment rental, B2B rental marketplace, forklift hire, generator rental',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <DemoBanner />
      </body>
    </html>
  )
}
