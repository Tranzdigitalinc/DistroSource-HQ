import { db } from "@/lib/db"
import { ipReputation } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"

const STALE_AFTER_MS = 1000 * 60 * 60 * 24 // re-check each IP at most once per day
const ABUSEIPDB_ENDPOINT = "https://api.abuseipdb.com/api/v2/check"

export type IpReputationResult = {
  ipAddress: string
  abuseConfidenceScore: number | null
  totalReports: number | null
  isWhitelisted: boolean | null
  isPrivate: boolean
  isp: string | null
  usageType: string | null
  domain: string | null
  countryCode: string | null
  lastCheckedAt: Date
}

// RFC1918/loopback/link-local ranges — never worth querying AbuseIPDB for these.
function isPrivateIp(ip: string): boolean {
  if (!ip) return true
  if (ip === "::1" || ip === "127.0.0.1" || ip === "unknown") return true
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.")) return true
  if (ip.startsWith("172.")) {
    const second = Number(ip.split(".")[1])
    if (second >= 16 && second <= 31) return true
  }
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true
  return false
}

function isStale(lastCheckedAt: Date): boolean {
  return Date.now() - lastCheckedAt.getTime() > STALE_AFTER_MS
}

/** Reads cached reputation rows for a batch of IPs. Never calls the AbuseIPDB API. */
export async function getCachedReputations(ipAddresses: string[]): Promise<Map<string, IpReputationResult>> {
  const unique = [...new Set(ipAddresses.filter(Boolean))]
  if (unique.length === 0) return new Map()

  const rows = await db.select().from(ipReputation).where(inArray(ipReputation.ipAddress, unique))
  return new Map(rows.map((row) => [row.ipAddress, row]))
}

/** Calls the AbuseIPDB API for a single IP and upserts the cache. Safe to call fire-and-forget. */
export async function refreshReputation(ip: string): Promise<void> {
  const apiKey = process.env.ABUSEIPDB_API_KEY
  if (!apiKey || !ip) return

  if (isPrivateIp(ip)) {
    await db
      .insert(ipReputation)
      .values({ ipAddress: ip, isPrivate: true, lastCheckedAt: new Date() })
      .onConflictDoUpdate({
        target: ipReputation.ipAddress,
        set: { isPrivate: true, lastCheckedAt: new Date() },
      })
    return
  }

  try {
    const res = await fetch(`${ABUSEIPDB_ENDPOINT}?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`, {
      headers: { Key: apiKey, Accept: "application/json" },
      cache: "no-store",
    })
    if (!res.ok) return
    const json = await res.json()
    const data = json?.data
    if (!data) return

    await db
      .insert(ipReputation)
      .values({
        ipAddress: ip,
        abuseConfidenceScore: data.abuseConfidenceScore ?? null,
        totalReports: data.totalReports ?? null,
        isWhitelisted: data.isWhitelisted ?? null,
        isPrivate: false,
        isp: data.isp ?? null,
        usageType: data.usageType ?? null,
        domain: data.domain ?? null,
        countryCode: data.countryCode ?? null,
        lastCheckedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: ipReputation.ipAddress,
        set: {
          abuseConfidenceScore: data.abuseConfidenceScore ?? null,
          totalReports: data.totalReports ?? null,
          isWhitelisted: data.isWhitelisted ?? null,
          isPrivate: false,
          isp: data.isp ?? null,
          usageType: data.usageType ?? null,
          domain: data.domain ?? null,
          countryCode: data.countryCode ?? null,
          lastCheckedAt: new Date(),
        },
      })
  } catch {
    // Reputation lookups must never break the request that triggered them.
  }
}

/** Ensures a fresh-enough cache row exists for this IP, fetching from AbuseIPDB only if missing/stale. */
export async function ensureReputationFresh(ip: string): Promise<void> {
  if (!ip || ip === "unknown") return
  const [existing] = await db.select().from(ipReputation).where(eq(ipReputation.ipAddress, ip)).limit(1)
  if (existing && !isStale(existing.lastCheckedAt)) return
  await refreshReputation(ip)
}
