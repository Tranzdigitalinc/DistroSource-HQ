import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Acceptable Use Policy — RedeemCove",
}

export default function AcceptableUsePage() {
  return (
    <LegalPageLayout
      title="Acceptable Use Policy"
      updatedAt="January 15, 2025"
      currentHref="/legal/acceptable-use"
      intro="To keep RedeemCove safe and fair for every customer, we expect all users to follow these guidelines when using the marketplace."
      sections={[
        {
          heading: "1. Prohibited activity",
          body: (
            <p>
              You may not use stolen or fraudulent payment methods, attempt to circumvent regional pricing or
              restrictions, exploit promotional codes or referral programs outside their intended terms, or
              automate account creation, purchasing, or scraping of catalog data without written permission.
            </p>
          ),
        },
        {
          heading: "2. Account security",
          body: (
            <p>
              You are responsible for keeping your login credentials confidential. Sharing your account to allow
              others to make purchases under your identity, or attempting to access another user&apos;s account, is
              prohibited.
            </p>
          ),
        },
        {
          heading: "3. Fair use of support and refunds",
          body: (
            <p>
              Support and refund requests should be made in good faith. Repeated unfounded refund claims, abuse of
              the chargeback process, or providing false information to obtain a replacement code may result in
              account suspension.
            </p>
          ),
        },
        {
          heading: "4. Resale and bulk purchasing",
          body: (
            <p>
              Standard consumer checkout is intended for personal use and gifting. Reselling codes at scale outside
              of our official Bulk Gifting for Business program, or using automated tools to purchase inventory in
              bulk, is not permitted.
            </p>
          ),
        },
        {
          heading: "5. Reporting abuse",
          body: (
            <p>
              If you believe another user or a third party is misusing RedeemCove, please report it through our{" "}
              <span className="font-medium text-foreground">Contact Us</span> page so we can investigate.
            </p>
          ),
        },
        {
          heading: "6. Enforcement",
          body: (
            <p>
              Violations of this policy may result in warnings, order cancellation, suspension of your account, or
              forfeiture of unredeemed balances, depending on severity. We aim to apply enforcement fairly and will
              always notify you of the reason for any account action.
            </p>
          ),
        },
      ]}
    />
  )
}
