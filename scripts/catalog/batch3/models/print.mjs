// Printable models for catalogue batch 3 (3D & Print). Every part is a
// closed solid built from four constructions — cup, lathe, prism and
// heightfield — so slicers accept the STL files without repair. Two-body
// parts (a screw plate plus a hook arm) are merged shells that overlap by
// a millimetre; Cura and PrusaSlicer unite them when slicing.
//
// Units: millimetres, Y up (rotated to Z up when exported to STL).
import * as THREE from "three"

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
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export class Solid {
  constructor() {
    this.p = []
  }
  /** Adds a triangle facing along n (vertex order is fixed up to match). */
  tri(a, b, c, n) {
    const cr = cross(sub(b, a), sub(c, a))
    if (Math.abs(cr[0]) + Math.abs(cr[1]) + Math.abs(cr[2]) < 1e-9) return
    if (dot(cr, n) < 0) [b, c] = [c, b]
    this.p.push(...a, ...b, ...c)
  }
  quad(a, b, c, d, n) {
    this.tri(a, b, c, n)
    this.tri(a, c, d, n)
  }
  merge(other) {
    this.p.push(...other.p)
    return this
  }
  move(dx, dy, dz) {
    for (let i = 0; i < this.p.length; i += 3) {
      this.p[i] += dx
      this.p[i + 1] += dy
      this.p[i + 2] += dz
    }
    return this
  }
  /** Rotates about the Y axis by a (radians). */
  turn(a) {
    const c = Math.cos(a), s = Math.sin(a)
    for (let i = 0; i < this.p.length; i += 3) {
      const x = this.p[i], z = this.p[i + 2]
      this.p[i] = x * c - z * s
      this.p[i + 2] = x * s + z * c
    }
    return this
  }
  /** Rotates about the X axis by a (radians). */
  tilt(a) {
    const c = Math.cos(a), s = Math.sin(a)
    for (let i = 0; i < this.p.length; i += 3) {
      const y = this.p[i + 1], z = this.p[i + 2]
      this.p[i + 1] = y * c - z * s
      this.p[i + 2] = y * s + z * c
    }
    return this
  }
  geometry() {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3))
    g.computeVertexNormals()
    return g
  }
}

const area2 = (pts) => pts.reduce((s, p, i) => {
  const q = pts[(i + 1) % pts.length]
  return s + p[0] * q[1] - q[0] * p[1]
}, 0)
const ccw = (pts) => (area2(pts) > 0 ? pts : pts.slice().reverse())

function faceTris(contour, holes, cb) {
  const c2 = contour.map((p) => new THREE.Vector2(p[0], p[1]))
  const h2 = holes.map((h) => h.map((p) => new THREE.Vector2(p[0], p[1])))
  const all = [...contour, ...holes.flat()]
  for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(c2, h2)) cb(all[a], all[b], all[c])
}

export function roundedRect(w, d, r, seg = 6, cx = 0, cz = 0) {
  const pts = []
  const corners = [[w / 2 - r, d / 2 - r, 0], [-w / 2 + r, d / 2 - r, 90], [-w / 2 + r, -d / 2 + r, 180], [w / 2 - r, -d / 2 + r, 270]]
  for (const [x, z, a0] of corners) for (let i = 0; i <= seg; i++) {
    const a = ((a0 + (90 * i) / seg) * Math.PI) / 180
    pts.push([cx + x + r * Math.cos(a), cz + z + r * Math.sin(a)])
  }
  return ccw(pts)
}

export function circle(r, n = 64, cx = 0, cz = 0, phase = 0) {
  return ccw(Array.from({ length: n }, (_, i) => {
    const a = phase + (i / n) * TAU
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)]
  }))
}

