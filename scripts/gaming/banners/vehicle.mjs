// Parametric vehicles for DistroSource Gaming scenes.
//
// A body is lofted from cross-sections along its length: each station has a
// bottom, a roof line, a half-width and a beltline, and the section narrows
// above the beltline (tumblehome). Wheel arches are cut into the underside.
// Glass is assigned per quad from the same profile, so the windscreen, side
// glass and pillars follow the body exactly.
//
// Forward is +x, the car sits on y = 0, centred on x = 0 and z = 0.
import * as THREE from "three"
import { materials as M, canvas, toTexture } from "/scripts/gaming/banners/lib.mjs"

function curve(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1]
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1]
        const [t1, v1] = keys[i]
        const u = (t - t0) / (t1 - t0)
        const s = u * u * (3 - 2 * u)
        return v0 + (v1 - v0) * s
      }
    }
    return keys[keys.length - 1][1]
  }
}

// Profiles are keyed on t ∈ [0,1] from the rear bumper (0) to the front bumper (1).
export const STYLES = {
  sedan: {
    length: 4.9,
    halfWidth: 0.93,
    wheelR: 0.345,
    axles: [0.2, 0.785],
    top: [[0, 0.72], [0.02, 0.9], [0.07, 0.99], [0.16, 1.03], [0.24, 1.18], [0.33, 1.43], [0.4, 1.47], [0.55, 1.46], [0.62, 1.38], [0.72, 1.0], [0.78, 0.96], [0.9, 0.9], [0.97, 0.8], [1, 0.64]],
    bottom: [[0, 0.44], [0.04, 0.26], [0.96, 0.26], [1, 0.4]],
    width: [[0, 0.8], [0.03, 0.92], [0.1, 0.97], [0.9, 0.97], [0.97, 0.9], [1, 0.74]],
    belt: [[0, 0.92], [0.3, 0.98], [0.72, 0.95], [1, 0.84]],
    glass: [0.2, 0.705],
    roof: [0.34, 0.6],
    pillars: [[0.225, 0.26], [0.44, 0.465]],
    tumble: 0.74,
  },
  suv: {
    length: 5.0,
    halfWidth: 0.99,
    wheelR: 0.39,
    axles: [0.19, 0.79],
    top: [[0, 0.95], [0.03, 1.1], [0.06, 1.8], [0.1, 1.86], [0.6, 1.86], [0.7, 1.55], [0.78, 1.22], [0.92, 1.16], [0.98, 1.05], [1, 0.84]],
    bottom: [[0, 0.52], [0.04, 0.36], [0.96, 0.36], [1, 0.5]],
    width: [[0, 0.88], [0.03, 0.97], [0.1, 1.0], [0.9, 1.0], [0.97, 0.94], [1, 0.82]],
    belt: [[0, 1.2], [0.3, 1.24], [0.75, 1.2], [1, 1.12]],
    glass: [0.05, 0.76],
    roof: [0.1, 0.62],
    pillars: [[0.05, 0.09], [0.3, 0.33], [0.5, 0.53]],
    tumble: 0.84,
  },
  van: {
    length: 5.6,
    halfWidth: 1.0,
    wheelR: 0.38,
    axles: [0.17, 0.74],
    top: [[0, 1.0], [0.015, 2.28], [0.7, 2.3], [0.8, 2.12], [0.88, 1.55], [0.93, 1.2], [0.98, 1.08], [1, 0.86]],
    bottom: [[0, 0.5], [0.03, 0.34], [0.97, 0.34], [1, 0.48]],
    width: [[0, 0.95], [0.02, 1.0], [0.95, 1.0], [0.99, 0.93], [1, 0.84]],
    belt: [[0, 1.25], [0.8, 1.25], [1, 1.18]],
    glass: [0.72, 0.9],
    roof: [0.02, 0.82],
    pillars: [[0.79, 0.81]],
    tumble: 0.9,
  },
}

/** Paint material, optionally carrying a livery canvas in its colour map. */
export function paint(color, { metallic = 0.35, roughness = 0.32, map = null } = {}) {
  return new THREE.MeshPhysicalMaterial({ color: map ? 0xffffff : color, map, metalness: metallic, roughness, clearcoat: 1, clearcoatRoughness: 0.06 })
}

