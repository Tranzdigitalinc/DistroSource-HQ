// Minecraft — spiral parkour tower over a floating island (Parkour Courses).
// Forty jumps climb an inward spiral in four coloured sections, with a
// checkpoint platform every ten jumps, a start arch and a lit finish arch.
// Views: "cover" (angled, default), "run" (from checkpoint 2 along the next
// jumps) and "top" (straight down, for the course setup map).
import { World, tree } from "/scripts/gaming/banners/voxel.mjs"
import { island } from "/scripts/gaming/banners/voxel-blocks.mjs"

const N = 110
const C = N / 2

/** Jump positions in block coordinates, shared with the setup page's markers. */
export function coursePads() {
  const pads = []
  let a = 0.3
  for (let i = 0; i <= 40; i++) {
    const rad = 30 - i * 0.4
    pads.push({ i, x: Math.round(C + Math.cos(a) * rad), y: 16 + Math.round(i * 0.55), z: Math.round(C + Math.sin(a) * rad) })
    a += (i % 10 === 0 ? 5.6 : 3.4) / rad
  }
  return pads
}

export function build({ THREE, PT, lib, view }) {
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x4f86dc)
  sky.bottomColor.set(0xf2e6d8)
  sky.exponent = 1.5
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 1.0

  const w = new World(N, 60, N)

  // Floating island below the course, with trees and a stone-brick core tower.
  island(w, lib, { cx: C, cy: 10, cz: C, r: 24, top: "grass", seed: 7 })
  for (const [x, z, h, s] of [[C - 12, C + 8, 5, 1], [C + 9, C - 14, 6, 2], [C + 15, C + 10, 5, 3], [C - 6, C - 16, 4, 4], [C - 18, C - 4, 5, 5], [C + 4, C + 17, 5, 6]]) tree(w, x, 11, z, h, s)
  w.fill(C - 1, 11, C - 1, C + 1, 31, C + 1, "stoneBricks")
  for (let y = 14; y <= 30; y += 4) for (const [dx, dz] of [[0, -2], [0, 2], [-2, 0], [2, 0]]) w.set(C + dx, y, C + dz, "glow")

  const SECTIONS = ["teamBlue", "teamYellow", "teamRed", "teamGreen"]
  const pads = coursePads()
  const arch = (p, beam) => {
    for (const dx of [-2, 2]) w.fill(p.x + dx, p.y + 1, p.z, p.x + dx, p.y + 4, p.z, "concreteDark")
    w.fill(p.x - 2, p.y + 5, p.z, p.x + 2, p.y + 5, p.z, beam)
  }
  for (const p of pads) {
    if (p.i % 10 === 0) {
      // Checkpoint: 3×3 quartz platform with a lit centre, lantern posts and a pillar.
      w.fill(p.x - 1, p.y, p.z - 1, p.x + 1, p.y, p.z + 1, "quartz")
      w.fill(p.x - 1, p.y - 1, p.z - 1, p.x + 1, p.y - 1, p.z + 1, "stoneBricks")
      w.set(p.x, p.y, p.z, p.i === 40 ? "lumen" : "glow")
      for (const [dx, dz] of [[-1, -1], [1, 1]]) {
        w.fill(p.x + dx, p.y + 1, p.z + dz, p.x + dx, p.y + 2, p.z + dz, "concreteDark")
        w.set(p.x + dx, p.y + 3, p.z + dz, "lantern")
      }
      w.fill(p.x, p.y - 8, p.z, p.x, p.y - 2, p.z, "stoneBricks")
      if (p.i === 0) arch(p, "glow")
      if (p.i === 40) {
        w.fill(p.x - 2, p.y, p.z - 2, p.x + 2, p.y, p.z + 2, "quartz")
        w.set(p.x, p.y, p.z, "lumen")
        arch(p, "lumen")
      }
      continue
    }
    const block = SECTIONS[Math.min(3, Math.floor(p.i / 10))]
    w.set(p.x, p.y, p.z, block)
    // Every fifth jump lands on the top of a tall pillar of the section colour.
    if (p.i % 5 === 3) w.fill(p.x, p.y - 3, p.z, p.x, p.y - 1, p.z, block)
  }

  scene.add(w.toGroup())
  const sun = new THREE.DirectionalLight(0xfff1d6, 3.4)
  sun.position.set(-40, 60, 30)
  scene.add(sun)

  // Scene coordinates of a block's top centre (the world is centred on x/z).
  const at = (p, up = 1) => new THREE.Vector3(p.x - C + 0.5, p.y + up, p.z - C + 0.5)
  const camera = new PT.PhysicalCamera(46, 1.6, 0.1, 600)
  if (view === "top") {
    // Straight down; ui/pk.html projects checkpoint markers with the same height and fov.
    camera.position.set(0.01, 78, 0)
    camera.lookAt(0, 0, 0)
    camera.fov = 50
  } else if (view === "run") {
    camera.position.copy(at(pads[22], 2.4))
    camera.lookAt(at(pads[26], 0.5))
    camera.fov = 68
  } else {
    camera.position.set(37, 47, 45)
    camera.lookAt(-1, 26, -2)
    camera.fov = 50
  }
  return { scene, camera, exposure: 1.0, bounces: 5, toneMapping: THREE.NeutralToneMapping }
}
