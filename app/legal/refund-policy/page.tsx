import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Refund Policy — RedeemCove",
}

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      updatedAt="January 15, 2025"
      currentHref="/legal/refund-policy"
      intro="Because RedeemCove sells digital codes that can be revealed instantly, refund eligibility depends on whether the code has been viewed, sent, or redeemed. This policy explains exactly when a refund is available."
      sections={[
        {
          heading: "1. Unused gift cards and license keys",
          body: (
            <p>
              Digital gift cards and software license keys that have <span className="font-medium text-foreground">not</span> been
              revealed, copied, or redeemed on the issuing brand's platform are eligible for a full refund within 14
              days of purchase. Once you click "Reveal code" or the code has been redeemed, the order becomes
              final and non-refundable, because the code can no longer be resold or reissued.
            </p>
          ),
        },
        {
          heading: "2. Game top-ups and mobile recharges",
          body: (
            <p>
              Game currency top-ups and mobile airtime/data recharges are delivered directly to the account or
              phone number you provide and are non-refundable once submitted for delivery, since these products are
              fulfilled immediately with our distribution partners and cannot be reversed. Please double-check the
              player ID, account, or phone number before confirming your order.
            </p>
          ),
        },
        {
          heading: "3. Defective or incorrect codes",
          body: (
            <p>
              If a code fails to redeem, was already used, or does not match the product you purchased, contact
              support within 30 days with your order number. We will verify the issue with the issuing brand or
              fulfillment partner and issue a replacement code or a full refund to your original payment method.
            </p>
          ),
        },
        {
          heading: "4. Wrong region or platform purchases",
          body: (
            <p>
              Gift cards are region-locked by the issuing brand. If you purchase a code for the wrong country or
              platform and have not yet revealed it, contact support within 14 days for a refund. Revealed codes for
              the wrong region cannot be refunded, since region eligibility cannot be verified after reveal.
            </p>
          ),
        },
        {
          heading: "5. How refunds are processed",
          body: (
            <p>
              Approved refunds are issued to your original payment method within 5–10 business days, depending on
              your bank or payment provider. You will receive an email confirmation once the refund has been
              submitted.
            </p>
          ),
        },
        {
          heading: "6. Chargebacks",
          body: (
            <p>
              Please contact our support team before filing a chargeback with your bank — most issues can be
              resolved faster directly with us. Accounts that file chargebacks for revealed or redeemed codes without
              first contacting support may be suspended pending investigation.
            </p>
          ),
        },
        {
          heading: "7. How to request a refund",
          body: (
            <p>
              Open a support ticket from your account&apos;s Help Center with your order number and the reason for the
              request, or use the <span className="font-medium text-foreground">Order Help</span> page to start a
              request directly from your order history.
            </p>
          ),
        },
      ]}
    />
  )
}
