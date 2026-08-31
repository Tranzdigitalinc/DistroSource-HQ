import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Geist } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import { CurrencyProvider } from '@/lib/currency-context'
import { ThemeProvider } from '@/components/theme-provider'
import { MotionProvider } from '@/components/motion/motion-provider'
import { getCountries } from '@/lib/queries/catalog'
import { ScrollToTop } from '@/components/scroll-to-top'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'RedeemCove — Gift Cards, Game Top-Ups & Digital Codes',
  description:
    'Shop gift cards, game top-ups, mobile recharges, and software licenses from trusted brands worldwide. Instant digital delivery, every time.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#07102d' },
    { media: '(prefers-color-scheme: dark)', color: '#07102d' },
  ],
}

export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let countries: Awaited<ReturnType<typeof getCountries>> = []
  try {
    countries = await getCountries()
  } catch {
    // DB unavailable at build time — CurrencyProvider falls back to USD
  }

  return (
    <html
      lang="en"
      className={`dark bg-background ${_inter.variable} ${_geist.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <MotionProvider>
          <ThemeProvider>
            <CurrencyProvider countries={countries}>
              <TooltipProvider>{children}</TooltipProvider>
            </CurrencyProvider>
            <Toaster position="bottom-right" richColors />
            <ScrollToTop />
          </ThemeProvider>
        </MotionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
