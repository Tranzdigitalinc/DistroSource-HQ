import fs from "node:fs"
import path from "node:path"
import { put } from "@vercel/blob"

const FILES_DIR = "/vercel/share/v0-project/.v0/seed/files"
const IMAGES_DIR = "/vercel/share/v0-project/.v0/seed/images"
const OUT_PATH = "/vercel/share/v0-project/.v0/seed/manifest.json"

const fileNames = [
  "invoice-proposal-pack.zip",
  "contract-nda-bundle.zip",
  "youtube-branding-kit.zip",
  "podcast-launch-kit.zip",
  "freelancer-onboarding-kit.zip",
  "freelance-rate-calculator.zip",
  "kids-chore-chart.zip",
  "family-meal-planner.zip",
  "social-media-content-calendar.zip",
  "email-marketing-swipe-file.zip",
]

const imageNames = [
  "invoice-proposal-pack-cover.png",
  "contract-nda-bundle-cover.png",
  "youtube-branding-kit-cover.png",
  "podcast-launch-kit-cover.png",
  "freelancer-onboarding-kit-cover.png",
  "freelance-rate-calculator-cover.png",
  "kids-chore-chart-cover.png",
  "family-meal-planner-cover.png",
  "social-media-content-calendar-cover.png",
  "email-marketing-swipe-file-cover.png",
]

const manifest = JSON.parse(fs.readFileSync(OUT_PATH, "utf-8"))

for (const name of fileNames) {
  const filePath = path.join(FILES_DIR, name)
  const buffer = fs.readFileSync(filePath)
  const pathname = `products/files/${name}`
  const blob = await put(pathname, buffer, { access: "public", addRandomSuffix: true })
  manifest.files[name] = { url: blob.url, pathname: blob.pathname }
  console.log("uploaded", pathname, "->", blob.url)
}

for (const name of imageNames) {
  const filePath = path.join(IMAGES_DIR, name)
  const buffer = fs.readFileSync(filePath)
  const pathname = `products/images/${name}`
  const blob = await put(pathname, buffer, { access: "public", addRandomSuffix: false })
  manifest.images[name] = { url: blob.url, pathname: blob.pathname }
  console.log("uploaded", pathname, "->", blob.url)
}

fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2))
console.log("Manifest updated at", OUT_PATH)
