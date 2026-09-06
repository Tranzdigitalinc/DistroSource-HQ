import type { GamingArt, GamingArtBar, GamingArtRoom, GamingArtZone } from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

/**
 * Illustrative product artwork for the Gaming department.
 *
 * Every drawing is composed from the product's own data — the rooms in this
 * MLO, the apps on this phone, the values in this config — so the image
 * identifies the specific product rather than its category. A police
 * department and a dealership are both floor plans; they are not the same
 * floor plan.
 *
 * These are schematics, not screenshots. The gallery says so underneath, and
 * nothing here is presented as a capture of the delivered files. Real
 * captures replace them via `product.images` once the files exist.
 *
 * Fully deterministic: the art is data, so the same product always draws the
 * same picture on the server and on the client.
 */

const INK = "#0f1729"
const LINE = "rgba(255,255,255,0.22)"
const LINE_SOFT = "rgba(255,255,255,0.10)"
const LINE_STRONG = "rgba(255,255,255,0.40)"
const TEXT = "rgba(255,255,255,0.72)"
const TEXT_DIM = "rgba(255,255,255,0.45)"
const ACCENT = "#f26522"
const ACCENT_SOFT = "rgba(242,101,34,0.14)"
const PANEL = "rgba(255,255,255,0.06)"
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace"

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

function Caption({ children }: { children: string }) {
  return (
    <text x="26" y="26" fill={ACCENT} fontSize="11" fontFamily={MONO} letterSpacing="1.4" className="preview-caption">
      {children}
    </text>
  )
}

/** Bottom-right scale bar — the detail that reads as a measured drawing. */
function ScaleBar() {
  return (
    <g opacity="0.5">
      <line x1="302" y1="284" x2="372" y2="284" stroke={LINE} strokeWidth="1.5" />
      <line x1="302" y1="280" x2="302" y2="288" stroke={LINE} strokeWidth="1.5" />
      <line x1="372" y1="280" x2="372" y2="288" stroke={LINE} strokeWidth="1.5" />
    </g>
  )
}

/* ---------------------------------------------------------------- scenes */

function Floorplan({ rooms }: { rooms: GamingArtRoom[] }) {
  return (
    <g>
      {rooms.map((room, i) => {
        const doorWidth = Math.min(26, room.w * 0.32)
        const roomy = room.w >= 56 && room.h >= 26
        return (
          <g key={i}>
            <rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              fill={room.accent ? ACCENT_SOFT : PANEL}
              stroke={room.accent ? ACCENT : LINE_STRONG}
              strokeWidth="1.5"
            />
            {/* Door opening cut into the bottom wall, with its swing arc. */}
            <line
              x1={room.x + 11}
              y1={room.y + room.h}
              x2={room.x + 11 + doorWidth}
              y2={room.y + room.h}
              stroke={INK}
              strokeWidth="3.5"
            />
            <path
              d={`M ${room.x + 11} ${room.y + room.h} A ${doorWidth} ${doorWidth} 0 0 1 ${room.x + 11 + doorWidth} ${room.y + room.h}`}
              fill="none"
              stroke={LINE_SOFT}
              strokeWidth="1"
            />
            {roomy && (
              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2 + 3.5}
                textAnchor="middle"
                fill={room.accent ? ACCENT : TEXT}
                fontSize="9.5"
                fontFamily={MONO}
                letterSpacing="0.5"
              >
                {room.label}
              </text>
            )}
          </g>
        )
      })}
      <ScaleBar />
    </g>
  )
}

const ISO_OX = 200
const ISO_OY = 104
const ISO_W = 25
const ISO_H = 14

function isoPoint(col: number, row: number) {
  return { x: ISO_OX + (col - row) * ISO_W, y: ISO_OY + (col + row) * ISO_H }
}

