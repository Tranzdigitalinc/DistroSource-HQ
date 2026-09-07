import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import { Archivo, JetBrains_Mono } from 'next/font/google'  /* whop pixel */

const whopPixelSnippet = `!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_5BaPYIQF5B1TiB");whop.track("page");`  /* exact Whop-provided snippet */

import { TooltipProvider } from '@/components/ui/tooltip'
import { CartDrawerProvider } from '@/components/cart/cart-drawer-provider'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SearchProvider } from '@/components/header/search-command'
import { LenisProvider } from '@/components/motion/lenis-provider'
import NextTopLoader from 'nextjs-toploader'
import { BrandCurtain } from '@/components/motion/brand-curtain'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { MotionProvider } from '@/components/motion/motion-provider'
import { ScrollToTop } from '@/components/scroll-to-top'
import { ResizeObserverErrorGuard } from '@/components/resize-observer-error-guard'
import { VisitorTracker } from '@/components/analytics/visitor-tracker'
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
    { media: '(prefers-color-scheme: light)', color: '#fbfaf7' },
    { media: '(prefers-color-scheme: dark)', color: '#151a24' },
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
        <Script id="whop-pixel" strategy="afterInteractive">
          {whopPixelSnippet}
        </Script>
        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>
        <ResizeObserverErrorGuard />
        <NextTopLoader color="var(--primary)" height={2} showSpinner={false} shadow={false} />
        <BrandCurtain />
        <MotionProvider>
          <ThemeProvider>
            <TooltipProvider>
              <CartDrawerProvider>
                <SearchProvider>
                  <LenisProvider>{children}</LenisProvider>
                  <CartDrawer />
                </SearchProvider>
              </CartDrawerProvider>
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
