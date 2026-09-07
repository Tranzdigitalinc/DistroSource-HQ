// The design system stylesheet shipped inside every DistroSource Originals
// template. Tokens are set per product at the top (see generate.mjs); the
// rest is a compact, production-grade component layer: layout, type scale,
// buttons, cards, nav with mobile menu, hero variants, feature grids,
// pricing, FAQ, forms, footer, plus dashboard and storefront primitives.

export function baseCss({ bg, surface, text, muted, accent, accent2, mode, radius, fontDisplay, fontBody }) {
  const border = mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(16,16,16,0.10)"
  const borderStrong = mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(16,16,16,0.18)"
  const soft = mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(16,16,16,0.035)"
  const shadow = mode === "dark" ? "0 20px 50px -20px rgba(0,0,0,0.7)" : "0 20px 50px -24px rgba(20,20,20,0.25)"
  return `/* ==========================================================================
   Design tokens — change these first. Everything below reads from them.
   ========================================================================== */
:root {
  --bg: ${bg};
  --surface: ${surface};
  --text: ${text};
  --muted: ${muted};
  --accent: ${accent};
  --accent-2: ${accent2};
  --accent-contrast: #ffffff;
  --border: ${border};
  --border-strong: ${borderStrong};
  --soft: ${soft};
  --radius: ${radius};
  --radius-sm: calc(var(--radius) * 0.5);
  --radius-lg: calc(var(--radius) * 1.6);
  --shadow: ${shadow};
  --font-display: ${fontDisplay}, ui-sans-serif, system-ui, sans-serif;
  --font-body: ${fontBody}, ui-sans-serif, system-ui, sans-serif;
  --container: 1180px;
  --gutter: clamp(1rem, 4vw, 2.5rem);
}

/* Reset ------------------------------------------------------------------ */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body { margin: 0; font-family: var(--font-body); color: var(--text); background: var(--bg); line-height: 1.6; font-size: 16px; -webkit-font-smoothing: antialiased; }
img, svg, video { max-width: 100%; height: auto; display: block; }
a { color: inherit; text-decoration: none; }
button, input, select, textarea { font: inherit; color: inherit; }
h1, h2, h3, h4 { font-family: var(--font-display); line-height: 1.1; margin: 0 0 0.5em; letter-spacing: -0.02em; font-weight: 700; }
h1 { font-size: clamp(2.4rem, 5.5vw, 4.25rem); }
h2 { font-size: clamp(1.9rem, 3.6vw, 2.75rem); }
h3 { font-size: 1.25rem; }
p { margin: 0 0 1em; }
.muted { color: var(--muted); }
.lede { font-size: 1.15rem; color: var(--muted); max-width: 60ch; }
.eyebrow { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.9rem; display: inline-flex; align-items: center; gap: 0.5rem; }
.eyebrow::before { content: ""; width: 1.25rem; height: 2px; background: var(--accent); border-radius: 2px; }

/* Layout ----------------------------------------------------------------- */
.container { width: min(var(--container), 100% - var(--gutter) * 2); margin-inline: auto; }
.section { padding: clamp(3.5rem, 8vw, 6.5rem) 0; }
.section.tight { padding: clamp(2rem, 5vw, 3.5rem) 0; }
.section.soft { background: var(--soft); }
.grid { display: grid; gap: 1.5rem; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.split { display: grid; grid-template-columns: 1.05fr 1fr; gap: clamp(2rem, 5vw, 4.5rem); align-items: center; }
.center { text-align: center; }
.center .lede { margin-inline: auto; }
.stack { display: flex; flex-direction: column; gap: 1rem; }
.row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.section-head { max-width: 44rem; margin-bottom: clamp(2rem, 4vw, 3rem); }
.section-head.center { margin-inline: auto; }
@media (max-width: 960px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } .grid-3 { grid-template-columns: repeat(2, 1fr); } .split { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; } }

/* Buttons ---------------------------------------------------------------- */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.55rem; padding: 0.85rem 1.4rem; border-radius: 999px; font-weight: 600; border: 1px solid transparent; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease; white-space: nowrap; }
.btn:active { transform: translateY(1px); }
.btn-primary { background: var(--accent); color: var(--accent-contrast); box-shadow: 0 10px 30px -12px var(--accent); }
.btn-primary:hover { filter: brightness(1.06); box-shadow: 0 14px 34px -12px var(--accent); }
.btn-secondary { background: var(--surface); border-color: var(--border-strong); }
.btn-secondary:hover { border-color: var(--text); }
.btn-ghost { background: transparent; border-color: transparent; color: var(--muted); }
.btn-ghost:hover { color: var(--text); background: var(--soft); }
.btn-lg { padding: 1.05rem 1.75rem; font-size: 1.05rem; }
.btn-sm { padding: 0.5rem 0.9rem; font-size: 0.9rem; }
.btn .ic { width: 18px; height: 18px; }

/* Header ----------------------------------------------------------------- */
.site-header { position: sticky; top: 0; z-index: 50; background: color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter: blur(14px); border-bottom: 1px solid var(--border); }
.site-header .container { display: flex; align-items: center; gap: 2rem; height: 72px; }
.brand { font-family: var(--font-display); font-weight: 800; font-size: 1.25rem; letter-spacing: -0.02em; display: inline-flex; align-items: center; gap: 0.6rem; }
.brand-mark { width: 30px; height: 30px; border-radius: 9px; background: linear-gradient(135deg, var(--accent), var(--accent-2)); display: inline-block; }
.nav { display: flex; gap: 0.25rem; margin-left: auto; }
.nav a { padding: 0.5rem 0.85rem; border-radius: 999px; font-weight: 500; color: var(--muted); }
.nav a:hover, .nav a[aria-current="page"] { color: var(--text); background: var(--soft); }
.header-cta { display: flex; gap: 0.5rem; }
.menu-toggle { display: none; margin-left: auto; background: none; border: 1px solid var(--border-strong); border-radius: 12px; width: 44px; height: 44px; align-items: center; justify-content: center; }
@media (max-width: 860px) {
  .nav, .header-cta { display: none; }
  .menu-toggle { display: inline-flex; }
  .site-header.is-open .nav { display: flex; flex-direction: column; position: absolute; left: 0; right: 0; top: 72px; background: var(--surface); border-bottom: 1px solid var(--border); padding: 1rem var(--gutter) 1.25rem; gap: 0.25rem; box-shadow: var(--shadow); }
  .site-header.is-open .nav a { padding: 0.85rem 0.9rem; font-size: 1.05rem; }
}

/* Hero ------------------------------------------------------------------- */
.hero { padding: clamp(3rem, 8vw, 6.5rem) 0 clamp(2.5rem, 6vw, 5rem); position: relative; overflow: hidden; }
.hero .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.75rem; }
.hero-art { border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); border: 1px solid var(--border); aspect-ratio: 4/3; background: var(--surface); }
.hero-art svg { width: 100%; height: 100%; }
.hero-center { text-align: center; }
.hero-center .lede { margin-inline: auto; }
.hero-center .actions { justify-content: center; }
.hero-center .hero-art { margin-top: 3rem; aspect-ratio: 16/8; }
.hero-glow { position: absolute; inset: auto; width: 60vw; height: 60vw; max-width: 900px; max-height: 900px; border-radius: 50%; filter: blur(90px); opacity: 0.35; pointer-events: none; background: var(--accent); top: -30%; right: -20%; }
.hero-glow.two { background: var(--accent-2); top: auto; bottom: -40%; left: -20%; right: auto; opacity: 0.25; }
.hero > .container { position: relative; }
.pill-list { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.5rem; }
.pill { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; border-radius: 999px; background: var(--soft); border: 1px solid var(--border); font-size: 0.85rem; font-weight: 500; }
.pill .ic { width: 14px; height: 14px; color: var(--accent); }
.stat-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--border); }
.stat-strip strong { display: block; font-family: var(--font-display); font-size: 1.75rem; letter-spacing: -0.02em; }
.stat-strip span { color: var(--muted); font-size: 0.9rem; }
@media (max-width: 640px) { .stat-strip { grid-template-columns: repeat(2, 1fr); } }

/* Cards ------------------------------------------------------------------ */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.6rem; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
.card:hover { transform: translateY(-3px); box-shadow: var(--shadow); border-color: var(--border-strong); }
.card .ic-wrap { width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); margin-bottom: 1rem; }
.card h3 { margin-bottom: 0.4rem; }
.card p { color: var(--muted); margin: 0; }
.card.featured { border-color: var(--accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent); }
.card-media { padding: 0; overflow: hidden; }
.card-media .media { aspect-ratio: 4/3; background: var(--soft); }
.card-media .media svg { width: 100%; height: 100%; }
.card-media .body { padding: 1.25rem 1.4rem 1.4rem; }
.card-media .body h3 { margin-bottom: 0.25rem; }

/* Lists ------------------------------------------------------------------ */
.check-list { list-style: none; padding: 0; margin: 1.25rem 0 0; display: grid; gap: 0.6rem; }
.check-list li { display: flex; gap: 0.6rem; align-items: flex-start; }
.check-list .ic { color: var(--accent); flex: none; margin-top: 3px; width: 18px; height: 18px; }
.steps { counter-reset: step; display: grid; gap: 1.25rem; }
.step { display: grid; grid-template-columns: 52px 1fr; gap: 1rem; align-items: start; }
.step::before { counter-increment: step; content: counter(step, decimal-leading-zero); font-family: var(--font-display); font-weight: 800; font-size: 1.4rem; color: var(--accent); width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; background: color-mix(in srgb, var(--accent) 12%, transparent); }
.step h3 { margin-bottom: 0.25rem; }
.step p { color: var(--muted); margin: 0; }

/* Pricing ---------------------------------------------------------------- */
.price { font-family: var(--font-display); font-size: 2.6rem; font-weight: 800; letter-spacing: -0.03em; }
.price small { font-size: 1rem; color: var(--muted); font-weight: 500; letter-spacing: 0; }
.plan .btn { width: 100%; margin-top: 1.25rem; }
.badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 999px; background: var(--accent); color: var(--accent-contrast); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }

/* FAQ -------------------------------------------------------------------- */
.faq { border-top: 1px solid var(--border); }
.faq details { border-bottom: 1px solid var(--border); }
.faq summary { cursor: pointer; padding: 1.1rem 0; font-weight: 600; font-size: 1.05rem; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after { content: "+"; font-size: 1.4rem; color: var(--accent); transition: transform 0.2s ease; }
.faq details[open] summary::after { transform: rotate(45deg); }
.faq p { color: var(--muted); padding-bottom: 1.1rem; margin: 0; max-width: 62ch; }

/* Quotes ----------------------------------------------------------------- */
.quote { display: flex; flex-direction: column; gap: 1.25rem; }
.quote blockquote { margin: 0; font-size: 1.1rem; line-height: 1.55; }
.quote .who { display: flex; align-items: center; gap: 0.8rem; margin-top: auto; }
.quote .who svg { width: 40px; height: 40px; border-radius: 50%; }
.quote .who small { display: block; color: var(--muted); }

/* CTA band --------------------------------------------------------------- */
.cta-band { border-radius: var(--radius-lg); padding: clamp(2.5rem, 6vw, 4.5rem); background: linear-gradient(120deg, var(--accent), var(--accent-2)); color: #fff; display: grid; grid-template-columns: 1.4fr 1fr; gap: 2rem; align-items: center; position: relative; overflow: hidden; }
.cta-band h2 { color: #fff; margin: 0; }
.cta-band p { color: rgba(255,255,255,0.85); margin: 0.75rem 0 0; }
.cta-band .actions { display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap; }
.cta-band .btn-primary { background: #fff; color: #111; box-shadow: none; }
.cta-band .btn-secondary { background: transparent; color: #fff; border-color: rgba(255,255,255,0.5); }
@media (max-width: 860px) { .cta-band { grid-template-columns: 1fr; } .cta-band .actions { justify-content: flex-start; } }

/* Forms ------------------------------------------------------------------ */
.form { display: grid; gap: 1rem; }
.form .two { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
label { font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 0.35rem; }
.input, textarea.input { width: 100%; padding: 0.85rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-strong); background: var(--surface); }
.input:focus { outline: 2px solid color-mix(in srgb, var(--accent) 45%, transparent); border-color: var(--accent); }
@media (max-width: 640px) { .form .two { grid-template-columns: 1fr; } }

/* Footer ----------------------------------------------------------------- */
.site-footer { border-top: 1px solid var(--border); padding: 3.5rem 0 2rem; margin-top: 2rem; }
.site-footer .cols { display: grid; grid-template-columns: 1.6fr repeat(3, 1fr); gap: 2rem; }
.site-footer h4 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); margin-bottom: 1rem; }
.site-footer ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.6rem; }
.site-footer li a { color: var(--muted); }
.site-footer li a:hover { color: var(--text); }
.site-footer .legal { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; color: var(--muted); font-size: 0.9rem; }
@media (max-width: 860px) { .site-footer .cols { grid-template-columns: 1fr 1fr; } }

/* Page hero (interior pages) -------------------------------------------- */
.page-hero { padding: clamp(3rem, 6vw, 5rem) 0 clamp(2rem, 4vw, 3rem); border-bottom: 1px solid var(--border); }
.page-hero h1 { font-size: clamp(2.2rem, 4.5vw, 3.4rem); }
.breadcrumbs { font-size: 0.85rem; color: var(--muted); margin-bottom: 1rem; }
.breadcrumbs a:hover { color: var(--text); }

/* Gallery ---------------------------------------------------------------- */
.gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.gallery .tile { aspect-ratio: 4/3; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
.gallery .tile.tall { grid-row: span 2; aspect-ratio: auto; }
.gallery .tile svg { width: 100%; height: 100%; }
@media (max-width: 640px) { .gallery { grid-template-columns: 1fr 1fr; } }

/* Utilities -------------------------------------------------------------- */
.ic { width: 22px; height: 22px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.divider { height: 1px; background: var(--border); margin: 2rem 0; }
.tag { display: inline-block; padding: 0.2rem 0.55rem; border-radius: 6px; background: var(--soft); font-size: 0.75rem; font-weight: 600; color: var(--muted); }
.tag.accent { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); }
.reveal { opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; }
.reveal.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
`
}

