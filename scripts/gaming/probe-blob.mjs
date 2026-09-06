/**
 * Read-only check that BLOB_READ_WRITE_TOKEN works, and what already lives
 * under the gaming/ prefix — so nothing existing is overwritten by accident.
 *
 * Run from the repo root:  node --env-file=.env.local scripts/gaming/probe-blob.mjs
 */
import { list } from "@vercel/blob"

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is not set")
  process.exit(1)
}

const r = await list({ prefix: "gaming/", limit: 50 })
console.log(`blobs under gaming/: ${r.blobs.length}${r.hasMore ? " (more not listed)" : ""}`)
for (const b of r.blobs) console.log(`  ${b.pathname}  ${b.size} bytes`)

// Sanity: the store answers at all, and how it is organised at the top level.
const top = await list({ limit: 15 })
const prefixes = new Set(top.blobs.map((b) => b.pathname.split("/")[0]))
console.log(`\nstore reachable: yes · sample top-level prefixes: ${[...prefixes].join(", ") || "(empty store)"}`)
