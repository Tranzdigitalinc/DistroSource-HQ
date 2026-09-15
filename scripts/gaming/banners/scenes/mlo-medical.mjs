// FiveM MLO — medical centre reception.
// Room: x ∈ [-7, 7], z ∈ [-5, 5], ceiling 3.4 m. Reception desk against a
// teal feature wall (z = -5); waiting chairs in the foreground; hanging
// wayfinding signs; suspended LED panels for clinical light.
import * as P from "/scripts/gaming/banners/props.mjs"

export function build({ THREE, PT, lib, view }) {
  const { box, cylinder, plane, materials: M } = lib
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(256)
  sky.topColor.set(0xcfe0f2)
  sky.bottomColor.set(0xf2efe8)
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.6

  const W = 14, D = 10, H = 3.4
  const room = new THREE.Group()
  scene.add(room)

  // Floor: pale speckled sheet vinyl with a guidance stripe.
  const vinyl = lib.concrete({ color: 0xdfe3e6, repeat: [5, 4], polish: 0.28 })
  vinyl.clearcoat = 0.5
  vinyl.clearcoatRoughness = 0.15
  plane(room, { w: W, h: D, rx: -Math.PI / 2, mat: vinyl })
  box(room, { w: 0.18, h: 0.003, d: D - 1, x: 3.6, z: 0.5, mat: M.paint(0x1aa39a, 0.4, 0.3), r: 0 })
  box(room, { w: 4.5, h: 0.003, d: 0.18, x: 5.8, z: -4.0, mat: M.paint(0x1aa39a, 0.4, 0.3), r: 0 })

  // Walls.
  const white = lib.plaster({ color: 0xf4f5f3, repeat: [4, 1.2] })
  plane(room, { w: D, h: H, x: -W / 2, y: H / 2, ry: Math.PI / 2, mat: white })
  plane(room, { w: D, h: H, x: W / 2, y: H / 2, ry: -Math.PI / 2, mat: white })
  plane(room, { w: W, h: H, y: H / 2, z: D / 2, ry: Math.PI, mat: white })
  plane(room, { w: W, h: H, y: H / 2, z: -D / 2, mat: white })
  // Teal feature wall with a wood-slat band behind the desk.
  box(room, { w: 7.2, h: H, d: 0.06, x: -1.2, z: -D / 2 + 0.03, mat: M.paint(0x16706c, 0.7, 0.1), r: 0 })
  const oak = lib.woodPlanks({ tone: 0xb98a5a, planks: 2, repeat: [1, 1], gloss: 0.5 })
  for (let k = 0; k < 34; k++) box(room, { w: 0.06, h: 1.3, d: 0.05, x: -4.6 + k * 0.2, y: 0.05, z: -D / 2 + 0.09, mat: oak, r: 0.006 })
  // Wall-mounted sign with a cross mark.
  const sign = lib.textTexture(["HARBOR MEDICAL CENTRE"], { width: 2048, height: 256, bg: "#16706c", fg: "#ffffff", font: "700 128px Bahnschrift, 'Segoe UI', sans-serif" })
  plane(room, { w: 5.2, h: 0.65, x: -0.6, y: 2.55, z: -D / 2 + 0.07, mat: new THREE.MeshPhysicalMaterial({ map: sign, emissiveMap: sign, emissive: 0xffffff, emissiveIntensity: 0.25, roughness: 0.5 }) })
  const crossMat = M.emissive(0xffffff, 1.4)
  box(room, { w: 0.18, h: 0.62, d: 0.03, x: -3.95, y: 2.24, z: -D / 2 + 0.08, mat: crossMat, r: 0.01 })
  box(room, { w: 0.62, h: 0.18, d: 0.03, x: -3.95, y: 2.46, z: -D / 2 + 0.08, mat: crossMat, r: 0.01 })

  // Reception desk: slatted front, solid-surface top, privacy glass, monitors.
  const deskZ = -D / 2 + 1.7
  box(room, { w: 5.2, h: 1.05, d: 0.7, x: -1.2, z: deskZ, mat: M.paint(0xf4f4f1, 0.3, 0.5), r: 0.03 })
  for (let k = 0; k < 24; k++) box(room, { w: 0.14, h: 0.95, d: 0.04, x: -3.7 + k * 0.217, y: 0.05, z: deskZ + 0.37, mat: oak, r: 0.01 })
  box(room, { w: 5.3, h: 0.05, d: 0.9, x: -1.2, y: 1.05, z: deskZ + 0.08, mat: M.laminate(0xfbfbf9), r: 0.02 })
  box(room, { w: 5.0, h: 0.34, d: 0.02, x: -1.2, y: 1.1, z: deskZ + 0.18, mat: M.glass(0xeaf6f5), r: 0.005 })
  box(room, { w: 5.2, h: 0.75, d: 0.6, x: -1.2, z: deskZ - 0.55, mat: M.paint(0xe9ebe8, 0.4, 0.3), r: 0.02 })
  for (const x of [-2.8, -0.6, 1.2]) {
    box(room, { w: 0.56, h: 0.34, d: 0.03, x, y: 0.95, z: deskZ - 0.5, mat: M.paint(0x121417, 0.3, 0.4), r: 0.008 })
    plane(room, { w: 0.52, h: 0.3, x, y: 1.12, z: deskZ - 0.484, mat: M.emissive(0xbfe3ff, 0.9) })
    box(room, { w: 0.06, h: 0.2, d: 0.06, x, y: 0.76, z: deskZ - 0.52, mat: M.paint(0x121417, 0.3, 0.4), r: 0.01 })
  }

  // Waiting chairs: upholstered seat + back on a chrome beam.
  const upholstery = new THREE.MeshPhysicalMaterial({ color: 0x1d7f79, roughness: 0.7, sheen: 0.6, sheenColor: new THREE.Color(0x7fd6cf) })
  const chrome = M.chrome()
  const chairRow = (x0, z, n, ry = 0) => {
    const g = new THREE.Group()
    g.position.set(x0, 0, z)
    g.rotation.y = ry
    room.add(g)
    box(g, { w: n * 0.62, h: 0.05, d: 0.08, y: 0.36, mat: chrome, r: 0.02 })
    for (const lx of [-(n * 0.62) / 2 + 0.2, (n * 0.62) / 2 - 0.2]) {
      box(g, { w: 0.05, h: 0.36, d: 0.05, x: lx, mat: chrome, r: 0.01 })
      box(g, { w: 0.05, h: 0.03, d: 0.52, x: lx, mat: chrome, r: 0.01 })
    }
    for (let i = 0; i < n; i++) {
      const x = -(n * 0.62) / 2 + 0.31 + i * 0.62
      box(g, { w: 0.54, h: 0.09, d: 0.5, x, y: 0.41, mat: upholstery, r: 0.04 })
      const back = box(g, { w: 0.54, h: 0.5, d: 0.07, x, y: 0.5, z: 0.25, mat: upholstery, r: 0.035 })
      back.rotation.x = -0.12
      if (i < n - 1) box(g, { w: 0.05, h: 0.2, d: 0.42, x: x + 0.31, y: 0.48, mat: chrome, r: 0.02 })
    }
  }
  chairRow(-3.5, 1.6, 5)
  chairRow(-3.5, 3.1, 5)
  chairRow(0.4, 1.6, 3)
  box(room, { w: 0.9, h: 0.04, d: 0.5, x: 1.9, y: 0.4, z: 2.3, mat: oak, r: 0.01 })
  for (const [dx, dz] of [[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]]) box(room, { w: 0.03, h: 0.4, d: 0.03, x: 1.9 + dx, z: 2.3 + dz, mat: chrome, r: 0.005 })
  P.plant(room, { x: -6.3, z: 0.3, scale: 1.4, seed: 7 })
  P.plant(room, { x: 2.7, z: -3.9, scale: 1.2, seed: 11 })

  // Info screen and water cooler on the side wall.
  box(room, { w: 0.05, h: 0.75, d: 1.3, x: W / 2 - 0.04, y: 1.35, z: -1.6, mat: M.paint(0x121417, 0.3, 0.4), r: 0.01 })
  const info = lib.textTexture(["NOW SEEING", "A-104   ROOM 3", "A-105   ROOM 1", "B-212   IMAGING"], { width: 1280, height: 720, bg: "#0f2e40", fg: "#e8f6ff", font: "600 88px Bahnschrift, 'Segoe UI', sans-serif", lineHeight: 1.35 })
  plane(room, { w: 1.22, h: 0.68, x: W / 2 - 0.07, y: 1.72, z: -1.6, ry: -Math.PI / 2, mat: new THREE.MeshPhysicalMaterial({ map: info, emissiveMap: info, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.4 }) })
  box(room, { w: 0.34, h: 1.1, d: 0.34, x: W / 2 - 0.3, z: 0.4, mat: M.paint(0xe6e8ea, 0.35, 0.4), r: 0.04 })
  cylinder(room, { r: 0.15, h: 0.42, x: W / 2 - 0.3, y: 1.1, z: 0.4, mat: M.glass(0xcde9ff) })

  // Suspended ceiling grid with LED panels and hanging wayfinding.
  plane(room, { w: W, h: D, y: H, rx: Math.PI / 2, mat: M.matte(0xf3f3f1, 0.95) })
  for (let gx = -6; gx <= 6; gx += 1.2) box(room, { w: 0.025, h: 0.02, d: D, x: gx, y: H - 0.02, mat: M.paint(0xd9dbdd, 0.4, 0.2), r: 0 })
  for (let gz = -4.8; gz <= 4.8; gz += 1.2) box(room, { w: W, h: 0.02, d: 0.025, y: H - 0.02, z: gz, mat: M.paint(0xd9dbdd, 0.4, 0.2), r: 0 })
  for (const x of [-4.8, -1.2, 2.4, 6]) {
    for (const z of [-3.0, 0.6, 3.6]) {
      plane(room, { w: 1.14, h: 1.14, x: x - 0.6, y: H - 0.025, z: z - 0.6, rx: Math.PI / 2, mat: M.emissive(0xf4f8ff, 2.4) })
      const l = new PT.ShapedAreaLight(0xf4f8ff, 3.4, 1.14, 1.14)
      l.position.set(x - 0.6, H - 0.03, z - 0.6)
      l.rotation.x = -Math.PI / 2
      room.add(l)
    }
  }
  const wayfinding = (lines, x, z, ry = 0) => {
    const tex = lib.textTexture(lines, { width: 1400, height: 360, bg: "#ffffff", fg: "#16323a", font: "600 92px Bahnschrift, 'Segoe UI', sans-serif", align: "left", padding: 70, lineHeight: 1.25 })
    const g = new THREE.Group()
    g.position.set(x, H - 0.75, z)
    g.rotation.y = ry
    room.add(g)
    box(g, { w: 1.9, h: 0.5, d: 0.05, mat: M.paint(0xffffff, 0.4, 0.3), r: 0.01 })
    plane(g, { w: 1.85, h: 0.46, y: 0.25, z: 0.026, mat: new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.5 }) })
    for (const sx of [-0.7, 0.7]) cylinder(g, { r: 0.006, h: 0.26, x: sx, y: 0.5, mat: chrome })
  }
  wayfinding(["→  Emergency", "→  Imaging · Pharmacy"], 4.4, -1.2)
  wayfinding(["←  Wards A – C", "←  Outpatients"], -4.6, -2.0)

  const camera = new PT.PhysicalCamera(52, 1.6, 0.05, 200)
  camera.position.set(5.6, 1.62, 4.3)
  camera.lookAt(-1.4, 1.25, -4.2)
  camera.fStop = 8
  camera.focusDistance = 7.5
  return { scene, camera, exposure: 1.0, bounces: 7, toneMapping: THREE.NeutralToneMapping }
}
