// Minecraft — four-team minigame arena.
// Four coloured team islands (base hut, generator) linked by bridges to a
// central island with the shared objective; small resource islands on the
// diagonals. Views: "cover" (default, angled) and "top" (straight down).
import { World } from "/scripts/gaming/banners/voxel.mjs"
import { island } from "/scripts/gaming/banners/voxel-blocks.mjs"

export function build({ THREE, PT, lib, view }) {
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x5a8fe0)
  sky.bottomColor.set(0xeaf3ff)
  sky.exponent = 1.6
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 1.0

  const N = 100, Y = 18
  const w = new World(N, 34, N)
  const c = N / 2

  // Central island with a raised objective platform.
  island(w, lib, { cx: c, cy: Y, cz: c, r: 8, top: "quartz", sub: "stone", core: "stone", seed: 1 })
  for (let z = -3; z <= 3; z++) for (let x = -3; x <= 3; x++) w.set(c + x, Y + 1, c + z, Math.abs(x) === 3 || Math.abs(z) === 3 ? "concreteDark" : "quartz")
  w.fill(c - 1, Y + 2, c - 1, c, Y + 3, c, "oreGem")
  for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) {
    w.fill(c + x, Y + 2, c + z, c + x, Y + 4, c + z, "concreteDark")
    w.set(c + x, Y + 5, c + z, "glow")
  }

  // Team islands: platform, base hut with a doorway, generator, bed of wool.
  const teams = [
    { name: "teamRed", dx: 0, dz: 1 },
    { name: "teamBlue", dx: 1, dz: 0 },
    { name: "teamGreen", dx: 0, dz: -1 },
    { name: "teamYellow", dx: -1, dz: 0 },
  ]
  const R = 34
  for (const [i, t] of teams.entries()) {
    const tx = c + t.dx * R, tz = c + t.dz * R
    island(w, lib, { cx: tx, cy: Y, cz: tz, r: 7, top: t.name, sub: "stone", core: "stone", seed: 10 + i })
    // Hut on the far side of the island from the centre.
    const hx = tx + t.dx * 3, hz = tz + t.dz * 3
    for (let y = 1; y <= 4; y++)
      for (let z = -2; z <= 2; z++)
        for (let x = -2; x <= 2; x++) {
          const wall = Math.abs(x) === 2 || Math.abs(z) === 2
          const door = y <= 2 && ((t.dx === 0 && x === 0 && z === -2 * t.dz) || (t.dz === 0 && z === 0 && x === -2 * t.dx))
          if (wall && !door) w.set(hx + x, Y + y, hz + z, y === 4 ? "concreteDark" : t.name)
        }
    for (let z = -2; z <= 2; z++) for (let x = -2; x <= 2; x++) w.set(hx + x, Y + 5, hz + z, "concreteDark")
    // Generator block and lamp posts.
    w.set(tx - t.dx * 2, Y + 1, tz - t.dz * 2, "lumen")
    for (const s of [-1, 1]) {
      const px = tx - t.dx * 4 + (t.dz !== 0 ? s * 3 : 0), pz = tz - t.dz * 4 + (t.dx !== 0 ? s * 3 : 0)
      w.fill(px, Y + 1, pz, px, Y + 2, pz, "concreteDark")
      w.set(px, Y + 3, pz, "glow")
    }
    // Bridge to the centre.
    for (let s = 8; s <= R - 8; s++) {
      const x = c + t.dx * s, z = c + t.dz * s
      for (const o of [-1, 0, 1]) w.set(x + (t.dz !== 0 ? o : 0), Y, z + (t.dx !== 0 ? o : 0), o === 0 ? "planks" : "darkPlanks")
    }
  }

  // Diagonal resource islands.
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const x = c + sx * 22, z = c + sz * 22
    island(w, lib, { cx: x, cy: Y - 2, cz: z, r: 4, top: "grass", seed: 30 + sx * 3 + sz })
    w.set(x, Y - 1, z, "oreGold")
    w.set(x + 1, Y - 1, z, "oreIron")
  }

  scene.add(w.toGroup())
  const sun = new THREE.DirectionalLight(0xfff1d6, 3.4)
  sun.position.set(-40, 60, 30)
  scene.add(sun)

  const camera = new PT.PhysicalCamera(40, 1.6, 0.1, 600)
  if (view === "top") {
    camera.position.set(0.01, 118, 0)
    camera.lookAt(0, 0, 0)
    camera.fov = 56
  } else {
    camera.position.set(22, 46, 68)
    camera.lookAt(-4, 14, -4)
    camera.fov = 48
  }
  return { scene, camera, exposure: 1.0, bounces: 5, toneMapping: THREE.NeutralToneMapping }
}
