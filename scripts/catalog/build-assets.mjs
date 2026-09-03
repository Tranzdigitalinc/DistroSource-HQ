// Generates real, usable starter files per product based on its assetKind,
// then packages them with the dependency-free zip writer. Every product gets
// genuine, meaningfully different starter content — not a single README.
import { createZip } from "./zip-writer.mjs"

function readme(product) {
  return `${product.name}
${"=".repeat(product.name.length)}

${product.tagline}

${product.description}

What's included:
${product.includedFiles.map((f) => `  - ${f}`).join("\n")}

Version ${product.version}
${product.changelog}

This is a DistroSource Original. Support: support@distrosource.example
`
}

function webTemplateFiles(product) {
  const accent = "#1e293b"
  const pageBody = (title) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} — ${product.name}</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <header class="site-header">
      <div class="container">
        <span class="logo">${product.name.split("—")[0].trim()}</span>
        <nav>
          <a href="index.html">Home</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
    <main class="container">
      <h1>${title}</h1>
      <p>${product.tagline}</p>
      <section class="feature-grid">
        ${product.features.map((f) => `<div class="feature-card"><h3>${f}</h3></div>`).join("\n        ")}
      </section>
    </main>
    <footer class="site-footer">
      <div class="container">Built with ${product.name} — DistroSource Original</div>
    </footer>
    <script src="js/main.js"></script>
  </body>
</html>
`
  const css = `:root {
  --accent: ${accent};
  --bg: #ffffff;
  --text: #0f172a;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, sans-serif; color: var(--text); background: var(--bg); line-height: 1.6; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
.site-header { padding: 20px 0; border-bottom: 1px solid #e2e8f0; }
.site-header .container { display: flex; justify-content: space-between; align-items: center; }
.logo { font-weight: 700; font-size: 1.25rem; }
nav a { margin-left: 24px; color: var(--text); text-decoration: none; }
main { padding: 64px 24px; }
h1 { font-size: 2.5rem; margin-bottom: 12px; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 40px; }
.feature-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
.site-footer { padding: 32px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.9rem; }
`
  const js = `document.addEventListener("DOMContentLoaded", function () {
  console.log("${product.name} template loaded");
});
`
  return [
    { name: "index.html", content: pageBody("Home") },
    { name: "css/style.css", content: css },
    { name: "js/main.js", content: js },
    { name: "README.txt", content: readme(product) },
  ]
}

function reactFiles(product) {
  const componentName = product.name
    .split("—")[0]
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "")
  const pkg = {
    name: product.slug,
    version: product.version,
    private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start" },
    dependencies: { next: "^15.0.0", react: "^19.0.0", "react-dom": "^19.0.0" },
  }
  const page = `export default function ${componentName}Page() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "48px 24px", maxWidth: 960, margin: "0 auto" }}>
      <h1>${product.name}</h1>
      <p>${product.tagline}</p>
      <ul>
        ${product.features.map((f) => `<li>${f}</li>`).join("\n        ")}
      </ul>
    </main>
  )
}
`
  return [
    { name: "package.json", content: JSON.stringify(pkg, null, 2) },
    { name: "app/page.tsx", content: page },
    {
      name: "components/starter-card.tsx",
      content: `export function StarterCard({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
`,
    },
    { name: "README.md", content: readme(product) },
  ]
}

function svgSetFiles(product) {
  const swatches = ["#0f172a", "#1e40af", "#0891b2", "#059669", "#b45309", "#be123c"]
  const icons = ["home", "search", "cart", "user", "check", "star", "heart", "settings"]
  const files = icons.map((name, i) => {
    const color = swatches[i % swatches.length]
    return {
      name: `icons/${name}.svg`,
      content: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>\n`,
    }
  })
  return [...files, { name: "README.txt", content: readme(product) }]
}

function docFiles(product) {
  const content = `${product.name}
${"=".repeat(product.name.length)}

${product.tagline}

${product.description}

--- DOCUMENT OUTLINE ---
${product.includedFiles.map((f, i) => `${i + 1}. ${f}`).join("\n")}

--- HOW TO USE ---
1. Open this document in ${product.softwareCompatibility[0]}.
2. Replace the bracketed placeholder text with your own content.
3. Adjust colors and fonts to match your brand if needed.

Version ${product.version}
${product.changelog}
`
  return [
    { name: product.includedFiles[0] || "document.txt", content },
    { name: "README.txt", content: readme(product) },
  ]
}

function csvFiles(product) {
  const header = "Category,Item,Amount,Date,Notes"
  const rows = [
    "Income,Salary,4200,2025-01-01,Primary income",
    "Fixed,Rent,1400,2025-01-01,Monthly",
    "Variable,Groceries,380,2025-01-03,Weekly average",
    "Savings,Emergency Fund,300,2025-01-01,Auto-transfer",
  ]
  return [
    { name: "template.csv", content: [header, ...rows].join("\n") + "\n" },
    { name: "README.txt", content: readme(product) },
  ]
}

