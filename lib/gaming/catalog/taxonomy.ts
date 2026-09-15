import type { GamingFramework, GamingPlatform, GamingSubscriptionModel } from "@/lib/gaming/catalog/types"

/**
 * Gaming taxonomy.
 *
 * Every category the catalogue may use is defined here, but the storefront
 * only shows a category once at least one listed product is in it. Nothing
 * here exists for SEO alone.
 */

export interface GamingCategoryDef {
  id: string
  label: string
}

export interface GamingPlatformDef {
  id: GamingPlatform
  label: string
  /** Short noun used in eyebrows, e.g. "FIVEM". */
  short: string
  blurb: string
  categories: GamingCategoryDef[]
}

export const GAMING_PLATFORMS: GamingPlatformDef[] = [
  {
    id: "fivem",
    label: "FiveM",
    short: "FiveM",
    blurb: "Interiors, systems, interfaces and vehicles for FiveM roleplay servers.",
    categories: [
      { id: "mlos-maps", label: "MLOs & Maps" },
      { id: "scripts-systems", label: "Scripts & Systems" },
      { id: "jobs", label: "Jobs" },
      { id: "police-emergency", label: "Police & Emergency" },
      { id: "crime-heists", label: "Crime & Heists" },
      { id: "businesses", label: "Businesses" },
      { id: "housing", label: "Housing" },
      { id: "economy", label: "Economy" },
      { id: "inventory", label: "Inventory" },
      { id: "ui-hud", label: "UI & HUD" },
      { id: "phone", label: "Phone" },
      { id: "mdt-dispatch", label: "MDT & Dispatch" },
      { id: "vehicles", label: "Vehicles" },
      { id: "vehicle-systems", label: "Vehicle Systems" },
      { id: "eup-clothing", label: "EUP & Clothing" },
      { id: "characters-peds", label: "Characters & Peds" },
      { id: "animations", label: "Animations" },
      { id: "audio", label: "Audio" },
      { id: "server-admin", label: "Server Administration" },
      { id: "security", label: "Security" },
      { id: "configuration", label: "Configuration" },
      { id: "optimization", label: "Optimization" },
      { id: "server-packages", label: "Server Packages" },
      { id: "graphics-branding", label: "Graphics & Branding" },
      { id: "bundles", label: "Bundles" },
    ],
  },
  {
    id: "minecraft",
    label: "Minecraft",
    short: "Minecraft",
    blurb: "Builds, spawns, plugins and server setups for Minecraft networks.",
    categories: [
      { id: "builds", label: "Builds" },
      { id: "worlds-maps", label: "Worlds & Maps" },
      { id: "spawns-lobbies", label: "Spawns & Lobbies" },
      { id: "plugins", label: "Plugins" },
      { id: "server-setups", label: "Server Setups" },
      { id: "configurations", label: "Configurations" },
      { id: "resource-packs", label: "Resource Packs" },
      { id: "textures", label: "Textures" },
      { id: "models", label: "Models" },
      { id: "guis", label: "GUIs" },
      { id: "minigames", label: "Minigames" },
      { id: "smp", label: "SMP Resources" },
      { id: "graphics", label: "Graphics" },
      { id: "server-branding", label: "Server Branding" },
      { id: "bundles", label: "Bundles" },
    ],
  },
  {
    id: "community",
    label: "Server & Community",
    short: "Community",
    blurb: "Discord, moderation and operations resources for any game community.",
    categories: [
      { id: "discord-resources", label: "Discord Resources" },
      { id: "server-operations", label: "Server Operations" },
      { id: "moderation", label: "Moderation" },
      { id: "community-events", label: "Community Events" },
      { id: "onboarding", label: "Onboarding" },
      { id: "bundles", label: "Bundles" },
    ],
  },
  {
    id: "creator",
    label: "Creator & Branding",
    short: "Creator",
    blurb: "Logos, overlays, thumbnails and brand kits for servers and creators.",
    categories: [
      { id: "brand-kits", label: "Brand Kits" },
      { id: "logos-identity", label: "Logos & Identity" },
      { id: "discord-branding", label: "Discord Branding" },
      { id: "stream-overlays", label: "Stream Overlays" },
      { id: "thumbnails", label: "Thumbnails" },
      { id: "social-graphics", label: "Social Graphics" },
      { id: "esports-graphics", label: "Esports Graphics" },
      { id: "bundles", label: "Bundles" },
    ],
  },
]

export const PLATFORM_BY_ID: Record<GamingPlatform, GamingPlatformDef> = Object.fromEntries(
  GAMING_PLATFORMS.map((p) => [p.id, p]),
) as Record<GamingPlatform, GamingPlatformDef>

export function platformLabel(id: GamingPlatform): string {
  return PLATFORM_BY_ID[id].label
}

export function categoryLabel(platform: GamingPlatform, category: string): string {
  return PLATFORM_BY_ID[platform].categories.find((c) => c.id === category)?.label ?? category
}

export const FRAMEWORK_LABEL: Record<GamingFramework, string> = {
  esx: "ESX",
  qbcore: "QBCore",
  qbox: "Qbox",
  standalone: "Standalone",
}

/** Display order for framework chips and filters. */
export const FRAMEWORK_ORDER: GamingFramework[] = ["esx", "qbcore", "qbox", "standalone"]

export const SUBSCRIPTION_MODELS: Record<GamingSubscriptionModel, { label: string; badge: string; explain: string }> = {
  vault: {
    label: "Vault access",
    badge: "VAULT ACCESS",
    explain: "Use everything in the plan's library while your subscription is active.",
  },
  "monthly-drop": {
    label: "Monthly drop",
    badge: "MONTHLY DROP",
    explain: "New resources are published to the plan every month.",
  },
  membership: {
    label: "Membership",
    badge: "MEMBERSHIP",
    explain: "Ongoing member benefits across a defined part of the store.",
  },
  "pick-and-keep": {
    label: "Pick & keep",
    badge: "PICK & KEEP",
    explain: "Choose resources each period and keep them after you cancel.",
  },
  credits: {
    label: "Monthly credits",
    badge: "CREDITS",
    explain: "A set number of claims each billing period.",
  },
  "update-plan": {
    label: "Update plan",
    badge: "UPDATE PLAN",
    explain: "Maintained versions and compatibility updates while subscribed.",
  },
  "server-owner": {
    label: "Server owner plan",
    badge: "SERVER OWNER",
    explain: "Operational resources for running and growing a server.",
  },
  creator: {
    label: "Creator plan",
    badge: "CREATOR PLAN",
    explain: "Regular, editable brand and content assets for creators.",
  },
}

/** Price bands for the filter. Recurring products are banded by monthly price. */
export const GAMING_PRICE_BANDS = [
  { id: "under-15", label: "Under $15", min: 0, max: 15 },
  { id: "15-30", label: "$15 – $30", min: 15, max: 30 },
  { id: "30-60", label: "$30 – $60", min: 30, max: 60 },
  { id: "60-100", label: "$60 – $100", min: 60, max: 100 },
  { id: "100-plus", label: "$100+", min: 100, max: Number.POSITIVE_INFINITY },
] as const

export type GamingPriceBand = (typeof GAMING_PRICE_BANDS)[number]["id"]

export type GamingSort = "featured" | "newest" | "price-asc" | "price-desc"

export const GAMING_SORTS: { id: GamingSort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
]
