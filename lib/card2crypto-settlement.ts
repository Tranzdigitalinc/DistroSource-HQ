import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { card2cryptoPayments, orders } from "@/lib/db/schema"
import { fulfillPendingOrder } from "@/lib/checkout-core"
import { getCard2CryptoPaymentStatus } from "@/lib/card2crypto"

/**
 * Card2Crypto reports the USDC actually received. Provider FX and rounding
 * can shave a little off the requested amount, so anything within this
 * tolerance of the order total is treated as paid in full. Larger gaps are
 * recorded and left pending for manual review rather than fulfilled.
 */
const UNDERPAYMENT_TOLERANCE = 0.03

export type Card2CryptoSettlement =
  | { status: "paid"; orderNumber: string }
  | { status: "pending" }
  | { status: "underpaid"; expected: number; received: number }
  | { status: "error"; error: string }

/**
 * Verifies a pending Card2Crypto order with the provider and fulfils it.
 * Shared by the GET callback route and the buyer's manual status check, so
 * both paths make identical decisions. Idempotent: an already completed
 * order reports "paid" without touching anything.
 */
export async function settleCard2CryptoOrder(order: typeof orders.$inferSelect): Promise<Card2CryptoSettlement> {
  if (order.status === "completed") return { status: "paid", orderNumber: order.orderNumber }
  if (order.status !== "pending_payment") return { status: "error", error: "This order is no longer payable." }
  if (order.paymentMethod !== "card2crypto") return { status: "error", error: "This order was not started with Card2Crypto." }

  const [payment] = await db.select().from(card2cryptoPayments).where(eq(card2cryptoPayments.orderId, order.id)).limit(1)
  if (!payment) return { status: "error", error: "This order has no Card2Crypto payment record." }

  let status: Awaited<ReturnType<typeof getCard2CryptoPaymentStatus>>
  try {
    status = await getCard2CryptoPaymentStatus(payment.ipnToken)
  } catch (error) {
    // A provider/network hiccup is not "unpaid" — report pending so the
    // caller can try again later.
    console.error("[v0] Card2Crypto status check failed:", error)
    return { status: "pending" }
  }
  if (!status.paid) return { status: "pending" }

  const expected = Number.parseFloat(order.totalUsd)
  const received = status.valueCoin
  if (received !== null && received < expected * (1 - UNDERPAYMENT_TOLERANCE)) {
    console.error(`[v0] Card2Crypto underpayment on ${order.orderNumber}: expected ${expected}, received ${received}`)
    await db.update(card2cryptoPayments).set({ paidAmount: received.toFixed(2), txid: status.txidOut }).where(eq(card2cryptoPayments.id, payment.id))
    return { status: "underpaid", expected, received }
  }

  // fulfillPendingOrder's own `status = "pending_payment"` guard makes this
  // safe against the callback and a manual check racing each other.
  await fulfillPendingOrder(order)
  await db
    .update(card2cryptoPayments)
    .set({ paidAt: new Date(), paidAmount: received !== null ? received.toFixed(2) : order.totalUsd, txid: status.txidOut })
    .where(eq(card2cryptoPayments.id, payment.id))
  return { status: "paid", orderNumber: order.orderNumber }
}
