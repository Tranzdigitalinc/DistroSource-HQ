"use server"

import { revalidatePath } from "next/cache"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { teamLicenseRequests } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"

export async function getTeamLicenseRequests() {
  await requireAdmin()
  return db.select().from(teamLicenseRequests).orderBy(desc(teamLicenseRequests.createdAt))
}

export async function updateTeamLicenseRequestStatus(id: number, status: "pending" | "contacted" | "closed") {
  await requireAdmin()
  await db.update(teamLicenseRequests).set({ status }).where(eq(teamLicenseRequests.id, id))
  revalidatePath("/admin/team-licensing")
}
