/**
 * FiveM interface scenes — HUD, phone, emergency MDT/dispatch, and the
 * player-facing screens of the garage, business and banking systems, plus
 * loading screens. Real HTML/CSS, screenshotted. Every value is a plausible
 * sample; every label is readable; nothing depicts popularity or sales.
 */
import { doc, esc } from "../lib.mjs"

/* ------------------------------------------------------------- shared */

const T = `
  *{box-sizing:border-box}
  .bd{position:absolute;inset:0;filter:blur(7px) saturate(.85);transform:scale(1.04)}
  .bd-blocks i{position:absolute;bottom:34%;display:block;border-radius:2px 2px 0 0;opacity:.9}
  .bd-road{position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(#5a5f66,#3a3e44)}
  .dim{position:absolute;inset:0;background:rgba(6,9,14,.48)}
  .lbl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8b93a1;font-weight:600}
  .tag{display:inline-block;font-size:11px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.08);color:#c7cdd6;white-space:nowrap}
  .tag.ok{background:rgba(62,198,109,.16);color:#7fe0a3}.tag.warn{background:rgba(232,184,74,.16);color:#f2cf78}.tag.bad{background:rgba(232,85,74,.16);color:#f39c93}.tag.info{background:rgba(74,155,232,.16);color:#8fc3f5}
  .bar{height:6px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden}.bar i{display:block;height:100%;background:#4a9be8}
  table{border-collapse:collapse;width:100%}th{text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8b93a1;font-weight:600;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
  td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.05);font-size:13.5px;vertical-align:middle}
  .kbd{display:inline-block;padding:2px 7px;border:1px solid rgba(255,255,255,.18);border-bottom-width:2px;border-radius:5px;font-size:11px;color:#c7cdd6;background:#0e1219;margin:0 4px}
  .btn{display:inline-block;padding:9px 16px;border-radius:7px;font-size:13px;font-weight:600;background:rgba(255,255,255,.08);color:#e6e9ee}.btn.p{background:#4a9be8;color:#fff}.btn.d{background:rgba(232,85,74,.2);color:#f39c93}
`

function backdrop(tone = "day", road = true) {
  const sky = tone === "night" ? "linear-gradient(#0d1524 0%,#1a2740 55%,#0b0f18 100%)" : tone === "dusk" ? "linear-gradient(#3a3f6b 0%,#c97a52 50%,#5a4a3f 51%,#3f3a34 100%)" : "linear-gradient(#8fb6dc 0%,#c9dcea 48%,#6f7a66 49%,#4f5a49 100%)"
  const b = tone === "night" ? "#151c2a" : "#8d9aa8"
  return `<div class="bd" style="background:${sky}"><div class="bd-blocks">${Array.from({ length: 9 }, (_, i) => `<i style="left:${4 + i * 11}%;height:${18 + ((i * 7) % 5) * 7}%;width:${5 + (i % 3) * 2}%;background:${b}"></i>`).join("")}</div>${road ? `<div class="bd-road"></div>` : ""}</div>`
}

/** App shell: sidebar + header + content, used by the system screens. */
function app({ brand, nav, active, title, stats = [], content, width = 1220 }) {
  return `
  ${backdrop("day")}<div class="dim"></div>
  <div class="shell" style="width:${width}px">
    <aside><div class="brand">${esc(brand)}</div>${nav.map((n, i) => `<div class="ni${i === active ? " on" : ""}">${esc(n)}</div>`).join("")}<div class="foot">Press <span class="kbd">Esc</span> to close</div></aside>
    <main><header><h1>${esc(title)}</h1>${stats.length ? `<div class="stats">${stats.map((s) => `<div class="st"><span class="lbl">${esc(s[0])}</span><b>${esc(s[1])}</b></div>`).join("")}</div>` : ""}</header>${content}</main>
  </div>`
}
const APP_STYLE = `${T}
  .shell{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:820px;display:grid;grid-template-columns:220px 1fr;background:#12161d;border:1px solid rgba(255,255,255,.09);border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,.6);color:#e6e9ee;overflow:hidden}
  aside{background:#0f131a;border-right:1px solid rgba(255,255,255,.07);padding:22px 14px;display:flex;flex-direction:column}.brand{font-weight:700;font-size:15px;padding:6px 10px 20px}
  .ni{padding:10px 12px;border-radius:7px;font-size:13.5px;color:#aeb5c0;margin-bottom:2px}.ni.on{background:rgba(74,155,232,.14);color:#dfe8f3}.foot{margin-top:auto;font-size:12px;color:#8b93a1;padding:10px}
  main{padding:26px 30px;overflow:hidden}header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px}h1{margin:0;font-size:22px}
  .stats{display:flex;gap:12px}.st{background:#171c25;border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:10px 16px;min-width:130px}.st b{display:block;font-size:20px;margin-top:2px;font-variant-numeric:tabular-nums}
  .card{background:#171c25;border:1px solid rgba(255,255,255,.07);border-radius:9px;overflow:hidden}.two{display:grid;grid-template-columns:1fr 340px;gap:18px}.panel{background:#171c25;border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:18px}
  .kv{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px}.kv span{color:#8b93a1}.kv b{font-variant-numeric:tabular-nums}
  .row{display:flex;gap:10px;align-items:center}.field{background:#0f131a;border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:10px 12px;font-size:13px;color:#e6e9ee;margin:6px 0 12px}.field.ph{color:#6c7480}
`

/* ---------------------------------------------------------------- HUD */

