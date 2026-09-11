// HTML section builders shared by every generated template. Each function
// returns a string of markup that relies only on the design-system CSS.
import { avatar, barChart, donut, esc, heroArt, icon, lineChart, tileArt } from "./themes.mjs"

const SAMPLE_PEOPLE = ["Jordan Avery", "Priya Natarajan", "Mateo Ruiz", "Hannah Kowalski", "Samuel Okafor", "Lena Fischer", "Noor Haddad", "Elliot Brennan"]

export function head(ctx, title, { extraCss = [], body = "" } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} — ${esc(ctx.p.brand)}</title>
<meta name="description" content="${esc(ctx.p.metaDescription)}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=${ctx.font[2]}&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="${ctx.rel}css/style.css" />
${extraCss.map((c) => `<link rel="stylesheet" href="${ctx.rel}css/${c}" />`).join("\n")}
</head>
<body${body ? ` class="${body}"` : ""}>
`
}

export function tail(ctx) {
  return `<script src="${ctx.rel}js/main.js"></script>
</body>
</html>
`
}

export function header(ctx, pages, current, { cta = "Get started", ctaHref = "contact.html" } = {}) {
  return `<header class="site-header">
  <div class="container">
    <a class="brand" href="${ctx.rel}index.html"><span class="brand-mark"></span>${esc(ctx.p.brand)}</a>
    <nav class="nav" aria-label="Primary">
      ${pages.map((pg) => `<a href="${ctx.rel}${pg.file}"${pg.file === current ? ' aria-current="page"' : ""}>${esc(pg.label)}</a>`).join("\n      ")}
    </nav>
    <div class="header-cta"><a class="btn btn-primary btn-sm" href="${ctx.rel}${ctaHref}">${esc(cta)}${icon("arrow", 16)}</a></div>
    <button class="menu-toggle" aria-label="Open menu" aria-expanded="false">${icon("menu", 20)}</button>
  </div>
</header>
`
}

export function footer(ctx, pages, { blurb } = {}) {
  const cols = [
    { h: "Explore", items: pages.map((pg) => [pg.label, ctx.rel + pg.file]) },
    { h: "Company", items: [["About", pages.some((pg) => pg.file === "about.html") ? ctx.rel + "about.html" : "#"], ["Careers", "#"], ["Press", "#"], ["Contact", pages.some((pg) => pg.file === "contact.html") ? ctx.rel + "contact.html" : "#"]] },
    { h: "Legal", items: [["Privacy", "#"], ["Terms", "#"], ["Cookies", "#"]] },
  ]
  return `<footer class="site-footer">
  <div class="container">
    <div class="cols">
      <div>
        <a class="brand" href="${ctx.rel}index.html"><span class="brand-mark"></span>${esc(ctx.p.brand)}</a>
        <p class="muted" style="margin-top:1rem;max-width:34ch">${esc(blurb || ctx.p.footerBlurb)}</p>
      </div>
      ${cols.map((c) => `<div><h4>${c.h}</h4><ul>${c.items.map(([l, h]) => `<li><a href="${h}">${esc(l)}</a></li>`).join("")}</ul></div>`).join("\n      ")}
    </div>
    <div class="legal"><span>© ${new Date().getFullYear()} ${esc(ctx.p.brand)}. All rights reserved.</span><span>Built with the ${esc(ctx.p.brand)} template.</span></div>
  </div>
</footer>
`
}

export function heroSplit(ctx, { eyebrow, title, lede, primary, secondary, pills = [], stats, flip = false }) {
  const art = `<div class="hero-art reveal">${heroArt(ctx.seed + "hero", ctx.t.accent, ctx.t.accent2)}</div>`
  const copy = `<div>
      <span class="eyebrow">${esc(eyebrow)}</span>
      <h1>${title}</h1>
      <p class="lede">${esc(lede)}</p>
      <div class="actions">
        <a class="btn btn-primary btn-lg" href="${primary.href}">${esc(primary.label)}${icon("arrow", 18)}</a>
        ${secondary ? `<a class="btn btn-secondary btn-lg" href="${secondary.href}">${esc(secondary.label)}</a>` : ""}
      </div>
      ${pills.length ? `<div class="pill-list">${pills.map((p) => `<span class="pill">${icon("check", 14)}${esc(p)}</span>`).join("")}</div>` : ""}
    </div>`
  return `<section class="hero">
  <div class="hero-glow"></div><div class="hero-glow two"></div>
  <div class="container">
    <div class="split">${flip ? art + copy : copy + art}</div>
    ${stats ? statStrip(stats) : ""}
  </div>
