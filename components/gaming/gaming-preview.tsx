import type { GamingPreviewKind } from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

/**
 * Illustrative product previews for the Gaming department.
 *
 * These are schematic drawings of what a product is — a floor plan for an
 * MLO, a HUD cluster for a HUD, a panel layout for an interface — not
 * screenshots. Real captures go in `images[]` once they exist; until then
 * this communicates the shape of the product honestly rather than dressing
 * the catalogue in stock art that shows something the customer is not
 * buying.
 *
 * Deterministic: the same product always draws the same preview.
 */

const INK = "#0f1729"
const LINE = "rgba(255,255,255,0.22)"
const LINE_SOFT = "rgba(255,255,255,0.10)"
const ACCENT = "#f26522"
const PANEL = "rgba(255,255,255,0.06)"

/** Small deterministic PRNG so variants differ per product but never per render. */
function rng(seed: number) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <rect width="400" height="300" fill={INK} />
      <g opacity="0.5">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="300" stroke={LINE_SOFT} strokeWidth="1" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke={LINE_SOFT} strokeWidth="1" />
        ))}
      </g>
      {children}
    </>
  )
}

/**
 * Three floor plans rather than one, so a gallery of three views shows three
 * different rooms instead of the same drawing three times.
 */
const MLO_PLANS: { x: number; y: number; w: number; h: number }[][] = [
  [
    { x: 30, y: 40, w: 130, h: 90 },
    { x: 170, y: 40, w: 90, h: 90 },
    { x: 270, y: 40, w: 100, h: 140 },
    { x: 30, y: 140, w: 80, h: 120 },
    { x: 120, y: 140, w: 140, h: 120 },
    { x: 270, y: 190, w: 100, h: 70 },
  ],
  [
    { x: 30, y: 40, w: 90, h: 70 },
    { x: 130, y: 40, w: 90, h: 70 },
    { x: 230, y: 40, w: 140, h: 110 },
    { x: 30, y: 120, w: 190, h: 140 },
    { x: 230, y: 160, w: 65, h: 100 },
    { x: 305, y: 160, w: 65, h: 100 },
  ],
  [
    { x: 30, y: 40, w: 170, h: 120 },
    { x: 210, y: 40, w: 70, h: 60 },
    { x: 290, y: 40, w: 80, h: 60 },
    { x: 210, y: 110, w: 160, h: 50 },
    { x: 30, y: 170, w: 110, h: 90 },
    { x: 150, y: 170, w: 220, h: 90 },
  ],
]

