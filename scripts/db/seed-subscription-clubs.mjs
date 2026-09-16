// Seeds the subscription clubs, bundles and All-Access into membership_plans.
// Idempotent by slug; the three original tiers (starter/pro/elite) are left
// exactly as they are. Requires scripts/db/add-subscription-clubs.sql first.
//
//   node --env-file=.env.local scripts/db/seed-subscription-clubs.mjs
//
// Every plan is "pick & keep": claims grant a permanent entitlement at the
// personal licence. Commercial and agency rights run while the subscription is
// active — stated in the plan's perks, not enforced by the claim itself.
import { Pool } from "pg"

/** The catalogue's annual rule: about 9.6 months, rounded down to $5. */
const annual = (monthly) => Math.floor((monthly * 9.6) / 5) * 5

/**
 * Plans seed INACTIVE: the storefront lists every active plan, so a plan that
 * has no Fungies mapping yet must not be offered. Publish them with
 * ACTIVATE=1 once the clubs page and the Fungies sync are both in place.
 */
const ACTIVATE = process.env.ACTIVATE === "1"

const WEB = ["html-templates", "landing-pages", "website-templates", "admin-dashboards"]
const DESIGN = ["design-branding", "graphics", "mockups", "social-media-templates"]
const BUSINESS = ["business-templates", "notion-workspace-templates", "presentation-templates", "productivity", "resume-cv-templates"]
const THREE_D = ["3d-assets", "3d-print"]

