// Sources and cover typography for the six benchmark products.
// `png` paths are renders in .gaming-render/; `page` paths are built HTML
// interfaces or mockups captured at compose time.
const UI = "scripts/gaming/banners/ui"

export const PRODUCTS = [
  {
    slug: "fivem-mlo-vault",
    cover: {
      source: { png: ".gaming-render/mlo-diner.png" },
      text: { eyebrow: "FiveM • Subscription", title: "MLO Vault", value: "Interiors · Businesses · RP locations", badge: "VAULT ACCESS", align: "left", pos: "bottom", size: 124 },
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
      text: { eyebrow: "FiveM • Subscription", title: "Interface Series", value: "HUD · MDT · Dispatch · Menus", badge: "UPDATE PLAN", align: "left", pos: "top", size: 112, scrim: "0.8" },
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
      text: { eyebrow: "FiveM • Subscription", title: "Fleet Garage", value: "Patrol · EMS · Service vehicles", badge: "MONTHLY DROP", align: "left", pos: "top", size: 120, scrim: "0.7" },
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
      text: { eyebrow: "FiveM • Subscription", title: "Server Owner Plan", value: "Configs · Admin tools · Performance", badge: "SERVER OWNER", align: "left", pos: "middle", size: 104, scrim: "0.5" },
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
      text: { eyebrow: "Minecraft • Subscription", title: "Spawn & Lobby Builds", value: "Spawns · Hubs · Lobbies", badge: "PICK & KEEP", align: "right", pos: "top", size: 100, scrim: "0.75" },
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
      text: { eyebrow: "Creator • Subscription", title: "Community Brand Kit", value: "Logos · Discord · Stream overlays", badge: "CREATOR PLAN", align: "left", pos: "middle", size: 100, scrim: "0.55" },
    },
    gallery: {
      "gallery-2": { page: `${UI}/stream-overlay.html` },
      "gallery-3": { page: `${UI}/community-chat.html` },
    },
  },
]
