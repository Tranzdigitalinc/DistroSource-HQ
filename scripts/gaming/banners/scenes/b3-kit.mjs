// Catalogue batch 3 — product renders for the 3D asset kits.
// view = "<kit>:<shot>" with kit scifi | nature | furniture and shot cover | grid.
import { KITS } from "/scripts/catalog/batch3/models/kits.mjs"

const KEY = { scifi: "modular-sci-fi-corridor-kit-3d", nature: "low-poly-nature-kit-3d", furniture: "stylised-furniture-set-3d" }

function studio(THREE, PT, lib, scene, { floor = 0xd9d6d0, wall = 0xe8e5df, size = 60 } = {}) {
  const { plane, materials: M } = lib
  plane(scene, { w: size, h: size, rx: -Math.PI / 2, mat: M.matte(floor, 0.9) })
  plane(scene, { w: size, h: size * 0.5, y: size * 0.25, z: -size * 0.3, mat: M.matte(wall, 0.95) })
  const sky = new PT.GradientEquirectTexture(256)
  sky.topColor.set(0xffffff)
  sky.bottomColor.set(0xd9dde3)
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.9
}

function area(scene, PT, color, intensity, w, h, pos, target) {
  const l = new PT.ShapedAreaLight(color, intensity, w, h)
  l.position.set(...pos)
  l.lookAt(...target)
  scene.add(l)
  return l
}

