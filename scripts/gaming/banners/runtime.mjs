// Path-tracing runtime for DistroSource Gaming product scenes.
//
// A scene module exports `build(ctx)` and returns { scene, camera } plus
// optional render settings. This file owns the renderer and the sample
// loop; scenes only describe geometry, materials, lights and the lens.
import * as THREE from "three"
import {
  WebGLPathTracer,
  PhysicalCamera,
  GradientEquirectTexture,
  PhysicalSpotLight,
  ShapedAreaLight,
} from "three-gpu-pathtracer"
import * as lib from "/scripts/gaming/banners/lib.mjs"

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))

export async function run({ scene: name, width, height, spp, view, mode = "" }) {
  if (!/^[a-z0-9-]+$/.test(name || "")) throw new Error(`Bad scene name: ${name}`)
  const canvas = document.getElementById("c")
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  })
  renderer.setPixelRatio(1)
  renderer.setSize(width, height, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const gl = renderer.getContext()
  const dbg = gl.getExtension("WEBGL_debug_renderer_info")
  console.log(`gpu ${dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "unknown"}`)

  const mod = await import(`/scripts/gaming/banners/scenes/${name}.mjs`)
  const built = await mod.build({
    THREE,
    PT: { PhysicalCamera, GradientEquirectTexture, PhysicalSpotLight, ShapedAreaLight },
    lib,
    width,
    height,
    view,
  })
  const { scene, camera } = built
  renderer.toneMapping = built.toneMapping ?? THREE.AgXToneMapping
  renderer.toneMappingExposure = built.exposure ?? 1
  camera.aspect = width / height
  camera.updateProjectionMatrix()

  if (mode === "raster") {
    // Debug: fast rasterised preview for checking geometry and materials.
    scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3f46, 1.4))
    const sun = new THREE.DirectionalLight(0xffffff, 2.2)
    sun.position.set(6, 10, 8)
    scene.add(sun)
    renderer.render(scene, camera)
    gl.finish()
    window.__done = true
    return
  }

  const pt = new WebGLPathTracer(renderer)
  pt.renderToCanvas = true
  pt.minSamples = 0
  pt.fadeDuration = 0
  pt.renderDelay = 0
  pt.dynamicLowRes = false
  pt.renderScale = 1
  pt.tiles.set(1, 1)
  pt.bounces = built.bounces ?? 8
  pt.transmissiveBounces = built.transmissiveBounces ?? 10
  pt.filterGlossyFactor = built.filterGlossy ?? 0.2
  pt.multipleImportanceSampling = true

  const t0 = performance.now()
  pt.setScene(scene, camera)
  console.log(`bvh ready ${((performance.now() - t0) / 1000).toFixed(1)}s`)

  const t1 = performance.now()
  let i = 0
  while (pt.samples < spp) {
    pt.renderSample()
    i++
    if (i % 6 === 0) await frame()
    if (i % 200 === 0) console.log(`samples ${Math.floor(pt.samples)}/${spp} ${((performance.now() - t1) / 1000).toFixed(1)}s`)
  }
  gl.finish()
  window.__stats = { samples: pt.samples, seconds: (performance.now() - t1) / 1000 }
  console.log(`done ${JSON.stringify(window.__stats)}`)
  window.__done = true
}
