"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { BrandLogo } from "@/components/brand-logo"
import { subscribeToNewsletter } from "@/lib/actions/newsletter"
import { ArrowRight, Check } from "@/lib/storefront-icons"

const columns = [
  { title: "Discover", links: [{ label: "All products", href: "/products" }, { label: "Departments", href: "/categories" }, { label: "Gaming", href: "/gaming" }, { label: "Deals", href: "/deals" }] },
  { title: "Resources", links: [{ label: "Help center", href: "/help" }, { label: "Licensing", href: "/licenses" }, { label: "Team licensing", href: "/team-licensing" }, { label: "Contact", href: "/contact" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "FAQ", href: "/faq" }, { label: "Privacy", href: "/legal/privacy" }, { label: "Terms", href: "/legal/terms" }] },
]

export function V5Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const result = await subscribeToNewsletter(email)
      if (result.success) {
        setSubscribed(true)
        setEmail("")
      } else toast.error(result.error ?? "Could not subscribe")
    })
  }

  return (
    <footer className="bg-[#0c1522] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <BrandLogo href="/" heightClassName="h-9 brightness-0 invert" />
            <h2 className="mt-8 max-w-3xl font-display text-[clamp(2.7rem,5vw,5.4rem)] font-black leading-[0.88] tracking-[-0.07em]">Better digital products for better work.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/48">Curated tools, templates, systems and assets for business, design, development and gaming.</p>
          </div>
          <div className="lg:justify-self-end lg:w-full lg:max-w-lg">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Fresh drops, useful updates</p>
            <p className="mt-3 text-sm leading-6 text-white/55">A concise email when there’s actually something worth seeing.</p>
            {subscribed ? (
              <div className="mt-5 flex items-center gap-2 border border-white/10 bg-white/[0.05] px-4 py-4 text-sm"><Check size={15} className="text-primary" /> You’re on the list.</div>
            ) : (
              <form onSubmit={submit} className="mt-5 flex border border-white/15 bg-white/[0.04] p-1.5">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/30" />
                <button type="submit" disabled={pending} className="flex h-11 items-center gap-2 bg-white px-4 text-sm font-bold text-[#111827] disabled:opacity-60">Join <ArrowRight size={14} /></button>
              </form>
            )}
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="hidden lg:block"><p className="max-w-xs text-xs leading-6 text-white/35">DistroSource is a global digital department store for original and licensed digital products.</p></div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.13em] text-white/35">{column.title}</p>
              <div className="mt-4 space-y-2.5">{column.links.map((link) => <Link key={link.href} href={link.href} className="block text-sm text-white/68 transition-colors hover:text-white">{link.label}</Link>)}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-white/30 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} DistroSource</span><span>DIGITAL PRODUCTS · ENDLESS POSSIBILITIES.</span></div>
      </div>
    </footer>
  )
}
