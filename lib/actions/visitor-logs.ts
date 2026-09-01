"use server"

import { and, countDistinct, count, desc, eq, gte, lte, sql, ilike, or } from "drizzle-orm"
import { requireAdmin } from "@/lib/actions/operations"
import { db } from "@/lib/db"
import { visitorLogs } from "@/lib/db/schema"
import { getCachedReputations, type IpReputationResult } from "@/lib/abuseipdb"

const PAGE_SIZE = 30

export type VisitorLogFilters = {
  country?: string
  deviceType?: string
  page?: number
  search?: string
  from?: string
  to?: string
}

function buildConditions(filters: VisitorLogFilters) {
  const conditions = []
  if (filters.country) conditions.push(eq(visitorLogs.country, filters.country))
  if (filters.deviceType) conditions.push(eq(visitorLogs.deviceType, filters.deviceType))
  if (filters.search) {
    const term = `%${filters.search.trim()}%`
    conditions.push(or(ilike(visitorLogs.ipAddress, term), ilike(visitorLogs.path, term), ilike(visitorLogs.visitorId, term)))
  }
  if (filters.from) conditions.push(gte(visitorLogs.createdAt, new Date(`${filters.from}T00:00:00.000Z`)))
  if (filters.to) conditions.push(lte(visitorLogs.createdAt, new Date(`${filters.to}T23:59:59.999Z`)))
  return conditions
}

export async function getVisitorLogsFiltered(filters: VisitorLogFilters) {
  await requireAdmin()
  const page = Math.max(1, filters.page ?? 1)
  const conditions = buildConditions(filters)
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

  const reputationByIp = await getCachedReputations(
    rows.map((r) => r.ipAddress).filter((ip): ip is string => Boolean(ip)),
  )
  const rowsWithReputation = rows.map((row) => ({
    ...row,
    reputation: row.ipAddress ? (reputationByIp.get(row.ipAddress) ?? null) : null,
  }))

  return {
    rows: rowsWithReputation,
    countries: countries.map((r) => r.country).filter((c): c is string => Boolean(c)),
    deviceTypes: deviceTypes.map((r) => r.deviceType).filter((d): d is string => Boolean(d)),
    page,
    pageSize: PAGE_SIZE,
  }
}

export type VisitorLogRow = Awaited<ReturnType<typeof getVisitorLogsFiltered>>["rows"][number]
export type { IpReputationResult }

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

function referrerSource(referrer: string | null): string {
  if (!referrer) return "Direct"
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "")
    if (/google\./.test(host)) return "Google"
    if (/bing\./.test(host)) return "Bing"
    if (/duckduckgo\./.test(host)) return "DuckDuckGo"
    if (/facebook\.|instagram\.|fb\.com/.test(host)) return "Meta (FB/IG)"
    if (/t\.co|twitter\.|x\.com/.test(host)) return "X / Twitter"
    if (/tiktok\./.test(host)) return "TikTok"
    if (/reddit\./.test(host)) return "Reddit"
    if (/youtube\./.test(host)) return "YouTube"
    if (/linkedin\./.test(host)) return "LinkedIn"
    return host
  } catch {
    return "Direct"
  }
}

export async function getVisitorTrafficSeries(days = 14) {
  await requireAdmin()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [daily, referrerRows] = await Promise.all([
    db
      .select({
        day: sql<string>`to_char(${visitorLogs.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`.as("day"),
        count: count(),
        uniqueVisitors: countDistinct(visitorLogs.visitorId),
      })
      .from(visitorLogs)
      .where(gte(visitorLogs.createdAt, since))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db
      .select({ referrer: visitorLogs.referrer, count: count() })
      .from(visitorLogs)
      .where(gte(visitorLogs.createdAt, since))
      .groupBy(visitorLogs.referrer),
  ])

  // Fill in missing days with zero counts so the chart has a continuous timeline
  const byDay = new Map(daily.map((d) => [d.day, d]))
  const series: { day: string; count: number; uniqueVisitors: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    const existing = byDay.get(key)
    series.push({ day: key, count: existing?.count ?? 0, uniqueVisitors: existing?.uniqueVisitors ?? 0 })
  }

  const bySource = new Map<string, number>()
  for (const row of referrerRows) {
    const source = referrerSource(row.referrer)
    bySource.set(source, (bySource.get(source) ?? 0) + row.count)
  }
  const referrers = Array.from(bySource.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return { series, referrers }
}

export async function getVisitorSession(visitorId: string) {
  await requireAdmin()
  const rows = await db
    .select()
    .from(visitorLogs)
    .where(eq(visitorLogs.visitorId, visitorId))
    .orderBy(desc(visitorLogs.createdAt))
    .limit(200)

  const reputationByIp = await getCachedReputations(
    rows.map((r) => r.ipAddress).filter((ip): ip is string => Boolean(ip)),
  )

  return rows.map((row) => ({
    ...row,
    reputation: row.ipAddress ? (reputationByIp.get(row.ipAddress) ?? null) : null,
  }))
}
