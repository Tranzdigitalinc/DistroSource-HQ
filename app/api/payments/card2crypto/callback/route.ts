import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { card2cryptoPayments, orders } from "@/lib/db/schema"
import { settleCard2CryptoOrder } from "@/lib/card2crypto-settlement"

export const dynamic = "force-dynamic"

/**
 * Card2Crypto payment callback (their bot issues a GET when the buyer pays).
 *
 * The callback carries no signature, so it is treated purely as a *hint*:
 *   1. the URL must carry the order number and the per-order secret token
 *      we generated when the wallet was created;
 *   2. `address_in` must match the temporary Polygon address stored for
 *      that order;
 *   3. the payment is then re-verified with Card2Crypto's status endpoint
 *      (via `settleCard2CryptoOrder`) before anything is fulfilled.
 *
 * Answers 200 for a genuine order so the provider does not retry forever;
 * anything that fails verification is logged and rejected.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const orderNumber = url.searchParams.get("order")?.trim()
  const token = url.searchParams.get("token")?.trim()
  const addressIn = url.searchParams.get("address_in")?.trim()

  if (!orderNumber || !token) {
    return NextResponse.json({ error: "Missing order reference" }, { status: 400 })
  }

  const [row] = await db
    .select({ order: orders, payment: card2cryptoPayments })
    .from(orders)
    .innerJoin(card2cryptoPayments, eq(card2cryptoPayments.orderId, orders.id))
    .where(and(eq(orders.orderNumber, orderNumber), eq(orders.paymentMethod, "card2crypto")))
    .limit(1)

  if (!row || row.payment.callbackToken !== token) {
    console.error("[v0] Card2Crypto callback rejected: unknown order or bad token", { orderNumber })
    return NextResponse.json({ error: "Unknown order" }, { status: 401 })
  }

  if (addressIn && addressIn.toLowerCase() !== row.payment.polygonAddress.toLowerCase()) {
    console.error("[v0] Card2Crypto callback rejected: address_in mismatch", { orderNumber })
    return NextResponse.json({ error: "Address mismatch" }, { status: 400 })
  }

  const result = await settleCard2CryptoOrder(row.order)
  if (result.status === "error") {
    console.error("[v0] Card2Crypto callback could not settle order", { orderNumber, error: result.error })
    return NextResponse.json({ received: true, status: result.status, error: result.error })
  }
  return NextResponse.json({ received: true, status: result.status })
}
