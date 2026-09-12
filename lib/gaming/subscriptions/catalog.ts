import type { GamingSubscriptionPlan, SubscriptionModel, SubscriptionPlatform } from "./types"

type Seed = {
  name: string
  slug: string
  focus: string
  quantity: string
  monthly: number
  annual: number
}

type Family = {
  family: string
  platform: SubscriptionPlatform
  model: SubscriptionModel
  audience: string
  categories: string[]
  fileTypes: string[]
  eligible: string[]
  excluded: string[]
  seeds: Seed[]
}

const fivemVault: Family = {
  family: "FiveM Vault",
  platform: "FiveM",
  model: "catalog_access",
  audience: "FiveM owners who want a maintained pool of server resources without buying each eligible item separately",
  categories: ["scripts", "UI systems", "configurations", "graphics", "EUP resources", "selected maps and MLO assets"],
  fileTypes: ["ZIP", "Lua", "JavaScript", "TypeScript", "HTML/CSS", "JSON", "YAML", "PNG", "WebP"],
  eligible: ["Products carrying this plan's Included badge", "Current versions of eligible resources", "New eligible resources added while active"],
  excluded: ["Custom development", "Bespoke setup", "Unreleased resources", "Third-party marketplace products", "Products without this plan's Included badge"],
  seeds: [
    ["FiveM Vault RP Core", "fivem-vault-rp-core", "roleplay foundations, jobs, character flows and shared server utilities", "eligible catalog access", 29, 290],
    ["FiveM Vault Economy", "fivem-vault-economy", "banking, stores, crafting, inventory and economy configuration resources", "eligible catalog access", 25, 250],
    ["FiveM Vault Emergency", "fivem-vault-emergency", "police, EMS, fire, dispatch and emergency-service resources", "eligible catalog access", 32, 320],
    ["FiveM Vault Civilian", "fivem-vault-civilian", "civilian jobs, housing, vehicles, activities and quality-of-life resources", "eligible catalog access", 24, 240],
    ["FiveM Vault Crime", "fivem-vault-crime", "robbery, evidence, progression and criminal-gameplay resources", "eligible catalog access", 27, 270],
    ["FiveM Vault Immersion", "fivem-vault-immersion", "interaction, animation, audio and environmental immersion resources", "eligible catalog access", 22, 220],
    ["FiveM Vault Performance", "fivem-vault-performance", "profiling, configuration, optimization and operational resources", "eligible catalog access", 19, 190],
    ["FiveM Vault Launch", "fivem-vault-launch", "the focused resource set needed to launch a new roleplay server", "eligible catalog access", 39, 390],
    ["FiveM Vault Expansion", "fivem-vault-expansion", "systems intended for established servers adding new gameplay loops", "eligible catalog access", 35, 350],
    ["FiveM Vault Studio", "fivem-vault-studio", "the broadest eligible FiveM resource selection for multi-server teams", "eligible catalog access", 59, 590],
  ].map(seed),
}

const mlo: Family = {
  family: "FiveM MLO",
  platform: "FiveM",
  model: "monthly_drop",
  audience: "FiveM builders who need a predictable stream of environment-focused releases",
  categories: ["MLO interiors", "exterior shells", "map placement files", "environment textures", "installation notes"],
  fileTypes: ["YMAP", "YTYP", "YDR", "YTD", "XML", "JSON", "README", "ZIP"],
  eligible: ["The curated drop published for this plan each successful cycle", "Corrections to claimed drops", "Prior drops claimed while the plan was active"],
  excluded: ["Unannounced named buildings", "Custom mapping", "Source art not listed in a drop", "Third-party or escrow-locked assets"],
  seeds: [
    ["MLO Downtown Drop", "fivem-mlo-downtown", "commercial and civic interiors suited to dense downtown roleplay", "1 curated MLO-focused drop per month", 34, 340],
    ["MLO Emergency Drop", "fivem-mlo-emergency", "police, EMS and fire-service environment themes", "1 curated MLO-focused drop per month", 36, 360],
    ["MLO Commerce Drop", "fivem-mlo-commerce", "shops, offices, service counters and customer-facing spaces", "1 curated MLO-focused drop per month", 29, 290],
    ["MLO Nightlife Drop", "fivem-mlo-nightlife", "clubs, bars, lounges and entertainment environment themes", "1 curated MLO-focused drop per month", 32, 320],
    ["MLO Residential Drop", "fivem-mlo-residential", "apartments, houses and residential common-area themes", "1 curated MLO-focused drop per month", 28, 280],
    ["MLO Industrial Drop", "fivem-mlo-industrial", "warehouses, workshops and industrial environment themes", "1 curated MLO-focused drop per month", 31, 310],
    ["MLO County Drop", "fivem-mlo-county", "rural, roadside and county-service environment themes", "1 curated MLO-focused drop per month", 27, 270],
    ["MLO Government Drop", "fivem-mlo-government", "court, municipal and public-service environment themes", "1 curated MLO-focused drop per month", 35, 350],
    ["MLO Luxury Drop", "fivem-mlo-luxury", "high-end residential, retail and hospitality environment themes", "1 curated MLO-focused drop per month", 39, 390],
    ["MLO Essentials Drop", "fivem-mlo-essentials", "high-utility interiors selected for new server coverage", "1 curated MLO-focused drop per month", 42, 420],
  ].map(seed),
}