function Mlo({ seed }: { seed: number }) {
  const r = rng(seed)
  const rooms = MLO_PLANS[seed % MLO_PLANS.length]
  return (
    <Frame>
      <g>
        {rooms.map((room, i) => (
          <g key={i}>
            {/* Walls read as walls: solid fill, a brighter outline than the
                background grid, and a door opening cut into the bottom edge. */}
            <rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              fill={r() > 0.62 ? "rgba(242,101,34,0.12)" : PANEL}
              stroke="rgba(255,255,255,0.38)"
              strokeWidth="1.5"
            />
            <line x1={room.x + 10} y1={room.y + room.h} x2={room.x + 34} y2={room.y + room.h} stroke={INK} strokeWidth="3.5" />
            <path
              d={`M ${room.x + 10} ${room.y + room.h} A 24 24 0 0 1 ${room.x + 34} ${room.y + room.h}`}
              fill="none"
              stroke={LINE_SOFT}
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Furniture blocks — reads as a fitted interior, not an empty shell */}
        {rooms.map((room, i) => (
          <g key={`f${i}`}>
            <rect
              x={room.x + 12}
              y={room.y + 14}
              width={Math.max(18, room.w * 0.34)}
              height={Math.max(10, room.h * 0.22)}
              rx="2"
              fill={LINE}
            />
            {room.w > 100 && room.h > 80 && (
              <rect x={room.x + room.w - 46} y={room.y + room.h - 34} width="32" height="20" rx="2" fill={LINE_SOFT} />
            )}
          </g>
        ))}

        {/* Scale bar, bottom right — the detail that says "measured drawing". */}
        <g opacity="0.55">
          <line x1="300" y1="286" x2="370" y2="286" stroke={LINE} strokeWidth="1.5" />
          <line x1="300" y1="282" x2="300" y2="290" stroke={LINE} strokeWidth="1.5" />
          <line x1="370" y1="282" x2="370" y2="290" stroke={LINE} strokeWidth="1.5" />
        </g>

        <circle cx={rooms[2].x} cy={rooms[2].y + rooms[2].h} r="5" fill={ACCENT} />
        <text x="30" y="26" fill={ACCENT} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="1.5" className="preview-caption">
          INTERIOR · FLOOR 0{(seed % MLO_PLANS.length) + 1}
        </text>
      </g>
    </Frame>
  )
}

function MapPreview({ seed }: { seed: number }) {
  const r = rng(seed)
  const tiles = Array.from({ length: 30 }, (_, i) => ({
    x: 60 + (i % 6) * 48,
    y: 70 + Math.floor(i / 6) * 34,
    h: 8 + Math.round(r() * 26),
  }))
  return (
    <Frame>
      <g>
        {tiles.map((t, i) => (
          <g key={i}>
            <polygon
              points={`${t.x},${t.y} ${t.x + 24},${t.y - 14} ${t.x + 48},${t.y} ${t.x + 24},${t.y + 14}`}
              fill={r() > 0.75 ? "rgba(242,101,34,0.22)" : PANEL}
              stroke={LINE}
              strokeWidth="1"
            />
            <polygon
              points={`${t.x},${t.y} ${t.x + 24},${t.y + 14} ${t.x + 24},${t.y + 14 + t.h} ${t.x},${t.y + t.h}`}
              fill="rgba(255,255,255,0.04)"
              stroke={LINE_SOFT}
              strokeWidth="1"
            />
          </g>
        ))}
        <text x="30" y="34" fill={ACCENT} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="1.5" className="preview-caption">
          WORLD BUILD
        </text>
      </g>
    </Frame>
  )
}

function Hud() {
  return (
    <Frame>
      <g>
        {/* Speed / gauge cluster */}
        <circle cx="92" cy="196" r="52" fill="none" stroke={LINE} strokeWidth="8" />
        <circle
          cx="92"
          cy="196"
          r="52"
          fill="none"
          stroke={ACCENT}
          strokeWidth="8"
          strokeDasharray="245"
          strokeDashoffset="96"
          strokeLinecap="round"
          transform="rotate(135 92 196)"
        />
        <text x="92" y="200" fill="#fff" fontSize="26" fontFamily="ui-monospace, monospace" textAnchor="middle" fontWeight="700">
          86
        </text>
        <text x="92" y="218" fill={LINE} fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle">
          MPH
        </text>
        {/* Status bars */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="180" y={168 + i * 22} width="150" height="8" rx="4" fill={PANEL} />
            <rect x="180" y={168 + i * 22} width={[118, 92, 60][i]} height="8" rx="4" fill={i === 0 ? ACCENT : LINE} />
          </g>
        ))}
        {/* Indicators */}
        <rect x="180" y="120" width="34" height="22" rx="4" fill="rgba(242,101,34,0.20)" stroke={ACCENT} strokeWidth="1" />
        <rect x="222" y="120" width="34" height="22" rx="4" fill={PANEL} stroke={LINE} strokeWidth="1" />
        <rect x="264" y="120" width="66" height="22" rx="4" fill={PANEL} stroke={LINE} strokeWidth="1" />
        <text x="30" y="34" fill={ACCENT} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="1.5" className="preview-caption">
          HUD CLUSTER
        </text>
      </g>
    </Frame>
  )
}

function Ui({ seed }: { seed: number }) {
  const r = rng(seed)
  return (
    <Frame>
      <g>
        <rect x="28" y="44" width="344" height="228" rx="8" fill={PANEL} stroke={LINE} strokeWidth="1.5" />
        {/* Title bar */}
        <rect x="28" y="44" width="344" height="30" rx="8" fill="rgba(255,255,255,0.05)" />
        <circle cx="46" cy="59" r="4" fill={ACCENT} />
        <rect x="58" y="55" width="70" height="8" rx="4" fill={LINE} />
        {/* Sidebar */}
        <rect x="40" y="86" width="82" height="174" rx="6" fill="rgba(255,255,255,0.04)" />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x="50" y={98 + i * 26} width={44 + Math.round(r() * 20)} height="8" rx="4" fill={i === 1 ? ACCENT : LINE} />
        ))}
        {/* Grid content */}
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={`c${i}`}
            x={134 + (i % 4) * 60}
            y={92 + Math.floor(i / 4) * 58}
            width="50"
            height="48"
            rx="5"
            fill={r() > 0.7 ? "rgba(242,101,34,0.16)" : "rgba(255,255,255,0.05)"}
            stroke={LINE_SOFT}
            strokeWidth="1"
          />
        ))}
      </g>
    </Frame>
  )
}