export function vehicleHud({ view = "driving", units = "mph" } = {}) {
  const speed = units === "mph" ? "86" : "138"
  const cluster = `
  <div class="cl">
    <div class="gauge"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="9"/><circle cx="60" cy="60" r="50" fill="none" stroke="#e8b84a" stroke-width="9" stroke-linecap="round" stroke-dasharray="314" stroke-dashoffset="112" transform="rotate(135 60 60)"/></svg><div class="v"><b>${speed}</b><span>${units.toUpperCase()}</span></div><div class="gear">D</div></div>
    <div class="stack">
      <div class="st"><span class="lbl">Fuel</span><div class="bar"><i style="width:62%;background:#e8b84a"></i></div><small>62%</small></div>
      <div class="st"><span class="lbl">Engine</span><div class="bar"><i style="width:88%;background:#3ec66d"></i></div><small>88%</small></div>
      <div class="st"><span class="lbl">Body</span><div class="bar"><i style="width:74%;background:#4a9be8"></i></div><small>74%</small></div>
    </div>
    <div class="chips"><span class="chip on">◀</span><span class="chip warn">Seatbelt</span><span class="chip">▶</span><span class="chip">Cruise</span><span class="chip">Lights</span></div>
  </div>`
  const status = `<div class="status"><div class="s"><span class="lbl">Health</span><div class="bar"><i style="width:86%;background:#3ec66d"></i></div></div><div class="s"><span class="lbl">Armor</span><div class="bar"><i style="width:40%;background:#4a9be8"></i></div></div><div class="s"><span class="lbl">Hunger</span><div class="bar"><i style="width:58%;background:#e8b84a"></i></div></div></div>`
  const money = `<div class="money"><div><span class="lbl">Cash</span><b>$4,250</b></div><div><span class="lbl">Bank</span><b>$18,930</b></div><div><span class="lbl">Job</span><b>Mechanic · Grade 2</b></div></div>`
  let body, extra = ""
  if (view === "config") {
    extra = `<div class="cfg"><h2>HUD settings</h2>
      ${[["Cluster scale", "1.0×", 55], ["Cluster position X", "0.82", 82], ["Cluster position Y", "0.90", 90], ["Opacity", "75%", 75]].map((r) => `<div class="cr"><span>${r[0]}</span><div class="bar"><i style="width:${r[2]}%"></i></div><b>${r[1]}</b></div>`).join("")}
      <div class="tog"><span>Units</span><b>MPH <em>/ KM/H</em></b></div><div class="tog"><span>Show gear indicator</span><b class="on">On</b></div><div class="tog"><span>Show seatbelt warning</span><b class="on">On</b></div><div class="tog"><span>Show engine health</span><b class="on">On</b></div><div class="tog"><span>Hide on foot</span><b class="on">On</b></div><div class="tog"><span>Hide in cutscenes</span><b class="on">On</b></div>
      <div class="hint">Drag any element to reposition · <span class="kbd">R</span> reset</div></div>`
    body = `${backdrop("day")}<div class="dim" style="background:rgba(6,9,14,.3)"></div>${cluster}${status}${money}${extra}`
  } else if (view === "onfoot") {
    body = `${backdrop("dusk")}${status}${money}<div class="note">Vehicle cluster hidden on foot</div>`
  } else {
    body = `${backdrop(view === "night" ? "night" : "day")}<div class="dash"></div>${cluster}${status}${money}`
  }
  const style = `${T}
  .dash{position:absolute;left:0;right:0;bottom:0;height:230px;background:linear-gradient(transparent,rgba(12,14,18,.55) 30%,#0f1216 70%);clip-path:polygon(0 100%,0 40%,18% 25%,82% 25%,100% 40%,100% 100%)}
  .cl{position:absolute;right:52px;bottom:56px;display:flex;align-items:flex-end;gap:16px;color:#fff}
  .gauge{position:relative;width:170px;height:170px}.gauge svg{width:170px;height:170px}.gauge .v{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.gauge b{font-size:44px;font-weight:700;line-height:1}.gauge span{font-size:11px;letter-spacing:.14em;opacity:.7;margin-top:4px}.gear{position:absolute;right:6px;bottom:8px;width:34px;height:34px;border-radius:8px;background:rgba(8,10,14,.75);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px}
  .stack{display:flex;flex-direction:column;gap:8px;width:170px;background:rgba(8,10,14,.62);border-radius:10px;padding:12px}.stack .st{display:grid;grid-template-columns:52px 1fr 34px;align-items:center;gap:8px}.stack small{font-size:11px;text-align:right;font-variant-numeric:tabular-nums}
  .chips{position:absolute;right:0;top:-40px;display:flex;gap:6px}.chip{background:rgba(8,10,14,.7);border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:5px 10px;font-size:11px;letter-spacing:.06em}.chip.on{border-color:#3ec66d;color:#7fe0a3}.chip.warn{background:rgba(232,85,74,.75);border-color:#ff8a80;color:#fff}
  .status{position:absolute;left:52px;bottom:56px;display:flex;gap:10px}.status .s{width:150px;background:rgba(8,10,14,.62);border-radius:8px;padding:10px 12px;color:#fff}.status .bar{margin-top:6px}
  .money{position:absolute;right:52px;top:44px;display:flex;flex-direction:column;align-items:flex-end;gap:6px;color:#fff;text-align:right}.money b{display:block;font-size:20px;font-variant-numeric:tabular-nums}.money div{background:rgba(8,10,14,.55);padding:8px 14px;border-radius:8px;min-width:160px}
  .note{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(8,10,14,.6);color:#c7cdd6;padding:10px 18px;border-radius:8px;font-size:13px;letter-spacing:.04em}
  .cfg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:520px;background:#12161d;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:24px 26px;color:#e6e9ee;box-shadow:0 30px 80px rgba(0,0,0,.6)}.cfg h2{margin:0 0 16px;font-size:18px}
  .cr{display:grid;grid-template-columns:150px 1fr 50px;align-items:center;gap:12px;padding:8px 0;font-size:13px}.cr b{text-align:right;font-variant-numeric:tabular-nums}.tog{display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid rgba(255,255,255,.06);font-size:13px}.tog b.on{color:#7fe0a3}.tog em{font-style:normal;color:#6c7480}.hint{margin-top:14px;font-size:12px;color:#8b93a1}`
  return doc({ body, style, bg: "#3b4a5c" })
}