/** A container: outer footprint to height H, with a cavity (inner footprint) from floor F up. */
export function cup(outer, inner, H, F) {
  const s = new Solid()
  outer = ccw(outer)
  inner = ccw(inner)
  const V = (p, y) => [p[0], y, p[1]]
  faceTris(outer, [], (a, b, c) => s.tri(V(a, 0), V(b, 0), V(c, 0), [0, -1, 0]))
  faceTris(outer, [inner], (a, b, c) => s.tri(V(a, H), V(b, H), V(c, H), [0, 1, 0]))
  faceTris(inner, [], (a, b, c) => s.tri(V(a, F), V(b, F), V(c, F), [0, 1, 0]))
  const walls = (poly, y0, y1, sign) => poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length]
    const n = [sign * (q[1] - p[1]), 0, -sign * (q[0] - p[0])]
    s.quad(V(p, y0), V(q, y0), V(q, y1), V(p, y1), n)
  })
  walls(outer, 0, H, 1)
  walls(inner, F, H, -1)
  return s
}

/** Surface of revolution of a closed (r, y) profile; points with r = 0 sit on the axis. */
export function lathe(profile, seg = 48, phase = 0) {
  const s = new Solid()
  profile = ccw(profile)
  const P = (pt, a) => [pt[0] * Math.cos(a), pt[1], pt[0] * Math.sin(a)]
  profile.forEach((p, j) => {
    const q = profile[(j + 1) % profile.length]
    const nr = q[1] - p[1], ny = -(q[0] - p[0])
    for (let k = 0; k < seg; k++) {
      const a0 = phase + (k / seg) * TAU, a1 = phase + ((k + 1) / seg) * TAU, am = (a0 + a1) / 2
      s.quad(P(p, a0), P(p, a1), P(q, a1), P(q, a0), [nr * Math.cos(am), ny, nr * Math.sin(am)])
    }
  })
  return s
}

/** A 2D (x, y) outline with holes, extruded along z from 0 to depth. */
export function prism(contour, holes, depth) {
  const s = new Solid()
  contour = ccw(contour)
  holes = holes.map(ccw)
  faceTris(contour, holes, (a, b, c) => {
    s.tri([a[0], a[1], 0], [b[0], b[1], 0], [c[0], c[1], 0], [0, 0, -1])
    s.tri([a[0], a[1], depth], [b[0], b[1], depth], [c[0], c[1], depth], [0, 0, 1])
  })
  const side = (poly, sign) => poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length]
    s.quad([p[0], p[1], 0], [q[0], q[1], 0], [q[0], q[1], depth], [p[0], p[1], depth], [sign * (q[1] - p[1]), -sign * (q[0] - p[0]), 0])
  })
  side(contour, 1)
  holes.forEach((h) => side(h, -1))
  return s
}

/** A W × D slab whose top surface is y = h(x, z); flat bottom, vertical sides. */
export function heightfield(W, D, res, h) {
  const s = new Solid()
  const nx = Math.round(W / res), nz = Math.round(D / res)
  const X = (i) => (i / nx) * W, Z = (k) => (k / nz) * D
  const H = []
  for (let k = 0; k <= nz; k++) {
    const row = []
    for (let i = 0; i <= nx; i++) row.push(h(X(i), Z(k)))
    H.push(row)
  }
  const T = (i, k) => [X(i), H[k][i], Z(k)]
  for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) s.quad(T(i, k), T(i + 1, k), T(i + 1, k + 1), T(i, k + 1), [0, 1, 0])
  const border = []
  for (let i = 0; i < nx; i++) border.push([i, 0])
  for (let k = 0; k < nz; k++) border.push([nx, k])
  for (let i = nx; i > 0; i--) border.push([i, nz])
  for (let k = nz; k > 0; k--) border.push([0, k])
  const cx = W / 2, cz = D / 2
  border.forEach(([i, k], j) => {
    const [i2, k2] = border[(j + 1) % border.length]
    const a = T(i, k), b = T(i2, k2)
    const n = [(X(i) + X(i2)) / 2 - cx, 0, (Z(k) + Z(k2)) / 2 - cz]
    const nn = Math.abs(n[0]) / W > Math.abs(n[2]) / D ? [Math.sign(n[0]), 0, 0] : [0, 0, Math.sign(n[2])]
    s.quad([a[0], 0, a[2]], [b[0], 0, b[2]], b, a, nn)
  })
  const flat = border.map(([i, k]) => [X(i), Z(k)])
  faceTris(ccw(flat), [], (a, b, c) => s.tri([a[0], 0, a[1]], [b[0], 0, b[1]], [c[0], 0, c[1]], [0, -1, 0]))
  return s
}

