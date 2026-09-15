// Game-ready 3D asset kits for catalogue batch 3. Every piece is modelled
// here from primitives; each mesh carries one material (the path tracer
// used for the product renders mis-assigns multi-material meshes).
// Units: metres, Y up. Exported to GLB and OBJ by export.html.
import * as THREE from "three"
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js"

const TAU = Math.PI * 2
function rng(seed) {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const mat = (name, color, { rough = 0.6, metal = 0, emissive = 0x000000, ei = 0 } = {}) => {
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive, emissiveIntensity: ei })
  m.name = name
  return m
}
const faceted = (geo) => {
  const g = geo.index ? geo.toNonIndexed() : geo
  g.computeVertexNormals()
  return g
}
function add(g, geo, m, x = 0, y = 0, z = 0, r = [0, 0, 0], s = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geo, m)
  mesh.position.set(x, y, z)
  mesh.rotation.set(r[0], r[1], r[2])
  mesh.scale.set(s[0], s[1], s[2])
  g.add(mesh)
  return mesh
}
/** Box whose bottom sits at y. */
const box = (g, m, w, h, d, x = 0, y = 0, z = 0, { r = 0, ry = 0, rx = 0 } = {}) =>
  add(g, r ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z, [rx, ry, 0])
const cyl = (g, m, rt, rb, h, x = 0, y = 0, z = 0, { seg = 20, r = [0, 0, 0], open = false } = {}) =>
  add(g, new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), m, x, y + h / 2, z, r)
/** Deterministic jitter so duplicate vertices of a faceted mesh move together. */
function jitter(geo, amount, seed) {
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed) * 43758.5453
    const n = (h - Math.floor(h) - 0.5) * 2
    const len = Math.hypot(x, y, z) || 1
    p.setXYZ(i, x + (x / len) * n * amount, y + (y / len) * n * amount * 0.7, z + (z / len) * n * amount)
  }
  geo.computeVertexNormals()
  return geo
}

/* ------------------------------------------------------------------ */
/* Modular sci-fi corridor kit — 4 m grid                               */
/* ------------------------------------------------------------------ */

