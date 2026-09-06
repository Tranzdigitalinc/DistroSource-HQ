/**
 * Minecraft-side interfaces and shared technical scenes.
 *
 *   chestGui           the in-game chest/menu GUI (enchanter, crates, shops,
 *                      quest log) with a hover tooltip
 *   mcOverlay          the in-game HUD: hotbar, sidebar scoreboard, boss bar,
 *                      chat — for lobbies, queues and match screens
 *   configEditor       a real config file in an editor with a file tree
 *   permissionsDashboard  rank ladder with inheritance and nodes
 *   violationsDashboard   anticheat tuning profiles per check
 *   audioLibrary       a sound library: categories, track list, waveform
 *                      player, spectrum — shared by every audio product
 *
 * Real HTML/CSS. No player counts, sales or ratings anywhere.
 */
import { doc, esc } from "../lib.mjs"

const T = `
  *{box-sizing:border-box}
  .bd{position:absolute;inset:0;filter:blur(7px) saturate(.9);transform:scale(1.04)}
  .dim{position:absolute;inset:0;background:rgba(6,9,14,.45)}
  .lbl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8b93a1;font-weight:600}
  .tag{display:inline-block;font-size:11px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.08);color:#c7cdd6;white-space:nowrap}
  .tag.ok{background:rgba(62,198,109,.16);color:#7fe0a3}.tag.warn{background:rgba(232,184,74,.16);color:#f2cf78}.tag.bad{background:rgba(232,85,74,.16);color:#f39c93}.tag.info{background:rgba(74,155,232,.16);color:#8fc3f5}
  .bar{height:6px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden}.bar i{display:block;height:100%;background:#4a9be8}
  table{border-collapse:collapse;width:100%}th{text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8b93a1;font-weight:600;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
  td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.05);font-size:13.5px;vertical-align:middle}
  .mc{font-family:Consolas,"Cascadia Mono",Menlo,monospace}
`

/** A blocky Minecraft-ish backdrop: sky, distant hills, grass ground. */
function mcBackdrop({ tone = "day" } = {}) {
  const sky = tone === "night" ? "linear-gradient(#0a1020 0%,#16223c 60%,#0b1018 100%)" : "linear-gradient(#78aee6 0%,#b9d6f0 52%,#5a9a3c 53%,#3f7a2b 100%)"
  return `<div class="bd" style="background:${sky}">${Array.from({ length: 14 }, (_, i) => `<i style="position:absolute;left:${i * 7.5}%;bottom:47%;width:8%;height:${6 + ((i * 5) % 4) * 4}%;background:${tone === "night" ? "#1b2a1e" : "#4f8a35"};border-radius:2px 2px 0 0"></i>`).join("")}${Array.from({ length: 6 }, (_, i) => `<i style="position:absolute;left:${8 + i * 16}%;bottom:47%;width:3%;height:${16 + (i % 3) * 5}%;background:${tone === "night" ? "#2a1e14" : "#6b4a2f"}"></i><i style="position:absolute;left:${5 + i * 16}%;bottom:${58 + (i % 3) * 5}%;width:9%;height:11%;background:${tone === "night" ? "#1e3a22" : "#2f7a2f"};border-radius:3px"></i>`).join("")}</div>`
}

/** Pixel icon: a 4x4 block of colours rendered with box-shadow, crisp. */
function pix(c1, c2 = c1) {
  return `<i class="px" style="background:${c1};box-shadow:8px 0 0 ${c2},0 8px 0 ${c2},8px 8px 0 ${c1},16px 0 0 ${c1},0 16px 0 ${c1},16px 16px 0 ${c2},16px 8px 0 ${c1},8px 16px 0 ${c1}"></i>`
}

/* ------------------------------------------------------------ chest GUI */

/**
 * items: array of { name, c1, c2, count, lore:[], glow } or null, laid out in
 * rows of 9. `tooltip` is the index of the hovered slot.
 */