function Isometric({ zones }: { zones: GamingArtZone[] }) {
  // Back-to-front so nearer blocks overlap the ones behind them.
  const ordered = [...zones].sort((a, b) => a.col + a.row - (b.col + b.row))
  return (
    <g>
      {/* Ground plane */}
      {Array.from({ length: 7 }, (_, col) =>
        Array.from({ length: 7 }, (_, row) => {
          const p = isoPoint(col, row)
          return (
            <polygon
              key={`g${col}-${row}`}
              points={`${p.x},${p.y - ISO_H} ${p.x + ISO_W},${p.y} ${p.x},${p.y + ISO_H} ${p.x - ISO_W},${p.y}`}
              fill="rgba(255,255,255,0.03)"
              stroke={LINE_SOFT}
              strokeWidth="0.75"
            />
          )
        }),
      )}

      {ordered.map((zone, i) => {
        const p = isoPoint(zone.col, zone.row)
        const topY = p.y - zone.height
        const stroke = zone.accent ? ACCENT : LINE_STRONG
        return (
          <g key={i}>
            <polygon
              points={`${p.x - ISO_W},${topY} ${p.x},${topY - ISO_H} ${p.x + ISO_W},${topY} ${p.x},${topY + ISO_H}`}
              fill={zone.accent ? "rgba(242,101,34,0.30)" : "rgba(255,255,255,0.12)"}
              stroke={stroke}
              strokeWidth="1.25"
            />
            <polygon
              points={`${p.x - ISO_W},${topY} ${p.x},${topY + ISO_H} ${p.x},${p.y + ISO_H} ${p.x - ISO_W},${p.y}`}
              fill={zone.accent ? "rgba(242,101,34,0.16)" : "rgba(255,255,255,0.06)"}
              stroke={stroke}
              strokeWidth="1"
            />
            <polygon
              points={`${p.x + ISO_W},${topY} ${p.x},${topY + ISO_H} ${p.x},${p.y + ISO_H} ${p.x + ISO_W},${p.y}`}
              fill={zone.accent ? "rgba(242,101,34,0.09)" : "rgba(255,255,255,0.03)"}
              stroke={stroke}
              strokeWidth="1"
            />
          </g>
        )
      })}

      {/* Labels last, on a backing plate: blocks drawn in front would
          otherwise paint over the labels of the blocks behind them. */}
      {ordered
        .filter((zone) => zone.label)
        .map((zone, i) => {
          const p = isoPoint(zone.col, zone.row)
          const y = p.y - zone.height - ISO_H - 8
          const width = (zone.label as string).length * 5.6 + 12
          return (
            <g key={`l${i}`}>
              <rect x={p.x - width / 2} y={y - 10} width={width} height="14" rx="3" fill={INK} opacity="0.82" />
              <text
                x={p.x}
                y={y}
                textAnchor="middle"
                fill={zone.accent ? ACCENT : TEXT}
                fontSize="9"
                fontFamily={MONO}
                letterSpacing="0.5"
              >
                {zone.label}
              </text>
            </g>
          )
        })}
    </g>
  )
}

