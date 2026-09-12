import assert from "node:assert/strict"
import test from "node:test"
import { GAMING_SUBSCRIPTION_PLANS, getGamingSubscriptionPlan, planDescriptionHtml } from "../lib/gaming/subscriptions/catalog.ts"

test("catalog contains 100 unique, non-filler plan identities", () => {
  assert.equal(GAMING_SUBSCRIPTION_PLANS.length, 100)
  assert.equal(new Set(GAMING_SUBSCRIPTION_PLANS.map((plan) => plan.slug)).size, 100)
  assert.equal(new Set(GAMING_SUBSCRIPTION_PLANS.map((plan) => plan.name)).size, 100)
})

test("every plan carries complete entitlement and billing language", () => {
  for (const plan of GAMING_SUBSCRIPTION_PLANS) {
    assert.ok(plan.whatYouGet.length >= 6, plan.slug)
    assert.ok(plan.howItWorks.length >= 6, plan.slug)
    assert.ok(plan.eligible.length > 0, plan.slug)
    assert.ok(plan.excluded.length > 0, plan.slug)
    assert.match(plan.cancellationRule, /Cancellation/)
    assert.match(plan.renewal, /Fungies/)
    assert.ok(plan.monthlyPriceUsd > 0)
    assert.ok(plan.annualPriceUsd > plan.monthlyPriceUsd)
    assert.ok(plan.annualPriceUsd <= plan.monthlyPriceUsd * 12)
  }
})

test("credit and Pick & Keep rollover rules are explicit", () => {
  const credits = getGamingSubscriptionPlan("gaming-credits-50")
  const picks = getGamingSubscriptionPlan("pick-keep-fivem-5")
  assert.match(credits?.rolloverRule ?? "", /90 days/)
  assert.match(credits?.rolloverRule ?? "", /not cash/)
  assert.match(picks?.rolloverRule ?? "", /do not roll over/)
  assert.match(picks?.accessRule ?? "", /permanently added/)
})

test("plans cannot become sellable before real deliverables exist", () => {
  for (const plan of GAMING_SUBSCRIPTION_PLANS) {
    assert.equal(plan.previewOnly, true)
    assert.equal(plan.requiresFutureDeliverables, true)
  }
})

test("Fungies descriptions include all required storefront sections", () => {
  const html = planDescriptionHtml(GAMING_SUBSCRIPTION_PLANS[0])
  for (const heading of ["What You Get", "How It Works", "After Cancellation", "Eligible", "Not included", "License and use", "Renewal and limits"]) {
    assert.ok(html.includes(heading), heading)
  }
})