/* -------------------------------------------------------------- phone */

const APPS = [["Phone", "#3ec66d"], ["Messages", "#4a9be8"], ["Contacts", "#8b93a1"], ["Bank", "#2ea36b"], ["Camera", "#5b6473"], ["Gallery", "#c266d6"], ["Social", "#e8554a"], ["Settings", "#6c7480"], ["Store", "#e8b84a"], ["Garage", "#3d7ea6"], ["Mail", "#d68a3b"], ["Notes", "#e3d15a"]]
const CONTACTS = ["Dana Whitfield", "Marcus Bell", "Priya Raman", "City Garage", "Tom Ferreira", "Dispatch"]

export function phone({ app = "home", theme = "dark" } = {}) {
  const dark = theme === "dark"
  const bg = dark ? "#0f131a" : "#f2f3f5", fg = dark ? "#e6e9ee" : "#1b1f26", sub = dark ? "#8b93a1" : "#6b7480", card = dark ? "#171c25" : "#ffffff"
  let screen
  if (app === "messages") {
    screen = `<div class="hd"><b>Messages</b><span>Edit</span></div>${[["Dana Whitfield", "On my way to the garage now", "14:02", true], ["City Garage", "Your vehicle is ready for pickup.", "13:40", false], ["Marcus Bell", "Can you cover the evening shift?", "12:15", false], ["Dispatch", "Unit 104 assigned to 10-31 on Elm St", "11:58", false], ["Priya Raman", "Thanks again!", "Yesterday", false]].map((m) => `<div class="msg"><i style="background:${dark ? "#2a3140" : "#dfe3ea"}"></i><div><b>${m[0]}</b><p>${m[1]}</p></div><small>${m[2]}${m[3] ? `<em></em>` : ""}</small></div>`).join("")}`
  } else if (app === "bank") {
    screen = `<div class="hd"><b>Bank</b><span>⋯</span></div><div class="bal"><span class="lbl">Personal account</span><b>$18,930.40</b><small>•••• 4471</small></div><div class="acts"><span>Transfer</span><span>Deposit</span><span>Withdraw</span></div><div class="lbl" style="padding:0 16px 6px">Recent</div>${[["Payroll · Mechanic", "+$1,240.00", true], ["City Garage · Repair", "-$850.00", false], ["Transfer to D. Whitfield", "-$300.00", false], ["Fuel · 24/7", "-$62.50", false]].map((t) => `<div class="tx"><span>${t[0]}</span><b style="color:${t[2] ? "#3ec66d" : fg}">${t[1]}</b></div>`).join("")}`
  } else if (app === "contacts") {
    screen = `<div class="hd"><b>Contacts</b><span>+</span></div>${CONTACTS.map((c) => `<div class="msg"><i style="background:${dark ? "#2a3140" : "#dfe3ea"}"></i><div><b>${c}</b><p>Mobile</p></div></div>`).join("")}`
  } else {
    screen = `<div class="grid">${APPS.map((a) => `<div class="app"><i style="background:${a[1]}"></i><span>${a[0]}</span></div>`).join("")}</div><div class="dock">${APPS.slice(0, 4).map((a) => `<i style="background:${a[1]}"></i>`).join("")}</div>`
  }
  const body = `
  ${backdrop("dusk")}<div class="dim" style="background:rgba(6,9,14,.35)"></div>
  <div class="ph"><div class="scr" style="background:${bg};color:${fg}">
    <div class="sb"><span>14:07</span><span>▲▲▲ 87%</span></div>
    ${app === "home" ? `<div class="notif"><b>Dispatch</b><p>Unit 104 assigned to 10-31 on Elm St</p></div>` : ""}
    ${screen}
    <div class="home"></div>
  </div></div>`
  const style = `${T}
  .ph{position:absolute;right:120px;top:50%;transform:translateY(-50%);width:420px;height:860px;background:#05080d;border-radius:46px;padding:14px;box-shadow:0 40px 90px rgba(0,0,0,.65),0 0 0 2px rgba(255,255,255,.12)}
  .scr{width:100%;height:100%;border-radius:34px;overflow:hidden;position:relative;font-size:14px}
  .sb{display:flex;justify-content:space-between;padding:18px 26px 8px;font-size:12px;font-weight:600;opacity:.8}
  .notif{margin:10px 16px 16px;background:${card};border-radius:14px;padding:12px 14px;border-left:4px solid #e8554a}.notif b{display:block;font-size:12px;color:${sub};letter-spacing:.06em;text-transform:uppercase}.notif p{margin:4px 0 0;font-size:13.5px}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px 10px;padding:14px 22px}.app{text-align:center}.app i{display:block;width:62px;height:62px;border-radius:16px;margin:0 auto 6px;box-shadow:inset 0 -8px 14px rgba(0,0,0,.3),inset 0 4px 8px rgba(255,255,255,.2)}.app span{font-size:11.5px;color:${sub}}
  .dock{position:absolute;left:18px;right:18px;bottom:36px;display:flex;justify-content:space-around;background:${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)"};border-radius:24px;padding:12px}.dock i{width:56px;height:56px;border-radius:14px;display:block}
  .home{position:absolute;left:50%;bottom:10px;width:120px;height:5px;margin-left:-60px;border-radius:3px;background:${dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.3)"}}
  .hd{display:flex;justify-content:space-between;align-items:center;padding:8px 20px 14px;font-size:22px}.hd b{font-weight:700}.hd span{font-size:14px;color:#4a9be8}
  .msg{display:flex;gap:12px;align-items:center;padding:12px 20px;border-bottom:1px solid ${dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}}.msg i{width:46px;height:46px;border-radius:50%;flex:none}.msg div{flex:1;min-width:0}.msg b{display:block;font-size:14px}.msg p{margin:2px 0 0;font-size:13px;color:${sub};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.msg small{font-size:11px;color:${sub};position:relative}.msg em{position:absolute;right:0;top:18px;width:8px;height:8px;border-radius:50%;background:#4a9be8}
  .bal{margin:6px 16px 14px;background:#2ea36b;color:#fff;border-radius:16px;padding:18px}.bal .lbl{color:rgba(255,255,255,.75)}.bal b{display:block;font-size:30px;margin:6px 0 2px;font-variant-numeric:tabular-nums}.bal small{opacity:.8}
  .acts{display:flex;gap:8px;padding:0 16px 16px}.acts span{flex:1;text-align:center;background:${card};padding:10px;border-radius:10px;font-size:12.5px;font-weight:600}
  .tx{display:flex;justify-content:space-between;padding:12px 20px;border-top:1px solid ${dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"};font-size:13.5px}.tx b{font-variant-numeric:tabular-nums}`
  return doc({ body, style, bg: "#3f3a34" })
}

