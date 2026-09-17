// Seeds the SECOND batch of subscription clubs, drops and bundles into
// membership_plans. Idempotent by slug; batch 1 (seed-subscription-clubs.mjs)
// and the three original tiers are left exactly as they are. Requires
// scripts/db/add-subscription-clubs.sql — already applied for batch 1.
//
//   node --env-file=.env.local scripts/db/seed-subscription-clubs-2.mjs
//
// Every plan is "pick & keep": claims grant a permanent entitlement at the
// personal licence. Commercial and agency rights run while the subscription is
// active — stated in the plan's perks, not enforced by the claim itself.
//
// Batch 2 fills the departments batch 1 left without a dedicated club
// (UI/UX kits, ecommerce, React/Next.js, icons, spreadsheets, presentations,
// resumes, Notion/productivity) and adds persona bundles for the ways those
// departments combine in real work. Pricing follows the batch-1 ladder:
// drops $5–6, single-department clubs $9–19, bundles $25–39, so effective
// price per claim stays between ~$4.50 and ~$19 across the whole page.
import { Pool } from "pg"

/** The catalogue's annual rule: about 9.6 months, rounded down to $5. */
const annual = (monthly) => Math.floor((monthly * 9.6) / 5) * 5

/**
 * Plans seed INACTIVE: the storefront lists every active plan, so a plan that
 * has no Fungies mapping yet must not be offered. Publish them with
 * ACTIVATE=1 once each plan has a Fungies product and plan via
 * Admin → Subscriptions → Sync.
 */
const ACTIVATE = process.env.ACTIVATE === "1"

const CODE = ["react-nextjs-templates", "html-templates", "admin-dashboards"]
const UI_DESIGN = ["ui-ux-kits", "fonts-typefaces", "icons", "mockups", "design-branding", "graphics"]
const OFFICE = ["business-templates", "excel-spreadsheet-templates", "presentation-templates", "productivity-tools"]