export const glassMaterial = () => new THREE.MeshPhysicalMaterial({ color: 0x0b0f14, roughness: 0.04, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02 })

/**
 * Livery canvas in body UV space: u runs rear → front, v runs from the sill
 * (0) to the roof (1). `draw(ctx, w, h)` paints on top of the base colour.
 */
export function livery(base, draw, { w = 2048, h = 1024, seams = [] } = {}) {
  const c = canvas(w, h)
  const ctx = c.getContext("2d")
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)
  if (draw) draw(ctx, w, h)
  // Door shut lines and handles, below the beltline only.
  ctx.strokeStyle = "rgba(0,0,0,0.55)"
  ctx.lineWidth = 3
  for (const u of seams) {
    ctx.beginPath()
    ctx.moveTo(u * w, h * 0.12)
    ctx.lineTo(u * w, h * 0.5)
    ctx.stroke()
    ctx.fillStyle = "rgba(10,10,10,0.7)"
    ctx.fillRect(u * w - 58, h * 0.44, 34, 8)
  }
  const tex = toTexture(c, { anisotropy: 8 })
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

function loft(style, { paintMat, glassMat, trimMat }) {
  const S = STYLES[style]
  const L = S.length
  const top = curve(S.top)
  const bottomBase = curve(S.bottom)
  const width = curve(S.width)
  const belt = curve(S.belt)
  const R = S.wheelR
  const archR = R + 0.07
  const axleX = S.axles.map((a) => a * L)
  const bottom = (t) => {
    let b = bottomBase(t)
    const x = t * L
    for (const ax of axleX) {
      const dx = x - ax
      if (Math.abs(dx) < archR) b = Math.max(b, R + Math.sqrt(archR * archR - dx * dx) * 0.92)
    }
    return b
  }

  const STATIONS = 140
  const LEVELS = 26
  const rows = []
  for (let i = 0; i <= STATIONS; i++) {
    const t = i / STATIONS
    const yb = bottom(t)
    const yt = Math.max(top(t), yb + 0.05)
    const hw = S.halfWidth * width(t)
    const bl = Math.min(belt(t), yt - 0.04)
    const rr = Math.min(0.07, (yt - bl) * 0.6)
    const rb = Math.min(0.07, (bl - yb) * 0.4)
    const side = []
    for (let k = 0; k <= LEVELS; k++) {
      const s = k / LEVELS
      // Denser sampling near sill, beltline and roof.
      const y = s < 0.5 ? yb + (bl - yb) * (1 - Math.cos(s * Math.PI)) : bl + (yt - bl) * Math.sin((s - 0.5) * Math.PI)
      let w
      if (y <= bl) {
        const d = y - yb
        w = d < rb ? hw - rb + Math.sqrt(Math.max(0, rb * rb - (rb - d) * (rb - d))) : hw
      } else {
        const g = (y - bl) / Math.max(1e-4, yt - bl)
        w = hw * (1 - (1 - S.tumble) * Math.pow(g, 0.9))
        const dTop = yt - y
        if (dTop < rr) w *= Math.sqrt(Math.max(0, 1 - Math.pow((rr - dTop) / rr, 2)))
      }
      side.push([w, y])
    }
    rows.push({ t, yb, yt, bl, side })
  }

  // Ring per station: right side up (z > 0), then left side down (z < 0).
  const ring = (row) => [...row.side.map(([w, y]) => [w, y]), ...[...row.side].reverse().map(([w, y]) => [-w, y])]
  const N = (LEVELS + 1) * 2
  const pos = []
  const uv = []
  for (const row of rows) {
    const pts = ring(row)
    pts.forEach(([z, y], j) => {
      pos.push(row.t * L - L / 2, y, z)
      const onRight = j <= LEVELS
      const v = (y - row.yb) / Math.max(1e-4, row.yt - row.yb)
      uv.push(onRight ? row.t : 1 - row.t, v)
    })
  }
  const paintIdx = []
  const glassIdx = []
  const isGlass = (t, y, row) => {
    if (t < S.glass[0] || t > S.glass[1]) return false
    if (S.pillars.some(([a, b]) => t >= a && t <= b)) return false
    if (y < row.bl + 0.03) return false
    const inRoof = t > S.roof[0] && t < S.roof[1]
    if (inRoof && y > row.yt - 0.075) return false
    return true
  }
  for (let i = 0; i < STATIONS; i++) {
    for (let j = 0; j < N - 1; j++) {
      const a = i * N + j, b = (i + 1) * N + j, c = (i + 1) * N + j + 1, d = i * N + j + 1
      const row = rows[i]
      const tc = (i + 0.5) / STATIONS
      const yc = (pos[a * 3 + 1] + pos[c * 3 + 1]) / 2
      const target = isGlass(tc, yc, row) ? glassIdx : paintIdx
      target.push(a, b, d, b, c, d)
    }
  }
  // Two plain meshes rather than one mesh with material groups: the path
  // tracer mis-assigns grouped materials across meshes.
  const subset = (indices) => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(indices)
    g.computeVertexNormals()
    return g
  }
  const body = new THREE.Group()
  body.add(new THREE.Mesh(subset(paintIdx), paintMat), new THREE.Mesh(subset(glassIdx), glassMat))

  // End caps: fan each end ring to its centroid so the body is closed.
  const caps = new THREE.Group()
  for (const [row, flip] of [[rows[0], 1], [rows[rows.length - 1], -1]]) {
    const pts = ring(row)
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
    const x = row.t * L - L / 2
    const verts = [x, cy, 0]
    for (const [z, y] of pts) verts.push(x, y, z)
    const idx = []
    for (let j = 1; j < pts.length; j++) flip > 0 ? idx.push(0, j + 1, j) : idx.push(0, j, j + 1)
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    caps.add(new THREE.Mesh(g, trimMat))
  }
  return { body, caps, S, rows, axleX, L, top, width, belt }
}