function Interface({
  nav,
  columns,
  rows,
  activeNav = 0,
  meter,
}: {
  nav: string[]
  columns: number
  rows: number
  activeNav?: number
  meter?: GamingArtBar
}) {
  const gridX = 138
  const gridY = 92
  const gridW = 224
  const cellW = gridW / columns
  const cellH = meter ? 40 : 46
  return (
    <g>
      <rect x="26" y="40" width="348" height="238" rx="8" fill={PANEL} stroke={LINE} strokeWidth="1.5" />
      {/* Title bar */}
      <path d="M 26 48 a 8 8 0 0 1 8 -8 h 332 a 8 8 0 0 1 8 8 v 22 h -348 z" fill="rgba(255,255,255,0.05)" />
      <circle cx="44" cy="59" r="4" fill={ACCENT} />
      <rect x="56" y="55" width="64" height="8" rx="4" fill={LINE} />

      {/* Sidebar navigation, with real section names */}
      <rect x="38" y="82" width="88" height="184" rx="6" fill="rgba(255,255,255,0.04)" />
      {nav.slice(0, 6).map((item, i) => (
        <g key={item}>
          {i === activeNav && <rect x="42" y={90 + i * 29} width="80" height="22" rx="4" fill="rgba(242,101,34,0.18)" />}
          <text
            x="50"
            y={105 + i * 29}
            fill={i === activeNav ? ACCENT : TEXT_DIM}
            fontSize="8.5"
            fontFamily={MONO}
            letterSpacing="0.4"
          >
            {item}
          </text>
        </g>
      ))}

      {/* Content grid */}
      {Array.from({ length: columns * rows }, (_, i) => (
        <rect
          key={i}
          x={gridX + (i % columns) * cellW}
          y={gridY + Math.floor(i / columns) * (cellH + 8)}
          width={cellW - 8}
          height={cellH}
          rx="5"
          fill={i === 2 || i === 7 ? "rgba(242,101,34,0.16)" : "rgba(255,255,255,0.05)"}
          stroke={LINE_SOFT}
          strokeWidth="1"
        />
      ))}

      {meter && (
        <g>
          <text x={gridX} y="250" fill={TEXT_DIM} fontSize="8.5" fontFamily={MONO} letterSpacing="0.4">
            {meter.label}
          </text>
          <rect x={gridX} y="256" width={gridW - 8} height="10" rx="5" fill="rgba(255,255,255,0.06)" />
          <rect x={gridX} y="256" width={(gridW - 8) * meter.fill} height="10" rx="5" fill={ACCENT} />
        </g>
      )}
    </g>
  )
}

function Phone({ apps }: { apps: string[] }) {
  const screenX = 138
  const screenY = 46
  const screenW = 124
  const cell = screenW / 3
  return (
    <g>
      {/* Handset */}
      <rect x="130" y="24" width="140" height="252" rx="18" fill="rgba(255,255,255,0.08)" stroke={LINE_STRONG} strokeWidth="1.5" />
      <rect x={screenX} y={screenY} width={screenW} height="212" rx="8" fill="rgba(0,0,0,0.35)" stroke={LINE_SOFT} strokeWidth="1" />
      {/* Status bar */}
      <rect x={screenX + 46} y="34" width="32" height="5" rx="2.5" fill="rgba(255,255,255,0.25)" />
      <text x={screenX + 8} y={screenY + 14} fill={TEXT_DIM} fontSize="7" fontFamily={MONO}>
        09:41
      </text>

      {/* Notification card */}
      <rect x={screenX + 8} y={screenY + 20} width={screenW - 16} height="26" rx="5" fill="rgba(242,101,34,0.18)" stroke={ACCENT} strokeWidth="1" />
      <rect x={screenX + 16} y={screenY + 28} width="46" height="4" rx="2" fill={ACCENT} />
      <rect x={screenX + 16} y={screenY + 36} width="72" height="3.5" rx="1.75" fill="rgba(255,255,255,0.30)" />

      {/* App grid with names */}
      {apps.slice(0, 9).map((app, i) => {
        const cx = screenX + (i % 3) * cell + cell / 2
        const cy = screenY + 62 + Math.floor(i / 3) * 46
        return (
          <g key={app}>
            <rect
              x={cx - 14}
              y={cy}
              width="28"
              height="28"
              rx="7"
              fill={i === 0 ? "rgba(242,101,34,0.28)" : "rgba(255,255,255,0.10)"}
              stroke={i === 0 ? ACCENT : LINE_SOFT}
              strokeWidth="1"
            />
            <text x={cx} y={cy + 38} textAnchor="middle" fill={TEXT_DIM} fontSize="6.5" fontFamily={MONO}>
              {app}
            </text>
          </g>
        )
      })}

      {/* Home indicator */}
      <rect x={screenX + 42} y="248" width="40" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
    </g>
  )
}

