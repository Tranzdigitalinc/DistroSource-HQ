import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Inter, Geist } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { MotionProvider } from '@/components/motion/motion-provider'
import { ScrollToTop } from '@/components/scroll-to-top'
import { ResizeObserverErrorGuard } from '@/components/resize-observer-error-guard'
import { BrowserVerificationGate } from '@/components/security/browser-verification-gate'
import { VisitorTracker } from '@/components/analytics/visitor-tracker'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'DistroSource — Everything Digital. One Source.',
  description:
    'Shop website templates, fonts, presentations, Notion systems, 3D models, and more — one department store for digital products, with instant access to every download after purchase.',
  generator: 'v0.app',
  metadataBase: new URL('https://distrosource.com'),
  openGraph: {
    type: 'website',
    url: 'https://distrosource.com',
    siteName: 'DistroSource',
    title: 'DistroSource — Everything Digital. One Source.',
    description: 'Shop templates, fonts, presentations, and digital products across every category — instant access after checkout.',
    images: [
      {
        url: '/og-distrosource.jpg',
        width: 1200,
        height: 630,
        alt: 'DistroSource — a digital products department store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DistroSource — Everything Digital. One Source.',
    description: 'Shop templates, fonts, presentations, and digital products across every category — instant access after checkout.',
    images: ['/og-distrosource.jpg'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#080b18' },
    { media: '(prefers-color-scheme: dark)', color: '#080b18' },
  ],
}

export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${_inter.variable} ${_geist.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>
        <ResizeObserverErrorGuard />
        <MotionProvider>
          <ThemeProvider>
            <BrowserVerificationGate>
              <TooltipProvider>{children}</TooltipProvider>
            </BrowserVerificationGate>
            <Toaster position="bottom-right" richColors />
            <ScrollToTop />
          </ThemeProvider>
        </MotionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