const fivemUi: Family = {
  family: "FiveM UI",
  platform: "FiveM",
  model: "monthly_drop",
  audience: "FiveM developers and owners who need polished interface resources with readable implementation previews",
  categories: ["HUD components", "menus", "inventory interfaces", "phone apps", "MDT screens", "design tokens"],
  fileTypes: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "SVG", "PNG", "JSON", "ZIP"],
  eligible: ["The interface drop published for this plan each successful cycle", "Documented fixes to claimed UI drops", "Editable files explicitly listed in each drop"],
  excluded: ["Framework integration performed for you", "Custom UI commissions", "Back-end functionality not named in the drop", "Fonts or icons requiring separate licenses"],
  seeds: [
    ["FiveM HUD Lab", "fivem-ui-hud", "status, vehicle and contextual HUD components", "1 UI resource drop per month", 18, 180],
    ["FiveM Inventory Lab", "fivem-ui-inventory", "inventory grids, item details and action flows", "1 UI resource drop per month", 21, 210],
    ["FiveM Phone Lab", "fivem-ui-phone", "phone shells, apps and communication interface patterns", "1 UI resource drop per month", 24, 240],
    ["FiveM MDT Lab", "fivem-ui-mdt", "police, EMS and dispatch terminal interfaces", "1 UI resource drop per month", 25, 250],
    ["FiveM Banking Lab", "fivem-ui-banking", "account, transfer and transaction interface patterns", "1 UI resource drop per month", 19, 190],
    ["FiveM Character Lab", "fivem-ui-character", "character creation, identity and wardrobe interfaces", "1 UI resource drop per month", 20, 200],
    ["FiveM Garage Lab", "fivem-ui-garage", "vehicle browsing, storage and fleet interface patterns", "1 UI resource drop per month", 18, 180],
    ["FiveM Dispatch Lab", "fivem-ui-dispatch", "call queue, unit status and map-panel interface patterns", "1 UI resource drop per month", 23, 230],
    ["FiveM Admin UI Lab", "fivem-ui-admin", "staff controls, audit views and player-management interfaces", "1 UI resource drop per month", 22, 220],
    ["FiveM UI Complete", "fivem-ui-complete", "a rotating mix across HUD, phone, inventory and operational UI", "2 UI resource drops per month", 39, 390],
  ].map(seed),
}

