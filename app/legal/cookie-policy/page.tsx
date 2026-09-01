import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Cookie Policy — RedeemCove",
}

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      updatedAt="January 15, 2025"
      currentHref="/legal/cookie-policy"
      intro="RedeemCove uses cookies and similar technologies to keep you signed in, remember your cart, and understand how the marketplace is used. This page explains the categories of cookies we use."
      sections={[
        {
          heading: "1. Essential cookies",
          body: (
            <p>
              These cookies are required for the site to function — keeping you signed in, remembering the contents
              of your cart, and securing checkout. They cannot be disabled without breaking core functionality such
              as sign-in or purchasing.
            </p>
          ),
        },
        {
          heading: "2. Preference cookies",
          body: (
            <p>
              These remember choices you&apos;ve made, such as your selected country/region, currency, and display
              theme, so you don&apos;t have to reset them on every visit.
            </p>
          ),
        },
        {
          heading: "3. Analytics cookies",
          body: (
            <p>
              We use analytics cookies to understand which pages, categories, and products are most useful to
              customers, so we can improve navigation and catalog selection. Analytics data is aggregated and is not
              used to identify you individually.
            </p>
          ),
        },
        {
          heading: "4. Fraud-prevention cookies",
          body: (
            <p>
              To protect against fraudulent orders and account takeover, we use cookies that help detect unusual
              sign-in or checkout patterns. These are considered essential to keeping the marketplace safe for all
              customers.
            </p>
          ),
        },
        {
          heading: "5. Managing cookies",
          body: (
            <p>
              Most browsers let you block or delete cookies through their settings. Blocking essential cookies may
              prevent you from signing in or completing checkout. We do not currently serve third-party advertising
              cookies.
            </p>
          ),
        },
      ]}
    />
  )
}
