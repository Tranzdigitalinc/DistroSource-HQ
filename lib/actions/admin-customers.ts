"use server"

import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { entitlements, orders, products, supportTickets, user } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"

export async function searchCustomers(query: string) {
  await requireAdmin()
  const trimmed = query.trim()

  const customers = await db
    .select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
    .from(user)
    .where(trimmed ? or(ilike(user.name, `%${trimmed}%`), ilike(user.email, `%${trimmed}%`)) : undefined)
    .orderBy(desc(user.createdAt))
    .limit(50)

  if (customers.length === 0) return []

  const totals = await db
    .select({ userId: orders.userId, orderCount: sql<number>`count(*)::int`, lifetimeUsd: sql<string>`coalesce(sum(${orders.totalUsd}), 0)` })
    .from(orders)
    .where(eq(orders.status, "completed"))
    .groupBy(orders.userId)

  const totalsByUser = new Map(totals.map((t) => [t.userId, t]))

  return customers.map((c) => ({
    ...c,
    orderCount: totalsByUser.get(c.id)?.orderCount ?? 0,
    lifetimeUsd: totalsByUser.get(c.id)?.lifetimeUsd ?? "0",
  }))
}

export async function getCustomerDetail(userId: string) {
  await requireAdmin()

  const [customer] = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  if (!customer) return null

  const customerOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))

  const activeEntitlements = await db
    .select({ entitlement: entitlements, product: products })
    .from(entitlements)
    .innerJoin(products, eq(entitlements.productId, products.id))
    .where(and(eq(entitlements.userId, userId), eq(entitlements.isRevoked, false)))
    .orderBy(desc(entitlements.createdAt))

  const tickets = await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt))

  return { customer, orders: customerOrders, entitlements: activeEntitlements, tickets }
}
