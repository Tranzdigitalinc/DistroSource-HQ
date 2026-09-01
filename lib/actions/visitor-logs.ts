"use server"

import { and, countDistinct, count, desc, eq, gte, sql } from "drizzle-orm"
import { requireAdmin } from "@/lib/actions/operations"
import { db } from "@/lib/db"
import { visitorLogs } from "@/lib/db/schema"

const PAGE_SIZE = 30

export async function getVisitorLogsFiltered(filters: { country?: string; deviceType?: string; page?: number }) {
  await requireAdmin()
  const page = Math.max(1, filters.page ?? 1)
  const conditions = []
  if (filters.country) conditions.push(eq(visitorLogs.country, filters.country))
  if (filters.deviceType) conditions.push(eq(visitorLogs.deviceType, filters.deviceType))
  const where = conditions.length ? and(...conditions) : undefined

  const [rows, countries, deviceTypes] = await Promise.all([
    db
      .select()
      .from(visitorLogs)
      .where(where)
      .orderBy(desc(visitorLogs.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .selectDistinct({ country: visitorLogs.country })
      .from(visitorLogs)
      .where(sql`${visitorLogs.country} is not null`)
      .orderBy(visitorLogs.country),
    db
      .selectDistinct({ deviceType: visitorLogs.deviceType })
      .from(visitorLogs)
      .where(sql`${visitorLogs.deviceType} is not null`)
      .orderBy(visitorLogs.deviceType),
  ])

  return {
    rows,
    countries: countries.map((r) => r.country).filter((c): c is string => Boolean(c)),
    deviceTypes: deviceTypes.map((r) => r.deviceType).filter((d): d is string => Boolean(d)),
    page,
    pageSize: PAGE_SIZE,
  }
}

export async function getVisitorStats() {
  await requireAdmin()
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [totals, last24h, deviceBreakdown, topCountries] = await Promise.all([
    db.select({ count: count(), uniqueVisitors: countDistinct(visitorLogs.visitorId) }).from(visitorLogs),
    db
      .select({ count: count(), uniqueVisitors: countDistinct(visitorLogs.visitorId) })
      .from(visitorLogs)
      .where(gte(visitorLogs.createdAt, since24h)),
    db
      .select({ deviceType: visitorLogs.deviceType, count: count() })
      .from(visitorLogs)
      .where(sql`${visitorLogs.deviceType} is not null`)
      .groupBy(visitorLogs.deviceType)
      .orderBy(desc(count())),
    db
      .select({ country: visitorLogs.country, count: count() })
      .from(visitorLogs)
      .where(sql`${visitorLogs.country} is not null`)
      .groupBy(visitorLogs.country)
      .orderBy(desc(count()))
      .limit(5),
  ])

  return {
    totalVisits: totals[0]?.count ?? 0,
    uniqueVisitors: totals[0]?.uniqueVisitors ?? 0,
    visits24h: last24h[0]?.count ?? 0,
    uniqueVisitors24h: last24h[0]?.uniqueVisitors ?? 0,
    deviceBreakdown,
    topCountries,
  }
}
