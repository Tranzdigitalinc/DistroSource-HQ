/**
 * Community, animation, weapon and bundle scenes — the HTML/SVG side of
 * batch 4.
 *
 *   discord(...)          a Discord-style client showing the bot suite and the
 *                         community brand assets (fictional community)
 *   webBanners()          web banners at standard ad/OG sizes
 *   emoteMenu()           the in-game emote menu (search, favourites, keybinds)
 *   consentPrompt()       the paired-emote consent prompt
 *   sequenceViewer(...)   job animation sequence timeline
 *   attachmentDiagram()   weapon attachment points, drawn as SVG callouts
 *   ballisticsLadder()    damage / range / recoil table across the pack
 *   rankChart()           EUP rank insignia and variant matrix
 *   componentTable(...)   clothing component ID reference
 *   docPage(...)          a rendered document page (handbook, checklist…)
 *   bundleGrid(...)       "what's in the box": the real covers of the
 *                         products a bundle contains
 *
 * Real HTML/CSS. Fictional community ("Harbour City"). No player counts or
 * sales anywhere except where a product's own feature is a status embed.
 */
import { readFileSync, existsSync } from "node:fs"
import { doc, esc, localPath } from "../lib.mjs"

const T = `
  *{box-sizing:border-box}
  .lbl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8b93a1;font-weight:600}
  .tag{display:inline-block;font-size:11px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.08);color:#c7cdd6;white-space:nowrap}
  .tag.ok{background:rgba(62,198,109,.16);color:#7fe0a3}.tag.warn{background:rgba(232,184,74,.16);color:#f2cf78}.tag.bad{background:rgba(232,85,74,.16);color:#f39c93}.tag.info{background:rgba(74,155,232,.16);color:#8fc3f5}
  .bar{height:6px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden}.bar i{display:block;height:100%;background:#4a9be8}
  table{border-collapse:collapse;width:100%}th{text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8b93a1;font-weight:600;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
  td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.05);font-size:13.5px;vertical-align:middle}
  .kbd{display:inline-block;padding:2px 7px;border:1px solid rgba(255,255,255,.18);border-bottom-width:2px;border-radius:5px;font-size:11px;color:#c7cdd6;background:#0e1219;margin:0 4px}
  .mono{font-family:Consolas,"Cascadia Mono",Menlo,monospace}
`

