// Original 12×12 pixel-art item icons for the Minecraft plugin mockups.
// <canvas data-icon="sword"></canvas> — drawn at 12×12 and scaled with CSS
// (image-rendering: pixelated). No game assets are used.
const PAL = {
  k: "#17181c", w: "#eef2f6", g: "#a3acb6", d: "#5b636d", b: "#9a6433", B: "#5c3a1a",
  y: "#f5cf4e", Y: "#b8871f", c: "#5ee6da", C: "#1f9e94", r: "#ea4d52", R: "#98262a",
  p: "#c084f5", P: "#6e3aa0", G: "#5fc861", h: "#2d7a31", o: "#ff9d3d", s: "#d9b98a",
}
const ICONS = {
  sword: [
    "..........kk", ".........kwk", "........kwgk", ".......kwgk.", "......kwgk..", "..k..kwgk...",
    "..kk.kgk....", "...kkyk.....", "...kyBYk....", "..kyk.kBk...", ".kBk...kk...", ".kk.........",
  ],
  pick: [
    "..kkkkkkk...", ".kccccccck..", "kcCkkkkkCck.", "kk...kBkkck.", ".....kBk.kk.", "....kBk.....",
    "...kBk......", "..kBk.......", ".kBk........", "kBk.........", "kk..........", "............",
  ],
  gem: [
    "............", "...kkkkkk...", "..kcwcccck..", ".kcwccccCck.", "kkkkkkkkkkkk", ".kcccccccCk.",
    "..kcccccCk..", "...kccccCk..", "....kccCk...", ".....kCk....", "......k.....", "............",
  ],
  key: [
    "............", ".kkkk.......", "kyyyyk......", "kykkyk......", "kyyyykkkkkkk", ".kkkkyyyyyyk",
    ".....kkkyYyk", ".......kyk.k", ".......kk...", "............", "............", "............",
  ],
  apple: [
    ".....kk.....", "......kGk...", "...kkkhkkk..", "..krrrrrwrk.", ".krrrrrrrwk.", ".krrrrrrrrk.",
    ".krrrrrrrRk.", ".krrrrrrRRk.", "..krrrrRRk..", "...kkRRkk...", ".....kk.....", "............",
  ],
  potion: [
    "....kkkk....", "....kssk....", ".....kk.....", "....kwwk....", "...kwppwk...", "..kwppppPk..",
    ".kppppppPPk.", ".kpwppppPPk.", ".kppppppPPk.", "..kPPPPPPk..", "...kkkkkk...", "............",
  ],
  book: [
    "............", ".kkkkkkkkk..", ".kRRRRRRRwk.", ".kRyyyyyRwk.", ".kRRRRRRRwk.", ".kRyyyRRRwk.",
    ".kRRRRRRRwk.", ".kRRRRRRRwk.", ".kRRRRRRRwk.", ".kkkkkkkkwk.", "..kwwwwwwwk.", "...kkkkkkk..",
  ],
  coin: [
    "............", "...kkkkkk...", "..kyyyyyyk..", ".kyywyyyYYk.", ".kywyyyyyYk.", ".kyyyYYyyYk.",
    ".kyyyYYyyYk.", ".kyyyyyyyYk.", ".kYyyyyyYYk.", "..kYYYYYYk..", "...kkkkkk...", "............",
  ],
  chest: [
    "............", ".kkkkkkkkkk.", ".kbbbbbbbbk.", ".kbBbbbbBbk.", ".kkkkggkkkk.", ".kbbbkgkbbk.",
    ".kbbbbkbbbk.", ".kbBbbbbBbk.", ".kbbbbbbbbk.", ".kkkkkkkkkk.", "............", "............",
  ],
  star: [
    ".....kk.....", ".....kyk....", "....kyyk....", "kkkkkyyykkkk", "kyyyyyywyyyk", ".kyyyyyyyyk.",
    "..kyyyyyyk..", "..kyyYYyyk..", ".kyyk..kyyk.", ".kyk....kyk.", ".kk......kk.", "............",
  ],
  bread: [
    "............", "............", "...kkkkkk...", "..koooooook.", ".kosoosoooYk", ".koooooooooY",
    ".kYoooooooYk", "..kYYYYYYYk.", "...kkkkkkk..", "............", "............", "............",
  ],
  block: [
    "kkkkkkkkkkkk", "kGGGGGGGGGGk", "kGhGGGhGGGGk", "kbbbGbbbbGbk", "kbBbbbbBbbbk", "kbbbbbbbbbbk",
    "kbbBbbbbbBbk", "kbbbbbBbbbbk", "kbBbbbbbbbbk", "kbbbbbbbBbbk", "kbbbBbbbbbbk", "kkkkkkkkkkkk",
  ],
}
for (const cv of document.querySelectorAll("canvas[data-icon]")) {
  const grid = ICONS[cv.dataset.icon]
  if (!grid) continue
  cv.width = 12
  cv.height = 12
  const ctx = cv.getContext("2d")
  grid.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === ".") return
    ctx.fillStyle = PAL[ch]
    ctx.fillRect(x, y, 1, 1)
  }))
}
