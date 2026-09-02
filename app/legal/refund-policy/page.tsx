import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Refund Policy — DistroSource",
}

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      updatedAt="January 15, 2025"
      currentHref="/legal/refund-policy"
      intro="Because DistroSource sells digital files that can be downloaded instantly, refund eligibility depends on whether the files have been downloaded and which license tier was purchased. This policy explains exactly when a refund is available."
      sections={[
        {
          heading: "1. Undownloaded purchases",
          body: (
            <p>
              Products that have <span className="font-medium text-foreground">not</span> been downloaded from your
              account are eligible for a full refund within 14 days of purchase. Once you download a file from{" "}
              <span className="font-medium text-foreground">My Library</span>, the order becomes final and
              non-refundable, because the digital files cannot be "returned."
            </p>
          ),
        },
        {
          heading: "2. Defective or incorrect files",
          body: (
            <p>
              If a file is corrupted, incomplete, or does not match the product description on its listing, contact
              support within 30 days with your order number. We will verify the issue and issue a corrected file or
              a full refund to your original payment method.
            </p>
          ),
        },
        {
          heading: "3. Wrong license tier",
          body: (
            <p>
              If you purchased the wrong license tier for a product (for example, Personal instead of Commercial)
              and have not yet downloaded the files, contact support within 14 days to switch tiers or request a
              refund. Once files tied to a given license have been downloaded, that license cannot be refunded, but
              you may upgrade to a higher tier by paying the price difference.
            </p>
          ),
        },
        {
          heading: "4. Team and agency licenses",
          body: (
            <p>
              Team License purchases requested through our{" "}
              <span className="font-medium text-foreground">Team Licensing</span> program follow the refund terms
              agreed in the quote at time of purchase, since these orders are custom-priced for multi-seat use.
            </p>
          ),
        },
        {
          heading: "5. How refunds are processed",
          body: (
            <p>
              Approved refunds are issued to your original payment method within 5–10 business days, depending on
              your bank or payment provider, and revoke access to the associated files in your library. You will
              receive an email confirmation once the refund has been submitted.
            </p>
          ),
        },
        {
          heading: "6. Chargebacks",
          body: (
            <p>
              Please contact our support team before filing a chargeback with your bank — most issues can be
              resolved faster directly with us. Accounts that file chargebacks for downloaded files without first
              contacting support may be suspended pending investigation.
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
