export type SubscriptionPlatform = "FiveM" | "Minecraft" | "Game Servers"

export type SubscriptionModel =
  | "catalog_access"
  | "monthly_drop"
  | "credits"
  | "pick_keep"
  | "updates"

export interface GamingSubscriptionPlan {
  slug: string
  name: string
  family: string
  platform: SubscriptionPlatform
  model: SubscriptionModel
  audience: string
  summary: string
  immediateAccess: string
  recurringDelivery: string
  cadence: string
  quantity: string
  categories: string[]
  fileTypes: string[]
  accessRule: string
  cancellationRule: string
  rolloverRule: string
  eligible: string[]
  excluded: string[]
  license: string
  commercialUse: string
  updates: string
  renewal: string
  usageLimits: string
  notIncluded: string[]
  whatYouGet: string[]
  howItWorks: string[]
  monthlyPriceUsd: number
  annualPriceUsd: number
  previewOnly: true
  requiresFutureDeliverables: true
  cover: string
  gallery: string[]
}
