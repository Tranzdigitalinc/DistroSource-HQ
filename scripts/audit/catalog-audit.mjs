/**
 * READ-ONLY production catalog compliance audit.
 *
 * Answers the catalog questions in docs/PRODUCTION-AUDIT.md against the real
 * database. Writes a report to docs/CATALOG-AUDIT.md and prints a summary.
 *
 *   node scripts/audit/catalog-audit.mjs
 *
 * SAFETY
 *   - Opens the connection with default_transaction_read_only = on, so the
 *     server itself rejects any write this script could attempt.
 *   - Every statement is a SELECT. No INSERT/UPDATE/DELETE/DDL anywhere.
 *   - Classifies products only; it never unpublishes or modifies anything.
 *
 * It reports what the DATABASE says. A row claiming a blob exists is not
 * proof the object exists — see the "asset reachability" caveat in the output.
 */
import { Pool } from "pg"
import { writeFileSync, mkdirSync } from "node:fs"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("DATABASE_URL is not set. Put it in .env.local and run with --env-file=.env.local")
  process.exit(1)
}

const pool = new Pool({ connectionString })

const APPROVED_RIGHTS = ["original", "licensed_for_distribution", "supplier_verified"]

async function q(sql, params = []) {
  const { rows } = await pool.query(sql, params)
  return rows
}

