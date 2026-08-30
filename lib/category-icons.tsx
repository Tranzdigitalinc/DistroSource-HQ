import {
  Gamepad2,
  Gift,
  Smartphone,
  Laptop,
  UtensilsCrossed,
  Users,
  type LucideIcon,
} from "lucide-react"

export const categoryIconMap: Record<string, LucideIcon> = {
  gamepad: Gamepad2,
  gift: Gift,
  smartphone: Smartphone,
  laptop: Laptop,
  utensils: UtensilsCrossed,
  users: Users,
}

export function getCategoryIcon(iconName: string): LucideIcon {
  return categoryIconMap[iconName] ?? Gift
}