function scifi() {
  const M = {
    panel: mat("Panel", 0x737c88, { rough: 0.42, metal: 0.55 }),
    dark: mat("Frame", 0x23272e, { rough: 0.5, metal: 0.45 }),
    mid: mat("Trim", 0x3b424c, { rough: 0.48, metal: 0.5 }),
    accent: mat("Hazard", 0xe8a33d, { rough: 0.5 }),
    glow: mat("LightStrip", 0x0b1a1f, { emissive: 0x7fe7ff, ei: 7 }),
    warm: mat("LightWarm", 0x1f140a, { emissive: 0xffb35c, ei: 5 }),
    screen: mat("Screen", 0x061018, { emissive: 0x3cc8ff, ei: 2.6 }),
    glass: new THREE.MeshPhysicalMaterial({ name: "Glass", color: 0xa8d8ff, roughness: 0.05, transmission: 0.85, thickness: 0.02 }),
  }
  const P = {}
  P.Floor_4x4 = () => {
    const g = new THREE.Group()
    box(g, M.dark, 4, 0.14, 4)
    for (const x of [-0.975, 0.975]) for (const z of [-0.975, 0.975]) box(g, M.mid, 1.9, 0.04, 1.9, x, 0.14, z, { r: 0.01 })
    box(g, M.glow, 0.04, 0.012, 3.9, 0, 0.14, 0)
    for (const z of [-1.6, -0.4, 0.4, 1.6]) box(g, M.accent, 0.3, 0.012, 0.08, 1.6, 0.18, z)
    return g
  }
  const wallBase = (g) => {
    box(g, M.dark, 4, 4, 0.25, 0, 0, -0.125)
    box(g, M.mid, 4, 0.3, 0.12, 0, 0, 0.06)
    box(g, M.mid, 4, 0.18, 0.1, 0, 3.82, 0.05)
    box(g, M.glow, 3.8, 0.05, 0.05, 0, 0.32, 0.1)
  }
  P.Wall_4x4 = () => {
    const g = new THREE.Group()
    wallBase(g)
    for (const x of [-1, 1]) for (const [y, h] of [[0.45, 1.5], [2.05, 1.65]]) box(g, M.panel, 1.86, h, 0.06, x, y, 0.03, { r: 0.012 })
    for (const x of [-1.96, 0, 1.96]) box(g, M.mid, 0.1, 3.4, 0.1, x, 0.35, 0.05)
    box(g, M.accent, 0.5, 0.1, 0.02, -1, 1.2, 0.07)
    return g
  }
  P.Wall_Window = () => {
    const g = new THREE.Group()
    wallBase(g)
    box(g, M.panel, 3.8, 1.1, 0.06, 0, 0.45, 0.03, { r: 0.012 })
    box(g, M.panel, 3.8, 0.85, 0.06, 0, 2.95, 0.03, { r: 0.012 })
    for (const x of [-1.85, 1.85]) box(g, M.mid, 0.2, 1.5, 0.14, x, 1.55, 0.07)
    box(g, M.mid, 3.9, 0.12, 0.16, 0, 1.5, 0.08)
    box(g, M.mid, 3.9, 0.12, 0.16, 0, 2.9, 0.08)
    box(g, M.glass, 3.5, 1.3, 0.02, 0, 1.6, 0.02)
    return g
  }
  P.Doorway = () => {
    const g = new THREE.Group()
    for (const x of [-1.6, 1.6]) box(g, M.dark, 0.8, 4, 0.5, x, 0, 0)
    box(g, M.dark, 4, 0.8, 0.5, 0, 3.2, 0)
    box(g, M.mid, 2.5, 0.12, 0.54, 0, 3.08, 0)
    for (const [x, s] of [[-0.61, 1], [0.61, -1]]) {
      box(g, M.panel, 1.2, 3.05, 0.14, x, 0, 0, { r: 0.015 })
      for (let i = 0; i < 4; i++) box(g, M.accent, 0.16, 0.5, 0.02, x + s * 0.48 - s * i * 0.02, 0.4 + i * 0.62, 0.08, { rx: 0 })
    }
    box(g, M.warm, 0.5, 0.08, 0.06, 0, 3.4, 0.26)
    return g
  }
  P.Ceiling_Light = () => {
    const g = new THREE.Group()
    box(g, M.mid, 4, 0.14, 4)
    box(g, M.dark, 2.8, 0.06, 0.8, 0, -0.06, 0)
    box(g, M.glow, 2.6, 0.02, 0.6, 0, -0.08, 0)
    return g
  }
  P.Pillar_Corner = () => {
    const g = new THREE.Group()
    box(g, M.mid, 0.7, 0.3, 0.7)
    box(g, M.panel, 0.55, 3.4, 0.55, 0, 0.3, 0, { r: 0.02 })
    box(g, M.mid, 0.7, 0.3, 0.7, 0, 3.7, 0)
    for (const x of [-0.18, 0.18]) cyl(g, M.dark, 0.06, 0.06, 3.4, x, 0.3, 0.33, { seg: 12 })
    box(g, M.glow, 0.04, 2.6, 0.04, 0.29, 0.7, 0.29)
    return g
  }
  P.Crate_Large = () => {
    const g = new THREE.Group()
    box(g, M.panel, 1.2, 1.2, 1.2, 0, 0, 0, { r: 0.03 })
    for (const [x, z] of [[-0.58, -0.58], [0.58, -0.58], [-0.58, 0.58], [0.58, 0.58]]) box(g, M.dark, 0.08, 1.22, 0.08, x, -0.01, z)
    box(g, M.accent, 1.22, 0.12, 1.22, 0, 0.8, 0)
    return g
  }
  P.Crate_Small = () => {
    const g = new THREE.Group()
    box(g, M.mid, 0.7, 0.55, 0.7, 0, 0, 0, { r: 0.025 })
    box(g, M.dark, 0.72, 0.08, 0.72, 0, 0.47, 0)
    box(g, M.glow, 0.2, 0.03, 0.02, 0, 0.3, 0.36)
    return g
  }
  P.Console = () => {
    const g = new THREE.Group()
    box(g, M.dark, 1.4, 0.95, 0.6, 0, 0, 0, { r: 0.02 })
    const top = box(g, M.mid, 1.44, 0.08, 0.7, 0, 0.95, 0.05, { rx: -0.45 })
    top.position.y = 1.02
    const scr = box(g, M.screen, 1.2, 0.01, 0.5, 0, 1.06, 0.06, { rx: -0.45 })
    scr.position.y = 1.075
    for (let i = 0; i < 5; i++) box(g, i % 2 ? M.accent : M.glow, 0.08, 0.03, 0.05, -0.4 + i * 0.2, 0.84, 0.31)
    return g
  }
  P.Pipe_Run = () => {
    const g = new THREE.Group()
    // Horizontal pipes are placed by their centre line (cyl() offsets by half
    // the length, which only suits upright cylinders).
    for (const [y, r] of [[0.3, 0.12], [0.62, 0.09], [0.88, 0.07]]) add(g, new THREE.CylinderGeometry(r, r, 4, 16), M.mid, 0, y, 0, [0, 0, Math.PI / 2])
    for (const x of [-1.4, 1.4]) box(g, M.dark, 0.14, 1.1, 0.3, x, 0, 0)
    return g
  }
  P.Vent = () => {
    const g = new THREE.Group()
    box(g, M.dark, 1.2, 0.8, 0.1)
    for (let i = 0; i < 6; i++) box(g, M.panel, 1.08, 0.06, 0.06, 0, 0.08 + i * 0.11, 0.05, { rx: 0.5 })
    return g
  }
  return P
}