/* Fictional community used by the brand and Discord scenes. */
const HC = { name: "Harbour City", short: "HC", teal: "#2a8f86", coral: "#e2694f", ink: "#12181f", sand: "#f1ebe0", slate: "#2c3440" }
const hcMark = (size, fg = "#fff", bg = HC.teal) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="${bg}"/><path d="M22 64c8-6 12-14 12-24V28h10v20c6-8 14-12 22-12v10c-12 0-20 8-22 20v6h-10c0 0-2-4-12-8z" fill="${fg}"/><path d="M20 72h60v6H20z" fill="${fg}" opacity=".85"/></svg>`

function gameBackdrop(tone = "day") {
  const sky = tone === "night" ? "linear-gradient(#0d1524 0%,#1a2740 55%,#0b0f18 100%)" : tone === "dusk" ? "linear-gradient(#3a3f6b 0%,#c97a52 50%,#5a4a3f 51%,#3f3a34 100%)" : "linear-gradient(#8fb6dc 0%,#c9dcea 48%,#6f7a66 49%,#4f5a49 100%)"
  const b = tone === "night" ? "#151c2a" : "#8d9aa8"
  return `<div class="bd" style="position:absolute;inset:0;filter:blur(7px) saturate(.85);transform:scale(1.04);background:${sky}">${Array.from({ length: 9 }, (_, i) => `<i style="position:absolute;bottom:34%;display:block;border-radius:2px 2px 0 0;opacity:.9;left:${4 + i * 11}%;height:${18 + ((i * 7) % 5) * 7}%;width:${5 + (i % 3) * 2}%;background:${b}"></i>`).join("")}<div style="position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(#5a5f66,#3a3e44)"></div></div><div class="dim" style="position:absolute;inset:0;background:rgba(6,9,14,.5)"></div>`
}

/* ------------------------------------------------------------ Discord */

const DISCORD_STYLE = `${T}
  html,body{background:#1e1f22}
  .dc{position:absolute;inset:0;display:grid;grid-template-columns:72px 240px 1fr 240px;color:#dbdee1;font-size:14px}
  .rail{background:#1e1f22;padding:12px 0;display:flex;flex-direction:column;align-items:center;gap:8px}.rail i{display:block;width:48px;height:48px;border-radius:50%;background:#313338}.rail i.on{border-radius:16px}.rail .sep{width:32px;height:2px;background:#35373c;border-radius:1px;margin:4px 0}
  .chan{background:#2b2d31;display:flex;flex-direction:column}.chan .hd{height:48px;display:flex;align-items:center;padding:0 16px;font-weight:600;border-bottom:1px solid #1f2023;box-shadow:0 1px 0 rgba(0,0,0,.2)}
  .chan .cat{font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#949ba4;padding:18px 8px 4px 16px;font-weight:600}
  .chan .ch{display:flex;align-items:center;gap:6px;padding:6px 8px;margin:1px 8px;border-radius:4px;color:#949ba4}.chan .ch.on{background:#404249;color:#fff}.chan .ch:before{content:"#";color:#80848e;font-size:18px;line-height:1}.chan .ch.v:before{content:"🔊";font-size:12px}
  .chan .ch b{font-weight:500}.chan .me{margin-top:auto;background:#232428;padding:8px;display:flex;align-items:center;gap:8px}.chan .me i{width:32px;height:32px;border-radius:50%;background:${HC.teal};display:block}.chan .me b{font-size:13px;display:block}.chan .me span{font-size:11px;color:#949ba4}
  .main{background:#313338;display:flex;flex-direction:column}.main .hd{height:48px;display:flex;align-items:center;padding:0 16px;gap:10px;border-bottom:1px solid #26272b;font-weight:600}.main .hd:before{content:"#";color:#80848e;font-size:22px}.main .hd span{font-weight:400;color:#949ba4;font-size:13px;margin-left:8px;border-left:1px solid #3f4147;padding-left:12px}
  .msgs{flex:1;padding:16px 16px 0;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;gap:16px}
  .msg{display:flex;gap:16px}.msg .av{width:40px;height:40px;border-radius:50%;flex:none}.msg .who{font-weight:500;color:#f2f3f5}.msg .who .bot{display:inline-block;background:#5865f2;color:#fff;font-size:10px;padding:1px 5px;border-radius:3px;margin-left:6px;vertical-align:1px}.msg .t{font-size:12px;color:#949ba4;margin-left:8px}.msg p{margin:2px 0 0;line-height:1.4}
  .embed{margin-top:8px;background:#2b2d31;border-left:4px solid ${HC.teal};border-radius:4px;padding:12px 16px;max-width:520px}.embed h4{margin:0 0 6px;font-size:15px;color:#f2f3f5}.embed .fields{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px 16px;margin-top:8px}.embed .f b{display:block;font-size:12px;color:#f2f3f5;margin-bottom:2px}.embed .f span{font-size:13px;color:#dbdee1}.embed .ft{margin-top:10px;font-size:11px;color:#949ba4}
  .btns{display:flex;gap:8px;margin-top:10px}.btn{padding:6px 14px;border-radius:3px;font-size:13px;font-weight:500;background:#4e5058;color:#fff}.btn.p{background:#5865f2}.btn.ok{background:#248046}.btn.bad{background:#da373c}.btn.g{background:#4e5058}
  .compose{margin:0 16px 24px;background:#383a40;border-radius:8px;padding:11px 16px;color:#6d6f78;font-size:14px}
  .members{background:#2b2d31;padding:16px 8px}.members .cat{font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#949ba4;padding:8px;font-weight:600}.members .m{display:flex;align-items:center;gap:10px;padding:5px 8px;border-radius:4px}.members .m i{width:32px;height:32px;border-radius:50%;display:block}.members .m b{font-weight:500;font-size:14px}
  .modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:520px;background:#313338;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,.6);color:#dbdee1}.modal .mh{padding:18px 20px 8px;font-size:20px;font-weight:600;color:#f2f3f5}.modal .mb{padding:8px 20px 16px}.modal .mf{background:#2b2d31;padding:16px 20px;display:flex;justify-content:flex-end;gap:8px;border-radius:0 0 8px 8px}
  .fld{margin:14px 0}.fld label{display:block;font-size:12px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;color:#b5bac1;margin-bottom:8px}.fld .in{background:#1e1f22;border-radius:3px;padding:10px 12px;font-size:14px;color:#dbdee1;min-height:40px}.fld .in.ta{min-height:96px;color:#dbdee1}
  .veil{position:absolute;inset:0;background:rgba(0,0,0,.6)}
`
function discordShell({ channel, topic, messages, active = 2, modal = "", members = true }) {
  const chans = [["Information", ["rules", "announcements", "server-status"]], ["Applications", ["apply-staff", "apply-whitelist", "application-log"]], ["Support", ["open-a-ticket", "ticket-transcripts"]], ["Community", ["general", "screenshots", "looking-for-crew"]]]
  let idx = 0
  const chanList = chans.map(([cat, list]) => `<div class="cat">${cat}</div>${list.map((c) => `<div class="ch${c === channel ? " on" : ""}"><b>${c}</b></div>`).join("")}`).join("")
  const memberList = `<div class="cat">Staff — 3</div>${[["Dana W.", HC.coral], ["Marcus B.", "#c9a35a"], ["Priya R.", "#6fb3a0"]].map(([n, c]) => `<div class="m"><i style="background:${c}"></i><b style="color:${HC.coral}">${n}</b></div>`).join("")}<div class="cat">Whitelisted — 5</div>${[["Tom F.", "#8b93a1"], ["Elena B.", "#4a9be8"], ["Kofi A.", "#a05bd6"], ["Sam L.", "#3ec66d"], ["Noor H.", "#e8b84a"]].map(([n, c]) => `<div class="m"><i style="background:${c}"></i><b>${n}</b></div>`).join("")}<div class="cat">Bots — 1</div><div class="m"><i style="background:${HC.teal}"></i><b>Harbour Bot</b></div>`
  const body = `<div class="dc">
    <div class="rail"><i class="on" style="background:${HC.teal}"></i><div class="sep"></div><i></i><i></i><i></i></div>
    <div class="chan"><div class="hd">${HC.name}</div>${chanList}<div class="me"><i></i><div><b>Dana W.</b><span>Online</span></div></div></div>
    <div class="main"><div class="hd">${channel}<span>${esc(topic)}</span></div><div class="msgs">${messages}</div><div class="compose">Message #${channel}</div></div>
    <div class="members">${members ? memberList : ""}</div>
  </div>${modal ? `<div class="veil"></div>${modal}` : ""}`
  return doc({ body, style: DISCORD_STYLE, bg: "#1e1f22" })
}
const botMsg = (time, inner) => `<div class="msg"><div class="av" style="background:${HC.teal}"></div><div><span class="who">Harbour Bot<span class="bot">BOT</span></span><span class="t">${time}</span>${inner}</div></div>`
const userMsg = (name, color, time, text) => `<div class="msg"><div class="av" style="background:${color}"></div><div><span class="who" style="color:${color}">${name}</span><span class="t">${time}</span><p>${text}</p></div></div>`

export function discord({ view = "status" } = {}) {
  if (view === "status") return discordShell({
    channel: "server-status", topic: "Live status · updates every 60 s",
    messages: userMsg("Marcus B.", "#c9a35a", "Today at 18:02", "restart done, status bot should catch up in a minute") + botMsg("Today at 18:03", `
      <div class="embed"><h4>Harbour City Roleplay — Online</h4><div class="fields"><div class="f"><b>Players</b><span>38 / 64</span></div><div class="f"><b>Uptime</b><span>2 h 41 m</span></div><div class="f"><b>Queue</b><span>0</span></div><div class="f"><b>Last restart</b><span>18:01</span></div><div class="f"><b>Tick</b><span>128 / 128</span></div><div class="f"><b>Version</b><span>build 2417</span></div></div><div class="ft">Self-hosted · polls the server every 60 s · roles synced 3 min ago</div></div>`),
  })
  if (view === "apply") return discordShell({
    channel: "apply-whitelist", topic: "Whitelist applications · reviewed within 48 h",
    messages: botMsg("Today at 17:40", `<div class="embed" style="border-color:#5865f2"><h4>Whitelist application</h4><p style="margin:0;color:#b5bac1">Open the form below. You will be asked for your character concept, prior roleplay experience and a short scenario answer. Applications are reviewed by staff in the order received.</p><div class="btns"><span class="btn p">Start application</span><span class="btn g">Check status</span></div></div>`),
    modal: `<div class="modal"><div class="mh">Whitelist application</div><div class="mb">
      <div class="fld"><label>Character name</label><div class="in">Elena Byrne</div></div>
      <div class="fld"><label>Character concept (2–3 sentences)</label><div class="in ta">Paramedic who moved to the city after a rural posting. Keeps to herself off-shift; sails on weekends.</div></div>
      <div class="fld"><label>Scenario: you witness a robbery while off duty. What do you do?</label><div class="in ta">Get to cover, call it in with location and description, and stay on the line. I would not intervene without a reason to.</div></div>
    </div><div class="mf"><span class="btn g">Cancel</span><span class="btn p">Submit</span></div></div>`,
  })
  if (view === "queue") return discordShell({
    channel: "application-log", topic: "Staff only · decisions are logged here",
    messages: botMsg("Today at 16:12", `<div class="embed" style="border-color:#e8b84a"><h4>Application #0412 · Whitelist</h4><div class="fields"><div class="f"><b>Applicant</b><span>Elena B.</span></div><div class="f"><b>Submitted</b><span>Today 15:58</span></div><div class="f"><b>Status</b><span>Pending review</span></div></div><div class="btns"><span class="btn ok">Approve</span><span class="btn bad">Decline</span><span class="btn g">Ask for more</span></div><div class="ft">Reviewer: unassigned · 2 of 3 required votes</div></div>`) +
      botMsg("Today at 16:30", `<div class="embed" style="border-color:#3ec66d"><h4>Application #0411 · Staff</h4><div class="fields"><div class="f"><b>Applicant</b><span>Kofi A.</span></div><div class="f"><b>Decision</b><span>Approved</span></div><div class="f"><b>By</b><span>Dana W., Marcus B.</span></div></div><div class="ft">Role Trial Moderator assigned · decision logged</div></div>`),
  })
  if (view === "ticket") return discordShell({
    channel: "ticket-0087", topic: "Support ticket · opened by Tom F.",
    messages: botMsg("Today at 14:02", `<div class="embed" style="border-color:${HC.teal}"><h4>Ticket #0087 opened</h4><p style="margin:0;color:#b5bac1">Category: <b>Refund / purchase</b> · Priority: Normal</p><div class="ft">Staff notified · transcript will be saved on close</div></div>`) +
      userMsg("Tom F.", "#8b93a1", "Today at 14:03", "Bought the tuner pack twice by mistake, can I get the second one refunded?") +
      userMsg("Dana W.", HC.coral, "Today at 14:11", "Sure — I can see both orders. Refunding the second now, you'll get a confirmation by email.") +
      userMsg("Tom F.", "#8b93a1", "Today at 14:12", "Perfect, thanks!") +
      botMsg("Today at 14:14", `<div class="embed" style="border-color:#3ec66d"><h4>Ticket #0087 closed by Dana W.</h4><div class="fields"><div class="f"><b>Duration</b><span>12 min</span></div><div class="f"><b>Messages</b><span>4</span></div><div class="f"><b>Transcript</b><span>ticket-0087.html</span></div></div><div class="ft">Transcript posted to #ticket-transcripts</div></div>`),
    members: false,
  })
  // link
  return discordShell({
    channel: "general", topic: "Account linking · roles follow in-game rank",
    messages: userMsg("Sam L.", "#3ec66d", "Today at 12:40", "/link") + botMsg("Today at 12:40", `<div class="embed" style="border-color:#5865f2"><h4>Link your game account</h4><p style="margin:0;color:#b5bac1">Enter this code in game with <span class="mono">/link 7K4-Q2M</span>. It expires in 10 minutes.</p><div class="ft">Only you can see this</div></div>`) +
      botMsg("Today at 12:42", `<div class="embed" style="border-color:#3ec66d"><h4>Account linked</h4><div class="fields"><div class="f"><b>Discord</b><span>Sam L.</span></div><div class="f"><b>Character</b><span>Sam Lindqvist</span></div><div class="f"><b>In-game rank</b><span>Trusted</span></div></div><p style="margin:8px 0 0;color:#b5bac1">Roles added: <span class="tag ok">Whitelisted</span> <span class="tag info">Trusted</span></p><div class="ft">Roles re-sync whenever rank changes in game</div></div>`),
  })
}

/* ------------------------------------------------- community brand set */

export function discordBrand() {
  // Server icon, role icons and channel icons drawn from one palette.
  const role = (name, color) => `<div class="role"><i style="background:${color}"></i><b style="color:${color}">${name}</b></div>`
  const icon = (label, svg) => `<div class="ic">${svg}<span>${label}</span></div>`
  const glyph = (d, bg = HC.slate) => `<svg width="56" height="56" viewBox="0 0 56 56"><rect width="56" height="56" rx="14" fill="${bg}"/><path d="${d}" fill="${HC.sand}"/></svg>`
  const body = `<div class="page">
    <header><h1>Discord asset set</h1><span>Server icon · role icons · channel icons · banner</span></header>
    <div class="grid">
      <div class="card"><div class="lbl">Server icon</div><div class="row">${hcMark(160)}${hcMark(96)}${hcMark(64)}${hcMark(40)}${hcMark(24)}</div><small>512 · 256 · 128 · 64 · 32 px exports</small></div>
      <div class="card"><div class="lbl">Role colours</div><div class="roles">${role("Founder", HC.coral)}${role("Staff", "#e8b84a")}${role("Trusted", HC.teal)}${role("Whitelisted", "#6fb3a0")}${role("Member", "#8b93a1")}${role("Bot", "#5865f2")}</div><small>Colours are readable on Discord's dark and light themes</small></div>
      <div class="card"><div class="lbl">Channel icons</div><div class="icons">${icon("rules", glyph("M16 14h24v4H16zm0 8h24v4H16zm0 8h16v4H16z"))}${icon("announce", glyph("M14 24v8h6l10 8V16l-10 8zm22-2v12l6-2V24z"))}${icon("apply", glyph("M18 12h20v32H18zm4 8h12v3H22zm0 7h12v3H22zm0 7h8v3h-8z"))}${icon("support", glyph("M28 12a14 14 0 0 0-14 14v8h8V26h-4a10 10 0 0 1 20 0h-4v8h8v-8a14 14 0 0 0-14-14z"))}${icon("status", glyph("M14 34l8-10 8 6 12-14v10L30 38l-8-6-8 8z", HC.teal))}${icon("crew", glyph("M20 26a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm16 0a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 40c0-6 4-10 8-10s8 4 8 10zm16 0c0-6 4-10 8-10s8 4 8 10z"))}</div><small>56 px, drawn on a 4 px grid</small></div>
      <div class="card wide"><div class="lbl">Server banner · 960 × 540</div><div class="banner"><div class="bg"></div>${hcMark(110, "#fff", "rgba(255,255,255,.14)")}<div class="wm"><b>${HC.name}</b><span>Roleplay community · est. 2024</span></div></div></div>
    </div></div>`
  const style = `${T}
  html,body{background:${HC.sand}}.page{padding:44px 60px;color:#1f2430}header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:24px}h1{margin:0;font-size:24px}header span{color:#6b7480;font-size:13px}
  .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}.card{background:#fff;border-radius:12px;padding:24px;position:relative;min-height:250px;box-shadow:0 2px 10px rgba(0,0,0,.05)}.card.wide{grid-column:1/4;min-height:300px}
  .card .lbl{margin-bottom:16px;color:#6b7480}.card small{position:absolute;left:24px;bottom:16px;font-size:12px;color:#8b93a1}
  .row{display:flex;align-items:flex-end;gap:18px}.roles{display:flex;flex-direction:column;gap:8px}.role{display:flex;align-items:center;gap:10px;font-size:14px}.role i{width:14px;height:14px;border-radius:50%;display:block}
  .icons{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.ic{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;color:#6b7480}
  .banner{position:relative;height:228px;border-radius:10px;overflow:hidden;display:flex;align-items:center;gap:28px;padding:0 48px;color:#fff}.banner .bg{position:absolute;inset:0;background:linear-gradient(115deg,${HC.ink} 0 45%,${HC.teal} 45% 46%,${HC.slate} 46%)}.banner svg{position:relative}.wm{position:relative}.wm b{display:block;font-size:44px;font-weight:800;letter-spacing:.02em;line-height:1}.wm span{display:block;color:${HC.coral};font-weight:600;letter-spacing:.18em;text-transform:uppercase;font-size:12px;margin-top:10px}`
  return doc({ body, style, bg: HC.sand })
}

export function webBanners() {
  const banner = (w, h, label, scale) => `<div class="ab" style="width:${w * scale}px;height:${h * scale}px"><div class="bn" style="transform:scale(${scale});width:${w}px;height:${h}px"><div class="bg"></div>${hcMark(Math.round(Math.min(h * 0.6, 140)), "#fff", "rgba(255,255,255,.14)")}<div class="wm"><b style="font-size:${Math.round(Math.min(h * 0.28, 64))}px">${HC.name}</b><span style="font-size:${Math.round(Math.min(h * 0.1, 16))}px">Roleplay community</span></div></div><small>${label} · ${w}×${h}</small></div>`
  const body = `<div class="page"><header><h1>Web banner set</h1><span>Standard sizes, exported from one artboard</span></header>
    <div class="col">${banner(1200, 630, "Open Graph / link preview", 0.62)}${banner(728, 90, "Leaderboard", 1.0)}${banner(1920, 400, "Site header", 0.39)}</div>
    <div class="side">${banner(300, 250, "Medium rectangle", 1.0)}${banner(300, 600, "Half page", 0.5)}</div></div>`
  const style = `${T}
  html,body{background:${HC.sand}}.page{padding:40px 60px;color:#1f2430;display:grid;grid-template-columns:1fr 330px;gap:30px}header{grid-column:1/3;display:flex;justify-content:space-between;align-items:baseline}h1{margin:0;font-size:24px}header span{color:#6b7480;font-size:13px}
  .col{display:flex;flex-direction:column;gap:34px}.side{display:flex;flex-direction:column;gap:34px;align-items:flex-start}
  .ab{position:relative;overflow:hidden;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.14)}.ab small{position:absolute;left:0;bottom:-22px;font-size:12px;color:#6b7480;white-space:nowrap}
  .bn{position:absolute;left:0;top:0;transform-origin:0 0;display:flex;align-items:center;gap:28px;padding:0 5%}.bg{position:absolute;inset:0;background:linear-gradient(115deg,${HC.ink} 0 45%,${HC.teal} 45% 46%,${HC.slate} 46%)}.bn svg{position:relative;flex:none}.wm{position:relative;color:#fff}.wm b{display:block;font-weight:800;letter-spacing:.02em;line-height:1}.wm span{display:block;color:${HC.coral};font-weight:600;letter-spacing:.18em;text-transform:uppercase;margin-top:6px}`
  return doc({ body, style, bg: HC.sand })
}

export function overlayElements() {
  const body = `${gameBackdrop("dusk")}
  <div class="ov">
    <div class="alert"><div class="ic">${hcMark(34)}</div><div><b>New member</b><span>Elena B. joined Harbour City</span></div></div>
    <div class="alert a2"><div class="ic" style="background:${HC.coral};border-radius:9px;width:34px;height:34px"></div><div><b>Event starting</b><span>Car meet · Harbour Rd · 5 min</span></div></div>
    <div class="cam"><div class="cf"><span>CAMERA 16:9</span></div><div class="nm"><b>Dana W.</b><span>Founder · Harbour City</span></div></div>
    <div class="ticker"><span>${HC.name}</span><i></i><span>discord.gg/harbourcity</span><i></i><span>Whitelist open</span></div>
    <div class="brb"><div class="bg"></div>${hcMark(96)}<b>Back in a moment</b><span>Harbour City · Roleplay community</span></div>
  </div>`
  const style = `${T}
  .ov{position:absolute;inset:0;padding:40px 48px;color:#fff;font-weight:500}
  .alert{position:absolute;left:48px;top:40px;display:flex;align-items:center;gap:12px;background:rgba(18,24,31,.85);padding:10px 16px 10px 10px;border-radius:10px;border-left:4px solid ${HC.teal}}.alert.a2{top:110px;border-color:${HC.coral}}.alert b{display:block;font-size:14px}.alert span{font-size:12px;color:#c7cdd6}
  .cam{position:absolute;right:48px;bottom:120px;width:380px}.cf{aspect-ratio:16/9;background:#0b0f19;border:3px solid ${HC.teal};border-radius:8px;display:flex;align-items:center;justify-content:center;color:#5b6473;font-size:12px;letter-spacing:.14em}.nm{background:${HC.ink};padding:10px 16px;border-radius:0 0 8px 8px;margin-top:-4px}.nm b{display:block}.nm span{font-size:11px;color:${HC.coral};letter-spacing:.14em;text-transform:uppercase}
  .ticker{position:absolute;left:48px;right:48px;bottom:40px;height:40px;background:rgba(18,24,31,.85);border-radius:8px;display:flex;align-items:center;gap:18px;padding:0 18px;font-size:13px;letter-spacing:.06em}.ticker i{width:6px;height:6px;border-radius:50%;background:${HC.coral}}
  .brb{position:absolute;left:48px;top:200px;width:560px;height:315px;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}.brb .bg{position:absolute;inset:0;background:linear-gradient(115deg,${HC.ink} 0 60%,${HC.slate} 60%)}.brb svg,.brb b,.brb span{position:relative}.brb b{font-size:30px;font-weight:800}.brb span{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:${HC.coral}}`
  return doc({ body, style, bg: "#3b4a5c" })
}

export function specSheet() {
  const sw = (name, hex, dark = false) => `<div class="sw" style="background:${hex};color:${dark ? "#1b1b1b" : "#fff"}"><b>${name}</b><span class="mono">${hex}</span></div>`
  const body = `<div class="page"><header><h1>Specification sheet</h1><span>Palette · type pairing · spacing · export sizes</span></header>
    <div class="grid">
      <div class="card"><div class="lbl">Palette</div><div class="pal">${sw("Teal", HC.teal)}${sw("Coral", HC.coral)}${sw("Ink", HC.ink)}${sw("Slate", HC.slate)}${sw("Sand", HC.sand, true)}</div></div>
      <div class="card"><div class="lbl">Type pairing</div><div class="type"><div class="t1">Harbour City</div><div class="t2">Display · Segoe UI / Inter · 800 · tracking 2%</div><div class="t3">Body text is set in the same family at 400, 15 px / 1.5 line height, so Discord, web and overlay copy read the same.</div><div class="t2">Body · Segoe UI / Inter · 400</div></div></div>
      <div class="card"><div class="lbl">Clear space &amp; minimum size</div><div class="cs">${hcMark(120)}<div class="box"></div></div><small>Clear space = ¼ icon width · minimum 24 px</small></div>
      <div class="card"><div class="lbl">Export sizes</div><table><tr><th>Asset</th><th>Size</th><th>Format</th></tr><tr><td>Server icon</td><td class="mono">512 × 512</td><td>PNG</td></tr><tr><td>Server banner</td><td class="mono">960 × 540</td><td>PNG</td></tr><tr><td>Role / channel icons</td><td class="mono">56 × 56</td><td>SVG · PNG</td></tr><tr><td>Open Graph</td><td class="mono">1200 × 630</td><td>PNG</td></tr><tr><td>Site header</td><td class="mono">1920 × 400</td><td>PNG · WebP</td></tr><tr><td>Overlay elements</td><td class="mono">1920 × 1080</td><td>PNG (alpha)</td></tr></table></div>
    </div></div>`
  const style = `${T}
  html,body{background:${HC.sand}}.page{padding:44px 60px;color:#1f2430}header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:24px}h1{margin:0;font-size:24px}header span{color:#6b7480;font-size:13px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{background:#fff;border-radius:12px;padding:24px;position:relative;min-height:330px;box-shadow:0 2px 10px rgba(0,0,0,.05)}.card .lbl{margin-bottom:16px;color:#6b7480}.card small{position:absolute;left:24px;bottom:16px;font-size:12px;color:#8b93a1}
  .pal{display:flex;gap:10px}.sw{flex:1;height:200px;border-radius:8px;padding:12px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid rgba(0,0,0,.06)}.sw b{font-size:13px}.sw span{font-size:11px;opacity:.75}
  .type .t1{font-size:54px;font-weight:800;letter-spacing:.02em;line-height:1;color:${HC.ink}}.type .t2{font-size:12px;color:#8b93a1;margin:10px 0 22px;letter-spacing:.04em}.type .t3{font-size:15px;line-height:1.5;color:#2c3440;max-width:520px}
  .cs{position:relative;display:inline-block;padding:30px}.cs .box{position:absolute;inset:0;border:1px dashed #c9cbd2;border-radius:6px}
  table th{color:#8b93a1;border-color:#e6e4df}table td{border-color:#eeece7;color:#2c3440}`
  return doc({ body, style, bg: HC.sand })
}

/* ---------------------------------------------------- emotes & animations */

export function emoteMenu({ query = "wave", showConsent = false } = {}) {
  const cats = [["Everyday", 84], ["Social", 62], ["Props", 48], ["Dances", 36], ["Paired", 28], ["Walk styles", 24], ["Idles", 18]]
  const list = [["wave", "Wave", "Social", "F1", true], ["wave2", "Wave · big", "Social", "", false], ["wave3", "Wave · both hands", "Social", "", false], ["salute", "Salute", "Social", "F2", true], ["point", "Point", "Everyday", "", false], ["lean", "Lean · wall", "Idles", "", true], ["phone", "Phone · call", "Props", "F3", false], ["sitchair", "Sit · chair", "Everyday", "", false], ["handshake", "Handshake", "Paired", "", true], ["hug", "Hug", "Paired", "", false], ["dance1", "Dance · casual", "Dances", "F4", false]]
  const consent = `<div class="consent"><div class="lbl">Paired emote</div><b>Marcus B. wants to shake your hand</b><div class="row"><span class="btn p">Accept <span class="kbd">Y</span></span><span class="btn">Decline <span class="kbd">N</span></span></div><small>Declining does nothing to your character. Expires in 8 s.</small></div>`
  const body = `${gameBackdrop("day")}
  <div class="win">
    <aside><div class="ttl">Emotes</div>${cats.map(([c, n], i) => `<div class="ni${i === 1 ? " on" : ""}"><span>${c}</span><i>${n}</i></div>`).join("")}<div class="foot">Favourites <span class="kbd">★</span> · Keybinds <span class="kbd">K</span></div></aside>
    <main>
      <div class="search"><span class="q">${esc(query)}</span><span class="cur"></span><span class="hint">11 results</span></div>
      <div class="list">${list.map(([id, name, cat, key, fav], i) => `<div class="it${i === 0 ? " sel" : ""}"><span class="star${fav ? " on" : ""}">★</span><b>${name}</b><span class="cat">${cat}</span><span class="id mono">${id}</span>${key ? `<span class="kbd">${key}</span>` : `<span class="kbd dim">—</span>`}</div>`).join("")}</div>
      <div class="bar2"><span><span class="kbd">Enter</span> play</span><span><span class="kbd">★</span> favourite</span><span><span class="kbd">K</span> bind key</span><span><span class="kbd">X</span> cancel emote</span></span></div>
    </main>
  </div>${showConsent ? consent : ""}`
  const style = `${T}
  .win{position:absolute;left:80px;top:80px;width:760px;height:760px;display:grid;grid-template-columns:200px 1fr;background:#12161d;border:1px solid rgba(255,255,255,.09);border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,.6);color:#e6e9ee;overflow:hidden}
  aside{background:#0f131a;border-right:1px solid rgba(255,255,255,.07);padding:18px 12px;display:flex;flex-direction:column}.ttl{font-weight:700;font-size:16px;padding:4px 10px 16px}.ni{display:flex;justify-content:space-between;padding:9px 12px;border-radius:7px;font-size:13.5px;color:#aeb5c0;margin-bottom:2px}.ni i{font-style:normal;color:#6c7480;font-size:12px}.ni.on{background:rgba(74,155,232,.14);color:#dfe8f3}.foot{margin-top:auto;font-size:12px;color:#8b93a1;padding:10px}
  main{padding:18px 20px;display:flex;flex-direction:column}.search{background:#0f131a;border:1px solid rgba(74,155,232,.6);border-radius:8px;padding:11px 14px;font-size:14px;display:flex;align-items:center}.cur{width:2px;height:16px;background:#e6e9ee;margin-left:1px}.hint{margin-left:auto;font-size:12px;color:#8b93a1}
  .list{margin-top:14px;flex:1}.it{display:grid;grid-template-columns:24px 1fr 90px 90px 50px;align-items:center;gap:10px;padding:10px 10px;border-radius:7px;font-size:13.5px;border-bottom:1px solid rgba(255,255,255,.04)}.it.sel{background:rgba(74,155,232,.14)}.star{color:#3a3f46}.star.on{color:#e8b84a}.cat{color:#8b93a1;font-size:12px}.id{color:#6c7480;font-size:12px}.kbd.dim{color:#4a4f57}
  .bar2{display:flex;gap:18px;font-size:12px;color:#8b93a1;padding-top:12px;border-top:1px solid rgba(255,255,255,.07)}
  .consent{position:absolute;right:80px;top:120px;width:380px;background:#12161d;border:1px solid rgba(255,255,255,.09);border-left:4px solid #4a9be8;border-radius:10px;padding:16px 18px;color:#e6e9ee;box-shadow:0 20px 60px rgba(0,0,0,.6)}.consent b{display:block;font-size:16px;margin:6px 0 12px}.consent .row{display:flex;gap:8px}.consent small{display:block;margin-top:10px;font-size:12px;color:#8b93a1}
  .btn{display:inline-block;padding:8px 14px;border-radius:7px;font-size:13px;font-weight:600;background:rgba(255,255,255,.08);color:#e6e9ee}.btn.p{background:#4a9be8;color:#fff}`
  return doc({ body, style, bg: "#3b4a5c" })
}

/** Job sequence viewer: the steps of a scripted action with prop and cancel points. */
export function sequenceViewer({ job = "mechanic", seq = "tyre_change" } = {}) {
  const SEQ = {
    mechanic: { title: "Mechanic · Tyre change", steps: [["Approach wheel", "1.2 s", "—", "yes"], ["Kneel", "0.8 s", "—", "yes"], ["Loosen nuts", "3.0 s", "prop_wrench", "yes"], ["Remove wheel", "2.4 s", "prop_wheel", "no"], ["Fit new wheel", "2.4 s", "prop_wheel", "no"], ["Tighten nuts", "3.0 s", "prop_wrench", "yes"], ["Stand", "0.8 s", "—", "yes"]], exportName: "exports.ds_jobanims:play('mechanic.tyre_change', vehicle, wheelIndex)" },
    medic: { title: "Medic · Treat and load", steps: [["Kneel by patient", "0.9 s", "—", "yes"], ["Check vitals", "2.6 s", "prop_monitor", "yes"], ["Apply dressing", "3.2 s", "prop_bandage", "yes"], ["Prepare stretcher", "1.6 s", "prop_stretcher", "yes"], ["Lift to stretcher", "2.8 s", "prop_stretcher", "no"], ["Load into ambulance", "3.0 s", "prop_stretcher", "no"]], exportName: "exports.ds_jobanims:play('medic.treat_load', patient, ambulance)" },
    police: { title: "Police · Search and cuff", steps: [["Order hands", "0.6 s", "—", "yes"], ["Pat down", "3.4 s", "—", "yes"], ["Evidence bag", "1.8 s", "prop_evidence_bag", "yes"], ["Draw cuffs", "0.7 s", "prop_cuffs", "yes"], ["Cuff", "1.9 s", "prop_cuffs", "no"], ["Escort", "loop", "—", "yes"]], exportName: "exports.ds_jobanims:play('police.search_cuff', target)" },
  }[job]
  const total = SEQ.steps.reduce((a, s) => a + (parseFloat(s[1]) || 0), 0)
  let t = 0
  const blocks = SEQ.steps.map((s, i) => { const d = parseFloat(s[1]) || 1.2; const w = (d / (total + 1.2)) * 100; const el = `<div class="blk${i === 3 ? " on" : ""}" style="width:${w}%"><b>${i + 1}</b><span>${s[0]}</span>${s[3] === "no" ? `<i class="lock">locked</i>` : ""}</div>`; t += d; return el }).join("")
  const body = `${gameBackdrop("day")}
  <div class="win">
    <div class="hd"><div><div class="lbl">Sequence</div><h1>${SEQ.title}</h1></div><div class="meta"><span class="tag info">${SEQ.steps.length} steps</span><span class="tag">${total.toFixed(1)} s</span><span class="tag ok">cancellable</span></div></div>
    <div class="tl">${blocks}</div>
    <div class="legend"><span><i class="sw on"></i> current step</span><span><i class="sw lk"></i> not cancellable (prop in hand)</span><span><i class="sw"></i> cancel with <span class="kbd">X</span> returns to idle</span></div>
    <table><tr><th>#</th><th>Step</th><th>Duration</th><th>Prop</th><th>Cancel point</th></tr>${SEQ.steps.map((s, i) => `<tr class="${i === 3 ? "on" : ""}"><td class="mono">${String(i + 1).padStart(2, "0")}</td><td>${s[0]}</td><td class="mono">${s[1]}</td><td class="mono">${s[2]}</td><td>${s[3] === "yes" ? `<span class="tag ok">yes</span>` : `<span class="tag warn">after step</span>`}</td></tr>`).join("")}</table>
    <div class="exp"><div class="lbl">Trigger from your job script</div><div class="code mono">${esc(SEQ.exportName)}</div></div>
  </div>`
  const style = `${T}
  .win{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:1180px;background:#12161d;border:1px solid rgba(255,255,255,.09);border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,.6);color:#e6e9ee;padding:26px 30px}
  .hd{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px}h1{margin:2px 0 0;font-size:22px}.meta{display:flex;gap:8px}
  .tl{display:flex;gap:4px;height:74px;margin-bottom:10px}.blk{background:#1c2230;border:1px solid rgba(255,255,255,.08);border-radius:7px;padding:8px 10px;position:relative;overflow:hidden}.blk b{display:block;font-size:11px;color:#8b93a1}.blk span{display:block;font-size:12.5px;margin-top:4px;white-space:nowrap}.blk.on{background:rgba(74,155,232,.18);border-color:rgba(74,155,232,.6)}.blk .lock{position:absolute;right:8px;bottom:6px;font-size:10px;color:#f2cf78;font-style:normal;letter-spacing:.06em;text-transform:uppercase}
  .legend{display:flex;gap:22px;font-size:12px;color:#8b93a1;margin-bottom:16px}.legend .sw{display:inline-block;width:12px;height:12px;border-radius:3px;background:#1c2230;border:1px solid rgba(255,255,255,.12);vertical-align:-2px;margin-right:6px}.legend .sw.on{background:rgba(74,155,232,.4)}.legend .sw.lk{background:rgba(232,184,74,.3)}
  tr.on td{background:rgba(74,155,232,.08)}
  .exp{margin-top:18px}.code{background:#0f131a;border:1px solid rgba(255,255,255,.08);border-radius:7px;padding:12px 14px;font-size:13px;color:#8fc3f5;margin-top:8px}`
  return doc({ body, style, bg: "#3b4a5c" })
}

/* ------------------------------------------------------------ weapons */

export function attachmentDiagram() {
  // Side profile of a rifle as flat SVG shapes with callouts.
  const rifle = `<g fill="#2b2e33"><rect x="300" y="430" width="420" height="52" rx="6"/><rect x="700" y="438" width="220" height="36" rx="5" fill="#3d3a35"/><rect x="915" y="450" width="230" height="14" rx="4" fill="#1c1e22"/><rect x="120" y="436" width="190" height="42" rx="6" fill="#3d3a35"/><rect x="100" y="428" width="40" height="70" rx="6" fill="#3d3a35"/><path d="M420 482h60v110l-40 8z" fill="#3d3a35"/><path d="M500 482h44l14 120h-60z" fill="#1c1e22"/><rect x="330" y="418" width="380" height="12" rx="3" fill="#1c1e22"/></g>`
  const callout = (x, y, tx, ty, label, sub) => `<circle cx="${x}" cy="${y}" r="7" fill="${HC.coral}"/><line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${HC.coral}" stroke-width="2"/><text x="${tx + (tx < x ? -10 : 10)}" y="${ty - 6}" text-anchor="${tx < x ? "end" : "start"}" font-size="18" font-weight="600" fill="#f2f3f5" font-family="Segoe UI, Inter, Arial">${label}</text><text x="${tx + (tx < x ? -10 : 10)}" y="${ty + 16}" text-anchor="${tx < x ? "end" : "start"}" font-size="13" fill="#8b93a1" font-family="Segoe UI, Inter, Arial">${sub}</text>`
  const body = `<svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg"><rect width="1600" height="1000" fill="#12161d"/>
    <text x="70" y="80" font-size="26" font-weight="700" fill="#f2f3f5" font-family="Segoe UI, Inter, Arial">Attachment points · rifle class</text><text x="70" y="108" font-size="14" fill="#8b93a1" font-family="Segoe UI, Inter, Arial">Every weapon in the pack exposes the same four bones, so one attachment mesh fits its whole class.</text>
    <g transform="translate(180,90)">${rifle}
    ${callout(520, 418, 520, 250, "Optic rail · top", "bone: optic  ·  red dot, holo, 4× scope")}
    ${callout(1140, 457, 1180, 300, "Muzzle · suppressor", "bone: muzzle  ·  suppressor, compensator")}
    ${callout(810, 476, 860, 640, "Under-barrel · grip", "bone: grip  ·  vertical grip, angled grip")}
    ${callout(700, 476, 560, 700, "Side rail · light", "bone: light  ·  flashlight, laser")}
    </g>
    <g transform="translate(70,860)" font-family="Segoe UI, Inter, Arial"><rect width="1460" height="70" rx="10" fill="#171c25"/><text x="24" y="30" font-size="13" fill="#8b93a1" letter-spacing="1.5">CLASSES</text><text x="24" y="54" font-size="15" fill="#e6e9ee">Pistol ×4 · SMG ×3 · Rifle ×4 · Shotgun ×2 · Marksman ×2 — 15 weapons, one attachment standard</text><text x="1436" y="44" text-anchor="end" font-size="13" fill="#8b93a1">Attachment meshes included</text></g>
  </svg>`
  return doc({ body, style: "", bg: "#12161d" })
}

export function ballisticsLadder() {
  const W = [["Compact pistol", "Pistol", 24, 28, 18], ["Service pistol", "Pistol", 28, 32, 22], ["Heavy pistol", "Pistol", 36, 30, 34], ["Machine pistol", "Pistol", 18, 22, 30], ["SMG · compact", "SMG", 20, 40, 26], ["SMG · standard", "SMG", 22, 46, 24], ["SMG · heavy", "SMG", 26, 44, 32], ["Carbine", "Rifle", 30, 66, 38], ["Assault rifle", "Rifle", 34, 72, 44], ["Battle rifle", "Rifle", 44, 78, 56], ["Bullpup", "Rifle", 32, 70, 40], ["Pump shotgun", "Shotgun", 78, 18, 70], ["Semi-auto shotgun", "Shotgun", 66, 20, 60], ["Marksman rifle", "Marksman", 58, 92, 62], ["Sniper rifle", "Marksman", 96, 100, 88]]
  const bar = (v, c) => `<div class="bar"><i style="width:${v}%;background:${c}"></i></div>`
  const body = `<div class="page"><header><div><h1>Ballistics ladder</h1><span>Damage, range and recoil across all fifteen weapons — tuned as a set, so no weapon dominates its class</span></div><div class="meta"><span class="tag">values relative · 100 = pack maximum</span></div></header>
  <table><tr><th>Weapon</th><th>Class</th><th style="width:220px">Damage</th><th style="width:220px">Range</th><th style="width:220px">Recoil</th><th>Fire</th></tr>
  ${W.map(([n, c, d, r, k], i) => `<tr class="${["Pistol", "SMG", "Rifle", "Shotgun", "Marksman"].indexOf(c) % 2 ? "alt" : ""}"><td><b>${n}</b></td><td><span class="tag">${c}</span></td><td>${bar(d, "#e8554a")}<span class="v mono">${d}</span></td><td>${bar(r, "#4a9be8")}<span class="v mono">${r}</span></td><td>${bar(k, "#e8b84a")}<span class="v mono">${k}</span></td><td class="mono">${c === "Pistol" || c === "Marksman" || n.includes("Pump") ? "semi" : n.includes("Semi") ? "semi" : "auto"}</td></tr>`).join("")}
  </table><div class="note">Time-to-kill converges within each class; range separates classes. Balance notes are included with the pack.</div></div>`
  const style = `${T}
  html,body{background:#12161d}.page{padding:40px 60px;color:#e6e9ee}header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px}h1{margin:0;font-size:24px}header span{font-size:13px;color:#8b93a1;display:block;margin-top:4px}
  td{padding:8px 14px}tr.alt td{background:rgba(255,255,255,.02)}.bar{display:inline-block;width:160px;vertical-align:middle}.v{margin-left:10px;font-size:12px;color:#8b93a1}
  .note{margin-top:14px;font-size:13px;color:#8b93a1}`
  return doc({ body, style, bg: "#12161d" })
}

/* ------------------------------------------------------ clothing refs */

export function rankChart() {
  const chev = (n) => `<svg width="70" height="60" viewBox="0 0 70 60">${Array.from({ length: n }, (_, i) => `<path d="M8 ${12 + i * 12} L35 ${24 + i * 12} L62 ${12 + i * 12}" fill="none" stroke="#e8c46a" stroke-width="6" stroke-linecap="round"/>`).join("")}</svg>`
  const bars = (n, star = false) => `<svg width="70" height="60" viewBox="0 0 70 60">${Array.from({ length: n }, (_, i) => `<rect x="${12 + i * 16}" y="14" width="10" height="32" rx="2" fill="#e8c46a"/>`).join("")}${star ? `<path d="M35 6l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#e8c46a" transform="translate(0,20) scale(.7) translate(15,0)"/>` : ""}</svg>`
  const ranks = [["Officer", chev(0)], ["Senior officer", chev(1)], ["Corporal", chev(2)], ["Sergeant", chev(3)], ["Lieutenant", bars(1)], ["Captain", bars(2)], ["Commander", bars(3)], ["Chief", bars(1, true)]]
  const services = [["Police", "#1b2a44", "#dfe3e6"], ["Fire", "#1f2a3a", "#c8b04a"], ["EMS", "#f4f4f2", "#2e6b3f"]]
  const variants = ["Patrol", "Tactical", "Dress", "Utility"]
  const body = `<div class="page"><header><h1>Rank reference &amp; variant matrix</h1><span>Insignia are on their own texture layer; patches rebrand without touching the base</span></header>
    <div class="ranks">${ranks.map(([n, svg]) => `<div class="rk">${svg}<b>${n}</b></div>`).join("")}</div>
    <table><tr><th>Service</th>${variants.map((v) => `<th>${v}</th>`).join("")}<th>Meshes</th></tr>
    ${services.map(([s, a, b]) => `<tr><td><b>${s}</b></td>${variants.map((v) => `<td><div class="sw"><i style="background:${a}"></i><i style="background:${v === "Tactical" ? "#23262b" : v === "Dress" ? a : b}"></i><i style="background:${v === "Utility" ? "#c8b04a" : b}"></i></div><span>${v}</span></td>`).join("")}<td class="mono">male · female</td></tr>`).join("")}
    </table>
    <div class="note">12 uniform sets (3 services × 4 variants) × 2 body meshes · 8 ranks · patch source files (PSD) included</div></div>`
  const style = `${T}
  html,body{background:#12161d}.page{padding:44px 60px;color:#e6e9ee}header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px}h1{margin:0;font-size:24px}header span{color:#8b93a1;font-size:13px}
  .ranks{display:grid;grid-template-columns:repeat(8,1fr);gap:12px;margin-bottom:26px}.rk{background:#171c25;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:6px}.rk b{font-size:12.5px;font-weight:600;color:#c7cdd6}
  td{padding:14px}.sw{display:flex;gap:4px;margin-bottom:6px}.sw i{width:34px;height:34px;border-radius:6px;display:block;border:1px solid rgba(255,255,255,.08)}td span{font-size:12px;color:#8b93a1}
  .note{margin-top:16px;font-size:13px;color:#8b93a1}`
  return doc({ body, style, bg: "#12161d" })
}

export function componentTable({ title = "Component ID reference", rows }) {
  const body = `<div class="page"><header><h1>${esc(title)}</h1><span>Every item's component slot, drawable ID and texture variants — so nothing collides with sets you already stream</span></header>
    <table><tr><th>Component</th><th>Slot</th><th>Drawable range</th><th>Items</th><th>Textures / item</th><th>Meshes</th><th>Notes</th></tr>
    ${rows.map((r) => `<tr><td><b>${r[0]}</b></td><td class="mono">${r[1]}</td><td class="mono">${r[2]}</td><td class="mono">${r[3]}</td><td class="mono">${r[4]}</td><td>${r[5]}</td><td style="color:#8b93a1">${r[6]}</td></tr>`).join("")}
    </table><div class="note">IDs start above the base game range and are contiguous per slot; the sheet is also included as CSV.</div></div>`
  const style = `${T}
  html,body{background:#12161d}.page{padding:44px 60px;color:#e6e9ee}header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px}h1{margin:0;font-size:24px}header span{color:#8b93a1;font-size:13px;max-width:700px;text-align:right}
  td{padding:12px 14px}.note{margin-top:16px;font-size:13px;color:#8b93a1}`
  return doc({ body, style, bg: "#12161d" })
}

/* ---------------------------------------------------------- documents */

/** A rendered document page: title, meta, sections of paragraphs / checklists / tables. */
export function docPage({ kicker, title, meta, sections, page = "1 / 12", accent = HC.teal }) {
  const render = (sec) => {
    if (sec.list) return `<h2>${esc(sec.h)}</h2><ul>${sec.list.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`
    if (sec.check) return `<h2>${esc(sec.h)}</h2><div class="cl">${sec.check.map(([done, l, who]) => `<div class="ck"><i class="${done ? "on" : ""}"></i><span>${esc(l)}</span>${who ? `<em>${esc(who)}</em>` : ""}</div>`).join("")}</div>`
    if (sec.table) return `<h2>${esc(sec.h)}</h2><table>${sec.table.map((r, i) => `<tr>${r.map((c) => i ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`).join("")}</tr>`).join("")}</table>`
    return `<h2>${esc(sec.h)}</h2>${sec.p.map((p) => `<p>${esc(p)}</p>`).join("")}`
  }
  const body = `<div class="sheet"><div class="kick" style="color:${accent}">${esc(kicker)}</div><h1>${esc(title)}</h1><div class="meta">${esc(meta)}</div><div class="cols">${sections.map(render).join("")}</div><div class="pg">${esc(page)}</div></div>`
  const style = `${T}
  html,body{background:#d9d6cf}.sheet{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:1400px;height:900px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.25);padding:58px 70px;color:#1f2430;overflow:hidden}
  .kick{font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:700}h1{margin:8px 0 6px;font-size:34px;letter-spacing:-.01em}.meta{font-size:13px;color:#6b7480;margin-bottom:26px;padding-bottom:16px;border-bottom:2px solid #eeece7}
  .cols{column-count:2;column-gap:56px;font-size:14px;line-height:1.55}h2{font-size:15px;margin:0 0 8px;break-after:avoid;color:#1f2430}p{margin:0 0 14px;color:#3a4150}ul{margin:0 0 16px;padding-left:18px;color:#3a4150}li{margin-bottom:4px}
  .cl{margin-bottom:16px;break-inside:avoid}.ck{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #f0eee9}.ck i{width:16px;height:16px;border:2px solid #b8bcc4;border-radius:4px;display:block;flex:none}.ck i.on{background:${accent};border-color:${accent}}.ck em{margin-left:auto;font-style:normal;font-size:12px;color:#8b93a1}
  table{margin-bottom:16px;break-inside:avoid}th{color:#6b7480;border-color:#e6e4df;padding:8px 10px}td{padding:8px 10px;border-color:#eeece7;font-size:13px;color:#3a4150}
  .pg{position:absolute;right:70px;bottom:36px;font-size:12px;color:#8b93a1}`
  return doc({ body, style, bg: "#d9d6cf" })
}

/* ------------------------------------------------------------- bundles */

/** "What's in the box": the real rendered covers of the bundle's products. */
export function bundleGrid({ title, sub, tiles, cols = 3, dark = true }) {
  const img = (slug) => {
    const p = localPath(slug, "cover.webp")
    if (!existsSync(p)) return ""
    return `data:image/webp;base64,${readFileSync(p).toString("base64")}`
  }
  const body = `<div class="page"><header><h1>${esc(title)}</h1><span>${esc(sub)}</span></header>
    <div class="grid" style="grid-template-columns:repeat(${cols},1fr)">${tiles.map((t) => { const src = img(t.slug); return `<div class="tile">${src ? `<img src="${src}">` : `<div class="ph"></div>`}<div class="cap"><b>${esc(t.label)}</b><span>${esc(t.kind)}</span></div></div>` }).join("")}</div></div>`
  const style = `${T}
  html,body{background:${dark ? "#12161d" : HC.sand}}.page{padding:36px 48px;color:${dark ? "#e6e9ee" : "#1f2430"}}header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:18px}h1{margin:0;font-size:22px}header span{color:#8b93a1;font-size:13px}
  .grid{display:grid;gap:14px}.tile{background:${dark ? "#171c25" : "#fff"};border:1px solid ${dark ? "rgba(255,255,255,.07)" : "#e6e4df"};border-radius:10px;overflow:hidden}.tile img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover}.ph{aspect-ratio:16/10;background:#222831}
  .cap{display:flex;justify-content:space-between;align-items:baseline;padding:9px 12px}.cap b{font-size:13px}.cap span{font-size:11px;color:#8b93a1;letter-spacing:.04em;text-transform:uppercase}`
  return doc({ body, style, bg: dark ? "#12161d" : HC.sand })
}
