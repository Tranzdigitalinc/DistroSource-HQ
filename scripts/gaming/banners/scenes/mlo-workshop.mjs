// FiveM MLO — mechanic workshop.
// Room: x ∈ [-8, 8], z ∈ [-6, 6], 5.5 m ceiling. Roller door in the back wall
// (z = -6) opens onto a dusk yard; two-post lift with a sedan raised on the
// left; tool chests and tyre rack on the right wall; bench and pegboard on the
// back wall behind the lift — everything placed inside the camera's view.
import { buildVehicle, paint } from "/scripts/gaming/banners/vehicle.mjs"

export function build({ THREE, PT, lib }) {
  const { box, cylinder, plane, materials: M } = lib
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x3a5b8f)
  sky.bottomColor.set(0xf0b27a)
  sky.exponent = 2.6
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.55

  const W = 16, D = 12, H = 5.5
  const room = new THREE.Group()
  scene.add(room)

  // Epoxy floor with safety lines.
  const epoxy = lib.concrete({ color: 0x5f6b66, repeat: [4, 3], polish: 0.12 })
  epoxy.clearcoat = 0.8
  epoxy.clearcoatRoughness = 0.1
  plane(room, { w: W, h: D, rx: -Math.PI / 2, mat: epoxy })
  const yellow = M.paint(0xe5b518, 0.5, 0.3)
  for (const x of [-6.6, -1.8]) box(room, { w: 0.1, h: 0.004, d: 7.5, x, z: -1.2, mat: yellow, r: 0 })
  box(room, { w: 4.9, h: 0.004, d: 0.1, x: -4.2, z: 2.55, mat: yellow, r: 0 })
  for (let k = 0; k < 9; k++) {
    const m = box(room, { w: 0.1, h: 0.004, d: 1.5, x: 3.6 + k * 0.32, z: -4.9, mat: yellow, r: 0 })
    m.rotation.y = 0.6
  }

  // Walls: lower painted block, upper ribbed cladding, closed ceiling.
  const lower = M.paint(0x3a3f45, 0.6, 0.15)
  const upper = lib.brushedMetal({ color: 0xa9aeb3, roughness: 0.5, repeat: [1, 30] })
  const wall = (w, pos, ry) => {
    const g = new THREE.Group()
    g.position.set(pos.x ?? 0, 0, pos.z ?? 0)
    g.rotation.y = ry
    room.add(g)
    plane(g, { w, h: 1.6, y: 0.8, mat: lower })
    plane(g, { w, h: H - 1.6, y: 1.6 + (H - 1.6) / 2, mat: upper })
    box(g, { w, h: 0.06, d: 0.04, y: 1.6, mat: yellow, r: 0 })
    return g
  }
  wall(D, { x: -W / 2 }, Math.PI / 2)
  wall(D, { x: W / 2 }, -Math.PI / 2)
  wall(W, { z: D / 2 }, Math.PI)
  const back = new THREE.Group()
  back.position.z = -D / 2
  room.add(back)
  const openL = -1, openR = 4.2, openH = 3.8
  for (const [x0, x1] of [[-W / 2, openL], [openR, W / 2]]) {
    plane(back, { w: x1 - x0, h: 1.6, x: (x0 + x1) / 2, y: 0.8, mat: lower })
    plane(back, { w: x1 - x0, h: H - 1.6, x: (x0 + x1) / 2, y: 1.6 + (H - 1.6) / 2, mat: upper })
    box(back, { w: x1 - x0, h: 0.06, d: 0.04, x: (x0 + x1) / 2, y: 1.6, mat: yellow, r: 0 })
  }
  plane(back, { w: openR - openL, h: H - openH, x: (openL + openR) / 2, y: openH + (H - openH) / 2, mat: upper })
  box(back, { w: openR - openL + 0.3, h: 0.35, d: 0.3, x: (openL + openR) / 2, y: openH, mat: M.paint(0x2b2f34, 0.45, 0.2), r: 0.01 })
  for (const x of [openL, openR]) box(room, { w: 0.14, h: openH, d: 0.2, x, z: -D / 2, mat: yellow, r: 0.01 })
  plane(room, { w: W, h: D, y: H, rx: Math.PI / 2, mat: M.matte(0x2a2d31, 0.9) })

  // Yard outside.
  plane(scene, { w: 40, h: 20, y: -0.01, z: -D / 2 - 10, rx: -Math.PI / 2, mat: lib.concrete({ color: 0x3b3c3e, repeat: [8, 4], polish: 0.5 }) })
  for (let k = 0; k < 16; k++) box(scene, { w: 0.05, h: 2, d: 0.05, x: -10 + k * 1.6, z: -D / 2 - 9, mat: M.paint(0x2a2d30, 0.5, 0.1), r: 0 })
  box(scene, { w: 26, h: 0.04, d: 0.04, x: 2, y: 1.9, z: -D / 2 - 9, mat: M.paint(0x2a2d30, 0.5, 0.1), r: 0 })

  // Steel beams and high-bay lights.
  const steel = M.paint(0x1f3b57, 0.45, 0.3)
  for (const z of [-4, 0, 4]) box(room, { w: W, h: 0.45, d: 0.22, y: H - 0.45, z, mat: steel, r: 0.005 })
  for (const [x, z] of [[-4.2, -2], [-4.2, 2], [2.4, -2], [2.4, 2], [6, -2], [6, 2]]) {
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.34, 0.28, 32, 1, true), M.paint(0x2d3136, 0.35, 0.4))
    shade.position.set(x, H - 0.75, z)
    room.add(shade)
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), M.emissive(0xf5f7ff, 5))
    lens.rotation.x = Math.PI / 2
    lens.position.set(x, H - 0.89, z)
    room.add(lens)
    const l = new PT.ShapedAreaLight(0xf3f6ff, 22, 0.6, 0.6)
    l.isCircular = true
    l.position.set(x, H - 0.9, z)
    l.rotation.x = -Math.PI / 2
    room.add(l)
  }
  const day = new PT.ShapedAreaLight(0xffd8ac, 3.5, openR - openL, openH)
  day.position.set((openL + openR) / 2, openH / 2, -D / 2 - 0.05)
  day.lookAt((openL + openR) / 2, 1, 0)
  room.add(day)

  // Two-post lift with a sedan raised.
  const liftRed = M.paint(0xb3241c, 0.35, 0.6)
  for (const x of [-6.1, -2.3]) {
    box(room, { w: 0.34, h: 3.7, d: 0.34, x, z: -1.2, mat: liftRed, r: 0.02 })
    box(room, { w: 0.55, h: 0.05, d: 0.55, x, z: -1.2, mat: M.paint(0x2a2a2a, 0.5, 0.2), r: 0.01 })
    for (const dz of [-0.8, 0.8]) {
      const arm = box(room, { w: 0.9, h: 0.08, d: 0.12, x: x + (x < -4 ? 0.55 : -0.55), y: 1.47, z: -1.2 + dz, mat: M.paint(0x3a3d41, 0.4, 0.3), r: 0.01 })
      arm.rotation.y = x < -4 ? -0.3 * Math.sign(dz) : 0.3 * Math.sign(dz)
    }
  }
  box(room, { w: 4.1, h: 0.14, d: 0.14, x: -4.2, y: 3.7, z: -1.2, mat: liftRed, r: 0.02 })
  const car = buildVehicle({ style: "sedan", paint: paint(0x6d1b1b, { metallic: 0.6, roughness: 0.25 }), headlights: false })
  car.position.set(-4.2, 1.55, -1.2)
  car.rotation.y = Math.PI / 2 + 0.02
  room.add(car)
  // Floor jack, a stack of tyres and a creeper by the lift.
  box(room, { w: 0.9, h: 0.16, d: 0.34, x: -1.2, z: 1.2, mat: liftRed, r: 0.03 })
  const handle = box(room, { w: 0.05, h: 1.1, d: 0.05, x: -0.7, y: 0.1, z: 1.2, mat: M.paint(0x1c1c1c, 0.5, 0.2), r: 0.01 })
  handle.rotation.z = -0.9
  const tyre = new THREE.MeshPhysicalMaterial({ color: 0x141414, roughness: 0.8 })
  for (let i = 0; i < 4; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.11, 16, 36), tyre)
    t.rotation.x = Math.PI / 2
    t.position.set(-7.1, 0.11 + i * 0.22, 1.6)
    room.add(t)
  }
  box(room, { w: 1.0, h: 0.08, d: 0.45, x: -3.2, y: 0.08, z: 1.9, mat: M.paint(0x2244aa, 0.4, 0.5), r: 0.03 })

  // Back wall behind the lift: bench and pegboard with tools, sign above.
  box(room, { w: 3.0, h: 0.9, d: 0.75, x: -4.2, z: -D / 2 + 0.4, mat: M.paint(0x3a3f45, 0.5, 0.2), r: 0.02 })
  box(room, { w: 3.1, h: 0.06, d: 0.8, x: -4.2, y: 0.9, z: -D / 2 + 0.4, mat: lib.woodPlanks({ tone: 0x8a6a45 }), r: 0.01 })
  box(room, { w: 3.0, h: 1.4, d: 0.03, x: -4.2, y: 1.0, z: -D / 2 + 0.03, mat: M.matte(0xd9cfb8, 0.8), r: 0 })
  const rr = lib.rng(8)
  for (let k = 0; k < 16; k++) box(room, { w: 0.04 + rr() * 0.05, h: 0.2 + rr() * 0.35, d: 0.03, x: -5.5 + (k % 8) * 0.37, y: 1.15 + Math.floor(k / 8) * 0.62, z: -D / 2 + 0.07, mat: k % 3 ? M.chrome() : M.paint(0xd12a1e, 0.4, 0.6), r: 0.005 })
  const sign = lib.textTexture(["EASTSIDE AUTO"], { width: 2048, height: 320, bg: "#14171b", fg: "#f4f4f2", font: "800 200px Bahnschrift, 'Segoe UI', sans-serif" })
  plane(room, { w: 4.4, h: 0.7, x: -4.2, y: 4.25, z: -D / 2 + 0.03, mat: new THREE.MeshPhysicalMaterial({ map: sign, emissiveMap: sign, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.5 }) })

  // Right wall: tool chests, tyre rack and drums, facing into the room.
  const chest = M.paint(0xb91c1c, 0.25, 0.9)
  for (const z of [-3.9, -2.7]) {
    box(room, { w: 0.6, h: 1.05, d: 1.1, x: W / 2 - 0.35, z, mat: chest, r: 0.03 })
    for (let k = 0; k < 6; k++) box(room, { w: 0.02, h: 0.012, d: 1.0, x: W / 2 - 0.66, y: 0.12 + k * 0.15, z, mat: M.chrome(), r: 0 })
    box(room, { w: 0.55, h: 0.5, d: 1.1, x: W / 2 - 0.35, y: 1.05, z, mat: chest, r: 0.03 })
  }
  for (let row = 0; row < 3; row++) {
    box(room, { w: 0.5, h: 0.04, d: 2.4, x: W / 2 - 0.3, y: 0.35 + row * 0.8, z: -0.2, mat: M.paint(0x2a2d31, 0.4, 0.2), r: 0 })
    for (let k = 0; k < 4; k++) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.11, 16, 36), tyre)
      t.position.set(W / 2 - 0.35, 0.72 + row * 0.8, -1.2 + k * 0.62)
      room.add(t)
    }
  }
  for (const [x, z, c] of [[5.6, -5.3, 0x1f4e8c], [6.3, -5.4, 0x1f4e8c], [5.9, -4.7, 0x2f6d33]]) cylinder(room, { r: 0.29, h: 0.88, x, z, mat: M.paint(c, 0.4, 0.4), seg: 32 })
  const safety = lib.textTexture(["LIFT ZONE", "KEEP CLEAR"], { width: 1024, height: 512, bg: "#e5b518", fg: "#141414", font: "800 120px Bahnschrift, 'Segoe UI', sans-serif" })
  plane(room, { w: 1.2, h: 0.6, x: -1.6, y: 2.3, z: -D / 2 + 0.03, mat: new THREE.MeshPhysicalMaterial({ map: safety, roughness: 0.5 }) })

  const camera = new PT.PhysicalCamera(50, 1.6, 0.05, 200)
  camera.position.set(6.2, 1.75, 4.6)
  camera.lookAt(-2.2, 1.55, -3.8)
  camera.fStop = 8
  camera.focusDistance = 9
  return { scene, camera, exposure: 1.45, bounces: 6, toneMapping: THREE.NeutralToneMapping }
}
