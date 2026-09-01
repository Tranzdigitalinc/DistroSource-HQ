"use server"

import { db } from "@/lib/db"
import { affiliateCodes, orders } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"
import { desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

function randomCode(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
}

async function generateUniqueAffiliateCode(partnerName: string): Promise<string> {
  const base = partnerName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8)
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `${base || "PARTNER"}-${randomCode(4)}`
    const existing = await db.select({ id: affiliateCodes.id }).from(affiliateCodes).where(eq(affiliateCodes.code, code)).limit(1)
    if (existing.length === 0) return code
  }
  throw new Error("Could not generate a unique affiliate code. Please try again.")
}

export async function getAffiliateCodes() {
  await requireAdmin()
  return db.select().from(affiliateCodes).orderBy(desc(affiliateCodes.createdAt))
}

export async function createAffiliateCode(input: {
  partnerName: string
  contactEmail?: string
  commissionPercent: number
  notes?: string
}) {
  await requireAdmin()

  const partnerName = input.partnerName.trim()
  if (!partnerName) throw new Error("Partner name is required.")
  const commissionPercent = Math.min(100, Math.max(0, input.commissionPercent))

  const code = await generateUniqueAffiliateCode(partnerName)
  await db.insert(affiliateCodes).values({
    code,
    partnerName,
    contactEmail: input.contactEmail?.trim() || null,
    commissionPercent: commissionPercent.toFixed(2),
    notes: input.notes?.trim() || null,
  })

  revalidatePath("/admin/affiliates")
  return { code }
}

export async function toggleAffiliateCode(id: number, isActive: boolean) {
  await requireAdmin()
  await db.update(affiliateCodes).set({ isActive }).where(eq(affiliateCodes.id, id))
  revalidatePath("/admin/affiliates")
}

export async function getAffiliateReport() {
  await requireAdmin()

  const rows = await db
    .select({
      code: affiliateCodes.code,
      partnerName: affiliateCodes.partnerName,
      commissionPercent: affiliateCodes.commissionPercent,
      isActive: affiliateCodes.isActive,
      orderCount: sql<number>`count(${orders.id})::int`,
      revenueUsd: sql<string>`coalesce(sum(${orders.totalUsd}), 0)`,
    })
    .from(affiliateCodes)
    .leftJoin(orders, eq(orders.affiliateCode, affiliateCodes.code))
    .groupBy(affiliateCodes.id)
    .orderBy(desc(sql`coalesce(sum(${orders.totalUsd}), 0)`))

  return rows
}
