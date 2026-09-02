import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Gift Card Terms — RedeemCove",
}

export default function GiftCardTermsPage() {
  return (
    <LegalPageLayout
      title="Gift Card Terms"
      updatedAt="January 15, 2025"
      currentHref="/legal/gift-card-terms"
      intro="Gift cards and top-up products sold on RedeemCove are also governed by the terms and conditions of the issuing brand. This page summarizes the general terms that apply across the marketplace."
      sections={[
        {
          heading: "1. Issuing brand terms apply",
          body: (
            <p>
              Each gift card is issued and honored by the brand shown on the product page (for example, a
              streaming service, retailer, or game publisher), not by RedeemCove directly. Redemption, balance
              checks, and usage restrictions are governed by that brand&apos;s own terms of use, which are included or
              linked on every product page.
            </p>
          ),
        },
        {
          heading: "2. Region and platform restrictions",
          body: (
            <p>
              Gift cards are only valid in the country/region and, where applicable, the platform (such as a
              specific game storefront) listed on the product page. Attempting to redeem a code outside its
              intended region will typically fail. Always confirm your account&apos;s region matches the product before
              purchasing.
            </p>
          ),
        },
        {
          heading: "3. No expiration guarantee from RedeemCove",
          body: (
            <p>
              Most gift cards sold on RedeemCove do not expire, but expiration policies are set by the issuing
              brand, not RedeemCove. Where an issuing brand does apply an expiration date, it is disclosed on the
              product page prior to purchase.
            </p>
          ),
        },
        {
          heading: "4. One-time use",
          body: (
            <p>
              Each code is intended for single use. Once redeemed on the issuing brand&apos;s platform, the balance is
              applied to that account and cannot be transferred, reissued, or redeemed again.
            </p>
          ),
        },
        {
          heading: "5. Resale restrictions",
          body: (
            <p>
              Codes purchased on RedeemCove are intended for personal use or as a gift to another individual. Bulk
              resale of codes purchased through standard checkout is prohibited; businesses interested in reselling
              or corporate gifting should use our{" "}
              <span className="font-medium text-foreground">Bulk Gifting for Business</span> program instead.
            </p>
          ),
        },
        {
          heading: "6. Lost or shared codes",
          body: (
            <p>
              Treat your gift card code like cash. RedeemCove cannot recover value from a code that has been shared,
              screenshotted, or redeemed by someone other than the intended recipient. If a code appears to have
              been compromised before you had a chance to redeem it, contact support immediately with your order
              number.
            </p>
          ),
        },
      ]}
    />
  )
}
