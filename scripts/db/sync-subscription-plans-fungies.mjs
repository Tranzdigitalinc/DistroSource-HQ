// CLI mirror of lib/membership-fungies-sync.ts for running outside Next.js
// (the admin panel sync lives behind a login; this runs anywhere the keys do).
// Same guarantees: products matched on the externalId we set, only rows
// without a plan id are touched, the product id is recorded before the plan
// is added, and the run stops at the first failure.
//
//   node --env-file=.env.local scripts/db/sync-subscription-plans-fungies.mjs
//
// Prices are deliberately NOT synced — each signup's recurring offer is priced
// from the plan row at checkout; the Fungies plan is only a container.
import { Pool } from "pg"

const FUNGIES_API_BASE = "https://api.fungies.io/v0"
/** Same constant as lib/membership.ts — the reusable membership product. */
const FUNGIES_MEMBERSHIP_PRODUCT_ID = "12b8129b-fccd-4d77-937c-26e737cbb997"
const SYNCED_PLAN_KINDS = ["club", "bundle", "all-access"]

const publicKey = process.env.FUNGIES_PUBLIC_KEY?.trim()
const secretKey = process.env.FUNGIES_SECRET_KEY?.trim()
if (!publicKey || !secretKey) {
  console.error("FUNGIES_PUBLIC_KEY and FUNGIES_SECRET_KEY are required.")
  process.exit(1)
}

async function fungiesFetch(path, { method = "GET", write = false, body } = {}) {
  const res = await fetch(`${FUNGIES_API_BASE}${path}`, {
    method,
    headers: {
      "x-fngs-public-key": publicKey,
      ...(write ? { "x-fngs-secret-key": secretKey } : {}),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.status === "error") {
    const detail = typeof json.error === "string" ? json.error : json.error?.message ?? json.message ?? `Fungies request failed with status ${res.status}`
    throw new Error(detail)
  }
  if (!json.data) throw new Error("Fungies returned an empty response.")
  return json.data
}

async function listFungiesProducts(type) {
  const all = []
  for (let skip = 0; ; skip += 100) {
    const data = await fungiesFetch(`/products/list?take=100&skip=${skip}`)
    const page = data.products ?? []
    all.push(...page.filter((p) => p.type === type))
    if (page.length < 100) return all
  }
}

const escapeHtml = (v) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

function describe(plan) {
  const claims = plan.monthlyCredits === null ? "Unlimited claims" : `${plan.monthlyCredits} claim${plan.monthlyCredits === 1 ? "" : "s"} each month`
  const cap = plan.creditValueCapUsd === null ? "any price" : `up to $${Number.parseFloat(plan.creditValueCapUsd).toFixed(0)} per claim`
  const perks = (plan.perks ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")
  return `<p>${escapeHtml(plan.tagline ?? plan.name)}</p><p>${claims}, ${cap}. Everything you claim stays yours under the personal licence.</p><ul>${perks}</ul>`
}

const externalIdFor = (plan) => `membership-plan.${plan.slug}`

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
try {
  const { rows: all } = await client.query(
    `SELECT id, slug, name, tagline, "monthlyCredits", "creditValueCapUsd", perks, "fungiesProductId", "fungiesPlanId"
       FROM membership_plans WHERE kind = ANY($1) ORDER BY "sortOrder"`,
    [SYNCED_PLAN_KINDS],
  )
  const todo = all.filter((p) => !p.fungiesPlanId)
  if (todo.length === 0) {
    console.log("Every club, bundle and All-Access plan already has a Fungies plan. Nothing to do.")
    process.exit(0)
  }
  console.log(`${todo.length} of ${all.length} plans need a Fungies plan.`)

  const existing = new Map()
  for (const fp of await listFungiesProducts("Subscription")) if (fp.internalId) existing.set(fp.internalId, fp)

  // New products copy the membership product's visibility (it already takes
  // payments) and its project, unless FUNGIES_PROJECT_ID names one.
  let status = "HIDDEN"
  let projectId = process.env.FUNGIES_PROJECT_ID?.trim() || null
  if (todo.some((p) => !existing.has(externalIdFor(p)))) {
    const { product: membership } = await fungiesFetch(`/products/${FUNGIES_MEMBERSHIP_PRODUCT_ID}`)
    status = membership.status ?? "HIDDEN"
    projectId ??= membership.projectId ?? membership.project?.id ?? null
  }

  let synced = 0
  for (const plan of todo) {
    const features = (plan.perks ?? []).slice(0, 8)
    let fp = existing.get(externalIdFor(plan))
    try {
      if (!fp && plan.fungiesProductId) {
        fp = await fungiesFetch(`/products/${encodeURIComponent(plan.fungiesProductId)}`).then((d) => d.product).catch(() => undefined)
      }
      let outcome = plan.fungiesProductId === fp?.id ? "plan-added" : "linked"
      if (!fp) {
        const data = await fungiesFetch("/products/create", {
          method: "POST",
          write: true,
          body: {
            type: "Subscription",
            name: `DistroSource — ${plan.name}`,
            description: describe(plan),
            features: features.map((value) => ({ value })),
            status,
            externalId: externalIdFor(plan),
            ...(projectId ? { projectId } : {}),
          },
        })
        if (!data.product?.id) throw new Error("Fungies did not return the created product.")
        fp = data.product
        outcome = "created"
      }
      // Recorded before the plan is added, so a failure in between never loses
      // the product; the plan id stays null until it really exists.
      if (plan.fungiesProductId !== fp.id) {
        await client.query(`UPDATE membership_plans SET "fungiesProductId" = $1, "fungiesPlanId" = NULL WHERE id = $2`, [fp.id, plan.id])
      }
      const data = await fungiesFetch(`/products/${encodeURIComponent(fp.id)}/plans/add`, {
        method: "POST",
        write: true,
        body: {
          name: plan.name,
          description: plan.tagline ?? plan.name,
          features: features.map((value) => ({ value })),
          externalId: `${externalIdFor(plan)}.plan`,
        },
      })
      if (!data.plan?.id) throw new Error("Fungies did not return the added plan.")
      await client.query(`UPDATE membership_plans SET "fungiesPlanId" = $1 WHERE id = $2`, [data.plan.id, plan.id])
      synced++
      console.log(`${plan.slug.padEnd(26)} ${outcome.padEnd(11)} product ${fp.id}  plan ${data.plan.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`${plan.slug.padEnd(26)} FAILED      ${message}`)
      const hint = /project/i.test(message) ? " Add FUNGIES_PROJECT_ID (the project id from your Fungies dashboard) and sync again." : ""
      console.error(`Stopped at ${plan.name}: ${message}${hint}`)
      break
    }
  }
  const { rows: [{ n: remaining }] } = await client.query(
    `SELECT COUNT(*)::int AS n FROM membership_plans WHERE kind = ANY($1) AND "fungiesPlanId" IS NULL`,
    [SYNCED_PLAN_KINDS],
  )
  console.log(`\nSynced ${synced} of ${todo.length} this run; plans still unmapped: ${remaining}.`)
  if (remaining > 0) process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
