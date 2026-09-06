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
      {
        scene: "floorplan",
        caption: "APARTMENT · 2 BED",
        rooms: [
          { x: 28, y: 44, w: 150, h: 84, label: "LIVING", accent: true },
          { x: 186, y: 44, w: 88, h: 84, label: "KITCHEN" },
          { x: 282, y: 44, w: 90, h: 84, label: "BED 1" },
          { x: 28, y: 136, w: 88, h: 60, label: "HALL" },
          { x: 124, y: 136, w: 150, h: 60, label: "BED 2" },
          { x: 282, y: 136, w: 90, h: 60, label: "BATH" },
          { x: 28, y: 204, w: 170, h: 64, label: "STORAGE" },
          { x: 206, y: 204, w: 166, h: 64, label: "BALCONY" },
        ],
      },
      {
        scene: "floorplan",
        caption: "RETAIL UNIT",
        rooms: [
          { x: 28, y: 44, w: 220, h: 120, label: "SHOP FLOOR", accent: true },
          { x: 256, y: 44, w: 116, h: 120, label: "COUNTER" },
          { x: 28, y: 172, w: 150, h: 96, label: "STOCK" },
          { x: 186, y: 172, w: 86, h: 96, label: "STAFF" },
          { x: 280, y: 172, w: 92, h: 96, label: "OFFICE" },
        ],
      },
      {
        scene: "floorplan",
        caption: "NIGHTCLUB",
        rooms: [
          { x: 28, y: 44, w: 200, h: 130, label: "DANCE FLOOR", accent: true },
          { x: 236, y: 44, w: 136, h: 130, label: "BAR" },
          { x: 28, y: 182, w: 110, h: 86, label: "VIP" },
          { x: 146, y: 182, w: 110, h: 86, label: "BOOTHS" },
          { x: 264, y: 182, w: 108, h: 86, label: "OFFICE" },
        ],
      },
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
      {
        scene: "floorplan",
        caption: "GROUND FLOOR",
        rooms: [
          { x: 28, y: 44, w: 104, h: 72, label: "LOBBY" },
          { x: 140, y: 44, w: 104, h: 72, label: "BOOKING" },
          { x: 252, y: 44, w: 120, h: 72, label: "CELLS", accent: true },
          { x: 28, y: 124, w: 104, h: 68, label: "ARMOURY" },
          { x: 140, y: 124, w: 104, h: 68, label: "EVIDENCE" },
          { x: 252, y: 124, w: 120, h: 68, label: "GARAGE" },
          { x: 28, y: 200, w: 158, h: 68, label: "CUSTODY" },
          { x: 194, y: 200, w: 178, h: 68, label: "SALLY PORT" },
        ],
      },
      {
        scene: "floorplan",
        caption: "UPPER FLOOR",
        rooms: [
          { x: 28, y: 44, w: 160, h: 96, label: "BRIEFING", accent: true },
          { x: 196, y: 44, w: 176, h: 96, label: "OFFICES" },
          { x: 28, y: 148, w: 104, h: 60, label: "LOCKERS" },
          { x: 140, y: 148, w: 104, h: 60, label: "INTERVIEW" },
          { x: 252, y: 148, w: 120, h: 60, label: "RECORDS" },
          { x: 28, y: 216, w: 104, h: 52, label: "STAIR" },
          { x: 140, y: 216, w: 232, h: 52, label: "CANTEEN" },
        ],
      },
      {
        scene: "floorplan",
        caption: "ROOF LEVEL",
        rooms: [
          { x: 140, y: 50, w: 220, h: 140, label: "HELIPAD", accent: true },
          { x: 30, y: 50, w: 100, h: 64, label: "PLANT" },
          { x: 30, y: 122, w: 100, h: 68, label: "TANKS" },
          { x: 30, y: 198, w: 150, h: 60, label: "STAIR CORE" },
          { x: 190, y: 198, w: 170, h: 60, label: "ANTENNA" },
        ],
      },
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
      {
        scene: "floorplan",
        caption: "SHOWROOM FLOOR",
        rooms: [
          { x: 28, y: 44, w: 96, h: 56, label: "ENTRANCE" },
          { x: 132, y: 44, w: 76, h: 56, label: "PLINTH A" },
          { x: 216, y: 44, w: 76, h: 56, label: "PLINTH B" },
          { x: 300, y: 44, w: 72, h: 56, label: "PLINTH C" },
          { x: 28, y: 108, w: 264, h: 84, label: "SHOWROOM", accent: true },
          { x: 300, y: 108, w: 72, h: 84, label: "SALES" },
          { x: 28, y: 200, w: 150, h: 68, label: "LOUNGE" },
          { x: 186, y: 200, w: 186, h: 68, label: "MEZZANINE" },
        ],
      },
      {
        scene: "floorplan",
        caption: "SERVICE BAY",
        rooms: [
          { x: 28, y: 44, w: 160, h: 96, label: "LIFT 1", accent: true },
          { x: 196, y: 44, w: 176, h: 96, label: "LIFT 2" },
          { x: 28, y: 148, w: 160, h: 60, label: "PARTS" },
          { x: 196, y: 148, w: 176, h: 60, label: "WASH" },
          { x: 28, y: 216, w: 160, h: 52, label: "OFFICE" },
          { x: 196, y: 216, w: 176, h: 52, label: "YARD" },
        ],
      },
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
        scene: "cluster",
        caption: "HUD CLUSTER",
        readout: "86",
        unit: "MPH",
        bars: [
          { label: "FUEL", fill: 0.72 },
          { label: "ENGINE", fill: 0.88 },
          { label: "CONDITION", fill: 0.61 },
        ],
        chips: ["SEATBELT", "CRUISE", "LOCK"],
      },
      {
        scene: "sliders",
        caption: "CONFIG · LAYOUT",
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
        scene: "interface",
        caption: "PLAYER INVENTORY",
        nav: ["PLAYER", "CONTAINER", "TRUNK", "SHOP", "CRAFTING"],
        activeNav: 0,
        columns: 5,
        rows: 3,
        meter: { label: "WEIGHT · 24.5 / 40 KG", fill: 0.61 },
      },
      {
        scene: "interface",
        caption: "VEHICLE TRUNK",
        nav: ["PLAYER", "CONTAINER", "TRUNK", "SHOP", "CRAFTING"],
        activeNav: 2,
        columns: 4,
        rows: 3,
        meter: { label: "CAPACITY · 62 / 120 KG", fill: 0.52 },
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
      {
        scene: "flow",
        caption: "STORAGE LIFECYCLE",
        nodes: ["STORE VEHICLE", "PERSIST STATE", "IMPOUND", "RETRIEVE"],
        activeNode: 1,
      },
      {
        scene: "sliders",
        caption: "CONFIG · GARAGE",
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
      {
        scene: "flow",
        caption: "BUSINESS CYCLE",
        nodes: ["HIRE STAFF", "SET WAGES", "TRACK STOCK", "BOOKS"],
        activeNode: 3,
      },
      {
        scene: "interface",
        caption: "OWNER BOOKS",
        nav: ["STAFF", "PAYROLL", "STOCK", "BOOKS", "ROLES"],
        activeNav: 3,
        columns: 4,
        rows: 3,
        meter: { label: "MONTH TO DATE · REVENUE", fill: 0.68 },
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
        apps: ["PHONE", "MESSAGES", "CONTACTS", "BANK", "CAMERA", "GALLERY", "SOCIAL", "SETTINGS", "STORE"],
      },
      {
        scene: "interface",
        caption: "APP SDK · REGISTRY",
        nav: ["CORE", "APPS", "THEMES", "EVENTS"],
        activeNav: 1,
        columns: 3,
        rows: 3,
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
        scene: "interface",
        caption: "MDT · RECORDS",
        nav: ["PERSONS", "VEHICLES", "WARRANTS", "REPORTS", "UNITS"],
        activeNav: 0,
        columns: 4,
        rows: 4,
      },
      {
        scene: "interface",
        caption: "DISPATCH BOARD",
        nav: ["ACTIVE", "QUEUED", "UNITS", "LOG"],
        activeNav: 2,
        columns: 3,
        rows: 4,
        meter: { label: "UNITS AVAILABLE · 6 / 11", fill: 0.55 },
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
        scene: "stack",
        caption: "PACK CONTENTS",
        items: ["Advanced Vehicle HUD", "Premium Inventory Interface", "Advanced Garage System", "Admin tooling", "Combined config"],
      },
      {
        scene: "flow",
        caption: "SETUP PATH",
        nodes: ["INSTALL", "CONFIGURE", "VERIFY", "LAUNCH"],
        activeNode: 0,
      },
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
      {
        scene: "isometric",
        caption: "SPAWN TOWN",
        // Labelled zones are given distinct col-row values: the isometric
        // projection maps that difference to x, so two zones sharing it would
        // stack their labels in the same column.
        zones: [
          { col: 3, row: 3, height: 14, label: "MARKET", accent: true },
          { col: 1, row: 2, height: 28, label: "GATE" },
          { col: 5, row: 1, height: 36, label: "KEEP" },
          { col: 2, row: 5, height: 20, label: "SHOPS" },
          { col: 6, row: 4, height: 24, label: "PORTALS" },
          { col: 0, row: 4, height: 18 },
          { col: 4, row: 0, height: 16 },
        ],
      },
      {
        scene: "isometric",
        caption: "PORTAL HALL",
        zones: [
          { col: 3, row: 3, height: 12, label: "HALL", accent: true },
          { col: 2, row: 2, height: 26 },
          { col: 4, row: 2, height: 26 },
          { col: 2, row: 4, height: 26 },
          { col: 4, row: 4, height: 26 },
          { col: 3, row: 1, height: 32, label: "ARCH" },
        ],
      },
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
      {
        scene: "isometric",
        caption: "SURVIVAL HUB",
        zones: [
          { col: 3, row: 3, height: 12, label: "HUB", accent: true },
          { col: 1, row: 2, height: 22, label: "SHOPS" },
          { col: 5, row: 2, height: 20, label: "WARPS" },
          { col: 2, row: 5, height: 16, label: "EXIT" },
          { col: 5, row: 5, height: 24 },
          { col: 0, row: 3, height: 14 },
        ],
      },
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
      {
        scene: "isometric",
        caption: "LOBBY FLOOR",
        zones: [
          { col: 3, row: 3, height: 10, label: "HUB", accent: true },
          { col: 1, row: 3, height: 26, label: "PORTALS" },
          { col: 5, row: 3, height: 26, label: "BOARDS" },
          { col: 3, row: 1, height: 22, label: "COSMETICS" },
          { col: 3, row: 5, height: 16 },
          { col: 1, row: 5, height: 14 },
          { col: 5, row: 1, height: 14 },
        ],
      },
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
        scene: "interface",
        caption: "QUEST LOG",
        nav: ["INVENTORY", "QUESTS", "SKILLS", "STATS", "SHOP"],
        activeNav: 1,
        columns: 4,
        rows: 4,
      },
      {
        scene: "interface",
        caption: "STATS & SKILLS",
        nav: ["INVENTORY", "QUESTS", "SKILLS", "STATS", "SHOP"],
        activeNav: 2,
        columns: 3,
        rows: 3,
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
        scene: "sliders",
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
        scene: "sliders",
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
      {
        scene: "isometric",
        caption: "MAP 01 · HIGHLANDS",
        zones: [
          { col: 2, row: 2, height: 30, label: "BOSS ARENA", accent: true },
          { col: 5, row: 1, height: 20, label: "CHECKPOINT" },
          { col: 1, row: 5, height: 24, label: "START" },
          { col: 5, row: 5, height: 22 },
          { col: 3, row: 4, height: 14 },
          { col: 0, row: 2, height: 18 },
        ],
      },
      {
        scene: "isometric",
        caption: "MAP 03 · CAVERN",
        zones: [
          { col: 3, row: 3, height: 34, label: "DESCENT", accent: true },
          { col: 1, row: 2, height: 16 },
          { col: 5, row: 4, height: 26, label: "VAULT" },
          { col: 2, row: 5, height: 20, label: "CHECKPOINT" },
          { col: 6, row: 1, height: 12 },
        ],
      },
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
      { scene: "swatches", caption: "TILE SHEET · 32PX", rows: 6, columns: 9 },
      {
        scene: "interface",
        caption: "GUI SKIN",
        nav: ["BLOCKS", "ITEMS", "GUI", "SOUNDS"],
        activeNav: 2,
        columns: 4,
        rows: 4,
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
      {
        scene: "flow",
        caption: "RANK LADDER",
        nodes: ["DEFAULT", "MEMBER", "TRUSTED", "STAFF"],
        activeNode: 2,
      },
      {
        scene: "sliders",
        caption: "CONFIG · LIMITS",
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
        scene: "stack",
        caption: "BRAND SET",
        items: ["Discord icon set", "Role & channel badges", "Web banner set", "Stream overlays", "Editable source files"],
      },
      { scene: "swatches", caption: "BRAND PALETTE", rows: 4, columns: 8 },
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
        scene: "stack",
        caption: "PACK CONTENTS",
        items: ["Server resource set", "Community brand set", "Staff handbook", "Rules templates", "Launch checklist"],
      },
      {
        scene: "flow",
        caption: "LAUNCH PATH",
        nodes: ["PLAN", "BUILD", "TEST", "LAUNCH"],
        activeNode: 3,
      },
      {
        scene: "sliders",
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
]

export const GAMING_PRODUCTS: GamingProduct[] = [
  ...FIVEM_DRAFTS.map((d, i) => build(d, FIVEM_DEFAULTS, i)),
  ...MINECRAFT_DRAFTS.map((d, i) => build(d, MINECRAFT_DEFAULTS, i + 10)),
  ...OTHER_DRAFTS.map((d, i) => build(d, OTHER_DEFAULTS, i + 18)),
]
