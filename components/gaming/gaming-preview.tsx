import type {
  GamingArt,
  GamingArtApp,
  GamingArtBar,
  GamingInteriorProp,
  GamingInteriorTone,
  GamingWorldSky,
  GamingWorldStructure,
} from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

/**
 * Rendered product scenes for the Gaming department.
 *
 * A gaming storefront is scanned visually: the buyer wants to see the lit
 * interior, the built world, the interface in use. So these are drawn as
 * scenes with materials, depth and light — not outlines on a grid.
 *
 * They are illustrations by DistroSource. They are not screen captures, and
 * they are never presented as such: the gallery says so, and `product.images`
 * takes precedence for every product that has real captures.
 *
 * Fully deterministic — the scene is data, so server and client render
 * identical markup and nothing shifts on hydration.
 */

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace"
const ACCENT = "#f26522"

/** Stable per-scene suffix so gradient ids never collide across previews. */
function hashArt(art: GamingArt) {
  const raw = JSON.stringify(art)
  let h = 5381
  for (let i = 0; i < raw.length; i++) h = ((h << 5) + h + raw.charCodeAt(i)) >>> 0
  return h.toString(36)
}

/* ------------------------------------------------------------- interiors */

interface InteriorPalette {
  floorNear: string
  floorFar: string
  wall: string
  wallShade: string
  ceiling: string
  glow: string
  glowStop: string
  prop: string
  propShade: string
  trim: string
}

const INTERIOR_PALETTES: Record<GamingInteriorTone, InteriorPalette> = {
  warm: {
    floorNear: "#5a3f2b",
    floorFar: "#7a5a3d",
    wall: "#4a3d33",
    wallShade: "#332a23",
    ceiling: "#2b2320",
    glow: "#ffc478",
    glowStop: "#ff9d3c",
    prop: "#8a6a45",
    propShade: "#5d4630",
    trim: "#c99a5f",
  },
  cool: {
    floorNear: "#232b38",
    floorFar: "#34404f",
    wall: "#2c3644",
    wallShade: "#1d242e",
    ceiling: "#171d25",
    glow: "#8fc4ff",
    glowStop: "#4a86c9",
    prop: "#42505f",
    propShade: "#2b3541",
    trim: "#7fa8cf",
  },
  clinical: {
    floorNear: "#252d3a",
    floorFar: "#39465a",
    wall: "#465468",
    wallShade: "#2c3646",
    ceiling: "#1d242f",
    glow: "#d6ecff",
    glowStop: "#6f9fc8",
    prop: "#54637a",
    propShade: "#333e4f",
    trim: "#8fb2d0",
  },
  neon: {
    floorNear: "#160f22",
    floorFar: "#2a1a3d",
    wall: "#241733",
    wallShade: "#160e21",
    ceiling: "#100a19",
    glow: "#ff5fb0",
    glowStop: "#7b3fd4",
    prop: "#3a2452",
    propShade: "#241635",
    trim: "#ff7ac2",
  },
  showroom: {
    floorNear: "#2b3038",
    floorFar: "#454c57",
    wall: "#3a424c",
    wallShade: "#272d35",
    ceiling: "#1e232a",
    glow: "#fff4e0",
    glowStop: "#ffcf94",
    prop: "#525b67",
    propShade: "#363d47",
    trim: "#d8b98a",
  },
}

/** Room box: back wall at the centre, floor and ceiling receding to it. */
const BACK = { x1: 132, y1: 88, x2: 268, y2: 182 }

/**
 * Props sit at a depth 0 (far) to 1 (near); everything scales toward the
 * viewer so the room reads three-dimensionally. Near props are deliberately
 * large and pushed to the edges — they frame the shot instead of sitting in
 * a neat row in the middle distance.
 */
function propGeometry(depth: number, lane: number) {
  const scale = 0.46 + depth * 0.92
  const floorY = BACK.y2 + (300 - BACK.y2) * depth
  const halfRoom = (BACK.x2 - BACK.x1) / 2 + ((400 - (BACK.x2 - BACK.x1)) / 2) * depth
  const cx = 200 + lane * halfRoom * 0.74
  return { cx, floorY, scale }
}

