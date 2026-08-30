import {
  Gamepad2,
  Gift,
  Smartphone,
  Laptop2,
  UtensilsCrossed,
  Users,
  Clapperboard,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"

export const categoryIconMap: Record<string, LucideIcon> = {
  "gamepad-2": Gamepad2,
  gift: Gift,
  smartphone: Smartphone,
  "laptop-2": Laptop2,
  utensils: UtensilsCrossed,
  users: Users,
  clapperboard: Clapperboard,
  "shopping-bag": ShoppingBag,
}

export function getCategoryIcon(iconName: string): LucideIcon {
  return categoryIconMap[iconName] ?? Gift
}

export const categoryImageMap: Record<string, string> = {
  gaming: "/categories/gaming.png",
  streaming: "/categories/streaming.png",
  "mobile-topup": "/categories/mobile-topup.png",
  shopping: "/categories/shopping.png",
  software: "/categories/software.png",
  "food-delivery": "/categories/food-delivery.png",
  social: "/categories/social.png",
  "gift-cards": "/categories/gift-cards.png",
}

export function getCategoryImage(categorySlug: string): string {
  return categoryImageMap[categorySlug] ?? "/categories/gift-cards.png"
}
