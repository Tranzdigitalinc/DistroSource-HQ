// Sources and cover typography for every catalogue product.
// `png` paths are renders in .gaming-render/; `page` paths are built HTML
// interfaces or mockups captured at compose time. `rig()` puts a built
// interface on a device in the right two-thirds, leaving room for the title.
const UI = "scripts/gaming/banners/ui"
const R = (name) => `/.gaming-render/${name}.png`
const rig = (page, style, bg, glow, q) => ({ page: `${UI}/rig.html`, query: { page, style, bg: R(bg), glow, ...(q ? { q } : {}) } })
const page = (name, query) => ({ page: `${UI}/${name}.html`, ...(query ? { query } : {}) })

const FIVEM = "FiveM • Subscription"
const MC = "Minecraft • Subscription"
const COMMUNITY = "Community • Subscription"
const CREATOR = "Creator • Subscription"

export const PRODUCTS = [
  /* Benchmark six ---------------------------------------------------- */
  {
    slug: "fivem-mlo-vault",
    cover: {
      source: { png: ".gaming-render/mlo-diner.png" },
      text: { eyebrow: FIVEM, title: "MLO Vault", value: "Interiors · Businesses · RP locations", badge: "VAULT ACCESS", align: "left", pos: "bottom", size: 124 },
    },
    gallery: {
      "gallery-2": { png: ".gaming-render/mlo-workshop.png" },
      "gallery-3": { png: ".gaming-render/mlo-medical.png" },
    },
  },
  {
    slug: "fivem-interface-series",
    cover: {
      source: { page: `${UI}/hud.html`, query: { cover: "1" } },
      text: { eyebrow: FIVEM, title: "Interface Series", value: "HUD · MDT · Dispatch · Menus", badge: "UPDATE PLAN", align: "left", pos: "top", size: 112, scrim: "0.8" },
    },
    gallery: {
      "gallery-2": { png: ".gaming-render/ui-mdt.png" },
      "gallery-3": { png: ".gaming-render/ui-dispatch.png" },
    },
  },
  {
    slug: "fivem-fleet-garage",
    cover: {
      source: { png: ".gaming-render/vehicle-fleet.png" },
      text: { eyebrow: FIVEM, title: "Fleet Garage", value: "Patrol · EMS · Service vehicles", badge: "MONTHLY DROP", align: "left", pos: "top", size: 120, scrim: "0.7" },
    },
    gallery: {
      "gallery-2": { png: ".gaming-render/street-patrol.png" },
      "gallery-3": { page: `${UI}/livery-sheet.html` },
    },
  },
  {
    slug: "fivem-server-owner-plan",
    cover: {
      source: { page: `${UI}/server-cover.html` },
      text: { eyebrow: FIVEM, title: "Server Owner Plan", value: "Configs · Admin tools · Performance", badge: "SERVER OWNER", align: "left", pos: "middle", size: 104, scrim: "0.5" },
    },
    gallery: {
      "gallery-2": { png: ".gaming-render/ui-config-presets.png" },
      "gallery-3": { png: ".gaming-render/ui-performance.png" },
    },
  },
  {
    slug: "minecraft-spawn-lobby-builds",
    cover: {
      source: { png: ".gaming-render/mc-spawn.png" },
      text: { eyebrow: MC, title: "Spawn & Lobby Builds", value: "Spawns · Hubs · Lobbies", badge: "PICK & KEEP", align: "right", pos: "top", size: 100, scrim: "0.75" },
    },
    gallery: {
      "gallery-2": { png: ".gaming-render/mc-lobby.png" },
      "gallery-3": { page: `${UI}/mc-layout.html` },
    },
  },
  {
    slug: "creator-community-brand-kit",
    cover: {
      source: { page: `${UI}/brand-kit.html` },
      text: { eyebrow: CREATOR, title: "Community Brand Kit", value: "Logos · Discord · Stream overlays", badge: "CREATOR PLAN", align: "left", pos: "middle", size: 100, scrim: "0.55" },
    },
    gallery: {
      "gallery-2": { page: `${UI}/stream-overlay.html` },
      "gallery-3": { page: `${UI}/community-chat.html` },
    },
  },

  /* Products 7–26 ---------------------------------------------------- */
  {
    slug: "fivem-city-starter-server",
    cover: { source: rig("css-overview.html", "monitor", "street-hud", "#ff8a3d"), text: { eyebrow: FIVEM, title: "City Starter Server", value: "A complete city · updated monthly", badge: "SERVER OWNER", align: "left", pos: "middle", size: 92, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("css-wizard"), "gallery-3": page("css-update") },
  },
  {
    slug: "fivem-heist-series",
    cover: { source: { png: ".gaming-render/heist-vault.png" }, text: { eyebrow: FIVEM, title: "Heist Series", value: "Heists · Vaults · Minigames", badge: "MONTHLY DROP", align: "left", pos: "top", size: 120, scrim: "0.75" } },
    gallery: { "gallery-2": page("heist-board"), "gallery-3": page("heist-hack") },
  },
  {
    slug: "fivem-phone-os",
    cover: { source: page("phone", { v: "home" }), text: { eyebrow: FIVEM, title: "Phone OS", value: "Messages · Bank · Garage · Social", badge: "UPDATE PLAN", align: "left", pos: "middle", size: 110, scrim: "0.5" } },
    gallery: { "gallery-2": page("phone", { v: "chat" }), "gallery-3": page("phone", { v: "apps" }) },
  },
  {
    slug: "fivem-housing-collection",
    cover: { source: { png: ".gaming-render/apartment.png" }, text: { eyebrow: FIVEM, title: "Housing Collection", value: "Homes to buy, rent and furnish", badge: "PICK & KEEP", align: "left", pos: "top", size: 104, scrim: "0.85" } },
    gallery: { "gallery-2": page("housing-place"), "gallery-3": page("housing-listings") },
  },
  {
    slug: "fivem-emergency-services-suite",
    cover: { source: rig("ems-treatment.html", "tablet", "mlo-medical", "#26c6b0"), text: { eyebrow: FIVEM, title: "Emergency Services Suite", value: "Police · EMS · Fire systems", badge: "VAULT ACCESS", align: "left", pos: "middle", size: 86, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("ems-evidence"), "gallery-3": page("ems-roster") },
  },
  {
    slug: "fivem-business-systems",
    cover: { source: rig("biz-dashboard.html", "tablet", "mlo-diner", "#ff5e7a"), text: { eyebrow: FIVEM, title: "Business Systems", value: "Player-run businesses", badge: "MONTHLY DROP", align: "left", pos: "middle", size: 100, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("biz-till"), "gallery-3": page("biz-supplier") },
  },
  {
    slug: "fivem-job-center",
    cover: { source: rig("job-center.html", "tablet", "street-hud", "#ffb020"), text: { eyebrow: FIVEM, title: "Job Center", value: "Trucking · Delivery · Sanitation · Bus", badge: "MONTHLY DROP", align: "left", pos: "middle", size: 110, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("job-route"), "gallery-3": page("job-shift") },
  },
  {
    slug: "fivem-economy-banking-suite",
    cover: { source: rig("econ-bank.html", "monitor", "street-stream", "#2fc28a"), text: { eyebrow: FIVEM, title: "Economy & Banking Suite", value: "Banking · Loans · Invoices", badge: "UPDATE PLAN", align: "left", pos: "middle", size: 86, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("econ-atm"), "gallery-3": page("econ-dashboard") },
  },
  {
    slug: "fivem-inventory-suite",
    cover: { source: rig("inv-main.html", "float", "mlo-workshop", "#8f7bff"), text: { eyebrow: FIVEM, title: "Inventory Suite", value: "Grid inventory · Crafting · Trading", badge: "UPDATE PLAN", align: "left", pos: "middle", size: 98, width: "620", scrim: "0.55" } },
    gallery: { "gallery-2": page("inv-craft"), "gallery-3": page("inv-trade") },
  },
  {
    slug: "fivem-sound-library",
    cover: { source: page("snd-siren", { cover: "1" }), text: { eyebrow: FIVEM, title: "Sound Library", value: "Sirens · Engines · Ambience", badge: "PICK & KEEP", align: "left", pos: "top", size: 116, scrim: "0.8" } },
    gallery: { "gallery-2": page("snd-browser"), "gallery-3": page("snd-picks") },
  },
  {
    slug: "fivem-loading-screen-club",
    cover: { source: rig("load-screen.html", "monitor", "street-hud", "#ff8a3d", "v=cinematic"), text: { eyebrow: FIVEM, title: "Loading Screen Club", value: "A new loading screen every month", badge: "CREATOR PLAN", align: "left", pos: "middle", size: 92, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("load-screen", { v: "minimal" }), "gallery-3": page("load-set") },
  },
  {
    slug: "minecraft-prison-network-setup",
    cover: { source: { png: ".gaming-render/mc-prison-yard.png" }, text: { eyebrow: MC, title: "Prison Network Setup", value: "Mines · Ranks · Economy", badge: "SERVER OWNER", align: "left", pos: "top", size: 96, scrim: "0.8" } },
    gallery: { "gallery-2": page("pr-ranks"), "gallery-3": { png: ".gaming-render/mc-prison-mine.png" } },
  },
  {
    slug: "minecraft-minigame-arenas",
    cover: { source: { png: ".gaming-render/mc-arena-cover.png" }, text: { eyebrow: MC, title: "Minigame Arenas", value: "Team arenas · Lobbies · Configs", badge: "VAULT ACCESS", align: "left", pos: "top", size: 108, scrim: "0.8" } },
    gallery: { "gallery-2": { png: ".gaming-render/mc-arena-top.png" }, "gallery-3": page("ar-setup") },
  },
  {
    slug: "minecraft-plugin-suite",
    cover: { source: page("pl-crate", { cover: "1" }), text: { eyebrow: MC, title: "Plugin Suite", value: "Crates · Shops · Enchants · Menus", badge: "UPDATE PLAN", align: "left", pos: "middle", size: 120, scrim: "0.6" } },
    gallery: { "gallery-2": page("pl-shop"), "gallery-3": page("pl-config") },
  },
  {
    slug: "minecraft-skyblock-islands",
    cover: { source: { png: ".gaming-render/mc-skyblock-islands.png" }, text: { eyebrow: MC, title: "Skyblock Islands", value: "Starter islands · Spawns", badge: "PICK & KEEP", align: "left", pos: "bottom", size: 108, scrim: "0.75" } },
    gallery: { "gallery-2": { png: ".gaming-render/mc-skyblock-spawn.png" }, "gallery-3": { png: ".gaming-render/mc-skyblock-themes.png" } },
  },
  {
    slug: "minecraft-resource-pack-studio",
    cover: { source: { png: ".gaming-render/mc-cottage.png" }, text: { eyebrow: MC, title: "Resource Pack Studio", value: "Textures · GUIs · Item models", badge: "MONTHLY DROP", align: "left", pos: "top", size: 96, scrim: "0.8" } },
    gallery: { "gallery-2": page("rp-sheet"), "gallery-3": page("rp-gui") },
  },
  {
    slug: "community-discord-server-toolkit",
    cover: { source: rig("dc-tickets.html", "monitor", "street-stream", "#6b77ff"), text: { eyebrow: COMMUNITY, title: "Discord Server Toolkit", value: "Tickets · Verification · Logs", badge: "UPDATE PLAN", align: "left", pos: "middle", size: 90, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("dc-thread"), "gallery-3": page("dc-dashboard") },
  },
  {
    slug: "community-staff-moderation-ops",
    cover: { source: rig("staff-dash.html", "monitor", "street-hud", "#e8a33d"), text: { eyebrow: COMMUNITY, title: "Staff & Moderation Ops", value: "Reports · Appeals · Handbook", badge: "MEMBERSHIP", align: "left", pos: "middle", size: 86, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("staff-appeal"), "gallery-3": page("staff-handbook") },
  },
  {
    slug: "creator-esports-team-kit",
    cover: { source: page("es-poster"), text: { eyebrow: CREATOR, title: "Esports Team Kit", value: "Match-day · Rosters · Stream graphics", badge: "CREATOR PLAN", align: "left", pos: "middle", size: 104, width: "560", scrim: "0.45" } },
    gallery: { "gallery-2": page("es-roster"), "gallery-3": page("es-scoreboard") },
  },
  {
    slug: "creator-thumbnail-studio",
    cover: { source: rig("th-grid.html", "float", "heist-vault", "#ffd23f"), text: { eyebrow: CREATOR, title: "Thumbnail Studio", value: "Video thumbnail templates", badge: "CREATOR PLAN", align: "left", pos: "middle", size: 96, width: "620", scrim: "0.55" } },
    gallery: { "gallery-2": page("th-editor"), "gallery-3": page("th-series") },
  },

  /* Products 27–33 ---------------------------------------------------
     Interface products use one page each with three views selected by ?v=. */
  {
    slug: "community-onboarding-playbook",
    cover: { source: rig("onb.html", "monitor", "street-stream", "#8f7bff", "v=journey"), text: { eyebrow: COMMUNITY, title: "Onboarding Playbook", value: "Welcome journey · Rules quiz · Mentors", badge: "MEMBERSHIP", align: "left", pos: "middle", size: 84, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("onb", { v: "quiz" }), "gallery-3": page("onb", { v: "mentor" }) },
  },
  {
    slug: "fivem-emote-animation-library",
    cover: { source: page("emo", { v: "wheel" }), text: { eyebrow: FIVEM, title: "Emote & Animation Library", value: "Emotes · Poses · Synced animations", badge: "MONTHLY DROP", align: "left", pos: "middle", size: 88, width: "560", scrim: "0.6" } },
    gallery: { "gallery-2": page("emo", { v: "library" }), "gallery-3": page("emo", { v: "synced" }) },
  },
  {
    slug: "fivem-realtor-system",
    cover: { source: rig("rlt.html", "tablet", "apartment", "#f0b44c", "v=board"), text: { eyebrow: FIVEM, title: "Realtor System", value: "Listings · Viewings · Contracts", badge: "UPDATE PLAN", align: "left", pos: "middle", size: 104, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("rlt", { v: "contract" }), "gallery-3": page("rlt", { v: "viewings" }) },
  },
  {
    slug: "fivem-retail-interiors",
    cover: { source: { png: ".gaming-render/mlo-retail.png" }, text: { eyebrow: FIVEM, title: "Retail Interiors", value: "Stores · Counters · Stock rooms", badge: "MONTHLY DROP", align: "left", pos: "top", size: 112, scrim: "0.8" } },
    gallery: { "gallery-2": { png: ".gaming-render/mlo-retail-counter.png" }, "gallery-3": page("rti") },
  },
  {
    slug: "fivem-world-interaction-pack",
    cover: { source: page("wip", { v: "target" }), text: { eyebrow: FIVEM, title: "World Interaction Pack", value: "Sit · Vend · Carry · Knock", badge: "UPDATE PLAN", align: "left", pos: "middle", size: 92, width: "560", scrim: "0.6" } },
    gallery: { "gallery-2": page("wip", { v: "config" }), "gallery-3": page("wip", { v: "catalogue" }) },
  },
  {
    slug: "minecraft-rank-crate-artwork",
    cover: { source: rig("rca.html", "float", "mc-spawn", "#f5cf4e", "v=ranks"), text: { eyebrow: MC, title: "Rank & Crate Artwork", value: "Badges · Prefixes · Crates · Keys", badge: "CREATOR PLAN", align: "left", pos: "middle", size: 92, width: "600", scrim: "0.55" } },
    gallery: { "gallery-2": page("rca", { v: "crates" }), "gallery-3": page("rca", { v: "ingame" }) },
  },
  {
    slug: "minecraft-parkour-courses",
    cover: { source: { png: ".gaming-render/mc-parkour.png" }, text: { eyebrow: MC, title: "Parkour Courses", value: "Towers · Sky routes · Checkpoints", badge: "MONTHLY DROP", align: "left", pos: "top", size: 112, scrim: "0.75" } },
    gallery: { "gallery-2": { png: ".gaming-render/mc-parkour-run.png" }, "gallery-3": page("pk") },
  },
]