function InteriorProp({
  kind,
  depth,
  lane,
  palette,
  id,
}: {
  kind: GamingInteriorProp
  depth: number
  lane: number
  palette: InteriorPalette
  id: string
}) {
  const { cx, floorY, scale } = propGeometry(depth, lane)
  const w = 62 * scale
  const h = 42 * scale
  const tall = 74 * scale

  const shadow = (
    <ellipse cx={cx} cy={floorY + 2} rx={w * 0.72} ry={6 * scale} fill="#000" opacity="0.32" />
  )

  switch (kind) {
    case "car":
      return (
        <g>
          {shadow}
          {/* Body */}
          <path
            d={`M ${cx - w * 1.05} ${floorY} q 0 ${-h * 0.5} ${w * 0.34} ${-h * 0.58} l ${w * 0.3} ${-h * 0.42} q ${w * 0.45} ${-h * 0.12} ${w * 0.82} 0 l ${w * 0.32} ${h * 0.44} q ${w * 0.32} ${h * 0.1} ${w * 0.32} ${h * 0.56} z`}
            fill={`url(#car-${id})`}
            stroke={palette.trim}
            strokeWidth={0.8 * scale}
          />
          {/* Glass */}
          <path
            d={`M ${cx - w * 0.42} ${floorY - h * 0.58} l ${w * 0.24} ${-h * 0.34} q ${w * 0.38} ${-h * 0.1} ${w * 0.66} 0 l ${w * 0.24} ${h * 0.34} z`}
            fill={palette.glow}
            opacity="0.34"
          />
          <circle cx={cx - w * 0.58} cy={floorY} r={9 * scale} fill="#12151a" />
          <circle cx={cx - w * 0.58} cy={floorY} r={4 * scale} fill={palette.trim} opacity="0.7" />
          <circle cx={cx + w * 0.6} cy={floorY} r={9 * scale} fill="#12151a" />
          <circle cx={cx + w * 0.6} cy={floorY} r={4 * scale} fill={palette.trim} opacity="0.7" />
        </g>
      )
    case "cell":
      return (
        <g>
          {shadow}
          <rect x={cx - w * 0.8} y={floorY - tall} width={w * 1.6} height={tall} fill={palette.propShade} />
          <rect
            x={cx - w * 0.8}
            y={floorY - tall}
            width={w * 1.6}
            height={tall}
            fill="none"
            stroke={palette.trim}
            strokeWidth={1.2 * scale}
          />
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={i}
              x1={cx - w * 0.66 + (i * w * 1.32) / 5}
              y1={floorY - tall + 3 * scale}
              x2={cx - w * 0.66 + (i * w * 1.32) / 5}
              y2={floorY - 2 * scale}
              stroke={palette.trim}
              strokeWidth={1.6 * scale}
              opacity="0.85"
            />
          ))}
        </g>
      )
    case "bar":
    case "counter":
      return (
        <g>
          {shadow}
          <rect x={cx - w} y={floorY - h * 1.1} width={w * 2} height={h * 1.1} fill={palette.prop} />
          <rect x={cx - w * 1.06} y={floorY - h * 1.25} width={w * 2.12} height={h * 0.2} rx={2 * scale} fill={palette.trim} />
          <rect x={cx - w * 0.9} y={floorY - h * 0.7} width={w * 1.8} height={h * 0.06} fill={palette.propShade} opacity="0.8" />
        </g>
      )
    case "sofa":
      return (
        <g>
          {shadow}
          <rect x={cx - w} y={floorY - h * 0.9} width={w * 2} height={h * 0.9} rx={4 * scale} fill={palette.prop} />
          <rect x={cx - w} y={floorY - h * 1.35} width={w * 2} height={h * 0.55} rx={4 * scale} fill={palette.propShade} />
          <rect x={cx - w * 0.9} y={floorY - h * 0.95} width={w * 0.82} height={h * 0.3} rx={3 * scale} fill={palette.trim} opacity="0.45" />
        </g>
      )
    case "shelf":
    case "locker":
      return (
        <g>
          {shadow}
          <rect x={cx - w * 0.72} y={floorY - tall} width={w * 1.44} height={tall} fill={palette.prop} />
          {[0.25, 0.5, 0.75].map((f) => (
            <rect
              key={f}
              x={cx - w * 0.72}
              y={floorY - tall + tall * f}
              width={w * 1.44}
              height={2 * scale}
              fill={palette.propShade}
            />
          ))}
          <rect
            x={cx - w * 0.72}
            y={floorY - tall}
            width={w * 1.44}
            height={tall}
            fill="none"
            stroke={palette.trim}
            strokeWidth={0.8 * scale}
            opacity="0.6"
          />
        </g>
      )
    case "screen":
      return (
        <g>
          <rect x={cx - w * 0.8} y={floorY - tall} width={w * 1.6} height={tall * 0.62} rx={2 * scale} fill="#0d1017" />
          <rect
            x={cx - w * 0.74}
            y={floorY - tall + 3 * scale}
            width={w * 1.48}
            height={tall * 0.62 - 6 * scale}
            fill={palette.glow}
            opacity="0.5"
          />
          <rect x={cx - w * 0.08} y={floorY - tall * 0.38} width={w * 0.16} height={tall * 0.3} fill={palette.propShade} />
          {shadow}
        </g>
      )
    case "plant":
      return (
        <g>
          {shadow}
          <path
            d={`M ${cx} ${floorY - h * 0.3} q ${-w * 0.5} ${-h * 0.9} ${-w * 0.12} ${-h * 1.5} q ${w * 0.42} ${h * 0.35} ${w * 0.12} ${h * 1.5} z`}
            fill="#4f7f45"
          />
          <path
            d={`M ${cx} ${floorY - h * 0.3} q ${w * 0.55} ${-h * 0.8} ${w * 0.16} ${-h * 1.4} q ${-w * 0.46} ${h * 0.3} ${-w * 0.16} ${h * 1.4} z`}
            fill="#3f6a38"
          />
          <path
            d={`M ${cx - w * 0.26} ${floorY - h * 0.32} h ${w * 0.52} l ${-w * 0.08} ${h * 0.32} h ${-w * 0.36} z`}
            fill={palette.propShade}
          />
        </g>
      )
    case "crate":
      return (
        <g>
          {shadow}
          <rect x={cx - w * 0.5} y={floorY - h * 0.9} width={w} height={h * 0.9} fill={palette.prop} />
          <line x1={cx - w * 0.5} y1={floorY - h * 0.9} x2={cx + w * 0.5} y2={floorY} stroke={palette.propShade} strokeWidth={1.4 * scale} />
          <line x1={cx + w * 0.5} y1={floorY - h * 0.9} x2={cx - w * 0.5} y2={floorY} stroke={palette.propShade} strokeWidth={1.4 * scale} />
        </g>
      )
    case "table":
    case "desk":
    default:
      return (
        <g>
          {shadow}
          <rect x={cx - w} y={floorY - h * 0.82} width={w * 2} height={h * 0.16} rx={2 * scale} fill={palette.trim} />
          <rect x={cx - w * 0.9} y={floorY - h * 0.66} width={w * 0.14} height={h * 0.66} fill={palette.propShade} />
          <rect x={cx + w * 0.76} y={floorY - h * 0.66} width={w * 0.14} height={h * 0.66} fill={palette.propShade} />
          <rect x={cx - w * 0.55} y={floorY - h * 0.62} width={w * 1.1} height={h * 0.42} fill={palette.prop} />
        </g>
      )
  }
}

