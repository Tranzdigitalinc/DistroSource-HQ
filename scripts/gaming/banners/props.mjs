// Reusable interior props for DistroSource Gaming scenes.
// Units are metres. Every prop takes a parent group and returns its group.
import * as THREE from "three"
import { box, cylinder, plane, materials as M, canvas, toTexture, rng } from "/scripts/gaming/banners/lib.mjs"

function group(parent, { x = 0, y = 0, z = 0, ry = 0 } = {}) {
  const g = new THREE.Group()
  g.position.set(x, y, z)
  g.rotation.y = ry
  parent.add(g)
  return g
}

function lathe(points, mat, seg = 48) {
  return new THREE.Mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat)
}

/** Diner booth bench: plinth, seat cushion, channel-tufted back, chrome cap. Faces +x before rotation. */
export function booth(parent, { x, z, ry = 0, width = 1.2, vinyl, chrome, plinth }) {
  const g = group(parent, { x, z, ry })
  box(g, { w: 0.56, h: 0.34, d: width, mat: plinth ?? M.paint(0x2b1f1d, 0.5, 0.2), r: 0.02 })
  box(g, { w: 0.58, h: 0.035, d: width + 0.02, y: 0.02, mat: chrome, r: 0.01 })
  box(g, { w: 0.54, h: 0.13, d: width - 0.02, y: 0.33, mat: vinyl, r: 0.055, seg: 4 })
  const channels = Math.max(3, Math.round(width / 0.28))
  const cw = (width - 0.03) / channels
  for (let i = 0; i < channels; i++) {
    box(g, { w: 0.15, h: 0.64, d: cw - 0.012, x: -0.22, y: 0.44, z: -width / 2 + 0.015 + cw * (i + 0.5), mat: vinyl, r: 0.06, seg: 4 })
  }
  box(g, { w: 0.2, h: 0.04, d: width + 0.02, x: -0.23, y: 1.07, mat: chrome, r: 0.018 })
  return g
}

/** Counter stool: weighted base, pole, foot ring and a domed cushion. */
export function stool(parent, { x, z, vinyl, chrome }) {
  const g = group(parent, { x, z })
  const base = lathe([[0, 0], [0.2, 0], [0.2, 0.012], [0.17, 0.035], [0.04, 0.05], [0, 0.05]], chrome)
  g.add(base)
  cylinder(g, { r: 0.028, h: 0.66, mat: chrome, seg: 24 })
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.012, 12, 48), chrome)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.3
  g.add(ring)
  cylinder(g, { r: 0.2, h: 0.03, y: 0.64, mat: chrome, seg: 48 })
  const cushion = lathe([[0, 0], [0.205, 0], [0.215, 0.03], [0.205, 0.075], [0.15, 0.1], [0, 0.105]], vinyl, 56)
  cushion.position.y = 0.66
  g.add(cushion)
  return g
}

/** Bell pendant with a real circular area light for soft, directional shadows. */
export function pendant(parent, PT, { x, z, ceiling, drop = 0.95, shadeMat, color = 0xffd6a6, intensity = 20, radius = 0.2 }) {
  const g = group(parent, { x, z })
  const y = ceiling - drop
  cylinder(g, { r: 0.004, h: drop - 0.1, y: y + 0.1, mat: M.matte(0x111111), seg: 8 })
  const shade = lathe(
    [[0.02, 0.2], [0.05, 0.19], [0.09, 0.14], [radius * 0.78, 0.05], [radius, 0], [radius - 0.006, 0.0], [radius * 0.76, 0.045], [0.085, 0.135], [0.045, 0.18]],
    shadeMat,
  )
  shade.position.y = y
  g.add(shade)
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 14), M.emissive(color, 16))
  bulb.position.y = y + 0.05
  g.add(bulb)
  const light = new PT.ShapedAreaLight(color, intensity, radius * 1.3, radius * 1.3)
  light.isCircular = true
  light.position.set(0, y + 0.01, 0)
  light.rotation.x = -Math.PI / 2
  g.add(light)
  return g
}