const owners: Family = {
  family: "FiveM Server Owner",
  platform: "FiveM",
  model: "updates",
  audience: "FiveM operators who want maintained operational packs rather than custom server administration",
  categories: ["configuration packs", "runbooks", "admin dashboards", "staff templates", "incident checklists", "Discord operations"],
  fileTypes: ["JSON", "YAML", "CFG", "Markdown", "CSV", "HTML", "SVG", "ZIP"],
  eligible: ["Purchased DistroSource operational products named on this plan", "Compatibility corrections", "Documentation and configuration revisions"],
  excluded: ["New products not named as eligible", "Custom development", "Managed hosting", "Live moderation", "Third-party service fees"],
  seeds: [
    ["Server Owner Launch Care", "fivem-owner-launch", "launch checklists, baseline configs and go-live operations", "updates to the eligible Launch Care pack", 15, 150],
    ["Server Owner Operations Care", "fivem-owner-operations", "routine administration, restarts, backups and change control", "updates to the eligible Operations Care pack", 17, 170],
    ["Server Owner Moderation Care", "fivem-owner-moderation", "staff policy, tickets, escalation and moderation workflows", "updates to the eligible Moderation Care pack", 14, 140],
    ["Server Owner Economy Care", "fivem-owner-economy", "economy review, tuning worksheets and change templates", "updates to the eligible Economy Care pack", 16, 160],
    ["Server Owner Performance Care", "fivem-owner-performance", "performance budgets, profiling checklists and capacity reviews", "updates to the eligible Performance Care pack", 18, 180],
    ["Server Owner Community Care", "fivem-owner-community", "announcements, feedback, events and retention workflows", "updates to the eligible Community Care pack", 13, 130],
    ["Server Owner Staff Care", "fivem-owner-staff", "recruiting, onboarding, permissions and review workflows", "updates to the eligible Staff Care pack", 14, 140],
    ["Server Owner Security Care", "fivem-owner-security", "access reviews, incident response and hardening checklists", "updates to the eligible Security Care pack", 19, 190],
    ["Server Owner Growth Care", "fivem-owner-growth", "campaign, partnership and launch-measurement templates", "updates to the eligible Growth Care pack", 15, 150],
    ["Server Owner Enterprise Care", "fivem-owner-enterprise", "multi-server governance and operational control packs", "updates to the eligible Enterprise Care pack", 29, 290],
  ].map(seed),
}

const minecraftVault: Family = {
  family: "Minecraft Vault",
  platform: "Minecraft",
  model: "catalog_access",
  audience: "Minecraft server owners who want ongoing access to a clearly marked catalog segment",
  categories: ["server configurations", "plugin presets", "GUI resources", "build schematics", "texture assets", "operational templates"],
  fileTypes: ["JAR configuration", "YAML", "JSON", "NBT", "SCHEM", "ZIP", "PNG", "WebP", "Markdown"],
  eligible: ["Products carrying this plan's Included badge", "Current versions of eligible resources", "New eligible resources added while active"],
  excluded: ["Minecraft game licenses", "Paid third-party plugins", "Custom builds", "Managed hosting", "Unreleased named resources"],
  seeds: [
    ["Minecraft Survival Vault", "minecraft-vault-survival", "survival progression, claims, shops and quality-of-life resources", "eligible catalog access", 19, 190],
    ["Minecraft SMP Vault", "minecraft-vault-smp", "community SMP configuration, social and event resources", "eligible catalog access", 21, 210],
    ["Minecraft Skyblock Vault", "minecraft-vault-skyblock", "island progression, generators, upgrades and economy resources", "eligible catalog access", 23, 230],
    ["Minecraft Prison Vault", "minecraft-vault-prison", "mines, ranks, prestige and prison-economy resources", "eligible catalog access", 24, 240],
    ["Minecraft RPG Vault", "minecraft-vault-rpg", "quests, classes, items, encounters and progression resources", "eligible catalog access", 27, 270],
    ["Minecraft Minigame Vault", "minecraft-vault-minigame", "lobby, queue, arena and reward resources", "eligible catalog access", 22, 220],
    ["Minecraft Network Vault", "minecraft-vault-network", "proxy, cross-server, permissions and network operations resources", "eligible catalog access", 29, 290],
    ["Minecraft Creative Vault", "minecraft-vault-creative", "plots, build tools, palettes and showcase resources", "eligible catalog access", 18, 180],
    ["Minecraft Hardcore Vault", "minecraft-vault-hardcore", "lives, seasons, leaderboards and high-stakes progression resources", "eligible catalog access", 20, 200],
    ["Minecraft All-Access Vault", "minecraft-vault-all-access", "the broadest eligible Minecraft catalog across server modes", "eligible catalog access", 45, 450],
  ].map(seed),
}