function Interior({ tone, props, id }: { tone: GamingInteriorTone; props: GamingInteriorProp[]; id: string }) {
  const p = INTERIOR_PALETTES[tone]
  // Alternate sides and walk toward the viewer. Lane widens with depth so the
  // nearest props sit at the frame edges rather than stacking down the centre.
  const shown = props.slice(0, 5)
  const placed = shown.map((kind, i) => {
    const depth = 0.3 + (i / Math.max(1, shown.length - 1)) * 0.62
    return { kind, depth, lane: (i % 2 === 0 ? -1 : 1) * (0.5 + depth * 0.62) }
  })

  return (
    <g>
      <defs>
        <linearGradient id={`floor-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={p.floorNear} />
          <stop offset="100%" stopColor={p.floorFar} />
        </linearGradient>
        <linearGradient id={`wallL-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={p.wallShade} />
          <stop offset="100%" stopColor={p.wall} />
        </linearGradient>
        <linearGradient id={`wallR-${id}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor={p.wallShade} />
          <stop offset="100%" stopColor={p.wall} />
        </linearGradient>
        <radialGradient id={`glow-${id}`} cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor={p.glow} stopOpacity="0.55" />
          <stop offset="60%" stopColor={p.glowStop} stopOpacity="0.14" />
          <stop offset="100%" stopColor={p.glowStop} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`car-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.trim} />
          <stop offset="100%" stopColor={p.propShade} />
        </linearGradient>
        <linearGradient id={`vign-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.34" />
          <stop offset="40%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      {/* Room shell */}
      <rect width="400" height="300" fill={p.ceiling} />
      <polygon points={`0,300 400,300 ${BACK.x2},${BACK.y2} ${BACK.x1},${BACK.y2}`} fill={`url(#floor-${id})`} />
      <polygon points={`0,0 400,0 ${BACK.x2},${BACK.y1} ${BACK.x1},${BACK.y1}`} fill={p.ceiling} />
      <polygon points={`0,0 ${BACK.x1},${BACK.y1} ${BACK.x1},${BACK.y2} 0,300`} fill={`url(#wallL-${id})`} />
      <polygon points={`400,0 ${BACK.x2},${BACK.y1} ${BACK.x2},${BACK.y2} 400,300`} fill={`url(#wallR-${id})`} />
      <rect x={BACK.x1} y={BACK.y1} width={BACK.x2 - BACK.x1} height={BACK.y2 - BACK.y1} fill={p.wall} />

      {/* Wall panelling and skirting, so the walls are not flat fills */}
      <g opacity="0.5">
        <line x1="0" y1="272" x2={BACK.x1} y2={BACK.y2 - 8} stroke={p.trim} strokeWidth="2" />
        <line x1="400" y1="272" x2={BACK.x2} y2={BACK.y2 - 8} stroke={p.trim} strokeWidth="2" />
        <line x1={BACK.x1} y1={BACK.y2 - 8} x2={BACK.x2} y2={BACK.y2 - 8} stroke={p.trim} strokeWidth="1.5" />
        <line x1="0" y1="34" x2={BACK.x1} y2={BACK.y1 + 12} stroke={p.trim} strokeWidth="1" opacity="0.6" />
        <line x1="400" y1="34" x2={BACK.x2} y2={BACK.y1 + 12} stroke={p.trim} strokeWidth="1" opacity="0.6" />
      </g>

      {/* Back-wall opening: the light source the whole room reads from */}
      <rect x={172} y={BACK.y1 + 12} width={56} height={BACK.y2 - BACK.y1 - 12} fill={p.glow} opacity="0.62" />
      <rect x={181} y={BACK.y1 + 22} width={38} height={BACK.y2 - BACK.y1 - 22} fill="#fff" opacity="0.22" />
      <rect
        x={172}
        y={BACK.y1 + 12}
        width={56}
        height={BACK.y2 - BACK.y1 - 12}
        fill="none"
        stroke={p.trim}
        strokeWidth="1.5"
        opacity="0.85"
      />

      {/* Light spilling out of the opening across the floor */}
      <polygon points={`172,${BACK.y2} 228,${BACK.y2} 320,300 80,300`} fill={p.glow} opacity="0.16" />
      <polygon points={`181,${BACK.y2} 219,${BACK.y2} 268,300 132,300`} fill={p.glow} opacity="0.12" />

      {/* Floor perspective lines */}
      <g opacity="0.22">
        {[-1, -0.6, -0.25, 0.25, 0.6, 1].map((lane, i) => {
          const x = 200 + lane * 200
          const bx = 200 + lane * ((BACK.x2 - BACK.x1) / 2)
          return <line key={i} x1={x} y1="300" x2={bx} y2={BACK.y2} stroke={p.trim} strokeWidth="1" />
        })}
        {[0.25, 0.5, 0.78].map((d) => {
          const y = BACK.y2 + (300 - BACK.y2) * d
          const half = (BACK.x2 - BACK.x1) / 2 + ((400 - (BACK.x2 - BACK.x1)) / 2) * d
          return <line key={d} x1={200 - half} y1={y} x2={200 + half} y2={y} stroke={p.trim} strokeWidth="1" />
        })}
      </g>

      {/* Ceiling lights */}
      {[0.34, 0.62].map((d) => {
        const y = BACK.y1 - BACK.y1 * d * 0.55
        const half = (BACK.x2 - BACK.x1) / 2 + ((400 - (BACK.x2 - BACK.x1)) / 2) * d
        return (
          <rect key={d} x={200 - half * 0.34} y={y} width={half * 0.68} height={3 + d * 3} rx="2" fill={p.glow} opacity="0.75" />
        )
      })}

      <rect width="400" height="300" fill={`url(#glow-${id})`} />

      {placed.map((item, i) => (
        <InteriorProp key={i} kind={item.kind} depth={item.depth} lane={item.lane} palette={p} id={id} />
      ))}

      <rect width="400" height="300" fill={`url(#vign-${id})`} />
    </g>
  )
}

/* ---------------------------------------------------------------- worlds */

const SKIES: Record<GamingWorldSky, { top: string; bottom: string; sun: string; ambient: string; ground: string; groundSide: string }> = {
  day: { top: "#5fa8e8", bottom: "#bfe3f7", sun: "#fff6c9", ambient: "#ffffff", ground: "#5da34a", groundSide: "#6b4a2f" },
  dusk: { top: "#2d3561", bottom: "#e88b4f", sun: "#ffd08a", ambient: "#ffb26b", ground: "#4a7c3f", groundSide: "#54371f" },
  night: { top: "#0e1428", bottom: "#28324f", sun: "#dfe8ff", ambient: "#8fa6d8", ground: "#2f4a2c", groundSide: "#39281a" },
  cave: { top: "#100c14", bottom: "#241a24", sun: "#ff9d4a", ambient: "#c46a2c", ground: "#4a4550", groundSide: "#2e2a33" },
}

const ISO_W = 30
const ISO_H = 17

function isoPoint(col: number, row: number, ox = 200, oy = 128) {
  return { x: ox + (col - row) * ISO_W, y: oy + (col + row) * ISO_H }
}

function WorldStructure({ kind, col, row }: { kind: GamingWorldStructure; col: number; row: number }) {
  const p = isoPoint(col, row)

  const block = (h: number, top: string, left: string, right: string, y = p.y) => (
    <>
      <polygon points={`${p.x - ISO_W},${y - h} ${p.x},${y - h - ISO_H} ${p.x + ISO_W},${y - h} ${p.x},${y - h + ISO_H}`} fill={top} />
      <polygon points={`${p.x - ISO_W},${y - h} ${p.x},${y - h + ISO_H} ${p.x},${y + ISO_H} ${p.x - ISO_W},${y}`} fill={left} />
      <polygon points={`${p.x + ISO_W},${y - h} ${p.x},${y - h + ISO_H} ${p.x},${y + ISO_H} ${p.x + ISO_W},${y}`} fill={right} />
    </>
  )

  switch (kind) {
    case "water":
      return (
        <g>
          <polygon points={`${p.x - ISO_W},${p.y} ${p.x},${p.y - ISO_H} ${p.x + ISO_W},${p.y} ${p.x},${p.y + ISO_H}`} fill="#3a7fc4" />
          <polygon
            points={`${p.x - ISO_W * 0.5},${p.y} ${p.x},${p.y - ISO_H * 0.5} ${p.x + ISO_W * 0.5},${p.y} ${p.x},${p.y + ISO_H * 0.5}`}
            fill="#6fb3e8"
            opacity="0.7"
          />
        </g>
      )
    case "path":
      return (
        <polygon
          points={`${p.x - ISO_W},${p.y} ${p.x},${p.y - ISO_H} ${p.x + ISO_W},${p.y} ${p.x},${p.y + ISO_H}`}
          fill="#9a8459"
        />
      )
    case "tree":
      return (
        <g>
          <rect x={p.x - 4} y={p.y - 30} width="8" height="30" fill="#5a3d24" />
          <polygon points={`${p.x - 22},${p.y - 30} ${p.x},${p.y - 40} ${p.x + 22},${p.y - 30} ${p.x},${p.y - 20}`} fill="#3f7a35" />
          <polygon points={`${p.x - 17},${p.y - 42} ${p.x},${p.y - 51} ${p.x + 17},${p.y - 42} ${p.x},${p.y - 33}`} fill="#4d9440" />
        </g>
      )
    case "pine":
      return (
        <g>
          <rect x={p.x - 3.5} y={p.y - 26} width="7" height="26" fill="#4a3220" />
          <polygon points={`${p.x - 18},${p.y - 26} ${p.x},${p.y - 52} ${p.x + 18},${p.y - 26}`} fill="#2f6130" />
          <polygon points={`${p.x - 14},${p.y - 40} ${p.x},${p.y - 64} ${p.x + 14},${p.y - 40}`} fill="#3b7a3a" />
        </g>
      )
    case "portal":
      return (
        <g>
          {block(14, "#3a2f4a", "#241d31", "#2e2540")}
          <ellipse cx={p.x} cy={p.y - 34} rx="15" ry="24" fill="#a05bd6" opacity="0.85" />
          <ellipse cx={p.x} cy={p.y - 34} rx="9" ry="17" fill="#d9a6f5" opacity="0.9" />
          <rect x={p.x - 21} y={p.y - 60} width="6" height="34" fill="#2b2338" />
          <rect x={p.x + 15} y={p.y - 60} width="6" height="34" fill="#2b2338" />
        </g>
      )
    case "arena":
      return (
        <g>
          {block(10, "#5b4a52", "#3a2f35", "#4a3c43")}
          <ellipse cx={p.x} cy={p.y - 12} rx="24" ry="13" fill="#22181c" />
          <ellipse cx={p.x} cy={p.y - 13} rx="15" ry="8" fill={ACCENT} opacity="0.65" />
        </g>
      )
    case "house":
      return (
        <g>
          {block(26, "#c9b08a", "#8a7355", "#a68c69")}
          <polygon points={`${p.x - ISO_W - 3},${p.y - 26} ${p.x},${p.y - 48} ${p.x + ISO_W + 3},${p.y - 26} ${p.x},${p.y - 26 + ISO_H}`} fill="#8c3f2e" />
          <polygon points={`${p.x - ISO_W - 3},${p.y - 26} ${p.x},${p.y - 48} ${p.x},${p.y - 26 + ISO_H}`} fill="#733124" />
          <rect x={p.x - 6} y={p.y - 18} width="11" height="16" fill="#4a3320" />
        </g>
      )
    case "tower":
      return (
        <g>
          {block(64, "#a9a29a", "#6d675f", "#8b847b")}
          <polygon points={`${p.x - ISO_W},${p.y - 64} ${p.x},${p.y - 96} ${p.x + ISO_W},${p.y - 64} ${p.x},${p.y - 64 + ISO_H}`} fill="#7b3b56" />
          <rect x={p.x - 5} y={p.y - 56} width="10" height="13" fill="#2b2620" />
        </g>
      )
    case "hall":
      return (
        <g>
          {block(22, "#b79a6d", "#7d6746", "#9b8058")}
          {/* Long pitched roof, so a hall reads differently from a house */}
          <polygon points={`${p.x - ISO_W - 6},${p.y - 22} ${p.x},${p.y - 40} ${p.x + ISO_W + 6},${p.y - 22} ${p.x},${p.y - 22 + ISO_H}`} fill="#5c6b7a" />
          <polygon points={`${p.x - ISO_W - 6},${p.y - 22} ${p.x},${p.y - 40} ${p.x},${p.y - 22 + ISO_H}`} fill="#47535f" />
          <rect x={p.x - 9} y={p.y - 16} width="18" height="15" fill="#3b2c1c" />
        </g>
      )
    case "castle":
    default:
      return (
        <g>
          {block(46, "#b0aaa2", "#726c64", "#928b83")}
          {[-1, 0, 1].map((k) => (
            <rect key={k} x={p.x - 8 + k * 15} y={p.y - 56} width="9" height="12" fill="#8b857c" />
          ))}
          <rect x={p.x - 6} y={p.y - 32} width="12" height="18" rx="6" fill="#3a3128" />
        </g>
      )
  }
}

function World({ sky, structures, id }: { sky: GamingWorldSky; structures: GamingWorldStructure[]; id: string }) {
  const s = SKIES[sky]
  // Fixed plot positions, filled in order; back-to-front so overlap is right.
  const PLOTS: [number, number][] = [
    [1, 0],
    [4, 0],
    [0, 2],
    [3, 2],
    [5, 2],
    [1, 4],
    [4, 4],
    [2, 5],
    [5, 5],
  ]
  const placed = structures
    .slice(0, PLOTS.length)
    .map((kind, i) => ({ kind, col: PLOTS[i][0], row: PLOTS[i][1] }))
    .sort((a, b) => a.col + a.row - (b.col + b.row))

  return (
    <g>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.top} />
          <stop offset="100%" stopColor={s.bottom} />
        </linearGradient>
        <radialGradient id={`sun-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={s.sun} stopOpacity="0.9" />
          <stop offset="100%" stopColor={s.sun} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" fill={`url(#sky-${id})`} />
      <circle cx="312" cy="58" r="52" fill={`url(#sun-${id})`} />
      <circle cx="312" cy="58" r="15" fill={s.sun} opacity={sky === "cave" ? 0 : 0.95} />

      {/* Terrain plate */}
      {Array.from({ length: 7 }, (_, col) =>
        Array.from({ length: 7 }, (_, row) => {
          const p = isoPoint(col, row)
          return (
            <g key={`t${col}-${row}`}>
              <polygon
                points={`${p.x - ISO_W},${p.y} ${p.x},${p.y - ISO_H} ${p.x + ISO_W},${p.y} ${p.x},${p.y + ISO_H}`}
                fill={s.ground}
                stroke="rgba(0,0,0,0.10)"
                strokeWidth="0.75"
              />
              <polygon points={`${p.x - ISO_W},${p.y} ${p.x},${p.y + ISO_H} ${p.x},${p.y + ISO_H + 7} ${p.x - ISO_W},${p.y + 7}`} fill={s.groundSide} opacity="0.55" />
            </g>
          )
        }),
      )}

      {placed.map((item, i) => (
        <WorldStructure key={i} kind={item.kind} col={item.col} row={item.row} />
      ))}

      <rect width="400" height="300" fill={s.ambient} opacity={sky === "night" ? 0.06 : 0.03} />
    </g>
  )
}

/* ------------------------------------------------------------------- HUD */

function Hud({ speed, unit, gauges, chips, id }: { speed: string; unit: string; gauges: GamingArtBar[]; chips: string[]; id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`road-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141c2e" />
          <stop offset="42%" stopColor="#22304d" />
          <stop offset="100%" stopColor="#0c1119" />
        </linearGradient>
      </defs>
      {/* Night drive backdrop, so the HUD reads as an overlay on a game */}
      <rect width="400" height="300" fill={`url(#road-${id})`} />
      <circle cx="300" cy="72" r="34" fill="#f0c46a" opacity="0.16" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={22 + i * 46} y={128 - (i % 3) * 12} width={16 + (i % 4) * 7} height={30 + (i % 3) * 22} fill="#0d1420" opacity="0.85" />
      ))}
      <polygon points="0,300 400,300 250,150 150,150" fill="#161d29" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={198 - i * 1.5} y={158 + i * 34} width={4 + i * 2.4} height={16 + i * 5} fill="#c8cfda" opacity="0.5" />
      ))}

      {/* Gauge */}
      <circle cx="96" cy="196" r="50" fill="rgba(6,10,18,0.72)" />
      <circle cx="96" cy="196" r="50" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
      <circle
        cx="96"
        cy="196"
        r="50"
        fill="none"
        stroke={ACCENT}
        strokeWidth="7"
        strokeDasharray="236"
        strokeDashoffset="92"
        strokeLinecap="round"
        transform="rotate(135 96 196)"
      />
      <text x="96" y="200" fill="#fff" fontSize="30" fontFamily={MONO} textAnchor="middle" fontWeight="700">
        {speed}
      </text>
      <text x="96" y="219" fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily={MONO} textAnchor="middle" letterSpacing="1">
        {unit}
      </text>

      {/* Chips */}
      {chips.slice(0, 3).map((chip, i) => (
        <g key={chip}>
          <rect
            x={178 + i * 66}
            y="150"
            width="60"
            height="22"
            rx="4"
            fill={i === 0 ? "rgba(242,101,34,0.85)" : "rgba(8,12,20,0.7)"}
            stroke={i === 0 ? ACCENT : "rgba(255,255,255,0.24)"}
            strokeWidth="1"
          />
          <text x={208 + i * 66} y="165" textAnchor="middle" fill={i === 0 ? "#fff" : "rgba(255,255,255,0.7)"} fontSize="7.5" fontFamily={MONO}>
            {chip}
          </text>
        </g>
      ))}

      {/* Gauges */}
      {gauges.slice(0, 3).map((bar, i) => (
        <g key={bar.label}>
          <text x="178" y={196 + i * 28} fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily={MONO} letterSpacing="0.4">
            {bar.label}
          </text>
          <rect x="178" y={201 + i * 28} width="188" height="9" rx="4.5" fill="rgba(8,12,20,0.75)" />
          <rect x="178" y={201 + i * 28} width={188 * bar.fill} height="9" rx="4.5" fill={i === 0 ? ACCENT : "rgba(255,255,255,0.55)"} />
        </g>
      ))}
    </g>
  )
}

