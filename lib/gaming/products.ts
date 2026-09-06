import type { GamingArt, GamingCategory, GamingChangelogEntry, GamingFaq, GamingPlatform, GamingProduct } from "@/lib/gaming/types"

/**
 * The DistroSource Gaming catalogue.
 *
 * Held in code rather than the database on purpose: the production database
 * has no migration baseline yet (see docs/DATABASE-MIGRATIONS.md), and this
 * department ships without needing one. The shape matches what a
 * `gaming_products` table would hold, so moving it is a data migration and
 * not a rewrite.
 *
 * Every product carries its own artwork, installation steps, changelog and
 * FAQ. Nothing here is shared boilerplate — a police department and a phone
 * interface do not install the same way, and a buyer reading two product
 * pages should not find the same five generic steps on both.
 *
 * Tebex identifiers are placeholders. Replace `tebexPackageId` and
 * `tebexPackageUrl` with the real package values before taking payments —
 * lib/gaming/tebex.ts refuses to send a buyer to a placeholder URL.
 */

const FIVEM_DEFAULTS = {
  platform: "fivem" as GamingPlatform,
  compatibility: ["FiveM — latest recommended build", "ESX Legacy", "QBCore", "Standalone (framework-agnostic core)"],
  requirements: [
    "A FiveM server with file and console access",
    "Familiarity with adding resources to server.cfg",
    "OneSync enabled for multiplayer-safe behaviour",
  ],
}

const MINECRAFT_DEFAULTS = {
  platform: "minecraft" as GamingPlatform,
  compatibility: ["Minecraft Java Edition 1.20 – 1.21", "Paper", "Spigot", "Purpur"],
  requirements: [
    "A Minecraft Java server with file access",
    "WorldEdit or FAWE for schematic pasting where applicable",
    "At least 4 GB allocated RAM for larger builds",
  ],
}

const OTHER_DEFAULTS = {
  platform: "other" as GamingPlatform,
  compatibility: ["Platform-agnostic assets", "Editable source files supplied", "Works alongside FiveM and Minecraft servers"],
  requirements: ["Image editing software for the source files", "A place to host or display the assets"],
}

interface Draft {
  id: string
  title: string
  slug: string
  shortDescription: string
  description: string
  price: number
  originalPrice?: number
  category: GamingCategory
  subcategory: string
  art: GamingArt[]
  version: string
  lastUpdated: string
  releasedAt: string
  features: string[]
  included: string[]
  installation: string[]
  changelog: GamingChangelogEntry[]
  faq: GamingFaq[]
  tags: string[]
  featured?: boolean
  bestseller?: boolean
  popular?: boolean
  compatibility?: string[]
  requirements?: string[]
}

type Defaults = { platform: GamingPlatform; compatibility: string[]; requirements: string[] }

function build(draft: Draft, defaults: Defaults, index: number): GamingProduct {
  return {
    id: draft.id,
    title: draft.title,
    slug: draft.slug,
    shortDescription: draft.shortDescription,
    description: draft.description,
    price: draft.price,
    originalPrice: draft.originalPrice ?? null,
    platform: defaults.platform,
    category: draft.category,
    subcategory: draft.subcategory,
    images: [],
    art: draft.art,
    version: draft.version,
    lastUpdated: draft.lastUpdated,
    releasedAt: draft.releasedAt,
    compatibility: draft.compatibility ?? defaults.compatibility,
    requirements: draft.requirements ?? defaults.requirements,
    features: draft.features,
    included: draft.included,
    installation: draft.installation,
    changelog: draft.changelog,
    faq: draft.faq,
    tags: draft.tags,
    // Placeholder — replace with the real Tebex package before going live.
    tebexPackageId: String(600100 + index),
    tebexPackageUrl: `https://example.tebex.io/package/${600100 + index}`,
    featured: draft.featured ?? false,
    bestseller: draft.bestseller ?? false,
    popular: draft.popular ?? false,
    published: true,
  }
}

/** Shared closing FAQ entry — licence terms genuinely are identical. */
const LICENCE_FAQ: GamingFaq = {
  question: "What does the licence cover?",
  answer:
    "One purchase covers the servers you operate, including future updates to this product. It does not permit redistributing, reselling or publishing the source files. If you run a network of servers under one community, that is covered.",
}

const SUPPORT_FAQ: GamingFaq = {
  question: "What if it does not work on my setup?",
  answer:
    "Contact DistroSource support with your server build and the console output. We support this product directly — there is no third-party creator to chase.",
}

/* ------------------------------------------------------------------ FiveM */