function Script() {
  return (
    <Frame>
      <g>
        {[
          { x: 40, y: 60, label: "TRIGGER" },
          { x: 40, y: 140, label: "VALIDATE" },
          { x: 40, y: 220, label: "PERSIST" },
        ].map((node, i) => (
          <g key={i}>
            <rect x={node.x} y={node.y - 20} width="120" height="40" rx="6" fill={PANEL} stroke={i === 1 ? ACCENT : LINE} strokeWidth="1.5" />
            <text x={node.x + 14} y={node.y + 4} fill={i === 1 ? ACCENT : "rgba(255,255,255,0.75)"} fontSize="11" fontFamily="ui-monospace, monospace">
              {node.label}
            </text>
            {i < 2 && <line x1={node.x + 60} y1={node.y + 20} x2={node.x + 60} y2={node.y + 60} stroke={LINE} strokeWidth="1.5" strokeDasharray="4 4" />}
          </g>
        ))}
        {/* Code panel */}
        <rect x="196" y="40" width="176" height="220" rx="6" fill="rgba(255,255,255,0.04)" stroke={LINE_SOFT} strokeWidth="1" />
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x="210" y={58 + i * 18} width={[110, 84, 132, 66, 98, 120, 74, 108, 90, 126, 70][i]} height="6" rx="3" fill={i % 4 === 1 ? "rgba(242,101,34,0.55)" : LINE} />
        ))}
      </g>
    </Frame>
  )
}

function Config() {
  return (
    <Frame>
      <g>
        <rect x="28" y="44" width="344" height="228" rx="8" fill={PANEL} stroke={LINE} strokeWidth="1.5" />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect x="48" y={72 + i * 28} width={92 - (i % 3) * 14} height="8" rx="4" fill={LINE} />
            <rect x="200" y={68 + i * 28} width="140" height="16" rx="8" fill="rgba(255,255,255,0.05)" />
            <rect x="200" y={68 + i * 28} width={[104, 62, 128, 44, 92, 118, 76][i]} height="16" rx="8" fill={i === 2 ? ACCENT : LINE} />
          </g>
        ))}
        <text x="48" y="58" fill={ACCENT} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="1.5" className="preview-caption">
          CONFIGURATION
        </text>
      </g>
    </Frame>
  )
}

function Texture({ seed }: { seed: number }) {
  const r = rng(seed)
  const palette = ["rgba(242,101,34,0.85)", "rgba(242,101,34,0.45)", "rgba(255,255,255,0.28)", "rgba(255,255,255,0.14)", "rgba(255,255,255,0.06)"]
  return (
    <Frame>
      <g>
        {Array.from({ length: 48 }, (_, i) => (
          <rect
            key={i}
            x={32 + (i % 8) * 42}
            y={48 + Math.floor(i / 8) * 34}
            width="38"
            height="30"
            rx="3"
            fill={palette[Math.floor(r() * palette.length)]}
            stroke={LINE_SOFT}
            strokeWidth="1"
          />
        ))}
      </g>
    </Frame>
  )
}

function Bundle() {
  return (
    <Frame>
      <g>
        {[
          { x: 52, y: 92, o: 0.35 },
          { x: 84, y: 72, o: 0.6 },
          { x: 116, y: 52, o: 1 },
        ].map((card, i) => (
          <g key={i} opacity={card.o}>
            <rect x={card.x} y={card.y} width="200" height="150" rx="8" fill="rgba(255,255,255,0.07)" stroke={i === 2 ? ACCENT : LINE} strokeWidth="1.5" />
            {i === 2 && (
              <>
                <rect x={card.x + 18} y={card.y + 20} width="90" height="9" rx="4" fill={ACCENT} />
                <rect x={card.x + 18} y={card.y + 40} width="140" height="7" rx="3" fill={LINE} />
                {Array.from({ length: 4 }, (_, k) => (
                  <rect key={k} x={card.x + 18 + (k % 2) * 84} y={card.y + 62 + Math.floor(k / 2) * 40} width="76" height="32" rx="4" fill="rgba(255,255,255,0.06)" stroke={LINE_SOFT} strokeWidth="1" />
                ))}
              </>
            )}
          </g>
        ))}
        <text x="30" y="34" fill={ACCENT} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="1.5" className="preview-caption">
          MULTI-PRODUCT PACK
        </text>
      </g>
    </Frame>
  )
}

export function GamingPreview({
  kind,
  seed = 1,
  className,
  caption = true,
}: {
  kind: GamingPreviewKind
  seed?: number
  className?: string
  /**
   * The art captions its own top-left corner. Turn this off wherever
   * something else already occupies that corner — product cards overlay
   * their badges there, and the category is labelled below the image anyway.
   */
  caption?: boolean
}) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={cn("h-full w-full", !caption && "[&_.preview-caption]:hidden", className)}
      role="img"
      aria-label="Illustrative product preview"
      preserveAspectRatio="xMidYMid slice"
    >
      {kind === "mlo" && <Mlo seed={seed} />}
      {kind === "map" && <MapPreview seed={seed} />}
      {kind === "hud" && <Hud />}
      {kind === "ui" && <Ui seed={seed} />}
      {kind === "script" && <Script />}
      {kind === "config" && <Config />}
      {kind === "texture" && <Texture seed={seed} />}
      {kind === "bundle" && <Bundle />}
    </svg>
  )
}