/* ---------------------------------------------------------------- screen */

/** Item colours for populated inventory slots — reads as loot, not empty boxes. */
const ITEM_HUES = [18, 210, 140, 42, 280, 0, 190, 96, 320, 58, 160, 250]

function Screen({
  app,
  tabs,
  activeTab,
  slots,
  meter,
  id,
}: {
  app: string
  tabs: string[]
  activeTab: number
  slots: number
  meter?: GamingArtBar
  id: string
}) {
  const columns = slots > 12 ? 5 : 4
  const rows = Math.ceil(slots / columns)
  const cellW = 232 / columns
  const cellH = Math.min(38, (meter ? 128 : 152) / rows)
  return (
    <g>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b2434" />
          <stop offset="100%" stopColor="#0d131d" />
        </linearGradient>
        <linearGradient id={`chrome-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#bg-${id})`} />
      <circle cx="330" cy="42" r="120" fill={ACCENT} opacity="0.05" />

      <rect x="22" y="34" width="356" height="232" rx="10" fill="rgba(9,13,20,0.82)" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      <path d="M 22 44 a 10 10 0 0 1 10 -10 h 336 a 10 10 0 0 1 10 10 v 26 h -356 z" fill={`url(#chrome-${id})`} />
      <circle cx="40" cy="55" r="4.5" fill={ACCENT} />
      <text x="54" y="59" fill="rgba(255,255,255,0.86)" fontSize="10" fontFamily={MONO} letterSpacing="0.8">
        {app}
      </text>

      {/* Tabs */}
      {tabs.slice(0, 5).map((tab, i) => (
        <g key={tab}>
          {i === activeTab && <rect x="34" y={84 + i * 30} width="94" height="24" rx="5" fill="rgba(242,101,34,0.22)" stroke={ACCENT} strokeWidth="1" />}
          <text
            x="44"
            y={100 + i * 30}
            fill={i === activeTab ? ACCENT : "rgba(255,255,255,0.42)"}
            fontSize="8.5"
            fontFamily={MONO}
            letterSpacing="0.4"
          >
            {tab}
          </text>
        </g>
      ))}

      {/* Item grid, populated */}
      {Array.from({ length: slots }, (_, i) => {
        const x = 140 + (i % columns) * cellW
        const y = 84 + Math.floor(i / columns) * (cellH + 6)
        const hue = ITEM_HUES[i % ITEM_HUES.length]
        const empty = i % 7 === 5
        return (
          <g key={i}>
            <rect x={x} y={y} width={cellW - 6} height={cellH} rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
            {!empty && (
              <>
                <rect
                  x={x + cellW * 0.18}
                  y={y + cellH * 0.18}
                  width={cellW * 0.5}
                  height={cellH * 0.58}
                  rx="3"
                  fill={`hsl(${hue} 62% 52%)`}
                />
                <rect
                  x={x + cellW * 0.18}
                  y={y + cellH * 0.18}
                  width={cellW * 0.5}
                  height={cellH * 0.2}
                  rx="3"
                  fill={`hsl(${hue} 70% 68%)`}
                />
                {i % 3 === 0 && (
                  <text x={x + cellW - 12} y={y + cellH - 5} textAnchor="end" fill="rgba(255,255,255,0.75)" fontSize="7" fontFamily={MONO}>
                    {(i % 9) + 2}
                  </text>
                )}
              </>
            )}
          </g>
        )
      })}

      {meter && (
        <g>
          <text x="140" y="242" fill="rgba(255,255,255,0.5)" fontSize="8.5" fontFamily={MONO} letterSpacing="0.4">
            {meter.label}
          </text>
          <rect x="140" y="248" width="226" height="10" rx="5" fill="rgba(255,255,255,0.08)" />
          <rect x="140" y="248" width={226 * meter.fill} height="10" rx="5" fill={ACCENT} />
        </g>
      )}
    </g>
  )
}

