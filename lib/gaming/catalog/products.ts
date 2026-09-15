import type { GamingProduct } from "@/lib/gaming/catalog/types"
import { BENCHMARK_PRODUCTS } from "@/lib/gaming/catalog/records/benchmark"
import { FIVEM_PRODUCTS } from "@/lib/gaming/catalog/records/fivem"
import { MINECRAFT_PRODUCTS } from "@/lib/gaming/catalog/records/minecraft"
import { COMMUNITY_CREATOR_PRODUCTS } from "@/lib/gaming/catalog/records/community-creator"

/**
 * DistroSource Gaming catalogue.
 *
 * Every product is `on-sale`, billed as a Fungies subscription. Each slug
 * maps to a Fungies product and plan in the gaming_fungies_products table,
 * filled by Admin → Gaming → Sync to Fungies; checkout refuses any slug
 * without one.
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
