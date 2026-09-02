import { getCategoryIcon } from "@/lib/category-icons"

export interface CategoryVisual {
  icon: ReturnType<typeof getCategoryIcon>
  chip: string
  glow: string
  ring: string
  accentText: string
}

const palettes = [
  { chip: "bg-gradient-to-br from-primary to-primary/70 shadow-primary/30", glow: "from-primary/15", ring: "hover:border-primary/40", accentText: "text-primary" },
  { chip: "bg-gradient-to-br from-accent to-accent/70 shadow-accent/30", glow: "from-accent/15", ring: "hover:border-accent/40", accentText: "text-accent" },
  { chip: "bg-gradient-to-br from-violet-400 to-violet-600 shadow-violet-500/30", glow: "from-violet-500/15", ring: "hover:border-violet-400/40", accentText: "text-violet-300" },
  { chip: "bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30", glow: "from-rose-500/15", ring: "hover:border-rose-400/40", accentText: "text-rose-300" },
  { chip: "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30", glow: "from-amber-500/15", ring: "hover:border-amber-400/40", accentText: "text-amber-300" },
  { chip: "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30", glow: "from-emerald-500/15", ring: "hover:border-emerald-400/40", accentText: "text-emerald-300" },
]

export function getCategoryVisual(slug: string | null | undefined): CategoryVisual {
  const icon = getCategoryIcon(slug)
  let hash = 0
  for (const char of slug ?? "") hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const palette = palettes[hash % palettes.length]
  return { icon, ...palette }
}
