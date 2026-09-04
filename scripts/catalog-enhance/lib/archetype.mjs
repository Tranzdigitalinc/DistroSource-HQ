/**
 * Archetype detection.
 *
 * Every product's copy is driven by (a) what kind of thing it is and (b) the
 * subject it addresses. Both are derived from data already in the database —
 * category, name and tagline — so the generated copy is anchored to the real
 * product rather than invented.
 *
 * Product names follow "Brand — Descriptor" (e.g. "Trailmap — Travel &
 * Booking App UI Kit"). The descriptor carries the subject; the brand is a
 * made-up word and is deliberately never used as a noun in the copy.
 */

/** Ordered: the first matching rule wins, so specific rules precede general. */
const ARCHETYPE_RULES = [
  { id: "admin-dashboard", test: (t, c) => /admin dashboard|dashboard (template|ui)/.test(t) || c === "Admin Dashboards" },
  { id: "spreadsheet", test: (t, c) => /spreadsheet|excel|workbook|tracker|calculator|budget|financial model/.test(t) || c === "Excel / Spreadsheet Templates" },
  { id: "presentation", test: (t, c) => /presentation|slide|deck|pitch/.test(t) || c === "Presentation Templates" },
  { id: "resume", test: (t, c) => /resume|cv\b|cover letter/.test(t) || c === "Resume / CV Templates" },
  { id: "notion", test: (t, c) => /notion|workspace template/.test(t) || c === "Notion / Workspace Templates" },
  { id: "document", test: (t, c) => /contract|nda|agreement|proposal|invoice|policy|report template|letterhead|document/.test(t) || c === "Templates & Documents" || c === "Business Templates" },
  { id: "planner", test: (t, c) => /planner|checklist|journal|habit|schedule/.test(t) || c === "Productivity & Planners" || c === "Productivity Tools" },
  { id: "react-template", test: (t, c) => /next\.?js|react|tsx/.test(t) || c === "React / Next.js Templates" },
  { id: "ecommerce-template", test: (t, c) => /ecommerce|e-commerce|shop|store template/.test(t) || c === "Ecommerce Templates" },
  { id: "landing-page", test: (t, c) => /landing page|waitlist|coming soon/.test(t) || c === "Landing Pages" },
  { id: "website-template", test: (t, c) => /website template|html template|web template/.test(t) || c === "Website Templates" || c === "HTML Templates" || c === "Code & Web Templates" },
  { id: "ui-kit", test: (t, c) => /ui kit|ux kit|design system|wireframe/.test(t) || c === "UI/UX Kits" },
  { id: "icon-pack", test: (t, c) => /icon/.test(t) || c === "Icons" || c === "Graphics & Icons" },
  { id: "mockup", test: (t, c) => /mockup|mock-up/.test(t) || c === "Mockups" },
  { id: "social", test: (t, c) => /social media|instagram|story|post pack/.test(t) || c === "Social Media Templates" },
  { id: "font", test: (t, c) => /font|typeface|typography|serif|sans/.test(t) || c === "Fonts" },
  { id: "branding", test: (t, c) => /brand|logo|identity|style guide/.test(t) || c === "Design & Branding" },
  { id: "three-d", test: (t, c) => /3d|blender|render|model/.test(t) || c === "3D Assets" || c === "3D & Print Files" },
  { id: "audio", test: (t, c) => /audio|sound|music|loop|sfx/.test(t) || c === "Audio" },
  { id: "preset", test: (t, c) => /preset|lightroom|lut|filter/.test(t) || c === "Photography Presets" },
  { id: "bundle", test: (t, c) => /bundle/.test(t) || c === "Digital Bundles" || c === "Bundles" },
  { id: "graphic", test: (t, c) => /graphic|illustration|pattern|texture|vector/.test(t) || c === "Graphics" },
]

export function detectArchetype(product, categoryName) {
  const haystack = `${product.name} ${product.tagline ?? ""}`.toLowerCase()
  for (const rule of ARCHETYPE_RULES) {
    if (rule.test(haystack, categoryName)) return rule.id
  }
  return "graphic"
}

/**
 * Splits "Brand — Descriptor" into its parts. Falls back gracefully for names
 * that do not use the dash convention.
 */
export function splitName(name) {
  const m = name.split(/\s+[—–-]\s+/)
  if (m.length >= 2) return { brand: m[0].trim(), descriptor: m.slice(1).join(" — ").trim() }
  return { brand: name.trim(), descriptor: name.trim() }
}

/**
 * The subject a product addresses, in lower case and stripped of the
 * archetype noun — "Language Learning App Mobile UI Kit" -> "language
 * learning app". Used to make copy read about the product's actual domain.
 */
const TRAILING_NOUNS =
  /\s*(mobile\s+)?(ui\s*\/?\s*ux\s+kit|ui kit|design system|admin dashboard|dashboard|website template|html template|web template|landing page|template|spreadsheet|workbook|tracker|calculator|planner|presentation|slide deck|deck|icon pack|icon set|mockup|bundle|pack|kit|system|toolkit|set)\s*$/i

export function subjectOf(name, tagline) {
  const { descriptor } = splitName(name)
  let subject = descriptor
  // Strip trailing archetype nouns repeatedly ("... Mobile UI Kit" -> "...").
  for (let i = 0; i < 3; i++) {
    const next = subject.replace(TRAILING_NOUNS, "").trim()
    if (next === subject || !next) break
    subject = next
  }
  subject = subject.replace(/\s*[—–-]\s*$/, "").trim()
  if (!subject || subject.length < 3) {
    subject = (tagline ?? descriptor).split(/[.,]/)[0].trim()
  }
  // '&' reads poorly inside prose sentences.
  return subject
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s{2,}/g, " ")
    .trim()
}

/**
 * Turns a bare subject into something that reads as a noun phrase inside a
 * sentence. 'fintech' alone produces 'teams designing fintech'; appending a
 * head noun gives 'teams designing fintech products'. Subjects that already
 * end in a concrete noun are left alone.
 */
const HAS_HEAD_NOUN =
  /(apps?|sites?|stores?|shops?|businesses|business|teams?|projects?|products?|agencies|agency|studios?|clinics?|restaurants?|companies|company|services?|platforms?|dashboards?|systems?|brands?|kits?|packs?|pages?|portfolios?|blogs?|schools?|hotels?|salons?|gyms?|clubs?|charities|nonprofits?)$/i

export function nounPhrase(subject) {
  if (!subject) return 'digital projects'
  return HAS_HEAD_NOUN.test(subject) ? subject : subject + ' projects'
}

/** Deterministic per-product RNG so re-runs produce identical copy. */
export function seededPicker(seed) {
  let state = seed * 2654435761 % 2147483647
  if (state <= 0) state += 2147483646
  return function pick(list) {
    state = (state * 16807) % 2147483647
    return list[state % list.length]
  }
}
