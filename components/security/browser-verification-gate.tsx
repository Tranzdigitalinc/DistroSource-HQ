'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const COOKIE_NAME = 'distrosource_browser_verified'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function hasVerificationCookie() {
  return document.cookie.split('; ').some((cookie) => cookie.startsWith(`${COOKIE_NAME}=`))
}

export function BrowserVerificationGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState(false)
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    setVerified(hasVerificationCookie())
    setReady(true)
  }, [])

  function verifyBrowser() {
    setChecking(true)
    window.setTimeout(() => {
      document.cookie = `${COOKIE_NAME}=1; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax; Secure`
      setVerified(true)
      setChecking(false)
    }, 450)
  }

  if (!ready || verified) return <>{children}</>

  return (
    <main className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-background px-5 py-8 text-foreground">
      <section className="flex w-full max-w-md flex-col items-center gap-6 text-center" aria-labelledby="browser-check-title">
        <div className="relative flex h-40 w-full max-w-xl items-center justify-center px-4">
          <span className="absolute inset-0 animate-pulse rounded-md border-2 border-primary/30" aria-hidden="true" />
          <Image src="/images/distro-source-logo.png" alt="DistroSource — Digital Products. Endless Possibilities." width={2172} height={724} className="relative h-auto w-full object-contain dark:hidden" loading="lazy" />
          <Image src="/images/distro-source-logo-dark.png" alt="DistroSource — Digital Products. Endless Possibilities." width={2172} height={724} aria-hidden="true" className="relative hidden h-auto w-full object-contain dark:block" loading="lazy" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">DistroSource security</p>
          <h1 id="browser-check-title" className="text-2xl font-semibold tracking-tight text-balance">Checking your browser</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">This quick check helps us keep DistroSource safe from automated traffic. It only happens on your first visit.</p>
        </div>
        <button type="button" onClick={verifyBrowser} disabled={checking} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70">
          {checking ? 'Verifying browser…' : 'Verify and continue'}
        </button>
        <p className="text-xs text-muted-foreground">No account or personal information is required.</p>
      </section>
    </main>
  )
}