function voronoi(seed, W, D, count) {
  const r = rng(seed)
  const pts = Array.from({ length: count }, () => [r() * W, r() * D, r()])
  return (x, z) => {
    let d1 = 1e9, d2 = 1e9, id = 0
    for (let i = 0; i < pts.length; i++) {
      const dx = x - pts[i][0], dz = z - pts[i][1]
      const d = dx * dx + dz * dz
      if (d < d1) {
        d2 = d1
        d1 = d
        id = i
      } else if (d < d2) d2 = d
    }
    return { edge: (Math.sqrt(d2) - Math.sqrt(d1)) / 2, id, v: pts[id][2], dc: Math.sqrt(d1) }
  }
}
const hash = (x, z) => {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/* ------------------------------------------------------------------ */
/* Products                                                             */
/* ------------------------------------------------------------------ */

const TILE = 50.8
const inchGrid = (x, z) => {
  const g = (v) => Math.min(Math.abs(v % 25.4), Math.abs(25.4 - (v % 25.4)))
  return Math.min(g(x), g(z)) < 0.55 ? 0.7 : 0
}

const tile = (fn) => () => heightfield(TILE, TILE, 0.5, (x, z) => Math.max(3, fn(x, z) - inchGrid(x, z)))

const flag = (seed, count) => {
  const v = voronoi(seed, TILE, TILE, count)
  return (x, z) => {
    const c = v(x, z)
    return 5 + 1.3 * smooth(0.35, 1.2, c.edge) + 0.3 * c.v + 0.08 * Math.sin(x * 0.9 + c.v * 6) * Math.cos(z * 0.7)
  }
}

function wallPanel(Wd, Ht, fn) {
  return () => heightfield(Wd, Ht, 0.5, fn)
}

const brick = (x, z) => {
  const row = Math.floor(z / 6.35)
  const off = row % 2 ? 6.35 : 0
  const bx = (x + off) % 12.7
  const mortar = Math.min(bx, 12.7 - bx) < 0.6 || Math.min(z % 6.35, 6.35 - (z % 6.35)) < 0.6
  return mortar ? 6 : 7.6 + 0.35 * hash(Math.floor((x + off) / 12.7), row)
}

function jhookArm(width, reach, lift, thick) {
  // Side profile (x out from the wall, y up), extruded across the hook width.
  const pts = [[0, 0], [reach * 0.55, 0]]
  const R = reach * 0.45
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * (Math.PI / 2 + 0.25)
    pts.push([reach * 0.55 + R * Math.cos(a), R + R * Math.sin(a)])
  }
  pts.push([reach * 0.55 + (R - thick) * Math.cos(0.25), R + (R - thick) * Math.sin(0.25) + lift * 0.1])
  for (let i = 10; i >= 0; i--) {
    const a = -Math.PI / 2 + (i / 10) * (Math.PI / 2 + 0.25)
    pts.push([reach * 0.55 + (R - thick) * Math.cos(a), R + (R - thick) * Math.sin(a)])
  }
  pts.push([0, thick])
  return prism(pts.map(([x, y]) => [x - 1, y]), [], width).move(0, 0, -width / 2)
}

