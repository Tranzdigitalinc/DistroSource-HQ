// Voxel engine for DistroSource Minecraft product scenes.
//
// A world is a dense grid of block ids. Only faces that touch air (or a
// transparent block) are emitted, grouped per block material, so a large
// build stays light enough to path trace. Every 16×16 texture is drawn here
// in an original pixel style — no game assets are used.
import * as THREE from "three"
import { canvas, rng } from "/scripts/gaming/banners/lib.mjs"

const TEX = 16

function px(seed, draw) {
  const c = canvas(TEX)
  const ctx = c.getContext("2d")
  const r = rng(seed)
  draw(ctx, r)
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

/** Texture recipes. Each returns a CanvasTexture. */
export const TEXTURES = {
  grassTop: () => px(1, (ctx, r) => noiseFill(ctx, r, 98, 42, 38, 12)),
  grassSide: () =>
    px(2, (ctx, r) => {
      noiseFill(ctx, r, 28, 34, 30, 10)
      for (let x = 0; x < TEX; x++) {
        const d = 3 + Math.floor(r() * 3)
        for (let y = 0; y < d; y++) {
          ctx.fillStyle = hsl(98, 42, 36 + (r() - 0.5) * 10)
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }),
  dirt: () => px(3, (ctx, r) => noiseFill(ctx, r, 28, 34, 30, 12)),
  stone: () => px(4, (ctx, r) => noiseFill(ctx, r, 30, 4, 50, 12)),
  cobble: () =>
    px(5, (ctx, r) => {
      noiseFill(ctx, r, 30, 3, 34, 6)
      for (let i = 0; i < 9; i++) {
        const cx = Math.floor(r() * 14), cy = Math.floor(r() * 14), w = 3 + Math.floor(r() * 3), h = 2 + Math.floor(r() * 3)
        ctx.fillStyle = hsl(30, 4, 46 + r() * 16)
        ctx.fillRect(cx, cy, w, h)
      }
    }),
  bricks: () =>
    px(6, (ctx, r) => {
      ctx.fillStyle = hsl(34, 6, 30)
      ctx.fillRect(0, 0, TEX, TEX)
      for (let row = 0; row < 4; row++) {
        const off = row % 2 ? 4 : 0
        for (let col = -1; col < 3; col++) {
          const x = col * 8 + off
          ctx.fillStyle = hsl(34, 6, 52 + (r() - 0.5) * 10)
          ctx.fillRect(x + 1, row * 4 + 1, 7, 3)
          ctx.fillStyle = hsl(34, 6, 60)
          ctx.fillRect(x + 1, row * 4 + 1, 7, 1)
        }
      }
    }),
  planks: () =>
    px(7, (ctx, r) => {
      for (let row = 0; row < 4; row++) {
        const l = 44 + (r() - 0.5) * 8
        for (let y = 0; y < 4; y++) for (let x = 0; x < TEX; x++) {
          ctx.fillStyle = hsl(33, 45, l + (r() - 0.5) * 6 - (y === 3 ? 14 : 0))
          ctx.fillRect(x, row * 4 + y, 1, 1)
        }
        ctx.fillStyle = hsl(33, 45, 28)
        ctx.fillRect(((row * 7) % 12) + 2, row * 4, 1, 3)
      }
    }),
  logSide: () =>
    px(8, (ctx, r) => {
      for (let x = 0; x < TEX; x++) {
        const l = 26 + (x % 3 === 0 ? -6 : 0) + (r() - 0.5) * 6
        for (let y = 0; y < TEX; y++) {
          ctx.fillStyle = hsl(28, 32, l + (r() - 0.5) * 4)
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }),
  logTop: () =>
    px(9, (ctx) => {
      for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
        const d = Math.hypot(x - 7.5, y - 7.5)
        ctx.fillStyle = d > 7 ? hsl(28, 32, 24) : hsl(36, 45, Math.floor(d) % 2 ? 46 : 38)
        ctx.fillRect(x, y, 1, 1)
      }
    }),
  leaves: () =>
    px(10, (ctx, r) => {
      for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
        const hole = r() < 0.12
        ctx.fillStyle = hole ? hsl(110, 40, 14) : hsl(100 + (r() - 0.5) * 16, 45, 26 + r() * 14)
        ctx.fillRect(x, y, 1, 1)
      }
    }),
  path: () =>
    px(11, (ctx, r) => {
      for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
        ctx.fillStyle = r() < 0.2 ? hsl(34, 12, 56) : hsl(35, 30, 38 + (r() - 0.5) * 10)
        ctx.fillRect(x, y, 1, 1)
      }
    }),
  sand: () => px(12, (ctx, r) => noiseFill(ctx, r, 45, 45, 70, 8)),
  water: () => px(13, (ctx, r) => noiseFill(ctx, r, 205, 60, 42, 10)),
  lantern: () =>
    px(14, (ctx) => {
      ctx.fillStyle = "#2a2a2e"
      ctx.fillRect(0, 0, TEX, TEX)
      ctx.fillStyle = "#ffd27a"
      ctx.fillRect(3, 3, 10, 10)
      ctx.fillStyle = "#fff3cf"
      ctx.fillRect(6, 6, 4, 4)
    }),
  portal: () =>
    px(15, (ctx, r) => {
      for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
        const v = Math.sin((x + y * 0.6) * 0.9) * 0.5 + 0.5
        ctx.fillStyle = hsl(275 + v * 20, 80, 38 + v * 28 + (r() - 0.5) * 6)
        ctx.fillRect(x, y, 1, 1)
      }
    }),
  quartz: () => px(16, (ctx, r) => noiseFill(ctx, r, 40, 10, 88, 4)),
  portalCyan: () =>
    px(24, (ctx, r) => {
      for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
        const v = Math.sin((x + y * 0.6) * 0.9) * 0.5 + 0.5
        ctx.fillStyle = hsl(186 + v * 12, 85, 40 + v * 26 + (r() - 0.5) * 6)
        ctx.fillRect(x, y, 1, 1)
      }
    }),
  portalOrange: () =>
    px(25, (ctx, r) => {
      for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
        const v = Math.sin((x + y * 0.6) * 0.9) * 0.5 + 0.5
        ctx.fillStyle = hsl(22 + v * 12, 92, 44 + v * 22 + (r() - 0.5) * 6)
        ctx.fillRect(x, y, 1, 1)
      }
    }),
  portalGreen: () =>
    px(26, (ctx, r) => {
      for (let y = 0; y < TEX; y++) for (let x = 0; x < TEX; x++) {
        const v = Math.sin((x + y * 0.6) * 0.9) * 0.5 + 0.5
        ctx.fillStyle = hsl(132 + v * 14, 70, 36 + v * 24 + (r() - 0.5) * 6)
        ctx.fillRect(x, y, 1, 1)
      }
    }),
  darkPlanks: () =>
    px(17, (ctx, r) => {
      for (let row = 0; row < 4; row++) for (let y = 0; y < 4; y++) for (let x = 0; x < TEX; x++) {
        ctx.fillStyle = hsl(24, 35, 22 + (r() - 0.5) * 5 - (y === 3 ? 7 : 0))
        ctx.fillRect(x, row * 4 + y, 1, 1)
      }
    }),
  concrete: () => px(18, (ctx, r) => noiseFill(ctx, r, 210, 8, 82, 3)),
  concreteDark: () => px(19, (ctx, r) => noiseFill(ctx, r, 215, 14, 22, 3)),
  glass: () =>
    px(20, (ctx) => {
      ctx.fillStyle = "#cfe8f0"
      ctx.fillRect(0, 0, TEX, TEX)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, TEX, 1)
      ctx.fillRect(0, 0, 1, TEX)
    }),
  glow: () => px(21, (ctx) => {
    ctx.fillStyle = "#8fefff"
    ctx.fillRect(0, 0, TEX, TEX)
  }),
  cyan: () => px(22, (ctx, r) => noiseFill(ctx, r, 186, 70, 48, 6)),
  orange: () => px(23, (ctx, r) => noiseFill(ctx, r, 24, 85, 52, 6)),
}

