import fs from "node:fs"
import path from "node:path"
import { writePdf } from "./make-pdf.mjs"
import { writeWav } from "./make-wav.mjs"

const ROOT = "/vercel/share/v0-project/.v0/seed/files"

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function write(p, content) {
  ensureDir(path.dirname(p))
  fs.writeFileSync(p, content)
}

// ---------- Spreadsheet Systems (real CSV) ----------
write(
  `${ROOT}/personal-budget-planner/Personal-Budget-Planner.csv`,
  `Month,Category,Budgeted,Actual,Difference
January,Housing,1200,1180,20
January,Groceries,400,375,25
January,Transportation,150,140,10
January,Entertainment,100,120,-20
January,Savings,500,500,0
February,Housing,1200,1200,0
February,Groceries,400,410,-10
February,Transportation,150,135,15
February,Entertainment,100,90,10
February,Savings,500,550,-50
`,
)
write(
  `${ROOT}/personal-budget-planner/README.md`,
  `# Personal Budget Planner\n\nOpen Personal-Budget-Planner.csv in Excel or Google Sheets. Duplicate the monthly rows for a full year and adjust categories to fit your finances.\n`,
)

write(
  `${ROOT}/business-financial-dashboard/Business-Financial-Dashboard.csv`,
  `Quarter,Revenue,COGS,GrossProfit,OperatingExpenses,NetIncome
Q1,125000,52000,73000,38000,35000
Q2,138000,55000,83000,40000,43000
Q3,142000,58000,84000,41000,43000
Q4,168000,64000,104000,45000,59000
`,
)
write(
  `${ROOT}/business-financial-dashboard/README.md`,
  `# Business Financial Dashboard\n\nImport Business-Financial-Dashboard.csv into Google Sheets and build pivot charts from the Quarter/Revenue/NetIncome columns for an instant executive dashboard.\n`,
)

// ---------- Notion & Productivity (real markdown export) ----------
write(
  `${ROOT}/life-organizer-notion/Life-Organizer/README.md`,
  `# All-in-One Life Organizer\n\nImport into Notion: Settings & Members -> Import -> Markdown & CSV, then select this folder.\n`,
)
write(
  `${ROOT}/life-organizer-notion/Life-Organizer/Dashboard.md`,
  `# Dashboard\n\n## Today\n- [ ] Morning review\n- [ ] Top 3 priorities\n\n## Quick Links\n- [[Goals]]\n- [[Habits]]\n- [[Finances]]\n`,
)
write(
  `${ROOT}/life-organizer-notion/Life-Organizer/Goals.md`,
  `# Goals\n\n## 2025 Goals\n- [ ] Launch side project\n- [ ] Read 24 books\n- [ ] Save 20% of income\n`,
)
write(
  `${ROOT}/life-organizer-notion/Life-Organizer/Habits.md`,
  `# Habit Tracker\n\n| Habit | Mon | Tue | Wed | Thu | Fri | Sat | Sun |\n|---|---|---|---|---|---|---|---|\n| Exercise |  |  |  |  |  |  |  |\n| Read |  |  |  |  |  |  |  |\n`,
)

write(
  `${ROOT}/startup-pm-notion/Startup-PM/README.md`,
  `# Startup Project Management System\n\nImport into Notion via Settings & Members -> Import -> Markdown & CSV.\n`,
)
write(
  `${ROOT}/startup-pm-notion/Startup-PM/Roadmap.md`,
  `# Product Roadmap\n\n## Now\n- Onboarding flow\n\n## Next\n- Billing integration\n\n## Later\n- Mobile app\n`,
)
write(
  `${ROOT}/startup-pm-notion/Startup-PM/Sprint-Board.md`,
  `# Sprint Board\n\n## Backlog\n- Task A\n\n## In Progress\n- Task B\n\n## Done\n- Task C\n`,
)

// ---------- Graphics, Icons, SVG craft, Branding, UI/UX (real SVG) ----------
function svgLeaf() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M100 20 C40 40 30 110 100 180 C170 110 160 40 100 20 Z" fill="#2e7d32"/><path d="M100 40 L100 160" stroke="#1b5e20" stroke-width="3"/></svg>`
}
write(`${ROOT}/nature-illustrations/leaf-01.svg`, svgLeaf())
write(
  `${ROOT}/nature-illustrations/mountain-01.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><polygon points="0,200 80,60 140,130 200,40 300,200" fill="#607d8b"/><polygon points="150,200 200,110 250,200" fill="#78909c"/></svg>`,
)
write(`${ROOT}/nature-illustrations/README.md`, `# Hand-Drawn Nature Illustration Set\n\nSVG vector files, editable in Illustrator, Figma, or Inkscape.\n`)

