"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { operationEvents, productVariants } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"

export async function restockVariant(variantId: number, amount: number) {
  const userId = await requireAdmin()
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a positive restock amount.")

  const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, variantId)).limit(1)
  if (!variant) throw new Error("Variant not found.")

  const nextStock = variant.stockCount + Math.round(amount)
  await db.update(productVariants).set({ stockCount: nextStock }).where(eq(productVariants.id, variantId))

  await db.insert(operationEvents).values({
    eventType: "variant_restocked",
    entityType: "product_variant",
    entityId: String(variantId),
    status: "resolved",
    payload: { denominationLabel: variant.denominationLabel, amountAdded: Math.round(amount), newStockCount: nextStock },
    createdBy: userId,
    resolvedAt: new Date(),
  })

  revalidatePath("/admin")
  return { success: true, newStockCount: nextStock }
}
