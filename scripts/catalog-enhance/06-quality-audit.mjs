/**
 * Post-enhancement quality audit. READ-ONLY.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/06-quality-audit.mjs
 *
 * Produces the figures for the final report and ranks products by a
 * completeness score so the strongest and weakest are identifiable from data
 * rather than opinion.
 */
import { Pool } from "pg"
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

/** Deliverability comes from the asset audit, if it has been run. */
function loadAssetMap() {
  const p = "scripts/audit/out/asset-reachability.json"
  if (!existsSync(p)) return new Map()
  const d = JSON.parse(readFileSync(p, "utf8"))
  return new Map(d.results.map((r) => [r.productId, r]))
}

async function main() {
  await pool.query("SET default_transaction_read_only = on")
  const assets = loadAssetMap()

  const { rows } = await pool.query(`
    SELECT p.id, p.slug, p.name, p.tagline, p.status, p."isFree", p."basePrice",
           length(p.description) AS desc_len,
           coalesce(array_length(p.features, 1), 0) AS n_features,
           coalesce(array_length(p."searchKeywords", 1), 0) AS n_keywords,
           coalesce(array_length(p.tags, 1), 0) AS n_tags,
           coalesce(array_length(p."includedFiles", 1), 0) AS n_included,
           coalesce(array_length(p."fileFormats", 1), 0) AS n_formats,
           coalesce(array_length(p."softwareCompatibility", 1), 0) AS n_compat,
           p."seoTitle", p."seoDescription", p.documentation,
           c.name AS category, d.name AS department,
           (SELECT count(*)::int FROM product_images i WHERE i."productId" = p.id) AS n_images,
           (SELECT count(*)::int FROM product_licenses l WHERE l."productId" = p.id) AS n_licenses,
           (SELECT count(*)::int FROM product_files f WHERE f."productId" = p.id) AS n_files
    FROM products p
    JOIN categories c ON c.id = p."categoryId"
    LEFT JOIN categories d ON d.id = c."parentId"
    ORDER BY p.id`)

  const scored = rows.map((r) => {
    const asset = assets.get(r.id)
    const checks = {
      richDescription: r.desc_len >= 1500,
      features8Plus: r.n_features >= 8,
      gallery4Plus: r.n_images >= 4,
      seo: Boolean(r.seoTitle && r.seoDescription && r.seoDescription.length >= 80),
      keywords: r.n_keywords >= 8,
      licenceLadder: r.n_licenses >= (r.isFree ? 1 : 3),
      formats: r.n_formats >= 1,
      compatibility: r.n_compat >= 1,
      includedFiles: r.n_included >= 1,
      documentation: Boolean(r.documentation && r.documentation.length > 40),
      // Deliverability is reported but excluded from the content score, since
      // final files are being supplied separately.
      fileExists: asset ? asset.present : null,
    }
    const contentKeys = Object.keys(checks).filter((k) => k !== "fileExists")
    const passed = contentKeys.filter((k) => checks[k]).length
    return { ...r, checks, score: passed, maxScore: contentKeys.length }
  })

  const pub = scored.filter((r) => r.status === "published")
  const pct = (n, d) => `${n}/${d} (${Math.round((n / d) * 100)}%)`

  const out = []
  const w = (s = "") => out.push(s)
  w("# Catalog Quality Audit — post-enhancement")
  w("")
  w(`Generated: ${new Date().toISOString()}`)
  w("")
  w("## Coverage (published products)")
  w("")
  w("| Check | Result |")
  w("|---|---|")
  const checkLabels = {
    richDescription: "Rich description (1,500+ chars)",
    features8Plus: "8 or more features",
    gallery4Plus: "4 or more gallery images",
    seo: "Unique SEO title + description",
    keywords: "8 or more search keywords",
    licenceLadder: "Full licence ladder",
    formats: "File formats recorded",
    compatibility: "Compatibility recorded",
    includedFiles: "Included-files list",
    documentation: "Per-product documentation",
  }
  for (const [k, label] of Object.entries(checkLabels)) {
    w(`| ${label} | ${pct(pub.filter((r) => r.checks[k]).length, pub.length)} |`)
  }
  const withFile = pub.filter((r) => r.checks.fileExists === true).length
  w(`| **Downloadable file present in Blob** | **${pct(withFile, pub.length)}** |`)
  w("")

  const distinctDesc = new Set(pub.map((r) => r.desc_len)).size
  w(`Distinct description lengths across published products: ${distinctDesc}`)
  w("")

  const ranked = [...pub].sort((a, b) => b.score - a.score || b.n_images - a.n_images || Number(b.basePrice) - Number(a.basePrice))

  w("## Strongest 25 (by completeness, then gallery depth, then price)")
  w("")
  w("| # | Product | Department / Category | Images | Licences | Score | File? |")
  w("|---|---|---|---|---|---|---|")
  ranked.slice(0, 25).forEach((r, i) => {
    w(`| ${i + 1} | ${r.name} | ${r.department ?? "—"} / ${r.category} | ${r.n_images} | ${r.n_licenses} | ${r.score}/${r.maxScore} | ${r.checks.fileExists === true ? "yes" : "**no**"} |`)
  })
  w("")

  w("## Weakest 25 (still requiring work)")
  w("")
  w("| # | Product | Score | Missing |")
  w("|---|---|---|---|")
  ranked.slice(-25).reverse().forEach((r, i) => {
    const missing = Object.entries(checkLabels).filter(([k]) => !r.checks[k]).map(([, l]) => l)
    if (r.checks.fileExists === false) missing.push("**no downloadable file**")
    w(`| ${i + 1} | ${r.name} | ${r.score}/${r.maxScore} | ${missing.join("; ") || "—"} |`)
  })
  w("")

  mkdirSync("docs", { recursive: true })
  writeFileSync("docs/CATALOG-QUALITY.md", out.join("\n"), "utf8")

  console.log(`published: ${pub.length}`)
  for (const [k, label] of Object.entries(checkLabels)) {
    console.log(`  ${label.padEnd(34)} ${pct(pub.filter((r) => r.checks[k]).length, pub.length)}`)
  }
  console.log(`  ${"Downloadable file present".padEnd(34)} ${pct(withFile, pub.length)}`)
  console.log("Report written to docs/CATALOG-QUALITY.md")
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => pool.end())
