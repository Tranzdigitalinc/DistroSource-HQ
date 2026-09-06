"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { BrandLogo } from "@/components/brand-logo"
import { subscribeToNewsletter } from "@/lib/actions/newsletter"
import { ArrowRight, Check, Mail, ShieldCheck } from "@/lib/storefront-icons"
import { trackWhopEvent } from "@/lib/whop-pixel"

const groups = [
  {
    title: "Discover",
    links: [
      ["All products", "/products"],
      ["Departments", "/categories"],
      ["New releases", "/products?sort=newest"],
      ["Deals", "/deals"],
      ["Gaming", "/gaming"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Help center", "/help"],
      ["Licensing", "/licenses"],
      ["Team licensing", "/team-licensing"],
      ["Contact", "/contact"],
      ["Support", "/account/support"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Orders", "/account/orders"],
      ["My library", "/account/library"],
      ["Wishlist", "/account/wishlist"],
      ["Sign in", "/sign-in"],
    ],
  },
]

function Newsletter() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!email.trim()) return
    startTransition(async () => {
      try {
        await subscribeToNewsletter(email)
        trackWhopEvent("newsletter_subscribe", { email: email.trim().toLowerCase(), event_id: `footer-v4-${Date.now()}` })
        setSent(true)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not subscribe")
      }
    })
  }

  if (sent) {
    return <p className="flex h-14 items-center gap-2 rounded-full border border-white/15 px-5 text-sm text-white/70"><Check size={15} className="text-primary" /> You&apos;re on the list.</p>
  }

  return (
    <form onSubmit={submit} className="flex h-14 w-full max-w-md items-center rounded-full border border-white/15 bg-white/[0.04] p-1.5 focus-within:border-white/30">
      <Mail size={16} className="ml-3 shrink-0 text-white/40" />
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        placeholder="Email for new drops"
        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/35"
      />
      <button type="submit" disabled={pending} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-60" aria-label="Subscribe">
        {pending ? "…" : <ArrowRight size={15} />}
      </button>
    </form>
  )
}

export function V4Footer() {
  return (
    <footer className="bg-[oklch(0.105_0.015_255)] text-white">
      <div className="mx-auto max-w-[1540px] px-4 pb-8 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="grid gap-14 border-b border-white/10 pb-14 lg:grid-cols-[1.25fr_0.75fr] lg:pb-20">
          <div>
            <BrandLogo heightClassName="h-10 sm:h-11" />
            <h2 className="mt-8 max-w-3xl font-display text-[clamp(2.4rem,5vw,5rem)] font-black leading-[0.9] tracking-[-0.065em]">
              One source for what
              <span className="block text-white/28">you build next.</span>
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/50">
              Premium digital resources for business, design, development, gaming and everyday creative work.
            </p>
            <div className="mt-8"><Newsletter /></div>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:pt-2">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-white/35">{group.title}</p>
                <ul className="mt-5 space-y-3.5">
                  {group.links.map(([label, href]) => (
                    <li key={href}><Link href={href} className="text-sm text-white/65 transition-colors hover:text-white">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-5 pt-7 text-[11px] text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} DistroSource</span>
            <Link href="/legal/terms" className="hover:text-white">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/legal/refund-policy" className="hover:text-white">Refunds</Link>
          </div>
          <p className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-primary" /> Secure digital commerce</p>
        </div>
      </div>
    </footer>
  )
}
