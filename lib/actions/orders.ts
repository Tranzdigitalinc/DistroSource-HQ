"use server"

import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { getOwnerId } from "@/lib/session"

export async function resendOrderConfirmation(orderNumber: string) {
  const userId = await getOwnerId()
  const [order] = await db.select().from(orders).where(and(eq(orders.orderNumber, orderNumber), eq(orders.userId, userId))).limit(1)
  if (!order) throw new Error("Order not found")
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  const sent = await sendOrderConfirmationEmail(
    order.billingEmail,
    order.orderNumber,
    items.map((item) => ({ productName: item.productName, licenseType: item.licenseType, quantity: item.quantity })),
  )
  if (!sent) throw new Error("We could not send the confirmation email. Please try again.")
  await db.update(orders).set({ confirmationEmailSent: true }).where(eq(orders.id, order.id))
  return { sent: true }
}