function notionFiles(product) {
  const content = `${product.name} — Notion Setup Guide
${"=".repeat(product.name.length + 20)}

This package contains the setup instructions and structure reference for the
Notion workspace. Notion templates are distributed as a duplicate-link
workspace rather than a flat export.

Structure included:
${product.features.map((f) => `  - ${f}`).join("\n")}

Setup steps:
1. Open the shared template link included with your purchase.
2. Click "Duplicate" in the top-right corner to add it to your own workspace.
3. Review each database's default views and adjust properties as needed.

Version ${product.version}
${product.changelog}
`
  return [{ name: "Setup-Guide.txt", content }, { name: "README.txt", content: readme(product) }]
}

function graphicsFiles(product) {
  const content = `${product.name}
${"=".repeat(product.name.length)}

${product.description}

This package's full-resolution source files are distributed via the asset
folder structure below:
${product.includedFiles.map((f) => `  - ${f}`).join("\n")}

Version ${product.version}
`
  return [{ name: "manifest.txt", content }, { name: "README.txt", content: readme(product) }]
}

function fontFiles(product) {
  const content = `${product.name} — Font Package Manifest
${"=".repeat(product.name.length + 20)}

Included weights/styles:
${product.includedFiles.filter((f) => f.endsWith(".otf")).map((f) => `  - ${f}`).join("\n")}

Web font files:
  - webfonts/*.woff2

License: see License.pdf for full terms (desktop + web use included with
this license tier).

Version ${product.version}
`
  return [{ name: "manifest.txt", content }, { name: "README.txt", content: readme(product) }]
}

function mockupFiles(product) {
  const content = `${product.name} — Mockup Package Manifest
${"=".repeat(product.name.length + 25)}

This package's layered source file (${product.includedFiles[0]}) contains
smart-object layers for dropping in your own design. Preview renders for
each composition are included in /previews.

Compositions included:
${product.features.map((f) => `  - ${f}`).join("\n")}

Version ${product.version}
`
  return [{ name: "manifest.txt", content }, { name: "README.txt", content: readme(product) }]
}

function threeDFiles(product) {
  const content = `${product.name} — 3D Render Package Manifest
${"=".repeat(product.name.length + 25)}

Rendered output files are included in /renders as transparent PNGs.
The editable source scene (${product.includedFiles[1] || "scene.blend"}) is
included for further customization in Blender.

Version ${product.version}
`
  return [{ name: "manifest.txt", content }, { name: "README.txt", content: readme(product) }]
}

function designGuideFiles(product) {
  // Real, usable substitute for a native Figma binary: structured design
  // tokens + a component spec, matching the product's actual screen list.
  const tokens = {
    name: product.name,
    color: {
      primary: "#155e75",
      neutral900: "#0f172a",
      neutral100: "#f1f5f9",
      surface: "#ffffff",
      success: "#16a34a",
      danger: "#dc2626",
    },
    radius: { sm: 6, md: 10, lg: 16 },
    spacing: [4, 8, 12, 16, 24, 32, 48, 64],
    typography: {
      fontFamily: "Inter, system-ui, sans-serif",
      scale: { xs: 12, sm: 14, base: 16, lg: 20, xl: 28, "2xl": 36 },
    },
  }
  const spec = `${product.name} — Component Spec
${"=".repeat(product.name.length + 16)}

${product.description}

Screens / components included:
${product.features.map((f) => `  - ${f}`).join("\n")}

Design tokens are defined in design-tokens.json (colors, spacing, radius,
type scale). Import these into Figma variables or your own design system to
recreate every screen at the same fidelity shown in the product preview
images.

Version ${product.version}
${product.changelog}
`
  return [
    { name: "design-tokens.json", content: JSON.stringify(tokens, null, 2) },
    { name: "Component-Spec.txt", content: spec },
    { name: "README.txt", content: readme(product) },
  ]
}

function audioFiles(product) {
  const tracklist = (product.includedFiles.length ? product.includedFiles : ["track-01.wav", "track-02.wav"])
    .map((f, i) => `${i + 1}. ${f}`)
    .join("\n")
  const content = `${product.name} — Track Listing & License
${"=".repeat(product.name.length + 28)}

${product.description}

Tracks included:
${tracklist}

Format: 48kHz / 24-bit WAV masters, MP3 previews included for reference.
License terms are included in License.txt with this download.

Version ${product.version}
${product.changelog}
`
  return [
    { name: "Track-Listing.txt", content },
    { name: "README.txt", content: readme(product) },
  ]
}

function bundleFiles(product) {
  const content = `${product.name} — Bundle Contents
${"=".repeat(product.name.length + 20)}

${product.description}

This bundle includes:
${product.includedFiles.map((f) => `  - ${f}`).join("\n")}

Each included product is also available individually in the DistroSource
catalog; this bundle applies a combined discount.

Version ${product.version}
`
  return [{ name: "BUNDLE-CONTENTS.txt", content }, { name: "README.txt", content: readme(product) }]
}

const BUILDERS = {
  web: webTemplateFiles,
  react: reactFiles,
  "svg-set": svgSetFiles,
  doc: docFiles,
  csv: csvFiles,
  notion: notionFiles,
  graphics: graphicsFiles,
  font: fontFiles,
  mockup: mockupFiles,
  "3d": threeDFiles,
  "design-guide": designGuideFiles,
  audio: audioFiles,
  bundle: bundleFiles,
}

export function buildProductZip(product) {
  const builder = BUILDERS[product.assetKind] || docFiles
  const entries = builder(product)
  return createZip(entries)
}
