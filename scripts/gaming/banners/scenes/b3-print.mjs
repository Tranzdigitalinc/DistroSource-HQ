// Catalogue batch 3 — product renders for the printable STL products.
// view = "<product-slug>:<shot>" with shot cover | set. Parts are the same
// geometry the STL files are exported from, shown in a matte PLA finish.
import { PRINTS } from "/scripts/catalog/batch3/models/print.mjs"

const S = 0.01 // millimetres → scene units (1 unit = 100 mm)

export function build({ THREE, PT, lib, view }) {
  const [slug, shot] = (view || "").split(":")
  const product = PRINTS[slug]
  const scene = new THREE.Scene()
  const sky = new PT.GradientEquirectTexture(256)
  sky.topColor.set(0xffffff)
  sky.bottomColor.set(0xdcdfe4)
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.85
  lib.plane(scene, { w: 60, h: 60, rx: -Math.PI / 2, mat: lib.materials.matte(0xe4e1db, 0.92) })
  lib.plane(scene, { w: 60, h: 30, y: 15, z: -9, mat: lib.materials.matte(0xecebe7, 0.95) })

  const pla = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.52, clearcoat: 0.15, clearcoatRoughness: 0.5 })
  const mats = product.palette.map(pla)
  const parts = product.items.map(([name, make], i) => {
    const g = make().geometry()
    g.computeBoundingBox()
    const b = g.boundingBox
    g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2)
    g.computeBoundingBox()
    const mesh = new THREE.Mesh(g, mats[i % mats.length])
    mesh.scale.setScalar(S)
    return { name, mesh, size: g.boundingBox.getSize(new THREE.Vector3()).multiplyScalar(S) }
  })

  // Rows run front to back, shortest parts first so tall ones never hide the
  // rest; each row is centred at half its own depth behind the previous one.
  const place = (list, cols, gap) => {
    const sorted = list.slice().sort((a, b) => a.size.y - b.size.y)
    const rows = []
    for (const p of sorted) {
      if (!rows.length || rows[rows.length - 1].length === cols) rows.push([])
      rows[rows.length - 1].push(p)
    }
    let z = 0
    for (const row of rows) {
      const depth = Math.max(...row.map((p) => p.size.z))
      const width = row.reduce((s, p) => s + p.size.x, 0) + gap * (row.length - 1)
      let x = -width / 2
      for (const p of row) {
        p.mesh.position.set(x + p.size.x / 2, 0, z - depth / 2)
        scene.add(p.mesh)
        x += p.size.x + gap
      }
      z -= depth + gap
    }
    return -z
  }

  let depth
  if (shot === "cover") {
    const pick = parts.slice(0, slug.includes("stand") ? 4 : slug.includes("planter") ? 6 : 6)
    depth = place(pick, slug.includes("stand") ? 4 : 3, 0.18)
  } else {
    depth = place(parts, slug.includes("planter") || slug.includes("terrain") ? 4 : slug.includes("stand") ? 4 : 5, 0.14)
  }
  const box = new THREE.Box3()
  scene.traverse((o) => { if (o.isMesh && o.material !== undefined && o.scale.x === S) box.expandByObject(o) })
  const c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3())
  const span = Math.max(sz.x, sz.z * 1.3, sz.y * 1.6)
  const camera = new PT.PhysicalCamera(34, 1.6, 0.01, 200)
  camera.position.set(c.x + span * 0.14, c.y + span * 0.62, c.z + span * 1.08)
  camera.lookAt(c.x, c.y * 0.6, c.z)
  const key = new PT.ShapedAreaLight(0xffffff, 7, span * 1.2, span * 1.2)
  key.position.set(c.x + span * 0.9, span * 1.6, c.z + span * 0.9)
  key.lookAt(c.x, 0, c.z)
  scene.add(key)
  return { scene, camera, exposure: 1.05, bounces: 6, toneMapping: THREE.NeutralToneMapping }
}