function Cluster({ readout, unit, bars, chips }: { readout: string; unit: string; bars: GamingArtBar[]; chips: string[] }) {
  return (
    <g>
      {/* Primary gauge */}
      <circle cx="106" cy="182" r="54" fill="none" stroke={LINE} strokeWidth="8" />
      <circle
        cx="106"
        cy="182"
        r="54"
        fill="none"
        stroke={ACCENT}
        strokeWidth="8"
        strokeDasharray="255"
        strokeDashoffset="100"
        strokeLinecap="round"
        transform="rotate(135 106 182)"
      />
      <text x="106" y="186" fill="#fff" fontSize="30" fontFamily={MONO} textAnchor="middle" fontWeight="700">
        {readout}
      </text>
      <text x="106" y="206" fill={TEXT_DIM} fontSize="9" fontFamily={MONO} textAnchor="middle" letterSpacing="1">
        {unit}
      </text>

      {/* Indicator chips */}
      {chips.slice(0, 3).map((chip, i) => (
        <g key={chip}>
          <rect
            x={186 + i * 62}
            y="118"
            width="56"
            height="22"
            rx="4"
            fill={i === 0 ? "rgba(242,101,34,0.20)" : PANEL}
            stroke={i === 0 ? ACCENT : LINE}
            strokeWidth="1"
          />
          <text
            x={214 + i * 62}
            y="133"
            textAnchor="middle"
            fill={i === 0 ? ACCENT : TEXT_DIM}
            fontSize="7.5"
            fontFamily={MONO}
          >
            {chip}
          </text>
        </g>
      ))}

      {/* Labelled bars */}
      {bars.slice(0, 3).map((bar, i) => (
        <g key={bar.label}>
          <text x="186" y={168 + i * 30} fill={TEXT_DIM} fontSize="8" fontFamily={MONO} letterSpacing="0.4">
            {bar.label}
          </text>
          <rect x="186" y={174 + i * 30} width="152" height="9" rx="4.5" fill="rgba(255,255,255,0.07)" />
          <rect x="186" y={174 + i * 30} width={152 * bar.fill} height="9" rx="4.5" fill={i === 0 ? ACCENT : LINE} />
        </g>
      ))}
    </g>
  )
}

function Flow({ nodes, activeNode = 1 }: { nodes: string[]; activeNode?: number }) {
  const shown = nodes.slice(0, 4)
  const step = shown.length > 3 ? 56 : 72
  const top = shown.length > 3 ? 56 : 66
  return (
    <g>
      {shown.map((node, i) => {
        const y = top + i * step
        const on = i === activeNode
        return (
          <g key={node}>
            <rect
              x="34"
              y={y}
              width="130"
              height="38"
              rx="6"
              fill={on ? ACCENT_SOFT : PANEL}
              stroke={on ? ACCENT : LINE}
              strokeWidth="1.5"
            />
            <text x="99" y={y + 23} textAnchor="middle" fill={on ? ACCENT : TEXT} fontSize="9" fontFamily={MONO} letterSpacing="0.5">
              {node}
            </text>
            {i < shown.length - 1 && (
              <line x1="99" y1={y + 38} x2="99" y2={y + step} stroke={LINE} strokeWidth="1.5" strokeDasharray="4 4" />
            )}
          </g>
        )
      })}

      {/* Source panel */}
      <rect x="194" y="46" width="176" height="216" rx="6" fill="rgba(255,255,255,0.04)" stroke={LINE_SOFT} strokeWidth="1" />
      {Array.from({ length: 11 }, (_, i) => (
        <rect
          key={i}
          x="208"
          y={64 + i * 18}
          width={[110, 84, 132, 66, 98, 120, 74, 108, 90, 126, 70][i]}
          height="6"
          rx="3"
          fill={i % 4 === 1 ? "rgba(242,101,34,0.55)" : LINE}
        />
      ))}
    </g>
  )
}

