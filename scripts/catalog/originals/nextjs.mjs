// Emits a real, runnable Next.js 15 App Router project for the "nextjs"
// products. The components render the same sections as the static preview
// (same design tokens, same copy), so the cover image is an honest picture
// of what the starter ships.
import { esc } from "./themes.mjs"

const tsx = (s) => s

function toJsx(html) {
  // The static preview uses plain HTML strings; the Next components below
  // are hand-written TSX, so nothing is transformed here. Kept for clarity.
  return html
}

export function buildNextProject(p, ctx, css) {
  const site = p.site
  const brand = p.brand
  const files = {}

  files["package.json"] = JSON.stringify(
    {
      name: p.slug,
      version: "1.0.0",
      private: true,
      scripts: { dev: "next dev", build: "next build", start: "next start", lint: "next lint" },
      dependencies: { next: "^15.3.0", react: "^19.0.0", "react-dom": "^19.0.0" },
      devDependencies: { typescript: "^5.6.0", "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0", "@types/node": "^22.0.0" },
    },
    null,
    2,
  )
  files["tsconfig.json"] = JSON.stringify(
    {
      compilerOptions: { target: "ES2022", lib: ["dom", "dom.iterable", "esnext"], allowJs: false, skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "preserve", incremental: true, plugins: [{ name: "next" }], paths: { "@/*": ["./*"] } },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    },
    null,
    2,
  )
  files["next.config.ts"] = `import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

export default nextConfig
`
  files["next-env.d.ts"] = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`
  files[".gitignore"] = `node_modules\n.next\nout\n.env*.local\n`
  files["app/globals.css"] = css
  files["site.config.ts"] = `// Everything that changes per project lives here. Components read from it.
export const site = {
  name: ${JSON.stringify(brand)},
  tagline: ${JSON.stringify(site.lede)},
  url: "https://example.com",
  nav: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  cta: { label: "Get started", href: "#pricing" },
  hero: {
    eyebrow: ${JSON.stringify(site.eyebrow)},
    headline: ${JSON.stringify(site.headline.replace(/<\/?em>/g, ""))},
    lede: ${JSON.stringify(site.lede)},
    pills: ${JSON.stringify(site.pills)},
  },
  benefits: ${JSON.stringify(site.benefits.map((b) => ({ title: b.title, body: b.body })), null, 2)},
  how: ${JSON.stringify(site.how, null, 2)},
  plans: ${JSON.stringify(site.plans.map((pl) => ({ name: pl.name, price: pl.price, period: pl.period, body: pl.body, items: pl.items, featured: pl.featured })), null, 2)},
  faq: ${JSON.stringify(site.faq, null, 2)},
  cta: ${JSON.stringify(site.cta)},
} as const
`
  files["app/layout.tsx"] = `import type { Metadata } from "next"
import "./globals.css"
import { site } from "@/site.config"

export const metadata: Metadata = {
  title: { default: site.name, template: \`%s — \${site.name}\` },
  description: site.tagline,
  metadataBase: new URL(site.url),
  openGraph: { title: site.name, description: site.tagline, url: site.url, siteName: site.name, type: "website" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=${ctx.font[2]}&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
`
  files["app/page.tsx"] = `import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Pricing } from "@/components/pricing"
import { Faq } from "@/components/faq"
import { CtaBand } from "@/components/cta-band"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </>
  )
}
`
  files["app/sitemap.ts"] = `import type { MetadataRoute } from "next"
import { site } from "@/site.config"

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }]
}
`
  files["components/icon.tsx"] = `const PATHS: Record<string, string> = {
  check: "M5 12.5l4.5 4.5L19 7.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  menu: "M4 7h16M4 12h16M4 17h16",
}

export function Icon({ name, size = 18 }: { name: keyof typeof PATHS; size?: number }) {
  return (
    <svg className="ic" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}
`
  files["components/header.tsx"] = `"use client"

import { useState } from "react"
import { site } from "@/site.config"
import { Icon } from "./icon"

export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className={"site-header" + (open ? " is-open" : "")}>
      <div className="container">
        <a className="brand" href="/"><span className="brand-mark" />{site.name}</a>
        <nav className="nav" aria-label="Primary">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <div className="header-cta"><a className="btn btn-primary btn-sm" href={site.cta.href}>{site.cta.label}<Icon name="arrow" size={16} /></a></div>
        <button className="menu-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}><Icon name="menu" size={20} /></button>
      </div>
    </header>
  )
}
`
  files["components/hero.tsx"] = `import { site } from "@/site.config"
import { Icon } from "./icon"

export function Hero() {
  return (
    <section className="hero hero-center">
      <div className="hero-glow" /><div className="hero-glow two" />
      <div className="container">
        <span className="eyebrow">{site.hero.eyebrow}</span>
        <h1>{site.hero.headline}</h1>
        <p className="lede">{site.hero.lede}</p>
        <div className="actions">
          <a className="btn btn-primary btn-lg" href="#pricing">{site.cta.label}<Icon name="arrow" /></a>
          <a className="btn btn-secondary btn-lg" href="#features">See what's inside</a>
        </div>
        <div className="pill-list" style={{ justifyContent: "center" }}>
          {site.hero.pills.map((p) => (<span className="pill" key={p}><Icon name="check" size={14} />{p}</span>))}
        </div>
        <div className="hero-art" aria-hidden="true">
          {/* Replace with a product screenshot or keep the placeholder frame. */}
          <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--muted)" }}>Your product screenshot</div>
        </div>
      </div>
    </section>
  )
}
`
  files["components/features.tsx"] = `import { site } from "@/site.config"

export function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-head center"><span className="eyebrow">What you get</span><h2>Built to launch, made to keep</h2></div>
        <div className="grid grid-3">
          {site.benefits.map((b) => (
            <div className="card" key={b.title}><h3>{b.title}</h3><p>{b.body}</p></div>
          ))}
        </div>
      </div>
    </section>
  )
}
`
  files["components/how-it-works.tsx"] = `import { site } from "@/site.config"

export function HowItWorks() {
  return (
    <section className="section soft" id="how">
      <div className="container">
        <div className="split" style={{ alignItems: "start" }}>
          <div className="section-head" style={{ margin: 0 }}><span className="eyebrow">How it works</span><h2>Three steps, no surprises</h2></div>
          <ol className="steps" style={{ padding: 0, margin: 0 }}>
            {site.how.map((s) => (<li className="step" key={s.title}><div><h3>{s.title}</h3><p>{s.body}</p></div></li>))}
          </ol>
        </div>
      </div>
    </section>
  )
}
`
  files["components/pricing.tsx"] = `import { site } from "@/site.config"
import { Icon } from "./icon"

export function Pricing() {
  return (
    <section className="section" id="pricing">
      <div className="container">
        <div className="section-head center"><span className="eyebrow">Pricing</span><h2>Simple, transparent plans</h2></div>
        <div className={"grid grid-" + site.plans.length}>
          {site.plans.map((pl) => (
            <div className={"card plan" + (pl.featured ? " featured" : "")} key={pl.name}>
              {pl.featured && <span className="badge">Most popular</span>}
              <h3 style={{ marginTop: pl.featured ? ".9rem" : 0 }}>{pl.name}</h3>
              <p>{pl.body}</p>
              <div className="price" style={{ margin: "1rem 0 .25rem" }}>{pl.price}<small>{pl.period}</small></div>
              <ul className="check-list">{pl.items.map((i) => (<li key={i}><Icon name="check" /><span>{i}</span></li>))}</ul>
              <a className={"btn " + (pl.featured ? "btn-primary" : "btn-secondary")} href="#">Choose {pl.name}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
`
  files["components/faq.tsx"] = `import { site } from "@/site.config"

export function Faq() {
  return (
    <section className="section soft" id="faq">
      <div className="container">
        <div className="split" style={{ alignItems: "start" }}>
          <div className="section-head" style={{ margin: 0 }}><span className="eyebrow">FAQ</span><h2>Questions, answered</h2></div>
          <div className="faq">
            {site.faq.map((item, i) => (
              <details key={item.q} open={i === 0}><summary>{item.q}</summary><p>{item.a}</p></details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
`
  files["components/cta-band.tsx"] = `import { site } from "@/site.config"

export function CtaBand() {
  return (
    <section className="section tight">
      <div className="container">
        <div className="cta-band">
          <div><h2>{site.cta.title}</h2><p>{site.cta.body}</p></div>
          <div className="actions"><a className="btn btn-primary btn-lg" href="#pricing">Get started</a></div>
        </div>
      </div>
    </section>
  )
}
`
  files["components/footer.tsx"] = `import { site } from "@/site.config"

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div><a className="brand" href="/"><span className="brand-mark" />{site.name}</a><p className="muted" style={{ marginTop: "1rem", maxWidth: "34ch" }}>{site.tagline}</p></div>
          <div><h4>Product</h4><ul>{site.nav.map((n) => (<li key={n.href}><a href={n.href}>{n.label}</a></li>))}</ul></div>
          <div><h4>Company</h4><ul><li><a href="#">About</a></li><li><a href="#">Careers</a></li><li><a href="#">Contact</a></li></ul></div>
          <div><h4>Legal</h4><ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
        </div>
        <div className="legal"><span>© {new Date().getFullYear()} {site.name}</span><span>Built with the {site.name} starter.</span></div>
      </div>
    </footer>
  )
}
`
  files["README.md"] = `# ${brand} — Next.js starter

${site.lede}

## Quick start

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000. Edit \`site.config.ts\` to change the name, navigation, copy, plans and FAQ — every component reads from it. Colours, radius and type live at the top of \`app/globals.css\`.

## What's inside

- Next.js 15 App Router, React 19, TypeScript (strict)
- Typed site config (\`site.config.ts\`)
- Components: header (with mobile menu), hero, features, how-it-works, pricing, FAQ, CTA band, footer
- Metadata, Open Graph and sitemap wired up
- Plain CSS design tokens — no framework to configure
- \`preview/index.html\`: a static render of the homepage, useful for design reviews without running Node

## Deploy

Works on Vercel, Netlify or any Node host: \`npm run build && npm start\`.

## Licence

Sold under the DistroSource licence tier you purchased. Sample copy and names are placeholders — replace them with your own.
`
  return files
}

export { tsx, toJsx, esc }
