// Minecraft — prison yard and rank mine.
// A walled yard with two cell blocks, corner watchtowers and a stepped rank
// mine whose terraces expose ore bands by depth.
// Views: "yard" (default) elevated over the whole prison; "mine" from the rim.
import { World } from "/scripts/gaming/banners/voxel.mjs"
import "/scripts/gaming/banners/voxel-blocks.mjs"

export function build({ THREE, PT, lib, view }) {
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x5d86c9)
  sky.bottomColor.set(0xf1d7b4)
  sky.exponent = 2.2
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.85

  const N = 100, G = 14
  const w = new World(N, 46, N)
  w.solidEdges = true
  const r = lib.rng(9)
  const band = (y) => {
    const depth = G - y
    if (depth < 2) return "stone"
    const roll = r()
    if (depth <= 4) return roll < 0.32 ? "oreCoal" : "stone"
    if (depth <= 7) return roll < 0.3 ? "oreIron" : "stone"
    if (depth <= 9) return roll < 0.3 ? "oreGold" : "stone"
    return roll < 0.34 ? "oreGem" : "stone"
  }
  const inside = (x, z) => x > 8 && x < 91 && z > 8 && z < 91
  for (let z = 0; z < N; z++)
    for (let x = 0; x < N; x++) {
      for (let y = 0; y < G; y++) w.set(x, y, z, band(y))
      w.set(x, G, z, inside(x, z) ? ((x * 7 + z * 3) % 11 === 0 ? "cobble" : "gravel") : "grass")
    }

  // Rank mine: stepped square pit carved into the yard.
  const P = { x0: 28, x1: 72, z0: 44, z1: 84 }
  for (let z = P.z0; z <= P.z1; z++)
    for (let x = P.x0; x <= P.x1; x++) {
      const m = Math.min(x - P.x0, P.x1 - x, z - P.z0, P.z1 - z)
      const depth = Math.min(11, Math.floor(m / 2) + 1)
      for (let y = G; y > G - depth; y--) w.set(x, y, z, null)
    }
  for (let x = P.x0 - 1; x <= P.x1 + 1; x++) for (const z of [P.z0 - 1, P.z1 + 1]) w.set(x, G + 1, z, x % 4 === 0 ? "darkPlanks" : null)
  for (let z = P.z0 - 1; z <= P.z1 + 1; z++) for (const x of [P.x0 - 1, P.x1 + 1]) w.set(x, G + 1, z, z % 4 === 0 ? "darkPlanks" : null)
  for (const [x, z] of [[P.x0 - 2, P.z0 - 2], [P.x1 + 2, P.z0 - 2], [P.x0 - 2, P.z1 + 2], [P.x1 + 2, P.z1 + 2]]) {
    w.fill(x, G + 1, z, x, G + 3, z, "darkPlanks")
    w.set(x, G + 4, z, "lantern")
  }

  // Perimeter wall with a walkway cap.
  for (let i = 8; i <= 91; i++)
    for (const [x, z] of [[i, 8], [i, 91], [8, i], [91, i]])
      for (let y = 1; y <= 7; y++) w.set(x, G + y, z, y === 7 ? "concreteDark" : y >= 5 && i % 3 === 0 ? "ironBars" : "stoneBricks")

  // Corner watchtowers.
  for (const [tx, tz] of [[8, 8], [91, 8], [8, 91], [91, 91]]) {
    for (let y = 1; y <= 13; y++) for (let z = -2; z <= 2; z++) for (let x = -2; x <= 2; x++) {
      const wall = Math.abs(x) === 2 || Math.abs(z) === 2
      if (wall) w.set(tx + x, G + y, tz + z, y >= 11 && (x + z) % 2 === 0 ? "ironBars" : "stoneBricks")
    }
    for (let z = -3; z <= 3; z++) for (let x = -3; x <= 3; x++) w.set(tx + x, G + 14, tz + z, "concreteDark")
    w.set(tx, G + 15, tz, "glow")
  }

  // Two cell blocks along the north side: three floors of barred cells.
  for (const [x0, x1] of [[16, 46], [54, 84]]) {
    const z0 = 14, z1 = 28
    for (let y = 1; y <= 13; y++)
      for (let z = z0; z <= z1; z++)
        for (let x = x0; x <= x1; x++) {
          const wall = x === x0 || x === x1 || z === z0 || z === z1
          if (!wall) continue
          const floorBand = (y - 1) % 4
          const window = z === z1 && floorBand >= 1 && floorBand <= 2 && (x - x0) % 3 !== 0
          w.set(x, G + y, z, window ? "ironBars" : floorBand === 0 ? "concreteDark" : "stoneBricks")
        }
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) w.set(x, G + 14, z, "concreteDark")
    w.fill(Math.round((x0 + x1) / 2) - 1, G + 1, z1, Math.round((x0 + x1) / 2) + 1, G + 3, z1, null)
    for (let x = x0 + 2; x <= x1 - 2; x += 6) w.set(x, G + 15, z1 - 2, "glow")
  }

  // Yard paths and lamp posts.
  for (let x = 20; x <= 80; x++) for (const z of [34, 35]) w.set(x, G, z, "stoneBricks")
  for (let z = 30; z <= 42; z++) for (const x of [49, 50]) w.set(x, G, z, "stoneBricks")
  for (let x = 22; x <= 78; x += 8) {
    w.fill(x, G + 1, 36, x, G + 3, 36, "concreteDark")
    w.set(x, G + 4, 36, "glow")
  }

  scene.add(w.toGroup())
  const sun = new THREE.DirectionalLight(0xffe6c4, 3.2)
  sun.position.set(-45, 40, 35)
  scene.add(sun)

  const camera = new PT.PhysicalCamera(42, 1.6, 0.1, 600)
  if (view === "mine") {
    camera.position.set(-4, 27, 36)
    camera.lookAt(1, 0, 10)
    camera.fov = 52
  } else {
    camera.position.set(-18, 58, 84)
    camera.lookAt(2, 8, 0)
    camera.fov = 46
  }
  return { scene, camera, exposure: 1.0, bounces: 5, toneMapping: THREE.NeutralToneMapping }
}
