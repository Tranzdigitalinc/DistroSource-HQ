/**
 * Upload subscription media to DistroSource's Vercel Blob store and mirror the
 * recurring catalog into Fungies. The command is intentionally dry-run by
 * default and every Fungies product is forced to DRAFT.
 *
 * Dry run:
 *   pnpm gaming:subscriptions:fungies
 *
 * Apply with Blob upload:
 *   node --env-file=.env.local --experimental-strip-types \
 *     scripts/gaming/subscriptions/provision-fungies.mjs --apply
 *
 * Required: FUNGIES_PUBLIC_KEY, FUNGIES_SECRET_KEY, FUNGIES_PROJECT_ID,
 * BLOB_READ_WRITE_TOKEN. Set FUNGIES_MEDIA_BASE_URL only when the same files
 * are already hosted on another DistroSource-controlled public origin; pair
 * it with --skip-upload.
 */
import fs from "node:fs"
import path from "node:path"
import { setTimeout as delay } from "node:timers/promises"
import { put } from "@vercel/blob"
import { GAMING_SUBSCRIPTION_PLANS, planDescriptionHtml } from "../../../lib/gaming/subscriptions/catalog.ts"

const API = "https://api.fungies.io/v0"
const APPLY = process.argv.includes("--apply")
const SKIP_UPLOAD = process.argv.includes("--skip-upload")
const STATE_PATH = path.resolve(".gaming-subscriptions/fungies-state.json")
const STATUS = "DRAFT"

function required(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required.`)
  return value
}

function idFor(slug, suffix = "") {
  return `dshq:gsub:${slug}${suffix ? `:${suffix}` : ""}`
}

function localImages(plan) {
  return [plan.cover, ...plan.gallery].map((url) => path.resolve("public", url.slice(1)))
}

function validateCatalog() {
  if (GAMING_SUBSCRIPTION_PLANS.length < 75) throw new Error("Refusing to provision fewer than 75 recurring Gaming offers.")
  const slugs = new Set()
  for (const plan of GAMING_SUBSCRIPTION_PLANS) {
    if (slugs.has(plan.slug)) throw new Error(`Duplicate plan slug: ${plan.slug}`)
    slugs.add(plan.slug)
    if (!plan.previewOnly || !plan.requiresFutureDeliverables) throw new Error(`${plan.slug} must remain preview-only until deliverables exist.`)
    if (plan.whatYouGet.length < 6 || plan.gallery.length < 4) throw new Error(`${plan.slug} has incomplete copy or media.`)
    for (const file of localImages(plan)) if (!fs.existsSync(file)) throw new Error(`Missing image: ${file}`)
  }
}

async function uploadMedia() {
  const base = process.env.FUNGIES_MEDIA_BASE_URL?.replace(/\/$/, "")
  if (SKIP_UPLOAD) {
    if (!base?.startsWith("https://")) throw new Error("--skip-upload requires an HTTPS FUNGIES_MEDIA_BASE_URL.")
    return Object.fromEntries(GAMING_SUBSCRIPTION_PLANS.map((plan) => [plan.slug, [plan.cover, ...plan.gallery].map((url) => `${base}${url}`)]))
  }
  required("BLOB_READ_WRITE_TOKEN")
  const media = {}
  for (const [planIndex, plan] of GAMING_SUBSCRIPTION_PLANS.entries()) {
    media[plan.slug] = []
    for (const file of localImages(plan)) {
      const pathname = path.relative(path.resolve("public"), file).split(path.sep).join("/")
      const result = await put(pathname, fs.readFileSync(file), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "image/webp",
      })
      media[plan.slug].push(result.url)
    }
    console.log(`[media ${planIndex + 1}/${GAMING_SUBSCRIPTION_PLANS.length}] ${plan.slug}`)
  }
  return media
}

async function request(endpoint, init = {}, attempt = 0) {
  const response = await fetch(`${API}${endpoint}`, {
    ...init,
    headers: {
      "x-fngs-public-key": required("FUNGIES_PUBLIC_KEY"),
      ...(init.method && init.method !== "GET" ? { "x-fngs-secret-key": required("FUNGIES_SECRET_KEY") } : {}),
      "Content-Type": "application/json",
    },
  })
  if (response.status === 429 && attempt < 5) {
    const retryAfter = Number(response.headers.get("retry-after"))
    await delay(Number.isFinite(retryAfter) ? retryAfter * 1000 : 750 * 2 ** attempt)
    return request(endpoint, init, attempt + 1)
  }
  const envelope = await response.json().catch(() => ({}))
  if (!response.ok || envelope.status === "error") {
    const detail = typeof envelope.error === "string" ? envelope.error : envelope.error?.message ?? envelope.message ?? response.statusText
    throw new Error(`${init.method ?? "GET"} ${endpoint}: ${detail} (${response.status})`)
  }
  if (!envelope.data) throw new Error(`${endpoint}: Fungies returned an empty response.`)
  return envelope.data
}

async function listProducts(projectId) {
  const products = []
  for (let skip = 0; ; skip += 100) {
    const params = new URLSearchParams({ projectId, take: "100", skip: String(skip), withArchived: "true", types: "Subscription" })
    const data = await request(`/products/list?${params}`, { method: "GET" })
    const page = data.products ?? []
    products.push(...page)
    if (page.length < 100) return products
  }
}

function productPayload(plan, projectId, urls) {
  return {
    name: plan.name,
    description: planDescriptionHtml(plan),
    cover: urls[0],
    gallery: urls.slice(1).map((value) => ({ value })),
    features: plan.whatYouGet.slice(0, 8).map((value) => ({ value })),
    status: STATUS,
    externalId: idFor(plan.slug),
    projectId,
    type: "Subscription",
  }
}

function offerPayload(plan, productId, variantId, interval) {
  const annual = interval === "annual"
  return {
    productId,
    variantId,
    name: `${plan.name} — ${annual ? "Annual" : "Monthly"}`,
    description: annual ? `Annual billing for ${plan.name}; benefits are still granted on the monthly cadence stated in the product description.` : `Monthly billing for ${plan.name}.`,
    cover: plan.cover,
    currency: "USD",
    price: annual ? plan.annualPriceUsd : plan.monthlyPriceUsd,
    limit: null,
    region: "Global",
    platform: "Other",
    recurringInterval: annual ? "year" : "month",
    recurringIntervalCount: 1,
    externalId: idFor(plan.slug, interval),
  }
}

function loadState() {
  if (!fs.existsSync(STATE_PATH)) return { version: 1, status: STATUS, products: {} }
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"))
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true })
  const temp = `${STATE_PATH}.tmp`
  fs.writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`)
  fs.renameSync(temp, STATE_PATH)
}

