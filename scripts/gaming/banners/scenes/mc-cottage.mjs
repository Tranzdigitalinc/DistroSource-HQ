// Minecraft — Resource Pack Studio "Hearthside" set.
// A timber-framed cottage at golden hour built only with the set's blocks:
// whitewash walls, slate roof, brick chimney, lit leaded windows, a
// flagstone path through a flower garden, autumn trees and a pond.
import { World } from "/scripts/gaming/banners/voxel.mjs"
import "/scripts/gaming/banners/voxel-blocks.mjs"

function autumnTree(w, x, y, z, h, r) {
  for (let i = 0; i < h; i++) w.set(x, y + i, z, "rpLog")
  const top = y + h
  for (let dy = -2; dy <= 1; dy++) {
    const rad = dy === 1 ? 1.2 : dy === -2 ? 2 : 2.6
    for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) {
      if (Math.hypot(dx, dz) > rad || w.get(x + dx, top + dy, z + dz)) continue
      if (r() < 0.08 && Math.hypot(dx, dz) > rad - 1) continue
      w.set(x + dx, top + dy, z + dz, "rpLeaves")
    }
  }
}

export function build({ THREE, PT, lib }) {
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x4a6fb0)
  sky.bottomColor.set(0xf6c38e)
  sky.exponent = 2.4
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.85

  const N = 64, G = 6
  const w = new World(N, 32, N)
  w.solidEdges = true
  const r = lib.rng(31)
  for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) {
    const hill = Math.hypot(x - 32, z - 30) > 24 ? Math.round(lib.fbm(x / N, z / N, { base: 3, seed: 8 }) * 4) : 0
    w.column(x, z, G + hill)
  }

  // Cottage walls (x 22..40, z 18..28), log corner posts, windows and door.
  const X0 = 22, X1 = 40, Z0 = 18, Z1 = 28, WALL = 5
  for (let y = 1; y <= WALL; y++)
    for (let z = Z0; z <= Z1; z++)
      for (let x = X0; x <= X1; x++) {
        const edge = x === X0 || x === X1 || z === Z0 || z === Z1
        if (!edge) continue
        const corner = (x === X0 || x === X1) && (z === Z0 || z === Z1)
        w.set(x, G + y, z, corner ? "rpLog" : y === 1 ? "rpBricks" : "rpWhitewash")
      }
  for (const x of [X0 + 3, X0 + 4, X1 - 4, X1 - 3]) for (const y of [2, 3]) w.set(x, G + y, Z1, "rpWindow")
  for (const z of [Z0 + 4, Z0 + 5]) for (const y of [2, 3]) { w.set(X0, G + y, z, "rpWindow"); w.set(X1, G + y, z, "rpWindow") }
  const DX = Math.round((X0 + X1) / 2)
  w.fill(DX, G + 1, Z1, DX, G + 2, Z1, "darkPlanks")
  w.set(DX, G + 3, Z1, "rpPlanks")

  // Gable roof along x with overhang, whitewash gable ends.
  const mid = (Z0 + Z1) / 2
  for (let i = 0; i <= 6; i++) {
    const y = G + WALL + 1 + i
    for (let x = X0 - 1; x <= X1 + 1; x++) {
      for (const z of [Z0 - 1 + i, Z1 + 1 - i]) if (Math.abs(z - mid) <= 6.5) w.set(x, y, z, "rpRoof")
    }
    for (const x of [X0, X1]) for (let z = Z0 + i; z <= Z1 - i; z++) if (!w.get(x, y, z)) w.set(x, y, z, "rpWhitewash")
  }
  for (let y = G + 1; y <= G + WALL + 9; y++) w.set(X1 - 4, y, Z0 + 2, "rpBricks")
  w.set(X1 - 4, G + WALL + 10, Z0 + 2, "cobble")

  // Porch, path and garden.
  for (let x = DX - 2; x <= DX + 2; x++) w.set(x, G, Z1 + 1, "rpPlanks")
  for (let z = Z1 + 2; z < N; z++) for (const o of [-1, 0, 1]) w.set(DX + o, G, z, "rpPath")
  for (let z = Z1 + 3; z <= Z1 + 14; z++)
    for (let x = X0 - 2; x <= X1 + 2; x++) {
      if (Math.abs(x - DX) <= 2) continue
      const border = z === Z1 + 14 || x === X0 - 2 || x === X1 + 2
      if (border) w.set(x, G + 1, z, (x + z) % 2 ? "darkPlanks" : null)
      else if ((Math.floor((x - X0) / 3) + z) % 2 === 0) w.set(x, G, z, "flowerBed")
    }
  for (const z of [Z1 + 4, Z1 + 9, Z1 + 14]) for (const s of [-3, 3]) {
    w.fill(DX + s, G + 1, z, DX + s, G + 2, z, "darkPlanks")
    w.set(DX + s, G + 3, z, "lantern")
  }

  // Pond with a sand rim.
  for (let z = 32; z <= 40; z++) for (let x = 6; x <= 16; x++) {
    const d = Math.hypot((x - 11) / 5.5, (z - 36) / 4.2)
    if (d < 1) w.set(x, G, z, d < 0.78 ? "water" : "sand")
  }

  // Autumn trees around the cottage.
  for (const [x, z, h] of [[14, 16, 6], [48, 14, 7], [52, 30, 5], [10, 26, 5], [46, 44, 6], [18, 48, 5]]) {
    let top = G
    while (w.get(x, top + 1, z)) top++
    autumnTree(w, x, top + 1, z, h, r)
  }

  scene.add(w.toGroup())
  const sun = new THREE.DirectionalLight(0xffd5a0, 3.0)
  sun.position.set(-40, 22, 30)
  scene.add(sun)

  const camera = new PT.PhysicalCamera(40, 1.6, 0.1, 500)
  camera.position.set(16, 17, 36)
  camera.lookAt(-7, 8, -6)
  return { scene, camera, exposure: 1.05, bounces: 6, toneMapping: THREE.NeutralToneMapping }
}
