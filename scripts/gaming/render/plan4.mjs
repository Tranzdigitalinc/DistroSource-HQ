/**
 * Batch 4 plans: the FiveM MLOs that need vehicles inside, the vehicle /
 * clothing / character / weapon / animation products (mannequin studio),
 * the community and Discord products, and the three bundles (which embed
 * the real covers rendered for the products they contain — so bundles must
 * be rendered after everything else).
 *
 * Every image corresponds to a feature listed on the product. Nothing shows
 * a feature the product does not include.
 */
import { interior, exteriorScene } from "./scenes/three.mjs"
import { floorplan } from "./scenes/ui.mjs"
import { configEditor } from "./scenes/ui-minecraft.mjs"
import { studio, lodStrip } from "./scenes/characters.mjs"
import { discord, discordBrand, webBanners, overlayElements, specSheet, emoteMenu, sequenceViewer, attachmentDiagram, ballisticsLadder, rankChart, componentTable, docPage, bundleGrid } from "./scenes/ui-community.mjs"

/* ------------------------------------------------------------ police dept */

const PD_BOOKING = {
  room: { w: 12, d: 8, h: 3.1, floor: "concrete", wallColor: "#d8d9d4", doors: [{ wall: "s", x: 4, w: 1.4 }, { wall: "w", x: -2, w: 1.2 }, { wall: "e", x: 2, w: 1.2 }] },
  items: [
    { type: "cell", args: [-4.2, -2.6, 0] }, { type: "cell", args: [-1.6, -2.6, 0] }, { type: "cell", args: [1.0, -2.6, 0] }, { type: "cell", args: [3.6, -2.6, 0] },
    { type: "counter", args: [-2.5, 2.6, Math.PI, { w: 3.2, color: 0xe4e2dd }] }, { type: "chair", args: [-2.5, 3.3, Math.PI] }, { type: "bench", args: [3.2, 3.4, 0, 2.4] }, { type: "screen", args: [-2.5, 2.0, 3.92, 0, { w: 1.2, h: 0.7 }] },
  ],
}
const PD_BRIEFING = {
  bg: 0xbfd6ea,
  room: { w: 11, d: 9, h: 3.2, floor: "vinyl", wallColor: "#e4e6e3", doors: [{ wall: "s", x: 4, w: 1.4 }], windows: [{ wall: "e", x: -1, w: 2.4 }, { wall: "e", x: 2, w: 2.4 }] },
  daylight: { intensity: 1.0, pos: [7, 8, 2] },
  items: [
    ...[-2.6, 0, 2.6].flatMap((z) => [-3.3, -1.1, 1.1, 3.3].flatMap((x) => [{ type: "table", args: [x, z, 0, { w: 1.9, d: 0.7, h: 0.74, wood: false }] }, { type: "chair", args: [x - 0.45, z + 0.65, Math.PI] }, { type: "chair", args: [x + 0.45, z + 0.65, Math.PI] }])),
    { type: "whiteboard", args: [0, 1.5, -4.42, 0, { w: 4.0, h: 1.3 }] }, { type: "screen", args: [3.2, 1.6, -4.42, 0, { w: 1.8, h: 1.0 }] }, { type: "desk", args: [-3.2, -3.6, Math.PI] }, { type: "plant", args: [4.9, 3.9] },
  ],
}
const PD_ARMOURY = {
  room: { w: 7, d: 6, h: 3.0, floor: "concrete", wallColor: "#cfd2d0", doors: [{ wall: "s", x: 0, w: 1.2 }], panels: true },
  items: [
    { type: "weaponRack", args: [-1.5, -2.9, 0, 6] }, { type: "weaponRack", args: [1.8, -2.9, 0, 4] }, { type: "locker", args: [-3.3, 0.2, Math.PI / 2, 5] }, { type: "cabinet", args: [3.2, -0.2, -Math.PI / 2, { w: 2.4, h: 1.0, color: 0x8a8f96 }] },
    { type: "counter", args: [0, 2.4, Math.PI, { w: 2.6, color: 0xb9bec6 }] }, { type: "crate", args: [2.6, 2.2, 0.3, 0.6] }, { type: "crate", args: [2.0, 2.4, -0.2, 0.5] },
  ],
}
const PD_EVIDENCE = {
  room: { w: 7, d: 6, h: 3.0, floor: "vinyl", wallColor: "#e1e3df", doors: [{ wall: "s", x: -2, w: 1.2 }], panels: true },
  items: [
    { type: "shelf", args: [-2.3, -2.6, 0, { w: 2.0, h: 2.2 }] }, { type: "shelf", args: [0, -2.6, 0, { w: 2.0, h: 2.2 }] }, { type: "shelf", args: [2.3, -2.6, 0, { w: 2.0, h: 2.2 }] }, { type: "shelf", args: [3.2, 0.4, -Math.PI / 2, { w: 2.4, h: 2.2 }] },
    { type: "counter", args: [-1.6, 2.4, Math.PI, { w: 2.4, color: 0xe4e2dd }] }, { type: "cabinet", args: [-3.2, -0.2, Math.PI / 2, { w: 1.6, h: 1.0 }] }, { type: "crate", args: [1.8, 1.2, 0.2, 0.55] },
  ],
}
const PD_GARAGE = {
  env: 0.35,
  room: { w: 16, d: 10, h: 4.0, floor: "concrete", wallColor: "#c9ccd0", doors: [{ wall: "s", x: -4, w: 4.2, h: 3.4 }, { wall: "s", x: 4, w: 4.2, h: 3.4 }, { wall: "n", x: 6, w: 1.4 }], panels: true },
  items: [
    { type: "car", args: [-4, -1, 0, { kind: "sedan", color: 0x1a1c1f, livery: true, stripe: "#e8e8e8", unit: "104", lightbar: true }] }, { type: "car", args: [4, -1, 0, { kind: "suv", color: 0xf2f2f0, livery: true, stripe: "#1f4e79", unit: "215", lightbar: true }] },
    { type: "rollerDoor", args: [-4, 4.93, 0, { w: 4.2, h: 3.4, open: 0.0 }] }, { type: "rollerDoor", args: [4, 4.93, 0, { w: 4.2, h: 3.4, open: 0.55 }] },
    { type: "locker", args: [-6.5, -4.6, 0, 6] }, { type: "toolCart", args: [0.2, -3.8, 0.4] }, { type: "cabinet", args: [7.3, -3.5, -Math.PI / 2, { w: 2.0, h: 1.0, color: 0x8a8f96 }] }, { type: "tyreStack", args: [7.0, 2.6, 3] },
  ],
}
const PD_PLAN = [
  { x: -6, z: -5, w: 12, d: 8, color: 0xe4e6e3, label: "Booking & cells", doors: [{ x: 4, z: 4, w: 1.4 }, { x: 6, z: 2, w: 1.2 }], furniture: [{ x: -4.2, z: -2.6, w: 2.4, d: 2.6, color: 0x9aa5b1 }, { x: -1.6, z: -2.6, w: 2.4, d: 2.6, color: 0x9aa5b1 }, { x: 1, z: -2.6, w: 2.4, d: 2.6, color: 0x9aa5b1 }, { x: 3.6, z: -2.6, w: 2.4, d: 2.6, color: 0x9aa5b1 }, { x: -2.5, z: 2.6, w: 3.2, d: 0.7, color: 0x6f7c8a }] },
  { x: 3.5, z: -6, w: 7, d: 6, color: 0xdde3e8, label: "Armoury", doors: [{ x: -3.5, z: 1, w: 1.2 }], furniture: [{ x: -1.5, z: -2.6, w: 2, d: 0.4, color: 0x4f5c69 }, { x: 1.8, z: -2.6, w: 1.4, d: 0.4, color: 0x4f5c69 }] },
  { x: 10.5, z: -6, w: 7, d: 6, color: 0xe6e9e2, label: "Evidence", doors: [{ x: -2, z: 3, w: 1.2 }], furniture: [{ x: -2.3, z: -2.6, w: 2, d: 0.45 }, { x: 0, z: -2.6, w: 2, d: 0.45 }, { x: 2.3, z: -2.6, w: 2, d: 0.45 }] },
  { x: 1, z: 1.5, w: 26, d: 3, color: 0xf0efe9, label: "Corridor" },
  { x: -6.5, z: 7.5, w: 11, d: 9, color: 0xeaeae4, label: "Briefing", doors: [{ x: 4, z: -4.5, w: 1.4 }], furniture: [-2.6, 0, 2.6].flatMap((z) => [-3.3, -1.1, 1.1, 3.3].map((x) => ({ x, z, w: 1.9, d: 0.7 }))) },
  { x: 7, z: 8, w: 16, d: 10, color: 0xdfe2e6, label: "Interior garage", doors: [{ x: -4, z: -5, w: 4.2 }, { x: 4, z: -5, w: 4.2 }], furniture: [{ x: -4, z: 0, w: 4.6, d: 1.9, color: 0x4f5c69 }, { x: 4, z: 0, w: 4.9, d: 2, color: 0x6f7c8a }] },
]

/* ------------------------------------------------------------ dealership */

