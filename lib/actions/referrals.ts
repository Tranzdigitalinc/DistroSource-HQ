"use server"

import { db } from "@/lib/db"
import { orders, referralCodes, referralRedemptions, user } from "@/lib/db/schema"
import { getUserId } from "@/lib/session"
import { desc, eq } from "drizzle-orm"

const DEFAULT_REWARD_PERCENT = 10
const DEFAULT_REFEREE_PERCENT = 10

function randomCode(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
}

async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `RC-${randomCode(6)}`
    const existing = await db.select({ id: referralCodes.id }).from(referralCodes).where(eq(referralCodes.code, code)).limit(1)
    if (existing.length === 0) return code
  }
  throw new Error("Could not generate a unique referral code. Please try again.")
}

export async function getOrCreateMyReferralCode() {
  const userId = await getUserId()

  const existing = await db.select().from(referralCodes).where(eq(referralCodes.userId, userId)).limit(1)
  if (existing[0]) return existing[0]

  const code = await generateUniqueCode()
  const [created] = await db
    .insert(referralCodes)
    .values({
      userId,
      code,
      rewardDiscountPercent: DEFAULT_REWARD_PERCENT,
      refereeDiscountPercent: DEFAULT_REFEREE_PERCENT,
    })
    .returning()

  return created
}

export async function getMyReferralStats() {
  const userId = await getUserId()

  const [referral] = await db.select().from(referralCodes).where(eq(referralCodes.userId, userId)).limit(1)
  if (!referral) return { referral: null, redemptions: [] }

  const redemptions = await db
    .select({
      id: referralRedemptions.id,
      status: referralRedemptions.status,
      createdAt: referralRedemptions.createdAt,
      rewardedAt: referralRedemptions.rewardedAt,
      rewardCouponCode: referralRedemptions.rewardCouponCode,
      refereeOrderId: referralRedemptions.refereeOrderId,
      refereeName: user.name,
      orderTotal: orders.totalUsd,
    })
    .from(referralRedemptions)
    .leftJoin(user, eq(referralRedemptions.refereeUserId, user.id))
    .leftJoin(orders, eq(referralRedemptions.refereeOrderId, orders.id))
    .where(eq(referralRedemptions.referralCodeId, referral.id))
    .orderBy(desc(referralRedemptions.createdAt))

  return { referral, redemptions }
}
