/**
 * Proves lib.mjs end to end before scenes are built on it:
 *   - loadProducts(): the .ts dynamic import actually yields the catalogue
 *   - renderScene(): the fake-origin route serves an HTML scene and a
 *     three.js scene (module import chain) and both produce real frames
 *   - encode(): full + card WebP at the right sizes
 *   - uploadAsset(): a real put + head against the private store, then
 *     deleted so the test leaves nothing behind
 *
 * Run from the repo root:  node --env-file=.env.local scripts/gaming/render/selftest.mjs
 */
import { del } from "@vercel/blob"
import sharp from "sharp"
import { loadProducts, launchBrowser, renderScene, encode, frameSpread, uploadAsset, doc, W, H, CARD_W, CARD_H } from "./lib.mjs"

let failures = 0
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) failures++ }

// 1. catalogue import
const products = await loadProducts()
ok(Array.isArray(products) && products.length === 46, `loadProducts → ${products?.length} products`)
ok(products?.[0]?.slug && Array.isArray(products[0].art), `product shape has slug + art (${products?.[0]?.slug})`)

const browser = await launchBrowser()
try {
  // 2. HTML scene
  const htmlPng = await renderScene(browser, doc({ body: `<div style="padding:80px;color:#fff;font-size:64px">Inventory</div>`, bg: "#223" }), { label: "html" })
  ok((await frameSpread(htmlPng)) > 100, `html scene renders with variance`)

  // 3. three scene (exercises the module import chain)
  const threeHtml = doc({
    bg: "#000",
    body: `<script type="module">
      import * as THREE from "three";
      const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(${W},${H});document.body.appendChild(r.domElement);
      const s=new THREE.Scene();s.background=new THREE.Color(0x88a);const c=new THREE.PerspectiveCamera(50,${W}/${H},0.1,100);c.position.set(3,2,5);c.lookAt(0,0,0);
      s.add(new THREE.HemisphereLight(0xffffff,0x444444,1));const m=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),new THREE.MeshStandardMaterial({color:0xcc4433}));s.add(m);
      r.render(s,c);window.__done=true;</script>`,
  })
  const threePng = await renderScene(browser, threeHtml, { label: "three" })
  ok((await frameSpread(threePng)) > 100, `three scene renders with variance`)

  // 4. encode sizes
  const { full, card } = await encode(threePng)
  const fm = await sharp(full).metadata(), cm = await sharp(card).metadata()
  ok(fm.width === W && fm.height === H && fm.format === "webp", `full encode ${fm.width}x${fm.height} ${fm.format} ${(full.length / 1024).toFixed(0)}KB`)
  ok(cm.width === CARD_W && cm.height === CARD_H, `card encode ${cm.width}x${cm.height} ${(card.length / 1024).toFixed(0)}KB`)

  // 5. real upload, verified, then removed
  const up = await uploadAsset(card, "gaming/_selftest/probe.webp")
  ok(up.pathname.startsWith("gaming/_selftest/probe") && up.size === card.length, `upload verified via head: ${up.pathname} (${up.size} bytes)`)
  ok(up.pathname !== "gaming/_selftest/probe.webp", `random suffix applied (${up.pathname.split("/").pop()})`)
  await del(up.url)
  let gone = false
  try { const { head } = await import("@vercel/blob"); await head(up.url) } catch { gone = true }
  ok(gone, `selftest blob deleted — store left clean`)
} finally {
  await browser.close()
}

console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL PASS")
process.exit(failures ? 1 : 0)