/* ------------------------------------------------------ emergency UI */

const PEOPLE = [["Dana Whitfield", "1991-04-12", "DL · Valid", "Clear"], ["Marcus Bell", "1987-09-30", "DL · Suspended", "Warrant"], ["Priya Raman", "1995-01-08", "DL · Valid", "Clear"], ["Tom Ferreira", "1983-11-21", "DL · Valid", "Flagged"], ["Elena Byrne", "1998-06-03", "DL · Valid", "Clear"]]
const UNITS = [["104", "Patrol", "J. Moreno / K. Adebayo", "On scene", "warn"], ["215", "Patrol", "L. Fischer", "Available", "ok"], ["A-12", "EMS", "R. Okafor / S. Lindqvist", "En route", "info"], ["E-3", "Fire", "Engine crew", "Available", "ok"], ["107", "Patrol", "T. Nakamura", "Busy", "bad"], ["A-07", "EMS", "M. Haddad", "Available", "ok"]]

export function mdt({ tab = "persons" } = {}) {
  const content = tab === "vehicles"
    ? `<div class="field">Search plate or owner…</div><div class="card"><table><thead><tr><th>Plate</th><th>Model</th><th>Owner</th><th>Insurance</th><th>Flags</th></tr></thead><tbody>${[["4KL 921", "Sedan", "Dana Whitfield", "Valid", "ok"], ["BRX 204", "SUV", "Marcus Bell", "Expired", "bad"], ["7TR 118", "Coupe", "Priya Raman", "Valid", "ok"], ["MNT 552", "Van", "City Garage", "Valid", "info"]].map((v) => `<tr><td class="mono"><b>${v[0]}</b></td><td>${v[1]}</td><td>${v[2]}</td><td><span class="tag ${v[4]}">${v[3]}</span></td><td>${v[4] === "bad" ? `<span class="tag warn">Stolen report</span>` : "—"}</td></tr>`).join("")}</tbody></table></div>`
    : `<div class="field">Search name, DOB or licence…</div><div class="two"><div class="card"><table><thead><tr><th>Name</th><th>DOB</th><th>Licence</th><th>Status</th></tr></thead><tbody>${PEOPLE.map((p) => `<tr${p[0] === "Marcus Bell" ? ' style="background:rgba(74,155,232,.08)"' : ""}><td><b>${p[0]}</b></td><td class="mono">${p[1]}</td><td>${p[2]}</td><td><span class="tag ${p[3] === "Clear" ? "ok" : p[3] === "Warrant" ? "bad" : "warn"}">${p[3]}</span></td></tr>`).join("")}</tbody></table></div>
      <div class="panel"><div class="lbl">Record</div><h2 style="margin:6px 0 2px">Marcus Bell</h2><small style="color:#8b93a1">DOB 1987-09-30 · ID 0048-2211</small>
        <div class="kv" style="margin-top:14px"><span>Licence</span><b class="tag warn">Suspended</b></div><div class="kv"><span>Warrants</span><b class="tag bad">1 active</b></div><div class="kv"><span>Vehicles</span><b>BRX 204</b></div><div class="kv"><span>Prior reports</span><b>3</b></div>
        <div class="lbl" style="margin-top:16px">Medical</div><div class="kv"><span>Records</span><b style="color:#6c7480">Restricted — EMS only</b></div>
        <div class="row" style="margin-top:16px"><span class="btn p">New report</span><span class="btn">Attach to callout</span></div></div></div>`
  const body = app({ brand: "MDT", nav: ["Persons", "Vehicles", "Warrants", "Reports", "Units", "Settings"], active: tab === "vehicles" ? 1 : 0, title: tab === "vehicles" ? "Vehicle records" : "Person records", stats: [["Logged in as", "Off. Moreno"], ["Unit", "104"], ["Shift", "Night"]], content, width: 1300 })
  return doc({ body, style: APP_STYLE, bg: "#3b4a5c" })
}

export function dispatch() {
  const content = `<div class="two" style="grid-template-columns:1fr 380px">
    <div class="card"><table><thead><tr><th>Unit</th><th>Type</th><th>Crew</th><th>Status</th><th>Assigned</th></tr></thead><tbody>${UNITS.map((u) => `<tr><td class="mono"><b>${u[0]}</b></td><td>${u[1]}</td><td>${u[2]}</td><td><span class="tag ${u[4]}">${u[3]}</span></td><td>${u[3] === "On scene" || u[3] === "En route" ? "10-31 · Elm St" : u[3] === "Busy" ? "Traffic stop" : "—"}</td></tr>`).join("")}</tbody></table></div>
    <div class="panel"><div class="lbl">Active callouts</div>
      ${[["10-31", "Burglary in progress", "Elm St & 4th", "High", "bad", "104 · A-12"], ["10-50", "Vehicle collision", "Harbour Rd", "Medium", "warn", "E-3"], ["10-66", "Suspicious person", "Market Square", "Low", "info", "—"]].map((c) => `<div class="co"><div class="row" style="justify-content:space-between"><b>${c[0]} · ${c[1]}</b><span class="tag ${c[4]}">${c[3]}</span></div><small>${c[2]} · ${c[5]}</small></div>`).join("")}
      <div class="row" style="margin-top:14px"><span class="btn p">New callout</span><span class="btn">Assign unit</span></div></div></div>`
  const body = app({ brand: "Dispatch", nav: ["Board", "Callouts", "Units", "Map", "Log"], active: 0, title: "Dispatch board", stats: [["Units available", "3 / 6"], ["Open callouts", "3"], ["Avg response", "4:20"]], content, width: 1340 })
  const style = `${APP_STYLE}.co{padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)}.co small{display:block;color:#8b93a1;margin-top:4px;font-size:12px}`
  return doc({ body, style, bg: "#3b4a5c" })
}