const DEALER_SHOWROOM = {
  bg: 0xbfd6ea, env: 0.45,
  room: { w: 22, d: 14, h: 5.2, floor: "tile", wallColor: "#ecebe7", doors: [{ wall: "n", x: 8, w: 1.4 }], windows: [{ wall: "s", x: -7, w: 6.6, y0: 0.1, y1: 4.6 }, { wall: "s", x: 0, w: 6.6, y0: 0.1, y1: 4.6 }, { wall: "s", x: 7, w: 6.6, y0: 0.1, y1: 4.6 }, { wall: "e", x: -3, w: 6, y0: 0.1, y1: 4.6 }] },
  daylight: { intensity: 1.6, pos: [6, 12, 10], hemi: 0.6 },
  items: [
    { type: "plinth", args: [-7, -3.5, 0] }, { type: "car", args: [-7, -3.5, 0.25, { kind: "coupe", color: 0xc44536, y: 0.14, gloss: 0.2, wheelColor: 0xd9d9d9 }] },
    { type: "plinth", args: [0, -3.5, 0] }, { type: "car", args: [0, -3.5, -0.2, { kind: "sedan", color: 0xe8e6e1, y: 0.14, gloss: 0.2 }] },
    { type: "plinth", args: [7, -3.5, 0] }, { type: "car", args: [7, -3.5, 0.3, { kind: "suv", color: 0x2b2f36, y: 0.14, gloss: 0.2 }] },
    { type: "plinth", args: [-7, 3.5, 0] }, { type: "car", args: [-7, 3.5, -0.3, { kind: "hatch", color: 0x2a6dd8, y: 0.14, gloss: 0.2, wheelColor: 0xd9d9d9 }] },
    { type: "plinth", args: [0, 3.5, 0] }, { type: "car", args: [0, 3.5, 0.15, { kind: "coupe", color: 0xe0b23a, y: 0.14, gloss: 0.2, spoiler: true }] },
    { type: "counter", args: [8.5, 5.4, Math.PI, { w: 3.2, color: 0xe8e6e1 }] }, { type: "plant", args: [10.3, 5.8] }, { type: "plant", args: [-10.3, -6.2] },
  ],
}
const DEALER_MEZZ = {
  bg: 0xbfd6ea, env: 0.45,
  room: { w: 16, d: 12, h: 7.0, floor: "tile", wallColor: "#ecebe7", windows: [{ wall: "s", x: -4, w: 7, y0: 0.1, y1: 4.6 }, { wall: "s", x: 4, w: 7, y0: 0.1, y1: 4.6 }], panels: false },
  daylight: { intensity: 1.5, pos: [4, 12, 8], hemi: 0.65 },
  items: [
    { type: "mezzanine", args: [-2, -2, 0, { w: 10, d: 7, h: 3.4 }] }, { type: "car", args: [-3.5, -2, 0.2, { kind: "coupe", color: 0x1c1a18, y: 3.4, gloss: 0.15, spoiler: true, wheelColor: 0xd9d9d9 }] }, { type: "car", args: [0.5, -2.2, -0.15, { kind: "coupe", color: 0x8a2b2b, y: 3.4, gloss: 0.15 }] },
    { type: "plinth", args: [-4, 4, 0] }, { type: "car", args: [-4, 4, 0.2, { kind: "sedan", color: 0xe8e6e1, y: 0.14, gloss: 0.2 }] }, { type: "plant", args: [6.5, 4.5] },
  ],
}
const DEALER_OFFICE = {
  bg: 0xbfd6ea,
  room: { w: 12, d: 8, h: 3.2, floor: "wood", wallColor: "#e9e6e0", doors: [{ wall: "n", x: -4, w: 1.2 }], windows: [{ wall: "s", x: -2, w: 3, y0: 0.1, y1: 2.8 }, { wall: "s", x: 2.5, w: 3, y0: 0.1, y1: 2.8 }] },
  daylight: { intensity: 1.2, pos: [3, 8, 8], hemi: 0.55 },
  items: [
    { type: "desk", args: [-3.5, -2.2, 0] }, { type: "chair", args: [-3.5, -2.9, 0] }, { type: "chair", args: [-4.0, -1.3, Math.PI] }, { type: "chair", args: [-3.0, -1.3, Math.PI] }, { type: "cabinet", args: [-5.4, -0.5, Math.PI / 2, { w: 1.6, h: 1.1, color: 0xe4e2dd }] },
    { type: "sofa", args: [2.6, 1.8, Math.PI, 0x4a5a6a] }, { type: "sofa", args: [2.6, -1.4, 0, 0x4a5a6a] }, { type: "table", args: [2.6, 0.2, 0, { w: 1.3, d: 0.7, h: 0.45 }] }, { type: "plant", args: [5.2, 3.2] }, { type: "screen", args: [5.92, 1.7, 0.2, -Math.PI / 2, { w: 1.8, h: 1.0 }] }, { type: "plant", args: [-0.4, 3.2] },
  ],
}
const DEALER_SERVICE = {
  env: 0.35,
  room: { w: 16, d: 11, h: 4.4, floor: "concrete", wallColor: "#cfd2d6", doors: [{ wall: "s", x: -4.5, w: 4.2, h: 3.4 }, { wall: "s", x: 4.5, w: 4.2, h: 3.4 }], windows: [{ wall: "n", x: 0, w: 8, y0: 2.8, y1: 3.8 }], panels: true },
  items: [
    { type: "lift", args: [-4.5, -1.5, 0, { kind: "sedan", color: 0xe8e6e1, raised: 1.4 }] }, { type: "lift", args: [0.2, -1.5, 0, { kind: "hatch", color: 0x2a6dd8, raised: 0.0 }] }, { type: "lift", args: [4.8, -1.5, 0, { kind: "suv", color: 0x2b2f36, raised: 1.0 }] },
    { type: "rollerDoor", args: [-4.5, 5.43, 0, { w: 4.2, h: 3.4, open: 0.7 }] }, { type: "rollerDoor", args: [4.5, 5.43, 0, { w: 4.2, h: 3.4, open: 0.0 }] },
    { type: "toolCart", args: [-2.2, 1.2, 0.3] }, { type: "toolCart", args: [2.6, 1.0, -0.2] }, { type: "partsShelf", args: [-7.6, 0.5, Math.PI / 2, 2.4] }, { type: "tyreStack", args: [7.2, 3.6, 4] }, { type: "tyreStack", args: [6.3, 3.9, 2] },
  ],
}
const DEALER_PLAN = [
  { x: 0, z: 0, w: 22, d: 14, color: 0xe4e7ec, label: "Showroom", doors: [{ x: 8, z: -7, w: 1.4 }], furniture: [-7, 0, 7].flatMap((x) => [-3.5, 3.5].map((z) => ({ x, z, w: 5.4, d: 2.9, color: 0xb9c2cc }))).concat([{ x: 8.5, z: 5.4, w: 3.2, d: 0.7, color: 0x6f7c8a }]) },
  { x: 17, z: -3, w: 12, d: 8, color: 0xeaeae4, label: "Sales & lounge", doors: [{ x: -6, z: 0, w: 1.2 }], furniture: [{ x: -3.5, z: -2.2, w: 1.5, d: 0.75 }, { x: 2.6, z: 1.8, w: 1.9, d: 0.85 }, { x: 2.6, z: -1.4, w: 1.9, d: 0.85 }] },
  { x: 15, z: 6.5, w: 16, d: 11, color: 0xdfe2e6, label: "Service bay", doors: [{ x: -4.5, z: 5.5, w: 4.2 }, { x: 4.5, z: 5.5, w: 4.2 }], furniture: [{ x: -4.5, z: -1.5, w: 3.4, d: 4.6, color: 0x4f5c69 }, { x: 0.2, z: -1.5, w: 3.4, d: 4.6, color: 0x4f5c69 }, { x: 4.8, z: -1.5, w: 3.4, d: 4.6, color: 0x4f5c69 }] },
  { x: -5, z: 12, w: 32, d: 8, color: 0xf0efe9, label: "Forecourt" },
]

/* -------------------------------------------------------------- workshop */

const SHOP_BAY = {
  env: 0.35,
  room: { w: 18, d: 12, h: 4.4, floor: "concrete", wallColor: "#cfd2d6", doors: [{ wall: "s", x: -5, w: 4.4, h: 3.5 }, { wall: "s", x: 5, w: 4.4, h: 3.5 }, { wall: "e", x: 2, w: 1.4 }], windows: [{ wall: "n", x: -4, w: 6, y0: 2.8, y1: 3.8 }, { wall: "n", x: 4, w: 6, y0: 2.8, y1: 3.8 }], panels: true },
  items: [
    { type: "lift", args: [-6.5, -2, 0, { kind: "hatch", color: 0xc44536, raised: 1.5 }] }, { type: "lift", args: [-2.2, -2, 0, { kind: "sedan", color: 0x3d5a80, raised: 0.0 }] }, { type: "lift", args: [2.2, -2, 0, { kind: "coupe", color: 0xe0b23a, raised: 1.1, }] }, { type: "lift", args: [6.5, -2, 0, { kind: "suv", color: 0x8a8f96, raised: 0.0 }] },
    { type: "rollerDoor", args: [-5, 5.93, 0, { w: 4.4, h: 3.5, open: 0.75 }] }, { type: "rollerDoor", args: [5, 5.93, 0, { w: 4.4, h: 3.5, open: 0.0 }] },
    { type: "toolCart", args: [-4.4, 1.4, 0.3] }, { type: "toolCart", args: [0.2, 1.2, -0.4] }, { type: "toolCart", args: [4.6, 1.6, 0.2] }, { type: "tyreStack", args: [-8.3, 4.6, 4] }, { type: "tyreStack", args: [-7.5, 5.0, 2] }, { type: "partsShelf", args: [8.6, 3.5, -Math.PI / 2, 2.4] }, { type: "crate", args: [8.2, -4.8, 0.2, 0.6] },
  ],
}
const SHOP_PAINT = {
  env: 0.35,
  room: { w: 10, d: 9, h: 3.6, floor: "concrete", wallColor: "#cfd2d6", doors: [{ wall: "s", x: 0, w: 4.4, h: 3.2 }], panels: false },
  items: [
    { type: "paintBooth", args: [0, -1, 0] }, { type: "car", args: [0, -1.2, 0, { kind: "coupe", color: 0x8a8f96, gloss: 0.9, wheelColor: 0x8a8f96 }] },
    { type: "rollerDoor", args: [0, 4.43, 0, { w: 4.4, h: 3.2, open: 0.8 }] }, { type: "toolCart", args: [-3.8, 2.6, 0.4] }, { type: "cabinet", args: [3.9, 2.6, -Math.PI / 2, { w: 1.6, h: 1.0, color: 0x8a8f96 }] },
  ],
}
const SHOP_PARTS = {
  room: { w: 9, d: 7, h: 3.2, floor: "concrete", wallColor: "#d8d9d4", doors: [{ wall: "s", x: 0, w: 1.4 }], panels: true },
  items: [
    { type: "partsShelf", args: [-2.8, -3.0, 0, 2.4] }, { type: "partsShelf", args: [0, -3.0, 0, 2.4] }, { type: "partsShelf", args: [2.8, -3.0, 0, 2.4] }, { type: "partsShelf", args: [-4.1, 0.2, Math.PI / 2, 2.4] }, { type: "partsShelf", args: [4.1, 0.2, -Math.PI / 2, 2.4] },
    { type: "counter", args: [0.5, 2.6, Math.PI, { w: 2.6, color: 0xb9bec6 }] }, { type: "tyreStack", args: [-2.6, 2.4, 3] }, { type: "crate", args: [2.6, 1.6, 0.3, 0.6] }, { type: "crate", args: [3.0, 2.3, -0.2, 0.5] },
  ],
}
const SHOP_FRONT = {
  bg: 0xbfd6ea,
  room: { w: 10, d: 7, h: 3.1, floor: "vinyl", wallColor: "#e6e4df", doors: [{ wall: "e", x: -2, w: 1.2 }], windows: [{ wall: "s", x: -2, w: 3.2, y0: 0.1, y1: 2.6 }, { wall: "s", x: 2, w: 3.2, y0: 0.1, y1: 2.6 }] },
  daylight: { intensity: 1.2, pos: [2, 7, 8], hemi: 0.55 },
  items: [
    { type: "counter", args: [-1.5, -2.2, 0, { w: 3.2, color: 0xe4e2dd }] }, { type: "chair", args: [-1.5, -2.9, 0] }, { type: "screen", args: [-1.5, 1.9, -3.42, 0, { w: 1.4, h: 0.8 }] },
    { type: "sofa", args: [2.8, 0.6, -Math.PI / 2, 0x5f6c78] }, { type: "sofa", args: [1.2, 2.4, Math.PI, 0x5f6c78] }, { type: "table", args: [2.4, 2.2, 0, { w: 0.9, d: 0.6, h: 0.45 }] }, { type: "plant", args: [4.3, -2.8] }, { type: "plant", args: [-4.3, 2.8] },
  ],
}
const SHOP_PLAN = [
  { x: 0, z: 0, w: 18, d: 12, color: 0xdfe2e6, label: "Main bay", doors: [{ x: -5, z: 6, w: 4.4 }, { x: 5, z: 6, w: 4.4 }, { x: 9, z: 2, w: 1.4 }], furniture: [-6.5, -2.2, 2.2, 6.5].map((x) => ({ x, z: -2, w: 3.4, d: 4.6, color: 0x4f5c69 })) },
  { x: -14, z: -1.5, w: 10, d: 9, color: 0xe3ecef, label: "Paint booth", doors: [{ x: 0, z: 4.5, w: 4.4 }], furniture: [{ x: 0, z: -1, w: 5.2, d: 6, color: 0x9aa5b1 }] },
  { x: 13.5, z: -2.5, w: 9, d: 7, color: 0xe6e9e2, label: "Parts store", doors: [{ x: -4.5, z: 2, w: 1.4 }], furniture: [{ x: -2.8, z: -3, w: 2.4, d: 0.6 }, { x: 0, z: -3, w: 2.4, d: 0.6 }, { x: 2.8, z: -3, w: 2.4, d: 0.6 }] },
  { x: 14, z: 5.5, w: 10, d: 7, color: 0xeaeae4, label: "Customer desk", doors: [{ x: -5, z: -2, w: 1.2 }], furniture: [{ x: -1.5, z: -2.2, w: 3.2, d: 0.7, color: 0x6f7c8a }, { x: 2.8, z: 0.6, w: 0.85, d: 1.9 }] },
  { x: 0, z: 10.5, w: 38, d: 7, color: 0xf0efe9, label: "Forecourt" },
]

