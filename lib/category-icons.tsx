import {
  Gamepad2,
  Gift,
  Smartphone,
  Laptop2,
  UtensilsCrossed,
  Users,
  Clapperboard,
  ShoppingBag,
  Plane,
  Bitcoin,
  CreditCard,
  Music,
  Tv,
  type LucideIcon,
} from "lucide-react"

// Explicit icon-name mapping (used when a category has a known icon_name).
export const categoryIconMap: Record<string, LucideIcon> = {
  "gamepad-2": Gamepad2,
  gift: Gift,
  smartphone: Smartphone,
  "laptop-2": Laptop2,
  utensils: UtensilsCrossed,
  users: Users,
  clapperboard: Clapperboard,
  "shopping-bag": ShoppingBag,
  plane: Plane,
  bitcoin: Bitcoin,
  "credit-card": CreditCard,
  music: Music,
  tv: Tv,
}

// Keyword-based fallback that resolves an icon from a category name or slug.
// Reloadly categories don't carry usable icon names, so we infer from the label.
const keywordIcons: Array<{ match: string[]; icon: LucideIcon }> = [
  { match: ["game", "gaming", "playstation", "xbox", "steam", "roblox"], icon: Gamepad2 },
  { match: ["entertain", "stream", "movie", "video", "netflix", "tv"], icon: Clapperboard },
  { match: ["music", "spotify", "audio"], icon: Music },
  { match: ["shop", "retail", "ecommerce", "store", "amazon"], icon: ShoppingBag },
  { match: ["travel", "flight", "hotel", "airline"], icon: Plane },
  { match: ["crypto", "bitcoin", "token", "wallet"], icon: Bitcoin },
  { match: ["payment", "card", "visa", "mastercard", "prepaid"], icon: CreditCard },
  { match: ["software", "app", "productivity", "cloud"], icon: Laptop2 },
  { match: ["mobile", "topup", "top-up", "airtime", "phone"], icon: Smartphone },
  { match: ["food", "dining", "restaurant", "delivery"], icon: UtensilsCrossed },
  { match: ["social", "community"], icon: Users },
]

export function getCategoryIcon(value: string | null | undefined): LucideIcon {
  if (!value) return Gift
  const key = value.toLowerCase()
  if (categoryIconMap[key]) return categoryIconMap[key]
  for (const entry of keywordIcons) {
    if (entry.match.some((m) => key.includes(m))) return entry.icon
  }
  return Gift
}
