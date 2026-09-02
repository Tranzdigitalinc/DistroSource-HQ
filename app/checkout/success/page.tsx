import Link from "next/link"
import { notFound } from "next/navigation"
import { CircleCheck as CheckCircle2, ArrowRight, Package, Mail } from "lucide-react"
import { getOrderByNumber } from "@/lib/actions/account"
import { OrderItemsList } from "@/components/order/order-items-list"
import { CopyOrderNumber } from "@/components/order/copy-order-number"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"
import { ResendConfirmationButton } from "@/components/order/resend-confirmation-button"

export const metadata = {
  title: "Order confirmed — DistroSource",
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order: orderNumber } = await searchParams
  if (!orderNumber) notFound()

  const data = await getOrderByNumber(orderNumber)
  if (!data) notFound()

  const { order, items } = data

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
          <Reveal className="flex flex-col items-center gap-4 text-center">
            <div className="relative flex size-16 items-center justify-center rounded-full bg-success/15 shadow-[0_0_40px_-4px_var(--success)]">
              <CheckCircle2 className="size-9 text-success" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">Order confirmed!</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              Order <CopyOrderNumber orderNumber={order.orderNumber} /> — your products are ready to download in My
              Library.
            </p>
          </Reveal>

          {order.confirmationEmailSent ? (
            <Reveal delay={0.05} className="mt-6 flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3">
              <Mail className="size-5 shrink-0 text-success" />
              <p className="text-sm text-foreground/80">
                A copy of your receipt was also sent to <span className="font-semibold">{order.billingEmail}</span>
              </p>
            </Reveal>
          ) : (
            <Reveal delay={0.05} className="mt-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
              <Mail className="size-5 shrink-0 text-destructive" />
              <p className="text-sm text-foreground/80">
                We couldn&apos;t email a copy of your receipt to{" "}
                <span className="font-semibold">{order.billingEmail}</span>. Your purchase is still saved — view it
                anytime from your order history.
              </p>
              <ResendConfirmationButton orderNumber={order.orderNumber} />
            </Reveal>
          )}

          <Reveal delay={0.1} className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-6 py-3">
              <Package className="size-4 text-primary" />
              <h2 className="font-display text-sm font-semibold">Your items</h2>
            </div>
            <div className="p-6">
              <OrderItemsList items={items} />
              <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <PriceDisplay usdAmount={Number.parseFloat(order.subtotalUsd)} />
                </div>
                {Number.parseFloat(order.discountUsd) > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>
                      -<PriceDisplay usdAmount={Number.parseFloat(order.discountUsd)} />
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 font-display text-base font-bold">
                  <span>Total paid</span>
                  <PriceDisplay usdAmount={Number.parseFloat(order.totalUsd)} />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              className="bg-transparent"
              render={<Link href="/account/library" />}
              nativeButton={false}
            >
              Go to My Library
            </Button>
            <Button render={<Link href="/products" />} nativeButton={false}>
              Continue shopping
              <ArrowRight className="size-4" />
            </Button>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
