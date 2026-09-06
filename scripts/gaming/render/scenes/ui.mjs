/**
 * Interface scenes: real HTML/CSS, screenshotted. These are not paintings of
 * interfaces — they are interfaces, rendered by the browser, so every label
 * is readable and every value is a real sample value.
 *
 * Each scene sits over a dimmed in-game backdrop the way an actual overlay
 * does, so the frame reads as a screenshot taken during play rather than a
 * design mock on a white page. No ratings, sales counts or player counts
 * appear anywhere.
 */
import { doc, esc } from "../lib.mjs"

/* ------------------------------------------------------------ backdrops */

/**
 * A soft, out-of-focus game world behind an overlay: sky, distant blocks,
 * ground. Deliberately blurred and dimmed — it is context, not the subject.
 */
function gameBackdrop({ tone = "day" } = {}) {
  const sky = tone === "night" ? "linear-gradient(#0d1524 0%,#1a2740 55%,#0b0f18 100%)" : "linear-gradient(#8fb6dc 0%,#c9dcea 48%,#6f7a66 49%,#4f5a49 100%)"
  return `
  <div class="bd" style="background:${sky}">
    <div class="bd-blocks">
      ${Array.from({ length: 9 }, (_, i) => `<i style="left:${4 + i * 11}%;height:${18 + ((i * 7) % 5) * 7}%;width:${5 + (i % 3) * 2}%;background:${tone === "night" ? "#151c2a" : "#8d9aa8"}"></i>`).join("")}
    </div>
    <div class="bd-road"></div>
  </div>
  <div class="dim"></div>`
}

const BASE_STYLE = `
  .bd{position:absolute;inset:0;filter:blur(6px) saturate(.85);transform:scale(1.04)}
  .bd-blocks i{position:absolute;bottom:34%;display:block;border-radius:2px 2px 0 0;opacity:.9}
  .bd-road{position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(#5a5f66,#3a3e44)}
  .dim{position:absolute;inset:0;background:rgba(6,9,14,.52)}
  .win{position:absolute;background:#12161d;border:1px solid rgba(255,255,255,.09);border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 0 1px rgba(0,0,0,.6);color:#e6e9ee;overflow:hidden}
  .win .hd{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.07);background:#171c25}
  .win .hd h1{margin:0;font-size:16px;font-weight:600;letter-spacing:.02em}
  .win .hd .k{font-size:12px;color:#8b93a1}
  .kbd{display:inline-block;padding:2px 7px;border:1px solid rgba(255,255,255,.18);border-bottom-width:2px;border-radius:5px;font-size:11px;color:#c7cdd6;background:#0e1219;margin-left:6px}
  .lbl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8b93a1;font-weight:600}
  .tag{display:inline-block;font-size:11px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.08);color:#c7cdd6}
  .tag.ok{background:rgba(62,198,109,.16);color:#7fe0a3}.tag.warn{background:rgba(232,184,74,.16);color:#f2cf78}.tag.bad{background:rgba(232,85,74,.16);color:#f39c93}
  .tag.info{background:rgba(74,155,232,.16);color:#8fc3f5}
  table{border-collapse:collapse;width:100%}th{text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8b93a1;font-weight:600;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
  td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.05);font-size:13.5px;vertical-align:middle}tr:hover td{background:rgba(255,255,255,.02)}
  .bar{height:6px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden}.bar i{display:block;height:100%;background:#4a9be8}
`

/* ------------------------------------------------------------ inventory */

const ITEMS = [
  ["Water Bottle", 0.5, 3, "#3d9be8"], ["Sandwich", 0.3, 2, "#c9a35a"], ["Bandage", 0.1, 6, "#e8e8e8"], ["Phone", 0.2, 1, "#2b2f36"],
  ["Repair Kit", 2.5, 1, "#8a6a3a"], ["Lockpick", 0.1, 4, "#9aa3ad"], ["Radio", 0.4, 1, "#3a3f46"], ["ID Card", 0.0, 1, "#5fa8d3"],
  ["Cash", 0.0, 1, "#3ec66d"], ["Wrench", 0.8, 1, "#b9bec6"], ["Energy Drink", 0.4, 2, "#d64545"], ["Vehicle Key", 0.1, 1, "#e3b448"],
  ["First Aid Kit", 1.2, 1, "#d8323b"], ["Torch", 0.3, 1, "#f0d060"], ["Rope", 0.9, 1, "#a8895d"],
]

/** Player inventory: grid, weight bar, hotbar, item details, context menu. */
export function inventory({ view = "player", showContext = true, showDetails = true } = {}) {
  const used = ITEMS.reduce((a, [, w, n]) => a + w * n, 0)
  const cap = 40
  const slots = 30
  const cell = (i) => {
    const it = ITEMS[i]
    if (!it) return `<div class="slot empty"><span class="n">${i + 1}</span></div>`
    const [name, w, n, c] = it
    return `<div class="slot${i === 4 ? " sel" : ""}"><span class="n">${i + 1}</span><i class="ic" style="background:${c}"></i><b>${esc(name)}</b><small>${n > 1 ? `×${n} · ` : ""}${(w * n).toFixed(1)} kg</small></div>`
  }
  const other = view === "trunk" ? "Vehicle Trunk" : view === "container" ? "Storage Container" : view === "shop" ? "General Store" : null
  const body = `
  ${gameBackdrop()}
  <div class="win" style="left:${other ? 90 : 300}px;top:96px;width:${other ? 1420 : 1000}px;height:808px">
    <div class="hd"><h1>Inventory</h1><div class="k">Drag to move · Shift-drag to split · <span class="kbd">1</span>–<span class="kbd">5</span> hotbar · <span class="kbd">Tab</span> close</div></div>
    <div class="cols" style="grid-template-columns:${other ? "1fr 1fr" : "1fr 320px"}">
      <section class="pane">
        <div class="ph"><span class="lbl">Player</span><span class="wt ${used > cap * 0.9 ? "over" : ""}">${used.toFixed(1)} / ${cap.toFixed(1)} kg</span></div>
        <div class="bar big"><i style="width:${Math.min(100, (used / cap) * 100).toFixed(0)}%;background:${used > cap * 0.9 ? "#e8554a" : "#4a9be8"}"></i></div>
        <div class="grid">${Array.from({ length: slots }, (_, i) => cell(i)).join("")}</div>
        <div class="hotbar">${[0, 1, 2, 3, 4].map((i) => `<div class="hs"><span class="k">${i + 1}</span>${ITEMS[i] ? `<i style="background:${ITEMS[i][3]}"></i><b>${esc(ITEMS[i][0])}</b>` : ""}</div>`).join("")}</div>
      </section>
      ${other ? `<section class="pane">
        <div class="ph"><span class="lbl">${other}</span><span class="wt">62.0 / 120.0 kg</span></div>
        <div class="bar big"><i style="width:52%"></i></div>
        <div class="grid">${Array.from({ length: slots }, (_, i) => (i < 9 ? cell((i + 6) % ITEMS.length) : `<div class="slot empty"><span class="n">${i + 1}</span></div>`)).join("")}</div>
      </section>` : `<aside class="pane side">
        ${showDetails ? `<div class="lbl">Item Details</div>
        <div class="det"><i class="ic lg" style="background:${ITEMS[4][3]}"></i><h2>Repair Kit</h2><p>Restores engine and body condition on the nearest vehicle. Consumed on use.</p>
          <div class="kv"><span>Weight</span><b>2.5 kg</b></div><div class="kv"><span>Durability</span><b>100%</b></div><div class="kv"><span>Quality</span><b class="q">Standard</b></div><div class="kv"><span>Usable</span><b>Yes</b></div></div>` : ""}
        ${showContext ? `<div class="lbl" style="margin-top:22px">Actions</div>
        <div class="menu"><div class="mi">Use</div><div class="mi">Give to nearby player</div><div class="mi">Split stack</div><div class="mi bad">Drop</div></div>` : ""}
      </aside>`}
    </div>
  </div>`
  const style = `${BASE_STYLE}
  .cols{display:grid;height:calc(100% - 53px)}
  .pane{padding:18px 20px;border-right:1px solid rgba(255,255,255,.06)}.pane:last-child{border-right:0}
  .ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.wt{font-size:13px;color:#c7cdd6;font-variant-numeric:tabular-nums}.wt.over{color:#f39c93}
  .bar.big{height:8px;margin-bottom:14px}
  .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
  .slot{position:relative;aspect-ratio:1/1;background:#1a1f28;border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:8px;display:flex;flex-direction:column;justify-content:flex-end;gap:2px}
  .slot.empty{background:#141821;border-style:dashed}.slot.sel{border-color:#e8b84a;box-shadow:0 0 0 1px #e8b84a inset}
  .slot .n{position:absolute;top:6px;left:8px;font-size:10px;color:#6c7480}
  .slot .ic{position:absolute;top:14px;left:50%;width:38px;height:38px;margin-left:-19px;border-radius:8px;box-shadow:inset 0 -8px 14px rgba(0,0,0,.35),inset 0 4px 8px rgba(255,255,255,.18)}
  .slot b{font-size:12px;font-weight:600;line-height:1.1}.slot small{font-size:10.5px;color:#8b93a1;font-variant-numeric:tabular-nums}
  .hotbar{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:14px}
  .hs{height:64px;background:#0f131a;border:1px solid rgba(255,255,255,.08);border-radius:8px;position:relative;padding:8px;display:flex;align-items:flex-end}
  .hs .k{position:absolute;top:6px;left:8px;font-size:11px;color:#8b93a1}.hs i{position:absolute;top:10px;right:10px;width:26px;height:26px;border-radius:6px}.hs b{font-size:11.5px}
  .side{background:#0f131a}
  .det h2{margin:14px 0 6px;font-size:18px}.det p{margin:0 0 14px;color:#aeb5c0;font-size:13px;line-height:1.45}
  .det .ic.lg{width:64px;height:64px;border-radius:12px;display:block;box-shadow:inset 0 -10px 18px rgba(0,0,0,.35),inset 0 4px 8px rgba(255,255,255,.18)}
  .kv{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px}.kv span{color:#8b93a1}.kv .q{color:#8fc3f5}
  .menu{background:#171c25;border:1px solid rgba(255,255,255,.08);border-radius:8px;overflow:hidden}.mi{padding:11px 14px;font-size:13.5px;border-bottom:1px solid rgba(255,255,255,.05)}.mi:last-child{border-bottom:0}.mi.bad{color:#f39c93}`
  return doc({ body, style, bg: "#3b4a5c" })
}

/* ------------------------------------------------------------ anticheat */

const PLAYERS = ["J. Moreno", "K. Adebayo", "L. Fischer", "T. Nakamura", "R. Okafor", "S. Lindqvist", "M. Haddad", "A. Petrov", "D. Costa", "E. Byrne"]
const EVENTS = [
  ["21:14:07", PLAYERS[2], "Event validation", "Triggered vehicle:repair without a nearby repair point", 74, "flagged"],
  ["21:13:52", PLAYERS[5], "Teleport delta", "Moved 412 m in 0.9 s outside any vehicle", 91, "auto-action"],
  ["21:12:30", PLAYERS[0], "Resource hash", "Client resource ds_inventory_ui hash mismatch", 88, "flagged"],
  ["21:11:48", PLAYERS[7], "Event rate", "56 inventory:move events in 2 s", 43, "watch"],
  ["21:10:15", PLAYERS[3], "Injection", "Blocked execution of an unregistered client script", 96, "auto-action"],
  ["21:09:02", PLAYERS[8], "Event validation", "Requested bank:withdraw for an account not owned", 67, "flagged"],
  ["21:07:39", PLAYERS[1], "Event rate", "Repeated garage:retrieve calls, 14 in 3 s", 31, "cleared"],
  ["21:05:11", PLAYERS[9], "Teleport delta", "Vertical delta 38 m with no fall damage", 58, "watch"],
]

export function anticheatDashboard({ tab = "live" } = {}) {
  const score = (n) => `<div class="sc"><div class="bar"><i style="width:${n}%;background:${n >= 80 ? "#e8554a" : n >= 60 ? "#e8b84a" : "#4a9be8"}"></i></div><b>${n}</b></div>`
  const st = { flagged: `<span class="tag warn">Flagged</span>`, "auto-action": `<span class="tag bad">Auto-kicked</span>`, watch: `<span class="tag info">Watching</span>`, cleared: `<span class="tag ok">Cleared</span>` }
  const rows = EVENTS.map((e) => `<tr><td class="mono t">${e[0]}</td><td><b>${esc(e[1])}</b></td><td><span class="tag">${e[2]}</span></td><td class="msg">${esc(e[3])}</td><td>${score(e[4])}</td><td>${st[e[5]]}</td></tr>`).join("")
  const body = `
  <div class="app">
    <aside class="nav"><div class="brand">Anticheat</div>
      ${["Live events", "Flagged players", "Bans", "Rules", "Audit log", "Settings"].map((n, i) => `<div class="ni${(tab === "live" && i === 0) || (tab === "rules" && i === 3) ? " on" : ""}">${n}</div>`).join("")}
      <div class="foot"><span class="dot"></span> Enforcing · staff bypass on</div></aside>
    <main>
      <header><h1>Live events</h1><div class="stats">
        <div class="st"><span class="lbl">Active sessions</span><b>84</b></div><div class="st"><span class="lbl">Events / min</span><b>1,240</b></div><div class="st"><span class="lbl">Flagged (24h)</span><b>17</b></div><div class="st"><span class="lbl">Auto-actions (24h)</span><b>3</b></div></div></header>
      <div class="tools"><input value="Search player, event type or resource…"><span class="tag info">Last 15 min</span><span class="tag">Score ≥ 30</span></div>
      <table><thead><tr><th>Time</th><th>Player</th><th>Check</th><th>Detail</th><th style="width:170px">Score</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>
    </main>
  </div>`
  const style = `${BASE_STYLE}
  html,body{background:#0e1117}
  .app{display:grid;grid-template-columns:230px 1fr;height:100%;color:#e6e9ee}
  .nav{background:#12161d;border-right:1px solid rgba(255,255,255,.07);padding:22px 14px;display:flex;flex-direction:column}
  .brand{font-weight:700;font-size:15px;padding:6px 10px 20px;letter-spacing:.02em}
  .ni{padding:10px 12px;border-radius:7px;font-size:13.5px;color:#aeb5c0;margin-bottom:2px}.ni.on{background:rgba(74,155,232,.14);color:#dfe8f3}
  .foot{margin-top:auto;font-size:12px;color:#8b93a1;padding:10px}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#3ec66d;margin-right:6px}
  main{padding:26px 32px;overflow:hidden}
  header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px}h1{margin:0;font-size:22px}
  .stats{display:flex;gap:12px}.st{background:#12161d;border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:10px 16px;min-width:140px}.st b{display:block;font-size:22px;margin-top:2px;font-variant-numeric:tabular-nums}
  .tools{display:flex;gap:10px;align-items:center;margin-bottom:12px}.tools input{flex:1;background:#12161d;border:1px solid rgba(255,255,255,.1);color:#8b93a1;border-radius:7px;padding:10px 14px;font-size:13px}
  table{background:#12161d;border:1px solid rgba(255,255,255,.07);border-radius:9px;overflow:hidden}
  td.t{color:#8b93a1;font-size:12.5px}td.msg{color:#c7cdd6;max-width:520px}
  .sc{display:flex;align-items:center;gap:10px}.sc .bar{flex:1}.sc b{font-variant-numeric:tabular-nums;width:26px;text-align:right}`
  return doc({ body, style, bg: "#0e1117" })
}

/* ------------------------------------------------- minecraft resource pack */

/**
 * Pixel-art block textures drawn on canvas at the pack's native size. These
 * are the product: a 32x pack is shown at 32x32 and a default comparison at
 * 16x16, both scaled with image-rendering: pixelated so every texel is crisp.
 */
const PIX_JS = `
function tex(cv,size,kind,seed){const x=cv.getContext("2d");cv.width=size;cv.height=size;let s=seed*7919+13;const r=()=>{s=(s*9301+49297)%233280;return s/233280;};
  const np=(b,v)=>{for(let i=0;i<size;i++)for(let j=0;j<size;j++){const n=(r()-0.5)*v;x.fillStyle="rgb("+(b[0]+n|0)+","+(b[1]+n|0)+","+(b[2]+n|0)+")";x.fillRect(i,j,1,1);}};
  const u=size/16;
  if(kind==="grass"){np([98,158,62],36);for(let k=0;k<size*2;k++){x.fillStyle="rgba(0,0,0,.12)";x.fillRect(r()*size|0,r()*size|0,u,u);}}
  else if(kind==="dirt")np([134,96,67],30);
  else if(kind==="stone"){np([124,124,124],34);for(let k=0;k<size;k++){x.fillStyle="rgba(0,0,0,.18)";x.fillRect(r()*size|0,r()*size|0,u*2,u);}}
  else if(kind==="cobble"){np([118,118,118],38);x.fillStyle="rgba(0,0,0,.4)";for(let k=0;k<14;k++){x.fillRect(((k*5)%16)*u,((k*7)%16)*u,3*u,u);x.fillRect(((k*5)%16)*u,((k*7)%16)*u,u,3*u);}}
  else if(kind==="planks"){np([170,134,82],22);x.fillStyle="rgba(60,35,10,.55)";for(let j=0;j<16;j+=4)x.fillRect(0,j*u,size,u);x.fillRect(8*u,0,u,4*u);x.fillRect(0,4*u,u,4*u);x.fillRect(8*u,8*u,u,4*u);x.fillRect(0,12*u,u,4*u);}
  else if(kind==="log"){np([98,72,42],24);x.fillStyle="rgba(40,25,10,.5)";for(let i=0;i<16;i+=3)x.fillRect(i*u,0,u,size);}
  else if(kind==="leaves"){np([58,128,40],56);for(let k=0;k<22;k++)x.clearRect(((k*11)%16)*u,((k*13)%16)*u,u,u);}
  else if(kind==="sand")np([218,206,162],20);
  else if(kind==="stonebrick"){np([118,118,118],22);x.fillStyle="rgba(0,0,0,.45)";x.fillRect(0,7*u,size,u);x.fillRect(0,15*u,size,u);x.fillRect(7*u,0,u,8*u);x.fillRect(15*u,0,u,8*u);x.fillRect(3*u,8*u,u,8*u);x.fillRect(11*u,8*u,u,8*u);}
  else if(kind==="iron"){np([210,210,214],14);x.fillStyle="rgba(0,0,0,.2)";x.fillRect(0,0,size,u);x.fillRect(0,0,u,size);x.fillStyle="rgba(255,255,255,.35)";x.fillRect(u,u,size-2*u,u);}
  else if(kind==="gold"){np([232,196,74],24);x.fillStyle="rgba(255,255,255,.35)";x.fillRect(2*u,2*u,3*u,u);}
  else if(kind==="diamond"){np([124,214,232],28);x.fillStyle="rgba(255,255,255,.5)";x.fillRect(3*u,3*u,2*u,u);x.fillRect(9*u,10*u,2*u,u);}
  else if(kind==="coal_ore"){np([124,124,124],30);x.fillStyle="#2a2a2a";for(const[a,b]of[[2,3],[9,2],[5,9],[12,11],[3,13]])x.fillRect(a*u,b*u,2*u,2*u);}
  else if(kind==="iron_ore"){np([124,124,124],30);x.fillStyle="#d8a57a";for(const[a,b]of[[3,2],[10,4],[6,10],[12,12]])x.fillRect(a*u,b*u,2*u,2*u);}
  else if(kind==="glowstone"){np([240,202,112],36);x.fillStyle="rgba(255,255,255,.5)";for(let k=0;k<6;k++)x.fillRect(r()*size|0,r()*size|0,u,u);}
  else if(kind==="water")np([52,92,196],26);
  else if(kind==="wool_red")np([178,42,42],18);
  else if(kind==="bricks"){np([150,80,64],22);x.fillStyle="rgba(230,220,210,.6)";for(let j=0;j<16;j+=4){x.fillRect(0,j*u,size,u);}for(let j=0;j<16;j+=8){x.fillRect(4*u,(j+1)*u,u,3*u);x.fillRect(12*u,(j+1)*u,u,3*u);x.fillRect(8*u,(j+5)*u,u,3*u);x.fillRect(0,(j+5)*u,u,3*u);}}
  else np([120,120,120],30);
}`

export function textureSheet({ size = 32, title = "Block textures" } = {}) {
  const KINDS = ["grass", "dirt", "stone", "cobble", "stonebrick", "planks", "log", "leaves", "sand", "bricks", "iron", "gold", "diamond", "coal_ore", "iron_ore", "glowstone", "water", "wool_red"]
  const NAMES = { grass: "Grass", dirt: "Dirt", stone: "Stone", cobble: "Cobblestone", stonebrick: "Stone Bricks", planks: "Oak Planks", log: "Oak Log", leaves: "Oak Leaves", sand: "Sand", bricks: "Bricks", iron: "Iron Block", gold: "Gold Block", diamond: "Diamond Block", coal_ore: "Coal Ore", iron_ore: "Iron Ore", glowstone: "Glowstone", water: "Water", wool_red: "Red Wool" }
  const cells = KINDS.map((k, i) => `<div class="c"><canvas data-k="${k}" data-s="${i + 1}"></canvas><span>${NAMES[k]}</span><small>${size}×${size}</small></div>`).join("")
  const body = `<div class="sheet"><header><h1>${esc(title)}</h1><span class="meta">${size}× · ${KINDS.length} of 214 textures · single palette</span></header><div class="grid">${cells}</div></div>
  <script>${PIX_JS}
  document.querySelectorAll("canvas").forEach(cv=>tex(cv,${size},cv.dataset.k,+cv.dataset.s));window.__done=true;</script>`
  const style = `
  html,body{background:#2a2d31}
  .sheet{padding:44px 60px}header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:26px;color:#e6e9ee}h1{margin:0;font-size:22px;font-weight:600}.meta{color:#9aa3ad;font-size:13px}
  .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:22px 20px}
  .c{background:#1f2226;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:14px;text-align:center;color:#e6e9ee}
  canvas{width:160px;height:160px;image-rendering:pixelated;border-radius:4px;display:block;margin:0 auto 10px;box-shadow:0 6px 18px rgba(0,0,0,.4)}
  .c span{display:block;font-size:13.5px;font-weight:600}.c small{display:block;font-size:11px;color:#8b93a1;margin-top:2px;font-variant-numeric:tabular-nums}`
  return doc({ body, style, bg: "#2a2d31" })
}

/** Split comparison of the same wall in default 16x and the pack's 32x. */
export function beforeAfter({ size = 32 } = {}) {
  const wall = (s, id) => {
    const rows = ["stonebrick,stonebrick,planks,planks,glass,planks,planks,stonebrick,stonebrick", "stonebrick,cobble,planks,log,log,log,planks,cobble,stonebrick", "grass,grass,grass,dirt,dirt,dirt,grass,grass,grass", "dirt,stone,stone,coal_ore,stone,iron_ore,stone,stone,dirt"]
    return rows.map((r, j) => r.split(",").map((k, i) => `<canvas data-k="${k === "glass" ? "iron" : k}" data-s="${id * 100 + j * 9 + i}" data-size="${s}"></canvas>`).join("")).join("")
  }
  const body = `
  <div class="cmp">
    <section><div class="cap"><b>Default</b><span>16×</span></div><div class="wall">${wall(16, 1)}</div></section>
    <div class="div"></div>
    <section><div class="cap"><b>This pack</b><span>${size}×</span></div><div class="wall">${wall(size, 2)}</div></section>
  </div>
  <script>${PIX_JS}
  document.querySelectorAll("canvas").forEach(cv=>tex(cv,+cv.dataset.size,cv.dataset.k,+cv.dataset.s));window.__done=true;</script>`
  const style = `
  html,body{background:#1c1f23}
  .cmp{display:grid;grid-template-columns:1fr 6px 1fr;height:100%}
  section{position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .wall{display:grid;grid-template-columns:repeat(9,120px);grid-auto-rows:120px;gap:0;box-shadow:0 30px 80px rgba(0,0,0,.5)}
  canvas{width:120px;height:120px;image-rendering:pixelated;display:block}
  .div{background:#e8b84a}
  .cap{position:absolute;top:34px;left:40px;background:rgba(6,9,14,.78);color:#fff;padding:10px 16px;border-radius:8px;font-size:14px}.cap b{font-weight:600;margin-right:10px}.cap span{color:#e8b84a;font-weight:700}`
  return doc({ body, style, bg: "#1c1f23" })
}

/** The classic survival inventory GUI, skinned by the pack (the product's "matching UI skin"). */
export function mcInventory() {
  const slot = (k, n) => `<div class="s">${k ? `<canvas data-k="${k}" data-s="${n}"></canvas>` : ""}${n && k && n % 3 === 0 ? `<i>${(n % 5) + 2}</i>` : ""}</div>`
  const items = ["planks", "cobble", "log", "iron", "coal_ore", "sand", "stonebrick", "gold", "bricks", "leaves", "diamond", "glowstone"]
  const main = Array.from({ length: 27 }, (_, i) => slot(i < 12 ? items[i] : null, i + 1)).join("")
  const hot = Array.from({ length: 9 }, (_, i) => slot(i < 5 ? items[(i + 3) % items.length] : null, i + 30)).join("")
  const body = `
  <div class="bd" style="background:linear-gradient(#7fb0e0,#a9cbe8 45%,#5b7a4e 46%,#4a6540)"></div><div class="dim" style="background:rgba(0,0,0,.45)"></div>
  <div class="gui">
    <div class="ttl">Crafting</div>
    <div class="top"><div class="pv"><div class="fig"></div></div><div class="craft">${Array.from({ length: 4 }, () => slot(null)).join("")}<div class="arrow">➜</div>${slot(null)}</div></div>
    <div class="ttl">Inventory</div><div class="grid">${main}</div><div class="grid hot">${hot}</div>
  </div>
  <script>${PIX_JS}
  document.querySelectorAll("canvas").forEach(cv=>tex(cv,32,cv.dataset.k,+cv.dataset.s));window.__done=true;</script>`
  const style = `${BASE_STYLE}
  .bd{position:absolute;inset:0}.gui{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:704px;background:#c6c6c6;border:4px solid;border-color:#fff #555 #555 #fff;padding:16px 18px 18px;box-shadow:0 30px 80px rgba(0,0,0,.6);image-rendering:pixelated}
  .ttl{font-family:Consolas,Menlo,monospace;font-size:20px;color:#3f3f3f;margin:6px 0 8px;text-shadow:1px 1px 0 #fff}
  .top{display:flex;gap:28px;align-items:center;margin-bottom:8px}.pv{width:200px;height:210px;background:#000;border:3px solid;border-color:#373737 #fff #fff #373737;display:flex;align-items:flex-end;justify-content:center}
  .fig{width:60px;height:170px;background:linear-gradient(#d9a06f 0 22%,#3d7ea6 22% 60%,#2b3f7a 60%);margin-bottom:14px;box-shadow:inset -14px 0 rgba(0,0,0,.28)}
  .craft{display:grid;grid-template-columns:72px 72px 70px 72px;grid-template-rows:72px 72px;gap:0;align-items:center}.craft .arrow{grid-row:1/3;grid-column:3;text-align:center;font-size:36px;color:#5f5f5f}.craft .s:nth-child(5){grid-row:1/3;grid-column:4;height:72px}
  .grid{display:grid;grid-template-columns:repeat(9,72px);gap:0}.grid.hot{margin-top:16px}
  .s{width:72px;height:72px;background:#8b8b8b;border:3px solid;border-color:#373737 #fff #fff #373737;position:relative}
  .s canvas{width:56px;height:56px;image-rendering:pixelated;position:absolute;left:5px;top:5px}
  .s i{position:absolute;right:6px;bottom:2px;font-style:normal;font-family:Consolas,Menlo,monospace;font-size:20px;color:#fff;text-shadow:2px 2px 0 #3f3f3f}`
  return doc({ body, style, bg: "#5b7a4e" })
}

/* --------------------------------------------------------- brand kit */

/** A fictional organisation used for every brand-kit deliverable. */
const ORG = { name: "IRONVALE", sub: "ESPORTS", navy: "#14213d", gold: "#e0a526", ink: "#0b0f19", light: "#f4f1ea" }
const mark = (size, fg = ORG.gold, bg = ORG.navy) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><path d="M50 4 88 22v34c0 22-16 36-38 40C28 92 12 78 12 56V22z" fill="${bg}"/><path d="M50 14 78 27v28c0 16-12 27-28 30-16-3-28-14-28-30V27z" fill="none" stroke="${fg}" stroke-width="4"/><path d="M32 60 50 30l18 30H56l-6-11-6 11z" fill="${fg}"/></svg>`

export function logoSystem() {
  const lock = (sz, dark) => `<div class="lk ${dark ? "dk" : ""}">${mark(sz)}<div class="wm"><b style="font-size:${sz * 0.42}px">${ORG.name}</b><span style="font-size:${sz * 0.16}px">${ORG.sub}</span></div></div>`
  const body = `
  <div class="page"><header><h1>Logo system</h1><span>Primary lockup · compact · icon · clear space · palette</span></header>
  <div class="row"><div class="card wide">${lock(120, false)}<div class="cs"><i></i><i></i><i></i><i></i></div><small>Primary lockup — clear space = cap height</small></div>
  <div class="card wide dark">${lock(120, true)}<small>On dark</small></div></div>
  <div class="row"><div class="card">${lock(64, false)}<small>Compact</small></div>
  <div class="card icons">${mark(96)}${mark(48)}${mark(32)}${mark(16)}<small>Icon · 96 / 48 / 32 / 16 px</small></div>
  <div class="card pal"><div class="sw" style="background:${ORG.navy}"><b>Navy</b><span>${ORG.navy}</span></div><div class="sw" style="background:${ORG.gold};color:#1b1b1b"><b>Gold</b><span>${ORG.gold}</span></div><div class="sw" style="background:${ORG.ink}"><b>Ink</b><span>${ORG.ink}</span></div><div class="sw" style="background:${ORG.light};color:#1b1b1b;border:1px solid #ddd"><b>Bone</b><span>${ORG.light}</span></div><small>Palette</small></div></div></div>`
  const style = `
  html,body{background:#eceae4}.page{padding:48px 64px;color:#1f2430}header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:26px}h1{margin:0;font-size:24px}header span{color:#6b7480;font-size:13px}
  .row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:20px}.row:first-of-type{grid-template-columns:1fr 1fr}
  .card{background:#fff;border-radius:12px;padding:30px;min-height:240px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;box-shadow:0 2px 10px rgba(0,0,0,.05)}
  .card.dark{background:${ORG.ink}}.card small{position:absolute;left:22px;bottom:16px;font-size:12px;color:#8b93a1}
  .lk{display:flex;align-items:center;gap:22px}.wm b{display:block;font-weight:800;letter-spacing:.06em;color:${ORG.navy};line-height:1}.wm span{display:block;letter-spacing:.32em;color:${ORG.gold};font-weight:700;margin-top:6px}.lk.dk .wm b{color:#fff}
  .cs{position:absolute;inset:26px;border:1px dashed #c9cbd2;border-radius:6px;pointer-events:none}.cs i{position:absolute;width:10px;height:10px;border:1px solid #c9cbd2;background:#fff}.cs i:nth-child(1){left:-5px;top:-5px}.cs i:nth-child(2){right:-5px;top:-5px}.cs i:nth-child(3){left:-5px;bottom:-5px}.cs i:nth-child(4){right:-5px;bottom:-5px}
  .icons{flex-direction:row;gap:34px}
  .pal{flex-direction:row;gap:12px;padding:30px 30px 40px}.sw{flex:1;height:120px;border-radius:8px;color:#fff;padding:12px;display:flex;flex-direction:column;justify-content:flex-end}.sw b{font-size:13px}.sw span{font-size:11px;opacity:.75;font-family:Consolas,Menlo,monospace}`
  return doc({ body, style, bg: "#eceae4" })
}

export function socialBanners() {
  const banner = (w, h, label, scale) => `<div class="ab" style="width:${w * scale}px;height:${h * scale}px"><div class="bn" style="transform:scale(${scale});width:${w}px;height:${h}px">
    <div class="bg"></div>${mark(Math.round(h * 0.5))}<div class="wm"><b style="font-size:${Math.round(h * 0.22)}px">${ORG.name}</b><span style="font-size:${Math.round(h * 0.08)}px">${ORG.sub} · EST. 2024</span></div></div><small>${label} · ${w}×${h}</small></div>`
  const body = `<div class="page"><header><h1>Social layouts</h1><span>Current platform dimensions, exported from artboards</span></header>
    <div class="col">${banner(1500, 500, "X / Twitter header", 0.9)}${banner(2560, 1440, "YouTube banner (safe area shown)", 0.4)}</div>
    <div class="side">${banner(1080, 1080, "Profile / post", 0.3)}${banner(1080, 1920, "Story", 0.17)}</div></div>`
  const style = `
  html,body{background:#eceae4}.page{padding:44px 64px;color:#1f2430;display:grid;grid-template-columns:1fr 360px;gap:30px}header{grid-column:1/3;display:flex;justify-content:space-between;align-items:baseline}h1{margin:0;font-size:24px}header span{color:#6b7480;font-size:13px}
  .col{display:flex;flex-direction:column;gap:26px}.side{display:flex;flex-direction:column;gap:26px;align-items:flex-start}
  .ab{position:relative;overflow:hidden;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.14)}.ab small{position:absolute;left:0;bottom:-22px;font-size:12px;color:#6b7480;white-space:nowrap}
  .bn{position:absolute;left:0;top:0;transform-origin:0 0;display:flex;align-items:center;gap:40px;padding:0 6%;box-sizing:border-box}
  .bg{position:absolute;inset:0;background:linear-gradient(110deg,${ORG.ink} 0 48%,${ORG.navy} 48% 49%,${ORG.navy} 100%)}
  .bn svg{position:relative}.wm{position:relative}.wm b{display:block;color:#fff;font-weight:800;letter-spacing:.08em;line-height:1}.wm span{display:block;color:${ORG.gold};letter-spacing:.3em;font-weight:700;margin-top:10px}`
  return doc({ body, style, bg: "#eceae4" })
}

export function streamOverlay() {
  const body = `
  ${gameBackdrop()}
  <div class="ov">
    <div class="top"><div class="team"><span class="m">${mark(40)}</span><b>${ORG.name}</b></div><div class="score"><span>${ORG.name}</span><b>7</b><i>:</i><b>4</b><span>VISITORS</span></div><div class="round">ROUND 12 · MAP 2 OF 3</div></div>
    <div class="cam"><div class="cf"><span>CAMERA · 16:9</span></div><div class="name"><b>PLAYER ONE</b><span>IN-GAME LEADER</span></div></div>
    <div class="bot"><div class="sp">SPONSOR</div><div class="sp">SPONSOR</div><div class="sp">SPONSOR</div><div class="sa">safe area 1920×1080 · 5% margin</div></div>
  </div>`
  const style = `${BASE_STYLE}
  .ov{position:absolute;inset:0;padding:40px 48px;display:flex;flex-direction:column;justify-content:space-between;color:#fff;font-weight:600}
  .top{display:flex;justify-content:space-between;align-items:center}.team{display:flex;align-items:center;gap:12px;background:rgba(6,9,14,.7);padding:8px 16px 8px 8px;border-radius:8px;border-left:4px solid ${ORG.gold};letter-spacing:.08em}
  .score{display:flex;align-items:center;gap:14px;background:${ORG.ink};padding:10px 22px;border-radius:8px;border-top:3px solid ${ORG.gold}}.score span{font-size:12px;letter-spacing:.14em;color:#c7cdd6}.score b{font-size:30px}.score i{color:${ORG.gold};font-style:normal;font-size:26px}
  .round{background:rgba(6,9,14,.7);padding:10px 16px;border-radius:8px;font-size:12px;letter-spacing:.14em}
  .cam{align-self:flex-end;width:420px}.cf{aspect-ratio:16/9;background:#0b0f19;border:3px solid ${ORG.gold};border-radius:6px;display:flex;align-items:center;justify-content:center;color:#5b6473;font-size:12px;letter-spacing:.14em}
  .name{background:${ORG.navy};padding:10px 16px;border-radius:0 0 8px 8px;margin-top:-4px}.name b{display:block;letter-spacing:.1em}.name span{font-size:11px;color:${ORG.gold};letter-spacing:.2em}
  .bot{display:flex;gap:14px;align-items:center}.sp{width:150px;height:50px;border:1px dashed rgba(255,255,255,.4);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;letter-spacing:.18em;color:rgba(255,255,255,.6)}.sa{margin-left:auto;font-size:11px;color:rgba(255,255,255,.5);font-weight:400}`
  return doc({ body, style, bg: "#3b4a5c" })
}

export function playerCards() {
  const card = (n, role, i) => `<div class="pc"><div class="hd">${mark(36)}<span>${ORG.name}</span></div><div class="fig" style="background:linear-gradient(160deg,#2a3652,#141c2e)"><div class="sil"></div></div><div class="nm"><b>${n}</b><span>${role}</span></div><div class="ft"><i>#0${i}</i><i>${ORG.sub}</i></div></div>`
  const body = `<div class="page"><header><h1>Player cards & roster</h1><span>Template — names and roles are placeholders</span></header>
  <div class="row">${card("PLAYER ONE", "IN-GAME LEADER", 1)}${card("PLAYER TWO", "ENTRY", 2)}${card("PLAYER THREE", "SUPPORT", 3)}${card("PLAYER FOUR", "AWP", 4)}${card("PLAYER FIVE", "LURK", 5)}</div></div>`
  const style = `
  html,body{background:#eceae4}.page{padding:48px 64px;color:#1f2430}header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:28px}h1{margin:0;font-size:24px}header span{color:#6b7480;font-size:13px}
  .row{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
  .pc{background:${ORG.ink};border-radius:12px;overflow:hidden;color:#fff;box-shadow:0 12px 30px rgba(0,0,0,.18)}
  .hd{display:flex;align-items:center;gap:8px;padding:12px 14px;font-size:12px;letter-spacing:.16em;font-weight:700;border-bottom:2px solid ${ORG.gold}}
  .fig{height:300px;position:relative}.sil{position:absolute;left:50%;bottom:0;width:120px;height:230px;margin-left:-60px;background:linear-gradient(#d9a06f 0 18%,${ORG.navy} 18% 62%,#1a2033 62%);border-radius:60px 60px 0 0/40px 40px 0 0;box-shadow:inset -22px 0 rgba(0,0,0,.35)}
  .nm{padding:16px 14px 8px}.nm b{display:block;font-size:18px;letter-spacing:.06em}.nm span{font-size:11px;color:${ORG.gold};letter-spacing:.22em;font-weight:700}
  .ft{display:flex;justify-content:space-between;padding:8px 14px 14px;font-size:11px;color:#8b93a1;letter-spacing:.14em}.ft i{font-style:normal}`
  return doc({ body, style, bg: "#eceae4" })
}

/* ------------------------------------------------------------ floor plan */

/**
 * A clean architectural floor plan, drawn as SVG. This is the "layout
 * overview" image for an MLO: walls, door swings, fixtures and room names,
 * with a scale bar and north arrow. Crisp vector text is why this is not a
 * 3D render. Rooms are in metres, x/z at the room centre.
 */
export function floorplan({ rooms, title = "", pad = 70 }) {
  const minX = Math.min(...rooms.map((r) => r.x - r.w / 2)), maxX = Math.max(...rooms.map((r) => r.x + r.w / 2))
  const minZ = Math.min(...rooms.map((r) => r.z - r.d / 2)), maxZ = Math.max(...rooms.map((r) => r.z + r.d / 2))
  const availW = 1600 - pad * 2, availH = 1000 - pad * 2 - 30
  const S = Math.min(availW / (maxX - minX), availH / (maxZ - minZ))
  const ox = pad + (availW - (maxX - minX) * S) / 2, oz = pad + 30 + (availH - (maxZ - minZ) * S) / 2
  const X = (x) => (ox + (x - minX) * S).toFixed(1), Z = (z) => (oz + (z - minZ) * S).toFixed(1)
  const L = (m) => (m * S).toFixed(1)
  const hex = (n) => "#" + (n ?? 0xe4e7ec).toString(16).padStart(6, "0")
  const wall = Math.max(4, 0.18 * S)

  let out = ""
  // floors
  for (const r of rooms) out += `<rect x="${X(r.x - r.w / 2)}" y="${Z(r.z - r.d / 2)}" width="${L(r.w)}" height="${L(r.d)}" fill="${hex(r.color)}"/>`
  // fixtures
  for (const r of rooms) for (const f of r.furniture || [])
    out += `<rect x="${X(r.x + f.x - f.w / 2)}" y="${Z(r.z + f.z - f.d / 2)}" width="${L(f.w)}" height="${L(f.d)}" rx="${(0.06 * S).toFixed(1)}" fill="${hex(f.color ?? 0x9aa5b1)}" opacity=".85"/>`
  // walls
  for (const r of rooms) out += `<rect x="${X(r.x - r.w / 2)}" y="${Z(r.z - r.d / 2)}" width="${L(r.w)}" height="${L(r.d)}" fill="none" stroke="#252a31" stroke-width="${wall.toFixed(1)}"/>`
  // doors: gap in the wall + swing arc into the room
  for (const r of rooms) for (const d of r.doors || []) {
    const dw = d.w ?? 1.1
    const onH = Math.abs(Math.abs(d.z) - r.d / 2) < 0.3 // on north/south wall
    const cx = r.x + d.x, cz = r.z + d.z
    if (onH) {
      out += `<rect x="${X(cx - dw / 2)}" y="${(Number(Z(cz)) - wall / 2 - 1).toFixed(1)}" width="${L(dw)}" height="${(wall + 2).toFixed(1)}" fill="${hex(r.color)}"/>`
      const dir = d.z < 0 ? 1 : -1 // swing into the room
      out += `<path d="M ${X(cx - dw / 2)} ${Z(cz)} A ${L(dw)} ${L(dw)} 0 0 ${dir > 0 ? 1 : 0} ${X(cx + dw / 2)} ${Z(cz + dir * dw)}" fill="none" stroke="#252a31" stroke-width="1.5" opacity=".7"/><line x1="${X(cx - dw / 2)}" y1="${Z(cz)}" x2="${X(cx - dw / 2)}" y2="${Z(cz + dir * dw)}" stroke="#252a31" stroke-width="2.5"/>`
    } else {
      out += `<rect x="${(Number(X(cx)) - wall / 2 - 1).toFixed(1)}" y="${Z(cz - dw / 2)}" width="${(wall + 2).toFixed(1)}" height="${L(dw)}" fill="${hex(r.color)}"/>`
      const dir = d.x < 0 ? 1 : -1
      out += `<path d="M ${X(cx)} ${Z(cz - dw / 2)} A ${L(dw)} ${L(dw)} 0 0 ${dir > 0 ? 0 : 1} ${X(cx + dir * dw)} ${Z(cz + dw / 2)}" fill="none" stroke="#252a31" stroke-width="1.5" opacity=".7"/><line x1="${X(cx)}" y1="${Z(cz - dw / 2)}" x2="${X(cx + dir * dw)}" y2="${Z(cz - dw / 2)}" stroke="#252a31" stroke-width="2.5"/>`
    }
  }
  // labels
  for (const r of rooms) if (r.label)
    out += `<text x="${X(r.x)}" y="${Z(r.z - r.d / 2 + Math.min(1.1, r.d * 0.22))}" text-anchor="middle" font-size="${Math.max(14, 0.42 * S).toFixed(0)}" font-weight="600" letter-spacing="1.5" fill="#2b3138" font-family="Segoe UI, Inter, Arial, sans-serif">${esc(r.label.toUpperCase())}</text><text x="${X(r.x)}" y="${Z(r.z - r.d / 2 + Math.min(1.1, r.d * 0.22) + 0.55)}" text-anchor="middle" font-size="${Math.max(11, 0.28 * S).toFixed(0)}" fill="#6b7480" font-family="Segoe UI, Inter, Arial, sans-serif">${r.w.toFixed(1)} × ${r.d.toFixed(1)} m</text>`
  // scale bar + north
  out += `<g transform="translate(${pad},${1000 - pad + 8})"><rect x="0" y="0" width="${L(5)}" height="6" fill="#252a31"/><rect x="${L(2.5)}" y="0" width="${L(2.5)}" height="6" fill="#fff" stroke="#252a31"/><text x="0" y="26" font-size="13" fill="#2b3138" font-family="Segoe UI, Arial">0</text><text x="${L(5)}" y="26" text-anchor="middle" font-size="13" fill="#2b3138" font-family="Segoe UI, Arial">5 m</text></g>`
  out += `<g transform="translate(${1600 - pad - 10},${pad + 6})"><circle r="20" fill="none" stroke="#252a31" stroke-width="1.5"/><path d="M0,-16 L7,6 L0,1 L-7,6 Z" fill="#252a31"/><text y="36" text-anchor="middle" font-size="12" font-weight="600" fill="#2b3138" font-family="Segoe UI, Arial">N</text></g>`
  if (title) out += `<text x="${pad}" y="${pad - 14}" font-size="15" font-weight="600" letter-spacing="2" fill="#6b7480" font-family="Segoe UI, Arial">${esc(title.toUpperCase())}</text>`

  const body = `<svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg"><rect width="1600" height="1000" fill="#f4f3ef"/>
    <defs><pattern id="g" width="${S.toFixed(1)}" height="${S.toFixed(1)}" patternUnits="userSpaceOnUse" x="${ox.toFixed(1)}" y="${oz.toFixed(1)}"><path d="M ${S.toFixed(1)} 0 L 0 0 0 ${S.toFixed(1)}" fill="none" stroke="#e3e1db" stroke-width="1"/></pattern></defs>
    <rect width="1600" height="1000" fill="url(#g)"/>${out}</svg>`
  return doc({ body, style: "", bg: "#f4f3ef" })
}

export function anticheatRules() {
  const RULES = [
    ["Event validation", "Rejects client events the player could not have legitimately triggered", "strict", 30, true],
    ["Teleport delta", "Distance moved per tick versus the fastest vehicle available", "strict", 25, true],
    ["Resource hash", "Client resource files must match the server manifest", "on", 40, true],
    ["Injection blocking", "Unregistered client scripts are blocked and logged", "on", 45, true],
    ["Event rate", "Per-event flood threshold, tuned per resource", "medium", 12, true],
    ["Weapon damage", "Damage values validated against weapons.meta", "strict", 35, true],
    ["Speed hack", "Vehicle speed against handling.meta top speed", "medium", 20, false],
  ]
  const rows = RULES.map((r) => `<tr><td><b>${r[0]}</b><div class="sub">${r[1]}</div></td><td><span class="tag ${r[2] === "strict" ? "warn" : "info"}">${r[2]}</span></td><td class="mono">+${r[3]}</td><td><span class="sw${r[4] ? " on" : ""}"></span></td></tr>`).join("")
  const body = `
  <div class="app"><aside class="nav"><div class="brand">Anticheat</div>${["Live events", "Flagged players", "Bans", "Rules", "Audit log", "Settings"].map((n, i) => `<div class="ni${i === 3 ? " on" : ""}">${n}</div>`).join("")}</aside>
  <main><header><h1>Rules</h1><div class="stats"><div class="st"><span class="lbl">Auto-action threshold</span><b>80</b></div><div class="st"><span class="lbl">Score decay</span><b>120 s</b></div><div class="st"><span class="lbl">Mode</span><b>Enforcing</b></div></div></header>
  <div class="two"><table><thead><tr><th>Check</th><th>Sensitivity</th><th>Score</th><th>Enabled</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="panel"><div class="lbl">Staff bypass</div><p>Identifiers listed here are never scored. Add every admin before enabling auto-action.</p>
    <div class="ids mono">license:2f9a…c41e<br>license:8b03…77d2<br>discord:4410…0921</div>
    <div class="lbl" style="margin-top:20px">Auto-action</div><div class="kvr"><span>On score ≥ 80</span><b>Kick + log</b></div><div class="kvr"><span>On score ≥ 95</span><b>Temp ban 24 h</b></div><div class="kvr"><span>Notify staff</span><b>Discord webhook</b></div></div></div></main></div>`
  const style = `${BASE_STYLE}
  html,body{background:#0e1117}.app{display:grid;grid-template-columns:230px 1fr;height:100%;color:#e6e9ee}
  .nav{background:#12161d;border-right:1px solid rgba(255,255,255,.07);padding:22px 14px}.brand{font-weight:700;font-size:15px;padding:6px 10px 20px}
  .ni{padding:10px 12px;border-radius:7px;font-size:13.5px;color:#aeb5c0;margin-bottom:2px}.ni.on{background:rgba(74,155,232,.14);color:#dfe8f3}
  main{padding:26px 32px}header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px}h1{margin:0;font-size:22px}
  .stats{display:flex;gap:12px}.st{background:#12161d;border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:10px 16px;min-width:150px}.st b{display:block;font-size:22px;margin-top:2px}
  .two{display:grid;grid-template-columns:1fr 360px;gap:18px}table{background:#12161d;border:1px solid rgba(255,255,255,.07);border-radius:9px;overflow:hidden}
  .sub{font-size:12px;color:#8b93a1;margin-top:3px}.sw{display:inline-block;width:36px;height:20px;border-radius:10px;background:#2a3140;position:relative}.sw::after{content:"";position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#8b93a1}.sw.on{background:#3ec66d}.sw.on::after{left:19px;background:#fff}
  .panel{background:#12161d;border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:18px}.panel p{font-size:13px;color:#aeb5c0;line-height:1.5;margin:8px 0 12px}
  .ids{background:#0b0e14;border-radius:7px;padding:12px;font-size:12.5px;line-height:1.7;color:#c7cdd6}.kvr{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px}.kvr span{color:#8b93a1}`
  return doc({ body, style, bg: "#0e1117" })
}
