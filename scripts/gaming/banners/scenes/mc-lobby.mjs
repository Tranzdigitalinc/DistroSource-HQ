// Minecraft — modern network lobby on a floating island.
// White concrete plaza with glowing accent rings, a central spire, four
// walkways out to coloured gamemode portals, and floating hologram labels.
import { World, tree } from "/scripts/gaming/banners/voxel.mjs"

export function build({ THREE, PT, lib, view }) {
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x3f78cf)
  sky.bottomColor.set(0xd6ebff)
  sky.exponent = 1.7
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 1.0

  const N = 84, H = 44
  const w = new World(N, H, N)
  const c = N / 2
  const G = 20
  const R = 22

  // Island: plaza on top, tapered rock underneath.
  for (let z = 0; z < N; z++)
    for (let x = 0; x < N; x++) {
      const d = Math.hypot(x - c + 0.5, z - c + 0.5)
      if (d >= R + 2) continue
      const depth = Math.max(2, Math.round((R + 2 - d) * 0.9 + lib.fbm(x / N, z / N, { base: 4, seed: 9 }) * 6))
      for (let y = G - depth; y < G; y++) w.set(x, y, z, y > G - 3 ? "dirt" : "stone")
      let top = "concrete"
      if (d >= R) top = "grass"
      else if (d >= 6.2 && d < 7) top = "cyan"
      else if (d >= 14.2 && d < 15) top = "orange"
      else if (d >= 15) top = (Math.floor(x / 2) + Math.floor(z / 2)) % 2 ? "concrete" : "quartz"
      w.set(x, G, z, top)
    }
  // Glass railing around the plaza edge, with gaps for the walkways.
  for (let a = 0; a < 360; a += 0.5) {
    const rad = (a * Math.PI) / 180
    const x = Math.round(c + Math.cos(rad) * (R - 0.6))
    const z = Math.round(c + Math.sin(rad) * (R - 0.6))
    if (Math.min(...[0, 90, 180, 270, 360].map((g) => Math.abs(a - g))) < 8) continue
    w.set(x, G + 1, z, "glass")
  }

  // Central spire with glow bands and an orange crown.
  for (let y = G + 1; y <= G + 17; y++)
    for (let z = -3; z <= 3; z++)
      for (let x = -3; x <= 3; x++) {
        const d = Math.hypot(x, z)
        const r = y > G + 12 ? 2.2 : 3.1
        if (d <= r && d > r - 1.3) w.set(c + x, y, c + z, (y - G) % 4 === 0 ? "glow" : "concreteDark")
      }
  for (let z = -2; z <= 2; z++) for (let x = -2; x <= 2; x++) if (Math.hypot(x, z) <= 2.3) w.set(c + x, G + 18, c + z, "orange")
  w.set(c, G + 19, c, "glow")

  // Walkways and gamemode portals.
  const arms = [
    { dx: 0, dz: -1, portal: "portal", label: "SURVIVAL" },
    { dx: 1, dz: 0, portal: "portalCyan", label: "SKYBLOCK" },
    { dx: 0, dz: 1, portal: "portalOrange", label: "MINIGAMES" },
    { dx: -1, dz: 0, portal: "portalGreen", label: "CREATIVE" },
  ]
  const holograms = []
  for (const arm of arms) {
    for (let s = R - 1; s <= R + 13; s++) {
      for (let o = -2; o <= 2; o++) {
        const x = c + arm.dx * s + (arm.dz !== 0 ? o : 0)
        const z = c + arm.dz * s + (arm.dx !== 0 ? o : 0)
        w.set(x, G, z, Math.abs(o) === 2 ? "cyan" : "concrete")
        w.set(x, G - 1, z, "concreteDark")
      }
    }
    const s = R + 13
    const cx = c + arm.dx * s, cz = c + arm.dz * s
    for (let o = -3; o <= 3; o++)
      for (let j = 1; j <= 8; j++) {
        const x = cx + (arm.dz !== 0 ? o : 0)
        const z = cz + (arm.dx !== 0 ? o : 0)
        const edge = Math.abs(o) === 3 || j === 8
        w.set(x, G + j, z, edge ? "concreteDark" : arm.portal)
      }
    for (const o of [-4, 4]) {
      const x = cx + (arm.dz !== 0 ? o : 0)
      const z = cz + (arm.dx !== 0 ? o : 0)
      for (let j = 1; j <= 9; j++) w.set(x, G + j, z, j % 3 === 0 ? "glow" : "concrete")
    }
    holograms.push({ x: cx - N / 2 + 0.5, y: G + 11.2, z: cz - N / 2 + 0.5, label: arm.label, color: { portal: "#c58bff", portalCyan: "#7ff0ff", portalOrange: "#ffb070", portalGreen: "#8dff9e" }[arm.portal] })
  }

  // Planters with small trees and lamp posts on the plaza.
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8
    const x = Math.round(c + Math.cos(a) * 11)
    const z = Math.round(c + Math.sin(a) * 11)
    w.fill(x - 1, G + 1, z - 1, x + 1, G + 1, z + 1, "concreteDark")
    w.set(x, G + 1, z, "grass")
    tree(w, x, G + 2, z, 3, k + 20)
    const lx = Math.round(c + Math.cos(a + Math.PI / 8) * 17)
    const lz = Math.round(c + Math.sin(a + Math.PI / 8) * 17)
    w.fill(lx, G + 1, lz, lx, G + 3, lz, "concreteDark")
    w.set(lx, G + 4, lz, "glow")
  }

  scene.add(w.toGroup())

  const sun = new THREE.DirectionalLight(0xfff3dc, 3.4)
  sun.position.set(40, 60, 25)
  scene.add(sun)

  const camera = new PT.PhysicalCamera(36, 1.6, 0.1, 800)
  camera.position.set(46, 50, 74)
  camera.lookAt(0, G + 3, 2)
  camera.updateMatrixWorld()

  // Hologram labels facing the camera.
  for (const h of holograms) {
    const tex = lib.textTexture([h.label], { width: 1024, height: 256, bg: "#000000", fg: h.color, font: "800 150px Bahnschrift, 'Segoe UI', sans-serif" })
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x000000, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 2.6, alphaMap: tex, transparent: true, roughness: 1 })
    const p = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), mat)
    p.position.set(h.x, h.y, h.z)
    p.lookAt(camera.position)
    scene.add(p)
  }
  return { scene, camera, exposure: 1.0, bounces: 6, toneMapping: THREE.NeutralToneMapping }
}
