// Minecraft — skyblock islands in a bright sky.
// Views:
//   "islands" (default) three themed starter islands at different heights
//   "spawn"   a skyblock spawn island with a portal ring and walkways
//   "themes"  the five island themes of a monthly set in a row
import { World, tree } from "/scripts/gaming/banners/voxel.mjs"
import { island } from "/scripts/gaming/banners/voxel-blocks.mjs"

const THEMES = {
  classic: { top: "grass", sub: "dirt", core: "stone" },
  desert: { top: "sand", sub: "sand", core: "sandstone" },
  snow: { top: "snow", sub: "dirt", core: "stone" },
  jungle: { top: "grass", sub: "dirt", core: "stone" },
  nether: { top: "netherrack", sub: "netherrack", core: "netherrack" },
}

function spruce(w, x, y, z, h) {
  for (let i = 0; i < h; i++) w.set(x, y + i, z, "log")
  for (let t = 0; t < h - 1; t++) {
    const rad = Math.max(0, Math.floor((h - 1 - t) / 2))
    const yy = y + 2 + t
    for (let dz = -rad; dz <= rad; dz++) for (let dx = -rad; dx <= rad; dx++) {
      if (Math.abs(dx) + Math.abs(dz) > rad + 0.5 || (dx === 0 && dz === 0 && t < h - 2)) continue
      if (!w.get(x + dx, yy, z + dz)) w.set(x + dx, yy, z + dz, (t + dx + dz) % 3 === 0 ? "snowBlock" : "leaves")
    }
  }
  w.set(x, y + h, z, "snowBlock")
}

function decorate(w, theme, x, y, z, seed) {
  if (theme === "classic") {
    tree(w, x - 2, y + 1, z - 1, 5, seed)
    w.set(x + 2, y + 1, z + 1, "chest")
  } else if (theme === "desert") {
    for (let i = 1; i <= 3; i++) w.set(x - 2, y + i, z - 1, "cactus")
    for (let i = 1; i <= 2; i++) w.set(x + 2, y + i, z - 2, "cactus")
    w.set(x + 1, y + 1, z + 2, "chest")
    w.set(x - 1, y + 1, z + 2, "sandstone")
  } else if (theme === "snow") {
    spruce(w, x - 2, y + 1, z - 1, 7)
    w.set(x + 2, y + 1, z + 1, "chest")
  } else if (theme === "jungle") {
    tree(w, x - 2, y + 1, z - 2, 7, seed)
    tree(w, x + 2, y + 1, z + 1, 4, seed + 1)
    w.set(x, y + 1, z + 2, "chest")
  } else if (theme === "nether") {
    for (const [dx, dz, h] of [[-2, -1, 3], [2, -2, 2], [-1, 2, 1]]) for (let i = 1; i <= h; i++) w.set(x + dx, y + i, z + dz, i === h ? "lumen" : "netherrack")
    w.set(x + 2, y + 1, z + 1, "chest")
  }
}

export function build({ THREE, PT, lib, view }) {
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(512)
  sky.topColor.set(0x3f7fd9)
  sky.bottomColor.set(0xdcecff)
  sky.exponent = 1.6
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 1.0

  const camera = new PT.PhysicalCamera(40, 1.6, 0.1, 600)
  let w

  if (view === "spawn") {
    const N = 90
    w = new World(N, 40, N)
    const c = N / 2, Y = 22
    island(w, lib, { cx: c, cy: Y, cz: c, r: 15, top: "quartz", sub: "stone", core: "stone", seed: 3 })
    // Plaza ring, portal arch and lanterns.
    for (let z = -15; z <= 15; z++) for (let x = -15; x <= 15; x++) {
      const d = Math.hypot(x, z)
      if (d < 14 && d > 12.6) w.set(c + x, Y, c + z, "cyan")
      if (d < 4) w.set(c + x, Y, c + z, "concreteDark")
    }
    for (let i = -4; i <= 4; i++) for (let j = 0; j <= 8; j++) {
      const edge = Math.abs(i) === 4 || j === 0 || j === 8
      w.set(c + i, Y + 1 + j, c - 8, edge ? "concreteDark" : "portalCyan")
    }
    for (const i of [-4, 4]) w.set(c + i, Y + 10, c - 8, "glow")
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2
      const x = Math.round(c + Math.cos(a) * 10), z = Math.round(c + Math.sin(a) * 10)
      w.fill(x, Y + 1, z, x, Y + 2, z, "concreteDark")
      w.set(x, Y + 3, z, "glow")
    }
    // Walkways out to three satellite islands.
    const sats = [[c - 30, Y - 3, c + 8, "desert"], [c + 30, Y - 2, c + 4, "snow"], [c + 6, Y - 4, c + 32, "classic"]]
    for (const [sx, sy, sz, theme] of sats) {
      island(w, lib, { cx: sx, cy: sy, cz: sz, r: 6, ...THEMES[theme], seed: sx + sz })
      decorate(w, theme, sx, sy, sz, sx)
      const steps = 60
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        const x = Math.round(c + (sx - c) * t), z = Math.round(c + (sz - c) * t), y = Math.round(Y + (sy - Y) * t)
        if (Math.hypot(x - c, z - c) < 14 || Math.hypot(x - sx, z - sz) < 5) continue
        for (const o of [-1, 0, 1]) w.set(x + (Math.abs(sz - c) > Math.abs(sx - c) ? o : 0), y, z + (Math.abs(sz - c) > Math.abs(sx - c) ? 0 : o), "planks")
      }
    }
    tree(w, c + 9, Y + 1, c - 4, 5, 11)
    tree(w, c - 9, Y + 1, c - 3, 5, 12)
    camera.position.set(-14, 46, 60)
    camera.lookAt(0, 20, 0)
    camera.fov = 44
  } else if (view === "themes") {
    const N = 120
    w = new World(N, 30, 40)
    const order = ["classic", "desert", "snow", "jungle", "nether"]
    order.forEach((theme, i) => {
      const cx = 16 + i * 22, cy = 16 + (i % 2) * 2, cz = 20
      island(w, lib, { cx, cy, cz, r: 7, ...THEMES[theme], seed: 20 + i })
      decorate(w, theme, cx, cy, cz, 30 + i)
    })
    camera.position.set(0, 30, 100)
    camera.lookAt(0, 13, 0)
    camera.fov = 39
  } else {
    const N = 96
    w = new World(N, 44, N)
    const set = [[48, 24, 56, 9, "classic"], [26, 30, 34, 7, "snow"], [72, 28, 30, 7, "desert"]]
    set.forEach(([cx, cy, cz, r, theme], i) => {
      island(w, lib, { cx, cy, cz, r, ...THEMES[theme], seed: 5 + i })
      decorate(w, theme, cx, cy, cz, 40 + i)
    })
    // A few small floating blocks for depth.
    for (const [x, y, z, b] of [[36, 19, 70, "dirt"], [62, 34, 18, "stone"], [84, 22, 60, "sand"], [14, 26, 52, "grass"]]) {
      w.set(x, y, z, b)
      w.set(x + 1, y, z, b)
      w.set(x, y - 1, z, "stone")
    }
    camera.position.set(4, 36, 54)
    camera.lookAt(-4, 23, -6)
    camera.fov = 38
  }

  scene.add(w.toGroup())
  const sun = new THREE.DirectionalLight(0xfff1d6, 3.4)
  sun.position.set(-30, 50, 40)
  scene.add(sun)
  return { scene, camera, exposure: 1.0, bounces: 5, toneMapping: THREE.NeutralToneMapping }
}
