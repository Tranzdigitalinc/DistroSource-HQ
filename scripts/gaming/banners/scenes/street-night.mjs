// FiveM city street at night / dusk.
// The road runs along -z from the camera. Views:
//   "hud"    third-person chase view of a car driving at night (HUD backdrop)
//   "patrol" a patrol car parked at the kerb at dusk, lightbar running
//   "stream" the same patrol car at night, seen from the far kerb (stream backdrop)
//
// Texture budget: the path tracer mis-assigns textures when a scene carries
// dozens of unique maps, so this scene draws from a small shared pool —
// three facade variants (colour + window glow), one shop interior and one
// sign atlas — and selects per-instance content through UVs.
import { buildVehicle, paint, livery } from "/scripts/gaming/banners/vehicle.mjs"

export function build({ THREE, PT, lib, view }) {
  const { box, cylinder, plane, materials: M } = lib
  const dusk = view === "patrol"
  const patrol = dusk || view === "stream"
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(dusk ? 0x1a2a55 : 0x04060d)
  sky.bottomColor.set(dusk ? 0xc9745a : 0x1c1a28)
  sky.exponent = dusk ? 2.2 : 3.2
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = dusk ? 0.6 : 0.22

  const ROAD = 13, WALK = 3.4, LEN = 220

  // Wet asphalt with lane paint.
  const asphalt = lib.concrete({ color: 0x2a2b2e, repeat: [4, 60], polish: 0.2 })
  asphalt.clearcoat = 0.9
  asphalt.clearcoatRoughness = 0.07
  plane(scene, { w: ROAD, h: LEN, z: -LEN / 2 + 20, rx: -Math.PI / 2, mat: asphalt })
  const white = M.paint(0xe4e4df, 0.5, 0.2)
  const yellowPaint = M.paint(0xd9aa18, 0.5, 0.2)
  for (let z = 18; z > -LEN + 20; z -= 9) {
    box(scene, { w: 0.14, h: 0.005, d: 4.2, x: -ROAD / 4, z, mat: white, r: 0 })
    box(scene, { w: 0.14, h: 0.005, d: 4.2, x: ROAD / 4, z, mat: white, r: 0 })
  }
  box(scene, { w: 0.12, h: 0.005, d: LEN, x: -0.1, z: -LEN / 2 + 20, mat: yellowPaint, r: 0 })
  box(scene, { w: 0.12, h: 0.005, d: LEN, x: 0.1, z: -LEN / 2 + 20, mat: yellowPaint, r: 0 })
  const zX = -46
  box(scene, { w: ROAD / 2, h: 0.005, d: 0.4, x: ROAD / 4, z: zX + 6, mat: white, r: 0 })
  for (let k = 0; k < 10; k++) box(scene, { w: 0.7, h: 0.005, d: 3.2, x: -ROAD / 2 + 0.8 + k * 1.3, z: zX + 3.5, mat: white, r: 0 })

  // Sidewalks (plain concrete: no extra maps) and kerbs.
  const walkMat = M.matte(0x7d7b76, 0.55)
  for (const sx of [-1, 1]) {
    box(scene, { w: WALK, h: 0.16, d: LEN, x: sx * (ROAD / 2 + WALK / 2), z: -LEN / 2 + 20, mat: walkMat, r: 0 })
    box(scene, { w: 0.18, h: 0.17, d: LEN, x: sx * (ROAD / 2 + 0.09), z: -LEN / 2 + 20, mat: M.matte(0x9a978f, 0.5), r: 0.01 })
  }

  // ---- Shared facade pool: a tileable 4×4 window grid, colour + glow. ----
  const facadePool = [
    { wall: "#2c2926", seed: 3 },
    { wall: "#33302c", seed: 7 },
    { wall: "#262a30", seed: 11 },
  ].map(({ wall, seed }) => {
    const size = 512, cols = 4, rows = 4
    const color = lib.canvas(size)
    const glow = lib.canvas(size)
    const cc = color.getContext("2d")
    const gc = glow.getContext("2d")
    cc.fillStyle = wall
    cc.fillRect(0, 0, size, size)
    gc.fillStyle = "#000"
    gc.fillRect(0, 0, size, size)
    const r = lib.rng(seed)
    const cw = size / cols, ch = size / rows
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const lit = r() > (dusk ? 0.6 : 0.5)
        const wx = x * cw + cw * 0.2, wy = y * ch + ch * 0.2, ww = cw * 0.6, wh = ch * 0.52
        cc.fillStyle = "#11151b"
        cc.fillRect(wx - 3, wy - 3, ww + 6, wh + 6)
        const tone = `hsl(${30 + r() * 16}, ${50 + r() * 30}%, ${48 + r() * 18}%)`
        cc.fillStyle = lit ? tone : "#1a212b"
        cc.fillRect(wx, wy, ww, wh)
        if (lit) {
          gc.fillStyle = tone
          gc.fillRect(wx, wy, ww, wh)
        }
      }
    const map = lib.toTexture(color)
    const emissiveMap = lib.toTexture(glow)
    return new THREE.MeshPhysicalMaterial({ map, emissiveMap, emissive: 0xffffff, emissiveIntensity: dusk ? 0.8 : 1.3, roughness: 0.8 })
  })
  const roofMat = M.matte(0x18191c, 0.9)

  // ---- One shop interior and one sign atlas (8 rows). ----
  const inside = lib.textTexture([], {
    width: 512,
    height: 256,
    bg: "#8a7560",
    draw(ctx) {
      ctx.fillStyle = "rgba(40,30,20,0.35)"
      for (let i = 0; i < 6; i++) ctx.fillRect(18 + i * 84, 110, 52, 146)
      ctx.fillStyle = "rgba(255,255,255,0.5)"
      ctx.fillRect(0, 0, 512, 22)
    },
  })
  const insideMat = new THREE.MeshPhysicalMaterial({ map: inside, emissiveMap: inside, emissive: 0xffffff, emissiveIntensity: 0.22, roughness: 0.6 })
  const SIGNS = [
    ["NIGHTOWL PHARMACY", "#9ff3c4"],
    ["PINE ST NOODLES", "#ff8a7a"],
    ["24/7 MARKET", "#ffd98a"],
    ["HARBOR LAUNDRY", "#9cc9ff"],
    ["BLUE LINE COFFEE", "#a6e8ff"],
    ["ALDER HARDWARE", "#ffb77a"],
    ["CITY TATTOO", "#ffa3cf"],
    ["MOTEL · VACANCY", "#ff8f8f"],
  ]
  const atlas = lib.canvas(2048)
  {
    const ctx = atlas.getContext("2d")
    ctx.fillStyle = "#07080a"
    ctx.fillRect(0, 0, 2048, 2048)
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = "800 150px Bahnschrift, 'Segoe UI', sans-serif"
    SIGNS.forEach(([name, color], i) => {
      ctx.fillStyle = color
      ctx.fillText(name, 1024, i * 256 + 128)
    })
  }
  const atlasTex = lib.toTexture(atlas)
  const signMat = new THREE.MeshPhysicalMaterial({ color: 0x050505, emissiveMap: atlasTex, emissive: 0xffffff, emissiveIntensity: 1.6, roughness: 0.8 })
  const signPlane = (row) => {
    const g = new THREE.PlaneGeometry(1, 1)
    const uv = g.attributes.uv
    const v0 = 1 - (row + 1) / 8, v1 = 1 - row / 8
    for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) > 0.5 ? v1 : v0)
    uv.needsUpdate = true
    return g
  }

  // ---- Buildings along both sides. ----
  let k = 0
  for (const sx of [-1, 1]) {
    let z = 16
    while (z > -LEN + 30) {
      const w = 12 + ((k * 7) % 3) * 5
      const h = 14 + ((k * 13) % 5) * 7
      const x = sx * (ROAD / 2 + WALK + 6)
      const geo = new THREE.BoxGeometry(12, h, w - 0.6)
      // Scale UVs so every building shows windows at the same physical size.
      const uv = geo.attributes.uv
      for (let i = 0; i < uv.count; i++) {
        const face = Math.floor(i / 4)
        const along = face === 0 || face === 1 ? (w - 0.6) / 9 : 12 / 9
        uv.setXY(i, uv.getX(i) * along, uv.getY(i) * (h / 9))
      }
      const mat = facadePool[k % facadePool.length]
      mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping
      mat.emissiveMap.wrapS = mat.emissiveMap.wrapT = THREE.RepeatWrapping
      // One material per mesh: the path tracer shuffles materials across meshes
      // that carry material arrays.
      const b = new THREE.Mesh(geo, mat)
      b.position.set(x, h / 2 + 3.6, z - w / 2)
      scene.add(b)
      // Ground-floor shopfront.
      const frontX = sx * (ROAD / 2 + WALK + 0.02)
      box(scene, { w: 0.1, h: 3.6, d: w - 0.6, x: sx * (ROAD / 2 + WALK + 0.1), z: z - w / 2, mat: M.paint(0x18191c, 0.5, 0.2), r: 0 })
      plane(scene, { w: w - 2, h: 2.3, x: frontX - sx * 0.02, y: 1.45, z: z - w / 2, ry: -sx * Math.PI / 2, mat: insideMat })
      const sign = new THREE.Mesh(signPlane(k % SIGNS.length), signMat)
      sign.scale.set(Math.min(w - 2, 7), 0.7, 1)
      sign.position.set(frontX - sx * 0.03, 3.05, z - w / 2)
      sign.rotation.y = -sx * Math.PI / 2
      scene.add(sign)
      z -= w
      k++
    }
  }

  // Street lights on both sides, staggered.
  const poleMat = M.paint(0x2a2d31, 0.45, 0.3)
  const headMat = M.emissive(0xffd29a, 9)
  for (let i = 0; i < 9; i++) {
    for (const sx of [-1, 1]) {
      const z = 14 - i * 24 - (sx > 0 ? 12 : 0)
      const x = sx * (ROAD / 2 + 0.6)
      cylinder(scene, { r: 0.09, h: 7.5, x, z, mat: poleMat })
      box(scene, { w: 2.2, h: 0.12, d: 0.14, x: x - sx * 1.05, y: 7.4, z, mat: poleMat, r: 0.02 })
      box(scene, { w: 0.7, h: 0.08, d: 0.3, x: x - sx * 1.9, y: 7.32, z, mat: headMat, r: 0.02 })
      const l = new PT.ShapedAreaLight(0xffcf94, 30, 0.7, 0.3)
      l.position.set(x - sx * 1.9, 7.26, z)
      l.rotation.x = -Math.PI / 2
      scene.add(l)
    }
  }

  // Traffic signal at the intersection.
  cylinder(scene, { r: 0.1, h: 6, x: ROAD / 2 + 0.5, z: zX + 7, mat: poleMat })
  box(scene, { w: 5.2, h: 0.14, d: 0.14, x: ROAD / 2 - 2.1, y: 5.9, z: zX + 7, mat: poleMat, r: 0.02 })
  const greenLamp = M.emissive(0x2cff8a, 8)
  for (const x of [ROAD / 2 - 1.2, ROAD / 2 - 3.6]) {
    box(scene, { w: 0.36, h: 1.0, d: 0.3, x, y: 5.1, z: zX + 7, mat: M.paint(0x1a1c1f, 0.4, 0.3), r: 0.03 })
    const g = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), greenLamp)
    g.position.set(x, 5.3, zX + 7.16)
    scene.add(g)
  }

  // Parked cars along both kerbs (no textures).
  const colors = [0x8b1e1e, 0x1f2a3a, 0xc9ccd1, 0x2f4f3a, 0x151515, 0xd9d6ce]
  let c = 0
  for (const [x, z, ry] of [[ROAD / 2 - 1.3, -8, -Math.PI / 2], [ROAD / 2 - 1.3, -17, -Math.PI / 2], [ROAD / 2 - 1.3, -31, -Math.PI / 2], [-ROAD / 2 + 1.3, -12, Math.PI / 2], [-ROAD / 2 + 1.3, -26, Math.PI / 2], [-ROAD / 2 + 1.3, -60, Math.PI / 2]]) {
    const style = c % 3 === 1 ? "suv" : "sedan"
    const v = buildVehicle({ style, paint: paint(colors[c % colors.length], { metallic: 0.5, roughness: 0.28 }), headlights: false })
    v.position.set(x, 0, z)
    v.rotation.y = ry
    scene.add(v)
    c++
  }

  const camera = new PT.PhysicalCamera(46, 1.6, 0.05, 600)
  if (patrol) {
    const police = livery("#f4f4f2", (ctx, w, h) => {
      ctx.fillStyle = "#0f1a2d"
      ctx.fillRect(0, h * 0.5, w, h * 0.3)
      ctx.fillStyle = "#1f5fd1"
      ctx.fillRect(0, h * 0.8, w, h * 0.03)
      ctx.fillStyle = "#ffffff"
      ctx.font = `800 ${h * 0.16}px Bahnschrift, 'Segoe UI', sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("POLICE", w * 0.55, h * 0.65)
    }, { seams: [0.42, 0.64] })
    const car = buildVehicle({ style: "sedan", paint: paint(0xffffff, { map: police, metallic: 0.08 }), lightbar: true, pushBar: true })
    car.position.set(ROAD / 4 + 0.4, 0, -4)
    car.rotation.y = -Math.PI / 2 - 0.62 // nose toward the camera, angled to show the side
    scene.add(car)
    for (const [col, dx, i] of [[0xff2a36, 0.3, 8], [0x3c74ff, -0.3, 9]]) {
      const l = new PT.ShapedAreaLight(col, i, 0.4, 0.4)
      l.position.set(car.position.x + dx, 1.75, car.position.z)
      l.lookAt(car.position.x + dx * 8, 0, car.position.z + 4)
      scene.add(l)
    }
    if (dusk) {
      camera.position.set(ROAD / 4 - 3.4, 1.15, 5.8)
      camera.lookAt(ROAD / 4 + 0.6, 1.0, -5)
      camera.fStop = 4
      camera.focusDistance = 10
    } else {
      camera.position.set(ROAD / 2 - 0.4, 1.5, 3.0)
      camera.lookAt(ROAD / 4 - 1.2, 1.0, -7)
      camera.fStop = 5.6
      camera.focusDistance = 8.4
    }
  } else {
    const hero = buildVehicle({ style: "sedan", paint: paint(0x1b1f26, { metallic: 0.65, roughness: 0.22 }), headlights: true })
    hero.position.set(ROAD / 4, 0, 2)
    hero.rotation.y = Math.PI / 2 // nose away from the camera, driving down the road
    scene.add(hero)
    for (const dx of [-0.6, 0.6]) {
      const beam = new PT.ShapedAreaLight(0xeaf1ff, 24, 0.25, 0.12)
      beam.position.set(hero.position.x + dx, 0.62, hero.position.z - 2.6)
      beam.lookAt(hero.position.x + dx, 0, hero.position.z - 22)
      scene.add(beam)
    }
    camera.position.set(ROAD / 4, 3.0, 8.6)
    camera.lookAt(ROAD / 4, 1.4, -14)
    camera.fStop = 11
    camera.focusDistance = 8
  }
  return { scene, camera, exposure: dusk ? 1.3 : 1.6, bounces: 5, toneMapping: THREE.NeutralToneMapping }
}