const minecraftMaps: Family = {
  family: "Minecraft Maps",
  platform: "Minecraft",
  model: "monthly_drop",
  audience: "Minecraft owners and builders who need curated build releases with honest schematic and layout previews",
  categories: ["world builds", "spawn areas", "hubs", "arenas", "schematics", "layout notes"],
  fileTypes: ["SCHEM", "SCHEMATIC", "NBT", "world ZIP", "PNG", "README"],
  eligible: ["The map drop published for this plan each successful cycle", "Fixes to claimed drops", "The download formats named on each drop"],
  excluded: ["Custom build commissions", "Unannounced named maps", "Server setup", "Premium third-party blocks or models"],
  seeds: [
    ["Minecraft Spawn Drop", "minecraft-maps-spawn", "practical spawn areas with navigation and service zones", "1 curated map drop per month", 24, 240],
    ["Minecraft Hub Drop", "minecraft-maps-hub", "network hubs, portals and player-routing builds", "1 curated map drop per month", 26, 260],
    ["Minecraft Arena Drop", "minecraft-maps-arena", "combat and minigame arenas with clear play boundaries", "1 curated map drop per month", 22, 220],
    ["Minecraft Dungeon Drop", "minecraft-maps-dungeon", "encounter spaces, routes and room-based dungeon builds", "1 curated map drop per month", 25, 250],
    ["Minecraft Skyblock Drop", "minecraft-maps-skyblock", "island, hub and progression-zone builds", "1 curated map drop per month", 21, 210],
    ["Minecraft Survival Drop", "minecraft-maps-survival", "survival-friendly settlements and exploration points", "1 curated map drop per month", 20, 200],
    ["Minecraft City Drop", "minecraft-maps-city", "urban districts, streets and functional civic builds", "1 curated map drop per month", 29, 290],
    ["Minecraft Fantasy Drop", "minecraft-maps-fantasy", "fantasy settlements, castles and landscape builds", "1 curated map drop per month", 27, 270],
    ["Minecraft Seasonal Drop", "minecraft-maps-seasonal", "time-limited seasonal hubs and event builds", "1 curated map drop per month", 18, 180],
    ["Minecraft Adventure Drop", "minecraft-maps-adventure", "story routes, landmarks and objective-focused builds", "1 curated map drop per month", 31, 310],
  ].map(seed),
}

const minecraftPlugins: Family = {
  family: "Minecraft Plugins",
  platform: "Minecraft",
  model: "monthly_drop",
  audience: "Minecraft operators who want implementation-ready plugin configuration and interface resources",
  categories: ["plugin configurations", "server GUIs", "permissions presets", "message files", "setup notes"],
  fileTypes: ["YAML", "JSON", "TOML", "properties", "Java resource files", "Markdown", "ZIP"],
  eligible: ["The plugin-resource drop published for this plan each cycle", "Fixes to claimed configurations", "Files explicitly listed in the drop manifest"],
  excluded: ["Paid plugin licenses", "Plugin binaries we do not own", "Custom Java development", "Managed installation", "Unannounced integrations"],
  seeds: [
    ["Plugin Admin Drop", "minecraft-plugins-admin", "permissions, staff tools and administration configuration", "1 plugin-resource drop per month", 16, 160],
    ["Plugin Economy Drop", "minecraft-plugins-economy", "shops, currency, auction and economy configuration", "1 plugin-resource drop per month", 17, 170],
    ["Plugin Quest Drop", "minecraft-plugins-quests", "quest, objective, reward and dialogue configuration", "1 plugin-resource drop per month", 18, 180],
    ["Plugin Security Drop", "minecraft-plugins-security", "access, abuse prevention and incident configuration", "1 plugin-resource drop per month", 19, 190],
    ["Plugin Performance Drop", "minecraft-plugins-performance", "profiling, limits and performance-oriented presets", "1 plugin-resource drop per month", 15, 150],
    ["Plugin Social Drop", "minecraft-plugins-social", "chat, parties, friends and community configuration", "1 plugin-resource drop per month", 14, 140],
    ["Plugin Minigame Drop", "minecraft-plugins-minigames", "queue, match, arena and reward configuration", "1 plugin-resource drop per month", 18, 180],
    ["Plugin World Drop", "minecraft-plugins-world", "world management, portals and protection configuration", "1 plugin-resource drop per month", 17, 170],
    ["Plugin Network Drop", "minecraft-plugins-network", "proxy, routing and cross-server configuration", "1 plugin-resource drop per month", 22, 220],
    ["Plugin Essentials Drop", "minecraft-plugins-essentials", "rotating high-utility configuration packs for new servers", "2 plugin-resource drops per month", 29, 290],
  ].map(seed),
}

