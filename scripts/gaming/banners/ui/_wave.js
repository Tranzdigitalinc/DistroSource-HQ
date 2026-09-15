// Deterministic waveform SVGs for the Sound Library interfaces.
// <svg data-wave="seed" data-shape="siren|engine|horn|amb" data-bars="120"></svg>
function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}
const SHAPES = {
  siren: (t) => 0.55 + 0.4 * Math.abs(Math.sin(t * Math.PI * 3)),
  engine: (t) => 0.35 + 0.5 * Math.min(1, t * 2.4) * (0.75 + 0.25 * Math.sin(t * 40)),
  horn: (t) => (t < 0.08 ? t / 0.08 : t > 0.8 ? (1 - t) / 0.2 : 1) * 0.9,
  amb: (t) => 0.3 + 0.25 * Math.sin(t * 9) + 0.15 * Math.sin(t * 23),
}
for (const svg of document.querySelectorAll("svg[data-wave]")) {
  const r = rng(Number(svg.dataset.wave))
  const shape = SHAPES[svg.dataset.shape] || SHAPES.amb
  const n = Number(svg.dataset.bars || 100)
  const color = svg.dataset.color || "currentColor"
  const played = Number(svg.dataset.played || 0)
  svg.setAttribute("viewBox", `0 0 ${n * 4} 100`)
  svg.setAttribute("preserveAspectRatio", "none")
  let html = ""
  for (let i = 0; i < n; i++) {
    const a = Math.max(0.06, Math.min(1, shape(i / n) * (0.65 + r() * 0.35)))
    const h = a * 96
    const fill = i / n < played ? color : svg.dataset.dim || "#3a4756"
    html += `<rect x="${i * 4}" y="${50 - h / 2}" width="2.6" height="${h}" rx="1.3" fill="${fill}"/>`
  }
  svg.innerHTML = html
}