/** Recessed ceiling downlight: trim ring, diffuser disc, circular area light. */
export function downlight(parent, PT, { x, z, ceiling, color = 0xfff0dc, intensity = 9, radius = 0.09 }) {
  const g = group(parent, { x, z })
  const trim = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.012, 0.012, 10, 40), M.paint(0xf2f2f0, 0.3, 0.2))
  trim.rotation.x = Math.PI / 2
  trim.position.y = ceiling - 0.006
  g.add(trim)
  const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 40), M.emissive(color, 3.2))
  disc.rotation.x = Math.PI / 2
  disc.position.y = ceiling - 0.004
  g.add(disc)
  const light = new PT.ShapedAreaLight(color, intensity, radius * 2, radius * 2)
  light.isCircular = true
  light.position.y = ceiling - 0.01
  light.rotation.x = -Math.PI / 2
  g.add(light)
  return g
}

/** A framed print. `draw(ctx, w, h)` paints the artwork. Faces -z before rotation. */
export function framedPrint(parent, { x, y, z, ry = 0, w, h, draw, frame = 0x151515, mat = 0.06 }) {
  const g = group(parent, { x, y, z, ry })
  box(g, { w: w + 0.06, h: h + 0.06, d: 0.03, y: -(h + 0.06) / 2, mat: M.paint(frame, 0.35, 0.4), r: 0.006 })
  const px = 900
  const c = canvas(px, Math.round((px * h) / w))
  draw(c.getContext("2d"), c.width, c.height)
  const tex = toTexture(c)
  const art = plane(g, { w: w - mat * 2, h: h - mat * 2, z: -0.017, ry: Math.PI, mat: new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.1 }) })
  art.position.y = 0
  plane(g, { w, h, z: -0.0165, ry: Math.PI, mat: M.matte(0xf3efe6, 0.9) })
  return g
}

/** Wall clock with a drawn face. Faces -z before rotation. */
export function wallClock(parent, { x, y, z, ry = 0, r = 0.22, time = [8, 42] }) {
  const g = group(parent, { x, y, z, ry })
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.05, 48), M.chrome())
  rim.rotation.x = Math.PI / 2
  g.add(rim)
  const c = canvas(512)
  const ctx = c.getContext("2d")
  ctx.fillStyle = "#f7f3ea"
  ctx.fillRect(0, 0, 512, 512)
  ctx.translate(256, 256)
  ctx.strokeStyle = "#1a1a1a"
  for (let i = 0; i < 60; i++) {
    ctx.lineWidth = i % 5 === 0 ? 10 : 3
    const len = i % 5 === 0 ? 34 : 14
    const a = (i / 60) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(Math.sin(a) * (236 - len), -Math.cos(a) * (236 - len))
    ctx.lineTo(Math.sin(a) * 236, -Math.cos(a) * 236)
    ctx.stroke()
  }
  const hand = (angle, length, width, color = "#1a1a1a") => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.sin(angle) * length, -Math.cos(angle) * length)
    ctx.stroke()
  }
  hand(((time[0] % 12) + time[1] / 60) / 12 * Math.PI * 2, 120, 16)
  hand((time[1] / 60) * Math.PI * 2, 190, 10)
  hand(0.6, 200, 4, "#c0392b")
  const face = new THREE.Mesh(new THREE.CircleGeometry(r * 0.92, 48), new THREE.MeshPhysicalMaterial({ map: toTexture(c), roughness: 0.4, clearcoat: 1 }))
  face.position.z = -0.026
  face.rotation.y = Math.PI
  g.add(face)
  return g
}

/** Potted plant: tapered pot, soil and a cluster of glossy leaves. */
export function plant(parent, { x, z, y = 0, scale = 1, seed = 5 }) {
  const g = group(parent, { x, y, z })
  g.scale.setScalar(scale)
  g.add(lathe([[0, 0], [0.15, 0], [0.19, 0.42], [0.2, 0.44], [0, 0.44]], M.paint(0x2a2d31, 0.45, 0.3)))
  const leafMat = new THREE.MeshPhysicalMaterial({ color: 0x2f5d2a, roughness: 0.45, sheen: 0.4, sheenColor: new THREE.Color(0x6fae5a), side: THREE.DoubleSide })
  const leafGeo = new THREE.SphereGeometry(0.1, 12, 8)
  leafGeo.scale(1, 0.12, 0.42)
  const r = rng(seed)
  for (let i = 0; i < 38; i++) {
    const leaf = new THREE.Mesh(leafGeo, leafMat)
    const a = r() * Math.PI * 2
    const h = 0.45 + r() * 0.75
    const out = 0.05 + r() * 0.22
    leaf.position.set(Math.cos(a) * out, h, Math.sin(a) * out)
    leaf.rotation.set(-0.5 + r() * 1.2, a, 0.3 + r() * 0.6)
    leaf.scale.setScalar(0.8 + r() * 0.9)
    g.add(leaf)
  }
  return g
}

