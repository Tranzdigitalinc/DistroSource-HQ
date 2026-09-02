import fs from "node:fs"
import path from "node:path"
import { put } from "@vercel/blob"

const FILES_DIR = "/vercel/share/v0-project/.v0/seed/files"
const IMAGES_DIR = "/vercel/share/v0-project/.v0/seed/images"
const OUT_PATH = "/vercel/share/v0-project/.v0/seed/manifest.json"

const fileEntries = fs
  .readdirSync(FILES_DIR)
  .filter((f) => f.endsWith(".zip") || f.endsWith(".ttf"))
  .map((f) => ({ name: f, dir: FILES_DIR, kind: "file" }))

const imageEntries = fs
  .readdirSync(IMAGES_DIR)
  .filter((f) => f.endsWith(".png"))
  .map((f) => ({ name: f, dir: IMAGES_DIR, kind: "image" }))

const manifest = { files: {}, images: {} }

async function uploadAll(entries) {
  for (const entry of entries) {
    const filePath = path.join(entry.dir, entry.name)
    const buffer = fs.readFileSync(filePath)
    const pathname = `products/${entry.kind}s/${entry.name}`
    const blob = await put(pathname, buffer, { access: "private", addRandomSuffix: false })
    manifest[entry.kind === "file" ? "files" : "images"][entry.name] = blob.pathname
    console.log("uploaded", pathname)
  }
}

await uploadAll(fileEntries)
await uploadAll(imageEntries)

fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2))
console.log("Manifest written to", OUT_PATH)
