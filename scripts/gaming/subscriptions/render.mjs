import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import { GAMING_SUBSCRIPTION_PLANS } from "../../../lib/gaming/subscriptions/catalog.ts"

const root = path.resolve("public/gaming/subscriptions")
const width = 1600
const height = 1000

function hash(value) {
  let result = 2166136261
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619)
  return result >>> 0
}

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")
}

function wrap(value, max = 34) {
  const words = String(value).split(/\s+/)
  const lines = []
  let line = ""
  for (const word of words) {
    if (`${line} ${word}`.trim().length > max && line) {
      lines.push(line)
      line = word
    } else line = `${line} ${word}`.trim()
  }
  if (line) lines.push(line)
  return lines
}

function textLines(value, x, y, size, color, max, gap = 1.18, weight = 600) {
  return wrap(value, max).map((line, index) => `<text x="${x}" y="${y + index * size * gap}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(line)}</text>`).join("")
}

function pills(items, x, y, accent) {
  return items.slice(0, 4).map((item, i) => {
    const py = y + i * 60
    return `<rect x="${x}" y="${py}" width="480" height="44" rx="22" fill="#ffffff0c" stroke="#ffffff1c"/><circle cx="${x + 25}" cy="${py + 22}" r="7" fill="${accent}"/><text x="${x + 46}" y="${py + 29}" font-size="20" fill="#dbe4f0">${esc(item.slice(0, 42))}</text>`
  }).join("")
}