write(
  `${ROOT}/gradient-shapes/blob-01.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><path d="M40 100 C40 40 160 40 160 100 C160 160 40 160 40 100 Z" fill="url(#g1)"/></svg>`,
)
write(`${ROOT}/gradient-shapes/README.md`, `# Abstract Gradient Shapes Pack\n\nEditable SVG shapes with layered gradients.\n`)

const iconNames = ["home", "user", "settings", "search", "bell", "mail", "heart", "star", "cart", "check"]
const iconPaths = {
  home: "M3 11 L12 3 L21 11 M5 10 V21 H19 V10",
  user: "M12 12 a4 4 0 1 0 0-8 4 4 0 0 0 0 8 Z M4 21 c0-4 4-6 8-6 s8 2 8 6",
  settings: "M12 8 a4 4 0 1 0 0 8 4 4 0 0 0 0-8 Z M12 2 v3 M12 19 v3 M4.2 4.2 l2.1 2.1 M17.7 17.7 l2.1 2.1",
  search: "M11 4 a7 7 0 1 0 0 14 7 7 0 0 0 0-14 Z M21 21 l-4.3-4.3",
  bell: "M6 8 a6 6 0 1 1 12 0 c0 4 2 6 2 6 H4 s2-2 2-6 Z M10 20 a2 2 0 0 0 4 0",
  mail: "M3 5 h18 v14 H3 Z M3 5 l9 7 9-7",
  heart: "M12 20 s-8-5-8-11 a4 4 0 0 1 8-2 a4 4 0 0 1 8 2 c0 6-8 11-8 11 Z",
  star: "M12 2 l3 7 7 .5 -5.5 4.5 2 7 -6.5-4 -6.5 4 2-7 -5.5-4.5 7-.5 Z",
  cart: "M3 4 h2 l2.4 12 h10.2 l2-8 H7",
  check: "M4 12 l6 6 10-12",
}
for (const name of iconNames) {
  write(
    `${ROOT}/line-icons-pack/${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="1.6"><path d="${iconPaths[name]}"/></svg>`,
  )
}
write(`${ROOT}/line-icons-pack/README.md`, `# Minimal Line Icons Pack\n\n500 icons — this sample includes 10 representative SVG icons from the full set.\n`)

write(
  `${ROOT}/svg-craft-files/monogram-A.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="70" font-size="72" text-anchor="middle" font-family="Georgia" fill="#000">A</text></svg>`,
)
write(
  `${ROOT}/svg-craft-files/floral-frame.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect x="10" y="10" width="180" height="180" fill="none" stroke="#000" stroke-width="2"/><circle cx="30" cy="30" r="8" fill="#000"/><circle cx="170" cy="30" r="8" fill="#000"/><circle cx="30" cy="170" r="8" fill="#000"/><circle cx="170" cy="170" r="8" fill="#000"/></svg>`,
)
write(`${ROOT}/svg-craft-files/README.md`, `# SVG & Craft Files\n\nCut-ready SVG files compatible with Cricut Design Space and Silhouette Studio.\n`)

write(
  `${ROOT}/branding-startup/logo-mark.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#1d4ed8"/><path d="M40 75 L60 35 L80 75 Z" fill="#ffffff"/></svg>`,
)
write(
  `${ROOT}/branding-startup/brand-colors.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100"><rect width="100" height="100" fill="#1d4ed8"/><rect x="100" width="100" height="100" fill="#0ea5e9"/><rect x="200" width="100" height="100" fill="#0f172a"/><rect x="300" width="100" height="100" fill="#f8fafc"/></svg>`,
)
write(`${ROOT}/branding-startup/README.md`, `# Modern Startup Branding Kit\n\nLogo mark, color palette, and usage guidelines (see brand-guidelines.pdf).\n`)

write(
  `${ROOT}/branding-bakery/logo-mark.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#7c3f00"/><ellipse cx="60" cy="55" rx="28" ry="20" fill="#fff3e0"/><circle cx="50" cy="50" r="3" fill="#7c3f00"/><circle cx="70" cy="50" r="3" fill="#7c3f00"/></svg>`,
)
write(`${ROOT}/branding-bakery/README.md`, `# Boutique Bakery Branding Kit\n\nLogo mark and brand guidelines for a boutique bakery brand identity.\n`)

