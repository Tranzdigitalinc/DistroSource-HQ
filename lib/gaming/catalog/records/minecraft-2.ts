import type { GamingPricing, GamingProduct } from "@/lib/gaming/catalog/types"
import { AFTER_CANCEL_LICENSED, LAUNCH_DATE, card, image } from "@/lib/gaming/catalog/media"

/** Minecraft subscriptions added in the second catalogue batch (products 32–33). */

const LICENSE_NETWORK = [
  "Licensed for one server network you own or operate.",
  "You may edit and configure the files for that network.",
  "Reselling, sharing or re-uploading the files is not permitted.",
]
const JAVA_SERVER = "A Minecraft: Java Edition server you own or operate"
/** Monthly price with the catalogue's annual rule: about 9.6 months, rounded down to $5. */
const sub = (monthly: number): GamingPricing => ({ kind: "subscription", monthly, annual: Math.floor((monthly * 9.6) / 5) * 5 })

export const MINECRAFT_PRODUCTS_2: GamingProduct[] = [
  /* ------------------------------------------------------------------ */
  {
    id: "gs-minecraft-rank-crate-artwork",
    slug: "minecraft-rank-crate-artwork",
    title: "Rank & Crate Artwork",
    platform: "minecraft",
    category: "graphics",
    tags: ["Graphics", "Ranks", "Monthly drop"],
    frameworks: [],
    summary: "Pixel-art rank badges, chat prefixes, crate and key artwork and menu icons for Minecraft servers, with a new themed set every month.",
    description: [
      "Rank & Crate Artwork is a subscription to DistroSource's pixel artwork for Minecraft servers. Each themed set covers the graphics a network shows players every day: rank badges in several sizes, matching chat and tab prefixes, crate and key artwork in rarity tiers, menu icons and store banners, all drawn in one consistent style.",
      "It is for owners who have assembled ranks, crates and menus from mismatched sources and want them to look like one server. Artwork comes as layered source files and ready-to-use PNGs at game-friendly sizes, with resource-pack textures and colour codes for prefixes, so the same look carries from your web store to chat, menus and holograms.",
      "A new themed set is released every month and every released set is available while you are subscribed. If you cancel, updates stop and the licence to use the artwork ends with the period you have paid for.",
    ],
    whatYouGet: [
      "Rank badges at 16, 32, 64 and 128 px",
      "Chat and tab prefixes with colour codes",
      "Crate and key artwork in rarity tiers",
      "Menu and GUI icons in the same style",
      "Store and announcement banners",
      "Layered source files plus ready PNGs",
      "A new themed set every month",
    ],
    features: [
      { title: "One look everywhere", body: "Badges, prefixes, crates and banners share a palette and a pixel style." },
      { title: "Ready for the game", body: "Sizes, colour codes and resource-pack textures are prepared for you." },
      { title: "Editable", body: "Layered sources let you rename ranks and recolour tiers." },
    ],
    compatibility: ["Minecraft: Java Edition resource packs", "Chat and tab plugins that accept colour codes", "Web stores and Discord (PNG banners)", "Aseprite, Photoshop or GIMP for the sources"],
    requirements: [JAVA_SERVER, "An image editor to edit the sources"],
    license: [...LICENSE_NETWORK, "Artwork is licensed while your subscription is active."],
    installation: [
      "Download the themed set from your Gaming Library.",
      "Upload the badges and banners to your web store and Discord.",
      "Paste the prefixes into your chat and tab plugin configs.",
      "Add the crate and icon textures to your resource pack.",
    ],
    pricing: sub(194),
    models: ["creator", "monthly-drop"],
    cadence: ["A new themed set every month", "Every released set while subscribed", "Size and format updates"],
    afterCancel: [
      "Access continues until the end of the period you paid for.",
      "The licence to use the artwork ends with the subscription.",
      "Replace the artwork on your server, store and Discord once access ends.",
    ],
    eligibleResourceTypes: ["Rank badges and prefixes", "Crate and key artwork", "GUI icons", "Store and social banners"],
    media: [
      image("minecraft-rank-crate-artwork", "cover", "Rank badge set with eight pixel-art ranks and matching chat prefixes", "Artwork preview — rank badges"),
      image("minecraft-rank-crate-artwork", "gallery-2", "Crate and key artwork in five rarity tiers", "Artwork preview — crates and keys"),
      image("minecraft-rank-crate-artwork", "gallery-3", "Tab list, chat and scoreboard using the rank prefixes over a Minecraft spawn", "Built interface — prefixes in game"),
    ],
    cardImage: card("minecraft-rank-crate-artwork", "Rank & Crate Artwork — rank badges preview"),
    availability: "on-sale",
    curation: 32,
    releasedAt: LAUNCH_DATE,
    updatedAt: LAUNCH_DATE,
    searchTerms: ["ranks", "rank icons", "prefix", "crate", "keys", "pixel art", "store banner", "gui icons"],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "gs-minecraft-parkour-courses",
    slug: "minecraft-parkour-courses",
    title: "Parkour Courses",
    platform: "minecraft",
    category: "minigames",
    tags: ["Minigames", "Parkour", "Monthly drop"],
    frameworks: [],
    summary: "Checkpointed parkour courses for Minecraft networks, from beginner routes to expert towers, with new courses every month.",
    description: [
      "Parkour Courses is a subscription for Minecraft networks that run parkour. It delivers finished courses — spiral towers, sky routes and themed obstacle runs — built with a steady difficulty curve, clear checkpoints, and a start and finish that plug into common parkour plugins.",
      "It is for networks that need new routes to keep regulars coming back without taking builders off other work. Every course is play-tested for jump distances and fall resets, rated from beginner to expert, and documented with its checkpoint coordinates, par time and difficulty notes, so it can join your rotation or become the week's challenge without guesswork.",
      "New courses are released every month and every released course is available while you are subscribed. If you cancel, updates stop and the licence to run the courses ends with the period you have paid for.",
    ],
    whatYouGet: [
      "Finished parkour courses from beginner to expert",
      "Checkpoints, start and finish marked for common plugins",
      "Checkpoint coordinates, par times and difficulty notes",
      "Fall-reset heights set for each section",
      "Schematics and ready-to-load worlds",
      "New courses every month",
    ],
    features: [
      { title: "A fair curve", body: "Sections step up in difficulty so players learn the course as they climb." },
      { title: "Plugin ready", body: "Checkpoints and finish lines are marked and listed, not left to set up." },
      { title: "Always something new", body: "Monthly courses keep weekly challenges and lobby runs fresh." },
    ],
    compatibility: ["Minecraft: Java Edition", "Paper and Purpur servers", "WorldEdit or FastAsyncWorldEdit", "Common parkour plugins"],
    requirements: [JAVA_SERVER, "A parkour plugin for checkpoints and times"],
    license: [...LICENSE_NETWORK, "Courses are licensed while your subscription is active."],
    installation: [
      "Download courses from your Gaming Library.",
      "Load the world or paste the schematic on your lobby or game server.",
      "Create the course in your parkour plugin using the listed checkpoints.",
      "Set the fall-reset height and add the course to your menu.",
    ],
    pricing: sub(193),
    models: ["vault", "monthly-drop"],
    cadence: ["New courses every month", "Every released course while subscribed", "Difficulty revisions to existing courses"],
    afterCancel: AFTER_CANCEL_LICENSED("the courses"),
    eligibleResourceTypes: ["Parkour courses", "Checkpoint and timing configuration", "Lobby challenge maps"],
    media: [
      image("minecraft-parkour-courses", "cover", "Spiral parkour tower of coloured blocks rising over a floating island", "Rendered preview — parkour tower"),
      image("minecraft-parkour-courses", "gallery-2", "View along the course from a checkpoint towards the next jumps", "Rendered preview — course run"),
      image("minecraft-parkour-courses", "gallery-3", "Course setup with checkpoints, difficulty sections and par times over the top view", "Built interface — course setup"),
    ],
    cardImage: card("minecraft-parkour-courses", "Parkour Courses — parkour tower preview"),
    availability: "on-sale",
    curation: 33,
    releasedAt: LAUNCH_DATE,
    updatedAt: LAUNCH_DATE,
    searchTerms: ["parkour", "jump", "obby", "checkpoints", "course", "lobby", "challenge", "tower"],
  },
]
