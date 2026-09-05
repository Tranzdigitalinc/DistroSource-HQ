import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Archivo, JetBrains_Mono } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { MotionProvider } from '@/components/motion/motion-provider'
import { ScrollToTop } from '@/components/scroll-to-top'
import { CartDrawerProvider } from '@/components/cart/cart-drawer'
import { ResizeObserverErrorGuard } from '@/components/resize-observer-error-guard'
import { VisitorTracker } from '@/components/analytics/visitor-tracker'
import { ScrollProgress } from '@/components/velora/scroll-progress'
import './globals.css'

const _archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo', weight: ['400', '500', '600', '700', '800', '900'] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', weight: ['400', '500', '600', '700'] })

const ogImage = {
  url: '/og-distrosource.png',
  width: 1536,
  height: 1024,
  alt: 'DistroSource — All your digital needs, one source. UI/UX kits, business templates, 3D assets, presentation templates, icons, and fonts.',
}

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
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DistroSource — Everything Digital. One Source.',
    description: 'Shop templates, fonts, presentations, and digital products across every category — instant access after checkout.',
    images: [ogImage.url],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfbf8' },
    { media: '(prefers-color-scheme: dark)', color: '#211d19' },
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
      className={`bg-background ${_archivo.variable} ${_jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>
        <ResizeObserverErrorGuard />
        <ScrollProgress />
        <MotionProvider>
          <ThemeProvider>
            <TooltipProvider>
              <CartDrawerProvider>{children}</CartDrawerProvider>
            </TooltipProvider>
            <Toaster position="bottom-right" richColors />
            <ScrollToTop />
          </ThemeProvider>
        </MotionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
