import Link from "next/link"
import { notFound } from "next/navigation"
import { getOrderByCheckoutId, getOrderByNumber } from "@/lib/actions/account"
import { OrderItemsList } from "@/components/order/order-items-list"
import { OrderStatusBadge } from "@/components/order/order-status-badge"
import { OrderStatusPoller } from "@/components/order/order-status-poller"
import { CopyOrderNumber } from "@/components/order/copy-order-number"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"
import { CheckoutHeader } from "@/components/checkout/checkout-header"
import { Reveal } from "@/components/motion/reveal"
import { ResendConfirmationButton } from "@/components/order/resend-confirmation-button"
import { ArrowRight, CheckCircle, Clock, Library, Mail, Undo, ICON_SIZE } from "@/lib/storefront-icons"

export const metadata = {
  title: "Order confirmation — DistroSource",
}

function MinimalFooter() {
  return (
    <footer className="border-t border-border py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 text-xs text-muted-foreground sm:px-6">
        <span>© {new Date().getFullYear()} DistroSource</span>
        <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
        <Link href="/legal/refund-policy" className="hover:text-foreground">Refund Policy</Link>
        <Link href="/help" className="hover:text-foreground">Help</Link>
      </div>
    </footer>
  )
}

/** Shared shell for the non-success outcomes, so every state matches. */
function StatusShell({
  tone,
  icon,
  title,
  children,
  actions,
  poll = false,
}: {
  tone: "neutral" | "pending"
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  actions: React.ReactNode
  poll?: boolean
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {poll && <OrderStatusPoller />}
      <CheckoutHeader currentStep="complete" />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Reveal className="flex w-full max-w-md flex-col items-center gap-5 text-center">
          <div
            className={
              tone === "pending"
                ? "flex size-14 items-center justify-center rounded-full bg-secondary text-foreground"
                : "flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            }
            aria-live="polite"
          >
            {icon}
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
          <div className="flex flex-wrap justify-center gap-3">{actions}</div>
        </Reveal>
      </main>
      <MinimalFooter />
    </div>
  )
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; checkout_id?: string; customer_session_token?: string }>
}) {
  const { order: orderNumber, checkout_id: checkoutId } = await searchParams
  const data = checkoutId ? await getOrderByCheckoutId(checkoutId) : orderNumber ? await getOrderByNumber(orderNumber) : null
  if (!data) notFound()

  const { order, items } = data
  const isPending = order.status === "pending_payment"
  const isRefunded = order.status === "refunded" || order.status === "partially_refunded"
  const isFailed = order.status === "failed" || order.status === "canceled" || order.status === "expired"

  if (isRefunded) {
    return (
      <StatusShell
        tone="neutral"
        icon={<Undo size={ICON_SIZE.feature} aria-hidden="true" />}
        title={order.status === "refunded" ? "This order was refunded" : "This order was partially refunded"}
        actions={
          <>
            <Button render={<Link href={`/account/orders/${order.orderNumber}`} />} nativeButton={false} className="font-semibold">
              View order
            </Button>
            <Button variant="outline" render={<Link href="/contact" />} nativeButton={false} className="bg-transparent font-semibold">
              Contact support
            </Button>
          </>
        }
      >
        Order <CopyOrderNumber orderNumber={order.orderNumber} /> was refunded
        {order.status === "refunded" ? " and download access for its products has been revoked" : "; access to the remaining items is unchanged"}.
        Refunds are returned to the original payment method by Polar.
      </StatusShell>
    )
  }

  if (isFailed) {
    return (
      <StatusShell
        tone="neutral"
        icon={<Clock size={ICON_SIZE.feature} aria-hidden="true" />}
        title="This checkout didn't complete"
        actions={
          <>
            <Button render={<Link href="/cart" />} nativeButton={false} className="font-semibold">
              Return to cart
            </Button>
            <Button variant="outline" render={<Link href="/contact" />} nativeButton={false} className="bg-transparent font-semibold">
              Get help
            </Button>
          </>
        }
      >
        {/* Never asserts that a payment failed — only Polar can confirm that. */}
        Order <CopyOrderNumber orderNumber={order.orderNumber} /> was not completed, so nothing was charged and no products were unlocked. Your cart is still available.
      </StatusShell>
    )
  }

  if (isPending) {
    return (
      <StatusShell
        tone="pending"
        poll
        icon={<Clock size={ICON_SIZE.feature} className="animate-pulse motion-reduce:animate-none" aria-hidden="true" />}
        title="Confirming your payment…"
        actions={
          <Button variant="outline" className="bg-transparent font-semibold" render={<Link href="/account/orders" />} nativeButton={false}>
            View orders
          </Button>
        }
      >
        {/* Downloads are never granted from this redirect — only the verified order.paid webhook unlocks entitlements. */}
        Polar is confirming your payment. This page updates on its own, and your products unlock the moment it clears — usually within a few seconds.
        Your order reference is <CopyOrderNumber orderNumber={order.orderNumber} />.
      </StatusShell>
    )
  }

  const paid = order.polarPaidAmount ? Number.parseFloat(order.polarPaidAmount) : Number.parseFloat(order.totalUsd)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CheckoutHeader currentStep="complete" />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <Reveal className="flex flex-col items-center gap-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle size={28} aria-hidden="true" />
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Your order is ready.</h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Everything you bought is unlocked in My Library and ready to download.
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            {[
              { label: "Order", value: <CopyOrderNumber orderNumber={order.orderNumber} /> },
              { label: "Email", value: <span className="truncate">{order.billingEmail}</span> },
              { label: "Total", value: <PriceDisplay usdAmount={paid} /> },
              { label: "Status", value: <OrderStatusBadge status={order.status} /> },
            ].map((fact) => (
              <div key={fact.label} className="min-w-0 bg-card px-4 py-3.5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{fact.label}</p>
                <div className="mt-1 flex min-w-0 text-sm font-semibold text-foreground">{fact.value}</div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.1} className="mt-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-base font-bold text-foreground">Your products</h2>
              <span className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"}</span>
            </div>
            <div className="px-5 py-4">
              <OrderItemsList items={items} />
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-4">
            {order.confirmationEmailSent ? (
              <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Mail size={ICON_SIZE.sm} className="text-success" aria-hidden="true" />
                A receipt has been sent to {order.billingEmail}.
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-3">
                <Mail size={ICON_SIZE.sm} className="text-muted-foreground" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">We couldn&apos;t email your receipt to {order.billingEmail}. Your purchase is saved either way.</p>
                <ResendConfirmationButton orderNumber={order.orderNumber} />
              </div>
            )}
          </Reveal>

          <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="xl" render={<Link href="/account/library" />} nativeButton={false} className="px-6 font-semibold">
              <Library size={ICON_SIZE.base} aria-hidden="true" />
              Go to My Library
            </Button>
            <Button size="xl" variant="outline" className="bg-transparent px-6 font-semibold" render={<Link href="/products" />} nativeButton={false}>
              Continue shopping
              <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
            </Button>
          </Reveal>
        </div>
      </main>

      <MinimalFooter />
    </div>
  )
}
