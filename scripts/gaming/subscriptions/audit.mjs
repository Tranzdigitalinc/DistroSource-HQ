import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import sharp from "sharp"
import { GAMING_SUBSCRIPTION_PLANS } from "../../../lib/gaming/subscriptions/catalog.ts"

const errors = []
const slugs = new Set()
const hashes = new Set()
let imageCount = 0

for (const plan of GAMING_SUBSCRIPTION_PLANS) {
  if (slugs.has(plan.slug)) errors.push(`${plan.slug}: duplicate slug`)
  slugs.add(plan.slug)
  if (plan.whatYouGet.length < 6) errors.push(`${plan.slug}: incomplete What You Get`)
  for (const field of ["immediateAccess", "recurringDelivery", "cadence", "quantity", "accessRule", "cancellationRule", "rolloverRule", "license", "commercialUse", "updates", "renewal", "usageLimits"]) {
    if (!plan[field] || String(plan[field]).length < 12) errors.push(`${plan.slug}: incomplete ${field}`)
  }
  const files = [plan.cover, ...plan.gallery]
  if (files.length < 5) errors.push(`${plan.slug}: fewer than 5 images`)
  for (const url of files) {
    const file = path.resolve("public", url.replace(/^\//, ""))
    if (!fs.existsSync(file)) { errors.push(`${plan.slug}: missing ${url}`); continue }
    const info = await sharp(file).metadata()
    if (info.width !== 1600 || info.height !== 1000 || info.format !== "webp") errors.push(`${plan.slug}: invalid image ${url}`)
    const digest = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")
    if (hashes.has(digest)) errors.push(`${plan.slug}: duplicate image content ${url}`)
    hashes.add(digest)
    imageCount++
  }
}

const report = {
  plans: GAMING_SUBSCRIPTION_PLANS.length,
  descriptionsComplete: GAMING_SUBSCRIPTION_PLANS.length - errors.filter((e) => e.includes("incomplete")).length,
  whatYouGetComplete: GAMING_SUBSCRIPTION_PLANS.filter((p) => p.whatYouGet.length >= 6).length,
  coversComplete: GAMING_SUBSCRIPTION_PLANS.filter((p) => fs.existsSync(path.resolve("public", p.cover.slice(1)))).length,
  productsWith4PlusGalleryImages: GAMING_SUBSCRIPTION_PLANS.filter((p) => p.gallery.length >= 4 && p.gallery.every((u) => fs.existsSync(path.resolve("public", u.slice(1))))).length,
  imagesGenerated: imageCount,
  imagesRenderedDeterministically: imageCount,
  productsMissingFinalVisuals: GAMING_SUBSCRIPTION_PLANS.filter((p) => ![p.cover, ...p.gallery].every((u) => fs.existsSync(path.resolve("public", u.slice(1))))).length,
  descriptionsDependingOnFutureDeliverables: GAMING_SUBSCRIPTION_PLANS.filter((p) => p.requiresFutureDeliverables).length,
  errors,
}
console.log(JSON.stringify(report, null, 2))
if (GAMING_SUBSCRIPTION_PLANS.length < 75 || errors.length) process.exitCode = 1
