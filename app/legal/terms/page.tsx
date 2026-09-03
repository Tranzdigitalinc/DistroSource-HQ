import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata = {
  title: "Terms of Service — DistroSource",
}

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      updatedAt="January 15, 2025"
      currentHref="/legal/terms"
      intro="These Terms of Service govern your access to and use of DistroSource, a digital marketplace for website templates, business systems, creative assets, developer resources, and other downloadable digital products. By creating an account or placing an order, you agree to these terms."
      sections={[
        {
          heading: "1. Who we are",
          body: (
            <p>
              DistroSource operates an online marketplace that lets customers purchase and download digital
              products — including templates, design assets, fonts, presentations, Notion systems, spreadsheets,
              3D/STL models, and software boilerplates — created and sold directly by DistroSource. Products are
              fulfilled instantly through your DistroSource account.
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
              All products sold on DistroSource are delivered digitally. Once payment is confirmed, the files you
              purchased are added to <span className="font-medium text-foreground">My Library</span> in your account
              for immediate download, and a confirmation email is sent to your registered address. There is no
              physical shipment. Delivery details are described in our{" "}
              <span className="font-medium text-foreground">Delivery Policy</span>.
            </p>
          ),
        },
        {
          heading: "4. Pricing and taxes",
          body: (
            <p>
              All prices are displayed and charged in U.S. dollars. Any applicable sales tax or VAT is calculated at
              checkout based on your billing information. We reserve the right to correct pricing errors before an
              order is fulfilled.
            </p>
          ),
        },
        {
          heading: "5. Licensing",
          body: (
            <p>
              Every product is sold under a specific license tier (Personal, Commercial, Extended Commercial, or
              Agency) selected at checkout. Your license grants you the right to use the files for the purposes
              described on the product page and in your account&apos;s{" "}
              <span className="font-medium text-foreground">Licenses</span> tab. Purchasing a product does not
              transfer copyright or ownership of the underlying design, code, or content — DistroSource retains all
              intellectual property rights not expressly granted by your license, except where a specific listing
              identifies a different rights holder.
            </p>
          ),
        },
        {
          heading: "6. Refunds and cancellations",
          body: (
            <p>
              Refund eligibility depends on whether a product&apos;s files have been downloaded and on the license
              tier purchased. Full details, including timeframes and exceptions, are set out in our{" "}
              <span className="font-medium text-foreground">Refund Policy</span>.
            </p>
          ),
        },
        {
          heading: "7. Acceptable use",
          body: (
            <p>
              You may not resell, redistribute, sublicense, or repackage DistroSource products as your own
              downloadable product, and you may not use purchased files beyond the scope of your license tier or
              attempt to abuse promotional codes, chargebacks, or referral programs. Violations may result in
              account suspension and revocation of access, as described in our{" "}
              <span className="font-medium text-foreground">Acceptable Use Policy</span>.
            </p>
          ),
        },
        {
          heading: "8. Limitation of liability",
          body: (
            <p>
              DistroSource is not liable for indirect, incidental, or consequential damages arising from your use
              of purchased files, including compatibility issues with your own software, hosting, or design tools.
              Our total liability for any claim is limited to the amount you paid for the product giving rise to the
              claim.
            </p>
          ),
        },
        {
          heading: "9. Changes to these terms",
          body: (
            <p>
              We may update these terms from time to time. Material changes will be reflected by updating the "Last
              updated" date above. Continued use of DistroSource after changes take effect constitutes acceptance of
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