async function main() {
  // Belt and braces: the session cannot write even if the script were wrong.
  await pool.query("SET SESSION default_transaction_read_only = on") // scoped below

  const out = []
  const p = (s = "") => out.push(s)

  p("# DistroSource — Catalog Compliance Audit")
  p("")
  p(`Generated: ${new Date().toISOString()}`)
  p("")
  p("Read-only audit of the production database. No data was modified.")
  p("")

  // ---- Totals ------------------------------------------------------------
  const [totals] = await q(`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE status = 'published')::int AS published,
      count(*) FILTER (WHERE status = 'draft')::int AS draft,
      count(*) FILTER (WHERE status NOT IN ('published','draft'))::int AS other_status,
      count(*) FILTER (WHERE "isFree")::int AS free
    FROM products`)

  p("## Totals")
  p("")
  p("| Metric | Count |")
  p("|---|---|")
  p(`| Total products | ${totals.total} |`)
  p(`| Published | ${totals.published} |`)
  p(`| Draft | ${totals.draft} |`)
  p(`| Other status | ${totals.other_status} |`)
  p(`| Free products | ${totals.free} |`)
  p("")

  const breakdown = async (col) =>
    q(`SELECT ${col} AS v, count(*)::int AS n FROM products GROUP BY 1 ORDER BY 2 DESC`)

  for (const [label, col] of [
    ["assetStatus", '"assetStatus"'],
    ["rightsStatus", '"rightsStatus"'],
    ["sourceType", '"sourceType"'],
  ]) {
    p(`## ${label} breakdown`)
    p("")
    p("| Value | Count |")
    p("|---|---|")
    for (const r of await breakdown(col)) p(`| ${r.v ?? "(null)"} | ${r.n} |`)
    p("")
  }

  // ---- Per-product compliance -------------------------------------------
  // A product is PUBLICLY SELLABLE only when it satisfies every condition the
  // storefront filter enforces AND actually has the artefacts a buyer needs.
  const products = await q(
    `
    SELECT
      p.id, p.slug, p.name, p.status, p."assetStatus", p."rightsStatus",
      p."sourceType", p."rightsOwner", p."supplierName", p."proofOfRights", p."supplierReference",
      p."verificationDate", p."basePrice", p."thumbnailUrl", p."isFree", p."isBundle" AS is_bundle,
      (SELECT count(*) FROM bundle_items b WHERE b."bundleProductId" = p.id)::int AS bundle_item_count,
      (SELECT count(*) FROM product_files f WHERE f."productId" = p.id)::int      AS file_count,
      (SELECT count(*) FROM product_licenses l WHERE l."productId" = p.id)::int   AS license_count,
      (SELECT count(*) FROM product_images i WHERE i."productId" = p.id)::int     AS image_count,
      (SELECT min(l.price) FROM product_licenses l WHERE l."productId" = p.id)    AS min_price,
      (SELECT count(*) FROM reviews r WHERE r."productId" = p.id)::int            AS review_count
    FROM products p
    ORDER BY p.id`,
  )

  const classified = products.map((r) => {
    const issues = []
    const isPublic =
      r.status === "published" && r.assetStatus === "ready" && APPROVED_RIGHTS.includes(r.rightsStatus)

    // Anything a customer could pay for must be deliverable.
    if (isPublic && r.file_count === 0 && !r.is_bundle)
      issues.push("BLOCKER: publicly sellable but has NO downloadable file")
    if (isPublic && r.license_count === 0) issues.push("BLOCKER: publicly sellable but has NO license tier")
    if (isPublic && !r.isFree && (r.min_price === null || Number(r.min_price) <= 0))
      issues.push("BLOCKER: publicly sellable, not marked free, but cheapest license is <= $0")
    if (isPublic && r.isFree && Number(r.min_price) > 0)
      issues.push("BLOCKER: marked free but cheapest license costs money (free-claim will refuse it)")
    if (isPublic && !r.thumbnailUrl && r.image_count === 0)
      issues.push("BLOCKER: publicly sellable with no image at all")

    // Provenance claims must be backed by stored evidence.
    if (r.sourceType === "distrosource_original" && r.rightsStatus !== "original")
      issues.push("NEEDS REVIEW: sourceType=distrosource_original but rightsStatus is not 'original'")
    if (
      ["licensed_for_distribution", "supplier_verified"].includes(r.rightsStatus) &&
      !r.proofOfRights &&
      !r.supplierReference
    )
      issues.push("NEEDS REVIEW: rights claimed as licensed/verified with no proofOfRights or supplierReference")
    if (APPROVED_RIGHTS.includes(r.rightsStatus) && !r.verificationDate && r.rightsStatus !== "original")
      issues.push("NEEDS REVIEW: approved rights with no verificationDate")
    if (r.rightsStatus === "pending_verification" && r.status === "published")
      issues.push("NEEDS REVIEW: published while rights are still pending (hidden by storefront filter)")
    if (r.rightsStatus === "rejected" && r.status === "published")
      issues.push("NEEDS REVIEW: published with REJECTED rights (hidden by storefront filter)")

    // Root-relative paths are legitimate: the storefront serves catalog imagery
    // through its own /api/blob-image proxy. Only a value that is neither
    // absolute nor root-relative is suspect.
    if (isPublic && r.thumbnailUrl && !/^(https?:\/\/|\/)/.test(r.thumbnailUrl))
      issues.push("NEEDS REVIEW: thumbnailUrl is neither an absolute URL nor a root-relative path")

    // A bundle delivers through its included products, so it legitimately has
    // no files of its own — but ONLY if fulfilment actually grants
    // entitlements for those included products. It does not (verified), so a
    // bundle with no own files delivers nothing to the buyer.
    if (isPublic && r.is_bundle && r.bundle_item_count > 0 && r.file_count === 0)
      issues.push("BLOCKER: bundle has no own file and fulfilment does not expand bundle contents into entitlements — buyer receives nothing")

    // Third-party marketplace imagery contradicts an "original" rights claim.
    if (r.thumbnailUrl && /envato|themeforest|creativemarket|shutterstock|gettyimages/i.test(r.thumbnailUrl))
      issues.push("NEEDS REVIEW: preview image is hosted on a third-party marketplace CDN — incompatible with sourceType=distrosource_original unless rights are documented")

    const verdict = issues.some((i) => i.startsWith("BLOCKER"))
      ? "BLOCKER"
      : issues.length
        ? "NEEDS REVIEW"
        : "PASS"
    return { ...r, isPublic, issues, verdict }
  })

  const counts = { PASS: 0, "NEEDS REVIEW": 0, BLOCKER: 0 }
  for (const c of classified) counts[c.verdict]++

  p("## Classification")
  p("")
  p("| Verdict | Count |")
  p("|---|---|")
  for (const [k, v] of Object.entries(counts)) p(`| ${k} | ${v} |`)
  p("")
  p("No product was unpublished or modified by this audit.")
  p("")

  for (const verdict of ["BLOCKER", "NEEDS REVIEW"]) {
    const rows = classified.filter((c) => c.verdict === verdict)
    p(`### ${verdict} — ${rows.length} product(s)`)
    p("")
    if (!rows.length) {
      p("None.")
      p("")
      continue
    }
    p("| id | slug | status | asset | rights | issues |")
    p("|---|---|---|---|---|---|")
    for (const r of rows) {
      p(`| ${r.id} | \`${r.slug}\` | ${r.status} | ${r.assetStatus} | ${r.rightsStatus} | ${r.issues.join("<br>")} |`)
    }
    p("")
  }

  // ---- Duplicates --------------------------------------------------------
  const dupNames = await q(`
    SELECT lower(btrim(name)) AS key, count(*)::int AS n, array_agg(id ORDER BY id) AS ids
    FROM products GROUP BY 1 HAVING count(*) > 1 ORDER BY 2 DESC`)
  const dupSlugPrefix = await q(`
    SELECT a.id AS a_id, b.id AS b_id, a.name AS a_name, b.name AS b_name,
           similarity(a.name, b.name) AS sim
    FROM products a JOIN products b ON a.id < b.id
    WHERE similarity(a.name, b.name) > 0.75
    ORDER BY sim DESC LIMIT 50`).catch(() => null)

  p("## Duplicate / near-duplicate titles")
  p("")
  p(`Exact duplicate names: ${dupNames.length}`)
  for (const d of dupNames) p(`- "${d.key}" → ids ${d.ids.join(", ")}`)
  if (dupSlugPrefix === null) {
    p("")
    p("_Near-duplicate check skipped: `pg_trgm` similarity() unavailable._")
  } else {
    p("")
    p(`Near-duplicates (similarity > 0.75): ${dupSlugPrefix.length}`)
    for (const d of dupSlugPrefix) p(`- #${d.a_id} "${d.a_name}" ≈ #${d.b_id} "${d.b_name}" (${Number(d.sim).toFixed(2)})`)
  }
  p("")

  // ---- Real activity / demo data ----------------------------------------
  const activity = {}
  for (const [label, sql] of [
    ["reviews", "SELECT count(*)::int n FROM reviews"],
    ["orders", "SELECT count(*)::int n FROM orders"],
    ["orders_completed", "SELECT count(*)::int n FROM orders WHERE status='completed'"],
    ["orders_pending", "SELECT count(*)::int n FROM orders WHERE status='pending_payment'"],
    ["orders_refunded", "SELECT count(*)::int n FROM orders WHERE status IN ('refunded','partially_refunded')"],
    ["users", 'SELECT count(*)::int n FROM "user"'],
    ["entitlements", "SELECT count(*)::int n FROM entitlements"],
    ["support_tickets", "SELECT count(*)::int n FROM support_tickets"],
    ["download_events", "SELECT count(*)::int n FROM download_events"],
    ["categories", "SELECT count(*)::int n FROM categories"],
    ["categories_departments", "SELECT count(*)::int n FROM categories WHERE \"parentId\" IS NULL"],
  ]) {
    activity[label] = (await q(sql).catch(() => [{ n: "ERROR" }]))[0].n
  }

  p("## Real activity")
  p("")
  p("| Table | Rows |")
  p("|---|---|")
  for (const [k, v] of Object.entries(activity)) p(`| ${k} | ${v} |`)
  p("")

  // Heuristic demo-data detection. Flags only; nothing is deleted.
  const suspicious = await q(`
    SELECT 'user' AS kind, id::text, email AS detail FROM "user"
      WHERE email ILIKE '%example.com' OR email ILIKE '%test%' OR email ILIKE '%demo%' OR email ILIKE '%seed%'
    UNION ALL
    SELECT 'order', id::text, "billingEmail" FROM orders
      WHERE "billingEmail" ILIKE '%example.com' OR "billingEmail" ILIKE '%test%' OR "billingEmail" ILIKE '%demo%'
    UNION ALL
    SELECT 'support_ticket', id::text, email FROM support_tickets
      WHERE email ILIKE '%example.com' OR email ILIKE '%test%' OR email ILIKE '%demo%'
    LIMIT 200`).catch(() => [])

  p("## Possible demo / test data in production")
  p("")
  if (!suspicious.length) p("No rows matched the example.com / test / demo / seed heuristics.")
  else {
    p("Flagged for human review — heuristic only, these may be legitimate:")
    p("")
    p("| Kind | id | Detail |")
    p("|---|---|---|")
    for (const r of suspicious) p(`| ${r.kind} | ${r.id} | ${r.detail} |`)
  }
  p("")

  // ---- Public claims vs reality -----------------------------------------
  const [publicCounts] = await q(
    `SELECT
       (SELECT count(*)::int FROM products p
         WHERE p.status='published' AND p."assetStatus"='ready'
           AND p."rightsStatus" = ANY($1)) AS public_products,
       (SELECT count(*)::int FROM categories WHERE "parentId" IS NOT NULL) AS public_categories,
       (SELECT count(*)::int FROM reviews) AS review_count,
       (SELECT coalesce(avg(rating),0) FROM reviews) AS avg_rating`,
    [APPROVED_RIGHTS],
  )

  p("## Public claims vs database")
  p("")
  p("These are the numbers the storefront renders (hero, About). They come from")
  p("`getCatalogStats()`, which applies the same filter used here.")
  p("")
  p("| Public claim | Real value |")
  p("|---|---|")
  p(`| Products shown publicly | ${publicCounts.public_products} |`)
  p(`| Categories shown publicly | ${publicCounts.public_categories} |`)
  p(`| Reviews | ${publicCounts.review_count} |`)
  p(`| Average rating | ${Number(publicCounts.avg_rating).toFixed(2)} |`)
  p("")
  if (publicCounts.review_count === 0) {
    p("Reviews are zero, and the hero/About stat cards are already gated on")
    p("`reviewCount > 0`, so no rating is displayed. Correct behaviour.")
    p("")
  }

  p("## Caveat — asset reachability not proven")
  p("")
  p("This audit confirms a `product_files` row exists and carries a blob")
  p("pathname. It does NOT confirm the object is present and readable in the")
  p("Blob store — that requires a per-file HEAD against Vercel Blob with the")
  p("store token. Products marked PASS here may still fail to deliver.")
  p("Run the blob reachability check separately before claiming fulfilment works.")
  p("")

  mkdirSync("docs", { recursive: true })
  writeFileSync("docs/CATALOG-AUDIT.md", out.join("\n"), "utf8")

  console.log(`Products: ${totals.total} (published ${totals.published}, draft ${totals.draft})`)
  console.log(`PASS ${counts.PASS} | NEEDS REVIEW ${counts["NEEDS REVIEW"]} | BLOCKER ${counts.BLOCKER}`)
  console.log(`Reviews: ${activity.reviews} | Orders: ${activity.orders} | Users: ${activity.users}`)
  console.log("Report written to docs/CATALOG-AUDIT.md")
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => pool.end())
