// FiveM vehicles — fleet garage at night.
// Three service vehicles parked nose-out in painted bays under strip lights:
// an unmarked SUV, a patrol sedan with its lightbar running and a paramedic
// van. Low camera, wet polished concrete, light doing most of the work.
import { buildVehicle, paint, livery } from "/scripts/gaming/banners/vehicle.mjs"

export function build({ THREE, PT, lib, view }) {
  const { box, plane, cylinder, materials: M } = lib
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05070a)
  const env = new PT.GradientEquirectTexture(256)
  env.topColor.set(0x1a1f27)
  env.bottomColor.set(0x08090b)
  env.update()
  scene.environment = env
  scene.environmentIntensity = 0.6

  const W = 20, D = 14, H = 5.2
  const floor = lib.concrete({ color: 0x4a4b4d, repeat: [6, 4], polish: 0.14 })
  floor.clearcoat = 0.6
  floor.clearcoatRoughness = 0.12
  plane(scene, { w: W, h: D + 8, rx: -Math.PI / 2, z: -D / 2 + 7, mat: floor })

  // Bay lines and numbers.
  const paintLine = M.paint(0xe3b21c, 0.55, 0.2)
  for (let i = -2; i <= 2; i++) box(scene, { w: 0.12, h: 0.004, d: 7, x: i * 3.4 - 1.7 + 1.7, z: -3.5, mat: paintLine, r: 0 })
  const bayNum = (n, x) => {
    const tex = lib.textTexture([String(n).padStart(2, "0")], { width: 512, height: 256, bg: "#46474a", fg: "#e3b21c", font: "800 190px Bahnschrift, 'Segoe UI', sans-serif" })
    plane(scene, { w: 1.2, h: 0.6, x, y: 0.005, z: -6.1, rx: -Math.PI / 2, mat: new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.5 }) })
  }
  bayNum(11, -3.4)
  bayNum(12, 0)
  bayNum(13, 3.4)

  // Back wall: painted block, blue service band, signage, roller door.
  const block = lib.concrete({ color: 0xb9bcc0, repeat: [8, 2], polish: 0.8 })
  plane(scene, { w: W, h: H, y: H / 2, z: -D + 3, mat: block })
  box(scene, { w: W, h: 0.5, d: 0.04, y: 1.0, z: -D + 3.02, mat: M.paint(0x1d4f91, 0.45, 0.3), r: 0 })
  const sign = lib.textTexture(["FLEET SERVICES · BAYS 11–13"], { width: 2048, height: 256, bg: "#15181c", fg: "#f3f4f5", font: "700 110px Bahnschrift, 'Segoe UI', sans-serif" })
  plane(scene, { w: 7, h: 0.88, y: 3.9, z: -D + 3.03, mat: new THREE.MeshPhysicalMaterial({ map: sign, roughness: 0.45 }) })
  box(scene, { w: 4.6, h: 3.4, d: 0.08, x: 7.2, z: -D + 3.04, mat: lib.brushedMetal({ color: 0x8d9298, roughness: 0.45, repeat: [1, 12] }), r: 0 })
  // Side walls, dark ceiling.
  for (const sx of [-1, 1]) plane(scene, { w: D, h: H, x: sx * W / 2, y: H / 2, z: -D / 2 + 3, ry: -sx * Math.PI / 2, mat: block })
  plane(scene, { w: W, h: D, y: H, z: -D / 2 + 3, rx: Math.PI / 2, mat: M.matte(0x16181b, 0.9) })

  // Strip lights over each bay: visible fixture + a long area light.
  for (const x of [-3.4, 0, 3.4]) {
    for (const z of [-2.2, -5.6]) {
      box(scene, { w: 0.22, h: 0.06, d: 2.4, x, y: H - 0.35, z, mat: M.paint(0x2a2d31, 0.4, 0.2), r: 0.01 })
      box(scene, { w: 0.16, h: 0.015, d: 2.3, x, y: H - 0.37, z, mat: M.emissive(0xf6f8ff, 6), r: 0 })
      const l = new PT.ShapedAreaLight(0xf2f5ff, 20, 0.2, 2.3)
      l.position.set(x, H - 0.38, z)
      l.rotation.x = -Math.PI / 2
      scene.add(l)
    }
  }

  // Props: tool cabinet, cones, charge post.
  box(scene, { w: 1.6, h: 1.1, d: 0.6, x: -8.6, z: -9.9, mat: M.paint(0xb3261e, 0.3, 0.8), r: 0.02 })
  for (let k = 0; k < 5; k++) box(scene, { w: 1.5, h: 0.012, d: 0.02, x: -8.6, y: 0.2 + k * 0.2, z: -9.59, mat: M.chrome(), r: 0 })
  for (const [x, z] of [[-6.4, -0.6], [-6.0, -0.2], [6.3, -0.4]]) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 24), M.paint(0xff6a13, 0.4, 0.3))
    cone.position.set(x, 0.27, z)
    scene.add(cone)
    box(scene, { w: 0.36, h: 0.03, d: 0.36, x, z, mat: M.rubber(0x161616), r: 0.01 })
  }
  box(scene, { w: 0.4, h: 1.5, d: 0.3, x: 8.8, z: -3.2, mat: M.paint(0x24272b, 0.35, 0.4), r: 0.03 })
  box(scene, { w: 0.02, h: 0.18, d: 0.2, x: 8.59, y: 1.1, z: -3.2, mat: M.emissive(0x3ccf8e, 2.5), r: 0 })

  // Vehicles.
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
  const medic = livery("#f2f2ee", (ctx, w, h) => {
    const sq = h * 0.1
    for (let x = 0; x < w; x += sq) {
      ctx.fillStyle = (x / sq) % 2 ? "#e8b40f" : "#c8171e"
      ctx.fillRect(x, h * 0.62, sq, sq)
      ctx.fillStyle = (x / sq) % 2 ? "#c8171e" : "#e8b40f"
      ctx.fillRect(x, h * 0.72, sq, sq)
    }
    ctx.fillStyle = "#c8171e"
    ctx.font = `800 ${h * 0.12}px Bahnschrift, 'Segoe UI', sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("PARAMEDIC", w * 0.45, h * 0.46)
  }, { seams: [0.8] })

  const cars = [
    { v: buildVehicle({ style: "suv", paint: paint(0x121820, { metallic: 0.55, roughness: 0.28 }) }), x: -3.4 },
    { v: buildVehicle({ style: "sedan", paint: paint(0xffffff, { map: police, metallic: 0.08 }), lightbar: true, pushBar: true }), x: 0 },
    { v: buildVehicle({ style: "van", paint: paint(0xffffff, { map: medic, metallic: 0.05 }), lightbar: true }), x: 3.55 },
  ]
  for (const { v, x } of cars) {
    v.rotation.y = -Math.PI / 2 // nose toward +z (the camera)
    v.position.set(x, 0, -3.4)
    scene.add(v)
  }

  // Lightbar spill onto the floor and neighbours.
  const red = new PT.ShapedAreaLight(0xff2a36, 6, 0.5, 0.4)
  red.position.set(0.32, 1.72, -3.1)
  red.lookAt(1.5, 0, 1)
  scene.add(red)
  const blue = new PT.ShapedAreaLight(0x3c74ff, 7, 0.5, 0.4)
  blue.position.set(-0.32, 1.72, -3.1)
  blue.lookAt(-1.5, 0, 1)
  scene.add(blue)

  // Soft fill from the open bay behind the camera so the front fascias read
  // instead of falling into shadow under the overhead strips.
  const fill = new PT.ShapedAreaLight(0xdfe6ff, 0.9, 6, 1.5)
  fill.position.set(0.8, 2.2, 9)
  fill.lookAt(0, 0.8, -3.4)
  scene.add(fill)

  const camera = new PT.PhysicalCamera(40, 1.6, 0.05, 200)
  camera.position.set(1.4, 1.05, 6.6)
  camera.lookAt(0, 1.0, -4)
  camera.fStop = 4
  camera.focusDistance = 9.2
  camera.apertureBlades = 7
  return { scene, camera, exposure: 1.9, bounces: 6, toneMapping: THREE.NeutralToneMapping }
}
