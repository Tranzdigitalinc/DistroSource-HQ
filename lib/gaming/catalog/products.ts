import type { GamingProduct } from "@/lib/gaming/catalog/types"
import { BENCHMARK_PRODUCTS } from "@/lib/gaming/catalog/records/benchmark"
import { FIVEM_PRODUCTS } from "@/lib/gaming/catalog/records/fivem"
import { MINECRAFT_PRODUCTS } from "@/lib/gaming/catalog/records/minecraft"
import { COMMUNITY_CREATOR_PRODUCTS } from "@/lib/gaming/catalog/records/community-creator"

/**
 * DistroSource Gaming catalogue.
 *
 * Every product is `launching`: fully presented, with checkout not offered
 * until real deliverables and a payment mapping exist. Prices, cadence and
 * quantities are proposals for owner approval.
 *
 * The 46 products from the previous catalogue are archived, unlisted, in
 * scripts/gaming/legacy/legacy-catalog-2026-09.json.
 */
export const GAMING_CATALOG: GamingProduct[] = [
  ...BENCHMARK_PRODUCTS,
  ...FIVEM_PRODUCTS,
  ...MINECRAFT_PRODUCTS,
  ...COMMUNITY_CREATOR_PRODUCTS,
]
