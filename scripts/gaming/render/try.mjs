/**
 * Renders named benchmark scenes to .gaming-render/try/ as PNG (for visual
 * inspection with the Read tool) and WebP (to see real output size).
 *
 * Run from the repo root:  node scripts/gaming/render/try.mjs [name ...]
 */
import { mkdirSync, writeFileSync } from "node:fs"
import sharp from "sharp"
import { launchBrowser, renderScene, frameSpread } from "./lib.mjs"
import { interior, exteriorScene, layoutOverview } from "./scenes/three.mjs"
import { inventory, anticheatDashboard, anticheatRules, floorplan } from "./scenes/ui.mjs"

const OUT = ".gaming-render/try"
mkdirSync(OUT, { recursive: true })

// Hospital MLO — grounded in its features: ambulance bays onto triage,
// surgery + imaging corridor, ward block, morgue/pharmacy/staff, helipad.
const hospitalTriage = {
  room: { w: 12, d: 9, h: 3.4, floor: "vinyl", wallColor: "#e9ede8", doors: [{ wall: "n", x: -3.5, w: 2.4, h: 2.4 }, { wall: "n", x: 3.5, w: 2.4, h: 2.4 }], windows: [{ wall: "e", x: -2, w: 2.2 }, { wall: "e", x: 1.5, w: 2.2 }] },
  daylight: { intensity: 1.2, pos: [7, 8, 2] },
  items: [
    { type: "hospitalBed", args: [-4.2, -0.5, 0] }, { type: "ivStand", args: [-3.5, -1.5] }, { type: "curtainRail", args: [-4.2, 1.2, 2.4, 0] },
    { type: "hospitalBed", args: [-1.4, -0.5, 0] }, { type: "ivStand", args: [-0.7, -1.5] }, { type: "curtainRail", args: [-1.4, 1.2, 2.4, 0] },
    { type: "hospitalBed", args: [1.4, -0.5, 0] }, { type: "curtainRail", args: [1.4, 1.2, 2.4, 0] },
    { type: "hospitalBed", args: [4.2, -0.5, 0] }, { type: "ivStand", args: [4.9, -1.5] },
    { type: "counter", args: [0, 3.6, Math.PI, { w: 3.2 }] }, { type: "cabinet", args: [-5.4, 3.2, Math.PI / 2, { w: 1.6 }] }, { type: "cabinet", args: [5.4, 3.2, -Math.PI / 2, { w: 1.6 }] },
    { type: "chair", args: [-0.8, 4.2, Math.PI] },
  ],
}
const hospitalSurgery = {
  room: { w: 8, d: 7, h: 3.3, floor: "tile", wallColor: "#dfe7ea", doors: [{ wall: "s", x: 0, w: 1.8, h: 2.3 }], windows: [{ wall: "w", x: 0, w: 2.4, y0: 1.2, y1: 2.0 }] },
  items: [
    { type: "surgeryTable", args: [0, 0, 0] }, { type: "surgeryLight", args: [-0.4, 0.3] },
    { type: "cabinet", args: [-3.5, -1.5, Math.PI / 2, { w: 2.4, h: 0.95, color: 0xdfe4e8 }] }, { type: "cabinet", args: [3.5, 0.5, -Math.PI / 2, { w: 2.4, h: 0.95, color: 0xdfe4e8 }] },
    { type: "ivStand", args: [1.2, -1.2] }, { type: "desk", args: [-2.0, -2.5, 0] }, { type: "shelf", args: [-2.6, 2.9, Math.PI, { w: 1.4, h: 1.9 }] },
  ],
}
const hospitalWard = {
  room: { w: 6, d: 16, h: 3.2, floor: "vinyl", wallColor: "#ecebe6", doors: [{ wall: "s", x: 0, w: 1.8, h: 2.3 }, { wall: "w", x: -4, w: 1.2 }, { wall: "w", x: 2, w: 1.2 }, { wall: "e", x: -1, w: 1.2 }, { wall: "e", x: 5, w: 1.2 }] },
  daylight: { intensity: 0.9, pos: [-5, 7, 3] },
  items: [
    { type: "hospitalBed", args: [-2.0, -5.5, 0] }, { type: "hospitalBed", args: [-2.0, -1.5, 0] }, { type: "hospitalBed", args: [-2.0, 2.5, 0] },
    { type: "hospitalBed", args: [2.0, -5.5, 0] }, { type: "hospitalBed", args: [2.0, -1.5, 0] }, { type: "hospitalBed", args: [2.0, 2.5, 0] },
    { type: "ivStand", args: [-1.3, -6.4] }, { type: "ivStand", args: [2.7, -2.4] }, { type: "chair", args: [-1.1, 0.4, Math.PI / 2] }, { type: "chair", args: [1.1, 4.4, -Math.PI / 2] },
    { type: "counter", args: [0, -7.4, 0, { w: 2.4 }] }, { type: "plant", args: [2.6, 6.9] },
  ],
}

