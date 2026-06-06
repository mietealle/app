import type { Metadata } from 'next'
import './globals.css'
import DemoBanner from '@/components/layout/DemoBanner'

export const metadata: Metadata = {
  title: 'Mietealle — B2B Industrial Equipment Rental',
  description:
    'The marketplace for renting industrial equipment. Forklifts, generators, displays and more — rent by the day.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <DemoBanner />
      </body>
    </html>
  )
}

// import type { Metadata } from 'next'
// import './globals.css'
// import DemoBanner from '@/components/layout/DemoBanner'

// export const metadata: Metadata = {
//   title: 'Mietealle — B2B Industrial Equipment Rental',
//   description: 'The marketplace for renting industrial equipment. Forklifts, generators, displays and more — rent by the day.',
//   keywords: 'industrial equipment rental, B2B rental marketplace, forklift hire, generator rental',
//   // favicon.ico in the app/ directory is auto-detected by Next.js — no explicit icons config needed
// }

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//        <link rel="icon" href="/favicon.ico" sizes="any" />
//       <head>
//         {/* Explicit fallback for browsers that don't pick up app/favicon.ico */}
//         <link rel="icon" href="/favicon.ico" sizes="any" />
//         <link rel="shortcut icon" href="/favicon.ico" />
//       </head>
//       <body>
//         {children}
//         <DemoBanner />
//       </body>
//     </html>
//   )
// }
