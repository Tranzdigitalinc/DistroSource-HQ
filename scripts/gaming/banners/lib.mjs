// Shared scene helpers: seeded procedural PBR textures and geometry.
//
// Every texture here is drawn by code, so product scenes contain no
// third-party imagery and render identically on every run.
import * as THREE from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"

/* ------------------------------------------------------------------ */
/* Randomness and noise                                                */
/* ------------------------------------------------------------------ */

export function rng(seed = 1) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 1_000_000) / 1_000_000
  }
}

function hash2(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

/** Tileable value noise with period `p` cells. */
export function valueNoise(x, y, p, seed = 1) {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi
  const s = (t) => t * t * (3 - 2 * t)
  const g = (a, b) => hash2(((a % p) + p) % p, ((b % p) + p) % p, seed)
  const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1)
  const u = s(xf), v = s(yf)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

/** Tileable fractal noise in [0,1]. `u`,`v` in [0,1). */
export function fbm(u, v, { octaves = 5, base = 4, seed = 1 } = {}) {
  let sum = 0, amp = 0.5, norm = 0, p = base
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(u * p, v * p, p, seed + o * 17)
    norm += amp
    amp *= 0.5
    p *= 2
  }
  return sum / norm
}

/* ------------------------------------------------------------------ */
/* Canvas → texture                                                    */
/* ------------------------------------------------------------------ */

export function canvas(size, h = size) {
  const c = document.createElement("canvas")
  c.width = size
  c.height = h
  return c
}

export function toTexture(c, { srgb = true, repeat = [1, 1], nearest = false, anisotropy = 8 } = {}) {
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.anisotropy = anisotropy
  if (nearest) {
    t.magFilter = THREE.NearestFilter
    t.minFilter = THREE.NearestMipmapLinearFilter
  }
  t.needsUpdate = true
  return t
}

/** Fill a canvas pixel-by-pixel. `fn(u, v)` returns [r,g,b] 0-255 or a grey number. */
export function paint(size, fn, h = size) {
  const c = canvas(size, h)
  const ctx = c.getContext("2d")
  const img = ctx.createImageData(size, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < size; x++) {
      const v = fn(x / size, y / h, x, y)
      const i = (y * size + x) * 4
      if (typeof v === "number") {
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      } else {
        img.data[i] = v[0]
        img.data[i + 1] = v[1]
        img.data[i + 2] = v[2]
      }
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return c
}

/** Tangent-space normal map from a greyscale height canvas (Sobel). */
export function normalFromHeight(heightCanvas, strength = 2) {
  const w = heightCanvas.width, h = heightCanvas.height
  const src = heightCanvas.getContext("2d").getImageData(0, 0, w, h).data
  const H = (x, y) => src[((((y + h) % h) * w + ((x + w) % w)) * 4)] / 255
  const out = canvas(w, h)
  const ctx = out.getContext("2d")
  const img = ctx.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y - 1) + 2 * H(x + 1, y) + H(x + 1, y + 1) - H(x - 1, y - 1) - 2 * H(x - 1, y) - H(x - 1, y + 1)) * strength
      const dy = (H(x - 1, y + 1) + 2 * H(x, y + 1) + H(x + 1, y + 1) - H(x - 1, y - 1) - 2 * H(x, y - 1) - H(x + 1, y - 1)) * strength
      const len = Math.hypot(dx, dy, 1)
      const i = (y * w + x) * 4
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return out
}

const mix = (a, b, t) => a + (b - a) * t
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255]

/* ------------------------------------------------------------------ */
/* Material recipes                                                    */
/* ------------------------------------------------------------------ */

/** Subtle painted plaster: albedo + roughness + faint normal. */
export function plaster({ color = 0xeee6d8, size = 512, seed = 3, repeat = [4, 2] } = {}) {
  const [r, g, b] = hex(color)
  const heightC = paint(size, (u, v) => 128 + (fbm(u, v, { seed, base: 8 }) - 0.5) * 60)
  const albedo = paint(size, (u, v) => {
    const n = (fbm(u, v, { seed: seed + 5, base: 3 }) - 0.5) * 14
    return [clamp(r + n, 0, 255), clamp(g + n, 0, 255), clamp(b + n, 0, 255)]
  })
  const rough = paint(size, (u, v) => 200 + (fbm(u, v, { seed: seed + 9 }) - 0.5) * 50)
  return new THREE.MeshPhysicalMaterial({
    map: toTexture(albedo, { repeat }),
    roughnessMap: toTexture(rough, { srgb: false, repeat }),
    normalMap: toTexture(normalFromHeight(heightC, 1.2), { srgb: false, repeat }),
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughness: 1,
  })
}

