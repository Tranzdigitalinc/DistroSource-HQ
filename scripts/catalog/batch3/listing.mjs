// Store listing fields for a batch-3 product, in the same shape as the
// Originals listing (scripts/catalog/originals/generate.mjs → listingFor).
import path from "node:path"
import { commonFor } from "./package.mjs"

const SKIP = new Set(["TXT", "JSON"])

export function listingFor(p, files, zipBytes) {
  const c = commonFor(p)
  const get = p.get ?? (p.kind === "audio" ? [`${files.filter((f) => f.rel.endsWith(".wav")).length} WAV files (44.1 kHz / 16-bit stereo) in category folders`, "README and licence"] : [])
  const formats = Array.from(new Set(files.map((f) => path.extname(f.rel).slice(1).toUpperCase()).filter((e) => e && !SKIP.has(e))))
  const description = [
    "## Overview", ...p.overview, "",
    "## Best for", ...p.bestFor.map((b) => `- ${b}`), "",
    "## Key features", ...p.features.map((b) => `- ${b}`), "",
    "## What you'll get", ...get.map((b) => `- ${b}`), "",
    ...(c.compat ? ["## Compatibility", ...c.compat.map((b) => `- ${b}`), ""] : []),
    ...(c.requirements ? ["## Requirements", ...c.requirements.map((b) => `- ${b}`), ""] : []),
    ...(c.howTo ? ["## How to use it", ...c.howTo.map((b, i) => `${i + 1}. ${b}`), ""] : []),
    ...(p.note ? ["## Good to know", p.note, ""] : []),
    "## Licence",
    ...p.licences.map(([tier, text]) => `- **${tier[0].toUpperCase() + tier.slice(1)}** — ${text}`),
    "No tier permits reselling or redistributing the files themselves.", "",
    "## Support",
    `Questions about ${p.name.split(" — ")[0]} are handled through your DistroSource account — open a support ticket from the order and include your order number.`,
  ].join("\n")
  const tags = Array.from(new Set([...p.tags, p.subcategory.toLowerCase()]))
  return {
    description,
    features: p.features,
    tags,
    includedFiles: files.map((f) => f.rel).slice(0, 24),
    fileFormats: formats,
    softwareCompatibility: c.compat ?? [],
    fileSizeMb: Math.max(0.05, Math.round((zipBytes / 1048576) * 100) / 100),
    documentation: "README.txt and LICENSE.txt included. Setup follows the steps under \"How to use it\".",
    changelog: "1.0.0 — Initial release.",
    seoTitle: `${p.name} | DistroSource`,
    seoDescription: p.tagline,
    searchKeywords: Array.from(new Set([...tags, ...p.name.toLowerCase().split(/[^a-z0-9.&]+/).filter((w) => w.length > 2)])),
  }
}