/**
 * Block definitions: textures per face ("top" | "side" | "bottom") plus
 * material flags. `emissive` makes a block a light source.
 */
export const BLOCKS = {
  grass: { top: "grassTop", side: "grassSide", bottom: "dirt" },
  dirt: { all: "dirt" },
  stone: { all: "stone" },
  cobble: { all: "cobble" },
  bricks: { all: "bricks" },
  planks: { all: "planks" },
  darkPlanks: { all: "darkPlanks" },
  log: { top: "logTop", side: "logSide", bottom: "logTop" },
  leaves: { all: "leaves", rough: 0.7 },
  path: { all: "path" },
  sand: { all: "sand" },
  water: { all: "water", water: true },
  lantern: { all: "lantern", emissive: 6 },
  portal: { all: "portal", emissive: 1.5, thin: true },
  portalCyan: { all: "portalCyan", emissive: 1.5 },
  portalOrange: { all: "portalOrange", emissive: 1.5 },
  portalGreen: { all: "portalGreen", emissive: 1.5 },
  quartz: { all: "quartz", rough: 0.45 },
  concrete: { all: "concrete", rough: 0.6 },
  concreteDark: { all: "concreteDark", rough: 0.55 },
  glass: { all: "glass", glass: true },
  glow: { all: "glow", emissive: 4 },
  cyan: { all: "cyan", rough: 0.5 },
  orange: { all: "orange", rough: 0.5 },
}