export function chestGui({ title, items, rows = 3, tooltip = 1, sidebar = null, tone = "day" }) {
  const slot = (it, i) => `<div class="s${i === tooltip ? " hov" : ""}">${it ? `${pix(it.c1, it.c2)}${it.count > 1 ? `<b>${it.count}</b>` : ""}${it.glow ? `<em></em>` : ""}` : ""}</div>`
  const cells = Array.from({ length: rows * 9 }, (_, i) => slot(items[i] ?? null, i)).join("")
  const hovered = items[tooltip]
  const tip = hovered
    ? `<div class="tip"><b style="color:${hovered.glow ? "#55ffff" : "#ffffff"}">${esc(hovered.name)}</b>${(hovered.lore || []).map((l) => `<span style="color:${l.startsWith("§") ? "#ffaa00" : "#aaaaaa"}">${esc(l.replace(/^§/, ""))}</span>`).join("")}</div>`
    : ""
  const player = Array.from({ length: 27 }, (_, i) => `<div class="s">${i < 5 ? pix(["#8b8b8b", "#a8743f", "#5fa8d3", "#c9a35a", "#3ec66d"][i]) : ""}</div>`).join("")
  const hot = Array.from({ length: 9 }, (_, i) => `<div class="s">${i < 3 ? pix(["#b9bec6", "#6b4a2f", "#e8b84a"][i]) : ""}</div>`).join("")
  const body = `
  ${mcBackdrop({ tone })}<div class="dim"></div>
  <div class="gui">
    <div class="ttl">${esc(title)}</div><div class="grid">${cells}</div>
    <div class="ttl" style="margin-top:14px">Inventory</div><div class="grid">${player}</div><div class="grid" style="margin-top:12px">${hot}</div>
    ${tip}
  </div>
  ${sidebar ? scoreboard(sidebar) : ""}`
  const style = `${T}
  .gui{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:704px;background:#c6c6c6;border:4px solid;border-color:#fff #555 #555 #fff;padding:14px 18px 18px;box-shadow:0 30px 80px rgba(0,0,0,.6);image-rendering:pixelated}
  .ttl{font-family:Consolas,Menlo,monospace;font-size:19px;color:#3f3f3f;margin:4px 0 8px;text-shadow:1px 1px 0 #fff}
  .grid{display:grid;grid-template-columns:repeat(9,72px)}
  .s{width:72px;height:72px;background:#8b8b8b;border:3px solid;border-color:#373737 #fff #fff #373737;position:relative}.s.hov{background:#c5c5c5}
  .px{position:absolute;left:22px;top:22px;width:8px;height:8px;display:block}
  .s b{position:absolute;right:6px;bottom:2px;font-family:Consolas,Menlo,monospace;font-size:20px;color:#fff;text-shadow:2px 2px 0 #3f3f3f}
  .s em{position:absolute;inset:3px;box-shadow:inset 0 0 0 2px rgba(180,120,255,.6)}
  .tip{position:absolute;left:340px;top:150px;background:rgba(16,0,16,.94);border:2px solid #28007f;padding:10px 12px;font-family:Consolas,Menlo,monospace;font-size:16px;line-height:1.5;min-width:220px;box-shadow:0 10px 30px rgba(0,0,0,.5)}.tip b{display:block;font-weight:400}.tip span{display:block}
  ${SB_STYLE}`
  return doc({ body, style, bg: "#5a9a3c" })
}

/* ---------------------------------------------------------- HUD overlay */

const SB_STYLE = `
  .sb{position:absolute;right:0;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.35);padding:6px 4px 6px 8px;font-family:Consolas,"Cascadia Mono",Menlo,monospace;font-size:20px;color:#fff;text-shadow:2px 2px 0 #202020;min-width:260px}
  .sb h4{margin:0 0 4px;text-align:center;color:#ffff55;font-weight:400;font-size:20px}.sb div{display:flex;justify-content:space-between;gap:24px;line-height:1.35}.sb div i{font-style:normal;color:#ff5555}`

function scoreboard({ title, rows }) {
  return `<div class="sb"><h4>${esc(title)}</h4>${rows.map((r) => `<div><span>${esc(r[0])}</span><i>${esc(String(r[1] ?? ""))}</i></div>`).join("")}</div>`
}