function Sliders({ rows }: { rows: GamingArtBar[] }) {
  const shown = rows.slice(0, 6)
  const step = shown.length > 5 ? 32 : 36
  const top = shown.length > 5 ? 74 : 84
  return (
    <g>
      <rect x="26" y="40" width="348" height="238" rx="8" fill={PANEL} stroke={LINE} strokeWidth="1.5" />
      {shown.map((row, i) => {
        const y = top + i * step
        return (
          <g key={row.label}>
            <text x="44" y={y + 12} fill={TEXT} fontSize="8.5" fontFamily={MONO} letterSpacing="0.4">
              {row.label}
            </text>
            <rect x="192" y={y + 3} width="130" height="12" rx="6" fill="rgba(255,255,255,0.06)" />
            <rect x="192" y={y + 3} width={130 * row.fill} height="12" rx="6" fill={i === 2 ? ACCENT : LINE} />
            {row.value && (
              <text x="356" y={y + 12} textAnchor="end" fill={TEXT_DIM} fontSize="8" fontFamily={MONO}>
                {row.value}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

const SWATCH_PALETTE = [
  "rgba(242,101,34,0.85)",
  "rgba(242,101,34,0.45)",
  "rgba(255,255,255,0.30)",
  "rgba(255,255,255,0.16)",
  "rgba(255,255,255,0.07)",
  "rgba(242,101,34,0.22)",
]

function Swatches({ rows, columns }: { rows: number; columns: number }) {
  const cellW = 336 / columns
  const cellH = 216 / rows
  return (
    <g>
      {Array.from({ length: rows * columns }, (_, i) => {
        // Deterministic spread across the palette — no randomness, so server
        // and client render byte-identical markup.
        const shade = SWATCH_PALETTE[(i * 7 + Math.floor(i / columns) * 3) % SWATCH_PALETTE.length]
        return (
          <rect
            key={i}
            x={32 + (i % columns) * cellW}
            y={48 + Math.floor(i / columns) * cellH}
            width={cellW - 4}
            height={cellH - 4}
            rx="3"
            fill={shade}
            stroke={LINE_SOFT}
            strokeWidth="1"
          />
        )
      })}
    </g>
  )
}

function Stack({ items }: { items: string[] }) {
  const cards = [
    { x: 48, y: 96, o: 0.3 },
    { x: 82, y: 74, o: 0.55 },
    { x: 116, y: 52, o: 1 },
  ]
  return (
    <g>
      {cards.map((card, i) => (
        <g key={i} opacity={card.o}>
          <rect
            x={card.x}
            y={card.y}
            width="204"
            height="164"
            rx="8"
            fill="rgba(255,255,255,0.07)"
            stroke={i === 2 ? ACCENT : LINE}
            strokeWidth="1.5"
          />
          {i === 2 && (
            <>
              <rect x={card.x + 18} y={card.y + 18} width="84" height="8" rx="4" fill={ACCENT} />
              {items.slice(0, 5).map((item, k) => (
                <g key={item}>
                  <circle cx={card.x + 22} cy={card.y + 46 + k * 22} r="2.5" fill={ACCENT} />
                  <text x={card.x + 32} y={card.y + 49 + k * 22} fill={TEXT} fontSize="8.5" fontFamily={MONO} letterSpacing="0.3">
                    {item}
                  </text>
                </g>
              ))}
            </>
          )}
        </g>
      ))}
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
      aria-label={`Illustrative schematic: ${art.caption}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <Frame>
        {art.scene === "floorplan" && <Floorplan rooms={art.rooms} />}
        {art.scene === "isometric" && <Isometric zones={art.zones} />}
        {art.scene === "interface" && (
          <Interface nav={art.nav} columns={art.columns} rows={art.rows} activeNav={art.activeNav} meter={art.meter} />
        )}
        {art.scene === "phone" && <Phone apps={art.apps} />}
        {art.scene === "cluster" && <Cluster readout={art.readout} unit={art.unit} bars={art.bars} chips={art.chips} />}
        {art.scene === "flow" && <Flow nodes={art.nodes} activeNode={art.activeNode} />}
        {art.scene === "sliders" && <Sliders rows={art.rows} />}
        {art.scene === "swatches" && <Swatches rows={art.rows} columns={art.columns} />}
        {art.scene === "stack" && <Stack items={art.items} />}
        <Caption>{art.caption}</Caption>
      </Frame>
    </svg>
  )
}
