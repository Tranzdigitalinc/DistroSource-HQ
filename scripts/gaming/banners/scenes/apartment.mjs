// FiveM housing — furnished apartment at dusk.
// Room: x ∈ [-5, 5], z ∈ [-4, 4], ceiling 2.9 m. A full-height window wall at
// z = -4 looks over a city skyline at dusk; the living area is on the left,
// a kitchen island under pendants on the right.
import * as P from "/scripts/gaming/banners/props.mjs"

export function build({ THREE, PT, lib, view }) {
  const { box, cylinder, plane, materials: M } = lib
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x1d2a52)
  sky.bottomColor.set(0xe0875a)
  sky.exponent = 2.0
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.55

  const W = 10, D = 8, H = 2.9
  const oak = lib.woodPlanks({ tone: 0xb08a60, planks: 14, repeat: [3, 4], gloss: 0.4, seed: 23 })
  plane(scene, { w: W, h: D, rx: -Math.PI / 2, mat: oak })
  const wallMat = lib.plaster({ color: 0xefe8dc, repeat: [4, 1.2] })
  plane(scene, { w: D, h: H, x: -W / 2, y: H / 2, ry: Math.PI / 2, mat: wallMat })
  plane(scene, { w: D, h: H, x: W / 2, y: H / 2, ry: -Math.PI / 2, mat: wallMat })
  plane(scene, { w: W, h: H, y: H / 2, z: D / 2, ry: Math.PI, mat: wallMat })
  plane(scene, { w: W, h: D, y: H, rx: Math.PI / 2, mat: M.matte(0xf2efe9, 0.95) })

  // Window wall: black steel mullions and glass, city beyond.
  const frame = M.paint(0x16181b, 0.45, 0.3)
  box(scene, { w: W, h: 0.12, d: 0.12, y: 0, z: -D / 2, mat: frame, r: 0 })
  box(scene, { w: W, h: 0.12, d: 0.12, y: H - 0.12, z: -D / 2, mat: frame, r: 0 })
  box(scene, { w: W, h: 0.06, d: 0.1, y: 2.1, z: -D / 2, mat: frame, r: 0 })
  for (let x = -W / 2; x <= W / 2 + 0.01; x += W / 5) box(scene, { w: 0.08, h: H, d: 0.12, x, z: -D / 2, mat: frame, r: 0 })
  const pane = new THREE.MeshPhysicalMaterial({ color: 0xf4f7fa, transmission: 1, roughness: 0.01, ior: 1.5, thickness: 0.01 })
  plane(scene, { w: W, h: H, y: H / 2, z: -D / 2 - 0.02, mat: pane })

  // Skyline at dusk: painted towers with lit windows on a far plane.
  const city = lib.canvas(2048, 768)
  const cx = city.getContext("2d")
  const grad = cx.createLinearGradient(0, 0, 0, 768)
  grad.addColorStop(0, "#27325e")
  grad.addColorStop(0.55, "#b9676a")
  grad.addColorStop(0.8, "#f2a36b")
  grad.addColorStop(1, "#f7c08a")
  cx.fillStyle = grad
  cx.fillRect(0, 0, 2048, 768)
  const r = lib.rng(77)
  for (let layer = 0; layer < 3; layer++) {
    let x = -20
    while (x < 2048) {
      const w = 60 + r() * 140
      const h = 180 + r() * (layer === 2 ? 420 : 300) - layer * 40
      const top = 768 - h
      cx.fillStyle = ["#2c2f45", "#1f2236", "#141626"][layer]
      cx.fillRect(x, top, w, h)
      if (layer > 0) {
        for (let wy = top + 14; wy < 760; wy += 16) for (let wx = x + 8; wx < x + w - 8; wx += 12) {
          if (r() < (layer === 2 ? 0.34 : 0.22)) {
            cx.fillStyle = r() < 0.8 ? "#ffcf8a" : "#bfe2ff"
            cx.fillRect(wx, wy, 6, 8)
          }
        }
      }
      x += w + 6 + r() * 30
    }
  }
  const cityTex = lib.toTexture(city)
  plane(scene, { w: 70, h: 26, y: 6, z: -40, mat: new THREE.MeshPhysicalMaterial({ map: cityTex, emissiveMap: cityTex, emissive: 0xffffff, emissiveIntensity: 1.1, roughness: 1 }) })
  const dusk = new PT.ShapedAreaLight(0xf0b890, 1.6, W - 0.4, H - 0.3)
  dusk.position.set(0, H / 2, -D / 2 - 0.1)
  dusk.lookAt(0, H / 2 - 0.4, 0)
  scene.add(dusk)

  // Rug.
  const rug = lib.paint(1024, (u, v) => {
    const b = Math.min(u, v, 1 - u, 1 - v)
    if (b < 0.03) return [206, 196, 180]
    const s = Math.floor((u + v) * 9) % 3
    const n = (lib.fbm(u, v, { base: 30, seed: 4 }) - 0.5) * 16
    const c = s === 0 ? [180, 94, 64] : s === 1 ? [226, 214, 196] : [62, 78, 88]
    return [c[0] + n, c[1] + n, c[2] + n]
  }, 700)
  plane(scene, { w: 3.4, h: 2.4, x: -2.0, y: 0.004, z: -0.5, rx: -Math.PI / 2, mat: new THREE.MeshPhysicalMaterial({ map: lib.toTexture(rug), roughness: 0.95, sheen: 0.6, sheenColor: new THREE.Color(0xffe8d0) }) })

  // Sofa facing the room (+x), with a chaise.
  const fabric = new THREE.MeshPhysicalMaterial({ color: 0x6f7f7c, roughness: 0.85, sheen: 0.8, sheenColor: new THREE.Color(0xbcd0cc), sheenRoughness: 0.5 })
  const SX = -4.2
  box(scene, { w: 0.95, h: 0.42, d: 2.8, x: SX, z: -0.6, mat: fabric, r: 0.06, seg: 4 })
  box(scene, { w: 0.28, h: 0.5, d: 2.8, x: SX - 0.34, y: 0.42, z: -0.6, mat: fabric, r: 0.1, seg: 4 })
  for (const z of [-1.5, -0.6, 0.3]) {
    box(scene, { w: 0.78, h: 0.16, d: 0.86, x: SX + 0.06, y: 0.42, z, mat: fabric, r: 0.07, seg: 4 })
    const back = box(scene, { w: 0.22, h: 0.46, d: 0.84, x: SX - 0.2, y: 0.5, z, mat: fabric, r: 0.1, seg: 4 })
    back.rotation.z = 0.12
  }
  box(scene, { w: 1.7, h: 0.42, d: 0.9, x: SX + 0.6, z: 1.2, mat: fabric, r: 0.06, seg: 4 })
  box(scene, { w: 1.55, h: 0.16, d: 0.82, x: SX + 0.66, y: 0.42, z: 1.2, mat: fabric, r: 0.07, seg: 4 })
  for (const z of [-2.02, 0.82]) box(scene, { w: 0.95, h: 0.62, d: 0.18, x: SX, z: z, mat: fabric, r: 0.08, seg: 4 })
  const pillowMat = new THREE.MeshPhysicalMaterial({ color: 0xc9774f, roughness: 0.8, sheen: 0.6, sheenColor: new THREE.Color(0xffc3a0) })
  for (const z of [-1.7, 0.4]) {
    const p = box(scene, { w: 0.16, h: 0.4, d: 0.42, x: SX + 0.02, y: 0.56, z, mat: pillowMat, r: 0.08, seg: 4 })
    p.rotation.z = 0.25
  }

  // Coffee table, side table, lamp and books.
  const walnut = lib.woodPlanks({ tone: 0x5a3a24, planks: 4, repeat: [1, 1], gloss: 0.35, seed: 29 })
  box(scene, { w: 1.3, h: 0.05, d: 0.7, x: -2.2, y: 0.38, z: -0.5, mat: walnut, r: 0.02 })
  for (const [dx, dz] of [[-0.55, -0.28], [0.55, -0.28], [-0.55, 0.28], [0.55, 0.28]]) cylinder(scene, { r: 0.018, h: 0.38, x: -2.2 + dx, z: -0.5 + dz, mat: M.paint(0x141414, 0.4, 0.3), seg: 12 })
  box(scene, { w: 0.34, h: 0.05, d: 0.24, x: -2.45, y: 0.43, z: -0.62, mat: M.paint(0x2b4c6f, 0.5, 0.3), r: 0.005 })
  box(scene, { w: 0.3, h: 0.04, d: 0.22, x: -2.45, y: 0.48, z: -0.6, mat: M.paint(0xd9c7a6, 0.5, 0.3), r: 0.005 })
  cylinder(scene, { r: 0.06, rTop: 0.07, h: 0.16, x: -1.9, y: 0.43, z: -0.4, mat: M.paint(0xe8e2d6, 0.25, 0.8), seg: 32 })
  cylinder(scene, { r: 0.25, h: 0.5, x: -4.2, z: -2.55, mat: walnut, seg: 40 })
  // Arc floor lamp.
  cylinder(scene, { r: 0.16, h: 0.04, x: -4.45, z: 2.1, mat: M.paint(0x1a1a1a, 0.3, 0.6), seg: 40 })
  cylinder(scene, { r: 0.015, h: 1.9, x: -4.45, z: 2.1, mat: M.chrome(), seg: 12 })
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.013, 10, 48, Math.PI / 2), M.chrome())
  arc.position.set(-3.65, 1.9, 2.1)
  arc.rotation.y = 0
  scene.add(arc)
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.paint(0x1a1a1a, 0.4, 0.4))
  shade.geometry.clearGroups()
  shade.position.set(-2.85, 1.88, 2.1)
  scene.add(shade)
  const lampLight = new PT.ShapedAreaLight(0xffcf96, 10, 0.26, 0.26)
  lampLight.isCircular = true
  lampLight.position.set(-2.85, 1.84, 2.1)
  lampLight.rotation.x = -Math.PI / 2
  scene.add(lampLight)

  // Framed prints above the sofa.
  const art = (hue) => (ctx, w, h) => {
    ctx.fillStyle = `hsl(${hue}, 30%, 88%)`
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = `hsl(${hue + 180}, 35%, 42%)`
    ctx.beginPath(); ctx.arc(w * 0.42, h * 0.45, w * 0.26, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = `hsl(${hue + 20}, 55%, 55%)`
    ctx.fillRect(w * 0.5, h * 0.52, w * 0.34, h * 0.3)
  }
  P.framedPrint(scene, { x: -W / 2 + 0.02, y: 2.15, z: -1.3, ry: -Math.PI / 2, w: 0.8, h: 1.0, draw: art(20) })
  P.framedPrint(scene, { x: -W / 2 + 0.02, y: 2.05, z: -0.2, ry: -Math.PI / 2, w: 0.6, h: 0.8, draw: art(200) })

  // Kitchen: island, back run of cabinets, pendants and stools.
  const quartz = M.laminate(0xf5f3ee)
  const green = M.paint(0x2f4a3f, 0.45, 0.4)
  box(scene, { w: 2.6, h: 0.9, d: 0.95, x: 2.2, z: -1.6, mat: green, r: 0.02 })
  box(scene, { w: 2.75, h: 0.05, d: 1.05, x: 2.2, y: 0.9, z: -1.6, mat: quartz, r: 0.015 })
  box(scene, { w: 0.05, h: 0.9, d: 1.05, x: 3.55, z: -1.6, mat: quartz, r: 0.01 })
  box(scene, { w: 0.62, h: 2.2, d: 3.6, x: W / 2 - 0.31, z: -1.6, mat: green, r: 0.02 })
  box(scene, { w: 0.64, h: 0.04, d: 2.2, x: W / 2 - 0.33, y: 0.9, z: -1.2, mat: quartz, r: 0.01 })
  box(scene, { w: 0.02, h: 0.02, d: 1.2, x: W / 2 - 0.63, y: 0.6, z: -1.2, mat: M.chrome(), r: 0 })
  for (const z of [-2.8, -2.2, -0.6]) box(scene, { w: 0.02, h: 0.4, d: 0.02, x: W / 2 - 0.63, y: 1.4, z, mat: M.chrome(), r: 0 })
  for (const x of [1.5, 2.2, 2.9]) P.stool(scene, { x, z: -0.85, vinyl: M.paint(0x1c1c1c, 0.5, 0.3), chrome: M.paint(0x111111, 0.35, 0.4) })
  const shadeMat = M.paint(0x1a1a1a, 0.4, 0.5)
  for (const x of [1.5, 2.2, 2.9]) P.pendant(scene, PT, { x, z: -1.6, ceiling: H, drop: 0.9, shadeMat, intensity: 16, radius: 0.15 })
  cylinder(scene, { r: 0.13, rTop: 0.15, h: 0.08, x: 2.4, y: 0.95, z: -1.7, mat: M.paint(0xe9e3d8, 0.3, 0.8), seg: 32 })
  for (let i = 0; i < 4; i++) {
    const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), M.paint([0xd9822b, 0xc9442b, 0xe0b52b, 0x7fa83a][i], 0.4, 0.5))
    fruit.position.set(2.36 + (i % 2) * 0.07, 1.06, -1.72 + Math.floor(i / 2) * 0.07)
    scene.add(fruit)
  }

  P.plant(scene, { x: -0.9, z: -3.3, scale: 1.6, seed: 13 })
  P.plant(scene, { x: 4.2, z: 2.9, scale: 1.2, seed: 17 })
  // Low console under the window.
  box(scene, { w: 2.0, h: 0.45, d: 0.4, x: -1.9, z: -3.6, mat: walnut, r: 0.02 })
  cylinder(scene, { r: 0.1, rTop: 0.06, h: 0.32, x: -2.5, y: 0.45, z: -3.6, mat: M.paint(0x2a4d6b, 0.3, 0.8), seg: 32 })

  for (const x of [-3, -1, 1, 3]) for (const z of [-2, 1.2, 3]) P.downlight(scene, PT, { x, z, ceiling: H, intensity: 5 })

  const camera = new PT.PhysicalCamera(58, 1.6, 0.05, 200)
  camera.position.set(3.9, 1.5, 3.6)
  camera.lookAt(-1.1, 1.05, -2.6)
  camera.fStop = 8
  camera.focusDistance = 6.5
  return { scene, camera, exposure: 1.25, bounces: 6, toneMapping: THREE.NeutralToneMapping }
}
