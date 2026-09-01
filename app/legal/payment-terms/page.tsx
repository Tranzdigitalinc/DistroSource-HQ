import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Payment Terms — RedeemCove",
}

export default function PaymentTermsPage() {
  return (
    <LegalPageLayout
      title="Payment Terms"
      updatedAt="January 15, 2025"
      currentHref="/legal/payment-terms"
      intro="This page explains how payments, pricing, and billing work on RedeemCove."
      sections={[
        {
          heading: "1. Accepted payment methods",
          body: (
            <p>
              We accept major debit and credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and
              Google Pay. Available methods may vary slightly by region and are shown at checkout.
            </p>
          ),
        },
        {
          heading: "2. When you're charged",
          body: (
            <p>
              Your payment method is charged at the time you place an order, immediately before your digital code
              or top-up is issued. Orders are only fulfilled once payment has been successfully authorized.
            </p>
          ),
        },
        {
          heading: "3. Currency and pricing",
          body: (
            <p>
              Prices are displayed in the currency associated with your selected country/region. If your payment
              method uses a different currency, your bank or card network may apply its own conversion rate and, in
              some cases, a foreign transaction fee — these fees are set by your bank, not RedeemCove.
            </p>
          ),
        },
        {
          heading: "4. Order confirmation and receipts",
          body: (
            <p>
              You&apos;ll receive an email receipt for every completed order, and a full billing history is available
              under Account Settings. Receipts include the product, price paid, and applicable taxes.
            </p>
          ),
        },
        {
          heading: "5. Failed and declined payments",
          body: (
            <p>
              If a payment is declined, your order will not be fulfilled and no code will be issued. Common causes
              include insufficient funds, bank fraud holds on digital goods purchases, or incorrect billing details.
              Contact your bank first, or try an alternate payment method.
            </p>
          ),
        },
        {
          heading: "6. Security",
          body: (
            <p>
              Checkout is processed through PCI-compliant, encrypted payment providers. RedeemCove never stores your
              full card number or CVV on its own servers.
            </p>
          ),
        },
        {
          heading: "7. Disputes",
          body: (
            <p>
              If you notice an unexpected charge, please contact support before filing a dispute with your bank —
              most billing issues can be resolved directly and more quickly through our{" "}
              <span className="font-medium text-foreground">Help Center</span>.
            </p>
          ),
        },
      ]}
    />
  )
}