/* ------------------------------------------------------------------ */
/* Low-poly nature kit                                                  */
/* ------------------------------------------------------------------ */

function nature() {
  const M = {
    pine: mat("PineNeedles", 0x2f6b3a, { rough: 0.85 }),
    leaf: mat("Leaves", 0x5fa343, { rough: 0.85 }),
    leaf2: mat("LeavesAutumn", 0xd9922e, { rough: 0.85 }),
    bark: mat("Bark", 0x6b4a2f, { rough: 0.9 }),
    wood: mat("CutWood", 0xc9a26b, { rough: 0.8 }),
    rock: mat("Rock", 0x8a8f96, { rough: 0.9 }),
    rockDark: mat("RockDark", 0x60656c, { rough: 0.9 }),
    grass: mat("Grass", 0x6fae3f, { rough: 0.9 }),
    cap: mat("MushroomCap", 0xd9483b, { rough: 0.6 }),
    stem: mat("MushroomStem", 0xf1e6cf, { rough: 0.7 }),
    petal: mat("Petals", 0xf2c1d8, { rough: 0.6 }),
    yellow: mat("FlowerCentre", 0xf2c330, { rough: 0.6 }),
  }
  const P = {}
  const pine = (seed, h) => () => {
    const r = rng(seed), g = new THREE.Group()
    cyl(g, M.bark, 0.1, 0.15, h * 0.3, 0, 0, 0, { seg: 6 })
    const tiers = 4
    for (let k = 0; k < tiers; k++) {
      const rad = (1.05 - k * 0.22) * (h / 4), ht = (h / 4) * 1.05
      add(g, faceted(new THREE.ConeGeometry(rad, ht, 7)), M.pine, (r() - 0.5) * 0.06, h * 0.25 + k * h * 0.17 + ht / 2, (r() - 0.5) * 0.06, [0, r() * TAU, 0])
    }
    return g
  }
  P.Pine_A = pine(1, 4)
  P.Pine_B = pine(2, 5.5)
  P.Pine_C = pine(3, 3)
  const round = (seed, h, m) => () => {
    const r = rng(seed), g = new THREE.Group()
    cyl(g, M.bark, 0.12, 0.18, h * 0.45, 0, 0, 0, { seg: 6 })
    for (const [dx, dy, dz, s] of [[0, h * 0.62, 0, h * 0.28], [h * 0.14, h * 0.5, h * 0.06, h * 0.2], [-h * 0.12, h * 0.52, -h * 0.08, h * 0.19]]) {
      add(g, jitter(faceted(new THREE.IcosahedronGeometry(s, 0)), s * 0.12, seed), m, dx, dy, dz, [r(), r(), r()])
    }
    return g
  }
  P.Tree_Round_A = round(4, 4.2, M.leaf)
  P.Tree_Round_B = round(5, 3.4, M.leaf2)
  const bush = (seed, s) => () => {
    const r = rng(seed), g = new THREE.Group()
    for (let k = 0; k < 4; k++) add(g, jitter(faceted(new THREE.IcosahedronGeometry(s * (0.6 + r() * 0.4), 0)), s * 0.1, seed + k), M.leaf, (r() - 0.5) * s * 1.2, s * 0.45, (r() - 0.5) * s * 1.2, [r(), r(), r()])
    return g
  }
  P.Bush_A = bush(6, 0.6)
  P.Bush_B = bush(7, 0.9)
  const rock = (seed, s, m, sx = 1, sy = 0.7) => () => {
    const g = new THREE.Group()
    const geo = jitter(faceted(new THREE.DodecahedronGeometry(s, 0)), s * 0.22, seed)
    add(g, geo, m, 0, s * sy * 0.75, 0, [0, seed, 0], [sx, sy, 1])
    return g
  }
  P.Rock_A = rock(8, 0.5, M.rock)
  P.Rock_B = rock(9, 0.9, M.rockDark, 1.3, 0.6)
  P.Rock_C = rock(10, 1.4, M.rock, 1.1, 0.8)
  P.Rock_Pebbles = () => {
    const r = rng(11), g = new THREE.Group()
    for (let k = 0; k < 6; k++) {
      const s = 0.08 + r() * 0.12
      add(g, jitter(faceted(new THREE.IcosahedronGeometry(s, 0)), s * 0.2, k), k % 2 ? M.rock : M.rockDark, (r() - 0.5) * 0.8, s * 0.5, (r() - 0.5) * 0.8, [0, 0, 0], [1, 0.6, 1])
    }
    return g
  }
  P.Stump = () => {
    const g = new THREE.Group()
    cyl(g, M.bark, 0.36, 0.44, 0.42, 0, 0, 0, { seg: 9 })
    cyl(g, M.wood, 0.33, 0.33, 0.02, 0, 0.42, 0, { seg: 9 })
    return g
  }
  P.Log = () => {
    const g = new THREE.Group()
    cyl(g, M.bark, 0.22, 0.24, 1.8, 0, 0.22, -0.9, { seg: 8, r: [Math.PI / 2, 0, 0] }).position.set(0, 0.23, 0)
    for (const z of [-0.905, 0.905]) cyl(g, M.wood, 0.2, 0.2, 0.01, 0, 0.23, 0, { seg: 8, r: [Math.PI / 2, 0, 0] }).position.set(0, 0.23, z)
    return g
  }
  P.Grass_Tuft = () => {
    const r = rng(12), g = new THREE.Group()
    for (let k = 0; k < 9; k++) {
      const h = 0.25 + r() * 0.2
      add(g, faceted(new THREE.ConeGeometry(0.025, h, 3)), M.grass, (r() - 0.5) * 0.18, h / 2, (r() - 0.5) * 0.18, [(r() - 0.5) * 0.5, r() * TAU, (r() - 0.5) * 0.5])
    }
    return g
  }
  P.Mushrooms = () => {
    const r = rng(13), g = new THREE.Group()
    for (const [x, z, s] of [[0, 0, 1], [0.16, 0.08, 0.7], [-0.12, 0.1, 0.55]]) {
      cyl(g, M.stem, 0.035 * s, 0.05 * s, 0.22 * s, x, 0, z, { seg: 7 })
      add(g, faceted(new THREE.SphereGeometry(0.15 * s, 8, 4, 0, TAU, 0, Math.PI / 2)), M.cap, x, 0.21 * s, z)
      for (let k = 0; k < 4; k++) {
        const a = r() * TAU, rr = 0.07 * s
        add(g, new THREE.IcosahedronGeometry(0.018 * s, 0), M.stem, x + Math.cos(a) * rr, 0.21 * s + 0.12 * s, z + Math.sin(a) * rr)
      }
    }
    return g
  }
  P.Flowers = () => {
    const r = rng(14), g = new THREE.Group()
    for (let f = 0; f < 5; f++) {
      const x = (r() - 0.5) * 0.4, z = (r() - 0.5) * 0.4, h = 0.25 + r() * 0.15
      cyl(g, M.grass, 0.008, 0.01, h, x, 0, z, { seg: 5 })
      add(g, new THREE.IcosahedronGeometry(0.025, 0), M.yellow, x, h, z)
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * TAU
        add(g, faceted(new THREE.SphereGeometry(0.03, 6, 4)), M.petal, x + Math.cos(a) * 0.04, h, z + Math.sin(a) * 0.04, [0, -a, 0], [1.3, 0.35, 0.8])
      }
    }
    return g
  }
  return P
}

