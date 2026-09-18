"use server"

import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { orders, orderItems } from "@/lib/db/schema"
import { computeOrderPricing } from "@/lib/checkout-core"
import { getOwnerId, getSession } from "@/lib/session"
import { generateOrderNumber } from "@/lib/format"
import { EMAIL_PATTERN } from "@/lib/checkout-core"
import { addTebexPackage, createTebexBasket, isTebexConfigured } from "@/lib/tebex"
import { getGamingProductBySlug } from "@/lib/gaming/queries"
import { gamingSubscriptions } from "@/lib/db/schema"
import { generateGamingReference } from "@/lib/gaming/billing"

export async function createTebexCheckout(input: { billingEmail: string; billingName: string; couponCode?: string }): Promise<{ ident: string; orderNumber: string } | { error: string }> {
  if (!isTebexConfigured()) return { error: "Tebex checkout is not configured." }
  const email = input.billingEmail.trim()
  const name = input.billingName.trim()
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address for your order confirmation." }
  if (!name) return { error: "Enter the name on this order." }

  const ownerId = await getOwnerId()
  const session = await getSession()
  const cookieStore = await cookies()
  const pricing = await computeOrderPricing(ownerId, input.couponCode, session, cookieStore)
  if (pricing.total <= 0) return { error: "Your order total is $0 after discounts — use the free checkout instead." }
  if (pricing.validatedItems.some((item) => !item.productSku?.trim())) return { error: "One or more products are not configured for Tebex yet. Please choose another payment method." }

  const orderNumber = generateOrderNumber()
  const [pending] = await db.transaction(async (tx) => {
    const [order] = await tx.insert(orders).values({
      orderNumber, userId: ownerId, status: "pending_payment", subtotalUsd: pricing.subtotal.toFixed(2),
      discountUsd: pricing.discount.toFixed(2), totalUsd: pricing.total.toFixed(2), currency: "usd",
      couponCode: pricing.promotion?.code ?? null, referralCode: pricing.referral?.code ?? null,
      affiliateCode: pricing.affiliateCode, billingEmail: email, billingName: name, paymentMethod: "tebex",
    }).returning()
    await tx.insert(orderItems).values(pricing.validatedItems.map((item) => ({
      orderId: order.id, productId: item.productId, licenseId: item.licenseId, productName: item.productName,
      licenseType: item.licenseType, unitPriceUsd: item.unitPriceUsd.toFixed(2), quantity: item.quantity,
      discountUsd: "0", finalLineAmountUsd: (item.unitPriceUsd * item.quantity).toFixed(2), productVersion: item.productVersion, currency: "usd",
    })))
    return [order]
  })

  try {
    const basket = await createTebexBasket({ orderNumber, email })
    for (const item of pricing.validatedItems) {
      await addTebexPackage({ basketIdent: basket.ident, packageId: item.productSku!, quantity: item.quantity, variableData: { license_type: item.licenseType } })
    }
    return { ident: basket.ident, orderNumber }
  } catch (error) {
    await db.transaction(async (tx) => {
      await tx.delete(orderItems).where(eq(orderItems.orderId, pending.id))
      await tx.delete(orders).where(eq(orders.id, pending.id))
    })
    console.error("[v0] Tebex checkout creation failed:", error)
    return { error: error instanceof Error ? error.message : "Could not start Tebex checkout." }
  }
}

export async function createGamingTebexCheckout(input: { slug: string; billingEmail?: string }): Promise<{ ident: string; reference: string } | { error: string }> {
  if (!isTebexConfigured()) return { error: "Tebex checkout is not configured." }
  const product = getGamingProductBySlug(input.slug)
  if (!product || product.availability !== "on-sale" || product.pricing.kind !== "subscription" || !product.pricing.annual) {
    return { error: "This gaming product is not available for one-time checkout." }
  }
  const ownerId = await getOwnerId()
  const session = await getSession()
  const email = (session?.user?.email || input.billingEmail || "").trim()
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." }
  const reference = generateGamingReference()
  const [pending] = await db.insert(gamingSubscriptions).values({
    reference, userId: ownerId, productSlug: product.slug, interval: "one-time", status: "pending",
    priceUsd: product.pricing.annual.toFixed(2), billingName: session?.user?.name || email.split("@")[0], billingEmail: email,
  }).returning({ id: gamingSubscriptions.id })
  try {
    const basket = await createTebexBasket({ orderNumber: reference, email })
    await addTebexPackage({ basketIdent: basket.ident, packageId: product.id, quantity: 1, variableData: { product_slug: product.slug, billing: "one-time" } })
    return { ident: basket.ident, reference }
  } catch (error) {
    await db.delete(gamingSubscriptions).where(eq(gamingSubscriptions.id, pending.id))
    console.error("[v0] Gaming Tebex checkout creation failed:", error)
    return { error: "Could not start Tebex checkout." }
  }
}

export async function confirmTebexCheckout(orderNumber: string): Promise<{ status: "paid"; orderNumber: string } | { status: "pending" } | { status: "error"; error: string }> {
  const ownerId = await getOwnerId()
  const [order] = await db.select().from(orders).where(and(eq(orders.orderNumber, orderNumber), eq(orders.userId, ownerId))).limit(1)
  if (!order) return { status: "error", error: "Order not found." }
  if (order.status === "completed") return { status: "paid", orderNumber }
  // The Tebex success redirect is not authoritative; fulfillment should be
  // done by the Tebex webhook. Keep the client in a waiting state meanwhile.
  return { status: "pending" }
}
