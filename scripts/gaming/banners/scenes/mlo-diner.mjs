// FiveM MLO — downtown diner interior at dusk.
// Room: x ∈ [-7, 7], z ∈ [-4.5, 4.5], ceiling 3.2 m.
// Window wall + booths at z = -4.5, counter + stools toward z = +4.5,
// far wall (x = -7) dressed as the focal point.
import * as P from "/scripts/gaming/banners/props.mjs"

export function build({ THREE, PT, lib, view }) {
  const { box, cylinder, plane, materials: M } = lib
  const scene = new THREE.Scene()

  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x16244a)
  sky.bottomColor.set(0xe98a55)
  sky.exponent = 3
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.5

  const W = 14, D = 9, H = 3.2
  const room = new THREE.Group()
  scene.add(room)

  const chrome = M.chrome()
  const vinyl = M.vinyl(0x941c22)
  const teal = M.paint(0x1c6668, 0.36, 0.55)
  const upper = lib.plaster({ color: 0xefebe3, repeat: [5, 1.2] })

  /* ---------------- shell ---------------- */
  plane(room, { w: W, h: D, rx: -Math.PI / 2, mat: lib.tiles({ count: 16, repeat: [W / 4, D / 4], a: 0xede8dc, b: 0x16171a, gloss: 0.14 }) })
  // Ceiling with a slight coffer: lower field + perimeter soffit.
  plane(room, { w: W, h: D, y: H, rx: Math.PI / 2, mat: lib.plaster({ color: 0xf6f5f1, repeat: [6, 4] }) })
  box(room, { w: W, h: 0.22, d: 0.5, y: H - 0.22, z: D / 2 - 0.25, mat: upper, r: 0 })

  const wall = (w, h, pos, ry) => plane(room, { w, h, ...pos, ry, mat: upper })
  wall(W, H - 1.1, { y: 1.1 + (H - 1.1) / 2, z: D / 2 }, Math.PI)
  wall(D, H - 1.1, { x: -W / 2, y: 1.1 + (H - 1.1) / 2 }, Math.PI / 2)
  wall(D, H - 1.1, { x: W / 2, y: 1.1 + (H - 1.1) / 2 }, -Math.PI / 2)
  // Glossy teal wainscot with a chrome cap rail on three walls.
  box(room, { w: W, h: 1.1, d: 0.05, z: D / 2 - 0.025, mat: teal, r: 0.004 })
  box(room, { w: 0.05, h: 1.1, d: D, x: -W / 2 + 0.025, mat: teal, r: 0.004 })
  box(room, { w: 0.05, h: 1.1, d: D, x: W / 2 - 0.025, mat: teal, r: 0.004 })
  box(room, { w: W, h: 0.045, d: 0.07, y: 1.1, z: D / 2 - 0.035, mat: chrome, r: 0.012 })
  box(room, { w: 0.07, h: 0.045, d: D, x: -W / 2 + 0.035, y: 1.1, mat: chrome, r: 0.012 })
  // Black-and-white skirting band.
  box(room, { w: W, h: 0.12, d: 0.06, z: D / 2 - 0.03, mat: M.paint(0x121314, 0.3, 0.6), r: 0.004 })

  // Window wall: sill, mullions, glazing, header.
  box(room, { w: W, h: 0.72, d: 0.14, z: -D / 2 - 0.07, mat: teal, r: 0.01 })
  box(room, { w: W, h: 0.05, d: 0.2, y: 0.72, z: -D / 2 - 0.03, mat: chrome, r: 0.012 })
  box(room, { w: W, h: 0.55, d: 0.14, y: H - 0.55, z: -D / 2 - 0.07, mat: upper, r: 0 })
  const frame = M.paint(0x1c1f23, 0.4, 0.2)
  for (let i = 0; i <= 7; i++) box(room, { w: 0.08, h: H - 1.27, d: 0.12, x: -W / 2 + (i * W) / 7, y: 0.72, z: -D / 2 - 0.04, mat: frame, r: 0.004 })
  box(room, { w: W, h: 0.07, d: 0.12, y: H - 0.6, z: -D / 2 - 0.04, mat: frame, r: 0.004 })
  plane(room, { w: W, h: H - 1.32, y: 0.75 + (H - 1.32) / 2, z: -D / 2 - 0.05, mat: M.glass(0xf6f8fa) })

  /* ---------------- street outside ---------------- */
  const street = new THREE.Group()
  scene.add(street)
  plane(street, { w: 70, h: 6, y: -0.02, z: -D / 2 - 3, rx: -Math.PI / 2, mat: lib.concrete({ color: 0x77756f, repeat: [14, 1.2], polish: 0.6 }) })
  plane(street, { w: 70, h: 14, y: -0.14, z: -D / 2 - 13, rx: -Math.PI / 2, mat: M.matte(0x26272a, 0.55) })
  const facade = lib.textTexture([], {
    width: 1600,
    height: 800,
    bg: "#3b3431",
    draw(ctx) {
      const r = lib.rng(9)
      ctx.fillStyle = "#2a2422"
      for (let b = 0; b < 5; b++) ctx.fillRect(b * 330 + 20, 0, 12, 800)
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 22; col++) {
          const lit = r() > 0.5
          ctx.fillStyle = lit ? `hsl(${32 + r() * 16}, ${60 + r() * 25}%, ${52 + r() * 22}%)` : `hsl(215, 18%, ${9 + r() * 6}%)`
          ctx.fillRect(22 + col * 71, 36 + row * 120, 46, 78)
        }
      }
      ctx.fillStyle = "#111"
      ctx.fillRect(0, 740, 1600, 60)
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

  /* ---------------- booths ---------------- */
  const tableTop = M.laminate(0xf4f0e6)
  for (let i = 0; i < 5; i++) {
    const x = -5.3 + i * 2.3
    const z = -D / 2 + 0.72
    P.booth(room, { x: x - 0.74, z, ry: 0, width: 1.2, vinyl, chrome })
    P.booth(room, { x: x + 0.74, z, ry: Math.PI, width: 1.2, vinyl, chrome })
    box(room, { w: 0.78, h: 0.035, d: 1.05, x, y: 0.745, z, mat: tableTop, r: 0.015 })
    box(room, { w: 0.8, h: 0.03, d: 1.07, x, y: 0.72, z, mat: chrome, r: 0.012 })
    cylinder(room, { r: 0.045, h: 0.72, x, z, mat: chrome })
    cylinder(room, { r: 0.22, h: 0.015, x, z, mat: chrome })
    P.sugarPourer(room, { x: x - 0.1, y: 0.78, z: z + 0.36 })
    P.bottle(room, { x: x + 0.02, y: 0.78, z: z + 0.38, color: 0xb3241c })
    P.bottle(room, { x: x + 0.09, y: 0.78, z: z + 0.38, color: 0xd9a51c })
    box(room, { w: 0.13, h: 0.1, d: 0.06, x: x + 0.22, y: 0.78, z: z + 0.36, mat: chrome, r: 0.012 })
    // Menus tucked against the napkin holder.
    box(room, { w: 0.24, h: 0.34, d: 0.006, x: x - 0.25, y: 0.782, z: z + 0.38, mat: M.paint(0x7d1418, 0.5, 0.4), r: 0.002 })
    P.pendant(room, PT, { x, z, ceiling: H, drop: 1.05, shadeMat: M.paint(0x16494b, 0.3, 0.7), intensity: 16 })
  }

  /* ---------------- counter + stools ---------------- */
  const cz = 2.0
  const cx = -0.8, cw = 8.2
  const stainless = lib.brushedMetal({ roughness: 0.28 })
  box(room, { w: cw, h: 0.98, d: 0.68, x: cx, z: cz, mat: stainless, r: 0.02 })
  for (let i = 0; i < 12; i++) box(room, { w: 0.012, h: 0.8, d: 0.01, x: cx - cw / 2 + 0.35 + i * 0.68, y: 0.12, z: cz - 0.345, mat: chrome, r: 0 })
  box(room, { w: cw + 0.1, h: 0.05, d: 0.86, x: cx, y: 0.98, z: cz - 0.06, mat: M.laminate(0xe6ddcd), r: 0.02 })
  box(room, { w: cw + 0.1, h: 0.025, d: 0.88, x: cx, y: 0.96, z: cz - 0.06, mat: chrome, r: 0.01 })
  box(room, { w: cw, h: 0.1, d: 0.7, x: cx, z: cz, mat: M.rubber(0x0b0b0c), r: 0.01 })
  for (let i = 0; i < 9; i++) P.stool(room, { x: cx - cw / 2 + 0.55 + i * 0.89, z: cz - 0.78, vinyl, chrome })
  // Counter-top life: register, coffee station, cake stand, pourers.
  box(room, { w: 0.42, h: 0.22, d: 0.36, x: 2.7, y: 1.03, z: cz + 0.02, mat: M.paint(0x2a2b2e, 0.35, 0.5), r: 0.03 })
  box(room, { w: 0.3, h: 0.16, d: 0.04, x: 2.7, y: 1.25, z: cz - 0.09, mat: M.emissive(0x7fe0a0, 0.7), r: 0.01 })
  for (let k = 0; k < 4; k++) P.sugarPourer(room, { x: -4 + k * 2.1, y: 1.03, z: cz - 0.3 })
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.05, 0.12, 40), chrome)
  stand.position.set(0.9, 1.09, cz)
  room.add(stand)
  const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 40), M.paint(0xf1d7b0, 0.7, 0.1))
  cake.position.set(0.9, 1.2, cz)
  room.add(cake)

  // Back bar: base cabinets, coffee machines, shelves of mugs and glasses.
  box(room, { w: cw, h: 0.9, d: 0.55, x: cx, z: D / 2 - 0.3, mat: stainless, r: 0.02 })
  box(room, { w: cw, h: 0.04, d: 0.6, x: cx, y: 0.9, z: D / 2 - 0.3, mat: M.laminate(0xe6ddcd), r: 0.01 })
  for (const mx of [-3.6, -2.9]) {
    box(room, { w: 0.5, h: 0.62, d: 0.42, x: mx, y: 0.94, z: D / 2 - 0.3, mat: stainless, r: 0.03 })
    cylinder(room, { r: 0.075, h: 0.16, rTop: 0.065, x: mx, y: 0.97, z: D / 2 - 0.5, mat: M.glass(0x6a3b1a) })
  }
  for (const y of [1.5, 1.9]) box(room, { w: 3.2, h: 0.03, d: 0.24, x: -3.1, y, z: D / 2 - 0.12, mat: chrome, r: 0.01 })
  for (let k = 0; k < 12; k++) {
    cylinder(room, { r: 0.045, h: 0.095, x: -4.5 + k * 0.26, y: 1.53, z: D / 2 - 0.12, mat: M.paint(0xf7f4ec, 0.2, 0.9) })
    if (k % 2 === 0) cylinder(room, { r: 0.035, h: 0.2, x: -4.45 + k * 0.26, y: 1.93, z: D / 2 - 0.12, mat: M.glass(0xdcefe4) })
  }
  const menuTex = lib.textTexture(["BREAKFAST ALL DAY", "Pancake stack  6.50", "Two eggs any style  5.25", "Patty melt  8.75", "Bottomless coffee  2.00"], {
    width: 1600,
    height: 760,
    bg: "#0f1113",
    fg: "#f4ecdc",
    font: "600 66px Bahnschrift, 'Segoe UI', sans-serif",
    align: "left",
    padding: 96,
    lineHeight: 1.42,
  })
  box(room, { w: 3.3, h: 1.52, d: 0.05, x: 1.3, y: 1.4, z: D / 2 - 0.03, mat: M.paint(0x151515, 0.45, 0.3), r: 0.01 })
  plane(room, { w: 3.16, h: 1.4, x: 1.3, y: 2.16, z: D / 2 - 0.06, ry: Math.PI, mat: new THREE.MeshPhysicalMaterial({ map: menuTex, emissiveMap: menuTex, emissive: 0xffffff, emissiveIntensity: 0.75, roughness: 0.5 }) })

  /* ---------------- far wall: focal point ---------------- */
  const neon = lib.textTexture(["EASTSIDE"], { width: 2048, height: 420, bg: "#000", fg: "#ff5b73", font: "italic 800 300px Bahnschrift, 'Segoe UI', sans-serif" })
  const neon2 = lib.textTexture(["DINER · OPEN LATE"], { width: 2048, height: 260, bg: "#000", fg: "#7fe7ff", font: "700 150px Bahnschrift, 'Segoe UI', sans-serif" })
  box(room, { w: 0.05, h: 1.25, d: 4.2, x: -W / 2 + 0.03, y: 1.62, z: -0.2, mat: M.paint(0x14171a, 0.4, 0.4), r: 0.01 })
  plane(room, { w: 4, h: 0.82, x: -W / 2 + 0.065, y: 2.45, z: -0.2, ry: Math.PI / 2, mat: new THREE.MeshPhysicalMaterial({ color: 0x050505, emissiveMap: neon, emissive: 0xffffff, emissiveIntensity: 7, roughness: 0.9 }) })
  plane(room, { w: 3.6, h: 0.46, x: -W / 2 + 0.065, y: 1.9, z: -0.2, ry: Math.PI / 2, mat: new THREE.MeshPhysicalMaterial({ color: 0x050505, emissiveMap: neon2, emissive: 0xffffff, emissiveIntensity: 5, roughness: 0.9 }) })
  const neonGlow = new PT.ShapedAreaLight(0xff6f86, 2.2, 3.8, 1.0)
  neonGlow.position.set(-W / 2 + 0.2, 2.3, -0.2)
  neonGlow.rotation.y = Math.PI / 2
  room.add(neonGlow)
  P.jukebox(room, PT, { x: -W / 2 + 0.4, z: -3.3, ry: 0 })
  P.exitDoor(room, { x: -W / 2 + 0.04, z: 3.0, ry: 0 })
  P.plant(room, { x: -W / 2 + 0.45, z: 1.95, scale: 1.1, seed: 12 })
  P.wallClock(room, { x: -W / 2 + 0.06, y: 1.35, z: 1.6, ry: Math.PI / 2, r: 0.2 })

  // Retro prints along the back wall above the counter (to the right of the menu board).
  const printStyle = (title, sub, bg, fg, accent) => (ctx, w, h) => {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(w / 2, h * 0.42, w * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = fg
    ctx.textAlign = "center"
    ctx.font = `800 ${Math.round(w * 0.13)}px Bahnschrift, 'Segoe UI', sans-serif`
    ctx.fillText(title, w / 2, h * 0.82)
    ctx.font = `600 ${Math.round(w * 0.055)}px Bahnschrift, 'Segoe UI', sans-serif`
    ctx.fillText(sub, w / 2, h * 0.92)
  }
  P.framedPrint(room, { x: 4.1, y: 2.55, z: D / 2 - 0.02, ry: Math.PI, w: 0.8, h: 1.05, draw: printStyle("MALTS", "THICK · COLD · SINCE 1961", "#f1e3c6", "#1b2b3a", "#d9543f") })
  P.framedPrint(room, { x: 5.3, y: 2.55, z: D / 2 - 0.02, ry: Math.PI, w: 0.8, h: 1.05, draw: printStyle("PIE", "BAKED HERE DAILY", "#1f3b47", "#f3e6c9", "#f0a830") })
  P.plant(room, { x: 6.3, z: 3.7, scale: 1.25, seed: 4 })

  /* ---------------- ceiling lighting ---------------- */
  for (let i = 0; i < 4; i++) P.pendant(room, PT, { x: cx - 3 + i * 2, z: cz - 0.05, ceiling: H, drop: 0.85, shadeMat: M.paint(0x941c22, 0.3, 0.8), intensity: 14, radius: 0.17 })
  for (let i = 0; i < 6; i++) for (const z of [-1.3, 3.6]) P.downlight(room, PT, { x: -5.5 + i * 2.2, z, ceiling: H, intensity: 16, color: 0xfff7ee })

  /* ---------------- camera ---------------- */
  const camera = new PT.PhysicalCamera(54, 1.6, 0.05, 200)
  if (view === "booths") {
    camera.position.set(-2.4, 1.3, -1.0)
    camera.lookAt(3.2, 0.9, -3.9)
  } else {
    camera.position.set(6.35, 1.52, -1.15)
    camera.lookAt(-7, 1.42, -0.55)
  }
  camera.fStop = 8
  camera.focusDistance = 8
  camera.apertureBlades = 6

  return { scene, camera, exposure: 1.65, bounces: 7, toneMapping: THREE.NeutralToneMapping }
}