export function mcOverlay({ tone = "day", scoreboard: sb, bossbar, chat = [], hotbarSel = 0, title = null, subtitle = null, actionbar = null }) {
  const hot = Array.from({ length: 9 }, (_, i) => `<div class="hs${i === hotbarSel ? " on" : ""}">${i < 4 ? pix(["#b9bec6", "#e8b84a", "#c9a35a", "#3ec66d"][i]) : ""}</div>`).join("")
  const body = `
  ${mcBackdrop({ tone })}
  ${bossbar ? `<div class="boss"><span>${esc(bossbar.label)}</span><div class="bb"><i style="width:${bossbar.fill}%"></i></div></div>` : ""}
  ${title ? `<div class="big"><b>${esc(title)}</b>${subtitle ? `<span>${esc(subtitle)}</span>` : ""}</div>` : ""}
  ${sb ? scoreboard(sb) : ""}
  <div class="chat">${chat.map((c) => `<div>${c}</div>`).join("")}</div>
  ${actionbar ? `<div class="ab">${esc(actionbar)}</div>` : ""}
  <div class="hud"><div class="hearts">${"❤".repeat(10)}</div><div class="hunger">${"🍗".repeat(10)}</div><div class="xp"><i style="width:38%"></i></div><div class="hot">${hot}</div></div>
  <div class="cross">+</div>`
  const style = `${T}
  .hud{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);width:740px;text-align:center}
  .hearts{color:#ff3b3b;font-size:18px;letter-spacing:2px;text-shadow:1px 1px 0 #3a0000;text-align:left;padding-left:8px}.hunger{color:#c9803a;font-size:14px;letter-spacing:4px;text-align:right;padding-right:8px;margin-top:-22px;filter:saturate(.8)}
  .xp{height:8px;background:#1a1a1a;border:2px solid #000;margin:6px 8px}.xp i{display:block;height:100%;background:#7fff3a}
  .hot{display:grid;grid-template-columns:repeat(9,80px);border:3px solid #1e1e1e;background:rgba(0,0,0,.55);width:fit-content;margin:0 auto}.hs{width:80px;height:80px;border:2px solid #8b8b8b;position:relative;image-rendering:pixelated}.hs.on{border:4px solid #fff;margin:-2px}
  .px{position:absolute;left:26px;top:26px;width:8px;height:8px;display:block}
  .cross{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#fff;font-size:26px;mix-blend-mode:difference}
  .boss{position:absolute;left:50%;top:26px;transform:translateX(-50%);width:600px;text-align:center;font-family:Consolas,Menlo,monospace;color:#fff;font-size:18px;text-shadow:2px 2px 0 #202020}.bb{height:12px;background:#3a0f6b;border:2px solid #1a0533;margin-top:4px}.bb i{display:block;height:100%;background:#b45cff}
  .big{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);text-align:center;font-family:Consolas,Menlo,monospace;color:#fff;text-shadow:3px 3px 0 #202020}.big b{display:block;font-size:64px;font-weight:400;color:#ffaa00}.big span{display:block;font-size:26px;margin-top:8px}
  .chat{position:absolute;left:16px;bottom:130px;width:640px;font-family:Consolas,Menlo,monospace;font-size:18px;color:#fff;text-shadow:2px 2px 0 #202020}.chat div{background:rgba(0,0,0,.45);padding:2px 6px;margin-top:2px;width:fit-content}
  .ab{position:absolute;left:50%;bottom:132px;transform:translateX(-50%);font-family:Consolas,Menlo,monospace;font-size:20px;color:#ffff55;text-shadow:2px 2px 0 #202020}
  ${SB_STYLE}`
  return doc({ body, style, bg: "#5a9a3c" })
}

/* --------------------------------------------------------- config editor */