function uiPreview(plan, accent, seed) {
  const rows = ["Players online", "Queue status", "Resource health", "Audit events"]
  return `<g transform="translate(820 235)">
    <rect width="620" height="520" rx="30" fill="#0b111c" stroke="#ffffff22" stroke-width="2"/>
    <rect x="28" y="25" width="564" height="48" rx="14" fill="#ffffff0b"/>
    <circle cx="52" cy="49" r="7" fill="#fb7185"/><circle cx="74" cy="49" r="7" fill="#fbbf24"/><circle cx="96" cy="49" r="7" fill="#34d399"/>
    <text x="125" y="57" font-size="18" fill="#8da2bd">${esc(plan.family)} / live preview</text>
    <rect x="28" y="98" width="150" height="390" rx="18" fill="#ffffff08"/>
    ${["Overview", "Resources", "Members", "Settings"].map((r,i)=>`<rect x="44" y="${122+i*72}" width="118" height="48" rx="12" fill="${i===(seed%4)?accent:"#ffffff"}" fill-opacity="${i===(seed%4)?".2":".03"}"/><text x="59" y="${153+i*72}" font-size="16" fill="${i===(seed%4)?"#ffffff":"#8495aa"}">${r}</text>`).join("")}
    ${rows.map((r,i)=>`<rect x="202" y="${98+i*92}" width="390" height="72" rx="14" fill="#ffffff08" stroke="#ffffff0e"/><text x="222" y="${127+i*92}" font-size="16" fill="#8da2bd">${r}</text><text x="222" y="${155+i*92}" font-size="25" font-weight="700" fill="#eef4fb">${[128,"Healthy","42 ms","7 new"][(i+seed)%4]}</text><rect x="465" y="${122+i*92}" width="98" height="10" rx="5" fill="#ffffff12"/><rect x="465" y="${122+i*92}" width="${35+(seed+i*19)%90}" height="10" rx="5" fill="${accent}"/>`).join("")}
  </g>`
}

function mloPreview(accent, seed) {
  const offset = seed % 80
  return `<g transform="translate(820 215)">
    <path d="M30 360 300 190 585 350 312 520Z" fill="#202a38" stroke="#ffffff25" stroke-width="3"/>
    <path d="M30 360V140L300 28v162Z" fill="#131c29" stroke="#ffffff1c" stroke-width="3"/>
    <path d="M300 28 585 155v195L300 190Z" fill="#182331" stroke="#ffffff1c" stroke-width="3"/>
    <path d="M78 328 296 214 527 344 309 476Z" fill="#313b49"/>
    <path d="M98 310 218 248 315 302 192 366Z" fill="${accent}" fill-opacity=".27" stroke="${accent}"/>
    <path d="M356 303 455 250 520 286 421 340Z" fill="#916e4d"/><path d="M421 340v55l99-54v-55Z" fill="#60452f"/>
    <path d="M170 392 266 342 348 388 252 440Z" fill="#9aa7b7"/><path d="M252 440v38l96-51v-39Z" fill="#647386"/>
    <rect x="${105+offset}" y="116" width="84" height="130" fill="#82b7dc22" stroke="#8ed6ff66"/><rect x="390" y="115" width="120" height="85" fill="#82b7dc22" stroke="#8ed6ff66"/>
    <circle cx="228" cy="185" r="22" fill="${accent}" opacity=".85"/><path d="M228 68v95" stroke="${accent}" stroke-width="5"/><path d="M204 68h48" stroke="${accent}" stroke-width="5"/>
    <text x="30" y="570" font-size="18" fill="#8292a8">ILLUSTRATIVE ENVIRONMENT PREVIEW • INTERIOR / EXTERIOR / LAYOUT</text>
  </g>`
}

function voxelPreview(accent, seed) {
  const blocks = Array.from({length: 34}, (_, i) => {
    const x = 825 + ((i * 83 + seed) % 550)
    const y = 315 + ((i * 47 + seed) % 280)
    const s = 34 + (i % 3) * 8
    const tone = [accent, "#6f9651", "#92704c", "#486b91"][i % 4]
    return `<path d="M${x} ${y}l${s} -${s/2} ${s} ${s/2}-${s} ${s/2}Z" fill="${tone}"/><path d="M${x} ${y}v${s}l${s} ${s/2}v-${s}Z" fill="${tone}bb"/><path d="M${x+s} ${y+s/2}v${s}l${s}-${s/2}v-${s}Z" fill="${tone}88"/>`
  }).join("")
  return `<g><path d="M790 720 1120 515 1480 705 1145 900Z" fill="#223128" stroke="#ffffff20" stroke-width="3"/>${blocks}<path d="M1080 555v-210l95-58 100 54v210" fill="#9a704e" stroke="#ffffff26" stroke-width="3"/><path d="M1065 350 1175 275l115 68-115 73Z" fill="#485f9a"/><rect x="1146" y="455" width="55" height="96" fill="#261b18"/><text x="810" y="850" font-size="18" fill="#8292a8">ILLUSTRATIVE BUILD PREVIEW • WORLD / SCHEMATIC / SPAWN</text></g>`
}

function brandingPreview(plan, accent, seed) {
  return `<g transform="translate(825 235)">
    <rect width="600" height="155" rx="22" fill="${accent}"/><circle cx="96" cy="77" r="45" fill="#ffffff22"/><path d="M76 95 96 50l23 45Z" fill="#fff"/><text x="168" y="68" font-size="23" fill="#ffffffbb">SERVER SEASON</text><text x="168" y="110" font-size="38" font-weight="800" fill="#fff">NOW LIVE</text>
    <rect y="185" width="280" height="280" rx="25" fill="#101824" stroke="#ffffff20"/><rect x="30" y="215" width="220" height="122" rx="16" fill="${accent}" fill-opacity=".2"/><text x="30" y="375" font-size="24" font-weight="700" fill="#fff">UPDATE 0${seed%9+1}</text><text x="30" y="408" font-size="17" fill="#899ab0">SOCIAL POST • 1:1</text>
    <rect x="310" y="185" width="290" height="130" rx="22" fill="#f2f4f7"/><text x="337" y="232" font-size="18" fill="#4b5563">ANNOUNCEMENT</text><text x="337" y="275" font-size="30" font-weight="800" fill="#111827">${esc(plan.platform)}</text>
    <rect x="310" y="335" width="290" height="130" rx="22" fill="#111827"/><rect x="337" y="365" width="75" height="70" rx="14" fill="${accent}"/><text x="430" y="395" font-size="17" fill="#94a3b8">STREAM PANEL</text><text x="430" y="423" font-size="23" font-weight="700" fill="#fff">GO LIVE</text>
  </g>`
}

function libraryPreview(plan, accent, seed) {
  const cards = Array.from({length:6},(_,i)=>`<g transform="translate(${825+(i%3)*195} ${300+Math.floor(i/3)*190})"><rect width="170" height="160" rx="20" fill="#ffffff0a" stroke="#ffffff16"/><rect x="14" y="14" width="142" height="82" rx="13" fill="${i%2?accent:"#ffffff"}" fill-opacity="${i%2?".2":".05"}"/><text x="18" y="124" font-size="17" fill="#eef4fb">${esc(plan.categories[i%plan.categories.length].slice(0,16))}</text><text x="18" y="147" font-size="14" fill="#7f91a8">${plan.model==="credits"?`${[8,12,20,25][(i+seed)%4]} credits`:plan.model==="pick_keep"?"Eligible selection":"Included"}</text></g>`).join("")
  return `<g>${cards}<rect x="825" y="705" width="560" height="78" rx="18" fill="#ffffff0b"/><text x="852" y="738" font-size="16" fill="#8da2bd">CURRENT BENEFIT</text><text x="852" y="769" font-size="25" font-weight="750" fill="#fff">${esc(plan.quantity)}</text></g>`
}

