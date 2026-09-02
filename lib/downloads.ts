import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { downloadEvents, entitlements, productFiles, products } from "@/lib/db/schema"

/**
 * Looks up whether a user owns a product — i.e. holds a non-revoked
 * entitlement from a completed order. Every download and library view must
 * go through this check; entitlements are never inferred from the client.
 */
export async function getEntitlement(userId: string, productId: number) {
  const [entitlement] = await db
    .select()
    .from(entitlements)
    .where(and(eq(entitlements.userId, userId), eq(entitlements.productId, productId), eq(entitlements.isRevoked, false)))
    .limit(1)
  return entitlement ?? null
}

export async function getUserEntitlements(userId: string) {
  return db
    .select({ entitlement: entitlements, product: products })
    .from(entitlements)
    .innerJoin(products, eq(entitlements.productId, products.id))
    .where(and(eq(entitlements.userId, userId), eq(entitlements.isRevoked, false)))
}

/**
 * Re-checks entitlement server-side and, if valid, records a download event
 * and returns the file row to stream. Never trust a client-supplied file URL
 * — the caller must fetch the blob content through `get()` using
 * `file.blobPathname`.
 */
export async function authorizeDownload(userId: string, fileId: number, ipAddress?: string) {
  const [file] = await db.select().from(productFiles).where(eq(productFiles.id, fileId)).limit(1)
  if (!file) return { ok: false as const, reason: "File not found" }

  const entitlement = await getEntitlement(userId, file.productId)
  if (!entitlement) return { ok: false as const, reason: "You do not own this product" }

  await db.insert(downloadEvents).values({
    entitlementId: entitlement.id,
    userId,
    productFileId: file.id,
    ipAddress: ipAddress ?? null,
  })

  return { ok: true as const, file }
}
