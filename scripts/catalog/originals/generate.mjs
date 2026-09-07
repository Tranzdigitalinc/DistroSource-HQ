// Turns a catalog entry into a complete template: pages, stylesheet, script
// and README — plus the listing copy the store shows. Run directly to write
// every product into .catalog-build/<slug>/ for rendering and packaging.
import fs from "node:fs"
import path from "node:path"
import { PALETTES, FONTS, esc, tileArt, icon } from "./themes.mjs"
import { baseCss, dashboardCss, storeCss, mainJs } from "./ds-css.mjs"
import * as S from "./sections.mjs"
import { buildNextProject } from "./nextjs.mjs"
import { PRODUCTS } from "./catalog.mjs"

export const BUILD_DIR = path.resolve(".catalog-build")

export function themeFor(p) {
  const [bg, surface, text, muted, accent, accent2, mode] = PALETTES[p.palette]
  return { bg, surface, text, muted, accent, accent2, mode }
}

function makeCtx(p, rel = "") {
  const t = themeFor(p)
  return {
    p: { ...p.site, brand: p.brand, metaDescription: p.tagline, footerBlurb: (p.site.lede ?? p.tagline).split(". ")[0] + "." },
    t,
    font: FONTS[p.font],
    seed: p.slug,
    rel,
    chartData: p.site.chart?.values,
  }
}

function heroEditorial(ctx, site, primary, secondary) {
  return `<section class="hero">
  <div class="hero-glow"></div>
  <div class="container">
    <span class="eyebrow">${esc(site.eyebrow)}</span>
    <h1 style="max-width:14ch">${site.headline}</h1>
    <div class="split" style="align-items:end;margin-top:1rem">
      <p class="lede" style="margin:0">${esc(site.lede)}</p>
      <div class="actions" style="margin:0;justify-content:flex-end"><a class="btn btn-primary btn-lg" href="${ctx.rel}${primary.href}">${esc(primary.label)}${icon("arrow", 18)}</a><a class="btn btn-secondary btn-lg" href="${ctx.rel}${secondary.href}">${secondary.label}</a></div>
    </div>
    ${site.stats ? S.statStrip(site.stats) : ""}
    <div class="hero-art reveal" style="aspect-ratio:21/9;margin-top:2.5rem">${tileArt(ctx.seed + "editorial", ctx.t.accent, ctx.t.accent2, { w: 1200, h: 514, label: "" })}</div>
  </div>
</section>
`
}

/* ------------------------------------------------------------------ */
/* Website                                                             */
/* ------------------------------------------------------------------ */

const PAGE_LABEL = { about: "About", services: "Services", pricing: "Pricing", gallery: "Gallery", contact: "Contact" }