const FIVEM_DRAFTS: Draft[] = [
  {
    id: "gp-001",
    title: "Premium City MLO Pack",
    slug: "premium-city-mlo-pack",
    shortDescription: "Eleven interiors covering the core of a roleplay city, built to one consistent standard.",
    description:
      "A complete set of city interiors for a roleplay server, drawn to a single art direction so buildings do not look like they came from eleven different places. Every interior is collision-tested, has working navmesh for pedestrians, and ships with interior portals already configured. Props are optimised and LOD-tuned so a full block of these does not cost you frames.",
    price: 69.99,
    originalPrice: 89.99,
    category: "maps-mlos",
    subcategory: "City interiors",
    art: [
      { scene: "interior", caption: "APARTMENT INTERIOR", tone: "warm", props: ["sofa", "table", "shelf", "plant"] },
      { scene: "interior", caption: "RETAIL UNIT", tone: "cool", props: ["counter", "shelf", "crate", "screen"] },
      { scene: "interior", caption: "NIGHTCLUB", tone: "neon", props: ["bar", "sofa", "screen", "table"] },
    ],
    version: "3.2.0",
    lastUpdated: "2026-08-21",
    releasedAt: "2025-11-04",
    featured: true,
    bestseller: true,
    popular: true,
    features: [
      "Eleven interiors: apartments, offices, retail units and a nightclub",
      "Collision and navmesh tested for pedestrians and vehicles",
      "Interior portals pre-configured — no light bleed between shells",
      "Optimised prop counts with LODs for stable frame times",
      "Optional shell variants for repeat placement without visible duplication",
    ],
    included: [
      "11 interior MLOs (.ytyp / .ymap)",
      "Streaming-ready textures",
      "Placement guide with coordinates",
      "Teleport and door-lock example config",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy the `ds_city_interiors` folder into your server's `resources` directory.",
      "Add `ensure ds_city_interiors` to `server.cfg`, above any resource that references interior coordinates.",
      "Restart the server and use the coordinates in the placement guide to fly to each interior and confirm it streams in.",
      "Import the supplied door-lock definitions into your locking resource if you use one.",
      "Set teleport markers from the example config for any interior you want players to enter directly.",
    ],
    changelog: [
      {
        version: "3.2.0",
        date: "2026-08-21",
        notes: [
          "Added two apartment shell variants so repeated placement is less obvious.",
          "Reduced prop count in the nightclub by 18% with no visual change at play distance.",
          "Fixed navmesh gap at the retail unit stockroom door.",
        ],
      },
      {
        version: "3.0.0",
        date: "2026-04-11",
        notes: [
          "Rebuilt all interior portals — resolves light bleed reported on high-population servers.",
          "Re-baked LODs across the whole set.",
          "Added the nightclub interior.",
        ],
      },
      { version: "1.0.0", date: "2025-11-04", notes: ["Initial release with eight interiors."] },
    ],
    faq: [
      {
        question: "Can I place the same interior more than once?",
        answer:
          "Yes. Several interiors ship with shell variants specifically so a street of them does not read as copy-paste. The placement guide notes which ones have variants.",
      },
      {
        question: "Will eleven interiors hurt my frame rate?",
        answer:
          "Prop counts are tuned and every interior has LODs. Interiors only stream when a player is inside the portal volume, so the cost is per-occupied-interior, not per-installed-interior.",
      },
      LICENCE_FAQ,
    ],
    tags: ["mlo", "interiors", "roleplay", "city"],
  },
  {
    id: "gp-002",
    title: "Modern Police Department MLO",
    slug: "modern-police-department-mlo",
    shortDescription: "A full department building: cells, armoury, briefing room, garage and rooftop helipad.",
    description:
      "A police department designed around how roleplay servers actually use one. The layout keeps booking, cells and the armoury on a short path so officers are not walking the length of the map between actions. Includes a briefing room sized for a full shift, an evidence store, an interior garage and a rooftop helipad with clearance for the standard air units.",
    price: 39.99,
    category: "maps-mlos",
    subcategory: "Emergency services",
    art: [
      { scene: "interior", caption: "BOOKING & CELLS", tone: "clinical", props: ["desk", "cell", "locker", "screen"] },
      { scene: "interior", caption: "BRIEFING ROOM", tone: "cool", props: ["table", "screen", "desk", "locker"] },
      { scene: "interior", caption: "INTERIOR GARAGE", tone: "cool", props: ["car", "crate", "locker", "shelf"] },
    ],
    version: "2.4.1",
    lastUpdated: "2026-07-30",
    releasedAt: "2026-01-18",
    bestseller: true,
    features: [
      "Booking, cells and armoury on a deliberately short path",
      "Briefing room sized for a full shift roster",
      "Evidence store with lockable prop points",
      "Interior garage plus rooftop helipad with air-unit clearance",
      "Door-lock definitions supplied for common locking resources",
    ],
    included: ["Department MLO", "Door-lock config", "Prop placement file", "Coordinate reference", "Installation notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_police_mlo` into your server's `resources` directory.",
      "Add `ensure ds_police_mlo` to `server.cfg`, above any job resource that references department coordinates.",
      "Restart the server and travel to the coordinates in the reference file to confirm the interior streams in.",
      "Import the supplied door-lock definitions into your locking resource and adjust which ranks hold which keys.",
      "Point your job resource at the included armoury, evidence and garage markers.",
    ],
    changelog: [
      {
        version: "2.4.1",
        date: "2026-07-30",
        notes: [
          "Widened the sally port entry so the larger van models clear it without clipping.",
          "Fixed a collision seam on the roof stair core.",
        ],
      },
      {
        version: "2.2.0",
        date: "2026-05-02",
        notes: [
          "Added the rooftop helipad with clearance for standard air units.",
          "Evidence store now has eight lockable prop points, up from four.",
        ],
      },
      { version: "1.0.0", date: "2026-01-18", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Does the helipad work with air units out of the box?",
        answer:
          "The pad has clearance and a flat collision surface for the standard helicopter models. Landing logic comes from your own job resource — this is the building, not the script.",
      },
      {
        question: "Will this replace the existing department on the map?",
        answer:
          "It is a separate interior with its own coordinates, so it does not overwrite base game assets. The reference file gives you the entry points to redirect players to.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["mlo", "police", "emergency", "roleplay"],
  },
  {
    id: "gp-003",
    title: "Luxury Auto Dealership MLO",
    slug: "luxury-auto-dealership-mlo",
    shortDescription: "A two-floor showroom with display plinths, offices and a service bay.",
    description:
      "A dealership interior for servers running a vehicle economy. The showroom floor is laid out on a grid of display plinths so a spawn script can place stock predictably, with a mezzanine for higher-value vehicles. Includes sales offices, a customer lounge and a working service bay with lifts.",
    price: 29.99,
    category: "maps-mlos",
    subcategory: "Commercial interiors",
    art: [
      { scene: "interior", caption: "SHOWROOM FLOOR", tone: "showroom", props: ["car", "car", "desk", "plant"] },
      { scene: "interior", caption: "SERVICE BAY", tone: "cool", props: ["car", "crate", "shelf", "screen"] },
    ],
    version: "1.8.0",
    lastUpdated: "2026-06-12",
    releasedAt: "2025-09-22",
    features: [
      "Grid-aligned display plinths for predictable vehicle spawn points",
      "Mezzanine floor for premium stock",
      "Sales offices and customer lounge",
      "Service bay with animated lifts",
      "Exterior forecourt with signage placeholders you can brand",
    ],
    included: ["Dealership MLO", "Spawn-point coordinate list", "Signage template (PSD)", "Installation notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_dealership_mlo` into your server's `resources` directory.",
      "Add `ensure ds_dealership_mlo` to `server.cfg`.",
      "Restart the server and confirm the showroom streams in at the coordinates in the reference file.",
      "Feed the supplied spawn-point coordinate list into your vehicle shop resource so stock lands on the plinths.",
      "Replace the forecourt signage placeholder with your own branding using the included template.",
    ],
    changelog: [
      {
        version: "1.8.0",
        date: "2026-06-12",
        notes: [
          "Service bay lifts now animate on trigger rather than sitting static.",
          "Added four mezzanine spawn points for premium stock.",
        ],
      },
      {
        version: "1.5.0",
        date: "2026-02-20",
        notes: ["Re-aligned all showroom plinths to a strict grid so spawn coordinates are predictable."],
      },
      { version: "1.0.0", date: "2025-09-22", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Will vehicles spawn on the plinths automatically?",
        answer:
          "The plinths are grid-aligned and the exact coordinates ship with the package, but the spawning itself is done by your vehicle shop resource. Paste the coordinate list into its config.",
      },
      {
        question: "Can I rebrand the forecourt signage?",
        answer: "Yes — a layered source file is included so you can drop your own dealership name and marks in.",
      },
      LICENCE_FAQ,
    ],
    tags: ["mlo", "dealership", "vehicles", "economy"],
  },
  {
    id: "gp-004",
    title: "Advanced Vehicle HUD",
    slug: "advanced-vehicle-hud",
    shortDescription: "Speed, fuel, gear, indicators and seatbelt in one compact, configurable cluster.",
    description:
      "A vehicle HUD that stays readable at speed. Everything sits in one cluster rather than scattered around the screen edge, and every element can be repositioned, resized or switched off in the config. Units, colour and the seatbelt warning behaviour are all configurable, and the HUD hides itself automatically on foot.",
    price: 14.99,
    category: "ui-hud",
    subcategory: "Vehicle interfaces",
    art: [
      {
        scene: "hud",
        caption: "HUD IN VEHICLE",
        speed: "86",
        unit: "MPH",
        gauges: [
          { label: "FUEL", fill: 0.72 },
          { label: "ENGINE", fill: 0.88 },
          { label: "CONDITION", fill: 0.61 },
        ],
        chips: ["SEATBELT", "CRUISE", "LOCK"],
      },
      {
        scene: "config",
        caption: "CONFIG - LAYOUT",
        rows: [
          { label: "CLUSTER SCALE", fill: 0.55, value: "1.0x" },
          { label: "X POSITION", fill: 0.82, value: "0.82" },
          { label: "Y POSITION", fill: 0.9, value: "0.90" },
          { label: "OPACITY", fill: 0.75, value: "75%" },
          { label: "UNITS", fill: 0.4, value: "MPH" },
        ],
      },
    ],
    version: "4.1.2",
    lastUpdated: "2026-08-02",
    releasedAt: "2025-07-15",
    popular: true,
    features: [
      "Single readable cluster rather than scattered screen elements",
      "Speed, fuel, gear, indicators, seatbelt and engine health",
      "Per-element position, scale and visibility in config",
      "Imperial or metric units",
      "Auto-hides on foot and during cutscenes",
    ],
    included: ["HUD resource", "config.lua with documented options", "Theme colour presets"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_vehicle_hud` into your server's `resources` directory.",
      "Add `ensure ds_vehicle_hud` to `server.cfg`.",
      "Open `config.lua` and set `Config.Units` to `mph` or `kmh`.",
      "Disable your existing speedometer resource to avoid two HUDs drawing at once.",
      "Restart the server, enter a vehicle, and use the in-game reposition command to place the cluster.",
    ],
    changelog: [
      {
        version: "4.1.2",
        date: "2026-08-02",
        notes: [
          "Fixed the seatbelt warning persisting after exiting a vehicle in rare cases.",
          "Cluster now hides correctly during scripted cutscenes.",
        ],
      },
      {
        version: "4.0.0",
        date: "2026-03-14",
        notes: [
          "Rewrote positioning: every element is now independently placeable rather than fixed to the cluster.",
          "Added metric units and three theme presets.",
        ],
      },
      { version: "1.0.0", date: "2025-07-15", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Can I move individual elements, or only the whole cluster?",
        answer:
          "Either. The cluster moves as one by default, but each element has its own position, scale and visibility entry in config.lua if you want to break it apart.",
      },
      {
        question: "Does it conflict with my existing speedometer?",
        answer:
          "Two HUDs will draw over each other. Disable the old resource before starting this one — step five of the installation covers it.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["hud", "vehicles", "ui", "interface"],
  },
  {
    id: "gp-005",
    title: "Premium Inventory Interface",
    slug: "premium-inventory-interface",
    shortDescription: "Grid inventory with drag-and-drop, weight, hotbar and container support.",
    description:
      "An inventory front end built for servers that care about how the interface feels. Drag-and-drop is snappy, stacks split with a modifier key, and weight is shown as a bar rather than a number you have to interpret. Supports player inventory, containers, vehicle trunks and shops through one consistent layout.",
    price: 24.99,
    originalPrice: 34.99,
    category: "ui-hud",
    subcategory: "Inventory",
    art: [
      {
        scene: "screen",
        caption: "PLAYER INVENTORY",
        app: "INVENTORY",
        tabs: ["PLAYER", "CONTAINER", "TRUNK", "SHOP", "CRAFTING"],
        activeTab: 0,
        slots: 15,
        meter: { label: "WEIGHT 24.5 / 40 KG", fill: 0.61 },
      },
      {
        scene: "screen",
        caption: "VEHICLE TRUNK",
        app: "TRUNK",
        tabs: ["PLAYER", "CONTAINER", "TRUNK", "SHOP", "CRAFTING"],
        activeTab: 2,
        slots: 12,
        meter: { label: "CAPACITY 62 / 120 KG", fill: 0.52 },
      },
    ],
    version: "5.0.3",
    lastUpdated: "2026-08-18",
    releasedAt: "2025-05-30",
    bestseller: true,
    popular: true,
    features: [
      "Grid layout with drag-and-drop and modifier-key stack splitting",
      "Weight shown as a bar with a clear over-capacity state",
      "Player, container, trunk and shop views share one layout",
      "Hotbar with keybind support",
      "Item metadata display for durability and quality",
    ],
    included: ["Inventory UI resource", "Item image starter set", "Framework bridge examples", "config.lua"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_inventory_ui` into your server's `resources` directory.",
      "Add `ensure ds_inventory_ui` to `server.cfg`, after your framework resource.",
      "Open the `bridges` folder and enable the bridge matching your framework — ESX Legacy and QBCore are both supplied.",
      "Copy your existing item images into `html/images`, or start from the included starter set.",
      "Restart the server and confirm items, weight and the hotbar all populate before disabling your old inventory UI.",
    ],
    changelog: [
      {
        version: "5.0.3",
        date: "2026-08-18",
        notes: [
          "Fixed stack splitting when the target slot already held a partial stack.",
          "Over-capacity state now blocks the drop instead of silently reverting it.",
        ],
      },
      {
        version: "5.0.0",
        date: "2026-06-01",
        notes: [
          "Unified player, container, trunk and shop into one layout — four separate screens previously.",
          "Added item metadata display for durability and quality.",
          "Rewrote drag-and-drop; roughly 3x faster on low-end clients.",
        ],
      },
      { version: "1.0.0", date: "2025-05-30", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Does this replace my inventory system or just the interface?",
        answer:
          "Just the interface. Your existing inventory logic, items and database stay exactly as they are — this is the front end that draws them.",
      },
      {
        question: "Will my current item images work?",
        answer:
          "Yes. Drop your existing image folder into `html/images` and the UI picks them up by item name. A starter set is included for anything missing.",
      },
      LICENCE_FAQ,
    ],
    tags: ["inventory", "ui", "interface", "roleplay"],
  },
  {
    id: "gp-006",
    title: "Advanced Garage System",
    slug: "advanced-garage-system",
    shortDescription: "Multi-garage vehicle storage with impound, insurance and condition persistence.",
    description:
      "A garage system that remembers what happened to the car. Vehicle condition, fuel and modifications persist between sessions, damaged vehicles can be routed to an impound with a configurable fee, and each garage can be restricted by job or ownership. Includes an admin view for recovering vehicles that get stuck.",
    price: 19.99,
    category: "scripts-systems",
    subcategory: "Vehicle systems",
    art: [
      { scene: "system", caption: "STORAGE LIFECYCLE", stages: ["STORE VEHICLE", "PERSIST STATE", "IMPOUND", "RETRIEVE"], activeStage: 1 },
      {
        scene: "config",
        caption: "CONFIG - GARAGE",
        rows: [
          { label: "IMPOUND FEE", fill: 0.45, value: "$850" },
          { label: "STORAGE SLOTS", fill: 0.6, value: "12" },
          { label: "RETRIEVE DELAY", fill: 0.2, value: "3s" },
          { label: "INSURANCE PAYOUT", fill: 0.7, value: "70%" },
          { label: "JOB LOCK", fill: 0.5, value: "ON" },
        ],
      },
    ],
    version: "3.6.0",
    lastUpdated: "2026-07-09",
    releasedAt: "2025-10-11",
    features: [
      "Condition, fuel and modifications persist between sessions",
      "Impound flow with configurable recovery fee",
      "Per-garage job and ownership restrictions",
      "Admin recovery tool for stuck vehicles",
      "Database schema and migration script included",
    ],
    included: ["Garage resource", "SQL schema and migration", "Admin commands reference", "config.lua"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Run the included `schema.sql` against your server database before starting the resource.",
      "Copy `ds_garages` into your server's `resources` directory.",
      "Add `ensure ds_garages` to `server.cfg`, after your framework and database resources.",
      "Define your garage locations in `config.lua` — three worked examples are supplied.",
      "Restart the server and store a vehicle, then confirm the row appears in the `ds_vehicles` table.",
    ],
    changelog: [
      {
        version: "3.6.0",
        date: "2026-07-09",
        notes: [
          "Added the admin recovery command for vehicles stranded outside any garage.",
          "Impound fee can now be set per garage rather than globally.",
        ],
      },
      {
        version: "3.2.0",
        date: "2026-03-28",
        notes: [
          "Vehicle modifications now persist alongside condition and fuel.",
          "Migration script included for servers upgrading from 2.x.",
        ],
      },
      { version: "1.0.0", date: "2025-10-11", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Do I need to wipe my existing vehicle data?",
        answer:
          "No. A migration script is included that reads common existing schemas and populates the new tables in place. Back up first regardless.",
      },
      {
        question: "What happens to a vehicle a player leaves in the street?",
        answer:
          "After a configurable timeout it routes to the impound with the fee attached. The admin recovery command covers anything that ends up genuinely stuck.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["garage", "vehicles", "system", "persistence"],
  },
  {
    id: "gp-007",
    title: "Business Management System",
    slug: "business-management-system",
    shortDescription: "Player-owned businesses with staff roles, payroll, stock and a books view.",
    description:
      "Everything a player needs to run a business in-server: hire and fire staff against defined roles, set wages, track stock in and out, and see takings over time. Owners get a books view showing revenue against costs; staff only see what their role allows. Designed to sit on top of your existing economy rather than replace it.",
    price: 39.99,
    category: "scripts-systems",
    subcategory: "Economy",
    art: [
      { scene: "system", caption: "BUSINESS CYCLE", stages: ["HIRE STAFF", "SET WAGES", "TRACK STOCK", "BOOKS"], activeStage: 3 },
      {
        scene: "screen",
        caption: "OWNER BOOKS",
        app: "BUSINESS",
        tabs: ["STAFF", "PAYROLL", "STOCK", "BOOKS", "ROLES"],
        activeTab: 3,
        slots: 12,
        meter: { label: "MONTH TO DATE - REVENUE", fill: 0.68 },
      },
    ],
    version: "2.9.1",
    lastUpdated: "2026-08-14",
    releasedAt: "2026-02-06",
    popular: true,
    features: [
      "Staff roles with per-role permissions",
      "Payroll on a configurable interval",
      "Stock tracking with low-stock alerts",
      "Owner books view: revenue, costs and takings over time",
      "Sits on top of your existing economy resource",
    ],
    included: ["Business resource", "SQL schema", "Role permission matrix", "config.lua"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Run the included `schema.sql` against your server database.",
      "Copy `ds_business` into your server's `resources` directory.",
      "Add `ensure ds_business` to `server.cfg`, after your framework and economy resources.",
      "Set the payroll interval and the account your economy resource uses in `config.lua`.",
      "Restart the server, register a test business, and confirm a payroll run posts to the books view.",
    ],
    changelog: [
      {
        version: "2.9.1",
        date: "2026-08-14",
        notes: [
          "Low-stock alerts no longer fire repeatedly for the same item within one interval.",
          "Books view now separates wage costs from stock costs.",
        ],
      },
      {
        version: "2.5.0",
        date: "2026-05-19",
        notes: ["Added the role permission matrix so owners can define custom roles rather than using three fixed ones."],
      },
      { version: "1.0.0", date: "2026-02-06", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Does this replace my economy resource?",
        answer:
          "No. It posts to whichever economy resource you already run — you point it at the right account in config.lua. Balances stay in one place.",
      },
      {
        question: "Can staff see the owner's books?",
        answer: "Only if you give their role that permission. The default roles deliberately do not include it.",
      },
      LICENCE_FAQ,
    ],
    tags: ["business", "economy", "system", "roleplay"],
  },
  {
    id: "gp-008",
    title: "Modern Phone Interface",
    slug: "modern-phone-interface",
    shortDescription: "In-game phone with calls, messages, contacts, banking and a photo gallery.",
    description:
      "A phone interface that behaves like a phone: an app grid, a notification tray, and apps that keep their state when you switch between them. Ships with calls, messages, contacts, a bank app, a camera with a saved gallery, and a simple social feed. New apps can be registered without editing the core.",
    price: 29.99,
    category: "ui-hud",
    subcategory: "Phone",
    art: [
      {
        scene: "phone",
        caption: "HOME SCREEN",
        apps: [
          { name: "PHONE", hue: 130 },
          { name: "MESSAGES", hue: 100 },
          { name: "CONTACTS", hue: 205 },
          { name: "BANK", hue: 160 },
          { name: "CAMERA", hue: 220 },
          { name: "GALLERY", hue: 285 },
          { name: "SOCIAL", hue: 20 },
          { name: "SETTINGS", hue: 215 },
          { name: "STORE", hue: 40 },
        ],
      },
      {
        scene: "screen",
        caption: "APP SDK",
        app: "SDK REGISTRY",
        tabs: ["CORE", "APPS", "THEMES", "EVENTS"],
        activeTab: 1,
        slots: 9,
      },
    ],
    version: "6.2.0",
    lastUpdated: "2026-08-25",
    releasedAt: "2026-03-19",
    features: [
      "App grid with a working notification tray",
      "Calls, messages, contacts, bank, camera and social feed",
      "Apps keep state when switching",
      "Third-party apps register without editing the core",
      "Light and dark themes",
    ],
    included: ["Phone resource", "App SDK with a worked example", "Theme files", "config.lua"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Run the included `schema.sql` to create the message, contact and gallery tables.",
      "Copy `ds_phone` into your server's `resources` directory.",
      "Add `ensure ds_phone` to `server.cfg`, after your framework resource.",
      "Set the phone item name and keybind in `config.lua` so it matches your inventory.",
      "Restart the server and confirm calls and messages work between two test clients before rolling it out.",
    ],
    changelog: [
      {
        version: "6.2.0",
        date: "2026-08-25",
        notes: [
          "Added the app SDK so third-party apps register without editing the core.",
          "Gallery now stores images against the player rather than the character slot.",
        ],
      },
      {
        version: "6.0.0",
        date: "2026-06-08",
        notes: [
          "Rebuilt app state handling — switching apps no longer resets scroll position or draft messages.",
          "Added light theme.",
        ],
      },
      { version: "1.0.0", date: "2026-03-19", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Can I add my own apps?",
        answer:
          "Yes. The SDK registers an app from its own folder — you do not edit or fork the core to add one, so core updates stay clean. A worked example ships with the package.",
      },
      {
        question: "Does it need a phone item in the inventory?",
        answer:
          "It works either way. Set an item name in config.lua to gate it behind an item, or leave it blank to give every player a phone.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["phone", "ui", "interface", "apps"],
  },
  {
    id: "gp-009",
    title: "Emergency Services UI Pack",
    slug: "emergency-services-ui-pack",
    shortDescription: "MDT, dispatch board and callout panels for police, fire and EMS.",
    description:
      "A shared interface set for the three emergency services so dispatch, police and EMS are reading the same screens. Includes a mobile data terminal with searchable records, a dispatch board with unit status, and callout panels that keep priority and location visible without covering the play area.",
    price: 19.99,
    category: "ui-hud",
    subcategory: "Emergency services",
    art: [
      {
        scene: "screen",
        caption: "MDT RECORDS",
        app: "MDT",
        tabs: ["PERSONS", "VEHICLES", "WARRANTS", "REPORTS", "UNITS"],
        activeTab: 0,
        slots: 16,
      },
      {
        scene: "screen",
        caption: "DISPATCH BOARD",
        app: "DISPATCH",
        tabs: ["ACTIVE", "QUEUED", "UNITS", "LOG"],
        activeTab: 2,
        slots: 12,
        meter: { label: "UNITS AVAILABLE 6 / 11", fill: 0.55 },
      },
    ],
    version: "2.1.0",
    lastUpdated: "2026-05-28",
    releasedAt: "2026-01-30",
    features: [
      "Mobile data terminal with searchable person and vehicle records",
      "Dispatch board with live unit status",
      "Callout panels that stay clear of the play area",
      "Shared design across police, fire and EMS",
      "Role-based visibility of sensitive records",
    ],
    included: ["MDT interface", "Dispatch board", "Callout panel set", "Integration notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_emergency_ui` into your server's `resources` directory.",
      "Add `ensure ds_emergency_ui` to `server.cfg`, after your job and records resources.",
      "Map your existing records tables to the MDT fields using the supplied integration notes.",
      "Set which job grades can see warrants and medical records in `config.lua`.",
      "Restart the server and confirm a test record returns in the MDT search before going live.",
    ],
    changelog: [
      {
        version: "2.1.0",
        date: "2026-05-28",
        notes: [
          "Callout panels moved out of the lower-centre play area after feedback from pursuit-heavy servers.",
          "Added role-based masking for medical records.",
        ],
      },
      {
        version: "2.0.0",
        date: "2026-03-02",
        notes: ["Unified police, fire and EMS onto one design system — three separate interface sets previously."],
      },
      { version: "1.0.0", date: "2026-01-30", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Does this come with a records system?",
        answer:
          "No — it is the interface. It reads whatever records tables you already run; the integration notes cover mapping your fields onto the MDT.",
      },
      {
        question: "Can EMS see police records?",
        answer:
          "Only what you allow. Visibility is set per job grade in config.lua, and medical records are masked from police by default.",
      },
      LICENCE_FAQ,
    ],
    tags: ["mdt", "dispatch", "emergency", "ui"],
  },
  {
    id: "gp-010",
    title: "Server Essentials Bundle",
    slug: "fivem-server-essentials-bundle",
    shortDescription: "The core systems a new FiveM server needs, priced as one package.",
    description:
      "A starting point for a new server: HUD, inventory interface, garage system and admin tooling, already configured to work together. Buying the bundle costs materially less than the products separately, and the included setup guide takes a blank server to a playable state in one sitting.",
    price: 49.99,
    originalPrice: 79.99,
    category: "bundles",
    subcategory: "Server starter",
    art: [
      {
        scene: "pack",
        caption: "PACK CONTENTS",
        items: ["Advanced Vehicle HUD", "Premium Inventory UI", "Advanced Garage System", "Admin tooling", "Combined config"],
      },
      { scene: "system", caption: "SETUP PATH", stages: ["INSTALL", "CONFIGURE", "VERIFY", "LAUNCH"], activeStage: 0 },
    ],
    version: "1.5.0",
    lastUpdated: "2026-08-27",
    releasedAt: "2026-04-02",
    featured: true,
    popular: true,
    features: [
      "Vehicle HUD, inventory interface, garage system and admin tooling",
      "Pre-configured to work together out of the box",
      "Setup guide from blank server to playable",
      "Materially cheaper than buying the parts separately",
      "One update stream for the whole bundle",
    ],
    included: ["Four core resources", "Combined configuration", "Setup guide", "Update notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Run the combined `schema.sql` — it covers the garage tables for the whole bundle in one pass.",
      "Copy all four resource folders into your server's `resources` directory.",
      "Add the four `ensure` lines from the setup guide to `server.cfg` in the order given — order matters here.",
      "Open `ds_bundle_config.lua` and set your framework, currency and units once; the four resources read from it.",
      "Restart the server and walk the verification checklist at the end of the setup guide.",
    ],
    changelog: [
      {
        version: "1.5.0",
        date: "2026-08-27",
        notes: [
          "Rolled up Inventory 5.0.3 and Garage 3.6.0.",
          "Combined config now sets units once for the whole bundle instead of per resource.",
        ],
      },
      {
        version: "1.2.0",
        date: "2026-06-15",
        notes: ["Added admin tooling to the bundle.", "Setup guide rewritten around a blank server rather than an existing one."],
      },
      { version: "1.0.0", date: "2026-04-02", notes: ["Initial release with three resources."] },
    ],
    faq: [
      {
        question: "What if I already own one of these products?",
        answer:
          "Contact DistroSource support before buying and we will sort out the difference rather than charging you twice for the same resource.",
      },
      {
        question: "Do the bundled resources update with the standalone versions?",
        answer:
          "Yes, on one update stream. When a component product ships a fix, it is rolled into the next bundle release — the changelog names the versions included.",
      },
      LICENCE_FAQ,
    ],
    tags: ["bundle", "starter", "essentials", "server"],
  },
  {
    id: "gp-021",
    title: "Emergency Vehicle Pack",
    slug: "emergency-vehicle-pack",
    shortDescription: "Fourteen police, fire and EMS vehicles with liveries, ELS lighting and tuned handling.",
    description:
      "A complete emergency fleet built to one standard, so your police, fire and EMS units look like they belong to the same city. Every vehicle has a layered livery you can rebrand, ELS-compatible lighting with realistic patterns, working extras, and handling tuned so pursuit vehicles actually behave differently from the ambulance. Liveries ship as source files at 4K.",
    price: 54.99,
    originalPrice: 74.99,
    category: "vehicles",
    subcategory: "Emergency fleet",
    art: [
      { scene: "lineup", caption: "EMERGENCY FLEET", subject: "vehicle", count: 14, accentIndex: 1 },
      { scene: "interior", caption: "IN THE GARAGE", tone: "cool", props: ["car", "crate", "shelf", "screen"] },
      {
        scene: "config",
        caption: "HANDLING TUNE",
        rows: [
          { label: "TOP SPEED", fill: 0.78, value: "142" },
          { label: "ACCELERATION", fill: 0.7, value: "0.34" },
          { label: "BRAKE FORCE", fill: 0.82, value: "1.05" },
          { label: "TRACTION", fill: 0.66, value: "2.1" },
          { label: "MASS", fill: 0.55, value: "2100kg" },
        ],
      },
    ],
    version: "4.2.0",
    lastUpdated: "2026-08-24",
    releasedAt: "2025-09-12",
    featured: true,
    bestseller: true,
    features: [
      "Fourteen vehicles across police, fire and EMS",
      "Layered 4K liveries supplied as source files for rebranding",
      "ELS-compatible lighting with realistic patterns per unit type",
      "Handling tuned per role — pursuit units differ from heavy apparatus",
      "Working extras: light bars, push bars, equipment and unit numbers",
    ],
    included: ["14 vehicle models", "Livery source files (PSD)", "handling.meta entries", "carcols / carvariations", "Installation notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy the `ds_emergency_vehicles` folder into your server's `resources` directory.",
      "Add `ensure ds_emergency_vehicles` to `server.cfg`.",
      "Merge the supplied `handling.meta`, `carcols.meta` and `carvariations.meta` entries with your existing vehicle metas — do not replace the files wholesale.",
      "Rebrand the liveries with the supplied source files and re-export as YTD at the same resolution.",
      "Restart the server and spawn one vehicle from each category to confirm lighting and extras work.",
    ],
    changelog: [
      {
        version: "4.2.0",
        date: "2026-08-24",
        notes: [
          "Rebuilt ELS patterns for all fire apparatus after reports of stuttering on high-population servers.",
          "Added two unmarked pursuit units.",
          "Liveries re-exported at 4K, up from 2K.",
        ],
      },
      {
        version: "4.0.0",
        date: "2026-03-06",
        notes: ["Retuned handling across the whole fleet against role rather than one shared profile.", "Added working push bars and equipment extras."],
      },
      { version: "1.0.0", date: "2025-09-12", notes: ["Initial release with nine vehicles."] },
    ],
    faq: [
      {
        question: "Can I put my own department branding on these?",
        answer:
          "Yes — that is what the layered source files are for. Swap the department name, crest and unit numbering, re-export, and the rest of the livery stays intact.",
      },
      {
        question: "Do I need ELS?",
        answer:
          "No. The lighting is ELS-compatible but falls back to standard siren behaviour if you do not run ELS. Both paths are covered in the notes.",
      },
      LICENCE_FAQ,
    ],
    tags: ["vehicles", "emergency", "police", "els"],
  },
  {
    id: "gp-022",
    title: "Tuner Car Pack",
    slug: "tuner-car-pack",
    shortDescription: "Twelve tunable street cars with full mod support, custom wheels and engine audio.",
    description:
      "Twelve street cars built for a server with a tuning scene. Every model supports the full mod menu — body kits, spoilers, bumpers, wheels, liveries and engine swaps — with LODs at four levels so a full car meet does not tank frames. Includes matching engine audio and a wheel pack that works across the whole set.",
    price: 39.99,
    category: "vehicles",
    subcategory: "Street and tuner",
    art: [
      { scene: "lineup", caption: "TUNER LINEUP", subject: "vehicle", count: 12, accentIndex: 2 },
      {
        scene: "config",
        caption: "MOD SUPPORT",
        rows: [
          { label: "BODY KITS", fill: 0.9, value: "6" },
          { label: "SPOILERS", fill: 0.75, value: "5" },
          { label: "WHEEL SETS", fill: 1, value: "18" },
          { label: "LIVERY SLOTS", fill: 0.62, value: "8" },
          { label: "ENGINE TIERS", fill: 0.8, value: "4" },
        ],
      },
    ],
    version: "3.1.0",
    lastUpdated: "2026-07-18",
    releasedAt: "2025-11-28",
    popular: true,
    features: [
      "Twelve cars with full mod-menu support",
      "Six body kits, five spoilers and eighteen wheel sets across the pack",
      "Four LOD levels — built for car meets, not single spawns",
      "Matching engine audio per vehicle",
      "Eight livery slots per car with template files",
    ],
    included: ["12 vehicle models", "Shared wheel pack", "Engine audio set", "Livery templates", "Meta entries"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_tuner_pack` into your server's `resources` directory.",
      "Add `ensure ds_tuner_pack` to `server.cfg`.",
      "Merge the supplied meta entries with your existing vehicle metas rather than overwriting them.",
      "Add the shared wheel pack entries to `carcols.meta` — the wheels are referenced by every car in the set.",
      "Restart, spawn one car, and confirm the mod menu lists kits, wheels and engine tiers.",
    ],
    changelog: [
      {
        version: "3.1.0",
        date: "2026-07-18",
        notes: ["Added a fourth LOD level to the six heaviest models.", "Fixed wheel offset on two cars at maximum camber."],
      },
      { version: "3.0.0", date: "2026-02-14", notes: ["Added engine audio for all twelve.", "Expanded to eight livery slots per car."] },
      { version: "1.0.0", date: "2025-11-28", notes: ["Initial release with eight cars."] },
    ],
    faq: [
      {
        question: "Will a full car meet hurt performance?",
        answer:
          "That is the case these were built for. Four LOD levels and tuned poly budgets mean twenty of these on screen costs roughly what eight untuned models would.",
      },
      {
        question: "Are these replace or add-on?",
        answer: "Add-on, so they sit alongside base game vehicles rather than overwriting them. Nothing in your existing fleet changes.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["vehicles", "tuner", "cars", "mods"],
  },
  {
    id: "gp-023",
    title: "Emergency Services EUP Pack",
    slug: "emergency-services-eup-pack",
    shortDescription: "Police, fire and EMS uniforms for both genders with rank variants and patches.",
    description:
      "A uniform set covering the three emergency services, drawn to one standard so a joint scene does not look like three different servers. Includes patrol, tactical, dress and utility variants, rank insignia from officer to command, and separate male and female meshes that actually fit rather than being scaled copies. Patches are on their own layer for rebranding.",
    price: 34.99,
    category: "clothing",
    subcategory: "Emergency uniforms",
    art: [
      { scene: "lineup", caption: "UNIFORM SET", subject: "character", count: 48, accentIndex: 2 },
      {
        scene: "screen",
        caption: "CLOTHING MENU",
        app: "WARDROBE",
        tabs: ["TORSO", "LEGS", "VEST", "BADGE", "HAT"],
        activeTab: 0,
        slots: 15,
      },
    ],
    version: "2.6.0",
    lastUpdated: "2026-08-07",
    releasedAt: "2026-01-22",
    bestseller: true,
    features: [
      "Police, fire and EMS covered in one consistent set",
      "Patrol, tactical, dress and utility variants",
      "Rank insignia from officer through command",
      "Separate male and female meshes, not scaled copies",
      "Patches on their own layer for rebranding",
    ],
    included: ["EUP clothing set", "Patch source files", "Rank reference chart", "Installation notes"],
    requirements: [
      "A FiveM server with file and console access",
      "An EUP-compatible clothing resource already installed",
      "A clothing menu resource for players to select items",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy the supplied streaming folders into your existing EUP resource.",
      "Merge the provided clothing metas with your current ones — component IDs are listed in the reference chart.",
      "Rebrand the patches using the source files if you run a custom department.",
      "Restart the server and open the clothing menu to confirm every variant appears under the right component.",
      "Set rank-gated access in your job resource if you want insignia restricted.",
    ],
    changelog: [
      {
        version: "2.6.0",
        date: "2026-08-07",
        notes: ["Added command-rank dress uniforms for all three services.", "Fixed vest clipping on two female torso variants."],
      },
      { version: "2.0.0", date: "2026-04-19", notes: ["Rebuilt female meshes from scratch rather than scaling the male set.", "Patches moved to their own layer."] },
      { version: "1.0.0", date: "2026-01-22", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Does this need EUP installed already?",
        answer:
          "Yes. This is a clothing set that streams into an existing EUP-compatible resource — it does not replace your clothing framework.",
      },
      {
        question: "Can I use my own department patches?",
        answer: "Yes, the patches are a separate layer with source files supplied. Swap them and re-export.",
      },
      LICENCE_FAQ,
    ],
    tags: ["clothing", "eup", "uniforms", "emergency"],
  },
  {
    id: "gp-024",
    title: "Civilian Clothing Collection",
    slug: "civilian-clothing-collection",
    shortDescription: "Over 200 civilian clothing items across tops, legs, shoes and accessories.",
    description:
      "A civilian wardrobe with enough range that players stop looking like the same six characters. Over 200 items across tops, jackets, legwear, footwear and accessories, split between male and female with correct meshes for each. Everything shares one texture standard, so mixing items from different sets does not produce a resolution mismatch.",
    price: 29.99,
    category: "clothing",
    subcategory: "Civilian wardrobe",
    art: [
      { scene: "lineup", caption: "WARDROBE", subject: "character", count: 214, accentIndex: 3 },
      {
        scene: "screen",
        caption: "ITEM BROWSER",
        app: "CLOTHING",
        tabs: ["TOPS", "JACKETS", "LEGS", "SHOES", "ACCESSORIES"],
        activeTab: 1,
        slots: 20,
      },
    ],
    version: "5.4.0",
    lastUpdated: "2026-08-16",
    releasedAt: "2025-06-05",
    popular: true,
    features: [
      "200+ items across five component categories",
      "Correct male and female meshes throughout",
      "One texture standard so mixed outfits stay consistent",
      "Colour variants on the majority of items",
      "Component ID reference so nothing collides with your existing sets",
    ],
    included: ["Clothing streaming set", "Component ID reference", "Texture variant sheets", "Installation notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy the streaming folders into your clothing resource.",
      "Check the component ID reference against your existing sets and shift the supplied IDs if anything collides.",
      "Merge the clothing metas with your current ones.",
      "Restart the server and page through the clothing menu to confirm all categories populate.",
      "Rebuild your clothing cache if your menu resource keeps one.",
    ],
    changelog: [
      {
        version: "5.4.0",
        date: "2026-08-16",
        notes: ["Added 34 items across jackets and footwear.", "Normalised texture resolution across the older sets."],
      },
      { version: "5.0.0", date: "2026-03-30", notes: ["Reissued every item against one texture standard.", "Added the component ID reference."] },
      { version: "1.0.0", date: "2025-06-05", notes: ["Initial release with 90 items."] },
    ],
    faq: [
      {
        question: "Will these clash with clothing packs I already run?",
        answer:
          "Component IDs are documented so you can check before installing, and shifting the supplied range is a config change rather than a re-export.",
      },
      {
        question: "Are all items available for both genders?",
        answer:
          "The large majority are, with correct meshes for each rather than a scaled copy. The reference chart marks the handful that are single-gender.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["clothing", "civilian", "wardrobe", "roleplay"],
  },
  {
    id: "gp-025",
    title: "Custom Ped Model Pack",
    slug: "custom-ped-model-pack",
    shortDescription: "Ten original character models with rigged faces, LODs and clothing component support.",
    description:
      "Ten original peds built to the game's own rig, so they animate correctly rather than sliding through emotes. Each has a rigged face with working expressions, three LOD levels, and clothing component support so players can dress them from your existing wardrobe rather than being stuck with a baked outfit.",
    price: 32.99,
    category: "characters",
    subcategory: "Player models",
    art: [
      { scene: "lineup", caption: "PED MODELS", subject: "character", count: 10, accentIndex: 1 },
      {
        scene: "config",
        caption: "MODEL BUDGET",
        rows: [
          { label: "TRIANGLES", fill: 0.52, value: "24k" },
          { label: "LOD LEVELS", fill: 0.75, value: "3" },
          { label: "FACE BONES", fill: 0.88, value: "FULL" },
          { label: "COMPONENTS", fill: 0.7, value: "11" },
          { label: "TEXTURE SIZE", fill: 0.6, value: "2K" },
        ],
      },
    ],
    version: "2.3.0",
    lastUpdated: "2026-06-25",
    releasedAt: "2026-02-11",
    features: [
      "Ten original models built to the game rig",
      "Rigged faces with working expressions",
      "Three LOD levels each",
      "Clothing component support — not a baked outfit",
      "Freemode-compatible skeletons for standard animations",
    ],
    included: ["10 ped models", "Component reference", "LOD notes", "Installation guide"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_peds` into your server's `resources` directory.",
      "Add `ensure ds_peds` to `server.cfg`.",
      "Register the model names with your character or spawn resource using the supplied reference.",
      "Restart the server and load each model once to confirm the face rig and LODs stream correctly.",
      "Add the models to your clothing menu if you want players selecting them directly.",
    ],
    changelog: [
      {
        version: "2.3.0",
        date: "2026-06-25",
        notes: ["Added three models.", "Rebuilt LOD1 on the original seven — noticeable pop-in at mid distance is gone."],
      },
      { version: "2.0.0", date: "2026-04-08", notes: ["Added full face rigging so expressions work with standard emote resources."] },
      { version: "1.0.0", date: "2026-02-11", notes: ["Initial release with seven models."] },
    ],
    faq: [
      {
        question: "Can players wear my existing clothing on these?",
        answer:
          "Yes — they support clothing components rather than shipping a baked outfit, so your existing wardrobe applies to them.",
      },
      {
        question: "Do standard emote packs work?",
        answer: "They use freemode-compatible skeletons, so anything built for the standard rig plays correctly.",
      },
      LICENCE_FAQ,
    ],
    tags: ["peds", "characters", "models", "roleplay"],
  },
  {
    id: "gp-026",
    title: "Modern Weapon Pack",
    slug: "modern-weapon-pack",
    shortDescription: "Fifteen weapon models with attachments, custom audio and balanced ballistics.",
    description:
      "Fifteen weapons modelled to a consistent standard with working attachment points for optics, suppressors, grips and lights. Ballistics are balanced against each other rather than each weapon being tuned alone, so damage, range and recoil form a coherent ladder. Includes custom firing audio and correct animations for each class.",
    price: 34.99,
    category: "weapons",
    subcategory: "Weapon models",
    art: [
      { scene: "lineup", caption: "WEAPON SET", subject: "weapon", count: 15, accentIndex: 1 },
      {
        scene: "config",
        caption: "BALLISTICS",
        rows: [
          { label: "DAMAGE", fill: 0.68, value: "42" },
          { label: "RANGE", fill: 0.74, value: "180m" },
          { label: "RECOIL", fill: 0.42, value: "LOW" },
          { label: "FIRE RATE", fill: 0.8, value: "720rpm" },
          { label: "MAG SIZE", fill: 0.6, value: "30" },
        ],
      },
    ],
    version: "3.3.0",
    lastUpdated: "2026-07-27",
    releasedAt: "2025-12-14",
    features: [
      "Fifteen weapons modelled to one standard",
      "Attachment points for optics, suppressors, grips and lights",
      "Ballistics balanced as a ladder, not weapon by weapon",
      "Custom firing and reload audio",
      "Correct animation sets per weapon class",
    ],
    included: ["15 weapon models", "Attachment meshes", "Audio set", "weapons.meta entries", "Balance notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_weapons` into your server's `resources` directory.",
      "Add `ensure ds_weapons` to `server.cfg`.",
      "Merge the supplied `weapons.meta` and `pedpersonality.meta` entries with your existing files.",
      "Register the weapon hashes with your inventory resource so they can be given and stored.",
      "Restart, then read the balance notes before adjusting damage — the values are set relative to each other.",
    ],
    changelog: [
      {
        version: "3.3.0",
        date: "2026-07-27",
        notes: ["Added four weapons and rebalanced the ladder around them.", "Suppressor attachment now affects audio as well as muzzle flash."],
      },
      { version: "3.0.0", date: "2026-03-21", notes: ["Replaced all firing audio.", "Rebuilt attachment points so optics align correctly at all zoom levels."] },
      { version: "1.0.0", date: "2025-12-14", notes: ["Initial release with eleven weapons."] },
    ],
    faq: [
      {
        question: "Can I change the damage values?",
        answer:
          "Yes, but read the balance notes first — the values are set relative to one another, so changing one in isolation tends to break the ladder.",
      },
      {
        question: "Do these work with my inventory system?",
        answer:
          "They register as standard weapon hashes, so any inventory that handles base game weapons handles these. The hash list is included.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["weapons", "attachments", "ballistics", "combat"],
  },
  {
    id: "gp-027",
    title: "Emote & Animation Pack",
    slug: "emote-animation-pack",
    shortDescription: "Over 300 emotes and animations with a searchable in-game menu and keybinds.",
    description:
      "More than 300 animations covering everyday actions, social emotes, props, dances and paired interactions. The menu is searchable and supports favourites and keybinds, so players are not scrolling a wall of names mid-scene. Paired emotes have a consent prompt rather than snapping another player into position.",
    price: 19.99,
    category: "animations",
    subcategory: "Emotes",
    art: [
      { scene: "lineup", caption: "EMOTE SET", subject: "character", count: 312, accentIndex: 2 },
      {
        scene: "screen",
        caption: "EMOTE MENU",
        app: "EMOTES",
        tabs: ["FAVOURITES", "SOCIAL", "PROPS", "DANCES", "PAIRED"],
        activeTab: 1,
        slots: 20,
      },
    ],
    version: "6.1.0",
    lastUpdated: "2026-08-19",
    releasedAt: "2025-08-30",
    popular: true,
    features: [
      "300+ animations across everyday, social, prop and paired categories",
      "Searchable menu with favourites and keybinds",
      "Paired emotes ask the other player before moving them",
      "Prop emotes with correct attachment points",
      "Walk styles and idle overrides included",
    ],
    included: ["Emote resource", "Animation dictionary list", "Keybind config", "Prop attachment reference"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_emotes` into your server's `resources` directory.",
      "Add `ensure ds_emotes` to `server.cfg`.",
      "Set the menu keybind and default favourites in `config.lua`.",
      "Disable any existing emote resource — two menus bound to the same key is the most common install problem.",
      "Restart and confirm prop emotes attach correctly, since those depend on your prop streaming.",
    ],
    changelog: [
      {
        version: "6.1.0",
        date: "2026-08-19",
        notes: ["Added 42 animations, mostly paired and prop.", "Search now matches on category as well as name."],
      },
      { version: "6.0.0", date: "2026-05-07", notes: ["Rewrote the menu with search and favourites.", "Paired emotes now require consent from the second player."] },
      { version: "1.0.0", date: "2025-08-30", notes: ["Initial release with 180 animations."] },
    ],
    faq: [
      {
        question: "Do paired emotes need both players to agree?",
        answer:
          "Yes. The second player gets a prompt and can decline. Snapping someone into an animation without consent causes more moderation work than it is worth.",
      },
      {
        question: "Will this conflict with my current emote menu?",
        answer:
          "Only if both stay enabled — they will fight over the keybind. Disable the old resource, which is step five of the installation.",
      },
      LICENCE_FAQ,
    ],
    tags: ["emotes", "animations", "roleplay", "menu"],
  },
  {
    id: "gp-028",
    title: "Roleplay Job Animations",
    slug: "roleplay-job-animations",
    shortDescription: "Job-specific animation sets for mechanics, medics, police and service work.",
    description:
      "Animation sets built for the jobs servers actually run. Mechanics get repair, inspection and tyre-change sequences with the right props; medics get treatment and stretcher animations; police get search, cuff and evidence actions. Each set is scripted as a sequence rather than a single loop, so an action reads as a task being performed.",
    price: 24.99,
    category: "animations",
    subcategory: "Job animations",
    art: [
      { scene: "lineup", caption: "JOB ACTIONS", subject: "character", count: 64, accentIndex: 2 },
      { scene: "system", caption: "SEQUENCE", stages: ["APPROACH", "PERFORM", "COMPLETE", "RESET"], activeStage: 1 },
    ],
    version: "2.8.0",
    lastUpdated: "2026-07-03",
    releasedAt: "2026-01-15",
    features: [
      "Sets for mechanic, medic, police and service roles",
      "Sequenced actions rather than single looping animations",
      "Correct prop attachment for every action",
      "Cancellable mid-sequence without leaving the player stuck",
      "Exports so your job scripts can trigger any sequence directly",
    ],
    included: ["Animation resource", "Job sequence reference", "Prop list", "Integration examples"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_job_anims` into your server's `resources` directory.",
      "Add `ensure ds_job_anims` to `server.cfg`, before the job resources that will call it.",
      "Wire your job scripts to the supplied exports using the integration examples.",
      "Confirm the required props stream on your server — the prop list names each one.",
      "Restart and test one sequence per job, including cancelling it midway.",
    ],
    changelog: [
      {
        version: "2.8.0",
        date: "2026-07-03",
        notes: ["Added the service worker set.", "Cancelling mid-sequence now always restores control — previously it could strand the player."],
      },
      { version: "2.0.0", date: "2026-03-12", notes: ["Converted single loops into full sequences.", "Added exports for direct triggering."] },
      { version: "1.0.0", date: "2026-01-15", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Do I need a specific job framework?",
        answer:
          "No. The animations are exposed as exports, so any job resource can trigger them. Worked examples for the common frameworks are included.",
      },
      {
        question: "What happens if a player cancels midway?",
        answer:
          "Control returns immediately and props are cleaned up. That path was the main fix in 2.8.0, so it is well covered.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["animations", "jobs", "roleplay", "props"],
  },
  {
    id: "gp-029",
    title: "Emergency Siren Pack",
    slug: "emergency-siren-pack",
    shortDescription: "Twenty-four siren tones with realistic falloff, horn layers and per-vehicle mapping.",
    description:
      "Twenty-four siren tones sampled and mixed for in-game use rather than lifted from stock libraries. Each has correct distance falloff so a siren four blocks away sounds like it, plus a separate horn layer that can be triggered independently. Mapping is per vehicle, so your fire apparatus does not share a tone with the patrol fleet.",
    price: 14.99,
    category: "audio",
    subcategory: "Sirens",
    art: [
      {
        scene: "audio",
        caption: "SIREN TONES",
        tracks: [
          { label: "WAIL", fill: 0.82, value: "0 dB" },
          { label: "YELP", fill: 0.64, value: "-3 dB" },
          { label: "PHASER", fill: 0.5, value: "-6 dB" },
          { label: "AIR HORN", fill: 0.88, value: "+2 dB" },
        ],
      },
      {
        scene: "config",
        caption: "FALLOFF",
        rows: [
          { label: "MAX DISTANCE", fill: 0.7, value: "180m" },
          { label: "ROLLOFF", fill: 0.55, value: "LINEAR" },
          { label: "OCCLUSION", fill: 0.62, value: "ON" },
          { label: "HORN LAYER", fill: 0.8, value: "SEPARATE" },
        ],
      },
    ],
    version: "2.4.0",
    lastUpdated: "2026-05-16",
    releasedAt: "2025-10-24",
    features: [
      "24 siren tones mixed for in-game use",
      "Realistic distance falloff with occlusion",
      "Separate horn layer, independently triggerable",
      "Per-vehicle mapping — fire, police and EMS differ",
      "Volume balanced against base game audio",
    ],
    included: ["Audio resource", "Siren mapping config", "Falloff reference", "Installation notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_sirens` into your server's `resources` directory.",
      "Add `ensure ds_sirens` to `server.cfg`.",
      "Map tones to vehicles in `config.lua` — the supplied mapping covers the common emergency fleets.",
      "Disable competing siren resources so two audio sources do not stack.",
      "Restart, then test one vehicle per service at close and long range to confirm falloff.",
    ],
    changelog: [
      {
        version: "2.4.0",
        date: "2026-05-16",
        notes: ["Added six tones.", "Occlusion now applies indoors, so sirens muffle correctly through building walls."],
      },
      { version: "2.0.0", date: "2026-01-08", notes: ["Split the horn onto its own layer.", "Rebalanced every tone against base game audio levels."] },
      { version: "1.0.0", date: "2025-10-24", notes: ["Initial release with 14 tones."] },
    ],
    faq: [
      {
        question: "Will this replace my existing siren audio?",
        answer:
          "It runs as its own resource with its own mapping. Disable the old one so the two do not stack — that is step five.",
      },
      {
        question: "Do these work with ELS?",
        answer: "Yes. Mapping is per vehicle and independent of the lighting resource you run.",
      },
      LICENCE_FAQ,
    ],
    tags: ["audio", "sirens", "emergency", "sound"],
  },
  {
    id: "gp-030",
    title: "Vehicle Engine Sound Pack",
    slug: "vehicle-engine-sound-pack",
    shortDescription: "Forty engine audio profiles covering four-cylinder through V12 and electric.",
    description:
      "Forty engine profiles spanning small four-cylinders, tuned turbos, big-displacement V8s, V12s and electric drivetrains. Each has correct load and RPM layers so the sound changes with what the car is doing rather than just getting louder. Includes turbo spool, blow-off and exhaust pop layers you can enable per profile.",
    price: 19.99,
    category: "audio",
    subcategory: "Engine audio",
    art: [
      {
        scene: "audio",
        caption: "ENGINE PROFILE",
        tracks: [
          { label: "IDLE", fill: 0.3, value: "800rpm" },
          { label: "MID LOAD", fill: 0.62, value: "3.4k" },
          { label: "REDLINE", fill: 0.94, value: "7.2k" },
          { label: "TURBO SPOOL", fill: 0.7, value: "ON" },
        ],
      },
      { scene: "lineup", caption: "MAPPED VEHICLES", subject: "vehicle", count: 40, accentIndex: 3 },
    ],
    version: "3.0.0",
    lastUpdated: "2026-06-19",
    releasedAt: "2025-07-09",
    features: [
      "40 profiles from four-cylinder to V12 and electric",
      "Load and RPM layers, not a single looping sample",
      "Turbo spool, blow-off and exhaust pop layers",
      "Per-vehicle mapping config",
      "Balanced against base game engine volume",
    ],
    included: ["Audio resource", "Vehicle mapping config", "Profile reference sheet", "Installation notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_engine_audio` into your server's `resources` directory.",
      "Add `ensure ds_engine_audio` to `server.cfg`.",
      "Map profiles to vehicles in `config.lua` using the reference sheet.",
      "Enable turbo and exhaust layers per profile where you want them — they are off by default.",
      "Restart and drive one vehicle per engine class through its full rev range to confirm the layers cross over cleanly.",
    ],
    changelog: [
      {
        version: "3.0.0",
        date: "2026-06-19",
        notes: ["Added electric drivetrain profiles.", "Rebuilt load layers so mid-throttle no longer jumps between samples."],
      },
      { version: "2.2.0", date: "2026-02-02", notes: ["Added turbo spool and blow-off layers.", "Expanded to 32 profiles."] },
      { version: "1.0.0", date: "2025-07-09", notes: ["Initial release with 18 profiles."] },
    ],
    faq: [
      {
        question: "Can I map these to add-on vehicles?",
        answer: "Yes — mapping is by model name, so add-on and base game vehicles are handled the same way.",
      },
      {
        question: "Why do the turbo layers default to off?",
        answer:
          "Because they are wrong on a naturally aspirated car. Enable them per profile where the vehicle actually has forced induction.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["audio", "engines", "vehicles", "sound"],
  },
  {
    id: "gp-031",
    title: "FiveM Anticheat Suite",
    slug: "fivem-anticheat-suite",
    shortDescription: "Server-side cheat detection with event validation, injection blocking and an admin log.",
    description:
      "Detection that runs server-side, because anything living on the client is negotiable. Validates events against what the player could actually have triggered, blocks the common injection vectors, catches resource tampering, and logs every action with enough context to review a decision later. Ships with sane defaults and a tuning guide so you are not banning your own staff on day one.",
    price: 59.99,
    category: "security",
    subcategory: "Cheat detection",
    art: [
      { scene: "system", caption: "DETECTION PIPELINE", stages: ["OBSERVE", "VALIDATE", "SCORE", "ACT"], activeStage: 1 },
      {
        scene: "screen",
        caption: "ADMIN LOG",
        app: "ANTICHEAT",
        tabs: ["LIVE", "FLAGGED", "BANNED", "RULES", "AUDIT"],
        activeTab: 1,
        slots: 16,
      },
      {
        scene: "config",
        caption: "THRESHOLDS",
        rows: [
          { label: "EVENT RATE", fill: 0.6, value: "MED" },
          { label: "TELEPORT DELTA", fill: 0.72, value: "STRICT" },
          { label: "RESOURCE HASH", fill: 0.9, value: "ON" },
          { label: "AUTO-BAN SCORE", fill: 0.5, value: "80" },
          { label: "STAFF BYPASS", fill: 0.35, value: "ON" },
        ],
      },
    ],
    version: "5.2.0",
    lastUpdated: "2026-08-28",
    releasedAt: "2025-10-30",
    featured: true,
    features: [
      "Server-side validation — detection does not live on the client",
      "Event validation against what the player could actually have triggered",
      "Resource tampering and injection detection",
      "Scored flagging with a configurable auto-action threshold",
      "Full admin log with enough context to review a ban later",
    ],
    included: ["Anticheat resource", "Admin log interface", "Tuning guide", "Default rule set", "SQL schema"],
    requirements: [
      "A FiveM server with file and console access",
      "A database for the audit log",
      "Admin identifiers configured so staff are not flagged by their own tools",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Run the included `schema.sql` to create the log and ban tables.",
      "Copy `ds_anticheat` into your server's `resources` directory.",
      "Add `ensure ds_anticheat` to `server.cfg` as early as possible — it should start before the resources it watches.",
      "Add your staff identifiers to the bypass list before enabling auto-action, or admin tooling will flag itself.",
      "Run in log-only mode for a week, read the flagged list, then raise the auto-action threshold from the tuning guide.",
    ],
    changelog: [
      {
        version: "5.2.0",
        date: "2026-08-28",
        notes: [
          "Added resource hash verification to catch client-side resource tampering.",
          "Scoring rebalanced after false positives on high-latency connections.",
        ],
      },
      { version: "5.0.0", date: "2026-04-14", notes: ["Moved all detection server-side.", "Added the scored flagging model and log-only mode."] },
      { version: "1.0.0", date: "2025-10-30", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Will this ban legitimate players?",
        answer:
          "It can if you enable auto-action on day one. Run log-only for a week first, read what it flags, then set a threshold — the tuning guide walks through it and step six of the installation says the same.",
      },
      {
        question: "Does it slow the server down?",
        answer:
          "Validation runs server-side on events you already process. Overhead is measurable but small; the tuning guide includes the benchmark method so you can check on your own hardware.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["anticheat", "security", "moderation", "server"],
  },
  {
    id: "gp-032",
    title: "Hospital MLO",
    slug: "hospital-mlo",
    shortDescription: "A working hospital: emergency bays, surgery, wards, morgue and a helipad.",
    description:
      "A hospital laid out the way medical roleplay actually runs. Ambulance bays open directly onto triage, surgery and imaging sit on the same corridor, and the ward block is sized for multiple simultaneous patients rather than one bed in a room. Includes a morgue, a pharmacy store with lockable points, staff areas and a rooftop helipad.",
    price: 37.99,
    category: "maps-mlos",
    subcategory: "Emergency services",
    art: [
      { scene: "interior", caption: "EMERGENCY BAY", tone: "clinical", props: ["desk", "screen", "shelf", "locker"] },
      { scene: "interior", caption: "SURGERY", tone: "clinical", props: ["table", "screen", "shelf", "crate"] },
      { scene: "interior", caption: "WARD BLOCK", tone: "cool", props: ["sofa", "table", "screen", "plant"] },
    ],
    version: "2.1.0",
    lastUpdated: "2026-08-13",
    releasedAt: "2026-02-28",
    bestseller: true,
    features: [
      "Ambulance bays opening directly onto triage",
      "Surgery and imaging on one corridor",
      "Ward block sized for simultaneous patients",
      "Morgue, pharmacy store and staff areas",
      "Rooftop helipad with air-ambulance clearance",
    ],
    included: ["Hospital MLO", "Door-lock config", "Coordinate reference", "Prop placement file", "Installation notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_hospital_mlo` into your server's `resources` directory.",
      "Add `ensure ds_hospital_mlo` to `server.cfg`, above any medical job resource that references its coordinates.",
      "Travel to the coordinates in the reference file and confirm the interior streams in.",
      "Import the door-lock definitions and set which grades hold pharmacy and morgue access.",
      "Point your medical job at the supplied triage, surgery and respawn markers.",
    ],
    changelog: [
      {
        version: "2.1.0",
        date: "2026-08-13",
        notes: ["Widened the ambulance bay entry for the larger van models.", "Added four more ward beds after feedback about capacity on busy servers."],
      },
      { version: "2.0.0", date: "2026-05-21", notes: ["Added the rooftop helipad and lift access.", "Rebuilt the surgery wing onto the imaging corridor."] },
      { version: "1.0.0", date: "2026-02-28", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Does it include a medical script?",
        answer:
          "No — it is the building. Markers for triage, surgery and respawn are placed and documented so your medical job can use them.",
      },
      {
        question: "How many patients can the ward hold?",
        answer: "Sixteen beds across the ward block after 2.1.0, plus four trauma bays off triage.",
      },
      LICENCE_FAQ,
    ],
    tags: ["mlo", "hospital", "medical", "emergency"],
  },
  {
    id: "gp-033",
    title: "Mechanic Workshop MLO",
    slug: "mechanic-workshop-mlo",
    shortDescription: "A working garage with lifts, a paint booth, parts store and customer desk.",
    description:
      "A mechanic workshop built around the job loop: vehicles come in through a roller door, go onto one of four lifts, and the parts store and paint booth are both a short walk from the bay. Includes a customer-facing desk and waiting area so repair roleplay does not happen in a corner of an empty warehouse.",
    price: 27.99,
    category: "maps-mlos",
    subcategory: "Commercial interiors",
    art: [
      { scene: "interior", caption: "REPAIR BAY", tone: "cool", props: ["car", "crate", "shelf", "screen"] },
      { scene: "interior", caption: "PAINT BOOTH", tone: "showroom", props: ["car", "shelf", "crate", "plant"] },
    ],
    version: "1.7.0",
    lastUpdated: "2026-07-15",
    releasedAt: "2025-12-19",
    features: [
      "Four working lifts with animated travel",
      "Paint booth with its own roller door",
      "Parts store with lockable prop points",
      "Customer desk and waiting area",
      "Exterior forecourt with brandable signage",
    ],
    included: ["Workshop MLO", "Lift coordinate list", "Signage template", "Door-lock config", "Installation notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Copy `ds_mechanic_mlo` into your server's `resources` directory.",
      "Add `ensure ds_mechanic_mlo` to `server.cfg`.",
      "Confirm the interior streams in at the coordinates in the reference file.",
      "Feed the lift coordinate list into your mechanic job so vehicles align on the ramps.",
      "Rebrand the forecourt signage with the supplied template.",
    ],
    changelog: [
      {
        version: "1.7.0",
        date: "2026-07-15",
        notes: ["Lift animation now travels rather than snapping between two states.", "Added a fourth bay."],
      },
      { version: "1.4.0", date: "2026-03-25", notes: ["Added the paint booth with a separate roller door.", "Parts store prop points made lockable."] },
      { version: "1.0.0", date: "2025-12-19", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Will vehicles align on the lifts automatically?",
        answer:
          "The lift coordinates ship with the package; the alignment itself is done by your mechanic job. Paste the list into its config.",
      },
      {
        question: "Can I brand the forecourt?",
        answer: "Yes, a layered signage template is included.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["mlo", "mechanic", "garage", "job"],
  },
  {
    id: "gp-034",
    title: "Banking System",
    slug: "banking-system",
    shortDescription: "Accounts, transfers, cards, loans and an ATM network with a full transaction log.",
    description:
      "A banking layer for servers running a real economy. Players get personal and business accounts, transfers with a searchable history, physical cards that can be lost or stolen, and loans with interest that actually accrues. ATMs are placed across the map with configurable limits, and every movement of money is logged so staff can investigate a dispute.",
    price: 29.99,
    category: "scripts-systems",
    subcategory: "Economy",
    art: [
      {
        scene: "screen",
        caption: "ACCOUNT VIEW",
        app: "BANK",
        tabs: ["ACCOUNTS", "TRANSFER", "CARDS", "LOANS", "HISTORY"],
        activeTab: 0,
        slots: 12,
        meter: { label: "CREDIT USED - 3,400 / 10,000", fill: 0.34 },
      },
      { scene: "system", caption: "TRANSACTION FLOW", stages: ["REQUEST", "VALIDATE", "SETTLE", "LOG"], activeStage: 2 },
    ],
    version: "4.0.1",
    lastUpdated: "2026-08-22",
    releasedAt: "2026-01-06",
    popular: true,
    features: [
      "Personal and business accounts with separate permissions",
      "Transfers with a searchable, filterable history",
      "Physical cards that can be lost, stolen or frozen",
      "Loans with accruing interest and a repayment schedule",
      "ATM network with per-location withdrawal limits",
    ],
    included: ["Banking resource", "ATM placement config", "SQL schema", "Admin audit tools", "config.lua"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Run the included `schema.sql` against your server database.",
      "Copy `ds_banking` into your server's `resources` directory.",
      "Add `ensure ds_banking` to `server.cfg`, after your framework and before any job resource that pays wages.",
      "Point it at your existing economy account in `config.lua` — it layers on top rather than replacing balances.",
      "Restart, make a test transfer, and confirm the row lands in the transaction log before going live.",
    ],
    changelog: [
      {
        version: "4.0.1",
        date: "2026-08-22",
        notes: ["Fixed interest compounding twice on loans repaid the same in-game day."],
      },
      {
        version: "4.0.0",
        date: "2026-06-11",
        notes: ["Added business accounts with role permissions.", "Cards can now be frozen by staff.", "Transaction log made searchable."],
      },
      { version: "1.0.0", date: "2026-01-06", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Does it replace my economy resource?",
        answer:
          "No. It layers banking on top of the balances your economy resource already holds, so money stays in one place.",
      },
      {
        question: "Can staff investigate a disputed transfer?",
        answer:
          "Yes — every movement is logged with both parties, the amount, the source and a timestamp, and the admin tools let you search by player or account.",
      },
      LICENCE_FAQ,
    ],
    tags: ["banking", "economy", "system", "roleplay"],
  },
  {
    id: "gp-035",
    title: "Loading Screen Pack",
    slug: "loading-screen-pack",
    shortDescription: "Six animated loading screens with music, server rules and a rotating tip feed.",
    description:
      "Six loading screens that give players something to read instead of a static logo. Each has a rotating tip and rules feed you edit as plain text, a music player with volume control that remembers the setting, and a live connection progress indicator. All six share one editable brand layer, so changing your colours and logo is done once.",
    price: 14.99,
    category: "graphics",
    subcategory: "Loading screens",
    art: [
      {
        scene: "screen",
        caption: "LOADING SCREEN",
        app: "CONNECTING",
        tabs: ["RULES", "TIPS", "STAFF", "SOCIALS"],
        activeTab: 1,
        slots: 9,
        meter: { label: "CONNECTING - 68%", fill: 0.68 },
      },
      { scene: "palette", caption: "BRAND LAYER", kind: "brand" },
    ],
    version: "3.2.0",
    lastUpdated: "2026-06-08",
    releasedAt: "2025-09-04",
    features: [
      "Six distinct animated screens",
      "Rotating tips and rules edited as plain text",
      "Music player that remembers the volume setting",
      "Live connection progress indicator",
      "One shared brand layer across all six",
    ],
    included: ["6 loading screens", "Brand source files", "Tip and rules config", "Music licence notes"],
    requirements: [
      "A FiveM server with file and console access",
      "Your own music files, or use the supplied royalty-free tracks",
      "An image editor for the brand layer",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Pick one of the six screens and copy its folder into your `resources` directory as `ds_loadingscreen`.",
      "Add `ensure ds_loadingscreen` to `server.cfg`.",
      "Edit `tips.json` and `rules.json` — both are plain text and take your own content directly.",
      "Replace the brand layer with your logo and colours using the supplied source files.",
      "Drop your own music into the `audio` folder, or keep the supplied royalty-free tracks, then restart and reconnect to check it.",
    ],
    changelog: [
      {
        version: "3.2.0",
        date: "2026-06-08",
        notes: ["Volume setting now persists between sessions.", "Added two screens."],
      },
      { version: "3.0.0", date: "2026-02-17", notes: ["Unified all screens onto one brand layer.", "Tips and rules moved to plain JSON."] },
      { version: "1.0.0", date: "2025-09-04", notes: ["Initial release with three screens."] },
    ],
    faq: [
      {
        question: "Can I use my own music?",
        answer:
          "Yes — drop your files into the audio folder. Royalty-free tracks are supplied if you would rather not source your own, with the licence terms included.",
      },
      {
        question: "Do I install all six?",
        answer: "No, pick one. They are alternatives, not a set to run simultaneously.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["loading-screen", "graphics", "branding", "server"],
  },
  {
    id: "gp-036",
    title: "Complete FiveM Server Package",
    slug: "complete-fivem-server-package",
    shortDescription: "A full server in one purchase: MLOs, vehicles, clothing, systems, UI and anticheat.",
    description:
      "The widest FiveM package DistroSource sells, aimed at launching a serious roleplay server rather than assembling one over six months. Combines the core MLOs, the emergency and tuner vehicle packs, EUP and civilian clothing, the inventory and phone interfaces, the banking and garage systems, the anticheat suite and a loading screen — pre-configured to work together, with a setup guide that sequences the whole build.",
    price: 199.99,
    originalPrice: 379.99,
    category: "bundles",
    subcategory: "Complete server",
    art: [
      {
        scene: "pack",
        caption: "COMPLETE PACKAGE",
        items: ["Core MLO set", "Vehicle packs", "Clothing & EUP", "Systems & UI", "Anticheat suite"],
      },
      { scene: "system", caption: "BUILD ORDER", stages: ["FOUNDATION", "CONTENT", "SYSTEMS", "HARDENING"], activeStage: 2 },
      {
        scene: "config",
        caption: "WHAT YOU SAVE",
        rows: [
          { label: "BOUGHT SEPARATELY", fill: 1, value: "$379.99" },
          { label: "PACKAGE PRICE", fill: 0.53, value: "$199.99" },
          { label: "PRODUCTS INCLUDED", fill: 0.8, value: "11" },
          { label: "UPDATE STREAM", fill: 1, value: "ONE" },
        ],
      },
    ],
    version: "2.0.0",
    lastUpdated: "2026-08-30",
    releasedAt: "2026-04-25",
    featured: true,
    bestseller: true,
    features: [
      "Eleven products in one purchase, pre-configured to work together",
      "Roughly 47% cheaper than buying the parts separately",
      "Sequenced setup guide from bare server to open doors",
      "One update stream for everything in the package",
      "Anticheat included and configured before launch, not after an incident",
    ],
    included: [
      "Core MLO set",
      "Emergency and tuner vehicle packs",
      "EUP and civilian clothing",
      "Inventory, phone and HUD interfaces",
      "Banking, garage and business systems",
      "Anticheat suite and loading screen",
      "Combined configuration and setup guide",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it — it is large, so allow time.",
      "Read the setup guide first. It sequences everything below and assumes a bare server.",
      "Run the combined `schema.sql`, which covers every database-backed resource in the package in one pass.",
      "Copy the resource folders in and add the `ensure` lines in the exact order the guide gives — order matters across eleven resources.",
      "Set your framework, currency, units and branding once in `ds_package_config.lua`; every resource reads from it.",
      "Start the anticheat in log-only mode, walk the verification checklist, then raise it to enforcing before you open.",
    ],
    changelog: [
      {
        version: "2.0.0",
        date: "2026-08-30",
        notes: [
          "Added the anticheat suite and the tuner vehicle pack.",
          "Single shared config replaces per-resource configuration.",
          "Setup guide rewritten around build order rather than an alphabetical resource list.",
        ],
      },
      { version: "1.3.0", date: "2026-06-30", notes: ["Added EUP and civilian clothing.", "Rolled up Inventory 5.0 and Banking 4.0."] },
      { version: "1.0.0", date: "2026-04-25", notes: ["Initial release with seven products."] },
    ],
    faq: [
      {
        question: "What if I already own some of these?",
        answer:
          "Contact DistroSource support before buying. We will work out the difference rather than charging you twice for resources you already have.",
      },
      {
        question: "How long does a full setup take?",
        answer:
          "A focused day if you follow the build order, longer if you rebrand everything as you go. The guide marks which steps you can defer until after launch.",
      },
      {
        question: "Do the components still update individually?",
        answer:
          "They update as one stream. When a component ships a fix it is rolled into the next package release, and the changelog names the versions included.",
      },
    ],
    tags: ["bundle", "complete", "server", "launch"],
  },
]

/* -------------------------------------------------------------- Minecraft */

const MINECRAFT_DRAFTS: Draft[] = [
  {
    id: "gp-011",
    title: "Medieval Spawn Map",
    slug: "medieval-spawn-map",
    shortDescription: "A walled medieval spawn town with shops, portals and a working market square.",
    description:
      "A spawn built to hold a crowd. The market square is sized so a full server can gather without players clipping through each other, shop frontages are pre-marked for villager or sign shops, and the portal hall gives you six clearly labelled destinations. Terrain around the walls is finished, so the build does not stop abruptly at the edge.",
    price: 14.99,
    category: "maps-mlos",
    subcategory: "Spawn maps",
    art: [
      { scene: "world", caption: "SPAWN TOWN", sky: "day", structures: ["castle", "tree", "house", "path", "house", "tree", "water", "pine", "portal"] },
      { scene: "world", caption: "PORTAL HALL", sky: "dusk", structures: ["tower", "pine", "portal", "path", "portal", "tree", "house"] },
    ],
    version: "2.2.0",
    lastUpdated: "2026-06-30",
    releasedAt: "2025-08-08",
    bestseller: true,
    features: [
      "Market square sized for a full server gathering",
      "Pre-marked shop frontages for villager or sign shops",
      "Portal hall with six labelled destinations",
      "Finished terrain beyond the walls — no hard edges",
      "Schematic and world-folder versions both supplied",
    ],
    included: [".schem schematic", "Ready-to-drop world folder", "Coordinate reference", "Build notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Stop the server before copying any world files.",
      "Either drop the supplied world folder in as a new world, or paste the `.schem` with WorldEdit at your chosen coordinates.",
      "Set your spawn point to the coordinates given in the reference file — the platform is oriented deliberately.",
      "Protect the region with your protection plugin; the build boundary is listed in the reference.",
      "Start the server and check the portal hall destinations point where you want them.",
    ],
    changelog: [
      {
        version: "2.2.0",
        date: "2026-06-30",
        notes: [
          "Extended finished terrain a further 40 blocks beyond the walls.",
          "Lit the market square fully — no hostile spawns inside the walls at night.",
        ],
      },
      {
        version: "2.0.0",
        date: "2026-02-12",
        notes: ["Added the portal hall.", "Widened the market square after feedback about crowding on full servers."],
      },
      { version: "1.0.0", date: "2025-08-08", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Schematic or world folder — which should I use?",
        answer:
          "The world folder if this is a fresh spawn world, the schematic if you are pasting into an existing world. Both are the same build.",
      },
      {
        question: "Do I need WorldEdit?",
        answer: "Only for the schematic. The world folder drops straight in with no plugins at all.",
      },
      LICENCE_FAQ,
    ],
    tags: ["spawn", "medieval", "map", "hub"],
  },
  {
    id: "gp-012",
    title: "Premium Survival Spawn",
    slug: "premium-survival-spawn",
    shortDescription: "A compact survival hub with protected zones, shops and a clear route out to the wild.",
    description:
      "A survival spawn that gets players out into the world quickly. The hub is deliberately compact — a shop row, a warp board and a clearly signposted exit path — with a protection boundary marked in the schematic so region setup is a single command. Includes a spawn platform arranged so new arrivals face the exit.",
    price: 19.99,
    category: "maps-mlos",
    subcategory: "Spawn maps",
    art: [
      { scene: "world", caption: "SURVIVAL HUB", sky: "day", structures: ["house", "tree", "path", "house", "water", "pine", "tree", "path"] },
    ],
    version: "1.9.0",
    lastUpdated: "2026-07-22",
    releasedAt: "2025-12-01",
    features: [
      "Compact hub that routes players outward fast",
      "Shop row and warp board",
      "Protection boundary marked for one-command region setup",
      "Spawn platform orients new arrivals toward the exit",
      "Night lighting fully covered — no hostile spawns inside",
    ],
    included: [".schem schematic", "World folder", "Region setup notes", "Build notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Stop the server before copying any world files.",
      "Paste the `.schem` with WorldEdit, or drop the world folder in as a new world.",
      "Run the single region command from the setup notes — the boundary is pre-marked in the build.",
      "Set your spawn point to the platform coordinates so new arrivals face the exit path.",
      "Start the server and confirm the warp board destinations resolve.",
    ],
    changelog: [
      {
        version: "1.9.0",
        date: "2026-07-22",
        notes: [
          "Marked the protection boundary in the schematic so region setup is one command rather than manual selection.",
          "Reduced hub footprint by roughly a third — players reach the exit faster.",
        ],
      },
      { version: "1.4.0", date: "2026-03-08", notes: ["Added the warp board.", "Completed night lighting coverage."] },
      { version: "1.0.0", date: "2025-12-01", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "How large is the build?",
        answer:
          "Deliberately small — the point is to move players out to the wild, not to hold them at spawn. Exact dimensions are in the build notes.",
      },
      {
        question: "Does the protection region come configured?",
        answer:
          "The boundary is marked in the build and the setup notes give you the exact command. Which protection plugin you use is up to you.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["spawn", "survival", "map", "hub"],
  },
  {
    id: "gp-013",
    title: "Modern Lobby Map",
    slug: "modern-lobby-map",
    shortDescription: "A clean minigame lobby with game portals, leaderboards and a cosmetics area.",
    description:
      "A lobby for a minigame network. Game portals sit on a circular walkway so no mode is buried, leaderboard walls are sized for readable holograms, and there is a separate cosmetics area that keeps the main floor uncluttered. Neutral palette so it reads as your brand once your own signage goes in.",
    price: 9.99,
    category: "maps-mlos",
    subcategory: "Lobby maps",
    art: [
      { scene: "world", caption: "LOBBY FLOOR", sky: "night", structures: ["tower", "portal", "path", "arena", "portal", "pine", "tree"] },
    ],
    version: "1.4.1",
    lastUpdated: "2026-04-16",
    releasedAt: "2025-06-20",
    features: [
      "Circular walkway so no game mode is buried",
      "Leaderboard walls sized for readable holograms",
      "Separate cosmetics area keeps the floor uncluttered",
      "Neutral palette that takes your own signage well",
      "Void-safe build with barrier edges",
    ],
    included: [".schem schematic", "World folder", "Hologram placement guide"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Stop the server and drop the world folder in, or paste the `.schem` with WorldEdit.",
      "Set the lobby world to adventure mode and disable mob spawning — the build assumes both.",
      "Place your game portals on the marked walkway pads.",
      "Position holograms using the coordinates in the placement guide so they sit flat against the boards.",
      "Start the server and check the barrier edges hold at the void boundary.",
    ],
    changelog: [
      {
        version: "1.4.1",
        date: "2026-04-16",
        notes: ["Closed two gaps in the void barrier at the cosmetics area corners."],
      },
      {
        version: "1.3.0",
        date: "2025-11-27",
        notes: ["Moved cosmetics off the main floor into its own area.", "Resized leaderboard walls for standard hologram line spacing."],
      },
      { version: "1.0.0", date: "2025-06-20", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "How many game portals does it hold?",
        answer: "Eight marked pads on the walkway, evenly spaced. The placement guide gives the coordinates for each.",
      },
      {
        question: "Can I recolour it to match my network?",
        answer:
          "The palette is deliberately neutral so your own signage and holograms carry the branding. The blocks themselves are standard, so a texture pack recolour works too.",
      },
      LICENCE_FAQ,
    ],
    tags: ["lobby", "minigames", "map", "network"],
  },
  {
    id: "gp-014",
    title: "RPG Interface Pack",
    slug: "rpg-interface-pack",
    shortDescription: "Menus, quest logs and stat panels as a coherent resource-pack interface set.",
    description:
      "A complete interface set for an RPG server, drawn as one system rather than a folder of unrelated textures. Covers inventory and container screens, a quest log, a stat and skill panel, and a shop layout. Uses standard GUI dimensions so it drops onto existing menu plugins without re-mapping coordinates.",
    price: 24.99,
    category: "ui-hud",
    subcategory: "Interface packs",
    art: [
      {
        scene: "screen",
        caption: "QUEST LOG",
        app: "RPG QUESTS",
        tabs: ["INVENTORY", "QUESTS", "SKILLS", "STATS", "SHOP"],
        activeTab: 1,
        slots: 16,
      },
      {
        scene: "screen",
        caption: "STATS & SKILLS",
        app: "RPG STATS",
        tabs: ["INVENTORY", "QUESTS", "SKILLS", "STATS", "SHOP"],
        activeTab: 2,
        slots: 9,
        meter: { label: "XP TO NEXT LEVEL", fill: 0.42 },
      },
    ],
    version: "3.0.0",
    lastUpdated: "2026-08-09",
    releasedAt: "2026-02-25",
    popular: true,
    features: [
      "Inventory, container, quest log, stats and shop screens",
      "Drawn as one coherent system",
      "Standard GUI dimensions — works with existing menu plugins",
      "Custom font sheet included",
      "Source files supplied for editing",
    ],
    included: ["Resource pack", "Source files (PSD and Aseprite)", "Font sheet", "Integration notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Drop the resource pack `.zip` into your server's `resource-packs` folder, or host it and set the URL in `server.properties`.",
      "Set `require-resource-pack` if you want the interface guaranteed for every player.",
      "Point your menu plugin at the standard GUI dimensions listed in the integration notes — no coordinate re-mapping needed.",
      "Reload the pack in-game with F3+T and open each screen to confirm it renders.",
      "If you use custom item models, merge your model entries with the supplied ranges before shipping.",
    ],
    changelog: [
      {
        version: "3.0.0",
        date: "2026-08-09",
        notes: [
          "Redrew every screen against one grid — previously the quest log and shop used different spacing.",
          "Added the stats and skills panel.",
          "Source files now supplied in Aseprite as well as PSD.",
        ],
      },
      { version: "2.1.0", date: "2026-05-04", notes: ["Added the custom font sheet.", "Fixed container screen slot alignment at 1.21."] },
      { version: "1.0.0", date: "2026-02-25", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Will it work with my menu plugin?",
        answer:
          "If your plugin uses standard chest-GUI dimensions, yes — that is why the pack sticks to them. The integration notes list the exact sizes covered.",
      },
      {
        question: "Can I edit the artwork?",
        answer:
          "Yes, layered source files are included in both PSD and Aseprite formats, along with the palette, so edits stay consistent with the rest of the set.",
      },
      LICENCE_FAQ,
    ],
    tags: ["rpg", "interface", "gui", "resource-pack"],
  },
  {
    id: "gp-015",
    title: "Economy Server Configuration",
    slug: "economy-server-configuration",
    shortDescription: "A tuned economy config: shop prices, payouts and sinks that hold their value.",
    description:
      "A full economy configuration for a survival or towny server, tuned so currency does not inflate away in the first month. Shop buy and sell prices are set against each other to close the obvious arbitrage loops, job payouts are balanced against playtime, and there are working money sinks so the top end of the economy has somewhere to spend.",
    price: 29.99,
    category: "configurations",
    subcategory: "Economy",
    art: [
      {
        scene: "config",
        caption: "ECONOMY BALANCE",
        rows: [
          { label: "SHOP BUY MARGIN", fill: 0.62, value: "+18%" },
          { label: "SHOP SELL MARGIN", fill: 0.38, value: "-12%" },
          { label: "JOB PAYOUT / HR", fill: 0.55, value: "420" },
          { label: "MONEY SINKS", fill: 0.74, value: "HIGH" },
          { label: "STARTING BALANCE", fill: 0.22, value: "250" },
          { label: "TAX RATE", fill: 0.3, value: "6%" },
        ],
      },
      {
        scene: "config",
        caption: "SHOP PRICE TABLE",
        rows: [
          { label: "RAW ORES", fill: 0.35, value: "12" },
          { label: "REFINED GOODS", fill: 0.58, value: "44" },
          { label: "FARM PRODUCE", fill: 0.24, value: "6" },
          { label: "RARE DROPS", fill: 0.86, value: "310" },
          { label: "BUILDING BLOCKS", fill: 0.18, value: "3" },
        ],
      },
    ],
    version: "2.7.0",
    lastUpdated: "2026-08-05",
    releasedAt: "2025-11-19",
    features: [
      "Buy/sell prices set against each other to close arbitrage loops",
      "Job payouts balanced against realistic playtime",
      "Working money sinks for the top end of the economy",
      "Documented rationale for every number, so you can re-tune safely",
      "Configs for the common economy and shop plugins",
    ],
    included: ["Economy config set", "Shop price tables", "Balance rationale document", "Migration notes"],
    requirements: [
      "A Minecraft Java server with file access",
      "An economy plugin and a shop plugin already installed",
      "A database or flat-file backup taken before applying",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Back up your existing economy data — this changes prices, not balances, but take the backup anyway.",
      "Stop the server before replacing any config files.",
      "Copy the config set matching your economy and shop plugins into their config folders.",
      "Read the rationale document before changing any number — each value is explained against the others it depends on.",
      "Start the server and spot-check five prices in game against the supplied price table.",
    ],
    changelog: [
      {
        version: "2.7.0",
        date: "2026-08-05",
        notes: [
          "Closed the raw-ore to refined-goods arbitrage loop reported on high-population servers.",
          "Raised the top-end sink costs so late-game balances have somewhere to go.",
        ],
      },
      {
        version: "2.3.0",
        date: "2026-04-22",
        notes: ["Rebalanced job payouts against measured playtime rather than estimated.", "Added migration notes for servers coming from a default config."],
      },
      { version: "1.0.0", date: "2025-11-19", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Will this reset my players' balances?",
        answer:
          "No. It changes prices and payout rates, not stored balances. The migration notes cover what to expect if your existing economy is already inflated.",
      },
      {
        question: "Which plugins are covered?",
        answer:
          "Config sets are supplied for the common economy and shop plugins. The rationale document is plugin-agnostic, so the numbers transfer even if yours is not in the set.",
      },
      LICENCE_FAQ,
    ],
    tags: ["economy", "configuration", "balance", "survival"],
  },
  {
    id: "gp-016",
    title: "Adventure Map Collection",
    slug: "adventure-map-collection",
    shortDescription: "Four finished adventure maps with objectives, checkpoints and boss arenas.",
    description:
      "Four self-contained adventure maps that can run as a rotation or as separate worlds. Each has a defined objective path, checkpoints that survive a server restart, and a final arena. Command blocks and structure files are documented, so you can retune difficulty without reverse-engineering the build.",
    price: 39.99,
    category: "maps-mlos",
    subcategory: "Adventure maps",
    art: [
      { scene: "world", caption: "MAP 01 - HIGHLANDS", sky: "dusk", structures: ["tower", "pine", "arena", "path", "pine", "tree", "house", "water"] },
      { scene: "world", caption: "MAP 03 - CAVERN", sky: "cave", structures: ["arena", "portal", "path", "tower", "water", "path"] },
    ],
    version: "1.6.0",
    lastUpdated: "2026-07-12",
    releasedAt: "2026-01-09",
    features: [
      "Four finished maps, playable as a rotation or standalone",
      "Checkpoints persist across server restarts",
      "Documented command-block logic for safe difficulty tuning",
      "Boss arena in each map",
      "Estimated playtime noted per map",
    ],
    included: ["4 world folders", "Command-block documentation", "Difficulty tuning guide"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Stop the server before copying world folders.",
      "Copy the world folders you want to run into your server directory — each map is self-contained.",
      "Add the worlds to your multiworld plugin and set each to adventure mode.",
      "Enable command blocks in `server.properties` — the objective and checkpoint logic depends on them.",
      "Start the server, run each map's start trigger once, and confirm the first checkpoint fires.",
    ],
    changelog: [
      {
        version: "1.6.0",
        date: "2026-07-12",
        notes: [
          "Checkpoints now persist across restarts — previously they reset with the world.",
          "Documented the command-block chain in each map so difficulty can be retuned safely.",
        ],
      },
      { version: "1.3.0", date: "2026-04-05", notes: ["Added the fourth map.", "Rebalanced boss arena difficulty across the set."] },
      { version: "1.0.0", date: "2026-01-09", notes: ["Initial release with three maps."] },
    ],
    faq: [
      {
        question: "Can I run just one of the four maps?",
        answer: "Yes. Each is a self-contained world folder — copy in only the ones you want.",
      },
      {
        question: "How long is each map?",
        answer:
          "Estimated playtime is noted per map in the documentation, based on a first-time group. The tuning guide covers shortening or extending them.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["adventure", "maps", "collection", "pve"],
  },
  {
    id: "gp-017",
    title: "Premium Resource Pack",
    slug: "premium-resource-pack",
    shortDescription: "A consistent 32× texture set with custom items, UI and sounds.",
    description:
      "A 32× resource pack drawn to one palette, so blocks, items and interface all belong together. Includes custom model data ranges reserved for server items, a matching UI skin and a small replacement sound set. Ships with the source files so you can extend it without guessing at the palette.",
    price: 9.99,
    category: "textures",
    subcategory: "Resource packs",
    art: [
      { scene: "palette", caption: "TILE SHEET 32PX", kind: "blocks" },
      {
        scene: "screen",
        caption: "GUI SKIN",
        app: "RESOURCE PACK",
        tabs: ["BLOCKS", "ITEMS", "GUI", "SOUNDS"],
        activeTab: 2,
        slots: 16,
      },
    ],
    version: "4.3.0",
    lastUpdated: "2026-06-04",
    releasedAt: "2025-07-28",
    features: [
      "32× textures drawn to a single palette",
      "Reserved custom model data ranges for server items",
      "Matching UI skin",
      "Replacement sound set",
      "Source files included for extending the pack",
    ],
    included: ["Resource pack", "Source files", "Custom model data reference", "Palette sheet"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Host the pack `.zip` and set `resource-pack` and `resource-pack-sha1` in `server.properties`.",
      "Set `require-resource-pack=true` if custom item models are load-bearing for your server.",
      "Merge your existing custom model data entries with the reserved ranges in the supplied reference — the ranges are chosen not to collide.",
      "Reload in-game with F3+T and check blocks, items, GUI and sounds each render or play.",
      "Use the palette sheet if you extend the pack, so additions stay consistent.",
    ],
    changelog: [
      {
        version: "4.3.0",
        date: "2026-06-04",
        notes: ["Added the replacement sound set.", "Reserved a second custom model data range after servers ran out of the first."],
      },
      { version: "4.0.0", date: "2026-01-15", notes: ["Repainted the full block set against a single palette.", "Added the matching UI skin."] },
      { version: "1.0.0", date: "2025-07-28", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Will the custom model data clash with my existing items?",
        answer:
          "The reserved ranges are deliberately picked to sit outside the commonly used values, and the reference lists them all so you can check before merging.",
      },
      {
        question: "Is 32× heavy on clients?",
        answer:
          "It is four times the base texture resolution, which is comfortable on any machine that runs the game well. Sizes are listed in the pack notes.",
      },
      LICENCE_FAQ,
    ],
    tags: ["textures", "resource-pack", "32x", "custom-items"],
  },
  {
    id: "gp-018",
    title: "Server Essentials Pack",
    slug: "minecraft-server-essentials-pack",
    shortDescription: "Permissions, ranks, warps and moderation configured as one coherent setup.",
    description:
      "The unglamorous half of running a server, already configured: a permission tree that does not collapse when you add a rank, staff roles with sensible escalation, warps and homes tuned for a public server, and moderation defaults that catch the common problems. Written to be edited, with comments explaining why each value is what it is.",
    price: 24.99,
    category: "server-resources",
    subcategory: "Server setup",
    art: [
      { scene: "system", caption: "RANK LADDER", stages: ["DEFAULT", "MEMBER", "TRUSTED", "STAFF"], activeStage: 2 },
      {
        scene: "config",
        caption: "CONFIG - LIMITS",
        rows: [
          { label: "HOME LIMIT", fill: 0.4, value: "4" },
          { label: "WARP ACCESS", fill: 0.7, value: "RANKED" },
          { label: "AFK TIMEOUT", fill: 0.35, value: "10m" },
          { label: "CHAT COOLDOWN", fill: 0.2, value: "2s" },
          { label: "CLAIM BLOCKS", fill: 0.65, value: "8k" },
        ],
      },
    ],
    version: "3.4.0",
    lastUpdated: "2026-08-11",
    releasedAt: "2025-10-02",
    bestseller: true,
    features: [
      "Permission tree that survives adding new ranks",
      "Staff roles with sensible escalation",
      "Warps and homes tuned for a public server",
      "Moderation defaults for the common problems",
      "Every value commented with the reasoning behind it",
    ],
    included: ["Permission config set", "Rank definitions", "Moderation config", "Setup walkthrough"],
    requirements: [
      "A Minecraft Java server with file access",
      "A permissions plugin already installed",
      "Console access for the initial rank import",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Back up your existing permissions data before importing anything.",
      "Stop the server and copy the config set into your permissions plugin's folder.",
      "Import the rank definitions from console using the command in the setup walkthrough.",
      "Apply the moderation config, then adjust the chat and claim limits to suit your player count.",
      "Start the server and test each rank with a throwaway account before promoting anyone.",
    ],
    changelog: [
      {
        version: "3.4.0",
        date: "2026-08-11",
        notes: [
          "Restructured the permission tree so adding a rank no longer requires editing every rank below it.",
          "Added claim-block defaults for servers running land protection.",
        ],
      },
      { version: "3.0.0", date: "2026-04-30", notes: ["Rewrote staff escalation into four tiers.", "Commented every value with its reasoning."] },
      { version: "1.0.0", date: "2025-10-02", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Will this overwrite my existing ranks?",
        answer:
          "The import adds the supplied ranks. Take the backup in step two — if you already have ranks with the same names, review the walkthrough before importing.",
      },
      {
        question: "Can I add my own ranks later?",
        answer:
          "That is the point of the restructure in 3.4.0. Inserting a rank is a single addition rather than an edit to every rank beneath it.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["permissions", "ranks", "moderation", "server"],
  },
  {
    id: "gp-037",
    title: "Custom Enchantments Plugin",
    slug: "custom-enchantments-plugin",
    shortDescription: "Eighty custom enchantments with an enchanter GUI, tiers and full config control.",
    description:
      "Eighty enchantments that go beyond the vanilla set, grouped into tiers so progression means something. Players use an enchanter GUI rather than memorising commands, and every enchantment has its own config block — chance, tier, applicable items, conflicts and cost — so you can retune the whole system without touching code. Conflicts are declared, so incompatible enchantments cannot stack.",
    price: 24.99,
    category: "plugins",
    subcategory: "Gameplay",
    art: [
      {
        scene: "screen",
        caption: "ENCHANTER GUI",
        app: "ENCHANTS",
        tabs: ["COMMON", "RARE", "EPIC", "LEGENDARY", "BOOKS"],
        activeTab: 2,
        slots: 20,
        meter: { label: "XP COST - 34 LEVELS", fill: 0.55 },
      },
      {
        scene: "config",
        caption: "TIER BALANCE",
        rows: [
          { label: "COMMON CHANCE", fill: 0.85, value: "62%" },
          { label: "RARE CHANCE", fill: 0.5, value: "24%" },
          { label: "EPIC CHANCE", fill: 0.28, value: "11%" },
          { label: "LEGENDARY", fill: 0.1, value: "3%" },
          { label: "XP MULTIPLIER", fill: 0.6, value: "1.4x" },
        ],
      },
    ],
    version: "4.5.0",
    lastUpdated: "2026-08-06",
    releasedAt: "2025-10-16",
    bestseller: true,
    features: [
      "80 enchantments across four tiers",
      "Enchanter GUI — no command memorisation",
      "Per-enchantment config: chance, tier, items, conflicts and cost",
      "Declared conflicts so incompatible enchantments cannot stack",
      "Enchantment books tradeable and sellable through shop plugins",
    ],
    included: ["Plugin JAR", "Default config set", "Enchantment reference sheet", "Permission node list"],
    requirements: [
      "Paper, Spigot or Purpur 1.20 or newer",
      "A permissions plugin for tier and command access",
      "At least 4 GB allocated RAM on a populated server",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Stop the server before adding the plugin.",
      "Drop the JAR into your `plugins` folder.",
      "Start the server once to generate the config, then stop it again.",
      "Edit `enchantments.yml` to set tier chances and disable anything you do not want, using the reference sheet.",
      "Assign the permission nodes to your ranks and restart, then test one enchantment per tier.",
    ],
    changelog: [
      {
        version: "4.5.0",
        date: "2026-08-06",
        notes: ["Added 14 enchantments and a legendary tier.", "Conflicts are now declared in config rather than hardcoded."],
      },
      { version: "4.0.0", date: "2026-04-02", notes: ["Replaced commands with the enchanter GUI.", "Every enchantment given its own config block."] },
      { version: "1.0.0", date: "2025-10-16", notes: ["Initial release with 40 enchantments."] },
    ],
    faq: [
      {
        question: "Can I disable individual enchantments?",
        answer: "Yes, each has its own config block with an enable flag, so you can run any subset of the 80.",
      },
      {
        question: "Do enchantment books work with shop plugins?",
        answer: "They are standard items with NBT, so any shop or trade plugin that handles books handles these.",
      },
      LICENCE_FAQ,
    ],
    tags: ["plugin", "enchantments", "gameplay", "gui"],
  },
  {
    id: "gp-038",
    title: "Crates & Rewards Plugin",
    slug: "crates-rewards-plugin",
    shortDescription: "Animated crates with weighted loot tables, keys, previews and milestone rewards.",
    description:
      "A crate system with animations players will actually stop to watch and loot tables you can reason about. Weights are declared as numbers rather than percentages that drift, every crate has a preview GUI so players see the pool before spending a key, and milestone rewards give something back for repeated opens. Keys are items, so they trade and sell like anything else.",
    price: 19.99,
    category: "plugins",
    subcategory: "Rewards",
    art: [
      {
        scene: "screen",
        caption: "CRATE PREVIEW",
        app: "CRATES",
        tabs: ["VOTE", "COMMON", "RARE", "SEASONAL", "MILESTONE"],
        activeTab: 2,
        slots: 20,
      },
      {
        scene: "config",
        caption: "LOOT WEIGHTS",
        rows: [
          { label: "COMMON", fill: 0.9, value: "600" },
          { label: "UNCOMMON", fill: 0.55, value: "250" },
          { label: "RARE", fill: 0.3, value: "110" },
          { label: "EPIC", fill: 0.14, value: "35" },
          { label: "MYTHIC", fill: 0.05, value: "5" },
        ],
      },
    ],
    version: "3.7.0",
    lastUpdated: "2026-07-24",
    releasedAt: "2025-11-11",
    popular: true,
    features: [
      "Animated opening with three selectable styles",
      "Weighted loot tables declared as numbers, not drifting percentages",
      "Preview GUI so players see the pool before spending a key",
      "Milestone rewards for repeated opens",
      "Keys are real items — tradeable, sellable, giveable",
    ],
    included: ["Plugin JAR", "Five example crate configs", "Animation style reference", "Permission node list"],
    requirements: [
      "Paper, Spigot or Purpur 1.20 or newer",
      "A permissions plugin for crate and command access",
      "A holograms plugin if you want floating crate labels",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Stop the server and drop the JAR into `plugins`.",
      "Start once to generate configs, then stop.",
      "Copy one of the five example crate configs and edit its loot table — weights are plain numbers that need not sum to anything.",
      "Place the physical crate in world and bind it with the in-game command from the setup notes.",
      "Restart, open a test crate as staff, and confirm the preview matches what actually drops.",
    ],
    changelog: [
      {
        version: "3.7.0",
        date: "2026-07-24",
        notes: ["Added milestone rewards.", "Preview GUI now shows the real weight-derived chance rather than a static label."],
      },
      { version: "3.0.0", date: "2026-03-18", notes: ["Rewrote loot tables to use weights rather than percentages.", "Added two animation styles."] },
      { version: "1.0.0", date: "2025-11-11", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Why weights instead of percentages?",
        answer:
          "Percentages have to sum to 100, so adding one item means editing every other. Weights are independent — add an item, set its weight, done.",
      },
      {
        question: "Can players see the odds?",
        answer:
          "Yes. The preview GUI shows the real chance derived from the weights, so the displayed odds cannot drift out of sync with the table.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["plugin", "crates", "rewards", "loot"],
  },
  {
    id: "gp-039",
    title: "Player Shops Plugin",
    slug: "player-shops-plugin",
    shortDescription: "Chest shops with a searchable market, price history and transaction logging.",
    description:
      "A player-to-player economy that scales past a wall of signs. Players create chest shops with one command, and every shop is indexed into a searchable market GUI so buyers find stock without walking the map. Price history is tracked per item, so both sides can see what things actually sell for, and every transaction is logged for dispute resolution.",
    price: 22.99,
    category: "plugins",
    subcategory: "Economy",
    art: [
      {
        scene: "screen",
        caption: "MARKET SEARCH",
        app: "SHOPS",
        tabs: ["SEARCH", "MY SHOPS", "HISTORY", "TOP SELLERS"],
        activeTab: 0,
        slots: 20,
        meter: { label: "LISTINGS - 1,284 ACTIVE", fill: 0.72 },
      },
      { scene: "system", caption: "TRADE FLOW", stages: ["LIST", "SEARCH", "PURCHASE", "LOG"], activeStage: 2 },
    ],
    version: "2.9.0",
    lastUpdated: "2026-08-01",
    releasedAt: "2026-01-27",
    features: [
      "Chest shops created with one command",
      "Searchable market GUI indexing every shop on the server",
      "Per-item price history so both sides see real values",
      "Full transaction log for dispute resolution",
      "Shop limits per rank, so one player cannot flood the market",
    ],
    included: ["Plugin JAR", "Default config", "Permission node list", "Database schema notes"],
    requirements: [
      "Paper, Spigot or Purpur 1.20 or newer",
      "An economy plugin already installed",
      "MySQL or SQLite for the transaction log and price history",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Stop the server and drop the JAR into `plugins`.",
      "Start once to generate the config, then stop.",
      "Set your database connection in `config.yml` — SQLite works for small servers, MySQL for anything busy.",
      "Set per-rank shop limits and link your economy plugin, then assign permission nodes.",
      "Restart, create a test shop, and confirm it appears in the market search before announcing it.",
    ],
    changelog: [
      {
        version: "2.9.0",
        date: "2026-08-01",
        notes: ["Added per-item price history.", "Market search now filters by price range as well as item."],
      },
      { version: "2.5.0", date: "2026-04-29", notes: ["Added the searchable market GUI — previously shops were findable only in world."] },
      { version: "1.0.0", date: "2026-01-27", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Does it need MySQL?",
        answer:
          "SQLite is fine on a small server. MySQL is worth it once you have a busy market, because price history and the transaction log grow quickly.",
      },
      {
        question: "Can one player flood the market?",
        answer: "Shop limits are set per rank, so you control how many listings any player can hold.",
      },
      LICENCE_FAQ,
    ],
    tags: ["plugin", "shops", "economy", "market"],
  },
  {
    id: "gp-040",
    title: "Minigame Framework",
    slug: "minigame-framework",
    shortDescription: "An arena framework with queues, teams, scoreboards and four ready-made games.",
    description:
      "The plumbing every minigame server ends up writing badly: queues, arena resets, team assignment, scoreboards, spectating and rewards, all handled once. Four complete games ship with it, and the API is documented so you can add your own without touching framework internals. Arenas reset from schematics, so a broken round leaves nothing behind.",
    price: 44.99,
    category: "plugins",
    subcategory: "Minigames",
    art: [
      {
        scene: "screen",
        caption: "ARENA MANAGER",
        app: "MINIGAMES",
        tabs: ["ARENAS", "QUEUES", "TEAMS", "REWARDS", "STATS"],
        activeTab: 1,
        slots: 16,
        meter: { label: "QUEUE - 14 / 24 PLAYERS", fill: 0.58 },
      },
      { scene: "world", caption: "ARENA", sky: "dusk", structures: ["arena", "tower", "path", "pine", "portal", "tree"] },
      { scene: "system", caption: "ROUND LIFECYCLE", stages: ["QUEUE", "START", "PLAY", "RESET"], activeStage: 3 },
    ],
    version: "3.4.0",
    lastUpdated: "2026-08-26",
    releasedAt: "2025-12-08",
    featured: true,
    features: [
      "Queues, team assignment, scoreboards and spectating handled once",
      "Schematic-based arena reset — a broken round leaves nothing behind",
      "Four complete games included",
      "Documented API for adding your own games",
      "Per-game reward configuration tied to your economy",
    ],
    included: ["Framework JAR", "4 game modules", "API documentation", "Example arena schematics", "Permission node list"],
    requirements: [
      "Paper or Purpur 1.20 or newer",
      "WorldEdit or FAWE for arena reset",
      "An economy plugin if you want reward payouts",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Stop the server, then drop the framework JAR and the game modules you want into `plugins`.",
      "Start once to generate configs, then stop.",
      "Paste the example arena schematics, or define your own arena bounds with the in-game wand.",
      "Register each arena against a game module and set queue sizes in `arenas.yml`.",
      "Restart, run one round of each game with staff, and confirm the arena resets cleanly afterwards.",
    ],
    changelog: [
      {
        version: "3.4.0",
        date: "2026-08-26",
        notes: ["Arena reset now restores from schematic rather than replaying block changes — far faster on large arenas.", "Added spectator mode."],
      },
      { version: "3.0.0", date: "2026-05-13", notes: ["Published the game API so custom modules do not need framework forks.", "Added the fourth game."] },
      { version: "1.0.0", date: "2025-12-08", notes: ["Initial release with two games."] },
    ],
    faq: [
      {
        question: "Can I write my own game on top of this?",
        answer:
          "That is what the API is for — queues, teams, scoreboards and resets are handled by the framework, so a new module is game logic only. Documentation and a worked example are included.",
      },
      {
        question: "How does arena reset work?",
        answer:
          "From a schematic, so no matter how badly a round breaks the arena, the reset restores the original state rather than undoing changes one by one.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["plugin", "minigames", "arena", "framework"],
  },
  {
    id: "gp-041",
    title: "Skyblock Island Pack",
    slug: "skyblock-island-pack",
    shortDescription: "Twelve starter island schematics with balanced resources and progression notes.",
    description:
      "Twelve island designs for a skyblock server, each with a different resource profile so island choice is an actual decision rather than cosmetic. Progression is documented — what each island gives you early, where it bottlenecks and what the intended route out is — so you can balance your own generators and shop prices against them.",
    price: 19.99,
    category: "maps-mlos",
    subcategory: "Skyblock",
    art: [
      { scene: "world", caption: "STARTER ISLAND", sky: "day", structures: ["tree", "house", "path", "water", "pine"] },
      { scene: "world", caption: "ADVANCED ISLAND", sky: "dusk", structures: ["hall", "tree", "path", "water", "tower", "pine"] },
    ],
    version: "2.0.0",
    lastUpdated: "2026-05-30",
    releasedAt: "2025-09-18",
    features: [
      "Twelve islands with genuinely different resource profiles",
      "Documented progression: early gains, bottleneck and intended route out",
      "Balanced against each other so no island is strictly best",
      "Schematics sized for standard island grid spacing",
      "Nether companion island for each design",
    ],
    included: ["12 island schematics", "12 nether companions", "Progression and balance notes", "Grid spacing reference"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Stop the server before adding schematics.",
      "Copy the `.schem` files into your skyblock plugin's schematics folder.",
      "Register each island as a selectable starter in your plugin config using the supplied names.",
      "Check the grid spacing reference against your island distance setting so neighbouring islands do not overlap.",
      "Start the server, create one test island per design, and confirm the nether companion generates alongside it.",
    ],
    changelog: [
      {
        version: "2.0.0",
        date: "2026-05-30",
        notes: ["Added four islands and a nether companion for every design.", "Rebalanced early resources after three designs proved strictly better."],
      },
      { version: "1.2.0", date: "2026-01-20", notes: ["Added progression notes documenting each island's bottleneck."] },
      { version: "1.0.0", date: "2025-09-18", notes: ["Initial release with eight islands."] },
    ],
    faq: [
      {
        question: "Which skyblock plugins are supported?",
        answer:
          "These are plain schematics, so any plugin that accepts a schematic as an island template works. The grid spacing reference covers the common ones.",
      },
      {
        question: "Are the islands balanced against each other?",
        answer:
          "That was the point of 2.0.0 — three designs were strictly better and got retuned. The balance notes explain the reasoning per island.",
      },
      LICENCE_FAQ,
    ],
    tags: ["skyblock", "islands", "schematic", "progression"],
  },
  {
    id: "gp-042",
    title: "Prison Server Map",
    slug: "prison-server-map",
    shortDescription: "A full prison build with mine tiers, cell blocks, plots and a guard tower.",
    description:
      "A prison map laid out for the gamemode's actual loop: rank up through mine tiers, move to a better cell block, eventually get plot access. Mines are sized so higher tiers feel like progress, cell blocks are numbered for plugin assignment, and the shop, plot and PvP areas are separated so a fight does not spill into the trading floor.",
    price: 29.99,
    category: "maps-mlos",
    subcategory: "Prison",
    art: [
      { scene: "world", caption: "PRISON YARD", sky: "day", structures: ["tower", "hall", "path", "house", "arena", "tree"] },
      { scene: "world", caption: "MINE TIERS", sky: "cave", structures: ["arena", "path", "tower", "water", "portal"] },
    ],
    version: "1.8.0",
    lastUpdated: "2026-07-06",
    releasedAt: "2025-11-02",
    features: [
      "Eight mine tiers, each visibly larger than the last",
      "Numbered cell blocks for direct plugin assignment",
      "Separate shop, plot and PvP areas",
      "Guard tower with sightlines over the yard",
      "Plot region marked for one-command setup",
    ],
    included: ["World folder", "Mine region coordinates", "Cell block reference", "Region setup notes"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Stop the server before copying the world folder in.",
      "Add the world to your multiworld plugin.",
      "Register the eight mine regions with your mine reset plugin using the supplied coordinates.",
      "Assign cell blocks in your prison plugin from the numbered reference, then run the plot region command from the setup notes.",
      "Start the server and confirm each mine resets and each cell block assigns correctly.",
    ],
    changelog: [
      {
        version: "1.8.0",
        date: "2026-07-06",
        notes: ["Enlarged tiers six through eight so late-game progression reads visually.", "Separated PvP from the trading floor."],
      },
      { version: "1.4.0", date: "2026-02-24", notes: ["Numbered every cell block for direct plugin assignment.", "Added the plot area."] },
      { version: "1.0.0", date: "2025-11-02", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Does it come with a prison plugin?",
        answer:
          "No, it is the build. Mine regions and cell blocks are documented with coordinates so your prison and mine-reset plugins can be pointed straight at them.",
      },
      {
        question: "How many players does it hold?",
        answer:
          "Cell blocks cover 240 assignments across eight blocks, and the yard and mines are sized for that population.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["prison", "map", "mines", "gamemode"],
  },
  {
    id: "gp-043",
    title: "Minecraft Anticheat Configuration",
    slug: "minecraft-anticheat-configuration",
    shortDescription: "Tuned anticheat configs for the common plugins, with false-positive notes per check.",
    description:
      "Anticheat plugins ship with defaults tuned for nobody in particular, and the result is either a wall of false positives or nothing caught at all. This is a tuned configuration set for the common anticheat plugins, with every check documented: what it catches, what legitimately trips it, and how far you can tighten it before your own players start getting flagged.",
    price: 24.99,
    category: "security",
    subcategory: "Anticheat tuning",
    art: [
      {
        scene: "config",
        caption: "CHECK SENSITIVITY",
        rows: [
          { label: "MOVEMENT", fill: 0.68, value: "MED" },
          { label: "COMBAT REACH", fill: 0.82, value: "STRICT" },
          { label: "AUTOCLICKER", fill: 0.6, value: "MED" },
          { label: "FLIGHT", fill: 0.88, value: "STRICT" },
          { label: "PACKET RATE", fill: 0.45, value: "LENIENT" },
          { label: "VL DECAY", fill: 0.5, value: "120s" },
        ],
      },
      { scene: "system", caption: "VIOLATION HANDLING", stages: ["DETECT", "SCORE", "NOTIFY", "ACT"], activeStage: 1 },
    ],
    version: "3.1.0",
    lastUpdated: "2026-08-04",
    releasedAt: "2026-02-18",
    features: [
      "Tuned configs for the common anticheat plugins",
      "Every check documented: what it catches and what trips it falsely",
      "Separate profiles for survival, PvP and minigame servers",
      "Violation level decay tuned so one lag spike is not a ban",
      "Staff bypass configured before enforcement is enabled",
    ],
    included: ["Config sets for three anticheat plugins", "Per-check documentation", "Three server profiles", "Rollout guide"],
    requirements: [
      "An anticheat plugin already installed",
      "Console access for staff bypass setup",
      "A test account that is not staff, for verification",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Back up your existing anticheat config before replacing anything.",
      "Stop the server and copy the config set matching your anticheat plugin and server type.",
      "Add your staff identifiers to the bypass list before you enable enforcement.",
      "Run in notify-only mode for a week and read what it flags — the rollout guide explains how to read violation levels.",
      "Tighten checks one at a time using the per-check notes rather than raising everything at once.",
    ],
    changelog: [
      {
        version: "3.1.0",
        date: "2026-08-04",
        notes: ["Added the minigame profile, where movement checks need to be far more lenient.", "Retuned packet rate after false positives on high-latency regions."],
      },
      { version: "3.0.0", date: "2026-05-09", notes: ["Split into three server profiles.", "Documented every check individually."] },
      { version: "1.0.0", date: "2026-02-18", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Which anticheat plugins are covered?",
        answer:
          "Config sets ship for the three most widely used. The per-check documentation is plugin-agnostic, so the reasoning transfers even if yours is not one of them.",
      },
      {
        question: "Will this stop all cheating?",
        answer:
          "No configuration will. This tunes detection so you catch far more without drowning staff in false positives — the rollout guide is explicit that notify-only comes first.",
      },
      LICENCE_FAQ,
    ],
    tags: ["anticheat", "security", "configuration", "moderation"],
  },
  {
    id: "gp-044",
    title: "Ambient Music Pack",
    slug: "ambient-music-pack",
    shortDescription: "Thirty original ambient tracks with biome triggers and smooth crossfading.",
    description:
      "Thirty original ambient tracks written for a server rather than lifted from a stock library, covering exploration, settlement, tension and night. Biome and region triggers switch tracks based on where the player actually is, with crossfading so the change is not a hard cut. All tracks are cleared for commercial server use, including monetised servers.",
    price: 12.99,
    category: "audio",
    subcategory: "Music",
    art: [
      {
        scene: "audio",
        caption: "AMBIENT TRACKS",
        tracks: [
          { label: "EXPLORATION", fill: 0.7, value: "12 TRACKS" },
          { label: "SETTLEMENT", fill: 0.55, value: "8 TRACKS" },
          { label: "TENSION", fill: 0.4, value: "6 TRACKS" },
          { label: "NIGHT", fill: 0.3, value: "4 TRACKS" },
        ],
      },
      {
        scene: "config",
        caption: "TRIGGER RULES",
        rows: [
          { label: "CROSSFADE", fill: 0.6, value: "4s" },
          { label: "BIOME TRIGGER", fill: 0.85, value: "ON" },
          { label: "REGION TRIGGER", fill: 0.7, value: "ON" },
          { label: "MIN GAP", fill: 0.35, value: "90s" },
        ],
      },
    ],
    version: "2.5.0",
    lastUpdated: "2026-06-14",
    releasedAt: "2025-08-21",
    features: [
      "30 original tracks across four moods",
      "Biome and region triggers, not a shuffled playlist",
      "Crossfading so track changes are not hard cuts",
      "Minimum gap setting so music does not run constantly",
      "Cleared for commercial and monetised server use",
    ],
    included: ["30 audio tracks", "Resource pack wrapper", "Trigger config", "Licence documentation"],
    requirements: [
      "A Minecraft Java server with file access",
      "A resource pack host, or `require-resource-pack` enabled",
      "A plugin capable of triggering sounds by region if you want region rules",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Host the supplied resource pack wrapper and set `resource-pack` and `resource-pack-sha1` in `server.properties`.",
      "Set `require-resource-pack=true` if the music is meant to be guaranteed rather than optional.",
      "Copy the trigger config into your sound-triggering plugin and map biomes to track groups.",
      "Set crossfade duration and minimum gap — 4 seconds and 90 seconds are the supplied defaults.",
      "Reload the pack in-game with F3+T and walk between two biomes to confirm the crossfade.",
    ],
    changelog: [
      {
        version: "2.5.0",
        date: "2026-06-14",
        notes: ["Added six tracks and the night mood group.", "Minimum gap added after feedback that continuous music got tiring."],
      },
      { version: "2.0.0", date: "2026-01-31", notes: ["Added crossfading.", "Rewrote triggers to use biome and region rather than a shuffle."] },
      { version: "1.0.0", date: "2025-08-21", notes: ["Initial release with 18 tracks."] },
    ],
    faq: [
      {
        question: "Can I use this on a monetised server?",
        answer:
          "Yes. The tracks are original and cleared for commercial server use, including monetised servers. The licence documentation states the terms in full.",
      },
      {
        question: "Do I need a plugin?",
        answer:
          "Biome triggers work from the resource pack alone. Region triggers need a plugin that can fire sounds by region — the config covers both paths.",
      },
      LICENCE_FAQ,
    ],
    tags: ["audio", "music", "ambient", "atmosphere"],
  },
]

/* ------------------------------------------------------------ Game servers */

const OTHER_DRAFTS: Draft[] = [
  {
    id: "gp-019",
    title: "Gaming Community UI Bundle",
    slug: "gaming-community-ui-bundle",
    shortDescription: "Discord, web and in-game graphics drawn as one community brand set.",
    description:
      "A brand kit for a gaming community, covering the places players actually see you: Discord server graphics, role and channel icons, web banners, and in-game overlay elements. Everything is drawn from one palette and type pairing, so your Discord and your server do not look like two different organisations. Source files included.",
    price: 49.99,
    // Graphics rather than Bundles: the deliverable is artwork, and "Bundle"
    // in the title describes the pack, not the category it belongs in.
    category: "graphics",
    subcategory: "Community branding",
    art: [
      {
        scene: "pack",
        caption: "BRAND SET",
        items: ["Discord icon set", "Role & channel badges", "Web banner set", "Stream overlays", "Editable source files"],
      },
      { scene: "palette", caption: "BRAND PALETTE", kind: "brand" },
    ],
    version: "2.0.0",
    lastUpdated: "2026-08-20",
    releasedAt: "2026-03-05",
    popular: true,
    features: [
      "Discord server graphics, role and channel icons",
      "Web banners at standard sizes",
      "In-game overlay elements",
      "One palette and type pairing across every asset",
      "Editable source files throughout",
    ],
    included: ["Discord asset set", "Web banner set", "Overlay elements", "Source files", "Specification sheet"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Open the source files in Photoshop, Affinity or Figma — all three formats are supplied.",
      "Replace the placeholder community name and mark with your own on the shared brand layer.",
      "Export at the sizes listed in the specification sheet; Discord and banner sizes are pre-set as artboards.",
      "Upload the Discord assets to Server Settings, and the role badges to each role.",
      "Drop the overlay elements into your streaming software at the marked safe-area positions.",
    ],
    changelog: [
      {
        version: "2.0.0",
        date: "2026-08-20",
        notes: [
          "Redrew the whole set against one palette and type pairing.",
          "Added stream overlay elements.",
          "Source files now supplied in Figma alongside Photoshop and Affinity.",
        ],
      },
      { version: "1.2.0", date: "2026-05-11", notes: ["Added role and channel badge sets.", "Updated banner sizes to current Discord specs."] },
      { version: "1.0.0", date: "2026-03-05", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Do I need Photoshop?",
        answer: "No — source files are supplied in Photoshop, Affinity and Figma formats. Any one of the three is enough.",
      },
      {
        question: "Can I use these for a commercial community?",
        answer:
          "Yes, including monetised Discords and servers. You cannot resell the source files themselves or distribute them as a template pack.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["branding", "discord", "community", "bundle"],
  },
  {
    id: "gp-020",
    title: "Complete Game Server Starter Pack",
    slug: "complete-game-server-starter-pack",
    shortDescription: "Everything to launch a community: server assets, branding and launch documentation.",
    description:
      "The widest package in the Gaming department, aimed at someone launching a community from nothing. Combines server-side essentials, a full community brand set and the operational documentation — staff handbook, rules templates, launch checklist — that usually gets written badly at 2am the night before opening.",
    price: 69.99,
    originalPrice: 99.99,
    category: "bundles",
    subcategory: "Server starter",
    art: [
      {
        scene: "pack",
        caption: "PACK CONTENTS",
        items: ["Server resource set", "Community brand set", "Staff handbook", "Rules templates", "Launch checklist"],
      },
      { scene: "system", caption: "LAUNCH PATH", stages: ["PLAN", "BUILD", "TEST", "LAUNCH"], activeStage: 3 },
      {
        scene: "config",
        caption: "LAUNCH READINESS",
        rows: [
          { label: "SERVER SETUP", fill: 1, value: "DONE" },
          { label: "BRANDING", fill: 1, value: "DONE" },
          { label: "STAFF TRAINED", fill: 0.75, value: "3/4" },
          { label: "RULES PUBLISHED", fill: 1, value: "DONE" },
          { label: "STRESS TEST", fill: 0.4, value: "PENDING" },
        ],
      },
    ],
    version: "1.2.0",
    lastUpdated: "2026-08-29",
    releasedAt: "2026-05-14",
    featured: true,
    features: [
      "Server-side essentials for a first launch",
      "Full community brand set",
      "Staff handbook and rules templates",
      "Launch checklist covering the week before opening",
      "One update stream for the whole pack",
    ],
    included: ["Server resource set", "Community brand set", "Staff handbook", "Rules templates", "Launch checklist"],
    requirements: [
      "A game server you can upload files to",
      "Image editing software for the branding source files",
      "A Discord server for the community assets",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Start with the launch checklist — it sequences the rest of this pack and assumes nothing is set up yet.",
      "Install the server resource set following its own included notes.",
      "Rebrand the community asset set with your name and marks, then upload to Discord.",
      "Adapt the rules templates and staff handbook — they are written to be edited, not used verbatim.",
      "Run the stress test on the checklist with a handful of volunteers before opening to the public.",
    ],
    changelog: [
      {
        version: "1.2.0",
        date: "2026-08-29",
        notes: [
          "Rolled in the 2.0.0 community brand set.",
          "Launch checklist extended to cover the week before opening rather than launch day alone.",
        ],
      },
      { version: "1.1.0", date: "2026-06-27", notes: ["Added the staff handbook.", "Rules templates expanded to cover appeals and bans."] },
      { version: "1.0.0", date: "2026-05-14", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Is this for FiveM or Minecraft?",
        answer:
          "The branding, handbook, rules and checklist are platform-agnostic and work for either. The server resource set covers the cross-platform essentials — check the individual platform bundles if you want deep FiveM or Minecraft resources.",
      },
      {
        question: "I have already launched. Is this still useful?",
        answer:
          "The branding, handbook and rules templates stand on their own. The launch checklist will be less useful to you, and that is roughly a fifth of the pack.",
      },
      LICENCE_FAQ,
    ],
    tags: ["starter", "bundle", "launch", "community"],
  },
  {
    id: "gp-045",
    title: "Discord Bot Suite",
    slug: "discord-bot-suite",
    shortDescription: "Server status, application forms, tickets and in-game linking in one bot.",
    description:
      "The four Discord bots most gaming communities end up running badly, replaced by one that does them properly: live server status with player count, staff and whitelist application forms with a review queue, a ticket system with transcripts, and account linking so Discord roles reflect in-game rank. Self-hosted, so your member data stays yours.",
    price: 34.99,
    category: "plugins",
    subcategory: "Discord integration",
    art: [
      {
        scene: "screen",
        caption: "BOT DASHBOARD",
        app: "DISCORD BOT",
        tabs: ["STATUS", "APPLICATIONS", "TICKETS", "LINKING", "LOGS"],
        activeTab: 1,
        slots: 16,
        meter: { label: "OPEN TICKETS - 7", fill: 0.3 },
      },
      { scene: "system", caption: "APPLICATION FLOW", stages: ["SUBMIT", "REVIEW", "DECIDE", "SYNC ROLE"], activeStage: 1 },
    ],
    version: "3.6.0",
    lastUpdated: "2026-08-18",
    releasedAt: "2026-02-09",
    popular: true,
    features: [
      "Live server status with player count and uptime",
      "Application forms with a reviewable queue and decision log",
      "Ticket system with full transcripts on close",
      "Account linking so Discord roles follow in-game rank",
      "Self-hosted — member data never leaves your infrastructure",
    ],
    included: ["Bot source", "Docker compose file", "Command reference", "Role mapping guide", "Setup walkthrough"],
    requirements: [
      "Node.js 20+ or Docker on a host you control",
      "A Discord application and bot token",
      "Query access to your game server for the status module",
    ],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Create a Discord application and bot, and copy the token into `.env` — never commit that file.",
      "Set your game server query address and the guild ID in `config.json`.",
      "Start with `docker compose up -d`, or `npm start` if you are running it directly.",
      "Invite the bot with the permission scope listed in the setup walkthrough, then run the slash-command sync.",
      "Map Discord roles to in-game ranks using the role mapping guide, then submit a test application end to end.",
    ],
    changelog: [
      {
        version: "3.6.0",
        date: "2026-08-18",
        notes: ["Added ticket transcripts on close.", "Application queue now records who decided and when."],
      },
      { version: "3.0.0", date: "2026-05-25", notes: ["Merged four separate bots into one process.", "Added account linking with role sync."] },
      { version: "1.0.0", date: "2026-02-09", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Is my member data sent anywhere?",
        answer:
          "No. It is self-hosted on infrastructure you control — there is no DistroSource service in the loop and no telemetry.",
      },
      {
        question: "Does role sync work both ways?",
        answer:
          "Discord roles follow in-game rank by default. Reverse sync is available but off by default, because promoting from Discord is a larger trust decision.",
      },
      SUPPORT_FAQ,
    ],
    tags: ["discord", "bot", "community", "integration"],
  },
  {
    id: "gp-046",
    title: "Esports Team Brand Kit",
    slug: "esports-team-brand-kit",
    shortDescription: "A full competitive team identity: logo system, kits, socials and broadcast overlays.",
    description:
      "A complete visual identity for a competitive team or organisation. Includes a logo system that works from a 16px favicon to a jersey chest print, player card and roster templates, social layouts sized for every current platform, and broadcast overlays for streams. Everything is built from one grid and palette, and every file is editable.",
    price: 39.99,
    category: "graphics",
    subcategory: "Team branding",
    art: [
      {
        scene: "pack",
        caption: "BRAND KIT",
        items: ["Logo system", "Player card templates", "Social layouts", "Broadcast overlays", "Editable source files"],
      },
      { scene: "palette", caption: "TEAM PALETTE", kind: "brand" },
    ],
    version: "1.9.0",
    lastUpdated: "2026-08-11",
    releasedAt: "2026-04-17",
    features: [
      "Logo system scaling from favicon to jersey print",
      "Player card and roster templates",
      "Social layouts at current platform sizes",
      "Broadcast overlays with safe areas marked",
      "One grid and palette across every asset",
    ],
    included: ["Logo system", "Player card set", "Social template set", "Broadcast overlays", "Source files", "Brand guide"],
    installation: [
      "Download the package from your DistroSource account and unzip it.",
      "Open the source files — Photoshop, Affinity and Figma versions are all supplied.",
      "Replace the placeholder team name and mark on the shared brand layer; every template inherits from it.",
      "Set your team colours in the palette swatch file rather than recolouring templates individually.",
      "Export socials from the pre-set artboards, which are already at current platform dimensions.",
      "Import the broadcast overlays into your streaming software and align to the marked safe areas.",
    ],
    changelog: [
      {
        version: "1.9.0",
        date: "2026-08-11",
        notes: ["Added broadcast overlays.", "Social artboards updated to current platform dimensions."],
      },
      { version: "1.5.0", date: "2026-06-20", notes: ["Added player card and roster templates.", "Logo system extended down to favicon size."] },
      { version: "1.0.0", date: "2026-04-17", notes: ["Initial release."] },
    ],
    faq: [
      {
        question: "Will the logo hold up on a jersey?",
        answer:
          "That is what the logo system is for — the mark has full, compact and icon variants, so it stays legible at chest print and at 16px.",
      },
      {
        question: "Can I use this for a sponsored team?",
        answer:
          "Yes, including sponsored and monetised organisations. You cannot resell the source files or redistribute them as a template pack.",
      },
      LICENCE_FAQ,
    ],
    tags: ["branding", "esports", "team", "broadcast"],
  },
]

export const GAMING_PRODUCTS: GamingProduct[] = [
  // Index drives the placeholder Tebex package id, so it must stay unique
  // across all three groups as each one grows.
  ...FIVEM_DRAFTS.map((d, i) => build(d, FIVEM_DEFAULTS, i)),
  ...MINECRAFT_DRAFTS.map((d, i) => build(d, MINECRAFT_DEFAULTS, FIVEM_DRAFTS.length + i)),
  ...OTHER_DRAFTS.map((d, i) => build(d, OTHER_DEFAULTS, FIVEM_DRAFTS.length + MINECRAFT_DRAFTS.length + i)),
]
