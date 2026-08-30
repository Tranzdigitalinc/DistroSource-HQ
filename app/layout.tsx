import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import { CurrencyProvider } from '@/lib/currency-context'
import { ThemeProvider } from '@/components/theme-provider'
import { getCountries } from '@/lib/queries/catalog'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  axes: ['opsz', 'SOFT', 'WONK'],
})

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
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const countries = await getCountries()

  return (
    <html
      lang="en"
      className={`dark bg-background ${_inter.variable} ${_fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          <CurrencyProvider countries={countries}>
            <TooltipProvider>{children}</TooltipProvider>
          </CurrencyProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
