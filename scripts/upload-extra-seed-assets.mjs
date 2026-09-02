import fs from "node:fs"
import path from "node:path"
import { put } from "@vercel/blob"

const FILES_DIR = "/vercel/share/v0-project/.v0/seed/files"
const OUT_PATH = "/vercel/share/v0-project/.v0/seed/manifest.json"

const names = ["iphone-mockup.zip", "apparel-mockup.zip", "instagram-pack.zip", "tiktok-pack.zip"]

const manifest = JSON.parse(fs.readFileSync(OUT_PATH, "utf-8"))

for (const name of names) {
  const filePath = path.join(FILES_DIR, name)
  const buffer = fs.readFileSync(filePath)
  const pathname = `products/files/${name}`
  const blob = await put(pathname, buffer, { access: "public", addRandomSuffix: true })
  manifest.files[name] = { url: blob.url, pathname: blob.pathname }
  console.log("uploaded", pathname, "->", blob.url)
}

fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2))
console.log("Manifest updated at", OUT_PATH)