const TRANSPARENT = new Set(["water", "glass", "leaves", "portal", "portalCyan", "portalOrange", "portalGreen"])

export class World {
  constructor(w, h, d) {
    this.w = w
    this.h = h
    this.d = d
    this.ids = []
    this.map = new Map()
    this.cells = new Uint8Array(w * h * d)
  }
  id(name) {
    if (!this.map.has(name)) {
      this.ids.push(name)
      this.map.set(name, this.ids.length)
    }
    return this.map.get(name)
  }
  set(x, y, z, name) {
    if (x < 0 || y < 0 || z < 0 || x >= this.w || y >= this.h || z >= this.d) return
    this.cells[(y * this.d + z) * this.w + x] = name ? this.id(name) : 0
  }
  get(x, y, z) {
    if (x < 0 || y < 0 || z < 0 || x >= this.w || y >= this.h || z >= this.d) return null
    const v = this.cells[(y * this.d + z) * this.w + x]
    return v ? this.ids[v - 1] : null
  }
  fill(x0, y0, z0, x1, y1, z1, name) {
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
      for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
        for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.set(x, y, z, name)
  }
  /** Hollow box: walls only. */
  shell(x0, y0, z0, x1, y1, z1, name) {
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++)
        for (let x = x0; x <= x1; x++) if (x === x0 || x === x1 || z === z0 || z === z1) this.set(x, y, z, name)
  }
  /** Heightmap: fill every column from 0 up to the top block. */
  column(x, z, top, surface = "grass", under = "dirt", core = "stone") {
    for (let y = 0; y <= top; y++) this.set(x, y, z, y === top ? surface : y > top - 3 ? under : core)
  }

  /** Build meshes, one per (texture) material. The world's origin is centred on x/z. */
  toGroup() {
    const buckets = new Map()
    const push = (texKey, block, verts, uvs, normal) => {
      const key = `${block}|${texKey}`
      if (!buckets.has(key)) buckets.set(key, { block, texKey, pos: [], uv: [], nrm: [], idx: [] })
      const b = buckets.get(key)
      const base = b.pos.length / 3
      b.pos.push(...verts)
      b.uv.push(...uvs)
      for (let i = 0; i < 4; i++) b.nrm.push(...normal)
      b.idx.push(base, base + 1, base + 2, base, base + 2, base + 3)
    }
    const faces = [
      { n: [1, 0, 0], kind: "side", c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] },
      { n: [-1, 0, 0], kind: "side", c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] },
      { n: [0, 1, 0], kind: "top", c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
      { n: [0, -1, 0], kind: "bottom", c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
      { n: [0, 0, 1], kind: "side", c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
      { n: [0, 0, -1], kind: "side", c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] },
    ]
    const UV = [0, 0, 1, 0, 1, 1, 0, 1]
    const ox = -this.w / 2, oz = -this.d / 2
    for (let y = 0; y < this.h; y++)
      for (let z = 0; z < this.d; z++)
        for (let x = 0; x < this.w; x++) {
          const b = this.get(x, y, z)
          if (!b) continue
          const def = BLOCKS[b]
          for (const f of faces) {
            const nb = this.get(x + f.n[0], y + f.n[1], z + f.n[2])
            if (nb && (nb === b || !TRANSPARENT.has(nb))) continue
            // `solidEdges` treats ground beyond the world's sides as solid, so a
            // landscape scene never shows its cut-away cross-section.
            if (this.solidEdges && f.n[1] !== 1) {
              const nx = x + f.n[0], ny = y + f.n[1], nz = z + f.n[2]
              if (nx < 0 || nz < 0 || nx >= this.w || nz >= this.d || ny < 0) continue
            }
            if (b === "water" && f.n[1] !== 1 && nb) continue
            const tex = def.all ?? def[f.kind] ?? def.side
            const top = b === "water" && f.n[1] === 1 ? 0.88 : 1
            const verts = f.c.flatMap(([cx, cy, cz]) => [x + cx + ox, y + (cy === 1 ? top : 0), z + cz + oz])
            push(tex, b, verts, UV, f.n)
          }
        }
    const texCache = new Map()
    const group = new THREE.Group()
    for (const b of buckets.values()) {
      const def = BLOCKS[b.block]
      if (!texCache.has(b.texKey)) texCache.set(b.texKey, TEXTURES[b.texKey]())
      const map = texCache.get(b.texKey)
      let mat
      if (def.water) mat = new THREE.MeshPhysicalMaterial({ color: 0x5b9be0, map, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04 })
      else if (def.glass) mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map, roughness: 0.02, transmission: 0.9, ior: 1.5, thickness: 0.1 })
      else if (def.emissive) mat = new THREE.MeshPhysicalMaterial({ map, emissiveMap: map, emissive: 0xffffff, emissiveIntensity: def.emissive, roughness: 0.6 })
      else mat = new THREE.MeshPhysicalMaterial({ map, roughness: def.rough ?? 0.88 })
      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.Float32BufferAttribute(b.pos, 3))
      geo.setAttribute("normal", new THREE.Float32BufferAttribute(b.nrm, 3))
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2))
      geo.setIndex(b.idx)
      group.add(new THREE.Mesh(geo, mat))
    }
    return group
  }
}

/** A round oak tree with a log trunk and a leafy crown. */
export function tree(world, x, y, z, height = 5, seed = 1) {
  const r = rng(seed)
  for (let i = 0; i < height; i++) world.set(x, y + i, z, "log")
  const top = y + height
  for (let dy = -2; dy <= 1; dy++) {
    const rad = dy === 1 ? 1 : dy === -2 ? 2 : 2.4
    for (let dz = -3; dz <= 3; dz++)
      for (let dx = -3; dx <= 3; dx++) {
        if (Math.hypot(dx, dz) > rad) continue
        if (world.get(x + dx, top + dy, z + dz)) continue
        if (r() < 0.08 && Math.hypot(dx, dz) > rad - 1) continue
        world.set(x + dx, top + dy, z + dz, "leaves")
      }
  }
}
