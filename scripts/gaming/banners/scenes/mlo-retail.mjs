// FiveM MLO — "Corner Mart" convenience store at dusk (Retail Interiors).
// Room: x ∈ [-6, 6], z ∈ [-4, 4], ceiling 3.0 m.
// Shop window at z = -4, fridge wall at x = +6, counter and sign wall at
// x = -6, wall bays along z = +4, three gondola aisles running along z.
// Views: "cover" (default, across the aisles) and "counter".
import * as P from "/scripts/gaming/banners/props.mjs"

export function build({ THREE, PT, lib, view }) {
  const { box, cylinder, plane, materials: M } = lib
  const scene = new THREE.Scene()

  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x1b2a52)
  sky.bottomColor.set(0xe0885a)
  sky.exponent = 3
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.45

  const W = 12, D = 8, H = 3.0
  const room = new THREE.Group()
  scene.add(room)
  const r = lib.rng(27)

  const wallMat = lib.plaster({ color: 0xf1efe9, repeat: [5, 1.2] })
  const brand = M.paint(0x1f6f5c, 0.4, 0.5)
  const dark = M.paint(0x202327, 0.45, 0.3)
  const shelfMat = M.paint(0xe9ebee, 0.35, 0.4)
  const strip = M.paint(0xfff1b8, 0.5, 0.2)
  const chrome = M.chrome()
  const PAL = [0xe63946, 0xf4a261, 0x2a9d8f, 0x264653, 0xe9c46a, 0x8ecae6, 0x219ebc, 0xffb703, 0xfb8500, 0x6a4c93, 0x43aa8b, 0xf94144, 0xf1faee, 0x1d3557].map((c) => M.paint(c, 0.5, 0.35))
  const DRINKS = [0xd62828, 0x2a9d8f, 0xf77f00, 0x3a86ff, 0x8338ec, 0x06d6a0, 0xfcbf49, 0xef476f].map((c) => M.paint(c, 0.25, 0.8))
  const pick = (list) => list[Math.floor(r() * list.length)]

  /**
   * Stock one shelf with runs ("facings") of the same product.
   * axis "z": the shelf runs along z at x = c; axis "x": along x at z = c.
   */
  const fillShelf = (axis, c, y, t0, t1, maxH, depth = 0.26) => {
    let t = t0 + 0.04
    while (t < t1 - 0.08) {
      const n = 2 + Math.floor(r() * 4)
      const can = r() < 0.35
      const h = Math.min(maxH, can ? 0.11 + r() * 0.09 : 0.13 + r() * 0.16)
      const face = can ? 0.072 : 0.06 + r() * 0.08
      const mat = pick(PAL)
      for (let k = 0; k < n && t + face < t1 - 0.03; k++) {
        const along = t + face / 2
        const [x, z] = axis === "z" ? [c, along] : [along, c]
        if (can) cylinder(room, { r: 0.033, h, x, y, z, mat, seg: 14 })
        else box(room, axis === "z" ? { w: depth, h, d: face - 0.008, x, y, z, mat, r: 0 } : { w: face - 0.008, h, d: depth, x, y, z, mat, r: 0 })
        t += face
      }
      t += 0.015
    }
  }
  const sign = (lines, opts) => lib.textTexture(lines, { width: 1024, height: 256, bg: "#1f6f5c", fg: "#f4f1ea", font: "700 92px Bahnschrift, 'Segoe UI', sans-serif", ...opts })
  const lit = (tex, intensity = 1.2) => new THREE.MeshPhysicalMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: intensity, roughness: 0.6 })

  /* ---------------- shell ---------------- */
  plane(room, { w: W, h: D, rx: -Math.PI / 2, mat: lib.tiles({ count: 24, repeat: [W / 3, D / 3], a: 0xe7e5df, b: 0xcfd3d6, gloss: 0.2 }) })
  plane(room, { w: W, h: D, y: H, rx: Math.PI / 2, mat: lib.plaster({ color: 0xf5f5f2, repeat: [6, 4] }) })
  const wall = (w, h, pos, ry) => plane(room, { w, h, ...pos, ry, mat: wallMat })
  wall(W, H, { y: H / 2, z: D / 2 }, Math.PI)
  wall(D, H, { x: -W / 2, y: H / 2 }, Math.PI / 2)
  wall(D, H, { x: W / 2, y: H / 2 }, -Math.PI / 2)
  box(room, { w: W, h: 0.14, d: 0.04, z: D / 2 - 0.02, mat: dark, r: 0 })
  box(room, { w: 0.04, h: 0.14, d: D, x: -W / 2 + 0.02, mat: dark, r: 0 })
  box(room, { w: W, h: 0.2, d: 0.03, y: 2.42, z: D / 2 - 0.015, mat: brand, r: 0 })
  box(room, { w: 0.03, h: 0.2, d: D, x: -W / 2 + 0.015, y: 2.42, mat: brand, r: 0 })

  // Shop window: sill, header, mullions, glazing, a door with a push bar.
  box(room, { w: W, h: 0.45, d: 0.14, z: -D / 2 - 0.07, mat: dark, r: 0.01 })
  box(room, { w: W, h: 0.42, d: 0.14, y: H - 0.42, z: -D / 2 - 0.07, mat: brand, r: 0 })
  for (let i = 0; i <= 8; i++) box(room, { w: 0.07, h: H - 0.87, d: 0.12, x: -W / 2 + (i * W) / 8, y: 0.45, z: -D / 2 - 0.04, mat: dark, r: 0.004 })
  plane(room, { w: W, h: H - 0.9, y: 0.45 + (H - 0.9) / 2, z: -D / 2 - 0.05, mat: M.glass(0xf6f8fa) })
  box(room, { w: 0.9, h: 0.05, d: 0.06, x: 3.75, y: 1.05, z: -D / 2 + 0.03, mat: chrome, r: 0.02 })
  const open = lib.textTexture(["OPEN 24 HOURS"], { width: 1024, height: 200, bg: "#000", fg: "#ff5b73", font: "italic 800 120px Bahnschrift, 'Segoe UI', sans-serif" })
  plane(room, { w: 1.5, h: 0.3, x: -1.5, y: 2.05, z: -D / 2 + 0.06, mat: new THREE.MeshPhysicalMaterial({ color: 0x050505, emissiveMap: open, emissive: 0xffffff, emissiveIntensity: 5, roughness: 0.9 }) })

  /* ---------------- street outside ---------------- */
  const street = new THREE.Group()
  scene.add(street)
  plane(street, { w: 70, h: 6, y: -0.02, z: -D / 2 - 3, rx: -Math.PI / 2, mat: lib.concrete({ color: 0x77756f, repeat: [14, 1.2], polish: 0.6 }) })
  plane(street, { w: 70, h: 14, y: -0.14, z: -D / 2 - 13, rx: -Math.PI / 2, mat: M.matte(0x26272a, 0.55) })
  const facade = lib.textTexture([], {
    width: 1600,
    height: 800,
    bg: "#34302e",
    draw(ctx) {
      const q = lib.rng(19)
      for (let row = 0; row < 6; row++)
        for (let col = 0; col < 22; col++) {
          ctx.fillStyle = q() > 0.5 ? `hsl(${32 + q() * 16}, ${60 + q() * 25}%, ${52 + q() * 22}%)` : `hsl(215, 18%, ${9 + q() * 6}%)`
          ctx.fillRect(22 + col * 71, 36 + row * 120, 46, 78)
        }
    },
  })
  plane(street, { w: 50, h: 25, y: 10.5, z: -D / 2 - 24, mat: new THREE.MeshPhysicalMaterial({ map: facade, emissiveMap: facade, emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.9 }) })
  for (let i = 0; i < 4; i++) {
    const x = -15 + i * 10
    cylinder(street, { r: 0.07, h: 5, x, z: -D / 2 - 5.6, mat: M.paint(0x1f2226, 0.4, 0.2) })
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), M.emissive(0xffc78a, 12))
    head.position.set(x, 5.05, -D / 2 - 5.6)
    street.add(head)
    const l = new PT.ShapedAreaLight(0xffc78a, 30, 0.5, 0.5)
    l.isCircular = true
    l.position.set(x, 4.9, -D / 2 - 5.6)
    l.rotation.x = -Math.PI / 2
    street.add(l)
  }

  /* ---------------- gondola aisles ---------------- */
  const AISLES = [["AISLE 1", "Snacks · Sweets"], ["AISLE 2", "Pantry · Breakfast"], ["AISLE 3", "Household · Care"]]
  for (const [gi, gx] of [-1.6, 0.8, 3.2].entries()) {
    const z0 = -1.8, z1 = 2.6, L = z1 - z0, zc = (z0 + z1) / 2
    box(room, { w: 0.92, h: 0.12, d: L, x: gx, z: zc, mat: dark, r: 0.005 })
    box(room, { w: 0.05, h: 1.55, d: L, x: gx, y: 0.12, z: zc, mat: shelfMat, r: 0.005 })
    for (const s of [-1, 1])
      for (const y of [0.14, 0.5, 0.86, 1.22]) {
        box(room, { w: 0.42, h: 0.025, d: L, x: gx + s * 0.235, y, z: zc, mat: shelfMat, r: 0.004 })
        box(room, { w: 0.012, h: 0.04, d: L, x: gx + s * 0.452, y: y - 0.012, z: zc, mat: strip, r: 0 })
        fillShelf("z", gx + s * 0.24, y + 0.025, z0, z1, 0.3)
      }
    // End cap facing the camera side, and a hanging aisle sign.
    box(room, { w: 0.92, h: 1.55, d: 0.05, x: gx, y: 0.12, z: z1 + 0.025, mat: brand, r: 0.005 })
    for (const y of [0.5, 0.95]) {
      box(room, { w: 0.86, h: 0.02, d: 0.3, x: gx, y, z: z1 + 0.2, mat: shelfMat, r: 0.004 })
      fillShelf("x", z1 + 0.2, y + 0.02, gx - 0.43, gx + 0.43, 0.26, 0.2)
    }
    const tex = sign(AISLES[gi], { font: "700 80px Bahnschrift, 'Segoe UI', sans-serif", lineHeight: 1.15 })
    for (const ry of [0, Math.PI]) plane(room, { w: 1.1, h: 0.28, x: gx, y: 2.45, z: zc + (ry ? -0.006 : 0.006), ry, mat: lit(tex, 0.9) })
    cylinder(room, { r: 0.006, h: 0.41, x: gx - 0.45, y: 2.59, z: zc, mat: chrome, seg: 8 })
    cylinder(room, { r: 0.006, h: 0.41, x: gx + 0.45, y: 2.59, z: zc, mat: chrome, seg: 8 })
  }

  /* ---------------- fridge wall (x = +6) ---------------- */
  const fx = W / 2, fz0 = -2.8, doors = 6, dw = 1.0, fh = 2.2, fd = 0.75
  const fmid = fz0 + (doors * dw) / 2
  plane(room, { w: doors * dw, h: fh - 0.2, x: fx - 0.02, y: 0.2 + (fh - 0.2) / 2, z: fmid, ry: -Math.PI / 2, mat: M.emissive(0xeef6ff, 1.1) })
  box(room, { w: fd, h: 0.2, d: doors * dw, x: fx - fd / 2, z: fmid, mat: dark, r: 0 })
  box(room, { w: fd, h: H - fh, d: doors * dw + 0.12, x: fx - fd / 2, y: fh, z: fmid, mat: brand, r: 0 })
  // Header sign sits left of centre so the hanging aisle signs never cover it from the cover camera.
  plane(room, { w: 3.2, h: 0.5, x: fx - fd - 0.005, y: fh + (H - fh) / 2, z: fmid - 1.2, ry: -Math.PI / 2, mat: lit(sign(["COLD DRINKS · DAIRY · ICE"], { font: "700 70px Bahnschrift, 'Segoe UI', sans-serif" }), 1.4) })
  for (const z of [fz0 - 0.03, fz0 + doors * dw + 0.03]) box(room, { w: fd, h: fh, d: 0.06, x: fx - fd / 2, z, mat: dark, r: 0 })
  for (let level = 0; level < 5; level++) {
    const y = 0.3 + level * 0.38
    box(room, { w: fd - 0.12, h: 0.015, d: doors * dw, x: fx - fd / 2 + 0.03, y, z: fmid, mat: M.paint(0xcfd6dd, 0.3, 0.3), r: 0 })
    let z = fz0 + 0.05
    while (z < fz0 + doors * dw - 0.06) {
      const mat = pick(DRINKS), n = 3 + Math.floor(r() * 4), tall = r() < 0.5
      for (let k = 0; k < n && z < fz0 + doors * dw - 0.06; k++) {
        cylinder(room, { r: 0.034, h: tall ? 0.26 : 0.16, x: fx - fd + 0.2, y: y + 0.015, z, mat, seg: 14 })
        if (tall) cylinder(room, { r: 0.014, h: 0.05, x: fx - fd + 0.2, y: y + 0.275, z, mat: dark, seg: 10 })
        z += 0.085
      }
      z += 0.03
    }
  }
  for (let i = 0; i <= doors; i++) {
    const z = fz0 + i * dw
    box(room, { w: 0.06, h: fh - 0.2, d: 0.05, x: fx - fd - 0.01, y: 0.2, z, mat: dark, r: 0 })
    box(room, { w: 0.012, h: fh - 0.34, d: 0.02, x: fx - fd + 0.035, y: 0.27, z, mat: M.emissive(0xffffff, 3), r: 0 })
    if (i < doors) {
      plane(room, { w: dw - 0.06, h: fh - 0.25, x: fx - fd - 0.02, y: 0.2 + (fh - 0.2) / 2, z: z + dw / 2, ry: -Math.PI / 2, mat: M.glass(0xf4f8fb) })
      box(room, { w: 0.03, h: 0.7, d: 0.03, x: fx - fd - 0.06, y: 0.85, z: z + dw * 0.86, mat: chrome, r: 0.012 })
    }
  }

  /* ---------------- wall bays (z = +4) ---------------- */
  const bx0 = -4.2, bx1 = 4.9, bxc = (bx0 + bx1) / 2
  for (const y of [0.14, 0.48, 0.82, 1.16, 1.5]) {
    box(room, { w: bx1 - bx0, h: 0.025, d: 0.42, x: bxc, y, z: D / 2 - 0.21, mat: shelfMat, r: 0.004 })
    box(room, { w: bx1 - bx0, h: 0.04, d: 0.012, x: bxc, y: y - 0.012, z: D / 2 - 0.425, mat: strip, r: 0 })
    fillShelf("x", D / 2 - 0.22, y + 0.025, bx0, bx1, 0.29)
  }
  for (let i = 0; i <= 7; i++) box(room, { w: 0.04, h: 1.72, d: 0.44, x: bx0 + (i * (bx1 - bx0)) / 7, z: D / 2 - 0.22, mat: shelfMat, r: 0.004 })
  plane(room, { w: 4.2, h: 0.18, x: bxc, y: 2.52, z: D / 2 - 0.035, ry: Math.PI, mat: lit(sign(["HOUSEHOLD · PERSONAL CARE · PET"], { font: "700 62px Bahnschrift, 'Segoe UI', sans-serif", height: 128 }), 1.1) })
  // Staff door.
  box(room, { w: 0.98, h: 2.12, d: 0.06, x: -5.1, z: D / 2 - 0.03, mat: M.paint(0x3a4046, 0.4, 0.3), r: 0.01 })
  box(room, { w: 0.3, h: 0.08, d: 0.02, x: -5.1, y: 1.6, z: D / 2 - 0.07, mat: lit(lib.textTexture(["STAFF ONLY"], { width: 512, height: 128, bg: "#f4f1ea", fg: "#1c1f22", font: "700 64px Bahnschrift, 'Segoe UI', sans-serif" }), 0.4), r: 0 })
  box(room, { w: 0.3, h: 0.04, d: 0.04, x: -4.8, y: 1.0, z: D / 2 - 0.08, mat: chrome, r: 0.01 })

  /* ---------------- counter and sign wall (x = -6) ---------------- */
  const ccx = -4.5, cz0 = -3.4, cz1 = -0.8, czc = (cz0 + cz1) / 2
  box(room, { w: 0.65, h: 0.98, d: cz1 - cz0, x: ccx, z: czc, mat: brand, r: 0.01 })
  box(room, { w: 0.75, h: 0.04, d: cz1 - cz0 + 0.06, x: ccx, y: 0.98, z: czc, mat: M.laminate(0xf2efe8), r: 0.01 })
  box(room, { w: 0.4, h: 0.2, d: 0.42, x: ccx - 0.08, y: 1.02, z: -2.7, mat: dark, r: 0.03 })
  box(room, { w: 0.03, h: 0.17, d: 0.3, x: ccx + 0.14, y: 1.24, z: -2.7, mat: M.emissive(0x7fe0a0, 0.8), r: 0.005 })
  box(room, { w: 0.12, h: 0.05, d: 0.08, x: ccx + 0.25, y: 1.02, z: -2.2, mat: dark, r: 0.01 })
  box(room, { w: 0.01, h: 0.03, d: 0.05, x: ccx + 0.31, y: 1.05, z: -2.2, mat: M.emissive(0x9fd3ff, 0.8), r: 0 })
  // Impulse rack on the customer side.
  box(room, { w: 0.35, h: 0.95, d: 0.9, x: ccx + 0.55, z: -1.45, mat: shelfMat, r: 0.01 })
  for (const y of [0.35, 0.62]) fillShelf("z", ccx + 0.72, y, -1.9, -1.0, 0.2, 0.1)
  // Behind the counter: accessory shelves and the lit sign.
  for (const y of [1.1, 1.45, 1.8]) {
    box(room, { w: 0.3, h: 0.02, d: cz1 - cz0, x: -W / 2 + 0.15, y, z: czc, mat: shelfMat, r: 0.004 })
    fillShelf("z", -W / 2 + 0.16, y + 0.02, cz0, cz1, 0.22, 0.16)
  }
  box(room, { w: 0.06, h: 0.62, d: 2.9, x: -W / 2 + 0.03, y: 2.18, z: czc, mat: dark, r: 0.01 })
  const mart = lib.textTexture(["CORNER MART"], { width: 2048, height: 420, bg: "#000", fg: "#f4f1ea", font: "800 250px Bahnschrift, 'Segoe UI', sans-serif" })
  plane(room, { w: 2.7, h: 0.55, x: -W / 2 + 0.065, y: 2.49, z: czc, ry: Math.PI / 2, mat: new THREE.MeshPhysicalMaterial({ color: 0x050505, emissiveMap: mart, emissive: 0xffffff, emissiveIntensity: 4, roughness: 0.9 }) })
  P.wallClock(room, { x: -W / 2 + 0.06, y: 1.55, z: 0.4, ry: Math.PI / 2, r: 0.2, time: [9, 5] })
  P.plant(room, { x: 5.2, z: -3.4, scale: 1.1, seed: 8 })

  // Ceiling dome cameras.
  for (const [x, z] of [[-5.6, -0.4], [5.0, 3.6]]) {
    cylinder(room, { r: 0.07, h: 0.04, x, y: H - 0.04, z, mat: M.paint(0xf4f4f2, 0.4, 0.3) })
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.065, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.paint(0x121416, 0.15, 0.9))
    dome.position.set(x, H - 0.04, z)
    room.add(dome)
  }

  /* ---------------- ceiling lighting ---------------- */
  for (const x of [-4.5, -0.4, 2.0, 4.4])
    for (const z of [-2.3, 0.4, 3.0]) {
      box(room, { w: 0.62, h: 0.03, d: 1.22, x, y: H - 0.03, z, mat: M.emissive(0xf3f7ff, 5), r: 0 })
      const l = new PT.ShapedAreaLight(0xf2f6ff, 3, 0.6, 1.2)
      l.position.set(x, H - 0.04, z)
      l.rotation.x = -Math.PI / 2
      room.add(l)
    }

  /* ---------------- camera ---------------- */
  const camera = new PT.PhysicalCamera(56, 1.6, 0.05, 200)
  if (view === "counter") {
    camera.position.set(-1.0, 1.6, -3.35)
    camera.lookAt(-6, 1.45, -1.5)
    camera.fov = 55
  } else {
    camera.position.set(-4.9, 1.72, 3.55)
    camera.lookAt(3.6, 1.05, -2.1)
  }
  camera.fStop = 8
  camera.focusDistance = 7
  camera.apertureBlades = 6

  return { scene, camera, exposure: 1.2, bounces: 6, toneMapping: THREE.NeutralToneMapping }
}
