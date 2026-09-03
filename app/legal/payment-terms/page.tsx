import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Payment Terms — DistroSource",
}

export default function PaymentTermsPage() {
  return (
    <LegalPageLayout
      title="Payment Terms"
      updatedAt="January 15, 2025"
      currentHref="/legal/payment-terms"
      intro="This page explains how payments, pricing, and billing work on DistroSource."
      sections={[
        {
          heading: "1. Accepted payment methods",
          body: (
            <p>
              Checkout is temporarily under maintenance while we work on payment processing, and no payment methods
              are currently being accepted. This page will be updated with accepted methods once checkout is back
              online.
            </p>
          ),
        },
        {
          heading: "2. When you're charged",
          body: (
            <p>
              Your payment method is charged at the time you place an order, immediately before your files are
              added to your library. Orders are only fulfilled once payment has been successfully authorized.
            </p>
          ),
        },
        {
          heading: "3. Currency and pricing",
          body: (
            <p>
              All prices on DistroSource are displayed and charged in U.S. dollars. If your payment method uses a
              different currency, your bank or card network may apply its own conversion rate and, in some cases, a
              foreign transaction fee — these fees are set by your bank, not DistroSource.
            </p>
          ),
        },
        {
          heading: "4. Order confirmation and receipts",
          body: (
            <p>
              You&apos;ll receive an email receipt for every completed order, and a full billing history with
              downloadable invoices is available under Account → Invoices. Receipts include the product, license
              tier, price paid, and applicable taxes.
            </p>
          ),
        },
        {
          heading: "5. Failed and declined payments",
          body: (
            <p>
              If a payment is declined, your order will not be fulfilled and no files will be issued. Common causes
              include insufficient funds, bank fraud holds on digital goods purchases, or incorrect billing details.
              Contact your bank first, or try an alternate payment method.
            </p>
          ),
        },
        {
          heading: "6. Security",
          body: (
            <p>
              Checkout is processed through PCI-compliant, encrypted payment providers. DistroSource never stores
              your full card number or CVV on its own servers.
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