write(
  `${ROOT}/uiux-kit/button-states.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100"><rect x="10" y="20" width="120" height="44" rx="8" fill="#2563eb"/><text x="70" y="47" fill="#fff" font-size="14" text-anchor="middle" font-family="Arial">Default</text><rect x="150" y="20" width="120" height="44" rx="8" fill="#1d4ed8"/><text x="210" y="47" fill="#fff" font-size="14" text-anchor="middle" font-family="Arial">Hover</text><rect x="290" y="20" width="100" height="44" rx="8" fill="#93c5fd"/><text x="340" y="47" fill="#fff" font-size="14" text-anchor="middle" font-family="Arial">Disabled</text></svg>`,
)
write(`${ROOT}/uiux-kit/README.md`, `# UI/UX Design Kit\n\nSVG component specimens (buttons, states) representing the full Figma UI kit structure.\n`)

// ---------- Photography & Video (real LUT + XMP preset) ----------
function identityCube(size = 8) {
  let s = `TITLE "Cinematic Warm"\nLUT_3D_SIZE ${size}\nDOMAIN_MIN 0.0 0.0 0.0\nDOMAIN_MAX 1.0 1.0 1.0\n`
  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const rv = Math.min(1, (r / (size - 1)) * 1.05 + 0.02)
        const gv = Math.min(1, (g / (size - 1)) * 1.0)
        const bv = Math.max(0, (b / (size - 1)) * 0.95)
        s += `${rv.toFixed(6)} ${gv.toFixed(6)} ${bv.toFixed(6)}\n`
      }
    }
  }
  return s
}
write(`${ROOT}/lightroom-presets/Cinematic-Warm.cube`, identityCube(8))
write(
  `${ROOT}/lightroom-presets/Cinematic-Warm.xmp`,
  `<?xml version="1.0" encoding="UTF-8"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
    crs:Version="15.0"
    crs:PresetType="Normal"
    crs:Temperature="+15"
    crs:Tint="+5"
    crs:Contrast="+12"
    crs:Highlights="-20"
    crs:Shadows="+15"
    crs:Saturation="+8"
    crs:SplitToningShadowHue="30"
    crs:SplitToningShadowSaturation="10">
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>`,
)
write(`${ROOT}/lightroom-presets/README.md`, `# Cinematic Lightroom Presets Pack\n\nIncludes a .cube LUT (compatible with Premiere, DaVinci Resolve, Final Cut) and a Lightroom .xmp preset.\n`)

// ---------- 3D / STL ----------
function asciiCubeStl(name = "cube", size = 20) {
  const s = size
  const faces = [
    [[0,0,0],[s,0,0],[s,s,0]], [[0,0,0],[s,s,0],[0,s,0]],
    [[0,0,s],[s,s,s],[s,0,s]], [[0,0,s],[0,s,s],[s,s,s]],
    [[0,0,0],[s,0,s],[s,0,0]], [[0,0,0],[0,0,s],[s,0,s]],
    [[0,s,0],[s,s,0],[s,s,s]], [[0,s,0],[s,s,s],[0,s,s]],
    [[0,0,0],[0,s,0],[0,s,s]], [[0,0,0],[0,s,s],[0,0,s]],
    [[s,0,0],[s,s,s],[s,s,0]], [[s,0,0],[s,0,s],[s,s,s]],
  ]
  let out = `solid ${name}\n`
  for (const f of faces) {
    out += ` facet normal 0 0 0\n  outer loop\n`
    for (const v of f) out += `   vertex ${v[0]} ${v[1]} ${v[2]}\n`
    out += `  endloop\n endfacet\n`
  }
  out += `endsolid ${name}\n`
  return out
}
write(`${ROOT}/stl-desk-organizer/desk-organizer-block.stl`, asciiCubeStl("desk_organizer", 40))
write(`${ROOT}/stl-desk-organizer/README.md`, `# Minimalist Desk Organizer 3D Model\n\nASCII STL file, ready to slice in Cura, PrusaSlicer, or any standard slicer. Scale as needed for your printer bed.\n`)

// ---------- Audio ----------
writeWav(`${ROOT}/audio-ambient-pack/ambient-drone-01.wav`, { durationSec: 4, freqs: [110, 165, 220] })
writeWav(`${ROOT}/audio-ambient-pack/soft-chime-01.wav`, { durationSec: 2, freqs: [880, 1320] })
write(`${ROOT}/audio-ambient-pack/README.md`, `# Royalty-Free Ambient Music Pack\n\nWAV audio files, royalty-free for personal and commercial use per your DistroSource license.\n`)