function wallHook(scale, width) {
  const plateW = 22 * scale, plateH = 58 * scale, t = 5
  const plate = prism(roundedRect(plateW, plateH, 5 * scale, 6).map(([x, z]) => [x, z + plateH / 2]), [circle(2.2, 24, 0, plateH * 0.78), circle(2.2, 24, 0, plateH * 0.22)], t)
  // plate lies in the x/y plane (wall plane) with depth along z; turn it so its depth runs along x.
  const P = new Solid().merge(plate).turn(-Math.PI / 2).move(0, 0, 0)
  const arm = jhookArm(width * scale, 42 * scale, 10, 6.5 * scale).turn(0).move(t - 1, plateH * 0.12, 0)
  return P.merge(arm.turn(0))
}

const standProfile = (s, slope) => {
  const lipH = 30 * s, grooveY = 22 * s, topY = 104 * s
  const x0 = 16 * s
  const xTop = x0 + (topY - grooveY) / Math.tan(slope)
  const back = xTop + 38 * s
  const outline = [[0, 0], [back, 0], [xTop + 8 * s, topY], [xTop, topY], [x0, grooveY], [10 * s, grooveY], [8 * s, lipH], [0, lipH]]
  const tri = [[x0, grooveY], [xTop, topY], [back, 0]]
  const c = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3]
  const hole = tri.map(([x, y]) => [c[0] + (x - c[0]) * 0.5, c[1] + (y - c[1]) * 0.5 + 3 * s])
  return { outline, hole }
}
const stand = (s, slope, width) => () => {
  const { outline, hole } = standProfile(s, slope)
  return prism(outline, [hole], width).move(0, 0, -width / 2)
}

const bin = (ux, uz, h) => () => {
  const w = ux * 40 - 0.5, d = uz * 40 - 0.5
  return cup(roundedRect(w, d, 4, 6), roundedRect(w - 3.2, d - 3.2, 2.6, 6), h, 1.2)
}
const frame = (ux, uz) => () => {
  const holes = []
  for (let i = 0; i < ux; i++) for (let k = 0; k < uz; k++) holes.push(roundedRect(40 - 3, 40 - 3, 4, 5, -ux * 20 + 20 + i * 40, -uz * 20 + 20 + k * 40))
  return prism(roundedRect(ux * 40 + 4, uz * 40 + 4, 6, 6), holes, 3).tilt(-Math.PI / 2)
}

const planter = (seg, R, H, phase = 0) => () => lathe([[5, 0], [R * 0.72, 0], [R, H], [R - 2.4, H], [R * 0.72 - 2.4, 2.4], [5, 2.4]], seg, phase)
const saucer = (seg, R, phase = 0) => () => lathe([[0, 0], [R * 0.9, 0], [R, 10], [R - 2, 10], [R * 0.9 - 2, 2], [0, 2]], seg, phase)

const clip = (rin) => () => {
  // The ring sinks 1.2 mm into the base plate so the outline meets the plate
  // top at two separate points; a ring resting exactly on the plate would
  // pinch the outline at its lowest point and leave a non-manifold edge.
  const ro = rin + 2.2, cy = ro + 1.2, pts = []
  const a0 = Math.asin((2.4 - cy) / ro)
  const deg = (d) => (d * Math.PI) / 180
  pts.push([ro + 6, 0], [ro + 6, 2.4])
  for (let i = 0; i <= 16; i++) {
    const a = a0 + (i / 16) * (deg(60) - a0)
    pts.push([ro * Math.cos(a), cy + ro * Math.sin(a)])
  }
  for (let i = 0; i <= 24; i++) {
    const a = deg(60) - (i / 24) * deg(300)
    pts.push([rin * Math.cos(a), cy + rin * Math.sin(a)])
  }
  for (let i = 0; i <= 16; i++) {
    const a = deg(120) + (i / 16) * (Math.PI - a0 - deg(120))
    pts.push([ro * Math.cos(a), cy + ro * Math.sin(a)])
  }
  pts.push([-(ro + 6), 2.4], [-(ro + 6), 0])
  return prism(pts, [], 12).move(0, 0, -6)
}

