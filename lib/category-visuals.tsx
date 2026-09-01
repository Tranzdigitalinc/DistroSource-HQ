import { Gamepad2, Clapperboard, ShoppingBag, Laptop2, CreditCard, Bitcoin, Plane, Gift, type LucideIcon } from "lucide-react"

export interface CategoryVisual {
  icon: LucideIcon
  logos: string[]
  chip: string
  glow: string
  ring: string
  accentText: string
}

const fallback: CategoryVisual = {
  icon: Gift,
  logos: [],
  chip: "bg-gradient-to-br from-primary to-primary/70 shadow-primary/30",
  glow: "from-primary/15",
  ring: "hover:border-primary/40",
  accentText: "text-primary",
}

const visualEntries: Array<{ match: string[]; visual: CategoryVisual }> = [
  {
    match: ["gaming", "game"],
    visual: {
      icon: Gamepad2,
      logos: ["/logos/playstation-store.svg", "/logos/xbox.svg", "/logos/steam.svg"],
      chip: "bg-gradient-to-br from-violet-400 to-violet-600 shadow-violet-500/30",
      glow: "from-violet-500/15",
      ring: "hover:border-violet-400/40",
      accentText: "text-violet-300",
    },
  },
  {
    match: ["entertain", "stream", "movie", "video"],
    visual: {
      icon: Clapperboard,
      logos: ["/logos/netflix.svg", "/logos/spotify.svg", "/logos/disney-plus.svg"],
      chip: "bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30",
      glow: "from-rose-500/15",
      ring: "hover:border-rose-400/40",
      accentText: "text-rose-300",
    },
  },
  {
    match: ["shop", "retail", "store"],
    visual: {
      icon: ShoppingBag,
      logos: ["/logos/amazon.svg", "/logos/walmart.svg", "/logos/target.svg"],
      chip: "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30",
      glow: "from-amber-500/15",
      ring: "hover:border-amber-400/40",
      accentText: "text-amber-300",
    },
  },
  {
    match: ["software", "app", "productivity", "cloud"],
    visual: {
      icon: Laptop2,
      logos: ["/logos/microsoft-365.svg", "/logos/adobe-creative-cloud.svg", "/logos/canva.svg"],
      chip: "bg-gradient-to-br from-sky-400 to-sky-600 shadow-sky-500/30",
      glow: "from-sky-500/15",
      ring: "hover:border-sky-400/40",
      accentText: "text-sky-300",
    },
  },
  {
    match: ["payment", "card", "visa", "mastercard", "prepaid"],
    visual: {
      icon: CreditCard,
      logos: ["/logos/visa-gift-card.svg", "/logos/mastercard-gift-card.svg", "/logos/amex-gift-card.svg"],
      chip: "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30",
      glow: "from-emerald-500/15",
      ring: "hover:border-emerald-400/40",
      accentText: "text-emerald-300",
    },
  },
  {
    match: ["crypto", "bitcoin", "token", "wallet"],
    visual: {
      icon: Bitcoin,
      logos: [],
      chip: "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/30",
      glow: "from-yellow-500/15",
      ring: "hover:border-yellow-400/40",
      accentText: "text-yellow-300",
    },
  },
  {
    match: ["travel", "flight", "hotel", "airline"],
    visual: {
      icon: Plane,
      logos: [],
      chip: "bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/30",
      glow: "from-cyan-500/15",
      ring: "hover:border-cyan-400/40",
      accentText: "text-cyan-300",
    },
  },
]

export function getCategoryVisual(name: string | null | undefined): CategoryVisual {
  if (!name) return fallback
  const key = name.toLowerCase()
  for (const entry of visualEntries) {
    if (entry.match.some((m) => key.includes(m))) return entry.visual
  }
  return fallback
}