function scene(plan, accent, seed) {
  if (plan.family === "FiveM MLO") return mloPreview(accent, seed)
  if (plan.family.includes("Minecraft") && plan.family !== "Minecraft Plugins") return voxelPreview(accent, seed)
  if (plan.family === "Server Branding") return brandingPreview(plan, accent, seed)
  if (plan.family === "Gaming Credits" || plan.family === "Pick & Keep" || plan.family.includes("Vault")) return libraryPreview(plan, accent, seed)
  return uiPreview(plan, accent, seed)
}

function baseSvg(plan, view) {
  const n = hash(`${plan.slug}:${view}`)
  const hue = n % 360
  const accent = `hsl(${hue} 76% 58%)`
  const label = ["PLAN OVERVIEW", "RESOURCE PREVIEW", "WHAT YOU GET", "BILLING & RENEWAL", "ACCESS RULES"][view]
  const title = view === 0 ? plan.name : [plan.categories[0], plan.quantity, "Exact entitlements", `${plan.monthlyPriceUsd}/mo • ${plan.annualPriceUsd}/yr`, "After cancellation"][view]
  const body = view === 0 ? plan.summary : [plan.immediateAccess, plan.recurringDelivery, plan.whatYouGet[0], plan.renewal, plan.cancellationRule][view]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="font-family:Inter,Arial,sans-serif">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#07101b"/><stop offset="1" stop-color="#111c2b"/></linearGradient><radialGradient id="glow"><stop stop-color="${accent}" stop-opacity=".28"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="1000" fill="url(#bg)"/><circle cx="1320" cy="130" r="510" fill="url(#glow)"/><path d="M0 820C320 720 505 920 790 805s485-35 810-140v335H0Z" fill="#ffffff04"/>
    <rect x="90" y="90" width="184" height="42" rx="21" fill="${accent}" fill-opacity=".14" stroke="${accent}" stroke-opacity=".4"/><text x="182" y="118" text-anchor="middle" font-size="17" font-weight="700" fill="${accent}">${esc(label)}</text>
    <text x="92" y="195" font-size="20" font-weight="650" fill="#8fa2b9">DISTROSOURCE • ${esc(plan.platform.toUpperCase())}</text>
    ${textLines(title,92,285,62,"#f7fafc",19,1.08,800)}
    ${textLines(body,92,505,24,"#a9b8ca",42,1.45,450)}
    ${view === 2 ? pills(plan.whatYouGet, 92, 700, accent) : ""}
    ${view === 3 ? `<rect x="92" y="720" width="270" height="100" rx="20" fill="#ffffff0a"/><text x="118" y="756" font-size="17" fill="#8fa2b9">MONTHLY</text><text x="118" y="799" font-size="36" font-weight="800" fill="#fff">$${plan.monthlyPriceUsd}</text><rect x="382" y="720" width="300" height="100" rx="20" fill="${accent}" fill-opacity=".13" stroke="${accent}" stroke-opacity=".35"/><text x="408" y="756" font-size="17" fill="#8fa2b9">ANNUAL</text><text x="408" y="799" font-size="36" font-weight="800" fill="#fff">$${plan.annualPriceUsd}</text>` : ""}
    ${view === 4 ? pills([plan.accessRule, plan.rolloverRule, plan.usageLimits], 92, 700, accent) : ""}
    ${scene(plan, accent, n)}
    <rect x="90" y="902" width="1420" height="1" fill="#ffffff17"/><text x="92" y="945" font-size="18" fill="#72839a">CATEGORY PREVIEW • FINAL FILES APPEAR ONLY AFTER PUBLICATION</text><text x="1510" y="945" text-anchor="end" font-size="18" fill="#72839a">${esc(plan.slug)} • ${view + 1}/5</text>
  </svg>`
}

fs.mkdirSync(root, { recursive: true })
let count = 0
for (const plan of GAMING_SUBSCRIPTION_PLANS) {
  const dir = path.join(root, plan.slug)
  fs.mkdirSync(dir, { recursive: true })
  for (let view = 0; view < 5; view++) {
    const file = view === 0 ? "cover.webp" : `gallery-${String(view).padStart(2, "0")}.webp`
    await sharp(Buffer.from(baseSvg(plan, view))).resize(width, height).webp({ quality: 88, effort: 5 }).toFile(path.join(dir, file))
    count++
  }
}
console.log(`Rendered ${count} deterministic WebP images for ${GAMING_SUBSCRIPTION_PLANS.length} subscription plans.`)