const comb = () => {
  const W = 64, D = 40, pts = [[-W / 2, 0], [W / 2, 0], [W / 2, D]]
  for (let i = 5; i >= 0; i--) {
    const x = -W / 2 + 7 + i * 10
    pts.push([x + 3.4, D], [x + 3.4, D - 16], [x + 1.7, D - 18], [x - 1.7, D - 18], [x - 3.4, D - 16], [x - 3.4, D])
  }
  pts.push([-W / 2, D])
  return prism(pts, [circle(2.2, 24, -W / 2 + 7, 8), circle(2.2, 24, W / 2 - 7, 8)], 3.2).tilt(-Math.PI / 2)
}

const cordWrap = () => {
  const pts = [[-30, -20], [30, -20], [30, -6], [22, -6], [22, 6], [30, 6], [30, 20], [-30, 20], [-30, 6], [-22, 6], [-22, -6], [-30, -6]]
  return prism(pts, [], 4).tilt(-Math.PI / 2)
}

const keyRail = () => {
  const s = new Solid().merge(prism(roundedRect(130, 32, 5, 6).map(([x, z]) => [x, z + 16]), [circle(2.2, 24, -52, 16), circle(2.2, 24, 0, 16), circle(2.2, 24, 52, 16)], 5).turn(-Math.PI / 2))
  for (const z of [-39, -13, 13, 39]) s.merge(jhookArm(9, 26, 6, 5).move(4, 6, z))
  return s
}