/** Lines are [text, kind] where kind ∈ key|val|str|num|cmt|sec|bool. */
export function configEditor({ filename, tree, lines, activeLine = -1, title = "" }) {
  const colour = { key: "#8fc3f5", val: "#e6e9ee", str: "#c8e39f", num: "#f2cf78", cmt: "#6c7480", sec: "#d19cf2", bool: "#f39c93" }
  const render = (segs) => segs.map((s) => `<span style="color:${colour[s[1]] || "#e6e9ee"}">${esc(s[0])}</span>`).join("")
  const code = lines.map((ln, i) => `<div class="ln${i === activeLine ? " on" : ""}"><span class="n">${i + 1}</span><span class="c">${render(ln)}</span></div>`).join("")
  const body = `
  <div class="ed">
    <aside><div class="lbl" style="padding:14px 16px 8px">Explorer</div>${tree.map((t) => `<div class="tf${t[2] ? " on" : ""}" style="padding-left:${16 + t[1] * 14}px">${t[3] ? "▸ " : ""}${esc(t[0])}</div>`).join("")}</aside>
    <main><div class="tabs"><span class="on">${esc(filename)}</span>${title ? `<span class="meta">${esc(title)}</span>` : ""}</div><div class="code mc">${code}</div>
    <div class="status"><span>YAML</span><span>UTF-8</span><span>Ln ${activeLine + 1 || 1}</span><span>${lines.length} lines</span></div></main>
  </div>`
  const style = `${T}
  html,body{background:#0f131a}.ed{display:grid;grid-template-columns:260px 1fr;height:100%;color:#e6e9ee}
  aside{background:#12161d;border-right:1px solid rgba(255,255,255,.07)}.tf{padding:6px 16px;font-size:13px;color:#aeb5c0}.tf.on{background:rgba(74,155,232,.14);color:#dfe8f3}
  main{display:flex;flex-direction:column}.tabs{display:flex;align-items:center;gap:0;background:#12161d;border-bottom:1px solid rgba(255,255,255,.07)}.tabs span{padding:12px 18px;font-size:13px;color:#8b93a1}.tabs span.on{background:#0f131a;color:#e6e9ee;border-top:2px solid #4a9be8}.tabs .meta{margin-left:auto}
  .code{flex:1;padding:16px 0;font-size:15.5px;line-height:1.7;overflow:hidden}.ln{display:flex}.ln.on{background:rgba(74,155,232,.1)}.n{width:64px;text-align:right;padding-right:22px;color:#5b6473;user-select:none}.c{white-space:pre}
  .status{display:flex;gap:22px;padding:6px 18px;background:#12161d;border-top:1px solid rgba(255,255,255,.07);font-size:12px;color:#8b93a1}`
  return doc({ body, style, bg: "#0f131a" })
}

/* ---------------------------------------------------- permissions ranks */

export function permissionsDashboard({ title = "Ranks & permissions" } = {}) {
  const RANKS = [["default", "Default", "#8b93a1", ["essentials.home", "essentials.warp", "essentials.tpa", "chat.color"]], ["member", "Member", "#3ec66d", ["inherits default", "essentials.sethome.2", "essentials.kit.member", "shops.create"]], ["trusted", "Trusted", "#4a9be8", ["inherits member", "essentials.sethome.4", "essentials.fly", "shops.create.5"]], ["staff", "Staff", "#e8b84a", ["inherits trusted", "essentials.kick", "essentials.mute", "essentials.vanish", "essentials.tp"]]]
  const body = `
  <div class="pg"><header><h1>${esc(title)}</h1><div class="chips"><span class="tag info">4 ranks</span><span class="tag">Inheritance on</span><span class="tag ok">Config valid</span></div></header>
  <div class="ladder">${RANKS.map((r, i) => `<div class="rk" style="border-top-color:${r[2]}"><div class="rh"><b style="color:${r[2]}">${r[1]}</b><span class="mc">${r[0]}</span></div>${i > 0 ? `<div class="inh">↑ inherits <b>${RANKS[i - 1][1]}</b></div>` : ""}<div class="nodes">${r[3].filter((n) => !n.startsWith("inherits")).map((n) => `<span class="mc">${n}</span>`).join("")}</div><div class="foot"><span>Home limit</span><b>${[1, 2, 4, 8][i]}</b><span>Warps</span><b>${["public", "public", "all", "all"][i]}</b></div></div>`).join("")}</div>
  <div class="note">Adding a rank inserts one entry here — no rank below it needs editing.</div></div>`
  const style = `${T}
  html,body{background:#0f131a}.pg{padding:44px 56px;color:#e6e9ee}header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:26px}h1{margin:0;font-size:24px}.chips{display:flex;gap:8px}
  .ladder{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.rk{background:#171c25;border:1px solid rgba(255,255,255,.07);border-top:4px solid;border-radius:10px;padding:18px;min-height:420px;display:flex;flex-direction:column}
  .rh{display:flex;justify-content:space-between;align-items:baseline}.rh b{font-size:20px}.rh span{color:#8b93a1;font-size:12px}.inh{font-size:12px;color:#8b93a1;margin:10px 0 4px}
  .nodes{display:flex;flex-direction:column;gap:6px;margin-top:12px}.nodes span{background:#0f131a;border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:7px 10px;font-size:13px}
  .foot{margin-top:auto;display:grid;grid-template-columns:auto 1fr;gap:6px 12px;padding-top:14px;border-top:1px solid rgba(255,255,255,.07);font-size:12.5px}.foot span{color:#8b93a1}
  .note{margin-top:22px;color:#8b93a1;font-size:13px}`
  return doc({ body, style, bg: "#0f131a" })
}

