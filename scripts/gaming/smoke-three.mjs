/**
 * The gate for every 3D scene: does WebGL render in headless Chromium here?
 *
 * Serves three.js from node_modules via page.route (no dev server needed),
 * renders a lit, shadow-casting scene at 1600x1000, and reports which GL
 * backend answered — SwiftShader (software) or a GPU — because that decides
 * how long 250 renders will take.
 *
 * Run from the repo root:  node scripts/gaming/smoke-three.mjs
 */
import { chromium } from "playwright"
import sharp from "sharp"
import { mkdirSync, writeFileSync, statSync } from "node:fs"
import { resolve } from "node:path"

const OUT_DIR = ".gaming-render"
mkdirSync(OUT_DIR, { recursive: true })
// three 0.185 ships as two files: three.module.js does `import "./three.core.js"`,
// so both must be served or the module resolves against a 404.
const THREE_DIR = resolve("node_modules/three/build")

const html = `<!doctype html><html><head><meta charset="utf-8">
<script type="importmap">{"imports":{"three":"/three.module.js"}}</script>
<style>html,body{margin:0;width:1600px;height:1000px;background:#000;overflow:hidden}canvas{display:block}</style>
</head><body>
<script type="module">
import * as THREE from "three";
const W=1600,H=1000;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(W,H);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();scene.background=new THREE.Color(0x9fb8d8);
const cam=new THREE.PerspectiveCamera(50,W/H,0.1,200);cam.position.set(9,6,11);cam.lookAt(0,1,0);

scene.add(new THREE.HemisphereLight(0xcfe3ff,0x6b5a45,0.55));
const sun=new THREE.DirectionalLight(0xfff2dc,1.6);sun.position.set(8,14,6);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-14;sun.shadow.camera.right=14;sun.shadow.camera.top=14;sun.shadow.camera.bottom=-14;
scene.add(sun);

const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x8a8f96,roughness:0.9}));
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

const mats=[0xc44536,0x3d7ea6,0xe3b448,0x4f8a5b];
for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(1.6,1+i*0.6,1.6),new THREE.MeshStandardMaterial({color:mats[i],roughness:0.6,metalness:0.1}));
b.position.set(-3.6+i*2.4,(1+i*0.6)/2,0);b.castShadow=true;b.receiveShadow=true;scene.add(b);}

renderer.render(scene,cam);
const gl=renderer.getContext();const dbg=gl.getExtension("WEBGL_debug_renderer_info");
window.__gl = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "(no debug info)";
window.__done=true;
</script></body></html>`

const t0 = Date.now()
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
})
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
page.on("pageerror", (e) => console.error("PAGE ERROR:", e.message))
page.on("console", (m) => { if (m.type() === "error") console.error("CONSOLE:", m.text()) })

await page.route("http://localhost/**", (route) => {
  const u = new URL(route.request().url())
  if (u.pathname === "/three.module.js" || u.pathname === "/three.core.js")
    return route.fulfill({ path: `${THREE_DIR}${u.pathname}`, contentType: "text/javascript" })
  if (u.pathname === "/render.html") return route.fulfill({ body: html, contentType: "text/html" })
  return route.fulfill({ status: 404, body: "" })
})
await page.goto("http://localhost/render.html")
await page.waitForFunction(() => window.__done === true, null, { timeout: 60000 })
const gl = await page.evaluate(() => window.__gl)
const png = await page.screenshot({ type: "png" })
await browser.close()

const webp = await sharp(png).webp({ quality: 84 }).toBuffer()
const out = `${OUT_DIR}/smoke-three.webp`
writeFileSync(out, webp)
const meta = await sharp(webp).metadata()

// A real render is not a flat colour: check the frame has variance.
const { channels } = await sharp(png).stats()
const spread = channels.map((c) => (c.max - c.min)).join("/")

console.log(`GL backend: ${gl}`)
console.log(`render+encode: ${Date.now() - t0} ms`)
console.log(`dimensions: ${meta.width}x${meta.height} · webp ${(statSync(out).size / 1024).toFixed(0)} KB · channel spread ${spread}`)
console.log(`wrote ${out}`)