/** Checker / square floor tiles with grout, wear and roughness variation. */
export function tiles({
  a = 0xf1eee6,
  b = 0x1b1c1f,
  grout = 0x8d8a84,
  count = 16,
  checker = true,
  size = 2048,
  seed = 11,
  repeat = [1, 1],
  gloss = 0.22,
} = {}) {
  const ca = hex(a), cb = hex(b), cg = hex(grout)
  const g = 0.035 // grout width as a fraction of a tile
  const rand = rng(seed)
  const tileTint = Array.from({ length: count * count }, () => (rand() - 0.5) * 10)
  const tileRough = Array.from({ length: count * count }, () => rand())
  const cell = (u, v) => {
    const x = u * count, y = v * count
    const ix = Math.floor(x), iy = Math.floor(y)
    const fx = x - ix, fy = y - iy
    const edge = Math.min(fx, fy, 1 - fx, 1 - fy)
    return { ix, iy, edge }
  }
  const albedo = paint(size, (u, v) => {
    const { ix, iy, edge } = cell(u, v)
    if (edge < g / 2) return cg
    const base = checker && (ix + iy) % 2 ? cb : ca
    const wear = (fbm(u, v, { seed: seed + 3, base: 6 }) - 0.5) * 18 + tileTint[iy * count + ix]
    return [clamp(base[0] + wear, 0, 255), clamp(base[1] + wear, 0, 255), clamp(base[2] + wear, 0, 255)]
  })
  const rough = paint(size, (u, v) => {
    const { ix, iy, edge } = cell(u, v)
    if (edge < g / 2) return 235
    const scuff = fbm(u, v, { seed: seed + 8, base: 10 })
    return clamp((gloss + tileRough[iy * count + ix] * 0.12 + scuff * 0.18) * 255, 0, 255)
  })
  const heightC = paint(size, (u, v) => {
    const { edge } = cell(u, v)
    return edge < g / 2 ? 60 : edge < g ? 60 + ((edge - g / 2) / (g / 2)) * 150 : 210
  })
  return new THREE.MeshPhysicalMaterial({
    map: toTexture(albedo, { repeat }),
    roughnessMap: toTexture(rough, { srgb: false, repeat }),
    normalMap: toTexture(normalFromHeight(heightC, 1.4), { srgb: false, repeat }),
    normalScale: new THREE.Vector2(0.6, 0.6),
    roughness: 1,
    clearcoat: 0.35,
    clearcoatRoughness: 0.18,
  })
}

/** Long wood planks with grain, per-plank tone and seams. */
export function woodPlanks({ tone = 0x8a5a36, planks = 8, size = 1024, seed = 21, repeat = [1, 1], gloss = 0.45 } = {}) {
  const base = hex(tone)
  const rand = rng(seed)
  const plankTone = Array.from({ length: planks }, () => (rand() - 0.5) * 36)
  const offset = Array.from({ length: planks }, () => rand())
  const albedo = paint(size, (u, v) => {
    const p = Math.floor(v * planks)
    const fv = v * planks - p
    if (fv < 0.02) return [base[0] * 0.35, base[1] * 0.33, base[2] * 0.3]
    const along = (u + offset[p]) % 1
    const grain = Math.sin((fv * 18 + fbm(along, fv, { seed: seed + p, base: 3 }) * 7) * Math.PI) * 0.5 + 0.5
    const streak = fbm(along * 0.3, fv, { seed: seed + p * 3, base: 8 })
    const t = plankTone[p] + (grain - 0.5) * 22 + (streak - 0.5) * 26
    return [clamp(base[0] + t, 0, 255), clamp(base[1] + t * 0.8, 0, 255), clamp(base[2] + t * 0.6, 0, 255)]
  })
  const rough = paint(size, (u, v) => clamp((gloss + fbm(u, v, { seed: seed + 40, base: 12 }) * 0.25) * 255, 0, 255))
  return new THREE.MeshPhysicalMaterial({
    map: toTexture(albedo, { repeat }),
    roughnessMap: toTexture(rough, { srgb: false, repeat }),
    roughness: 1,
    clearcoat: 0.25,
    clearcoatRoughness: 0.3,
  })
}