/* ------------------------------------------------------------ mannequins */

const POLICE = { top: 0x1b2a44, bottom: 0x1b2a44, vest: 0x141c2c, accent: 0xdfe3e6, patch: 0xd9a03a, hair: 0x2a211c }
const FIRE = { top: 0x1f2a3a, bottom: 0x1f2a3a, hair: 0x2a211c }
const EMS = { top: 0xf4f4f2, bottom: 0x2e6b3f, accent: 0x2e6b3f, patch: 0xc8202a, hair: 0x3a2a1c }
const M = (x, o, rot = 0) => `mannequin(s,${x},0,${rot},${JSON.stringify(o)});`

const CIV = [
  { top: 0x8a2b2b, sleeves: "short", bottom: 0x3a4a6a, shoes: 0xf0f0f0, hair: 0x1c1a18, hairStyle: "long", female: true, skin: 0x8a5a3a },
  { top: 0x2b2f36, bottom: 0x8a8f96, shoes: 0x2a2d33, hair: 0x2a211c, hairStyle: "short", skin: 0xc9a27e },
  { top: 0xe8e6e1, sleeves: "short", bottom: 0x2b2f36, shorts: true, shoes: 0x3a3f46, hair: 0x5a3a22, hairStyle: "buzz", skin: 0xd9b99b },
  { top: 0x3f6b8a, bottom: 0x1c1a18, shoes: 0x8a6a45, hair: 0x1c1a18, hairStyle: "bun", female: true, skin: 0x6a4a3a },
  { top: 0xd9a03a, sleeves: "none", bottom: 0x4a4f57, shoes: 0xe8e6e1, hair: 0xd9a03a, hairStyle: "long", female: true, skin: 0xe8c9ad },
  { top: 0x2e6b3f, bottom: 0x3a3f46, shoes: 0x2a2d33, hair: 0x2a211c, hairStyle: "short", hat: "beanie", hatColor: 0x8a2b2b, skin: 0xa87a5a },
]
const PEDS = [
  { skin: 0xd9b99b, hair: 0x5a3a22, hairStyle: "short", scale: 1.0, build: 1.0 }, { skin: 0x8a5a3a, hair: 0x1c1a18, hairStyle: "buzz", scale: 1.03, build: 1.08 }, { skin: 0xc9a27e, hair: 0x2a211c, hairStyle: "long", female: true, scale: 0.94 },
  { skin: 0x6a4a3a, hair: 0x1c1a18, hairStyle: "short", scale: 1.0, build: 0.94 }, { skin: 0xe8c9ad, hair: 0xd9a03a, hairStyle: "bun", female: true, scale: 0.96 }, { skin: 0xa87a5a, hair: 0x2a211c, hairStyle: "buzz", scale: 1.05, build: 1.12 },
  { skin: 0xf0d8c0, hair: 0x8a8f96, hairStyle: "short", scale: 0.98, build: 1.02 }, { skin: 0x9a6a4a, hair: 0x1c1a18, hairStyle: "long", female: true, scale: 0.97 }, { skin: 0xd9b99b, hair: 0x2a211c, hairStyle: "bun", female: true, scale: 0.93 }, { skin: 0x7a5a4a, hair: 0x1c1a18, hairStyle: "short", scale: 1.01, build: 1.0 },
]
const GREY = { top: 0x8a8f96, bottom: 0x4a4f57, shoes: 0x2a2d33 }

const NIGHT = { intensity: 0.35, color: 0x9fb4d8, pos: [-6, 12, 8], size: 24, hemi: 0.18 }
const streetLights = (xs, z = -9) => `{for(const x of ${JSON.stringify(xs)}){s.add(cyl(0.08,0.1,7,mat.std(0x3a3d42),x,3.5,${z},8));const l=new THREE.PointLight(0xffd9a0,34,22,1.6);l.position.set(x,6.6,${z});s.add(l);s.add(box(0.5,0.16,0.5,mat.emissive(0xffd9a0,3),x,6.9,${z},false));}}`
const roofPad = (x, z, h, r = 4) => `helipad(s,${x},${h},${z},${r});`
const sign = (text, x, y, z, rot, w = 4, h = 0.8, bg = "#1f2430") => `wallSign(s,${JSON.stringify(text)},${x},${y},${z},${rot},{w:${w},h:${h},bg:${JSON.stringify(bg)}});`

/* ================================================================= PLANS */