export const PRINTS = {
  "modular-desk-organiser-3d-print-system": {
    folder: "Modular Desk Organiser",
    palette: [0xe9e4da, 0x2f6f73, 0xe07a3f, 0x2b2d31],
    items: [
      ["Bin_1x1_H40", bin(1, 1, 40)], ["Bin_1x2_H40", bin(1, 2, 40)], ["Bin_2x2_H40", bin(2, 2, 40)],
      ["Bin_1x1_H70", bin(1, 1, 70)], ["Bin_1x2_H70", bin(1, 2, 70)],
      ["Tray_1x3_H25", bin(1, 3, 25)], ["Tray_2x3_H25", bin(2, 3, 25)],
      ["PenCup_D70_H100", () => lathe([[0, 0], [35, 0], [35, 100], [33.4, 100], [33.4, 1.6], [0, 1.6]], 64)],
      ["Frame_3x3", frame(3, 3)], ["Frame_2x4", frame(2, 4)],
    ],
  },
  "dungeon-terrain-tiles-3d-print-set": {
    folder: "Dungeon Terrain Tiles",
    palette: [0x8d8f93, 0x77706a, 0x9a8f84, 0x5d5f63],
    items: [
      ["Floor_Flagstone_A", tile(flag(11, 16))], ["Floor_Flagstone_B", tile(flag(29, 22))],
      ["Floor_Cobble", tile((() => { const v = voronoi(47, TILE, TILE, 70); return (x, z) => { const c = v(x, z); return 5 + 1.5 * Math.sqrt(smooth(0, 1.6, c.edge)) } })())],
      ["Floor_Planks", tile((x, z) => {
        const w = TILE / 5, p = Math.floor(z / w), zz = z % w
        const off = (p * 17.3) % TILE, xx = (x + off) % TILE
        const joint = Math.min(zz, w - zz) < 0.6 || Math.abs(xx - TILE * 0.62) < 0.5
        const nail = Math.hypot(((x + off) % 25.4) - 3, zz - w / 2) < 0.8
        return joint ? 5 : 6.4 + 0.18 * Math.sin(x * 0.7 + p * 3 + Math.sin(z * 0.4) * 2) - (nail ? 0.5 : 0)
      })],
      ["Floor_Grate", tile((x, z) => {
        const edge = x < 6 || z < 6 || x > TILE - 6 || z > TILE - 6
        const bar = (v) => Math.abs(((v - 6) % 6.46) - 3.23) > 2.2
        return edge || bar(x) || bar(z) ? 6.5 : 3.2
      })],
      ["Floor_Rubble", tile((() => { const f = flag(71, 14), r = rng(72); const rocks = Array.from({ length: 9 }, () => [4 + r() * 43, 4 + r() * 43, 2 + r() * 4, 1.2 + r() * 2.2]); return (x, z) => { let h = f(x, z); for (const [rx, rz, rad, ht] of rocks) { const d = Math.hypot(x - rx, z - rz) / rad; if (d < 1) h = Math.max(h, 6 + ht * Math.sqrt(1 - d * d) * (0.8 + 0.2 * hash(x, z))) } return h } })())],
      ["Wall_Brick_Straight", wallPanel(TILE, TILE, brick)],
      ["Wall_Brick_Half", wallPanel(TILE, TILE / 2, brick)],
      ["Wall_Stone_Straight", wallPanel(TILE, TILE, (() => { const v = voronoi(91, TILE, TILE, 14); return (x, z) => { const c = v(x, z); return 6 + 2 * smooth(0.4, 1.4, c.edge) + 0.4 * c.v } })())],
      ["Pillar_Round", () => lathe([[0, 0], [12, 0], [12, 4], [10, 5.5], [9, 5.5], [9, 44.5], [10, 44.5], [12, 46], [12, 50], [0, 50]], 40)],
      ["Pillar_Square", () => lathe([[0, 0], [16.5, 0], [16.5, 5], [13, 6.5], [13, 43.5], [16.5, 45], [16.5, 50], [0, 50]], 4, Math.PI / 4)],
    ],
  },
  "geometric-planter-collection-3d-print": {
    folder: "Geometric Planter Collection",
    palette: [0xe8e2d6, 0xc86b4a, 0x6f8f72, 0x2c3338],
    items: [
      ["Planter_Hex_S", planter(6, 42, 60)], ["Planter_Hex_M", planter(6, 58, 84)], ["Planter_Hex_L", planter(6, 76, 110)],
      ["Planter_Octa_S", planter(8, 42, 62, Math.PI / 8)], ["Planter_Octa_M", planter(8, 58, 86, Math.PI / 8)], ["Planter_Octa_L", planter(8, 76, 112, Math.PI / 8)],
      ["Planter_Dodeca_S", planter(12, 42, 64)], ["Planter_Dodeca_M", planter(12, 58, 88)], ["Planter_Dodeca_L", planter(12, 76, 114)],
      ["Saucer_Hex_M", saucer(6, 62)], ["Saucer_Octa_M", saucer(8, 62, Math.PI / 8)], ["Saucer_Dodeca_M", saucer(12, 62)],
    ],
  },
  "cable-management-hook-set-3d-print": {
    folder: "Cable & Hook Set",
    palette: [0x2b2d31, 0xe9e4da, 0x3d7ea6, 0xe0a13f],
    items: [
      ["Hook_Wall_S", () => wallHook(0.8, 12)], ["Hook_Wall_M", () => wallHook(1, 14)], ["Hook_Wall_L", () => wallHook(1.3, 18)],
      ["Hook_Headphone", () => wallHook(1.15, 32)],
      ["Clip_Cable_S", clip(3)], ["Clip_Cable_M", clip(5.5)], ["Clip_Cable_L", clip(8)],
      ["Comb_Cable_6", comb], ["CordWrap", cordWrap], ["KeyRail_4", keyRail],
    ],
  },
  "phone-and-tablet-stand-pack-3d-print": {
    folder: "Phone & Tablet Stand Pack",
    palette: [0x2c3338, 0xe9e4da, 0xd65a4a, 0x4f7cac],
    items: [
      ["Stand_Phone_Upright", stand(1, (62 * Math.PI) / 180, 70)],
      ["Stand_Phone_Low", stand(0.85, (48 * Math.PI) / 180, 70)],
      ["Stand_Tablet", stand(1.35, (60 * Math.PI) / 180, 150)],
      ["Stand_Mini", stand(0.7, (58 * Math.PI) / 180, 50)],
    ],
  },
}