export function build({ THREE, PT, lib, view }) {
  const [kit, shot] = (view || "scifi:cover").split(":")
  const pieces = KITS[KEY[kit]].build()
  const scene = new THREE.Scene()
  const camera = new PT.PhysicalCamera(40, 1.6, 0.05, 400)
  const put = (name, x, y, z, ry = 0, s = 1) => {
    const g = pieces[name]()
    g.position.set(x, y, z)
    g.rotation.y = ry
    g.scale.setScalar(s)
    scene.add(g)
    return g
  }

  if (shot === "grid") {
    studio(THREE, PT, lib, scene, { size: kit === "scifi" ? 90 : 40 })
    // Shortest pieces in the front rows, so nothing hides behind a tree or a wall.
    const built = Object.keys(pieces).map((n) => {
      const g = pieces[n]()
      const b = new THREE.Box3().setFromObject(g)
      return { n, g, h: b.max.y - b.min.y }
    })
    built.sort((a, b) => a.h - b.h)
    const cols = kit === "nature" ? 6 : 4
    const step = kit === "scifi" ? 6.5 : kit === "nature" ? 2.4 : 1.9
    built.forEach(({ n, g }, i) => {
      const r = Math.floor(i / cols), c = i % cols
      g.position.set((c - (cols - 1) / 2) * step + (r % 2 ? step * 0.2 : 0), n === "Ceiling_Light" ? 0.14 : 0, -r * step)
      g.rotation.set(n === "Ceiling_Light" ? Math.PI : 0, kit === "scifi" ? 0 : 0.5, 0)
      scene.add(g)
    })
    // Fit the camera to what was actually placed (the studio planes excluded).
    const bounds = new THREE.Box3()
    scene.children.forEach((o) => { if (o.isGroup) bounds.expandByObject(o) })
    const c = bounds.getCenter(new THREE.Vector3()), sz = bounds.getSize(new THREE.Vector3())
    const span = Math.max(sz.x / 1.6, sz.z, sz.y * 1.4)
    camera.fov = 34
    camera.position.set(c.x, c.y + span * 1.05, c.z + span * 1.55)
    camera.lookAt(c.x, c.y * 0.55, c.z - span * 0.05)
    area(scene, PT, 0xffffff, 6, span * 1.4, span * 1.4, [c.x + span, span * 2, c.z + span], [c.x, 0, c.z])
    return { scene, camera, exposure: 1.1, bounces: 5 }
  }

  if (kit === "scifi") {
    const sky = new PT.GradientEquirectTexture(128)
    sky.topColor.set(0x0a0f18)
    sky.bottomColor.set(0x05070a)
    sky.update()
    scene.environment = sky
    scene.background = sky
    scene.environmentIntensity = 0.4
    for (const z of [0, -4, -8]) {
      put("Floor_4x4", 0, 0, z)
      const cl = put("Ceiling_Light", 0, 4.14, z)
      cl.rotation.x = Math.PI
      cl.position.y = 4.14
      put(z === -4 ? "Wall_Window" : "Wall_4x4", -2, 0, z, Math.PI / 2)
      put("Wall_4x4", 2, 0, z, -Math.PI / 2)
    }
    put("Doorway", 0, 0, -10.2)
    put("Crate_Large", 1.2, 0.14, -2.6, 0.2)
    put("Crate_Small", 1.35, 1.34, -2.5, -0.3)
    put("Crate_Small", 0.9, 0.14, -1.3, 0.5)
    put("Console", -1.25, 0.14, -7.2, Math.PI / 2)
    put("Pipe_Run", 1.72, 2.7, -6, Math.PI / 2, 0.8)
    put("Pillar_Corner", -1.65, 0.14, -2, 0)
    put("Vent", 1.85, 0.5, -8.6, -Math.PI / 2)
    camera.position.set(0.55, 1.7, 2.6)
    camera.lookAt(-0.2, 1.55, -10)
    camera.fov = 58
    return { scene, camera, exposure: 1.9, bounces: 6, toneMapping: THREE.NeutralToneMapping }
  }

  if (kit === "nature") {
    const sky = new PT.GradientEquirectTexture(256)
    sky.topColor.set(0x6fa8e0)
    sky.bottomColor.set(0xe9f1f8)
    sky.update()
    scene.environment = sky
    scene.background = sky
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(9, 9.6, 1, 14).toNonIndexed(), lib.materials.matte(0x78b04a, 0.9))
    ground.geometry.computeVertexNormals()
    ground.position.y = -0.5
    scene.add(ground)
    const dirt = new THREE.Mesh(new THREE.CylinderGeometry(9.6, 8.6, 1.4, 14).toNonIndexed(), lib.materials.matte(0x7a5a3c, 0.95))
    dirt.geometry.computeVertexNormals()
    dirt.position.y = -1.7
    scene.add(dirt)
    const spots = [
      ["Pine_B", -4, -3.2], ["Pine_A", -2.4, -4.6], ["Pine_C", -5.6, -0.6], ["Tree_Round_A", 3.6, -3.4], ["Tree_Round_B", 5.4, -0.8],
      ["Pine_A", 1.2, -6.2], ["Rock_C", 0.6, -2.6], ["Rock_B", -1.8, 0.8], ["Rock_A", 3.2, 1.4], ["Bush_B", -3.3, 1.6], ["Bush_A", 1.8, -0.6],
      ["Stump", -0.6, 2.4], ["Log", 2.2, 3.0], ["Mushrooms", -0.2, 2.9], ["Flowers", 0.9, 1.9], ["Grass_Tuft", -1.2, 3.4], ["Grass_Tuft", 3.4, -1.6],
      ["Rock_Pebbles", 4.2, 2.6], ["Flowers", -4.2, 3.0], ["Grass_Tuft", -2.6, -1.6],
    ]
    spots.forEach(([n, x, z], i) => put(n, x, 0, z, i * 1.3, n === "Log" ? 1 : 1))
    const sun = new THREE.DirectionalLight(0xfff0d8, 3.2)
    sun.position.set(-8, 14, 10)
    scene.add(sun)
    camera.position.set(0, 7.2, 13.2)
    camera.lookAt(0, 0.9, -1.2)
    camera.fov = 42
    return { scene, camera, exposure: 1.0, bounces: 5, toneMapping: THREE.NeutralToneMapping }
  }

  // furniture: a living-room corner
  const sky = new PT.GradientEquirectTexture(256)
  sky.topColor.set(0xfdf8f0)
  sky.bottomColor.set(0xe7ddd0)
  sky.update()
  scene.environment = sky
  scene.background = sky
  scene.environmentIntensity = 0.7
  lib.plane(scene, { w: 12, h: 12, rx: -Math.PI / 2, mat: lib.woodPlanks({ tone: 0xb08457, planks: 10, repeat: [3, 3] }) })
  lib.plane(scene, { w: 12, h: 4, y: 2, z: -2.2, mat: lib.plaster({ color: 0xeee6da, repeat: [4, 1.5] }) })
  lib.plane(scene, { w: 12, h: 4, x: -3.2, y: 2, ry: Math.PI / 2, mat: lib.plaster({ color: 0xe6ddd0, repeat: [4, 1.5] }) })
  put("Rug", 0, 0, -0.2)
  put("Sofa", 0, 0, -1.55)
  put("Coffee_Table", 0.05, 0.012, -0.2)
  put("Vase", 0.15, 0.43, -0.25)
  put("Armchair", 1.75, 0, -0.2, -Math.PI / 2.6)
  put("Floor_Lamp", -1.55, 0, -1.7)
  put("Plant_Pot", 1.35, 0, -1.8)
  put("Bookshelf", -2.9, 0, -0.6, Math.PI / 2)
  put("Side_Table", -1.5, 0, -0.9)
  put("Stool", -2.2, 0, 0.9, 0.4)
  area(scene, PT, 0xfff4e2, 9, 3, 2.4, [3.5, 2.8, 2.5], [0, 0.6, -1])
  camera.position.set(0.6, 1.55, 4.2)
  camera.lookAt(-0.3, 0.7, -0.9)
  camera.fov = 44
  return { scene, camera, exposure: 1.2, bounces: 6, toneMapping: THREE.NeutralToneMapping }
}
