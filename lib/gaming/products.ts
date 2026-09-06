import type { GamingProduct, GamingCategory, GamingPlatform, GamingPreviewKind } from "@/lib/gaming/types"

/**
 * The DistroSource Gaming catalogue.
 *
 * Held in code rather than the database on purpose: the production database
 * has no migration baseline yet (see docs/DATABASE-MIGRATIONS.md), and this
 * department ships without needing one. The shape matches what a
 * `gaming_products` table would hold, so moving it is a data migration and
 * not a rewrite.
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
  installation: [
    "Download the package from your DistroSource account after purchase.",
    "Drop the resource folder into your server's `resources` directory.",
    "Add `ensure distrosource_<resource>` to your `server.cfg`.",
    "Restart the server and confirm the resource starts without errors in console.",
    "Adjust `config.lua` to match your framework and economy settings.",
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
  installation: [
    "Download the package from your DistroSource account after purchase.",
    "Stop the server before copying any world or plugin files.",
    "Copy the supplied folders into your server directory as described in the included README.",
    "Start the server and verify the world or plugin loads cleanly.",
    "Apply the recommended settings from the included configuration notes.",
  ],
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
  previewKind: GamingPreviewKind
  version: string
  lastUpdated: string
  releasedAt: string
  features: string[]
  included: string[]
  tags: string[]
  featured?: boolean
  bestseller?: boolean
  popular?: boolean
  faq?: { question: string; answer: string }[]
  compatibility?: string[]
  requirements?: string[]
}

function build(draft: Draft, defaults: typeof FIVEM_DEFAULTS | typeof MINECRAFT_DEFAULTS | { platform: GamingPlatform; compatibility: string[]; requirements: string[]; installation: string[] }, index: number): GamingProduct {
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
    previewKind: draft.previewKind,
    version: draft.version,
    lastUpdated: draft.lastUpdated,
    releasedAt: draft.releasedAt,
    compatibility: draft.compatibility ?? defaults.compatibility,
    requirements: draft.requirements ?? defaults.requirements,
    features: draft.features,
    included: draft.included,
    installation: defaults.installation,
    changelog: [
      { version: draft.version, date: draft.lastUpdated, notes: ["Maintenance pass and compatibility check against the current server build."] },
      { version: "1.0.0", date: draft.releasedAt, notes: ["Initial release."] },
    ],
    faq: draft.faq ?? [
      {
        question: "Is this a one-time purchase?",
        answer: "Yes. You pay once and keep access to the files, including future updates to this product.",
      },
      {
        question: "Can I use this on more than one server?",
        answer: "A purchase covers the servers you operate. It does not permit redistributing or reselling the files.",
      },
      {
        question: "What if it does not work on my setup?",
        answer: "Contact DistroSource support with your server build and the console output and we will work through it with you.",
      },
    ],
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
    previewKind: "mlo",
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
    included: ["11 interior MLOs (.ytyp / .ymap)", "Streaming-ready textures", "Placement guide", "Teleport / door-lock example config"],
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
    previewKind: "mlo",
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
    included: ["Department MLO", "Door-lock config", "Prop placement file", "Installation notes"],
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
    previewKind: "mlo",
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
    included: ["Dealership MLO", "Spawn-point coordinate list", "Signage template", "Installation notes"],
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
    previewKind: "hud",
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
    previewKind: "ui",
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
    previewKind: "script",
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
    included: ["Garage resource", "SQL schema", "Admin commands reference", "config.lua"],
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
    previewKind: "script",
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
    previewKind: "ui",
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
    included: ["Phone resource", "App SDK example", "Theme files", "config.lua"],
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
    previewKind: "ui",
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
    previewKind: "bundle",
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
    tags: ["bundle", "starter", "essentials", "server"],
  },
]

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
    previewKind: "map",
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
    previewKind: "map",
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
    previewKind: "map",
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
    previewKind: "ui",
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
    included: ["Resource pack", "Source PSD/Aseprite files", "Font sheet", "Integration notes"],
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
    previewKind: "config",
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
    previewKind: "map",
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
    previewKind: "texture",
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
    previewKind: "config",
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
    tags: ["permissions", "ranks", "moderation", "server"],
  },
]

const OTHER_DEFAULTS = {
  platform: "other" as GamingPlatform,
  compatibility: ["Platform-agnostic assets", "Editable source files supplied", "Works alongside FiveM and Minecraft servers"],
  requirements: ["Image editing software for the source files", "A place to host or display the assets"],
  installation: [
    "Download the package from your DistroSource account after purchase.",
    "Open the source files in your image editor of choice.",
    "Replace the placeholder brand marks with your own.",
    "Export at the sizes listed in the included specification sheet.",
  ],
}

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
    previewKind: "bundle",
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
    previewKind: "bundle",
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
    tags: ["starter", "bundle", "launch", "community"],
  },
]

export const GAMING_PRODUCTS: GamingProduct[] = [
  ...FIVEM_DRAFTS.map((d, i) => build(d, FIVEM_DEFAULTS, i)),
  ...MINECRAFT_DRAFTS.map((d, i) => build(d, MINECRAFT_DEFAULTS, i + 10)),
  ...OTHER_DRAFTS.map((d, i) => build(d, OTHER_DEFAULTS, i + 18)),
]