export const PLANS4 = {
  "modern-police-department-mlo": [
    { key: "cover", label: "Station exterior", alt: "Police station exterior with rooftop helipad and two marked units at the entrance", make: () => exteriorScene({ sky: 0xc1d5e8, items: [`buildingBlock(s,0,-14,{w:34,d:16,h:9,rows:2,cols:9,canopy:true});`, roofPad(-6, -14, 9.02, 4.2), sign("POLICE", 0, 6.2, -5.9, 0, 6, 1.1, "#14213d"), `vehicle(s,"sedan",-7,2,0.15,{color:0x1a1c1f,stripe:"#e8e8e8",unit:"104",type:"police"});vehicle(s,"suv",5,3,-0.2,{color:0xf2f2f0,stripe:"#1f4e79",unit:"215",type:"police"});props.bollard(s,-2,-3.5);props.bollard(s,2,-3.5);props.tree(s,-20,-4,1.3);props.tree(s,21,-3,1.2);`], view: { pos: [-18, 13, 26], look: [0, 4.5, -10], fov: 46 } }) },
    { key: "gallery-01", label: "Booking and cells", alt: "Booking desk with four holding cells on the short path from the sally port", make: () => interior({ spec: PD_BOOKING, view: { pos: [4.6, 1.75, 3.2], look: [-2, 1.1, -2.4], fov: 58 }, sign: { text: "BOOKING", at: [-2.5, 2.7, -3.92], opts: { w: 1.8, h: 0.4, bg: "#14213d" } } }) },
    { key: "gallery-02", label: "Briefing room", alt: "Briefing room with twelve tables facing the whiteboard and screen — sized for a full shift", make: () => interior({ spec: PD_BRIEFING, view: { pos: [3.6, 2.0, 4.0], look: [-0.5, 1.1, -3.5], fov: 60 } }) },
    { key: "gallery-03", label: "Armoury", alt: "Armoury with two wall racks, lockers and an issue counter", make: () => interior({ spec: PD_ARMOURY, view: { pos: [2.4, 1.7, 2.4], look: [-0.6, 1.1, -2.6], fov: 58 }, sign: { text: "ARMOURY", at: [0.2, 2.6, -2.92], opts: { w: 1.6, h: 0.4, bg: "#14213d" } } }) },
    { key: "gallery-04", label: "Interior garage", alt: "Interior garage with two marked units, roller doors and equipment lockers", make: () => interior({ spec: PD_GARAGE, view: { pos: [6.5, 2.2, 3.6], look: [-2, 1.2, -1.5], fov: 62 } }) },
    { key: "gallery-05", label: "Evidence store", alt: "Evidence store with shelving and an intake counter", make: () => interior({ spec: PD_EVIDENCE, view: { pos: [2.6, 1.7, 2.6], look: [-0.5, 1.1, -2.4], fov: 56 } }) },
    { key: "gallery-06", label: "Floor plan", alt: "Ground floor plan: booking and cells, armoury, evidence, briefing room and interior garage", make: () => floorplan({ title: "Ground floor", rooms: PD_PLAN }) },
  ],

  "luxury-auto-dealership-mlo": [
    { key: "cover", label: "Showroom", alt: "Showroom floor with vehicles on a grid of display plinths and full-height glazing", make: () => interior({ spec: DEALER_SHOWROOM, view: { pos: [9.5, 2.4, 5.8], look: [-3, 1.0, -2.5], fov: 62 } }) },
    { key: "gallery-01", label: "Mezzanine", alt: "Mezzanine floor with premium stock above the main showroom", make: () => interior({ spec: DEALER_MEZZ, view: { pos: [7, 1.8, 5.5], look: [-2, 3.2, -2.5], fov: 64 } }) },
    { key: "gallery-02", label: "Sales office and lounge", alt: "Sales office desk with a customer lounge beside it", make: () => interior({ spec: DEALER_OFFICE, view: { pos: [4.5, 1.7, 3.2], look: [-1.5, 1.0, -1.5], fov: 60 } }) },
    { key: "gallery-03", label: "Service bay", alt: "Service bay with three lifts and roller doors", make: () => interior({ spec: DEALER_SERVICE, view: { pos: [6.8, 2.2, 4.2], look: [-2, 1.3, -1.5], fov: 62 } }) },
    { key: "gallery-04", label: "Forecourt", alt: "Exterior forecourt with brandable signage and stock parked outside", make: () => exteriorScene({ sky: 0xc4d8ea, items: [`buildingBlock(s,0,-16,{w:36,d:18,h:7,rows:1,cols:9,canopy:true});`, sign("DEALERSHIP", 0, 5.6, -6.9, 0, 8, 1.1, "#2c3440"), `vehicle(s,"coupe",-8,1,0.2,{color:0xc44536,livery:false,lightbar:false,gloss:0.2,wheelColor:0xd9d9d9});vehicle(s,"sedan",-1,2,-0.1,{color:0xe8e6e1,livery:false,lightbar:false,gloss:0.2});vehicle(s,"suv",7,1,0.25,{color:0x2b2f36,livery:false,lightbar:false,gloss:0.2});props.bollard(s,-13,-4);props.bollard(s,13,-4);props.tree(s,-20,-6,1.3);props.tree(s,21,-5,1.2);`], view: { pos: [-12, 4.2, 16], look: [0, 2.2, -6], fov: 48 } }) },
    { key: "gallery-05", label: "Floor plan", alt: "Floor plan: showroom grid, sales and lounge, service bay and forecourt", make: () => floorplan({ title: "Ground floor", rooms: DEALER_PLAN }) },
  ],

  "mechanic-workshop-mlo": [
    { key: "cover", label: "Main bay", alt: "Main bay with four lifts, two roller doors and tool carts", make: () => interior({ spec: SHOP_BAY, view: { pos: [7.8, 2.3, 5.2], look: [-2, 1.3, -1.8], fov: 64 } }) },
    { key: "gallery-01", label: "Paint booth", alt: "Paint booth with wall light strips, a car in primer and its own roller door", make: () => interior({ spec: SHOP_PAINT, view: { pos: [0.6, 1.5, 4.0], look: [0, 1.0, -1.6], fov: 62 } }) },
    { key: "gallery-02", label: "Parts store", alt: "Parts store with racking on three walls and a counter", make: () => interior({ spec: SHOP_PARTS, view: { pos: [3.0, 1.7, 2.8], look: [-0.8, 1.1, -2.4], fov: 60 } }) },
    { key: "gallery-03", label: "Customer desk", alt: "Customer desk and waiting area at the front of the workshop", make: () => interior({ spec: SHOP_FRONT, view: { pos: [3.8, 1.6, 2.4], look: [-1, 1.0, -2], fov: 58 } }) },
    { key: "gallery-04", label: "Forecourt", alt: "Exterior forecourt with brandable signage", make: () => exteriorScene({ sky: 0xc4d8ea, items: [`buildingBlock(s,0,-15,{w:30,d:16,h:6,rows:1,cols:8});`, sign("WORKSHOP", 0, 4.8, -6.9, 0, 7, 1.0, "#2c3440"), `vehicle(s,"hatch",-7,1,0.3,{color:0xc44536,livery:false,lightbar:false});vehicle(s,"sedan",6,2,-0.15,{color:0x3d5a80,livery:false,lightbar:false});props.tyreStack(s,-12,-5,4);props.bollard(s,-3,-4);props.bollard(s,3,-4);props.tree(s,18,-3,1.2);`], view: { pos: [-11, 3.8, 15], look: [0, 2.0, -6], fov: 48 } }) },
    { key: "gallery-05", label: "Floor plan", alt: "Floor plan: main bay, paint booth, parts store, customer desk and forecourt", make: () => floorplan({ title: "Ground floor", rooms: SHOP_PLAN }) },
  ],

  "tuner-car-pack": [
    { key: "cover", label: "Car meet", alt: "Six tuner cars at a meet: coupes and hatches with body kits, wings and wheel sets", make: () => exteriorScene({ sky: 0xc4d8ea, items: [`vehicle(s,"coupe",-11,0,0.5,{color:0xe0b23a,livery:false,lightbar:false,spoiler:true,kit:true,wheelColor:0x9a9ea3,gloss:0.2});vehicle(s,"hatch",-6.6,0.3,0.4,{color:0x2a6dd8,livery:false,lightbar:false,kit:true,wheelColor:0xd9d9d9,gloss:0.2});vehicle(s,"coupe",-2.2,0.5,0.45,{color:0x1c1a18,livery:false,lightbar:false,spoiler:true,wheelColor:0xc9a35a,gloss:0.15});vehicle(s,"sedan",2.2,0.3,0.4,{color:0xc44536,livery:false,lightbar:false,kit:true,wheelColor:0x22252a,gloss:0.2});vehicle(s,"hatch",6.6,0.5,0.5,{color:0xe8e6e1,livery:false,lightbar:false,spoiler:true,kit:true,wheelColor:0x9a9ea3,gloss:0.2});vehicle(s,"coupe",11,0.3,0.4,{color:0x3ec66d,livery:false,lightbar:false,kit:true,wheelColor:0xd9d9d9,gloss:0.15});`, `buildingBlock(s,2,-22,{w:64,d:14,h:8,rows:2,cols:14});props.tree(s,-26,-8,1.3);props.tree(s,30,-9,1.2);`], view: { pos: [-6, 2.4, 14], look: [0, 0.9, 0], fov: 52 } }) },
    { key: "gallery-01", label: "Coupe · full kit", alt: "Coupe with body kit, rear wing and dark wheel set", make: () => exteriorScene({ sky: 0xbfd3e6, items: [`vehicle(s,"coupe",0,0,0.6,{color:0xe0b23a,livery:false,lightbar:false,spoiler:true,kit:true,wheelColor:0x9a9ea3,gloss:0.2});`, `buildingBlock(s,-6,-18,{w:40,d:14,h:9,rows:2,cols:10});props.tree(s,14,-8,1.2);`], view: { pos: [5.2, 1.5, 5.0], look: [0, 0.8, 0], fov: 40 } }) },
    { key: "gallery-02", label: "Body kit stages", alt: "The same coupe stock, with a body kit, and with kit and wing", make: () => exteriorScene({ sky: 0xc4d8ea, items: [`vehicle(s,"coupe",-6.5,0,0.3,{color:0x3d5a80,livery:false,lightbar:false,gloss:0.2});vehicle(s,"coupe",0,0,0.3,{color:0x3d5a80,livery:false,lightbar:false,kit:true,gloss:0.2});vehicle(s,"coupe",6.5,0,0.3,{color:0x3d5a80,livery:false,lightbar:false,kit:true,spoiler:true,wheelColor:0x22252a,gloss:0.2});`, `buildingBlock(s,0,-18,{w:44,d:14,h:8,rows:2,cols:11});`], view: { pos: [2, 2.6, 13], look: [0, 0.9, 0], fov: 44 } }) },
    { key: "gallery-03", label: "Colours and wheels", alt: "Hatchback in four colours with different wheel sets", make: () => exteriorScene({ sky: 0xc4d8ea, items: [`vehicle(s,"hatch",-8,0,0.2,{color:0xc44536,livery:false,lightbar:false,wheelColor:0xd9d9d9,gloss:0.2});vehicle(s,"hatch",-2.6,0,0.2,{color:0xe8e6e1,livery:false,lightbar:false,wheelColor:0x22252a,gloss:0.2});vehicle(s,"hatch",2.8,0,0.2,{color:0x2a6dd8,livery:false,lightbar:false,wheelColor:0xc9a35a,gloss:0.2});vehicle(s,"hatch",8.2,0,0.2,{color:0x2b2f36,livery:false,lightbar:false,wheelColor:0x9a9ea3,gloss:0.2});`, `buildingBlock(s,0,-18,{w:48,d:14,h:8,rows:2,cols:12});`], view: { pos: [1, 2.4, 14], look: [0, 0.9, 0], fov: 46 } }) },
    { key: "gallery-04", label: "Night meet", alt: "Tuner cars at night under street lighting", make: () => exteriorScene({ sky: 0x0b1220, daylight: NIGHT, items: [`vehicle(s,"coupe",-4,0,0.4,{color:0xe0b23a,livery:false,lightbar:false,spoiler:true,kit:true,wheelColor:0x9a9ea3,gloss:0.15});vehicle(s,"hatch",3,-1.5,-0.2,{color:0x2a6dd8,livery:false,lightbar:false,kit:true,wheelColor:0xd9d9d9,gloss:0.15});vehicle(s,"coupe",9,1,0.3,{color:0x1c1a18,livery:false,lightbar:false,spoiler:true,wheelColor:0xc9a35a,gloss:0.15});`, streetLights([-14, -4, 6, 16]), `buildingBlock(s,0,-20,{w:56,d:14,h:8,rows:2,cols:13});`], view: { pos: [6, 2.4, 11], look: [1, 0.9, -1], fov: 46 } }) },
    { key: "gallery-05", label: "Mod-kit and audio entries", alt: "Meta entries mapping each car to its mod kit, LOD distances and engine audio", make: () => configEditor({ filename: "vehicles.meta", title: "Tuner Car Pack", activeLine: 6, tree: [["resources", 0, false, true], ["ds_tuners", 1, false, true], ["fxmanifest.lua", 2, false], ["data", 2, false, true], ["vehicles.meta", 3, true], ["carcols.meta", 3, false], ["carvariations.meta", 3, false], ["handling.meta", 3, false], ["stream", 2, false, true], ["audio", 2, false, true]], lines: [[["<Item>", "sec"]], [["  <modelName>", "key"], ["ds_kestrel", "str"], ["</modelName>", "key"]], [["  <txdName>", "key"], ["ds_kestrel", "str"], ["</txdName>", "key"]], [["  <handlingId>", "key"], ["DS_KESTREL", "str"], ["</handlingId>", "key"]], [["  <audioNameHash>", "key"], ["ds_i4_20_turbo", "str"], ["</audioNameHash>", "key"], ["   <!-- matching engine audio -->", "cmt"]], [["  <lodDistances content=\"float_array\">", "key"]], [["    ", "val"], ["15.0 30.0 60.0 120.0 500.0", "num"], ["   <!-- four LODs: meets, not single spawns -->", "cmt"]], [["  </lodDistances>", "key"]], [["  <flags>", "key"], ["FLAG_HAS_LIVERY FLAG_EXTRAS_STRONG", "str"], ["</flags>", "key"]], [["  <modkits>", "key"]], [["    <Item>", "key"], ["1201_ds_kestrel_modkit", "str"], ["</Item>", "key"], ["   <!-- 6 kits · 5 wings · 18 wheel sets -->", "cmt"]], [["  </modkits>", "key"]], [["  <liveries>", "key"], ["8", "num"], ["</liveries>", "key"], ["   <!-- templates in /liveries -->", "cmt"]], [["</Item>", "sec"]]] }) },
  ],

  "emergency-services-eup-pack": [
    { key: "cover", label: "Three services", alt: "Police, fire and EMS patrol uniforms drawn to one standard", make: () => studio({ view: { pos: [0, 1.5, 5.6], look: [0, 1.0, 0], fov: 38 }, items: [M(-1.8, { ...POLICE, hat: "peaked", hatColor: 0x141c2c, epaulettes: 1 }, 0.15), M(0, { ...FIRE, vest: 0xc8b04a, reflective: true, helmet: 0xf2d55c, build: 1.05 }, 0.0), M(1.8, { ...EMS, female: true, hairStyle: "bun" }, -0.15)] }) },
    { key: "gallery-01", label: "Police variants", alt: "Police patrol, tactical, dress and utility variants", make: () => studio({ view: { pos: [0, 1.5, 6.4], look: [0, 1.0, 0], fov: 40 }, items: [M(-2.7, { ...POLICE, hat: "cap", hatColor: 0x141c2c }, 0.2), M(-0.9, { ...POLICE, vest: 0x23262b, helmet: 0x23262b, glove: 0x23262b, accent: null, build: 1.04 }, 0.1), M(0.9, { ...POLICE, vest: null, tie: 0x0b0f19, hat: "peaked", hatColor: 0x141c2c, epaulettes: 3, gloss: true }, -0.1), M(2.7, { ...POLICE, vest: null, sleeves: "short", hat: "cap", hatColor: 0x141c2c, accent: null }, -0.2)] }) },
    { key: "gallery-02", label: "Fire variants", alt: "Fire station wear, turnout gear, dress and utility variants", make: () => studio({ view: { pos: [0, 1.5, 6.4], look: [0, 1.0, 0], fov: 40 }, items: [M(-2.7, { ...FIRE, top: 0x1f2a3a, accent: 0xc8b04a }, 0.2), M(-0.9, { ...FIRE, top: 0x8a7a4a, bottom: 0x8a7a4a, vest: 0x8a7a4a, reflective: true, helmet: 0xf2d55c, glove: 0x23262b, build: 1.08 }, 0.1), M(0.9, { ...FIRE, top: 0x141c2c, bottom: 0x141c2c, tie: 0x0b0f19, hat: "peaked", hatColor: 0x141c2c, epaulettes: 2, gloss: true }, -0.1), M(2.7, { ...FIRE, top: 0x2e3a4a, sleeves: "short", hat: "cap", hatColor: 0x1f2a3a, accent: 0xc8b04a }, -0.2)] }) },
    { key: "gallery-03", label: "EMS variants", alt: "EMS patrol, tactical, dress and utility variants", make: () => studio({ view: { pos: [0, 1.5, 6.4], look: [0, 1.0, 0], fov: 40 }, items: [M(-2.7, { ...EMS }, 0.2), M(-0.9, { ...EMS, top: 0x2e6b3f, vest: 0x2e6b3f, reflective: true, hat: "cap", hatColor: 0x2e6b3f, glove: 0x23262b }, 0.1), M(0.9, { ...EMS, top: 0x1f2a3a, bottom: 0x1f2a3a, accent: null, tie: 0x2e6b3f, hat: "peaked", hatColor: 0x1f2a3a, epaulettes: 2, gloss: true }, -0.1), M(2.7, { ...EMS, sleeves: "short", top: 0x2e6b3f, bottom: 0x2b2f36, accent: null }, -0.2)] }) },
    { key: "gallery-04", label: "Male and female meshes", alt: "The same police patrol uniform on the male and female meshes — separate meshes, not scaled copies", make: () => studio({ view: { pos: [0, 1.5, 4.8], look: [0, 1.0, 0], fov: 36 }, grid: true, items: [M(-0.9, { ...POLICE, hat: "cap", hatColor: 0x141c2c }, 0.1), M(0.9, { ...POLICE, female: true, hairStyle: "bun", hat: "cap", hatColor: 0x141c2c }, -0.1)] }) },
    { key: "gallery-05", label: "Ranks and variants", alt: "Rank insignia from officer to chief and the service × variant matrix", make: () => rankChart() },
  ],

  "civilian-clothing-collection": [
    { key: "cover", label: "Wardrobe range", alt: "Six civilian outfits from the collection on male and female meshes", make: () => studio({ view: { pos: [0, 1.5, 7.6], look: [0, 1.0, 0], fov: 40 }, items: CIV.map((o, i) => M(-3.75 + i * 1.5, o, 0.25 - i * 0.1)) }) },
    { key: "gallery-01", label: "Colour variants", alt: "One jacket in six texture variants — the same mesh, one texture standard", make: () => studio({ view: { pos: [0, 1.5, 7.6], look: [0, 1.0, 0], fov: 40 }, grid: true, items: [0x2b2f36, 0x8a2b2b, 0x3f6b8a, 0x2e6b3f, 0xd9a03a, 0xe8e6e1].map((c, i) => M(-3.75 + i * 1.5, { top: c, bottom: 0x3a3f46, shoes: 0x2a2d33, hair: 0x2a211c, skin: 0xc9a27e }, 0.0)) }) },
    { key: "gallery-02", label: "Female wardrobe", alt: "Five outfits on the female mesh", make: () => studio({ view: { pos: [0, 1.5, 6.6], look: [0, 1.0, 0], fov: 40 }, items: [M(-3, { ...CIV[0] }, 0.2), M(-1.5, { ...CIV[3], top: 0xe8e6e1, bottom: 0x8a2b2b }, 0.1), M(0, { ...CIV[4] }, 0), M(1.5, { ...CIV[3], top: 0x2b2f36, bottom: 0x3f6b8a, hairStyle: "long", hair: 0x5a3a22, skin: 0xd9b99b }, -0.1), M(3, { ...CIV[0], top: 0x3ec66d, sleeves: "long", bottom: 0x1c1a18, shorts: true, shoes: 0x2a2d33, hairStyle: "bun" }, -0.2)] }) },
    { key: "gallery-03", label: "Male wardrobe", alt: "Five outfits on the male mesh", make: () => studio({ view: { pos: [0, 1.5, 6.6], look: [0, 1.0, 0], fov: 40 }, items: [M(-3, { ...CIV[1] }, 0.2), M(-1.5, { ...CIV[2] }, 0.1), M(0, { ...CIV[5] }, 0), M(1.5, { ...CIV[1], top: 0xe8e6e1, bottom: 0x2b2f36, hat: "cap", hatColor: 0x2b2f36, skin: 0x7a5a4a }, -0.1), M(3, { ...CIV[2], top: 0x3f6b8a, sleeves: "long", shorts: false, bottom: 0x8a6a45, skin: 0x8a5a3a, hairStyle: "short" }, -0.2)] }) },
    { key: "gallery-04", label: "Component ID reference", alt: "Component slots, drawable ranges and texture variants for the whole collection", make: () => componentTable({ rows: [["Tops", "11", "600 – 648", "49", "2 – 6", "M / F", "jackets share slot 11 with torso variants"], ["Torsos / undershirts", "8", "600 – 622", "23", "1 – 4", "M / F", "matched to each jacket"], ["Legs", "4", "600 – 641", "42", "2 – 5", "M / F", "cuffs sized to footwear"], ["Shoes", "6", "600 – 631", "32", "2 – 4", "M / F", ""], ["Accessories", "7", "600 – 617", "18", "1 – 3", "M / F", "chains, scarves"], ["Hats", "P0", "600 – 618", "19", "2 – 5", "M / F", "hair hidden per hat"], ["Glasses", "P1", "600 – 611", "12", "2 – 3", "M / F", ""], ["Bags", "5", "600 – 608", "9", "2", "M / F", ""]] }) },
  ],

  "custom-ped-model-pack": [
    { key: "cover", label: "Ten peds", alt: "The ten original ped models lined up in neutral clothing", make: () => studio({ view: { pos: [0, 1.6, 10.2], look: [0, 1.0, 0], fov: 46 }, items: PEDS.map((o, i) => M(-5.2 + i * 1.155, { ...GREY, ...o }, 0.3 - i * 0.066)) }) },
    { key: "gallery-01", label: "LOD levels", alt: "The same ped at its three LOD levels", make: () => lodStrip({ view: { pos: [0, 1.5, 6.0], look: [0, 0.95, 0], fov: 38 } }) },
    { key: "gallery-02", label: "Clothing component support", alt: "One ped dressed from the wardrobe three ways — not a baked outfit", make: () => studio({ view: { pos: [0, 1.5, 5.4], look: [0, 1.0, 0], fov: 38 }, items: [M(-1.8, { ...GREY, ...PEDS[1] }, 0.15), M(0, { ...PEDS[1], top: 0x8a2b2b, sleeves: "short", bottom: 0x3a4a6a, shoes: 0xe8e6e1 }, 0), M(1.8, { ...PEDS[1], top: 0x1b2a44, bottom: 0x1b2a44, vest: 0x141c2c, accent: 0xdfe3e6, hat: "cap", hatColor: 0x141c2c }, -0.15)] }) },
    { key: "gallery-03", label: "Poses on the game rig", alt: "Peds animating on standard freemode animations", make: () => studio({ view: { pos: [0, 1.5, 6.6], look: [0, 0.9, 0], fov: 40 }, grid: true, items: [M(-2.4, { ...GREY, ...PEDS[2], pose: "wave" }, 0.2), M(-0.8, { ...GREY, ...PEDS[5], pose: "walk" }, 0.1), M(0.8, { ...GREY, ...PEDS[4], pose: "phone" }, -0.1), M(2.4, { ...GREY, ...PEDS[0], pose: "crossed" }, -0.2)] }) },
    { key: "gallery-04", label: "Model reference", alt: "Per-model reference: skeleton, LOD polycounts and component support", make: () => docPage({ kicker: "Custom Ped Model Pack", title: "Model reference", meta: "Ten models · freemode-compatible skeleton · three LODs · component support", page: "2 / 6", sections: [{ h: "Skeleton", p: ["Every model is weighted to the standard freemode skeleton, including the facial bones. Emotes, walk styles and job animations from any standard pack play without retargeting.", "Facial expressions use the same blend targets as the base peds, so expression scripts work unchanged."] }, { h: "LOD budget", table: [["LOD", "Triangles", "Distance"], ["0 · high", "18,400 – 21,000", "0 – 15 m"], ["1 · medium", "7,200 – 8,100", "15 – 40 m"], ["2 · low", "1,900 – 2,300", "40 m +"]] }, { h: "Component support", list: ["Tops, torsos, legs, shoes, accessories, hats, glasses", "Wardrobe items from the Civilian Clothing Collection fit without clipping", "Per-model component reference in components.csv"] }, { h: "Models", table: [["ID", "Name", "Body"], ["ds_ped_01", "Adler", "M · average"], ["ds_ped_02", "Okoro", "M · heavy"], ["ds_ped_03", "Lindqvist", "F · average"], ["ds_ped_04", "Haddad", "M · slim"], ["ds_ped_05", "Byrne", "F · average"], ["ds_ped_06", "Nakamura", "M · heavy"], ["ds_ped_07", "Fischer", "M · average"], ["ds_ped_08", "Raman", "F · average"], ["ds_ped_09", "Moreno", "F · slim"], ["ds_ped_10", "Adebayo", "M · average"]] }] }) },
  ],

  "modern-weapon-pack": [
    { key: "cover", label: "Attachment points", alt: "The four attachment bones every weapon in a class shares", make: () => attachmentDiagram() },
    { key: "gallery-01", label: "Ballistics ladder", alt: "Damage, range and recoil across all fifteen weapons, balanced as a set", make: () => ballisticsLadder() },
    { key: "gallery-02", label: "Bench", alt: "Rifle, SMG and pistol on the bench with optic, suppressor, grip and light fitted", make: () => studio({ tone: "light", view: { pos: [0.15, 1.35, 1.45], look: [0.05, 0.95, 0], fov: 30 }, keyPos: [2, 5, 4], exposure: 1.05, items: [`{s.add(box(2.6,0.06,1.0,mat.std(0x3a3d42,{roughness:0.8}),0,0.9,0));for(const [x,z] of [[-1.2,-0.4],[1.2,-0.4],[-1.2,0.4],[1.2,0.4]])s.add(cyl(0.03,0.03,0.9,mat.std(0x2a2d33),x,0.45,z,10));}`, `weapon(s,"rifle",-0.25,0.98,-0.22,0.05,{optic:true,suppressor:true,grip:true});`, `weapon(s,"smg",0.45,0.98,0.12,0.4,{optic:true,light:true});`, `weapon(s,"pistol",-0.55,0.95,0.24,-0.7,{light:true,optic:true});`] }) },
    { key: "gallery-03", label: "Classes", alt: "Pistol, SMG, rifle, shotgun and marksman rifle on the rack", make: () => studio({ tone: "light", view: { pos: [0.0, 1.05, 1.9], look: [0, 0.95, -0.3], fov: 40 }, keyPos: [2, 5, 4], items: [`{s.add(box(2.4,1.5,0.05,mat.std(0x5a6068,{roughness:0.85}),0,0.95,-0.3));for(let i=0;i<5;i++)for(const dx of [-0.25,0.25])s.add(box(0.03,0.04,0.1,mat.std(0xc9ccd1),dx,0.35+i*0.3,-0.25,false));}`, `weapon(s,"pistol",0,1.55,-0.22,0,{});`, `weapon(s,"smg",0,1.25,-0.22,0,{optic:true});`, `weapon(s,"rifle",0,0.95,-0.22,0,{grip:true});`, `weapon(s,"shotgun",0,0.65,-0.22,0,{});`, `weapon(s,"sniper",0,0.35,-0.22,0,{optic:true});`] }) },
    { key: "gallery-04", label: "weapons.meta", alt: "Weapon meta entries with the balanced damage, range and recoil values", make: () => configEditor({ filename: "weapons.meta", title: "Modern Weapon Pack", activeLine: 5, tree: [["resources", 0, false, true], ["ds_weapons", 1, false, true], ["fxmanifest.lua", 2, false], ["meta", 2, false, true], ["weapons.meta", 3, true], ["weaponarchetypes.meta", 3, false], ["weaponanimations.meta", 3, false], ["weaponcomponents.meta", 3, false], ["audio", 2, false, true], ["BALANCE.md", 2, false]], lines: [[["<Item type=\"CWeaponInfo\">", "sec"]], [["  <Name>", "key"], ["WEAPON_DS_CARBINE", "str"], ["</Name>", "key"]], [["  <Model>", "key"], ["w_ar_ds_carbine", "str"], ["</Model>", "key"]], [["  <Audio>", "key"], ["AUDIO_ITEM_DS_CARBINE", "str"], ["</Audio>", "key"], ["   <!-- custom firing + reload audio -->", "cmt"]], [["  <Damage value=\"", "key"], ["30.0", "num"], ["\" />", "key"], ["   <!-- rifle class: 30 / 34 / 44 / 32 -->", "cmt"]], [["  <WeaponRange value=\"", "key"], ["165.0", "num"], ["\" />", "key"]], [["  <RecoilShakeAmplitude value=\"", "key"], ["0.38", "num"], ["\" />", "key"]], [["  <TimeBetweenShots value=\"", "key"], ["0.095", "num"], ["\" />", "key"]], [["  <ClipSize value=\"", "key"], ["30", "num"], ["\" />", "key"]], [["  <AttachPoints>", "key"]], [["    <Item><AttachBone>", "key"], ["WAPScop", "str"], ["</AttachBone></Item>", "key"], ["   <!-- optic -->", "cmt"]], [["    <Item><AttachBone>", "key"], ["WAPSupp", "str"], ["</AttachBone></Item>", "key"], ["   <!-- suppressor -->", "cmt"]], [["    <Item><AttachBone>", "key"], ["WAPGrip", "str"], ["</AttachBone></Item>", "key"], ["   <!-- grip -->", "cmt"]], [["    <Item><AttachBone>", "key"], ["WAPFlshLasr", "str"], ["</AttachBone></Item>", "key"], ["   <!-- light -->", "cmt"]], [["  </AttachPoints>", "key"]], [["</Item>", "sec"]]] }) },
  ],

  "emote-animation-pack": [
    { key: "cover", label: "Emote menu", alt: "The searchable emote menu with favourites and keybinds", make: () => emoteMenu({ query: "wave" }) },
    { key: "gallery-01", label: "Social and everyday", alt: "Wave, salute, point, lean and phone emotes", make: () => studio({ view: { pos: [0, 1.6, 8.0], look: [0, 0.9, 0], fov: 40 }, grid: true, items: [M(-3.6, { ...GREY, ...PEDS[0], pose: "wave" }, 0.2), M(-1.8, { ...GREY, ...PEDS[2], pose: "salute" }, 0.1), M(0, { ...GREY, ...PEDS[5], pose: "point" }, 0), `studioProps.wall(s,1.9,-0.35,1.4,2.4,0,0xcfcbc4);` + M(1.8, { ...GREY, ...PEDS[4], pose: "lean" }, -0.1), M(3.6, { ...GREY, ...PEDS[1], pose: "phone" }, -0.2)] }) },
    { key: "gallery-02", label: "Paired emote consent", alt: "The consent prompt a paired emote shows the other player before moving them", make: () => emoteMenu({ query: "handshake", showConsent: true }) },
    { key: "gallery-03", label: "Paired and prop emotes", alt: "Handshake between two players, sitting on a chair and carrying a crate", make: () => studio({ view: { pos: [0, 1.5, 7.0], look: [0, 0.9, 0], fov: 40 }, items: [M(-3.2, { ...GREY, ...PEDS[0], pose: "handshake" }, 1.57), M(-1.9, { ...GREY, ...PEDS[2], pose: "handshake" }, -1.57), `studioProps.chair(s,0.6,0,0);` + M(0.6, { ...GREY, ...PEDS[4], pose: "sit" }, 0), `studioProps.crate(s,3.0,0.42,0,0.78,0.42);` + M(3.0, { ...GREY, ...PEDS[1], pose: "carry" }, 0)] }) },
    { key: "gallery-04", label: "Dances and walk styles", alt: "Dance emotes and walk style overrides", make: () => studio({ view: { pos: [0, 1.5, 7.0], look: [0, 0.9, 0], fov: 40 }, grid: true, items: [M(-2.7, { ...GREY, ...PEDS[3], pose: "dance" }, 0.2), M(-0.9, { ...GREY, ...PEDS[7], pose: "dance", poseOverride: { sxL: 0.7, szL: 0.9, eL: 1.5, sxR: 2.3, szR: 0.6, eR: -0.6, hxR: 0, hxL: -0.5, kL: 0.9 } }, 0.1), M(0.9, { ...GREY, ...PEDS[6], pose: "walk" }, -0.1), M(2.7, { ...GREY, ...PEDS[8], pose: "walk", poseOverride: { spine: -0.1, sxL: 0.3, sxR: -0.3, hxL: -0.3, hxR: 0.3, kL: 0.4 } }, -0.2)] }) },
  ],

  "roleplay-job-animations": [
    { key: "cover", label: "Sequence viewer · mechanic", alt: "The tyre-change sequence: seven steps with props and cancel points", make: () => sequenceViewer({ job: "mechanic" }) },
    { key: "gallery-01", label: "Mechanic", alt: "Mechanic kneeling at a wheel with the wrench and toolbox props", make: () => studio({ view: { pos: [2.6, 1.3, 3.4], look: [0, 0.6, 0], fov: 40 }, items: [`studioProps.wheel(s,0.55,0.0);studioProps.toolbox(s,-0.9,0.5,0.4);studioProps.cone(s,1.6,1.2);`, M(0, { top: 0x3a4a5a, bottom: 0x2b2f36, vest: 0xd9a03a, hair: 0x2a211c, skin: 0xc9a27e, pose: "kneel" }, -0.3)] }) },
    { key: "gallery-02", label: "Medic", alt: "Medic kneeling at the stretcher with the treatment kit prop", make: () => studio({ view: { pos: [2.8, 1.4, 3.2], look: [0, 0.5, 0], fov: 40 }, items: [`studioProps.stretcher(s,1.0,-0.4,0.2);studioProps.toolbox(s,-1.2,0.6,0.3);`, M(-0.4, { ...EMS, female: true, hairStyle: "bun", skin: 0xd9b99b, pose: "treat" }, 0.5)] }) },
    { key: "gallery-03", label: "Police", alt: "Officer searching a subject with hands behind their back", make: () => studio({ view: { pos: [2.4, 1.5, 3.6], look: [0, 1.0, 0], fov: 38 }, items: [M(0.5, { ...GREY, ...PEDS[3], pose: "cuffed" }, 0.2), M(-0.6, { ...POLICE, hat: "cap", hatColor: 0x141c2c, pose: "search" }, 0.2)] }) },
    { key: "gallery-04", label: "Sequence viewer · police", alt: "The search-and-cuff sequence with its cancel points", make: () => sequenceViewer({ job: "police" }) },
    { key: "gallery-05", label: "Integration", alt: "Triggering a sequence from a job script through the resource export", make: () => configEditor({ filename: "example_mechanic.lua", title: "Roleplay Job Animations", activeLine: 8, tree: [["resources", 0, false, true], ["ds_jobanims", 1, false, true], ["fxmanifest.lua", 2, false], ["client", 2, false, true], ["sequences.lua", 3, false], ["props.lua", 3, false], ["examples", 2, false, true], ["example_mechanic.lua", 3, true], ["example_medic.lua", 3, false], ["example_police.lua", 3, false]], lines: [[["-- Trigger a whole sequence from your own job script. The export returns", "cmt"]], [["-- when the sequence finishes or the player cancels it.", "cmt"]], [["RegisterNetEvent(", "val"], ["'mechanic:changeTyre'", "str"], [", function(vehicle, wheel)", "val"]], [["  local ok = exports.ds_jobanims:play(", "val"], ["'mechanic.tyre_change'", "str"], [", {", "val"]], [["    entity = vehicle,", "key"]], [["    bone   = ", "key"], ["'wheel_' .. wheel", "str"], [",", "val"]], [["    props  = ", "key"], ["true", "bool"], [",         -- wrench + wheel attach automatically", "cmt"]], [["    cancel = ", "key"], ["'X'", "str"], [",          -- cancel key; steps 4-5 are locked", "cmt"]], [["  })", "val"]], [["  if ok then", "val"]], [["    TriggerServerEvent(", "val"], ["'mechanic:tyreChanged'", "str"], [", NetworkGetNetworkIdFromEntity(vehicle), wheel)", "val"]], [["  end", "val"]], [["end)", "val"]], [["", "val"]], [["-- Sequences available: mechanic.repair, mechanic.inspect, mechanic.tyre_change,", "cmt"]], [["-- medic.treat_load, medic.cpr, police.search_cuff, police.evidence, service.*", "cmt"]]] }) },
  ],

  "gaming-community-ui-bundle": [
    { key: "cover", label: "Discord asset set", alt: "Server icon, role colours, channel icons and banner drawn from one palette", make: () => discordBrand() },
    { key: "gallery-01", label: "Web banners", alt: "Web banners at standard sizes from one artboard", make: () => webBanners() },
    { key: "gallery-02", label: "Overlay elements", alt: "In-game overlay elements: alerts, camera frame, ticker and a hold screen", make: () => overlayElements() },
    { key: "gallery-03", label: "Specification sheet", alt: "Palette, type pairing, clear space and export sizes", make: () => specSheet() },
  ],

  "discord-bot-suite": [
    { key: "cover", label: "Live server status", alt: "The status embed with player count, uptime and queue, refreshed every minute", make: () => discord({ view: "status" }) },
    { key: "gallery-01", label: "Application form", alt: "A whitelist application form opened from the bot", make: () => discord({ view: "apply" }) },
    { key: "gallery-02", label: "Review queue", alt: "The staff review queue with votes and the decision log", make: () => discord({ view: "queue" }) },
    { key: "gallery-03", label: "Ticket with transcript", alt: "A support ticket closed with its transcript saved", make: () => discord({ view: "ticket" }) },
    { key: "gallery-04", label: "Account linking", alt: "Linking a game account so Discord roles follow in-game rank", make: () => discord({ view: "link" }) },
    { key: "gallery-05", label: "Self-hosted", alt: "The Docker compose file that runs the suite on your own infrastructure", make: () => configEditor({ filename: "docker-compose.yml", title: "Discord Bot Suite", activeLine: 4, tree: [["discord-bot-suite", 0, false, true], ["docker-compose.yml", 1, true], [".env.example", 1, false], ["config", 1, false, true], ["roles.yml", 2, false], ["forms.yml", 2, false], ["src", 1, false, true], ["docs", 1, false, true]], lines: [[["services:", "sec"]], [["  bot:", "key"]], [["    build: ", "key"], ["./src", "str"]], [["    restart: ", "key"], ["unless-stopped", "str"], ["   # one process: status, applications, tickets, linking", "cmt"]], [["    env_file: ", "key"], [".env", "str"], ["   # DISCORD_TOKEN, GUILD_ID, GAME_SERVER_HOST", "cmt"]], [["    volumes:", "key"]], [["      - ", "val"], ["./config:/app/config:ro", "str"]], [["      - ", "val"], ["./data:/app/data", "str"], ["   # transcripts and the decision log stay here", "cmt"]], [["    depends_on: ", "key"], ["[db]", "str"]], [["  db:", "key"]], [["    image: ", "key"], ["postgres:16-alpine", "str"]], [["    restart: ", "key"], ["unless-stopped", "str"]], [["    environment:", "key"]], [["      POSTGRES_DB: ", "key"], ["botsuite", "str"]], [["      POSTGRES_PASSWORD_FILE: ", "key"], ["/run/secrets/db_password", "str"]], [["    volumes:", "key"]], [["      - ", "val"], ["dbdata:/var/lib/postgresql/data", "str"]], [["volumes:", "sec"]], [["  dbdata:", "key"]]] }) },
  ],

  /* ---- bundles: rendered last, because they embed the other covers */

  "fivem-server-essentials-bundle": [
    { key: "cover", label: "What's in the bundle", alt: "The four resources in the bundle: vehicle HUD, inventory interface, garage system and admin tooling", make: () => bundleGrid({ title: "Server Essentials Bundle", sub: "Four core resources, pre-configured to work together", cols: 2, tiles: [{ slug: "advanced-vehicle-hud", label: "Vehicle HUD", kind: "UI / HUD" }, { slug: "premium-inventory-interface", label: "Inventory interface", kind: "UI / HUD" }, { slug: "advanced-garage-system", label: "Garage system", kind: "Script" }, { slug: "fivem-anticheat-suite", label: "Admin tooling", kind: "Security" }] }) },
    { key: "gallery-01", label: "Setup guide", alt: "The setup guide that takes a blank server to a playable state in one sitting", make: () => docPage({ kicker: "Server Essentials Bundle", title: "Setup guide", meta: "From a blank server to playable · about 90 minutes · no prior configuration needed", page: "1 / 8", sections: [{ h: "Before you start", list: ["A server with the framework installed and a database reachable from it", "The four resources from this bundle, unpacked into resources/[ds]", "Your server licence key and a Discord webhook for admin alerts (optional)"] }, { h: "1 · Install the shared config", p: ["Copy ds_shared/config.lua to the resources folder and set the framework, currency symbol and default job list. Every resource in the bundle reads this one file, so nothing is configured twice."] }, { h: "2 · Start order", check: [[true, "ds_shared", "core"], [true, "ds_hud", "ui"], [true, "ds_inventory", "ui"], [false, "ds_garage", "script"], [false, "ds_admin", "tooling"]] }, { h: "3 · First launch", p: ["Start the server, join, and press F1. The HUD, inventory and garage bind to the same keys out of the box. If anything is missing, the admin panel's health tab lists the resource and the reason."] }, { h: "4 · Admin tooling", p: ["Assign the admin ace to your own identifier before opening the server. Everything in the admin panel is logged, including your own actions."] }, { h: "Checklist before opening", check: [[true, "Database migrations applied", ""], [true, "Admin ace assigned", ""], [false, "Keybinds reviewed", ""], [false, "Backup of config.lua taken", ""]] }] }) },
    { key: "gallery-02", label: "Combined configuration", alt: "One configuration file shared by the four resources", make: () => configEditor({ filename: "config.lua", title: "Server Essentials Bundle", activeLine: 5, tree: [["resources", 0, false, true], ["[ds]", 1, false, true], ["ds_shared", 2, false, true], ["config.lua", 3, true], ["ds_hud", 2, false, true], ["ds_inventory", 2, false, true], ["ds_garage", 2, false, true], ["ds_admin", 2, false, true], ["SETUP.md", 1, false]], lines: [[["-- One file, read by every resource in the bundle.", "cmt"]], [["Shared = {}", "val"]], [["Shared.Framework = ", "key"], ["'auto'", "str"], ["        -- detects the installed framework", "cmt"]], [["Shared.Currency  = ", "key"], ["'$'", "str"]], [["Shared.Keys = { hud = ", "key"], ["'F7'", "str"], [", inventory = ", "key"], ["'TAB'", "str"], [", garage = ", "key"], ["'E'", "str"], [", admin = ", "key"], ["'F10'", "str"], [" }", "val"]], [["Shared.Jobs = { ", "key"], ["'police', 'ems', 'mechanic', 'taxi', 'unemployed'", "str"], [" }", "val"]], [["", "val"]], [["Shared.Hud       = { units = ", "key"], ["'mph'", "str"], [", showSeatbelt = ", "key"], ["true", "bool"], [" }", "val"]], [["Shared.Inventory = { slots = ", "key"], ["40", "num"], [", maxWeight = ", "key"], ["60.0", "num"], [" }", "val"]], [["Shared.Garage    = { slotsPerPlayer = ", "key"], ["12", "num"], [", impoundFee = ", "key"], ["500", "num"], [" }", "val"]], [["Shared.Admin     = { logWebhook = ", "key"], ["''", "str"], [", requireAce = ", "key"], ["'ds.admin'", "str"], [" }", "val"]], [["", "val"]], [["-- Update stream: bump this together; resources refuse to start on a mismatch.", "cmt"]], [["Shared.BundleVersion = ", "key"], ["'1.4.0'", "str"]]] }) },
  ],

  "complete-fivem-server-package": [
    { key: "cover", label: "What's in the package", alt: "The eleven products in the package: MLOs, vehicle packs, clothing, interfaces, systems, anticheat and loading screen", make: () => bundleGrid({ title: "Complete FiveM Server Package", sub: "Eleven products, pre-configured to work together", cols: 4, tiles: [{ slug: "premium-city-mlo-pack", label: "Core MLO set", kind: "Maps / MLOs" }, { slug: "emergency-vehicle-pack", label: "Emergency vehicles", kind: "Vehicles" }, { slug: "tuner-car-pack", label: "Tuner cars", kind: "Vehicles" }, { slug: "emergency-services-eup-pack", label: "EUP clothing", kind: "Clothing" }, { slug: "civilian-clothing-collection", label: "Civilian clothing", kind: "Clothing" }, { slug: "premium-inventory-interface", label: "Inventory", kind: "UI / HUD" }, { slug: "modern-phone-interface", label: "Phone", kind: "UI / HUD" }, { slug: "advanced-vehicle-hud", label: "Vehicle HUD", kind: "UI / HUD" }, { slug: "banking-system", label: "Banking", kind: "Script" }, { slug: "advanced-garage-system", label: "Garage", kind: "Script" }, { slug: "fivem-anticheat-suite", label: "Anticheat", kind: "Security" }, { slug: "loading-screen-pack", label: "Loading screen", kind: "Graphics" }] }) },
    { key: "gallery-01", label: "Sequenced setup guide", alt: "The setup guide sequencing the whole build from bare server to open doors", make: () => docPage({ kicker: "Complete FiveM Server Package", title: "Build sequence", meta: "Bare server to open doors · eleven products in the order they depend on each other", page: "1 / 14", sections: [{ h: "Day 1 · Foundation", check: [[true, "Framework + database", "core"], [true, "Anticheat suite in notify-only mode", "security"], [true, "Core MLO set streamed and door locks applied", "maps"]] }, { h: "Day 2 · World", check: [[true, "Emergency vehicle pack + tuner pack", "vehicles"], [true, "EUP and civilian clothing, component IDs checked", "clothing"], [false, "Loading screen with your rules and Discord", "graphics"]] }, { h: "Day 3 · Systems", check: [[false, "Inventory, phone and HUD on shared keybinds", "ui"], [false, "Banking, garage and business systems on one config", "scripts"], [false, "Anticheat switched to enforce after a week of logs", "security"]] }, { h: "Why this order", p: ["Vehicles and clothing stream before the systems that reference them, so garages and wardrobes never point at models that are not there yet. Anticheat runs from the first day so its baseline is a normal server, not launch-day chaos."] }, { h: "One update stream", p: ["Every product in the package shares a version number. Updating means replacing the [ds] folder and reading one changelog."] }] }) },
    { key: "gallery-02", label: "Combined configuration", alt: "The combined configuration every product in the package reads", make: () => configEditor({ filename: "config.lua", title: "Complete FiveM Server Package", activeLine: 7, tree: [["resources", 0, false, true], ["[ds]", 1, false, true], ["ds_shared", 2, false, true], ["config.lua", 3, true], ["ds_maps", 2, false, true], ["ds_vehicles", 2, false, true], ["ds_clothing", 2, false, true], ["ds_inventory", 2, false, true], ["ds_phone", 2, false, true], ["ds_hud", 2, false, true], ["ds_banking", 2, false, true], ["ds_garage", 2, false, true], ["ds_business", 2, false, true], ["ds_anticheat", 2, false, true], ["ds_loading", 2, false, true]], lines: [[["-- Combined configuration. Each section is read by one product.", "cmt"]], [["Shared = { Framework = ", "key"], ["'auto'", "str"], [", Currency = ", "key"], ["'$'", "str"], [", BundleVersion = ", "key"], ["'2.1.0'", "str"], [" }", "val"]], [["", "val"]], [["Maps      = { doorLocks = ", "key"], ["true", "bool"], [", helipads = ", "key"], ["{ 'hospital', 'police' }", "str"], [" }", "val"]], [["Vehicles  = { emergencyLiveries = ", "key"], ["'default'", "str"], [", tunerLodDistance = ", "key"], ["120.0", "num"], [" }", "val"]], [["Clothing  = { componentBase = ", "key"], ["600", "num"], [", eupPatches = ", "key"], ["'default'", "str"], [" }", "val"]], [["Interface = { keys = { inventory = ", "key"], ["'TAB'", "str"], [", phone = ", "key"], ["'M'", "str"], [", hud = ", "key"], ["'F7'", "str"], [" } }", "val"]], [["Systems   = { startingBank = ", "key"], ["5000", "num"], [", garageSlots = ", "key"], ["12", "num"], [", payrollMinutes = ", "key"], ["60", "num"], [" }", "val"]], [["Anticheat = { mode = ", "key"], ["'notify'", "str"], [", staffBypassAce = ", "key"], ["'ds.staff'", "str"], [" }", "val"]], [["Loading   = { serverName = ", "key"], ["'Your Server'", "str"], [", discord = ", "key"], ["''", "str"], [", rules = ", "key"], ["'rules.json'", "str"], [" }", "val"]]] }) },
  ],

  "complete-game-server-starter-pack": [
    { key: "cover", label: "What's in the pack", alt: "The server essentials and the community brand set that make up the pack, with its documentation", make: () => bundleGrid({ title: "Complete Game Server Starter Pack", sub: "Server-side essentials · community brand set · staff handbook · rules templates · launch checklist", cols: 2, dark: false, tiles: [{ slug: "minecraft-server-essentials-pack", label: "Server essentials", kind: "Server resources" }, { slug: "gaming-community-ui-bundle", label: "Community brand set", kind: "Graphics" }] }) },
    { key: "gallery-01", label: "Staff handbook", alt: "The staff handbook: roles, escalation, evidence and time off", make: () => docPage({ kicker: "Staff handbook", title: "How staff work here", meta: "Roles · escalation · evidence · time off · v1.2", page: "3 / 18", sections: [{ h: "Roles", table: [["Role", "Can", "Cannot"], ["Helper", "Answer questions, warn", "Kick, ban, edit rules"], ["Moderator", "Kick, temp-ban ≤ 7 days", "Permanent ban alone"], ["Admin", "Permanent ban with a second admin", "Change the rules alone"], ["Owner", "Everything", "Skip the log"]] }, { h: "Escalation", list: ["Warn in text first. Say which rule.", "Second offence in a week: temp-ban, log it, tag a moderator.", "Anything involving a real-world threat goes to an admin immediately."] }, { h: "Evidence", p: ["Every action needs a log entry with a screenshot or clip. If you would not be comfortable showing the evidence to the player, do not take the action."] }, { h: "Time off", p: ["Tell the staff channel and set your status. Nobody is on call; if you are the only staff online and you need to leave, leave."] }] }) },
    { key: "gallery-02", label: "Rules template", alt: "The player rules template, ready to edit", make: () => docPage({ kicker: "Rules template", title: "Server rules", meta: "Edit the bracketed parts. Keep it short: nobody reads page two.", page: "1 / 2", accent: "#e2694f", sections: [{ h: "1 · Respect", p: ["No harassment, slurs or targeting other players out of game. [Add anything specific to your community.]"] }, { h: "2 · Play fair", p: ["No cheats, exploits or third-party tools that change gameplay. Report bugs in [#bug-reports] instead of using them."] }, { h: "3 · Stay in character", p: ["[Roleplay servers only.] Keep out-of-character talk to [#ooc]. Fear for your character's life."] }, { h: "4 · Staff decisions", p: ["Follow staff instructions in the moment; appeal afterwards in [#appeals]. Arguing in game does not change the outcome."] }, { h: "5 · Streaming and recording", p: ["Allowed. [State any restrictions, e.g. no stream sniping.]"] }, { h: "Penalties", table: [["Offence", "First", "Repeat"], ["Rules 1, 2", "Temp-ban 3 days", "Permanent"], ["Rules 3, 4, 5", "Warning", "Temp-ban 1 day"]] }] }) },
    { key: "gallery-03", label: "Launch checklist", alt: "The launch checklist covering the week before opening", make: () => docPage({ kicker: "Launch checklist", title: "The week before opening", meta: "Work top to bottom. Anything unchecked on the day is a reason to wait.", page: "1 / 3", accent: "#2a8f86", sections: [{ h: "T-7 days", check: [[true, "Rules published and pinned", "owner"], [true, "Staff handbook read by every staff member", "staff"], [true, "Backups scheduled and one restore tested", "tech"]] }, { h: "T-3 days", check: [[true, "Discord channels, roles and bot configured", "staff"], [true, "Whitelist / application form live", "staff"], [false, "Brand assets in place: icon, banner, loading screen", "owner"]] }, { h: "T-1 day", check: [[false, "Full restart and a staff-only test session", "all"], [false, "Announcement scheduled with the opening time", "owner"], [false, "Ticket system tested end to end", "staff"]] }, { h: "Opening day", check: [[false, "Two staff online for the first four hours", "staff"], [false, "Status bot confirmed reporting", "tech"], [false, "Notes channel open for issues", "all"]] }] }) },
  ],
}