export function callout() {
  const body = `${backdrop("night")}
  <div class="co-panel"><div class="top"><span class="tag bad">Priority · High</span><span class="code">10-31</span></div><h2>Burglary in progress</h2><p>Elm St &amp; 4th · 320 m</p>
    <div class="units"><span class="lbl">Responding</span><b>104 · A-12</b></div>
    <div class="row"><span class="btn p">Accept <span class="kbd">Y</span></span><span class="btn">Decline <span class="kbd">N</span></span></div></div>
  <div class="mini"><span class="lbl">Unit 104</span><b>On duty · Patrol</b></div>`
  const style = `${T}
  .co-panel{position:absolute;right:48px;top:120px;width:380px;background:rgba(10,13,19,.88);border:1px solid rgba(255,255,255,.12);border-left:4px solid #e8554a;border-radius:10px;padding:18px 20px;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,.5)}
  .top{display:flex;justify-content:space-between;align-items:center}.code{font-family:Consolas,Menlo,monospace;color:#8b93a1;font-size:13px}.co-panel h2{margin:12px 0 4px;font-size:20px}.co-panel p{margin:0 0 14px;color:#c7cdd6;font-size:13.5px}
  .units{display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:14px}
  .mini{position:absolute;left:48px;bottom:48px;background:rgba(10,13,19,.75);border-radius:8px;padding:10px 14px;color:#fff}.mini b{display:block;font-size:13px}`
  return doc({ body, style, bg: "#0d1524" })
}

/* ---------------------------------------------------------- garage */

const VEHICLES = [["Sedan", "4KL 921", 88, 62, "Stored", "ok"], ["SUV", "BRX 204", 41, 20, "Impounded", "bad"], ["Coupe", "7TR 118", 95, 80, "Stored", "ok"], ["Pickup", "GH 3382", 67, 44, "Out", "warn"], ["Motorcycle", "MC 019", 100, 90, "Stored", "ok"]]