function wheel(R, width = 0.25, { rimMat, tireMat }) {
  const g = new THREE.Group()
  const inner = R * 0.64
  const profile = [
    [inner, -width / 2],
    [R * 0.9, -width / 2 - 0.004],
    [R * 0.975, -width / 2 + 0.02],
    [R, -width / 2 + 0.06],
    [R, width / 2 - 0.06],
    [R * 0.975, width / 2 - 0.02],
    [R * 0.9, width / 2 + 0.004],
    [inner, width / 2],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const tire = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), tireMat)
  tire.rotation.x = Math.PI / 2
  g.add(tire)
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(inner, inner, width * 0.8, 48), M.matte(0x1a1c1f, 0.5))
  rim.rotation.x = Math.PI / 2
  g.add(rim)
  // Outer face: spokes + hub, on the +z side (the mirror copy faces -z).
  const face = new THREE.Group()
  face.position.z = width * 0.4
  const barrel = new THREE.Mesh(new THREE.TorusGeometry(inner - 0.012, 0.014, 10, 48), rimMat)
  face.add(barrel)
  for (let k = 0; k < 6; k++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.045, inner * 0.95, 0.03), rimMat)
    spoke.position.set(0, 0, 0)
    spoke.rotation.z = (k / 6) * Math.PI * 2
    spoke.translateY(inner * 0.47)
    face.add(spoke)
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.05, 24), rimMat)
  hub.rotation.x = Math.PI / 2
  face.add(hub)
  g.add(face)
  return g
}

/**
 * Build a vehicle.
 * @param {object} o
 * @param {"sedan"|"suv"|"van"} o.style
 * @param {THREE.Material} o.paint  body material (use `paint()`; can carry a livery map)
 * @param {boolean} [o.headlights] emissive headlights
 * @param {boolean} [o.lightbar]   roof lightbar (emergency vehicles)
 * @param {boolean} [o.lightsOn]   lightbar lit
 * @param {boolean} [o.pushBar]    front push bar
 */
