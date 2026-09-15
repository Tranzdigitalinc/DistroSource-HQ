// FiveM vehicles — livery reference render.
// The paramedic van and the patrol sedan side-on on a seamless grey studio
// floor, lit evenly by large soft boxes, shot with a long lens so the
// profiles read almost orthographic. Used under the livery-template sheet.
import { buildVehicle, paint, livery } from "/scripts/gaming/banners/vehicle.mjs"

export function build({ THREE, PT, lib }) {
  const { plane, materials: M } = lib
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe9ebee)
  const env = new PT.GradientEquirectTexture(256)
  env.topColor.set(0xffffff)
  env.bottomColor.set(0xc9ccd1)
  env.update()
  scene.environment = env
  scene.environmentIntensity = 1.1

  // Seamless floor + backdrop.
  const studio = M.matte(0xdfe2e6, 0.7)
  plane(scene, { w: 80, h: 40, rx: -Math.PI / 2, mat: studio })
  plane(scene, { w: 80, h: 30, y: 15, z: -8, mat: studio })

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

  const van = buildVehicle({ style: "van", paint: paint(0xffffff, { map: medic, metallic: 0.05 }), lightbar: true, lightsOn: false, headlights: false })
  van.position.set(-3.3, 0, 0)
  const car = buildVehicle({ style: "sedan", paint: paint(0xffffff, { map: police, metallic: 0.08 }), lightbar: true, lightsOn: false, headlights: false })
  car.position.set(3.3, 0, 0)
  scene.add(van, car)

  for (const [x, i] of [[-6, 8], [0, 10], [6, 8]]) {
    const l = new PT.ShapedAreaLight(0xffffff, i, 5, 3)
    l.position.set(x, 7, 7)
    l.lookAt(x * 0.6, 0.8, 0)
    scene.add(l)
  }

  const camera = new PT.PhysicalCamera(8.6, 1.6, 1, 400)
  camera.position.set(0, 1.3, 62)
  camera.lookAt(0, 1.05, 0)
  camera.fStop = 32
  camera.focusDistance = 62
  return { scene, camera, exposure: 1.05, bounces: 5, toneMapping: THREE.NeutralToneMapping }
}