/** [slug, name, kind, scope, credits, capUsd, monthly, discount%, tagline, perks] */
const PLANS = [
  // ---- Department clubs: the departments batch 1 did not cover ----------
  ["ui-kit-club", "UI Kit Club", "club", ["ui-ux-kits"], 1, 200, 17, 0, "A complete Figma UI kit every month — full app flows, not loose screens.",
    ["1 UI kit claim every month", "Keep every kit you claim", "Commercial licence while subscribed", "Figma source with styles and components"]],
  ["ecommerce-template-club", "Ecommerce Template Club", "club", ["ecommerce-templates"], 1, 200, 19, 0, "A full storefront template every month — product pages, cart and checkout included.",
    ["1 storefront claim every month", "Keep every template you claim", "Commercial licence while subscribed", "HTML, CSS and JS — no framework lock-in"]],
  ["react-nextjs-club", "React & Next.js Club", "club", ["react-nextjs-templates"], 1, 200, 19, 0, "A production-ready React or Next.js starter every month.",
    ["1 starter claim every month", "Keep every starter you claim", "Commercial licence while subscribed", "TypeScript and Tailwind throughout"]],
  ["icon-library-club", "Icon Library Club", "club", ["icons"], 2, 120, 9, 0, "Two icon sets a month — interface, badge and spot illustration styles.",
    ["2 claims every month", "Keep every set you claim", "Commercial licence while subscribed", "SVG source plus ready PNG"]],
  ["spreadsheet-club", "Spreadsheet Club", "club", ["excel-spreadsheet-templates"], 2, 150, 12, 0, "Two working spreadsheets a month — budgets, trackers, invoices and models.",
    ["2 claims every month", "Keep every workbook you claim", "Use for clients while subscribed", "Excel and Google Sheets compatible"]],
  ["presentation-club", "Presentation Club", "club", ["presentation-templates"], 1, 150, 12, 0, "A deck template every month — pitches, reports and reviews that look designed.",
    ["1 deck claim every month", "Keep every deck you claim", "Use for clients while subscribed", "PowerPoint and Keynote files"]],
  ["career-club", "Career Club", "club", ["resume-cv-templates"], 1, 120, 9, 0, "A resume or CV template every month, for you or your clients.",
    ["1 claim every month", "Keep every template you claim", "Use for clients while subscribed", "Word, PDF and Canva-compatible"]],
  ["notion-productivity-club", "Notion & Productivity Club", "club", ["notion-workspace-templates", "productivity-tools"], 2, 150, 12, 0, "Two Notion workspaces or planner kits a month to run your work and life.",
    ["2 claims every month", "Keep everything you claim", "Use for clients while subscribed", "Notion duplicates plus printable PDFs"]],

  // ---- Drops: small, frequent releases ---------------------------------
  ["icons-drop", "Icons Drop", "club", ["icons"], 1, 80, 5, 0, "New mini icon sets every week; claim one pack a month.",
    ["1 claim every month", "New icons weekly", "SVG plus ready PNG", "Keep what you claim"]],
  ["fonts-drop", "Fonts Drop", "club", ["fonts-typefaces"], 1, 100, 6, 0, "New display faces and lettering every week; claim a font each month.",
    ["1 claim every month", "New type weekly", "OTF and WOFF2 for web use", "Keep what you claim"]],

  // ---- Persona bundles --------------------------------------------------
  ["developer-bundle", "Developer", "bundle", [...CODE, "ui-ux-kits", "icons"], 3, 200, 35, 5, "Starters, dashboards, UI kits and icons for people who ship apps.",
    ["3 claims every month", "Code templates, UI kits and icons", "5% off anything you buy outright", "Commercial licence while subscribed"]],
  ["designer-bundle", "Designer", "bundle", UI_DESIGN, 4, 175, 35, 5, "UI kits, type, icons and mockups — a full studio shelf, restocked monthly.",
    ["4 claims every month", "UI kits, type, icons and mockups", "5% off anything you buy outright", "Commercial licence while subscribed"]],
  ["marketer-bundle", "Marketer", "bundle", ["social-media-templates", "landing-pages", "presentation-templates", "photography", "graphics"], 4, 150, 29, 5, "Landing pages, social sets, decks and looks for campaigns that ship weekly.",
    ["4 claims every month", "Social, landing pages, decks and presets", "5% off anything you buy outright", "Commercial licence while subscribed"]],
  ["store-owner-bundle", "Store Owner", "bundle", ["ecommerce-templates", "social-media-templates", "photography", "business-templates", "excel-spreadsheet-templates"], 4, 200, 39, 5, "Everything to run an online shop: the storefront, the socials and the books.",
    ["4 claims every month", "Storefront, social, photo and back-office", "5% off anything you buy outright", "Commercial licence while subscribed"]],
  ["office-bundle", "Office", "bundle", OFFICE, 4, 150, 25, 5, "Documents, spreadsheets, decks and planners for a well-run desk.",
    ["4 claims every month", "Documents, sheets, decks and planners", "5% off anything you buy outright", "Use for clients while subscribed"]],
]

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
try {
  const { rows: cats } = await client.query(`SELECT slug FROM categories`)
  const known = new Set(cats.map((c) => c.slug))
  const unknown = [...new Set(PLANS.flatMap(([, , , scope]) => scope))].filter((s) => !known.has(s))
  if (unknown.length) throw new Error(`Unknown category slugs: ${unknown.join(", ")}`)

  // Batch-1 only checked that a scope slug exists. A club scoped to a
  // department with no published products would be sellable but unclaimable,
  // so warn about it here rather than discovering it from a support ticket.
  const { rows: counts } = await client.query(
    `SELECT c.slug, COUNT(p.id)::int AS published
       FROM categories c
       LEFT JOIN products p ON p."categoryId" = c.id AND p.status = 'published'
      GROUP BY c.slug`,
  )
  const publishedBySlug = new Map(counts.map((r) => [r.slug, r.published]))
  const empty = [...new Set(PLANS.flatMap(([, , , scope]) => scope))].filter((s) => !publishedBySlug.get(s))
  if (empty.length) console.warn(`WARNING: scoped departments with no published products: ${empty.join(", ")}`)

  await client.query("BEGIN")
  let created = 0, updated = 0
  for (const [i, [slug, name, kind, scope, credits, cap, monthly, discount, tagline, perks]] of PLANS.entries()) {
    const { rows } = await client.query(
      `INSERT INTO membership_plans
         (slug, name, tagline, "monthlyPriceUsd", "annualPriceUsd", "discountPercent", "monthlyCredits",
          "creditValueCapUsd", perks, "isActive", "sortOrder", kind, "scopeCategorySlugs")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$13,$10,$11,$12::jsonb)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name, tagline = EXCLUDED.tagline,
         "monthlyPriceUsd" = EXCLUDED."monthlyPriceUsd", "annualPriceUsd" = EXCLUDED."annualPriceUsd",
         "discountPercent" = EXCLUDED."discountPercent", "monthlyCredits" = EXCLUDED."monthlyCredits",
         "creditValueCapUsd" = EXCLUDED."creditValueCapUsd", perks = EXCLUDED.perks,
         "sortOrder" = EXCLUDED."sortOrder", kind = EXCLUDED.kind,
         "scopeCategorySlugs" = EXCLUDED."scopeCategorySlugs"
       RETURNING (xmax = 0) AS inserted`,
      // Batch 2 sorts at 200+, so batch 1 (100+) keeps its exact page order.
      [slug, name, tagline, monthly.toFixed(2), annual(monthly).toFixed(2), discount, credits,
       cap === null ? null : cap.toFixed(2), JSON.stringify(perks), 200 + i, kind, JSON.stringify(scope), ACTIVATE],
    )
    rows[0].inserted ? created++ : updated++
    console.log(`${slug.padEnd(24)} ${kind.padEnd(8)} $${String(monthly).padStart(3)}/mo  $${annual(monthly)}/yr  ${credits} claim${credits === 1 ? "" : "s"}  cap ${cap === null ? "none" : "$" + cap}  scope ${scope.length || "store-wide"}`)
  }
  await client.query("COMMIT")
  console.log(`\nSeeded ${PLANS.length} plans (${created} created, ${updated} updated). Batch 1 and tiers untouched.`)

  // Coverage report: which departments now have a dedicated single-scope club,
  // and which are still only reachable through multi-department plans.
  const { rows: clubs } = await client.query(
    `SELECT "scopeCategorySlugs" FROM membership_plans
      WHERE kind = 'club' AND slug NOT LIKE '%-drop' AND jsonb_array_length("scopeCategorySlugs") = 1`,
  )
  const covered = new Set(clubs.map((r) => r.scopeCategorySlugs[0]))
  const uncovered = [...publishedBySlug.entries()]
    .filter(([slug, n]) => n > 0 && !covered.has(slug) && slug !== "digital-bundles")
    .map(([slug]) => slug)
  console.log(`Departments with a dedicated club: ${covered.size}. Still uncovered: ${uncovered.length ? uncovered.join(", ") : "none"}.`)
} catch (error) {
  await client.query("ROLLBACK")
  console.error("Seed failed:", error?.message ?? error)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