/** Jukebox against a wall, facing +x before rotation. */
export function jukebox(parent, PT, { x, z, ry = 0 }) {
  const g = group(parent, { x, z, ry })
  const body = M.paint(0x6b1a1a, 0.3, 0.9)
  box(g, { w: 0.62, h: 1.25, d: 0.95, mat: body, r: 0.05 })
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.6, 48, 1, false, 0, Math.PI), M.emissive(0xffb45a, 1.4))
  arch.rotation.set(0, 0, Math.PI / 2)
  arch.rotation.y = Math.PI / 2
  arch.position.set(0, 1.25, 0)
  g.add(arch)
  box(g, { w: 0.64, h: 0.36, d: 0.7, x: 0.02, y: 0.3, mat: M.chrome(), r: 0.03 })
  box(g, { w: 0.03, h: 0.32, d: 0.66, x: 0.33, y: 0.78, mat: M.emissive(0x7fd4ff, 1.4), r: 0.005 })
  const glow = new PT.ShapedAreaLight(0xffb45a, 1.1, 0.5, 0.5)
  glow.position.set(0.4, 1.3, 0)
  glow.rotation.y = Math.PI / 2
  g.add(glow)
  return g
}

/** Door with a push bar and an illuminated EXIT sign. Faces +x before rotation. */
export function exitDoor(parent, { x, z, ry = 0, color = 0x2c3a3f }) {
  const g = group(parent, { x, z, ry })
  box(g, { w: 0.08, h: 2.25, d: 1.16, mat: M.paint(0x1b1e21, 0.4, 0.2), r: 0.01 })
  box(g, { w: 0.05, h: 2.12, d: 0.98, x: 0.04, mat: M.paint(color, 0.35, 0.5), r: 0.01 })
  box(g, { w: 0.05, h: 0.05, d: 0.72, x: 0.1, y: 1.0, mat: M.chrome(), r: 0.02 })
  const c = canvas(512, 192)
  const ctx = c.getContext("2d")
  ctx.fillStyle = "#07210f"
  ctx.fillRect(0, 0, 512, 192)
  ctx.fillStyle = "#4dff88"
  ctx.font = "800 120px Bahnschrift, 'Segoe UI', sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("EXIT", 256, 100)
  const tex = toTexture(c)
  box(g, { w: 0.08, h: 0.16, d: 0.42, x: 0.03, y: 2.4, mat: M.paint(0xe8e8e2, 0.4, 0.2), r: 0.01 })
  plane(g, { w: 0.4, h: 0.14, x: 0.075, y: 2.48, ry: Math.PI / 2, mat: new THREE.MeshPhysicalMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 2.2, roughness: 0.6 }) })
  return g
}

/** Glass sugar pourer with a chrome cap. */
export function sugarPourer(parent, { x, y, z }) {
  const g = group(parent, { x, y, z })
  g.add(lathe([[0, 0], [0.035, 0], [0.038, 0.08], [0.03, 0.11], [0, 0.11]], M.glass(0xf6f1e6)))
  const cap = lathe([[0, 0.105], [0.031, 0.105], [0.028, 0.14], [0.008, 0.16], [0, 0.16]], M.chrome())
  g.add(cap)
  return g
}

/** Squeeze bottle. */
export function bottle(parent, { x, y, z, color }) {
  const g = group(parent, { x, y, z })
  g.add(lathe([[0, 0], [0.028, 0], [0.03, 0.12], [0.02, 0.15], [0.006, 0.19], [0, 0.19]], M.paint(color, 0.3, 0.8)))
  return g
}