const SCENES = {
  // Camera must sit inside the 12 x 9 shell (x ±6, z ±4.5) — the first pass
  // stood outside the south-west corner and rendered the back of a wall.
  "hospital-triage": () => interior({ spec: hospitalTriage, view: { pos: [-4.6, 1.75, 3.5], look: [1.2, 1.05, -1.8], fov: 56 }, sign: { text: "TRIAGE", at: [0, 2.75, -4.42], opts: { w: 1.6, h: 0.4 } } }),
  "hospital-surgery": () => interior({ spec: hospitalSurgery, view: { pos: [3.4, 1.9, 3.6], look: [-0.3, 1.0, -0.2], fov: 50 } }),
  "hospital-ward": () => interior({ spec: hospitalWard, view: { pos: [0.2, 1.65, 7.4], look: [0, 1.1, -6], fov: 55 }, sign: { text: "WARD B", at: [0, 2.7, -7.92], opts: { w: 1.6, h: 0.4 } } }),
  "hospital-exterior": () =>
    exteriorScene({
      sky: 0xb9d3ea,
      items: [
        `buildingBlock(s,0,-14,{w:30,d:14,h:12,rows:3,cols:9,canopy:true});`,
        `buildingBlock(s,-24,-10,{w:14,d:10,h:7,rows:2,cols:4});`,
        `helipad(s,0,12.06,-14,3.6);`,
        `vehicle(s,"van",-5.5,-4.2,0.15,{color:0xf4f4f2,stripe:"#c8202a",type:"ems",unit:"A-12"});`,
        `vehicle(s,"van",1.5,-4.4,-0.05,{color:0xf4f4f2,stripe:"#c8202a",type:"ems",unit:"A-07"});`,
        `props.bollard(s,-9,-5);props.bollard(s,-9,-2.6);props.bollard(s,9.5,-5);props.bollard(s,9.5,-2.6);`,
        `props.tree(s,-15,2,1.2);props.tree(s,16,3,1.1);props.tree(s,22,-2,1.3);`,
      ],
      view: { pos: [18, 6.5, 16], look: [-1, 3.2, -8], fov: 44 },
    }),
  "hospital-helipad": () =>
    exteriorScene({
      sky: 0xa9c8e6,
      items: [
        `buildingBlock(s,0,0,{w:30,d:14,h:12,rows:3,cols:9});`,
        `helipad(s,0,12.06,0,3.8);`,
        `{const g=new THREE.Group();g.position.set(0,12,0);g.add(box(2.2,1.4,1.6,mat.std(0x9aa3ad),-11,0.7,4));g.add(box(0.9,2.2,0.9,mat.std(0xb8bcc2),11.5,1.1,-4.5));s.add(g);}`,
        `buildingBlock(s,-40,-30,{w:20,d:16,h:20,rows:5,cols:6});buildingBlock(s,36,-34,{w:24,d:18,h:16,rows:4,cols:7});`,
      ],
      view: { pos: [-9, 15.2, 11], look: [1, 12, -1], fov: 46 },
      daylight: { intensity: 2.6, pos: [12, 22, 10], size: 40, hemi: 0.7 },
    }),
  "hospital-layout": () =>
    layoutOverview({
      half: 17,
      center: [0, 0],
      rooms: [
        { x: -8, z: -6, w: 12, d: 9, color: 0xdbe7ee, doors: [{ x: -3.5, z: -4.5, w: 2.4 }, { x: 3.5, z: -4.5, w: 2.4 }], furniture: [{ x: -4.2, z: -1, w: 0.95, d: 2 }, { x: -1.4, z: -1, w: 0.95, d: 2 }, { x: 1.4, z: -1, w: 0.95, d: 2 }, { x: 4.2, z: -1, w: 0.95, d: 2 }, { x: 0, z: 3.6, w: 3.2, d: 0.7, color: 0x6f7c8a }] },
        { x: 5, z: -6.5, w: 8, d: 7, color: 0xe3ecef, doors: [{ x: 0, z: 3.5, w: 1.8 }], furniture: [{ x: 0, z: 0, w: 0.6, d: 2, color: 0x4f5c69 }] },
        { x: 13, z: -6.5, w: 7, d: 7, color: 0xe3ecef, doors: [{ x: -3.5, z: 0, w: 1.4 }], furniture: [{ x: 0.5, z: -0.5, w: 2.2, d: 1.6, color: 0x7d8794 }] },
        { x: -12, z: 6, w: 6, d: 16, color: 0xeaeae4, doors: [{ x: 0, z: 8, w: 1.8 }], furniture: [{ x: -2, z: -5.5, w: 0.95, d: 2 }, { x: -2, z: -1.5, w: 0.95, d: 2 }, { x: -2, z: 2.5, w: 0.95, d: 2 }, { x: 2, z: -5.5, w: 0.95, d: 2 }, { x: 2, z: -1.5, w: 0.95, d: 2 }, { x: 2, z: 2.5, w: 0.95, d: 2 }] },
        { x: -3, z: 8, w: 10, d: 4, color: 0xf0efe9, doors: [{ x: -5, z: 0, w: 1.4 }, { x: 5, z: 0, w: 1.4 }] },
        { x: 6, z: 6, w: 7, d: 8, color: 0xdde3e8, doors: [{ x: 0, z: -4, w: 1.4 }], furniture: [{ x: -1.5, z: 0, w: 0.8, d: 2, color: 0x8894a0 }, { x: 1.5, z: 0, w: 0.8, d: 2, color: 0x8894a0 }] },
        { x: 13.5, z: 6, w: 7, d: 8, color: 0xe6e9e2, doors: [{ x: -3.5, z: 0, w: 1.4 }], furniture: [{ x: 0, z: -2.5, w: 4.5, d: 0.6, color: 0x9aa5b1 }, { x: 0, z: 2, w: 4.5, d: 0.6, color: 0x9aa5b1 }] },
      ],
      labels: [
        { text: "TRIAGE", x: -8, z: -12, w: 4 }, { text: "SURGERY", x: 5, z: -11.5, w: 3.6 }, { text: "IMAGING", x: 13, z: -11.5, w: 3.6 },
        { text: "WARD", x: -12, z: 15.5, w: 3 }, { text: "CORRIDOR", x: -3, z: 11.5, w: 4 }, { text: "MORGUE", x: 6, z: 11.5, w: 3.4 }, { text: "PHARMACY", x: 13.5, z: 11.5, w: 4 },
      ],
    }),
  "vehicle-lineup": () =>
    exteriorScene({
      sky: 0xc4d8ea,
      items: [
        `vehicle(s,"sedan",-9,0,0,{color:0x1a1c1f,stripe:"#e8e8e8",unit:"104",type:"police"});`,
        `vehicle(s,"suv",-3,0,0,{color:0xf2f2f0,stripe:"#1f4e79",unit:"215",type:"police"});`,
        `vehicle(s,"van",3.4,0,0,{color:0xf4f4f2,stripe:"#c8202a",unit:"A-12",type:"ems"});`,
        `vehicle(s,"truck",11,0,0,{color:0xc8202a,stripe:"#f2d55c",unit:"E-3",type:"fire"});`,
        `buildingBlock(s,0,-22,{w:60,d:14,h:8,rows:2,cols:14});props.tree(s,-26,-10,1.3);props.tree(s,28,-9,1.2);`,
      ],
      // Far enough back that all four units sit fully in frame (~26 m span).
      view: { pos: [1, 4.6, 27], look: [1, 1.0, 0], fov: 38 },
    }),
  "hospital-plan": () =>
    floorplan({
      title: "Ground floor",
      rooms: [
        { x: -8, z: -6, w: 12, d: 9, color: 0xdbe7ee, label: "Triage", doors: [{ x: -3.5, z: -4.5, w: 2.4 }, { x: 3.5, z: -4.5, w: 2.4 }], furniture: [{ x: -4.2, z: -1, w: 0.95, d: 2 }, { x: -1.4, z: -1, w: 0.95, d: 2 }, { x: 1.4, z: -1, w: 0.95, d: 2 }, { x: 4.2, z: -1, w: 0.95, d: 2 }, { x: 0, z: 3.6, w: 3.2, d: 0.7, color: 0x6f7c8a }] },
        { x: 5, z: -6.5, w: 8, d: 7, color: 0xe3ecef, label: "Surgery", doors: [{ x: 0, z: 3.5, w: 1.8 }], furniture: [{ x: 0, z: 0, w: 0.6, d: 2, color: 0x4f5c69 }] },
        { x: 13, z: -6.5, w: 7, d: 7, color: 0xe3ecef, label: "Imaging", doors: [{ x: -3.5, z: 0, w: 1.4 }], furniture: [{ x: 0.5, z: -0.5, w: 2.2, d: 1.6, color: 0x7d8794 }] },
        { x: -12, z: 6, w: 6, d: 16, color: 0xeaeae4, label: "Ward B", doors: [{ x: 0, z: 8, w: 1.8 }], furniture: [{ x: -2, z: -5.5, w: 0.95, d: 2 }, { x: -2, z: -1.5, w: 0.95, d: 2 }, { x: -2, z: 2.5, w: 0.95, d: 2 }, { x: 2, z: -5.5, w: 0.95, d: 2 }, { x: 2, z: -1.5, w: 0.95, d: 2 }, { x: 2, z: 2.5, w: 0.95, d: 2 }] },
        { x: -3, z: 8, w: 10, d: 4, color: 0xf0efe9, label: "Corridor", doors: [{ x: -5, z: 0, w: 1.4 }, { x: 5, z: 0, w: 1.4 }] },
        { x: 6, z: 6, w: 7, d: 8, color: 0xdde3e8, label: "Morgue", doors: [{ x: 0, z: -4, w: 1.4 }], furniture: [{ x: -1.5, z: 0, w: 0.8, d: 2, color: 0x8894a0 }, { x: 1.5, z: 0, w: 0.8, d: 2, color: 0x8894a0 }] },
        { x: 13.5, z: 6, w: 7, d: 8, color: 0xe6e9e2, label: "Pharmacy", doors: [{ x: -3.5, z: 0, w: 1.4 }], furniture: [{ x: 0, z: -2.5, w: 4.5, d: 0.6, color: 0x9aa5b1 }, { x: 0, z: 2, w: 4.5, d: 0.6, color: 0x9aa5b1 }] },
      ],
    }),
  "vehicle-police-close": () =>
    exteriorScene({
      sky: 0xbfd3e6,
      items: [`vehicle(s,"sedan",0,0,0.55,{color:0x1a1c1f,stripe:"#e8e8e8",unit:"104",type:"police"});`, `buildingBlock(s,-6,-18,{w:40,d:14,h:9,rows:2,cols:10});props.tree(s,14,-8,1.2);props.bollard(s,6,4);`],
      view: { pos: [5.4, 1.6, 5.2], look: [0, 0.9, 0], fov: 40 },
    }),
  "vehicle-night": () =>
    exteriorScene({
      sky: 0x0b1220,
      fog: true,
      daylight: { intensity: 0.35, color: 0x9fb4d8, pos: [-6, 12, 8], size: 24, hemi: 0.18 },
      items: [
        `vehicle(s,"sedan",-2.5,0,0.35,{color:0x1a1c1f,stripe:"#e8e8e8",unit:"104",type:"police"});vehicle(s,"suv",3.5,-2,0.2,{color:0xf2f2f0,stripe:"#1f4e79",unit:"215",type:"police"});`,
        `{for(const [x,z,c] of [[-2.7,0.9,0xff2a1f],[-1.9,0.9,0x2a6dff],[3.3,-1.1,0xff2a1f],[4.1,-1.1,0x2a6dff]]){const l=new THREE.PointLight(c,60,14,1.4);l.position.set(x,1.9,z);s.add(l);}}`,
        `{for(const x of [-14,-4,6,16]){s.add(cyl(0.08,0.1,7,mat.std(0x3a3d42),x,3.5,-9,8));const l=new THREE.PointLight(0xffd9a0,45,22,1.6);l.position.set(x,6.6,-9);s.add(l);s.add(box(0.5,0.16,0.5,mat.emissive(0xffd9a0,3),x,6.9,-9,false));}}`,
        `buildingBlock(s,0,-20,{w:44,d:14,h:10,rows:2,cols:12});`,
      ],
      view: { pos: [6, 2.2, 9], look: [0, 1.0, -1], fov: 44 },
    }),
  "ui-inventory": () => inventory(),
  "ui-inventory-trunk": () => inventory({ view: "trunk" }),
  "ui-anticheat-live": () => anticheatDashboard(),
  "ui-anticheat-rules": () => anticheatRules(),
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENES)
const browser = await launchBrowser()
try {
  for (const name of names) {
    if (!SCENES[name]) { console.log(`skip unknown scene ${name}`); continue }
    const t0 = Date.now()
    const png = await renderScene(browser, SCENES[name](), { label: name })
    const spread = await frameSpread(png)
    const webp = await sharp(png).webp({ quality: 84 }).toBuffer()
    writeFileSync(`${OUT}/${name}.png`, png)
    writeFileSync(`${OUT}/${name}.webp`, webp)
    console.log(`${name.padEnd(24)} ${String(Date.now() - t0).padStart(5)} ms  spread ${String(spread).padStart(3)}  webp ${(webp.length / 1024).toFixed(0).padStart(4)} KB`)
  }
} finally {
  await browser.close()
}
