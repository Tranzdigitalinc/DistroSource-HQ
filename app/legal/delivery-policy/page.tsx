import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Delivery Policy — RedeemCove",
}

export default function DeliveryPolicyPage() {
  return (
    <LegalPageLayout
      title="Delivery Policy"
      updatedAt="January 15, 2025"
      currentHref="/legal/delivery-policy"
      intro="Every product on RedeemCove is delivered digitally — there is no physical shipping. This page explains how and when you'll receive your codes."
      sections={[
        {
          heading: "1. Instant digital delivery",
          body: (
            <p>
              As soon as your payment is confirmed, your gift card code, license key, or top-up confirmation is
              generated and made available in your account under{" "}
              <span className="font-medium text-foreground">Orders</span> and{" "}
              <span className="font-medium text-foreground">My Gift Cards</span>. Most orders are ready within
              seconds; in rare cases involving manual fraud review, delivery may take up to 30 minutes.
            </p>
          ),
        },
        {
          heading: "2. Email delivery",
          body: (
            <p>
              A copy of your order confirmation and code is also sent to the email address on your account. If you
              don&apos;t see it within a few minutes, check your spam or promotions folder, or view the code directly
              in your account — it never expires from your order history.
            </p>
          ),
        },
        {
          heading: "3. Game top-ups and mobile recharges",
          body: (
            <p>
              For game currency top-ups and mobile airtime/data recharges, delivery is fulfilled directly to the
              player ID, game account, or phone number you provide at checkout, typically within a few minutes.
              Delivery times can vary slightly depending on the mobile operator or game publisher&apos;s own systems.
            </p>
          ),
        },
        {
          heading: "4. Delayed or failed delivery",
          body: (
            <p>
              If an order shows as "Processing" for longer than 30 minutes, or you receive a delivery failure
              notice, open a ticket through <span className="font-medium text-foreground">Order Help</span> with
              your order number. We monitor fulfillment queues around the clock and will resolve delayed orders or
              issue a refund if the product cannot be delivered.
            </p>
          ),
        },
        {
          heading: "5. Accessing past orders",
          body: (
            <p>
              All previously delivered codes remain permanently available in your account&apos;s order history, so you
              can always retrieve a code you purchased, even after redeeming it, for your records.
            </p>
          ),
        },
      ]}
    />
  )
}