/* ------------------------------------------------------------------ */
/* Stylised furniture set                                               */
/* ------------------------------------------------------------------ */

function furniture() {
  const M = {
    oak: mat("Oak", 0xc08e5c, { rough: 0.55 }),
    walnut: mat("Walnut", 0x6b4630, { rough: 0.55 }),
    teal: mat("FabricTeal", 0x3f6f78, { rough: 0.92 }),
    sand: mat("FabricSand", 0xd2b48c, { rough: 0.92 }),
    black: mat("MetalBlack", 0x1d1f22, { rough: 0.35, metal: 0.6 }),
    brass: mat("Brass", 0xc9a045, { rough: 0.3, metal: 0.9 }),
    ceramic: mat("Ceramic", 0xefeae2, { rough: 0.35 }),
    terracotta: mat("Terracotta", 0xc0643d, { rough: 0.8 }),
    soil: mat("Soil", 0x3a2a1f, { rough: 1 }),
    leaf: mat("Leaf", 0x4f8f4a, { rough: 0.7 }),
    rug: mat("Rug", 0xd9cdb7, { rough: 1 }),
    bulb: mat("Bulb", 0x201a10, { emissive: 0xffd9a0, ei: 8 }),
    books: [0x8c3b2e, 0x2e5a7a, 0xd6b25c, 0x3f6b4f, 0xe7e1d6, 0x4b3f6b].map((c, i) => mat(`Book${i + 1}`, c, { rough: 0.7 })),
  }
  const P = {}
  P.Chair = () => {
    const g = new THREE.Group()
    box(g, M.oak, 0.46, 0.05, 0.46, 0, 0.43, 0, { r: 0.012 })
    for (const [x, z] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) cyl(g, M.walnut, 0.017, 0.022, 0.43, x, 0, z, { seg: 12 })
    for (const x of [-0.19, 0.19]) cyl(g, M.walnut, 0.017, 0.017, 0.45, x, 0.48, -0.2, { seg: 12 })
    for (const y of [0.62, 0.76, 0.9]) box(g, M.oak, 0.4, 0.05, 0.022, 0, y, -0.2, { r: 0.008 })
    return g
  }
  P.Stool = () => {
    const g = new THREE.Group()
    cyl(g, M.oak, 0.18, 0.18, 0.04, 0, 0.6, 0, { seg: 28 })
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU
      const leg = cyl(g, M.black, 0.012, 0.014, 0.64, Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14, { seg: 10, r: [Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12] })
      leg.position.y = 0.31
    }
    add(g, new THREE.TorusGeometry(0.15, 0.008, 6, 28), M.black, 0, 0.24, 0, [Math.PI / 2, 0, 0])
    return g
  }
  P.Dining_Table = () => {
    const g = new THREE.Group()
    box(g, M.oak, 1.6, 0.04, 0.9, 0, 0.72, 0, { r: 0.012 })
    for (const [x, z] of [[-0.72, -0.36], [0.72, -0.36], [-0.72, 0.36], [0.72, 0.36]]) box(g, M.walnut, 0.06, 0.72, 0.06, x, 0, z)
    box(g, M.walnut, 1.4, 0.07, 0.03, 0, 0.64, -0.38)
    box(g, M.walnut, 1.4, 0.07, 0.03, 0, 0.64, 0.38)
    return g
  }
  P.Coffee_Table = () => {
    const g = new THREE.Group()
    cyl(g, M.walnut, 0.45, 0.45, 0.035, 0, 0.38, 0, { seg: 40 })
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + 0.3
      cyl(g, M.black, 0.015, 0.015, 0.38, Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32, { seg: 10 })
    }
    return g
  }
  const sofa = (seats, fabric) => () => {
    const g = new THREE.Group()
    const W = seats * 0.64 + 0.34
    box(g, fabric, W, 0.24, 0.9, 0, 0.1, 0, { r: 0.05 })
    for (let i = 0; i < seats; i++) {
      const x = -((seats - 1) * 0.64) / 2 + i * 0.64
      box(g, fabric, 0.62, 0.14, 0.72, x, 0.34, 0.06, { r: 0.05 })
      box(g, fabric, 0.62, 0.44, 0.18, x, 0.34, -0.33, { r: 0.06 })
    }
    for (const x of [-W / 2 + 0.08, W / 2 - 0.08]) box(g, fabric, 0.16, 0.56, 0.9, x, 0.1, 0, { r: 0.05 })
    for (const x of [-W / 2 + 0.12, W / 2 - 0.12]) for (const z of [-0.36, 0.36]) cyl(g, M.walnut, 0.02, 0.016, 0.1, x, 0, z, { seg: 10 })
    return g
  }
  P.Sofa = sofa(3, M.teal)
  P.Armchair = sofa(1, M.sand)
  P.Floor_Lamp = () => {
    const g = new THREE.Group()
    cyl(g, M.black, 0.16, 0.17, 0.025, 0, 0, 0, { seg: 32 })
    cyl(g, M.brass, 0.011, 0.011, 1.45, 0, 0.025, 0, { seg: 10 })
    cyl(g, M.sand, 0.14, 0.22, 0.32, 0, 1.36, 0, { seg: 32, open: true })
    add(g, new THREE.SphereGeometry(0.045, 16, 10), M.bulb, 0, 1.46, 0)
    return g
  }
  P.Bookshelf = () => {
    const g = new THREE.Group()
    const W = 0.9, H = 1.8, D = 0.32, t = 0.025
    for (const x of [-W / 2 + t / 2, W / 2 - t / 2]) box(g, M.walnut, t, H, D, x, 0, 0)
    for (let i = 0; i < 5; i++) box(g, M.walnut, W - 2 * t, t, D, 0, i * ((H - t) / 4), 0)
    box(g, M.walnut, W, 0.01, 0.005, 0, 0, -D / 2)
    const r = rng(21)
    for (let s = 0; s < 4; s++) {
      let x = -W / 2 + t + 0.01
      const y = s * ((H - t) / 4) + t
      while (x < W / 2 - t - 0.06) {
        const bw = 0.025 + r() * 0.03, bh = 0.2 + r() * 0.13
        if (r() < 0.12) {
          x += 0.08
          continue
        }
        box(g, M.books[Math.floor(r() * M.books.length)], bw, bh, 0.2 + r() * 0.05, x + bw / 2, y, 0.02)
        x += bw + 0.004
      }
    }
    return g
  }
  P.Plant_Pot = () => {
    const g = new THREE.Group()
    cyl(g, M.terracotta, 0.17, 0.13, 0.32, 0, 0, 0, { seg: 24 })
    cyl(g, M.soil, 0.155, 0.155, 0.01, 0, 0.3, 0, { seg: 24 })
    const r = rng(22)
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * TAU + r() * 0.3, tilt = 0.5 + r() * 0.5, len = 0.35 + r() * 0.25
      const leaf = add(g, new THREE.SphereGeometry(0.5, 12, 8), M.leaf, Math.cos(a) * 0.1, 0.3 + len * 0.45, Math.sin(a) * 0.1, [0, -a, tilt], [0.12, len, 0.035])
      leaf.position.set(Math.cos(a) * 0.1 + Math.cos(a) * Math.sin(tilt) * len * 0.45, 0.3 + Math.cos(tilt) * len * 0.5, Math.sin(a) * 0.1 + Math.sin(a) * Math.sin(tilt) * len * 0.45)
      leaf.rotation.set(0, -a, tilt, "YXZ")
    }
    return g
  }
  P.Side_Table = () => {
    const g = new THREE.Group()
    cyl(g, M.oak, 0.24, 0.24, 0.03, 0, 0.55, 0, { seg: 32 })
    cyl(g, M.oak, 0.035, 0.05, 0.55, 0, 0, 0, { seg: 16 })
    cyl(g, M.oak, 0.16, 0.18, 0.025, 0, 0, 0, { seg: 32 })
    return g
  }
  P.Rug = () => {
    const g = new THREE.Group()
    box(g, M.rug, 2.2, 0.012, 1.5, 0, 0, 0, { r: 0.004 })
    box(g, M.terracotta, 1.9, 0.004, 0.06, 0, 0.012, 0.55)
    box(g, M.terracotta, 1.9, 0.004, 0.06, 0, 0.012, -0.55)
    return g
  }
  P.Vase = () => {
    const g = new THREE.Group()
    add(g, new THREE.LatheGeometry([[0, 0], [0.07, 0], [0.09, 0.08], [0.06, 0.22], [0.035, 0.28], [0.045, 0.3], [0.04, 0.3]].map(([x, y]) => new THREE.Vector2(x, y)), 32), M.ceramic)
    return g
  }
  return P
}

export const KITS = {
  "modular-sci-fi-corridor-kit-3d": { folder: "Modular Sci-Fi Corridor Kit", build: scifi, grid: 4 },
  "low-poly-nature-kit-3d": { folder: "Low-Poly Nature Kit", build: nature, grid: 2 },
  "stylised-furniture-set-3d": { folder: "Stylised Furniture Set", build: furniture, grid: 1.6 },
}