export function garageApp({ tab = "vehicles" } = {}) {
  let content
  if (tab === "impound") {
    content = `<div class="two"><div class="card"><table><thead><tr><th>Vehicle</th><th>Plate</th><th>Reason</th><th>Since</th><th>Fee</th></tr></thead><tbody><tr><td><b>SUV</b></td><td class="mono">BRX 204</td><td>Abandoned · Harbour Rd</td><td>2 h 14 m</td><td><b>$850</b></td></tr><tr><td><b>Van</b></td><td class="mono">MNT 552</td><td>Left in street</td><td>6 h 02 m</td><td><b>$850</b></td></tr></tbody></table></div>
      <div class="panel"><div class="lbl">Retrieve</div><h2 style="margin:6px 0 2px">SUV · BRX 204</h2><div class="kv"><span>Impound fee</span><b>$850</b></div><div class="kv"><span>Condition</span><b>41%</b></div><div class="kv"><span>Fuel</span><b>20%</b></div><div class="kv"><span>Insurance payout</span><b>70%</b></div><div class="row" style="margin-top:16px"><span class="btn p">Pay &amp; retrieve</span><span class="btn">Cancel</span></div></div></div>`
  } else if (tab === "admin") {
    content = `<div class="field">Search player or plate…</div><div class="card"><table><thead><tr><th>Plate</th><th>Owner</th><th>Last garage</th><th>Last seen</th><th></th></tr></thead><tbody>${[["GH 3382", "Tom Ferreira", "Harbour", "Outside any garage · 1.2 km", true], ["MC 019", "Priya Raman", "Downtown", "Downtown garage", false], ["4KL 921", "Dana Whitfield", "Downtown", "Downtown garage", false]].map((r) => `<tr><td class="mono"><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4] ? `<span class="btn d">Recover to garage</span>` : "—"}</td></tr>`).join("")}</tbody></table></div>`
  } else {
    content = `<div class="two"><div class="card"><table><thead><tr><th>Vehicle</th><th>Plate</th><th style="width:160px">Condition</th><th style="width:140px">Fuel</th><th>Status</th></tr></thead><tbody>${VEHICLES.map((v) => `<tr><td><b>${v[0]}</b></td><td class="mono">${v[1]}</td><td><div class="row"><div class="bar" style="flex:1"><i style="width:${v[2]}%;background:${v[2] > 70 ? "#3ec66d" : v[2] > 40 ? "#e8b84a" : "#e8554a"}"></i></div><small>${v[2]}%</small></div></td><td><div class="row"><div class="bar" style="flex:1"><i style="width:${v[3]}%;background:#e8b84a"></i></div><small>${v[3]}%</small></div></td><td><span class="tag ${v[5]}">${v[4]}</span></td></tr>`).join("")}</tbody></table></div>
      <div class="panel"><div class="lbl">Downtown garage</div><h2 style="margin:6px 0 2px">Sedan · 4KL 921</h2><div class="kv"><span>Engine</span><b>88%</b></div><div class="kv"><span>Body</span><b>91%</b></div><div class="kv"><span>Fuel</span><b>62%</b></div><div class="kv"><span>Modifications</span><b>Turbo · Tint · Wheels</b></div><div class="kv"><span>Access</span><b>Owner</b></div><div class="row" style="margin-top:16px"><span class="btn p">Take out</span><span class="btn">Transfer</span></div></div></div>`
  }
  const body = app({ brand: "Garage", nav: ["My vehicles", "Impound", "Insurance", "Admin"], active: tab === "impound" ? 1 : tab === "admin" ? 3 : 0, title: tab === "impound" ? "Impound lot" : tab === "admin" ? "Admin · vehicle recovery" : "Stored vehicles", stats: [["Slots", "5 / 12"], ["Garages", "3"], ["Impounded", "1"]], content })
  return doc({ body, style: APP_STYLE, bg: "#3b4a5c" })
}

/* -------------------------------------------------------- business */

export function businessApp({ tab = "staff" } = {}) {
  let content
  if (tab === "stock") {
    content = `<div class="card"><table><thead><tr><th>Item</th><th>In stock</th><th>Reorder at</th><th style="width:200px">Level</th><th>Status</th></tr></thead><tbody>${[["Coffee beans", 42, 20, "ok"], ["Milk", 8, 15, "bad"], ["Cups (large)", 310, 100, "ok"], ["Pastries", 14, 25, "warn"], ["Syrup · vanilla", 6, 5, "ok"]].map((r) => `<tr><td><b>${r[0]}</b></td><td class="mono">${r[1]}</td><td class="mono">${r[2]}</td><td><div class="bar"><i style="width:${Math.min(100, (r[1] / (r[2] * 2)) * 100)}%;background:${r[3] === "ok" ? "#3ec66d" : r[3] === "warn" ? "#e8b84a" : "#e8554a"}"></i></div></td><td><span class="tag ${r[3]}">${r[3] === "ok" ? "In stock" : r[3] === "warn" ? "Low" : "Reorder"}</span></td></tr>`).join("")}</tbody></table></div>`
  } else if (tab === "books") {
    content = `<div class="two"><div class="card"><table><thead><tr><th>Date</th><th>Entry</th><th>Revenue</th><th>Cost</th></tr></thead><tbody>${[["Mon", "Sales · 84 orders", "$1,260", "—"], ["Mon", "Payroll · 3 staff", "—", "$540"], ["Tue", "Sales · 91 orders", "$1,365", "—"], ["Tue", "Stock · supplier", "—", "$410"], ["Wed", "Sales · 77 orders", "$1,155", "—"], ["Wed", "Payroll · 3 staff", "—", "$540"]].map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td class="mono" style="color:#7fe0a3">${r[2]}</td><td class="mono" style="color:#f39c93">${r[3]}</td></tr>`).join("")}</tbody></table></div>
      <div class="panel"><div class="lbl">This week</div><div class="kv"><span>Revenue</span><b style="color:#7fe0a3">$3,780</b></div><div class="kv"><span>Wages</span><b style="color:#f39c93">$1,080</b></div><div class="kv"><span>Stock</span><b style="color:#f39c93">$410</b></div><div class="kv"><span>Takings</span><b>$2,290</b></div><div class="lbl" style="margin-top:16px">Payroll</div><div class="kv"><span>Interval</span><b>Every 60 min</b></div><div class="kv"><span>Next run</span><b>12 min</b></div></div></div>`
  } else {
    content = `<div class="two"><div class="card"><table><thead><tr><th>Employee</th><th>Role</th><th>Wage</th><th>On duty</th><th></th></tr></thead><tbody>${[["Dana Whitfield", "Manager", "$220 / h", true], ["Priya Raman", "Barista", "$160 / h", true], ["Tom Ferreira", "Barista", "$160 / h", false]].map((r) => `<tr><td><b>${r[0]}</b></td><td><span class="tag info">${r[1]}</span></td><td class="mono">${r[2]}</td><td><span class="tag ${r[3] ? "ok" : ""}">${r[3] ? "Yes" : "No"}</span></td><td><span class="btn">Edit</span></td></tr>`).join("")}</tbody></table></div>
      <div class="panel"><div class="lbl">Role permissions</div>${[["Manager", ["Hire / fire", "Set wages", "Order stock", "View books"]], ["Barista", ["Sell", "View stock"]]].map((r) => `<div style="margin-top:12px"><b>${r[0]}</b><div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px">${r[1].map((p) => `<span class="tag">${p}</span>`).join("")}</div></div>`).join("")}<div class="row" style="margin-top:18px"><span class="btn p">Hire employee</span><span class="btn">New role</span></div></div></div>`
  }
  const body = app({ brand: "Harbour Coffee", nav: ["Staff", "Payroll", "Stock", "Books", "Roles"], active: tab === "stock" ? 2 : tab === "books" ? 3 : 0, title: tab === "stock" ? "Stock" : tab === "books" ? "Books" : "Staff", stats: [["Staff", "3"], ["On duty", "2"], ["Balance", "$12,480"]], content })
  return doc({ body, style: APP_STYLE, bg: "#3b4a5c" })
}

/* ------------------------------------------------------------ banking */