/** Extra layer for dashboard templates. */
export const dashboardCss = `
/* Dashboard shell ------------------------------------------------------- */
body.dash { background: var(--bg); }
.shell { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; }
.sidebar { background: var(--surface); border-right: 1px solid var(--border); padding: 1.25rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 0; height: 100vh; }
.sidebar .brand { padding: 0.25rem 0.5rem; }
.side-nav { display: grid; gap: 0.15rem; }
.side-nav a { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 0.75rem; border-radius: 10px; color: var(--muted); font-weight: 500; font-size: 0.95rem; }
.side-nav a .ic { width: 18px; height: 18px; }
.side-nav a:hover { background: var(--soft); color: var(--text); }
.side-nav a[aria-current="page"] { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); }
.side-nav .group { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); padding: 1rem 0.75rem 0.35rem; }
.sidebar .user { margin-top: auto; display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem; border-radius: 12px; border: 1px solid var(--border); }
.sidebar .user svg { width: 34px; height: 34px; border-radius: 50%; }
.sidebar .user small { display: block; color: var(--muted); }
.main { display: flex; flex-direction: column; min-width: 0; }
.topbar { height: 64px; display: flex; align-items: center; gap: 1rem; padding: 0 1.5rem; border-bottom: 1px solid var(--border); background: var(--surface); position: sticky; top: 0; z-index: 10; }
.topbar .search { flex: 1; max-width: 420px; display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.9rem; border-radius: 10px; border: 1px solid var(--border-strong); color: var(--muted); }
.topbar .actions { margin-left: auto; display: flex; gap: 0.5rem; align-items: center; }
.icon-btn { width: 38px; height: 38px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border); background: var(--surface); color: var(--muted); }
.content { padding: 1.5rem; display: grid; gap: 1.25rem; }
.content-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.content-head h1 { font-size: 1.6rem; margin: 0; }
.content-head p { margin: 0.25rem 0 0; color: var(--muted); }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.kpi { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.1rem 1.25rem; }
.kpi .label { color: var(--muted); font-size: 0.85rem; font-weight: 500; }
.kpi .value { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; margin: 0.35rem 0 0.2rem; }
.kpi .delta { font-size: 0.8rem; font-weight: 600; }
.kpi .delta.up { color: #16a34a; } .kpi .delta.down { color: #dc2626; }
.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; min-width: 0; }
.panel-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
.panel-head h3 { margin: 0; font-size: 1.05rem; }
.panel .chart { height: 240px; color: var(--muted); }
.two-col { display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; }
.three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
th, td { text-align: left; padding: 0.75rem 0.6rem; border-bottom: 1px solid var(--border); }
th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 600; }
tr:last-child td { border-bottom: 0; }
.status { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: var(--soft); }
.status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status.ok { color: #15803d; background: rgba(22,163,74,0.12); }
.status.warn { color: #b45309; background: rgba(245,158,11,0.15); }
.status.bad { color: #b91c1c; background: rgba(220,38,38,0.12); }
.status.info { color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, transparent); }
.progress { height: 8px; border-radius: 999px; background: var(--soft); overflow: hidden; }
.progress span { display: block; height: 100%; background: var(--accent); border-radius: 999px; }
.legend { display: grid; gap: 0.5rem; font-size: 0.9rem; }
.legend li { display: flex; align-items: center; gap: 0.6rem; list-style: none; }
.legend i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.legend span:last-child { margin-left: auto; color: var(--muted); }
.settings-grid { display: grid; grid-template-columns: 220px 1fr; gap: 2rem; }
.settings-nav a { display: block; padding: 0.55rem 0.75rem; border-radius: 8px; color: var(--muted); }
.settings-nav a[aria-current="page"] { background: var(--soft); color: var(--text); font-weight: 600; }
.toggle { width: 42px; height: 24px; border-radius: 999px; background: var(--accent); position: relative; display: inline-block; }
.toggle::after { content: ""; position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; }
.toggle.off { background: var(--border-strong); } .toggle.off::after { right: auto; left: 3px; }
.menu-toggle-dash { display: none; }
@media (max-width: 960px) {
  .shell { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .menu-toggle-dash { display: inline-flex; }
  .kpis { grid-template-columns: repeat(2, 1fr); }
  .two-col, .three-col, .settings-grid { grid-template-columns: 1fr; }
}
@media (max-width: 560px) { .kpis { grid-template-columns: 1fr; } .content { padding: 1rem; } .topbar { padding: 0 1rem; gap: .6rem; } .topbar .search { flex: none; width: 40px; height: 40px; padding: 0; justify-content: center; border-radius: 10px; } .topbar .search span { display: none; } }
`