/* ----------------------------------------------------------------- phone */

function Phone({ apps, id }: { apps: GamingArtApp[]; id: string }) {
  const screenX = 136
  const screenW = 128
  const cell = screenW / 3
  return (
    <g>
      <defs>
        <linearGradient id={`pbg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#243047" />
          <stop offset="100%" stopColor="#0f1521" />
        </linearGradient>
        <linearGradient id={`pscr-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d2740" />
          <stop offset="100%" stopColor="#0b1018" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#pbg-${id})`} />
      <circle cx="86" cy="86" r="96" fill={ACCENT} opacity="0.07" />
      <circle cx="330" cy="238" r="80" fill="#4a86c9" opacity="0.08" />

      <rect x="126" y="16" width="148" height="268" rx="22" fill="#05080d" />
      <rect x="126" y="16" width="148" height="268" rx="22" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <rect x={screenX} y="30" width={screenW} height="240" rx="12" fill={`url(#pscr-${id})`} />
      <rect x={screenX + 46} y="23" width="36" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" />

      <text x={screenX + 10} y="46" fill="rgba(255,255,255,0.65)" fontSize="7.5" fontFamily={MONO}>
        09:41
      </text>
      <rect x={screenX + screenW - 26} y="41" width="16" height="6" rx="2" fill="rgba(255,255,255,0.45)" />

      {/* Notification */}
      <rect x={screenX + 9} y="54" width={screenW - 18} height="28" rx="7" fill="rgba(242,101,34,0.22)" stroke={ACCENT} strokeWidth="1" />
      <circle cx={screenX + 22} cy="68" r="6" fill={ACCENT} />
      <rect x={screenX + 33} y="62" width="42" height="4" rx="2" fill="rgba(255,255,255,0.75)" />
      <rect x={screenX + 33} y="70" width="62" height="3.5" rx="1.75" fill="rgba(255,255,255,0.35)" />

      {apps.slice(0, 9).map((appItem, i) => {
        const cx = screenX + (i % 3) * cell + cell / 2
        const cy = 94 + Math.floor(i / 3) * 50
        return (
          <g key={appItem.name}>
            <rect x={cx - 15} y={cy} width="30" height="30" rx="8" fill={`hsl(${appItem.hue} 58% 48%)`} />
            <rect x={cx - 15} y={cy} width="30" height="12" rx="8" fill={`hsl(${appItem.hue} 66% 62%)`} opacity="0.85" />
            <text x={cx} y={cy + 41} textAnchor="middle" fill="rgba(255,255,255,0.62)" fontSize="6.5" fontFamily={MONO}>
              {appItem.name}
            </text>
          </g>
        )
      })}

      <rect x={screenX + 44} y="258" width="40" height="4" rx="2" fill="rgba(255,255,255,0.35)" />
    </g>
  )
}

/* ---------------------------------------------------------------- system */

function System({ stages, activeStage, id }: { stages: string[]; activeStage: number; id: string }) {
  const shown = stages.slice(0, 4)
  return (
    <g>
      <defs>
        <linearGradient id={`sysbg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16203a" />
          <stop offset="100%" stopColor="#0a0f19" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#sysbg-${id})`} />
      <circle cx="60" cy="250" r="110" fill={ACCENT} opacity="0.06" />

      {/* Server rack, so it reads as infrastructure not a flowchart */}
      <rect x="278" y="52" width="96" height="200" rx="8" fill="rgba(8,12,20,0.8)" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x="288" y={64 + i * 23} width="76" height="16" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.75" />
          <circle cx="297" cy={72 + i * 23} r="2.6" fill={i % 3 === 0 ? ACCENT : "#4fc98a"} />
          <rect x="306" y={70 + i * 23} width={i % 2 ? 34 : 48} height="3.5" rx="1.75" fill="rgba(255,255,255,0.2)" />
        </g>
      ))}

      {shown.map((stage, i) => {
        const y = 58 + i * 52
        const on = i === activeStage
        return (
          <g key={stage}>
            <rect
              x="30"
              y={y}
              width="188"
              height="38"
              rx="7"
              fill={on ? "rgba(242,101,34,0.20)" : "rgba(255,255,255,0.05)"}
              stroke={on ? ACCENT : "rgba(255,255,255,0.16)"}
              strokeWidth="1.5"
            />
            <circle cx="50" cy={y + 19} r="6" fill={on ? ACCENT : "rgba(255,255,255,0.24)"} />
            <text x="66" y={y + 23} fill={on ? "#ffd9c2" : "rgba(255,255,255,0.72)"} fontSize="9.5" fontFamily={MONO} letterSpacing="0.5">
              {stage}
            </text>
            {i < shown.length - 1 && (
              <line x1="50" y1={y + 38} x2="50" y2={y + 52} stroke="rgba(255,255,255,0.24)" strokeWidth="1.5" strokeDasharray="3 3" />
            )}
            <line x1="218" y1={y + 19} x2="278" y2={y + 19} stroke={on ? ACCENT : "rgba(255,255,255,0.14)"} strokeWidth="1.25" strokeDasharray="4 4" />
          </g>
        )
      })}
    </g>
  )
}