/** Poured / polished concrete. */
export function concrete({ color = 0x9a9893, size = 1024, seed = 31, repeat = [2, 2], polish = 0.5 } = {}) {
  const [r, g, b] = hex(color)
  const albedo = paint(size, (u, v) => {
    const n = (fbm(u, v, { seed, base: 5 }) - 0.5) * 34 + (fbm(u, v, { seed: seed + 2, base: 40, octaves: 2 }) - 0.5) * 14
    return [clamp(r + n, 0, 255), clamp(g + n, 0, 255), clamp(b + n, 0, 255)]
  })
  const rough = paint(size, (u, v) => clamp((polish + (fbm(u, v, { seed: seed + 7, base: 6 }) - 0.5) * 0.5) * 255, 0, 255))
  const heightC = paint(size, (u, v) => 128 + (fbm(u, v, { seed: seed + 11, base: 24 }) - 0.5) * 40)
  return new THREE.MeshPhysicalMaterial({
    map: toTexture(albedo, { repeat }),
    roughnessMap: toTexture(rough, { srgb: false, repeat }),
    normalMap: toTexture(normalFromHeight(heightC, 1), { srgb: false, repeat }),
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughness: 1,
  })
}

/** Brushed stainless steel (anisotropic streaks in the roughness). */
export function brushedMetal({ color = 0xc9ccd1, size = 512, seed = 41, repeat = [2, 1], roughness = 0.32 } = {}) {
  const rough = paint(size, (u, v) => {
    const streak = valueNoise(u * 2, v * 260, 260, seed) * 0.6 + valueNoise(u * 4, v * 90, 90, seed + 1) * 0.4
    return clamp((roughness + (streak - 0.5) * 0.18) * 255, 0, 255)
  })
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: 1,
    roughnessMap: toTexture(rough, { srgb: false, repeat }),
  })
}

export const materials = {
  chrome: () => new THREE.MeshPhysicalMaterial({ color: 0xdfe2e6, metalness: 1, roughness: 0.08 }),
  vinyl: (color = 0x8e1b22) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.8, clearcoatRoughness: 0.22, sheen: 0.3, sheenColor: new THREE.Color(0xff9a9a) }),
  laminate: (color = 0xf0ede4) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, clearcoat: 0.4, clearcoatRoughness: 0.15 }),
  paint: (color, roughness = 0.5, clearcoat = 0.3) => new THREE.MeshPhysicalMaterial({ color, roughness, clearcoat, clearcoatRoughness: 0.25 }),
  matte: (color, roughness = 0.85) => new THREE.MeshPhysicalMaterial({ color, roughness }),
  glass: (tint = 0xffffff) =>
    new THREE.MeshPhysicalMaterial({ color: tint, transmission: 1, roughness: 0.02, ior: 1.5, thickness: 0.01, metalness: 0 }),
  rubber: (color = 0x161616) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.75 }),
  emissive: (color, intensity = 4) => new THREE.MeshPhysicalMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity, roughness: 1 }),
}

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

/** Rounded box centred on (x, y, z) where y is the box's bottom. */
export function box(parent, { w, h, d, x = 0, y = 0, z = 0, r = 0.01, seg = 3, mat, ry = 0 }) {
  const geo = r > 0 ? new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) * 0.999) : new THREE.BoxGeometry(w, h, d)
  const m = new THREE.Mesh(geo, mat)
  m.position.set(x, y + h / 2, z)
  m.rotation.y = ry
  parent.add(m)
  return m
}

export function cylinder(parent, { r, h, x = 0, y = 0, z = 0, mat, seg = 32, rTop, rx = 0, rz = 0 }) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop ?? r, r, h, seg), mat)
  m.position.set(x, y + h / 2, z)
  m.rotation.x = rx
  m.rotation.z = rz
  parent.add(m)
  return m
}

export function plane(parent, { w, h, x = 0, y = 0, z = 0, rx = 0, ry = 0, mat }) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
  m.position.set(x, y, z)
  m.rotation.set(rx, ry, 0)
  parent.add(m)
  return m
}

/** Text drawn to a canvas, returned as a texture. Deterministic system fonts only. */
export function textTexture(lines, { width = 1024, height = 512, bg = "#111", fg = "#fff", font = "700 64px Bahnschrift, 'Segoe UI', sans-serif", align = "center", lineHeight = 1.2, padding = 40, draw } = {}) {
  const c = canvas(width, height)
  const ctx = c.getContext("2d")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)
  if (draw) draw(ctx, width, height)
  ctx.fillStyle = fg
  ctx.font = font
  ctx.textAlign = align
  ctx.textBaseline = "middle"
  const size = parseInt(/(\d+)px/.exec(font)?.[1] ?? "64", 10)
  const total = lines.length * size * lineHeight
  lines.forEach((line, i) => {
    const y = height / 2 - total / 2 + size * lineHeight * (i + 0.5)
    const x = align === "center" ? width / 2 : align === "right" ? width - padding : padding
    ctx.fillText(line, x, y)
  })
  return toTexture(c)
}

export { mix, clamp, hex }
