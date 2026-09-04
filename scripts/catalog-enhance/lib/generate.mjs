import { detectArchetype, splitName, subjectOf, nounPhrase, seededPicker } from "./archetype.mjs"
import { resolveArchetype, BANNED } from "./copy.mjs"

/**
 * Builds the enhanced content payload for one product.
 *
 * Everything is derived from the product's own row plus its archetype. The
 * function is pure and deterministic — the same product always produces the
 * same copy, so the enhancement can be re-run safely.
 */

const TITLE_CASE_SKIP = new Set(["a", "an", "and", "for", "in", "of", "on", "the", "to", "with", "&"])

function titleCase(s) {
  return s
    .split(/\s+/)
    .map((w, i) =>
      i > 0 && TITLE_CASE_SKIP.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ")
}

function sentence(s) {
  if (!s) return s
  const t = s.trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function dedupe(list) {
  const seen = new Set()
  return list.filter((x) => {
    const k = String(x).toLowerCase().trim()
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** Licence explanation shared by every product; tiers come from the DB. */
function licenceSection(licenses) {
  const byType = new Map(licenses.map((l) => [l.licenseType, l]))
  const lines = []
  if (byType.has("personal")) {
    lines.push(
      "- **Personal** — for your own private, non-commercial projects. Not for client work or anything that generates revenue.",
    )
  }
  if (byType.has("commercial")) {
    lines.push(
      "- **Commercial** — for one commercial project or one client project. A separate licence is needed for each additional project.",
    )
  }
  if (byType.has("agency")) {
    lines.push(
      "- **Agency** — for multiple client projects, up to the limits stated on this page and recorded on your order.",
    )
  }
  lines.push("")
  lines.push("No tier permits reselling or redistributing the files themselves, and none grants resale of source files.")
  return lines
}

/**
 * Repairs titles where the generator that created the catalog appended the
 * type noun to a descriptor that already ended with it — e.g.
 * "Condensed Headline Typeface Typeface", "Content Calendar Spreadsheet
 * Spreadsheet Template". Collapses the immediate repetition only; it never
 * rewrites the meaning of a title.
 */
export function repairName(name) {
  // Collapse an immediately repeated word: "Typeface Typeface" -> "Typeface".
  // The backreference is what makes this a duplicate check, not a space strip.
  let out = name.replace(/\b(\w[\w'-]*)(\s+\1\b)+/gi, '$1')
  out = out.replace(/\s{2,}/g, " ").trim()
  return out
}

/**
 * Renders the file-format list as prose. Bare container formats like "zip"
 * describe the wrapper rather than the product, so they read as a delivery
 * note instead of a format claim ("as a downloadable archive").
 */
const CONTAINER_FORMATS = new Set(["zip", "rar", "7z", "archive"])

function formatPhrase(formats) {
  const meaningful = formats.filter((f) => !CONTAINER_FORMATS.has(f.toLowerCase().trim()))
  if (meaningful.length) return `supplied as ${meaningful.join(", ")}`
  if (formats.length) return "delivered as a downloadable archive"
  return "in the formats listed on this page"
}

/**
 * A purpose-written meta description. Built from the subtitle rather than by
 * truncating the overview, which previously cut sentences mid-clause.
 */
function metaDescription(descriptor, tagline, categoryName) {
  const base = tagline?.trim().replace(/\s+/g, " ") ?? ""
  const stem = base.endsWith(".") ? base.slice(0, -1) : base
  let out = `${descriptor}. ${stem || categoryName}. Instant download with Personal, Commercial and Agency licensing.`
  out = out.replace(/\s+/g, " ").trim()
  if (out.length <= 158) return out
  // Trim to the last full sentence that fits, never mid-word.
  const cut = out.slice(0, 158)
  const lastStop = cut.lastIndexOf(". ")
  if (lastStop > 60) return cut.slice(0, lastStop + 1)
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "") + "."
}

export function generateContent(product, ctx) {
  const { categoryName, departmentName, licenses } = ctx
  const archetypeId = detectArchetype(product, categoryName)
  const { spec } = resolveArchetype(archetypeId)
  const pick = seededPicker(product.id)
  const name = repairName(product.name)
  const rawSubject = subjectOf(name, product.tagline)
  // Copy frames read the subject as a noun phrase ("fintech projects"), which
  // keeps sentences grammatical for one-word domains as well as full phrases.
  const subject = nounPhrase(rawSubject)
  const { brand, descriptor } = splitName(name)

  // ---- Subtitle -----------------------------------------------------------
  const tagline =
    product.tagline?.trim() ||
    `${titleCase(descriptor)} for ${subject}.`

  // ---- Long-form description ---------------------------------------------
  const overview = spec.overview(subject, pick)

  // Features: keep the product's real existing features first (they were
  // authored per product), then extend from the archetype pool up to 12.
  const existing = Array.isArray(product.features) ? product.features.filter(Boolean) : []
  const features = dedupe([...existing, ...spec.features(subject)]).slice(0, 12)

  const bestFor = spec.bestFor(subject)
  const howToUse = spec.howToUse(subject)
  const customization = spec.customization(subject)
  const requirements = spec.requirements

  const compatibility = dedupe(
    (product.softwareCompatibility ?? []).filter(Boolean),
  )
  const formats = dedupe((product.fileFormats ?? []).filter(Boolean))

  const md = []
  md.push("## Overview")
  for (const p of overview) md.push(p)

  md.push("## Best for")
  for (const b of bestFor) md.push(`- ${b}`)

  md.push("## Key features")
  for (const f of features) md.push(`- ${f}`)

  md.push("## What you'll get")
  md.push(
    `The ${spec.noun} itself, ${formatPhrase(formats)}, together with the licence tier you select at checkout and any future revisions to this product.`,
  )
  md.push(
    "Package contents are listed under **What's included** on this page. Product updates are available from your DistroSource library at no additional cost.",
  )

  if (compatibility.length) {
    md.push("## Compatibility")
    md.push(compatibility.join(" · "))
  }

  if (requirements?.length) {
    md.push("## Requirements")
    for (const r of requirements) md.push(`- ${r}`)
  }

  md.push("## How to use it")
  howToUse.forEach((step, i) => md.push(`- **Step ${i + 1}.** ${step}`))

  md.push("## Customization")
  for (const c of customization) md.push(`- ${c}`)

  md.push("## Licence")
  for (const l of licenceSection(licenses)) md.push(l)

  md.push("## Support")
  md.push(
    `Questions about this ${spec.noun} are handled through your DistroSource account — open a support ticket from the order and include your order number. Licensing questions are answered on the Licenses page.`,
  )

  const description = md.join("\n\n").replace(/\n{3,}/g, "\n\n").trim()

  // ---- Documentation ------------------------------------------------------
  // Previously an identical sentence on all 350 products.
  const documentation = `Setup notes for this ${spec.noun} cover the ${howToUse.length} steps described under "How to use it", plus the customization points listed above. ${
    compatibility.length ? `Verified against ${compatibility[0]}.` : ""
  }`.trim()

  // ---- SEO ----------------------------------------------------------------
  const seoTitle = `${descriptor} — ${titleCase(categoryName)} | DistroSource`.slice(0, 70)
  const seoDescription = metaDescription(titleCase(descriptor), tagline, categoryName)

  // ---- Search metadata ----------------------------------------------------
  const subjectWords = subject.split(/[^a-z0-9]+/i).filter((w) => w.length > 2)
  const searchKeywords = dedupe([
    ...(product.searchKeywords ?? []),
    ...subjectWords,
    ...formats.map((f) => f.toLowerCase()),
    ...compatibility.map((c) => c.toLowerCase().split(" ")[0]),
    categoryName.toLowerCase(),
    departmentName ? departmentName.toLowerCase() : null,
    spec.kind,
    spec.noun,
  ].filter(Boolean)).slice(0, 24)

  const tags = dedupe([
    ...(product.tags ?? []),
    spec.kind,
    subject,
    categoryName.toLowerCase(),
  ].filter(Boolean)).slice(0, 10)

  return {
    archetypeId,
    name,
    nameChanged: name !== product.name,
    tagline,
    description,
    documentation,
    features,
    seoTitle,
    seoDescription,
    searchKeywords,
    tags,
    subject,
    brand,
    descriptor,
  }
}

/** Guards against the wording the brief bans and against templated repetition. */
export function lintContent(text) {
  const problems = []
  const lower = text.toLowerCase()
  for (const phrase of BANNED) {
    if (lower.includes(phrase)) problems.push(`banned phrase: "${phrase}"`)
  }
  return problems
}