/** Extra layer for storefront templates. */
export const storeCss = `
/* Storefront ------------------------------------------------------------- */
.promo-bar { background: var(--text); color: var(--bg); text-align: center; font-size: 0.85rem; padding: 0.5rem; font-weight: 500; }
.store-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2rem; align-items: stretch; }
.store-hero .panel-art { border-radius: var(--radius-lg); overflow: hidden; min-height: 420px; border: 1px solid var(--border); }
.store-hero .panel-art svg { width: 100%; height: 100%; }
.cat-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.cat-tile { border-radius: var(--radius); overflow: hidden; position: relative; aspect-ratio: 1; border: 1px solid var(--border); }
.cat-tile svg { width: 100%; height: 100%; }
.cat-tile span { position: absolute; left: 1rem; bottom: 1rem; background: var(--surface); padding: 0.45rem 0.8rem; border-radius: 999px; font-weight: 600; font-size: 0.9rem; }
.products { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
.product { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--surface); transition: transform 0.2s ease, box-shadow 0.2s ease; }
.product:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.product .media { aspect-ratio: 1; position: relative; }
.product .media svg { width: 100%; height: 100%; }
.product .media .tag { position: absolute; top: 0.75rem; left: 0.75rem; }
.product .info { padding: 1rem 1.1rem 1.2rem; }
.product .info h3 { font-size: 1rem; margin-bottom: 0.2rem; font-family: var(--font-body); font-weight: 600; letter-spacing: 0; }
.product .meta { display: flex; justify-content: space-between; align-items: center; color: var(--muted); font-size: 0.9rem; }
.product .meta strong { color: var(--text); font-size: 1.05rem; }
.product .add { width: 100%; margin-top: 0.85rem; }
.pdp { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3rem; }
.pdp .gallery-main { aspect-ratio: 1; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); }
.pdp .gallery-main svg { width: 100%; height: 100%; }
.pdp .thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-top: 0.75rem; }
.pdp .thumbs div { aspect-ratio: 1; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border); }
.pdp .thumbs div.active { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent); }
.pdp .thumbs svg { width: 100%; height: 100%; }
.variants { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.5rem 0 1.25rem; }
.variants button { padding: 0.55rem 0.95rem; border-radius: 999px; border: 1px solid var(--border-strong); background: var(--surface); cursor: pointer; }
.variants button.active { border-color: var(--text); background: var(--text); color: var(--bg); }
.swatches { display: flex; gap: 0.5rem; margin: 0.5rem 0 1.25rem; }
.swatches i { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--surface); box-shadow: 0 0 0 1px var(--border-strong); display: inline-block; }
.qty { display: inline-flex; border: 1px solid var(--border-strong); border-radius: 999px; overflow: hidden; }
.qty button { width: 40px; height: 44px; background: none; border: 0; cursor: pointer; }
.qty span { width: 44px; display: grid; place-items: center; font-weight: 600; }
.buy-row { display: flex; gap: 0.75rem; align-items: center; margin: 1.25rem 0; }
.buy-row .btn { flex: 1; }
.cart-lines { display: grid; gap: 1rem; }
.cart-line { display: grid; grid-template-columns: 96px 1fr auto; gap: 1rem; align-items: center; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
.cart-line .thumb { aspect-ratio: 1; border-radius: var(--radius-sm); overflow: hidden; }
.cart-line .thumb svg { width: 100%; height: 100%; }
.summary { position: sticky; top: 96px; }
.summary dl { display: grid; grid-template-columns: 1fr auto; gap: 0.6rem 1rem; margin: 0; }
.summary dt { color: var(--muted); } .summary dd { margin: 0; text-align: right; font-weight: 600; }
.summary .total { border-top: 1px solid var(--border); padding-top: 0.8rem; font-size: 1.15rem; }
.trust { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.trust div { display: flex; gap: 0.75rem; align-items: center; font-size: 0.9rem; }
.trust .ic { color: var(--accent); flex: none; }
@media (max-width: 960px) { .products, .cat-tiles { grid-template-columns: repeat(2, 1fr); } .store-hero, .pdp { grid-template-columns: 1fr; } .trust { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .products { gap: 0.75rem; } }
`

export const mainJs = `// Progressive enhancement only — every page works without this file.
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  // Reveal-on-scroll for elements marked .reveal
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
  // Variant / thumbnail toggles used by storefront pages
  document.querySelectorAll('[data-toggle-group]').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button, div[data-thumb]');
      if (!btn) return;
      group.querySelectorAll('.active').forEach(function (a) { a.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
  // Quantity stepper
  document.querySelectorAll('.qty').forEach(function (q) {
    var out = q.querySelector('span');
    q.querySelectorAll('button').forEach(function (b, i) {
      b.addEventListener('click', function () {
        var n = parseInt(out.textContent, 10) || 1;
        out.textContent = String(Math.max(1, i === 0 ? n - 1 : n + 1));
      });
    });
  });
  // Contact form: client-side validation demo (wire to your backend)
  var form = document.querySelector('form[data-demo-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = Array.prototype.every.call(form.querySelectorAll('[required]'), function (f) { return f.value.trim() !== ''; });
      var note = form.querySelector('[data-form-note]');
      if (note) note.textContent = ok ? 'Thanks — this demo form is ready to connect to your backend.' : 'Please fill in the required fields.';
    });
  }
})();
`