/* ------------------------------------------------- anticheat profiles */

export function violationsDashboard({ profile = "survival" } = {}) {
  const P = { survival: [68, 82, 60, 88, 45], pvp: [74, 90, 78, 92, 55], minigame: [34, 70, 62, 60, 50] }[profile]
  const CHECKS = ["Movement", "Combat reach", "Autoclicker", "Flight", "Packet rate"]
  const body = `
  <div class="pg"><header><h1>Anticheat tuning</h1><div class="prof">${["survival", "pvp", "minigame"].map((p) => `<span class="${p === profile ? "on" : ""}">${p === "pvp" ? "PvP" : p[0].toUpperCase() + p.slice(1)}</span>`).join("")}</div></header>
  <div class="two"><div class="card"><table><thead><tr><th>Check</th><th style="width:260px">Sensitivity</th><th>Level</th><th>VL decay</th><th>Notes</th></tr></thead><tbody>${CHECKS.map((c, i) => `<tr><td><b>${c}</b></td><td><div class="bar"><i style="width:${P[i]}%;background:${P[i] >= 80 ? "#e8554a" : P[i] >= 60 ? "#e8b84a" : "#4a9be8"}"></i></div></td><td><span class="tag ${P[i] >= 80 ? "warn" : "info"}">${P[i] >= 80 ? "Strict" : P[i] >= 60 ? "Medium" : "Lenient"}</span></td><td class="mc">120 s</td><td class="nt">${["Trips on ice and boats — lenient in minigames", "Ping-compensated above 150 ms", "Legit players peak ~14 cps", "Elytra and creative excluded", "High-latency regions flag falsely if strict"][i]}</td></tr>`).join("")}</tbody></table></div>
  <div class="panel"><div class="lbl">Rollout</div><div class="step on">1 · Notify-only for 7 days</div><div class="step">2 · Read flagged list</div><div class="step">3 · Tighten one check at a time</div><div class="step">4 · Enable actions</div>
  <div class="lbl" style="margin-top:18px">Staff bypass</div><div class="mc ids">staff.bypass · 3 accounts</div><div class="lbl" style="margin-top:18px">Actions</div><div class="kv"><span>VL ≥ 20</span><b>Notify staff</b></div><div class="kv"><span>VL ≥ 40</span><b>Kick</b></div><div class="kv"><span>VL ≥ 80</span><b>Temp ban 24 h</b></div></div></div></div>`
  const style = `${T}
  html,body{background:#0f131a}.pg{padding:40px 52px;color:#e6e9ee}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}h1{margin:0;font-size:24px}
  .prof{display:flex;background:#171c25;border-radius:8px;padding:4px}.prof span{padding:8px 16px;border-radius:6px;font-size:13px;color:#8b93a1}.prof span.on{background:rgba(74,155,232,.18);color:#dfe8f3}
  .two{display:grid;grid-template-columns:1fr 340px;gap:18px}.card{background:#171c25;border:1px solid rgba(255,255,255,.07);border-radius:9px;overflow:hidden}.nt{color:#8b93a1;font-size:12.5px}
  .panel{background:#171c25;border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:18px}.step{padding:9px 12px;border-radius:6px;font-size:13px;color:#8b93a1;margin-top:6px;background:#0f131a}.step.on{color:#dfe8f3;border-left:3px solid #4a9be8}
  .ids{background:#0f131a;border-radius:6px;padding:10px;font-size:12.5px;margin-top:6px}.kv{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px}.kv span{color:#8b93a1}`
  return doc({ body, style, bg: "#0f131a" })
}

/* --------------------------------------------------------- audio library */

/**
 * tracks: [name, duration, category]. Waveform is deterministic from the
 * track index so re-renders are byte-identical.
 */
export function audioLibrary({ title, categories, tracks, selected = 0, accent = "#4a9be8", playing = true }) {
  const wave = (seed, n = 140, h = 90) => Array.from({ length: n }, (_, i) => { const env = Math.sin((i / n) * Math.PI); const d = 0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + seed) * Math.cos(i * 0.61 + seed * 0.3)); return Math.max(3, env * d * h) })
  const W = wave(selected * 7 + 3)
  const bars = W.map((v, i) => `<i style="height:${v.toFixed(0)}px;background:${i < 52 ? accent : "rgba(255,255,255,.35)"}"></i>`).join("")
  const spec = Array.from({ length: 32 }, (_, i) => `<i style="height:${(20 + Math.abs(Math.sin(i * 0.9 + selected)) * 70).toFixed(0)}%"></i>`).join("")
  const sel = tracks[selected]
  const body = `
  <div class="al">
    <aside><div class="brand">${esc(title)}</div><div class="lbl" style="padding:8px 12px">Categories</div>${categories.map((c, i) => `<div class="ci${i === 0 ? " on" : ""}"><span>${esc(c[0])}</span><small>${c[1]}</small></div>`).join("")}</aside>
    <main>
      <div class="player"><div class="meta"><span class="lbl">${esc(sel[2])}</span><h1>${esc(sel[0])}</h1><small>${esc(sel[1])} · 48 kHz · 24-bit · stereo</small></div>
        <div class="wave">${bars}</div>
        <div class="ctl"><span class="b">⏮</span><span class="b p">${playing ? "❚❚" : "▶"}</span><span class="b">⏭</span><span class="t mc">0:${String(Math.round(parseInt(sel[1]) * 0.37)).padStart(2, "0")} / ${esc(sel[1])}</span><div class="spec">${spec}</div><span class="vol">🔊 80%</span></div></div>
      <div class="list"><table><thead><tr><th>#</th><th>Track</th><th>Category</th><th>Length</th><th>Variations</th></tr></thead><tbody>${tracks.map((t, i) => `<tr class="${i === selected ? "on" : ""}"><td class="mc">${String(i + 1).padStart(2, "0")}</td><td><b>${esc(t[0])}</b></td><td><span class="tag">${esc(t[2])}</span></td><td class="mc">${esc(t[1])}</td><td>${t[3] ?? "—"}</td></tr>`).join("")}</tbody></table></div>
    </main>
  </div>`
  const style = `${T}
  html,body{background:#0f131a}.al{display:grid;grid-template-columns:250px 1fr;height:100%;color:#e6e9ee}
  aside{background:#12161d;border-right:1px solid rgba(255,255,255,.07);padding:18px 12px}.brand{font-weight:700;font-size:15px;padding:6px 12px 16px}.ci{display:flex;justify-content:space-between;padding:10px 12px;border-radius:7px;font-size:13.5px;color:#aeb5c0;margin-bottom:2px}.ci.on{background:rgba(74,155,232,.14);color:#dfe8f3}.ci small{color:#6c7480}
  main{padding:28px 32px;display:flex;flex-direction:column;gap:20px;overflow:hidden}
  .player{background:#171c25;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:22px 26px}.meta h1{margin:4px 0 2px;font-size:24px}.meta small{color:#8b93a1;font-size:12.5px}
  .wave{display:flex;align-items:center;gap:3px;height:110px;margin:20px 0 14px}.wave i{flex:1;border-radius:2px;display:block}
  .ctl{display:flex;align-items:center;gap:14px}.b{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:14px}.b.p{background:${accent};color:#fff;width:48px;height:48px;font-size:16px}.t{color:#8b93a1;font-size:13px}.spec{margin-left:auto;display:flex;align-items:flex-end;gap:3px;height:36px;width:200px}.spec i{flex:1;background:${accent};opacity:.7;border-radius:1px;display:block}.vol{color:#8b93a1;font-size:13px}
  .list{background:#171c25;border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden}tr.on td{background:rgba(74,155,232,.1)}`
  return doc({ body, style, bg: "#0f131a" })
}
