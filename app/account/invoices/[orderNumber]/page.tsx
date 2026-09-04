import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "@/lib/storefront-icons"
import { getInvoiceByOrderNumber } from "@/lib/actions/account"
import { formatLicenseType, formatDate } from "@/lib/format"
import { PriceDisplay } from "@/components/price-display"
import { PrintInvoiceButton } from "@/components/account/print-invoice-button"
import { BrandLogo } from "@/components/brand-logo"

export const metadata = {
  title: "Invoice — DistroSource",
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const data = await getInvoiceByOrderNumber(orderNumber)
  if (!data) notFound()

  const { order, items } = data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/account/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to invoices
        </Link>
        <PrintInvoiceButton />
      </div>

      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <BrandLogo />
            <p className="mt-3 text-xs text-muted-foreground">DistroSource — Everything digital. One source.</p>
          </div>
          <div className="text-right">
            <h2 className="font-display text-lg font-bold">Invoice</h2>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Billed to</p>
            <p className="mt-1 font-medium">{order.billingName}</p>
            <p className="text-muted-foreground">{order.billingEmail}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment method</p>
            <p className="mt-1 font-medium capitalize">{order.paymentMethod}</p>
            <p className="capitalize text-muted-foreground">{order.status}</p>
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="py-2">Product</th>
              <th className="py-2">License</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 font-medium">{item.productName}</td>
                <td className="py-3 text-muted-foreground">{formatLicenseType(item.licenseType)}</td>
                <td className="py-3 text-right text-muted-foreground">{item.quantity}</td>
                <td className="py-3 text-right text-muted-foreground">
                  <PriceDisplay usdAmount={item.unitPriceUsd} />
                </td>
                <td className="py-3 text-right font-medium">
                  <PriceDisplay usdAmount={Number.parseFloat(item.unitPriceUsd) * item.quantity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <PriceDisplay usdAmount={order.subtotalUsd} />
          </div>
          {Number.parseFloat(order.discountUsd) > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>
                -<PriceDisplay usdAmount={order.discountUsd} />
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 font-display text-base font-bold">
            <span>Total paid</span>
            <PriceDisplay usdAmount={order.totalUsd} />
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          All products are delivered digitally. This invoice confirms payment for the licenses listed above.
        </p>
      </div>
    </div>
  )
}
