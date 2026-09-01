import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Privacy Policy — RedeemCove",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      updatedAt="January 15, 2025"
      currentHref="/legal/privacy"
      intro="This Privacy Policy explains what information RedeemCove collects, how we use it, and the choices you have. We collect only what is needed to process orders, secure your account, and improve the marketplace."
      sections={[
        {
          heading: "1. Information we collect",
          body: (
            <>
              <p>
                <span className="font-medium text-foreground">Account information</span> — name, email address,
                password (stored as a secure hash), and country/region.
              </p>
              <p>
                <span className="font-medium text-foreground">Order information</span> — products purchased, order
                totals, payment method type (we do not store full card numbers), and delivery status of digital
                codes.
              </p>
              <p>
                <span className="font-medium text-foreground">Usage data</span> — pages visited, device and browser
                type, and general location (country-level) used for fraud prevention and to tailor regional pricing.
              </p>
            </>
          ),
        },
        {
          heading: "2. How we use your information",
          body: (
            <p>
              We use your information to fulfill orders and deliver digital codes, authenticate your account,
              provide customer support, detect and prevent fraud, send transactional emails (order confirmations,
              receipts), and, if you opt in, send marketing emails about deals and new brands.
            </p>
          ),
        },
        {
          heading: "3. Payment processing",
          body: (
            <p>
              Payments are processed by PCI-compliant third-party payment processors. RedeemCove does not store your
              full card number, CVV, or bank credentials on our servers. Payment processors may share limited
              transaction data with us (such as approval status and card type) to complete and reconcile your order.
            </p>
          ),
        },
        {
          heading: "4. Sharing with fulfillment partners",
          body: (
            <p>
              To deliver certain gift cards, mobile top-ups, and game currency, we share the minimum information
              required (such as product SKU, denomination, and recipient mobile number for top-ups) with our
              authorized distribution and fulfillment partners. These partners are contractually required to use
              this information only to fulfill your order.
            </p>
          ),
        },
        {
          heading: "5. Cookies and tracking",
          body: (
            <p>
              We use cookies and similar technologies for authentication, shopping cart persistence, and analytics.
              You can manage cookie preferences through your browser settings. See our{" "}
              <span className="font-medium text-foreground">Cookie Policy</span> for details on the specific cookies
              we use.
            </p>
          ),
        },
        {
          heading: "6. Data retention",
          body: (
            <p>
              We retain account and order data for as long as your account is active and as needed to comply with
              tax, accounting, and fraud-prevention obligations. You may request deletion of your account by
              contacting support; some order records may be retained where required by law.
            </p>
          ),
        },
        {
          heading: "7. Your rights",
          body: (
            <p>
              Depending on your region, you may have the right to access, correct, export, or delete your personal
              data, and to object to or restrict certain processing. You can manage most of this directly from your
              Account Settings, or by contacting us through the Help Center.
            </p>
          ),
        },
        {
          heading: "8. Security",
          body: (
            <p>
              We use encryption in transit (HTTPS), password hashing, and access controls to protect your
              information. No online service is 100% secure, but we continuously monitor for vulnerabilities and
              respond promptly to reported issues.
            </p>
          ),
        },
        {
          heading: "9. Children's privacy",
          body: (
            <p>
              RedeemCove is not directed at children under 16, and we do not knowingly collect personal information
              from them. If you believe a child has provided us with personal data, please contact us so we can
              remove it.
            </p>
          ),
        },
        {
          heading: "10. Contact",
          body: (
            <p>
              For privacy questions or data requests, reach out via our{" "}
              <span className="font-medium text-foreground">Contact Us</span> page.
            </p>
          ),
        },
      ]}
    />
  )
}