/* ---------------------------------------------------------------- config */

function Config({ rows, id }: { rows: GamingArtBar[]; id: string }) {
  const shown = rows.slice(0, 6)
  const step = shown.length > 5 ? 33 : 38
  const top = shown.length > 5 ? 74 : 84
  return (
    <g>
      <defs>
        <linearGradient id={`cfg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2333" />
          <stop offset="100%" stopColor="#0b1017" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#cfg-${id})`} />
      <circle cx="350" cy="30" r="110" fill={ACCENT} opacity="0.06" />
      <rect x="22" y="34" width="356" height="232" rx="10" fill="rgba(9,13,20,0.78)" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      <circle cx="40" cy="55" r="4.5" fill={ACCENT} />
      <rect x="54" y="51" width="70" height="8" rx="4" fill="rgba(255,255,255,0.22)" />

      {shown.map((row, i) => {
        const y = top + i * step
        return (
          <g key={row.label}>
            <text x="44" y={y + 12} fill="rgba(255,255,255,0.68)" fontSize="8.5" fontFamily={MONO} letterSpacing="0.4">
              {row.label}
            </text>
            <rect x="196" y={y + 4} width="122" height="10" rx="5" fill="rgba(255,255,255,0.08)" />
            <rect x="196" y={y + 4} width={122 * row.fill} height="10" rx="5" fill={i === 2 ? ACCENT : "rgba(255,255,255,0.45)"} />
            <circle cx={196 + 122 * row.fill} cy={y + 9} r="6" fill={i === 2 ? ACCENT : "#dbe3ee"} stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
            {row.value && (
              <text x="356" y={y + 12} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily={MONO}>
                {row.value}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

/* --------------------------------------------------------------- palette */

/** Block textures, drawn as game materials rather than flat swatches. */
const BLOCK_MATERIALS = [
  { top: "#6db349", side: "#7a5433", name: "grass" },
  { top: "#8b8b8b", side: "#6e6e6e", name: "stone" },
  { top: "#b08447", side: "#8a6434", name: "wood" },
  { top: "#d9cfa8", side: "#b3a97f", name: "sand" },
  { top: "#5a7fc4", side: "#3f5d96", name: "water" },
  { top: "#c96a3a", side: "#9c4d28", name: "clay" },
  { top: "#4a4a55", side: "#33333d", name: "ore" },
  { top: "#9fd3e8", side: "#74a9c4", name: "ice" },
]

const BRAND_SWATCHES = ["#f26522", "#ff8f4d", "#0f1729", "#1e2b45", "#3d5a80", "#98a8bf", "#e8edf4", "#ffffff"]

function Palette({ kind, id }: { kind: "blocks" | "brand"; id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`pal-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18202e" />
          <stop offset="100%" stopColor="#0b0f16" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#pal-${id})`} />

      {kind === "blocks"
        ? Array.from({ length: 24 }, (_, i) => {
            const m = BLOCK_MATERIALS[(i * 3 + Math.floor(i / 6)) % BLOCK_MATERIALS.length]
            const x = 34 + (i % 6) * 56
            const y = 52 + Math.floor(i / 6) * 54
            return (
              <g key={i}>
                <polygon points={`${x},${y + 12} ${x + 24},${y} ${x + 48},${y + 12} ${x + 24},${y + 24}`} fill={m.top} />
                <polygon points={`${x},${y + 12} ${x + 24},${y + 24} ${x + 24},${y + 46} ${x},${y + 34}`} fill={m.side} />
                <polygon points={`${x + 48},${y + 12} ${x + 24},${y + 24} ${x + 24},${y + 46} ${x + 48},${y + 34}`} fill={m.side} opacity="0.72" />
                {/* Pixel noise, so it reads as a texture rather than flat fill */}
                {[0, 1, 2].map((k) => (
                  <rect key={k} x={x + 8 + k * 11} y={y + 16 + (k % 2) * 6} width="5" height="5" fill="#000" opacity="0.12" />
                ))}
              </g>
            )
          })
        : BRAND_SWATCHES.map((c, i) => (
            <g key={c}>
              <rect x={30 + (i % 4) * 88} y={58 + Math.floor(i / 4) * 100} width="76" height="76" rx="8" fill={c} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
              <rect x={30 + (i % 4) * 88} y={58 + Math.floor(i / 4) * 100 + 58} width="76" height="18" rx="0" fill="#000" opacity="0.22" />
            </g>
          ))}
    </g>
  )
}

/* ------------------------------------------------------------------ pack */

function Pack({ items, id }: { items: string[]; id: string }) {
  const shown = items.slice(0, 5)
  return (
    <g>
      <defs>
        <linearGradient id={`pk-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1c2740" />
          <stop offset="100%" stopColor="#0a0e17" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#pk-${id})`} />
      <circle cx="330" cy="60" r="120" fill={ACCENT} opacity="0.07" />

      {/* Fanned cards behind, contents list in front */}
      {[0, 1].map((i) => (
        <rect
          key={i}
          x={44 + i * 12}
          y={70 - i * 10}
          width="150"
          height="170"
          rx="10"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.25"
          transform={`rotate(${-8 + i * 4} ${119 + i * 12} ${155})`}
        />
      ))}
      <rect x="70" y="56" width="152" height="188" rx="10" fill="rgba(9,13,20,0.9)" stroke={ACCENT} strokeWidth="1.5" />
      <rect x="70" y="56" width="152" height="34" rx="10" fill={ACCENT} opacity="0.9" />
      <text x="86" y="78" fill="#fff" fontSize="10" fontFamily={MONO} letterSpacing="0.8" fontWeight="700">
        BUNDLE
      </text>
      {shown.map((item, i) => (
        <g key={item}>
          <rect x="84" y={104 + i * 27} width="14" height="14" rx="3" fill={`hsl(${ITEM_HUES[i % ITEM_HUES.length]} 60% 52%)`} />
          <text x="105" y={115 + i * 27} fill="rgba(255,255,255,0.78)" fontSize="7.5" fontFamily={MONO}>
            {item.length > 22 ? `${item.slice(0, 21)}…` : item}
          </text>
        </g>
      ))}

      {/* Value flash */}
      <circle cx="292" cy="176" r="46" fill={ACCENT} opacity="0.16" />
      <circle cx="292" cy="176" r="46" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="5 5" />
      <text x="292" y="172" textAnchor="middle" fill="#fff" fontSize="19" fontFamily={MONO} fontWeight="700">
        {shown.length}
      </text>
      <text x="292" y="190" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7.5" fontFamily={MONO} letterSpacing="0.6">
        PRODUCTS
      </text>
    </g>
  )
}

/* ------------------------------------------------------------- component */

export function GamingPreview({
  art,
  className,
  caption = true,
}: {
  art: GamingArt
  className?: string
  /**
   * The caption chip sits top-left. Turn it off where something else takes
   * that corner — product cards overlay their badges there.
   */
  caption?: boolean
}) {
  const id = hashArt(art)

  return (
    <svg
      viewBox="0 0 400 300"
      className={cn("h-full w-full", !caption && "[&_.preview-caption]:hidden", className)}
      role="img"
      aria-label={`Illustration: ${art.caption}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {art.scene === "interior" && <Interior tone={art.tone} props={art.props} id={id} />}
      {art.scene === "world" && <World sky={art.sky} structures={art.structures} id={id} />}
      {art.scene === "hud" && <Hud speed={art.speed} unit={art.unit} gauges={art.gauges} chips={art.chips} id={id} />}
      {art.scene === "screen" && (
        <Screen app={art.app} tabs={art.tabs} activeTab={art.activeTab} slots={art.slots} meter={art.meter} id={id} />
      )}
      {art.scene === "phone" && <Phone apps={art.apps} id={id} />}
      {art.scene === "system" && <System stages={art.stages} activeStage={art.activeStage} id={id} />}
      {art.scene === "config" && <Config rows={art.rows} id={id} />}
      {art.scene === "palette" && <Palette kind={art.kind} id={id} />}
      {art.scene === "pack" && <Pack items={art.items} id={id} />}

      <g className="preview-caption">
        <rect x="16" y="14" width={art.caption.length * 6.1 + 20} height="22" rx="4" fill="rgba(6,10,16,0.72)" />
        <text x="26" y="29" fill={ACCENT} fontSize="10.5" fontFamily={MONO} letterSpacing="1.2">
          {art.caption}
        </text>
      </g>
    </svg>
  )
}