const branding: Family = {
  family: "Server Branding",
  platform: "Game Servers",
  model: "monthly_drop",
  audience: "server owners and creators who need editable, coordinated marketing assets",
  categories: ["banners", "stream overlays", "social graphics", "thumbnails", "announcement cards", "logo lockups"],
  fileTypes: ["PNG", "WebP", "SVG", "PDF", "PSD where stated", "Figma export where stated", "ZIP"],
  eligible: ["The branding asset drop published for this plan each cycle", "Editable files named in the drop manifest", "Corrections to claimed assets"],
  excluded: ["Custom logo design", "Trademark clearance", "Printing", "Paid fonts", "Stock assets not packaged with redistribution rights"],
  seeds: [
    ["Server Launch Branding", "branding-server-launch", "launch banners, countdowns, announcement cards and social crops", "1 coordinated branding drop per month", 18, 180],
    ["Stream Branding", "branding-stream", "stream overlays, starting screens, panels and clip covers", "1 coordinated branding drop per month", 20, 200],
    ["Community Branding", "branding-community", "Discord banners, event cards, rules and update graphics", "1 coordinated branding drop per month", 16, 160],
    ["Esports Branding", "branding-esports", "match cards, roster graphics, results and tournament assets", "1 coordinated branding drop per month", 22, 220],
    ["Roleplay Branding", "branding-roleplay", "department, character, event and recruitment graphics", "1 coordinated branding drop per month", 19, 190],
    ["Survival Branding", "branding-survival", "season, reset, update and community graphics for survival servers", "1 coordinated branding drop per month", 17, 170],
    ["Seasonal Branding", "branding-seasonal", "holiday and seasonal promotional asset systems", "1 coordinated branding drop per month", 15, 150],
    ["Social Branding", "branding-social", "platform-ready posts, stories, headers and thumbnail systems", "1 coordinated branding drop per month", 18, 180],
    ["Partner Branding", "branding-partner", "sponsor, affiliate and partnership announcement systems", "1 coordinated branding drop per month", 17, 170],
    ["Brand Studio", "branding-studio", "the broadest rotating mix of server and creator graphics", "2 coordinated branding drops per month", 34, 340],
  ].map(seed),
}

const credits: Family = {
  family: "Gaming Credits",
  platform: "Game Servers",
  model: "credits",
  audience: "buyers who prefer a flexible monthly balance instead of a category-specific catalog",
  categories: ["eligible FiveM resources", "eligible Minecraft resources", "eligible server-owner resources", "eligible graphics"],
  fileTypes: ["The file types listed on each redeemed product"],
  eligible: ["Gaming products that display a credit price", "Products within the account's available credit balance"],
  excluded: ["Cash withdrawal", "Transfers between accounts", "Gift cards", "Custom services", "Products without a credit price"],
  seeds: [20, 35, 50, 75, 100, 150, 200, 300, 400, 500].map((amount) =>
    seed([`Gaming Credits ${amount}`, `gaming-credits-${amount}`, `${amount} flexible Gaming Credits for eligible catalog redemptions`, `${amount} credits per successful monthly cycle`, Math.max(9, Math.round(amount * 0.72)), Math.max(90, Math.round(amount * 7.2))]),
  ),
}

