import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Delivery Policy — DistroSource",
}

export default function DeliveryPolicyPage() {
  return (
    <LegalPageLayout
      title="Delivery Policy"
      updatedAt="January 15, 2025"
      currentHref="/legal/delivery-policy"
      intro="Every product on DistroSource is delivered digitally — there is no physical shipping. This page explains how and when you'll get access to your files."
      sections={[
        {
          heading: "1. Instant digital delivery",
          body: (
            <p>
              As soon as your payment is confirmed, the files for your purchased license are added to your account
              under <span className="font-medium text-foreground">My Library</span>, ready to download immediately.
              Most orders are ready within seconds; in rare cases involving manual fraud review, delivery may take
              up to 30 minutes.
            </p>
          ),
        },
        {
          heading: "2. Email confirmation",
          body: (
            <p>
              A copy of your order confirmation and a direct link to your library is also sent to the email address
              on your account. If you don&apos;t see it within a few minutes, check your spam or promotions folder, or
              view your purchase directly in your account — it never expires from your order history.
            </p>
          ),
        },
        {
          heading: "3. Signed download links",
          body: (
            <p>
              Download links are generated on demand and expire shortly after being issued for security. This does
              not affect your access — simply return to{" "}
              <span className="font-medium text-foreground">My Library</span> or{" "}
              <span className="font-medium text-foreground">Downloads</span> any time to generate a fresh link for
              any product you own.
            </p>
          ),
        },
        {
          heading: "4. Product updates",
          body: (
            <p>
              When a creator ships a new version of a product you own, you&apos;ll be notified under{" "}
              <span className="font-medium text-foreground">Product Updates</span> in your account, and the updated
              files become available for download at no extra cost.
            </p>
          ),
        },
        {
          heading: "5. Delayed or failed delivery",
          body: (
            <p>
              If an order shows as "Processing" for longer than 30 minutes, or a download link fails, open a ticket
              through <span className="font-medium text-foreground">Order Help</span> with your order number. We
              monitor fulfillment around the clock and will resolve delayed orders or issue a refund if the product
              cannot be delivered.
            </p>
          ),
        },
        {
          heading: "6. Accessing past orders",
          body: (
            <p>
              All previously purchased products remain permanently available in{" "}
              <span className="font-medium text-foreground">My Library</span>, so you can always re-download a
              product you own, along with its license certificate and invoice.
            </p>
          ),
        },
      ]}
    />
  )
}