function websiteFiles(p) {
  const site = p.site
  const ctx = makeCtx(p)
  const pages = [{ file: "index.html", label: "Home" }, ...site.pages.map((k) => ({ file: `${k}.html`, label: PAGE_LABEL[k] }))]
  const hdr = (cur) => S.header(ctx, pages, cur, { cta: site.plans ? "Book now" : "Get in touch" })
  const ftr = S.footer(ctx, pages)
  const primary = { label: site.plans ? "Book now" : "Get in touch", href: "contact.html" }
  const hasGallery = site.pages.includes("gallery") && site.gallery
  const secondary = { label: hasGallery ? "Our work" : "Our services", href: hasGallery ? "gallery.html" : site.pages.includes("services") ? "services.html" : "about.html" }

  let hero
  if (p.hero === "center") hero = S.heroCenter(ctx, { eyebrow: site.eyebrow, title: site.headline, lede: site.lede, primary, secondary, pills: site.pills })
  else if (p.hero === "editorial") hero = heroEditorial(ctx, site, primary, secondary)
  else hero = S.heroSplit(ctx, { eyebrow: site.eyebrow, title: site.headline, lede: site.lede, primary, secondary, pills: site.pills, stats: site.stats, flip: p.hero === "flip" })

  const files = {}
  files["index.html"] =
    S.head(ctx, "Home") + hdr("index.html") + hero +
    S.mediaCards(ctx, site.services.slice(0, 6).map((sv) => ({ ...sv, href: site.pages.includes("services") ? "services.html" : "about.html" })), { eyebrow: "What we do", title: `${p.brand}, at a glance`, lede: `Six things a ${p.vertical} website has to explain well. Each links to a fuller page.` }) +
    S.about(ctx, { ...site.about, cta: { label: "More about us", href: "about.html" } }) +
    S.steps(ctx, site.steps, { title: "How it works" }) +
    (site.gallery ? S.gallery(ctx, { title: "Recent work", labels: site.gallery }) : "") +
    S.quotes(ctx, site.quotes) +
    S.faq(ctx, site.faq.slice(0, 3)) +
    S.ctaBand(ctx, { ...site.cta, primary: { label: primary.label, href: "contact.html" }, secondary: { label: "Call us", href: "contact.html" } }) +
    ftr + S.tail(ctx)

  files["about.html"] =
    S.head(ctx, "About") + hdr("about.html") + S.pageHero(ctx, { title: `About ${p.brand}`, lede: site.about.title }) +
    S.about(ctx, { ...site.about, flip: true }) +
    S.team(ctx, ["Founder", "Lead", "Coordinator", "Specialist"]) +
    S.quotes(ctx, site.quotes) +
    S.ctaBand(ctx, { ...site.cta, primary }) + ftr + S.tail(ctx)

  if (site.pages.includes("services"))
    files["services.html"] =
      S.head(ctx, "Services") + hdr("services.html") + S.pageHero(ctx, { title: "Services", lede: `Everything ${p.brand} offers, explained without jargon.` }) +
      S.features(ctx, site.services, { eyebrow: "Services", title: "What we offer", center: false }) +
      S.steps(ctx, site.steps, { title: "What to expect" }) +
      S.faq(ctx, site.faq) +
      S.ctaBand(ctx, { ...site.cta, primary }) + ftr + S.tail(ctx)

  if (site.pages.includes("pricing") && site.plans)
    files["pricing.html"] =
      S.head(ctx, "Pricing") + hdr("pricing.html") + S.pageHero(ctx, { title: "Pricing", lede: "Clear prices, no surprises. Everything else is quoted before any work starts." }) +
      S.pricing(ctx, site.plans, { title: "Plans and packages", soft: false }) +
      S.faq(ctx, site.faq, { soft: true }) +
      S.ctaBand(ctx, { ...site.cta, primary }) + ftr + S.tail(ctx)

  if (site.pages.includes("gallery") && site.gallery)
    files["gallery.html"] =
      S.head(ctx, "Gallery") + hdr("gallery.html") + S.pageHero(ctx, { title: "Gallery", lede: "A selection of recent work. Replace these tiles with your own photography." }) +
      S.gallery(ctx, { title: "Selected work", count: 9, labels: [...site.gallery, ...site.gallery] }) +
      S.ctaBand(ctx, { ...site.cta, primary }) + ftr + S.tail(ctx)

  files["contact.html"] =
    S.head(ctx, "Contact") + hdr("contact.html") + S.pageHero(ctx, { title: "Contact", lede: "Questions, bookings and quotes. We reply within one business day." }) +
    S.contact(ctx, { ...site.contact, lede: site.cta.body }) + ftr + S.tail(ctx)

  files["css/style.css"] = baseCss({ ...ctx.t, radius: p.radius, fontDisplay: ctx.font[0], fontBody: ctx.font[1] })
  files["js/main.js"] = mainJs
  return { files, preview: "index.html", pages: Object.keys(files).filter((f) => f.endsWith(".html")) }
}

/* ------------------------------------------------------------------ */
/* Landing page                                                        */
/* ------------------------------------------------------------------ */

