// Minecraft — medieval spawn hub at golden hour.
// A walled circular plaza with a tiered fountain, four paths out to lit
// portal arches, corner towers, trees and lantern posts.
import { World, tree } from "/scripts/gaming/banners/voxel.mjs"

export function build({ THREE, PT, lib, view }) {
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x6d9be0)
  sky.bottomColor.set(0xf3c89a)
  sky.exponent = 2.4
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.9

  const N = 72, H = 30
  const w = new World(N, H, N)
  const c = N / 2
  const G = 6 // ground level

  // Terrain with gentle rolling edges.
  const r = lib.rng(42)
  for (let z = 0; z < N; z++)
    for (let x = 0; x < N; x++) {
      const d = Math.hypot(x - c, z - c)
      const hill = d > 27 ? Math.round(lib.fbm(x / N, z / N, { base: 3, seed: 5 }) * 5) : 0
      w.column(x, z, G + hill)
    }

  // Plaza: stone-brick ring, cobble field, path cross.
  for (let z = 0; z < N; z++)
    for (let x = 0; x < N; x++) {
      const d = Math.hypot(x - c + 0.5, z - c + 0.5)
      if (d < 16) w.set(x, G, z, d > 14.8 ? "bricks" : (x + z) % 7 === 0 ? "stone" : "cobble")
      const onPath = (Math.abs(x - c + 0.5) < 2.2 || Math.abs(z - c + 0.5) < 2.2) && d < 27
      if (onPath && d >= 16) w.set(x, G, z, "path")
    }

  // Tiered fountain.
  for (let z = -6; z <= 6; z++)
    for (let x = -6; x <= 6; x++) {
      const d = Math.hypot(x + 0.5, z + 0.5)
      if (d < 6.2 && d >= 5.2) w.set(c + x, G + 1, c + z, "bricks")
      if (d < 5.2) w.set(c + x, G + 1, c + z, "water")
    }
  w.fill(c - 1, G + 1, c - 1, c, G + 4, c, "bricks")
  for (let z = -2; z <= 1; z++) for (let x = -2; x <= 1; x++) if (Math.abs(x + 0.5) + Math.abs(z + 0.5) >= 2) w.set(c + x, G + 4, c + z, "bricks")
  w.fill(c - 1, G + 5, c - 1, c, G + 5, c, "water")
  w.set(c - 1, G + 6, c - 1, "lantern")

  // Portal arches at the end of each path.
  const arch = (cx, cz, alongX) => {
    const pw = 3, ph = 5
    for (let i = -pw - 1; i <= pw; i++)
      for (let j = 0; j <= ph + 1; j++) {
        const edge = i === -pw - 1 || i === pw || j === ph + 1
        const px = alongX ? cx + i : cx
        const pz = alongX ? cz : cz + i
        if (edge) w.set(px, G + 1 + j, pz, "bricks")
        else w.set(px, G + 1 + j, pz, "portal")
      }
    for (let i = -pw - 2; i <= pw + 1; i++) {
      const px = alongX ? cx + i : cx
      const pz = alongX ? cz : cz + i
      w.set(px, G + ph + 3, pz, "darkPlanks")
    }
    for (const s of [-pw - 2, pw + 1]) {
      const px = alongX ? cx + s : cx
      const pz = alongX ? cz : cz + s
      w.fill(px, G + 1, pz, px, G + ph + 2, pz, "log")
      w.set(px, G + ph + 3, pz, "lantern")
    }
  }
  arch(c, c - 24, true)
  arch(c, c + 23, true)
  arch(c - 24, c, false)
  arch(c + 23, c, false)

  // Curtain wall with crenellations and four towers.
  for (let a = 0; a < 360; a += 0.6) {
    const rad = (a * Math.PI) / 180
    const x = Math.round(c + Math.cos(rad) * 19.5)
    const z = Math.round(c + Math.sin(rad) * 19.5)
    const gap = Math.min(...[0, 90, 180, 270, 360].map((g) => Math.abs(a - g))) < 11
    if (gap) continue
    for (let y = 1; y <= 4; y++) w.set(x, G + y, z, y === 4 && (x + z) % 2 ? null : "bricks")
  }
  for (const [tx, tz] of [[c - 14, c - 14], [c + 13, c - 14], [c - 14, c + 13], [c + 13, c + 13]]) {
    for (let y = 1; y <= 9; y++)
      for (let z = -2; z <= 2; z++)
        for (let x = -2; x <= 2; x++) {
          const d = Math.hypot(x, z)
          if (d <= 2.3 && d > 1.2) w.set(tx + x, G + y, tz + z, y % 4 === 0 ? "stone" : "bricks")
        }
    for (let z = -3; z <= 3; z++)
      for (let x = -3; x <= 3; x++) if (Math.hypot(x, z) <= 3.2) w.set(tx + x, G + 10, tz + z, "darkPlanks")
    for (let dy = 1; dy <= 3; dy++)
      for (let z = -3; z <= 3; z++)
        for (let x = -3; x <= 3; x++) if (Math.hypot(x, z) <= 3.2 - dy) w.set(tx + x, G + 10 + dy, tz + z, "darkPlanks")
    w.set(tx, G + 5, tz + 3, "lantern")
  }

  // Lantern posts around the plaza and trees beyond the wall.
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8
    const x = Math.round(c + Math.cos(a) * 11)
    const z = Math.round(c + Math.sin(a) * 11)
    w.fill(x, G + 1, z, x, G + 3, z, "log")
    w.set(x, G + 4, z, "lantern")
  }
  for (let k = 0; k < 22; k++) {
    const a = r() * Math.PI * 2
    const d = 23 + r() * 10
    const x = Math.round(c + Math.cos(a) * d)
    const z = Math.round(c + Math.sin(a) * d)
    if (Math.abs(x - c) < 5 || Math.abs(z - c) < 5) continue
    let top = G
    while (w.get(x, top + 1, z)) top++
    tree(w, x, top + 1, z, 4 + Math.floor(r() * 3), k + 3)
  }

  scene.add(w.toGroup())

  // Low golden sun from behind the camera's left.
  const sun = new THREE.DirectionalLight(0xffe2b8, 3.2)
  sun.position.set(-40, 26, 30)
  scene.add(sun)

  const camera = new PT.PhysicalCamera(40, 1.6, 0.1, 500)
  if (view === "top") {
    camera.position.set(0.01, 78, 0)
    camera.lookAt(0, 0, 0)
    camera.fov = 44
  } else {
    camera.position.set(11, 21, 43)
    camera.lookAt(-1, 6, -2)
  }
  return { scene, camera, exposure: 1.0, bounces: 6, toneMapping: THREE.NeutralToneMapping }
}