async function resolveExisting(product, remembered) {
  const productId = product?.id ?? remembered?.productId
  if (!productId) return { productId: null, planId: null, monthlyOfferId: null, annualOfferId: null }
  const data = await request(`/products/${encodeURIComponent(productId)}`, { method: "GET" })
  const full = data.product ?? product
  const variants = full.variants ?? full.plans ?? []
  const offers = full.offers ?? []
  return {
    productId,
    planId: variants.find((item) => item.internalId === idFor(full.internalId?.replace("dshq:gsub:", "") ?? "", "plan"))?.id ?? remembered?.planId ?? variants[0]?.id ?? null,
    monthlyOfferId: offers.find((item) => item.internalId?.endsWith(":monthly"))?.id ?? remembered?.monthlyOfferId ?? null,
    annualOfferId: offers.find((item) => item.internalId?.endsWith(":annual"))?.id ?? remembered?.annualOfferId ?? null,
  }
}

async function provision() {
  validateCatalog()
  console.log(`Validated ${GAMING_SUBSCRIPTION_PLANS.length} plans and ${GAMING_SUBSCRIPTION_PLANS.length * 5} local images.`)
  console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN"}; Fungies status is locked to ${STATUS}.`)
  if (!APPLY) {
    console.log("Would upload 500 images, then create/update 100 draft Subscription products, 100 plans and 200 recurring offers.")
    console.log("No external request was made. Pass --apply with the required environment variables to execute.")
    return
  }

  const projectId = required("FUNGIES_PROJECT_ID")
  required("FUNGIES_PUBLIC_KEY")
  required("FUNGIES_SECRET_KEY")
  const media = await uploadMedia()
  const existingProducts = await listProducts(projectId)
  const byInternalId = new Map(existingProducts.map((product) => [product.internalId, product]))
  const state = loadState()

  for (const [index, plan] of GAMING_SUBSCRIPTION_PLANS.entries()) {
    const productExternalId = idFor(plan.slug)
    const known = state.products[plan.slug]
    const existing = byInternalId.get(productExternalId)
    let ids = await resolveExisting(existing, known)
    const payload = productPayload(plan, projectId, media[plan.slug])

    if (!ids.productId) {
      const data = await request("/products/create", { method: "POST", body: JSON.stringify(payload) })
      ids.productId = data.product?.id
      if (!ids.productId) throw new Error(`${plan.slug}: no product id returned`)
    } else {
      await request(`/products/${encodeURIComponent(ids.productId)}/update`, { method: "PATCH", body: JSON.stringify({ ...payload, id: ids.productId }) })
    }

    if (!ids.planId) {
      const data = await request(`/products/${encodeURIComponent(ids.productId)}/plans/add`, {
        method: "POST",
        body: JSON.stringify({
          name: plan.name,
          description: plan.summary,
          features: plan.whatYouGet.slice(0, 8).map((value) => ({ value })),
          cover: media[plan.slug][0],
          externalId: idFor(plan.slug, "plan"),
        }),
      })
      ids.planId = data.plan?.id
      if (!ids.planId) throw new Error(`${plan.slug}: no plan id returned`)
    }

    for (const interval of ["monthly", "annual"]) {
      const key = interval === "monthly" ? "monthlyOfferId" : "annualOfferId"
      const offer = offerPayload(plan, ids.productId, ids.planId, interval)
      offer.cover = media[plan.slug][0]
      if (!ids[key]) {
        const data = await request("/offers/create", { method: "POST", body: JSON.stringify(offer) })
        ids[key] = data.offer?.id
        if (!ids[key]) throw new Error(`${plan.slug}: no ${interval} offer id returned`)
      } else {
        await request(`/offers/${encodeURIComponent(ids[key])}/update`, { method: "PATCH", body: JSON.stringify({ ...offer, id: ids[key] }) })
      }
    }

    state.products[plan.slug] = { ...ids, externalId: productExternalId, syncedAt: new Date().toISOString() }
    state.projectId = projectId
    state.syncedAt = new Date().toISOString()
    saveState(state)
    console.log(`[fungies ${index + 1}/${GAMING_SUBSCRIPTION_PLANS.length}] ${plan.slug} (${ids.productId})`)
    await delay(125)
  }
  console.log(`Provisioned ${GAMING_SUBSCRIPTION_PLANS.length} DRAFT subscription products. State: ${STATE_PATH}`)
}

provision().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
