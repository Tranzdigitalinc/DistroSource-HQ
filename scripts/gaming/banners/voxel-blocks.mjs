// Additional original block textures for the Minecraft product scenes.
// Importing this module registers them with voxel.mjs's TEXTURES and BLOCKS.
// Same rules as voxel.mjs: 16×16, drawn here in an original pixel style.
import * as THREE from "three"
import { canvas, rng } from "/scripts/gaming/banners/lib.mjs"
import { TEXTURES, BLOCKS } from "/scripts/gaming/banners/voxel.mjs"

const TEX = 16
function px(seed, draw) {
  const c = canvas(TEX)
  const ctx = c.getContext("2d")
  draw(ctx, rng(seed))
  const t = new THREE.CanvasTexture(c)
  t.magFilter = THREE.NearestFilter
  t.minFilter = THREE.NearestFilter
  t.generateMipmaps = false
  t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}
const hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`
function noiseFill(ctx, r, h, s, l, spread) {
  for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
    ctx.fillStyle = hsl(h + (r() - 0.5) * 6, s, l + (r() - 0.5) * spread)
    ctx.fillRect(x, y, 1, 1)
  }
}
const ore = (seed, color) => () =>
  px(seed, (ctx, r) => {
    noiseFill(ctx, r, 30, 4, 50, 12)
    for (let i = 0; i < 5; i++) {
      const x = 1 + Math.floor(r() * 12), y = 1 + Math.floor(r() * 12)
      ctx.fillStyle = color
      ctx.fillRect(x, y, 2, 2)
      ctx.fillRect(x + 1, y + 1, 2, 1)
    }
  })
const solid = (seed, h, s, l) => () => px(seed, (ctx, r) => noiseFill(ctx, r, h, s, l, 5))

/** Recipes, also used by the resource-pack texture sheet. */
export const EXTRA_TEXTURES = {
  snow: () => px(30, (ctx, r) => noiseFill(ctx, r, 205, 30, 93, 5)),
  snowSide: () =>
    px(31, (ctx, r) => {
      noiseFill(ctx, r, 28, 34, 30, 10)
      for (let x = 0; x < TEX; x++) {
        const d = 3 + Math.floor(r() * 2)
        for (let y = 0; y < d; y++) {
          ctx.fillStyle = hsl(205, 30, 92 + (r() - 0.5) * 6)
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }),
  netherrack: () =>
    px(32, (ctx, r) => {
      noiseFill(ctx, r, 356, 45, 27, 12)
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = hsl(350, 40, 16)
        ctx.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 2, 1)
      }
    }),
  lumen: () =>
    px(33, (ctx, r) => {
      for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
        ctx.fillStyle = hsl(40, 92, 56 + (r() - 0.5) * 30)
        ctx.fillRect(x, y, 1, 1)
      }
    }),
  sandstone: () =>
    px(34, (ctx, r) => {
      for (let y = 0; y < TEX; y++) {
        const band = y < 3 ? 76 : y > 12 ? 60 : 69
        for (let x = 0; x < TEX; x++) {
          ctx.fillStyle = hsl(44, 42, band + (r() - 0.5) * 5)
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }),
  cactus: () =>
    px(35, (ctx, r) => {
      noiseFill(ctx, r, 118, 45, 31, 8)
      ctx.fillStyle = hsl(118, 40, 19)
      for (const x of [2, 7, 12]) ctx.fillRect(x, 0, 1, TEX)
      ctx.fillStyle = "#ece6c4"
      for (let i = 0; i < 9; i++) ctx.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 1, 1)
    }),
  chest: () =>
    px(36, (ctx, r) => {
      for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
        const edge = x === 0 || y === 0 || x === 15 || y === 15
        ctx.fillStyle = edge ? hsl(28, 40, 17) : hsl(32, 50, 40 + (r() - 0.5) * 8 - (y % 4 === 3 ? 6 : 0))
        ctx.fillRect(x, y, 1, 1)
      }
      ctx.fillStyle = hsl(28, 40, 17)
      ctx.fillRect(1, 6, 14, 1)
      ctx.fillStyle = "#cfd2d6"
      ctx.fillRect(7, 5, 2, 4)
    }),
  teamRed: solid(40, 356, 70, 46),
  teamBlue: solid(41, 214, 70, 48),
  teamGreen: solid(42, 130, 55, 40),
  teamYellow: solid(43, 46, 88, 52),
  ironBars: () =>
    px(44, (ctx) => {
      ctx.fillStyle = "#16181b"
      ctx.fillRect(0, 0, TEX, TEX)
      ctx.fillStyle = "#858b93"
      for (const x of [1, 5, 9, 13]) ctx.fillRect(x, 0, 2, TEX)
      ctx.fillRect(0, 1, TEX, 1)
      ctx.fillRect(0, 14, TEX, 1)
    }),
  oreCoal: ore(45, "#1c1d20"),
  oreIron: ore(46, "#d9b39a"),
  oreGold: ore(47, "#f2cc3b"),
  oreGem: ore(48, "#4fe0d4"),
  gravel: () =>
    px(49, (ctx, r) => {
      noiseFill(ctx, r, 30, 5, 44, 10)
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = hsl(30, 6, 30 + r() * 40)
        ctx.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 2, 2)
      }
    }),
  flowerBed: () =>
    px(50, (ctx, r) => {
      noiseFill(ctx, r, 98, 42, 36, 12)
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = ["#f2d14b", "#e5573f", "#f4f1ea", "#b574e8"][i % 4]
        ctx.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1)
      }
    }),
  stoneBricks: () =>
    px(51, (ctx, r) => {
      noiseFill(ctx, r, 30, 3, 42, 6)
      ctx.fillStyle = hsl(30, 3, 30)
      for (const y of [0, 8]) ctx.fillRect(0, y, TEX, 1)
      ctx.fillRect(0, 0, 1, 8)
      ctx.fillRect(8, 8, 1, 8)
      ctx.fillStyle = hsl(30, 3, 54)
      for (const y of [1, 9]) ctx.fillRect(1, y, 15, 1)
    }),

  /* Resource Pack Studio "Hearthside" set: warmer palette, crisper outlines. */
  rpPlanks: () =>
    px(60, (ctx, r) => {
      for (let x = 0; x < TEX; x++) {
        const board = Math.floor(x / 4)
        for (let y = 0; y < TEX; y++) {
          const l = 52 + board * 2 + (r() - 0.5) * 6 - (x % 4 === 3 ? 16 : 0)
          ctx.fillStyle = hsl(34, 62, l)
          ctx.fillRect(x, y, 1, 1)
        }
      }
      ctx.fillStyle = hsl(30, 40, 26)
      for (const [x, y] of [[1, 2], [5, 12], [9, 3], [13, 10]]) ctx.fillRect(x, y, 1, 1)
    }),
  rpBricks: () =>
    px(61, (ctx, r) => {
      ctx.fillStyle = hsl(30, 20, 72)
      ctx.fillRect(0, 0, TEX, TEX)
      for (let row = 0; row < 5; row++) {
        const off = row % 2 ? 3 : 0
        for (let col = -1; col < 4; col++) {
          ctx.fillStyle = hsl(12 + (r() - 0.5) * 8, 58, 44 + (r() - 0.5) * 10)
          ctx.fillRect(col * 6 + off + 1, row * 3 + 1, 5, 2)
        }
      }
    }),
  rpRoof: () =>
    px(62, (ctx, r) => {
      for (let row = 0; row < 4; row++) {
        const off = row % 2 ? 2 : 0
        for (let y = 0; y < 4; y++) for (let x = 0; x < TEX; x++) {
          const seam = (x + off) % 4 === 0 || y === 3
          ctx.fillStyle = seam ? hsl(215, 18, 20) : hsl(212, 20, 38 + (r() - 0.5) * 8 + (y === 0 ? 8 : 0))
          ctx.fillRect(x, row * 4 + y, 1, 1)
        }
      }
    }),
  rpPath: () =>
    px(63, (ctx, r) => {
      ctx.fillStyle = hsl(90, 25, 26)
      ctx.fillRect(0, 0, TEX, TEX)
      for (const [x, y, w, h] of [[1, 1, 6, 5], [8, 1, 7, 4], [1, 7, 4, 8], [6, 6, 5, 5], [12, 6, 3, 6], [6, 12, 9, 3]]) {
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
          ctx.fillStyle = hsl(38, 14, 58 + (r() - 0.5) * 10)
          ctx.fillRect(x + i, y + j, 1, 1)
        }
      }
    }),
  rpWhitewash: () =>
    px(64, (ctx, r) => {
      noiseFill(ctx, r, 42, 35, 86, 5)
      ctx.fillStyle = hsl(26, 40, 24)
      ctx.fillRect(0, 0, TEX, 2)
      ctx.fillRect(0, 14, TEX, 2)
      ctx.fillRect(0, 0, 2, TEX)
      ctx.fillRect(14, 0, 2, TEX)
      for (let i = 0; i < 12; i++) ctx.fillRect(2 + i, 2 + i, 1, 1)
    }),
  rpLeaves: () =>
    px(65, (ctx, r) => {
      for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
        const hole = r() < 0.1
        ctx.fillStyle = hole ? hsl(20, 40, 16) : hsl(18 + r() * 26, 70, 36 + r() * 16)
        ctx.fillRect(x, y, 1, 1)
      }
    }),
  rpLog: () =>
    px(66, (ctx, r) => {
      noiseFill(ctx, r, 40, 12, 84, 5)
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = hsl(30, 10, 22)
        ctx.fillRect(Math.floor(r() * 14), Math.floor(r() * 16), 2 + Math.floor(r() * 2), 1)
      }
    }),
  rpWindow: () =>
    px(67, (ctx) => {
      ctx.fillStyle = "#ffcf7a"
      ctx.fillRect(0, 0, TEX, TEX)
      ctx.fillStyle = "#ffe7b8"
      ctx.fillRect(2, 2, 5, 5)
      ctx.fillRect(9, 9, 5, 5)
      ctx.fillStyle = "#3a2a1c"
      ctx.fillRect(0, 0, TEX, 1)
      ctx.fillRect(0, 15, TEX, 1)
      ctx.fillRect(0, 0, 1, TEX)
      ctx.fillRect(15, 0, 1, TEX)
      ctx.fillRect(7, 0, 2, TEX)
      ctx.fillRect(0, 7, TEX, 2)
    }),
}

Object.assign(TEXTURES, EXTRA_TEXTURES)
Object.assign(BLOCKS, {
  snow: { top: "snow", side: "snowSide", bottom: "dirt" },
  snowBlock: { all: "snow" },
  netherrack: { all: "netherrack" },
  lumen: { all: "lumen", emissive: 3 },
  sandstone: { all: "sandstone" },
  cactus: { all: "cactus", rough: 0.6 },
  chest: { all: "chest", rough: 0.6 },
  teamRed: { all: "teamRed", rough: 0.55 },
  teamBlue: { all: "teamBlue", rough: 0.55 },
  teamGreen: { all: "teamGreen", rough: 0.55 },
  teamYellow: { all: "teamYellow", rough: 0.55 },
  ironBars: { all: "ironBars", rough: 0.4 },
  oreCoal: { all: "oreCoal" },
  oreIron: { all: "oreIron" },
  oreGold: { all: "oreGold" },
  oreGem: { all: "oreGem", rough: 0.5 },
  gravel: { all: "gravel" },
  flowerBed: { top: "flowerBed", side: "grassSide", bottom: "dirt" },
  stoneBricks: { all: "stoneBricks" },
  rpPlanks: { all: "rpPlanks" },
  rpBricks: { all: "rpBricks" },
  rpRoof: { all: "rpRoof", rough: 0.7 },
  rpPath: { top: "rpPath", side: "dirt", bottom: "dirt" },
  rpWhitewash: { all: "rpWhitewash" },
  rpLeaves: { all: "rpLeaves", rough: 0.7 },
  rpLog: { top: "logTop", side: "rpLog", bottom: "logTop" },
  rpWindow: { all: "rpWindow", emissive: 1.4 },
})

/** A floating island: a domed top surface over a tapering rocky underside. */
export function island(world, lib, { cx, cy, cz, r, top = "grass", sub = "dirt", core = "stone", seed = 1 }) {
  const rand = rng(seed)
  const cells = []
  for (let dz = -r - 2; dz <= r + 2; dz++)
    for (let dx = -r - 2; dx <= r + 2; dx++) {
      const d = Math.hypot(dx, dz)
      const wobble = (lib.fbm((cx + dx + 64) / 128, (cz + dz + 64) / 128, { base: 6, seed }) - 0.5) * 3
      const edge = r - d + wobble
      if (edge < 0) continue
      const depth = Math.max(1, Math.round(edge * 1.2 + rand() * 2.2))
      for (let k = 0; k < depth; k++) world.set(cx + dx, cy - k, cz + dz, k === 0 ? top : k < 3 ? sub : core)
      cells.push([cx + dx, cz + dz])
    }
  return cells
}
