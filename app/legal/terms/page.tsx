import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Terms of Service — RedeemCove",
}

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      updatedAt="January 15, 2025"
      currentHref="/legal/terms"
      intro="These Terms of Service govern your access to and use of RedeemCove, the marketplace for digital gift cards, game top-ups, mobile recharges, and software licenses. By creating an account or placing an order, you agree to these terms."
      sections={[
        {
          heading: "1. Who we are",
          body: (
            <p>
              RedeemCove operates an online marketplace that lets customers purchase digital gift cards, game
              currency top-ups, mobile airtime, and software license keys. Products are fulfilled instantly to your
              RedeemCove account and, where applicable, sourced through authorized distribution partners including
              our mobile top-up and gift card fulfillment provider.
            </p>
          ),
        },
        {
          heading: "2. Eligibility and accounts",
          body: (
            <>
              <p>
                You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account
                and make purchases. You are responsible for maintaining the confidentiality of your account
                credentials and for all activity that occurs under your account.
              </p>
              <p>
                You agree to provide accurate billing and contact information. We may suspend or terminate accounts
                that provide false information, attempt fraudulent purchases, or violate these terms.
              </p>
            </>
          ),
        },
        {
          heading: "3. Orders and digital delivery",
          body: (
            <p>
              All products sold on RedeemCove are delivered digitally. Once payment is confirmed, your code, PIN, or
              license key is issued to your account&apos;s Orders and Gift Cards pages, and where selected, emailed to
              your registered address. There is no physical shipment. Delivery times are described in our{" "}
              <span className="font-medium text-foreground">Delivery Policy</span>.
            </p>
          ),
        },
        {
          heading: "4. Pricing and taxes",
          body: (
            <p>
              Prices are displayed in your selected currency and may vary by region due to distributor pricing,
              exchange rates, and local taxes. Any applicable taxes are calculated at checkout. We reserve the right
              to correct pricing errors before an order is fulfilled.
            </p>
          ),
        },
        {
          heading: "5. Regional restrictions",
          body: (
            <p>
              Certain gift cards and top-up products are restricted to specific countries or regions by the issuing
              brand. You are responsible for selecting the correct country/region for your product and for ensuring
              the product is valid for use in your location. See{" "}
              <span className="font-medium text-foreground">Regional Restrictions</span> for details.
            </p>
          ),
        },
        {
          heading: "6. Refunds and cancellations",
          body: (
            <p>
              Refund eligibility depends on whether a code has been revealed or redeemed. Full details, including
              timeframes and exceptions for game top-ups and mobile recharges, are set out in our{" "}
              <span className="font-medium text-foreground">Refund Policy</span>.
            </p>
          ),
        },
        {
          heading: "7. Acceptable use",
          body: (
            <p>
              You may not resell, redistribute, or use RedeemCove products for fraudulent purposes, and you may not
              attempt to abuse promotional codes, chargebacks, or referral programs. Violations may result in
              account suspension and forfeiture of unused balances, as described in our{" "}
              <span className="font-medium text-foreground">Acceptable Use Policy</span>.
            </p>
          ),
        },
        {
          heading: "8. Limitation of liability",
          body: (
            <p>
              RedeemCove is not liable for indirect, incidental, or consequential damages arising from your use of
              purchased codes, including issues caused by the issuing brand&apos;s own terms, expiration policies, or
              regional platform restrictions. Our total liability for any claim is limited to the amount you paid for
              the product giving rise to the claim.
            </p>
          ),
        },
        {
          heading: "9. Changes to these terms",
          body: (
            <p>
              We may update these terms from time to time. Material changes will be reflected by updating the "Last
              updated" date above. Continued use of RedeemCove after changes take effect constitutes acceptance of
              the revised terms.
            </p>
          ),
        },
        {
          heading: "10. Contact",
          body: (
            <p>
              Questions about these terms can be sent through our{" "}
              <span className="font-medium text-foreground">Contact Us</span> page or the Help Center in your
              account.
            </p>
          ),
        },
      ]}
    />
  )
}