</section>
`
}

export function heroCenter(ctx, { eyebrow, title, lede, primary, secondary, pills = [], art = true }) {
  return `<section class="hero hero-center">
  <div class="hero-glow"></div><div class="hero-glow two"></div>
  <div class="container">
    <span class="eyebrow">${esc(eyebrow)}</span>
    <h1>${title}</h1>
    <p class="lede">${esc(lede)}</p>
    <div class="actions">
      <a class="btn btn-primary btn-lg" href="${primary.href}">${esc(primary.label)}${icon("arrow", 18)}</a>
      ${secondary ? `<a class="btn btn-secondary btn-lg" href="${secondary.href}">${esc(secondary.label)}</a>` : ""}
    </div>
    ${pills.length ? `<div class="pill-list" style="justify-content:center">${pills.map((p) => `<span class="pill">${icon("check", 14)}${esc(p)}</span>`).join("")}</div>` : ""}
    ${art ? `<div class="hero-art reveal">${appWindow(ctx)}</div>` : ""}
  </div>
</section>
`
}

export function statStrip(stats) {
  return `<div class="stat-strip">${stats.map(([v, l]) => `<div><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join("")}</div>`
}

/** A CSS/SVG "app window" used in landing-page heroes. */
export function appWindow(ctx) {
  const a = ctx.t.accent, b = ctx.t.accent2
  const vals = ctx.chartData || [24, 31, 28, 39, 42, 38, 51, 57, 54, 66, 71, 78]
  return `<div style="background:var(--surface);height:100%;display:grid;grid-template-columns:200px 1fr;text-align:left">
  <div style="border-right:1px solid var(--border);padding:1rem;display:grid;gap:.4rem;align-content:start">
    <div style="display:flex;gap:6px;margin-bottom:.75rem"><i style="width:10px;height:10px;border-radius:50%;background:#ff5f57"></i><i style="width:10px;height:10px;border-radius:50%;background:#febc2e"></i><i style="width:10px;height:10px;border-radius:50%;background:#28c840"></i></div>
    ${["Overview", "Reports", "Customers", "Billing", "Settings"].map((l, i) => `<div style="padding:.5rem .7rem;border-radius:8px;font-size:.85rem;font-weight:500;${i === 0 ? `background:color-mix(in srgb,${a} 14%,transparent);color:${a}` : "color:var(--muted)"}">${l}</div>`).join("")}
  </div>
  <div style="padding:1.25rem;display:grid;gap:1rem;align-content:start">
    <div style="display:flex;justify-content:space-between;align-items:center"><strong style="font-family:var(--font-display);font-size:1.1rem">${esc(ctx.p.appTitle || "Overview")}</strong><span class="btn btn-primary btn-sm" style="pointer-events:none">${esc(ctx.p.appCta || "New report")}</span></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem">
      ${(ctx.p.appKpis || [["Active", "2,418", "+12%"], ["Revenue", "$48.2k", "+8%"], ["Retention", "94%", "+2%"]]).map(([l, v, d]) => `<div style="border:1px solid var(--border);border-radius:12px;padding:.8rem 1rem"><div style="font-size:.75rem;color:var(--muted)">${esc(l)}</div><div style="font-family:var(--font-display);font-weight:700;font-size:1.3rem">${esc(v)}</div><div style="font-size:.72rem;color:#16a34a;font-weight:600">${esc(d)}</div></div>`).join("")}
    </div>
    <div style="border:1px solid var(--border);border-radius:12px;padding:1rem;height:190px;color:var(--muted)">${lineChart(vals, a)}</div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:.75rem">
      <div style="border:1px solid var(--border);border-radius:12px;padding:1rem;display:grid;gap:.6rem">${[0.9, 0.7, 0.55, 0.35].map((w, i) => `<div style="display:flex;align-items:center;gap:.75rem;font-size:.8rem"><span style="width:70px;color:var(--muted)">${["North", "South", "East", "West"][i]}</span><span class="progress" style="flex:1"><span style="width:${w * 100}%;background:${i % 2 ? b : a}"></span></span></div>`).join("")}</div>
      <div style="border:1px solid var(--border);border-radius:12px;padding:.75rem;display:grid;place-items:center">${donut([44, 31, 25], [a, b, "#9ca3af"], { size: 110 })}</div>
    </div>
  </div>
</div>`
}

export function features(ctx, items, { eyebrow = "Why choose us", title, lede, cols = 3, soft = false, center = true } = {}) {
  return `<section class="section${soft ? " soft" : ""}">
  <div class="container">
    <div class="section-head${center ? " center" : ""}"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${lede ? `<p class="lede">${esc(lede)}</p>` : ""}</div>
    <div class="grid grid-${cols}">
      ${items.map((f) => `<div class="card reveal"><span class="ic-wrap">${icon(f.icon)}</span><h3>${esc(f.title)}</h3><p>${esc(f.body)}</p></div>`).join("\n      ")}
    </div>
  </div>
</section>
`
}

export function mediaCards(ctx, items, { eyebrow = "Services", title, lede, cols = 3, soft = false, seedKey = "svc" } = {}) {
  return `<section class="section${soft ? " soft" : ""}">
  <div class="container">
    <div class="section-head"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${lede ? `<p class="lede">${esc(lede)}</p>` : ""}</div>
    <div class="grid grid-${cols}">
      ${items.map((f, i) => `<a class="card card-media reveal" href="${f.href || "#"}"><div class="media">${tileArt(ctx.seed + seedKey + i, i % 2 ? ctx.t.accent2 : ctx.t.accent, i % 2 ? ctx.t.accent : ctx.t.accent2)}</div><div class="body"><h3>${esc(f.title)}</h3><p>${esc(f.body)}</p></div></a>`).join("\n      ")}
    </div>
  </div>
</section>
`
}

export function about(ctx, { eyebrow = "About", title, paragraphs, checks = [], flip = false, cta }) {
  const art = `<div class="hero-art reveal">${tileArt(ctx.seed + "about", ctx.t.accent2, ctx.t.accent, { w: 640, h: 480 })}</div>`
  const copy = `<div>
      <span class="eyebrow">${esc(eyebrow)}</span>
      <h2>${esc(title)}</h2>
      ${paragraphs.map((p) => `<p class="muted">${esc(p)}</p>`).join("")}
      ${checks.length ? `<ul class="check-list">${checks.map((c) => `<li>${icon("check")}<span>${esc(c)}</span></li>`).join("")}</ul>` : ""}
      ${cta ? `<div class="actions" style="margin-top:1.5rem"><a class="btn btn-secondary" href="${cta.href}">${esc(cta.label)}</a></div>` : ""}
    </div>`
  return `<section class="section"><div class="container"><div class="split">${flip ? art + copy : copy + art}</div></div></section>
`
}

export function steps(ctx, items, { eyebrow = "How it works", title, lede, soft = true } = {}) {
  return `<section class="section${soft ? " soft" : ""}">
  <div class="container">
    <div class="split" style="align-items:start">
      <div class="section-head" style="margin:0"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${lede ? `<p class="lede">${esc(lede)}</p>` : ""}</div>
      <ol class="steps" style="padding:0;margin:0">${items.map((s) => `<li class="step reveal"><div><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div></li>`).join("")}</ol>
    </div>
  </div>
</section>
`
}

export function gallery(ctx, { eyebrow = "Gallery", title, count = 6, labels = [] } = {}) {
  return `<section class="section">
  <div class="container">
    <div class="section-head"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2></div>
    <div class="gallery">${Array.from({ length: count }, (_, i) => `<div class="tile${i === 0 ? " tall" : ""} reveal">${tileArt(ctx.seed + "gal" + i, i % 3 === 0 ? ctx.t.accent : ctx.t.accent2, i % 3 === 0 ? ctx.t.accent2 : ctx.t.accent, { label: labels[i] || "" })}</div>`).join("")}</div>
  </div>
</section>
`
}

export function pricing(ctx, plans, { eyebrow = "Pricing", title, lede, soft = true } = {}) {
  return `<section class="section${soft ? " soft" : ""}" id="pricing">
  <div class="container">
    <div class="section-head center"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${lede ? `<p class="lede">${esc(lede)}</p>` : ""}</div>
    <div class="grid grid-${plans.length}">
      ${plans.map((pl) => `<div class="card plan reveal${pl.featured ? " featured" : ""}">
        ${pl.featured ? `<span class="badge">Most popular</span>` : ""}
        <h3 style="margin-top:${pl.featured ? ".9rem" : "0"}">${esc(pl.name)}</h3>
        <p>${esc(pl.body)}</p>
        <div class="price" style="margin:1rem 0 .25rem">${esc(pl.price)}<small>${esc(pl.period || "")}</small></div>
        <ul class="check-list">${pl.items.map((i) => `<li>${icon("check")}<span>${esc(i)}</span></li>`).join("")}</ul>
        <a class="btn ${pl.featured ? "btn-primary" : "btn-secondary"}" href="${pl.href || "#"}">${esc(pl.cta || "Choose plan")}</a>
      </div>`).join("\n      ")}
    </div>
  </div>
</section>
`
}

export function faq(ctx, items, { eyebrow = "FAQ", title = "Questions, answered", soft = false } = {}) {
  return `<section class="section${soft ? " soft" : ""}">
  <div class="container">
    <div class="split" style="align-items:start">
      <div class="section-head" style="margin:0"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2><p class="lede">Can't find what you're looking for? <a href="${ctx.rel}contact.html" style="color:var(--accent);font-weight:600">Get in touch</a>.</p></div>
      <div class="faq">${items.map((q, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join("")}</div>
    </div>
  </div>
</section>
`
}

export function quotes(ctx, items, { eyebrow = "Kind words", title = "What clients say", soft = true } = {}) {
  return `<section class="section${soft ? " soft" : ""}">
  <div class="container">
    <div class="section-head center"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2><p class="lede">Sample quotes — replace with your own customer feedback.</p></div>
    <div class="grid grid-3">${items.map((q, i) => `<div class="card quote reveal"><blockquote>“${esc(q.text)}”</blockquote><div class="who">${avatar(SAMPLE_PEOPLE[i % SAMPLE_PEOPLE.length], i % 2 ? ctx.t.accent2 : ctx.t.accent)}<div><strong>${esc(SAMPLE_PEOPLE[i % SAMPLE_PEOPLE.length])}</strong><small>${esc(q.role)}</small></div></div></div>`).join("")}</div>
  </div>
</section>
`
}

export function ctaBand(ctx, { title, body, primary, secondary }) {
  return `<section class="section tight">
  <div class="container">
    <div class="cta-band reveal">
      <div><h2>${esc(title)}</h2><p>${esc(body)}</p></div>
      <div class="actions"><a class="btn btn-primary btn-lg" href="${primary.href}">${esc(primary.label)}</a>${secondary ? `<a class="btn btn-secondary btn-lg" href="${secondary.href}">${esc(secondary.label)}</a>` : ""}</div>
    </div>
  </div>
</section>
`
}

export function contact(ctx, { address, phone, email, hours, title = "Let's talk", lede }) {
  return `<section class="section">
  <div class="container">
    <div class="split" style="align-items:start">
      <div>
        <span class="eyebrow">Contact</span>
        <h2>${esc(title)}</h2>
        <p class="lede">${esc(lede)}</p>
        <ul class="check-list" style="margin-top:2rem">
          <li>${icon("pin")}<span>${esc(address)}</span></li>
          <li>${icon("phone")}<span>${esc(phone)}</span></li>
          <li>${icon("mail")}<span>${esc(email)}</span></li>
          <li>${icon("clock")}<span>${esc(hours)}</span></li>
        </ul>
      </div>
      <form class="card form" data-demo-form>
        <div class="two"><div><label for="fn">First name</label><input class="input" id="fn" required placeholder="Jane" /></div><div><label for="ln">Last name</label><input class="input" id="ln" required placeholder="Doe" /></div></div>
        <div><label for="em">Email</label><input class="input" id="em" type="email" required placeholder="you@example.com" /></div>
        <div><label for="sub">How can we help?</label><select class="input" id="sub">${(ctx.p.contactTopics || ["General enquiry", "Book an appointment", "Pricing", "Something else"]).map((t) => `<option>${esc(t)}</option>`).join("")}</select></div>
        <div><label for="msg">Message</label><textarea class="input" id="msg" rows="4" placeholder="Tell us a little about what you need"></textarea></div>
        <button class="btn btn-primary btn-lg" type="submit">Send message${icon("arrow", 18)}</button>
        <p class="muted" data-form-note style="margin:0;font-size:.9rem">We reply within one business day.</p>
      </form>
    </div>
  </div>
</section>
`
}

export function pageHero(ctx, { title, lede, crumb }) {
  return `<section class="page-hero">
  <div class="container">
    <div class="breadcrumbs"><a href="${ctx.rel}index.html">Home</a> / ${esc(crumb || title)}</div>
    <h1>${esc(title)}</h1>
    ${lede ? `<p class="lede">${esc(lede)}</p>` : ""}
  </div>
</section>
`
}

export function team(ctx, members, { eyebrow = "Team", title = "The people behind the work" } = {}) {
  return `<section class="section">
  <div class="container">
    <div class="section-head"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2></div>
    <div class="grid grid-4">${members.map((m, i) => `<div class="card reveal" style="text-align:center"><div style="width:72px;height:72px;margin:0 auto 1rem">${avatar(SAMPLE_PEOPLE[(i + 2) % SAMPLE_PEOPLE.length], i % 2 ? ctx.t.accent : ctx.t.accent2)}</div><h3 style="font-size:1.05rem">${esc(SAMPLE_PEOPLE[(i + 2) % SAMPLE_PEOPLE.length])}</h3><p>${esc(m)}</p></div>`).join("")}</div>
  </div>
</section>
`
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export function dashShell(ctx, { nav, current, title, subtitle, actions = "", body }) {
  const groups = nav
  return `<div class="shell">
  <aside class="sidebar">
    <a class="brand" href="index.html"><span class="brand-mark"></span>${esc(ctx.p.brand)}</a>
    <nav class="side-nav" aria-label="Sidebar">
      ${groups.map((g) => `<div class="group">${esc(g.group)}</div>` + g.items.map((it) => `<a href="${it.file}"${it.file === current ? ' aria-current="page"' : ""}>${icon(it.icon, 18)}${esc(it.label)}</a>`).join("")).join("")}
    </nav>
    <div class="user">${avatar(SAMPLE_PEOPLE[0], ctx.t.accent)}<div><strong style="font-size:.9rem">${esc(SAMPLE_PEOPLE[0])}</strong><small>${esc(ctx.p.userRole || "Administrator")}</small></div></div>
  </aside>
  <div class="main">
    <header class="topbar">
      <button class="icon-btn menu-toggle-dash" aria-label="Open menu">${icon("menu", 18)}</button>
      <div class="search">${icon("search", 16)}<span>Search ${esc(ctx.p.searchHint || "anything")}…</span></div>
      <div class="actions"><button class="icon-btn" aria-label="Notifications">${icon("bell", 18)}</button><button class="icon-btn" aria-label="Help">${icon("chat", 18)}</button><a class="btn btn-primary btn-sm" href="#">${esc(ctx.p.primaryAction || "New")}</a></div>
    </header>
    <main class="content">
      <div class="content-head"><div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><div class="row">${actions}</div></div>
      ${body}
    </main>
  </div>
</div>
`
}

export function kpis(items) {
  return `<div class="kpis">${items.map(([label, value, delta, dir]) => `<div class="kpi"><div class="label">${esc(label)}</div><div class="value">${esc(value)}</div><div class="delta ${dir === "down" ? "down" : "up"}">${esc(delta)}</div></div>`).join("")}</div>`
}

export function chartPanel(ctx, { title, kind = "line", values, sub = "" }) {
  const chart = kind === "bar" ? barChart(values, ctx.t.accent, ctx.t.accent2) : lineChart(values, ctx.t.accent)
  return `<div class="panel"><div class="panel-head"><div><h3>${esc(title)}</h3>${sub ? `<div class="muted" style="font-size:.85rem">${esc(sub)}</div>` : ""}</div><span class="tag">Last 12 months</span></div><div class="chart">${chart}</div></div>`
}

export function breakdownPanel(ctx, { title, parts, labels }) {
  const colors = [ctx.t.accent, ctx.t.accent2, "#9ca3af", "#e5e7eb"]
  const total = parts.reduce((a, b) => a + b, 0)
  return `<div class="panel"><div class="panel-head"><h3>${esc(title)}</h3></div><div class="row" style="gap:1.5rem"><div>${donut(parts, colors, { size: 150 })}</div><ul class="legend" style="flex:1;padding:0;margin:0">${parts.map((p, i) => `<li><i style="background:${colors[i % colors.length]}"></i><span>${esc(labels[i])}</span><span>${Math.round((p / total) * 100)}%</span></li>`).join("")}</ul></div></div>`
}

export function tablePanel(ctx, { title, cols, rows, cta = "View all" }) {
  return `<div class="panel"><div class="panel-head"><h3>${esc(title)}</h3><a class="btn btn-ghost btn-sm" href="#">${esc(cta)}${icon("arrow", 14)}</a></div><div style="overflow-x:auto"><table><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`
}

export function statusPill(text, tone) {
  return `<span class="status ${tone}">${esc(text)}</span>`
}

export function settingsBody(ctx, sections) {
  return `<div class="settings-grid">
    <nav class="settings-nav" aria-label="Settings">${["General", "Team", "Notifications", "Billing", "Integrations", "Security"].map((s, i) => `<a href="#"${i === 0 ? ' aria-current="page"' : ""}>${s}</a>`).join("")}</nav>
    <div class="stack">
      ${sections.map((s) => `<div class="panel"><div class="panel-head"><h3>${esc(s.title)}</h3></div><div class="form">${s.fields.map((f) => f.type === "toggle" ? `<div class="row" style="justify-content:space-between"><div><strong>${esc(f.label)}</strong><div class="muted" style="font-size:.9rem">${esc(f.hint || "")}</div></div><span class="toggle${f.on ? "" : " off"}"></span></div>` : `<div><label>${esc(f.label)}</label><input class="input" value="${esc(f.value || "")}" /></div>`).join("")}<div><button class="btn btn-primary" type="button">Save changes</button></div></div></div>`).join("")}
    </div>
  </div>`
}

/* ------------------------------------------------------------------ */
/* Storefront                                                          */
/* ------------------------------------------------------------------ */

export function promoBar(text) {
  return `<div class="promo-bar">${esc(text)}</div>\n`
}

export function storeHero(ctx, { eyebrow, title, lede, primary, secondary }) {
  return `<section class="section tight">
  <div class="container store-hero">
    <div class="card" style="display:flex;flex-direction:column;justify-content:center;padding:clamp(2rem,5vw,4rem)">
      <span class="eyebrow">${esc(eyebrow)}</span>
      <h1>${title}</h1>
      <p class="lede">${esc(lede)}</p>
      <div class="actions" style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1.5rem"><a class="btn btn-primary btn-lg" href="${primary.href}">${esc(primary.label)}${icon("arrow", 18)}</a>${secondary ? `<a class="btn btn-secondary btn-lg" href="${secondary.href}">${esc(secondary.label)}</a>` : ""}</div>
    </div>
    <div class="panel-art">${tileArt(ctx.seed + "storehero", ctx.t.accent, ctx.t.accent2, { w: 600, h: 600, label: ctx.p.heroLabel || "" })}</div>
  </div>
</section>
`
}

export function catTiles(ctx, cats) {
  return `<section class="section tight"><div class="container"><div class="section-head"><span class="eyebrow">Shop by category</span><h2>Browse the range</h2></div><div class="cat-tiles">${cats.map((c, i) => `<a class="cat-tile reveal" href="shop.html">${tileArt(ctx.seed + "cat" + i, i % 2 ? ctx.t.accent2 : ctx.t.accent, i % 2 ? ctx.t.accent : ctx.t.accent2, { w: 400, h: 400 })}<span>${esc(c)}</span></a>`).join("")}</div></div></section>\n`
}

export function productGrid(ctx, products, { title = "New arrivals", eyebrow = "Featured", soft = false } = {}) {
  return `<section class="section${soft ? " soft" : ""}"><div class="container"><div class="section-head"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2></div><div class="products">${products.map((pr, i) => `<article class="product reveal"><a class="media" href="product.html">${tileArt(ctx.seed + "prod" + pr.name, pr.colors[0], pr.colors[1], { w: 400, h: 400 })}${pr.tag ? `<span class="tag accent">${esc(pr.tag)}</span>` : ""}</a><div class="info"><h3><a href="product.html">${esc(pr.name)}</a></h3><div class="meta"><span>${esc(pr.sub)}</span><strong>${esc(pr.price)}</strong></div><button class="btn btn-secondary btn-sm add" type="button">${icon("cart", 16)}Add to cart</button></div></article>`).join("")}</div></div></section>\n`
}

export function pdp(ctx, pr, { desc, bullets }) {
  return `<section class="section"><div class="container pdp">
  <div>
    <div class="gallery-main">${tileArt(ctx.seed + "prod" + pr.name, pr.colors[0], pr.colors[1], { w: 700, h: 700 })}</div>
    <div class="thumbs" data-toggle-group>${[0, 1, 2, 3].map((i) => `<div data-thumb class="${i === 0 ? "active" : ""}">${tileArt(ctx.seed + "prod" + pr.name + i, i % 2 ? pr.colors[1] : pr.colors[0], i % 2 ? pr.colors[0] : pr.colors[1], { w: 200, h: 200 })}</div>`).join("")}</div>
  </div>
  <div>
    <div class="breadcrumbs"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / ${esc(pr.name)}</div>
    <h1 style="font-size:clamp(1.8rem,3.5vw,2.6rem)">${esc(pr.name)}</h1>
    <div class="price" style="font-size:1.8rem;margin-bottom:.75rem">${esc(pr.price)} <small style="text-decoration:line-through">${esc(pr.compare || "")}</small></div>
    <p class="muted">${esc(desc)}</p>
    <label>Colour</label><div class="swatches">${pr.colors.concat(["#1f2937", "#e5e7eb"]).map((c) => `<i style="background:${c}"></i>`).join("")}</div>
    <label>Size</label><div class="variants" data-toggle-group>${(pr.sizes || ["S", "M", "L", "XL"]).map((s, i) => `<button type="button" class="${i === 1 ? "active" : ""}">${esc(s)}</button>`).join("")}</div>
    <div class="buy-row"><div class="qty"><button type="button" aria-label="Decrease">−</button><span>1</span><button type="button" aria-label="Increase">+</button></div><a class="btn btn-primary btn-lg" href="cart.html">${icon("cart", 18)}Add to cart</a></div>
    <ul class="check-list">${bullets.map((b) => `<li>${icon("check")}<span>${esc(b)}</span></li>`).join("")}</ul>
    <div class="divider"></div>
    <div class="faq"><details open><summary>Details</summary><p>${esc(pr.details || "Materials, dimensions and care instructions go here. Replace with your product data.")}</p></details><details><summary>Shipping & returns</summary><p>Free shipping over a threshold you set, 30-day returns. This copy is a placeholder — edit it to match your policy.</p></details></div>
  </div>
</div></section>\n`
}

export function cartPage(ctx, products) {
  const lines = products.slice(0, 3)
  const subtotal = lines.reduce((a, p) => a + Number.parseFloat(p.price.replace(/[^0-9.]/g, "")), 0)
  return `<section class="section"><div class="container"><div class="grid" style="grid-template-columns:1.5fr 1fr;gap:2rem">
  <div><h1 style="font-size:2rem">Your cart</h1><div class="cart-lines">${lines.map((p) => `<div class="cart-line"><div class="thumb">${tileArt(ctx.seed + "prod" + p.name, p.colors[0], p.colors[1], { w: 200, h: 200 })}</div><div><strong>${esc(p.name)}</strong><div class="muted" style="font-size:.9rem">${esc(p.sub)}</div><div class="qty" style="margin-top:.5rem;transform:scale(.85);transform-origin:left"><button type="button" aria-label="Decrease">−</button><span>1</span><button type="button" aria-label="Increase">+</button></div></div><strong>${esc(p.price)}</strong></div>`).join("")}</div></div>
  <div><div class="card summary"><h3>Summary</h3><dl><dt>Subtotal</dt><dd>$${subtotal.toFixed(2)}</dd><dt>Shipping</dt><dd>Free</dd><dt>Tax</dt><dd>Calculated at checkout</dd><dt class="total">Total</dt><dd class="total">$${subtotal.toFixed(2)}</dd></dl><a class="btn btn-primary btn-lg" style="width:100%;margin-top:1.25rem" href="#">Checkout${icon("arrow", 18)}</a><p class="muted" style="font-size:.85rem;margin:1rem 0 0;text-align:center">Secure checkout · Free returns</p></div></div>
</div></div></section>\n`
}

export function trustRow(items) {
  return `<section class="section tight soft"><div class="container trust">${items.map(([ic, t]) => `<div>${icon(ic)}<span>${esc(t)}</span></div>`).join("")}</div></section>\n`
}