export function bankApp({ tab = "accounts" } = {}) {
  let content
  if (tab === "transfer") {
    content = `<div class="two" style="grid-template-columns:480px 1fr"><div class="panel"><div class="lbl">New transfer</div><div class="lbl" style="margin-top:14px;color:#c7cdd6">From</div><div class="field">Personal · $18,930.40</div><div class="lbl" style="color:#c7cdd6">To</div><div class="field">Dana Whitfield · 0048-1192</div><div class="lbl" style="color:#c7cdd6">Amount</div><div class="field">$300.00</div><div class="lbl" style="color:#c7cdd6">Reference</div><div class="field ph">Optional</div><div class="row"><span class="btn p">Send transfer</span><span class="btn">Cancel</span></div></div>
      <div class="card"><table><thead><tr><th>Date</th><th>Description</th><th>Account</th><th>Amount</th></tr></thead><tbody>${[["Today 14:02", "Transfer to D. Whitfield", "Personal", "-$300.00"], ["Today 09:15", "Payroll · Mechanic", "Personal", "+$1,240.00"], ["Yesterday", "City Garage · Repair", "Personal", "-$850.00"], ["Yesterday", "Card purchase · 24/7", "Personal", "-$62.50"], ["Mon", "Loan repayment", "Personal", "-$210.00"], ["Mon", "Sales · Harbour Coffee", "Business", "+$1,260.00"]].map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td><span class="tag">${r[2]}</span></td><td class="mono" style="color:${r[3].startsWith("+") ? "#7fe0a3" : "#e6e9ee"}">${r[3]}</td></tr>`).join("")}</tbody></table></div></div>`
  } else if (tab === "cards") {
    content = `<div class="two" style="grid-template-columns:1fr 1fr"><div class="panel"><div class="cardv"><span>DEBIT</span><b>•••• •••• •••• 4471</b><small>D. WHITFIELD · 09/28</small></div><div class="kv"><span>Status</span><b class="tag ok">Active</b></div><div class="kv"><span>Daily limit</span><b>$5,000</b></div><div class="kv"><span>Linked account</span><b>Personal</b></div><div class="row" style="margin-top:14px"><span class="btn d">Report lost or stolen</span><span class="btn">Freeze</span></div></div>
      <div class="panel"><div class="cardv" style="background:linear-gradient(135deg,#3a4150,#1c2029)"><span>BUSINESS</span><b>•••• •••• •••• 9032</b><small>HARBOUR COFFEE · 03/27</small></div><div class="kv"><span>Status</span><b class="tag warn">Frozen by staff</b></div><div class="kv"><span>Daily limit</span><b>$12,000</b></div><div class="kv"><span>Linked account</span><b>Business</b></div><div class="row" style="margin-top:14px"><span class="btn">Request unfreeze</span></div></div></div>`
  } else if (tab === "loans") {
    content = `<div class="two"><div class="card"><table><thead><tr><th>Loan</th><th>Principal</th><th>Rate</th><th>Remaining</th><th style="width:180px">Repaid</th></tr></thead><tbody><tr><td><b>Vehicle loan</b></td><td class="mono">$12,000</td><td class="mono">4.5%</td><td class="mono">$6,840</td><td><div class="bar"><i style="width:43%;background:#3ec66d"></i></div></td></tr><tr><td><b>Business start-up</b></td><td class="mono">$25,000</td><td class="mono">6.0%</td><td class="mono">$21,300</td><td><div class="bar"><i style="width:15%;background:#4a9be8"></i></div></td></tr></tbody></table></div>
      <div class="panel"><div class="lbl">Vehicle loan</div><div class="kv"><span>Next payment</span><b>$210 · in 2 days</b></div><div class="kv"><span>Interest accrued</span><b>$38.20</b></div><div class="kv"><span>Term</span><b>24 payments</b></div><div class="kv"><span>Missed</span><b>0</b></div><div class="row" style="margin-top:16px"><span class="btn p">Pay early</span><span class="btn">Schedule</span></div></div></div>`
  } else {
    content = `<div class="accts"><div class="acct"><span class="lbl">Personal</span><b>$18,930.40</b><small>0048-1192 · Debit card active</small></div><div class="acct" style="border-color:rgba(74,155,232,.4)"><span class="lbl">Business · Harbour Coffee</span><b>$12,480.00</b><small>0048-2277 · 2 authorised users</small></div><div class="acct" style="border-style:dashed"><span class="lbl">Open account</span><b style="color:#8b93a1">+</b></div></div>
      <div class="card"><table><thead><tr><th>Date</th><th>Description</th><th>Account</th><th>Amount</th><th>Balance</th></tr></thead><tbody>${[["Today 09:15", "Payroll · Mechanic", "Personal", "+$1,240.00", "$18,930.40"], ["Yesterday", "City Garage · Repair", "Personal", "-$850.00", "$17,690.40"], ["Yesterday", "Card purchase · 24/7", "Personal", "-$62.50", "$18,540.40"], ["Mon", "Loan repayment", "Personal", "-$210.00", "$18,602.90"], ["Mon", "ATM withdrawal · Elm St", "Personal", "-$200.00", "$18,812.90"]].map((r) => `<tr><td class="mono">${r[0]}</td><td>${r[1]}</td><td><span class="tag">${r[2]}</span></td><td class="mono" style="color:${r[3].startsWith("+") ? "#7fe0a3" : "#e6e9ee"}">${r[3]}</td><td class="mono" style="color:#8b93a1">${r[4]}</td></tr>`).join("")}</tbody></table></div>`
  }
  const body = app({ brand: "Bank", nav: ["Accounts", "Transfer", "Cards", "Loans", "ATMs"], active: tab === "transfer" ? 1 : tab === "cards" ? 2 : tab === "loans" ? 3 : 0, title: tab === "transfer" ? "Transfer" : tab === "cards" ? "Cards" : tab === "loans" ? "Loans" : "Accounts", stats: [["Total balance", "$31,410"], ["Cards", "2"], ["Loans", "2"]], content, width: 1300 })
  const style = `${APP_STYLE}.accts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:18px}.acct{background:#171c25;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:16px}.acct b{display:block;font-size:24px;margin:6px 0 2px;font-variant-numeric:tabular-nums}.acct small{color:#8b93a1;font-size:12px}
  .cardv{background:linear-gradient(135deg,#2ea36b,#1b6e47);border-radius:14px;padding:22px 24px;color:#fff;margin-bottom:14px}.cardv span{font-size:11px;letter-spacing:.2em;opacity:.8}.cardv b{display:block;font-size:20px;letter-spacing:.12em;margin:26px 0 6px;font-family:Consolas,Menlo,monospace}.cardv small{font-size:11px;letter-spacing:.1em;opacity:.85}`
  return doc({ body, style, bg: "#3b4a5c" })
}

export function atm() {
  const body = `${backdrop("day")}<div class="dim" style="background:rgba(6,9,14,.35)"></div>
  <div class="atm"><div class="scr"><div class="lbl" style="color:#7fe0a3">Elm St · ATM</div><h2>Welcome, Dana</h2><div class="bal"><span>Personal</span><b>$18,930.40</b></div>
    <div class="opts">${["Withdraw", "Deposit", "Balance", "Transfer"].map((o, i) => `<div class="opt${i === 0 ? " on" : ""}"><span class="kbd">${i + 1}</span>${o}</div>`).join("")}</div>
    <div class="lim"><span>Daily withdrawal limit</span><b>$2,000 · $1,800 remaining</b></div><div class="lim"><span>Fee</span><b>$0 · own bank</b></div></div></div>`
  const style = `${T}
  .atm{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:640px;background:#1b1f26;border:6px solid #3a3f47;border-radius:16px;padding:22px;box-shadow:0 40px 90px rgba(0,0,0,.6)}
  .scr{background:#0b1a14;border-radius:8px;padding:26px 28px;color:#dff5e6;font-family:Consolas,"Cascadia Mono",Menlo,monospace;box-shadow:inset 0 0 0 2px rgba(127,224,163,.15)}.scr h2{margin:6px 0 16px;font-size:22px;font-weight:600}
  .bal{display:flex;justify-content:space-between;padding:12px 0;border-top:1px solid rgba(127,224,163,.2);border-bottom:1px solid rgba(127,224,163,.2);font-size:16px}.bal b{font-size:22px}
  .opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}.opt{padding:14px;border:1px solid rgba(127,224,163,.25);border-radius:6px;font-size:15px}.opt.on{background:rgba(127,224,163,.14);border-color:#7fe0a3}
  .lim{display:flex;justify-content:space-between;font-size:12.5px;padding:6px 0;color:#9fd8b3}`
  return doc({ body, style, bg: "#3b4a5c" })
}

/* ------------------------------------------------------ loading screen */

const TIPS = ["Hold TAB to open your inventory.", "Seatbelts save lives — press B before driving.", "Report bugs in the #support channel.", "Vehicles left in the street are impounded after 30 minutes.", "Respect all players. Fail RP is a bannable offence."]
const RULES = ["No random deathmatch (RDM).", "No vehicle deathmatch (VDM).", "Stay in character at all times.", "New life rule applies after respawn.", "No combat logging."]

export function loadingScreen({ variant = 1 } = {}) {
  const scenes = { 1: backdrop("dusk", true), 2: backdrop("night", true), 3: backdrop("day", true) }
  const accent = { 1: "#e8b84a", 2: "#4a9be8", 3: "#3ec66d" }[variant]
  const layout = variant === 2
    ? `<div class="v2"><div class="left"><div class="mark" style="border-color:${accent}"><span style="background:${accent}"></span></div><h1>Harbour City <em>Roleplay</em></h1><p>Serious roleplay · whitelisted · 18+</p><div class="prog"><div class="bar"><i style="width:68%;background:${accent}"></i></div><small>Connecting… 68% · Downloading resources (142 / 208)</small></div></div>
       <div class="right"><div class="lbl">Server rules</div><ol>${RULES.map((r) => `<li>${r}</li>`).join("")}</ol></div></div>`
    : `<div class="v1"><div class="mark" style="border-color:${accent}"><span style="background:${accent}"></span></div><h1>Harbour City <em>Roleplay</em></h1><p>${variant === 3 ? "Community · economy · jobs · housing" : "Serious roleplay · whitelisted · 18+"}</p>
       <div class="tip"><span class="lbl" style="color:${accent}">Tip</span><b>${TIPS[variant]}</b></div>
       <div class="prog"><div class="bar"><i style="width:${variant === 3 ? 42 : 68}%;background:${accent}"></i></div><small>Connecting… ${variant === 3 ? 42 : 68}% · Downloading resources</small></div></div>`
  const body = `${scenes[variant]}<div class="dim" style="background:linear-gradient(90deg,rgba(6,9,14,.82),rgba(6,9,14,.45))"></div>${layout}
  <div class="player"><span>▶</span><div><b>Ambient · Night drive</b><div class="bar" style="width:140px;margin-top:6px"><i style="width:35%;background:#c7cdd6"></i></div></div><span class="vol">🔊 40%</span></div>
  <div class="foot"><span>discord.gg/harbourcity</span><span>Press <span class="kbd">Enter</span> when ready</span></div>`
  const style = `${T}
  .v1,.v2{position:absolute;inset:0;padding:120px 120px;color:#fff}.v2{display:grid;grid-template-columns:1fr 420px;gap:60px;align-items:center}
  .mark{width:64px;height:64px;border:3px solid;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:26px}.mark span{width:26px;height:26px;border-radius:6px;display:block;transform:rotate(45deg)}
  h1{margin:0;font-size:56px;font-weight:800;letter-spacing:-.01em;line-height:1}h1 em{font-style:normal;font-weight:300}.v1 p,.left p{margin:12px 0 0;font-size:17px;color:#c7cdd6;letter-spacing:.06em}
  .tip{margin-top:48px;background:rgba(10,13,19,.6);border-left:3px solid;border-radius:8px;padding:14px 18px;max-width:560px}.tip b{display:block;font-size:17px;margin-top:4px;font-weight:500}
  .prog{margin-top:60px;max-width:560px}.prog .bar{height:8px}.prog small{display:block;margin-top:10px;color:#c7cdd6;font-size:13px}
  .right{background:rgba(10,13,19,.6);border-radius:12px;padding:22px 24px}.right ol{margin:10px 0 0;padding-left:20px;font-size:15px;line-height:1.9;color:#e6e9ee}
  .player{position:absolute;right:120px;bottom:56px;display:flex;align-items:center;gap:14px;background:rgba(10,13,19,.7);border-radius:10px;padding:12px 16px;color:#fff;font-size:13px}.vol{color:#c7cdd6}
  .foot{position:absolute;left:120px;right:120px;bottom:24px;display:flex;justify-content:space-between;color:#8b93a1;font-size:12px}`
  return doc({ body, style, bg: "#0d1524" })
}
