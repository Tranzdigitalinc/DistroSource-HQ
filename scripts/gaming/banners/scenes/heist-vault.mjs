// FiveM heist — bank vault.
// Room: x ∈ [-5, 5], z ∈ [-6, 4], ceiling 3.2 m. The back wall (z = -6) is
// 0.6 m thick with a round opening; the vault door hangs open on its hinge,
// showing a lit strongroom behind. Deposit-box walls left and right, a steel
// table with cash, and red security lasers across the room.
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"

export function build({ THREE, PT, lib }) {
  const { box, plane, materials: M } = lib
  const scene = new THREE.Scene()
  const env = new PT.GradientEquirectTexture(256)
  env.topColor.set(0x1a2230)
  env.bottomColor.set(0x07090c)
  env.update()
  scene.environment = env
  scene.background = new THREE.Color(0x05070a)
  scene.environmentIntensity = 0.3

  const W = 10, H = 3.2, ZB = -6, ZF = 4
  const D = ZF - ZB
  const steel = lib.brushedMetal({ color: 0xb9bec5, roughness: 0.3, repeat: [2, 2] })
  const darkSteel = lib.brushedMetal({ color: 0x5d636b, roughness: 0.38, repeat: [1, 3] })

  // Floor: dark polished stone tiles.
  const floor = lib.tiles({ a: 0x3b3e43, b: 0x303338, grout: 0x1b1d20, count: 10, checker: true, gloss: 0.1, seed: 19 })
  plane(scene, { w: W, h: D, z: (ZB + ZF) / 2, rx: -Math.PI / 2, mat: floor })

  // Walls and ceiling.
  const wall = lib.concrete({ color: 0x80858c, repeat: [3, 1], polish: 0.45, seed: 7 })
  plane(scene, { w: D, h: H, x: -W / 2, y: H / 2, z: (ZB + ZF) / 2, ry: Math.PI / 2, mat: wall })
  plane(scene, { w: D, h: H, x: W / 2, y: H / 2, z: (ZB + ZF) / 2, ry: -Math.PI / 2, mat: wall })
  plane(scene, { w: W, h: H, y: H / 2, z: ZF, ry: Math.PI, mat: wall })
  plane(scene, { w: W, h: D, y: H, z: (ZB + ZF) / 2, rx: Math.PI / 2, mat: M.matte(0x15181c, 0.9) })

  // Back wall with a round opening (extruded so the opening has depth).
  const DX = 0.55, DY = 1.45, DR = 1.25, THICK = 0.6
  const shape = new THREE.Shape()
  shape.moveTo(-W / 2, 0)
  shape.lineTo(W / 2, 0)
  shape.lineTo(W / 2, H)
  shape.lineTo(-W / 2, H)
  shape.lineTo(-W / 2, 0)
  const hole = new THREE.Path()
  hole.absarc(DX, DY, DR, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const wallGeo = new THREE.ExtrudeGeometry(shape, { depth: THICK, bevelEnabled: false, curveSegments: 72 })
  wallGeo.clearGroups()
  const backMat = lib.concrete({ color: 0x80858c, repeat: [0.3, 0.3], polish: 0.45, seed: 7 })
  const back = new THREE.Mesh(wallGeo, backMat)
  back.position.z = ZB - THICK
  scene.add(back)
  // Steel sleeve lining the opening and a lip ring on the room side.
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(DR, DR, THICK, 96, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xaeb3ba, metalness: 1, roughness: 0.3, side: THREE.DoubleSide }))
  sleeve.geometry.clearGroups()
  sleeve.rotation.x = Math.PI / 2
  sleeve.position.set(DX, DY, ZB - THICK / 2)
  scene.add(sleeve)
  const lip = new THREE.Mesh(new THREE.TorusGeometry(DR + 0.06, 0.09, 20, 120), steel)
  lip.position.set(DX, DY, ZB + 0.02)
  scene.add(lip)

  // The door: a thick steel disc hinged on the left of the opening, swung open.
  const hingeX = DX - DR - 0.12
  const pivot = new THREE.Group()
  pivot.position.set(hingeX, DY, ZB + 0.12)
  pivot.rotation.y = -0.98
  scene.add(pivot)
  const door = new THREE.Group()
  door.position.set(DR + 0.12, 0, 0.3)
  pivot.add(door)
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(DR - 0.03, DR - 0.03, 0.52, 96), steel)
  disc.geometry.clearGroups()
  disc.rotation.x = Math.PI / 2
  door.add(disc)
  for (const [r, t] of [[DR - 0.12, 0.05], [0.86, 0.035], [0.52, 0.03]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, t, 16, 100), darkSteel)
    ring.position.z = 0.26
    door.add(ring)
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.16, 48), M.chrome())
  hub.geometry.clearGroups()
  hub.rotation.x = Math.PI / 2
  hub.position.z = 0.33
  door.add(hub)
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.028, 14, 80), M.chrome())
  wheel.position.z = 0.46
  door.add(wheel)
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 12), M.chrome())
    spoke.geometry.clearGroups()
    spoke.position.set(Math.cos(a) * 0.21, Math.sin(a) * 0.21, 0.46)
    spoke.rotation.z = a - Math.PI / 2
    door.add(spoke)
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), M.chrome())
    knob.position.set(Math.cos(a) * 0.46, Math.sin(a) * 0.46, 0.46)
    door.add(knob)
  }
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.26, 20), M.chrome())
    bolt.geometry.clearGroups()
    bolt.position.set(Math.cos(a) * (DR + 0.08), Math.sin(a) * (DR + 0.08), 0.05)
    bolt.rotation.z = a - Math.PI / 2
    door.add(bolt)
  }
  // Hinge knuckles and arms.
  for (const y of [-0.62, 0.62]) {
    const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.46, 32), darkSteel)
    knuckle.geometry.clearGroups()
    knuckle.position.set(0, y, 0)
    pivot.add(knuckle)
    box(pivot, { w: 0.4, h: 0.22, d: 0.2, x: 0.22, y: y - 0.11, z: 0.2, mat: darkSteel, r: 0.02 })
  }

  // Strongroom behind the door: warm light on shelves of gold and cash.
  const SR = { x0: DX - 2.2, x1: DX + 2.2, z0: ZB - THICK - 3.4, z1: ZB - THICK, h: 2.9 }
  const warmWall = lib.concrete({ color: 0x6d6a66, repeat: [2, 1], polish: 0.5, seed: 9 })
  plane(scene, { w: SR.x1 - SR.x0, h: SR.h, x: DX, y: SR.h / 2, z: SR.z0, mat: warmWall })
  plane(scene, { w: SR.z1 - SR.z0, h: SR.h, x: SR.x0, y: SR.h / 2, z: (SR.z0 + SR.z1) / 2, ry: Math.PI / 2, mat: warmWall })
  plane(scene, { w: SR.z1 - SR.z0, h: SR.h, x: SR.x1, y: SR.h / 2, z: (SR.z0 + SR.z1) / 2, ry: -Math.PI / 2, mat: warmWall })
  plane(scene, { w: SR.x1 - SR.x0, h: SR.z1 - SR.z0, x: DX, y: 0.001, z: (SR.z0 + SR.z1) / 2, rx: -Math.PI / 2, mat: floor })
  plane(scene, { w: SR.x1 - SR.x0, h: SR.z1 - SR.z0, x: DX, y: SR.h, z: (SR.z0 + SR.z1) / 2, rx: Math.PI / 2, mat: M.matte(0x2a2825, 0.9) })
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xe0b44c, metalness: 1, roughness: 0.22 })
  const barGeo = new THREE.BoxGeometry(0.22, 0.06, 0.1)
  const bars = []
  const cash = []
  const brickGeo = new THREE.BoxGeometry(0.17, 0.05, 0.075)
  for (const sy of [0.45, 1.05, 1.65]) {
    box(scene, { w: 3.6, h: 0.04, d: 0.5, x: DX, y: sy, z: SR.z0 + 0.3, mat: darkSteel, r: 0.01 })
    for (let i = 0; i < 12; i++) {
      for (let layer = 0; layer < 3 - (i % 2); layer++) {
        const g = barGeo.clone()
        g.translate(DX - 1.55 + i * 0.27, sy + 0.07 + layer * 0.062, SR.z0 + 0.3 + (layer % 2 ? 0.03 : -0.03))
        ;(sy === 1.05 ? cash : bars).push(sy === 1.05 ? (() => { const b = brickGeo.clone(); b.translate(DX - 1.55 + i * 0.27, sy + 0.07 + layer * 0.052, SR.z0 + 0.3); return b })() : g)
      }
    }
  }
  for (const x of [SR.x0 + 0.3, SR.x1 - 0.3]) box(scene, { w: 0.05, h: 1.9, d: 0.5, x, z: SR.z0 + 0.3, mat: darkSteel, r: 0.01 })
  scene.add(new THREE.Mesh(mergeGeometries(bars), gold))
  // Banknote bricks: paper band texture.
  const note = lib.paint(256, (u, v) => (Math.abs(u - 0.5) < 0.09 ? [196, 178, 120] : [120 + v * 20, 146 + v * 18, 118]), 128)
  const noteMat = new THREE.MeshPhysicalMaterial({ map: lib.toTexture(note), roughness: 0.8 })
  scene.add(new THREE.Mesh(mergeGeometries(cash), noteMat))
  const warm = new PT.ShapedAreaLight(0xffc27a, 14, 3.2, 1.2)
  warm.position.set(DX, SR.h - 0.02, SR.z0 + 1.4)
  warm.rotation.x = -Math.PI / 2
  scene.add(warm)
  box(scene, { w: 3.2, h: 0.02, d: 1.2, x: DX, y: SR.h - 0.03, z: SR.z0 + 1.4, mat: M.emissive(0xffd29a, 3), r: 0 })

  // Safe deposit boxes on both side walls (merged: one mesh per material).
  const depositDoors = []
  const keyholes = []
  const doorGeo = new RoundedBoxGeometry(0.44, 0.27, 0.04, 2, 0.012)
  const keyGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.02, 12)
  keyGeo.rotateZ(Math.PI / 2)
  for (const side of [-1, 1]) {
    for (let col = 0; col < 16; col++) {
      for (let row = 0; row < 7; row++) {
        const z = -5.3 + col * 0.48
        if (z > 2.4) continue
        const y = 0.32 + row * 0.3
        const g = doorGeo.clone()
        g.rotateY(Math.PI / 2)
        g.translate(side * (W / 2 - 0.02), y, z)
        depositDoors.push(g)
        const k = keyGeo.clone()
        k.translate(side * (W / 2 - 0.045), y + 0.02, z + 0.13)
        keyholes.push(k)
      }
    }
    box(scene, { w: 0.08, h: 2.28, d: 7.9, x: side * (W / 2 - 0.02), y: 0.14, z: -1.45, mat: darkSteel, r: 0.01 })
  }
  scene.add(new THREE.Mesh(mergeGeometries(depositDoors), steel))
  scene.add(new THREE.Mesh(mergeGeometries(keyholes), M.matte(0x0c0d0f, 0.5)))

  // Steel table with cash, a duffel bag and a drill case.
  const TX = -1.9, TZ = -0.6
  box(scene, { w: 1.9, h: 0.05, d: 0.95, x: TX, y: 0.86, z: TZ, mat: steel, r: 0.01 })
  for (const [dx, dz] of [[-0.88, -0.4], [0.88, -0.4], [-0.88, 0.4], [0.88, 0.4]]) box(scene, { w: 0.05, h: 0.86, d: 0.05, x: TX + dx, z: TZ + dz, mat: darkSteel, r: 0.005 })
  const tableCash = []
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) for (let l = 0; l < 2 + ((i + j) % 2); l++) {
    const b = brickGeo.clone()
    b.translate(TX - 0.72 + i * 0.19, 0.935 + l * 0.052, TZ - 0.3 + j * 0.09)
    tableCash.push(b)
  }
  scene.add(new THREE.Mesh(mergeGeometries(tableCash), noteMat))
  const bag = box(scene, { w: 0.75, h: 0.34, d: 0.36, x: TX + 0.45, y: 0.885, z: TZ + 0.12, mat: new THREE.MeshPhysicalMaterial({ color: 0x1a1c1f, roughness: 0.7, sheen: 0.5, sheenColor: new THREE.Color(0x44484e) }), r: 0.14, seg: 5 })
  bag.rotation.y = 0.3
  for (let i = 0; i < 3; i++) box(scene, { w: 0.22, h: 0.06, d: 0.1, x: TX + 0.66, y: 0.885 + i * 0.062, z: TZ - 0.3 + (i % 2) * 0.02, mat: gold, r: 0.004 })

  // Security lasers.
  const laser = M.emissive(0xff2533, 9)
  for (const [y0, y1, z] of [[0.35, 0.55, -2.4], [0.95, 0.7, -2.9], [1.45, 1.7, -3.4], [0.6, 1.2, -3.9], [1.9, 1.55, -4.4]]) {
    const len = Math.hypot(W, y1 - y0)
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, len, 8), laser)
    beam.geometry.clearGroups()
    beam.position.set(0, (y0 + y1) / 2, z)
    beam.rotation.z = Math.PI / 2 + Math.atan2(y1 - y0, W)
    scene.add(beam)
    for (const sx of [-1, 1]) box(scene, { w: 0.06, h: 0.08, d: 0.08, x: sx * (W / 2 - 0.03), y: (sx < 0 ? y0 : y1) - 0.04, z, mat: M.paint(0x1c1f23, 0.4, 0.3), r: 0.01 })
  }

  // Cold ceiling strips, a red beacon over the door and a camera in the corner.
  for (const x of [-2.6, 0.6, 3.4]) {
    for (const z of [-3.6, 0.2]) {
      box(scene, { w: 0.16, h: 0.02, d: 2.2, x, y: H - 0.03, z, mat: M.emissive(0xe8f0ff, 5), r: 0 })
      const l = new PT.ShapedAreaLight(0xe6eeff, 9, 0.16, 2.2)
      l.position.set(x, H - 0.04, z)
      l.rotation.x = -Math.PI / 2
      scene.add(l)
    }
  }
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.emissive(0xff2a2a, 12))
  beacon.rotation.x = -Math.PI / 2
  beacon.position.set(DX, DY + DR + 0.35, ZB + 0.02)
  scene.add(beacon)
  const red = new PT.ShapedAreaLight(0xff2a2a, 2.5, 0.3, 0.3)
  red.position.set(DX, DY + DR + 0.35, ZB + 0.1)
  red.lookAt(DX, 0, 0)
  scene.add(red)
  box(scene, { w: 0.22, h: 0.14, d: 0.32, x: W / 2 - 0.3, y: H - 0.5, z: ZB + 0.4, mat: M.paint(0xe9eaec, 0.35, 0.4), r: 0.02 })
  box(scene, { w: 0.02, h: 0.03, d: 0.03, x: W / 2 - 0.42, y: H - 0.44, z: ZB + 0.57, mat: M.emissive(0xff2a2a, 6), r: 0 })
  const sign = lib.textTexture(["VAULT 02 · TIME LOCK"], { width: 1024, height: 160, bg: "#101316", fg: "#d6dbe1", font: "700 72px Bahnschrift, 'Segoe UI', sans-serif" })
  plane(scene, { w: 2.2, h: 0.34, x: DX - 2.9, y: 2.55, z: ZB + 0.01, mat: new THREE.MeshPhysicalMaterial({ map: sign, roughness: 0.5 }) })

  const camera = new PT.PhysicalCamera(50, 1.6, 0.05, 200)
  camera.position.set(-1.35, 1.5, 3.3)
  camera.lookAt(0.55, 1.3, -6)
  camera.fStop = 5.6
  camera.focusDistance = 8.6
  return { scene, camera, exposure: 1.25, bounces: 6, toneMapping: THREE.NeutralToneMapping }
}