export function buildVehicle({ style = "sedan", paint: paintMat, headlights = true, lightbar = false, lightsOn = true, pushBar = false }) {
  const trimMat = M.paint(0x121315, 0.5, 0.3)
  const glassMat = glassMaterial()
  const { body, caps, S, axleX, L, top, width } = loft(style, { paintMat, glassMat, trimMat })
  const car = new THREE.Group()
  car.add(body, caps)

  const rimMat = new THREE.MeshPhysicalMaterial({ color: 0xc4c8ce, metalness: 1, roughness: 0.22 })
  const tireMat = new THREE.MeshPhysicalMaterial({ color: 0x151515, roughness: 0.82 })
  const track = S.halfWidth * 0.86
  for (const ax of axleX) {
    for (const side of [1, -1]) {
      const w = wheel(S.wheelR, 0.25, { rimMat, tireMat })
      w.position.set(ax - L / 2, S.wheelR, side * track)
      if (side < 0) w.rotation.y = Math.PI
      car.add(w)
    }
  }

  // Fascia: dark lamp housings with slim emissive strips, grille, intake,
  // valances and plate. Everything sits on the end faces of the loft.
  const hw = S.halfWidth
  const frontX = L / 2
  const rearX = -L / 2
  const fw = hw * width(1)
  const rw = hw * width(0)
  const fTop = top(1)
  const rTop = top(0)
  const housing = new THREE.MeshPhysicalMaterial({ color: 0x0c0d0f, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 })
  const drl = M.emissive(0xf2f6ff, headlights ? 10 : 0.3)
  const tail = M.emissive(0xff1a1f, 3.5)
  const addBox = (w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    car.add(m)
    return m
  }
  for (const side of [1, -1]) {
    const z = side * fw * 0.64
    addBox(0.1, 0.1, 0.42, housing, frontX - 0.04, fTop - 0.1, z)
    addBox(0.02, 0.022, 0.38, drl, frontX + 0.012, fTop - 0.066, z)
    addBox(0.02, 0.045, 0.12, drl, frontX + 0.012, fTop - 0.118, z + side * 0.1)
    const rz = side * rw * 0.64
    addBox(0.1, 0.09, 0.44, housing, rearX + 0.04, rTop - 0.12, rz)
    addBox(0.02, 0.05, 0.4, tail, rearX - 0.012, rTop - 0.12, rz)
  }
  addBox(0.06, 0.12, fw * 1.0, housing, frontX - 0.02, fTop - 0.22, 0)
  addBox(0.02, 0.11, 0.52, M.matte(0xf1f1ea, 0.5), rearX - 0.005, rTop - 0.3, 0)
  // Side skirts between the wheel arches.
  const [ra, fa] = axleX
  const skirtLen = fa - ra - (S.wheelR + 0.1) * 2
  for (const side of [1, -1]) addBox(skirtLen, 0.07, 0.04, trimMat, (ra + fa) / 2 - L / 2, curve(S.bottom)(0.5) + 0.035, side * (hw * width(0.5) - 0.005))

  // Door mirrors at the base of the windscreen.
  const mirrorT = style === "van" ? 0.9 : style === "suv" ? 0.77 : 0.7
  for (const side of [1, -1]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), trimMat)
    m.position.set(mirrorT * L - L / 2, curve(STYLES[style].belt)(mirrorT) + 0.08, side * (hw * width(mirrorT) + 0.06))
    car.add(m)
  }

  if (lightbar) {
    const roofT = (S.roof[0] + S.roof[1]) / 2
    const y = top(roofT)
    const bar = new THREE.Group()
    bar.position.set(roofT * L - L / 2 + 0.25, y + 0.01, 0)
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 1.3), trimMat)
    base.position.y = 0.03
    bar.add(base)
    const red = lightsOn ? M.emissive(0xff2330, 7) : M.paint(0x5a0d10, 0.2, 1)
    const blue = lightsOn ? M.emissive(0x2f6bff, 8) : M.paint(0x0d1e5a, 0.2, 1)
    for (const [side, mat] of [[1, red], [-1, blue]]) {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.6), mat)
      pod.position.set(0, 0.095, side * 0.32)
      bar.add(pod)
    }
    car.add(bar)
  }

  if (pushBar) {
    const pb = new THREE.Group()
    pb.position.set(frontX + 0.08, 0, 0)
    for (const side of [1, -1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.62, 0.05), trimMat)
      post.position.set(0, 0.55, side * 0.36)
      pb.add(post)
    }
    for (const y of [0.4, 0.82]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.8), trimMat)
      rail.position.set(0.01, y, 0)
      pb.add(rail)
    }
    car.add(pb)
  }

  car.userData.length = L
  return car
}
