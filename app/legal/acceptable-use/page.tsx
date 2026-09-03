import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Acceptable Use Policy — DistroSource",
}

export default function AcceptableUsePage() {
  return (
    <LegalPageLayout
      title="Acceptable Use Policy"
      updatedAt="January 15, 2025"
      currentHref="/legal/acceptable-use"
      intro="To keep DistroSource safe, legal, and fair for every customer, we expect all users to follow these guidelines when using the marketplace."
      sections={[
        {
          heading: "1. Prohibited activity",
          body: (
            <p>
              You may not use stolen or fraudulent payment methods, exploit promotional codes or referral programs
              outside their intended terms, or automate account creation, purchasing, or scraping of catalog data
              without written permission. DistroSource is a marketplace for licensed digital products only — we do
              not sell and will never list gift cards, stored-value instruments, cryptocurrency, gambling products,
              pirated or cracked software, account sales, malware, adult content, or counterfeit or unauthorized
              intellectual property.
            </p>
          ),
        },
        {
          heading: "2. License compliance",
          body: (
            <p>
              You must use every product within the scope of the license tier you purchased. Reselling,
              redistributing, sublicensing, or repackaging DistroSource products — or files derived from them — as
              your own downloadable product is strictly prohibited, regardless of license tier, unless the product
              listing explicitly permits it.
            </p>
          ),
        },
        {
          heading: "3. Account security",
          body: (
            <p>
              You are responsible for keeping your login credentials confidential. Sharing your account to allow
              others to make purchases or download files under your identity, or attempting to access another
              user&apos;s account, is prohibited.
            </p>
          ),
        },
        {
          heading: "4. Fair use of support and refunds",
          body: (
            <p>
              Support and refund requests should be made in good faith. Repeated unfounded refund claims, abuse of
              the chargeback process, or providing false information to obtain a replacement file may result in
              account suspension.
            </p>
          ),
        },
        {
          heading: "5. Multi-seat and team use",
          body: (
            <p>
              Standard consumer checkout licenses are intended for a single user or business as described on the
              product page. Using a single Personal or Commercial license across an entire team or organization is
              not permitted — use our{" "}
              <span className="font-medium text-foreground">Team Licensing</span> program for multi-seat access.
            </p>
          ),
        },
        {
          heading: "6. Reporting abuse",
          body: (
            <p>
              If you believe another user or a third party is misusing DistroSource or infringing on licensed
              content, please report it through our{" "}
              <span className="font-medium text-foreground">Contact Us</span> page so we can investigate.
            </p>
          ),
        },
        {
          heading: "7. Enforcement",
          body: (
            <p>
              Violations of this policy may result in warnings, order cancellation, suspension of your account, or
              revocation of download access, depending on severity. We aim to apply enforcement fairly and will
              always notify you of the reason for any account action.
            </p>
          ),
        },
      ]}
    />
  )
}
