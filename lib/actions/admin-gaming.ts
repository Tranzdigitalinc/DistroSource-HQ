"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/actions/operations"
import { isFungiesConfigured } from "@/lib/env"
import { syncGamingPlansToFungies, type GamingFungiesSyncBatch } from "@/lib/gaming/fungies-sync"

/**
 * Admin → Gaming → Sync to Fungies. Handles one small batch per call; the
 * client calls again until `remaining` is 0. Runs on the deployment, with
 * the Fungies keys already configured there.
 */
export async function syncGamingPlansAction(): Promise<GamingFungiesSyncBatch | { error: string }> {
  await requireAdmin()
  if (!isFungiesConfigured()) return { error: "Fungies isn't configured on this deployment." }
  try {
    const batch = await syncGamingPlansToFungies({ limit: 4 })
    revalidatePath("/admin/gaming")
    return batch
  } catch (error) {
    console.error("[v0] Gaming Fungies sync failed", error)
    return { error: error instanceof Error ? error.message : "The sync failed." }
  }
}
