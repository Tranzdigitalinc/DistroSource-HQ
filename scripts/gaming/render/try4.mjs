/**
 * Probe renders for the batch-4 primitives (mannequin, weapon, tuner car,
 * lift, cell) to .gaming-render/try/. Run: node scripts/gaming/render/try4.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { launchBrowser, renderScene, frameSpread } from "./lib.mjs"
import { interior, exteriorScene } from "./scenes/three.mjs"
import { studio, lodStrip } from "./scenes/characters.mjs"

const OUT = ".gaming-render/try"
mkdirSync(OUT, { recursive: true })

const SCENES = {
  mannequins: () => studio({
    view: { pos: [0, 1.5, 6.2], look: [0, 1.0, 0], fov: 38 },
    items: [
      `mannequin(s,-2.4,0,0.15,{pose:"idle",top:0x1b2a44,bottom:0x1b2a44,vest:0x141c2c,accent:0xdfe3e6,patch:0xd9a03a,hat:"peaked",hatColor:0x141c2c,epaulettes:2,hair:0x2a211c});`,
      `mannequin(s,-0.8,0,0.1,{pose:"idle",top:0x1f2a3a,bottom:0x1f2a3a,vest:0xc8b04a,reflective:true,helmet:0xf2d55c,hair:0x2a211c,build:1.06});`,
      `mannequin(s,0.8,0,-0.05,{pose:"idle",female:true,top:0xf4f4f2,bottom:0x2e6b3f,accent:0x2e6b3f,patch:0xc8202a,hair:0x3a2a1c,hairStyle:"bun"});`,
      `mannequin(s,2.4,0,-0.15,{pose:"idle",female:true,top:0x8a2b2b,sleeves:"short",bottom:0x3a4a6a,shoes:0xf0f0f0,hair:0x1c1a18,hairStyle:"long",skin:0x8a5a3a});`,
    ],
  }),
  poses: () => studio({
    view: { pos: [0, 1.6, 7.5], look: [0, 0.9, 0], fov: 40 }, grid: true,
    items: [
      `mannequin(s,-3.0,0,0.2,{pose:"wave",top:0x4a6fa5,bottom:0x2b2f36,hair:0x2a211c});`,
      `studioProps.chair(s,-1.0,0,0);mannequin(s,-1.0,0,0,{pose:"sit",top:0x6a4a8a,bottom:0x2b2f36,hair:0x2a211c,female:true,hairStyle:"long"});`,
      `mannequin(s,1.0,0,-0.2,{pose:"dance",top:0xc8202a,bottom:0x1c1a18,hair:0x1c1a18});`,
      `studioProps.wheel(s,3.0,0.45);mannequin(s,3.0,0,-0.4,{pose:"kneel",top:0x3a4a5a,bottom:0x2b2f36,hair:0x2a211c,vest:0xd9a03a});`,
    ],
  }),
  weapons: () => studio({
    tone: "dark", view: { pos: [0.2, 1.4, 2.6], look: [0, 0.95, 0], fov: 34 }, keyPos: [2, 5, 4],
    items: [
      `{const t=box(2.6,0.06,1.0,mat.std(0x3a3d42,{roughness:0.8}),0,0.9,0);s.add(t);for(const [x,z] of [[-1.2,-0.4],[1.2,-0.4],[-1.2,0.4],[1.2,0.4]])s.add(cyl(0.03,0.03,0.9,mat.std(0x2a2d33),x,0.45,z,10));}`,
      `weapon(s,"rifle",-0.4,0.98,-0.25,0.0,{optic:true,suppressor:true,grip:true});`,
      `weapon(s,"smg",0.5,0.98,0.15,0.35,{optic:true,light:true});`,
      `weapon(s,"pistol",-0.6,0.95,0.3,-0.6,{light:true,optic:true});`,
    ],
  }),
  tuner: () => exteriorScene({ sky: 0xc4d8ea, items: [
    `vehicle(s,"coupe",-3.2,0,0.35,{color:0xe0b23a,livery:false,lightbar:false,spoiler:true,kit:true,wheelColor:0x22252a,gloss:0.2});`,
    `vehicle(s,"hatch",3.0,-0.5,-0.3,{color:0x2a6dd8,livery:false,lightbar:false,kit:true,wheelColor:0xd9d9d9,gloss:0.2});`,
    `buildingBlock(s,0,-18,{w:40,d:14,h:8,rows:2,cols:10});props.tree(s,-16,-6,1.2);`,
  ], view: { pos: [5, 2.0, 8.5], look: [0, 0.9, 0], fov: 42 } }),
  workshop: () => interior({
    spec: {
      room: { w: 14, d: 10, h: 4.2, floor: "concrete", wallColor: "#cfd2d6", doors: [{ wall: "s", x: -3, w: 4, h: 3.2 }], windows: [{ wall: "n", x: 0, w: 6, y0: 2.6, y1: 3.6 }] },
      items: [
        { type: "lift", args: [-3.5, -1.5, 0, { kind: "hatch", color: 0xc44536 }] }, { type: "lift", args: [2.0, -1.5, 0, { kind: "sedan", color: 0x3d5a80, raised: 0.0 }] },
        { type: "toolCart", args: [-1.0, 0.8, 0.3] }, { type: "tyreStack", args: [5.6, -3.6, 4] }, { type: "partsShelf", args: [6.6, 1.5, -Math.PI / 2, 2.4] },
        { type: "rollerDoor", args: [-3, 4.93, 0, { w: 4, h: 3.2, open: 0.6 }] }, { type: "toolCart", args: [3.8, 2.4, 0] },
      ],
    },
    view: { pos: [5.5, 1.8, 4.2], look: [-2, 1.2, -1.5], fov: 58 },
  }),
  cells: () => interior({
    spec: {
      room: { w: 10, d: 7, h: 3.0, floor: "concrete", wallColor: "#d8d9d4", doors: [{ wall: "s", x: 3.5, w: 1.2 }], panels: true },
      items: [
        { type: "cell", args: [-3.4, -2.0, 0] }, { type: "cell", args: [-0.8, -2.0, 0] }, { type: "cell", args: [1.8, -2.0, 0] },
        { type: "bench", args: [2.2, 2.6, 0, 2.2] }, { type: "counter", args: [-3, 2.6, Math.PI, { w: 2.4 }] },
      ],
    },
    view: { pos: [3.6, 1.7, 2.8], look: [-1.5, 1.1, -1.8], fov: 56 },
  }),
  lod: () => lodStrip({ view: { pos: [0, 1.5, 6.0], look: [0, 0.95, 0], fov: 38 } }),
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENES)
const browser = await launchBrowser()
try {
  for (const n of names) {
    const t0 = Date.now()
    try {
      const png = await renderScene(browser, SCENES[n](), { label: n })
      writeFileSync(`${OUT}/${n}.png`, png)
      console.log(`✓ ${n.padEnd(12)} ${Date.now() - t0} ms  spread ${await frameSpread(png)}`)
    } catch (e) { console.log(`✗ ${n}: ${e.message.split("\n")[0]}`) }
  }
} finally { await browser.close() }