const pickKeep: Family = {
  family: "Pick & Keep",
  platform: "Game Servers",
  model: "pick_keep",
  audience: "buyers who want a fixed number of permanent additions to their DistroSource Library each billing month",
  categories: ["eligible FiveM resources", "eligible Minecraft resources", "eligible UI", "eligible owner tools", "eligible graphics"],
  fileTypes: ["The file types listed on each selected product"],
  eligible: ["Gaming products carrying this plan's Pick & Keep badge", "Selections priced at one plan selection"],
  excluded: ["Products without the Pick & Keep badge", "Custom services", "Future products before publication", "Third-party marketplace products"],
  seeds: [
    ["FiveM Pick 2", "pick-keep-fivem-2", "two permanent eligible FiveM product selections", "2 selections per month", 24, 240],
    ["FiveM Pick 5", "pick-keep-fivem-5", "five permanent eligible FiveM product selections", "5 selections per month", 49, 490],
    ["FiveM Pick 8", "pick-keep-fivem-8", "eight permanent eligible FiveM product selections", "8 selections per month", 69, 690],
    ["Minecraft Pick 2", "pick-keep-minecraft-2", "two permanent eligible Minecraft product selections", "2 selections per month", 19, 190],
    ["Minecraft Pick 5", "pick-keep-minecraft-5", "five permanent eligible Minecraft product selections", "5 selections per month", 39, 390],
    ["Minecraft Pick 8", "pick-keep-minecraft-8", "eight permanent eligible Minecraft product selections", "8 selections per month", 59, 590],
    ["Branding Pick 4", "pick-keep-branding-4", "four permanent eligible branding asset selections", "4 selections per month", 32, 320],
    ["Owner Tools Pick 4", "pick-keep-owner-tools-4", "four permanent eligible server-owner tool selections", "4 selections per month", 35, 350],
    ["UI Pick 4", "pick-keep-ui-4", "four permanent eligible interface resource selections", "4 selections per month", 38, 380],
    ["Gaming Mix Pick 6", "pick-keep-gaming-mix-6", "six permanent eligible selections across Gaming categories", "6 selections per month", 54, 540],
  ].map(seed),
}

function seed(values: (string | number)[]): Seed {
  if (values.length !== 6) throw new Error("A subscription seed must contain exactly six values.")
  const [name, slug, focus, quantity, monthly, annual] = values
  return {
    name: String(name),
    slug: String(slug),
    focus: String(focus),
    quantity: String(quantity),
    monthly: Number(monthly),
    annual: Number(annual),
  }
}