// ---------- Developer Products (real TS/React code) ----------
write(
  `${ROOT}/nextjs-saas-boilerplate/package.json`,
  JSON.stringify({ name: "nextjs-saas-boilerplate", version: "1.0.0", private: true, scripts: { dev: "next dev" }, dependencies: { next: "^15.0.0", react: "^19.0.0" } }, null, 2),
)
write(
  `${ROOT}/nextjs-saas-boilerplate/app/page.tsx`,
  `export default function Home() {
  return (
    <main style={{ padding: 48 }}>
      <h1>Your SaaS starts here</h1>
      <p>This boilerplate includes auth scaffolding, billing hooks, and a dashboard shell.</p>
    </main>
  )
}
`,
)
write(
  `${ROOT}/nextjs-saas-boilerplate/lib/plans.ts`,
  `export const PLANS = [
  { id: "starter", name: "Starter", priceMonthly: 9 },
  { id: "pro", name: "Pro", priceMonthly: 29 },
  { id: "team", name: "Team", priceMonthly: 79 },
] as const
`,
)
write(`${ROOT}/nextjs-saas-boilerplate/README.md`, `# Next.js SaaS Boilerplate\n\nRun: npm install && npm run dev\n\nIncludes plan config, page shell, and folder structure ready for auth + billing integration.\n`)

write(
  `${ROOT}/react-admin-dashboard/package.json`,
  JSON.stringify({ name: "react-admin-dashboard-kit", version: "1.0.0", private: true, dependencies: { react: "^19.0.0" } }, null, 2),
)
write(
  `${ROOT}/react-admin-dashboard/src/components/StatCard.tsx`,
  `interface StatCardProps { label: string; value: string }

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
`,
)
write(`${ROOT}/react-admin-dashboard/README.md`, `# React Admin Dashboard Kit\n\nComponent library sample: StatCard and dashboard layout primitives. See src/components for the full set structure.\n`)

// ---------- Business documents / Industry packs / Presentations / Resume / Wedding / Planners / Learning (PDF) ----------
writePdf(`${ROOT}/business-launch-kit/Business-Launch-Checklist.pdf`, [
  { title: "Complete Business Launch Kit", body: [
    "Step 1: Define your business entity and register with your local authority.",
    "Step 2: Open a dedicated business bank account and set up bookkeeping.",
    "Step 3: Build your brand identity — logo, color palette, and voice.",
    "Step 4: Draft your core legal documents — terms of service and privacy policy.",
    "Step 5: Launch your website and connect payment processing.",
  ]},
])
write(`${ROOT}/business-launch-kit/README.md`, `# Complete Business Launch Kit\n\nIncludes the launch checklist PDF plus editable planning documents.\n`)

writePdf(`${ROOT}/freelance-agency-kit/Freelance-Agency-Starter-Guide.pdf`, [
  { title: "Freelance Agency Starter Kit", body: [
    "This guide covers client onboarding, proposal structure, and scope-of-work templates.",
    "Section 1: Client Intake — standardize how you gather project requirements.",
    "Section 2: Proposals — a repeatable structure that wins more work.",
    "Section 3: Contracts — protect your time and get paid on schedule.",
  ]},
])
write(`${ROOT}/freelance-agency-kit/README.md`, `# Freelance Agency Starter Kit\n\nStarter guide plus proposal and contract templates.\n`)

writePdf(`${ROOT}/real-estate-pack/Real-Estate-Agency-Pack.pdf`, [
  { title: "Real Estate Agency Business Pack", body: [
    "Listing description templates, open house checklists, and client follow-up scripts.",
    "Includes buyer and seller presentation outlines tailored for residential agents.",
  ]},
])
write(`${ROOT}/real-estate-pack/README.md`, `# Real Estate Agency Business Pack\n\nListing templates, checklists, and presentation outlines.\n`)

writePdf(`${ROOT}/fitness-studio-pack/Fitness-Studio-Business-Pack.pdf`, [
  { title: "Fitness Studio Business Pack", body: [
    "Class schedules, membership agreement templates, and onboarding waivers for fitness studios.",
    "Includes a 12-week program planning template for trainers.",
  ]},
])
write(`${ROOT}/fitness-studio-pack/README.md`, `# Fitness Studio Business Pack\n\nMembership templates, schedules, and program planning documents.\n`)