function landingFiles(p, { asPreview = false } = {}) {
  const site = p.site
  const ctx = makeCtx(p)
  const pages = [{ file: "index.html#features", label: "Features" }, { file: "index.html#how", label: "How it works" }, { file: "index.html#pricing", label: "Pricing" }, { file: "index.html#faq", label: "FAQ" }]
  const ftrPages = [{ file: "index.html", label: "Home" }, { file: "contact.html", label: "Contact" }]
  const primary = { label: "Get started", href: "#pricing" }
  const files = {}
  files["index.html"] =
    S.head(ctx, "Home") + S.header(ctx, pages, "", { cta: "Get started", ctaHref: "index.html#pricing" }) +
    S.heroCenter(ctx, { eyebrow: site.eyebrow, title: site.headline, lede: site.lede, primary, secondary: { label: "See how it works", href: "#how" }, pills: site.pills }) +
    `<div id="features"></div>` + S.features(ctx, site.benefits, { eyebrow: "What you get", title: "Everything you need, nothing you don't" }) +
    `<div id="how"></div>` + S.steps(ctx, site.how, { title: "Up and running in minutes" }) +
    S.pricing(ctx, site.plans, { title: "Simple, transparent pricing", lede: "Start free. Upgrade when it earns its keep.", soft: false }) +
    S.quotes(ctx, site.quotes, { title: "From people who use it" }) +
    `<div id="faq"></div>` + S.faq(ctx, site.faq, { soft: true }) +
    S.ctaBand(ctx, { ...site.cta, primary: { label: "Get started", href: "#pricing" }, secondary: { label: "Talk to us", href: "contact.html" } }) +
    S.footer(ctx, ftrPages) + S.tail(ctx)
  files["contact.html"] =
    S.head(ctx, "Contact") + S.header(ctx, pages, "", { cta: "Get started", ctaHref: "index.html#pricing" }) +
    S.pageHero(ctx, { title: "Talk to us", lede: "Sales, support and partnerships. We reply within one business day." }) +
    S.contact(ctx, { address: "Remote-first · registered in Your City", phone: "+1 (555) 012-0000", email: `hello@${p.brand.toLowerCase().replace(/[^a-z]/g, "")}.example`, hours: "Mon–Fri 9am–6pm", title: "Say hello", lede: site.cta.body }) +
    S.footer(ctx, ftrPages) + S.tail(ctx)
  files["css/style.css"] = baseCss({ ...ctx.t, radius: p.radius, fontDisplay: ctx.font[0], fontBody: ctx.font[1] })
  files["js/main.js"] = mainJs
  return { files, preview: "index.html", pages: ["index.html", "contact.html"], css: files["css/style.css"], ctx }
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

function dashboardFiles(p) {
  const site = p.site
  const ctx = makeCtx(p)
  const nav = site.nav.map((g) => ({ group: g.group, items: g.items.map(([icon, label, file]) => ({ icon, label, file })) }))
  const wrap = (title, body) => S.head(ctx, title, { extraCss: ["dashboard.css"], body: "dash" }) + body + S.tail(ctx)
  const rowsWithPills = (rows) => rows.map((r) => r.map((c) => (Array.isArray(c) ? S.statusPill(c[1], c[0]) : esc(c))))

  const files = {}
  files["index.html"] = wrap(site.title, S.dashShell(ctx, {
    nav, current: "index.html", title: site.title, subtitle: site.subtitle,
    actions: `<a class="btn btn-secondary btn-sm" href="#">Last 30 days</a>`,
    body: S.kpis(site.kpis) + `<div class="two-col">${S.chartPanel(ctx, site.chart)}${S.breakdownPanel(ctx, site.breakdown)}</div>` + S.tablePanel(ctx, { ...site.table, rows: rowsWithPills(site.table.rows) }),
  }))
  files[site.page2.file] = wrap(site.page2.title, S.dashShell(ctx, {
    nav, current: site.page2.file, title: site.page2.title, subtitle: site.page2.subtitle,
    actions: `<a class="btn btn-secondary btn-sm" href="#">Filter</a><a class="btn btn-secondary btn-sm" href="#">Export CSV</a>`,
    body: S.chartPanel(ctx, site.page2.chart) + S.tablePanel(ctx, { ...site.page2.table, rows: rowsWithPills(site.page2.table.rows) }),
  }))
  files["settings.html"] = wrap("Settings", S.dashShell(ctx, { nav, current: "settings.html", title: "Settings", subtitle: "Workspace, team and notification preferences.", body: S.settingsBody(ctx, site.settings) }))
  files["css/style.css"] = baseCss({ ...ctx.t, radius: p.radius, fontDisplay: ctx.font[0], fontBody: ctx.font[1] })
  files["css/dashboard.css"] = dashboardCss
  files["js/main.js"] = mainJs
  return { files, preview: "index.html", pages: ["index.html", site.page2.file, "settings.html"] }
}

/* ------------------------------------------------------------------ */
/* Storefront                                                          */
/* ------------------------------------------------------------------ */

function storeFiles(p) {
  const site = p.site
  const ctx = makeCtx(p)
  const pages = [{ file: "shop.html", label: "Shop" }, { file: "product.html", label: "Featured" }, { file: "about.html", label: "About" }, { file: "cart.html", label: "Cart" }]
  const hdr = (cur) => S.promoBar(site.promo) + S.header(ctx, pages, cur, { cta: "Cart (3)", ctaHref: "cart.html" })
  const ftr = S.footer(ctx, [{ file: "index.html", label: "Home" }, ...pages, { file: "contact.html", label: "Contact" }])
  const wrap = (title, body) => S.head(ctx, title, { extraCss: ["store.css"] }) + body + S.tail(ctx)
  const featured = site.products[site.pdp]

  const files = {}
  files["index.html"] = wrap("Home", hdr("index.html") +
    S.storeHero(ctx, { eyebrow: site.eyebrow, title: site.headline, lede: site.lede, primary: { label: "Shop the collection", href: "shop.html" }, secondary: { label: "Our story", href: "about.html" } }) +
    S.catTiles(ctx, site.cats) +
    S.productGrid(ctx, site.products.slice(0, 8), { title: "New arrivals", eyebrow: "Featured" }) +
    S.trustRow(site.trust) +
    S.about(ctx, { eyebrow: "Our story", title: `Why ${p.brand}`, paragraphs: site.about, cta: { label: "Read more", href: "about.html" } }) +
    S.ctaBand(ctx, { title: "Join the list", body: "New products, restocks and studio news, once a fortnight. No spam.", primary: { label: "Subscribe", href: "contact.html" } }) +
    ftr)
  files["shop.html"] = wrap("Shop", hdr("shop.html") + S.pageHero(ctx, { title: "Shop", lede: `Everything from ${p.brand}, filtered your way.` }) +
    `<section class="section tight"><div class="container row" style="justify-content:space-between"><div class="row">${site.cats.map((c, i) => `<a class="btn btn-${i === 0 ? "primary" : "secondary"} btn-sm" href="#">${esc(c)}</a>`).join("")}</div><span class="muted">Sort: Newest</span></div></section>` +
    S.productGrid(ctx, site.products, { title: "All products", eyebrow: `${site.products.length} items` }) + S.trustRow(site.trust) + ftr)
  files["product.html"] = wrap(featured.name, hdr("product.html") + S.pdp(ctx, featured, { desc: site.pdpDesc, bullets: site.pdpBullets }) +
    S.productGrid(ctx, site.products.filter((_, i) => i !== site.pdp).slice(0, 4), { title: "You may also like", eyebrow: "Pairs well", soft: true }) + ftr)
  files["cart.html"] = wrap("Cart", hdr("cart.html") + S.cartPage(ctx, site.products) + S.trustRow(site.trust) + ftr)
  files["about.html"] = wrap("About", hdr("about.html") + S.pageHero(ctx, { title: `About ${p.brand}`, lede: site.about[0] }) + S.about(ctx, { eyebrow: "Our story", title: "Made with care", paragraphs: site.about, flip: true }) + S.gallery(ctx, { title: "Behind the scenes", count: 6 }) + ftr)
  files["contact.html"] = wrap("Contact", hdr("contact.html") + S.pageHero(ctx, { title: "Contact", lede: "Orders, wholesale and press." }) + S.contact(ctx, { address: "Studio & shop, 5 Market Row, Your City", phone: "+1 (555) 013-0000", email: `hello@${p.brand.toLowerCase().replace(/[^a-z]/g, "")}.example`, hours: "Mon–Sat 10am–6pm", lede: "We reply within one business day." }) + ftr)
  files["css/style.css"] = baseCss({ ...ctx.t, radius: p.radius, fontDisplay: ctx.font[0], fontBody: ctx.font[1] })
  files["css/store.css"] = storeCss
  files["js/main.js"] = mainJs
  return { files, preview: "index.html", pages: Object.keys(files).filter((f) => f.endsWith(".html")) }
}

/* ------------------------------------------------------------------ */
/* Next.js starter                                                     */
/* ------------------------------------------------------------------ */

function nextjsFiles(p) {
  const landing = landingFiles(p)
  const project = buildNextProject(p, landing.ctx, landing.css)
  const files = { ...project }
  files["preview/index.html"] = landing.files["index.html"]
    .replace(/href="css\//g, 'href="../css/')
    .replace(/src="js\//g, 'src="../js/')
    // The preview is a single file: keep in-page anchors, neutralise page links.
    .replace(/href="(?:index|contact|about)\.html(#[a-z]+)?"/g, (m, hash) => `href="${hash || "#"}"`)
  files["css/style.css"] = landing.css
  files["js/main.js"] = mainJs
  return { files, preview: "preview/index.html", pages: ["app/page.tsx"] }
}

/* ------------------------------------------------------------------ */
/* README + listing copy                                               */
/* ------------------------------------------------------------------ */

function readme(p, gen) {
  const pages = gen.pages.join(", ")
  return `${p.name}
${"=".repeat(p.name.length)}

${p.tagline}

Pages: ${pages}

Getting started
---------------
1. Unzip and open index.html in a browser — no build step, no dependencies.
2. Edit the design tokens at the top of css/style.css (colours, radius, fonts).
3. Replace the sample copy, contact details and illustration blocks with your own.
4. Wire the contact form (see js/main.js) to your backend or form service.

Everything in this template is original DistroSource work: the layout, the
stylesheet, the script and the generated illustrations. Names, quotes and
figures are sample content — replace them before you go live.

Version 1.0.0 — initial release.
Support: support@distrosource.example
`
}

export function listingFor(p, gen, zipBytes) {
  const site = p.site
  const kind = p.kind
  const isNext = kind === "nextjs"
  const isDash = kind === "dashboard"
  const isStore = kind === "store"
  const pageList = gen.pages.map((f) => f.replace(".html", "").replace("index", "Home").replace(/^\w/, (c) => c.toUpperCase()))

  const overview = p.pitch && p.pitch.length ? p.pitch : isNext
    ? [`${p.brand} is a Next.js 15 App Router starter for a ${p.vertical.replace(/ starter$/, "")}. It ships as a real project — typed site config, components for every section, metadata and sitemap wired up — with the same design you see in the preview.`, `Colours, radius and type live in one CSS file; copy, plans and FAQ live in one typed config. Rename, retheme, deploy.`]
    : isDash
      ? [`${p.brand} is an admin dashboard template built for ${p.vertical.replace(/ dashboard$/, "")}: a sidebar shell, KPI cards, charts, status tables and a settings page, all in plain HTML, CSS and JavaScript.`, `The sample data is written for the domain — ${site.kpis.map((k) => k[0]).join(", ")} — so the layout reads as a finished product, not a placeholder.`]
      : isStore
        ? [`${p.brand} is a storefront template for a ${p.vertical}: home, shop grid, product page with variants, cart and about pages, styled with a ${p.palette} palette and generated product artwork you can replace with photography.`, `It is a complete front end ready to connect to the commerce platform of your choice; buttons and forms are wired for progressive enhancement.`]
        : kind === "landing"
          ? [`${p.brand} is a landing page template for a ${p.vertical}: an app-window hero, a benefits grid, a three-step explainer, three pricing tiers, sample quotes and a FAQ, plus a contact page.`, `The copy is written for the product category so the page converts as a starting point, not just as a wireframe.`]
          : [`${p.brand} is a multi-page website template for a ${p.vertical}. ${p.tagline}`, `${site.about.paragraphs[0]}`]

  const bestFor = isNext
    ? [`Teams launching a ${p.vertical.replace(/ starter$/, "")} on Next.js`, "Developers who want typed config instead of a CMS on day one", "Agencies with a house design system to plug in", "Anyone who needs a fast, accessible site without a CSS framework"]
    : isDash
      ? [`Product teams building ${p.vertical.replace(/ dashboard$/, "")} software`, "Developers who need a finished UI shell to wire to an API", "Internal tools that need to look like real software", "Prototypes and investor demos with realistic data"]
      : isStore
        ? [`A ${p.vertical} moving off a marketplace to its own site`, "Makers who need a storefront front end for their commerce platform", "Agencies building shops for small brands", "Anyone who wants product pages with variants done properly"]
        : kind === "landing"
          ? [`A ${p.vertical} preparing to launch`, "Founders validating pricing before building", "Marketing teams who need a page that reads as finished", "Agencies delivering launch pages fast"]
          : [`A ${p.vertical} that needs a credible site quickly`, "Owners replacing a dated or unmaintained website", "Freelancers delivering a small site on a fixed budget", "Developers who want a clean structural starting point"]

  const features = isNext
    ? ["Next.js 15 App Router with React 19 and strict TypeScript", "Typed site.config.ts drives navigation, copy, pricing and FAQ", "Header with mobile menu, hero, features, how-it-works, pricing, FAQ, CTA band and footer components", "Metadata, Open Graph and sitemap generated from config", "Plain CSS design tokens with dark-mode-ready palette", "Accessible markup with focus states and reduced-motion support", "Static preview of the homepage included for design reviews", "No CSS framework, no runtime CSS-in-JS"]
    : isDash
      ? ["Sidebar shell with grouped navigation and user card", "Topbar with search, notifications and a primary action", "Four KPI cards with deltas", "Line, bar and donut charts as inline SVG (no chart library)", "Status tables with tone-coded pills", "Second data page and a full settings page", "Responsive down to phone width with a collapsing sidebar", "Design tokens at the top of the stylesheet"]
      : isStore
        ? ["Promo bar, header with cart action and mobile menu", "Storefront hero, category tiles and product grid", "Product page with gallery thumbnails, colour swatches, size variants and quantity stepper", "Cart page with summary and checkout button", "Trust row and about page", "Generated product artwork placeholders sized for real photography", "Dependency-free JavaScript for variants, thumbnails and quantity", "Responsive grid from one to four columns"]
        : kind === "landing"
          ? ["App-window hero built in CSS and SVG, with your product's KPIs", "Six-benefit grid with icons", "Three-step how-it-works section", "Three pricing tiers with a highlighted plan", "Sample quotes and FAQ accordion", "CTA band and contact page with demo form", "Anchor navigation with a mobile menu", "Design tokens for one-file retheming"]
          : [`Homepage that leads with the ${p.vertical}'s core offer`, `${pageList.length} pages: ${pageList.join(", ")}`, "Services grid with generated artwork tiles", "About section with checklist and team cards", "Process steps, FAQ accordion and sample quotes", site.plans ? "Pricing page with three packages" : "Gallery page with nine tiles", "Contact page with details and a demo form", "Mobile menu, reveal-on-scroll and form validation in one small script"]

  const get = isNext
    ? ["A complete Next.js project (app/, components/, site.config.ts, package.json)", "app/globals.css with the design system", "README with setup and deployment notes", "preview/index.html static render"]
    : [`${gen.pages.length} HTML pages`, "css/style.css design system" + (isDash ? " and css/dashboard.css" : isStore ? " and css/store.css" : ""), "js/main.js progressive enhancement", "README.txt with setup notes"]

  const compat = isNext ? ["Node.js 18+", "Next.js 15", "Any host that runs Node or static export"] : ["Any modern browser", "Static hosting (Netlify, Vercel, S3, cPanel)", "Works without a build step"]
  const requirements = isNext ? ["Node.js 18 or newer", "npm, pnpm or yarn", "Basic React familiarity to add sections"] : ["A text editor", "A static host or any web server", "No build tools required"]
  const howTo = isNext
    ? ["Unzip and run npm install, then npm run dev", "Edit site.config.ts — name, navigation, copy, plans, FAQ", "Adjust tokens at the top of app/globals.css", "Replace the hero placeholder with a product screenshot", "Deploy with npm run build to Vercel, Netlify or your own host"]
    : ["Unzip and open index.html — it works from a folder", "Change the design tokens at the top of css/style.css", "Replace sample text, contact details and prices", "Swap the generated artwork tiles for your photography", "Connect the form in js/main.js to your form service or backend"]
  const customization = isNext
    ? ["All colours, radius and fonts are CSS custom properties", "Sections are independent components; reorder in app/page.tsx", "Add a page by adding a route under app/", "Swap the font pairing by changing one Google Fonts link"]
    : ["All colours, radius and fonts are CSS custom properties", "Sections are self-contained blocks that can be reordered or removed", "Icons are inline SVG; swap any glyph in place", "Swap the font pairing by changing one Google Fonts link"]

  const description = [
    "## Overview", ...overview, "",
    "## Best for", ...bestFor.map((b) => `- ${b}`), "",
    "## Key features", ...features.map((b) => `- ${b}`), "",
    "## What you'll get", ...get.map((b) => `- ${b}`), "",
    "## Compatibility", ...compat.map((b) => `- ${b}`), "",
    "## Requirements", ...requirements.map((b) => `- ${b}`), "",
    "## How to use it", ...howTo.map((b, i) => `${i + 1}. ${b}`), "",
    "## Customization", ...customization.map((b) => `- ${b}`), "",
    "## Licence",
    "- **Personal** — for your own private, non-commercial projects. Not for client work.",
    "- **Commercial** — for one commercial project or one client project.",
    "- **Agency** — for multiple client projects, up to the limits stated on this page.",
    "No tier permits reselling or redistributing the files themselves.", "",
    "## Support",
    `Questions about ${p.brand} are handled through your DistroSource account — open a support ticket from the order and include your order number.`,
  ].join("\n")

  const tags = Array.from(new Set([kind === "nextjs" ? "next.js" : "html", kind === "nextjs" ? "react" : "css", p.vertical, p.categoryName.toLowerCase(), p.subcategory.toLowerCase(), "template", p.palette, isDash ? "dashboard" : isStore ? "ecommerce" : kind === "landing" ? "landing page" : kind === "nextjs" ? "starter" : "website"]))
  const includedFiles = Object.keys(gen.files).filter((f) => !f.startsWith("preview/") || isNext).slice(0, 24)

  return {
    description,
    features,
    tags,
    includedFiles,
    fileFormats: isNext ? ["TSX", "TS", "CSS", "JSON"] : ["HTML", "CSS", "JS"],
    softwareCompatibility: compat,
    fileSizeMb: Math.max(0.05, Math.round((zipBytes / 1024 / 1024) * 100) / 100),
    documentation: `README included. Setup follows the five steps under "How to use it". Verified in current Chrome, Firefox and Safari${isNext ? " with Next.js 15" : ""}.`,
    changelog: "1.0.0 — Initial release.",
    seoTitle: `${p.name} | DistroSource`,
    seoDescription: p.tagline,
    searchKeywords: Array.from(new Set([...tags, ...p.name.toLowerCase().split(/[^a-z0-9.]+/).filter((w) => w.length > 2), p.brand.toLowerCase()])),
  }
}

/* ------------------------------------------------------------------ */

export function generateProduct(p) {
  const gen = { website: websiteFiles, landing: landingFiles, dashboard: dashboardFiles, store: storeFiles, nextjs: nextjsFiles }[p.kind](p)
  if (p.kind !== "nextjs") gen.files["README.txt"] = readme(p, gen)
  return gen
}

export function writeProduct(p) {
  const gen = generateProduct(p)
  const dir = path.join(BUILD_DIR, p.slug)
  // Replace generated output only; keep the rendered cover and QA shots.
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir)) {
      if (entry === "cover.png" || entry === "qa") continue
      fs.rmSync(path.join(dir, entry), { recursive: true, force: true })
    }
  }
  for (const [file, content] of Object.entries(gen.files)) {
    const full = path.join(dir, file)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content)
  }
  return { ...gen, dir }
}

if (process.argv[1] && process.argv[1].endsWith("generate.mjs")) {
  const only = process.argv.slice(2)
  const list = only.length ? PRODUCTS.filter((p) => only.includes(p.slug) || only.includes(String(p.index))) : PRODUCTS
  for (const p of list) {
    const gen = writeProduct(p)
    console.log(`${p.sku} ${p.slug}: ${Object.keys(gen.files).length} files`)
  }
}