function makePlan(family: Family, item: Seed): GamingSubscriptionPlan {
  const permanent = family.model === "pick_keep"
  const creditsPlan = family.model === "credits"
  const updatePlan = family.model === "updates"
  const vault = family.model === "catalog_access"
  const immediateAccess = permanent
    ? `A verified subscription activates ${item.quantity}; a product enters the Library permanently only after the customer redeems one selection.`
    : creditsPlan
      ? `A verified payment posts ${item.quantity} to the Gaming Credits ledger. Credits can be spent only on products that display a credit price.`
      : updatePlan
        ? `A verified subscription activates access to the current files and documentation for the specifically eligible ${item.name} pack.`
        : vault
          ? `A verified subscription unlocks the currently published products marked “Included with ${item.name}”. It does not unlock unmarked products.`
          : `A verified subscription unlocks the current published drop for ${item.name}, if one exists when the subscription begins.`
  const recurringDelivery = updatePlan
    ? `Each successful billing cycle continues access to published maintenance updates for the eligible pack; it does not include new products or custom work.`
    : vault
      ? `Eligible resources may be added throughout each billing cycle. No named future resource is promised before it is published and marked eligible.`
      : `Each successful monthly benefit cycle includes ${item.quantity}, focused on ${item.focus}. A drop is claimable only after its files and manifest are published.`
  const accessRule = permanent
    ? "A redeemed product is permanently added to the buyer's DistroSource Library. Unredeemed choices exist only in the active billing cycle."
    : creditsPlan
      ? "Products redeemed with credits remain in the buyer's Library under the redeemed product's license. The credit balance itself requires an active subscription."
      : "Subscription-only downloads remain available while the plan is active. A separately purchased product remains in the Library permanently."
  const cancellationRule = permanent
    ? "Cancellation stops future selection grants at the end of the paid period. Products already redeemed remain in the Library; unused selections expire when the paid period ends."
    : creditsPlan
      ? "Cancellation stops future credit grants. Existing credits remain spendable until the earlier of their 90-day expiry or the end of the paid subscription period; redeemed products stay in the Library."
      : "Cancellation turns off renewal. Access continues through the already-paid period, then subscription-only catalog items and unclaimed drops lock. Separately purchased or explicitly Keep Forever items remain."
  const rolloverRule = permanent
    ? "Unused monthly selections do not roll over."
    : creditsPlan
      ? "Unused credits roll over for up to 90 days while the subscription remains active. Credits are not cash and cannot be withdrawn or transferred."
      : "There are no spendable credits or selections to roll over on this plan."
  const howItWorks = [
    "Subscribe using the monthly or annual billing option.",
    "Fungies verifies the payment; checkout completion alone does not grant access.",
    "DistroSource activates the plan in the Gaming Library after the signed payment webhook is processed.",
    permanent ? "Redeem eligible selections before the benefit cycle ends." : creditsPlan ? "Spend credits only on products displaying a credit price." : "Open only resources or drops explicitly marked as included.",
    "New benefits are added on the plan cadence only after the underlying files are published.",
    "Access renews after each successful recurring payment; failed or canceled renewals do not grant a new cycle.",
  ]
  const whatYouGet = [
    immediateAccess,
    recurringDelivery,
    `Focus: ${item.focus}.`,
    `Included categories: ${family.categories.join(", ")}.`,
    `Supported delivery formats can include: ${family.fileTypes.join(", ")}.`,
    accessRule,
    rolloverRule,
    "Access and downloads are delivered through the customer's DistroSource Gaming Library.",
  ]
  return {
    slug: item.slug,
    name: item.name,
    family: family.family,
    platform: family.platform,
    model: family.model,
    audience: family.audience,
    summary: `${item.name} is a recurring ${family.family} plan for ${family.audience}, focused on ${item.focus}.`,
    immediateAccess,
    recurringDelivery,
    cadence: "Benefits are evaluated monthly, including during annual billing terms.",
    quantity: item.quantity,
    categories: family.categories,
    fileTypes: family.fileTypes,
    accessRule,
    cancellationRule,
    rolloverRule,
    eligible: family.eligible,
    excluded: family.excluded,
    license: "Each delivered or redeemed resource includes its own DistroSource license file; that product-specific license controls permitted use.",
    commercialUse: "Commercial server use is included only when the selected resource explicitly states a commercial/server license. Resale, redistribution and sublicensing are never included.",
    updates: updatePlan ? "Maintenance updates for the named eligible pack are included while active. New products and custom development are excluded." : "Corrections and compatibility updates are included only for resources the customer can currently access or has permanently redeemed.",
    renewal: `At renewal Fungies charges ${item.monthly}/month or ${item.annual}/year, depending on the selected interval. A successful payment opens the next paid period and its monthly benefit cycle.`,
    usageLimits: "Downloads are limited to the buyer's account and reasonable personal/server deployment use. Automated scraping, account sharing and redistribution are prohibited.",
    notIncluded: family.excluded,
    whatYouGet,
    howItWorks,
    monthlyPriceUsd: item.monthly,
    annualPriceUsd: item.annual,
    previewOnly: true,
    requiresFutureDeliverables: true,
    cover: `/gaming/subscriptions/${item.slug}/cover.webp`,
    gallery: [1, 2, 3, 4].map((n) => `/gaming/subscriptions/${item.slug}/gallery-${String(n).padStart(2, "0")}.webp`),
  }
}

export const GAMING_SUBSCRIPTION_PLANS: GamingSubscriptionPlan[] = [
  fivemVault,
  mlo,
  fivemUi,
  owners,
  minecraftVault,
  minecraftMaps,
  minecraftPlugins,
  branding,
  credits,
  pickKeep,
].flatMap((family) => family.seeds.map((item) => makePlan(family, item)))

export function getGamingSubscriptionPlan(slug: string): GamingSubscriptionPlan | undefined {
  return GAMING_SUBSCRIPTION_PLANS.find((plan) => plan.slug === slug)
}

export function planDescriptionHtml(plan: GamingSubscriptionPlan): string {
  const list = (items: string[]) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
  return [
    `<p>${escapeHtml(plan.summary)}</p>`,
    `<h2>What You Get</h2>${list(plan.whatYouGet)}`,
    `<h2>How It Works</h2><ol>${plan.howItWorks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`,
    `<h2>After Cancellation</h2><p>${escapeHtml(plan.cancellationRule)}</p>`,
    `<h2>Eligibility</h2><h3>Included</h3>${list(plan.eligible)}<h3>Not included</h3>${list(plan.excluded)}`,
    `<h2>License and use</h2><p>${escapeHtml(plan.license)} ${escapeHtml(plan.commercialUse)}</p>`,
    `<h2>Renewal and limits</h2><p>${escapeHtml(plan.renewal)} ${escapeHtml(plan.usageLimits)}</p>`,
  ].join("")
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")
}