writePdf(`${ROOT}/pitch-deck-template/Pitch-Deck-Outline.pdf`, [
  { title: "Pitch Deck Presentation Template", body: [
    "Slide 1: Problem — Slide 2: Solution — Slide 3: Market Size — Slide 4: Business Model",
    "Slide 5: Traction — Slide 6: Team — Slide 7: Financials — Slide 8: The Ask",
    "This outline mirrors the structure of the full editable slide deck.",
  ]},
])
write(`${ROOT}/pitch-deck-template/README.md`, `# Pitch Deck Presentation Template\n\nFull editable deck structure outlined in this PDF sample; source slides included in your download.\n`)

writePdf(`${ROOT}/annual-report-template/Annual-Report-Outline.pdf`, [
  { title: "Annual Report Presentation Template", body: [
    "Executive Summary, Financial Highlights, Operational Review, and Outlook sections.",
    "Designed for a clean, data-forward corporate presentation style.",
  ]},
])
write(`${ROOT}/annual-report-template/README.md`, `# Annual Report Presentation Template\n\nSection outline sample; full editable deck included in your download.\n`)

writePdf(`${ROOT}/resume-pack/Professional-Resume-Template.pdf`, [
  { title: "Professional Resume Template", body: [
    "Jane Doe — Product Manager",
    "Experience: Led cross-functional teams to ship three major product launches.",
    "Skills: Roadmapping, User Research, Analytics, Stakeholder Communication.",
    "Education: B.S. Business Administration",
  ]},
])
write(`${ROOT}/resume-pack/README.md`, `# Professional Resume Template Pack\n\nSample rendered resume; editable source files included in your download.\n`)

writePdf(`${ROOT}/executive-resume/Executive-Resume-Cover-Letter.pdf`, [
  { title: "Executive Resume & Cover Letter Set", body: [
    "John Smith — Chief Operating Officer",
    "20 years scaling operations across manufacturing and logistics.",
    "Cover letter template included, formatted for executive-level applications.",
  ]},
])
write(`${ROOT}/executive-resume/README.md`, `# Executive Resume & Cover Letter Set\n\nSample rendered documents; editable source files included in your download.\n`)

writePdf(`${ROOT}/classroom-worksheets/Classroom-Worksheet-Bundle.pdf`, [
  { title: "Classroom Worksheet Bundle (K-5)", body: [
    "Worksheet 1: Addition Practice — 20 problems for grades K-2.",
    "Worksheet 2: Reading Comprehension — short passage with 5 questions for grades 3-5.",
    "Worksheet 3: Vocabulary Match — word and definition matching activity.",
  ]},
])
write(`${ROOT}/classroom-worksheets/README.md`, `# Classroom Worksheet Bundle (K-5)\n\nPrintable PDF worksheets for elementary classrooms.\n`)

writePdf(`${ROOT}/wedding-invitation-suite/Wedding-Invitation-Suite.pdf`, [
  { title: "Elegant Wedding Invitation Suite", body: [
    "Includes invitation, RSVP card, and details card layouts in a matching elegant design.",
    "Fully editable text placeholders for names, date, and venue.",
  ]},
])
write(`${ROOT}/wedding-invitation-suite/README.md`, `# Elegant Wedding Invitation Suite\n\nInvitation, RSVP, and details card templates.\n`)

writePdf(`${ROOT}/digital-life-planner/2025-Digital-Life-Planner.pdf`, [
  { title: "2025 Digital Life Planner", body: [
    "Monthly, weekly, and daily planning spreads with goal-tracking pages.",
    "Optimized for use with GoodNotes, Notability, or standard printing.",
  ]},
])
write(`${ROOT}/digital-life-planner/README.md`, `# 2025 Digital Life Planner\n\nHyperlinked digital planner sample pages; full multi-page PDF included in your download.\n`)

// ---------- Fonts ----------
write(`${ROOT}/font-modern-sans/README.md`, `# Modern Sans Serif Font Family\n\nIncludes Regular weight TTF (this sample uses the OFL-licensed Inter typeface family as the representative specimen file).\n`)
write(`${ROOT}/font-script-duo/README.md`, `# Elegant Script Font Duo\n\nIncludes Regular weight TTF (this sample uses the OFL-licensed Dancing Script typeface as the representative specimen file).\n`)

console.log("Seed content files generated.")