/** [slug, name, kind, scope, credits, capUsd, monthly, discount%, tagline, perks] */
const PLANS = [
  // ---- Department clubs ------------------------------------------------
  ["web-template-club", "Web Template Club", "club", WEB, 1, 200, 19, 0, "One website, landing page or dashboard template a month, yours to keep.",
    ["1 template claim every month", "Keep every template you claim", "Commercial licence while subscribed", "New templates added monthly"]],
  ["design-assets-club", "Design Assets Club", "club", DESIGN, 2, 130, 15, 0, "Two design downloads a month — palettes, backgrounds, mockups or social sets.",
    ["2 claims every month", "Keep everything you claim", "Commercial licence while subscribed", "New packs added monthly"]],
  ["type-foundry-club", "Type Foundry Club", "club", ["fonts-typefaces"], 1, 200, 12, 0, "A typeface family every month, licensed for your work while you subscribe.",
    ["1 typeface claim every month", "Keep every family you claim", "Commercial licence while subscribed", "OTF and WOFF2 for web use"]],
  ["sound-library-club", "Sound Library Club", "club", ["audio"], 1, 200, 15, 0, "A sound pack a month — effects, loops, drums or ambience.",
    ["1 pack claim every month", "Keep every pack you claim", "Use in monetised video and released music while subscribed", "44.1 kHz WAV"]],
  ["colour-light-club", "Colour & Light Club", "club", ["photography"], 1, 100, 9, 0, "A preset and LUT pack every month for photo and video.",
    ["1 pack claim every month", "Keep every pack you claim", "Lightroom, Camera Raw and .cube LUTs", "Client work covered while subscribed"]],
  ["three-d-asset-club", "3D Asset Club", "club", ["3d-assets"], 1, 170, 19, 0, "A game-ready 3D kit every month, in GLB and OBJ.",
    ["1 kit claim every month", "Keep every kit you claim", "Use in commercial games while subscribed", "Unity, Unreal, Godot and Blender ready"]],
  ["print-club", "Print Club", "club", ["3d-print"], 2, 175, 12, 0, "Two printable STL sets a month for your printer or your shop.",
    ["2 claims every month", "Keep every set you claim", "Sell prints you make while subscribed", "Watertight STLs at real size"]],
  ["business-docs-club", "Business Docs Club", "club", BUSINESS, 2, 200, 15, 0, "Two business templates a month — Word, Excel, PowerPoint or Notion.",
    ["2 claims every month", "Keep every template you claim", "Use for clients while subscribed", "Editable Office files, not just PDFs"]],

  // ---- Drops: small, frequent releases ---------------------------------
  ["backgrounds-drop", "Backgrounds Drop", "club", ["graphics"], 1, 130, 6, 0, "New abstract backgrounds every week; claim one pack a month.",
    ["1 claim every month", "New backgrounds weekly", "4K JPG and editable SVG", "Keep what you claim"]],
  ["social-drop", "Social Templates Drop", "club", ["social-media-templates"], 1, 80, 6, 0, "Fresh post, story and thumbnail templates every week.",
    ["1 claim every month", "New templates weekly", "Editable SVG plus ready PNG", "Keep what you claim"]],
  ["mockups-drop", "Mockups Drop", "club", ["mockups"], 1, 130, 6, 0, "New device and print mockups every week.",
    ["1 claim every month", "New mockups weekly", "Editable SVG and transparent PNG frames", "Keep what you claim"]],
  ["presets-drop", "Presets Drop", "club", ["photography"], 1, 100, 5, 0, "A new look every week; claim a pack each month.",
    ["1 claim every month", "New looks weekly", "Presets and matching LUTs", "Keep what you claim"]],
  ["palettes-drop", "Palettes Drop", "club", ["design-branding"], 1, 50, 5, 0, "New colour palettes and brand kits every week.",
    ["1 claim every month", "New palettes weekly", "ASE, Procreate, CSS and JSON", "Keep what you claim"]],

  // ---- Persona bundles --------------------------------------------------
  ["freelancer-bundle", "Freelancer", "bundle", [...DESIGN, ...WEB, ...BUSINESS], 3, 150, 29, 5, "Three claims a month across design, web and business templates.",
    ["3 claims every month", "Design, web and business departments", "5% off anything you buy outright", "Commercial licence while subscribed"]],
  ["startup-bundle", "Startup", "bundle", [...BUSINESS, ...WEB, "design-branding"], 3, 200, 35, 5, "The documents, site templates and brand assets a young company needs.",
    ["3 claims every month", "Business, web and branding", "5% off anything you buy outright", "Commercial licence while subscribed"]],
  ["creator-bundle", "Creator", "bundle", ["audio", "photography", "social-media-templates", "graphics", "mockups"], 4, 150, 29, 5, "Sound, looks and social templates for people who publish every week.",
    ["4 claims every month", "Audio, presets, social and graphics", "5% off anything you buy outright", "Monetised use while subscribed"]],
  ["maker-bundle", "Maker", "bundle", THREE_D, 3, 175, 25, 5, "Three 3D kits or printable sets a month for makers and print shops.",
    ["3 claims every month", "3D assets and printable STLs", "Sell prints you make while subscribed", "5% off anything you buy outright"]],
  ["agency-bundle", "Agency", "bundle", [], 5, 200, 49, 5, "Five claims a month from anywhere in the store, for client work.",
    ["5 claims every month", "Every department", "Agency licence while subscribed", "5% off anything you buy outright"]],

  // ---- All-Access -------------------------------------------------------
  ["all-access", "All-Access", "all-access", [], 8, null, 59, 10, "Eight claims a month from anywhere in the store, no value cap.",
    ["8 claims every month", "Every department, no per-claim value cap", "Keep everything you claim", "10% off anything you buy outright", "Gaming plans join later, once their files ship"]],
]

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
try {
  const { rows: cats } = await client.query(`SELECT slug FROM categories`)
  const known = new Set(cats.map((c) => c.slug))
  const unknown = [...new Set(PLANS.flatMap(([, , , scope]) => scope))].filter((s) => !known.has(s))
  if (unknown.length) throw new Error(`Unknown category slugs: ${unknown.join(", ")}`)

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
      [slug, name, tagline, monthly.toFixed(2), annual(monthly).toFixed(2), discount, credits,
       cap === null ? null : cap.toFixed(2), JSON.stringify(perks), 100 + i, kind, JSON.stringify(scope), ACTIVATE],
    )
    rows[0].inserted ? created++ : updated++
    console.log(`${slug.padEnd(22)} ${kind.padEnd(10)} $${String(monthly).padStart(3)}/mo  $${annual(monthly)}/yr  ${credits} claim${credits === 1 ? "" : "s"}  cap ${cap === null ? "none" : "$" + cap}  scope ${scope.length || "store-wide"}`)
  }
  await client.query("COMMIT")
  console.log(`\nSeeded ${PLANS.length} plans (${created} created, ${updated} updated). Existing tiers untouched.`)
} catch (error) {
  await client.query("ROLLBACK")
  console.error("Seed failed:", error?.message ?? error)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
